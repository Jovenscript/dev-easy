# -*- coding: utf-8 -*-
# Unidade 4 — Repetição.  Veja tools/curso/GUIA-AUTORES.md
import dsl as _dsl
from dsl import *


def _roda(codigo, entrada=()):
    """Só para as conferências (teste=..., verif=...): roda o código de verdade e devolve (saida, erro, linha)."""
    return _dsl.rodar(codigo, tuple(entrada), False)


def _infinito(codigo):
    # True se o código não termina (estoura o tempo ou escreve sem parar)
    erro = _roda(codigo)[1] or ''
    return erro.startswith('Timeout') or erro.startswith('Saída longa')


# ======================================================================= u04l01
def _voltas_ok(condicao, saida):
    # roda o laço de verdade com cada condição e compara com o que a pessoa ligou
    programa = 'n = 0\nwhile %s:\n    print(n, end="")\n    n = n + 1' % condicao
    return _roda(programa)[0] == saida


_COD_INFINITO = C('''
    n = 5
    while n > 0:
        print(n)
    ''')
_COD_FINITO = C('''
    n = 5
    while n > 0:
        print(n)
        n = n - 1
    ''')

L01 = LICAO('u04l01', 'O while', 'Repetir um bloco enquanto a condição for verdadeira',
    INTRO([
        'Um **laço** repete um bloco de código várias vezes. O **`while`** ("enquanto") repete o bloco **enquanto** a condição for `True`.',
        'Ele se escreve como o `if`: a linha termina com dois-pontos, e o bloco fica recuado. No fim do bloco, o Python volta e testa a condição de novo.',
        'Cada passagem pelo bloco é uma **volta**. Quando a condição dá `False`, o laço termina e o programa segue com a primeira linha sem recuo.',
        'Pense numa esteira que roda enquanto houver peça: a cada volta, o sensor confere de novo se ainda há peça.',
        'Alguma coisa dentro do laço precisa mudar a condição. Se ela nunca ficar `False`, o laço nunca termina: é um **laço infinito**.',
    ], [
        EXEMPLO(C('''
            contagem = 1
            while contagem <= 3:
                print("Volta", contagem)
                contagem = contagem + 1
            print("Fim")
            '''), nota='Antes de cada volta, o Python testa `contagem <= 3`. Depois da terceira, `contagem` vale 4, a condição dá `False`, e o laço termina.'),
        EXEMPLO(C('''
            resposta = ""
            while resposta != "sim":
                resposta = input("Continuar? ")
            print("Ok!")
            '''), entrada=['talvez', 'sim'], nota='O laço repete a pergunta até a resposta ser "sim". Aqui a pessoa digitou "talvez" e depois "sim".'),
    ]),
    [
        QUIZ(C('''
            n = 2
            while n < 10:
                print(f"n = {n}")
                n = n * 2
            '''), 'n = 2\nn = 4\nn = 8', ['n = 2\nn = 4\nn = 8\nn = 16', 'n = 4\nn = 8', 'n = 2\nn = 4\nn = 6\nn = 8'],
            explicacao='O `n` vale 2, 4 e 8 dentro do laço. Com `n = 16`, o Python testa `16 < 10` antes de entrar, o resultado é `False`, e o 16 nunca é mostrado.'),
        DIGITE(C('''
            x = 10
            while x > 3:
                x = x - 4
            print(x)
            '''), '2',
            explicacao='O `x` passa por 10, 6 e 2. Com 2, a condição `x > 3` dá `False`, o laço termina, e o `print`, que está fora do laço, mostra 2.'),
        QUIZ(C('''
            vidas = 0
            while vidas > 0:
                print("Jogando")
                vidas = vidas - 1
            print("Acabou")
            '''), 'Acabou', ['Jogando\nAcabou', 'Jogando', 'Acabou\nAcabou'],
            explicacao='A condição é testada antes da primeira volta. Como `vidas > 0` já começa `False`, o bloco não roda nenhuma vez, e só o `print("Acabou")` aparece.'),
        BUG(L('''
            vidas = 3
            While vidas > 0:
                print("Vidas:", vidas)
                vidas = vidas - 1
            '''), 2, 'while vidas > 0:', ['WHILE vidas > 0:', 'while vidas > 0'],
            erro='SyntaxError: invalid syntax',
            enunciado='Este programa deveria mostrar as vidas de 3 até 1, mas dá erro.',
            porque='O Python diferencia maiúsculas de minúsculas, e a palavra do laço é `while`, toda em minúsculas. Com o W maiúsculo, ele não reconhece o laço e mostra SyntaxError.',
            explicacao='Com `while` em minúsculas, o laço passa a existir. `WHILE` continua errado, e sem os dois-pontos o Python reclama de novo.'),
        MONTE(L('''
            saldo = int(input("Saldo? "))
            while saldo >= 30:
                saldo = saldo - 30
                print("Resta", saldo)
            '''), 'Saldo? 70\nResta 40\nResta 10', entrada=['70'],
            enunciado='Coloque as linhas na ordem certa. A pessoa digita 70, e o programa faz saques de 30 enquanto der.',
            explicacao='O saldo é lido primeiro. Dentro do laço, o saque vem antes do `print`, para mostrar o saldo já descontado: 40 e depois 10. Com 10, a condição `saldo >= 30` dá `False`.'),
        LACUNA(C('''
            energia = 3
            {1} energia > 0:
                print("Energia", energia)
                energia = energia {2} 1
            '''), ['while', '-'], ['if', '+', '*'], 'Energia 3\nEnergia 2\nEnergia 1',
            enunciado='Complete o código para ele mostrar a energia caindo de 3 até 1.',
            explicacao='O `while` repete enquanto `energia > 0`, e o `-` faz a energia cair a cada volta até chegar a 0. Com `+` ou `*`, ela nunca zeraria e o laço não terminaria. Com `if`, haveria uma volta só.'),
        PARES([('n < 3', '012'), ('n <= 3', '0123'), ('n < 1', '0'), ('n < 5', '01234')], _voltas_ok,
            enunciado='Um laço começa com n = 0 e, enquanto a condição valer, mostra n (tudo na mesma linha) e soma 1. Ligue cada condição ao que aparece.',
            esq_codigo=True, dir_codigo=True,
            explicacao='O laço mostra o `n` de cada volta e para quando a condição dá `False`. Com `n < 3`, o último valor mostrado é 2; com `n <= 3`, é o 3. Com `n < 1`, só o 0 passa.'),
        ERRO(C('''
            while contagem < 3:
                print(contagem)
                contagem = contagem + 1
            '''), 'NameError', ['TypeError', 'SyntaxError', 'ValueError'],
            explicacao='O Python testa a condição antes da primeira volta, e a variável `contagem` ainda não existe. Ela precisa ser criada antes do `while`, como em `contagem = 0`.'),
        CONCEITO('Este laço nunca termina. Por quê?', 'Nada muda o valor de n dentro do laço',
            ['O print está recuado demais', 'O n começa em 5, que é grande demais', 'O while não aceita o símbolo >'],
            codigo=_COD_INFINITO,
            explicacao='A condição `n > 0` é testada a cada volta, mas o `n` sempre vale 5, e a condição nunca dá `False`. Para terminar, o laço precisa de algo como `n = n - 1`.',
            teste=lambda o: o.startswith('Nada muda') and _infinito(_COD_INFINITO) and not _infinito(_COD_FINITO)),
        QUIZ(C('''
            a = 1
            b = 10
            while a < b:
                a = a + 2
                b = b - 1
            print(a, b)
            '''), '7 7', ['5 8', '9 6', '7 8'],
            explicacao='Cada volta soma 2 em `a` e tira 1 de `b`: 3 e 9, depois 5 e 8, depois 7 e 7. Quando os dois valem 7, a condição `a < b` dá `False`, e o laço termina.'),
    ])

# ======================================================================= u04l02
def _atalho_ok(linha, final):
    # o total começa em 10 e a linha roda 3 vezes dentro de um laço
    programa = 'total = 10\nvezes = 0\nwhile vezes < 3:\n    %s\n    vezes = vezes + 1\nprint(total)' % linha
    return _roda(programa)[0] == final


