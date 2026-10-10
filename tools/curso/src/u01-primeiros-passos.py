# -*- coding: utf-8 -*-
# Unidade 1 — Primeiros passos em Python.  Veja tools/curso/GUIA-AUTORES.md
from dsl import *

# ======================================================================= u01l01
L01 = LICAO('u01l01', 'print() e texto', 'Mostrar mensagens na tela',
    INTRO([
        'O computador lê o programa de cima para baixo, uma linha de cada vez.',
        '`print()` escreve na tela o que estiver dentro dos parênteses.',
        'Texto vai entre aspas (`"` ou `\'`). As aspas não aparecem na tela.',
        'Escreva `print` sempre em minúsculas: `Print` com P maiúsculo não existe para o Python.',
        'Cada `print` termina a linha, então o próximo texto aparece embaixo. Um `print()` vazio deixa uma linha em branco.',
        'Um `#` fora de aspas começa um comentário: um lembrete para você. O Python ignora o resto da linha.',
        'Se algo estiver errado, o Python para e mostra uma mensagem de erro, dizendo em qual linha ele travou.',
    ], [
        EXEMPLO(C('''
            # meu primeiro programa
            print("Olá, mundo!")
            ''')),
    ]),
    [
        QUIZ(C('''
            print("Oi, tudo bem?")
            '''), 'Oi, tudo bem?', ['"Oi, tudo bem?"', 'print("Oi, tudo bem?")', 'Erro'],
            explicacao='O `print` mostra o texto, mas sem as aspas. Elas só avisam ao Python onde o texto começa e termina.'),
        LACUNA('{1}("Bom dia!")', ['print'], ['Print', 'imprimir', 'echo'], 'Bom dia!',
            enunciado='Complete o código para ele mostrar: Bom dia!',
            explicacao='O comando que mostra algo na tela é `print`, em minúsculas. O Python diferencia maiúsculas de minúsculas, então `Print` não funciona.'),
        QUIZ(C('''
            # print("A")
            print("B")
            '''), 'B', ['A', 'A\nB', 'Erro'],
            explicacao='O `#` transforma o resto da linha em comentário, e o Python ignora comentários. Por isso só o `print("B")` roda.'),
        BUG(L('''
            print("Bem-vindo")
            print("ao curso)
            print("de Python")
            '''), 2, 'print("ao curso")', ['print("ao curso"', 'print(ao curso)'],
            erro='SyntaxError: unterminated string literal (detected at line 2)',
            enunciado='Este programa deveria mostrar três linhas, mas não funciona.',
            porque='Todo texto precisa de aspas para abrir e de aspas para fechar. Na linha 2 falta a aspa final, então o Python não sabe onde o texto termina e mostra um SyntaxError (erro de sintaxe: ele não entendeu como o código foi escrito).',
            explicacao='Com as duas aspas, `print("ao curso")` fecha o texto e o programa mostra as três linhas.'),
        MONTE(L('''
            print("Olá!")
            print("Eu sou um robô.")
            print("Vamos programar?")
            '''), 'Olá!\nEu sou um robô.\nVamos programar?',
            explicacao='O Python executa de cima para baixo. A ordem das linhas é a ordem do que aparece na tela.'),
        PARES([('print("Casa")', 'Casa'), ("print('Sol')", 'Sol'), ('print("2 + 2")', '2 + 2'), ('print("Olá!")', 'Olá!')], 'saida',
            enunciado='Ligue cada código ao que ele mostra na tela.', dir_codigo=True,
            explicacao='O que está entre aspas aparece na tela exatamente como foi escrito. Até uma conta como `2 + 2` vira só texto.'),
        DIGITE(C('''
            print("Python")
            '''), 'Python',
            explicacao='O texto entre aspas aparece sem as aspas.'),
        QUIZ(C('''
            print("Olá")
            print("mundo")
            '''), 'Olá\nmundo', ['Olá mundo', 'Olámundo', 'Erro'],
            explicacao='Cada `print` termina a linha. O segundo texto aparece embaixo do primeiro, não ao lado.'),
        QUIZ(C('''
            print("A")
            print()
            print("B")
            '''), 'A\n\nB', ['A\nB', 'AB', 'A B'],
            explicacao='Um `print()` sem nada dentro escreve uma linha em branco.'),
        ERRO(C('''
            print("Oi"
            '''), 'SyntaxError', ['NameError', 'TypeError', 'ValueError'],
            explicacao='Faltou fechar o parêntese. O Python avisa com SyntaxError: ele não consegue nem começar a rodar o programa.'),
    ])

# ======================================================================= u01l02
def _nome_ok(a, b):
    if a.isidentifier():
        return b == 'Nome válido'
    if a[0].isdigit():
        return b.startswith('Começa com número')
    if ' ' in a:
        return b.startswith('Tem espaço')
    return b.startswith('Tem símbolo')

