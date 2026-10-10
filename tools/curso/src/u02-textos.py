# -*- coding: utf-8 -*-
# Unidade 2 — Textos.  Veja tools/curso/GUIA-AUTORES.md
import ast as _ast
import dsl as _dsl
from dsl import *


def _roda(codigo, entrada=()):
    """Só para as conferências (teste=...): roda o código de verdade e devolve (saida, erro, linha)."""
    return _dsl.rodar(codigo, tuple(entrada), False)


# ======================================================================= u02l01
_CARACTERES = {'Nova linha': '\n', 'Tabulação (espaço largo)': '\t', 'Uma barra invertida': '\\', 'Uma aspa dupla': '"'}


def _escape_ok(a, b):
    # confere com o Python o que o escape (esquerda) realmente vira
    return _ast.literal_eval('"' + a + '"') == _CARACTERES[b]


L01 = LICAO('u02l01', 'Aspas e caracteres especiais', 'Aspas simples, duplas e triplas e os escapes',
    INTRO([
        r'''Um texto (`str`) pode usar aspas simples ou duplas: `'oi'` e `"oi"` são o mesmo texto. Neste curso, o padrão é usar aspas duplas.''',
        r'''Se o texto já tem uma aspa, use o outro tipo por fora: `"Copo d'água"`. Outra saída é a barra invertida antes da aspa: `'Copo d\'água'`.''',
        r'''A barra invertida `\` cria um **caractere de escape**: uma combinação que o Python troca por um caractere especial. Os principais são:''',
    ], [
        EXEMPLO(C('''
            print('Olá')
            print("Olá")
            print("Copo d'água")
            print('Ela disse: "oi"')
            ''')),
        EXEMPLO(C(r'''
            print("Linha 1\nLinha 2")
            print("Nome:\tAna")
            print("C:\\fotos")
            print("""Linha 3
            Linha 4""")
            '''), nota='Cada escape virou um caractere especial na tela.'),
    ], lista=[
        r'`\n` é a nova linha: o texto continua na linha de baixo.',
        r'`\t` é a tabulação: um espaço largo.',
        r'`\\` mostra uma barra invertida.',
        r'''`\"` e `\'` mostram uma aspa sem encerrar o texto.''',
    ], depois=[
        r'Quando você precisa de uma barra invertida de verdade, como em um caminho de pasta, escreva duas: `"C:\\fotos"` mostra `C:\fotos`.',
        'Com três aspas duplas seguidas, `"""`, o texto pode ocupar várias linhas, do jeito que foi escrito. Três aspas simples também funcionam.',
    ]),
    [
        DIGITE(C('''
            print('Boa' + " noite")
            '''), 'Boa noite',
            explicacao='Aspas simples e duplas criam o mesmo tipo de texto, então dá para juntar os dois com o `+`. O espaço está dentro do segundo texto.'),
        QUIZ(C('''
            print("Ela disse: 'bom dia'")
            '''), "Ela disse: 'bom dia'", ['Ela disse: bom dia', 'Ela disse: "bom dia"', "'Ela disse: 'bom dia''"],
            explicacao='As aspas de fora só marcam o começo e o fim do texto e não aparecem. As aspas simples de dentro fazem parte do texto, então são mostradas.'),
        BUG(L('''
            print("Status do copo")
            print('Copo d'água')
            print("Fim")
            '''), 2, '''print("Copo d'água")''', ['''print('Copo d''água')''', '''print("Copo d'água)'''],
            erro='SyntaxError: unterminated string literal (detected at line 2)',
            enunciado='Este programa deveria mostrar três linhas, mas dá erro.',
            porque='''O texto abriu com aspa simples, então a aspa de `d'água` fecha o texto cedo demais. A última aspa da linha abre outro texto que nunca fecha, e o Python mostra SyntaxError.''',
            explicacao='''Com aspas duplas por fora, a aspa simples de dentro vira parte do texto. Dobrar a aspa, como em `'Copo d''água'`, roda, mas junta dois textos e mostra Copo dágua.'''),
        QUIZ(C('''
            print("""Olá,
            tudo bem?""")
            '''), 'Olá,\ntudo bem?', ['Olá, tudo bem?', 'Olá,tudo bem?', '"""Olá,\ntudo bem?"""'],
            explicacao='Dentro de aspas triplas, a quebra de linha faz parte do texto. Por isso o `print` mostra as duas linhas, e as aspas triplas não aparecem.'),
        LACUNA('print("Nome:{1}Ana")', [r'\n'], [r'\t', r'\\', '/n'], 'Nome:\nAna',
            enunciado='Complete o código para o programa mostrar Nome: em uma linha e Ana na linha de baixo.',
            explicacao=r'O `\n` é a nova linha. Com a barra para o lado errado, `/n`, o Python mostraria esses dois símbolos como texto comum.'),
        PARES([(r'\n', 'Nova linha'), (r'\t', 'Tabulação (espaço largo)'), (r'\\', 'Uma barra invertida'), (r'\"', 'Uma aspa dupla')], _escape_ok,
            enunciado='Ligue cada escape ao que ele mostra.',
            explicacao=r'O `\n` pula de linha e o `\t` dá um espaço largo. O `\\` mostra uma barra invertida, e o `\"` mostra uma aspa dupla sem encerrar o texto.'),
        ERRO(C('''
            print("Olá')
            '''), 'SyntaxError', ['NameError', 'TypeError', 'ValueError'],
            explicacao='O texto abriu com aspas duplas e tentou fechar com aspa simples, que é outro tipo. O texto fica sem fim, e o Python mostra SyntaxError.'),
        MONTE(L('''
            fala = '"Bom dia!"'
            frase = "Ela disse: " + fala
            print(frase)
            '''), 'Ela disse: "Bom dia!"',
            explicacao='A variável `fala` precisa existir antes de entrar na `frase`, e o `print` vem por último. As aspas simples de fora guardam as aspas duplas de dentro como parte do texto.'),
        DIGITE(C('''
            frase = """Ela disse: "oi"."""
            print(frase)
            '''), 'Ela disse: "oi".', aceitas=['Ela disse: “oi”.'],
            explicacao='Dentro de aspas triplas, aspas duplas soltas fazem parte do texto. O texto só termina nas três aspas do final.'),
        QUIZ(C(r'''
            print("Linha 1\\nLinha 2")
            '''), r'Linha 1\nLinha 2', ['Linha 1\nLinha 2', r'Linha 1\\nLinha 2', 'Linha 1 Linha 2'],
            explicacao=r'O `\\` mostra uma barra invertida de verdade, e depois vem a letra n comum. Por isso o `\n` não vira nova linha: o texto sai numa linha só, com a barra e o n visíveis.'),
    ])

