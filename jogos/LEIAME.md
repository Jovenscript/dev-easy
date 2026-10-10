# ENIAC (curso de Python em jogo)

O ENIAC é **parte do DEV EASY**: mesma barra lateral, mesmo tema, mesmo login e mesma nuvem.

- Trilha: `#/jogos` (menu **Praticar → ENIAC** e cartão no painel). Lição: `#/jogo/u01l01` (o id é `uNNlMM`).
- `jogos/index.html` só **redireciona** para `#/jogos`, para links e atalhos antigos continuarem funcionando.
- Depois da primeira visita funciona **sem internet**: o motor e a lista de lições ficam pré-guardados, e cada unidade fica guardada na primeira vez que abre.

## De onde vem o curso
`jogos/curso/*.js` é **gerado**. Não edite à mão: a próxima geração apaga a mudança.

1. Escreva ou ajuste a unidade em `tools/curso/src/uNN-nome.py` (guia completo: `tools/curso/GUIA-AUTORES.md`).
2. Rode `python3 tools/curso/build.py`. Ele roda o Python de verdade em cada exercício, confere tudo e só então escreve `manifesto.js` e `uNN.js`. Se houver erro, não escreve nada. Com `-u u03` só confere a unidade; com `-a` mostra os avisos.
3. Suba `jogos/curso/` junto. Para ver o curso novo basta recarregar a página.

## Como o motor funciona
Os arquivos carregam em ordem alfabética. Depois de criar ou apagar um `js/*.js`, rode `node tools/mkindex.js` (ele também atualiza a lista do modo offline em `sw.js`).

| Arquivo | O que faz |
|---|---|
| `js/30-jogo-1-base.js` | Recebe o curso (`ENIAC.manifesto`, `ENIAC.unidade`), carrega as unidades sob demanda, realce de código. |
| `js/30-jogo-2-estado.js` | Progresso, XP, nível, sequência, estrelas, conquistas, desbloqueio e migração. |
| `js/30-jogo-3-robo.js` | `ENIAC.robo(estado, tamanho)`: o robô em SVG (normal, feliz, errou, pensando, comemorando). |
| `js/30-jogo-4-tipos.js` | Os 6 tipos de exercício: quiz, digite, bug, monte, lacuna e pares (sem arrastar). |
| `js/30-jogo-5-janela.js` | Janelas (sair, sem vidas, conquistas, ajustes) e confete. |
| `js/30-jogo-6-licao.js` | A lição: mini-aula, exercícios, feedback e resultado. |
| `js/30-jogo-7-trilha.js` | A trilha: unidades, caminho de bolinhas, conquistas, ajustes, cartão do painel. |
| `js/30-jogo-8-rotas.js` | Liga tudo ao roteador, ao menu e ao painel. |
| `css/jogo.css` | Visual, com os mesmos tokens de cor do resto do app. |

## Regras do jogo
- 5 vidas por lição. Errar tira 1 vida e o exercício **volta no fim da fila**. Sem vidas: a lição recomeça.
- XP: 10 por exercício certo de primeira, 5 se já tinha errado nele. O XP só entra no total quando a lição **termina**.
- Estrelas: 3 sem nenhum erro (anel dourado), 2 com até 2 erros, 1 com mais.
- Nível: chegar ao nível N pede `50 × N × (N − 1)` XP no total (100, 300, 600...).
- Sequência: dias seguidos com pelo menos 1 lição concluída.
- Cada lição só abre depois da anterior. Em **Ajustes** (na trilha) há "Liberar todas as lições".

## Onde fica o progresso
No `STORE` do app, no grupo `jogo`, pelo mesmo caminho de nuvem e backup das fichas (`js/19-store.js`, `js/27-sync.js`). Um registro por lição (`l-<id>`), por dia (`d-AAAAMMDD`) e por conquista (`c-<id>`), mais `cfg` e `xp0`. XP e sequência são **calculados** desses registros, não guardados: dois aparelhos que jogam sem internet se juntam sem perder nada.

Migração: na primeira abertura, se o grupo `jogo` estiver vazio e existir `localStorage['codivara:progresso:v1']` (versão antiga do jogo), as lições `l1` a `l4` viram `u01l01` a `u01l04`. Acontece uma vez só.

## Como testar
```
node tools/curso/teste-jogo.js            tudo (leva uns 4 minutos); o mesmo: npm run teste:jogo
node tools/curso/teste-jogo.js --ajuda    todas as opções
```
Precisa de Node 18+ e Playwright com Chromium (`npm i -D playwright` e `npx playwright install chromium`). O axe-core é opcional (`AXE_JS=caminho/axe.min.js`).

O teste sobe o próprio servidor, **joga todas as lições** usando o gabarito, e confere erros, teclado, rotas, ajustes, migração, offline e acessibilidade, em celular (390×844 e 360×640) e desktop (1280×800), com **zero erros no console**. Sai com código 1 se algo falhar. `--fotos PASTA` salva as capturas de tela.

**Não foi testado:** iPhone/Safari, Firefox e Android de verdade, leitor de tela real, sincronização com a nuvem (Firebase) e áudio. O tema claro e o automático só foram vistos no Chromium.