L02 = LICAO('u01l02', 'Variáveis', 'Guardar valores com um nome',
    INTRO([
        'Uma variável é uma caixa com etiqueta: o nome é a etiqueta e o valor é o que está guardado dentro.',
        'O sinal `=` guarda o valor da direita no nome da esquerda: `nome = "Ana"` ou `idade = 20` (número não leva aspas).',
        'Para usar o valor, escreva o nome **sem aspas**: `print(nome)` mostra Ana. Com aspas, `print("nome")` mostra a palavra nome.',
        'Maiúsculas e minúsculas contam: `nome` e `Nome` são variáveis diferentes.',
        'O nome pode ter letras, números e `_`, mas não pode começar com número nem ter espaço ou símbolos como `!`. Para juntar palavras, use `_`: `minha_idade`.',
        'Uma variável pode mudar: vale sempre o último valor guardado.',
    ], [
        EXEMPLO(C('''
            nome = "Ana"
            print(nome)
            ''')),
    ]),
    [
        QUIZ(C('''
            fruta = "uva"
            print(fruta)
            '''), 'uva', ['fruta', '"uva"', 'Erro'],
            explicacao='Dentro do `print`, `fruta` sem aspas é a variável. O Python troca o nome pelo valor guardado: uva.'),
        BUG(L('''
            nome = "Bia"
            idade = 20
            print(Nome)
            print(idade)
            '''), 3, 'print(nome)', ['print("nome")', 'print(NOME)'],
            erro="NameError: name 'Nome' is not defined",
            enunciado='Este programa deveria mostrar Bia e depois 20, mas dá erro.',
            porque='O Python diferencia maiúsculas de minúsculas: a variável criada foi `nome`, mas a linha 3 pede `Nome`, que nunca foi criada. Por isso aparece NameError (nome não definido).',
            explicacao='Escrever o nome exatamente como foi criado, `nome`, resolve. Com aspas, o programa mostraria a palavra nome, e não Bia.'),
        MONTE(L('''
            msg = "Bom dia"
            print(msg)
            msg = "Boa noite"
            print(msg)
            '''), 'Bom dia\nBoa noite',
            explicacao='A variável guarda um valor de cada vez. O primeiro `print` mostra Bom dia; depois a variável muda para Boa noite, e o segundo `print` mostra o valor novo.'),
        LACUNA(C('''
            animal {1} "gato"
            print({2})
            '''), ['=', 'animal'], ['==', '"animal"'], 'gato',
            enunciado='Complete o código para ele mostrar: gato',
            explicacao='O `=` guarda o valor na variável (o `==` serve para comparar, assunto para depois). Sem aspas, `print(animal)` mostra o valor guardado; com aspas, mostraria a palavra animal.'),
        PARES([('idade', 'Nome válido'), ('2idade', 'Começa com número: inválido'), ('minha idade', 'Tem espaço: inválido'), ('idade!', 'Tem símbolo: inválido')], _nome_ok,
            enunciado='Ligue cada nome de variável: válido, ou o motivo de ser inválido.',
            explicacao='Um nome de variável pode ter letras, números e `_`, mas não pode começar com número, ter espaço nem símbolos como `!`. Para juntar palavras, use `_`: `minha_idade`.'),
        QUIZ(C('''
            cor = "azul"
            print("cor")
            '''), 'cor', ['azul', '"cor"', 'Erro'],
            explicacao='Entre aspas, `"cor"` é só um texto, então o `print` mostra a palavra cor. Sem aspas, `print(cor)` mostraria o valor guardado: azul.'),
        DIGITE(C('''
            a = "sol"
            print(a)
            '''), 'sol',
            explicacao='`a` guarda o texto sol, e o `print(a)` mostra o que está guardado.'),
        ERRO(C('''
            print(idade)
            '''), 'NameError', ['SyntaxError', 'TypeError', 'ValueError'],
            explicacao='A variável `idade` nunca foi criada. Pedir um nome que não existe dá NameError.'),
        QUIZ(C('''
            x = 5
            x = 7
            print(x)
            '''), '7', ['5', '12', 'Erro'],
            explicacao='Uma variável guarda um valor de cada vez. O `7` substituiu o `5`, então vale o último valor guardado.'),
        DIGITE(C('''
            n = 3
            m = n
            n = 9
            print(m)
            '''), '3',
            explicacao='`m = n` copiou o valor 3 naquele momento. Mudar `n` depois não muda `m`.'),
    ])

# ======================================================================= u01l03
L03 = LICAO('u01l03', 'Tipos de dados', 'int, float, str e bool',
    INTRO([
        'Todo valor tem um **tipo**. Os quatro mais básicos são:',
    ], [
        EXEMPLO(C('''
            print(type(7))
            print(type(2.5))
            ''')),
    ], lista=[
        '`int`: número inteiro, sem ponto. Exemplos: `7` e `-3`.',
        '`float`: número com casas decimais, escrito com **ponto**, não vírgula. Exemplo: `2.5`.',
        '`str`: texto, sempre entre aspas. Exemplo: `"Ana"`.',
        '`bool`: verdadeiro ou falso. Só existem `True` e `False`, com a primeira letra maiúscula e sem aspas.',
    ], depois=[
        'A função `type()` (um comando pronto do Python, como o `print`) diz o tipo de um valor. O Python responde no formato `<class \'int\'>`: o que importa é a palavra entre aspas.',
        'Cuidado: `"7"` entre aspas é texto (`str`), não um número.',
    ]),
    [
        QUIZ(C('''
            print(type(42))
            '''), "<class 'int'>", ["<class 'float'>", "<class 'str'>", "<class 'bool'>"],
            explicacao='42 é um número inteiro, sem ponto e sem aspas. A função `type()` responde o tipo dele: int.'),
        PARES([('7', 'int (inteiro)'), ('2.5', 'float (decimal)'), ('"Ana"', 'str (texto)'), ('False', 'bool (verdadeiro/falso)')], 'tipo',
            enunciado='Ligue cada valor ao seu tipo.',
            explicacao='Número sem ponto é int; com ponto é float; o que está entre aspas é str; `True` e `False` são bool.'),
        LACUNA(C('''
            preco = {1}
            print(type(preco))
            '''), ['9.90'], ['9', '"9.90"', 'True'], "<class 'float'>",
            enunciado="Complete o código para ele mostrar: <class 'float'>",
            explicacao='Um número com ponto decimal, como 9.90, é float. Sem o ponto seria int, e entre aspas seria texto (str).'),
        BUG(L('''
            nome = "Davi"
            ativo = true
            print(nome)
            print(type(ativo))
            '''), 2, 'ativo = True', ['ativo = "True"', 'ativo = TRUE'],
            erro="NameError: name 'true' is not defined",
            enunciado="Este programa deveria mostrar Davi e depois <class 'bool'>, mas dá erro.",
            porque='Em Python, verdadeiro e falso se escrevem `True` e `False`, com a primeira letra maiúscula. Com `true`, o Python acha que é o nome de uma variável que nunca foi criada e mostra NameError.',
            explicacao='`True` sem aspas é um bool. Entre aspas (`"True"`) seria um texto, e o `type` mostraria str.'),
        QUIZ(C('''
            print(type("7"))
            '''), "<class 'str'>", ["<class 'int'>", "<class 'float'>", "<class 'bool'>"],
            explicacao='As aspas transformam o 7 em texto. Para o Python, `"7"` é str, não um número.'),
        MONTE(L('''
            print(type(10))
            print(type(2.5))
            print(type("10"))
            '''), "<class 'int'>\n<class 'float'>\n<class 'str'>",
            enunciado='Coloque as linhas na ordem certa para o programa mostrar os tipos abaixo.',
            explicacao='Cada `print` mostra o tipo de um valor, na ordem das linhas: 10 é int, 2.5 é float e "10" entre aspas é str.'),
        DIGITE(C('''
            print(type(3.0))
            '''), "<class 'float'>",
            explicacao='Tem ponto decimal, então é float, mesmo que a parte decimal seja zero.'),
        QUIZ(C('''
            print(7)
            print("7")
            '''), '7\n7', ['7\n"7"', '"7"\n"7"', 'Erro'],
            explicacao='O `print` não mostra as aspas, então os dois aparecem iguais. A diferença (número e texto) existe por dentro, e `type()` revela.'),
        QUIZ(C('''
            print(type(True))
            '''), "<class 'bool'>", ["<class 'str'>", "<class 'int'>", 'Erro'],
            explicacao='`True` sem aspas é um valor bool. Já `"True"` entre aspas seria texto.'),
        CONCEITO('Qual destes valores é um float?', '4.0', ['4', '"4.0"', 'True'],
            explicacao='Só `4.0` tem ponto decimal e não está entre aspas. `4` é int, `"4.0"` é texto e `True` é bool.',
            teste=lambda o: isinstance(eval(o), float)),
    ])