# ======================================================================= u02l02
L02 = LICAO('u02l02', 'Juntar, repetir e len()', 'Os operadores + e *, e contar caracteres com len()',
    INTRO([
        'O `+` junta dois textos e o `*` repete um texto: `"ha" * 3` vira `"hahaha"`. O número da repetição precisa ser inteiro.',
        'A função `len()` conta os **caracteres** de um texto: letras, números, espaços e símbolos. Ela devolve um número inteiro: `len("Python")` é 6.',
        'O espaço também é um caractere: `len("a b")` é 3. Um texto vazio, `""`, não tem caractere nenhum, e `len("")` é 0.',
    ], [
        EXEMPLO(C('''
            print("Boa" + " tarde")
            print("ha" * 3)
            print("-" * 10)
            print(len("Python"))
            ''')),
        EXEMPLO(C('''
            titulo = "Relatório"
            print(titulo)
            print("=" * len(titulo))
            '''), nota='O tamanho do título define quantos sinais de igual aparecem.'),
    ], depois=[
        'Na mesma conta, o `*` é feito antes do `+`, como na matemática: `"a" + "b" * 3` é `"abbb"`.',
        'Misturar tipos dá TypeError: `"a" + 1` e `"a" * "b"` não funcionam. Para juntar um número a um texto, use `str()`.',
    ]),
    [
        QUIZ(C('''
            letra = "ab"
            print(letra * 3)
            '''), 'ababab', ['aaabbb', 'ab3', 'abab'],
            explicacao='O `*` repete o texto inteiro, e não cada letra: "ab" três vezes dá "ababab".'),
        DIGITE(C('''
            print(len("Bom dia"))
            '''), '7',
            explicacao='O `len()` conta todos os caracteres, inclusive o espaço entre as duas palavras: B, o, m, espaço, d, i, a.'),
        LACUNA(C('''
            nome = "Ana Souza"
            tamanho = {1}(nome)
            print("-" {2} tamanho)
            '''), ['len', '*'], ['str', '+', 'int'], '---------',
            enunciado='Complete o código para mostrar um traço para cada caractere do nome.',
            explicacao='O `len(nome)` conta 9 caracteres, incluindo o espaço. Depois o `*` repete o traço essa quantidade de vezes.'),
        PARES([('len("ola")', '3'), ('"ha" * 2', 'haha'), ('"a" + "b"', 'ab'), ('len("")', '0'), ('len("a b c")', '5')], 'avalia',
            enunciado='Ligue cada conta ao resultado.', dir_codigo=True,
            explicacao='O `len()` conta caracteres, e o espaço conta. O `*` repete o texto, o `+` junta, e um texto vazio tem tamanho 0.'),
        BUG(L('''
            codigo = 2024
            print("Código com", len(codigo), "dígitos")
            print("Pronto")
            '''), 2, 'print("Código com", len(str(codigo)), "dígitos")', ['print("Código com", len("codigo"), "dígitos")', 'print("Código com", length(codigo), "dígitos")'],
            erro="TypeError: object of type 'int' has no len()",
            enunciado='Este programa deveria mostrar Código com 4 dígitos, mas dá erro.',
            porque='O `len()` mede textos, e `codigo` é um número inteiro. O Python não consegue contar os caracteres de um número e mostra TypeError.',
            explicacao='O `str(codigo)` transforma o número no texto "2024", e o `len()` conta 4 caracteres. Com `len("codigo")` o programa rodaria, mas mediria a palavra, e não o valor.'),
        MONTE(L('''
            titulo = input("Título: ")
            print(titulo)
            print("=" * len(titulo))
            '''), 'Título: Vendas\nVendas\n======', entrada=['Vendas'],
            enunciado='Coloque as linhas na ordem certa. O programa lê um título e mostra o título com uma linha de = do mesmo tamanho embaixo. Se a pessoa digitar Vendas, aparece o texto abaixo.',
            explicacao='O título precisa ser lido primeiro. Depois ele é mostrado, e a linha de `=` usa o `len` do título para ter o mesmo tamanho.'),
        ERRO(C('''
            vezes = 2.5
            print("-" * vezes)
            '''), 'TypeError', ['ValueError', 'NameError', 'SyntaxError'],
            explicacao='O `*` só repete um texto um número inteiro de vezes. Com 2.5 o tipo não serve, e o Python mostra TypeError; até 2.0 daria erro, porque o tipo é float.'),
        DIGITE(C('''
            print("#" * 3 + "." * 2)
            '''), '###..',
            explicacao='O `*` é feito antes do `+`: primeiro saem "###" e "..", e só depois os dois textos são juntados.'),
        QUIZ(C('''
            a = "10"
            b = "5"
            print(a + b, len(a + b))
            '''), '105 3', ['15 2', '105 2', '15 3'],
            explicacao='O `+` entre textos junta: "10" e "5" viram "105", que tem 3 caracteres. Com números, 10 + 5 seria 15.'),
        DIGITE(C('''
            palavra = "sol"
            linha = palavra + "-" * 2 + palavra
            print(linha, len(linha))
            '''), 'sol--sol 8',
            explicacao='O `*` vem antes do `+`, então `"-" * 2` vira "--" e a linha fica "sol--sol". Esse texto tem 3 + 2 + 3 = 8 caracteres.'),
    ])

# ======================================================================= u02l03
L03 = LICAO('u02l03', 'Índices: um caractere por vez', 'Pegar um caractere pela posição, com colchetes',
    INTRO([
        'Cada caractere de um texto tem uma posição, chamada **índice**. A contagem começa em 0, e não em 1.',
        'No texto `"Python"`, as posições são:',
    ], [
        EXEMPLO(C('''
            palavra = "Python"
            print(palavra[0])
            print(palavra[3])
            print(palavra[-1])
            print(len(palavra) - 1)
            '''), nota='O último índice de um texto é sempre len(texto) - 1.'),
        EXEMPLO(C('''
            palavra = "Python"
            print(palavra[6])
            '''), erro=True, nota='O texto tem 6 caracteres, então o último índice é 5.'),
    ], lista=[
        '`P`: índice 0 (ou -6)',
        '`y`: índice 1 (ou -5)',
        '`t`: índice 2 (ou -4)',
        '`h`: índice 3 (ou -3)',
        '`o`: índice 4 (ou -2)',
        '`n`: índice 5 (ou -1)',
    ], depois=[
        'Para pegar um caractere, escreva o texto e o índice entre colchetes: `"Python"[0]` é `"P"`. O resultado é sempre um texto de uma letra só.',
        'Índices negativos contam do fim para o começo: `[-1]` é o último caractere e `[-2]` é o penúltimo.',
        'Se o índice não existe, o Python mostra **IndexError** (erro de índice). O último índice válido é `len(texto) - 1`.',
    ]),
    [
        QUIZ(C('''
            cidade = "Recife"
            print(cidade[1])
            '''), 'e', ['R', 'c', 'Re'],
            explicacao='A contagem começa em 0: `R` é o índice 0 e `e` é o índice 1. Quem conta a partir do 1 chega em R.'),
        DIGITE(C('''
            print("sensor"[-2])
            '''), 'o',
            explicacao='O índice -1 é a última letra (`r`), e o -2 é a penúltima: `o`.'),
        QUIZ(C('''
            print("2026"[0] + "2026"[1])
            '''), '20', ['2', '02', '202'],
            explicacao='Cada par de colchetes devolve um texto de uma letra: "2" e "0". O `+` entre textos junta, e o resultado é "20", e não uma soma de números.'),
        LACUNA(C('''
            senha = "abc123"
            print(senha[{1}])
            print(senha[{2}])
            '''), ['3', '-1'], ['1', '4', '-6'], '1\n3',
            enunciado='Complete o código para mostrar o primeiro número da senha e, embaixo, o último caractere.',
            explicacao='O primeiro número da senha (o "1") está no índice 3, porque a, b e c ocupam as posições 0, 1 e 2. O último caractere é o de índice -1.'),
        BUG(L('''
            placa = "ABC1234"
            print("Primeiro:", placa[0])
            print("Último:", placa[7])
            '''), 3, 'print("Último:", placa[len(placa) - 1])', ['print("Último:", placa[len(placa)])', 'print("Último:", placa[8])'],
            erro='IndexError: string index out of range',
            enunciado='Este programa deveria mostrar o primeiro e o último caractere da placa, mas dá erro.',
            porque='A placa tem 7 caracteres, então os índices vão de 0 a 6. O índice 7 não existe, e o Python mostra IndexError.',
            explicacao='O último índice é `len(placa) - 1`, que vale 6. Usar `len(placa)` sem o `- 1` também passaria do fim e daria o mesmo erro.'),
        MONTE(L('''
            nome = input("Nome: ")
            primeira = nome[0]
            sigla = primeira + nome[-1]
            print(sigla)
            '''), 'Nome: Rita\nRa', entrada=['Rita'],
            enunciado='Coloque as linhas na ordem certa. O programa lê um nome e mostra a primeira e a última letra. Se a pessoa digitar Rita, aparece Ra.',
            explicacao='O nome precisa ser lido primeiro. Depois vem a primeira letra, que a sigla usa, e o `print` fecha o programa.'),
        ERRO(C('''
            posicao = input("Posição: ")
            print("Python"[posicao])
            '''), 'TypeError', ['IndexError', 'ValueError', 'NameError'], entrada=['2'],
            enunciado='A pessoa digita 2. Que tipo de erro o Python mostra ao rodar este código?',
            explicacao='O índice precisa ser um número inteiro, mas o `input` entrega texto. Com `int(input(...))` funcionaria; do jeito escrito, o tipo está errado e o Python mostra TypeError.'),
        PARES([('"Python"[0]', 'P'), ('"Python"[-1]', 'n'), ('"Python"[2]', 't'), ('"Python"[-3]', 'h'), ('"Python"[4]', 'o')], 'avalia',
            enunciado='Ligue cada código à letra que ele devolve.',
            explicacao='A contagem começa em 0, então o índice 2 é a terceira letra. Os índices negativos contam do fim: -1 é a última letra e -3 é a antepenúltima.'),
        QUIZ(C('''
            palavra = "motor"
            penultima = palavra[len(palavra) - 2]
            print(palavra[1] + palavra[-1] + penultima)
            '''), 'oro', ['mrt', 'oto', 'omo'],
            explicacao='O `palavra[1]` é "o" e o `palavra[-1]` é "r". Como `len(palavra) - 2` vale 3, a `penultima` é o segundo "o". Juntando, sai "oro".'),
        DIGITE(C('''
            codigo = "AB-1234"
            meio = codigo[len(codigo) // 2]
            print(codigo[0] + codigo[-1] + meio)
            '''), 'A41',
            explicacao='O `len` é 7 e `7 // 2` é 3, então o `meio` é `codigo[3]`, o caractere "1". Juntando o primeiro ("A"), o último ("4") e o do meio ("1"), sai A41.'),
    ])

