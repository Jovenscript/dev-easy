# -*- coding: utf-8 -*-
"""Linguagem de autoria das lições do ENIAC (jogo do DEV EASY).

Quem escreve uma lição descreve o exercício E o que espera que aconteça (a saída, o erro, a linha).
Este módulo roda o Python de verdade e confere cada previsão. Se algo não bate, a lição não é gerada.
Veja tools/curso/GUIA-AUTORES.md.  Uso (num arquivo de src/):   from dsl import *
"""
import ast, builtins, contextlib, io, itertools, os, random, re, shutil, signal, sys, tempfile, textwrap, warnings
try:
    import resource
    resource.setrlimit(resource.RLIMIT_AS, (3 << 30, 3 << 30))      # um exercício que tenta usar memória demais vira MemoryError
except Exception:
    pass
warnings.simplefilter('ignore')

TIPOS = ('quiz', 'bug', 'monte', 'lacuna', 'pares', 'digite')
ERROS, AVISOS, UNIDADES = [], [], []
CONTA = {'conceito_sem_teste': 0, 'pares_sem_verif': 0, 'amostrado': 0, 'livre': 0, 'exec': 0}
_ARQ = os.path.abspath(__file__)
_CTX = {'unidade': 99}

def zerar():
    del ERROS[:], AVISOS[:], UNIDADES[:]
    for k in CONTA:
        CONTA[k] = 0

# ------------------------------------------------------------------ mensagens com "arquivo:linha"
def onde():
    f = sys._getframe(1)
    while f is not None and os.path.abspath(f.f_code.co_filename) == _ARQ:
        f = f.f_back
    return '%s:%d' % (os.path.basename(f.f_code.co_filename), f.f_lineno) if f else '?'

def falha(msg, q=None):
    ERROS.append((q or onde(), msg))

def aviso(msg, q=None):
    AVISOS.append((q or onde(), msg))

# ------------------------------------------------------------------ ajudantes de escrita
def C(texto):
    """Código em bloco: tira a indentação comum e as quebras de linha das pontas.   C('''\\n    x = 1\\n    print(x)\\n''')"""
    return textwrap.dedent(texto).strip('\n')

def L(texto):
    """Mesmo que C, mas devolve a lista de linhas (para MONTE e BUG)."""
    return C(texto).split('\n')

# ------------------------------------------------------------------ rodar Python de verdade
class _Tempo(BaseException):
    pass

class _Longo(BaseException):
    pass

class _Saida(io.StringIO):
    def write(self, s):
        if self.tell() + len(s) > 20000:
            raise _Longo()
        return super().write(s)

def _alarme(sinal, quadro):
    raise _Tempo()

signal.signal(signal.SIGALRM, _alarme)

_AREA = tempfile.mkdtemp(prefix='eniac-')
_CACHE = {}
PROIBIDO = re.compile(r'\b(subprocess|socket|urllib|requests|ctypes|multiprocessing|threading|importlib|pickle|shutil\.rmtree|os\.(system|_exit|fork|kill|remove|rmdir|removedirs|unlink|popen|chdir|chmod|chown)|sys\.exit|__import__|exec|eval|compile)\b')

def _limpar_area():
    for n in os.listdir(_AREA):
        p = os.path.join(_AREA, n)
        try:
            shutil.rmtree(p) if os.path.isdir(p) else os.remove(p)
        except OSError:
            pass

def _formatar_erro(e):
    nome = type(e).__name__
    msg = e.msg if isinstance(e, SyntaxError) else str(e)
    return nome + (': ' + msg if msg else '')

