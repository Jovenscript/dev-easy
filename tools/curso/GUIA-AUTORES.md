# Guia de autores — curso de Python do ENIAC

Quem lê: quem for escrever ou editar unidades do curso (pessoa ou agente).
O curso aparece no DEV EASY como o jogo **ENIAC**. Você escreve em Python (uma linguagem de autoria pequena, `tools/curso/dsl.py`) e o gerador **roda o Python de verdade** para conferir cada resposta, cada erro e cada linha antes de gerar o jogo. Se algo não bate, a lição não sai.

## 1. Para quem é

- Marlon, técnico de manutenção industrial, autodidata, **zero experiência em programação** (assuma zero).
- Estuda **no celular**, em sessões de 5 a 10 minutos. Texto curto, código curto.
- Gosta de analogias com máquinas (motor, sensor, CLP, painel, ordem de serviço, rpm, torque). Use quando ajudar a entender, nunca à força. No máximo uns 30% dos exemplos podem ser industriais; o resto é cotidiano (dinheiro, nomes, jogos, textos). Não exija conhecimento de elétrica para entender o exemplo.
- Não cite o mascote nem o jogo nos textos. Fale do "Python" e do "programa".

## 2. Estrutura

Curso → **unidades** (`u01`…`u16`) → **lições** (`u03l05`) → texto de abertura + **8 a 12 exercícios** (o ideal é 10).
Cada unidade é **um arquivo**: `tools/curso/src/uNN-nome.py`. O modelo é `u01-primeiros-passos.py` (leia antes de escrever).

```python
from dsl import *

L01 = LICAO('u03l01', 'Comparações', 'Comparar valores e obter True ou False',
    INTRO([ 'parágrafo.', 'parágrafo.' ], [ EXEMPLO(C('''
        print(5 > 3)
        ''')) ]),
    [ QUIZ(...), DIGITE(...), BUG(...), ... ])      # 8 a 12 exercícios

UNIDADE('u03', 'Decisões', 'Fazer o programa escolher o que fazer.', [L01, L02, ...])
```

Regras de nomes: id da lição `uNNlMM` (dois dígitos), numeradas **em ordem, sem pular**. A unidade tem de 4 a 16 lições.

## 3. Comandos (sempre com `-u`)

```
python3 tools/curso/build.py -u u03 -a --lista     # confere a unidade, mostra avisos e a lista de lições
python3 tools/curso/build.py -u u03,u04 --tudo     # várias unidades, todos os erros
```
Sem `-u` o gerador escreve arquivos em `jogos/`: **não rode sem `-u`**. Não use git.
**Escreva em blocos pequenos: 1 ou 2 lições por vez** (Edit/Write curto) e rode o gerador em seguida. Um arquivo enorme escrito de uma vez pode se perder se algo interromper o trabalho.
Rode a cada lição que terminar, não só no fim. A saída diz `arquivo:linha mensagem`.
O objetivo: **zero erros** e avisos revisados (um aviso só se você tiver motivo).

**Regra de honestidade:** quando o gerador diz "previsto X, mas o Python mostra Y", o seu entendimento ou o exercício está errado. Descubra por quê e conserte o exercício **e a explicação**. Nunca copie o resultado só para o aviso sumir sem entender.

## 4. Referência da linguagem de autoria

Ajudantes: `C('''código''')` tira a indentação comum; `L('''linhas''')` devolve a lista de linhas. **Código com barra invertida** (`\n`, `\t`) precisa de string crua: `C(r'''print("a\nb")''')`. Se o código tem `'''`, use `"""` por fora.
Números e saídas são sempre **texto**: `'13'`, não `13`.

### QUIZ — o que o código mostra?
```python
QUIZ(C('''
    x = 3
    print(x * 2)
    '''), '6', ['9', '32', 'Erro'],
    explicacao='`x * 2` é 3 vezes 2.')
```
`certa` = o que o Python realmente imprime (só os `print`). `erradas`: 2 ou 3 respostas plausíveis. Saída com várias linhas: `'a\nb'`. Com `input()`, passe `entrada=['4']`. Parâmetro `enunciado=` troca a pergunta (até 170 letras).

### ERRO — que erro acontece?
```python
ERRO(C('''
    print(nome)
    '''), 'NameError', ['TypeError', 'SyntaxError', 'ValueError'],
    explicacao='...')
```
Opções são nomes de erros do Python. **Não ponha um "pai" do erro como errada** (Exception, ArithmeticError, LookupError...): o gerador recusa.

