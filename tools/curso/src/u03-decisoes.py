# -*- coding: utf-8 -*-
# Unidade 3 — Decisões.  Veja tools/curso/GUIA-AUTORES.md
from dsl import *

# ======================================================================= u03l01
def _simbolo_ok(a, b):
    return {'==': 'igual a', '!=': 'diferente de', '>=': 'maior ou igual a', '<': 'menor que'}.get(a) == b

L01 = LICAO('u03l01', 'Comparações', 'Comparar valores e obter True ou False',
    INTRO([
        'Uma **comparação** faz uma pergunta ao Python, e a resposta é sempre `True` (verdadeiro) ou `False` (falso).',
        'Esses dois valores são do tipo `bool`. Eles se escrevem com a primeira letra maiúscula e sem aspas.',
        'Os símbolos de comparação são:',
    ], [
        EXEMPLO(C('''
            temperatura = 80
            print(temperatura > 70)
            print(temperatura == 70)
            '''), nota='O Python calcula a comparação, e o `print` mostra a resposta: `True` ou `False`.'),
    ], lista=[
        '`==` igual a · `!=` diferente de',
        '`>` maior que · `<` menor que',
        '`>=` maior ou igual a · `<=` menor ou igual a',
    ], depois=[
        'Atenção: um `=` guarda um valor numa variável, e dois `==` comparam. São coisas diferentes.',
        'Textos também podem ser comparados, mas maiúscula e minúscula contam: `"a" == "A"` dá `False`.',
    ]),
    [
        QUIZ(C('''
            print(8 > 5)
            '''), 'True', ['False', '3', '8 > 5'],
            explicacao='`8 > 5` é uma pergunta: 8 é maior que 5? A resposta é `True`, e o `print` mostra a resposta, não a pergunta.'),
        QUIZ(C('''
            idade = 17
            print(idade >= 18)
            '''), 'False', ['True', '17', '18'],
            explicacao='17 não é maior nem igual a 18, então a resposta é `False`. O `>=` só dá `True` quando o valor da esquerda é maior ou igual ao da direita.'),
        DIGITE(C('''
            print(10 != 10)
            '''), 'False',
            explicacao='O `!=` pergunta se os valores são diferentes. 10 e 10 são iguais, então a resposta é `False`.'),
        PARES([('==', 'igual a'), ('!=', 'diferente de'), ('>=', 'maior ou igual a'), ('<', 'menor que')], _simbolo_ok,
            enunciado='Ligue cada símbolo de comparação ao que ele pergunta.', esq_codigo=True,
            explicacao='Dois sinais de igual (`==`) comparam. O `!=` é "diferente", e o `=` junto de `>` ou `<` acrescenta "ou igual".'),
        QUIZ(C('''
            print("sol" == "Sol")
            '''), 'False', ['True', 'sol', 'Sol'],
            explicacao='Para o Python, maiúscula e minúscula são letras diferentes. Por isso `"sol"` e `"Sol"` não são iguais.'),
        BUG(L('''
            idade = input("Idade? ")
            print("Maior de idade?")
            print(idade >= 18)
            '''), 3, 'print(int(idade) >= 18)', ['print(idade >= int(18))', 'print(int(idade >= 18))'],
            entrada=['20'],
            erro="TypeError: '>=' not supported between instances of 'str' and 'int'",
            enunciado='O programa deveria mostrar True para a idade 20, mas dá erro.',
            porque='O `input` devolve texto, e o Python não sabe dizer se um texto é maior ou igual a um número. Por isso aparece TypeError.',
            explicacao='O `int(idade)` transforma o texto em número antes da comparação. Converter só o 18, ou converter o resultado, deixa a comparação entre texto e número.'),
        MONTE(L('''
            saldo = 50
            saldo = saldo - 30
            print(saldo < 50)
            '''), 'True',
            explicacao='A comparação usa o valor que a variável tem naquele momento. Primeiro `saldo` vale 50, depois 20, e só então o `print` pergunta se 20 é menor que 50.'),
        LACUNA(C('''
            x = 12
            print(x {1} 10)
            print(x {2} 12)
            '''), ['>', '=='], ['<', '='], 'True\nTrue',
            enunciado='Complete o código para os dois print mostrarem True.',
            explicacao='12 é maior que 10 (`>`) e é igual a 12 (`==`). Um `=` sozinho guarda valor, não compara, e dá erro dentro do `print`.'),
        QUIZ(C('''
            print(type(3 > 2))
            '''), "<class 'bool'>", ["<class 'int'>", "<class 'str'>", 'True'],
            explicacao='Toda comparação devolve um `bool`. O `type` mostra o tipo da resposta, não a resposta em si.'),
        DIGITE(C('''
            n = 7
            print(n % 2 == 1)
            '''), 'True',
            explicacao='Primeiro o Python calcula `n % 2`, o resto da divisão de 7 por 2, que é 1. Depois compara: 1 é igual a 1, então `True`.'),
    ])

# ======================================================================= u03l02
def _if_ok(a, b):
    return {'if': 'Abre a decisão (se)', ':': 'Termina a linha do if', '4 espaços': 'Marcam o que está dentro do if', '==': 'Compara dois valores'}.get(a) == b

L02 = LICAO('u03l02', 'O if', 'Executar um bloco só quando a condição é verdadeira',
    INTRO([
        'O **`if`** (em português, "se") executa um bloco de código só quando a condição é `True`. Se for `False`, o bloco é pulado.',
        'A linha do `if` termina com dois-pontos (`:`). As linhas que pertencem ao `if` ficam **recuadas**, com 4 espaços no começo.',
        'O recuo diz ao Python onde o bloco começa e termina. A primeira linha sem recuo já está fora do `if`.',
    ], [
        EXEMPLO(C('''
            temperatura = 95
            if temperatura > 90:
                print("Motor quente!")
            print("Fim da leitura")
            '''), nota='O segundo `print` não tem recuo, então ele roda sempre, com ou sem alerta.'),
    ]),
    [
        QUIZ(C('''
            nota = 8
            if nota >= 6:
                print("Aprovado")
            '''), 'Aprovado', ['True', 'Nada aparece na tela', 'nota >= 6'],
            explicacao='8 é maior ou igual a 6, então a condição é `True` e o bloco roda. O `print` do `if` mostra o texto, e não a condição.'),
        QUIZ(C('''
            saldo = 20
            if saldo > 100:
                print("Pode comprar")
            print("Fim")
            '''), 'Fim', ['Pode comprar\nFim', 'Pode comprar', 'False\nFim'],
            explicacao='20 não é maior que 100, então o bloco do `if` é pulado. O `print("Fim")` não tem recuo e roda de qualquer jeito.'),
        DIGITE(C('''
            x = 3
            if x == 3:
                x = x + 10
            print(x)
            '''), '13',
            explicacao='A condição `x == 3` é `True`, então o bloco roda e o `x` passa a valer 13. Depois o `print` mostra o valor novo.'),
        BUG(L('''
            senha = "1234"
            if senha == "1234"
                print("Acesso liberado")
            print("Fim")
            '''), 2, 'if senha == "1234":', ['if senha = "1234":', 'if senha == "1234";'],
            erro="SyntaxError: expected ':'",
            enunciado='Este programa deveria mostrar Acesso liberado e Fim, mas dá erro.',
            porque='Toda linha de `if` precisa terminar com dois-pontos. Sem eles, o Python não sabe onde a condição acaba e mostra SyntaxError.',
            explicacao='Com `:` no fim da linha, o bloco recuado passa a valer. Trocar por `=` ou por `;` não resolve: a comparação usa `==` e o fim da linha pede dois-pontos.'),
        QUIZ(C('''
            n = 5
            if n > 10:
                print("A")
                print("B")
            print("C")
            '''), 'C', ['A\nB\nC', 'B\nC', 'A\nC'],
            explicacao='As duas linhas recuadas pertencem ao `if`, e as duas são puladas porque 5 não é maior que 10. Só o `print("C")`, sem recuo, roda.'),
        MONTE(L('''
            temp = int(input("Temperatura? "))
            if temp > 80:
                print("Alerta!")
            print("Fim")
            '''), 'Temperatura? 90\nAlerta!\nFim', entrada=['90'],
            enunciado='Coloque as linhas na ordem certa. A pessoa digita 90, e o programa mostra o alerta e depois Fim.',
            explicacao='Primeiro a leitura cria `temp`. O `if` usa esse valor, o `print` recuado fica logo abaixo dele, e o `print("Fim")` sem recuo vem por último.'),
        LACUNA(C('''
            vidas = 0
            {1} vidas {2} 0:
                print("Fim de jogo")
            '''), ['if', '=='], ['=', '!='], 'Fim de jogo',
            enunciado='Complete o código para ele mostrar: Fim de jogo',
            explicacao='A decisão começa com `if`, e a condição compara com `==`. Um `=` guardaria valor em vez de comparar, e `!=` daria `False` aqui, pulando o bloco.'),
        PARES([('if', 'Abre a decisão (se)'), (':', 'Termina a linha do if'), ('4 espaços', 'Marcam o que está dentro do if'), ('==', 'Compara dois valores')], _if_ok,
            enunciado='Ligue cada item ao seu papel.', esq_codigo=False,
            explicacao='O `if` abre a decisão e o `:` fecha a linha dela. O recuo mostra o que pertence ao bloco, e o `==` é usado na condição para comparar.'),
        ERRO(C('''
            n = 5
            if n > 3:
            print("grande")
            '''), 'IndentationError', ['NameError', 'TypeError', 'ValueError'],
            explicacao='Depois de um `if`, a linha seguinte precisa estar recuada. Sem o recuo, o Python não sabe o que pertence ao bloco e avisa com IndentationError.'),
        DIGITE(C('''
            total = 0
            preco = 30
            if preco > 20:
                total = total + preco
            if preco > 40:
                total = total + 100
            print(total)
            '''), '30',
            explicacao='Cada `if` é avaliado sozinho. O primeiro é `True` e soma 30; o segundo é `False` e é pulado, então o total fica em 30.'),
    ])

