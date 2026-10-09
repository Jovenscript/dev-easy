#!/usr/bin/env python3
"""Lê audio/*.json (um por MP3 pronto) e escreve js/18-audiomap.js com a duração e o tamanho de cada áudio.
Só entram áudios que batem com o texto ATUAL das fichas (hash do gerador): áudio desatualizado fica de fora e o app usa a voz do aparelho.
Vale para os dois geradores: gerar.py (Piper, vozes abertas) e gemini.py (cada JSON diz qual gerou: campo "motor").
uso (na raiz do projeto): python3 tools/audio/audiomap.py audio js/18-audiomap.js --kbps 48 --spoken tools/audio/spoken.json"""
import json, os, sys, glob, hashlib, argparse
ap = argparse.ArgumentParser()
ap.add_argument('pasta'); ap.add_argument('saida'); ap.add_argument('--so', default=None)
ap.add_argument('--spoken', default=None); ap.add_argument('--kbps', type=int, default=48)
a = ap.parse_args()
AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
import gerar
spoken = {e['id']: e for e in json.load(open(a.spoken or os.path.join(AQUI, 'spoken.json'), encoding='utf8'))}
so = set(a.so.split(',')) if a.so else None
m = {}; voz = set(); velhos = []; orfaos = []
for f in sorted(glob.glob(os.path.join(a.pasta, '*.json'))):
    id_ = os.path.basename(f)[:-5]
    mp3 = os.path.join(a.pasta, id_ + '.mp3')
    if not os.path.exists(mp3): continue
    if so is not None and id_ not in so and id_ != '_teste': continue
    j = json.load(open(f))
    if id_ != '_teste':
        e = spoken.get(id_)
        if not e: orfaos.append(id_); continue
        if j.get('motor') == 'gemini':
            import gemini
            h = gemini.hash_ficha(j.get('modelo', ''), j.get('voz_gemini', ''), j.get('estilo', ''), e['segs'])
        else:
            h = hashlib.sha1((j['voz'] + str(j['speed']) + str(a.kbps) + str(j.get('pausa', 1.0)) + str(gerar.NORM_V) + json.dumps(e['segs'], ensure_ascii=False)).encode()).hexdigest()[:16]
        if h != j.get('h'): velhos.append(id_); continue
    m[id_] = [round(j['dur']), os.path.getsize(mp3)]; voz.add(j.get('motor') or j.get('voz', '?'))
js = 'var AUDIOMAP=' + json.dumps(m, separators=(',', ':'), ensure_ascii=False) + ';\n'
open(a.saida, 'w', encoding='utf8').write(js)
tot = sum(v[1] for v in m.values()) / 1e6; dur = sum(v[0] for v in m.values()) / 3600
print(len(m), 'áudios;', round(tot, 1), 'MB;', round(dur, 2), 'h; vozes:', ','.join(sorted(voz)))
if velhos: print('DESATUALIZADOS (texto mudou; ficam de fora):', ','.join(velhos))
if orfaos: print('SEM FICHA (ficam de fora):', ','.join(orfaos))