L02 = LICAO('u04l02', 'Contador e acumulador', 'Contar voltas e somar valores dentro de um laço',
    INTRO([
        'Um **contador** é uma variável que conta quantas vezes algo aconteceu: começa em 0 e soma 1 a cada volta.',
        'Um **acumulador** é uma variável que junta valores. Ela começa em 0 (ou em `""`, no caso de textos) e recebe um valor novo a cada volta.',
        'Os dois precisam de um valor inicial **antes** do laço. Se você começar o `total` dentro do laço, ele volta ao início a cada volta.',
        'O atalho `+=` soma e guarda de uma vez: `total += 5` faz o mesmo que `total = total + 5`. Existem também `-=` e `*=`.',
    ], [
        EXEMPLO(C('''
            total = 0
            itens = 0
            while itens < 3:
                total = total + 15
                itens = itens + 1
            print(itens, "itens:", total)
            '''), nota='O `itens` é o contador: sobe 1 por volta. O `total` é o acumulador: soma 15 por volta.'),
        EXEMPLO(C('''
            texto = ""
            letras = 0
            while letras < 3:
                texto += "ab"
                letras += 1
            print(texto)
            '''), nota='O `+=` também junta textos: a cada volta, o `texto` ganha mais um "ab" no final.'),
    ]),
    [
        QUIZ(C('''
            voltas = 0
            while voltas < 4:
                voltas += 1
            print("Voltas:", voltas)
            '''), 'Voltas: 4', ['Voltas: 3', 'Voltas: 5', 'Voltas: 0'],
            explicacao='O `voltas += 1` soma 1 a cada volta. Quando chega a 4, a condição `voltas < 4` dá `False`, e o `print` mostra o valor final: 4.'),
        DIGITE(C('''
            total = 0
            n = 2
            while n <= 8:
                total += n
                n += 2
            print(total)
            '''), '20',
            explicacao='O `n` passa por 2, 4, 6 e 8, e o `total` acumula a soma: 2 + 4 + 6 + 8 = 20. Com `n = 10`, a condição `n <= 8` dá `False`.'),
        QUIZ(C('''
            n = 1
            while n <= 3:
                total = 0
                total = total + n
                n = n + 1
            print(total)
            '''), '3', ['6', '1', '0'],
            explicacao='O `total = 0` está dentro do laço, então volta a zero a cada volta e as somas anteriores se perdem. Na última volta, o total vale 0 + 3.'),
        BUG(L('''
            total = 0
            n = 0
            while n < 3:
                total = total + input("Valor? ")
                n = n + 1
            print(total)
            '''), 4, '    total = total + int(input("Valor? "))', ['    total = total + str(input("Valor? "))', '    total = int(total + input("Valor? "))'],
            entrada=['5', '7', '1'],
            erro="TypeError: unsupported operand type(s) for +: 'int' and 'str'",
            enunciado='Este programa deveria somar três valores digitados, mas dá erro.',
            porque='O `input` devolve texto, e o `total` é um número. O Python não soma número com texto e mostra TypeError.',
            explicacao='O `int(...)` transforma cada valor digitado em número antes da soma. Usar `str` ou converter só depois da soma continua misturando texto e número.'),
        MONTE(L('''
            n = int(input("Até quanto? "))
            total = n
            while n > 1:
                n -= 1
                total += n
            print(total)
            '''), 'Até quanto? 4\n10', entrada=['4'],
            enunciado='Coloque as linhas na ordem certa. A pessoa digita 4, e o programa soma 4 + 3 + 2 + 1.',
            explicacao='O `total` começa com o próprio `n`. Dentro do laço, o `n` diminui antes de ser somado: 3, 2 e 1. O `print` fica fora do laço, depois da última volta.'),
        LACUNA(C('''
            total = 0
            n = 1
            while n <= 3:
                total {1} n
                n += 1
            print(total)
            '''), ['+='], ['-=', '=', '*='], '6',
            enunciado='Complete o código para ele mostrar a soma 1 + 2 + 3.',
            explicacao='O `+=` soma o `n` ao `total` a cada volta: 1 + 2 + 3 = 6. Com `=`, o total seria trocado a cada volta, e com `*=` ele ficaria sempre em 0.'),
        PARES([('total += 5', '25'), ('total -= 2', '4'), ('total *= 2', '80'), ('total = 7', '7')], _atalho_ok,
            enunciado='O `total` começa em 10 e a linha roda 3 vezes dentro de um laço. Ligue cada linha ao valor final do `total`.',
            esq_codigo=True, dir_codigo=True,
            explicacao='O `+= 5` soma 5 por três vezes (25), o `-= 2` tira 2 por três vezes (4), e o `*= 2` dobra três vezes (80). Já `total = 7` não acumula nada: só troca o valor.'),
        ERRO(C('''
            frase = ""
            n = 1
            while n <= 3:
                frase += n
                n += 1
            '''), 'TypeError', ['ValueError', 'NameError', 'SyntaxError'],
            explicacao='O `+=` com um texto junta outro texto, mas o `n` é um número. O Python não mistura os dois e avisa com TypeError. Com `str(n)`, a junção funcionaria.'),
        QUIZ(C('''
            n = 1
            pares = 0
            while n <= 6:
                if n % 2 == 0:
                    pares += 1
                n += 1
            print(pares)
            '''), '3', ['6', '12', '2'],
            explicacao='O `pares` é um contador: soma 1 a cada número par que aparece (2, 4 e 6), e não soma o valor do número. Por isso o resultado é 3, e não 12.'),
        DIGITE(C('''
            palavra = "sol"
            inversa = ""
            i = len(palavra) - 1
            while i >= 0:
                inversa += palavra[i]
                i -= 1
            print(inversa)
            '''), 'los',
            explicacao='O `i` começa no último índice (2) e vai até 0. A cada volta, o `+=` acrescenta ao fim de `inversa` a letra `palavra[i]`: l, depois o, depois s.'),
    ])