### CONCEITO — pergunta de ideia (nada é executado)
```python
CONCEITO('O que o `=` faz?', 'Guarda um valor num nome', ['Compara dois valores', 'Mostra na tela'],
    explicacao='...', teste=None)
```
Aceita 1 a 3 erradas (com 1 errada serve para Verdadeiro/Falso). **Use pouco**: o gerador não consegue conferir. Sempre que der, passe `teste=lambda opcao: ...` que aprove **só** a opção certa (exemplo no u01, lição 3). No máximo 3 de 10 exercícios da lição podem ficar sem conferência (CONCEITO sem `teste` + PARES sem `verif`).

### DIGITE — a pessoa digita a saída
```python
DIGITE(C('''
    print(10 // 3)
    '''), '3', explicacao='...')
```
A resposta é **uma linha**, até 40 letras, sem espaço nas pontas. Outras grafias que valem: `aceitas=['3.0']`. Dica opcional: `dica='um número'`. Bom para saídas curtas. Não use quando houver mais de uma linha de saída.

### BUG — caça ao bug
```python
BUG(L('''
    nome = "Bia"
    idade = 20
    print(Nome)
    print(idade)
    '''), 3, 'print(nome)', ['print("nome")', 'print(NOME)'],
    erro="NameError: name 'Nome' is not defined",
    porque='...causa do erro...', explicacao='...a correção...')
```
3 a 8 linhas (até 56 letras cada). `linha` (1 = primeira) é a linha **onde o Python aponta o erro**. `correcao` é a linha certa; `erradas` são 2 correções erradas. O gerador confere: o erro e a linha reais, que a correção funciona e que as erradas **não** resolvem. Só serve para erros que o Python aponta (SyntaxError, NameError, TypeError...). Para erro de lógica (sem mensagem), use QUIZ/DIGITE. Dica: deixe o gerador mostrar a mensagem exata ("previsto ... mas o Python mostra ..."), confira se faz sentido e use.

### MONTE — monte o código
```python
MONTE(L('''
    paes = int(input("Quantos pães? "))
    total = paes * 2
    print(total)
    '''), 'Quantos pães? 5\n10', entrada=['5'], explicacao='...')
```
`linhas` na ordem **certa** (o jogo embaralha). 3 a 7 linhas, até 44 letras. `saida` é a saída **como num terminal** (inclui a pergunta do `input` e o que foi digitado). O recuo faz parte da linha (dá para montar `if`/`for`/`def`). O gerador testa **todas** as ordens e exige que **só uma** funcione: cada linha precisa depender da anterior (duas linhas que podem trocar de lugar = erro).

### LACUNA — complete o código
```python
LACUNA(C('''
    cidade = {1}("Sua cidade? ")
    print("Moro em " {2} cidade)
    '''), ['input', '+'], ['print', '*'], 'Sua cidade? Recife\nMoro em Recife', entrada=['Recife'])
```
Buracos `{1}`, `{2}`… (1 a 4). `respostas` na ordem dos buracos, `extras` = palavras erradas (pelo menos 2; banco de até 8, cada palavra até 22 letras, cada uma serve uma vez). `saida` como num terminal. O gerador testa **todas** as combinações e exige que **só uma** funcione.

### PARES — ligue os pares
```python
PARES([('8 - 3', '5'), ('4 * 3', '12'), ('20 / 4', '5.0')], 'avalia', dir_codigo=True)
```
3 a 6 pares, até 40 letras por item, sem repetir item na mesma coluna. `verif` confere cada par: `'saida'` (esquerda é um código, direita é o que ele mostra) · `'avalia'` (direita = o que `print(esquerda)` mostra) · `'repr'` · `'tipo'` (direita começa com o nome do tipo) · **uma função** `f(esq, dir) -> bool` (ver `_nome_ok` no u01) · `None` (sem conferência; evite). `esq_codigo` / `dir_codigo` dizem se a coluna aparece em fonte de código.

### EXEMPLO e INTRO — abertura da lição
```python
INTRO(['parágrafo 1.', 'parágrafo 2.'], [EXEMPLO(C('''...''')), EXEMPLO(codigo2, nota='...')],
      lista=['item', 'item'], depois=['parágrafo depois da lista.'])
```
2 a 8 parágrafos no total (até 420 letras cada) e 1 a 3 exemplos. A saída do exemplo é **calculada** rodando o código. `EXEMPLO(..., erro=True)` mostra um erro de propósito. `lista` e `depois` são opcionais.

### Texto: crase e negrito
Em todos os textos: `` `código` `` entre crases, `**negrito**` com dois asteriscos (use para o termo novo na primeira vez). Crases e `**` precisam ter par. **Nunca escreva `**` (potência) fora de crases**: a potência sempre vai dentro de `código`, como `` `4 ** 2` ``. Não use outro tipo de formatação.