# ======================================================================= u01l04
L04 = LICAO('u01l04', 'Contas e input()', 'Fazer contas e perguntar algo à pessoa',
    INTRO([
        'O Python faz contas: `+` soma, `-` subtrai, `*` multiplica e `/` divide. A divisão sempre dá um número decimal: `10 / 2` é `5.0`.',
        'Multiplicação e divisão acontecem antes de soma e subtração. Parênteses mandam primeiro: `(7 + 3) * 2` é 20.',
        'O `+` também junta textos: `"Olá, " + "Ana"` vira `Olá, Ana`.',
        '`input("pergunta")` pausa o programa, espera a pessoa digitar e entrega o que ela digitou, sempre como **texto**.',
        'Para fazer conta com o que a pessoa digitou, converta: `int()` para inteiro e `float()` para decimal. Exemplo: `idade = int(input("Idade? "))` guarda um número, não texto.',
    ], [
        EXEMPLO(C('''
            nome = input("Seu nome? ")
            print("Olá, " + nome)
            '''), entrada=['Ana'], nota='Aqui, "Ana" é o que a pessoa digitou.'),
    ]),
    [
        QUIZ(C('''
            print(7 + 3 * 2)
            '''), '13', ['20', '21', 'Erro'],
            explicacao='A multiplicação vem antes da soma: primeiro 3 * 2 = 6, depois 7 + 6 = 13. Para somar primeiro, use parênteses: `(7 + 3) * 2`.'),
        LACUNA(C('''
            cidade = {1}("Sua cidade? ")
            print("Moro em " {2} cidade)
            '''), ['input', '+'], ['print', '*'], 'Sua cidade? Recife\nMoro em Recife', entrada=['Recife'],
            enunciado='Complete o código para ele perguntar a cidade e responder. Se a pessoa digitar Recife, o programa mostra o texto abaixo.',
            explicacao='O `input` espera a pessoa digitar e devolve o texto para a variável. O `+` junta dois textos: "Moro em " e a cidade.'),
        BUG(L('''
            preco = 4
            qtd = 3
            total = preco x qtd
            print(total)
            '''), 3, 'total = preco * qtd', ['total = preco + qtd', 'total = preco qtd'],
            erro='SyntaxError: invalid syntax',
            enunciado='Este programa deveria mostrar 12 (preço vezes quantidade), mas dá erro.',
            porque='Em Python não existe o símbolo `x` para multiplicar. Ao encontrar `preco x qtd`, o Python não entende o que fazer com aquele x solto e mostra um SyntaxError.',
            explicacao='A multiplicação se escreve com asterisco: `preco * qtd`. A opção com `+` rodaria, mas mostraria 7 em vez de 12.'),
        QUIZ(C('''
            n = input("Digite um número: ")
            print(n + n)
            '''), '44', ['8', 'n + n', 'Erro'], entrada=['4'],
            enunciado='Se a pessoa digitar 4, o que o print mostra?',
            explicacao='O `input` sempre entrega texto: `n` é o texto "4", e o `+` junta textos, então "4" + "4" vira 44. Para somar de verdade, use `int(input(...))`.'),
        MONTE(L('''
            paes = int(input("Quantos pães? "))
            subtotal = paes * 2
            total = subtotal + 1
            print(total)
            '''), 'Quantos pães? 5\n11', entrada=['5'],
            enunciado='Coloque as linhas na ordem certa. O programa pergunta quantos pães, calcula o total (R$ 2 cada + R$ 1 de entrega) e mostra o valor. Se a pessoa digitar 5, aparece 11.',
            explicacao='Cada linha usa o que a anterior criou: lê a quantidade (o `int` converte o texto em número), calcula o subtotal 5 * 2 = 10, soma 1 e só então mostra 11.'),
        PARES([('8 - 3', '5'), ('4 * 3', '12'), ('20 / 4', '5.0'), ('"Oi" + "!"', 'Oi!')], 'avalia',
            enunciado='Ligue cada conta ao resultado.', dir_codigo=True,
            explicacao='`-` subtrai e `*` multiplica. A divisão `/` sempre dá decimal, então `20 / 4` é `5.0`, e o `+` entre textos junta os dois.'),
        DIGITE(C('''
            print(10 / 4)
            '''), '2.5',
            explicacao='A divisão `/` dá um número decimal: 10 dividido por 4 é 2.5.'),
        DIGITE(C('''
            n = int(input())
            print(n * 2)
            '''), '42', entrada=['21'],
            enunciado='A pessoa digita 21. Digite o que o programa mostra.',
            explicacao='O `int()` transformou o texto "21" em número, então `n * 2` é a conta 21 * 2 = 42.'),
        QUIZ(C('''
            print("3" + "4")
            '''), '34', ['7', '3 + 4', 'Erro'],
            explicacao='Entre aspas, 3 e 4 são textos. O `+` entre textos junta, não soma: "3" + "4" vira "34".'),
        ERRO(C('''
            print("Idade: " + 25)
            '''), 'TypeError', ['NameError', 'SyntaxError', 'ValueError'],
            explicacao='O Python não junta texto com número. Misturar os dois no `+` dá TypeError. Uma saída é escrever o número como texto: `"25"`.'),
    ])


# ======================================================================= u01l05
# ajudante só para as conferências (teste=...) das lições abaixo: roda o código de verdade
import dsl as _dsl

def _roda(codigo, entrada=()):
    return _dsl.rodar(codigo, tuple(entrada), False)

