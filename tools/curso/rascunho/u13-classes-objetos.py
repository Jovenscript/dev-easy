# -*- coding: utf-8 -*-
# Unidade 13 — Classes e objetos.  Veja tools/curso/GUIA-AUTORES.md
import ast, contextlib, io
from dsl import *


def _roda(codigo):
    """Roda o código de verdade e devolve (saída, nome do erro ou None). Só para as conferências de PARES e CONCEITO."""
    buf = io.StringIO()
    try:
        with contextlib.redirect_stdout(buf):
            exec(codigo, {'__name__': '__main__'})
    except BaseException as e:
        return buf.getvalue().rstrip('\n'), type(e).__name__
    return buf.getvalue().rstrip('\n'), None


def _avalia_com(prelude):
    """Para PARES: a direita é o que print(esquerda) mostra, depois de definir as classes do `prelude`."""
    def f(esq, dir):
        s, e = _roda(prelude + '\nprint(' + esq + ')')
        return e is None and s == dir
    return f


# ======================================================================= u13l01
def _papel_l01(esq, dir):
    cod = esq + '\n    pass' if esq.endswith(':') else esq
    no = ast.parse(cod).body[0]
    papel = '?'
    if isinstance(no, ast.ClassDef):
        papel = 'Cria o molde'
    elif isinstance(no, ast.Assign) and isinstance(no.targets[0], ast.Attribute):
        papel = 'Guarda um atributo'
    elif isinstance(no, ast.Assign) and isinstance(no.value, ast.Call):
        papel = 'Fabrica um objeto'
    elif isinstance(no, ast.Expr) and isinstance(no.value, ast.Call) and isinstance(no.value.args[0], ast.Attribute):
        papel = 'Lê um atributo'
    return papel == dir

