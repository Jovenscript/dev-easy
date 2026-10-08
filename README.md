# DEV EASY

Guia de tecnologias em linguagem simples: **358 fichas em 9 áreas**, 79 demonstrações para mexer, voz que lê para você, anotações, marcadores de "onde parei" e sincronização opcional entre aparelhos.

Site publicado: `https://jovenscript.github.io/dev-easy/` (depois de ligar o GitHub Pages, veja abaixo).

## Rodar no VS Code
1. Abra a pasta do projeto no VS Code.
2. Instale a extensão **Live Server** (o VS Code já sugere).
3. Clique em **Go Live** (canto inferior direito). O guia abre em `http://localhost:5500`.

Alternativa, se tiver o Node instalado: no terminal do VS Code, `npm start`.

> Use sempre `localhost`, não `127.0.0.1`: o login do Google só aceita `localhost`. O arquivo `.vscode/settings.json` já deixa o Live Server assim.
> Não abra o `index.html` com duplo clique: o áudio e o login não funcionam por `file://`.

## Publicar no GitHub Pages
1. No GitHub: repositório **dev-easy** → **Settings** → **Pages**.
2. Em *Build and deployment*: **Deploy from a branch**, branch **main**, pasta **/ (root)** → **Save**.
3. Espere 1 a 2 minutos. O endereço é `https://jovenscript.github.io/dev-easy/`.

Cada `git push` na branch `main` atualiza o site.

## Ligar a nuvem (Firebase) — 4 passos, uma vez só
Projeto: `dev-easy-2e226`. A configuração já está em `firebase-config.js`.

1. **Authentication** → *Get started* → *Sign-in method* → **Google** → Ativar → escolha seu e-mail de suporte → Salvar.
2. **Authentication** → *Settings* → *Authorized domains* → **Add domain** → `jovenscript.github.io`. (`localhost` já vem liberado.)
3. **Firestore Database** → *Create database* → local **southamerica-east1 (São Paulo)** → **Production mode** → Criar.
4. **Firestore** → aba **Rules** → apague tudo, cole o conteúdo de `firestore.rules` → **Publish**.

Depois: abra o guia → **Conta e nuvem** → **Entrar com Google**. Entre com a mesma conta em casa e no trabalho.

- Sem esses passos o guia funciona igual, só que salva apenas no aparelho.
- A `apiKey` do Firebase **não é senha**: ela só identifica o projeto. Quem protege seus dados são o login e as regras do passo 4 (cada pessoa só lê e grava em `users/<seu id>`). Se quiser reforçar, no Google Cloud Console → *Credenciais* → sua chave → *Restrições de aplicativo* → *Sites* → `https://jovenscript.github.io/*` e `http://localhost:5500/*`.
- Para permitir **só o seu e-mail**, troque a regra por `request.auth.token.email == 'SEU_EMAIL_AQUI'` (não escreva o e-mail em arquivo público; cole direto no console do Firebase).

## Como usar
- **Já entendi / Favoritar**: marcam o seu progresso.
- **Anotar**: caixa "Minhas anotações" no fim de cada ficha, salva sozinha. Todas ficam em **Anotações** (com busca, baixar `.md` e copiar tudo).
- **Marcar onde parei**: botão no topo da ficha, botão flutuante **Marcar aqui** (aparece quando você rola) e botão no player de áudio. Guarda a parte da ficha e, se estiver ouvindo, o segundo do áudio. Fica em **Marcadores**, onde dá para renomear, apagar (com Desfazer) e **ouvir a partir dali**.
- **Continuar de onde parei**: automático. O painel mostra a última ficha e o ponto exato.
- **Voz e áudio**: voz gravada (as 358 fichas) ou a voz do aparelho. Velocidade e pausa ajustáveis.
- **Tema**: escuro, claro ou automático (menu lateral).
- **Backup**: em **Conta e nuvem** dá para baixar e restaurar um arquivo com tudo que é seu.
- **Instalar como app**: em **Conta e nuvem** (ou pelo menu do navegador). Depois da primeira visita o guia abre sem internet; o áudio gravado precisa de internet, e sem ela o app usa a voz do aparelho.
- Atalho: tecla `/` abre a busca.

## Como o projeto é organizado
| Pasta/arquivo | O que tem |
|---|---|
| `index.html` | A página única. A lista de scripts é gerada, não edite à mão. |
| `js/4x` a `js/7x` | As fichas, por área. Cada arquivo é um pedaço do catálogo. |
| `js/10` a `js/17` | As demonstrações (widgets e quadros). |
| `js/19` a `js/27` | O app: guardar dados, voz, telas, painel, anotações, conta, nuvem. |
| `css/` e `fonts/` | Visual e fontes (as fontes ficam no projeto, nada vem do Google Fonts). |
| `audio/` | Um MP3 por ficha + um `.json` com a "impressão digital" do texto. |
| `firebase-config.js`, `firestore.rules` | Nuvem. |
| `sw.js`, `manifest.webmanifest`, `icons/` | App instalável e modo sem internet. |
| `tools/` | Servidor local, gerador de índice, ferramentas de áudio. |

**Depois de criar, apagar ou renomear um arquivo em `js/`**, rode `node tools/mkindex.js` (ou `npm run indice`): ele atualiza o `index.html` e a lista do modo offline. Os arquivos são carregados em ordem alfabética do nome.

**Se mudar o texto de uma ficha**, o áudio dela fica desatualizado. Veja `tools/audio/LEIA-ME.md`.

## Limites que você deve saber
- Os dados do guia e das anotações ficam **no navegador de cada aparelho** até você entrar com o Google. Limpar os dados do site apaga tudo que não estiver na nuvem ou em backup.
- Se duas pessoas/aparelhos mudarem a **mesma** anotação, vale a edição mais recente (a outra é substituída). Aparelhos com relógio muito errado podem confundir isso.
- O login com Google precisa de internet e de pop-ups liberados. Em redes de empresa que bloqueiam o Google, a nuvem não conecta (o guia segue funcionando no aparelho).
- Catálogo não é uma lista completa de tecnologias: é um mapa para começar.

## Créditos e licenças
- Voz gravada: Piper `pt_BR-faber-medium` (dados CC0), via sherpa-onnx.
- Fontes: Barlow Condensed e IBM Plex (licença SIL OFL, textos em `fonts/LICENSE-*.txt`).
- Nuvem: Firebase (Google).