L05 = LICAO('u01l05', 'Mais contas', 'Divisão inteira, resto, potência e arredondamento',
    INTRO([
        'Além de `+ - * /`, o Python tem outros operadores. O `//` faz a **divisão inteira**: mostra quantas vezes o segundo número cabe inteiro no primeiro.',
        'O `%` dá o **resto** da divisão. Com 17 peças em caixas de 5, `17 // 5` são 3 caixas cheias e `17 % 5` são 2 peças que sobram.',
        'O `**` faz a **potência**: `2 ** 3` é 2 vezes 2 vezes 2, ou seja, 8.',
        'Duas funções prontas ajudam nas contas. `abs()` tira o sinal de menos, e `round()` arredonda: `round(3.14159, 2)` deixa 2 casas decimais.',
        'A ordem das contas é: parênteses, depois `**`, depois `* / // %` (da esquerda para a direita) e por último `+ -`.',
    ], [
        EXEMPLO(C('''
            pecas = 17
            print(pecas // 5)
            print(pecas % 5)
            print(2 ** 3)
            '''), nota='São 3 caixas cheias, 2 peças sobrando e a potência 8.'),
        EXEMPLO(C('''
            print(abs(-7))
            print(round(3.14159, 2))
            print(0.1 + 0.2)
            '''), nota='Repare no último resultado: ele não é exatamente 0.3.'),
    ], depois=[
        'Atenção: `0.1 + 0.2` mostra `0.30000000000000004`, e não `0.3`. O computador guarda decimais de forma aproximada; `round(0.1 + 0.2, 2)` mostra `0.3`.',
    ]),
    [
        QUIZ(C('''
            saldo = 47
            notas = saldo // 10
            print(notas)
            '''), '4', ['4.7', '7', '5'],
            explicacao='O `//` mostra quantas vezes o 10 cabe inteiro em 47: 4 vezes. O 4.7 viria da divisão `/`, e o 7 é o resto, que vem do `%`.'),
        DIGITE(C('''
            hora = 27
            print(hora % 24)
            '''), '3',
            explicacao='O 24 cabe uma vez em 27 e sobram 3. O `%` mostra essa sobra, por isso serve para "dar a volta" em ciclos, como as 24 horas do dia.'),
        QUIZ(C('''
            lado = 4
            print(lado ** 2)
            '''), '16', ['8', '6', '42'],
            explicacao='O `**` é a potência: `4 ** 2` é 4 vezes 4, que dá 16. Com a multiplicação comum, `4 * 2`, o resultado seria 8.'),
        PARES([('9 // 2', '4'), ('9 % 2', '1'), ('9 / 2', '4.5'), ('3 ** 2', '9'), ('abs(2 - 9)', '7')], 'avalia',
            enunciado='Ligue cada conta ao resultado.', dir_codigo=True,
            explicacao='Com os mesmos números, cada operador responde algo diferente: `//` dá a parte inteira (4), `%` dá o resto (1) e `/` dá o decimal (4.5). O `abs` tira o sinal de menos de -7.'),
        LACUNA(C('''
            minutos = 135
            print(minutos {1} 60)
            print(minutos {2} 60)
            '''), ['//', '%'], ['/', '**', '-'], '2\n15',
            enunciado='Complete o código para mostrar quantas horas inteiras cabem em 135 minutos e quantos minutos sobram.',
            explicacao='O `//` dá as horas inteiras (135 // 60 é 2) e o `%` dá os minutos que sobram (135 % 60 é 15). Com `/` o resultado seria 2.25.'),
        BUG(L('''
            print("Conferência de saldo")
            saldo = input("Saldo: ")
            print(abs(saldo))
            '''), 3, 'print(abs(int(saldo)))', ['print(Abs(int(saldo)))', 'print(abs(str(saldo)))'],
            erro="TypeError: bad operand type for abs(): 'str'", entrada=['-30'],
            enunciado='A pessoa digita -30. O programa deveria mostrar 30, mas dá erro.',
            porque='O `input` sempre entrega texto, e o `abs()` só funciona com números. Por isso o Python mostra TypeError, o erro de tipo.',
            explicacao='O `int(saldo)` transforma o texto "-30" em número, e então o `abs()` tira o sinal de menos. Escrever `Abs` com A maiúsculo daria NameError.'),
        MONTE(L('''
            lado = int(input("Lado do cubo: "))
            area = lado ** 2
            volume = area * lado
            print(volume)
            '''), 'Lado do cubo: 3\n27', entrada=['3'],
            enunciado='Coloque as linhas na ordem certa. O programa lê o lado de um cubo e mostra o volume. Se a pessoa digitar 3, aparece 27.',
            explicacao='Cada linha usa o que a anterior criou. A área da face é `3 ** 2`, que dá 9; multiplicando de novo pelo lado, 9 * 3, o volume é 27.'),
        CONCEITO('Qual destas linhas mostra exatamente 0.3?', 'print(round(0.1 + 0.2, 2))',
            ['print(0.1 + 0.2)', 'print(round(0.1 + 0.2))', 'print(round(0.1, 2) + round(0.2, 2))'],
            explicacao='O `round(..., 2)` arredonda o resultado da soma para 2 casas e mostra 0.3. Arredondar cada parte antes de somar não adianta, e sem o 2 o `round` devolve o inteiro 0.',
            teste=lambda o: _roda(o)[0] == '0.3'),
        DIGITE(C('''
            n = int(input("Número: "))
            print(n % 2)
            '''), '1', entrada=['7'],
            enunciado='A pessoa digita 7. Digite o que o programa mostra.',
            explicacao='O `int()` transforma o texto em número. 7 dividido por 2 dá 3 e sobra 1: todo número ímpar deixa resto 1 na divisão por 2, e todo par deixa resto 0.'),
        QUIZ(C('''
            print(2 + 17 % 5 * 3)
            '''), '8', ['4', '12', '6'],
            explicacao='O `%` e o `*` têm a mesma prioridade e seguem da esquerda para a direita. Primeiro 17 % 5 é 2, depois 2 * 3 é 6, e só no fim vem o + 2. Quem multiplica 5 * 3 antes chega em 4.'),
    ])