# ======================================================================= u02l04
L04 = LICAO('u02l04', 'Fatias: pedaços do texto', 'Cortar um pedaço do texto com [a:b], [:b], [a:] e [::-1]',
    INTRO([
        'Uma **fatia** é um pedaço de um texto. Ela usa dois índices separados por dois-pontos: `texto[a:b]`.',
        'A fatia começa no índice `a` e termina antes do índice `b`: o caractere do índice `b` fica de fora. Em `"Python"[1:4]`, saem as posições 1, 2 e 3: `"yth"`.',
        'Os dois índices podem ficar vazios. Sem o primeiro, a fatia começa do zero; sem o segundo, ela vai até o final.',
    ], [
        EXEMPLO(C('''
            palavra = "Python"
            print(palavra[1:4])
            print(palavra[:2])
            print(palavra[2:])
            print(palavra[-3:])
            '''), nota='O caractere do índice final nunca entra na fatia.'),
        EXEMPLO(C('''
            palavra = "Python"
            print(palavra[::-1])
            print(palavra[::2])
            print(palavra[1:99])
            '''), nota='Passar do fim não dá erro: a fatia vai só até onde o texto termina.'),
    ], lista=[
        '`texto[:3]` são os 3 primeiros caracteres.',
        '`texto[3:]` é tudo a partir do índice 3.',
        '`texto[-3:]` são os 3 últimos caracteres.',
        '`texto[::-1]` é o texto de trás para frente.',
        '`texto[::2]` pega um caractere sim, outro não.',
    ], depois=[
        'O terceiro número é o **passo**: de quantos em quantos caracteres a fatia anda. Com o passo `-1`, ela anda para trás e inverte o texto.',
        'Ao contrário de um índice sozinho, uma fatia que passa do fim não dá erro: `"abc"[1:10]` é `"bc"`. Uma fatia sem nenhum caractere é o texto vazio.',
    ]),
    [
        QUIZ(C('''
            palavra = "Python"
            print(palavra[1:4])
            '''), 'yth', ['ytho', 'Pyth', 'Pyt'],
            explicacao='A fatia começa no índice 1 ("y") e termina antes do índice 4. O "o", que está no índice 4, fica de fora.'),
        DIGITE(C('''
            print("Janeiro"[:3])
            '''), 'Jan',
            explicacao='Sem o primeiro índice, a fatia começa do zero. Ela pega os índices 0, 1 e 2: "J", "a" e "n".'),
        QUIZ(C('''
            codigo = "AB1234"
            print(codigo[2:])
            '''), '1234', ['AB', '234', 'B1234'],
            explicacao='Sem o segundo índice, a fatia vai até o final. Ela começa no índice 2 porque "A" e "B" ocupam as posições 0 e 1.'),
        LACUNA(C('''
            data = "17/05/2026"
            dia = data[{1}]
            ano = data[{2}]
            print(dia, ano)
            '''), [':2', '-4:'], ['2:', ':4', '-4', '4:'], '17 2026',
            enunciado='Complete o código para pegar os 2 primeiros caracteres da data e os 4 últimos.',
            explicacao='O `:2` começa do zero e para antes do índice 2, então pega "17". O `-4:` conta quatro caracteres a partir do fim e vai até o final: "2026".'),
        BUG(L('''
            palavra = "Python"
            print("Início:", palavra[:2])
            print("Meio:", palavra[2,4])
            '''), 3, 'print("Meio:", palavra[2:4])', ['print("Meio:", palavra(2:4))', 'print("Meio:", palavra[2-4])'],
            erro="TypeError: string indices must be integers, not 'tuple'",
            enunciado='Este programa deveria mostrar o começo e o meio da palavra, mas dá erro.',
            porque='Com vírgula, o Python não enxerga uma fatia: ele junta `2,4` num único valor, que não é um número inteiro. Os colchetes de um texto só aceitam inteiros ou fatias, e o Python mostra TypeError.',
            explicacao='A fatia separa o início e o fim com dois-pontos: `palavra[2:4]` mostra "th". Com `palavra[2-4]`, a conta dá -2 e o programa pega só uma letra, e não uma fatia.'),
        MONTE(L('''
            serie = input("Série: ")
            ano = serie[4:8]
            print("Ano:", ano)
            print("Lote:", serie[-2:])
            '''), 'Série: MTR-2024-07\nAno: 2024\nLote: 07', entrada=['MTR-2024-07'],
            enunciado='Coloque as linhas na ordem certa. O programa lê um número de série e mostra o ano e o lote. Se a pessoa digitar MTR-2024-07, aparece o texto abaixo.',
            explicacao='O número de série precisa ser lido primeiro. Depois o `ano` é guardado para só então ser mostrado, e o lote, que são os dois últimos caracteres, vem por último.'),
        ERRO(C('''
            texto = "motor"
            print(texto[2:99])
            print(texto[99])
            '''), 'IndexError', ['ValueError', 'TypeError', 'NameError'],
            explicacao='A fatia `texto[2:99]` não dá erro: ela só vai até onde o texto termina e mostra "tor". Já o índice 99 não existe, e na linha 3 o Python mostra IndexError.'),
        PARES([('"Brasil"[:2]', 'Br'), ('"Brasil"[1:3]', 'ra'), ('"Brasil"[-2:]', 'il'), ('"Brasil"[::-1]', 'lisarB'), ('"Brasil"[::2]', 'Bai')], 'avalia',
            enunciado='Ligue cada fatia ao texto que ela devolve.',
            explicacao='O `[:2]` pega os dois primeiros caracteres e o `[-2:]` pega os dois últimos. O `[::-1]` inverte o texto, e o `[::2]` pega um caractere sim, outro não: B, a, i.'),
        QUIZ(C('''
            nome = "Marlon"
            inicio = nome[:3]
            print(inicio * 2 + nome[-1])
            '''), 'MarMarn', ['MarnMarn', 'MarMaro', 'Mar2n'],
            explicacao='O `*` é feito antes do `+`: "Mar" duas vezes dá "MarMar", e depois entra a última letra do nome, "n". Quem faz o `+` primeiro repete também a letra final.'),
        DIGITE(C('''
            cartao = input("Cartão: ")
            final = cartao[-4:]
            print("*" * (len(cartao) - 4) + final)
            '''), '****5678', entrada=['12345678'],
            enunciado='A pessoa digita 12345678. Digite o que o programa mostra na tela.',
            explicacao='O `cartao[-4:]` guarda os 4 últimos dígitos, "5678". O cartão tem 8 caracteres, então `8 - 4` dá 4 asteriscos, que vêm antes dos dígitos finais.'),
    ])

