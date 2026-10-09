#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Gera o áudio gravado das fichas com a voz do Gemini (Google), no mesmo formato de audio/<id>.mp3 + audio/<id>.json.

Foi feito para rodar no GitHub (aba Actions → "Gerar áudio (Gemini)"), com a chave guardada como Secret GEMINI_API_KEY.
Usa só a biblioteca padrão do Python, mais numpy (volume) e ffmpeg (MP3). Passo a passo: tools/audio/LEIA-ME.md.

  python3 tools/audio/gemini.py --modo testar-chave                         # 1 frase curta: confere chave, modelo e formato da resposta
  python3 tools/audio/gemini.py --modo amostras --voz Kore,Charon           # um trecho lido por várias vozes  -> audio-teste/
  python3 tools/audio/gemini.py --modo fichas --destino teste --ids backend # fichas inteiras de teste          -> audio-teste/fichas/
  python3 tools/audio/gemini.py --modo fichas --ids all                     # todas (só o que falta ou mudou)   -> audio/
  python3 tools/audio/gemini.py --modo guardar                              # atualiza js/18-audiomap.js e envia ao GitHub
  python3 tools/audio/gemini.py --modo voltar-para-piper                    # devolve o áudio antigo (Piper)

Só o que mudou é regravado: cada MP3 tem um .json com a "impressão digital" (texto + modelo + voz + estilo).
"""
import argparse, base64, datetime, glob, hashlib, html, io, json, os, re, subprocess, sys, time, urllib.error, urllib.request, wave

HERE = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.normpath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, HERE)
if hasattr(sys.stdout, 'reconfigure'):
    try: sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception: pass

BASE = os.environ.get('GEMINI_BASE', 'https://generativelanguage.googleapis.com/v1beta').rstrip('/')
MODELO_PADRAO = 'gemini-3.8-flash-tts'
VOZ_PADRAO = 'Sulafat'
ESTILO_PADRAO = ('Narrate in natural Brazilian Portuguese (pt-BR), the way a friendly, patient teacher explains technology to a complete beginner: '
                 'warm, clear and expressive intonation (never monotone), calm pace, short natural pauses between ideas, a lighter tone for analogies. '
                 'Say English tech terms the way Brazilian developers do.')
NORM_G = 1                      # mude se mudar a forma de preparar o texto (isso regrava tudo)
PALAVRAS_POR_MIN = 150.0        # só para estimar tempo e custo antes de gerar
TOKENS_POR_SEG = 25             # o Gemini cobra áudio por token (25 por segundo)
PRECO_SAIDA = {'gemini-3.8-flash-tts': 9.0, 'gemini-3.8-flash-lite-tts': 6.0}   # US$ por 1 milhão de tokens de áudio (tabela de out/2026)
VOZES_AMOSTRA = ['Kore', 'Charon', 'Sulafat', 'Achird', 'Erinome', 'Sadaltager']
VOZES = ['Zephyr', 'Puck', 'Charon', 'Kore', 'Fenrir', 'Leda', 'Orus', 'Aoede', 'Callirrhoe', 'Autonoe', 'Enceladus', 'Iapetus', 'Umbriel', 'Algieba', 'Despina',
         'Erinome', 'Algenib', 'Rasalgethi', 'Laomedeia', 'Achernar', 'Alnilam', 'Schedar', 'Gacrux', 'Pulcherrima', 'Achird', 'Zubenelgenubi', 'Vindemiatrix',
         'Sadachbia', 'Sadaltager', 'Sulafat']
ESPERAS = [int(x) for x in os.environ.get('GEMINI_ESPERAS', '20,60,120,240').split(',') if x.strip() != '']
WPM_MIN, WPM_MAX = 95, 260      # fora disso o áudio é suspeito (cortado, muito lento, repetindo)
MARCO = 'audio-piper-original'  # marca (tag) do GitHub com o áudio antigo, para dar para voltar
TESTE = {'id': '_teste', 'segs': [{'t': 'Esta é a voz natural do guia. Se ela soar bem para você, pode deixar assim.', 'p': 0}]}
ESTADO = {'api': None, 'forma': False}

def log(*a): print(*a, flush=True)

def anota(nivel, msg):
    """aparece como faixa amarela/vermelha no resumo da execução no GitHub"""
    if os.environ.get('GITHUB_ACTIONS'): print('::%s::%s' % (nivel, msg.replace('\n', ' ')), flush=True)

def resumo_md(linhas):
    p = os.environ.get('GITHUB_STEP_SUMMARY')
    if p:
        with open(p, 'a', encoding='utf-8') as f: f.write('\n'.join(linhas) + '\n')

# ---------------------------------------------------------------- texto que vai para a voz
def carregar_pron():
    """tools/audio/pronuncias-gemini.json: palavra em inglês → como ler em português. Só vale para o Gemini."""
    try: d = json.load(open(os.path.join(HERE, 'pronuncias-gemini.json'), encoding='utf-8'))
    except FileNotFoundError: return []
    regras = []
    for k in sorted((k for k in d if not k.startswith('_')), key=len, reverse=True):
        partes = [re.escape(x) for x in re.split(r'[-\s]+', k.strip()) if x]
        if partes: regras.append((re.compile(r'\b' + r'[-\s]?'.join(partes) + r'(s)?\b', re.I), str(d[k])))
    return regras

def aplicar_pron(t, regras):
    for rx, rep in regras:
        def f(m, rep=rep):
            r = rep[:1].upper() + rep[1:] if m.group(0)[:1].isupper() else rep
            return r + (m.group(1).lower() if m.group(1) else '')
        t = rx.sub(f, t)
    return t

def texto_final(segs):
    """O texto exato enviado à voz: as mesmas frases das vozes antigas (já com as pronúncias do guia), limpas, mais as pronúncias do Gemini.
    Pausas grandes (800 ms ou mais) viram parágrafo; a voz decide o ritmo."""
    import gerar
    regras = carregar_pron(); partes = []
    for s in segs:
        t = gerar.norm_neural(s['t'])
        if t: partes.append((aplicar_pron(t, regras), s.get('p', 400)))
    return ''.join(t + ('' if i == len(partes) - 1 else ('\n\n' if p >= 800 else ' ')) for i, (t, p) in enumerate(partes))

def hash_ficha(modelo, voz, estilo, segs):
    base = '\x1f'.join(['gemini', modelo, voz, estilo, str(NORM_G), texto_final(segs)])
    return hashlib.sha1(base.encode('utf-8')).hexdigest()[:16]

def palavras_de(e): return sum(len(s['t'].split()) for s in e['segs'])

def custo_usd(modelo, seg):
    p = PRECO_SAIDA.get(modelo)
    if p is None: return None
    if datetime.date.today() >= datetime.date(2027, 1, 1): p *= 2          # preço anunciado: dobra em 1/1/2027 (confira em ai.google.dev/gemini-api/docs/pricing)
    return seg * TOKENS_POR_SEG * p / 1e6

def norm_voz(v):
    v = v.strip()
    if v.lower().startswith(('voice_', 'voicekey_')): return v
    for n in VOZES:
        if n.lower() == v.lower(): return n
    anota('warning', 'A voz "%s" não está na lista conhecida do Gemini; vou tentar mesmo assim.' % v)
    return v

# ---------------------------------------------------------------- chamada da API
class ErroApi(Exception):
    def __init__(self, status, msg, transitorio=False, quota_dia=False, chave=False, espera=0):
        Exception.__init__(self, ('HTTP %s: ' % status if status else '') + msg)
        self.status, self.msg, self.transitorio, self.quota_dia, self.chave, self.espera = status, msg, transitorio, quota_dia, chave, espera

def _post(url, corpo, chave, timeout=300):
    req = urllib.request.Request(url, data=json.dumps(corpo).encode('utf-8'), method='POST',
                                 headers={'Content-Type': 'application/json', 'x-goog-api-key': chave})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r: return r.status, r.read()
    except urllib.error.HTTPError as e: return e.code, e.read()

def msg_erro(dados, chave):
    try:
        j = json.loads(dados.decode('utf-8', 'replace')); m = (j.get('error') or {}).get('message') or str(j)[:300]
    except Exception:
        m = dados.decode('utf-8', 'replace')[:300]
    return (m.replace(chave, '***') if chave else m)[:400]

def erro_http(status, dados, chave):
    bruto = dados.decode('utf-8', 'replace'); msg = msg_erro(dados, chave); low = (msg + ' ' + bruto).lower()
    espera = 0
    m = re.search(r'retry(?:delay)?\W{1,6}(?:in\W{1,3})?(\d+(?:\.\d+)?)\s*s', bruto, re.I)
    if m: espera = int(float(m.group(1))) + 2
    quota_dia = status == 429 and re.search(r'perday|per_day|per day|daily|por dia', low) is not None
    chave_ruim = status in (400, 401, 403) and re.search(r'api key|api_key|permission|unauthenticated|not valid|expired|denied', low) is not None
    transitorio = (status in (429, 500, 502, 503, 504) and not quota_dia) or (status == 400 and not chave_ruim and re.search(r'generate text|try again|temporar', low) is not None)
    return ErroApi(status, msg, transitorio=transitorio, quota_dia=quota_dia, chave=chave_ruim, espera=espera)

def corpo_interactions(modelo, voz, estilo, texto):
    # formato da documentação (ai.google.dev/gemini-api/docs/speech-generation): o texto é lido ao pé da letra; o estilo vai à parte
    return {'model': modelo,
            'input': [{'type': 'user_input', 'content': [{'type': 'text', 'text': texto, 'annotations': [{'type': 'speech_metadata', 'style': estilo}]}]}],
            'response_format': {'type': 'audio'},
            'generation_config': {'speech_config': [{'voice': voz}]}}

def corpo_generate(voz, texto):
    # formato antigo (generateContent), só como plano B
    return {'contents': [{'parts': [{'text': "Say in a warm, calm, expressive teacher's tone, in Brazilian Portuguese: " + texto}]}],
            'generationConfig': {'responseModalities': ['AUDIO'], 'speechConfig': {'voiceConfig': {'prebuiltVoiceConfig': {'voiceName': voz}}}}}

def contorno(o, prof=0):
    """resumo da forma da resposta (sem o áudio), para achar o problema quando o formato muda"""
    if prof > 6: return '…'
    if isinstance(o, dict): return '{' + ', '.join('%s: %s' % (k, contorno(v, prof + 1)) for k, v in list(o.items())[:12]) + '}'
    if isinstance(o, list): return '[' + (contorno(o[0], prof + 1) + (' ×%d' % len(o) if len(o) > 1 else '') if o else '') + ']'
    if isinstance(o, str): return repr(o[:40]) + ('…(%d letras)' % len(o) if len(o) > 40 else '')
    return repr(o)

def achar_audio(j):
    """acha o maior texto base64 da resposta (serve para os dois formatos da API) e o tipo (mime) que vem junto"""
    achados = []
    def rec(o, mime=''):
        if isinstance(o, dict):
            m = str(o.get('mime_type') or o.get('mimeType') or mime or '')
            for k, v in o.items():
                if k == 'data' and isinstance(v, str) and len(v) > 400: achados.append((len(v), v, m))
                else: rec(v, m)
        elif isinstance(o, list):
            for v in o: rec(v, mime)
    rec(j)
    if not achados: return None
    achados.sort(key=lambda t: -t[0]); return achados[0][1], achados[0][2]

def decodificar(b64, mime):
    """WAV (o normal) ou PCM cru de 16 bits → (amostras float32 mono, taxa)"""
    import numpy as np
    raw = base64.b64decode(b64); sr = 24000
    m = re.search(r'rate=(\d+)', mime or '')
    if m: sr = int(m.group(1))
    if raw[:4] == b'RIFF':
        try:
            with wave.open(io.BytesIO(raw)) as w:
                sr, ch, sw = w.getframerate(), w.getnchannels(), w.getsampwidth(); dados = w.readframes(w.getnframes())
            if sw != 2: raise ValueError('esperava 16 bits')
            x = np.frombuffer(dados[:len(dados) // 2 * 2], dtype='<i2').astype(np.float32) / 32768.0
            if ch > 1: x = x[:len(x) // ch * ch].reshape(-1, ch).mean(axis=1)
            return x, sr
        except Exception:
            raw = raw[44:]                                  # cabeçalho fora do padrão: tenta como áudio puro (16 bits, mono)
    return np.frombuffer(raw[:len(raw) // 2 * 2], dtype='<i2').astype(np.float32) / 32768.0, sr

def chamar(chave, variante, modelo, voz, estilo, texto):
    if variante == 'interactions': url, corpo = BASE + '/interactions', corpo_interactions(modelo, voz, estilo, texto)
    else: url, corpo = '%s/models/%s:generateContent' % (BASE, modelo), corpo_generate(voz, texto)
    try: status, dados = _post(url, corpo, chave)
    except (urllib.error.URLError, TimeoutError, ConnectionError, OSError) as e:
        raise ErroApi(0, 'falha de rede (%s)' % str(e).replace(chave, '***')[:150], transitorio=True)
    if status != 200: raise erro_http(status, dados, chave)
    try: j = json.loads(dados.decode('utf-8'))
    except ValueError: raise ErroApi(status, 'a resposta não veio em JSON', transitorio=True)
    r = achar_audio(j)
    if not r: raise ErroApi(status, 'a resposta veio sem áudio. Forma recebida: ' + contorno(j)[:500], transitorio=True)
    if not ESTADO['forma']: ESTADO['forma'] = True; log('  (forma da resposta: %s)' % contorno(j)[:400])
    x, sr = decodificar(*r)
    if len(x) < sr // 4: raise ErroApi(status, 'o áudio recebido está vazio', transitorio=True)
    return x, sr

def com_retentativas(fn):
    for i in range(len(ESPERAS) + 1):
        try: return fn()
        except ErroApi as e:
            if not e.transitorio or i == len(ESPERAS): raise
            espera = max(ESPERAS[i], e.espera)
            log('  %s. Nova tentativa em %d s (%d/%d).' % (e, espera, i + 1, len(ESPERAS))); time.sleep(espera)

def tentar_outro_jeito(e):
    """só troca de jeito de chamar quando o erro parece ser "endereço ou formato não existe", não quando é chave, cota ou rede"""
    if e.chave or e.quota_dia or e.transitorio: return False
    return e.status in (404, 405, 501) or (e.status == 400 and re.search(r'unknown name|invalid json|cannot find field|unrecognized|not supported|unsupported', e.msg, re.I) is not None)

def sintetizar(chave, modelo, voz, estilo, texto, api='auto'):
    """devolve (amostras, taxa). Usa o jeito da documentação (interactions) e, se a API disser que ele não existe, o jeito antigo (generateContent)."""
    ordem = ['interactions', 'generate'] if api == 'auto' else [api]
    if api == 'auto' and ESTADO['api']: ordem = [ESTADO['api']]
    erros = []
    for k, v in enumerate(ordem):
        try:
            r = com_retentativas(lambda: chamar(chave, v, modelo, voz, estilo, texto)); ESTADO['api'] = v; return r
        except ErroApi as e:
            erros.append((v, e))
            if k < len(ordem) - 1 and tentar_outro_jeito(e):
                log('  O jeito "%s" não funcionou (%s). Tentando o outro.' % (v, e)); continue
            if len(erros) > 1:
                raise ErroApi(e.status, '; '.join('jeito "%s": %s' % (n, x) for n, x in erros), transitorio=e.transitorio, quota_dia=e.quota_dia, chave=e.chave)
            raise

# ---------------------------------------------------------------- áudio → MP3
def processar(x, sr, kbps, final):
    """corta o silêncio das pontas, suaviza, iguala o volume (igual ao das vozes antigas) e grava um MP3 provisório ao lado do final.
    Devolve (duração em s, caminho do provisório). Quem chamou decide se o provisório vira o arquivo final."""
    import gerar
    y = gerar.loud(gerar.fade(gerar.trim(x, sr), sr))
    tmp = final[:-4] + '.novo.mp3'
    gerar.mp3(y, sr, tmp, kbps)
    return len(y) / sr, tmp

def gravar_json(pasta, id_, meta):
    p = os.path.join(pasta, id_ + '.json'); tmp = p + '.novo'
    with open(tmp, 'w', encoding='utf-8') as f: json.dump(meta, f, ensure_ascii=False)
    os.replace(tmp, p)

def em_dia(pasta, id_, h):
    f, m = os.path.join(pasta, id_ + '.mp3'), os.path.join(pasta, id_ + '.json')
    try: return os.path.exists(f) and json.load(open(m, encoding='utf-8')).get('h') == h
    except Exception: return False

def atualizar_mapa():
    r = subprocess.run([sys.executable, os.path.join(HERE, 'audiomap.py'), os.path.join(RAIZ, 'audio'), os.path.join(RAIZ, 'js', '18-audiomap.js'),
                        '--kbps', '48', '--spoken', os.path.join(HERE, 'spoken.json')], capture_output=True, text=True)
    log((r.stdout or '').strip() or (r.stderr or '').strip())
    if r.returncode != 0: raise RuntimeError('audiomap.py falhou: ' + (r.stderr or '')[-400:])

# ---------------------------------------------------------------- GitHub
def git(*args):
    env = dict(os.environ)                      # sem identidade configurada o "git pull --rebase" falha; no GitHub Actions ela não vem pronta
    for k, v in (('GIT_AUTHOR_NAME', 'github-actions[bot]'), ('GIT_COMMITTER_NAME', 'github-actions[bot]'),
                 ('GIT_AUTHOR_EMAIL', '41898282+github-actions[bot]@users.noreply.github.com'), ('GIT_COMMITTER_EMAIL', '41898282+github-actions[bot]@users.noreply.github.com')):
        env.setdefault(k, v)
    return subprocess.run(['git', *args], cwd=RAIZ, capture_output=True, text=True, env=env)

def tem_git(): return git('rev-parse', '--is-inside-work-tree').returncode == 0

def ramo_atual(): return os.environ.get('GITHUB_REF_NAME') or git('rev-parse', '--abbrev-ref', 'HEAD').stdout.strip() or 'main'

def enviar(msg, caminhos):
    """git add + commit + (atualiza com o que houver de novo no GitHub) + push. Devolve True se enviou algo."""
    for f in glob.glob(os.path.join(RAIZ, '**', '*.novo*'), recursive=True):
        if '/.git/' not in f:
            try: os.remove(f)
            except OSError: pass
    caminhos = [p for p in caminhos if os.path.exists(os.path.join(RAIZ, p))]
    r = git('add', '-A', '--', *caminhos)
    if r.returncode != 0: raise RuntimeError('git add falhou: ' + r.stderr[-300:])
    if git('diff', '--cached', '--quiet').returncode == 0: log('Nada novo para guardar.'); return False
    r = git('commit', '-q', '-m', msg)
    if r.returncode != 0: raise RuntimeError('git commit falhou: ' + r.stderr[-300:])
    ramo = ramo_atual(); ult = None
    for i in range(4):
        r = git('pull', '--rebase', '-q', 'origin', ramo)
        if r.returncode != 0: git('rebase', '--abort'); raise RuntimeError('conflito ao atualizar antes de enviar: ' + (r.stderr or r.stdout).strip()[-300:])
        ult = git('push', '-q', 'origin', 'HEAD:' + ramo)
        if ult.returncode == 0: log('Enviado para o GitHub (%s).' % ramo); return True
        time.sleep(5 * (i + 1))
    raise RuntimeError('não consegui enviar para o GitHub: ' + ((ult.stderr or '').strip()[-300:] if ult else ''))

def guardar(msg, producao=True):
    if producao: atualizar_mapa()
    if not tem_git(): log('(isto não é um repositório git: nada para enviar)'); return False
    return enviar(msg, ['audio', 'js/18-audiomap.js'] if producao else ['audio-teste'])

def garantir_marco():
    """antes do primeiro áudio novo entrar em audio/, marca o estado atual (áudio antigo) com uma tag; assim o modo 5 consegue voltar"""
    if not tem_git(): return
    r = git('ls-remote', '--tags', 'origin', 'refs/tags/' + MARCO)
    if r.returncode == 0 and MARCO in (r.stdout or ''): return
    if voz_em_uso():                            # já há áudio do Gemini aqui: a marca apontaria para ele, não para o antigo
        anota('warning', 'Já existe áudio do Gemini em audio/ e não há ponto de volta; não vou criá-lo agora porque ele apontaria para o áudio novo.'); return
    a = git('tag', MARCO); b = git('push', '-q', 'origin', 'refs/tags/' + MARCO)
    if a.returncode == 0 and b.returncode == 0: log('Ponto de volta criado (tag %s): o áudio antigo fica guardado.' % MARCO)
    else:
        anota('warning', 'Não consegui criar o ponto de volta (%s). O áudio antigo continua no histórico do GitHub, mas o modo 5 não vai funcionar.' % MARCO)
        log('⚠ tag não criada:', ((a.stderr or '') + (b.stderr or '')).strip()[-200:])

def voltar_para_piper():
    if not tem_git(): log('✗ isto não é um repositório git.'); return 1
    r = git('ls-remote', '--tags', 'origin', 'refs/tags/' + MARCO)
    if r.returncode != 0 or MARCO not in (r.stdout or ''):
        log('✗ Não existe o ponto de volta (%s). Isso quer dizer que nenhum áudio do Gemini foi colocado em audio/ por este gerador. Nada a desfazer.' % MARCO); return 1
    f = git('fetch', '-q', '--depth=1', 'origin', 'refs/tags/%s:refs/tags/%s' % (MARCO, MARCO))
    if f.returncode != 0 and git('rev-parse', '-q', '--verify', 'refs/tags/' + MARCO).returncode != 0:
        log('✗ Não consegui baixar o ponto de volta:', (f.stderr or '').strip()[-300:]); return 1
    c = git('checkout', MARCO, '--', 'audio', 'js/18-audiomap.js')
    if c.returncode != 0: log('✗ Não consegui restaurar:', (c.stderr or '').strip()[-300:]); return 1
    ok = enviar('Volta para a voz Piper (áudio de antes do Gemini)', ['audio', 'js/18-audiomap.js'])
    log('Pronto: o guia volta a usar a voz Piper.' if ok else 'O áudio já era o antigo. Nada a fazer.')
    resumo_md(['### Voltou para a voz Piper', '', 'O áudio e a lista `js/18-audiomap.js` foram restaurados do ponto `%s`. O site atualiza em 1 a 2 minutos.' % MARCO])
    return 0

# ---------------------------------------------------------------- página de teste (audio-teste/index.html)
CSS_TESTE = (':root{--bg:#F6F8FA;--card:#FFFFFF;--fg:#14202B;--mut:#4A5B6B;--bd:#CBD5DF;--ac:#0B6E63;color-scheme:light}'
             '@media (prefers-color-scheme:dark){:root{--bg:#080B11;--card:#0F1620;--fg:#E6EDF3;--mut:#9FB0C0;--bd:#223041;--ac:#2DD4BF;color-scheme:dark}}'
             'body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.55 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}'
             'main{max-width:680px;margin:0 auto;padding:20px 16px 56px}h1{font-size:1.5rem;margin:0 0 6px}h2{font-size:1.15rem;margin:28px 0 8px}'
             'p{color:var(--mut);margin:6px 0}blockquote{margin:12px 0;padding:12px 14px;border-left:3px solid var(--ac);background:var(--card);color:var(--fg);white-space:pre-line}'
             'ul{list-style:none;margin:12px 0;padding:0;display:grid;gap:12px}li{background:var(--card);border:1px solid var(--bd);border-radius:12px;padding:12px 14px}'
             '.nome{margin-bottom:8px;overflow-wrap:anywhere}.nome small{color:var(--mut)}audio{width:100%}ol{color:var(--mut);padding-left:22px}a{color:var(--ac)}small{color:var(--mut)}')

def titulo_ficha(spoken, id_):
    e = next((x for x in spoken if x['id'] == id_), None)
    return re.sub(r'[.!?\s]+$', '', e['segs'][0]['t']) if e and e['segs'] else id_

def escrever_pagina_teste(spoken_path):
    pasta = os.path.join(RAIZ, 'audio-teste'); os.makedirs(pasta, exist_ok=True)
    try: spoken = ler_spoken(spoken_path)
    except Exception: spoken = []
    try: am = json.load(open(os.path.join(pasta, 'amostras.json'), encoding='utf-8'))
    except Exception: am = None
    fichas = []
    for f in sorted(glob.glob(os.path.join(pasta, 'fichas', '*.json'))):
        id_ = os.path.basename(f)[:-5]
        try: j = json.load(open(f, encoding='utf-8'))
        except Exception: continue
        if os.path.exists(os.path.join(pasta, 'fichas', id_ + '.mp3')): fichas.append((id_, j))
    h = ['<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">',
         '<link rel="icon" href="data:,"><title>Teste de voz · DEV EASY</title><style>' + CSS_TESTE + '</style></head><body><main>',
         '<h1>Teste de voz (Gemini)</h1><p>Página só para ouvir e decidir. Pode apagar a pasta <code>audio-teste</code> do GitHub quando terminar.</p>']
    if am:
        h.append('<h2>1. O mesmo trecho em %d vozes</h2><p>Trecho da ficha “%s”. Repare em como ela fala “back-end”.</p><blockquote>%s</blockquote><ul>'
                 % (len(am['vozes']), html.escape(titulo_ficha(spoken, am.get('ficha', ''))), html.escape(am['texto'])))
        for v in am['vozes']:
            h.append('<li><div class="nome"><b>%s</b></div><audio controls preload="none" src="%s.mp3"></audio></li>' % (html.escape(v), html.escape(v)))
        h.append('</ul><p><small>Modelo %s · gerado em %s</small></p>' % (html.escape(am['modelo']), html.escape(am['quando'])))
    if fichas:
        h.append('<h2>2. Fichas inteiras</h2><p>Para ver se a voz se mantém bem do começo ao fim.</p><ul>')
        for id_, j in fichas:
            h.append('<li><div class="nome"><b>%s</b> <small>voz %s · %d s · %s</small></div><audio controls preload="none" src="fichas/%s.mp3"></audio></li>'
                     % (html.escape(titulo_ficha(spoken, id_)), html.escape(str(j.get('voz_gemini', '?'))), round(j.get('dur', 0)), html.escape(str(j.get('quando', ''))), html.escape(id_)))
        h.append('</ul>')
    if not am and not fichas: h.append('<p>Ainda não há nada para ouvir aqui.</p>')
    h.append('<h2>E agora?</h2><ol><li>Gostou de uma voz? No GitHub: aba <b>Actions</b> → <b>Gerar áudio (Gemini)</b> → <b>Run workflow</b>.</li>'
             '<li>Modo <b>3-fichas-de-teste</b>, escrevendo o nome da voz em <b>voz</b>, grava 3 fichas inteiras nesta página (não mexe no guia).</li>'
             '<li>Se estiver bom, modo <b>4-gerar-todas</b> troca a voz de todas as fichas. Dá para desfazer com o modo <b>5-voltar-para-piper</b>.</li></ol>'
             '<p><small><a href="../">Voltar ao DEV EASY</a></small></p></main></body></html>')
    with open(os.path.join(pasta, 'index.html'), 'w', encoding='utf-8') as f: f.write(''.join(h))

# ---------------------------------------------------------------- modos
def ler_spoken(caminho): return json.load(open(caminho, encoding='utf-8'))

def voz_em_uso():
    """olha os áudios do Gemini que já estão em audio/ e devolve ((modelo, voz, estilo), quantos) do mais comum, ou None.
    Campo vazio no botão = continuar com o que já está em uso (assim ninguém regrava tudo sem querer só por esquecer de digitar a voz)."""
    cont = {}
    for f in glob.glob(os.path.join(RAIZ, 'audio', '*.json')):
        try: j = json.load(open(f, encoding='utf-8'))
        except Exception: continue
        if j.get('motor') == 'gemini':
            k = (j.get('modelo', ''), j.get('voz_gemini', ''), j.get('estilo', ''))
            cont[k] = cont.get(k, 0) + 1
    if not cont: return None
    k = max(cont, key=cont.get); return k, cont[k]

def cfg_de(a, uso=None):
    u = uso[0] if uso else ('', '', '')
    return (a.modelo or u[0] or MODELO_PADRAO, norm_voz((a.voz.split(',')[0] if a.voz else '') or u[1] or VOZ_PADRAO), a.estilo or u[2] or ESTILO_PADRAO)

def modo_testar(a, chave):
    modelo, voz, estilo = cfg_de(a, voz_em_uso())
    log('Testando: modelo %s, voz %s…' % (modelo, voz))
    x, sr = sintetizar(chave, modelo, voz, estilo, 'Olá! Este é um teste rápido da voz do guia.', a.api)
    log('OK: chave, modelo e formato da resposta funcionam. Recebi %.1f s de áudio (%d Hz), pelo jeito "%s".' % (len(x) / sr, sr, ESTADO['api']))
    resumo_md(['### Teste da chave', '', 'Funcionou: modelo `%s`, voz `%s`, %.1f s de áudio.' % (modelo, voz, len(x) / sr), '', 'Próximo passo: rode de novo com o modo **2-ouvir-vozes**.'])
    return 0

def modo_amostras(a, chave):
    modelo, _, estilo = cfg_de(a, voz_em_uso())
    vozes = [norm_voz(v) for v in (a.voz or '').split(',') if v.strip()] or VOZES_AMOSTRA
    spoken = ler_spoken(a.spoken)
    ficha = next((e for e in spoken if e['id'] == 'backend'), spoken[0])
    texto = texto_final(ficha['segs'][:8])
    out = os.path.join(RAIZ, 'audio-teste'); os.makedirs(out, exist_ok=True)
    log('Amostras: %d vozes, trecho da ficha "%s" (%d letras).' % (len(vozes), ficha['id'], len(texto)))
    feitas, seg = [], 0.0
    for i, v in enumerate(vozes):
        if i: time.sleep(a.espera)
        try: x, sr = sintetizar(chave, modelo, v, estilo, texto, a.api)
        except ErroApi as e:
            if e.status == 400 and not e.chave and not e.quota_dia and not e.transitorio: log('  ✗ voz "%s": %s (nome de voz errado?)' % (v, e)); continue
            raise
        seg += len(x) / sr
        final = os.path.join(out, v + '.mp3'); d, tmp = processar(x, sr, a.kbps, final); os.replace(tmp, final); feitas.append(v)
        log('  ✓ %s (%.0f s)' % (v, d))
    if not feitas: raise ErroApi(0, 'nenhuma voz foi gerada')
    quando = datetime.datetime.now().strftime('%d/%m/%Y %H:%M')
    with open(os.path.join(out, 'amostras.json'), 'w', encoding='utf-8') as f:
        json.dump({'texto': texto, 'modelo': modelo, 'estilo': estilo, 'quando': quando, 'vozes': feitas, 'ficha': ficha['id']}, f, ensure_ascii=False)
    escrever_pagina_teste(a.spoken)
    c = custo_usd(modelo, seg)
    resumo_md(['### Vozes geradas', '', '%d vozes: %s' % (len(feitas), ', '.join(feitas)), '',
               'Ouça em: **https://jovenscript.github.io/dev-easy/audio-teste/** (espere 1 a 2 minutos depois do fim desta execução).', '',
               'Custo estimado: %s' % ('US$ %.2f' % c if c is not None else 'desconhecido')])
    return 0

def gerar_uma(chave, a, modelo, voz, estilo, e, h, pasta):
    """gera 1 ficha. O arquivo final só é trocado se o resultado passar na conferência de ritmo. Devolve (resultado ou None, segundos de áudio cobrados)."""
    texto = texto_final(e['segs']); pal = palavras_de(e); final = os.path.join(pasta, e['id'] + '.mp3'); cobrado = 0.0
    if not texto.strip(): log('  ? %s: sem texto para falar' % e['id']); return None, 0.0
    for tent in range(1, 4):
        x, sr = sintetizar(chave, modelo, voz, estilo, texto, a.api); cobrado += len(x) / sr
        dur, tmp = processar(x, sr, a.kbps, final)
        wpm = pal / (dur / 60) if dur > 0 else 0
        if WPM_MIN <= wpm <= WPM_MAX:
            os.replace(tmp, final)
            gravar_json(pasta, e['id'], {'h': h, 'motor': 'gemini', 'voz': 'gemini', 'modelo': modelo, 'voz_gemini': voz, 'estilo': estilo, 'kbps': a.kbps,
                                         'dur': round(dur, 2), 'bytes': os.path.getsize(final), 'wpm': round(wpm, 1), 'speed': 1.0, 'pausa': 1.0, 'quando': datetime.date.today().isoformat()})
            return {'dur': dur, 'wpm': wpm}, cobrado
        os.remove(tmp)
        log('  ? %s: %.0f palavras/min (%.0f s) parece cortado ou estranho; tentativa %d/3' % (e['id'], wpm, dur, tent))
    return None, cobrado

def modo_fichas(a, chave):
    uso = voz_em_uso()
    modelo, voz, estilo = cfg_de(a, uso)
    producao = a.destino == 'producao'
    if producao and uso and (modelo, voz, estilo) != uso[0] and not a.trocar:
        antes = uso[0]; mud = [n for n, x, y in (('modelo', antes[0], modelo), ('voz', antes[1], voz), ('estilo', antes[2], estilo)) if x != y]
        log('✗ Parei antes de gastar: já existem %d áudios do Gemini com outra configuração (mudou: %s).' % (uso[1], ', '.join(mud)))
        log('  Em uso: modelo %s, voz %s. Você pediu: modelo %s, voz %s.' % (antes[0], antes[1], modelo, voz))
        log('  Trocar regrava TODAS as fichas (custo parecido com o da primeira vez) e deixa o repositório uns 150 MB maior.')
        log('  Para continuar com a configuração atual: deixe os campos voz, estilo e modelo VAZIOS. Para trocar de verdade: marque "trocar_voz".')
        anota('error', 'Configuração diferente da que já está em uso. Deixe voz/estilo/modelo vazios ou marque trocar_voz.')
        resumo_md(['### ✗ Parei antes de gastar', '', 'Já existem áudios do Gemini com voz `%s`; você pediu `%s`. Deixe os campos vazios para continuar com a atual, ou marque **trocar_voz** para regravar tudo.' % (antes[1], voz)])
        return 1
    spoken = ler_spoken(a.spoken)
    quer = None if a.ids.strip().lower() == 'all' else {x.strip() for x in a.ids.split(',') if x.strip()}
    if not producao:
        if quer is None or len(quer) > 6:
            log('✗ No teste, use no máximo 6 fichas (ids separados por vírgula). Para gerar todas, use o modo 4.'); return 1
    if quer is not None:
        nao = sorted(quer - {e['id'] for e in spoken} - {'_teste'})
        if nao: log('⚠ Ids que não existem (ignorados): ' + ', '.join(nao))
    base = ([TESTE] if producao else []) + spoken
    alvo = [e for e in base if quer is None or e['id'] in quer]
    pasta = a.saida or os.path.join(RAIZ, 'audio' if producao else os.path.join('audio-teste', 'fichas'))
    os.makedirs(pasta, exist_ok=True)
    pend, ok = [], 0
    for e in alvo:
        h = hash_ficha(modelo, voz, estilo, e['segs'])
        if em_dia(pasta, e['id'], h): ok += 1
        else: pend.append((e, h))
    total_pend = len(pend)
    if a.limite > 0: pend = pend[:a.limite]
    est = sum(palavras_de(e) for e, _ in pend) / PALAVRAS_POR_MIN * 60
    c = custo_usd(modelo, est)
    log('Modelo %s · voz %s · destino %s' % (modelo, voz, 'audio/ (o guia)' if producao else 'audio-teste/fichas/ (só teste)'))
    log('Fichas no alvo: %d · já em dia: %d · a gerar agora: %d%s' % (len(alvo), ok, len(pend), ' (limite %d, faltariam %d)' % (a.limite, total_pend) if a.limite > 0 and total_pend > len(pend) else ''))
    log('Estimativa desta execução: ~%.0f min de áudio%s.' % (est / 60, ', cerca de US$ %.2f se a sua conta for paga (na cota grátis, zero)' % c if c is not None else ''))
    if a.simular: log('(simulação: nada foi gerado)'); return 0
    if producao and pend: garantir_marco()
    feitas, suspeitas, falharam, seg_api, parou, seguidas = 0, [], [], 0.0, None, 0
    for i, (e, h) in enumerate(pend):
        if i: time.sleep(a.espera)
        try: res, cobrado = gerar_uma(chave, a, modelo, voz, estilo, e, h, pasta)
        except ErroApi as err:
            log('✗ %s: %s' % (e['id'], err))
            if err.quota_dia or err.status == 429:
                parou = 'cota'
                log('A cota da sua conta acabou por agora. O que já foi gerado fica guardado; rode de novo depois (de preferência amanhã) para continuar de onde parou.')
                anota('warning', 'Cota do Gemini esgotada: rode de novo mais tarde para continuar.'); break
            if err.chave:
                parou = 'erro'; log('A chave não foi aceita. Confira o Secret GEMINI_API_KEY (Settings → Secrets and variables → Actions) e rode o modo 1.')
                anota('error', 'Chave do Gemini não aceita.'); break
            falharam.append(e['id']); seguidas += 1                  # uma ficha que o Google não quis ler não derruba as outras
            if seguidas >= 3:
                parou = 'erro'; log('Três fichas seguidas deram problema; parei para não gastar à toa.'); anota('error', 'Três fichas seguidas falharam no Gemini: %s' % str(err)[:150]); break
            continue
        except Exception as err:                                     # ffmpeg, disco, etc.: para sem perder o que já foi feito
            parou = 'erro'; log('✗ %s: falha ao preparar o áudio (%s: %s)' % (e['id'], type(err).__name__, str(err)[:200])); anota('error', 'Falha ao preparar o áudio de %s.' % e['id']); break
        seg_api += cobrado
        if res is None:
            suspeitas.append(e['id']); seguidas += 1
            if seguidas >= 3: parou = 'erro'; log('Três fichas seguidas saíram com ritmo estranho; parei para não gastar à toa.'); anota('error', 'Três fichas seguidas com áudio suspeito.'); break
            continue
        seguidas = 0
        feitas += 1; log('  ✓ %s (%d/%d): %.0f s, %.0f palavras/min' % (e['id'], i + 1, len(pend), res['dur'], res['wpm']))
        if producao and a.commit_a_cada and feitas % a.commit_a_cada == 0:
            try: guardar('Áudio Gemini: %d fichas (parcial)' % feitas, True)
            except Exception as err: log('⚠ não consegui enviar o parcial (%s); sigo gerando.' % str(err)[:200])
    if producao: atualizar_mapa()
    else: escrever_pagina_teste(a.spoken)
    faltam = max(0, total_pend - feitas)
    cg = custo_usd(modelo, seg_api)
    linhas = ['### Áudio das fichas (Gemini) — %s' % ('guia' if producao else 'só teste'), '', '- Modelo `%s`, voz `%s`' % (modelo, voz),
              '- Geradas agora: **%d** · já em dia antes: %d · suspeitas (não guardadas): %d' % (feitas, ok, len(suspeitas)),
              '- Áudio gerado: %.1f min%s' % (seg_api / 60, ' (custo estimado US$ %.2f)' % cg if cg is not None else ''), '- Ainda faltam: **%d** fichas' % faltam]
    if suspeitas: linhas.append('- Suspeitas (rode de novo): ' + ', '.join(suspeitas))
    if falharam: linhas.append('- O Google não devolveu áudio para: ' + ', '.join(falharam) + ' (rode de novo; se persistir, o texto dessa ficha pode estar sendo recusado)')
    if parou == 'cota': linhas.append('- ⚠ Parou porque a cota acabou. Rode de novo depois.')
    if parou == 'erro': linhas.append('- ✗ Parou por erro (veja o registro acima).')
    if not producao and feitas: linhas.append('- Ouça em: **https://jovenscript.github.io/dev-easy/audio-teste/** (espere 1 a 2 minutos).')
    resumo_md(linhas)
    log('Resumo: %d geradas, %d suspeitas, %d com falha, faltam %d.' % (feitas, len(suspeitas), len(falharam), faltam))
    if falharam and not parou: anota('warning', 'Sem áudio do Gemini para: %s' % ', '.join(falharam))
    return 1 if parou == 'erro' else 0

def main():
    ap = argparse.ArgumentParser(description='Áudio das fichas com a voz do Gemini')
    ap.add_argument('--modo', required=True, choices=['testar-chave', 'amostras', 'fichas', 'guardar', 'voltar-para-piper'])
    ap.add_argument('--destino', choices=['producao', 'teste'], default='producao', help='fichas/guardar: producao = audio/ (o guia); teste = audio-teste/ (só para ouvir)')
    ap.add_argument('--ids', default='all', help='ids separados por vírgula, ou all')
    ap.add_argument('--limite', type=int, default=0, help='máximo de fichas nesta execução (0 = sem limite)')
    ap.add_argument('--modelo', default=''); ap.add_argument('--voz', default=''); ap.add_argument('--estilo', default='')
    ap.add_argument('--kbps', type=int, default=48); ap.add_argument('--espera', type=float, default=3.0, help='segundos entre uma ficha e outra')
    ap.add_argument('--api', choices=['auto', 'interactions', 'generate'], default='auto')
    ap.add_argument('--commit-a-cada', type=int, default=0, help='envia ao GitHub a cada N fichas (para não perder trabalho em execuções longas)')
    ap.add_argument('--mensagem', default='Áudio gerado com o Gemini')
    ap.add_argument('--simular', action='store_true', help='só mostra o que faria e quanto custaria')
    ap.add_argument('--trocar', action='store_true', help='permite trocar voz/estilo/modelo mesmo já havendo áudios do Gemini em audio/ (regrava tudo)')
    ap.add_argument('--saida', default=''); ap.add_argument('--spoken', default=os.path.join(HERE, 'spoken.json'))
    a = ap.parse_args()
    if a.modo == 'guardar':
        guardar(a.mensagem, a.destino == 'producao'); return 0
    if a.modo == 'voltar-para-piper': return voltar_para_piper()
    chave = os.environ.get('GEMINI_API_KEY', '').strip()
    if not chave and not (a.modo == 'fichas' and a.simular):
        log('✗ Falta a chave. No GitHub: Settings → Secrets and variables → Actions → New repository secret → nome GEMINI_API_KEY, valor = a chave do Google AI Studio (aistudio.google.com/apikey).')
        anota('error', 'Falta o Secret GEMINI_API_KEY.'); return 1
    try:
        return {'testar-chave': modo_testar, 'amostras': modo_amostras, 'fichas': modo_fichas}[a.modo](a, chave)
    except ErroApi as e:
        log('✗ ' + str(e))
        if e.chave: log('A chave não foi aceita ou não tem permissão. Crie outra em aistudio.google.com/apikey e troque o Secret GEMINI_API_KEY.')
        elif e.quota_dia or e.status == 429: log('Cota esgotada por agora. Tente de novo mais tarde.')
        elif e.status == 404: log('Modelo ou endereço não encontrado. Confira o nome do modelo (padrão: %s).' % MODELO_PADRAO)
        anota('error', str(e)[:300]); resumo_md(['### ✗ Não deu certo', '', '`%s`' % str(e)[:500]])
        return 1

if __name__ == '__main__':
    sys.exit(main())