# ======================================================================= u01l06
L06 = LICAO('u01l06', 'Conversão de tipos', 'Trocar entre int, float e str',
    INTRO([
        '**Converter** é transformar um valor em outro tipo. O Python tem uma função para cada tipo:',
    ], [
        EXEMPLO(C('''
            print(int("42") + 1)
            print(int(3.9))
            print(float(3))
            print("Idade: " + str(25))
            ''')),
        EXEMPLO(C('''
            print(int("abc"))
            '''), erro=True, nota='O texto "abc" não parece um número, então a conversão falha.'),
    ], lista=[
        '`int()` faz um inteiro: `int("42")` é 42. Em um decimal, ele corta a parte depois do ponto, sem arredondar: `int(3.9)` é 3.',
        '`float()` faz um decimal: `float("2.5")` é 2.5 e `float(3)` é 3.0.',
        '`str()` faz um texto: `str(25)` é `"25"`. Com ele dá para juntar texto e número: `"Idade: " + str(25)`.',
    ], depois=[
        'Só dá para converter um texto que parece um número. Se não parecer, o Python mostra **ValueError** (erro de valor): o tipo serve, mas o conteúdo não.',
        'O ponto é o único separador decimal: `float("3,5")` dá ValueError, e `int("3.5")` também. A conversão também não muda a variável: guarde o resultado, como em `n = int(n)`.',
    ]),
    [
        QUIZ(C('''
            litros = 8.7
            print(int(litros))
            '''), '8', ['9', '8.7', '8.0'],
            explicacao='O `int()` corta a parte decimal em vez de arredondar, então 8.7 vira 8. O 9 seria o resultado de `round(8.7)`.'),
        DIGITE(C('''
            rpm = 1750
            print(float(rpm))
            '''), '1750.0',
            explicacao='O `float()` transforma o inteiro em decimal, e um decimal sempre aparece com ponto: 1750.0.'),
        LACUNA(C('''
            nome = "Rita"
            anos = 30
            print(nome + " tem " + {1}(anos) + " anos")
            '''), ['str'], ['int', 'float', 'input'], 'Rita tem 30 anos',
            enunciado='Complete o código para ele mostrar: Rita tem 30 anos',
            explicacao='Para usar o `+` com textos, o 30 precisa virar texto, e o `str(anos)` faz isso. O `int` e o `float` dariam um número, e o Python não junta texto com número.'),
        ERRO(C('''
            idade = "vinte"
            print(int(idade) + 1)
            '''), 'ValueError', ['TypeError', 'NameError', 'SyntaxError'],
            explicacao='O `int()` só converte texto que parece um número, como "20". Com "vinte" o tipo está certo (texto), mas o conteúdo não serve, e isso é ValueError.'),
        PARES([('int(7.8)', '7'), ('float(4)', '4.0'), ('str(4) + "0"', '40'), ('int("12") + 1', '13'), ('float("1.5") * 2', '3.0')], 'avalia',
            enunciado='Ligue cada conversão ao resultado.', dir_codigo=True,
            explicacao='O `int()` corta o decimal (7.8 vira 7) e o `float()` coloca o ponto (4.0). O `str()` faz texto, então o `+` junta "4" e "0" em "40".'),
        BUG(L('''
            idade = input("Idade? ")
            futura = idade + 1
            print(futura)
            '''), 2, 'futura = int(idade) + 1', ['futura = str(idade) + 1', 'futura = idade + "1"'],
            erro='TypeError: can only concatenate str (not "int") to str', entrada=['20'],
            enunciado='A pessoa digita 20. O programa deveria mostrar 21, mas dá erro.',
            porque='O `input` entrega texto, então `idade` é o texto "20". O Python não soma texto com número e mostra TypeError.',
            explicacao='O `int(idade)` transforma o texto em número, e a soma funciona. Já `idade + "1"` rodaria, mas juntaria os textos e mostraria 201.'),
        QUIZ(C('''
            nota = "8.5"
            float(nota)
            print(type(nota))
            '''), "<class 'str'>", ["<class 'float'>", "<class 'int'>"],
            explicacao='A linha 2 converte, mas não guarda o resultado em lugar nenhum. A variável `nota` continua sendo o texto "8.5"; para mudar, seria preciso escrever `nota = float(nota)`.'),
        MONTE(L('''
            preco = float(input("Preço: "))
            desconto = preco / 10
            final = preco - desconto
            print(final)
            '''), 'Preço: 50\n45.0', entrada=['50'],
            enunciado='Coloque as linhas na ordem certa. O programa lê um preço e mostra o valor com 10% de desconto. Se a pessoa digitar 50, aparece 45.0.',
            explicacao='O `float()` transforma o texto em decimal. Depois, cada linha usa a anterior: o desconto é 5.0 e o valor final é 45.0. Só então o `print` mostra o resultado.'),
        ERRO(C('''
            peso = input("Peso em kg: ")
            print(float(peso) * 2)
            '''), 'ValueError', ['TypeError', 'NameError', 'ZeroDivisionError'], entrada=['2,5'],
            enunciado='A pessoa digita 2,5 (com vírgula). Que tipo de erro o Python mostra?',
            explicacao='O `float()` só entende o ponto como separador decimal. O texto "2,5" tem o tipo certo, mas o conteúdo não serve, e isso é ValueError.'),
        DIGITE(C('''
            a = "3"
            b = int(a) * 2
            c = str(b) + a
            print(c)
            '''), '63',
            explicacao='Passo a passo: `int(a) * 2` é 6, o `str(b)` vira o texto "6", e juntar "6" com "3" dá o texto "63". Não é a soma 9, porque o `+` entre textos junta.'),
    ])

# ======================================================================= u01l07
# para o PARES: cada item vem com um programinha que prova o que ele faz
_ESCAPES = {
    r'\n': ('Quebra a linha', r'print("a\nb")', 'a\nb'),
    r'\t': ('Dá um espaço largo (tab)', r'print("a\tb")', 'a\tb'),
    'sep': ('O que fica entre os valores', 'print("a", "b", sep="#")', 'a#b'),
    'end': ('O que vem no fim do print', 'print("a", end="#")', 'a#'),
}

def _esp_ok(a, b):
    rotulo, programa, esperado = _ESCAPES[a]
    return b == rotulo and _roda(programa)[0] == esperado