# ======================================================================= u02l05
L05 = LICAO('u02l05', 'Métodos I: maiúsculas e espaços', 'Os métodos upper, lower, title, capitalize e strip',
    INTRO([
        'Um **método** é uma ação que o próprio texto sabe fazer. Você chama o método com um ponto depois do texto: `nome.upper()`.',
    ], [
        EXEMPLO(C('''
            nome = "maria SILVA"
            print(nome.upper())
            print(nome.lower())
            print(nome.title())
            print(nome.capitalize())
            print(nome)
            '''), nota='A última linha mostra que a variável nome continua igual.'),
        EXEMPLO(C('''
            codigo = "  ab 12  "
            print(len(codigo))
            codigo = codigo.strip().upper()
            print(codigo, len(codigo))
            '''), nota='O strip tira só os espaços das pontas, e não os do meio.'),
    ], lista=[
        '`upper()` deixa todas as letras em maiúsculas.',
        '`lower()` deixa todas as letras em minúsculas.',
        '`title()` põe a primeira letra de cada palavra em maiúscula.',
        '`capitalize()` põe só a primeira letra do texto em maiúscula e o resto em minúscula.',
        '`strip()` tira os espaços em branco do começo e do fim.',
    ], depois=[
        'Um método não muda o texto original: ele devolve um texto novo. Para guardar o resultado, use uma variável: `nome = nome.upper()`.',
        'O `strip()` também tira tabulações e quebras de linha das pontas, mas nunca mexe nos espaços do meio. Dá para encadear métodos: `nome.strip().title()`.',
        'Cada tipo de valor tem os seus métodos. Se o método não existe para aquele tipo, o Python mostra **AttributeError**.',
    ]),
    [
        QUIZ(C('''
            cidade = "recife"
            print(cidade.upper())
            '''), 'RECIFE', ['Recife', 'recife'],
            explicacao='O `upper()` troca todas as letras por maiúsculas, e não só a primeira. Quem quer só a inicial em maiúscula usa `capitalize()` ou `title()`.'),
        DIGITE(C('''
            cidade = "RIO DE JANEIRO"
            print(cidade.title())
            '''), 'Rio De Janeiro',
            explicacao='O `title()` deixa a primeira letra de cada palavra em maiúscula e as outras em minúscula. Isso vale para todas as palavras, até para o "De".'),
        QUIZ(C('''
            nome = "ana"
            nome.upper()
            print(nome)
            '''), 'ana', ['ANA', 'Ana'],
            explicacao='O `upper()` devolve um texto novo, mas a linha 2 não guarda esse texto em lugar nenhum. A variável `nome` continua com "ana".'),
        LACUNA(C('''
            nome = "  ana  "
            limpo = nome.{1}()
            print(len({2}))
            '''), ['strip', 'limpo'], ['nome', 'upper', 'lower'], '3',
            enunciado='Complete o código para mostrar quantos caracteres o nome tem sem os espaços das pontas.',
            explicacao='O `strip()` tira os espaços das pontas e devolve um texto novo, guardado em `limpo`. Medir `nome` daria 7, porque essa variável continua com os espaços.'),
        BUG(L('''
            nome = "bruna"
            print("Nome:", nome)
            print("Maiúsculas:", upper(nome))
            '''), 3, 'print("Maiúsculas:", nome.upper())', ['print("Maiúsculas:", nome.upper)', 'print("Maiúsculas:", upper.nome())'],
            erro="NameError: name 'upper' is not defined",
            enunciado='Este programa deveria mostrar o nome em maiúsculas, mas dá erro.',
            porque='O `upper` não é uma função solta, como o `len`: é um método, que pertence ao texto. Sozinho, `upper` não é nome de nada, e o Python mostra NameError.',
            explicacao='Um método é chamado depois do ponto e com parênteses: `nome.upper()`. Sem os parênteses, o método não é executado e o programa mostra um texto estranho no lugar do resultado.'),
        MONTE(L('''
            usuario = input("Usuário: ")
            login = usuario.lower()
            tamanho = len(login)
            print(login, tamanho)
            '''), 'Usuário: CarlosM\ncarlosm 7', entrada=['CarlosM'],
            enunciado='Coloque as linhas na ordem certa. O programa lê um usuário, deixa em minúsculas e mostra o login e o tamanho dele. Se a pessoa digitar CarlosM, aparece o texto abaixo.',
            explicacao='O usuário precisa ser lido primeiro. O `login` nasce dele, o `tamanho` mede o `login`, e o `print` usa os dois, por isso vem por último.'),
        ERRO(C('''
            idade = int(input("Idade: "))
            print(idade.upper())
            '''), 'AttributeError', ['TypeError', 'ValueError', 'NameError'], entrada=['20'],
            enunciado='A pessoa digita 20. Que tipo de erro o Python mostra ao rodar este código?',
            explicacao='O `upper()` é um método de texto. Depois do `int()`, `idade` é um número inteiro, que não tem esse método, e o Python mostra AttributeError.'),
        PARES([('"ola mundo".title()', 'Ola Mundo'), ('"OLA MUNDO".capitalize()', 'Ola mundo'), ('"Ola".upper()', 'OLA'), ('"OLA".lower()', 'ola'), ('"  Ola ".strip()', 'Ola')], 'avalia',
            enunciado='Ligue cada código ao texto que ele devolve.',
            explicacao='O `title()` põe a inicial de todas as palavras em maiúscula, e o `capitalize()` só a do texto inteiro. O `upper()` e o `lower()` mudam todas as letras, e o `strip()` só tira os espaços das pontas.'),
        QUIZ(C('''
            nome = "paulo"
            print(nome[0].upper() + nome[1:])
            '''), 'Paulo', ['PAULO', 'Ppaulo', 'paulo'],
            explicacao='O `upper()` age só sobre `nome[0]`, a letra "p", que vira "P". O `nome[1:]` traz o resto, "aulo", do jeito que está.'),
        DIGITE(C('''
            frase = " bom DIA "
            frase = frase.strip().capitalize()
            print(frase, len(frase))
            '''), 'Bom dia 7',
            explicacao='O `strip()` tira os espaços das pontas, e o `capitalize()` deixa só o "B" em maiúscula e o resto em minúscula. O texto "Bom dia" tem 7 caracteres, contando o espaço do meio.'),
    ])