L01 = LICAO('u13l01', 'Classes e objetos', 'Criar um molde e fabricar objetos',
    INTRO([
        'Uma **classe** é um molde que descreve um tipo de coisa. Um **objeto** é uma peça fabricada com esse molde.',
        'Para criar uma classe, escreva `class` e um nome. Por convenção, o nome começa com letra maiúscula. Por enquanto o corpo será só `pass`, que não faz nada.',
        'Para fabricar um objeto, chame a classe como se fosse uma função: `Lampada()`. Cada chamada cria um objeto novo e separado.',
        'Um objeto guarda dados em **atributos**. Você cria e lê um atributo com ponto: `a.cor = "branca"` e depois `print(a.cor)`.',
        'Os atributos de um objeto não afetam os de outro: mudar `a.cor` não muda `b.cor`.',
        'Números, textos e listas também são objetos de classes (`int`, `str`, `list`). `isinstance(objeto, Classe)` diz se o objeto foi fabricado por aquela classe.',
    ], [
        EXEMPLO(C('''
            class Lampada:
                pass

            a = Lampada()
            b = Lampada()
            a.cor = "branca"
            b.cor = "amarela"
            print(a.cor)
            print(b.cor)
            '''), nota='São dois objetos separados, cada um com a sua `cor`.'),
        EXEMPLO(C('''
            print(isinstance(5, int))
            print(isinstance("5", int))
            ''')),
    ]),
    [
        QUIZ(C('''
            class Gato:
                pass

            gato1 = Gato()
            gato1.nome = "Mimi"
            print(gato1.nome)
            '''), 'Mimi', ['gato1', 'Gato', 'nome'],
            explicacao='`gato1.nome` lê o atributo `nome` do objeto `gato1`, e o valor guardado é o texto Mimi. O nome da variável e o da classe não aparecem na tela.'),
        QUIZ(C('''
            class Carro:
                pass

            a = Carro()
            b = Carro()
            a.cor = "azul"
            b.cor = "preto"
            print(a.cor)
            '''), 'azul', ['preto', 'a.cor', 'Carro'],
            explicacao='`a` e `b` são objetos separados, e cada um guarda a sua `cor`. Mudar a cor de `b` não mexe no que `a` guardou.'),
        DIGITE(C('''
            class Moeda:
                pass

            m = Moeda()
            m.valor = 5
            m.valor = m.valor * 2
            print(m.valor)
            '''), '10',
            explicacao='Um atributo funciona como uma variável. A conta `m.valor * 2` usa o 5 guardado, e o resultado 10 volta para `m.valor`.'),
        ERRO(C('''
            class Pessoa:
                pass

            p = Pessoa()
            print(p.nome)
            '''), 'AttributeError', ['NameError', 'KeyError', 'TypeError'],
            explicacao='O objeto `p` existe, mas nunca recebeu o atributo `nome`. Ler um atributo que não existe dá AttributeError.'),
        BUG(L('''
            class Lampada:
                pass
            luz = lampada()
            luz.cor = "branca"
            print(luz.cor)
            '''), 3, 'luz = Lampada()', ['luz = new Lampada()', 'luz = Lampada.criar()'],
            erro="NameError: name 'lampada' is not defined",
            enunciado='Este programa deveria criar uma lâmpada e mostrar branca, mas dá erro.',
            porque='O Python diferencia maiúsculas de minúsculas. A classe se chama `Lampada`, mas a linha 3 chama `lampada`, um nome que nunca foi criado.',
            explicacao='Com o nome exato, `Lampada()` fabrica o objeto. Em Python não existe `new`: o objeto nasce só de chamar a classe.'),
        MONTE(L('''
            class Peca:
                pass
            p = Peca()
            p.lote = 7
            print(p.lote)
            '''), '7',
            explicacao='Primeiro o molde (`class`), depois o objeto fabricado com ele, depois o atributo e por fim o `print`. Cada linha precisa do que a anterior criou.'),
        LACUNA(C('''
            {1} Sensor:
                pass

            s = {2}()
            s.tag = "T1"
            print(s.tag)
            '''), ['class', 'Sensor'], ['def', 'sensor', 'new'], 'T1',
            explicacao='`class` abre a definição do molde. Para fabricar o objeto, chame a classe pelo nome exato, `Sensor()`, com a maiúscula.'),
        PARES([('class Motor:', 'Cria o molde'), ('m = Motor()', 'Fabrica um objeto'), ('m.rpm = 1200', 'Guarda um atributo'), ('print(m.rpm)', 'Lê um atributo')], _papel_l01,
            enunciado='Ligue cada linha de código ao que ela faz.',
            explicacao='`class` cria o molde, e chamar `Motor()` fabrica um objeto. Com ponto, `m.rpm = 1200` guarda um atributo e `m.rpm` lê o valor.'),
        QUIZ(C('''
            print(isinstance(7, int))
            print(isinstance("7", int))
            print(isinstance(7.5, float))
            '''), 'True\nFalse\nTrue', ['True\nTrue\nTrue', 'False\nFalse\nTrue', 'True\nFalse\nFalse'],
            explicacao='`7` é um `int`, `"7"` entre aspas é um `str`, e `7.5` é um `float`. Os tipos básicos também são classes, e `isinstance` pergunta de qual classe o valor foi feito.'),
        DIGITE(C('''
            class Aluno:
                pass

            lista = []
            for n in ["Ana", "Bia"]:
                a = Aluno()
                a.nome = n
                lista.append(a)
            print(len(lista), lista[1].nome)
            '''), '2 Bia',
            explicacao='O laço fabrica um objeto `Aluno` por nome e guarda cada um na lista. `len(lista)` é 2, e o índice 1 é o segundo objeto, de nome Bia.'),
    ])

# ======================================================================= u13l02
_RETANGULO = C('''
    class Retangulo:
        def __init__(self, largura, altura):
            self.largura = largura
            self.altura = altura
            self.area = largura * altura
    ''')