L07 = LICAO('u01l07', 'print() avançado', 'Vários valores, sep, end e caracteres especiais',
    INTRO([
        'O `print` aceita vários valores, separados por **vírgula**. Ele coloca um espaço entre eles e aceita tipos misturados: `print("Idade:", 20)` mostra `Idade: 20`.',
        r'Duas opções do `print` e alguns **caracteres especiais** (que começam com a barra invertida `\`) controlam o que aparece na tela:',
    ], [
        EXEMPLO(C('''
            print("Peças:", 12)
            print("2024", "05", "17", sep="-")
            print("Carregando", end="...")
            print("pronto")
            ''')),
        EXEMPLO(C(r'''
            print("Linha 1\nLinha 2")
            print("Nome\tIdade")
            print("Ela disse: 'oi'")
            '''), nota='Os caracteres especiais não aparecem na tela: eles fazem a quebra de linha e o espaço largo.'),
    ], lista=[
        '`sep="-"` muda o que fica **entre** os valores. O padrão é um espaço.',
        '`end="..."` muda o que vem no **fim** do `print`. O padrão é a quebra de linha.',
        r'`\n` dentro de um texto quebra a linha, e `\t` dá um espaço largo (tabulação).',
        r'''Para escrever aspas dentro de um texto, use um tipo de aspas por fora e o outro por dentro: `"Ela disse: 'oi'"`.''',
    ], depois=[
        'Vírgula e `+` não são a mesma coisa. A vírgula aceita qualquer tipo e põe um espaço; o `+` entre textos junta sem espaço e não aceita um número no meio.',
    ]),
    [
        QUIZ(C('''
            nome = "Léo"
            print("Olá,", nome)
            '''), 'Olá, Léo', ['Olá,Léo', 'Olá, nome', 'Olá, "Léo"'],
            explicacao='A vírgula separa os dois valores, e o `print` coloca um espaço entre eles. Como `nome` está sem aspas, aparece o valor guardado: Léo.'),
        DIGITE(C('''
            print("08", "45", sep="h")
            '''), '08h45',
            explicacao='O `sep="h"` troca o espaço que ficaria entre os valores pela letra h.'),
        QUIZ(C('''
            print("Ana", end=" e ")
            print("Beto")
            '''), 'Ana e Beto', ['Ana e\nBeto', 'Ana\nBeto', 'Ana Beto'],
            explicacao='O `end=" e "` troca a quebra de linha por " e ". Por isso o segundo `print` continua na mesma linha.'),
        PARES([(r'\n', 'Quebra a linha'), (r'\t', 'Dá um espaço largo (tab)'), ('sep', 'O que fica entre os valores'), ('end', 'O que vem no fim do print')], _esp_ok,
            enunciado='Ligue cada item ao que ele faz no print.',
            explicacao=r'O `\n` quebra a linha e o `\t` dá um espaço largo, a tabulação. O `sep` fica entre os valores, e o `end` fica no fim do `print`.'),
        LACUNA('print("Placa", "ABC", {1}="-", {2}="!")', ['sep', 'end'], ['stop', 'fim'], 'Placa-ABC!',
            enunciado='Complete o código para ele mostrar: Placa-ABC!',
            explicacao='O `sep="-"` fica entre "Placa" e "ABC", e o `end="!"` vem no fim, no lugar da quebra de linha. Se os dois trocassem de lugar, o resultado seria Placa!ABC-.'),
        BUG(L('''
            itens = 3
            preco = 8
            print("Total em reais:" itens * preco)
            '''), 3, 'print("Total em reais:", itens * preco)', ['print("Total em reais:" + itens * preco)', 'print("Total em reais:" itens, preco)'],
            erro='SyntaxError: invalid syntax. Perhaps you forgot a comma?',
            enunciado='Este programa deveria mostrar Total em reais: 24, mas dá erro.',
            porque='Dois valores dentro do `print` precisam de uma vírgula entre eles. Sem ela, o Python não entende o código e mostra SyntaxError; ele até sugere que faltou uma vírgula.',
            explicacao='Com a vírgula, o `print` mostra o texto e o resultado de `itens * preco`. O `+` não serve aqui: ele daria TypeError, porque não junta texto com número.'),
        MONTE(L('''
            print("Máquina", end=": ")
            print("ligada", end=" | ")
            print("Motor", end=": ")
            print("parado")
            '''), 'Máquina: ligada | Motor: parado',
            explicacao='Cada `print` termina com um `end` em vez da quebra de linha, então os textos se juntam na mesma linha, na ordem em que os `print` aparecem. Só o último, sem `end`, fecha a linha.'),
        QUIZ(C(r'''
            print("A\nB\nC")
            '''), 'A\nB\nC', ['A\\nB\\nC', 'A B C', 'ABC'],
            explicacao=r'Dentro do texto, o `\n` não aparece: ele faz a quebra de linha. Por isso as três letras ficam uma embaixo da outra.'),
        LACUNA(C('''
            nome = input("Nome? ")
            idade = {1}(input("Idade? "))
            print(nome, "terá", idade {2} 1, "anos")
            '''), ['int', '+'], ['str', '-', 'float'], 'Nome? Lia\nIdade? 19\nLia terá 20 anos', entrada=['Lia', '19'],
            enunciado='A pessoa digita Lia e 19. Complete o código para mostrar a idade que ela terá no ano que vem.',
            explicacao='O `int()` transforma o texto "19" em número, e o `+ 1` soma antes de o `print` mostrar. Com `float`, o resultado apareceria como 20.0.'),
        DIGITE(C('''
            print("1", "2", sep="+", end="=")
            print("3")
            '''), '1+2=3',
            explicacao='O primeiro `print` usa `sep="+"` entre o 1 e o 2 e termina com `=` no lugar da quebra de linha. O segundo `print` continua na mesma linha com o 3.'),
    ])

# ======================================================================= u01l08
def _erro_ok(a, b):
    # a esquerda é um programa; a direita é o nome do erro que ele realmente provoca
    s, e, _ = _roda(a)
    return bool(e) and e.split(':')[0] == b

# trecho da mensagem -> (o que significa, programa que mostra esse trecho)
_MENSAGENS = {
    "name 'x' is not defined": ('Usou um nome que não existe', 'print(x)'),
    'division by zero': ('Dividiu por zero', 'print(1 / 0)'),
    'invalid literal for int()': ('Texto que não vira número', 'print(int("a1"))'),
    'unsupported operand type(s)': ('Misturou tipos numa conta', 'print("2" - 1)'),
    "'(' was never closed": ('Faltou fechar um parêntese', 'print("a"'),
}

def _msg_ok(a, b):
    rotulo, programa = _MENSAGENS[a]
    return b == rotulo and a in (_roda(programa)[1] or '')

_COD_SINTAXE = C('''
    print("Início")
    print("Fim"
    ''')

# o que aparece na tela com _COD_SINTAXE: cada opção vira uma afirmação conferida com o resultado real
_AFIRMACOES = {
    'Só a mensagem de erro': lambda s, e: bool(e) and s == '',
    'Início e depois a mensagem de erro': lambda s, e: bool(e) and s == 'Início',
    'Início e Fim, sem nenhum erro': lambda s, e: not e and s == 'Início\nFim',
}