## 5. O que cada unidade libera (o gerador recusa o que ainda não foi ensinado)

| Unidade | Passa a poder usar |
|---|---|
| 1 | `print`, `input`, variáveis, int/float/str/bool, `+ - * / // % **`, `type`, `int() float() str()`, `abs round`, comentários, `\n` |
| 2 | `len`, índices e fatias `[ ]`, f-strings, métodos de texto (`upper lower strip replace split join find count startswith`…), `in` em textos, `chr ord repr format` |
| 3 | comparações, `if/elif/else`, `and or not`, `in`, `x if c else y`, `match`, `pass` |
| 4 | `while`, `for`, `range`, `break`, `continue` |
| 5 | listas, métodos de lista (`append insert remove pop sort`…), `list()`, `enumerate sum min max sorted reversed`, compreensão de lista, `del` |
| 6 | tuplas, `set frozenset tuple divmod`, conjuntos e seus métodos, desempacotamento (`a, b = b, a`) |
| 7 | dicionários, métodos (`get keys values items setdefault`…), `dict()`, compreensão de dict/set |
| 8 | `def`, `return`, `lambda`, `global/nonlocal`, `*args **kwargs`, `callable` |
| 9 | `try/except/else/finally`, `raise`, `assert` |
| 10 | `open()`, `with` |
| 11 | `import`, `from … import` (e a biblioteca padrão) |
| 12 | `zip map filter any all iter next`, expressão geradora, `yield` |
| 13 | `class`, `isinstance getattr setattr hasattr super property staticmethod classmethod`, decoradores |
| 15 | anotações de tipo (`x: int`) |
| nunca | `:=`, `async/await`, `eval exec compile vars globals locals dir id hash help` |

Exceção rara: `livre=True` no QUIZ/ERRO/DIGITE libera o uso adiantado de algo num trecho. É contado e eu reviso: use só se for essencial, e nunca para o trecho que a lição ensina.
Dentro da unidade, **use na lição N só o que as lições 1…N já ensinaram** (o gerador só garante o nível da unidade).

## 6. Como escrever bem

**Texto**
- Português do Brasil, tratando por **você**, tom amigável e direto. Sem emoji, sem gíria, sem piada, sem "simplesmente", "obviamente", "é fácil", "basta".
- Parágrafo com até 2 frases; frase com até ~25 palavras. Uma ideia por parágrafo.
- Termo novo: **negrito** na primeira vez, com uma definição de uma linha. Depois use sempre o mesmo termo (variável, texto (`str`), laço, lista, função…). Mantenha as palavras do Python em inglês (`print`, `if`, `True`).
- A explicação de cada exercício diz **por quê** (1 a 3 frases) e, quando existe uma tentação errada comum, diz por que ela engana. Não repete a resposta.
- No BUG: `porque` = a causa do erro; `explicacao` = como a correção resolve.

**Código**
- Nomes de variáveis em português, **sem acento**: `nome`, `idade`, `temperatura`, `rpm`, `total`. Textos (entre aspas) podem ter acento. Aspas duplas por padrão.
- Poucas linhas (até 12; o ideal é 2 a 6) e curtas (até 44 letras: é celular).
- Números pequenos e contas fáceis de fazer de cabeça. Nada de `foo`, `bar`, `spam`.
- Nada que mude de uma execução para outra: sem `random` sem `seed`, sem hora atual, sem `id()`; **não imprima conjunto de textos direto** (a ordem muda: use `sorted`). Se o gerador avisar que o resultado muda entre sementes ou versões do Python, troque o exemplo.
- `input()` sempre com `entrada=[...]`.