# ======================================================================= u03l03
L03 = LICAO('u03l03', 'if e else', 'Escolher entre dois caminhos',
    INTRO([
        'O **`else`** (em português, "senão") roda quando a condição do `if` é `False`. Assim o programa sempre escolhe um dos dois caminhos.',
        'O `else:` fica na mesma altura do `if`, termina com dois-pontos e tem o seu bloco recuado. Ele não leva condição.',
        'Nunca rodam os dois blocos: ou roda o do `if`, ou roda o do `else`.',
    ], [
        EXEMPLO(C('''
            idade = int(input("Idade? "))
            if idade >= 18:
                print("Pode entrar")
            else:
                print("Entrada negada")
            '''), entrada=['16'], nota='Com idade 16, a condição é `False`, então roda o bloco do `else`.'),
    ]),
    [
        QUIZ(C('''
            vidas = 0
            if vidas > 0:
                print("Jogando")
            else:
                print("Game over")
            '''), 'Game over', ['Jogando', 'Jogando\nGame over', 'False'],
            explicacao='`vidas > 0` é `False`, então o bloco do `if` é pulado e roda o do `else`. Nunca aparecem as duas mensagens juntas.'),
        QUIZ(C('''
            nota = 7
            if nota >= 6:
                print("Passou")
            else:
                print("Ficou")
            print("Fim")
            '''), 'Passou\nFim', ['Passou\nFicou\nFim', 'Ficou\nFim', 'Passou'],
            explicacao='A condição é `True`, então roda só o bloco do `if`. O `print("Fim")` está fora dos dois blocos e roda sempre.'),
        DIGITE(C('''
            x = 10
            if x % 2 == 0:
                tipo = "par"
            else:
                tipo = "impar"
            print(tipo)
            '''), 'par',
            explicacao='10 dividido por 2 deixa resto 0, então `x % 2 == 0` é `True`. Roda o bloco do `if`, e `tipo` guarda "par".'),
        BUG(L('''
            n = 4
            if n > 5:
                print("grande")
            else n <= 5:
                print("pequeno")
            '''), 4, 'else:', ['else (n <= 5):', 'else: n <= 5'],
            erro="SyntaxError: expected ':'",
            enunciado='Este programa deveria mostrar pequeno, mas dá erro.',
            porque='O `else` não aceita condição: depois dele só pode vir o dois-pontos. Ao encontrar `n <= 5`, o Python mostra SyntaxError.',
            explicacao='O `else:` já significa "em todos os outros casos", então não precisa de condição. Colocar a condição entre parênteses ou depois do `:` continua errado.'),
        MONTE(L('''
            senha = input("Senha? ")
            if senha == "abc":
                print("Entrou")
            else:
                print("Negado")
            '''), 'Senha? xyz\nNegado', entrada=['xyz'],
            enunciado='Coloque as linhas na ordem certa. A pessoa digita xyz, e o programa mostra Negado.',
            explicacao='O `input` vem primeiro porque o `if` usa `senha`. O `else:` só faz sentido depois do bloco do `if`, e cada `print` recuado fica logo abaixo da sua linha.'),
        LACUNA(C('''
            cor = "verde"
            {1} cor == "vermelho":
                print("Pare")
            {2}:
                print("Siga")
            '''), ['if', 'else'], ['then', 'senao'], 'Siga',
            enunciado='Complete o código para ele mostrar: Siga',
            explicacao='A decisão abre com `if` e a alternativa se escreve `else:`. Palavras como `then` existem em outras linguagens, mas não no Python.'),
        ERRO(C('''
            n = 7
            if n > 10:
                msg = "grande"
            print(msg)
            '''), 'NameError', ['TypeError', 'SyntaxError', 'ValueError'],
            explicacao='Como 7 não é maior que 10, o bloco do `if` foi pulado e `msg` nunca foi criada. Um `else` que também guardasse algo em `msg` evitaria o erro.'),
        QUIZ(C('''
            x = 5
            if x > 3:
                print("A")
            if x > 4:
                print("B")
            else:
                print("C")
            '''), 'A\nB', ['A\nB\nC', 'A\nC', 'A'],
            explicacao='O `else` pertence ao segundo `if`, o mais próximo acima dele. O primeiro `if` é independente, e o segundo é `True`, então não roda o `else`.'),
        QUIZ(C('''
            nome = "Ana"
            idade = 17
            if idade >= 18:
                print(f"{nome} é maior")
            else:
                print(f"{nome} é menor")
            '''), 'Ana é menor', ['Ana é maior', '{nome} é menor', 'Ana'],
            explicacao='17 não é maior ou igual a 18, então roda o `else`. A f-string troca `{nome}` pelo valor da variável: Ana.'),
        DIGITE(C('''
            horas = int(input())
            if horas > 8:
                extra = horas - 8
            else:
                extra = 0
            print(extra)
            '''), '2', entrada=['10'],
            enunciado='A pessoa digita 10. Digite o que o programa mostra.',
            explicacao='10 é maior que 8, então roda o bloco do `if`: `extra` vale 10 - 8, que é 2. O `else` é pulado.'),
    ])

# ======================================================================= u03l04
import dsl as _dsl


def _roda(codigo, entrada=()):
    """Só para as conferências (verif=...): roda o código de verdade e devolve (saida, erro, linha)."""
    return _dsl.rodar(codigo, tuple(entrada), False)


