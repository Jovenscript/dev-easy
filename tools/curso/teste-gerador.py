#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Testa o próprio gerador: cada caso abaixo está ERRADO de propósito e o gerador PRECISA reclamar.
Os casos "bons" precisam passar sem reclamação.   Uso: python3 tools/curso/teste-gerador.py"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import dsl
from dsl import *

falhou = []

def deve_reclamar(nome, fn, trecho, unidade=99):
    dsl.zerar(); dsl.definir_unidade_atual(unidade)
    try:
        fn()
    except Exception as e:
        falhou.append('%s: lançou exceção %r' % (nome, e)); return
    msgs = ' | '.join(m for _, m in dsl.ERROS)
    if not dsl.ERROS:
        falhou.append('%s: NÃO reclamou (devia conter %r)' % (nome, trecho))
    elif trecho not in msgs:
        falhou.append('%s: reclamou, mas de outra coisa: %s (esperava %r)' % (nome, msgs[:200], trecho))

def deve_passar(nome, fn, unidade=99):
    dsl.zerar(); dsl.definir_unidade_atual(unidade)
    try:
        fn()
    except Exception as e:
        falhou.append('%s: lançou exceção %r' % (nome, e)); return
    if dsl.ERROS:
        falhou.append('%s: reclamou à toa: %s' % (nome, dsl.ERROS[:2]))

# ---- previsões erradas
deve_reclamar('quiz saída errada', lambda: QUIZ('print(1+1)', '3', ['2', '4'], explicacao='x.'), 'previsto')
deve_reclamar('quiz com erro', lambda: QUIZ('print(x)', '1', ['2', '3'], explicacao='x.'), 'dá erro')
deve_reclamar('quiz opções repetidas', lambda: QUIZ('print(1)', '1', ['2', '2'], explicacao='x.'), 'repetidas')
deve_reclamar('erro que não dá erro', lambda: ERRO('print(1)', 'NameError', ['TypeError', 'ValueError'], explicacao='x.'), 'deveria dar erro')
deve_reclamar('erro tipo errado', lambda: ERRO('print(x)', 'TypeError', ['NameError', 'ValueError'], explicacao='x.'), 'previsto')
deve_reclamar('erro com opção "pai"', lambda: ERRO('print(1/0)', 'ZeroDivisionError', ['ArithmeticError', 'NameError'], explicacao='x.'), 'também está certa')
deve_reclamar('digite errado', lambda: DIGITE('print(2*3)', '7', explicacao='x.'), 'previsto')
deve_reclamar('digite multilinha', lambda: DIGITE('print(1)\nprint(2)', '1\n2', explicacao='x.'), 'UMA linha')
# ---- bug
B = ['a = 1', 'print(b)', 'print(a)']
deve_reclamar('bug linha errada', lambda: BUG(B, 1, 'b = 1', ['b = 2', 'c = 1'], "NameError: name 'b' is not defined", 'p.', explicacao='x.'), 'aponta a linha')
deve_reclamar('bug mensagem errada', lambda: BUG(B, 2, 'print(a)', ['print(1)', 'print(c)'], "NameError: name 'c' is not defined", 'p.', explicacao='x.'), 'previsto o erro')
deve_reclamar('bug opção errada também resolve', lambda: BUG(['a = 1', 'print(b)', 'print(a)'], 2, 'print(a)', ['print(a)  ', 'print(a + 0)'], "NameError: name 'b' is not defined", 'p.', explicacao='x.'), 'também resolve')
deve_reclamar('bug sem erro', lambda: BUG(['a = 1', 'print(a)', 'print(a)'], 2, 'print(1)', ['print(2)', 'print(3)'], 'NameError: x', 'p.', explicacao='x.'), 'NÃO dá erro')
deve_passar('bug certo', lambda: BUG(B, 2, 'print(a)', ['print(a + 1)', 'print(c)'], "NameError: name 'b' is not defined", 'p.', explicacao='x.'))
# ---- monte / lacuna: resposta única
deve_reclamar('monte com 2 ordens', lambda: MONTE(['a = 1', 'b = 2', 'print(a + b)'], '3', explicacao='x.'), 'OUTRA ordem')
deve_passar('monte com 1 ordem', lambda: MONTE(['a = 1', 'b = a + 1', 'print(b)'], '2', explicacao='x.'))
deve_passar('monte com bloco recuado', lambda: MONTE(['n = 3', 'if n > 2:', '    print("grande")', 'else:', '    print("pequeno")'], 'grande', explicacao='x.'))
deve_reclamar('monte com linha vazia', lambda: MONTE(['a = 1', '', 'print(a)'], '1', explicacao='x.'), 'linha vazia')
deve_reclamar('lacuna com 2 combinações', lambda: LACUNA('print({1})', ['"a"'], ['"a"  ', '\'a\'', 'x'], 'a', explicacao='x.'), 'OUTRA combinação')
deve_reclamar('lacuna buraco faltando', lambda: LACUNA('print("a")', ['x'], ['y', 'z'], 'a', explicacao='x.'), 'buraco')
deve_passar('lacuna certa', lambda: LACUNA('{1}("oi")', ['print'], ['Print', 'echo'], 'oi', explicacao='x.'))
# ---- pares
deve_reclamar('pares errado', lambda: PARES([('1+1', '2'), ('2*2', '5'), ('3-1', '2x')], 'avalia', explicacao='x.'), 'dá')
deve_reclamar('pares itens repetidos', lambda: PARES([('1+1', '2'), ('2*1', '2'), ('3-1', '1')], 'avalia', explicacao='x.'), 'repetido')
# ---- guarda por unidade
deve_reclamar('if na unidade 1', lambda: QUIZ('x = 1\nif x:\n    print(1)', '1', ['2', '3'], explicacao='x.'), 'unidade 3', unidade=1)
deve_reclamar('f-string na unidade 1', lambda: QUIZ('n = 1\nprint(f"{n}")', '1', ['2', '3'], explicacao='x.'), 'unidade 2', unidade=1)
deve_reclamar('lista na unidade 3', lambda: QUIZ('print([1, 2])', '[1, 2]', ['1', '2'], explicacao='x.'), 'unidade 5', unidade=3)
deve_reclamar('.append na unidade 3', lambda: QUIZ('x = "a"\nprint(x.append)', '1', ['2', '3'], explicacao='x.'), 'unidade 5', unidade=3)
deve_reclamar('comparação na unidade 2', lambda: QUIZ('print(1 == 1)', 'True', ['False', 'Erro'], explicacao='x.'), 'comparação', unidade=2)
deve_passar('tudo liberado na 99', lambda: QUIZ('print([x for x in range(3)])', '[0, 1, 2]', ['[1, 2, 3]', 'Erro'], explicacao='x.'), unidade=99)
deve_passar('for com par na unidade 5', lambda: QUIZ('for i, x in enumerate("ab"):\n    print(i, x)', '0 a\n1 b', ['1 a\n2 b', 'Erro'], explicacao='x.'), unidade=5)
deve_reclamar('tupla solta na unidade 5', lambda: QUIZ('a, b = 1, 2\nprint(a)', '1', ['2', '3'], explicacao='x.'), 'tupla', unidade=5)
# ---- determinismo e segurança
deve_reclamar('random sem seed', lambda: QUIZ('import random\nprint(random.randint(1, 1))', '1', ['2', '3'], explicacao='x.'), 'random')
deve_reclamar('laço infinito', lambda: QUIZ('while True:\n    pass', '1', ['2', '3'], explicacao='x.'), 'dá erro')
deve_reclamar('código proibido', lambda: QUIZ('import os\nos.system("echo oi")', '1', ['2', '3'], explicacao='x.'), 'Proibido')
deve_reclamar('hora atual', lambda: QUIZ('import time\nprint(time.time())', '1', ['2', '3'], explicacao='x.'), 'muda a cada')
# ---- textos
deve_reclamar('negrito sem par', lambda: QUIZ('print(1)', '1', ['2', '3'], explicacao='um **negrito aberto.'), 'sem par')
deve_reclamar('crase sem par', lambda: QUIZ('print(1)', '1', ['2', '3'], explicacao='um `código aberto.'), 'sem par')
deve_passar('** dentro de código não conta', lambda: QUIZ('print(2 ** 3)', '8', ['6', '9'], explicacao='Use `**` para potência.'))
deve_reclamar('enunciado enorme', lambda: QUIZ('print(1)', '1', ['2', '3'], enunciado='x' * 200, explicacao='x.'), 'letras')

