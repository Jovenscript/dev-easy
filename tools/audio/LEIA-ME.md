# Áudio gravado das fichas

Existem dois jeitos de gerar o áudio de `audio/<id>.mp3`. O guia toca qualquer um dos dois.

| | Voz | Onde roda | Custo |
|---|---|---|---|
| **A. Gemini** (novo) | voz do Google, entonação mais natural | no GitHub, por um botão | pago por uso (veja abaixo) |
| **B. Piper** (o que está no guia hoje) | voz aberta, mais "robótica" | no seu computador | grátis |

---

## A. Trocar para a voz do Gemini (você só clica em botões)

### O que é preciso, uma vez só
1. **Criar a chave do Google.** Entre em `aistudio.google.com/apikey` com sua conta Google, clique em criar chave e copie o texto. **A chave é uma senha**: não cole em arquivo do projeto nem em conversa. Se vazar, apague e crie outra.
2. **Guardar a chave no GitHub.** Repositório `dev-easy` → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**. Em *Name* escreva exatamente `GEMINI_API_KEY`; em *Secret* cole a chave → **Add secret**.

### Cada vez que for usar
Aba **Actions** → **Gerar áudio (Gemini)** → **Run workflow** → escolha o **modo** → **Run workflow** (botão verde). Acompanhe clicando na execução; no fim há um resumo.

Faça nesta ordem:

1. **`1-testar-chave`**: confere se a chave funciona e se a resposta do Google veio no formato esperado. Gasta centavos de centavo. **Se der erro, pare aqui** e mande o texto do erro para quem está te ajudando.
2. **`2-ouvir-vozes`**: gera o mesmo trecho em 6 vozes. Abra `https://jovenscript.github.io/dev-easy/audio-teste/` (espere 1 a 2 minutos depois do fim) e escolha a que você mais gostou. Repare em como ela fala "back-end".
3. **`3-fichas-de-teste`**: escreva o nome da voz escolhida em **voz** (exemplo: `Kore`). Gera 3 fichas inteiras (Back-end, Front-end e Bits) na mesma página de teste. **Não mexe no guia.** Serve para ouvir se a voz se mantém boa do começo ao fim.
4. **`4-gerar-todas`**: troca a voz de todas as fichas. Demora algumas horas (pode fechar a página) e salva de 20 em 20 fichas. Se a cota do Google acabar, ele para e, na próxima vez, **continua de onde parou**. Deixe **voz** vazio nas rodadas seguintes.
5. **`5-voltar-para-piper`**: desfaz tudo e devolve o áudio antigo. Funciona porque, antes de trocar o primeiro áudio, o gerador guarda uma marca do GitHub chamada `audio-piper-original`.

### Quanto custa (confira antes: `ai.google.dev/gemini-api/docs/pricing`)
- Preço visto em outubro de 2026: **US$ 9 por 1 milhão de tokens de áudio** no modelo `gemini-3.8-flash-tts` (o `...-lite-tts` custa US$ 6), e o Google avisou que **dobra em 1º/1/2027**. Áudio gasta 25 tokens por segundo.
- As 358 fichas têm cerca de 61 mil palavras, perto de 6 a 7 horas de áudio: **em torno de US$ 6** hoje (uns US$ 12 depois de 2027). É uma **estimativa minha**, não uma cobrança; o resumo de cada execução mostra a estimativa da rodada.
- Existe uma cota grátis, mas **não consegui ver os limites** (eles aparecem para o seu projeto em `aistudio.google.com/rate-limit`). Se for pequena, o modo 4 gera algumas fichas por dia e para; sem problema, ele continua depois. Se o limite grátis deste modelo for zero, o modo 1 avisa e será preciso **ativar o faturamento** (cartão) no Google AI Studio.
- **Regravar tudo de novo cobra de novo.** Só muda a conta se você trocar voz, estilo ou modelo (o gerador pede confirmação, caixa **trocar_voz**) ou editar o texto das fichas (aí só as fichas editadas são regravadas).
- Cada regravação completa deixa o repositório uns **150 MB maior** (o histórico guarda as versões antigas). Não faça isso à toa.

### Pronúncia (como a voz fala cada palavra)
O arquivo `tools/audio/pronuncias-gemini.json` diz como ler certas palavras. Hoje tem só três: `back-end` → "békêndi", `front-end` → "frôntêndi", `full-stack` → "fúl stéque". Para mudar, abra o arquivo no GitHub (lápis), edite ou acrescente uma linha `"palavra": "como falar",` (a última linha não leva vírgula) e rode o modo 4: só as fichas que têm a palavra são regravadas. Vale só para o Gemini.

Atenção: as outras palavras em inglês (framework, deploy, software...) seguem o texto que o guia já usava para as vozes antigas. Se alguma sair estranha, é só acrescentar aqui.