# ======================================================================= u02l06
L06 = LICAO('u02l06', 'Métodos II: trocar, achar e contar', 'Os métodos replace, find, count, startswith e endswith',
    INTRO([
        'Estes métodos trabalham com pedaços de um texto: trocar, achar, contar e conferir o começo ou o fim.',
    ], [
        EXEMPLO(C('''
            frase = "banana"
            print(frase.replace("a", "o"))
            print(frase.find("n"))
            print(frase.count("a"))
            print(frase.startswith("ba"))
            print(frase.endswith("ba"))
            '''), nota='Os dois últimos devolvem True ou False.'),
        EXEMPLO(C('''
            frase = "Banana"
            print(frase.find("b"))
            print(frase.find("ana"))
            print(frase.replace("B", "C"))
            '''), nota='Sem encontrar o pedaço, o find devolve -1. E o B maiúsculo é diferente do b.'),
    ], lista=[
        '`replace("a", "o")` troca todos os "a" do texto por "o".',
        '`find("an")` mostra o índice onde o pedaço "an" aparece pela primeira vez, ou -1 se ele não existe.',
        '`count("a")` conta quantas vezes o pedaço aparece.',
        '`startswith("ba")` diz se o texto começa com o pedaço: `True` ou `False`.',
        '`endswith("na")` diz se o texto termina com o pedaço: `True` ou `False`.',
    ], depois=[
        'O `find` conta a posição a partir de 0, como nos índices. Se o pedaço não existe, ele devolve -1, e não dá erro.',
        'Esses métodos diferenciam maiúsculas de minúsculas: `"Banana".find("b")` é -1. O `replace` também não muda o texto original, e sim devolve um texto novo.',
    ]),
    [
        QUIZ(C('''
            frase = "banana"
            print(frase.replace("a", "o"))
            '''), 'bonono', ['bonana', 'banana'],
            explicacao='O `replace` troca todas as ocorrências, e não só a primeira: os três "a" viram "o". O texto guardado em `frase` continua "banana".'),
        DIGITE(C('''
            nome = "Rui Pereira"
            print(nome.find("P"))
            '''), '4',
            explicacao='O `find` devolve o índice da primeira vez que o pedaço aparece. "Rui" ocupa os índices 0, 1 e 2, o espaço é o 3, e o "P" é o 4.'),
        QUIZ(C('''
            arquivo = "relatorio.pdf"
            pdf = arquivo.endswith(".pdf")
            print(pdf, arquivo.startswith("Rel"))
            '''), 'True False', ['True True', 'False False', 'False True'],
            explicacao='O nome termina com ".pdf", então `pdf` vale `True`. Já "Rel" é diferente de "rel": maiúsculas e minúsculas contam, e o segundo resultado é `False`.'),
        LACUNA(C('''
            email = "ana@site.com"
            pos = email.{1}("@")
            print(email[{2}:])
            '''), ['find', 'pos + 1'], ['count', 'pos', 'pos - 1'], 'site.com',
            enunciado='Complete o código para mostrar só o que vem depois do @.',
            explicacao='O `find("@")` devolve 3, o índice do @. A fatia precisa começar um caractere depois, em `pos + 1`; com `pos` sozinho, o @ também apareceria.'),
        ERRO(C('''
            frase = "banana"
            print(frase.count(a))
            '''), 'NameError', ['TypeError', 'ValueError', 'AttributeError'],
            explicacao='Sem aspas, o `a` é lido como o nome de uma variável, que não existe. O Python mostra NameError; para contar a letra, o certo é `count("a")`.'),
        BUG(L('''
            frase = "bom dia"
            pos = frase.find("dia")
            print("Posição de dia: " + pos)
            '''), 3, 'print("Posição de dia: " + str(pos))', ['print("Posição de dia: " * pos)', 'print("Posição de dia: " + pos())'],
            erro='TypeError: can only concatenate str (not "int") to str',
            enunciado='Este programa deveria mostrar a posição onde "dia" começa, mas dá erro.',
            porque='O `find` devolve um número inteiro, e o `+` não junta texto com número. O Python mostra TypeError.',
            explicacao='O `str(pos)` transforma o número no texto "4", e aí o `+` consegue juntar. Com o `*`, o texto seria repetido 4 vezes, em vez de mostrar a posição.'),
        QUIZ(C('''
            cidade = "Recife"
            print(cidade.find("r"), cidade.find("e"))
            '''), '-1 1', ['0 1', '-1 5', 'None 1'],
            explicacao='O "r" minúsculo não existe em "Recife" (só o "R" maiúsculo), então o `find` devolve -1, e não dá erro. O "e" aparece duas vezes, mas o `find` mostra só a primeira: índice 1.'),
        MONTE(L('''
            fone = input("Telefone: ")
            limpo = fone.replace("-", "")
            limpo = limpo.replace(" ", "")
            print(limpo)
            '''), 'Telefone: 11 98765-4321\n11987654321', entrada=['11 98765-4321'],
            enunciado='Coloque as linhas na ordem certa. O programa lê um telefone e mostra só os números, sem traço e sem espaço. Se a pessoa digitar 11 98765-4321, aparece o texto abaixo.',
            explicacao='O telefone precisa ser lido primeiro. As duas limpezas usam a mesma variável `limpo`: a primeira tira o traço, a segunda tira o espaço do resultado anterior, e o `print` vem por último.'),
        QUIZ(C('''
            senha = "ab-12-cd"
            limpa = senha.replace("-", "")
            print(len(senha) - len(limpa), limpa.upper())
            '''), '2 AB12CD', ['6 AB12CD', '2 ab12cd', '8 AB12CD'],
            explicacao='O texto original tem 8 caracteres e o `limpa` tem 6, então a diferença é 2: foram dois traços apagados. O `upper()` age sobre `limpa`, por isso as letras saem em maiúsculas.'),
        PARES([('"banana".count("a")', '3'), ('"banana".find("n")', '2'), ('"banana".endswith("an")', 'False'), ('"banana".startswith("ba")', 'True'), ('"banana".replace("a", "")', 'bnn')], 'avalia',
            enunciado='Ligue cada expressão ao resultado.',
            explicacao='O `count` conta os "a", e o `find` mostra o índice do primeiro "n". O `startswith` e o `endswith` respondem com `True` ou `False`, e o `replace` com texto vazio apaga o pedaço.'),
        DIGITE(C('''
            placa = "abc-1234"
            limpa = placa.replace("-", "").upper()
            print(limpa, limpa.find("1"))
            '''), 'ABC1234 3',
            explicacao='O `replace` tira o traço e o `upper()` põe tudo em maiúsculas: "ABC1234". O `find("1")` olha para esse texto novo, e não para o original, e o "1" está no índice 3.'),
    ])

# ======================================================================= u02l07
L07 = LICAO('u02l07', 'split e join', 'Quebrar um texto em pedaços com split e juntar de volta com join',
    INTRO([
        'O método `split` quebra um texto em pedaços e devolve uma **lista**: vários textos guardados juntos, entre colchetes e separados por vírgulas.',
        'Sem nada entre os parênteses, o `split()` separa em qualquer espaço em branco (espaço, tabulação ou quebra de linha) e ignora os repetidos ou das pontas. Com um texto entre os parênteses, como `split(",")`, ele separa por esse texto.',
    ], [
        EXEMPLO(C('''
            frase = "bom dia turma"
            partes = frase.split()
            print(partes)
            print(len(partes))
            print(partes[0])
            print("-".join(partes))
            '''), nota='O print mostra a lista com colchetes e cada texto entre aspas.'),
        EXEMPLO(C('''
            linha = "23.5;60;ok"
            campos = linha.split(";")
            print(campos)
            print(campos[1] + "%")
            '''), nota='Os pedaços continuam sendo textos, até os que parecem números.'),
    ], depois=[
        'O `join` faz o contrário: o texto da frente é a "cola" colocada entre os pedaços. Assim, `"-".join(partes)` junta os textos de `partes` com um traço entre eles.',
        'Ele também aceita um texto comum, tratado como uma sequência de letras: `"-".join("abc")` é `"a-b-c"`.',
        'Os pedaços do `split` são sempre textos, mesmo quando parecem números. O `len(partes)` conta os pedaços.',
        'Uma lista aceita índices e fatias, como um texto: `partes[0]`, `partes[-1]` e `partes[::-1]`.',
    ]),
    [
        QUIZ(C('''
            frase = "bom dia turma"
            print(frase.split())
            '''), "['bom', 'dia', 'turma']", ["['bom', ' ', 'dia', ' ', 'turma']", "['bom dia turma']", 'bom dia turma'],
            explicacao='O `split()` usa os espaços como separadores, e eles não entram na lista: sobram os três pedaços. O `print` mostra a lista entre colchetes, com cada texto entre aspas.'),
        DIGITE(C('''
            dados = "ana;maria;rita"
            nomes = dados.split(";")
            print(nomes[1])
            '''), 'maria',
            explicacao='O `split(";")` separa onde há ponto e vírgula e devolve a lista com "ana", "maria" e "rita". O índice 1 é o segundo pedaço, porque a contagem começa em 0.'),
        QUIZ(C('''
            texto = "  um   dois  três "
            print(len(texto.split()))
            '''), '3', ['18', '9', '4'],
            explicacao='Sem argumento, o `split()` ignora os espaços repetidos e os das pontas, e só sobram três pedaços: "um", "dois" e "três". O `len` da lista conta esses pedaços.'),
        LACUNA(C('''
            linha = "ana,20,recife"
            campos = linha.{1}(",")
            print(campos[{2}])
            '''), ['split', '2'], ['join', '1', '3', 'find'], 'recife',
            enunciado='Complete o código para mostrar a cidade, que é o último campo da linha.',
            explicacao='O `split(",")` quebra a linha em três campos: "ana", "20" e "recife". A cidade é o terceiro, que fica no índice 2 (ou -1, contando do fim).'),
        ERRO(C('''
            frase = "bom dia"
            partes = frase.split()
            print(partes.upper())
            '''), 'AttributeError', ['TypeError', 'IndexError', 'NameError'],
            explicacao='O `split` devolve uma lista, e a lista não tem o método `upper()`: ele existe só para texto. Para deixar uma palavra em maiúsculas, use o método no pedaço, como `partes[0].upper()`.'),
        BUG(L('''
            linha = "ana,20"
            campos = linha.split(",")
            print("Idade:", campos[2])
            '''), 3, 'print("Idade:", campos[1])', ['print("Idade:", campos[0])', 'print("Idade:", campos[3])'],
            erro='IndexError: list index out of range',
            enunciado='Este programa deveria mostrar a idade, mas dá erro.',
            porque='O `split` devolve uma lista com dois campos, nos índices 0 e 1. O índice 2 não existe, e o Python mostra IndexError (a mensagem diz list, e não string, porque o erro é numa lista).',
            explicacao='A idade é o segundo campo, de índice 1. O índice 0 mostraria o nome, e o 3 passaria ainda mais do fim.'),
        QUIZ(C('''
            partes = "2026-05-17".split("-")
            print("/".join(partes))
            '''), '2026/05/17', ['17/05/2026', '2026-05-17', "['2026', '05', '17']"],
            explicacao='O `split("-")` separa o ano, o mês e o dia, e o `join` junta de novo com uma barra entre eles. A ordem dos pedaços não muda.'),
        MONTE(L('''
            titulo = input("Título: ")
            palavras = titulo.lower().split()
            arquivo = "-".join(palavras)
            print(arquivo)
            '''), 'Título: Relatorio Final Maio\nrelatorio-final-maio', entrada=['Relatorio Final Maio'],
            enunciado='Coloque as linhas na ordem certa. O programa lê um título e cria um nome de arquivo, em minúsculas e com traços entre as palavras. Se a pessoa digitar Relatorio Final Maio, aparece o texto abaixo.',
            explicacao='O título precisa ser lido primeiro. Depois o `split` cria a lista de palavras, o `join` junta essas palavras com traços, e o `print` mostra o resultado no final.'),
        QUIZ(C('''
            medidas = "30,12,8"
            partes = medidas.split(",")
            print(int(partes[0]) + int(partes[2]))
            '''), '38', ['308', '50', '42'],
            explicacao='Os pedaços são textos, então o `int()` converte cada um antes da soma. O índice 0 é o "30" e o índice 2 é o "8": 30 + 8 dá 38. Sem o `int()`, o `+` juntaria os textos e daria "308".'),
        PARES([('"a-b-c".split("-")', "['a', 'b', 'c']"), ('"a-b-c".split("-")[1]', 'b'), ('"-".join("abc")', 'a-b-c'), ('len("um dois três".split())', '3'), ('"4,5".split(",")', "['4', '5']")], 'avalia',
            enunciado='Ligue cada expressão ao resultado.',
            explicacao='O `split` devolve uma lista, e um índice tira um pedaço dela. O `join` põe o traço entre as letras de "abc", e o `len` conta os pedaços da lista.'),
        DIGITE(C('''
            data = "2026-05-17"
            partes = data.split("-")
            print("/".join(partes[::-1]))
            '''), '17/05/2026',
            explicacao='O `split("-")` cria a lista com o ano, o mês e o dia. O `[::-1]` inverte a ordem da lista, e o `join` coloca uma barra entre os pedaços: dia, mês e ano.'),
    ])