def rodar(codigo, entradas=(), eco=True, limite=1.5):
    """Roda o código. Devolve (saida, erro, linha). erro = None ou 'Tipo: mensagem'.
    eco=True imita o terminal (mostra a pergunta do input e o que foi digitado); eco=False mostra só os print."""
    chave = (codigo, tuple(entradas or ()), eco)
    r = _CACHE.get(chave)
    if r is not None:
        return r
    CONTA['exec'] += 1
    if '\0' in codigo:
        return ('', 'ValueError: source code string cannot contain null bytes', None)
    achou = PROIBIDO.search(codigo)
    if achou:
        r = ('', 'Proibido: o gerador não aceita "%s" nos exercícios' % achou.group(0), None)
        _CACHE[chave] = r
        return r
    fila = list(entradas or ())
    buf = _Saida()

    def meu_input(prompt=''):
        if eco:
            buf.write(str(prompt))
        if not fila:
            raise EOFError('EOF when reading a line')
        v = fila.pop(0)
        if eco:
            buf.write(v + '\n')
        return v

    try:
        obj = compile(codigo, '<exercicio>', 'exec')
    except SyntaxError as e:
        r = ('', _formatar_erro(e), e.lineno)
        _CACHE[chave] = r
        return r
    except (ValueError, OverflowError, RecursionError, MemoryError) as e:
        r = ('', _formatar_erro(e), None)
        _CACHE[chave] = r
        return r
    env = {'__name__': '__main__', 'input': meu_input}
    arquivos = re.search(r'open\(|os\.|pathlib|csv|json|shutil', codigo) is not None
    if arquivos:
        _limpar_area()
        antigo_dir = os.getcwd()
        os.chdir(_AREA)
    erro, linha = None, None
    try:
        signal.setitimer(signal.ITIMER_REAL, limite, 0.05)
        with contextlib.redirect_stdout(buf), contextlib.redirect_stderr(io.StringIO()):
            exec(obj, env)
    except _Tempo:
        erro = 'Timeout: o código demorou demais (laço infinito?)'
    except _Longo:
        erro = 'Saída longa demais'
    except BaseException as e:
        tb = e.__traceback__
        while tb is not None:
            if tb.tb_frame.f_code.co_filename == '<exercicio>':
                linha = tb.tb_lineno
            tb = tb.tb_next
        erro = _formatar_erro(e)
    finally:
        try:
            signal.setitimer(signal.ITIMER_REAL, 0)
        except _Tempo:
            signal.setitimer(signal.ITIMER_REAL, 0)
        if arquivos:
            os.chdir(antigo_dir)
    r = (buf.getvalue().rstrip('\n'), erro, linha)
    if len(_CACHE) < 150000:
        _CACHE[chave] = r
    return r

# ------------------------------------------------------------------ "só use o que já foi ensinado" (guarda por unidade)
NO_MIN = {
    ast.If: 3, ast.IfExp: 3, ast.BoolOp: 3, ast.Match: 3, ast.Pass: 3,
    ast.While: 4, ast.For: 4, ast.Break: 4, ast.Continue: 4,
    ast.JoinedStr: 2, ast.Subscript: 2, ast.Slice: 2,
    ast.List: 5, ast.ListComp: 5, ast.Delete: 5,
    ast.Set: 6, ast.Dict: 7, ast.SetComp: 7, ast.DictComp: 7,
    ast.GeneratorExp: 12, ast.Yield: 12, ast.YieldFrom: 12,
    ast.FunctionDef: 8, ast.Lambda: 8, ast.Return: 8, ast.Global: 8, ast.Nonlocal: 8, ast.Starred: 8,
    ast.Try: 9, ast.Raise: 9, ast.Assert: 9,
    ast.With: 10,
    ast.Import: 11, ast.ImportFrom: 11,
    ast.ClassDef: 13,
    ast.AnnAssign: 15, ast.NamedExpr: 99, ast.AsyncFunctionDef: 99, ast.Await: 99, ast.AsyncFor: 99, ast.AsyncWith: 99,
}
NOME_MIN = {'len': 2, 'chr': 2, 'ord': 2, 'format': 2, 'repr': 2, 'range': 4, 'enumerate': 5, 'sum': 5, 'min': 5, 'max': 5, 'sorted': 5, 'reversed': 5,
            'list': 5, 'tuple': 6, 'set': 6, 'frozenset': 6, 'divmod': 6, 'dict': 7, 'callable': 8, 'open': 10, 'zip': 12, 'map': 12, 'filter': 12,
            'any': 12, 'all': 12, 'iter': 12, 'next': 12, 'isinstance': 13, 'getattr': 13, 'setattr': 13, 'hasattr': 13, 'super': 13, 'property': 13,
            'staticmethod': 13, 'classmethod': 13, 'vars': 99, 'globals': 99, 'locals': 99, 'eval': 99, 'exec': 99, 'compile': 99, '__import__': 99,
            'id': 99, 'hash': 99, 'help': 99, 'dir': 99, 'breakpoint': 99}
ATTR_MIN = {}
for _m in ('upper lower title capitalize strip lstrip rstrip replace split join find rfind count startswith endswith isdigit isalpha isalnum isupper '
           'islower isspace index zfill center ljust rjust format casefold swapcase splitlines partition').split():
    ATTR_MIN[_m] = 2
for _m in 'append insert extend remove pop sort reverse copy clear'.split():
    ATTR_MIN[_m] = 5
for _m in 'add discard union intersection difference symmetric_difference issubset issuperset update'.split():
    ATTR_MIN[_m] = 6
for _m in 'get keys values items setdefault popitem fromkeys'.split():
    ATTR_MIN[_m] = 7

