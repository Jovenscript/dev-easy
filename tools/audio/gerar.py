#!/usr/bin/env python3
"""Gera o áudio gravado (MP3) das fichas com vozes neurais abertas.
uso: python3 tools/audio/gerar.py --voz piper --speed 0.74 --pausa 1.4 --kbps 48 [--ids a,b,c|all] [--out audio] [--limit N]
(são exatamente esses valores que geraram os áudios que já estão em audio/; com os mesmos valores só o que mudou é regravado)
Reaproveita o que já foi gerado (mesmo texto + mesma voz + mesma velocidade)."""
import re, json, time, sys, os, hashlib, argparse, subprocess
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
NORM_V = 2

def norm_neural(t):
    t = re.sub(r'[“”"]', '', t)
    t = t.replace('’', "'").replace('…', '...')
    t = re.sub(r'\s*\(\s*', ', ', t)
    t = re.sub(r'\s*\)\s*', ', ', t)
    t = re.sub(r'\s+[-–—]\s+', ', ', t)
    t = t.replace('§', ' parágrafo ').replace('£', ' libra ').replace('&', ' e ').replace('/', ' barra ').replace('+', ' mais ')
    t = re.sub(r',\s*([.!?;:])', r'\1', t)
    t = re.sub(r',(\s*,)+', ',', t)
    t = re.sub(r'\s+', ' ', t).strip()
    t = re.sub(r'^[,;:\s]+', '', t)
    return t

def trim(x, sr, thr=0.004, keep_ms=35):
    a = np.abs(x)
    idx = np.where(a > thr)[0]
    if len(idx) == 0: return x[:int(sr * 0.05)]
    k = int(sr * keep_ms / 1000)
    return x[max(0, idx[0] - k): min(len(x), idx[-1] + k)]

def fade(x, sr, ms=8):
    n = min(len(x) // 2, int(sr * ms / 1000))
    if n > 0:
        r = np.linspace(0, 1, n, dtype=np.float32); x = x.copy(); x[:n] *= r; x[-n:] *= r[::-1]
    return x

def loud(x, alvo_db=-20.0, pico=0.89):
    v = x[np.abs(x) > 0.01]
    if len(v) < 100: return x
    rms = float(np.sqrt(np.mean(v ** 2)))
    g = (10 ** (alvo_db / 20)) / max(rms, 1e-6)
    y = x * g
    p = float(np.max(np.abs(y)))
    if p > pico: y = y * (pico / p)
    return y.astype(np.float32)

class Kok:
    def __init__(self, voice, speed):
        from kokoro_onnx import Kokoro
        self.k = Kokoro(os.path.join(HERE, 'kokoro-v1.0.onnx'), os.path.join(HERE, 'voices-v1.0.bin'))
        self.voice, self.speed, self.sr = voice, speed, 24000
    def say(self, t):
        a, sr = self.k.create(t, voice=self.voice, speed=self.speed, lang='pt-br'); self.sr = sr
        return a.astype(np.float32)

class Pip:
    def __init__(self, speed):
        import sherpa_onnx
        d = os.path.join(HERE, 'vits-piper-pt_BR-faber-medium')
        cfg = sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(vits=sherpa_onnx.OfflineTtsVitsModelConfig(
            model=os.path.join(d, 'pt_BR-faber-medium.onnx'), tokens=os.path.join(d, 'tokens.txt'), data_dir=os.path.join(d, 'espeak-ng-data')),
            num_threads=2, provider='cpu'), max_num_sentences=1)
        self.t = sherpa_onnx.OfflineTts(cfg); self.speed = speed; self.sr = self.t.sample_rate
    def say(self, t):
        a = self.t.generate(t, sid=0, speed=self.speed); self.sr = a.sample_rate
        return np.array(a.samples, dtype=np.float32)

def render(eng, segs, pausa=1.0):
    out = []; sr = None; fala = 0.0
    for s in segs:
        t = norm_neural(s['t'])
        if not t: continue
        a = fade(trim(eng.say(t), eng.sr), eng.sr); sr = eng.sr
        fala += len(a) / sr
        out.append(a); out.append(np.zeros(int(sr * s['p'] * pausa / 1000), dtype=np.float32))
    x = np.concatenate(out)
    return loud(x), sr, fala

def mp3(x, sr, path, kbps):
    pcm = (np.clip(x, -1, 1) * 32767).astype('<i2').tobytes()
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 's16le', '-ar', str(sr), '-ac', '1', '-i', '-', '-c:a', 'libmp3lame', '-b:a', f'{kbps}k', '-ar', '24000', '-id3v2_version', '0', '-write_xing', '1', path], input=pcm, check=True)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--voz', default='piper'); ap.add_argument('--speed', type=float, default=None)
    ap.add_argument('--ids', default='all'); ap.add_argument('--out', default=os.path.join(HERE, '..', '..', 'audio'))
    ap.add_argument('--pausa', type=float, default=1.0); ap.add_argument('--kbps', type=int, default=48); ap.add_argument('--limit', type=int, default=0)
    ap.add_argument('--json', default=os.path.join(HERE, 'spoken.json'))
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    d = json.load(open(a.json))
    teste = {'id': '_teste', 'segs': [{'t': 'Esta é a voz natural do guia. Se ela soar bem para você, pode deixar assim.', 'p': 0}]}
    todos = [teste] + d
    if a.ids != 'all':
        want = set(a.ids.split(',')); todos = [e for e in todos if e['id'] in want]
    if a.limit: todos = todos[:a.limit]
    if a.voz == 'piper': speed = a.speed or 0.85; mk = lambda: Pip(speed)
    elif a.voz == 'dora': speed = a.speed or 0.9; mk = lambda: Kok('pf_dora', speed)
    elif a.voz == 'alex': speed = a.speed or 0.9; mk = lambda: Kok('pm_alex', speed)
    else: sys.exit('voz desconhecida')
    eng = mk(); t0 = time.time(); feitos = pulados = 0; falados = 0.0
    for i, e in enumerate(todos):
        h = hashlib.sha1((a.voz + str(speed) + str(a.kbps) + str(a.pausa) + str(NORM_V) + json.dumps(e['segs'], ensure_ascii=False)).encode()).hexdigest()[:16]
        f = os.path.join(a.out, e['id'] + '.mp3'); meta = os.path.join(a.out, e['id'] + '.json')
        if os.path.exists(f) and os.path.exists(meta) and json.load(open(meta)).get('h') == h: pulados += 1; continue
        x, sr, fala = render(eng, e['segs'], a.pausa); mp3(x, sr, f, a.kbps)
        dur = len(x) / sr; palavras = sum(len(s['t'].split()) for s in e['segs'])
        json.dump({'h': h, 'dur': round(dur, 2), 'bytes': os.path.getsize(f), 'voz': a.voz, 'speed': speed, 'wpm': round(palavras / (fala / 60), 1), 'wpm_tot': round(palavras / (dur / 60), 1), 'pausa': a.pausa}, open(meta, 'w'))
        feitos += 1; falados += dur
        if feitos % 10 == 0 or i == len(todos) - 1:
            dt = time.time() - t0
            print(f'[{i+1}/{len(todos)}] feitos {feitos}, pulados {pulados}, {falados/60:.1f} min de áudio em {dt/60:.1f} min', flush=True)
    print('fim:', feitos, 'gerados,', pulados, 'reaproveitados')
if __name__ == '__main__': main()