# ---- lição
def _licao_curta():
    ex = [QUIZ('print(%d)' % i, str(i), ['x', 'y'], explicacao='ok.') for i in range(5)]
    LICAO('u99l01', 't', 'r', INTRO(['a.', 'b.'], [EXEMPLO('print(1)')]), ex)
deve_reclamar('lição curta', _licao_curta, 'de 8 a 12')
def _licao_pouca_variedade():
    ex = [QUIZ('print(%d)' % i, str(i), ['x', 'y'], explicacao='ok.') for i in range(9)]
    LICAO('u99l01', 't', 'r', INTRO(['a.', 'b.'], [EXEMPLO('print(1)')]), ex)
deve_reclamar('lição sem variedade', _licao_pouca_variedade, '4 tipos')
def _licao_id_errado():
    ex = [QUIZ('print(%d)' % i, str(i), ['x', 'y'], explicacao='ok.') for i in range(4)]
    ex += [DIGITE('print(7)', '7', explicacao='ok.'), MONTE(['a = 1', 'b = a + 1', 'print(b)'], '2', explicacao='ok.'),
           LACUNA('{1}("oi")', ['print'], ['Print', 'echo'], 'oi', explicacao='ok.'), PARES([('1+1', '2'), ('2+2', '4'), ('3+3', '6')], 'avalia', explicacao='ok.')]
    LICAO('x1', 't', 'r', INTRO(['a.', 'b.'], [EXEMPLO('print(1)')]), ex)
deve_reclamar('id de lição inválido', _licao_id_errado, 'id de lição')
def _licao_boa():
    ex = [QUIZ('print(%d)' % i, str(i), ['x', 'y'], explicacao='ok.') for i in range(4)]
    ex += [DIGITE('print(7)', '7', explicacao='ok.'), MONTE(['a = 1', 'b = a + 1', 'print(b)'], '2', explicacao='ok.'),
           LACUNA('{1}("oi")', ['print'], ['Print', 'echo'], 'oi', explicacao='ok.'), PARES([('1+1', '2'), ('2+2', '4'), ('3+3', '6')], 'avalia', explicacao='ok.')]
    LICAO('u99l01', 't', 'r', INTRO(['a.', 'b.'], [EXEMPLO('print(1)')]), ex)
deve_passar('lição boa', _licao_boa)
def _exemplo_erro():
    EXEMPLO('print(x)')
deve_reclamar('exemplo que quebra', _exemplo_erro, 'dá erro')
deve_passar('exemplo de erro proposital', lambda: EXEMPLO('print(x)', erro=True))
deve_passar('exemplo com input', lambda: EXEMPLO('n = input("Nome? ")\nprint(n)', entrada=['Ana']))

if falhou:
    print('FALHOU (%d):' % len(falhou))
    for f in falhou:
        print('  - ' + f)
    sys.exit(1)
print('Gerador OK: todos os casos errados foram pegos e os bons passaram.')