def _guarda(codigo, q, expressao=False, livre=False):
    """Confere se o trecho só usa o que já foi ensinado até a unidade atual."""
    un = _CTX['unidade']
    if un >= 99:
        return
    try:
        arv = ast.parse(codigo, mode='eval' if expressao else 'exec')
    except SyntaxError:
        return
    achados = {}
    def marca(nome, minimo):
        if minimo > un:
            achados.setdefault(nome, minimo)
    for n in ast.walk(arv):
        t = type(n)
        if t in NO_MIN:
            marca(t.__name__, NO_MIN[t])
        if isinstance(n, ast.Compare):
            todos_in = all(isinstance(o, (ast.In, ast.NotIn)) for o in n.ops)
            if todos_in:
                marca('in', 2)
            else:
                marca('comparação (==, <, >...)', 3)
        if isinstance(n, ast.UnaryOp) and isinstance(n.op, ast.Not):
            marca('not', 3)
        if isinstance(n, ast.Tuple):
            marca('tupla', 6)
        if isinstance(n, ast.Call) and isinstance(n.func, ast.Name) and n.func.id in NOME_MIN:
            marca(n.func.id + '()', NOME_MIN[n.func.id])
        if isinstance(n, ast.Attribute) and n.attr in ATTR_MIN:
            marca('.' + n.attr + '()', ATTR_MIN[n.attr])
        if isinstance(n, (ast.FunctionDef, ast.ClassDef)) and n.decorator_list:
            marca('decorador', 13)
    # "for i, x in enumerate(...)": o par logo depois do for vale a partir da unidade 5
    if achados.get('tupla') and un >= 5:
        alvos = [n.target for n in ast.walk(arv) if isinstance(n, (ast.For, ast.comprehension)) and isinstance(n.target, ast.Tuple)]
        outras = [n for n in ast.walk(arv) if isinstance(n, ast.Tuple) and not any(n is a for a in alvos)]
        if alvos and not outras:
            achados.pop('tupla', None)
    if livre:
        if achados:
            CONTA['livre'] += 1
        return
    for nome, minimo in sorted(achados.items(), key=lambda kv: kv[1]):
        falha('usa %s, que só é ensinado na unidade %d (esta é a %d). Reescreva sem isso. Trecho: %s' % (nome, minimo, un, codigo.replace('\n', ' ⏎ ')[:90]), q)

def _determinismo(codigo, q):
    if re.search(r'\brandom\b', codigo) and 'seed(' not in codigo:
        falha('usa random sem random.seed(...): a saída mudaria a cada vez', q)
    if re.search(r'\b(time|datetime)\.(now|today|time|sleep|perf_counter|monotonic)\b|\bdate\.today\b|\bos\.(getcwd|environ|listdir|getpid|urandom)\b|\buuid\b|\bsecrets\b|\bid\(', codigo):
        falha('usa algo que muda a cada execução (hora, pasta, id...)', q)

# ------------------------------------------------------------------ conferência de texto
def _txt(x, campo, q, maximo=None, minimo=1):
    if not isinstance(x, str) or len(x.strip()) < minimo:
        falha('falta "%s" (texto)' % campo, q)
        return ''
    t = x.replace('\r', '')
    fora = re.sub(r'`[^`]*`', 'X', t)
    if t.count('`') % 2:
        falha('"%s" tem crase (`) sem par: %r' % (campo, t[:60]), q)
    if fora.count('**') % 2:
        falha('"%s" tem ** sem par: %r' % (campo, t[:60]), q)
    if '  ' in fora.strip() and '\n' not in t:
        aviso('"%s" tem espaço duplo: %r' % (campo, t[:60]), q)
    if maximo and len(t) > maximo:
        falha('"%s" tem %d letras (máximo %d): %r' % (campo, len(t), maximo, t[:70]), q)
    return t

def _prosa(x, campo, q, maximo):
    t = _txt(x, campo, q, maximo)
    if t and t.strip()[-1] not in '.!?:)`"\'' and not t.strip().endswith('...'):
        aviso('"%s" não termina com pontuação: %r' % (campo, t[-40:]), q)
    if re.search(r'\b(simplesmente|obviamente|óbvio|trivial|claro que)\b', t, re.I):
        aviso('"%s" usa palavra que pode soar condescendente (simplesmente/obviamente/óbvio...)' % campo, q)
    if campo in ('explicacao', 'porque'):
        frases = re.findall(r'[.!?](?:\s|$)', re.sub(r'`[^`]*`', 'X', re.sub(r'\d\.\d', '0', t)))
        if len(frases) > 4:
            aviso('"%s" com %d frases (o ideal é 1 a 3)' % (campo, len(frases)), q)
    return t

def _cod(codigo, campo, q):
    if not isinstance(codigo, str) or not codigo.strip():
        falha('falta "%s" (código)' % campo, q)
        return ''
    t = codigo.replace('\r', '').strip('\n')
    if '\t' in t:
        falha('"%s" tem tabulação (use 4 espaços)' % campo, q)
    ls = t.split('\n')
    if len(ls) > 18:
        falha('"%s" tem %d linhas (máximo 18; o ideal é até 12)' % (campo, len(ls)), q)
    elif len(ls) > 12:
        aviso('"%s" tem %d linhas (o ideal é até 12)' % (campo, len(ls)), q)
    mais = max(len(l) for l in ls)
    if mais > 64:
        falha('"%s" tem linha com %d letras (máximo 64; no celular o ideal é até 44)' % (campo, mais), q)
    elif mais > 46:
        aviso('"%s" tem linha com %d letras (no celular o ideal é até 44)' % (campo, mais), q)
    return t

