# -*- coding: utf-8 -*-
# Unidade 7 — Dicionários.  Veja tools/curso/GUIA-AUTORES.md
from dsl import *
from dsl import rodar      # só para conferir PARES que dependem de um dicionário pronto


def _com(setup, molde='print(%s)'):
    """Confere um par (esquerda, direita) rodando o Python de verdade: `setup` + o molde com a esquerda."""
    def f(esq, dir):
        s, e, _ = rodar(setup + '\n' + molde % esq, (), eco=False)
        return e is None and s == dir
    return f


# ======================================================================= u07l01
L01 = LICAO('u07l01', 'Criar e ler dicionários', 'Guardar valores com nome e ler pela chave',
    INTRO([
        'Uma lista guarda valores por posição (0, 1, 2...). Um **dicionário** guarda valores por nome: cada nome é uma **chave** e leva a um **valor**.',
        'Ele se escreve com chaves `{ }`. Cada par é `chave: valor`, e os pares são separados por vírgula.',
        'Para ler um valor, ponha a chave entre colchetes: `pessoa["nome"]`. O Python procura a chave, não a posição.',
        'Se a chave não existe, o Python para com **KeyError** (erro de chave). Maiúsculas contam: `"Nome"` e `"nome"` são chaves diferentes.',
        'A chave pode vir de uma variável. Com `campo = "idade"`, o `pessoa[campo]` lê a chave `"idade"`; sem aspas, o Python usa o valor da variável.',
        '`len()` conta os pares. E o `print()` do dicionário inteiro mostra os textos com aspas simples.',
    ], [
        EXEMPLO(C('''
            pessoa = {"nome": "Ana", "idade": 30}
            print(pessoa["nome"])
            print(len(pessoa))
            print(pessoa)
            ''')),
        EXEMPLO(C('''
            pessoa = {"nome": "Ana", "idade": 30}
            print(pessoa["Nome"])
            '''), erro=True, nota='O "N" maiúsculo não existe como chave.'),
    ]),
    [
        QUIZ(C('''
            carro = {"marca": "Fiat", "ano": 2020}
            print(carro["marca"])
            '''), 'Fiat', ['marca', '"Fiat"', '2020'],
            explicacao='O colchete pede a chave `"marca"`, e o Python devolve o valor guardado nela: Fiat. A chave é o rótulo; o valor é o que fica guardado.'),
        DIGITE(C('''
            notas = {"Ana": 8, "Beto": 6}
            print(notas["Ana"] + notas["Beto"])
            '''), '14',
            explicacao='Cada nome leva a uma nota: 8 e 6. Os valores são números, então o `+` soma: 14.'),
        QUIZ(C('''
            produto = {"item": "cabo", "qtd": 3}
            print(produto)
            '''), "{'item': 'cabo', 'qtd': 3}", ['{"item": "cabo", "qtd": 3}', 'item: cabo, qtd: 3', '{item: cabo, qtd: 3}'],
            explicacao='O `print` mostra o dicionário no formato do próprio Python: chaves, dois pontos e textos com aspas simples. Os textos continuam sendo textos.'),
        ERRO(C('''
            ficha = {"rpm": 1750}
            print(ficha[rpm])
            '''), 'NameError', ['KeyError', 'TypeError', 'SyntaxError'],
            explicacao='Sem aspas, `rpm` é o nome de uma variável, e ela não existe. Para a chave ser o texto "rpm", ele precisa estar entre aspas.'),
        BUG(L('''
            carro = {"marca": "Fiat", "ano": 2020}
            print(carro["marca"])
            print(carro["Ano"])
            print("pronto")
            '''), 3, 'print(carro["ano"])', ['print(carro[ano])', 'print(carro("ano"))'],
            erro="KeyError: 'Ano'",
            enunciado='Este programa deveria mostrar Fiat, 2020 e pronto, mas para no meio.',
            porque='A chave criada foi `"ano"`, com "a" minúsculo. Como `"Ano"` não existe no dicionário, o Python mostra KeyError.',
            explicacao='Escrever a chave exatamente como foi criada resolve. Sem aspas seria um NameError, e com parênteses o Python tentaria "chamar" o dicionário.'),
        MONTE(L('''
            motor = {"rpm": 1750, "fase": 3}
            rpm = motor["rpm"]
            dobro = rpm * 2
            print(dobro)
            '''), '3500',
            explicacao='Primeiro o dicionário é criado, depois a chave `"rpm"` é lida para a variável `rpm`. Só então dá para dobrar e mostrar o resultado.'),
        LACUNA(C('''
            cores = {"sol": "amarelo", "mar": "azul"}
            print(cores[{1}])
            print(cores[{2}])
            '''), ['"mar"', '"sol"'], ['mar', 'sol', '"azul"'], 'azul\namarelo',
            enunciado='Complete o código para ele mostrar azul e depois amarelo.',
            explicacao='Para ler "azul", a chave é `"mar"`; para ler "amarelo", a chave é `"sol"`. Sem aspas, `mar` seria uma variável; e `"azul"` é um valor, não uma chave.'),
        PARES([('preco["pao"]', '2'), ('preco["leite"]', '5'), ('preco["cafe"]', '9'), ('len(preco)', '3')],
            _com('preco = {"pao": 2, "leite": 5, "cafe": 9}'), dir_codigo=True,
            enunciado='Considere `preco = {"pao": 2, "leite": 5, "cafe": 9}`. Ligue cada expressão ao que ela vale.',
            explicacao='Cada chave leva ao seu preço. E o `len(preco)` não olha os valores: conta os pares, que são 3.'),
        QUIZ(C('''
            lista = [10, 20, 30]
            tabela = {1: "x", 2: "y"}
            print(lista[1])
            print(tabela[1])
            '''), '20\nx', ['20\ny', '10\nx', '10\ny'],
            explicacao='Na lista, o número entre colchetes é a posição: `lista[1]` é o segundo item, 20. No dicionário, é a chave: `tabela[1]` procura a chave 1, que leva a "x".'),
        QUIZ(C('''
            campo = "idade"
            pessoa = {"campo": "x", "idade": 30}
            print(pessoa[campo])
            print(pessoa["campo"])
            '''), '30\nx', ['30\n30', 'x\nx', 'x\n30'],
            explicacao='Sem aspas, `campo` é a variável, que guarda "idade": o Python lê a chave `"idade"` e mostra 30. Com aspas, `"campo"` é o texto campo, que leva a "x".'),
    ])