def _conceito_ok(nota, letra):
    # a regra do enunciado escrita em Python: confere cada nota rodando o programa de verdade
    programa = ('nota = %s\nif nota >= 90:\n    print("A")\nelif nota >= 75:\n    print("B")\n'
                'elif nota >= 60:\n    print("C")\nelse:\n    print("D")') % nota
    return _roda(programa)[0] == letra


L04 = LICAO('u03l04', 'elif: vários caminhos', 'Encadear várias condições com elif',
    INTRO([
        'O **`elif`** (de "else if", em português "senão se") faz uma nova pergunta quando as anteriores deram `False`. Você pode usar quantos `elif` precisar.',
        'O Python testa as condições de cima para baixo e **para na primeira que der `True`**. Só aquele bloco roda, e o resto da cadeia é pulado.',
        'O `else` no fim, se existir, pega tudo o que sobrou. Ele não leva condição.',
    ], [
        EXEMPLO(C('''
            temp = 45
            if temp >= 100:
                print("Fervendo")
            elif temp >= 40:
                print("Quente")
            else:
                print("Fria")
            '''), nota='O primeiro teste deu `False`, o segundo deu `True`, e o `else` foi pulado.'),
        EXEMPLO(C('''
            x = 15
            if x > 5:
                print("maior que 5")
            elif x > 10:
                print("maior que 10")
            '''), nota='As duas condições seriam `True`, mas o `elif` nem é testado: o primeiro bloco já rodou.'),
    ]),
    [
        QUIZ(C('''
            pontos = 55
            if pontos >= 90:
                print("Ouro")
            elif pontos >= 50:
                print("Prata")
            else:
                print("Bronze")
            '''), 'Prata', ['Ouro', 'Bronze', 'Prata\nBronze'],
            explicacao='55 não chega a 90, mas passa de 50, então roda o bloco do `elif`. Depois que um bloco roda, o `else` é pulado.'),
        QUIZ(C('''
            idade = 70
            if idade >= 18:
                print("Adulto")
            elif idade >= 60:
                print("Idoso")
            else:
                print("Menor")
            '''), 'Adulto', ['Idoso', 'Adulto\nIdoso', 'Menor'],
            explicacao='70 passa no primeiro teste (`>= 18`), então o `elif` nem é olhado, mesmo com a condição `True`. Para aparecer Idoso, o teste `>= 60` teria de vir antes.'),
        DIGITE(C('''
            compra = 250
            if compra >= 500:
                desconto = compra * 20 // 100
            elif compra >= 200:
                desconto = compra * 10 // 100
            else:
                desconto = 0
            print(desconto)
            '''), '25',
            explicacao='250 não chega a 500, mas passa de 200: roda o `elif`. A conta é 250 * 10 = 2500, e 2500 // 100 dá 25.'),
        BUG(L('''
            n = 5
            if n > 10:
                print("grande")
            else if n > 3:
                print("médio")
            '''), 4, 'elif n > 3:', ['else n > 3:', 'elseif n > 3:'],
            erro="SyntaxError: expected ':'",
            enunciado='Este programa deveria mostrar médio, mas dá erro.',
            porque='No Python, "senão se" não se escreve em duas palavras. Depois do `else`, o Python espera logo os dois-pontos e encontra o `if`: SyntaxError.',
            explicacao='A palavra certa é `elif`, tudo junto. O `else` não aceita condição, e `elseif` não existe no Python.'),
        MONTE(L('''
            nota = int(input("Nota? "))
            if nota >= 9:
                print("Ótimo")
            elif nota >= 6:
                print("Bom")
            print("Fim")
            '''), 'Nota? 7\nBom\nFim', entrada=['7'],
            enunciado='Coloque as linhas na ordem certa. A pessoa digita 7, e o programa mostra o conceito e depois Fim.',
            explicacao='A nota é lida primeiro. O `elif` só pode vir depois do bloco do `if`, e o `print("Fim")` sem recuo fecha a cadeia e roda por último.'),
        LACUNA(C('''
            nivel = 10
            if nivel < 20:
                print("Baixo")
            {1} nivel < 80:
                print("Médio")
            {2}:
                print("Alto")
            '''), ['elif', 'else'], ['if', 'elseif', 'then'], 'Baixo',
            enunciado='Complete o código para ele mostrar só: Baixo',
            explicacao='O `elif` só é testado quando o `if` de cima deu `False`. Com um segundo `if`, os dois testes aconteceriam e apareceriam Baixo e Médio. O `else` fecha a cadeia, sem condição.'),
        PARES([('90', 'A'), ('75', 'B'), ('74', 'C'), ('59', 'D')], _conceito_ok,
            enunciado='O programa dá A para nota 90 ou mais, B para 75 ou mais, C para 60 ou mais e D para o resto. Ligue cada nota à letra.', esq_codigo=False,
            explicacao='Cada nota fica com a primeira condição que ela cumpre, de cima para baixo. O 90 e o 75 estão no limite, e o `>=` inclui o limite; o 74 cai no C, e o 59 sobra para o `else`.'),
        ERRO(C('''
            n = 5
            if n > 3:
                print("a")
            else:
                print("b")
            elif n > 1:
                print("c")
            '''), 'SyntaxError', ['NameError', 'TypeError', 'ValueError'],
            explicacao='O `else` encerra a cadeia: depois dele não pode vir um `elif`. O Python vê isso antes de rodar e avisa com SyntaxError.'),
        QUIZ(C('''
            hora = int(input("Hora? "))
            if hora < 12:
                saudacao = "Bom dia"
            elif hora < 18:
                saudacao = "Boa tarde"
            else:
                saudacao = "Boa noite"
            print(f"{saudacao}, Ana!")
            '''), 'Boa tarde, Ana!', ['Bom dia, Ana!', 'Boa noite, Ana!', 'Boa tarde'],
            entrada=['15'],
            explicacao='O `input` devolve texto, e o `int` o transforma em 15. Esse valor não é menor que 12, mas é menor que 18, então roda o `elif`, e a f-string monta a frase com o valor de `saudacao`.'),
        QUIZ(C('''
            x = 8
            if x > 5:
                print("A")
            if x > 7:
                print("B")
            elif x > 6:
                print("C")
            else:
                print("D")
            '''), 'A\nB', ['A', 'A\nB\nC', 'B'],
            explicacao='São duas cadeias separadas. O primeiro `if` está sozinho e mostra A. A segunda cadeia começa em `if x > 7`, que é `True` e mostra B, e o `elif` e o `else` dela são pulados.'),
    ])

# ======================================================================= u03l05
_FRASES = {
    'Maior de idade e com ingresso': 'idade >= 18 and ingresso',
    'Sábado ou domingo': 'dia == "sábado" or dia == "domingo"',
    'A porta não está aberta': 'not porta_aberta',
    'Temperatura entre 20 e 30': 'temp >= 20 and temp <= 30',
}


def _frase_ok(frase, codigo):
    return _FRASES.get(frase) == codigo