def _entrada(entrada, q):
    if entrada is None:
        return []
    if not (isinstance(entrada, (list, tuple)) and all(isinstance(x, str) for x in entrada)):
        falha('"entrada" precisa ser uma lista de textos', q)
        return []
    return list(entrada)

def _opcoes(certa, erradas, q, minimo=2, maximo=3):
    if not isinstance(certa, str) or not certa.strip():
        falha('falta a opção certa', q)
        return [certa]
    if not isinstance(erradas, (list, tuple)) or not minimo <= len(erradas) <= maximo or not all(isinstance(x, str) and x.strip() for x in erradas):
        falha('"erradas" precisa ter de %d a %d textos' % (minimo, maximo), q)
        return [certa]
    ops = [certa] + list(erradas)
    if len(set(ops)) != len(ops):
        falha('opções repetidas: %r' % (ops,), q)
    for o in ops:
        if len(o) > 60:
            falha('opção com mais de 60 letras: %r' % o[:70], q)
    return ops

# ------------------------------------------------------------------ exercícios
def QUIZ(codigo, certa, erradas, enunciado='O que este código mostra na tela?', explicacao='', entrada=None, livre=False):
    """Múltipla escolha: o que o código mostra? `certa` é o que o Python realmente mostra (só os print);
    `erradas` são 2 ou 3 respostas plausíveis."""
    q = onde()
    codigo = _cod(codigo, 'codigo', q); ent = _entrada(entrada, q)
    ex = {'tipo': 'quiz', 'enunciado': _txt(enunciado, 'enunciado', q, 170), 'codigo': codigo, 'opcoes': _opcoes(certa, erradas, q),
          'explicacao': _prosa(explicacao, 'explicacao', q, 520)}
    if ent: ex['entrada'] = ent
    saida, erro, _ = rodar(codigo, ent, eco=False)
    if erro:
        falha('o código do quiz dá erro: %s' % erro, q)
    elif saida != certa:
        falha('previsto %r, mas o Python mostra %r' % (certa, saida), q)
    _guarda(codigo, q, livre=livre); _determinismo(codigo, q)
    return ex

def ERRO(codigo, certa, erradas, enunciado='Que tipo de erro o Python mostra ao rodar este código?', explicacao='', entrada=None, livre=False):
    """Múltipla escolha: que erro acontece? `certa` é o nome do erro (ex.: "NameError"); `erradas`, 2 ou 3 outros nomes
    (que não sejam "pais" do erro real, como Exception ou ArithmeticError)."""
    q = onde()
    codigo = _cod(codigo, 'codigo', q); ent = _entrada(entrada, q)
    ex = {'tipo': 'quiz', 'enunciado': _txt(enunciado, 'enunciado', q, 170), 'codigo': codigo, 'opcoes': _opcoes(certa, erradas, q),
          'explicacao': _prosa(explicacao, 'explicacao', q, 520)}
    if ent: ex['entrada'] = ent
    _, erro, _ = rodar(codigo, ent, eco=False)
    if not erro:
        falha('o código deveria dar erro e não deu', q)
    elif erro.split(':')[0] != certa:
        falha('previsto %s, mas o Python mostra %r' % (certa, erro), q)
    else:
        real = getattr(builtins, certa, None)
        for o in (erradas if isinstance(erradas, (list, tuple)) else []):
            cls = getattr(builtins, o, None)
            if isinstance(real, type) and isinstance(cls, type) and issubclass(real, cls):
                falha('a opção errada %s também está certa: é "pai" de %s' % (o, certa), q)
    if certa not in ('SyntaxError', 'IndentationError', 'TabError'):
        _guarda(codigo, q, livre=livre)
    _determinismo(codigo, q)
    return ex

def CONCEITO(enunciado, certa, erradas, explicacao, codigo=None, teste=None):
    """Pergunta de ideia (nada é executado). `teste` (opcional) é uma função que recebe o texto de uma opção e diz se ela é a certa:
    com ela o gerador confere que SÓ a opção certa passa. Sem ela a pergunta fica sem conferência automática (use pouco).
    Aceita 1 a 3 erradas (com 1 errada serve para Verdadeiro/Falso)."""
    q = onde()
    ops = _opcoes(certa, erradas, q, minimo=1)
    ex = {'tipo': 'quiz', 'enunciado': _txt(enunciado, 'enunciado', q, 170), 'opcoes': ops, 'explicacao': _prosa(explicacao, 'explicacao', q, 520)}
    if codigo:
        ex['codigo'] = _cod(codigo, 'codigo', q)
    if teste is None:
        CONTA['conceito_sem_teste'] += 1
        ex['_sem_teste'] = True
    else:
        try:
            ok = [o for o in ops if teste(o)]
        except Exception as e:
            falha('o "teste" do CONCEITO deu erro: %s' % e, q); ok = []
        if ok != [certa]:
            falha('o "teste" aprova %r (deveria aprovar só a opção certa %r)' % (ok, certa), q)
    return ex

