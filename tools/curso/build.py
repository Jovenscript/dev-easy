#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Gera jogos/curso/*.js a partir de tools/curso/src/uNN-*.py   (veja tools/curso/GUIA-AUTORES.md)

  python3 tools/curso/build.py                  confere TUDO e, se estiver tudo certo, gera jogos/curso/*.js
  python3 tools/curso/build.py -u u03           só confere a unidade u03 (não escreve nada)   [-u u03,u04 também vale]
  python3 tools/curso/build.py -v               só confere tudo (não escreve nada)
  python3 tools/curso/build.py -u u03 --lista   mostra as lições e o que cada uma tem
  python3 tools/curso/build.py -a               mostra também os avisos
  python3 tools/curso/build.py --determinismo   roda 2 vezes com sementes de hash diferentes e compara
  python3 tools/curso/build.py --versoes        roda sob Python 3.11/3.12/3.13/3.14 (os que existirem) e mostra o que muda
"""
import argparse, glob, hashlib, json, multiprocessing as mp, os, runpy, shutil, subprocess, sys, tempfile, time, traceback

HERE = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.abspath(os.path.join(HERE, '..', '..'))
SRC = os.environ.get('CURSO_SRC') or os.path.join(HERE, 'src')
SAIDA = os.environ.get('CURSO_SAIDA') or os.path.join(RAIZ, 'jogos', 'curso')
sys.path.insert(0, HERE)
import dsl  # noqa: E402


def fontes(filtro=None):
    todos = sorted(glob.glob(os.path.join(SRC, 'u[0-9][0-9]-*.py')))
    if filtro:
        todos = [p for p in todos if os.path.basename(p)[:3] in filtro]
    return todos


def construir(path):
    """Roda um arquivo de unidade e devolve o que ele produziu."""
    dsl.zerar()
    num = int(os.path.basename(path)[1:3])
    dsl.definir_unidade_atual(num)
    nome = os.path.basename(path)
    exc = None
    try:
        runpy.run_path(path, run_name='__unidade__')
    except BaseException as e:
        quadros = [f for f in traceback.extract_tb(e.__traceback__) if os.path.abspath(f.filename) == os.path.abspath(path)]
        onde = '%s:%d' % (nome, quadros[-1].lineno) if quadros else nome
        exc = (onde, ''.join(traceback.format_exception_only(type(e), e)).strip())
    erros = list(dsl.ERROS)
    if exc:
        erros.append((exc[0], 'o arquivo quebrou antes de terminar: ' + exc[1]))
    unidades = list(dsl.UNIDADES)
    if not exc:
        if len(unidades) != 1:
            erros.append((nome, 'o arquivo precisa chamar UNIDADE(...) exatamente uma vez (chamou %d)' % len(unidades)))
        elif unidades[0]['id'] != 'u%02d' % num:
            erros.append((nome, 'o arquivo é da unidade u%02d, mas UNIDADE() usa o id %r' % (num, unidades[0]['id'])))
    return {'arquivo': nome, 'unidade': unidades[0] if len(unidades) == 1 else None, 'erros': erros, 'avisos': list(dsl.AVISOS), 'conta': dict(dsl.CONTA)}


def js(o):
    return json.dumps(o, ensure_ascii=False, separators=(',', ':')).replace('\u2028', '\\u2028').replace('\u2029', '\\u2029')


def texto_unidade(u, arquivo):
    cab = {k: v for k, v in u.items() if k != 'licoes'}
    corpo = ',\n'.join(js(l) for l in u['licoes'])
    return ('/* GERADO por tools/curso/build.py (fonte: tools/curso/src/%s). NÃO edite este arquivo: edite a fonte e rode o gerador. */\n'
            'ENIAC.unidade(%s,[\n%s\n]);\n') % (arquivo, js(cab), corpo)


def resumo_tipos(u):
    c = {}
    for l in u['licoes']:
        for x in l['exercicios']:
            c[x['tipo']] = c.get(x['tipo'], 0) + 1
    return c


def verificar_geral(rs):
    """Conferências que olham todas as unidades juntas."""
    erros, avisos = [], []
    vistos = {}
    for r in rs:
        u = r['unidade']
        if not u:
            continue
        for l in u['licoes']:
            for i, x in enumerate(l['exercicios'], 1):
                chave = json.dumps([x['tipo'], x.get('codigo'), x.get('linhas'), x.get('pares'), x.get('resposta'), x.get('opcoes') and x['opcoes'][0]], ensure_ascii=False)
                if chave in vistos and vistos[chave][0] != u['id']:
                    avisos.append(('%s' % r['arquivo'], 'exercício repetido em outra unidade: %s #%d = %s' % (l['id'], i, vistos[chave][1])))
                elif chave in vistos:
                    erros.append((r['arquivo'], 'exercício repetido dentro da unidade: %s #%d = %s' % (l['id'], i, vistos[chave][1])))
                else:
                    vistos[chave] = (u['id'], '%s #%d' % (l['id'], i))
    return erros, avisos