L05 = LICAO('u03l05', 'and, or e not', 'Juntar e inverter condições',
    INTRO([
        'Os operadores **`and`** ("e"), **`or`** ("ou") e **`not`** ("não") juntam ou invertem condições, e o resultado também é `True` ou `False`.',
    ], [
        EXEMPLO(C('''
            idade = 25
            tem_ingresso = True
            if idade >= 18 and tem_ingresso:
                print("Entrada liberada")
            else:
                print("Entrada negada")
            '''), nota='A variável `tem_ingresso` já guarda `True` ou `False`, então pode ficar sozinha na condição.'),
        EXEMPLO(C('''
            dia = "sábado"
            em_manutencao = False
            if dia == "sábado" or dia == "domingo":
                print("Fim de semana")
            if not em_manutencao:
                print("Máquina livre")
            '''), nota='No `or`, um lado `True` já resolve. O `not` inverte o `False` de `em_manutencao`.'),
    ], lista=[
        '`a and b`: `True` só quando as duas condições são `True`.',
        '`a or b`: `True` quando pelo menos uma das duas é `True`.',
        '`not a`: inverte, então `True` vira `False` e `False` vira `True`.',
    ], depois=[
        'Numa prensa com dois botões de segurança, a máquina só aciona se os dois estiverem apertados: isso é um `and`. Se um botão sozinho já acionasse, seria um `or`.',
        'Cada lado do `and` e do `or` precisa ser uma condição completa: escreva `x > 3 and x < 10`, e não `x > 3 and < 10`.',
        'Com vários operadores juntos, o Python resolve primeiro o `not`, depois o `and`, e por último o `or`. Parênteses deixam a ordem clara.',
    ]),
    [
        QUIZ(C('''
            temp = 90
            pressao = 5
            if temp > 80 and pressao > 8:
                print("Alarme")
            else:
                print("Normal")
            '''), 'Normal', ['Alarme', 'Alarme\nNormal'],
            explicacao='O `and` exige as duas condições `True`. A temperatura passa de 80, mas a pressão 5 não passa de 8, então o resultado é `False` e roda o `else`.'),
        QUIZ(C('''
            moedas = 0
            vidas = 3
            if moedas > 0 or vidas > 0:
                print("Continua")
            else:
                print("Fim de jogo")
            '''), 'Continua', ['Fim de jogo', 'Continua\nFim de jogo'],
            explicacao='`moedas > 0` é `False`, mas `vidas > 0` é `True`. No `or`, um lado `True` já deixa o resultado `True`.'),
        DIGITE(C('''
            a = 10
            b = 4
            print(a > 5 and b > 5, a > 5 or b > 5)
            '''), 'False True',
            explicacao='`a > 5` é `True` e `b > 5` é `False`. O `and` precisa dos dois `True`, então dá `False`; o `or` aceita um só, então dá `True`.'),
        PARES([('Maior de idade e com ingresso', 'idade >= 18 and ingresso'), ('Sábado ou domingo', 'dia == "sábado" or dia == "domingo"'),
               ('A porta não está aberta', 'not porta_aberta'), ('Temperatura entre 20 e 30', 'temp >= 20 and temp <= 30')], _frase_ok,
            enunciado='Ligue cada frase à condição que a escreve em Python.', esq_codigo=False, dir_codigo=True,
            explicacao='"E" vira `and`, "ou" vira `or`, e "não" vira `not`. Nos intervalos, cada lado do `and` repete a variável: `temp >= 20 and temp <= 30`.'),
        LACUNA(C('''
            chave = True
            trava = True
            if chave {1} {2} trava:
                print("Liga")
            else:
                print("Bloqueada")
            '''), ['and', 'not'], ['or', 'if'], 'Bloqueada',
            enunciado='Complete o código para ele mostrar: Bloqueada',
            explicacao='O `not trava` inverte o `True` e vira `False`. No `and`, um lado `False` já deixa tudo `False`, e roda o `else`. Com `or`, o lado `chave` já seria `True`, e apareceria Liga.'),
        BUG(L('''
            x = 7
            if x > 3 and < 10:
                print("Entre 3 e 10")
            print("Fim")
            '''), 2, 'if x > 3 and x < 10:', ['if x > 3 and (< 10):', 'if x > 3, x < 10:'],
            erro='SyntaxError: invalid syntax',
            enunciado='Este programa deveria mostrar Entre 3 e 10 e depois Fim, mas dá erro.',
            porque='O `and` liga duas condições completas. O trecho `< 10` não tem nada à esquerda para comparar, e o Python mostra SyntaxError.',
            explicacao='Repetir a variável deixa as duas condições completas: `x > 3 and x < 10`. Parênteses ou vírgula não resolvem, porque a condição continua incompleta.'),
        MONTE(L('''
            nota = int(input("Nota? "))
            faltas = int(input("Faltas? "))
            if nota >= 6 and faltas <= 5:
                print("Aprovado")
            else:
                print("Reprovado")
            '''), 'Nota? 7\nFaltas? 2\nAprovado', entrada=['7', '2'],
            enunciado='Coloque as linhas na ordem certa. A pessoa digita 7 e depois 2, e o programa mostra o resultado.',
            explicacao='As duas leituras vêm antes do `if`, na ordem das perguntas. Com nota 7 e 2 faltas, as duas condições são `True`, então roda o bloco do `if`, e não o do `else`.'),
        QUIZ(C('''
            nome = "Rui"
            logado = False
            if not logado:
                print(f"Olá, {nome}. Entre na conta.")
            else:
                print(f"Bem-vindo, {nome}!")
            '''), 'Olá, Rui. Entre na conta.', ['Bem-vindo, Rui!', 'Olá, {nome}. Entre na conta.'],
            explicacao='`logado` vale `False`, e o `not` o inverte para `True`. Por isso roda o bloco do `if`, e a f-string troca `{nome}` por Rui.'),
        QUIZ(C('''
            print(True or False and False)
            print((True or False) and False)
            '''), 'True\nFalse', ['False\nFalse', 'True\nTrue', 'False\nTrue'],
            explicacao='O `and` é resolvido antes do `or`: a primeira linha vira `True or False`, que dá `True`. Com parênteses, o `or` vem primeiro, e `True and False` dá `False`.'),
        QUIZ(C('''
            ano = 2000
            normal = ano % 4 == 0 and ano % 100 != 0
            especial = ano % 400 == 0
            print(normal, especial, normal or especial)
            '''), 'False True True', ['False False False', 'True True True', 'True False True'],
            explicacao='2000 é divisível por 4, mas também por 100, então `normal` é `False`. Ele é divisível por 400, então `especial` é `True`, e o `or` junta os dois: `True`.'),
    ])

# ======================================================================= u03l06
_ENCADEADAS = [('1 < x < 5', 'x > 1 and x < 5'), ('1 <= x <= 5', 'x >= 1 and x <= 5'),
               ('1 < x <= 5', 'x > 1 and x <= 5'), ('1 <= x < 5', 'x >= 1 and x < 5')]


def _tabela(expressao):
    return [_roda('x = %d\nprint(%s)' % (x, expressao))[0] for x in range(-1, 8)]


def _encadeada_ok(esq, dir):
    # dá a mesma resposta para todo x, e nenhuma outra opção da direita dá
    outras = [d for e, d in _ENCADEADAS if d != dir and _tabela(esq) == _tabela(d)]
    return _tabela(esq) == _tabela(dir) and not outras