# ======================================================================= u04l03
L03 = LICAO('u04l03', 'for e range(n)', 'Repetir um número conhecido de vezes',
    INTRO([
        'O **`for`** repete um bloco **para cada** valor de uma sequência. Com `range(n)`, a sequência é a dos números de 0 até n - 1.',
        'O `range(5)` gera 0, 1, 2, 3 e 4: cinco valores, começando em 0 e **sem incluir** o 5. A variável do `for` (aqui, `i`) recebe um valor novo a cada volta.',
        'Use o `for` quando você sabe quantas voltas quer. Use o `while` quando o laço depende de uma condição que muda.',
        'No `for`, é o próprio laço que muda a variável. Não existe um `i = i + 1` lá dentro.',
    ], [
        EXEMPLO(C('''
            for i in range(3):
                print("Volta", i)
            print("Fim")
            '''), nota='O `i` vale 0, 1 e 2: o `range(3)` para antes do 3. São três voltas, mesmo começando em 0.'),
        EXEMPLO(C('''
            for i in range(4):
                print(i * 10)
            '''), nota='O `i` pode entrar em contas. Aqui, cada valor é multiplicado por 10.'),
    ]),
    [
        QUIZ(C('''
            for i in range(4):
                print(i)
            '''), '0\n1\n2\n3', ['1\n2\n3\n4', '0\n1\n2\n3\n4', '1\n2\n3'],
            explicacao='O `range(4)` gera 4 valores, começando em 0: 0, 1, 2 e 3. O 4 fica de fora.'),
        DIGITE(C('''
            total = 0
            for i in range(5):
                total += i
            print(total)
            '''), '10',
            explicacao='O `i` vale 0, 1, 2, 3 e 4, e o `total` acumula a soma: 0 + 1 + 2 + 3 + 4 = 10.'),
        QUIZ(C('''
            cont = 0
            for i in range(6):
                cont += 1
            print(cont, i)
            '''), '6 5', ['6 6', '5 5', '5 6'],
            explicacao='O `cont` conta as voltas: são 6. A variável `i` continua existindo depois do laço e guarda o último valor que recebeu, o 5.'),
        BUG(L('''
            voltas = 10 / 2
            for i in range(voltas):
                print("Volta", i)
            print("Fim")
            '''), 2, 'for i in range(int(voltas)):', ['for i in range(voltas / 1):', 'for i in range(round(voltas, 1)):'],
            erro="TypeError: 'float' object cannot be interpreted as an integer",
            enunciado='Este programa deveria mostrar 5 voltas e depois Fim, mas dá erro.',
            porque='A divisão com `/` sempre devolve `float`, então `voltas` vale 5.0. O `range` só aceita números inteiros, e o Python mostra TypeError.',
            explicacao='O `int(voltas)` transforma 5.0 em 5, que o `range` aceita. Dividir por 1 ou arredondar com uma casa ainda deixa um `float`.'),
        MONTE(L('''
            n = int(input("Quantas peças? "))
            for i in range(n):
                print("Peça", i + 1, "ok")
            print("Lote pronto")
            '''), 'Quantas peças? 3\nPeça 1 ok\nPeça 2 ok\nPeça 3 ok\nLote pronto', entrada=['3'],
            enunciado='Coloque as linhas na ordem certa. A pessoa digita 3, e o programa numera as 3 peças do lote e avisa no fim.',
            explicacao='O `n` é lido primeiro, porque o `range(n)` precisa dele. O `print` recuado fica dentro do `for` (o `i + 1` começa a numeração em 1), e o "Lote pronto" sem recuo aparece uma vez só, no fim.'),
        LACUNA(C('''
            {1} i in range({2}):
                print("Oi", i)
            '''), ['for', '3'], ['while', 'if', '4'], 'Oi 0\nOi 1\nOi 2',
            enunciado='Complete o código para ele mostrar: Oi 0, Oi 1 e Oi 2, em três linhas.',
            explicacao='O `for` percorre os valores do `range(3)`: 0, 1 e 2. Com `range(4)`, apareceria uma volta a mais, e o `while` pede uma condição, não uma sequência.'),
        PARES([('for i in range(3): print(i, end="")', '012'), ('for i in range(1): print(i, end="")', '0'),
               ('for i in range(5): print(i, end="")', '01234'), ('for i in range(4): print(i * 2, end="")', '0246')], 'saida',
            enunciado='Ligue cada laço ao que ele mostra na tela.', esq_codigo=True, dir_codigo=True,
            explicacao='O `range(n)` dá n voltas, do 0 até n - 1. O `end=""` mantém tudo na mesma linha, e o `i * 2` dobra cada valor: 0, 2, 4 e 6.'),
        ERRO(C('''
            for i in 5:
                print(i)
            '''), 'TypeError', ['ValueError', 'NameError', 'SyntaxError'],
            explicacao='O `for` precisa de uma sequência para percorrer, e o 5 é só um número. Com `range(5)`, o `for` recebe os valores de 0 a 4.'),
        QUIZ(C('''
            for i in range(6):
                if i % 2 == 0:
                    print(f"{i} é par")
            '''), '0 é par\n2 é par\n4 é par', ['2 é par\n4 é par\n6 é par', '0 é par\n2 é par\n4 é par\n6 é par', '1 é par\n3 é par\n5 é par'],
            explicacao='O `range(6)` vai de 0 a 5. O `if` deixa passar só os pares: 0, 2 e 4. O 6 não aparece, porque o `range` para antes dele.'),
        QUIZ(C('''
            total = 0
            for i in range(3):
                nota = int(input("Nota? "))
                total += nota
            print(total / 3)
            '''), '7.0', ['7', '21', '21.0'],
            entrada=['6', '8', '7'],
            explicacao='O laço lê três notas e soma: 6 + 8 + 7 = 21. A divisão com `/` sempre dá `float`, então 21 / 3 mostra 7.0, e não 7.'),
    ])

# ======================================================================= u04l04
def _faixa_ok(faixa, saida):
    return _roda('for n in %s: print(n, end="")' % faixa)[0] == saida


L04 = LICAO('u04l04', 'range com início e passo', 'range(início, fim, passo) e a contagem regressiva',
    INTRO([
        'O `range` aceita até três números: `range(início, fim, passo)`. O **início** é o primeiro valor, o **fim** não entra, e o **passo** é quanto muda a cada volta.',
        'Com dois números, o passo é 1: `range(2, 6)` gera 2, 3, 4 e 5. Com um número só, o início é 0, como você já viu.',
        'O passo pode ser negativo, para contar de trás para frente: `range(5, 0, -1)` gera 5, 4, 3, 2 e 1. O fim continua de fora.',
        'Quando o início já passou do fim, no sentido do passo, o `range` fica vazio e o laço não roda nenhuma vez.',
    ], [
        EXEMPLO(C('''
            for n in range(2, 11, 3):
                print(n)
            '''), nota='Começa em 2 e soma 3 a cada volta: 2, 5 e 8. O próximo seria 11, que chega ao fim e fica de fora.'),
        EXEMPLO(C('''
            for t in range(3, 0, -1):
                print("Faltam", t)
            print("Já!")
            '''), nota='Com passo -1, a contagem desce. O fim, 0, não entra, então o último valor é 1.'),
    ]),
    [
        QUIZ(C('''
            for i in range(2, 6):
                print(i)
            '''), '2\n3\n4\n5', ['2\n3\n4\n5\n6', '3\n4\n5\n6', '2\n3\n4'],
            explicacao='O `range(2, 6)` começa no 2 e vai até antes do 6. Por isso os valores são 2, 3, 4 e 5.'),
        DIGITE(C('''
            total = 0
            for n in range(1, 10, 2):
                total += n
            print(total)
            '''), '25',
            explicacao='Com passo 2, o `n` vale 1, 3, 5, 7 e 9. A soma é 1 + 3 + 5 + 7 + 9 = 25.'),
        QUIZ(C('''
            for n in range(10, 0, -3):
                print(n)
            '''), '10\n7\n4\n1', ['10\n7\n4', '10\n7\n4\n1\n-2', '7\n4\n1'],
            explicacao='Começa em 10 e desce 3 a cada volta: 10, 7, 4 e 1. O próximo seria -2, que já passou do fim (0), então o laço para.'),
        BUG(L('''
            inicio = input("Início? ")
            for n in range(inicio, 5):
                print(n)
            print("Fim")
            '''), 2, 'for n in range(int(inicio), 5):', ['for n in range(inicio, int(5)):', 'for n in range(inicio + 0, 5):'],
            entrada=['2'],
            erro="TypeError: 'str' object cannot be interpreted as an integer",
            enunciado='A pessoa digita 2. O programa deveria mostrar 2, 3, 4 e Fim, mas dá erro.',
            porque='O `input` devolve texto, e o `range` só aceita números inteiros. O Python mostra TypeError.',
            explicacao='O `int(inicio)` transforma o texto em número antes de entrar no `range`. Converter o 5, ou somar 0 a um texto, não resolve.'),
        MONTE(L('''
            inicio = int(input("Começar de? "))
            for t in range(inicio, 0, -1):
                print(t)
            print("Já!")
            '''), 'Começar de? 3\n3\n2\n1\nJá!', entrada=['3'],
            enunciado='Coloque as linhas na ordem certa. A pessoa digita 3, e o programa faz a contagem regressiva.',
            explicacao='O número inicial é lido primeiro, porque o `range` usa esse valor. O `print(t)` fica dentro do `for`, e o "Já!" só aparece depois da última volta.'),
        LACUNA(C('''
            for n in range({1}, {2}, {3}):
                print(n)
            '''), ['10', '0', '-5'], ['5', '-1', '20'], '10\n5',
            enunciado='Complete o código para ele contar de 10 até 5, de 5 em 5. A saída tem duas linhas.',
            explicacao='Começa em 10, e o passo -5 desce 5 por volta: 10 e 5. O próximo valor seria 0, mas o fim nunca entra, então o laço termina.'),
        PARES([('range(1, 4)', '123'), ('range(4, 1, -1)', '432'), ('range(0, 10, 4)', '048'), ('range(2, 9, 3)', '258')], _faixa_ok,
            enunciado='Cada `range` vai num `for` que mostra os valores na mesma linha. Ligue cada `range` ao que aparece.',
            esq_codigo=True, dir_codigo=True,
            explicacao='O início é o primeiro valor, o passo é o tamanho do salto, e o fim nunca entra. Com `range(4, 1, -1)`, a contagem desce: 4, 3 e 2.'),
        QUIZ(C('''
            for n in range(3, 0):
                print(n)
            print("Decolar!")
            '''), 'Decolar!', ['3\n2\n1\nDecolar!', '3\n2\n1\n0\nDecolar!', 'Decolar!\nDecolar!'],
            explicacao='Sem passo, o `range` sempre soma 1. De 3 para 0 não há valores, então o `for` não roda nenhuma vez. Para descer, o passo precisa ser negativo: `range(3, 0, -1)`.'),
        ERRO(C('''
            for n in range(1, 10, 0):
                print(n)
            '''), 'ValueError', ['TypeError', 'ZeroDivisionError', 'NameError'],
            explicacao='Com passo 0, o valor nunca sairia do lugar, e o `range` recusa. É um valor que não serve (ValueError); nenhuma divisão acontece aqui.'),
        QUIZ(C('''
            tabuada = int(input("Tabuada do? "))
            for i in range(1, 4):
                print(f"{tabuada} x {i} = {tabuada * i}")
            '''), '7 x 1 = 7\n7 x 2 = 14\n7 x 3 = 21', ['7 x 0 = 0\n7 x 1 = 7\n7 x 2 = 14', '7 x 1 = 7\n7 x 2 = 14\n7 x 3 = 21\n7 x 4 = 28', '7 x 1 = 7\n7 x 2 = 7\n7 x 3 = 7'],
            entrada=['7'],
            explicacao='O `range(1, 4)` dá 1, 2 e 3. A f-string troca `{i}` pelo valor da volta e calcula `{tabuada * i}`: 7, 14 e 21.'),
        DIGITE(C('''
            total = 100
            for n in range(50, 0, -20):
                total -= n
            print(total)
            '''), '10',
            explicacao='O `n` vale 50, 30 e 10. O `total` perde cada valor: 100 - 50 - 30 - 10 = 10.'),
    ])

