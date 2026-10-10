# -*- coding: utf-8 -*-
# Unidade 15 — Tipos, dataclasses e enum.  Veja tools/curso/GUIA-AUTORES.md
import typing
from dsl import *


def _tipo_ok(a, b):
    """Anotação simples (int, float, str, bool) combina com o valor?"""
    return type(eval(b)).__name__ == a


def _composto_ok(a, b):
    """Anotação composta (list[int], dict[str, float]...) combina com o valor?"""
    t, v = eval(a), eval(b)
    if type(v) is not typing.get_origin(t):
        return False
    args = typing.get_args(t)
    if isinstance(v, dict):
        return all(isinstance(k, args[0]) for k in v) and all(isinstance(x, args[1]) for x in v.values())
    if isinstance(v, tuple):
        return len(v) == len(args) and all(isinstance(x, y) for x, y in zip(v, args))
    return all(isinstance(x, args[0]) for x in v)


# ======================================================================= u15l01
L01 = LICAO('u15l01', 'Anotações de tipo', 'Dizer qual tipo cada valor deve ter',
    INTRO([
        'Uma **anotação de tipo** é uma etiqueta que diz qual tipo um valor deveria ter. Em uma variável, ela vem depois de dois pontos: `rpm: int = 1750`.',
        'Em uma função, cada parâmetro leva a sua anotação, e o tipo do resultado vem depois de `->`: `def dobro(n: int) -> int:`.',
        'Se a função não devolve nada, use `-> None`.',
        'Atenção: o Python **não confere** as anotações enquanto roda. Elas servem para quem lê o código e para ferramentas externas, como o editor ou o `mypy`.',
        'Uma anotação sozinha, como `x: int`, só registra o tipo: ela não cria a variável.',
    ], [
        EXEMPLO(C('''
            def dobro(n: int) -> int:
                return n * 2

            print(dobro(4))
            print(dobro("ab"))
            '''), nota='A segunda chamada contraria a anotação `int`, e mesmo assim o Python roda.'),
    ]),
    [
        QUIZ(C('''
            rpm: int = 1750
            print(rpm + 50)
            '''), '1800', ['1750', 'rpm + 50', 'int'],
            explicacao='A anotação `: int` só informa o tipo. A variável continua valendo 1750, e a conta `1750 + 50` dá 1800.'),
        QUIZ(C('''
            nome: str = 42
            print(nome)
            '''), '42', ['Erro', '"42"', 'str'],
            explicacao='O Python não confere a anotação: ele guarda o 42 normalmente, mesmo com `: str`. Quem avisaria do problema seria o editor ou o `mypy`.'),
        DIGITE(C('''
            def triplo(n: int) -> int:
                return n * 3

            print(triplo(5))
            '''), '15',
            explicacao='As anotações não mudam a conta. A função multiplica 5 por 3 e devolve 15.'),
        ERRO(C('''
            x: int
            print(x)
            '''), 'NameError', ['TypeError', 'ValueError', 'SyntaxError'],
            explicacao='`x: int` só registra o tipo e não guarda valor. Como a variável não foi criada, o `print(x)` dá NameError.'),
        BUG(L('''
            def area(a: float, b: float) -> float
                return a * b
            print(area(2.0, 3.0))
            '''), 1, 'def area(a: float, b: float) -> float:', ['def area(a: float, b: float) => float:', 'def area(a: float, b: float): float'],
            erro="SyntaxError: expected ':'",
            enunciado='Este programa deveria mostrar 6.0, mas dá erro.',
            porque='Toda linha `def` termina com dois pontos, mesmo quando tem anotação de retorno. Sem eles, o Python não sabe onde começa o corpo da função e mostra SyntaxError.',
            explicacao='Com os dois pontos depois de `-> float`, o corpo da função fica claro e o programa mostra 6.0.'),
        MONTE(L('''
            def kw(w: int) -> float:
                return w / 1000
            potencia = kw(1500)
            print(potencia)
            '''), '1.5',
            enunciado='Coloque as linhas na ordem certa. O programa converte 1500 W em kW e mostra o resultado.',
            explicacao='A função precisa existir antes de ser chamada, e o corpo recuado vem logo abaixo do `def`. Só depois o resultado é guardado e mostrado.'),
        LACUNA(C('''
            {1} quadrado(n: int) {2} int:
                return n * n

            print(quadrado(7))
            '''), ['def', '->'], ['=>', 'function', ':'], '49',
            enunciado='Complete o código para ele mostrar 49.',
            explicacao='A função começa com `def`, e o tipo do resultado vem depois da seta `->`. Os símbolos `=>` e `function` são de outras linguagens.'),
        PARES([('int', '42'), ('float', '3.5'), ('str', '"Ana"'), ('bool', 'True')], _tipo_ok,
            enunciado='Ligue cada anotação ao valor que combina com ela.', dir_codigo=True,
            explicacao='Número sem ponto é `int`; com ponto, `float`; entre aspas, `str`. `True` e `False` são `bool`.'),
        QUIZ(C('''
            def avisar(msg: str) -> None:
                print(msg)

            r = avisar("Ligado")
            print(r)
            '''), 'Ligado\nNone', ['Ligado', 'Ligado\nLigado', 'Ligado\nstr'],
            explicacao='Dentro da função, o `print` mostra Ligado. A função não tem `return`, então devolve `None`, e o segundo `print` mostra None.'),
        ERRO(C('''
            def media(a: float, b: float) -> float:
                return (a + b) / 2

            print(media("4", "10"))
            '''), 'TypeError', ['NameError', 'ValueError', 'SyntaxError'],
            explicacao='A anotação `float` não impediu a chamada com textos. O erro só aparece dentro da função: "4" + "10" vira "410", e um texto não pode ser dividido por 2.'),
    ])