def DIGITE(codigo, resposta, enunciado='Digite o que o programa mostra na tela.', explicacao='', aceitas=(), entrada=None, dica=None, livre=False):
    """A pessoa digita o que o código mostra (uma linha só, até 40 letras). `aceitas` são outras grafias que também valem."""
    q = onde()
    codigo = _cod(codigo, 'codigo', q); ent = _entrada(entrada, q)
    ex = {'tipo': 'digite', 'enunciado': _txt(enunciado, 'enunciado', q, 170), 'codigo': codigo, 'resposta': resposta,
          'explicacao': _prosa(explicacao, 'explicacao', q, 520)}
    if aceitas:
        ex['aceitas'] = list(aceitas)
    if dica:
        ex['dica'] = _txt(dica, 'dica', q, 80)
    if ent: ex['entrada'] = ent
    if not isinstance(resposta, str) or not resposta.strip() or '\n' in resposta or len(resposta) > 40:
        falha('"resposta" precisa ser um texto de UMA linha, com até 40 letras', q)
    saida, erro, _ = rodar(codigo, ent, eco=False)
    if erro:
        falha('o código dá erro: %s' % erro, q)
    elif saida != resposta:
        falha('previsto %r, mas o Python mostra %r' % (resposta, saida), q)
    if isinstance(resposta, str) and resposta != resposta.strip():
        falha('"resposta" tem espaço nas pontas (a conferência ignora espaços das pontas)', q)
    for a in aceitas:
        if not isinstance(a, str) or not a.strip() or a == resposta:
            falha('"aceitas" tem item inválido ou igual à resposta: %r' % (a,), q)
    _guarda(codigo, q, livre=livre); _determinismo(codigo, q)
    return ex

def BUG(linhas, linha, correcao, erradas, erro, porque, enunciado='Este programa não funciona. Encontre o erro.', explicacao='', entrada=None):
    """Caça ao bug: o Python aponta o erro na `linha` (1 = primeira). `correcao` é a linha certa; `erradas`, 2 correções erradas;
    `erro` é a mensagem que o Python mostra; `porque` explica a causa. O gerador roda tudo e confere."""
    q = onde()
    linhas = [str(x).rstrip() for x in linhas] if isinstance(linhas, (list, tuple)) else []
    ent = _entrada(entrada, q)
    ex = {'tipo': 'bug', 'enunciado': _txt(enunciado, 'enunciado', q, 170), 'linhas': linhas, 'linhaErrada': linha,
          'opcoes': _opcoes(correcao, erradas, q, minimo=2, maximo=2), 'erro': erro,
          'porque': _prosa(porque, 'porque', q, 520), 'explicacao': _prosa(explicacao, 'explicacao', q, 520)}
    if ent: ex['entrada'] = ent
    if len(linhas) < 3 or len(linhas) > 8:
        falha('um BUG precisa ter de 3 a 8 linhas', q); return ex
    if not (isinstance(linha, int) and 1 <= linha <= len(linhas)):
        falha('"linha" precisa ir de 1 a %d' % len(linhas), q); return ex
    if any('\t' in l for l in linhas):
        falha('use 4 espaços, não tabulação', q)
    if max(len(l) for l in linhas) > 56:
        falha('linha com mais de 56 letras (as opções precisam caber na tela do celular)', q)
    i = linha - 1
    cod_ruim = '\n'.join(linhas)
    cod_bom = '\n'.join(linhas[:i] + [correcao] + linhas[i + 1:])
    s_bom, e_bom, _ = rodar(cod_bom, ent, eco=False)
    if e_bom:
        falha('com a correção ainda dá erro: %s' % e_bom, q)
    _, e_ruim, l_ruim = rodar(cod_ruim, ent, eco=False)
    if not e_ruim:
        falha('o código com bug NÃO dá erro (BUG só serve para erros que o Python aponta)', q)
    else:
        if l_ruim != linha:
            falha('o Python aponta a linha %s, mas "linha" = %s' % (l_ruim, linha), q)
        if e_ruim != erro:
            falha('previsto o erro %r, mas o Python mostra %r' % (erro, e_ruim), q)
    if correcao.rstrip() == linhas[i].rstrip():
        falha('a correção é igual à linha com bug', q)
    for o in (erradas if isinstance(erradas, (list, tuple)) else []):
        s, e, _ = rodar('\n'.join(linhas[:i] + [o] + linhas[i + 1:]), ent, eco=False)
        if not e and s == s_bom:
            falha('a opção errada %r também resolve (mesma saída)' % o, q)
    _guarda(cod_bom, q); _determinismo(cod_bom, q)
    return ex