L08 = LICAO('u01l08', 'Lendo mensagens de erro', 'Entender o que o Python diz quando algo dá errado',
    INTRO([
        'Quando algo dá errado, o Python para e mostra uma **mensagem de erro**. Ela segue sempre o mesmo modelo: o tipo do erro, dois pontos e uma explicação.',
        "Por exemplo, `NameError: name 'y' is not defined` quer dizer que o nome `y` não existe. O Python também informa a linha em que parou.",
        'Leia primeiro o tipo do erro e depois olhe essa linha. Estes são os cinco erros mais comuns no começo:',
    ], [
        EXEMPLO(C('''
            cor = "azul"
            print(azul)
            '''), erro=True, nota='O erro aparece na linha 2: o nome azul não existe, a variável criada se chama cor.'),
        EXEMPLO(C('''
            preco = "10"
            print(preco - 3)
            '''), erro=True, nota='Não dá para subtrair um número de um texto.'),
        EXEMPLO(C('''
            print("Olá"
            '''), erro=True, nota='Falta o parêntese final.'),
    ], lista=[
        '`SyntaxError`: o código está escrito de um jeito que o Python não entende, como aspas ou parêntese sem fechar.',
        '`NameError`: o nome usado não existe, porque foi escrito diferente ou ainda não foi criado.',
        '`TypeError`: a operação não combina com o tipo do valor, como subtrair de um texto.',
        '`ValueError`: o tipo serve, mas o valor não, como em `int("abc")`.',
        '`ZeroDivisionError`: houve uma divisão por zero.',
    ], depois=[
        'O `SyntaxError` é achado antes de o programa começar: nenhuma linha roda. Nos outros erros, as linhas de cima já rodaram e podem ter mostrado algo.',
        'A linha indicada é onde o erro apareceu, mas a causa pode estar mais acima, como uma variável que recebeu o valor errado.',
    ]),
    [
        ERRO(C('''
            cidade = "Recife"
            print("Moro em", cidade)
            print("Tenho", idade, "anos")
            idade = 30
            '''), 'NameError', ['TypeError', 'ValueError', 'SyntaxError'],
            explicacao='O Python lê de cima para baixo. Na linha 3, `idade` ainda não existe, pois só é criada na linha 4. Os dois primeiros `print` até chegam a rodar.'),
        PARES([('print(100 / 0)', 'ZeroDivisionError'), ('print(int("oi"))', 'ValueError'), ('print("7" - 2)', 'TypeError'),
               ('print(preco)', 'NameError'), ('print("Oi)', 'SyntaxError')], _erro_ok,
            enunciado='Ligue cada programa ao erro que ele provoca.', dir_codigo=True,
            explicacao='Cada programa quebra de um jeito. Há uma divisão por zero, um texto que não vira número, uma subtração com texto, um nome que não existe e uma aspa aberta.'),
        LACUNA(C('''
            {1} = "azul"
            print(cor)
            '''), ['cor'], ['Cor', 'azul', '"cor"'], 'azul',
            enunciado="O Python mostrou: NameError: name 'cor' is not defined. Complete a linha 1 para o programa mostrar azul.",
            explicacao='A mensagem diz qual nome está faltando: `cor`. Criando a variável com esse nome exato (o Python diferencia maiúsculas), o `print(cor)` encontra o valor.'),
        BUG(L('''
            total = 120
            pessoas = 4
            folgas = 0
            cada = total / folgas
            print(cada)
            '''), 4, 'cada = total / pessoas', ['cada = total // folgas', 'cada = total * pessoas'],
            erro='ZeroDivisionError: division by zero',
            enunciado='O programa deveria mostrar quanto cada pessoa paga, mas o Python mostrou ZeroDivisionError: division by zero.',
            porque='A conta divide por `folgas`, que vale 0, e não existe divisão por zero. O Python para na linha da conta e mostra ZeroDivisionError.',
            explicacao='O divisor certo é `pessoas`, que vale 4: com `total / pessoas`, cada um paga 30.0. Trocar `/` por `//` não resolve, porque a divisão inteira por zero também dá erro.'),
        CONCEITO('O que aparece na tela quando este programa roda?', 'Só a mensagem de erro',
            ['Início e depois a mensagem de erro', 'Início e Fim, sem nenhum erro'],
            codigo=_COD_SINTAXE,
            explicacao='O Python confere o código inteiro antes de rodar. Como falta fechar o parêntese da linha 2, ele mostra SyntaxError e nenhuma linha roda, nem o primeiro `print`. Em um NameError, as linhas de cima já teriam rodado.',
            teste=lambda o: _AFIRMACOES[o](*_roda(_COD_SINTAXE)[:2])),
        MONTE(L('''
            preco = 12
            total = preco * 3
            desconto = total / 4
            print(desconto)
            '''), '9.0',
            enunciado='Coloque as linhas na ordem certa. Em outra ordem, o Python mostraria NameError.',
            explicacao='Um nome só existe depois de criado. Por isso `preco` vem primeiro, depois `total`, que usa `preco`, e depois `desconto`, que usa `total`.'),
        ERRO(C('''
            nome = "Ana"
            print nome
            '''), 'SyntaxError', ['NameError', 'TypeError', 'ValueError'],
            enunciado='Um tutorial antigo usa este código. Que tipo de erro o Python atual mostra?',
            explicacao='No Python atual o `print` precisa de parênteses. Sem eles, o código está escrito de um jeito inválido, e o Python mostra SyntaxError sugerindo `print(...)`.'),
        PARES([(chave, _MENSAGENS[chave][0]) for chave in _MENSAGENS], _msg_ok,
            enunciado='Ligue cada trecho de mensagem de erro ao que ele significa.',
            explicacao='As mensagens usam palavras que contam o problema: "is not defined" (não existe), "by zero" (por zero) e "never closed" (não foi fechado). Já "invalid literal" fala de um valor ruim, e "unsupported operand" fala de tipos que não combinam.'),
        CONCEITO("Qual destes programas mostra: ValueError: invalid literal for int() with base 10: '3.5'", 'print(int("3.5"))',
            ['print(int("3,5"))', 'print(int(3.5))'],
            explicacao='O `int()` não aceita texto com ponto decimal, e a mensagem repete o texto que falhou: 3.5. Com "3,5" a mensagem mostraria 3,5, e `int(3.5)`, sem aspas, só corta para 3 e não dá erro.',
            teste=lambda o: _roda(o)[1] == "ValueError: invalid literal for int() with base 10: '3.5'"),
        BUG(L('''
            nota1 = input("Nota 1: ")
            nota2 = input("Nota 2: ")
            media = (nota1 + nota2) / 2
            print("Média:", media)
            '''), 3, 'media = (int(nota1) + int(nota2)) / 2', ['media = int(nota1 + nota2) / 2', 'media = (nota1 + nota2) // 2'],
            erro="TypeError: unsupported operand type(s) for /: 'str' and 'int'", entrada=['7', '8'],
            enunciado="A pessoa digita 7 e 8. O Python mostrou: TypeError: unsupported operand type(s) for /: 'str' and 'int'. Toque na linha do erro.",
            porque='O `input` entrega texto, então `nota1 + nota2` junta os textos "7" e "8" em "78". A divisão `/` não funciona com texto, e o Python mostra TypeError; a causa está nas linhas 1 e 2, onde faltou converter.',
            explicacao='Convertendo cada nota com `int()` antes de somar, a conta vira (7 + 8) / 2 e dá 7.5. Já `int(nota1 + nota2)` rodaria, mas converteria "78" e mostraria 39.0.'),
    ])