# ======================================================================= u15l02
L02 = LICAO('u15l02', 'Tipos compostos e None', 'list[int], dict[str, float] e int | None',
    INTRO([
        'Para dizer o que existe dentro de uma lista, ponha o tipo dos itens entre colchetes: `list[int]` é uma lista de inteiros. O conjunto segue a mesma ideia: `set[str]`.',
        'Em um dicionário, indique a chave e o valor: `dict[str, float]`. Em uma tupla, indique um tipo por posição: `tuple[str, int]`.',
        'Quando um valor pode faltar, use `|` (lê-se "ou"): `int | None` é um inteiro ou `None`. Para testar, use `x is None` (é `None`) ou `x is not None` (não é `None`).',
        'Os colchetes também não são conferidos pelo Python: uma `list[int]` aceita textos sem reclamar.',
    ], [
        EXEMPLO(C('''
            estoque: dict[str, int] = {"parafuso": 40}

            def saldo(item: str) -> int | None:
                return estoque.get(item)

            print(saldo("parafuso"))
            print(saldo("porca"))
            '''), nota='O `.get` devolve `None` quando a chave não existe, e a anotação `int | None` avisa isso.'),
    ]),
    [
        QUIZ(C('''
            preco: dict[str, float] = {"pao": 0.5}
            preco["leite"] = 4.0
            print(preco["leite"])
            '''), '4.0', ['0.5', 'leite', '4'],
            explicacao='`dict[str, float]` diz que as chaves são textos e os valores são decimais. Buscar "leite" devolve o valor 4.0.'),
        PARES([('list[int]', '[3, 5, 8]'), ('dict[str, float]', '{"M1": 7.5}'), ('tuple[str, int]', '("M1", 1750)'), ('set[int]', '{1, 2, 3}')], _composto_ok,
            enunciado='Ligue cada anotação ao valor que combina com ela.', dir_codigo=True,
            explicacao='A forma do valor mostra o tipo de fora: `[ ]` é lista, `{ : }` é dicionário, `( )` é tupla e `{ }` sem dois pontos é conjunto. O que fica entre colchetes descreve os itens.'),
        QUIZ(C('''
            def pos(v: list[int], n: int) -> int | None:
                if n in v:
                    return v.index(n)
                return None

            print(pos([5, 7, 9], 9))
            print(pos([5, 7, 9], 4))
            '''), '2\nNone', ['2\n-1', '3\nNone', '2\nFalse'],
            explicacao='O 9 está na posição 2 (a contagem começa em 0). Quando o número não existe, a função devolve `None`, e não -1 como o `find` dos textos.'),
        DIGITE(C('''
            ids: set[int] = {3, 5, 3, 5, 7}
            print(len(ids))
            '''), '3',
            explicacao='Um conjunto não guarda repetidos: sobram só 3, 5 e 7. A anotação `set[int]` não muda isso.'),
        BUG(L('''
            def desconto(v: float) -> float | None:
                if v < 100:
                    return None
                return v * 0.9
            d = desconto(50.0)
            print(d + 10)
            '''), 6, 'print(10 if d is None else d + 10)', ['print(str(d) + 10)', 'print(d + "10")'],
            erro="TypeError: unsupported operand type(s) for +: 'NoneType' and 'int'",
            enunciado='Este programa deveria mostrar 10 quando não há desconto, mas dá erro.',
            porque='Com 50.0, a função devolve `None`, e não existe conta entre `None` e um número. O tipo `float | None` avisa que o resultado pode faltar, e o código precisa tratar esse caso.',
            explicacao='Testar `d is None` antes da conta evita o erro: sem desconto, o programa mostra 10.'),
        MONTE(L('''
            def media(v: list[float]) -> float | None:
                if not v:
                    return None
                return sum(v) / len(v)
            print(media([]))
            '''), 'None',
            explicacao='O teste da lista vazia vem antes da conta: se a conta viesse primeiro, `sum(v) / len(v)` dividiria por zero. O `return None` fica recuado dentro do `if`.'),
        LACUNA(C('''
            def limites(v: list[int]) -> tuple[int, int]:
                return {1}(v), {2}(v)

            menor, maior = limites([7, 3, 9, 5])
            print(menor, maior)
            '''), ['min', 'max'], ['sum', 'len', 'sorted'], '3 9',
            enunciado='Complete o código para ele mostrar o menor e o maior valor da lista: 3 9',
            explicacao='A função devolve uma tupla com dois inteiros, como diz `tuple[int, int]`: primeiro o menor (`min`), depois o maior (`max`). A ordem dos dois importa.'),
        QUIZ(C('''
            nomes: list[int] = ["Ana", "Bia"]
            print(nomes[1])
            '''), 'Bia', ['Erro', '1', 'Ana'],
            explicacao='O Python não confere o que há dentro dos colchetes. A lista guarda os textos normalmente, e `nomes[1]` é o segundo item.'),
        QUIZ(C('''
            achado: int | None = 0
            if achado:
                print("achou")
            else:
                print("não achou")
            '''), 'não achou', ['achou', '0', 'None'],
            explicacao='O número 0 conta como falso no `if`, mesmo sendo um valor válido. Para saber se o valor existe, teste `achado is not None`.'),
        DIGITE(C('''
            def aprovado(nota: float | None) -> bool:
                return nota is not None and nota >= 6

            print(aprovado(None), aprovado(7.5))
            '''), 'False True',
            explicacao='Com `None`, o primeiro teste já dá False e o `and` nem avalia `nota >= 6` (que daria erro). Com 7.5, os dois testes passam.'),
    ])

UNIDADE('u15', 'Tipos, dataclasses e enum', 'Anotar tipos e modelar dados com dataclass e Enum.', [L01, L02])
