# Como o áudio gravado foi feito

Os arquivos `audio/<id>.mp3` (um por ficha, 358 + 1 de teste) foram gerados no computador, não no navegador:

- **Voz:** Piper `pt_BR-faber-medium` (dados de voz CC0), rodando com `sherpa-onnx`. Baixe o modelo `vits-piper-pt_BR-faber-medium.tar.bz2` na página de modelos TTS do projeto sherpa-onnx (GitHub, k2-fsa/sherpa-onnx, release `tts-models`) e extraia em `tools/audio/`.
- **Valores usados:** `--voz piper --speed 0.74 --pausa 1.4 --kbps 48`.
- **Programas:** Python 3 com `numpy` e `sherpa-onnx`, e `ffmpeg` (com libmp3lame).

## Quando mexer nisto
Só se você **mudar o texto de uma ficha**. O áudio vale para o texto de quando foi gravado; se o texto muda, o áudio antigo continua tocando o texto antigo até ser regravado.

## Passo a passo (na raiz do projeto)
```
node tools/audio/spoken-json.js                      # exporta o texto falado de cada ficha
python3 tools/audio/gerar.py --voz piper --speed 0.74 --pausa 1.4 --kbps 48 --ids dns,http
python3 tools/audio/audiomap.py audio js/18-audiomap.js --kbps 48
```
- `--ids` aceita uma lista (`dns,http`) ou `all`. Só o que mudou é regravado (cada MP3 tem um `.json` com a "impressão digital" do texto).
- `audiomap.py` refaz `js/18-audiomap.js`, a lista que diz ao app quais fichas têm áudio e quanto dura. Fichas com áudio desatualizado ficam de fora e o app usa a voz do aparelho nelas.
- Sem rodar nada disto o guia funciona normalmente.