L02 = LICAO('u13l02', '__init__ e self', 'Dar atributos a cada objeto na hora de criar',
    INTRO([
        'Dar os atributos um por um, depois de criar o objeto, cansa e é fácil esquecer algum. O método `__init__` resolve isso.',
        'Um **método** é uma função escrita dentro de uma classe. O `__init__` é especial: o Python o executa sozinho toda vez que um objeto é criado.',
        'O primeiro parâmetro de todo método é o `self`: o próprio objeto que está sendo criado. O Python o passa sozinho, então você não o escreve ao chamar.',
        'Dentro do `__init__`, `self.nome = nome` guarda o valor recebido no atributo `nome` do objeto. Sem o `self.`, o valor some quando o método termina.',
        'Os valores chegam pelos parênteses da classe: `Pessoa("Ana", 30)` executa o `__init__` com `nome="Ana"` e `idade=30`.',
        'Os parâmetros podem ter valor padrão, como em qualquer função: `def __init__(self, nome, saldo=0)`.',
    ], [
        EXEMPLO(C('''
            class Pessoa:
                def __init__(self, nome, idade):
                    self.nome = nome
                    self.idade = idade

            ana = Pessoa("Ana", 30)
            leo = Pessoa("Leo", 25)
            print(ana.nome, ana.idade)
            print(leo.nome, leo.idade)
            ''')),
        EXEMPLO(C('''
            class Conta:
                def __init__(self, dono, saldo=0):
                    self.dono = dono
                    self.saldo = saldo

            c = Conta("Rui")
            print(c.dono, c.saldo)
            '''), nota='Como o saldo não foi passado, vale o padrão 0.'),
    ]),
    [
        QUIZ(C('''
            class Produto:
                def __init__(self, nome, preco):
                    self.nome = nome
                    self.preco = preco

            p = Produto("Caneta", 3)
            print(p.nome, p.preco)
            '''), 'Caneta 3', ['3 Caneta', 'nome preco', 'Produto'],
            explicacao='Os valores entram nos parâmetros na ordem em que foram escritos: "Caneta" vai para `nome` e 3 vai para `preco`. O `__init__` guarda os dois no objeto.'),
        DIGITE(C('''
            class Retangulo:
                def __init__(self, largura, altura):
                    self.largura = largura
                    self.altura = altura

            r = Retangulo(4, 3)
            print(r.largura * r.altura)
            '''), '12',
            explicacao='O objeto guarda `largura` 4 e `altura` 3. Os atributos entram na conta como qualquer variável: 4 * 3 é 12.'),
        QUIZ(C('''
            class Jogador:
                def __init__(self, nome, vidas=3):
                    self.nome = nome
                    self.vidas = vidas

            j1 = Jogador("Ana")
            j2 = Jogador("Leo", 5)
            print(j1.vidas, j2.vidas)
            '''), '3 5', ['3 3', '5 5', 'Ana Leo'],
            explicacao='Sem o segundo valor, `j1` usa o padrão 3. Em `j2`, o 5 passado substitui o padrão. Cada objeto guarda o seu próprio valor.'),
        ERRO(C('''
            class Lampada:
                def __init__(self, cor):
                    cor = cor

            l = Lampada("verde")
            print(l.cor)
            '''), 'AttributeError', ['NameError', 'TypeError', 'KeyError'],
            explicacao='Sem o `self.`, o `cor = cor` só cria uma variável local do método, que desaparece quando ele termina. O objeto nunca recebeu o atributo `cor`.'),
        BUG(L('''
            class Conta:
                def __init__(self, dono, saldo):
                    self.dono = dono
                    self.saldo = saldo
            c = Conta("Rui")
            print(c.saldo)
            '''), 5, 'c = Conta("Rui", 50)', ['c = Conta("Rui", saldo)', 'c = Conta(self, "Rui")'],
            erro="TypeError: Conta.__init__() missing 1 required positional argument: 'saldo'",
            enunciado='Este programa deveria mostrar o saldo da conta, mas dá erro.',
            porque='O `__init__` pede dois valores, `dono` e `saldo` (o `self` o Python passa sozinho). A linha 5 passou só um, e faltou um argumento.',
            explicacao='Passando os dois valores, o `__init__` consegue guardar `dono` e `saldo`. Usar `saldo` sem criar essa variável daria NameError, e `self` não existe fora da classe.'),
        MONTE(L('''
            class Moto:
                def __init__(self, marca):
                    self.marca = marca
            m = Moto("Honda")
            print(m.marca)
            '''), 'Honda',
            explicacao='A classe vem primeiro, e o `__init__` fica recuado dentro dela, com o `self.marca` recuado dentro do `__init__`. Só depois o objeto é criado e usado.'),
        LACUNA(C('''
            class Termometro:
                def {1}(self, graus):
                    self.{2} = graus

            t = Termometro(21)
            print(t.graus)
            '''), ['__init__', 'graus'], ['init', 'self', '__str__'], '21',
            explicacao='O método que o Python executa sozinho na criação se chama `__init__`, com dois sublinhados de cada lado. O atributo precisa se chamar `graus` para o `print(t.graus)` achá-lo.'),
        PARES([('Retangulo(2, 5).largura', '2'), ('Retangulo(2, 5).altura', '5'), ('Retangulo(3, 4).area', '12'), ('Retangulo(6, 1).area', '6')], _avalia_com(_RETANGULO),
            enunciado='Em `Retangulo(largura, altura)`, o `__init__` guarda `largura`, `altura` e `area` (largura vezes altura). Ligue cada expressão ao valor.',
            dir_codigo=True,
            explicacao='Os valores entram na ordem: o primeiro é a `largura` e o segundo é a `altura`. O atributo `area` é calculado no `__init__` com esses dois valores.'),
        QUIZ(C('''
            class Ponto:
                def __init__(self, x, y):
                    self.x = x
                    self.y = y

            pontos = [Ponto(1, 2), Ponto(3, 4)]
            total = 0
            for p in pontos:
                total = total + p.x
            print(total)
            '''), '4', ['10', '6', '3'],
            explicacao='O laço soma só o atributo `x` de cada ponto: 1 + 3 é 4. O `y` (2 e 4) não entra na conta.'),
        DIGITE(C('''
            class Pedido:
                def __init__(self, item, qtd=1, extra=0):
                    self.item = item
                    self.qtd = qtd
                    self.extra = extra

            p = Pedido("Suco", extra=3)
            print(p.qtd, p.extra)
            '''), '1 3',
            explicacao='Como `qtd` não foi passado, vale o padrão 1. O argumento nomeado `extra=3` troca o padrão 0 por 3.'),
    ])