### O que NÃO foi verificado (leia)
- **Nunca rodou com o Google de verdade.** Quem montou isto (o Claude) não consegue acessar o Google do ambiente onde trabalha. O formato do pedido e da resposta vem da documentação oficial lida em 9/10/2026 e foi testado só contra um servidor de mentira que imita essa documentação. Por isso existe o modo 1. Se o Google tiver mudado algo, o erro aparece ali, antes de gastar.
- **Ninguém ouviu o resultado ainda.** Não dá para saber de antemão se a entonação ficou boa, se o sotaque sai brasileiro (a documentação lista só "Portuguese", sem dizer pt-BR) nem se "békêndi" soa como você quer. Só você, ouvindo as amostras.
- O gerador confere o ritmo (palavras por minuto) para descartar áudio cortado, mas isso **não pega** uma pronúncia ruim nem um corte pequeno.
- **A cota grátis e o preço podem mudar.** Os números acima são de 9/10/2026.
- Depois do envio, o site pode levar alguns minutos para mostrar o áudio novo; se não atualizar, aperte Ctrl+F5.
- O guia passa a ter áudio **sintético do Google**. Se você quiser avisar isso aos usuários, é só acrescentar uma frase na tela **Voz e áudio**.

### Se algo der errado
| O que aparece | O que fazer |
|---|---|
| "Falta a chave" | O Secret `GEMINI_API_KEY` não existe ou o nome está diferente (passo 2). |
| "A chave não foi aceita" | Crie outra chave e troque o Secret. |
| "Cota esgotada" | Espere (até o dia seguinte) e rode o modo 4 de novo: ele continua. |
| "…limite grátis deste modelo parece ser ZERO" | A conta gratuita não inclui este modelo. No Google AI Studio, ative o faturamento (Billing) do projeto da chave e rode de novo. |
| "a resposta veio sem áudio. Forma recebida: …" | O Google mudou o formato. Copie essa linha inteira para quem estiver te ajudando. |
| "O Google não devolveu áudio para: …" | Uma ficha específica foi recusada ou veio sem áudio; as outras seguem normalmente. Rode de novo; se for sempre a mesma, o texto dela pode estar sendo recusado (avise quem estiver te ajudando). |
| "Três fichas seguidas deram problema" | O gerador parou sozinho para não gastar à toa. Veja a mensagem de erro no registro da execução e rode o modo 1. |
| "Parei antes de gastar … outra configuração" | Você digitou uma voz diferente da que já está em uso. Deixe voz/estilo/modelo vazios, ou marque `trocar_voz` se quer mesmo trocar. |
| Deu certo mas o site continua igual | Espere 2 minutos e aperte Ctrl+F5. |

---

## B. Voz Piper (o que está no guia hoje)

Os arquivos `audio/<id>.mp3` (um por ficha, 358 + 1 de teste) foram gerados no computador, não no navegador:

- **Voz:** Piper `pt_BR-faber-medium` (dados de voz CC0), rodando com `sherpa-onnx`. Baixe o modelo `vits-piper-pt_BR-faber-medium.tar.bz2` na página de modelos TTS do projeto sherpa-onnx (GitHub, k2-fsa/sherpa-onnx, release `tts-models`) e extraia em `tools/audio/`.
- **Valores usados:** `--voz piper --speed 0.74 --pausa 1.4 --kbps 48`.
- **Programas:** Python 3 com `numpy` e `sherpa-onnx`, e `ffmpeg` (com libmp3lame).

### Quando mexer nisto
Só se você **mudar o texto de uma ficha**. O áudio vale para o texto de quando foi gravado; se o texto muda, o áudio antigo continua tocando o texto antigo até ser regravado.

### Passo a passo (na raiz do projeto)
```
node tools/audio/spoken-json.js                      # exporta o texto falado de cada ficha
python3 tools/audio/gerar.py --voz piper --speed 0.74 --pausa 1.4 --kbps 48 --ids dns,http
python3 tools/audio/audiomap.py audio js/18-audiomap.js --kbps 48
```
- `--ids` aceita uma lista (`dns,http`) ou `all`. Só o que mudou é regravado (cada MP3 tem um `.json` com a "impressão digital" do texto).
- `audiomap.py` refaz `js/18-audiomap.js`, a lista que diz ao app quais fichas têm áudio e quanto dura. Fichas com áudio desatualizado ficam de fora e o app usa a voz do aparelho nelas. Ele entende os dois geradores (Piper e Gemini).
- Sem rodar nada disto o guia funciona normalmente.
- **Depois que o Gemini assumir**, regravar uma ficha editada com o Piper misturaria duas vozes. Use o modo 4 do Gemini (campo **voz** vazio) para as fichas editadas.