# ======================================================================= u07l02
L02 = LICAO('u07l02', 'Alterar, adicionar e remover', 'Mudar valores, criar pares e apagar chaves',
    INTRO([
        'Um dicionário pode mudar depois de criado. Atribuir a uma chave que **já existe** troca o valor: `placar["Ana"] = 3`.',
        'Atribuir a uma chave que **não existe** cria um par novo, no fim do dicionário. O mesmo comando serve para mudar e para criar.',
        'Dá para calcular em cima do valor guardado: `placar["Ana"] += 1` soma 1. Mas a chave precisa existir antes, senão há KeyError.',
        '`del placar["Ana"]` apaga o par. `placar.pop("Ana")` também apaga e ainda **devolve** o valor que estava lá.',
        'Apagar uma chave que não existe também dá KeyError. `placar.clear()` esvazia o dicionário todo.',
        '`placar.update({"Bia": 2})` junta os pares de outro dicionário: cria os que faltam e troca os que já existem.',
    ], [
        EXEMPLO(C('''
            placar = {"Ana": 1}
            placar["Ana"] = 3
            placar["Bia"] = 2
            placar["Ana"] += 1
            print(placar)
            ''')),
        EXEMPLO(C('''
            placar = {"Ana": 4, "Bia": 2}
            x = placar.pop("Bia")
            print(x)
            print(placar)
            ''')),
    ]),
    [
        QUIZ(C('''
            loja = {"cafe": 5, "pao": 2}
            loja["cafe"] = 7
            print(loja["cafe"])
            '''), '7', ['5', '12', '2'],
            explicacao='A chave `"cafe"` já existia, então a atribuição troca o valor: o 5 sai e o 7 entra. O valor antigo não fica guardado em lugar nenhum.'),
        DIGITE(C('''
            pedido = {"cafe": 1}
            pedido["pao"] = 2
            print(len(pedido))
            '''), '2',
            explicacao='A chave `"pao"` não existia, então a atribuição criou um par novo. Agora o dicionário tem dois pares.'),
        QUIZ(C('''
            carro = {"marca": "Fiat"}
            carro["ano"] = 2020
            carro["cor"] = "azul"
            print(carro)
            '''), "{'marca': 'Fiat', 'ano': 2020, 'cor': 'azul'}",
            ["{'cor': 'azul', 'ano': 2020, 'marca': 'Fiat'}", "{'marca': 'Fiat'}", "{'ano': 2020, 'cor': 'azul'}"],
            explicacao='Cada chave nova entra no fim. O dicionário mantém a ordem em que os pares foram criados, e nenhum par antigo some.'),
        ERRO(C('''
            notas = [7, 8, 9]
            notas.pop(1)
            turma = {"Ana": 7, "Bia": 8}
            turma.pop(1)
            '''), 'KeyError', ['IndexError', 'TypeError', 'ValueError'],
            explicacao='Na lista, `pop(1)` remove a posição 1. No dicionário, o `pop` recebe a **chave**, e a chave `1` não existe, então o erro é KeyError (e não IndexError).'),
        BUG(L('''
            pedido = {"cafe": 1}
            pedido["cafe"] += 1
            pedido["pao"] += 1
            print(pedido)
            '''), 3, 'pedido["pao"] = 1', ['pedido[pao] = 1', 'pedido["pao"] == 1'],
            erro="KeyError: 'pao'",
            enunciado='Este programa deveria mostrar o pedido com café e pão, mas dá erro.',
            porque='O `+=` primeiro lê o valor atual de `"pao"`, que ainda não existe. Ler uma chave inexistente dá KeyError.',
            explicacao='Com `=`, o Python cria o par sem precisar ler nada antes. Depois que a chave existe, o `+=` passa a funcionar.'),
        QUIZ(C('''
            estoque = {"cabo": 40, "fio": 25}
            x = estoque.pop("fio")
            print(x)
            print(len(estoque))
            '''), '25\n1', ['fio\n1', '25\n2', 'None\n1'],
            explicacao='O `pop` apaga o par e devolve o valor: `x` recebe 25, não a chave. Sobra um par no dicionário.'),
        MONTE(L('''
            caixa = {"nota": 50}
            caixa["moeda"] = 5
            troco = caixa.pop("moeda")
            print(troco)
            '''), '5',
            explicacao='A chave `"moeda"` é criada antes de ser retirada com `pop`. O `print` vem por último, quando `troco` já tem o valor.'),
        LACUNA(C('''
            cesta = {"maca": 3}
            cesta["uva"] {1} 5
            cesta["maca"] {2} 1
            print(cesta)
            '''), ['=', '+='], ['==', '-=', '+'], "{'maca': 4, 'uva': 5}",
            enunciado='Complete o código para a cesta ficar com maçã 4 e uva 5.',
            explicacao='A uva ainda não existe, então só o `=` consegue criá-la. A maçã já existe com 3; o `+=` soma 1 e deixa 4.'),
        PARES([('ficha["idade"] = 31', "{'nome': 'Ana', 'idade': 31}"), ('del ficha["nome"]', "{'idade': 30}"),
               ('ficha["uf"] = "SC"', "{'nome': 'Ana', 'idade': 30, 'uf': 'SC'}"), ('ficha.clear()', '{}')],
            _com('ficha = {"nome": "Ana", "idade": 30}', '%s\nprint(ficha)'), dir_codigo=True,
            enunciado='Cada comando roda sobre `ficha = {"nome": "Ana", "idade": 30}`. Ligue o comando ao dicionário que sobra.',
            explicacao='Atribuir a uma chave existente troca o valor; a um nome novo, cria o par. O `del` apaga um par, e o `clear` apaga todos.'),
        DIGITE(C('''
            preco = {"pao": 2, "leite": 5}
            preco.update({"leite": 6, "cafe": 8})
            print(preco["leite"] + len(preco))
            '''), '9',
            explicacao='O `update` trocou o leite para 6 e criou o café. Com 3 pares, a conta é 6 + 3 = 9.'),
        QUIZ(C('''
            conta = {"saldo": 100}
            conta["saldo"] -= 30
            conta["extra"] = conta["saldo"] // 2
            del conta["saldo"]
            print(conta)
            '''), "{'extra': 35}", ["{'saldo': 70, 'extra': 35}", "{'extra': 70}", "{'saldo': 70}"],
            explicacao='O saldo vai de 100 para 70. O extra recebe 70 // 2 = 35 e, por fim, o `del` apaga o saldo. Sobra só o extra.'),
    ])

UNIDADE('u07', 'Dicionários', 'Guardar informações com nome: criar, ler, mudar, contar e organizar dados.', [L01, L02])