# ======================================================================= u13l03
_TURNO = C('''
    class Turno:
        def __init__(self, horas, valor):
            self.horas = horas
            self.valor = valor

        def total(self):
            return self.horas * self.valor

        def com_extra(self, extra):
            return self.total() + extra
    ''')

L03 = LICAO('u13l03', 'Métodos', 'Dar ações aos objetos',
    INTRO([
        'Atributos guardam dados. As ações do objeto são os **métodos**: funções escritas dentro da classe, com `self` como primeiro parâmetro.',
        'Chame um método com ponto e parênteses: `lampada.acender()`. O Python entrega o próprio objeto como `self`.',
        'Dentro do método, `self.atributo` lê e muda os dados do objeto. Um nome sem `self.` é só uma variável comum do método.',
        'Um método pode ter mais parâmetros depois do `self` e pode devolver um valor com `return`, como qualquer função.',
        'Um método também pode chamar outro método do mesmo objeto, com `self.outro_metodo()`.',
        'Sem parênteses, `lampada.acender` não executa nada. Os parênteses é que chamam o método.',
    ], [
        EXEMPLO(C('''
            class Lampada:
                def __init__(self):
                    self.acesa = False

                def acender(self):
                    self.acesa = True

            l = Lampada()
            print(l.acesa)
            l.acender()
            print(l.acesa)
            ''')),
        EXEMPLO(C('''
            class Cofrinho:
                def __init__(self):
                    self.total = 0

                def guardar(self, valor):
                    self.total = self.total + valor
                    return self.total

            c = Cofrinho()
            print(c.guardar(5))
            print(c.guardar(10))
            '''), nota='O objeto lembra o total entre uma chamada e outra.'),
    ]),
    [
        QUIZ(C('''
            class Contador:
                def __init__(self):
                    self.valor = 0

                def somar(self):
                    self.valor = self.valor + 1

            c = Contador()
            c.somar()
            c.somar()
            print(c.valor)
            '''), '2', ['0', '1', 'somar'],
            explicacao='Cada chamada de `somar()` soma 1 ao atributo `valor` do próprio objeto. Duas chamadas levam o valor de 0 até 2.'),
        DIGITE(C('''
            class Caixa:
                def __init__(self, largura, altura):
                    self.largura = largura
                    self.altura = altura

                def area(self):
                    return self.largura * self.altura

            c = Caixa(5, 2)
            print(c.area())
            '''), '10',
            explicacao='O método `area` usa os atributos do próprio objeto e devolve 5 * 2. O `print` mostra o valor devolvido.'),
        ERRO(C('''
            class Lampada:
                def acender():
                    print("acesa")

            l = Lampada()
            l.acender()
            '''), 'TypeError', ['AttributeError', 'NameError', 'SyntaxError'],
            explicacao='O Python entrega o objeto como primeiro argumento, mas `acender()` não tem o `self` para recebê-lo. A classe e o método existem, então o erro é na chamada: TypeError.'),
        BUG(L('''
            class Tanque:
                def __init__(self, nivel):
                    self.nivel = nivel
                def mostrar(self):
                    print(nivel)
            t = Tanque(80)
            t.mostrar()
            '''), 5, '        print(self.nivel)', ['        print("nivel")', '        print(Tanque.nivel)'],
            erro="NameError: name 'nivel' is not defined",
            enunciado='Este programa deveria mostrar 80, mas dá erro.',
            porque='Dentro do método, `nivel` sozinho é uma variável comum, e ela não existe ali. O dado está guardado no objeto e só se chega a ele com `self.nivel`.',
            explicacao='`self.nivel` lê o atributo do próprio objeto. Com aspas, o programa mostraria a palavra nivel, e `Tanque.nivel` procuraria o atributo na classe, onde ele não está.'),
        MONTE(L('''
            class Gato:
                def miar(self):
                    return "miau"
            g = Gato()
            print(g.miar())
            '''), 'miau',
            explicacao='O método `miar` fica recuado dentro da classe, e o `return` fica recuado dentro do método. Só depois vêm a criação do objeto e a chamada.'),
        LACUNA(C('''
            class Cofrinho:
                def __init__(self):
                    self.total = 0

                def guardar({1}, valor):
                    self.total = self.total + {2}

            c = Cofrinho()
            c.guardar(7)
            print(c.total)
            '''), ['self', 'valor'], ['total', 'c', 'Cofrinho'], '7',
            explicacao='Todo método começa com `self`, que recebe o próprio objeto. O `valor` é o número que veio na chamada `guardar(7)`, e é ele que se soma ao total.'),
        PARES([('Turno(8, 10).total()', '80'), ('Turno(6, 5).total()', '30'), ('Turno(8, 10).com_extra(20)', '100'), ('Turno(2, 3).com_extra(1)', '7')], _avalia_com(_TURNO),
            enunciado='Em `Turno(horas, valor)`, `total()` devolve horas vezes valor, e `com_extra(extra)` devolve o total mais o extra. Ligue cada chamada ao resultado.',
            dir_codigo=True,
            explicacao='`total()` multiplica os dois atributos do objeto. `com_extra(extra)` chama `self.total()` e soma o extra: 8 * 10 + 20 é 100.'),
        QUIZ(C('''
            class Conta:
                def __init__(self, saldo):
                    self.saldo = saldo

                def mostrar(self):
                    print(self.saldo)

            c = Conta(50)
            x = c.mostrar()
            print(x)
            '''), '50\nNone', ['50\n50', '50', 'None'],
            explicacao='O método mostra o 50 com `print`, mas não tem `return`, então devolve `None`. O segundo `print` mostra esse `None` guardado em `x`.'),
        DIGITE(C('''
            class Interruptor:
                def __init__(self):
                    self.ligado = False

                def alternar(self):
                    self.ligado = not self.ligado

            i = Interruptor()
            for n in range(3):
                i.alternar()
            print(i.ligado)
            '''), 'True',
            explicacao='Cada `alternar()` inverte o valor: de False para True, para False e de novo para True. Com três chamadas, o final é True.'),
        QUIZ(C('''
            class Cofre:
                def __init__(self):
                    self.moedas = 0
                def guardar(self, n):
                    self.moedas = self.moedas + n
                def dobrar(self):
                    self.guardar(self.moedas)
            c = Cofre()
            c.guardar(3)
            c.dobrar()
            c.dobrar()
            print(c.moedas)
            '''), '12', ['6', '9', '3'],
            explicacao='`dobrar()` chama `self.guardar` com as moedas que já existem. Então 3 vira 6 na primeira chamada e 12 na segunda.'),
    ])