# ======================================================================= u02l08
L08 = LICAO('u02l08', 'f-strings: texto com valores', 'Montar textos com {x}, {x:.2f}, zeros à esquerda e alinhamento',
    INTRO([
        'Uma **f-string** é um texto com a letra `f` antes das aspas. O que está entre chaves `{ }` é calculado e entra no texto: `f"Olá, {nome}!"`.',
        'Entre as chaves cabe qualquer **expressão**, isto é, algo que o Python calcula e transforma em valor: `{preco * 2}`, `{nome.upper()}` ou `{len(nome)}`. O número entra direto no texto, sem `str()`.',
        'Depois de dois-pontos, dentro das chaves, você escolhe o **formato** do valor:',
    ], [
        EXEMPLO(C('''
            nome = "Ana"
            idade = 20
            print(f"{nome} tem {idade} anos.")
            print(f"Daqui a 5 anos: {idade + 5}")
            print(f"{nome.upper()} ({len(nome)} letras)")
            '''), nota='Dentro das chaves, o Python calcula idade + 5 e usa o resultado.'),
        EXEMPLO(C('''
            preco = 7.5
            codigo = 7
            nome = "Ana"
            print(f"Preço: R$ {preco:.2f}")
            print(f"Código: {codigo:03}")
            print(f"[{nome:*>6}]")
            print(f"[{nome:*<6}]")
            '''), nota='Depois do dois-pontos ficam as instruções de formato.'),
    ], lista=[
        '`{x:.2f}` mostra o número com 2 casas decimais.',
        '`{n:03}` completa com zeros à esquerda até ter 3 caracteres.',
        '`{t:*>8}` alinha o texto à direita, em 8 caracteres, preenchendo as sobras com `*`.',
        '`{t:*<8}` alinha à esquerda, e `{t:*^8}` centraliza.',
    ], depois=[
        'Sem o caractere de preenchimento, as sobras são espaços. O `*` do exemplo só deixa o alinhamento visível.',
        'Sem o `f` antes das aspas, as chaves viram texto comum: `"Olá, {nome}"` mostra as chaves.',
    ]),
    [
        QUIZ(C('''
            nome = "Rita"
            print(f"Olá, {nome}!")
            '''), 'Olá, Rita!', ['Olá, nome!', 'Olá, {nome}!', 'Olá, "Rita"!'],
            explicacao='O `f` antes das aspas faz o Python trocar `{nome}` pelo valor da variável, "Rita". As chaves não aparecem no resultado.'),
        DIGITE(C('''
            preco = 12
            qtd = 3
            print(f"Total: {preco * qtd}")
            '''), 'Total: 36',
            explicacao='Dentro das chaves vale qualquer expressão: o Python calcula 12 * 3 e põe o 36 no texto.'),
        QUIZ(C('''
            valor = 3.14159
            print(f"{valor:.2f}")
            '''), '3.14', ['3.1', '3.142', '3.14159'],
            explicacao='O `.2f` arredonda para 2 casas decimais: 3.14159 vira 3.14. O número depois do ponto diz quantas casas aparecem.'),
        LACUNA(C('''
            preco = 4.5
            codigo = 7
            print(f"{preco:{1}} {codigo:{2}}")
            '''), ['.2f', '03'], ['.1f', '3', '02', '.3f'], '4.50 007',
            enunciado='Complete o código para mostrar o preço com 2 casas decimais e o código com 3 dígitos.',
            explicacao='O `.2f` mostra 4.50, com duas casas. O `03` completa o 7 com zeros à esquerda até ter 3 caracteres: 007.'),
        ERRO(C('''
            nome = "Ana"
            print(f"Olá, {nome")
            '''), 'SyntaxError', ['NameError', 'TypeError', 'ValueError'],
            explicacao='A chave abriu, mas não fechou. O Python percebe isso antes de rodar o programa e mostra SyntaxError, e não um erro de execução.'),
        BUG(L('''
            nome = input("Produto: ")
            preco = input("Preço: ")
            print(f"{nome}: R$ {preco:.2f}")
            '''), 3, 'print(f"{nome}: R$ {float(preco):.2f}")', ['print(f"{nome}: R$ {int(preco):.2f}")', 'print(f"{nome}: R$ {preco:2f}")'], entrada=['Café', '12.5'],
            erro="ValueError: Unknown format code 'f' for object of type 'str'",
            enunciado='A pessoa digita Café e 12.5. O programa deveria mostrar o produto e o preço com 2 casas decimais, mas dá erro.',
            porque='O `input` entrega texto, e o formato `.2f` só vale para números. O Python mostra ValueError, e a mensagem diz que o código `f` não serve para `str`.',
            explicacao='O `float(preco)` converte o texto em número antes do formato. O `int()` não serve, porque "12.5" não é um número inteiro e também daria ValueError.'),
        QUIZ(C('''
            nome = "Ana"
            print("Olá, {nome}!")
            '''), 'Olá, {nome}!', ['Olá, Ana!', 'Olá, nome!', 'Olá, {Ana}!'],
            explicacao='Sem o `f` antes das aspas, o Python não troca nada: as chaves e a palavra nome aparecem como texto comum. Só a f-string calcula o que está entre as chaves.'),
        MONTE(L('''
            nome = input("Nome: ")
            nota = float(input("Nota: "))
            aviso = f"{nome.upper()}: {nota:.1f}"
            print(aviso)
            '''), 'Nome: Rita\nNota: 7.46\nRITA: 7.5', entrada=['Rita', '7.46'],
            enunciado='Coloque as linhas na ordem certa. O programa lê um nome e uma nota e mostra o nome em maiúsculas com a nota de 1 casa decimal. Se a pessoa digitar Rita e 7.46, aparece o texto abaixo.',
            explicacao='Primeiro vêm as duas leituras, na ordem das perguntas: o nome e depois a nota. A f-string usa as duas variáveis, e o `print` mostra o `aviso` por último.'),
        QUIZ(C(r'''
            item = "Suco"
            preco = 6
            print(f"{item}\nR$ {preco:.2f}")
            '''), 'Suco\nR$ 6.00', ['Suco R$ 6.00', 'Suco\nR$ 6', 'Suco\nR$ 6,00'],
            explicacao=r'O `\n` dentro de uma f-string continua sendo a quebra de linha. O `.2f` mostra sempre duas casas, mesmo para o inteiro 6, e o Python usa o ponto como separador decimal, nunca a vírgula.'),
        PARES([('f"{7:03}"', '007'), ('f"{2.5:.2f}"', '2.50'), ("f\"{'ab':*>4}\"", '**ab'), ("f\"{'ab':*<4}\"", 'ab**'), ("f\"{'ab':*^4}\"", '*ab*')], 'avalia',
            enunciado='Ligue cada f-string ao texto que ela mostra.',
            explicacao='O `03` completa com zeros e o `.2f` mostra duas casas. O `>` põe as sobras à esquerda, o `<` à direita, e o `^` divide entre os dois lados.'),
        DIGITE(C('''
            item = "cafe"
            preco = 2.5
            qtd = 4
            print(f"{item:.<8}{preco * qtd:.2f}")
            '''), 'cafe....10.00',
            explicacao='O `.<8` completa "cafe" com pontos à direita até ter 8 caracteres, e sobram 4 pontos. O `preco * qtd` vale 10.0, e o `.2f` mostra 10.00.'),
    ])