# ======================================================================= u04l05
L05 = LICAO('u04l05', 'for em textos', 'Percorrer um texto, um caractere por vez',
    INTRO([
        'O `for` também percorre um texto, **um caractere por vez**: `for letra in "sol":` dá "s", depois "o", depois "l".',
        'Você escolhe o nome da variável do `for`. Ela recebe cada caractere em ordem, da esquerda para a direita, incluindo espaços e símbolos.',
        'Assim você não precisa contar índices à mão. Se precisar da posição de cada letra, use `range(len(texto))` e o índice `texto[i]`.',
        'O `for` percorre também os pedaços de um `split()`: `for palavra in frase.split():` dá uma palavra por volta.',
    ], [
        EXEMPLO(C('''
            for letra in "sol":
                print(letra)
            '''), nota='A cada volta, `letra` recebe o próximo caractere do texto.'),
        EXEMPLO(C('''
            frase = "ligar motor agora"
            for palavra in frase.split():
                print(palavra.upper())
            '''), nota='O `split()` quebra a frase em palavras, e o `for` pega uma por volta.'),
    ]),
    [
        QUIZ(C('''
            for c in "ABC":
                print(c + c)
            '''), 'AA\nBB\nCC', ['A\nB\nC', 'AABBCC', 'ABC'],
            explicacao='A cada volta, `c` guarda uma letra, e o `c + c` junta a letra com ela mesma. Cada `print` termina a linha, então são três linhas.'),
        DIGITE(C('''
            cont = 0
            for letra in "banana":
                if letra == "a":
                    cont += 1
            print(cont)
            '''), '3',
            explicacao='O `for` olha as seis letras de "banana". O contador soma 1 a cada "a" encontrado, e a palavra tem três deles.'),
        QUIZ(C('''
            novo = ""
            for letra in "casa":
                novo = letra + novo
            print(novo)
            '''), 'asac', ['casa', 'acas', 'aasc'],
            explicacao='A letra nova entra na frente do texto: "c", depois "ac", depois "sac" e por fim "asac". O resultado é a palavra invertida.'),
        BUG(L('''
            ano = 2026
            soma = 0
            for d in ano:
                soma += int(d)
            print(soma)
            '''), 3, 'for d in str(ano):', ['for d in int(ano):', 'for d in range(ano):'],
            erro="TypeError: 'int' object is not iterable",
            enunciado='Este programa deveria somar os dígitos de 2026 e mostrar 10, mas dá erro.',
            porque='O `for` percorre sequências, como textos, e o número 2026 não é uma sequência. O Python mostra TypeError.',
            explicacao='O `str(ano)` transforma o número no texto "2026", que o `for` percorre dígito por dígito. O `range(ano)` percorreria 2026 números, e não os dígitos.'),
        MONTE(L('''
            palavra = input("Palavra? ")
            for letra in palavra:
                print(letra, end="-")
            print("fim")
            '''), 'Palavra? sol\ns-o-l-fim', entrada=['sol'],
            enunciado='Coloque as linhas na ordem certa. A pessoa digita sol, e o programa mostra as letras separadas por traços.',
            explicacao='A palavra é lida primeiro. O `end="-"` mantém as letras na mesma linha, com um traço depois de cada uma, e o "fim" só aparece depois da última volta.'),
        LACUNA(C('''
            senha = "a1b22"
            numeros = 0
            for c in senha:
                if c.{1}():
                    numeros {2} 1
            print(numeros)
            '''), ['isdigit', '+='], ['isalpha', '-=', '='], '3',
            enunciado='Complete o código para ele contar os números da senha e mostrar 3.',
            explicacao='O `isdigit()` confere se o caractere é um número, e o `+=` soma 1 ao contador a cada acerto. Com `isalpha()`, o código contaria as letras: 2.'),
        PARES([('for c in "oi": print(c, end="")', 'oi'), ('for c in "oi": print(c * 2, end="")', 'ooii'),
               ('for c in "ab": print(c, end="-")', 'a-b-'), ('for c in "ab": print(c.upper(), end="")', 'AB')], 'saida',
            enunciado='Ligue cada laço ao que ele mostra na tela.', esq_codigo=True, dir_codigo=True,
            explicacao='O `for` pega uma letra por volta. O `c * 2` repete a letra, o `end="-"` põe um traço depois de cada uma, e o `upper()` deixa a letra em maiúscula.'),
        ERRO(C('''
            palavra = "sol"
            for i in range(len(palavra) + 1):
                print(palavra[i])
            '''), 'IndexError', ['ValueError', 'TypeError', 'NameError'],
            explicacao='O texto "sol" tem os índices 0, 1 e 2. O `range(len(palavra) + 1)` chega ao 3, que não existe, e o Python avisa com IndexError.'),
        QUIZ(C('''
            frase = "abrir a porta"
            for palavra in frase.split():
                print(len(palavra), palavra[0])
            '''), '5 a\n1 a\n5 p', ['a 5\na 1\np 5', '5 a\n1 a\n6 p', '3 a\n1 a\n5 p'],
            explicacao='O `split()` entrega as palavras "abrir", "a" e "porta". Em cada volta, o `print` mostra o tamanho da palavra e a primeira letra dela.'),
        DIGITE(C('''
            codigo = "A1B22C"
            letras = ""
            soma = 0
            for c in codigo:
                if c.isdigit():
                    soma += int(c)
                else:
                    letras += c
            print(letras, soma)
            '''), 'ABC 5',
            explicacao='Os dígitos 1, 2 e 2 vão para a soma (5), e as letras A, B e C se juntam em `letras`. O `print` mostra os dois resultados, separados por espaço.'),
    ])

# ======================================================================= u04l06
def _parada_ok(condicao, saida):
    # mostra o n e depois para se a condição for True
    programa = 'for n in range(1, 8):\n    print(n, end="")\n    if %s:\n        break' % condicao
    return _roda(programa)[0] == saida