**Desenho dos exercícios**
- Cada exercício testa **uma** ideia e é independente dos outros (a pessoa pode errar e refazer no fim da lição).
- Dificuldade crescente: os 2-3 primeiros aplicam direto o que a abertura mostrou; o meio varia o formato; os últimos juntam com lições anteriores (**pelo menos 2 exercícios por lição revisam algo de lições/unidades anteriores**); o último é o mais desafiador da lição.
- **Pelo menos 4 tipos diferentes por lição**; não ponha dois exercícios do mesmo tipo em seguida (o gerador avisa). Receita de 10: 3 QUIZ/ERRO, 2 DIGITE, 1 BUG, 1 MONTE, 1 LACUNA, 1 PARES, 1 livre. Se a lição não comporta um tipo (um MONTE sem ordem única), troque por outro.
- Respostas erradas (distratores) vêm de **erros reais de iniciante**: esquecer aspas, confundir `=` com `==`, errar por um (índice, `range`), misturar int e texto, ordem das operações. Nunca opções absurdas ou piadas. Evite "Erro" como opção quando ela é óbvia demais, e nunca ponha "Erro" como opção se o código roda bem **e** o assunto da lição não é erro.
- Perguntas-pegadinha só valem se ensinam (como `print(7)` e `print("7")` parecerem iguais). Nunca dependa de espaço invisível, maiúscula escondida ou contagem trabalhosa.
- A resposta certa não pode ser a mais longa nem a única com certo formato. O jogo embaralha as opções, não se preocupe com a posição.
- Misture contexto: cotidiano, dinheiro, texto, jogo, e (com moderação) máquina/sensor/manutenção.
- A última lição de cada unidade é uma **Revisão/Desafio** que mistura tudo da unidade (e um pouco das anteriores), com exercícios um pouco mais difíceis.

**Honestidade técnica**
- Só afirme o que o Python faz. Conceitos que o gerador não confere (CONCEITO sem `teste`) precisam estar 100% corretos: releia cada um duas vezes. Nada de meia-verdade "para simplificar" que depois precise ser desmentida.
- Mensagens de erro: use as do Python atual (3.13). O gerador compara com o Python que está rodando. Se sua mensagem muda entre versões, o `build.py --versoes` vai acusar depois; prefira exemplos estáveis.

## 7. Checklist antes de entregar

1. `python3 tools/curso/build.py -u uNN -a --tudo` sem erros; avisos revisados.
2. Releia a abertura de cada lição como se fosse a primeira vez que você vê programação: algum termo aparece antes de ser explicado?
3. Cada lição tem 8 a 12 exercícios, 4+ tipos, dificuldade crescente, 2+ de revisão.
4. Nenhuma lição repete exercício de outra (mesmo código com outra roupa também conta).
5. Nada fora do arquivo `tools/curso/src/uNN-*.py` foi alterado. Nada de git.

## 8. Plano do curso (16 unidades)

Títulos de unidade até 46 letras; descrição até 110. Nomes de arquivo sugeridos entre parênteses.

**u01 Primeiros passos em Python** (`u01-primeiros-passos.py`) — print e texto · variáveis · tipos · contas e input · *mais contas* (`// % **`, `abs`, `round`, ordem das operações, float impreciso 0.1+0.2) · *conversão de tipos* (`int() float() str()`, ValueError) · *print avançado* (vários valores com vírgula, `sep`, `end`, `\n`, `\t`, aspas dentro de texto, texto de várias linhas) · *lendo mensagens de erro* (SyntaxError, NameError, TypeError, ZeroDivisionError, ValueError, a linha apontada) · revisão. (As 4 primeiras já existem.)

**u02 Textos** (`u02-textos.py`) — aspas simples/duplas/triplas · escapes `\n \t \\ \"` · juntar e repetir (`+`, `*`), `len` · índices (0, negativos) · fatias `[a:b]`, `[::-1]` · métodos I (`upper lower title capitalize strip`) · métodos II (`replace find count startswith endswith`) · `split` e `join` · f-strings (`{x}`, `{x:.2f}`, alinhamento) · verificações (`in`, `isdigit`, `isalpha`…), textos são imutáveis · revisão.

**u03 Decisões** (`u03-decisoes.py`) — comparações e bool · `if` · `if/else` · `elif` · `and or not` · `in`, comparação encadeada · verdadeiro/falso de valores (0, "", None) · `if` aninhado e ordem das condições · expressão condicional e `match` · revisão/desafio (faixas, alarmes com limites).

**u04 Repetição** (`u04-repeticao.py`) — `while` · contador e acumulador · `for` com `range(n)` · `range(a, b, passo)`, contagem regressiva · `for` em texto · `break` · `continue` e `else` do laço · laços aninhados · padrões clássicos (soma, média, maior, contar, validar entrada) · revisão/desafio.

**u05 Listas** (`u05-listas.py`) — criar e índices · fatias, `len`, `in` · alterar (`append insert`, atribuição) · remover (`remove pop del clear`) · `for` e `enumerate` · `sum min max sorted reversed`, `.sort()` (devolve None) · `list(texto)`, `split/join` com listas · compreensão de lista · listas e referências (alias, `copy()`, `[:]`) · listas de listas · revisão/desafio (leituras de sensor).