# ======================================================================= u02l09
_TESTES_IS = {
    'Só tem números (0 a 9)': ('isdigit', '2026', '20a6'),
    'Só tem letras': ('isalpha', 'ana', 'a1a'),
    'Só tem letras e números': ('isalnum', 'ab12', 'ab 12'),
    'As letras são todas maiúsculas': ('isupper', 'ABC', 'AbC'),
    'Só tem espaços': ('isspace', '   ', 'a b'),
}


def _is_ok(descricao, metodo):
    # confere rodando o método: tem de dar True no texto certo e False no texto errado
    nome, certo, errado = _TESTES_IS[descricao]
    return (metodo == nome + '()'
            and _roda('print(%r.%s())' % (certo, nome))[0] == 'True'
            and _roda('print(%r.%s())' % (errado, nome))[0] == 'False')


L09 = LICAO('u02l09', 'Verificações e textos imutáveis', 'in, not in, isdigit, isalpha e outros; por que um texto não muda por dentro',
    INTRO([
        'O operador `in` pergunta se um pedaço aparece dentro de um texto e responde `True` ou `False`: `"an" in "banana"` é `True`. O `not in` responde o contrário.',
        'O pedaço procurado também precisa ser um texto: `5 in "12345"` dá erro, e o certo é `"5" in "12345"`.',
        'Os métodos que começam com **is** também respondem `True` ou `False`. Eles conferem do que o texto é feito:',
    ], [
        EXEMPLO(C('''
            frase = "bom dia"
            print("dia" in frase)
            print("Dia" in frase)
            print("noite" not in frase)
            print("2026".isdigit())
            print("2026a".isdigit())
            print("ana".isalpha())
            '''), nota='Maiúscula e minúscula são diferentes: dia e Dia não são o mesmo pedaço.'),
        EXEMPLO(C('''
            texto = "gato"
            texto[0] = "r"
            '''), erro=True, nota='Um texto não pode ser alterado por dentro.'),
        EXEMPLO(C('''
            texto = "gato"
            texto = "r" + texto[1:]
            print(texto)
            '''), nota='O jeito é criar um texto novo e guardar na variável.'),
    ], lista=[
        '`isdigit()`: só tem números (0 a 9).',
        '`isalpha()`: só tem letras.',
        '`isalnum()`: só tem letras e números.',
        '`isupper()` e `islower()`: as letras são todas maiúsculas, ou todas minúsculas.',
        '`isspace()`: só tem espaços.',
    ], depois=[
        'Com texto vazio, todos eles dão `False`. O `isupper()` e o `islower()` ignoram números e símbolos, mas exigem pelo menos uma letra.',
        'Textos são **imutáveis**: não dá para trocar uma letra no lugar, e `texto[0] = "r"` dá TypeError. O jeito é criar um texto novo, como `"r" + texto[1:]`.',
    ]),
    [
        QUIZ(C('''
            frase = "bom dia"
            print("dia" in frase, "Dia" in frase)
            '''), 'True False', ['True True', 'False False', 'False True'],
            explicacao='O `in` pergunta se o pedaço aparece no texto. "dia" aparece, mas "Dia" com D maiúsculo é outro pedaço: maiúsculas e minúsculas contam.'),
        DIGITE(C('''
            ano = "2026"
            print(ano.isdigit(), "6" in ano, "7" in ano)
            '''), 'True True False',
            explicacao='O texto "2026" só tem dígitos, então o `isdigit()` dá `True`. O "6" aparece nele, mas o "7" não.'),
        QUIZ(C('''
            nome = "Ana Maria"
            junto = nome.replace(" ", "")
            print(nome.isalpha(), junto.isalpha())
            '''), 'False True', ['True True', 'False False', 'True False'],
            explicacao='O espaço não é letra, então o `isalpha()` dá `False` para "Ana Maria". Em `junto`, sem o espaço, sobram só letras e o resultado é `True`.'),
        LACUNA(C('''
            texto = "gato"
            texto = {1} + texto[{2}]
            print(texto)
            '''), ['"r"', '1:'], ['"g"', '0:', ':1'], 'rato',
            enunciado='Complete o código para trocar a primeira letra de gato por r e mostrar rato.',
            explicacao='O texto não pode ser alterado por dentro, então o código cria um texto novo: a letra "r" mais o resto de "gato" a partir do índice 1. Com `0:` o "g" voltaria junto: "rgato".'),
        ERRO(C('''
            senha = "12345"
            print(5 in senha)
            '''), 'TypeError', ['ValueError', 'NameError', 'AttributeError'],
            explicacao='O `in` procura texto dentro de texto, e o 5 sem aspas é um número. O Python mostra TypeError; com `"5" in senha`, a resposta seria `True`.'),
        BUG(L('''
            placa = "ABC1234"
            print(placa)
            placa[0] = "X"
            print(placa)
            '''), 3, 'placa = "X" + placa[1:]', ['placa.replace("A", "X")', 'placa(0) = "X"'],
            erro="TypeError: 'str' object does not support item assignment",
            enunciado='Este programa deveria trocar a primeira letra da placa por X, mas dá erro.',
            porque='Um texto é imutável: não dá para trocar uma letra no lugar. Atribuir a `placa[0]` tenta fazer isso, e o Python mostra TypeError.',
            explicacao='Para "mudar" um texto, crie um texto novo e guarde na variável: `"X" + placa[1:]` junta a nova letra com o resto. O `replace` sozinho cria o texto novo, mas não guarda em lugar nenhum.'),
        QUIZ(C('''
            a = "ABC123"
            b = "123"
            print(a.isupper(), b.isupper())
            '''), 'True False', ['False False', 'True True', 'False True'],
            explicacao='O `isupper()` confere só as letras e ignora os números: em "ABC123", todas as letras são maiúsculas. Em "123" não há letra nenhuma, e o resultado é `False`.'),
        MONTE(L('''
            valor = input("Valor: ")
            limpo = valor.replace(",", ".")
            numero = limpo.replace(".", "").isdigit()
            print(limpo, numero)
            '''), 'Valor: 12,5\n12.5 True', entrada=['12,5'],
            enunciado='Coloque as linhas na ordem certa. O programa lê um valor, troca a vírgula por ponto e confere se o resto são só números. Se a pessoa digitar 12,5, aparece o texto abaixo.',
            explicacao='O valor precisa ser lido primeiro. Depois a vírgula vira ponto, em `limpo`, e a conferência usa o `limpo` sem o ponto. O `print` vem por último, com os dois resultados.'),
        QUIZ(C('''
            cep = "01310-100"
            limpo = cep.replace("-", "")
            print(limpo.isdigit(), len(limpo))
            '''), 'True 8', ['False 9', 'True 9', 'False 8'],
            explicacao='Sem o traço, sobram 8 caracteres, todos dígitos. O `cep` original tem 9 caracteres e daria `False`, porque o traço não é dígito.'),
        PARES([('Só tem números (0 a 9)', 'isdigit()'), ('Só tem letras', 'isalpha()'), ('Só tem letras e números', 'isalnum()'), ('As letras são todas maiúsculas', 'isupper()'), ('Só tem espaços', 'isspace()')], _is_ok,
            enunciado='Ligue cada descrição ao método que confere isso.', esq_codigo=False, dir_codigo=True,
            explicacao='Os nomes ajudam: digit é dígito, alpha é letra, alnum junta letras e números, upper é maiúscula e space é espaço.'),
        DIGITE(C('''
            codigo = "A1B2"
            novo = "X" + codigo[1:]
            print(novo, "A" in novo, "A" in codigo)
            '''), 'X1B2 False True',
            explicacao='O `novo` é outro texto, "X1B2", que não tem o "A". O `codigo` continua "A1B2", porque nada altera o texto original, e por isso o segundo `in` dá `True`.'),
    ])