# ======================================================================= u01l09
L09 = LICAO('u01l09', 'Revisão: primeiros passos', 'Treinar tudo o que você viu na unidade',
    INTRO([
        'Esta lição revisa a unidade inteira. Antes de começar, relembre os pontos principais:',
    ], [
        EXEMPLO(C('''
            temp = float(input("Temperatura em °C? "))
            f = temp * 9 / 5 + 32
            print(temp, "°C são", round(f, 1), "°F")
            '''), entrada=['25'], nota='Aqui, 25 é o que a pessoa digitou.'),
    ], lista=[
        '`print()` mostra valores; com vírgula, mostra vários, e as opções `sep` e `end` mudam o separador e o final.',
        'Uma variável guarda um valor com `=`, e vale sempre o último valor guardado.',
        'Os tipos básicos são `int`, `float`, `str` e `bool`, e `type()` mostra o tipo.',
        'Nas contas, `+ - * / // % **` seguem prioridades, e os parênteses mandam primeiro; `abs()` e `round()` ajudam.',
        '`input()` entrega sempre texto: use `int()`, `float()` e `str()` para converter.',
        'O tipo do erro e a linha indicada mostram onde olhar: `SyntaxError`, `NameError`, `TypeError`, `ValueError` e `ZeroDivisionError`.',
    ], depois=[
        'Em caso de dúvida, simule o programa de cima para baixo, uma linha por vez, anotando o valor de cada variável.',
    ]),
    [
        QUIZ(C('''
            a = 7
            b = 2
            print(a // b, a % b, a / b)
            '''), '3 1 3.5', ['3.5 1 3', '3 1 3.0', '3 3.5 1'],
            explicacao='O `//` dá a parte inteira (3), o `%` dá o resto (1) e o `/` dá o decimal (3.5). A vírgula do `print` põe um espaço entre os três valores.'),
        DIGITE(C('''
            print(round(abs(-3.14159), 2))
            '''), '3.14',
            explicacao='Primeiro o `abs` tira o sinal de menos e sobra 3.14159. Depois o `round` mantém 2 casas decimais: 3.14.'),
        LACUNA(C('''
            pontos = {1}(input("Pontos: "))
            print("Prêmios:", pontos {2} 20)
            print("Sobram:", pontos {3} 20)
            '''), ['int', '//', '%'], ['float', '/', '**'], 'Pontos: 85\nPrêmios: 4\nSobram: 5', entrada=['85'],
            enunciado='A pessoa digita 85 pontos. Complete o código para mostrar quantos prêmios ela ganha (1 a cada 20 pontos) e quantos pontos sobram.',
            explicacao='O `int()` transforma o texto em número. O `//` conta os prêmios inteiros (85 // 20 é 4), e o `%` mostra os pontos que sobram (85 % 20 é 5).'),
        ERRO(C('''
            cartoes = 0
            print(100 % cartoes)
            '''), 'ZeroDivisionError', ['ValueError', 'TypeError', 'NameError'],
            explicacao='O `%` calcula o resto de uma divisão, então dividir por 0 também é impossível. Por isso o erro é ZeroDivisionError, e não só no `/`.'),
        PARES([('round(7.8)', 'int (inteiro)'), ('8 / 2', 'float (decimal)'), ('str(8) + "2"', 'str (texto)'), ('True', 'bool (verdadeiro/falso)')], 'tipo',
            enunciado='Ligue cada código ao tipo do resultado.',
            explicacao='O `round(7.8)` devolve um inteiro. A divisão `/` sempre devolve decimal, mesmo quando é exata. O `str()` faz texto, e o `+` entre textos continua sendo texto.'),
        BUG(L('''
            tensao = input("Tensão (V): ")
            resistencia = 5
            potencia = tensao ** 2 / resistencia
            print("Potência (W):", potencia)
            '''), 3, 'potencia = int(tensao) ** 2 / resistencia', ['potencia = int(tensao) * 2 / resistencia', 'potencia = (tensao ** 2) / resistencia'],
            erro="TypeError: unsupported operand type(s) for ** or pow(): 'str' and 'int'", entrada=['10'],
            enunciado='A pessoa digita 10. O programa deveria mostrar 20.0 (tensão ao quadrado dividida pela resistência), mas dá erro.',
            porque='O `input` entrega texto, então `tensao` é o texto "10", e a potência `**` não funciona com texto. O Python mostra TypeError na linha da conta.',
            explicacao='O `int(tensao)` transforma o texto em número antes do `**`, e a conta dá 100 / 5 = 20.0. Trocar `**` por `*` rodaria, mas mostraria 4.0.'),
        MONTE(L('''
            dist = float(input("Distância (km): "))
            tempo = float(input("Tempo (h): "))
            vel = dist / tempo
            print("Velocidade:", vel, "km/h")
            '''), 'Distância (km): 150\nTempo (h): 2\nVelocidade: 75.0 km/h', entrada=['150', '2'],
            enunciado='Coloque as linhas na ordem certa. Se a pessoa digitar 150 e depois 2, o programa mostra a velocidade média.',
            explicacao='As duas leituras vêm primeiro, na ordem em que as perguntas aparecem na tela. Depois a conta usa as duas variáveis (150.0 / 2.0 é 75.0) e o `print` mostra o resultado.'),
        QUIZ(C('''
            x = "4"
            y = 2
            print(int(x) ** y, x + str(y))
            '''), '16 42', ['16 6', '8 42', '8 6'],
            explicacao='O `int(x) ** y` é `4 ** 2`, que dá 16. Já `x + str(y)` junta o texto "4" com o texto "2" e dá "42", sem somar.'),
        DIGITE(C('''
            dia = 5
            mes = 11
            print(dia, mes, 2026, sep="/")
            '''), '5/11/2026',
            explicacao='O `sep="/"` vale para todos os valores do `print`, inclusive os números, e a barra fica entre cada par de valores.'),
        QUIZ(C('''
            a = "3"
            b = int(a) + 4
            c = b // 2 + b % 2
            print(a + str(c))
            '''), '34', ['7', '33', '37'],
            explicacao='Passo a passo: `b` é 7, e `c` é 7 // 2 + 7 % 2, ou seja, 3 + 1 = 4. No `print`, `a` ainda é o texto "3", então juntar "3" com "4" dá "34", e não a soma 7.'),
    ])

UNIDADE('u01', 'Primeiros passos em Python', 'Mostrar mensagens, guardar valores e fazer contas.', [L01, L02, L03, L04, L05, L06, L07, L08, L09])