**u06 Tuplas e conjuntos** (`u06-tuplas-conjuntos.py`) — tuplas e imutabilidade · desempacotamento e troca · `divmod`, tuplas como retorno de valor · lista × tupla · conjuntos (duplicados, `in`) · `add discard remove update` · `| & - ^` · conjunto × lista (remover repetidos; cuidado com a ordem) · revisão.

**u07 Dicionários** (`u07-dicionarios.py`) — criar e acessar (KeyError) · alterar, adicionar, remover · `get` e `in` · percorrer (`keys values items`) · contagem de frequência · dicionário com listas / `setdefault` · dicionários aninhados · lista de dicionários (tabela de registros) · compreensão de dict e ordenar com `key=d.get` · revisão/desafio.

**u08 Funções** (`u08-funcoes.py`) — `def` e chamada · parâmetros · `return` × `print` · valores padrão e nomeados · funções chamando funções · escopo (local × global) · funções e listas (muda × devolve) · `*args **kwargs` · docstring e bons nomes · `lambda` (e `sorted(key=...)`) · recursão · revisão/desafio.

**u09 Erros e exceções** (`u09-erros-excecoes.py`) — lendo o traceback · `try/except` · `except` específico, vários, `as e` · `else` e `finally` · `raise` · validar entrada (`while` + `try`) · `assert` e depurar com `print` · revisão.

**u10 Arquivos** (`u10-arquivos.py`) — `open`, `write`, `read` (cada exercício cria o arquivo no próprio código) · `with` · ler linha a linha · `"w"` × `"a"` · dados em texto (CSV na mão com `split`) · processar dados de arquivo · `FileNotFoundError` e `try` · revisão (log de manutenção).

**u11 Módulos e biblioteca padrão** (`u11-modulos.py`) — `import`, `from`, `math` · `random` (sempre com `seed`) · `datetime` (datas fixas, `timedelta`, `strftime`) · `collections.Counter` · `defaultdict`, `deque`, `namedtuple` · `itertools` básico · `statistics` · `json` · `csv` · `pathlib`/`os.path` · `re` básico · revisão.

**u12 Iteradores, geradores e estilo funcional** (`u12-iteradores-geradores.py`) — iteráveis, `iter/next`, StopIteration · `zip` · `map` e `filter` · `any` e `all` · expressões geradoras · funções geradoras (`yield`) · compreensões avançadas · `sorted/min/max` com `key`, `enumerate(start=)` · revisão/desafio (pipelines de dados).

**u13 Classes e objetos** (`u13-classes-objetos.py`) — classe e objeto · `__init__` e `self` · métodos · estado e encapsulamento (`_atributo`) · `__str__` e `__repr__` · atributo de classe × de instância · herança · `super()` e sobrescrever · polimorfismo · `@property` · `@classmethod`, `@staticmethod`, métodos especiais (`__eq__ __lt__ __len__`) · composição e revisão (modelar uma planta: Motor, Sensor, OrdemServico).

**u14 Qualidade de código e depuração** (`u14-qualidade-codigo.py`) — PEP 8 (nomes, espaços) · comentários e docstrings · funções pequenas e repetição (DRY) · depurar (`print`, ler traceback, isolar o problema) · testes com `assert` · casos de borda (vazio, zero, negativo) · custo de um algoritmo (contar passos) · revisão.

**u15 Tipos, dataclasses e enum** (`u15-tipos-dataclasses.py`) — anotações (`def f(x: int) -> int`) · tipos compostos (`list[int]`, `dict[str, float]`, `int | None`) · `@dataclass` · dataclass: padrão, `field`, ordenação, `frozen` · `Enum` · mais tipos úteis · revisão.

**u16 Python na indústria** (`u16-python-industria.py`) — mini-projetos usando tudo: escala 4–20 mA → unidade de engenharia · alarmes e histerese · média móvel (filtro de ruído) · peças e OEE · MTBF e MTTR · ordens de serviço (lista de dicts: filtrar, ordenar, agrupar) · log/CSV de sensores · máquina de estados (parado/partindo/rodando/falha) · potência e torque de motor (P = T·ω, rpm → rad/s) · mini-CLP (ciclo de varredura) · revisão.

Você pode ajustar a ordem ou trocar um tópico por outro melhor **dentro da unidade**, mantendo 7 a 12 lições. Não adiante assuntos de unidades seguintes.

## 9. Relatório final (máximo 150 palavras)

Diga: unidades e número de lições/exercícios; quais exercícios usam `livre=True`; quais CONCEITO ficaram sem `teste` (ids); dúvidas ou riscos de conteúdo que merecem uma segunda olhada; algo que você queria poder usar antes e o gerador impediu.