L06 = LICAO('u04l06', 'break: sair do laço', 'Interromper um laço antes do fim',
    INTRO([
        'O **`break`** ("quebrar") interrompe o laço na hora, e o programa segue com a primeira linha depois dele. Funciona no `while` e no `for`.',
        'O `break` quase sempre fica dentro de um `if`: "se achou o que procurava, pare".',
        'Com `while True:` a condição nunca dá `False`, então o laço não termina sozinho. Quem decide quando parar é o `break`.',
        'Depois do `break`, o resto do bloco daquela volta não roda. O `break` só vale dentro de um laço.',
    ], [
        EXEMPLO(C('''
            for n in range(1, 10):
                if n * n > 20:
                    print("Parou em", n)
                    break
            print("Fim")
            '''), nota='O laço previa 9 voltas, mas o `break` o interrompeu no 5. O `print("Fim")` roda normalmente.'),
        EXEMPLO(C('''
            while True:
                senha = input("Senha? ")
                if senha == "1234":
                    break
            print("Acesso liberado")
            '''), entrada=['0000', '1234'], nota='O `while True` não para sozinho. O `break` só roda quando a senha está certa.'),
    ]),
    [
        QUIZ(C('''
            for i in range(5):
                if i == 3:
                    break
                print(i)
            '''), '0\n1\n2', ['0\n1\n2\n3', '0\n1\n2\n3\n4', '3'],
            explicacao='Quando o `i` chega a 3, o `break` encerra o laço antes do `print`. Por isso o 3 não aparece.'),
        DIGITE(C('''
            total = 0
            for n in range(1, 100):
                total += n
                if total > 10:
                    break
            print(n)
            '''), '5',
            explicacao='O total vai a 1, 3, 6, 10 e 15. Na volta do 5, o total passa de 10 e o `break` encerra o laço, com o `n` ainda valendo 5.'),
        QUIZ(C('''
            n = 1
            while n < 100:
                n *= 2
                if n > 30:
                    break
            print(n)
            '''), '32', ['128', '30', '16'],
            explicacao='O `n` dobra: 2, 4, 8, 16 e 32. Com 32, o `if` passa de 30 e o `break` encerra o laço. Sem o `break`, o laço seguiria até 128.'),
        BUG(L('''
            while True:
                n = input("Número? ")
                if n > 10:
                    break
                print("Até 10")
            print("Fim")
            '''), 3, '    if int(n) > 10:', ['    if n > int(10):', '    if str(n) > 10:'],
            entrada=['5', '20'],
            erro="TypeError: '>' not supported between instances of 'str' and 'int'",
            enunciado='A pessoa digita 5 e depois 20. O programa deveria mostrar Até 10 e depois Fim, mas dá erro.',
            porque='O `input` devolve texto, e o Python não compara texto com número. O erro aparece na linha do `if`, e o Python mostra TypeError.',
            explicacao='O `int(n)` transforma o texto em número antes da comparação. Converter só o 10, ou transformar o `n` em texto, continua comparando texto com número.'),
        MONTE(L('''
            for n in range(1, 20):
                if n % 7 == 0:
                    print("Primeiro múltiplo de 7:", n)
                    break
            print("Fim")
            '''), 'Primeiro múltiplo de 7: 7\nFim',
            explicacao='O `print` e o `break` ficam dentro do `if`, nessa ordem: primeiro mostra, depois sai. O `print("Fim")` sem recuo roda uma vez só, depois do laço.'),
        LACUNA(C('''
            for n in range(1, 10):
                if n {1} 4:
                    {2}
                print(n)
            '''), ['==', 'break'], ['pass', 'stop', '>'], '1\n2\n3',
            enunciado='Complete o código para ele parar quando o n chegar a 4 e mostrar só 1, 2 e 3.',
            explicacao='Quando `n == 4`, o `break` encerra o laço antes do `print`. Com `pass`, nada para, e com `n > 4` o 4 ainda seria mostrado. O `stop` não existe no Python.'),
        PARES([('n == 4', '1234'), ('n > 5', '123456'), ('n % 3 == 0', '123'), ('n * 2 > 9', '12345')], _parada_ok,
            enunciado='Num `for` com n de 1 a 7, o programa mostra o n e depois para (`break`) se a condição for `True`. Ligue cada condição ao que aparece.',
            esq_codigo=True, dir_codigo=True,
            explicacao='O `n` é mostrado antes do teste, então o valor que faz a condição dar `True` aparece e é o último. Com `n * 2 > 9`, isso acontece no 5, porque 5 * 2 é 10.'),
        ERRO(C('''
            saldo = 0
            if saldo == 0:
                print("Sem saldo")
                break
            print("Fim")
            '''), 'SyntaxError', ['IndentationError', 'NameError', 'ValueError'],
            explicacao='O `break` só existe dentro de um laço, `while` ou `for`. Dentro de um `if` solto, o Python não sabe o que interromper e avisa com SyntaxError.'),
        QUIZ(C('''
            palavra = "prato"
            pos = -1
            for i in range(len(palavra)):
                if palavra[i] in "aeiou":
                    pos = i
                    break
            print(pos)
            '''), '2', ['4', '3', '-1'],
            explicacao='O laço procura a primeira vogal: o "a", no índice 2, e o `break` encerra a busca ali. Sem o `break`, o laço continuaria e `pos` acabaria valendo 4, o índice do "o".'),
        QUIZ(C('''
            total = 0
            while True:
                valor = int(input("Valor? "))
                if valor == 0:
                    break
                total += valor
            print(total)
            '''), '10', ['19', '0', '4'],
            entrada=['4', '6', '0', '9'],
            explicacao='O laço soma 4 e 6. Ao ler o 0, o `break` interrompe tudo, e o 9 nem chega a ser lido.'),
    ])

# ======================================================================= u04l07
def _pulo_ok(linha, saida):
    # quando n vale 2, roda a linha escolhida; depois, em toda volta, mostra o n
    programa = 'for n in range(1, 5):\n    if n == 2:\n        %s\n    print(n, end="")' % linha
    return _roda(programa)[0] == saida


