# -*- coding: utf-8 -*-
# Unidade 11 — Módulos e biblioteca padrão.  Veja tools/curso/GUIA-AUTORES.md
import math
import random
from dsl import *

# ======================================================================= u11l01
def _math_ok(a, b):
    return str(eval(a, {'math': math})) == b

L01 = LICAO('u11l01', 'import e math', 'Trazer ferramentas prontas para o programa',
    INTRO([
        'O Python vem com muitas ferramentas prontas, guardadas em **módulos**: arquivos de código que você traz para o seu programa.',
        'Para usar um módulo, escreva `import` e o nome dele. O módulo `math` tem as ferramentas de matemática.',
        'Depois do `import`, chame a função com o nome do módulo, um ponto e o nome dela: `math.sqrt(16)` calcula a raiz quadrada.',
        'Com `from math import sqrt`, você traz só a função que quer e a usa sozinha: `sqrt(16)`. Com `import math as m`, o módulo ganha o apelido `m`.',
        'Algumas ferramentas do `math`:',
    ], [
        EXEMPLO(C('''
            import math
            print(math.sqrt(49))
            print(math.ceil(2.1))
            ''')),
        EXEMPLO(C('''
            from math import floor
            print(floor(2.9))
            ''')),
    ], lista=[
        '`math.sqrt(x)`: raiz quadrada. O resultado é sempre decimal (`float`).',
        '`math.ceil(x)` arredonda para cima e `math.floor(x)` arredonda para baixo. Os dois devolvem um `int`.',
        '`math.factorial(n)`: o fatorial de `n`, que é 1 * 2 * 3 * ... * n.',
        '`math.pi`: o valor de pi, 3.14159... Não leva parênteses, porque é um valor, não uma função.',
    ], depois=[
        'Se o nome do módulo estiver errado, o Python mostra `ModuleNotFoundError` (módulo não encontrado).',
    ]),
    [
        QUIZ(C('''
            import math
            print(math.sqrt(25))
            '''), '5.0', ['5', '25', '12.5'],
            explicacao='`math.sqrt` devolve sempre um `float`, mesmo quando a raiz é exata. Por isso aparece `5.0`, e não `5`.'),
        DIGITE(C('''
            import math
            print(math.ceil(4.2))
            '''), '5',
            explicacao='`math.ceil` arredonda para cima: 4.2 vira 5. Já `math.floor` arredondaria para baixo, para 4.'),
        QUIZ(C('''
            import math
            print(math.floor(7.9))
            print(round(7.9))
            '''), '7\n8', ['8\n8', '7\n7', '8\n7'],
            explicacao='`math.floor` sempre desce: 7.9 vira 7. O `round` escolhe o inteiro mais próximo, que é 8.'),
        LACUNA(C('''
            {1} math
            print(math.{2}(5))
            '''), ['import', 'factorial'], ['from', 'sqrt', 'floor'], '120',
            enunciado='Complete o código para ele mostrar o fatorial de 5, que é 1 * 2 * 3 * 4 * 5.',
            explicacao='O `import math` traz o módulo, e `math.factorial(5)` calcula 1 * 2 * 3 * 4 * 5, que dá 120. Sem o `import`, o nome `math` não existiria.'),
        BUG(L('''
            import math
            raio = 3
            area = math.pi() * raio ** 2
            print(round(area, 1))
            '''), 3, 'area = math.pi * raio ** 2', ['area = math.pi(raio ** 2)', 'area = math(pi) * raio ** 2'],
            erro="TypeError: 'float' object is not callable",
            enunciado='Este programa deveria mostrar a área de um círculo de raio 3, mas dá erro.',
            porque='O `math.pi` é um valor (um número decimal), não uma função. Com parênteses, o Python tenta "chamar" esse número como se fosse uma função e mostra TypeError.',
            explicacao='Sem parênteses, `math.pi` entra na conta como um número comum. O resultado, 28.27..., aparece como 28.3 por causa do `round`.'),
        ERRO(C('''
            import matematica
            print(matematica.pi)
            '''), 'ModuleNotFoundError', ['NameError', 'FileNotFoundError', 'SyntaxError'],
            explicacao='Não existe nenhum módulo chamado `matematica`. O nome do módulo precisa ser exato: o correto seria `math`.'),
        MONTE(L('''
            from math import sqrt
            raiz = sqrt(81)
            dobro = raiz * 2
            print(dobro)
            '''), '18.0',
            explicacao='O `from` vem antes de usar o `sqrt`, o `sqrt` cria `raiz`, e o dobro usa `raiz`. O resultado é `18.0` porque a raiz é um `float`.'),
        PARES([('math.sqrt(36)', '6.0'), ('math.floor(3.8)', '3'), ('math.ceil(3.2)', '4'), ('math.factorial(4)', '24')], _math_ok,
            enunciado='Ligue cada chamada ao resultado que ela mostra.', dir_codigo=True,
            explicacao='O `sqrt` dá `float` (6.0). O `floor` desce e o `ceil` sobe, e os dois dão `int`. O fatorial de 4 é 1 * 2 * 3 * 4 = 24.'),
        ERRO(C('''
            from math import sqrt
            print(math.sqrt(16))
            '''), 'NameError', ['TypeError', 'AttributeError', 'ImportError'],
            explicacao='O `from math import sqrt` traz só o `sqrt`. O nome `math` não foi criado, então `math.sqrt` dá NameError. Escreva `sqrt(16)` ou use `import math`.'),
        DIGITE(C('''
            import math as m
            raio = 2
            print(f"{m.pi * raio ** 2:.2f}")
            '''), '12.57', dica='duas casas decimais',
            explicacao='O apelido `m` é só outro nome para o módulo `math`. A conta dá pi * 4, que é 12.566..., e o `:.2f` mostra duas casas decimais: 12.57.'),
        QUIZ(C('''
            import math
            for n in [1, 4, 9]:
                print(int(math.sqrt(n)))
            '''), '1\n2\n3', ['1.0\n2.0\n3.0', '1\n4\n9'],
            explicacao='O `sqrt` dá a raiz de cada número como `float` (1.0, 2.0, 3.0). O `int()` tira a parte decimal, e o `print` mostra uma linha por volta do laço.'),
    ])