def MONTE(linhas, saida, enunciado='Coloque as linhas na ordem certa para o programa mostrar o texto abaixo.', explicacao='', entrada=None):
    """Monte o código: as `linhas` (3 a 7) estão na ordem CERTA (o jogo embaralha). `saida` é o que o programa mostra, como num terminal.
    O recuo (espaços no começo) faz parte de cada linha e não muda: a pessoa só escolhe a ORDEM. Dá para montar blocos (if/for/def).
    O gerador testa TODAS as ordens possíveis e exige que só uma funcione."""
    q = onde()
    linhas = [str(x).rstrip() for x in linhas] if isinstance(linhas, (list, tuple)) else []
    ent = _entrada(entrada, q)
    ex = {'tipo': 'monte', 'enunciado': _txt(enunciado, 'enunciado', q, 220), 'saida': saida, 'linhas': linhas, 'explicacao': _prosa(explicacao, 'explicacao', q, 520)}
    if ent: ex['entrada'] = ent
    if len(linhas) < 3 or len(linhas) > 7:
        falha('MONTE precisa ter de 3 a 7 linhas', q); return ex
    if len(set(linhas)) < 3:
        falha('MONTE com linhas demais repetidas', q)
    if any('\t' in l or not l.strip() for l in linhas):
        falha('MONTE: nada de linha vazia nem tabulação', q)
    if max(len(l) for l in linhas) > 44:
        falha('MONTE: linha com mais de 44 letras (precisa caber na tela do celular)', q)
    cod = '\n'.join(linhas)
    s, e, _ = rodar(cod, ent, eco=True)
    if e:
        falha('a ordem certa dá erro: %s' % e, q); return ex
    if s != saida:
        falha('previsto %r, mas o Python mostra %r' % (saida, s), q)
    _guarda(cod, q); _determinismo(cod, q)
    n = len(linhas)
    validas, tempos = set(), 0
    vistos = set()
    for p in itertools.permutations(range(n)):
        seq = tuple(linhas[k] for k in p)
        if seq in vistos:
            continue
        vistos.add(seq)
        s2, e2, _ = rodar('\n'.join(seq), ent, eco=True, limite=0.25)
        if e2 and e2.startswith('Timeout'):
            tempos += 1
            if tempos > 20:
                falha('muitas ordens travam (laço infinito): reescreva o exercício', q); break
        if not e2 and s2 == s:
            validas.add(seq)
    if validas != {tuple(linhas)}:
        outras = [v for v in validas if v != tuple(linhas)][:1]
        falha('existe OUTRA ordem que também funciona (a resposta precisa ser única): %r' % (outras,), q)
    return ex

def _preencher(codigo, valores):
    for i, v in enumerate(valores, 1):
        codigo = codigo.replace('{%d}' % i, v)
    return codigo

def LACUNA(codigo, respostas, extras, saida, enunciado='Complete o código para ele mostrar o texto abaixo.', explicacao='', entrada=None):
    """Complete a lacuna: o `codigo` tem buracos {1}, {2}... `respostas` são as palavras certas (na ordem dos buracos);
    `extras` são palavras erradas que entram no banco (cada palavra do banco serve uma vez). `saida` é o que o programa mostra, como num terminal.
    O gerador testa TODAS as combinações do banco e exige que só uma funcione."""
    q = onde()
    codigo = _cod(codigo, 'codigo', q); ent = _entrada(entrada, q)
    respostas = list(respostas) if isinstance(respostas, (list, tuple)) else []
    extras = list(extras) if isinstance(extras, (list, tuple)) else []
    banco = respostas + extras
    ex = {'tipo': 'lacuna', 'enunciado': _txt(enunciado, 'enunciado', q, 220), 'codigo': codigo, 'banco': banco, 'respostas': respostas, 'saida': saida,
          'explicacao': _prosa(explicacao, 'explicacao', q, 520)}
    if ent: ex['entrada'] = ent
    k = len(respostas)
    if not (1 <= k <= 4) or len(extras) < 2 or len(banco) > 8 or not all(isinstance(x, str) and x != '' for x in banco):
        falha('LACUNA: de 1 a 4 respostas, pelo menos 2 extras, banco de até 8 palavras (veio %d respostas, %d extras)' % (k, len(extras)), q); return ex
    if len(set(banco)) != len(banco):
        falha('LACUNA: palavra repetida no banco: %r' % (banco,), q)
    if any(len(x) > 22 for x in banco):
        falha('LACUNA: palavra do banco com mais de 22 letras', q)
    for n in range(1, k + 1):
        if '{%d}' % n not in codigo:
            falha('falta o buraco {%d} no código' % n, q)
    if '{%d}' % (k + 1) in codigo:
        falha('buraco a mais no código (há só %d respostas)' % k, q)
    s, e, _ = rodar(_preencher(codigo, respostas), ent, eco=True)
    if e:
        falha('com as respostas certas dá erro: %s' % e, q); return ex
    if s != saida:
        falha('previsto %r, mas o Python mostra %r' % (saida, s), q)
    _guarda(_preencher(codigo, respostas), q); _determinismo(codigo, q)
    validas = set()
    for p in itertools.permutations(range(len(banco)), k):
        combo = tuple(banco[i] for i in p)
        s2, e2, _ = rodar(_preencher(codigo, combo), ent, eco=True, limite=0.25)
        if not e2 and s2 == s:
            validas.add(combo)
    if validas != {tuple(respostas)}:
        outras = [v for v in validas if v != tuple(respostas)][:2]
        falha('existe OUTRA combinação do banco que também funciona (a resposta precisa ser única): %r' % (outras,), q)
    return ex