L07 = LICAO('u04l07', 'continue e else do laço', 'Pular uma volta e rodar um bloco quando não houve break',
    INTRO([
        'O **`continue`** ("continuar") pula o resto da volta atual e vai direto para a próxima. O laço não termina: só aquela volta é cortada.',
        'No `for`, a próxima volta usa o próximo valor. No `while`, o Python volta a testar a condição, então a variável da condição precisa mudar **antes** do `continue`.',
        'O laço também pode ter um **`else`**: o bloco dele roda quando o laço termina sem ter sido interrompido por um `break`.',
        'Se o laço terminou por causa de um `break`, o `else` do laço é pulado. É um jeito de saber se a busca achou algo.',
    ], [
        EXEMPLO(C('''
            for n in range(1, 6):
                if n == 3:
                    continue
                print(n)
            '''), nota='Quando `n` vale 3, o `continue` pula o `print`, e o laço segue para o 4.'),
        EXEMPLO(C('''
            for n in range(2, 5):
                if n == 7:
                    break
            else:
                print("Não achou o 7")
            '''), nota='O `break` nunca rodou, então o `else` do laço rodou.'),
    ]),
    [
        QUIZ(C('''
            for i in range(5):
                if i % 2 == 0:
                    continue
                print(i)
            '''), '1\n3', ['0\n2\n4', '0\n1\n2\n3\n4', '1\n3\n5'],
            explicacao='Quando o `i` é par, o `continue` pula o `print`. Só os ímpares do `range(5)`, 1 e 3, são mostrados.'),
        DIGITE(C('''
            total = 0
            for n in range(1, 8):
                if n % 3 == 0:
                    continue
                total += n
            print(total)
            '''), '19',
            explicacao='O `continue` pula os múltiplos de 3, que são 3 e 6. Sobram 1, 2, 4, 5 e 7, e a soma é 19.'),
        QUIZ(C('''
            for n in range(1, 5):
                if n == 3:
                    break
            else:
                print("Terminou")
            print("Fim")
            '''), 'Fim', ['Terminou\nFim', 'Terminou', 'Fim\nTerminou'],
            explicacao='O `break` rodou quando o `n` chegou a 3, então o `else` do laço foi pulado. Só o `print("Fim")`, que vem depois do laço, aparece.'),
        BUG(L('''
            for n in range(3):
                print(n)
            else
                print("Acabou")
            '''), 3, 'else:', ['else;', 'elif:'],
            erro="SyntaxError: expected ':'",
            enunciado='Este programa deveria mostrar 0, 1, 2 e Acabou, mas dá erro.',
            porque='O `else` do laço, como o do `if`, termina com dois-pontos. Sem eles, o Python não sabe onde o `else` termina e mostra SyntaxError.',
            explicacao='Com `else:`, o bloco recuado passa a ser o `else` do laço. Ponto e vírgula não substitui os dois-pontos, e o `elif` exigiria uma condição.'),
        MONTE(L('''
            n = 0
            while n < 5:
                n += 1
                if n == 3:
                    continue
                print(n)
            '''), '1\n2\n4\n5',
            enunciado='Coloque as linhas na ordem certa. O programa conta de 1 a 5, pulando o 3.',
            explicacao='O `n += 1` vem antes do `continue`: se viesse depois, o `n` ficaria preso no 3 e o laço nunca terminaria. O `print` fica no fim da volta, e o `continue` o pula quando o `n` vale 3.'),
        LACUNA(C('''
            for n in range(2, 5):
                if n == {1}:
                    break
            {2}:
                print("Não achou")
            '''), ['7', 'else'], ['3', 'elif', 'then'], 'Não achou',
            enunciado='Complete o código para ele mostrar: Não achou',
            explicacao='O `else` do laço roda quando o laço termina sem `break`. Como o `n` nunca vale 7, o `break` não roda e o `else` mostra a mensagem. Com 3, o `break` rodaria e o `else` seria pulado.'),
        PARES([('continue', '134'), ('break', '1'), ('pass', '1234'), ('print("x", end="")', '1x234')], _pulo_ok,
            enunciado='Num `for` com n de 1 a 4, quando n vale 2 roda a linha abaixo; depois, em toda volta, o programa mostra o n (na mesma linha). Ligue cada linha ao resultado.',
            esq_codigo=True, dir_codigo=True,
            explicacao='O `continue` pula só o `print` do 2, e o `break` encerra o laço depois de mostrar o 1. O `pass` não faz nada, e o `print("x")` acrescenta um x antes do 2.'),
        ERRO(C('''
            for n in range(-2, 3):
                print(10 // n)
            '''), 'ZeroDivisionError', ['ValueError', 'IndexError', 'TypeError'],
            explicacao='Os valores de `n` são -2, -1, 0, 1 e 2. Quando o `n` chega a 0, a divisão `10 // 0` dá ZeroDivisionError. Um `if n == 0: continue` antes da conta pularia o zero.'),
        QUIZ(C('''
            n = 7
            for d in range(2, n):
                if n % d == 0:
                    print("Não é primo")
                    break
            else:
                print("É primo")
            '''), 'É primo', ['Não é primo', 'É primo\nNão é primo', 'Não é primo\nÉ primo'],
            explicacao='Nenhum `d` de 2 a 6 divide o 7 sem deixar resto, então o `break` nunca roda e o `else` do laço mostra "É primo". Se algum `d` dividisse, o `break` pularia o `else`.'),
        QUIZ(C('''
            for n in range(1, 8):
                if n % 2 == 0:
                    continue
                if n > 5:
                    break
                print(n)
            else:
                print("Acabou")
            '''), '1\n3\n5', ['1\n3\n5\nAcabou', '1\n3\n5\n7', '1\n3'],
            explicacao='Os pares são pulados pelo `continue`. O 7 passa de 5 e dispara o `break`, então o `else` do laço não roda: aparecem só 1, 3 e 5.'),
    ])

# ======================================================================= u04l08
def _aninhado_ok(descricao, total):
    # lê os dois range da descrição e conta de verdade quantas vezes o bloco de dentro roda
    fora, dentro = descricao.replace('fora: ', '').split(', dentro: ')
    programa = 'cont = 0\nfor i in %s:\n    for j in %s:\n        cont += 1\nprint(cont)' % (fora, dentro)
    return _roda(programa)[0] == total


L08 = LICAO('u04l08', 'Laços aninhados', 'Um laço dentro de outro',
    INTRO([
        'Um **laço aninhado** é um laço dentro de outro. A cada volta do laço de fora, o laço de dentro roda **inteiro**.',
        'Pense numa linha de produção: para cada caixa (laço de fora), o robô coloca 3 peças (laço de dentro).',
        'Quando o laço de dentro sempre dá o mesmo número de voltas, o total é o produto: 3 voltas de fora e 4 de dentro dão 12.',
        'Cada laço usa a sua própria variável, como `i` por fora e `j` por dentro. Um `break` interrompe só o laço em que ele está.',
    ], [
        EXEMPLO(C('''
            for i in range(1, 4):
                for j in range(1, 3):
                    print(i, j)
            '''), nota='Para cada `i`, o `j` percorre 1 e 2 inteiros. São 3 x 2 = 6 voltas de dentro.'),
        EXEMPLO(C('''
            for linha in range(3):
                for col in range(4):
                    print("*", end="")
                print()
            '''), nota='O `print()` vazio, depois do laço de dentro, muda de linha. Assim sai um retângulo de 3 linhas por 4 colunas.'),
    ]),
    [
        QUIZ(C('''
            cont = 0
            for i in range(3):
                for j in range(4):
                    cont += 1
            print(cont)
            '''), '12', ['7', '3', '4'],
            explicacao='Para cada uma das 3 voltas de fora, o laço de dentro faz 4 voltas. O `cont += 1` roda 3 x 4 = 12 vezes, e não 3 + 4.'),
        QUIZ(C('''
            for a in range(2):
                for b in range(2):
                    print(a * 10 + b)
            '''), '0\n1\n10\n11', ['0\n10\n1\n11', '0\n1\n2\n3', '0\n11'],
            explicacao='Com `a = 0`, o `b` vai de 0 a 1 e mostra 0 e 1. Só depois o `a` vira 1, e aparecem 10 e 11. O laço de dentro termina antes de o de fora avançar.'),
        DIGITE(C('''
            total = 0
            for i in range(2):
                for j in range(3):
                    total += j
            print(total)
            '''), '6',
            explicacao='Para cada `i`, o `j` vale 0, 1 e 2, e a soma da volta é 3. Como o laço de fora faz 2 voltas, o total é 3 + 3 = 6.'),
        BUG(L('''
            for i in range(1, 3):
                for j in range(1, 3):
                    print(i j)
            print("Fim")
            '''), 3, '        print(i, j)', ['        print(i + j)', '        print(ij)'],
            erro='SyntaxError: invalid syntax. Perhaps you forgot a comma?',
            enunciado='Este programa deveria mostrar os pares 1 1, 1 2, 2 1 e 2 2, mas dá erro.',
            porque='Dois valores no `print` precisam de uma vírgula entre eles. Sem a vírgula, o Python não entende a linha e mostra SyntaxError.',
            explicacao='Com a vírgula, o `print` mostra `i` e `j` lado a lado. O `i + j` somaria os dois, e `ij` seria um nome que não existe.'),
        MONTE(L('''
            n = int(input("Lado? "))
            for i in range(n):
                for j in range(n):
                    print("*", end="")
                print()
            '''), 'Lado? 3\n***\n***\n***', entrada=['3'],
            enunciado='Coloque as linhas na ordem certa. A pessoa digita 3, e o programa desenha um quadrado de asteriscos.',
            explicacao='O lado é lido primeiro. O `print("*", end="")` fica dentro dos dois laços, e o `print()` fica só no laço de fora, depois do de dentro, para mudar de linha a cada fileira.'),
        LACUNA(C('''
            for i in range(1, 4):
                for j in range(1, {1}):
                    print("*", end="")
                {2}()
            '''), ['i + 1', 'print'], ['i', '4', 'input'], '*\n**\n***',
            enunciado='Complete o código para ele desenhar um triângulo de asteriscos com 3 linhas.',
            explicacao='O laço de dentro precisa chegar até `i`, incluindo ele, por isso o `range(1, i + 1)`. O `print()` vazio muda de linha depois de cada fileira.'),
        PARES([('fora: range(3), dentro: range(5)', '15'), ('fora: range(2), dentro: range(1, 6)', '10'),
               ('fora: range(1, 5), dentro: range(2)', '8'), ('fora: range(4, 0, -1), dentro: range(3)', '12')], _aninhado_ok,
            enunciado='Ligue cada par de laços ao número de vezes que o bloco de dentro roda.', esq_codigo=True, dir_codigo=True,
            explicacao='O total é o número de valores do laço de fora vezes o do laço de dentro. O `range(1, 5)` tem 4 valores, o `range(1, 6)` tem 5, e o `range(4, 0, -1)` tem 4.'),
        ERRO(C('''
            palavra = "ab"
            for i in range(len(palavra)):
                for j in range(3):
                    print(palavra[j])
            '''), 'IndexError', ['TypeError', 'NameError', 'ValueError'],
            explicacao='O texto "ab" só tem os índices 0 e 1. Na primeira volta de fora, o `j` chega a 2, que não existe, e o Python avisa com IndexError.'),
        QUIZ(C('''
            for i in range(3):
                for j in range(3):
                    if j == 1:
                        break
                    print(i, j)
            '''), '0 0\n1 0\n2 0', ['0 0', '0 0\n1 0', '0 0\n0 1'],
            explicacao='O `break` interrompe só o laço de dentro. Para cada `i`, o `j` mostra o 0 e para no 1; depois o laço de fora segue para o próximo `i`.'),
        QUIZ(C('''
            for i in range(1, 4):
                linha = ""
                for j in range(1, 4):
                    linha += str(i * j)
                print(linha)
            '''), '123\n246\n369', ['123\n123\n123', '111\n222\n333', '123\n456\n789'],
            explicacao='Para cada `i`, a variável `linha` recomeça vazia e junta `i * j` para j = 1, 2 e 3. O `print` fica no laço de fora, depois do de dentro: uma linha por `i`.'),
    ])