# ======================================================================= u11l02
def _rand_ok(a, b):
    nomes = ['Ana', 'Bia', 'Caio']
    random.seed(1)
    r = eval(a, {'random': random, 'nomes': nomes})
    if b == 'Inteiro de 1 a 6':
        return type(r) is int and 1 <= r <= 6
    if b == 'Um item da lista':
        return r in ('Ana', 'Bia', 'Caio')
    if b == 'Embaralha e devolve None':
        return r is None and sorted(nomes) == ['Ana', 'Bia', 'Caio']
    if b == 'Decimal entre 0 e 1':
        return type(r) is float and 0 <= r < 1
    return False

L02 = LICAO('u11l02', 'random e seed', 'Sortear números e itens de forma repetível',
    INTRO([
        'O módulo **random** sorteia números e escolhe itens ao acaso, como um dado ou um sorteio de nomes.',
        'Um sorteio de verdade muda a cada execução. Para o resultado se repetir, use `random.seed(n)` antes de sortear.',
        'A **semente** (`seed`) é o ponto de partida da sequência de sorteios. Com a mesma semente, os sorteios saem sempre iguais.',
        'As funções principais:',
    ], [
        EXEMPLO(C('''
            import random
            random.seed(1)
            print(random.randint(1, 6))
            random.seed(1)
            print(random.randint(1, 6))
            '''), nota='A mesma semente deu o mesmo número nas duas vezes.'),
        EXEMPLO(C('''
            import random
            random.seed(5)
            dado = random.randint(1, 6)
            print(1 <= dado <= 6)
            '''), nota='Não importa qual número saiu: ele sempre fica entre 1 e 6.'),
    ], lista=[
        '`random.randint(a, b)`: um número inteiro de `a` até `b`, incluindo os dois.',
        '`random.choice(lista)`: um item da lista, escolhido ao acaso.',
        '`random.shuffle(lista)`: embaralha a própria lista e devolve `None`.',
        '`random.random()`: um decimal entre 0 e 1, sem chegar a 1.',
    ], depois=[
        'Você não precisa adivinhar o número sorteado. Os exercícios perguntam o que sempre vale, como o limite do sorteio ou o efeito da semente.',
    ]),
    [
        QUIZ(C('''
            import random
            random.seed(8)
            a = random.randint(1, 100)
            random.seed(8)
            b = random.randint(1, 100)
            print(a == b)
            '''), 'True', ['False', '8', '100'],
            explicacao='Com a mesma semente, a sequência recomeça do mesmo ponto, e os dois sorteios saem iguais. O `print` mostra o resultado da comparação: `True`.'),
        DIGITE(C('''
            import random
            random.seed(3)
            print(random.randint(5, 5))
            '''), '5',
            explicacao='O `randint(5, 5)` sorteia de 5 até 5, e os dois extremos entram no sorteio. Só pode sair o 5.'),
        QUIZ(C('''
            import random
            random.seed(1)
            nomes = ["Ana", "Bia", "Caio"]
            r = random.shuffle(nomes)
            print(r)
            '''), 'None', ["['Ana', 'Bia', 'Caio']", "['Caio', 'Ana', 'Bia']", '[]'],
            explicacao='O `random.shuffle` embaralha a lista que você passou e não devolve nada, ou seja, devolve `None`. Para ver a lista embaralhada, faça `print(nomes)`.'),
        LACUNA(C('''
            {1} random
            random.seed(2)
            cor = random.{2}(["azul"])
            print(cor)
            '''), ['import', 'choice'], ['from', 'randint', 'shuffle'], 'azul',
            enunciado='Complete o código para escolher um item da lista. A lista tem um item só, então a saída é previsível.',
            explicacao='O `import random` traz o módulo, e o `random.choice` escolhe um item da lista. Com um item só, o sorteio só pode dar `azul`.'),
        BUG(L('''
            import ramdom
            random.seed(3)
            n = random.randint(1, 6)
            print(1 <= n <= 6)
            '''), 1, 'import random', ['import Random', 'import "random"'],
            erro="ModuleNotFoundError: No module named 'ramdom'",
            enunciado='Este programa deveria mostrar True, mas dá erro logo na primeira linha.',
            porque='O módulo se chama `random`, mas o `import` pede `ramdom`, que não existe. O Python não encontra o módulo e mostra ModuleNotFoundError.',
            explicacao='Com o nome certo, o `import` funciona e o programa mostra `True`, porque o dado fica sempre entre 1 e 6.'),
        PARES([('random.randint(1, 6)', 'Inteiro de 1 a 6'), ('random.choice(nomes)', 'Um item da lista'),
               ('random.shuffle(nomes)', 'Embaralha e devolve None'), ('random.random()', 'Decimal entre 0 e 1')], _rand_ok,
            enunciado='Ligue cada chamada ao que ela faz. Considere que `nomes` é uma lista de nomes.',
            explicacao='O `randint` dá um inteiro, o `choice` pega um item, o `shuffle` troca a ordem da própria lista e o `random()` dá um decimal entre 0 e 1.'),
        ERRO(C('''
            import random
            random.seed(1)
            print(random.choice(5))
            '''), 'TypeError', ['ValueError', 'IndexError', 'NameError'],
            explicacao='O `choice` escolhe um item de uma lista (ou de outra coleção com itens). Um número solto, como o 5, não tem itens, e o Python mostra TypeError.'),
        DIGITE(C('''
            import random
            random.seed(9)
            dados = [3, 1, 2]
            random.shuffle(dados)
            print(sorted(dados))
            '''), '[1, 2, 3]', aceitas=['[1,2,3]'],
            explicacao='O `shuffle` só troca a ordem dos itens: nenhum some e nenhum aparece. Depois do `sorted`, a lista volta a ficar em ordem crescente.'),
        QUIZ(C('''
            import random
            random.seed(6)
            frutas = ["uva", "pera", "maçã"]
            f = random.choice(frutas)
            print(f in frutas)
            '''), 'True', ['False', 'uva', 'f'],
            explicacao='Não dá para saber qual fruta saiu, mas o `choice` sempre devolve um item da própria lista. Por isso o `in` dá `True`.'),
        QUIZ(C('''
            import random
            random.seed(7)
            fora = 0
            for i in range(20):
                if random.randint(1, 6) > 6:
                    fora += 1
            print(fora)
            '''), '0', ['1', '6', '20'],
            explicacao='O `randint(1, 6)` nunca passa de 6, então o teste `> 6` nunca é verdadeiro e o contador fica em 0.'),
        QUIZ(C('''
            import random
            random.seed(1)
            a = random.randint(1, 100)
            b = random.randint(1, 100)
            random.seed(1)
            c = random.randint(1, 100)
            print(a == c)
            '''), 'True', ['False', '1', 'b == c'],
            explicacao='O segundo `random.seed(1)` recomeça a sequência do início. Por isso `c` repete o primeiro sorteio, `a`, e o sorteio `b` do meio não atrapalha.'),
    ])

UNIDADE('u11', 'Módulos e biblioteca padrão', 'Usar as ferramentas prontas do Python: math, random, datetime, json e mais.', [L01, L02])