# ======================================================================= u02l10
_ESPERADO_TAREFA = {
    'Inverter o texto': 'odnum alo',
    'Os 3 últimos caracteres': 'ndo',
    'Trocar espaços por traços': 'ola-mundo',
    'Quebrar em palavras': "['ola', 'mundo']",
    'Contar os caracteres': '9',
}


def _tarefa_ok(descricao, codigo):
    # roda o código sobre um texto de exemplo e compara com o que a tarefa pede
    s, e, _ = _roda('texto = "ola mundo"\nprint(%s)' % codigo)
    return e is None and s == _ESPERADO_TAREFA[descricao]


L10 = LICAO('u02l10', 'Revisão: tudo sobre textos', 'Aspas, índices, fatias, métodos, split, join e f-strings juntos',
    INTRO([
        'Esta lição junta tudo da unidade. Veja um resumo do que você já sabe fazer com textos:',
    ], [
        EXEMPLO(C('''
            nome = "  carla DIAS "
            nome = nome.strip().title()
            partes = nome.split()
            sigla = partes[0][0] + partes[-1][0]
            print(f"{nome} -> {sigla}")
            '''), nota='O partes[0][0] é a primeira letra da primeira palavra.'),
    ], lista=[
        r'''Aspas e escapes: `"Copo d'água"`, `\n`, `\t` e `\\`.''',
        'Juntar e medir: `+`, `*` e `len()`.',
        'Pegar partes: `texto[0]`, `texto[-1]` e fatias como `texto[1:4]` e `texto[::-1]`.',
        'Transformar: `upper`, `lower`, `title`, `capitalize`, `strip` e `replace`.',
        'Procurar e conferir: `find`, `count`, `startswith`, `endswith`, `in` e métodos como `isdigit`.',
        'Quebrar e juntar: `split` e `join`.',
        'Montar frases: f-strings, como `f"Olá, {nome}!"`, `{preco:.2f}` e `{texto:*>8}`.',
    ], depois=[
        'Dois lembretes: um texto nunca muda por dentro, então todo método devolve um texto novo que você precisa guardar. E os pedaços do `split` são textos, mesmo quando parecem números.',
        'Nas contas com textos, o `*` é feito antes do `+`, e o `len` conta cada caractere, inclusive espaços e quebras de linha.',
    ]),
    [
        QUIZ(C('''
            ola = 'Disse: "oi"'
            print(len(ola), ola[-2])
            '''), '11 i', ['9 i', '11 "', '10 i'],
            explicacao='As aspas duplas de dentro fazem parte do texto, então contam no `len`: "Disse: " tem 7 caracteres e `"oi"` tem 4. O índice -2 é a penúltima, o "i", porque a última é a aspa.'),
        DIGITE(C('''
            placa = "abc1d23"
            print(placa[:3].upper() + "-" + placa[3:])
            '''), 'ABC-1d23',
            explicacao='O `placa[:3]` pega "abc", e o `upper()` põe só essa parte em maiúsculas. O `placa[3:]` traz o resto como estava, "1d23".'),
        QUIZ(C('''
            valor = 2.5
            qtd = 3
            total = valor * qtd
            print(f"{qtd} x {valor:.2f} = {total:.2f}")
            '''), '3 x 2.50 = 7.50', ['3 x 2.5 = 7.5', '3 x 2.50 = 7.5', '3 x 2.5 = 7.50'],
            explicacao='O `.2f` vale para cada valor entre chaves: `valor` vira 2.50, e `total` (7.5) vira 7.50. Sem ele, o Python mostraria 2.5 e 7.5.'),
        LACUNA(C('''
            nome = "Ana Souza"
            partes = nome.{1}().split()
            print({2}.join(partes) + "@site.com")
            '''), ['lower', '"."'], ['upper', 'title', '"_"', 'strip'], 'ana.souza@site.com',
            enunciado='Complete o código para criar o e-mail ana.souza@site.com a partir do nome.',
            explicacao='O `lower()` deixa o nome em minúsculas, e o `split()` separa as duas palavras. O ponto é a "cola" do `join`, e o resultado ganha o final @site.com.'),
        ERRO(C('''
            frase = input("Frase: ")
            primeira = frase.split()[0]
            print(primeira)
            '''), 'IndexError', ['ValueError', 'TypeError', 'NameError'], entrada=[''],
            enunciado='A pessoa não digita nada e só aperta Enter. Que tipo de erro o Python mostra ao rodar este código?',
            explicacao='Sem nada digitado, `frase` é um texto vazio, e o `split()` devolve uma lista sem nenhum pedaço. O índice 0 não existe nessa lista, e o Python mostra IndexError.'),
        BUG(L('''
            vezes = input("Quantas vezes? ")
            risada = "ha" * vezes
            print(risada)
            '''), 2, 'risada = "ha" * int(vezes)', ['risada = "ha" + vezes', 'risada = "ha" * float(vezes)'], entrada=['3'],
            erro="TypeError: can't multiply sequence by non-int of type 'str'",
            enunciado='A pessoa digita 3. O programa deveria mostrar hahaha, mas dá erro.',
            porque='O `input` entrega texto, e o `*` só repete um texto um número inteiro de vezes. Texto vezes texto não existe, e o Python mostra TypeError.',
            explicacao='O `int(vezes)` converte o texto "3" no número 3, e aí o `*` consegue repetir. O `float()` não serve, porque o número de repetições precisa ser inteiro.'),
        QUIZ(C('''
            a = "10"
            b = a * 2
            c = int(a) * 2
            print(b, c, len(b))
            '''), '1010 20 4', ['20 20 2', '1010 20 2', '20 1010 4'],
            explicacao='Com texto, o `*` repete: "10" duas vezes dá "1010", que tem 4 caracteres. Com `int(a)`, o `*` faz conta: 10 vezes 2 é 20.'),
        MONTE(L('''
            nome = input("Nome completo: ")
            partes = nome.lower().split()
            login = partes[0][0] + partes[-1]
            print(f"Login: {login}")
            '''), 'Nome completo: Carlos Eduardo Lima\nLogin: clima', entrada=['Carlos Eduardo Lima'],
            enunciado='Coloque as linhas na ordem certa. O programa lê um nome completo e cria o login: a inicial do primeiro nome mais o último nome, em minúsculas. Se a pessoa digitar Carlos Eduardo Lima, aparece o texto abaixo.',
            explicacao='O nome precisa ser lido primeiro. Depois o `lower()` e o `split()` criam a lista de palavras, o login junta a inicial da primeira com a última palavra, e o `print` mostra o resultado no final.'),
        QUIZ(C('''
            poema = """rosas
            violetas
            mel"""
            print(len(poema.split()), len(poema))
            '''), '3 18', ['3 16', '1 18', '2 18'],
            explicacao='O `split()` separa também nas quebras de linha, então a lista tem 3 palavras. O `len` conta as 16 letras mais as 2 quebras de linha, que são caracteres: 18.'),
        PARES([('Inverter o texto', 'texto[::-1]'), ('Os 3 últimos caracteres', 'texto[-3:]'), ('Trocar espaços por traços', 'texto.replace(" ", "-")'), ('Quebrar em palavras', 'texto.split()'), ('Contar os caracteres', 'len(texto)')], _tarefa_ok,
            enunciado='Ligue cada tarefa ao código que a faz. A variável texto guarda um texto qualquer.', esq_codigo=False, dir_codigo=True,
            explicacao='A fatia `[::-1]` inverte, e a `[-3:]` pega o final. O `replace` troca, o `split` quebra em palavras, e o `len` conta os caracteres.'),
        DIGITE(C('''
            frase = " o rato roeu a roupa "
            palavras = frase.strip().split()
            ultima = palavras[-1].upper()
            print(len(palavras), ultima, frase.count("r"))
            '''), '5 ROUPA 3',
            explicacao='O `strip()` tira os espaços das pontas e o `split()` cria a lista com 5 palavras. A última é "roupa", em maiúsculas, e o `count("r")` olha a frase original: há um "r" em rato, em roeu e em roupa.'),
    ])

UNIDADE('u02', 'Textos', 'Escrever, medir, cortar e transformar textos.', [L01, L02, L03, L04, L05, L06, L07, L08, L09, L10])