L06 = LICAO('u03l06', 'in e comparação encadeada', 'Procurar dentro de textos e testar intervalos',
    INTRO([
        'O `in` pergunta se um pedaço de texto aparece dentro de outro. Para uma letra só, `letra in "aeiou"` faz o trabalho de cinco comparações ligadas por `or`.',
        'O `not in` pergunta o contrário: `"@" not in email` é `True` quando o e-mail não tem arroba.',
        'A **comparação encadeada** escreve um intervalo como na matemática: `18 <= idade < 65` significa `idade >= 18 and idade < 65`.',
        'O valor do meio é comparado com os dois lados. O `<=` inclui o extremo, e o `<` deixa o extremo de fora.',
    ], [
        EXEMPLO(C('''
            letra = "e"
            if letra in "aeiou":
                print("Vogal")
            else:
                print("Consoante")
            '''), nota='O `in` pergunta se a letra aparece dentro de "aeiou".'),
        EXEMPLO(C('''
            idade = 30
            print(18 <= idade < 65)
            print(0 < idade < 10)
            '''), nota='No primeiro `print`, a idade está dentro do intervalo. No segundo, 30 não é menor que 10, então dá `False`.'),
    ]),
    [
        QUIZ(C('''
            tecla = "7"
            digitos = "0123456789"
            print(tecla in digitos, "a" in digitos)
            '''), 'True False', ['True True', 'False False', 'False True'],
            explicacao='O "7" aparece na sequência de dígitos, e o "a" não aparece. O `in` dá uma resposta `True` ou `False` para cada pergunta.'),
        QUIZ(C('''
            temp = 70
            print(60 <= temp <= 80)
            print(60 <= temp < 70)
            '''), 'True\nFalse', ['True\nTrue', 'False\nFalse', 'False\nTrue'],
            explicacao='Na primeira linha, 70 está entre 60 e 80. Na segunda, o `< 70` deixa o 70 de fora, e o resultado é `False`.'),
        DIGITE(C('''
            nome = "Carlos"
            print("los" in nome, "LOS" in nome)
            '''), 'True False',
            explicacao='O pedaço "los" aparece em "Carlos". Já "LOS", em maiúsculas, é outro texto, porque maiúscula e minúscula contam.'),
        LACUNA(C('''
            nota = 7
            if {1} <= nota {2} 10:
                print("Nota válida")
            '''), ['0', '<='], ['>=', '>', '11'], 'Nota válida',
            enunciado='Complete o código para ele mostrar: Nota válida',
            explicacao='O `0 <= nota <= 10` pergunta se a nota está entre 0 e 10, incluindo os extremos. Com `>=` ou `>` no segundo lugar, a nota teria de ser maior que 10, e o 7 não passaria.'),
        BUG(L('''
            saldo = 50
            if 0 =< saldo < 100:
                print("Saldo baixo")
            print("Fim")
            '''), 2, 'if 0 <= saldo < 100:', ['if 0 => saldo < 100:', 'if 0 == saldo < 100:'],
            erro='SyntaxError: invalid syntax',
            enunciado='Este programa deveria mostrar Saldo baixo e depois Fim, mas dá erro.',
            porque='O Python não tem o símbolo `=<`: no "menor ou igual", o `<` vem antes do `=`. Ao encontrar `=<`, ele não entende a linha e mostra SyntaxError.',
            explicacao='O `<=` é o símbolo certo. O `=>` também não existe, e o `==` pergunta se o saldo é igual a 0, que é outra pergunta.'),
        MONTE(L('''
            email = input("E-mail? ")
            if "@" in email:
                print("E-mail válido")
            else:
                print("Falta o @")
            '''), 'E-mail? ana@mail.com\nE-mail válido', entrada=['ana@mail.com'],
            enunciado='Coloque as linhas na ordem certa. A pessoa digita ana@mail.com, e o programa mostra o resultado.',
            explicacao='O `input` vem primeiro, porque o `if` usa `email`. O @ aparece no texto digitado, então roda o bloco do `if`, e o `else` fica de fora.'),
        PARES(_ENCADEADAS, _encadeada_ok,
            enunciado='Ligue cada comparação encadeada à versão com `and` que sempre dá a mesma resposta.', esq_codigo=True, dir_codigo=True,
            explicacao='A comparação encadeada repete o valor do meio nos dois lados. O `<` deixa o extremo de fora, e o `<=` o inclui, tanto na versão encadeada quanto na versão com `and`.'),
        ERRO(C('''
            cod = 2024
            if "20" in cod:
                print("Começa com 20")
            '''), 'TypeError', ['ValueError', 'NameError', 'SyntaxError'],
            explicacao='O `in` procura um pedaço dentro de um texto, e `cod` é um número (`int`). O Python avisa com TypeError. Com `str(cod)`, a pergunta funcionaria.'),
        QUIZ(C('''
            peso = int(input("Peso (kg)? "))
            if 0 < peso <= 20:
                taxa = 10
            elif 20 < peso <= 50:
                taxa = 25
            else:
                taxa = 40
            print(f"Taxa: R$ {taxa}")
            '''), 'Taxa: R$ 10', ['Taxa: R$ 25', 'Taxa: R$ 40', 'Taxa: R$ 20'],
            entrada=['20'],
            explicacao='O peso 20 cabe em `0 < peso <= 20`, porque o `<=` inclui o extremo. Por isso `taxa` vale 10, e o `elif` nem é testado.'),
        QUIZ(C('''
            senha = "Abc-123"
            print("-" in senha and 6 < len(senha) < 10)
            print("-" not in senha or len(senha) < 4)
            '''), 'True\nFalse', ['True\nTrue', 'False\nFalse', 'False\nTrue'],
            explicacao='A senha tem o traço e 7 caracteres, que está entre 6 e 10: as duas partes do `and` são `True`. Na segunda linha, `"-" not in senha` é `False` e `len(senha) < 4` também, então o `or` dá `False`.'),
    ])

# ======================================================================= u03l07
def _valor_ok(valor, descricao):
    # roda bool(valor) de verdade e compara com o que a descrição diz
    esperado = 'True' if descricao.startswith('Verdadeiro') else 'False'
    return _roda('print(bool(%s))' % valor)[0] == esperado