# ======================================================================= u04l09
_PADROES = {
    'Somar os valores': 'total',
    'Achar o maior valor': 'maior',
    'Contar quantos valores': 'cont',
    'Calcular a média': 'total / cont',
}


def _padrao_ok(tarefa, resultado):
    # os valores lidos são 2, 4 e 6; roda os quatro padrões juntos e mostra o resultado da tarefa
    programa = ('total = 0\nmaior = 0\ncont = 0\nfor k in range(3):\n    n = (k + 1) * 2\n    total += n\n    cont += 1\n'
                '    if n > maior:\n        maior = n\nprint(%s)') % _PADROES[tarefa]
    return _roda(programa)[0] == resultado


L09 = LICAO('u04l09', 'Padrões clássicos', 'Somar, contar, média, maior valor e validar entrada',
    INTRO([
        'Alguns usos de laço aparecem o tempo todo. Reconhecer o formato de cada um ajuda a escrever a solução:',
    ], [
        EXEMPLO(C('''
            maior = int(input("Valor? "))
            for i in range(2):
                valor = int(input("Valor? "))
                if valor > maior:
                    maior = valor
            print("Maior:", maior)
            '''), entrada=['4', '9', '6'], nota='O `maior` começa com o primeiro valor lido. Cada valor novo só o troca se for maior.'),
        EXEMPLO(C('''
            total = 0
            for i in range(3):
                total += int(input("Preço? "))
            print("Média:", total / 3)
            '''), entrada=['10', '20', '30'], nota='A soma fica no laço, e a divisão fica depois dele, quando todos os valores já foram somados.'),
    ], lista=[
        '**Somar**: `total = 0` antes do laço e `total += valor` dentro dele.',
        '**Contar**: `cont = 0` antes e `cont += 1` dentro de um `if`.',
        '**Média**: a soma dividida pela quantidade, depois do laço.',
        '**Maior**: começa com um valor dos dados e troca quando aparece um maior.',
        '**Validar**: um `while` que repete a pergunta até a resposta servir.',
    ], depois=[
        'Em todos, a preparação (o `= 0`, o primeiro valor) vem antes do laço, e o resultado final é mostrado depois dele.',
    ]),
    [
        QUIZ(C('''
            total = 0
            cont = 0
            for n in range(1, 8):
                if n % 2 == 1:
                    total += n
                    cont += 1
            print(total, cont, total / cont)
            '''), '16 4 4.0', ['16 4 4', '16 4 8.0', '28 7 4.0'],
            explicacao='Os ímpares de 1 a 7 são 1, 3, 5 e 7: a soma é 16, e são 4 valores. A média é 16 / 4 = 4.0, e a divisão com `/` sempre dá `float`.'),
        DIGITE(C('''
            maior = 0
            for n in range(1, 6):
                valor = (n * 7) % 10
                if valor > maior:
                    maior = valor
            print(maior)
            '''), '8',
            explicacao='Os valores são 7, 4, 1, 8 e 5. O `maior` troca para 7 e depois para 8, e os outros não são maiores que ele.'),
        QUIZ(C('''
            maior = 0
            for valor in range(-5, -1):
                if valor > maior:
                    maior = valor
            print(maior)
            '''), '0', ['-2', '-5', '-1'],
            explicacao='Todos os valores são negativos, e nenhum é maior que 0, então o `maior` nunca troca e continua em 0, que nem faz parte dos dados. Por isso é melhor começar com um valor dos dados.'),
        BUG(L('''
            total = 0
            for i in range(2):
                preco = int(input("Preço? "))
                total += preco
            print("Total:", total)
            '''), 3, '    preco = float(input("Preço? "))', ['    preco = int(float(input("Preço? ")))', '    preco = str(input("Preço? "))'],
            entrada=['4.5', '2.5'],
            erro="ValueError: invalid literal for int() with base 10: '4.5'",
            enunciado='A pessoa digita 4.5 e depois 2.5. O programa deveria mostrar Total: 7.0, mas dá erro.',
            porque='O `int` só aceita texto de número inteiro, e "4.5" tem um ponto decimal. O Python mostra ValueError.',
            explicacao='O `float` aceita números com casas decimais. O `int(float(...))` até roda, mas corta as casas e mostra 6, e o `str` deixaria a soma misturar texto e número.'),
        MONTE(L('''
            nota = int(input("Nota de 0 a 10? "))
            while nota < 0 or nota > 10:
                nota = int(input("Inválida. Nota? "))
            print("Nota:", nota)
            '''), 'Nota de 0 a 10? 15\nInválida. Nota? 8\nNota: 8', entrada=['15', '8'],
            enunciado='Coloque as linhas na ordem certa. A pessoa digita 15 e depois 8, e o programa só aceita notas de 0 a 10.',
            explicacao='A primeira leitura vem antes do laço, para a condição ter um valor para testar. Dentro do laço, a leitura repete a pergunta, e o resultado só é mostrado quando a nota serve.'),
        LACUNA(C('''
            maior = 0
            for n in range(1, 6):
                valor = n * 3 % 5
                if valor {1} maior:
                    maior = valor
            print(maior)
            '''), ['>'], ['<', '==', '!='], '4',
            enunciado='Complete o código para ele mostrar o maior valor. Os valores são 3, 1, 4, 2 e 0.',
            explicacao='O `maior` só deve trocar quando o valor novo é maior que ele, por isso `valor > maior`. Com `<`, ele nunca trocaria, e com `!=` ele ficaria com o último valor.'),
        PARES([('Somar os valores', '12'), ('Achar o maior valor', '6'), ('Contar quantos valores', '3'), ('Calcular a média', '4.0')], _padrao_ok,
            enunciado='Os valores lidos são 2, 4 e 6. Ligue cada tarefa ao resultado dela.', esq_codigo=False, dir_codigo=True,
            explicacao='A soma é 2 + 4 + 6 = 12, o maior é o 6, e são 3 valores. A média é 12 dividido por 3, que dá 4.0 porque a divisão com `/` devolve `float`.'),
        ERRO(C('''
            total = 0
            cont = 0
            for n in range(0):
                total += n
                cont += 1
            print(total / cont)
            '''), 'ZeroDivisionError', ['ValueError', 'TypeError', 'NameError'],
            explicacao='O `range(0)` não tem valores, então o laço não roda e o `cont` continua em 0. A média divide por 0, e o Python avisa com ZeroDivisionError. Um `if cont > 0` evitaria o erro.'),
        QUIZ(C('''
            soma = 0
            cont = 0
            valor = int(input("Valor? "))
            while valor != 0:
                soma += valor
                cont += 1
                valor = int(input("Valor? "))
            print(soma, cont)
            '''), '12 2', ['12 3', '12 1', '7 2'],
            entrada=['5', '7', '0'],
            explicacao='O laço soma cada valor e conta quantos vieram, até ler o 0. O 0 encerra o laço e não entra na soma nem na contagem: 5 + 7 = 12, em 2 valores.'),
        QUIZ(C('''
            total = 0
            while True:
                n = int(input("Valor? "))
                if n < 0:
                    continue
                if n == 0:
                    break
                total += n
            print(total)
            '''), '7', ['6', '10', '16'],
            entrada=['3', '-1', '4', '0', '9'],
            explicacao='O -1 é pulado pelo `continue`, e o 0 encerra o laço com `break`. Só o 3 e o 4 entram na soma, e o 9 nem chega a ser lido.'),
    ])