# ======================================================================= u13l04
def _teste_underline(o):
    # só a primeira opção é uma convenção (não dá para executar); as outras são falsas e o Python prova
    if o.startswith('É um aviso'):
        return True
    base = 'class C:\n    def __init__(self):\n        self._x = 1\na = C()\nb = C()\n'
    if o.startswith('Faz o Python bloquear'):
        return _roda(base + 'print(a._x)')[1] is not None
    if o.startswith('Divide o valor'):
        return _roda(base + 'a._x = 2\nprint(b._x)')[0] == '2'
    if o.startswith('Impede que o valor'):
        return _roda(base + 'a._x = 5\nprint(a._x)')[0] != '5'
    return False


def _convencao_nome(esq, dir):
    if esq.startswith('__') and esq.endswith('__'):
        papel = 'Método especial'
    elif esq.startswith('_'):
        papel = 'Uso interno'
    elif esq[0].isupper():
        papel = 'Nome de classe'
    else:
        papel = 'Público'
    return papel == dir

L04 = LICAO('u13l04', 'Estado e encapsulamento', 'Proteger os dados do objeto',
    INTRO([
        'O **estado** de um objeto é o conjunto dos valores dos seus atributos num certo momento. Cada chamada de método pode mudar esse estado.',
        'Por isso a ordem das chamadas importa: guardar e depois retirar dá um resultado diferente de retirar e depois guardar.',
        '**Encapsulamento** é proteger os dados dentro do objeto e deixar que só os métodos os mudem. Assim o método pode conferir se a mudança faz sentido.',
        'Em Python, um atributo com `_` no começo, como `_saldo`, avisa: uso interno da classe. Sem o `_`, o atributo é **público**.',
        'É uma convenção entre pessoas: o Python não bloqueia o acesso a `_saldo` de fora da classe.',
        'Para recusar uma mudança inválida, o método pode ignorá-la ou avisar com `raise ValueError(...)`, como você viu na unidade de erros.',
    ], [
        EXEMPLO(C('''
            class Tanque:
                def __init__(self):
                    self._nivel = 0
                def encher(self, litros):
                    if litros > 0:
                        self._nivel = self._nivel + litros
                    return self._nivel

            t = Tanque()
            print(t.encher(30))
            print(t.encher(-5))
            print(t.encher(20))
            '''), nota='O método ignora o valor negativo e mantém o nível.'),
        EXEMPLO(C('''
            class Conta:
                def __init__(self):
                    self._saldo = 100

            c = Conta()
            c._saldo = 999
            print(c._saldo)
            '''), nota='O Python deixa mudar `_saldo` de fora. O `_` é um aviso para as pessoas.'),
    ]),
    [
        QUIZ(C('''
            class Bateria:
                def __init__(self):
                    self.carga = 50

                def usar(self, n):
                    self.carga = self.carga - n

            b = Bateria()
            b.usar(20)
            b.usar(10)
            print(b.carga)
            '''), '20', ['30', '40', '50'],
            explicacao='O estado muda a cada chamada: 50 - 20 deixa 30, e depois 30 - 10 deixa 20. Cada `usar` parte do valor que a chamada anterior deixou.'),
        DIGITE(C('''
            class Conta:
                def __init__(self):
                    self.saldo = 100

                def sacar(self, v):
                    if v <= self.saldo:
                        self.saldo = self.saldo - v

            c = Conta()
            c.sacar(70)
            c.sacar(50)
            print(c.saldo)
            '''), '30',
            explicacao='O primeiro saque (70) é aceito e deixa 30. O segundo (50) é maior que o saldo, então o `if` o recusa e nada muda.'),
        QUIZ(C('''
            class Conta:
                def __init__(self):
                    self._saldo = 100

            c = Conta()
            c._saldo = 0
            print(c._saldo)
            '''), '0', ['100', 'Erro', 'c._saldo'],
            explicacao='O `_` é só um aviso entre pessoas, e o Python deixa mudar `_saldo` de fora. O certo seria mudar o saldo por um método da classe.'),
        BUG(L('''
            class Conta:
                def __init__(self):
                    self._saldo = 10
                def depositar(self, valor):
                    self._saldo = _saldo + valor
                    return self._saldo
            c = Conta()
            print(c.depositar(5))
            '''), 5, '        self._saldo = self._saldo + valor', ['        self._saldo = valor', '        self._saldo = Conta._saldo + valor'],
            erro="NameError: name '_saldo' is not defined",
            enunciado='Este programa deveria mostrar 15, mas dá erro.',
            porque='Do lado direito, `_saldo` sozinho é uma variável comum, e ela não existe no método. O dado do objeto é `self._saldo`.',
            explicacao='`self._saldo + valor` soma o depósito ao saldo guardado no objeto. Usar só `valor` esqueceria o saldo antigo, e `Conta._saldo` procuraria o atributo na classe.'),
        CONCEITO('O que o `_` no começo de `_saldo` faz?', 'É um aviso: uso interno da classe', ['Faz o Python bloquear o acesso de fora', 'Divide o valor entre todos os objetos', 'Impede que o valor seja mudado'],
            explicacao='O `_` é uma convenção: avisa que o atributo é interno, mas o Python continua deixando ler e mudar. O valor segue sendo separado em cada objeto.',
            teste=_teste_underline),
        MONTE(L('''
            class Portaria:
                def liberar(self, idade):
                    if idade >= 18:
                        return "liberado"
                    return "negado"
            p = Portaria()
            print(p.liberar(20))
            '''), 'liberado',
            explicacao='O `if` fica dentro do método, e o `return` de dentro do `if` fica ainda mais recuado. Se a condição fosse falsa, o método seguiria para o `return "negado"`.'),
        ERRO(C('''
            class Conta:
                def __init__(self):
                    self._saldo = 100

            c = Conta()
            print(c.saldo)
            '''), 'AttributeError', ['NameError', 'KeyError', 'TypeError'],
            explicacao='O atributo guardado se chama `_saldo`, e o sublinhado faz parte do nome. Por isso `c.saldo` não existe, mesmo que pareça o mesmo atributo.'),
        LACUNA(C('''
            class Conta:
                def __init__(self):
                    self._saldo = 10
                def sacar(self, v):
                    if v > self._saldo:
                        {1} ValueError("sem saldo")
                    self._saldo = self._saldo - v
            c = Conta()
            try:
                c.sacar(30)
            except {2} as e:
                print(e)
            '''), ['raise', 'ValueError'], ['return', 'TypeError', 'print'], 'sem saldo',
            explicacao='O `raise` dispara o erro que o método usa para recusar o saque. O `except ValueError` pega esse erro e mostra a mensagem guardada em `e`.'),
        PARES([('_saldo', 'Uso interno'), ('saldo', 'Público'), ('__init__', 'Método especial'), ('Conta', 'Nome de classe')], _convencao_nome,
            enunciado='Ligue cada nome ao que a convenção do Python diz sobre ele.',
            explicacao='Um `_` no começo marca uso interno, e dois sublinhados dos dois lados marcam um método especial do Python. Nomes de classe começam com maiúscula, e os demais são públicos.'),
        QUIZ(C('''
            class Cofre:
                def __init__(self):
                    self._moedas = 5
                def retirar(self, n):
                    if n <= self._moedas:
                        self._moedas = self._moedas - n
                        return n
                    return 0
            c = Cofre()
            a = c.retirar(3)
            b = c.retirar(4)
            print(a, b)
            '''), '3 0', ['3 4', '3 2', '0 0'],
            explicacao='A primeira retirada (3) é aceita e deixa 2 moedas. Na segunda, 4 é maior que 2, então o `if` falha e o método devolve 0.'),
    ])

UNIDADE('u13', 'Classes e objetos', 'Modelar coisas do mundo com classes, atributos, métodos e herança.', [L01, L02, L03, L04])