L07 = LICAO('u03l07', 'Verdadeiro e falso de valores', 'Como o Python trata 0, texto vazio e None numa condição',
    INTRO([
        'Na condição de um `if`, o Python aceita qualquer valor, e não só `True` ou `False`. Ele decide se o valor conta como verdadeiro ou como falso.',
        'Contam como **falso**: `False`, o número `0` (e `0.0`), o texto vazio `""` e o `None`. Entre os valores que você já conhece, todo o resto conta como **verdadeiro**.',
        'O **`None`** é um valor especial que significa "nenhum valor": a ideia de "ainda não tem resposta".',
        'A função `bool()` mostra como o Python enxerga um valor: `bool(0)` dá `False` e `bool("oi")` dá `True`.',
        'Cuidado: o texto `"0"` e o texto `" "` (um espaço) não estão vazios, então contam como verdadeiros. Número negativo também é verdadeiro.',
        'O `or` e o `and` devolvem um dos valores, e não só `True` ou `False`.',
        'O `a or b` devolve `a` se ele for verdadeiro, e `b` caso contrário. O `a and b` faz o contrário: devolve `a` se ele for falso, e `b` caso contrário.',
    ], [
        EXEMPLO(C('''
            print(bool(0), bool(7))
            print(bool(""), bool("0"))
            print(bool(None))
            '''), nota='O número 0 e o texto vazio são falsos. Já o texto "0" não está vazio, então é verdadeiro.'),
        EXEMPLO(C('''
            nome = ""
            if nome:
                print("Olá,", nome)
            else:
                print("Nome vazio")
            print(nome or "visitante")
            '''), nota='O texto vazio é falso, então roda o `else`. O `or` devolve o segundo valor porque o primeiro é falso. Isso dá um valor padrão.'),
    ]),
    [
        QUIZ(C('''
            idade = 0
            if idade:
                print("Tem idade")
            else:
                print("Sem idade")
            '''), 'Sem idade', ['Tem idade', 'Tem idade\nSem idade'],
            explicacao='O número 0 conta como falso, então a condição `if idade:` não passa e roda o `else`.'),
        QUIZ(C('''
            qtd = input("Quantidade? ")
            if qtd:
                print("Tem quantidade")
            else:
                print("Vazio")
            '''), 'Tem quantidade', ['Vazio', 'Tem quantidade\nVazio'],
            entrada=['0'],
            explicacao='O `input` devolve o texto "0", e um texto só é falso quando está vazio. O "0" tem um caractere, então conta como verdadeiro.'),
        DIGITE(C('''
            print(bool(-5), bool(0.0), bool("False"))
            '''), 'True False True',
            explicacao='O -5 não é zero, então é verdadeiro. O `0.0` é zero e é falso. O texto "False" tem letras, então é verdadeiro, mesmo falando em falso.'),
        QUIZ(C('''
            cor = "preto"
            if cor == "azul" or "verde":
                print("Cor permitida")
            else:
                print("Cor proibida")
            '''), 'Cor permitida', ['Cor proibida', 'Cor permitida\nCor proibida'],
            explicacao='O `or` junta `cor == "azul"`, que é `False`, com o texto `"verde"` sozinho, e um texto cheio conta como verdadeiro. A condição fica sempre `True`. O certo é `cor == "azul" or cor == "verde"`.'),
        MONTE(L('''
            nome = ""
            if not nome:
                nome = "visitante"
            print("Olá,", nome)
            '''), 'Olá, visitante',
            explicacao='O `nome` começa vazio, que conta como falso. O `not` o inverte para `True`, então o bloco troca o valor, e só depois o `print` mostra o nome novo.'),
        LACUNA(C('''
            apelido = ""
            nome = apelido {1} "Ana"
            print(nome)
            '''), ['or'], ['and', 'not', '=='], 'Ana',
            enunciado='Complete o código para ele mostrar: Ana',
            explicacao='O `or` devolve o segundo valor quando o primeiro é falso, e o texto vazio é falso. Com `and`, o resultado seria o próprio texto vazio.'),
        PARES([('0', 'Falso: o número zero'), ('""', 'Falso: texto vazio'), ('None', 'Falso: nenhum valor'),
               ('" "', 'Verdadeiro: texto com um espaço'), ('-1', 'Verdadeiro: número diferente de 0')], _valor_ok,
            enunciado='Ligue cada valor ao que o Python faz com ele numa condição.', esq_codigo=True,
            explicacao='O zero, o texto vazio e o `None` contam como falsos. Um espaço já é um caractere, e qualquer número diferente de zero, até o negativo, conta como verdadeiro.'),
        BUG(L('''
            resultado = none
            if not resultado:
                print("Sem resultado")
            print("Fim")
            '''), 1, 'resultado = None', ['resultado = "None"', 'resultado = NONE'],
            erro="NameError: name 'none' is not defined",
            enunciado='Este programa deveria mostrar Sem resultado e depois Fim, mas dá erro.',
            porque='O valor se escreve `None`, com N maiúsculo. Com `none` minúsculo, o Python procura uma variável com esse nome, não encontra, e mostra NameError.',
            explicacao='Com `None`, o Python entende "nenhum valor", que conta como falso, e o `not` o torna `True`. O texto `"None"` é verdadeiro, e `NONE` também não existe.'),
        QUIZ(C('''
            total = 0
            a = -1
            b = ""
            if a:
                total = total + 1
            if b:
                total = total + 10
            print(total)
            '''), '1', ['0', '10', '11'],
            explicacao='O número -1 não é zero, então conta como verdadeiro e soma 1. O texto vazio é falso, e o bloco dele é pulado. O total fica em 1.'),
        QUIZ(C('''
            a = 0
            b = "ok"
            print(a or b)
            print(a and b)
            print(b and a)
            '''), 'ok\n0\n0', ['ok\n0\nok', 'True\nFalse\nFalse', '0\nok\nok'],
            explicacao='No `a or b`, o `a` é falso, então vale o `b`: ok. No `a and b`, o `a` é falso e já decide: sobra o próprio `a`, 0. No `b and a`, o `b` é verdadeiro, então vale o segundo valor: 0.'),
    ])

# ======================================================================= u03l08
L08 = LICAO('u03l08', 'if aninhado e ordem', 'Um if dentro de outro, e por que a ordem das condições importa',
    INTRO([
        'Um **`if` aninhado** é um `if` dentro do bloco de outro `if`. O de dentro só é testado quando o de fora deu `True`.',
        'Cada nível ganha mais 4 espaços de recuo. O `else` pertence ao `if` que está na mesma coluna que ele.',
        'Aninhar é útil quando a segunda pergunta só faz sentido depois da primeira. Se as duas perguntas valem sempre, um `and` deixa o código mais curto.',
        'A **ordem** das condições também importa. Numa cadeia `if`/`elif`, vale a primeira que der `True`, então comece pelo caso mais restrito.',
    ], [
        EXEMPLO(C('''
            ligada = True
            rpm = 900
            if ligada:
                if rpm > 1500:
                    print("Rotação alta")
                else:
                    print("Rotação normal")
            else:
                print("Máquina parada")
            '''), nota='A máquina está ligada, então o `if` de dentro é testado. Como 900 não passa de 1500, roda o `else` de dentro.'),
        EXEMPLO(C('''
            nota = 10
            if nota >= 6:
                print("Aprovado")
            elif nota >= 9:
                print("Com louvor")
            '''), nota='A nota 10 também passa de 9, mas o primeiro teste já deu `True`. Para aparecer "Com louvor", o teste `>= 9` precisa vir primeiro.'),
    ]),
    [
        QUIZ(C('''
            idade = 20
            tem_cnh = False
            if idade >= 18:
                if tem_cnh:
                    print("Pode dirigir")
                else:
                    print("Falta a CNH")
            else:
                print("Menor de idade")
            '''), 'Falta a CNH', ['Pode dirigir', 'Menor de idade', 'Falta a CNH\nMenor de idade'],
            explicacao='A idade 20 passa no `if` de fora, então o de dentro é testado. Como `tem_cnh` é `False`, roda o `else` de dentro. O `else` de fora só roda se a idade não passar.'),
        QUIZ(C('''
            estoque = 0
            pedido = 5
            if estoque > 0:
                if pedido <= estoque:
                    print("Enviar")
                else:
                    print("Enviar parte")
            print("Fim")
            '''), 'Fim', ['Enviar parte\nFim', 'Enviar\nFim', 'Enviar parte'],
            explicacao='Com estoque 0, o `if` de fora dá `False` e o bloco inteiro dele é pulado, inclusive o `else` de dentro. Só o `print("Fim")`, sem recuo, roda.'),
        DIGITE(C('''
            x = 15
            if x > 10:
                x = x - 10
                if x > 3:
                    x = x * 2
            print(x)
            '''), '10',
            explicacao='O `if` de fora subtrai 10, e o `x` vira 5. Como 5 é maior que 3, o `if` de dentro dobra o valor: 10.'),
        QUIZ(C('''
            x = 100
            if x > 10:
                a = "médio"
            elif x > 50:
                a = "grande"
            if x > 50:
                b = "grande"
            elif x > 10:
                b = "médio"
            print(a, b)
            '''), 'médio grande', ['grande grande', 'médio médio', 'grande médio'],
            explicacao='Na primeira cadeia, `x > 10` vem antes e já dá `True`, então `a` vira "médio" e o `elif` nem é testado. Na segunda, o caso mais restrito, `x > 50`, vem primeiro, e `b` vira "grande".'),
        BUG(L('''
            clima = "chuva"
            temp = 12
            if clima == "chuva":
                if temp < 15
                    print("Leve guarda-chuva e casaco")
            '''), 4, '    if temp < 15:', ['    if temp < 15;', '    if (temp < 15)'],
            erro="SyntaxError: expected ':'",
            enunciado='Este programa deveria mostrar Leve guarda-chuva e casaco, mas dá erro.',
            porque='Toda linha de `if` termina com dois-pontos, também a de um `if` aninhado. Sem eles, o Python não sabe onde a condição acaba e mostra SyntaxError.',
            explicacao='Com o `:`, a linha recuada logo abaixo vira o bloco do `if` de dentro. Ponto e vírgula e parênteses não substituem os dois-pontos.'),
        MONTE(L('''
            saldo = int(input("Saldo? "))
            if saldo > 0:
                if saldo >= 100:
                    print("Saldo alto")
                else:
                    print("Saldo baixo")
            '''), 'Saldo? 40\nSaldo baixo', entrada=['40'],
            enunciado='Coloque as linhas na ordem certa. A pessoa digita 40, e o programa mostra o resultado.',
            explicacao='O saldo é lido primeiro. Cada `if` aninhado fica logo abaixo do anterior, com mais recuo, e o `else` fica na mesma coluna do `if saldo >= 100`, a que ele pertence.'),
        ERRO(C('''
            n = 8
            if n > 5:
                if n > 7:
                print("muito alto")
            '''), 'IndentationError', ['NameError', 'TypeError', 'ValueError'],
            explicacao='Depois de um `if`, a linha seguinte precisa ter mais recuo. O `print` está na mesma coluna do `if` de dentro, que ficou sem bloco, e o Python avisa com IndentationError.'),
        QUIZ(C('''
            a = True
            b = False
            if a:
                if b:
                    print("X")
            else:
                print("Y")
            print("Fim")
            '''), 'Fim', ['Y\nFim', 'X\nFim', 'Y'],
            explicacao='O `else` está na mesma coluna do `if a`, então pertence a ele, e não ao `if b`. Como `a` é `True`, o `else` não roda. O `if b` dá `False` e não mostra nada, então só o `print("Fim")` aparece.'),
        LACUNA(C('''
            logado = True
            admin = False
            if logado {1} admin:
                print("Painel de controle")
            else:
                print("Acesso negado")
            '''), ['and'], ['or', 'not', 'if'], 'Acesso negado',
            enunciado='Complete o código para ele mostrar: Acesso negado',
            explicacao='Dois `if` aninhados equivalem a um `and`: as duas condições precisam ser `True`. Com `or`, o `logado` sozinho já liberaria o painel.'),
        DIGITE(C('''
            pontos = 0
            a = 7
            if a > 5:
                pontos = pontos + 1
                if a > 6:
                    pontos = pontos + 10
                    if a > 8:
                        pontos = pontos + 100
                else:
                    pontos = pontos + 1000
            print(pontos)
            '''), '11',
            explicacao='Com a = 7, o valor passa no primeiro `if` (+1) e no segundo (+10), mas não no terceiro. O `else` está alinhado com o `if a > 6`, que deu `True`, então ele não roda. O total é 11.'),
    ])