def PARES(pares, verif, enunciado='Ligue cada item ao que combina com ele.', explicacao='', esq_codigo=True, dir_codigo=False):
    """Ligue os pares: lista de (esquerda, direita), de 3 a 6 pares. `verif` diz como conferir cada par:
    'saida'  (a esquerda é um código e a direita é o que ele mostra) · 'avalia' (a direita é o que print(esquerda) mostra) ·
    'repr' (a direita é repr(esquerda)) · 'tipo' (a direita começa com o nome do tipo da esquerda) ·
    ou uma função f(esquerda, direita) -> True/False · ou None (sem conferência automática: use pouco).
    esq_codigo / dir_codigo dizem se o texto da coluna aparece em fonte de código."""
    q = onde()
    try:
        pares = [(str(a), str(b)) for a, b in pares]
    except Exception:
        falha('"pares" precisa ser uma lista de (esquerda, direita)', q); pares = []
    ex = {'tipo': 'pares', 'enunciado': _txt(enunciado, 'enunciado', q, 170), 'pares': [list(p) for p in pares], 'esqCodigo': bool(esq_codigo),
          'dirCodigo': bool(dir_codigo), 'explicacao': _prosa(explicacao, 'explicacao', q, 520)}
    if not 3 <= len(pares) <= 6:
        falha('PARES precisa ter de 3 a 6 pares', q); return ex
    if len({a for a, _ in pares}) != len(pares) or len({b for _, b in pares}) != len(pares):
        falha('item repetido em uma das colunas (o par ficaria ambíguo)', q)
    if any(len(a) > 40 or len(b) > 40 or '\n' in a or '\n' in b for a, b in pares):
        falha('item com mais de 40 letras ou com quebra de linha (não cabe na coluna)', q)
    if verif is None:
        CONTA['pares_sem_verif'] += 1; ex['_sem_teste'] = True
    for a, b in pares:
        try:
            if verif == 'saida':
                s, e, _ = rodar(a, (), eco=False)
                if e or s != b:
                    falha('%r mostra %r (erro %s) e não %r' % (a, s, e, b), q)
                _guarda(a, q); _determinismo(a, q)
            elif verif in ('avalia', 'repr', 'tipo'):
                molde = {'avalia': 'print(%s)', 'repr': 'print(repr(%s))', 'tipo': 'print(type(%s).__name__)'}[verif]
                s, e, _ = rodar(molde % a, (), eco=False)
                esperado = b.split()[0] if verif == 'tipo' and b.split() else b
                if e or s != esperado:
                    falha('%r dá %r (erro %s) e não %r' % (a, s, e, esperado), q)
                _guarda(a, q, expressao=True); _determinismo(a, q)
            elif callable(verif):
                if not verif(a, b):
                    falha('o par (%r, %r) não passou na conferência' % (a, b), q)
            elif verif is not None:
                falha('"verif" desconhecido: %r' % (verif,), q)
        except Exception as e:
            falha('erro ao conferir o par (%r, %r): %s' % (a, b, e), q)
    return ex

# ------------------------------------------------------------------ introdução da lição
def EXEMPLO(codigo, nota=None, entrada=None, erro=False):
    """Exemplo do começo da lição. A saída é calculada rodando o código (com erro=True, o exemplo mostra o erro de propósito)."""
    q = onde()
    codigo = _cod(codigo, 'codigo', q); ent = _entrada(entrada, q)
    s, e, _ = rodar(codigo, ent, eco=True)
    d = {'codigo': codigo}
    if erro:
        if not e:
            falha('o exemplo deveria dar erro e não deu', q)
        d['saida'] = e or ''; d['erro'] = True
    else:
        if e:
            falha('o exemplo dá erro: %s (use erro=True se é de propósito)' % e, q)
        d['saida'] = s
    if nota:
        d['nota'] = _txt(nota, 'nota', q, 200)
    if not erro:
        _guarda(codigo, q)
    _determinismo(codigo, q)
    return d