# ======================================================================= u04l10
def _cabecalho_ok(cabecalho, voltas):
    # conta de verdade quantas voltas o laço dá
    return _roda('cont = 0\n%s:\n    cont += 1\nprint(cont)' % cabecalho)[0] == voltas


L10 = LICAO('u04l10', 'Revisão: repetição', 'while, for, range, break, continue, else e laços aninhados, tudo junto',
    INTRO([
        'Esta lição junta tudo da unidade. Estas são as ideias principais:',
    ], [
        EXEMPLO(C('''
            pecas = 0
            for hora in range(1, 9):
                if hora == 4:
                    continue
                pecas += 12
                if pecas >= 60:
                    break
            print(f"Hora {hora}: {pecas} peças")
            '''), nota='A hora 4 é pulada pelo `continue`, e o `break` encerra o laço na hora 6, quando a meta de 60 peças é atingida.'),
    ], lista=[
        'Repetir enquanto uma condição vale: `while`. Repetir um número de vezes: `for` com `range(início, fim, passo)`.',
        'Percorrer um texto: `for letra in texto`.',
        'Controlar o laço: `break` sai, `continue` pula a volta, e o `else` do laço roda se não houve `break`.',
        'Laços aninhados: o de dentro roda inteiro a cada volta do de fora.',
        'Padrões: somar, contar, média, maior valor e validar entrada.',
    ], depois=[
        'Antes do laço, prepare as variáveis. Dentro dele, mude a variável da condição (no `while`); depois dele, mostre o resultado.',
        'O exemplo abaixo mistura várias dessas ideias num único laço de produção.',
    ]),
    [
        QUIZ(C('''
            x = 0
            for i in range(1, 6):
                if i == 2:
                    continue
                if i == 5:
                    break
                x += i
            print(x)
            '''), '8', ['10', '13', '9'],
            explicacao='O `continue` pula o 2, e o `break` encerra o laço no 5, antes da soma. Entram o 1, o 3 e o 4, e o total é 8.'),
        DIGITE(C('''
            a = 100
            passos = 0
            while a > 10:
                a = a // 2
                passos += 1
            print(passos)
            '''), '4',
            explicacao='O `a` vai de 100 para 50, 25, 12 e 6, e só então a condição `a > 10` dá `False`. Foram 4 voltas.'),
        QUIZ(C('''
            senha = "Ab3d9"
            letras = 0
            numeros = 0
            for c in senha:
                if c.isdigit():
                    numeros += 1
                elif c.isalpha():
                    letras += 1
            print(letras, numeros)
            '''), '3 2', ['2 3', '5 0', '4 1'],
            explicacao='A senha tem três letras (A, b e d) e dois números (3 e 9). Cada caractere entra no `if` ou no `elif`, e só um dos contadores soma.'),
        BUG(L('''
            soma = 0
            for i range(4):
                soma += i
            print(soma)
            '''), 2, 'for i in range(4):', ['for i in range(4)', 'for i = range(4):'],
            erro='SyntaxError: invalid syntax',
            enunciado='Este programa deveria mostrar 6, mas dá erro.',
            porque='O `for` precisa da palavra `in` entre a variável e a sequência. Sem ela, o Python não entende a linha e mostra SyntaxError.',
            explicacao='Com `in`, o `for` sabe o que percorrer. Um `=` no lugar do `in` continua errado, e sem os dois-pontos o Python reclama de novo.'),
        MONTE(L('''
            n = int(input("Número? "))
            for d in range(2, n):
                if n % d == 0:
                    print("Divisível por", d)
                    break
            else:
                print("Primo")
            '''), 'Número? 9\nDivisível por 3', entrada=['9'],
            enunciado='Coloque as linhas na ordem certa. A pessoa digita 9, e o programa procura o primeiro divisor.',
            explicacao='O número é lido primeiro. O `print` e o `break` ficam dentro do `if`, nessa ordem. O `else` do laço fica na mesma coluna do `for`, no fim, e só roda se o `break` não rodou.'),
        LACUNA(C('''
            total = 0
            n = 0
            while True:
                n += 1
                if n % 2 == 0:
                    {1}
                total += n
                if n >= 5:
                    break
            print(total)
            '''), ['continue'], ['pass', 'break', 'stop'], '9',
            enunciado='Complete o código para somar só os números ímpares de 1 a 5 e mostrar 9.',
            explicacao='O `continue` pula a soma quando o `n` é par, então entram só 1, 3 e 5: o total é 9. Com `pass`, os pares também entrariam, e com `break` o laço pararia no 2.'),
        PARES([('for c in "motor"', '5'), ('for i in range(2, 9, 2)', '4'), ('for i in range(7)', '7'), ('for i in range(10, 0, -5)', '2')], _cabecalho_ok,
            enunciado='Ligue cada cabeçalho de laço ao número de voltas que ele dá.', esq_codigo=True, dir_codigo=True,
            explicacao='O texto "motor" tem 5 letras, uma por volta. O `range(2, 9, 2)` dá 2, 4, 6 e 8. O `range(7)` dá 7 valores, e o `range(10, 0, -5)` dá só 10 e 5.'),
        ERRO(C('''
            for i in range(0):
                ultimo = i
            print(ultimo)
            '''), 'NameError', ['IndexError', 'ValueError', 'TypeError'],
            explicacao='O `range(0)` não tem valores, então o corpo do laço nunca roda e a variável `ultimo` nunca é criada. Pedir um nome que não existe dá NameError.'),
        QUIZ(C('''
            n = 1234
            soma = 0
            while n > 0:
                soma += n % 10
                n = n // 10
            print(soma)
            '''), '10', ['4', '1234', '123'],
            explicacao='A cada volta, `n % 10` pega o último dígito (4, 3, 2 e 1) e `n // 10` o remove. A soma 4 + 3 + 2 + 1 dá 10, e o laço termina quando o `n` chega a 0.'),
        QUIZ(C('''
            cont = 0
            for i in range(1, 4):
                for j in range(1, 4):
                    if i == j:
                        continue
                    cont += 1
            print(cont)
            '''), '6', ['9', '3', '4'],
            explicacao='São 3 x 3 = 9 pares (`i`, `j`). O `continue` pula os 3 pares em que `i` e `j` são iguais, e sobram 6.'),
        DIGITE(C('''
            n = 1
            while True:
                if n % 4 == 0 and n % 6 == 0:
                    break
                n += 1
            print(n)
            '''), '12',
            explicacao='O laço testa 1, 2, 3 e assim por diante, até achar o primeiro número divisível por 4 e por 6 ao mesmo tempo. Esse número é o 12.'),
    ])

UNIDADE('u04', 'Repetição', 'Repetir tarefas com while e for.', [L01, L02, L03, L04, L05, L06, L07, L08, L09, L10])