# ======================================================================= u03l09
L09 = LICAO('u03l09', 'Expressão condicional e match', 'Escolher um valor numa linha e comparar com vários casos',
    INTRO([
        'A **expressão condicional** escolhe entre dois valores numa única linha: `valor_se_verdadeiro if condição else valor_se_falso`.',
        'Ela serve para decisões simples, que só trocam um valor. Para decisões com vários passos, continue usando `if`.',
        'Dá para encadear várias, como em `a if c1 else b if c2 else c`, mas a leitura logo fica difícil.',
        'O **`match`** compara um valor com vários casos (`case`) e roda o bloco do primeiro caso que combina. O `case _:` pega todo o resto, como um `else`.',
        'Dentro de um `case`, o `|` junta alternativas: `case "a" | "e":`. Cada `case` compara com um valor exato; para faixas como "maior que 10", o `if`/`elif` é o caminho.',
    ], [
        EXEMPLO(C('''
            rpm = 1200
            estado = "girando" if rpm > 0 else "parado"
            print(estado)
            '''), nota='A condição `rpm > 0` é `True`, então vale o valor que vem antes do `if`: "girando".'),
        EXEMPLO(C('''
            opcao = "2"
            match opcao:
                case "1":
                    print("Novo jogo")
                case "2":
                    print("Continuar")
                case _:
                    print("Opção inválida")
            '''), nota='O texto "2" combina com o segundo `case`. O `case _:` só roda se nenhum dos anteriores combinou.'),
    ]),
    [
        QUIZ(C('''
            idade = 20
            tipo = "adulto" if idade >= 18 else "menor"
            print(tipo)
            '''), 'adulto', ['menor', 'True'],
            explicacao='A condição `idade >= 18` é `True`, então a expressão vale o que vem antes do `if`: "adulto". O valor depois do `else` só é usado quando a condição é `False`.'),
        DIGITE(C('''
            total = 120
            desconto = 10 if total > 100 else 0
            print(total - desconto)
            '''), '110',
            explicacao='Como 120 é maior que 100, o desconto vale 10. A conta final é 120 - 10, que dá 110.'),
        QUIZ(C('''
            dia = 3
            match dia:
                case 1:
                    print("segunda")
                case 2:
                    print("terça")
                case _:
                    print("outro dia")
            '''), 'outro dia', ['segunda', 'terça', 'segunda\nterça'],
            explicacao='O 3 não combina com o `case 1` nem com o `case 2`. O `case _:` combina com qualquer valor, então é ele que roda.'),
        BUG(L('''
            nota = 80
            msg = "passou" if nota >= 60
            print(msg)
            '''), 2, 'msg = "passou" if nota >= 60 else "falhou"', ['msg = "passou" if nota >= 60 else', 'msg = "passou" if nota >= 60:'],
            erro="SyntaxError: expected 'else' after 'if' expression",
            enunciado='Este programa deveria mostrar passou, mas dá erro.',
            porque='A expressão condicional sempre precisa das duas saídas: o valor para `True` e o valor para `False`. Sem o `else`, o Python não sabe o que guardar quando a condição falha, e mostra SyntaxError.',
            explicacao='Com `else "falhou"`, a expressão passa a ter as duas saídas. Deixar o `else` sem valor, ou trocar por dois-pontos, continua errado.'),
        MONTE(L('''
            op = input("Opção? ")
            match op:
                case "1":
                    print("Novo")
                case _:
                    print("Sair")
            '''), 'Opção? 1\nNovo', entrada=['1'],
            enunciado='Coloque as linhas na ordem certa. A pessoa digita 1, e o programa mostra o resultado.',
            explicacao='O `input` vem antes do `match`. O `case "1":` vem antes do `case _:`, que pega o resto e fica por último. Cada `print` fica logo abaixo do seu `case`.'),
        LACUNA(C('''
            cor = "azul"
            {1} cor:
                case "verde":
                    print("Siga")
                case "vermelho":
                    print("Pare")
                case {2}:
                    print("Atenção")
            '''), ['match', '_'], ['else', 'if', 'elif'], 'Atenção',
            enunciado='Complete o código para ele mostrar: Atenção',
            explicacao='O `match` abre a escolha, e o `case _:` combina com qualquer valor. Como "azul" não é verde nem vermelho, é ele que roda.'),
        PARES([('"A" if 5 > 3 else "B"', 'A'), ('"A" if 5 < 3 else "B"', 'B'), ('7 if 9 % 3 == 0 else 8', '7'), ('1 if "z" in "casa" else 2', '2')], 'avalia',
            enunciado='Ligue cada expressão ao valor que ela dá.', esq_codigo=True, dir_codigo=True,
            explicacao='A expressão vale o que vem antes do `if` quando a condição é `True`, e o que vem depois do `else` quando é `False`. O `print` mostra o valor escolhido, sem aspas.'),
        QUIZ(C('''
            n = input("Número? ")
            match n:
                case 5:
                    print("cinco")
                case _:
                    print("outro")
            '''), 'outro', ['cinco', 'cinco\noutro'],
            entrada=['5'],
            explicacao='O `input` devolve o texto "5", e o `case 5` espera o número 5. Texto e número são valores diferentes, então roda o `case _:`. Com `case "5":`, haveria combinação.'),
        QUIZ(C('''
            nota = "B"
            match nota:
                case "A":
                    pontos = 10
                case "B" | "C":
                    pontos = 5
                case _:
                    pontos = 0
            print(f"{nota} vale {pontos}")
            '''), 'B vale 5', ['B vale 10', 'B vale 0', '{nota} vale 5'],
            explicacao='O valor "B" não combina com o primeiro `case`, mas combina com uma das alternativas do segundo (`"B" | "C"`). Então `pontos` vale 5, e a f-string monta a frase.'),
        DIGITE(C('''
            n = 75
            faixa = 3 if n > 90 else 2 if n > 70 else 1
            print(faixa)
            '''), '2',
            explicacao='O Python testa `n > 90`, que é `False`, e vai para o que vem depois do primeiro `else`. Lá, `n > 70` é `True`, e vale 2.'),
    ])

