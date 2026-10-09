# Jogos (Codivara)

Lições de Python em forma de jogo: 4 lições, 24 exercícios, 5 tipos de jogo. Tudo em **um arquivo só**: `jogos/index.html`.

- Endereço: `https://jovenscript.github.io/dev-easy/jogos/`. Também pelo menu do DEV EASY (**Praticar → Jogos**) e pelo cartão no topo do painel.
- Depois da primeira visita funciona sem internet (o modo offline do DEV EASY guarda a página).
- O progresso do jogo (XP, sequência, lições feitas) fica **neste navegador** e é **separado** do progresso das fichas. Não vai para a nuvem.
- O nome **Codivara** e o mascote **Capi** são provisórios (`APP.nome` e `APP.mascote`, no começo do código).

## Adicionar uma lição (pelo GitHub, no navegador)
1. No GitHub, abra `jogos/index.html` e clique no lápis (**Edit this file**). Melhor no computador do que no celular.
2. Clique dentro do texto, aperte **Ctrl+F** e procure: `COLE A PRÓXIMA LIÇÃO AQUI`.
3. Cole o bloco abaixo **na linha de cima** dessa frase. Todo bloco termina com `},` (chave e vírgula).
4. Troque o `id` por um que ainda não existe (`l6`, `l7`...) e os textos.
5. **Commit changes**. Em 1 a 2 minutos o site atualiza (se não mudar, aperte Ctrl+F5).

```js
        {
          id: "l5",
          titulo: "Minha lição",
          resumo: "Frase curta que aparece na trilha",
          intro: {
            paragrafos: ["Explique o assunto em frases curtas.", "Use `crases` para destacar código."],
            exemplo: { codigo: "print(2 + 3)", saida: "5" }
          },
          exercicios: [
            {
              tipo: "quiz",
              enunciado: "O que este código mostra na tela?",
              codigo: "print(2 + 3)",
              opcoes: ["5", "23", "2 + 3", "Erro"],
              explicacao: "Sem aspas, o Python faz a conta: 2 + 3 = 5."
            }
          ]
        },
```

Campos de cada tipo (copie um exemplo pronto da **Lição 1**, ela tem um de cada):
- `quiz`: `enunciado`, `codigo`, `opcoes` (**a primeira é a certa**; o site embaralha), `explicacao`.
- `bug`: `enunciado`, `linhas`, `linhaErrada` (a linha que o Python aponta, começando em 1), `opcoes` (3; **a primeira é a correção certa**), `erro`, `porque`, `explicacao`.
- `monte`: `enunciado`, `saida`, `linhas` (**na ordem certa**; o site embaralha), `explicacao`.
- `lacuna`: `enunciado`, `codigo` com `{1}`, `{2}`..., `banco` (palavras), `respostas` (na ordem dos buracos), `saida`, `explicacao`.
- `pares`: `enunciado`, `pares` (`["esquerda", "direita"]`), `explicacao`.
- Se o código usa `input()`, acrescente `entrada: ["o que a pessoa digita"]` (só serve para a conferência).

**Regra de ouro:** cada exercício precisa ter **uma única resposta certa**.

## Se errar
- Se faltar vírgula, aspas ou um campo, o site **não fica em branco**: mostra uma caixa com o que corrigir ("Tem algo para corrigir nas lições" ou "O site não conseguiu abrir").
- Essa conferência só pega campo faltando e erro de digitação. **Ela não confere se o Python do exercício está certo.**
- Para voltar atrás: no GitHub, abra o arquivo, clique em **History**, abra a versão anterior e copie de volta.
- O zip do projeto (`codivara-projeto.zip`, que o Claude entregou) tem um verificador que roda cada exercício no Python de verdade e testa todas as ordens/combinações. Precisa de Python e Node no computador.

## O que não foi verificado
- Testado só no Chromium automatizado (Chrome/Edge). Não foi testado em iPhone/Safari, Firefox nem Android de verdade, nem com leitor de tela real.
- O código que o aluno digita não é executado (não há campo de digitar código): as respostas são conferidas contra as escritas na lição.
- A sequência diária depende do relógio do aparelho. O botão "voltar" do navegador sai do jogo.
- A mensagem de erro do Python mostrada é a das versões 3.11 a 3.13.