def main():
    ap = argparse.ArgumentParser(description='Gerador do curso do ENIAC')
    ap.add_argument('-u', '--unidade', help='só estas unidades (ex.: u03 ou u03,u04); não escreve nada')
    ap.add_argument('-v', '--verificar', action='store_true', help='só confere, não escreve nada')
    ap.add_argument('-a', '--avisos', action='store_true', help='mostra também os avisos')
    ap.add_argument('--lista', action='store_true', help='lista as lições')
    ap.add_argument('--parcial', action='store_true', help='(desenvolvimento) escreve jogos/curso/ só com as unidades sem erro; ignora a regra de 4 lições mínimas')
    ap.add_argument('--tudo', action='store_true', help='não corta a lista de erros')
    ap.add_argument('--digest', action='store_true', help='(interno) imprime a impressão digital do resultado')
    ap.add_argument('--json', help='(interno) grava o conteúdo todo neste arquivo JSON')
    ap.add_argument('--determinismo', action='store_true', help='confere que duas execuções dão o mesmo resultado')
    ap.add_argument('--versoes', action='store_true', help='confere sob vários Python')
    a = ap.parse_args()

    if a.determinismo:
        return determinismo()
    if a.versoes:
        return versoes()

    filtro = [x.strip() for x in a.unidade.split(',')] if a.unidade else None
    arqs = fontes(filtro)
    if not arqs:
        print('Nenhum arquivo de unidade encontrado em tools/curso/src/' + (' para ' + a.unidade if a.unidade else ''))
        return 1
    t0 = time.time()
    ctx = mp.get_context('fork')
    with ctx.Pool(processes=min(2, len(arqs))) as pool:
        rs = pool.map(construir, arqs, chunksize=1)

    erros, avisos = [], []
    for r in rs:
        if a.parcial:
            r['erros'] = [e for e in r['erros'] if 'a unidade precisa ter de 4 a 16' not in e[1]]
        erros += r['erros']
        avisos += r['avisos']
    e2, a2 = verificar_geral(rs)
    erros += e2
    avisos += a2

    tot_l = tot_e = 0
    textos = {}
    for r in rs:
        u = r['unidade']
        if not u:
            print('%-4s %-34s  ✗ não gerou' % (r['arquivo'][:3], r['arquivo'][4:-3]))
            continue
        ne = sum(len(l['exercicios']) for l in u['licoes'])
        tot_l += len(u['licoes']); tot_e += ne
        textos[u['id']] = (texto_unidade(u, r['arquivo']), r['arquivo'])
        tipos = resumo_tipos(u)
        c = r['conta']
        n_err = sum(1 for e in r['erros'])
        marca = '✗ %d erro(s)' % n_err if n_err else '✓'
        print('%-4s %-34s %2d lições %4d exerc. | %s | sem-teste %d · livre %d · avisos %d  %s' % (
            u['id'], u['titulo'][:34], len(u['licoes']), ne,
            ' '.join('%s %d' % (k, tipos[k]) for k in sorted(tipos)), c['conceito_sem_teste'] + c['pares_sem_verif'], c['livre'], len(r['avisos']), marca))
        if a.lista:
            for l in u['licoes']:
                t = {}
                for x in l['exercicios']:
                    t[x['tipo']] = t.get(x['tipo'], 0) + 1
                print('       %s  %-38s %2d ex  %s' % (l['id'], l['titulo'][:38], len(l['exercicios']), ' '.join('%s%d' % (k[:2], v) for k, v in sorted(t.items()))))

    if erros:
        print('\nERROS (%d):' % len(erros))
        for onde, msg in erros if a.tudo else erros[:60]:
            print('  %-26s %s' % (onde, msg))
        if len(erros) > 60 and not a.tudo:
            print('  ... e mais %d (use --tudo)' % (len(erros) - 60))
    if avisos and a.avisos:
        print('\nAVISOS (%d):' % len(avisos))
        for onde, msg in avisos if a.tudo else avisos[:80]:
            print('  %-26s %s' % (onde, msg))
    elif avisos:
        print('\n%d aviso(s) (use -a para ver)' % len(avisos))

    total = sum(len(t[0].encode('utf-8')) for t in textos.values())
    print('\n%d unidade(s) · %d lições · %d exercícios · %.0f KB · %.1fs' % (len(textos), tot_l, tot_e, total / 1024, time.time() - t0))

    manifesto = None
    if a.parcial:
        ruins = {r['arquivo'] for r in rs if r['erros']}
        rs = [r for r in rs if r['unidade'] and r['arquivo'] not in ruins]
        textos = {r['unidade']['id']: textos[r['unidade']['id']] for r in rs}
        if ruins:
            print('(parcial) ignoradas por terem erro: ' + ', '.join(sorted(ruins)))
    if not erros or a.parcial:
        un = []
        for r in rs:
            u = r['unidade']
            texto = textos[u['id']][0]
            un.append({'id': u['id'], 'titulo': u['titulo'], 'descricao': u['descricao'], 'arquivo': u['id'] + '.js',
                       'v': hashlib.sha1(texto.encode('utf-8')).hexdigest()[:8],
                       'licoes': [{'id': l['id'], 'titulo': l['titulo'], 'resumo': l['resumo'], 'n': len(l['exercicios'])} for l in u['licoes']]})
        versao = hashlib.sha1(''.join(x['v'] for x in un).encode()).hexdigest()[:8]
        manifesto = 'ENIAC.manifesto(%s);\n' % js({'v': versao, 'unidades': un})
        manifesto = '/* GERADO por tools/curso/build.py. NÃO edite este arquivo. */\n' + manifesto
        digest = hashlib.sha1((manifesto + ''.join(textos[k][0] for k in sorted(textos))).encode('utf-8')).hexdigest()
        if a.digest:
            print('DIGEST ' + digest)
        if a.json:
            with open(a.json, 'w', encoding='utf-8') as f:
                json.dump([r['unidade'] for r in rs if r['unidade']], f, ensure_ascii=False)
        if not (a.verificar or filtro):
            os.makedirs(SAIDA, exist_ok=True)
            for nome in os.listdir(SAIDA):
                if nome.endswith('.js') and nome[:-3] not in textos and nome != 'manifesto.js':
                    os.remove(os.path.join(SAIDA, nome))
            for k, (texto, _) in textos.items():
                with open(os.path.join(SAIDA, k + '.js'), 'w', encoding='utf-8') as f:
                    f.write(texto)
            with open(os.path.join(SAIDA, 'manifesto.js'), 'w', encoding='utf-8') as f:
                f.write(manifesto)
            print('Gerado em jogos/curso/ (%d arquivos + manifesto.js)' % len(textos))
        else:
            print('Tudo certo (nada foi escrito).')
    return 1 if (erros and not a.parcial) else 0