# ======================================================================= u03l10
L10 = LICAO('u03l10', 'Revisão: decisões', 'Comparações, if, elif, and, or, not, in, match e mais, tudo junto',
    INTRO([
        'Esta lição junta tudo da unidade. Veja um painel de alarme que usa várias das ideias de uma vez:',
    ], [
        EXEMPLO(C('''
            temp = 92
            ligada = True
            if not ligada:
                estado = "Parada"
            elif temp >= 100:
                estado = "Desligar"
            elif 80 <= temp < 100:
                estado = "Alarme"
            else:
                estado = "Normal"
            print(estado)
            '''), nota='O painel junta `not`, `elif`, uma comparação encadeada e uma variável que guarda o resultado.'),
    ], lista=[
        'Comparar: `==`, `!=`, `>`, `<`, `>=` e `<=`, com resposta `True` ou `False`.',
        'Decidir: `if`, `elif` e `else`, com o bloco recuado. O Python para na primeira condição `True`.',
        'Combinar: `and`, `or` e `not`, e também `in` e `not in` com textos.',
        'Intervalos: `18 <= idade < 65`.',
        'Valores falsos: `False`, `0`, `""` e `None`. Os outros que você conhece são verdadeiros.',
        'Atalhos: `a if condição else b` e `match` com `case _:`.',
    ], depois=[
        'Lembretes: a ordem das condições importa, e o `else` pertence ao `if` que está na mesma coluna que ele.',
    ]),
    [
        QUIZ(C('''
            temp = 85
            vibracao = 3
            if temp > 100 or vibracao > 8:
                print("Desligar")
            elif temp > 80 and vibracao > 5:
                print("Alarme")
            elif temp > 80:
                print("Aviso")
            else:
                print("Normal")
            '''), 'Aviso', ['Alarme', 'Normal', 'Desligar'],
            explicacao='O primeiro teste falha: 85 não passa de 100, e 3 não passa de 8. No segundo, a temperatura passa, mas a vibração 3 não passa de 5, então o `and` dá `False`. O terceiro teste é `True`, e mostra Aviso.'),
        DIGITE(C('''
            horas = 50
            extra = horas - 40 if horas > 40 else 0
            print(extra * 15)
            '''), '150',
            explicacao='Como 50 é maior que 40, a expressão vale 50 - 40, que é 10. O `print` multiplica por 15 e mostra 150.'),
        QUIZ(C('''
            nome = ""
            print("Olá,", nome or "visitante")
            print(bool(nome), bool("0"))
            '''), 'Olá, visitante\nFalse True', ['Olá, visitante\nTrue True', 'Olá, visitante\nFalse False', 'Olá, nome\nFalse True'],
            explicacao='O texto vazio é falso, então o `or` devolve "visitante". O `bool(nome)` dá `False`, mas o texto "0" tem um caractere, e o `bool("0")` dá `True`.'),
        BUG(L('''
            temp = 85
            vibracao = 9
            if temp > 80 && vibracao > 8:
                print("Alarme")
            print("Fim")
            '''), 3, 'if temp > 80 and vibracao > 8:', ['if temp > 80 AND vibracao > 8:', 'if temp > 80 e vibracao > 8:'],
            erro='SyntaxError: invalid syntax',
            enunciado='Este programa deveria mostrar Alarme e depois Fim, mas dá erro.',
            porque='O `&&` é de outras linguagens, como JavaScript, e não existe no Python. Ao encontrá-lo, o Python não entende a linha e mostra SyntaxError.',
            explicacao='No Python, o "e" das condições se escreve `and`, em minúsculas. `AND` com maiúsculas não vale, e `e` em português também não.'),
        MONTE(L('''
            senha = input("Senha? ")
            if len(senha) < 6 or senha.isdigit():
                print("Senha fraca")
            else:
                print("Senha ok")
            '''), 'Senha? 12345678\nSenha fraca', entrada=['12345678'],
            enunciado='Coloque as linhas na ordem certa. A pessoa digita 12345678, e o programa mostra o resultado.',
            explicacao='A senha é lida primeiro. Ela tem 8 caracteres, mas só números, e o `isdigit()` dá `True`. Um lado do `or` verdadeiro já faz rodar o bloco do `if`.'),
        LACUNA(C('''
            placa = "ABC1D23"
            status = "ok" {1} len(placa) == 7 {2} "erro"
            print(status)
            '''), ['if', 'else'], ['elif', 'then'], 'ok',
            enunciado='Complete o código para ele mostrar: ok',
            explicacao='A expressão condicional tem o formato `valor if condição else outro valor`. A placa tem 7 caracteres, então a condição é `True`, e vale "ok".'),
        PARES([('3 > 2 and 1 < 5', 'bool'), ('0 or 7', 'int'), ('"" or "oi"', 'str'), ('None', 'NoneType'), ('7 / 2', 'float')], 'tipo',
            enunciado='Ligue cada expressão ao tipo do valor que ela produz.', esq_codigo=True, dir_codigo=True,
            explicacao='A comparação ligada por `and` dá `bool`. O `0 or 7` devolve o 7, que é `int`, e o `"" or "oi"` devolve o texto "oi". O `None` tem tipo próprio, e a divisão com `/` sempre dá `float`.'),
        QUIZ(C('''
            t = 60
            a = not t > 80 or t < 50
            b = t > 70 and not t > 90
            print(a, b)
            '''), 'True False', ['True True', 'False True', 'False False'],
            explicacao='O `not` pega só a comparação `t > 80`: como 60 não passa de 80, ela vira `True`, e o `or` dá `True`. Na segunda linha, `t > 70` é `False`, e o `and` precisa dos dois lados `True`.'),
        QUIZ(C('''
            cod = "B"
            match cod:
                case "A" | "B":
                    nivel = 1 if cod == "A" else 2
                case _:
                    nivel = 0
            print(f"Nível {nivel}")
            '''), 'Nível 2', ['Nível 1', 'Nível 0', 'Nível {nivel}'],
            explicacao='O "B" combina com a alternativa `"A" | "B"`. Dentro do bloco, `cod == "A"` é `False`, então a expressão condicional vale 2, e a f-string mostra Nível 2.'),
        QUIZ(C('''
            consumo = 150
            tarifa = 0.5 if consumo <= 100 else 0.8
            print(f"R$ {consumo * tarifa:.2f}")
            '''), 'R$ 120.00', ['R$ 120.0', 'R$ 75.00', 'R$ 120'],
            explicacao='Como 150 passa de 100, a tarifa é 0.8, e a conta é 150 * 0.8 = 120. O `:.2f` mostra sempre duas casas depois do ponto: 120.00.'),
        DIGITE(C('''
            hora = int(input())
            dia = input()
            if dia == "sab" or dia == "dom":
                preco = 20
            elif 6 <= hora < 18:
                preco = 15
            else:
                preco = 25
            print(preco)
            '''), '25', entrada=['20', 'seg'],
            enunciado='A pessoa digita 20 e depois seg. Digite o que o programa mostra.',
            explicacao='"seg" não é fim de semana, então o primeiro teste falha. A hora 20 não está entre 6 e 18, então o `elif` também falha, e roda o `else`: 25.'),
    ])

UNIDADE('u03', 'Decisões', 'Fazer o programa escolher o que fazer.', [L01, L02, L03, L04, L05, L06, L07, L08, L09, L10])