def INTRO(paragrafos, exemplos, lista=None, depois=None):
    """Texto que aparece antes dos exercícios: 2 a 8 parágrafos curtos (+ lista opcional + parágrafos depois da lista) e 1 a 3 exemplos."""
    q = onde()
    total = len(paragrafos) + len(depois or ()) if isinstance(paragrafos, (list, tuple)) else 0
    if not isinstance(paragrafos, (list, tuple)) or not paragrafos or not 2 <= total <= 8:
        falha('INTRO: de 2 a 8 parágrafos no total (contando os de "depois")', q); paragrafos = list(paragrafos or [])
    d = {'paragrafos': [_txt(p, 'parágrafo', q, 420) for p in paragrafos]}
    if lista:
        d['lista'] = [_txt(x, 'item da lista', q, 260) for x in lista]
    if depois:
        d['depois'] = [_txt(x, 'parágrafo depois da lista', q, 420) for x in depois]
    if isinstance(exemplos, dict):
        exemplos = [exemplos]
    if not isinstance(exemplos, (list, tuple)) or not 1 <= len(exemplos) <= 3:
        falha('INTRO: de 1 a 3 exemplos (use EXEMPLO(...))', q); exemplos = []
    d['exemplos'] = list(exemplos)
    return d

# ------------------------------------------------------------------ lição e unidade
def LICAO(id, titulo, resumo, intro, ex):
    q = onde()
    ex = list(ex) if isinstance(ex, (list, tuple)) else []
    d = {'id': id, 'titulo': _txt(titulo, 'titulo', q, 42), 'resumo': _txt(resumo, 'resumo', q, 80), 'intro': intro, 'exercicios': ex}
    if not 8 <= len(ex) <= 12:
        falha('lição %s: precisa ter de 8 a 12 exercícios (tem %d)' % (id, len(ex)), q)
    if any(not isinstance(x, dict) or x.get('tipo') not in TIPOS for x in ex):
        falha('lição %s: tem item que não é um exercício (use QUIZ, ERRO, CONCEITO, DIGITE, BUG, MONTE, LACUNA, PARES)' % id, q)
        return d
    tipos = [x['tipo'] for x in ex]
    if len(set(tipos)) < 4:
        falha('lição %s: use pelo menos 4 tipos de exercício diferentes (tem %s)' % (id, sorted(set(tipos))), q)
    for a, b in zip(tipos, tipos[1:]):
        if a == b != 'quiz':
            aviso('lição %s: dois exercícios "%s" seguidos' % (id, a), q); break
    sem_teste = sum(1 for x in ex if x.get('_sem_teste'))
    teto = max(2, len(ex) * 3 // 10)
    if sem_teste > teto:
        falha('lição %s: %d exercícios sem conferência automática (CONCEITO sem teste / PARES sem verif); no máximo %d' % (id, sem_teste, teto), q)
    chaves = [(x.get('enunciado'), x.get('codigo') or '', tuple(x.get('linhas') or ()), tuple(map(tuple, x.get('pares') or ()))) for x in ex]
    if len(set(chaves)) != len(chaves):
        falha('lição %s: dois exercícios iguais (mesmo enunciado e código)' % id, q)
    if not re.match(r'^u\d{2}l\d{2}$', str(id)):
        falha('id de lição inválido: %r (use uNNlMM, ex.: u03l05)' % (id,), q)
    elif int(str(id)[1:3]) != _CTX['unidade'] and _CTX['unidade'] < 99:
        falha('o id %s não é da unidade %d' % (id, _CTX['unidade']), q)
    for x in ex:
        x.pop('_sem_teste', None)
    return d

def UNIDADE(id, titulo, descricao, licoes):
    q = onde()
    licoes = list(licoes) if isinstance(licoes, (list, tuple)) else []
    d = {'id': id, 'titulo': _txt(titulo, 'titulo', q, 46), 'descricao': _txt(descricao, 'descricao', q, 110), 'licoes': licoes}
    if not re.match(r'^u\d{2}$', str(id)):
        falha('id de unidade inválido: %r (use u01, u02...)' % (id,), q)
    ids = [l.get('id') for l in licoes if isinstance(l, dict)]
    if len(set(ids)) != len(ids):
        falha('ids de lição repetidos na unidade %s' % id, q)
    for i, lid in enumerate(ids, 1):
        if lid != '%sl%02d' % (id, i):
            falha('as lições precisam ser numeradas em ordem: a %dª deveria ser %sl%02d, mas é %s' % (i, id, i, lid), q); break
    if not 4 <= len(licoes) <= 16:
        falha('a unidade precisa ter de 4 a 16 lições (tem %d)' % len(licoes), q)
    UNIDADES.append(d)
    return d

def definir_unidade_atual(numero):
    _CTX['unidade'] = numero

__all__ = ['C', 'L', 'QUIZ', 'ERRO', 'CONCEITO', 'DIGITE', 'BUG', 'MONTE', 'LACUNA', 'PARES', 'EXEMPLO', 'INTRO', 'LICAO', 'UNIDADE']