def _sub(py, args, env_extra=None):
    env = dict(os.environ)
    env.update(env_extra or {})
    return subprocess.run(py + [os.path.join(HERE, 'build.py')] + args, capture_output=True, text=True, env=env)


def determinismo():
    saidas = []
    for seed in ('11', '29'):
        j = tempfile.mktemp(suffix='.json')
        p = _sub([sys.executable], ['-v', '--digest', '--tudo', '--json', j], {'PYTHONHASHSEED': seed})
        d = [l for l in p.stdout.splitlines() if l.startswith('DIGEST ')]
        saidas.append((seed, p.returncode, d[0] if d else None, j, p.stdout))
        if p.returncode != 0:
            print('semente %s: o gerador falhou:\n%s' % (seed, p.stdout[-3000:]))
    if any(s[2] is None for s in saidas):
        return 1
    if saidas[0][2] == saidas[1][2]:
        print('Determinismo OK: as duas execuções deram o mesmo resultado (%s)' % saidas[0][2][7:19])
        return 0
    print('DIFERENTE entre sementes de hash. Primeiras diferenças:')
    mostrar_diferencas(saidas[0][3], saidas[1][3])
    return 1


def mostrar_diferencas(j1, j2, limite=15):
    a = json.load(open(j1, encoding='utf-8'))
    b = json.load(open(j2, encoding='utf-8'))
    n = 0
    for ua, ub in zip(a, b):
        for la, lb in zip(ua['licoes'], ub['licoes']):
            for i, (xa, xb) in enumerate(zip(la['exercicios'], lb['exercicios']), 1):
                if xa != xb:
                    n += 1
                    if n <= limite:
                        print('  %s exercício %d:\n     A: %s\n     B: %s' % (la['id'], i, json.dumps(xa, ensure_ascii=False)[:300], json.dumps(xb, ensure_ascii=False)[:300]))
    if not n:
        print('  (a diferença está só no texto das introduções)')


def versoes():
    achados = []
    for v in ('3.11', '3.12', '3.13', '3.14'):
        exe = shutil.which('python' + v)
        if exe:
            achados.append((v, [exe]))
        elif shutil.which('uv'):
            p = subprocess.run(['uv', 'python', 'find', v], capture_output=True, text=True)
            if p.returncode == 0 and p.stdout.strip():
                achados.append((v, [p.stdout.strip()]))
    if not achados:
        print('Nenhum Python alternativo encontrado.')
        return 1
    ok_geral = True
    for v, py in achados:
        p = _sub(py, ['-v', '--tudo'])
        linhas = p.stdout.splitlines()
        erros = [l for l in linhas if l.startswith('  ') and ':' in l[:34]]
        if p.returncode == 0:
            print('Python %s: ✓ tudo igual' % v)
        else:
            ok_geral = False
            print('Python %s: ✗ %d diferença(s)/erro(s)' % (v, len(erros)))
            for l in erros[:40]:
                print('   ' + l.strip())
            if p.stderr.strip():
                print('   stderr: ' + p.stderr.strip()[-600:])
    return 0 if ok_geral else 1


if __name__ == '__main__':
    sys.exit(main())
