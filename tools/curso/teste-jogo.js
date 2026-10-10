#!/usr/bin/env node
/* Teste automático do ENIAC (o jogo de lições de Python do DEV EASY).

   O QUE FAZ
   Abre o app de verdade num Chromium (Playwright), com um servidor local próprio, e joga TODAS as lições de jogos/curso/ clicando como uma pessoa,
   usando o gabarito que está dentro das próprias lições. Confere:
   - percurso:   cada lição do começo ao fim (celular 390x844, celular pequeno 360x640 e desktop 1280x800): acertos, XP, estrelas, desbloqueio em sequência,
                 nível, sequência diária, conquistas, progresso depois de recarregar a página; sem rolagem para o lado, alvos de toque >= 44 px
   - erros:      caminho dos erros: vida a menos, exercício volta ao fim da fila, XP 5 na segunda tentativa, 3/2/1 estrelas, fim das vidas (recomeçar),
                 sair da lição (botão X, Esc e botão Voltar do navegador)
   - teclado:    1 a 4 escolhem, Enter confere e continua, Esc pergunta se quer sair, foco preso na janela
   - rotas:      #/jogos, #/jogo/<id>, lição bloqueada ou inexistente, item do menu, cartão do painel, endereço antigo jogos/, falha de rede no curso
   - ajustes:    "Liberar todas as lições", conquistas, apagar o progresso
   - migracao:   progresso do Codivara (localStorage "codivara:progresso:v1") vira progresso do ENIAC, uma vez só
   - offline:    depois da primeira visita o ENIAC abre e joga sem servidor (service worker)
   - a11y:       axe-core (se achar o arquivo) + conferências próprias: nomes, aria-live, foco visível, contraste, "reduzir movimento"
   - fotos:      (só com --fotos) capturas de tela: trilha, aula, cada tipo de exercício, feedback, resultado, janelas
   Em todas: ZERO erros no console (console.error, console.warn e erros da página).

   COMO RODAR (na pasta do projeto)
     node tools/curso/teste-jogo.js                          roda tudo (leva uns minutos)
     node tools/curso/teste-jogo.js --suites percurso,erros  só estas (nomes acima)
     node tools/curso/teste-jogo.js --so celular             só o celular (ou: --so desktop)
     node tools/curso/teste-jogo.js --licoes u01l01,u02l03   o percurso só com estas lições (as anteriores são liberadas sem jogar)
     node tools/curso/teste-jogo.js --rapido                 percurso só com 1 lição por unidade
     node tools/curso/teste-jogo.js --fotos /caminho/pasta   também salva as capturas de tela
     node tools/curso/teste-jogo.js --visivel                abre a janela do navegador (para ver o robô jogando)
     node tools/curso/teste-jogo.js --sem-axe                não usa o axe-core, só as conferências próprias de acessibilidade
   Sai com código 0 se tudo passou e 1 se algo falhou. Pode rodar de novo à vontade: não mexe em nenhum arquivo do projeto.

   O QUE PRECISA
   Node 18 ou mais novo e o Playwright com Chromium:  npm i -D playwright  e  npx playwright install chromium
   (o script procura o Playwright em: variável PLAYWRIGHT_DIR, "playwright", /opt/npm-tools/node_modules/playwright e ./node_modules).
   Opcional: o arquivo axe.min.js do pacote axe-core (variável AXE_JS ou  npm i -D axe-core ). Sem ele, as conferências próprias de acessibilidade rodam do mesmo jeito.

   O QUE NÃO TESTA
   Aparelhos reais (iPhone/Safari, Firefox, Android), leitor de tela de verdade, a sincronização com a nuvem (Firebase) e o áudio. */
'use strict';
const fs = require('fs'), path = require('path'), http = require('http');
const RAIZ = path.resolve(__dirname, '..', '..');

/* ---------- opções ---------- */
const ARGS = process.argv.slice(2);
const flag = n => ARGS.includes(n);
function valor(n) {
  const i = ARGS.findIndex(a => a === n || a.startsWith(n + '='));
  if (i < 0) return null;
  return ARGS[i].includes('=') ? ARGS[i].split('=').slice(1).join('=') : (ARGS[i + 1] || null);
}
if (flag('--ajuda') || flag('-h') || flag('--help')) {
  console.log(fs.readFileSync(__filename, 'utf8').split('*/')[0].replace(/^#!.*\n/, '').replace(/^\/\* ?/, ''));
  process.exit(0);
}
const lista = n => (valor(n) || '').split(',').map(s => s.trim()).filter(Boolean);
const OPC = { fotos: valor('--fotos'), so: valor('--so'), suites: lista('--suites'), licoes: lista('--licoes'), rapido: flag('--rapido'), visivel: flag('--visivel') };
const TODAS = ['percurso', 'erros', 'teclado', 'rotas', 'ajustes', 'migracao', 'offline', 'a11y'];
const SUITES = OPC.suites.length ? OPC.suites : TODAS.concat(OPC.fotos ? ['fotos'] : []);
const quer = s => SUITES.includes(s);
const TELAS = [
  { nome: 'celular', w: 390, h: 844, escala: 2, celular: true },
  { nome: 'celular-pequeno', w: 360, h: 640, escala: 1, celular: true, pequeno: true },
  { nome: 'desktop', w: 1280, h: 800, escala: 1 }
].filter(t => !OPC.so || t.nome.startsWith(OPC.so));
const PRINCIPAIS = TELAS.filter(t => !t.pequeno);

/* ---------- resultado ---------- */
const R = { ok: 0, falhas: [], avisos: [] };
function t(cond, msg, extra) {
  if (cond) { R.ok++; return true; }
  const m = msg + (extra ? '  ::  ' + extra : '');
  R.falhas.push(m); console.log('    FALHA: ' + m);
  return false;
}
function aviso(msg) { R.avisos.push(msg); console.log('    aviso: ' + msg); }
function titulo(s) { console.log('\n== ' + s); }
const dorme = ms => new Promise(r => setTimeout(r, ms));

/* ---------- servidor local (com chave "sem internet") ---------- */
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.md': 'text/plain; charset=utf-8', '.mp3': 'audio/mpeg' };
function iniciarServidor() {
  const S = { offline: false, pedidos: [] };
  const srv = http.createServer((req, res) => {
    let p; try { p = decodeURIComponent(req.url.split('?')[0]); } catch (e) { res.writeHead(400); return res.end(); }
    S.pedidos.push(p);
    if (S.offline) { req.socket.destroy(); return; }               /* "sem internet": a conexão cai */
    if (p.endsWith('/')) p += 'index.html';
    const file = path.normalize(path.join(RAIZ, p));
    if (file !== RAIZ && !file.startsWith(RAIZ + path.sep)) { res.writeHead(403); return res.end(); }
    fs.stat(file, (err, st) => {
      if (err || !st.isFile()) { res.writeHead(404); return res.end('não achei ' + p); }
      res.writeHead(200, { 'content-type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream', 'cache-control': 'no-cache', 'content-length': st.size });
      fs.createReadStream(file).pipe(res);
    });
  });
  return new Promise(ok => srv.listen(0, '127.0.0.1', () => {
    S.porta = srv.address().port; S.url = 'http://127.0.0.1:' + S.porta + '/';
    S.fechar = () => { try { srv.closeAllConnections && srv.closeAllConnections(); } catch (e) {} srv.close(); };
    ok(S);
  }));
}

/* ---------- Playwright, axe ---------- */
function carregarPlaywright() {
  if (!process.env.PLAYWRIGHT_BROWSERS_PATH && fs.existsSync('/opt/pw-browsers')) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
  const cand = [process.env.PLAYWRIGHT_DIR, 'playwright', '/opt/npm-tools/node_modules/playwright', path.join(RAIZ, 'node_modules', 'playwright')].filter(Boolean);
  for (const c of cand) { try { return require(c); } catch (e) {} }
  console.error('Não achei o Playwright. Instale com:  npm i -D playwright  e  npx playwright install chromium   (ou aponte PLAYWRIGHT_DIR).');
  process.exit(2);
}
function acharAxe() {
  const cand = [process.env.AXE_JS, path.join(RAIZ, 'node_modules', 'axe-core', 'axe.min.js'), '/opt/npm-tools/node_modules/axe-core/axe.min.js'].filter(Boolean);
  try { cand.unshift(require.resolve('axe-core/axe.min.js')); } catch (e) {}
  return cand.find(f => { try { return fs.statSync(f).isFile(); } catch (e) { return false; } }) || null;
}
const AXE = acharAxe();

/* ---------- contexto de navegador ---------- */
async function novoContexto(browser, srv, tela, tema, extra) {
  extra = extra || {};
  const ctx = await browser.newContext({ viewport: { width: tela.w, height: tela.h }, deviceScaleFactor: tela.escala || 1, hasTouch: !!tela.celular, isMobile: false, locale: 'pt-BR',
    serviceWorkers: extra.sw ? 'allow' : 'block', reducedMotion: extra.reduzir ? 'reduce' : 'no-preference' });
  await ctx.addInitScript(a => {
    try {
      localStorage.setItem('dev-easy-local', '1');
      localStorage.setItem('dev-easy-theme', a.tema);
      if (a.sementes && !localStorage.getItem('__teste_semeado')) { Object.keys(a.sementes).forEach(k => localStorage.setItem(k, a.sementes[k])); localStorage.setItem('__teste_semeado', '1'); }
    } catch (e) {}
  }, { tema: tema || 'dark', sementes: extra.sementes || null });
  const page = await ctx.newPage();
  page.setDefaultTimeout(extra.tempo || 10000);
  const logs = [], falhas = [];
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') logs.push(m.type() + ': ' + m.text()); });
  page.on('pageerror', e => logs.push('erro da página: ' + e.message));
  page.on('requestfailed', r => falhas.push(r.url().replace(srv.url, '/') + ' ' + ((r.failure() || {}).errorText || '')));
  return { ctx, page, logs, falhas, url: srv.url };
}
/* confere (e zera) os erros de console acumulados */
function semErrosNoConsole(c, rotulo, ignorar) {
  const ruins = c.logs.splice(0).filter(l => !/Service Worker registration blocked by Playwright/.test(l) && !(ignorar && ignorar.test(l)));
  return t(ruins.length === 0, 'console limpo: ' + rotulo, ruins.slice(0, 3).join(' | '));
}
async function abrirApp(c, hash) {
  await c.page.goto(c.url + (hash ? '#' + hash.replace(/^#/, '') : ''), { waitUntil: 'load' });
  await c.page.waitForFunction(() => typeof ENIAC !== 'undefined' && !!document.querySelector('#view') && document.querySelector('#view').children.length > 0, null, { timeout: 15000 });
}
const irPara = (pg, hash) => pg.evaluate(h => { location.hash = h; }, hash);
const carregarCurso = pg => pg.evaluate(() => ENIAC.carregarManifesto().then(() => ENIAC.ordem().map(l => ({ id: l.id, n: l.n, un: l.un, g: l.g, titulo: l.titulo }))));
const estado = pg => pg.evaluate(() => ENIAC.jogador._s());
const esperarFase = (pg, fases) => pg.waitForFunction(f => { const s = ENIAC.jogador._s(); return !!s && f.includes(s.fase); }, fases);
const esperarArea = pg => pg.waitForFunction(() => { const a = document.querySelector('#jg-area'); return !!a && a.children.length > 0; });
async function esperarAte(fn, ms, passo) {
  const fim = Date.now() + ms;
  while (Date.now() < fim) { if (await fn()) return true; await dorme(passo || 300); }
  return false;
}
/* abre a lição pela trilha (se já estiver no resultado dela, o mesmo endereço não recarrega a sessão) */
async function abrirDoZero(pg, id) {
  await irPara(pg, '/jogos'); await pg.waitForSelector('.jg-hero');
  await irPara(pg, '/jogo/' + id); await esperarFase(pg, ['aula']);
}
const fotoNome = (nome) => nome.replace(/[^a-z0-9._-]+/gi, '-');

/* ---------- resolver / errar um exercício com cliques reais ---------- */
async function indiceTexto(pg, seletor, texto) {
  return pg.evaluate(a => [...document.querySelectorAll(a.s)].findIndex(x => x.textContent === a.t), { s: seletor, t: texto });
}
async function resolverEx(pg, ex) {
  const tp = ex.tipo;
  if (tp === 'quiz') {
    const i = await pg.evaluate(e => { const alvo = [e.opcoes[0], ENIAC.plano(e.opcoes[0])]; return [...document.querySelectorAll('.jg-op .jg-ot')].findIndex(x => alvo.includes(x.textContent)); }, ex);
    if (i < 0) throw new Error('opção certa não achada: ' + JSON.stringify(ex.opcoes));
    await pg.locator('.jg-op').nth(i).click();
  } else if (tp === 'digite') {
    await pg.locator('.jg-in').fill(ex.resposta);
  } else if (tp === 'bug') {
    await pg.locator('.jg-cod-bug .jg-l').nth(ex.linhaErrada - 1).click();
    await pg.locator('#jg-acao').click();
    await pg.waitForSelector('.jg-etapa2:not([hidden]) .jg-op');
    const i = await indiceTexto(pg, '.jg-etapa2 .jg-op .jg-ot', ex.opcoes[0]);
    if (i < 0) throw new Error('correção certa não achada');
    await pg.locator('.jg-etapa2 .jg-op').nth(i).click();
  } else if (tp === 'monte') {
    for (const linha of ex.linhas) {
      const i = await indiceTexto(pg, '.jg-banco .jg-chip:not(:disabled)', linha);
      if (i < 0) throw new Error('linha não achada no banco: ' + JSON.stringify(linha));
      await pg.locator('.jg-banco .jg-chip:not(:disabled)').nth(i).click();
    }
  } else if (tp === 'lacuna') {
    for (const r of ex.respostas) {
      const i = await indiceTexto(pg, '.jg-banco .jg-chip:not(:disabled)', r);
      if (i < 0) throw new Error('palavra não achada no banco: ' + r);
      await pg.locator('.jg-banco .jg-chip:not(:disabled)').nth(i).click();
    }
  } else if (tp === 'pares') {
    for (const p of ex.pares) await ligarPar(pg, p[0], p[1]);
  } else throw new Error('tipo desconhecido: ' + tp);
}
async function ligarPar(pg, esq, dir) {
  const li = await indiceTexto(pg, '.jg-col[data-lado="e"] .jg-par:not(:disabled)', esq);
  if (li < 0) throw new Error('item da esquerda não achado: ' + esq);
  await pg.locator('.jg-col[data-lado="e"] .jg-par:not(:disabled)').nth(li).click();
  const ri = await indiceTexto(pg, '.jg-col[data-lado="d"] .jg-par:not(:disabled)', dir);
  if (ri < 0) throw new Error('item da direita não achado: ' + dir);
  await pg.locator('.jg-col[data-lado="d"] .jg-par:not(:disabled)').nth(ri).click();
}
/* responde ERRADO de propósito (um jeito por tipo) e deixa o exercício pronto para o botão principal */
async function errarEx(pg, ex) {
  const tp = ex.tipo;
  if (tp === 'quiz') {
    const i = await pg.evaluate(e => { const alvo = [e.opcoes[0], ENIAC.plano(e.opcoes[0])]; return [...document.querySelectorAll('.jg-op .jg-ot')].findIndex(x => !alvo.includes(x.textContent)); }, ex);
    await pg.locator('.jg-op').nth(i).click();
  } else if (tp === 'digite') {
    await pg.locator('.jg-in').fill('zzz');
  } else if (tp === 'bug') {
    await pg.locator('.jg-cod-bug .jg-l').nth(ex.linhaErrada % ex.linhas.length).click();      /* outra linha */
  } else if (tp === 'monte') {
    for (const linha of ex.linhas.slice().reverse()) {
      const i = await indiceTexto(pg, '.jg-banco .jg-chip:not(:disabled)', linha);
      await pg.locator('.jg-banco .jg-chip:not(:disabled)').nth(i).click();
    }
  } else if (tp === 'lacuna') {
    for (let k = 0; k < ex.respostas.length; k++) {
      const i = await pg.evaluate(r => [...document.querySelectorAll('.jg-banco .jg-chip:not(:disabled)')].findIndex(x => x.textContent !== r), ex.respostas[k]);
      await pg.locator('.jg-banco .jg-chip:not(:disabled)').nth(i).click();
    }
  } else if (tp === 'pares') {
    await ligarPar(pg, ex.pares[0][0], ex.pares[1][1]);        /* uma ligação errada já conta como erro, mesmo ligando tudo certo depois */
    await dorme(750);                                          /* o destaque vermelho some sozinho */
    for (const p of ex.pares) await ligarPar(pg, p[0], p[1]);
  }
}

/* ---------- conferências de tela (a cada exercício) ---------- */
async function checarTela(pg, tela, rotulo) {
  const p = await pg.evaluate(a => {
    const out = [];
    const de = document.documentElement;
    if (de.scrollWidth > window.innerWidth + 1) out.push('rolagem para o lado (' + de.scrollWidth + ' > ' + window.innerWidth + ')');
    const txt = (document.querySelector('#view') || {}).innerText || '';
    if (/undefined|\[object /.test(txt)) out.push('texto com "undefined" ou "[object"');
    if (a.celular) {
      const peq = [];
      document.querySelectorAll('#view button, #view .jg-op, #view .jg-chip, #view .jg-par, #view .jg-cod-bug .jg-l, #view .jg-in').forEach(el => {
        if (el.disabled && !el.matches('#jg-acao')) return;
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) return;
        let w = r.width, h = r.height;
        ['::before', '::after'].forEach(pseudo => {                  /* área de toque ampliada por um pseudo-elemento posicionado em volta */
          const p = getComputedStyle(el, pseudo);
          if (p.content === 'none' || p.position !== 'absolute') return;
          const ex = v => Math.max(0, -(parseFloat(v) || 0));
          w = Math.max(w, r.width + ex(p.left) + ex(p.right)); h = Math.max(h, r.height + ex(p.top) + ex(p.bottom));
        });
        if (h < 43.5 || w < 43.5) peq.push((el.className || el.tagName).toString().split(' ')[0] + ' ' + Math.round(w) + 'x' + Math.round(h));
      });
      if (peq.length) out.push('alvo de toque menor que 44 px: ' + peq.slice(0, 3).join(', '));
    }
    return out;
  }, { celular: !!tela.celular });
  p.forEach(m => t(false, rotulo + ': ' + m));
}

/* lê a tela de resultado */
const lerResultado = pg => pg.evaluate(() => {
  const q = s => ((document.querySelector(s) || {}).textContent || '').trim();
  const est = document.querySelector('.jg-estrelas');
  return { xp: q('.jg-tile.xp b'), prec: q('.jg-tile.prec b'), vidas: q('.jg-tile.vid b'), estrelas: est ? est.getAttribute('aria-label') : '', nivel: q('.jg-nivel-t b'), novas: [...document.querySelectorAll('.jg-nova b')].map(x => x.textContent) };
});

/* ---------- joga uma lição inteira (a partir da mini-aula) ---------- */
/* o: errar(ex, tentativaGlobal, st) -> true para errar de propósito; gancho({momento, ...}); checar(tela, rotulo); aoDerrota(pg) -> true para seguir jogando */
async function jogarLicao(pg, o) {
  o = o || {};
  const r = { exercicios: 0, tentativas: 0, erros: 0, tipos: {}, derrota: false, resultado: null }, falhou = {};
  await esperarFase(pg, ['aula', 'ex']);                    /* "Refazer" e "Recomeçar" já entram direto nos exercícios */
  if ((await estado(pg)).fase === 'aula') {
    if (o.gancho) await o.gancho({ momento: 'aula' });
    await pg.locator('[data-act="jg-comecar"]').click();
    await esperarFase(pg, ['ex']);
  }
  for (let volta = 0; volta < 90; volta++) {
    const st = await estado(pg);
    if (st.fase === 'fim') break;
    if (st.fase !== 'ex') throw new Error('fase inesperada: ' + st.fase);
    const ex = st.ex;
    await esperarArea(pg);
    r.tipos[ex.tipo] = (r.tipos[ex.tipo] || 0) + 1;
    if (ex.tipo === 'digite' && (ex.resposta.length > 160 || [].concat(ex.aceitas || []).some(a => a.length > 160))) t(false, st.id + ': resposta do "digite" passa de 160 letras (o campo não deixa digitar)');
    if (o.checar) await o.checar(st);
    const errar = o.errar ? !!o.errar(ex, r.tentativas, st) : false;
    r.tentativas++;
    if (o.gancho) await o.gancho({ momento: 'ex', ex, st, errar });
    if (errar) await errarEx(pg, ex); else await resolverEx(pg, ex);
    if (o.gancho) await o.gancho({ momento: 'resp', ex, st, errar });
    await pg.locator('#jg-acao').click();
    await esperarFase(pg, ['fb']);
    const dep = await estado(pg);
    const fb = await pg.evaluate(() => { const f = document.querySelector('#jg-fb .jg-fbc'); return f ? { ok: f.classList.contains('ok'), txt: f.innerText, certa: !!f.querySelector('.jg-certa'), role: f.getAttribute('role') } : null; });
    if (!t(!!fb, st.id + ' #' + st.feitos + ': apareceu o painel de resposta')) throw new Error('sem painel de resposta');
    t(fb.ok === !errar, st.id + ' ' + ex.tipo + ': o painel diz ' + (fb.ok ? 'certo' : 'errado') + ' e deveria dizer ' + (errar ? 'errado' : 'certo'));
    t(fb.txt.replace(/\s+/g, ' ').trim().length > 25, st.id + ' ' + ex.tipo + ': o painel tem explicação');
    if (errar) {
      r.erros++; falhou[st.fila[0]] = true;
      t(dep.vidas === st.vidas - 1, st.id + ': errar tira 1 vida', dep.vidas + ' vs ' + st.vidas);
      t(dep.fila.length === st.fila.length && dep.fila[dep.fila.length - 1] === st.fila[0], st.id + ': o exercício errado vai para o fim da fila');
      t(fb.certa, st.id + ' ' + ex.tipo + ': mostra a resposta certa depois de errar');
    } else {
      t(dep.fila.length === st.fila.length - 1, st.id + ': acertar tira o exercício da fila');
      t(dep.xp - st.xp === (falhou[st.fila[0]] ? 5 : 10), st.id + ' ' + ex.tipo + ': XP do acerto é ' + (falhou[st.fila[0]] ? '5 (depois de errar)' : '10 (de primeira)'), String(dep.xp - st.xp));
    }
    if (o.gancho) await o.gancho({ momento: 'fb', ex, st, errar, ok: fb.ok });
    r.exercicios++;
    await pg.locator('#jg-acao').click();
    await pg.waitForFunction(() => { const s = ENIAC.jogador._s(); return !!document.querySelector('.jg-fundo') || (!!s && (s.fase === 'ex' || s.fase === 'fim')); });
    if (await pg.locator('.jg-fundo').count()) {
      if (o.gancho) await o.gancho({ momento: 'derrota' });
      r.derrota = true;
      if (o.aoDerrota && await o.aoDerrota(pg)) { await esperarFase(pg, ['ex']); Object.keys(falhou).forEach(k => delete falhou[k]); continue; }       /* recomeçar zera as tentativas */
      return r;
    }
  }
  await esperarFase(pg, ['fim']);
  await pg.waitForSelector('.jg-fim');
  r.resultado = await lerResultado(pg);
  if (o.gancho) await o.gancho({ momento: 'fim', resultado: r.resultado });
  return r;
}

/* =====================================================================================================================
   SUÍTES
   ===================================================================================================================== */
const nivelEsperado = xp => { let n = 1; while (50 * (n + 1) * n <= xp) n++; return n; };      /* XP total para chegar ao nível N = 50·N·(N−1) */

/* ---------- percurso: todas as lições, de primeira, na ordem ---------- */
async function suitePercurso(browser, srv, tela) {
  const parcial = OPC.rapido || tela.pequeno || OPC.licoes.length > 0;
  titulo('percurso · ' + tela.nome + ' ' + tela.w + 'x' + tela.h + (parcial ? ' (só algumas lições)' : ' (todas as lições)'));
  const c = await novoContexto(browser, srv, tela, 'dark');
  const pg = c.page;
  await abrirApp(c, '/jogos');
  const curso = await carregarCurso(pg);
  t(curso.length >= 4, 'o curso tem lições', String(curso.length));
  const unidades = [...new Set(curso.map(l => l.un))];
  let alvo = curso;
  if (OPC.licoes.length) alvo = curso.filter(l => OPC.licoes.includes(l.id));
  else if (OPC.rapido || tela.pequeno) alvo = unidades.map(u => curso.find(l => l.un === u));
  if (parcial) await pg.evaluate(() => ENIAC.est.setCfg('liberarTudo', true));          /* sem jogar as anteriores, a sequência não vale */
  await pg.waitForSelector('.jg-hero');

  if (!parcial) {
    const lib = await pg.evaluate(n => Array.from({ length: n }, (_, g) => ENIAC.est.liberada(g)), curso.length);
    t(lib[0] === true && lib.slice(1).every(x => x === false), 'no começo só a primeira lição está liberada');
    t(await pg.locator('.jg-no.livre').count() === 1, 'a trilha mostra uma lição disponível');
    t(await pg.locator('.jg-no.trancada').count() >= 1, 'a trilha mostra lições bloqueadas');
  }
  const total = curso.length;
  const menu = await pg.evaluate(() => { const b = [...document.querySelectorAll('[data-act="jogos"]')].find(x => /ENIAC/.test(x.textContent)); return b ? b.textContent.replace(/\s+/g, ' ').trim() : ''; });
  t(menu.includes('0/' + total) || parcial, 'o menu mostra 0/' + total + ' lições', menu);

  let xpEsperado = 0, feitas = 0, tempo = Date.now();
  for (let k = 0; k < alvo.length; k++) {
    const l = alvo[k];
    try {
      if (!parcial) t(await pg.evaluate(g => ENIAC.est.liberada(g), l.g), l.id + ' está liberada antes de jogar');
      const st0 = await estado(pg);
      if (!st0 || st0.id !== l.id) {
        if (k === 0 && !OPC.licoes.length) {
          await pg.locator('#view [data-act="jg-continuar"]').first().click();                 /* primeira: pelo botão Continuar da trilha */
          await esperarFase(pg, ['aula']);
          t(await pg.evaluate(() => location.hash) === '#/jogo/' + l.id, 'Continuar abre a primeira lição (#/jogo/' + l.id + ')');
        } else { await irPara(pg, '/jogo/' + l.id); await esperarFase(pg, ['aula']); }
      }
      const r = await jogarLicao(pg, {
        checar: st => checarTela(pg, tela, l.id + ' exercício ' + (st.feitos + 1)),
        gancho: async g => { if (g.momento === 'aula') await checarTela(pg, tela, l.id + ' mini-aula'); }
      });
      t(r.exercicios === l.n, l.id + ': jogou ' + l.n + ' exercícios', String(r.exercicios));
      const res = r.resultado;
      t(res.xp === '+' + 10 * l.n, l.id + ': ganhou ' + 10 * l.n + ' XP', res.xp);
      t(res.prec === '100%' && res.vidas === '5' && /^3 /.test(res.estrelas), l.id + ': 100%, 5 vidas, 3 estrelas', JSON.stringify(res));
      await checarTela(pg, tela, l.id + ' resultado');
      const dep = await pg.evaluate(a => ({ feita: ENIAC.est.feita(a.id), est: ENIAC.est.estrelas(a.id), xp: ENIAC.est.xpTotal(), prox: a.g + 1 < ENIAC.ordem().length ? ENIAC.est.liberada(a.g + 1) : null }), l);
      xpEsperado += 10 * l.n; feitas++;
      t(dep.feita && dep.est === 3, l.id + ': ficou concluída com 3 estrelas');
      t(dep.xp === xpEsperado, l.id + ': XP total = ' + xpEsperado, String(dep.xp));
      if (!parcial && dep.prox !== null) t(dep.prox === true, l.id + ': liberou a lição seguinte');
      /* a próxima: pelo botão "Próxima lição" quando é a seguinte da fila */
      const seg = alvo[k + 1];
      if (seg && seg.g === l.g + 1 && await pg.locator('[data-act="jg-proxima"]').count()) {
        await pg.locator('[data-act="jg-proxima"]').click();
        await esperarFase(pg, ['aula']);
        t((await estado(pg)).id === seg.id, 'Próxima lição leva para ' + seg.id);
      }
    } catch (e) {
      t(false, l.id + ': o percurso quebrou', String(e.message).split('\n')[0]);
      if (!parcial) { await pg.evaluate(() => ENIAC.est.setCfg('liberarTudo', true)); aviso('a partir daqui a ordem do desbloqueio não é mais conferida (liberarTudo ligado)'); }
      await irPara(pg, '/jogos').catch(() => {});
    }
  }
  console.log('    ' + feitas + ' lições jogadas em ' + Math.round((Date.now() - tempo) / 1000) + ' s');

  /* o saldo geral */
  const fim = await pg.evaluate(() => ({ xp: ENIAC.est.xpTotal(), n: ENIAC.est.nivelDe(ENIAC.est.xpTotal()).n, ct: ENIAC.est.contagem(), seq: ENIAC.est.seq().n, conq: ENIAC.est.listaConquistas().filter(c => c.data).map(c => c.t) }));
  t(fim.xp === xpEsperado, 'XP total no fim = ' + xpEsperado, String(fim.xp));
  t(fim.n === nivelEsperado(xpEsperado), 'nível para ' + xpEsperado + ' XP é ' + nivelEsperado(xpEsperado), String(fim.n));
  t(fim.ct.feitas === feitas, 'contagem de lições concluídas = ' + feitas, JSON.stringify(fim.ct));
  t(fim.seq === 1, 'sequência diária = 1 dia', String(fim.seq));
  t(fim.conq.length >= 2, 'ganhou conquistas (' + fim.conq.length + ')', fim.conq.join(', '));
  console.log('    conquistas: ' + fim.conq.join(' | '));
  if (!parcial) {
    t(fim.ct.feitas === total, 'todas as ' + total + ' lições concluídas');
    await irPara(pg, '/jogos'); await pg.waitForSelector('.jg-hero');
    t(await pg.locator('.jg-no.trancada').count() === 0, 'nenhuma lição bloqueada no fim');
  }
  /* depois de recarregar a página o progresso continua */
  await pg.reload({ waitUntil: 'load' });
  await abrirApp(c, '/jogos'); await carregarCurso(pg);
  const dep = await pg.evaluate(() => ({ xp: ENIAC.est.xpTotal(), ct: ENIAC.est.contagem(), seq: ENIAC.est.seq().n }));
  t(dep.xp === xpEsperado && dep.ct.feitas === feitas && dep.seq === 1, 'depois de recarregar o progresso continua igual', JSON.stringify(dep));
  const menu2 = await pg.evaluate(() => { const b = [...document.querySelectorAll('[data-act="jogos"]')].find(x => /ENIAC/.test(x.textContent)); return b ? b.textContent.replace(/\s+/g, ' ').trim() : ''; });
  t(menu2.includes(feitas + '/' + total), 'o menu mostra ' + feitas + '/' + total, menu2);
  semErrosNoConsole(c, 'percurso ' + tela.nome);
  await c.ctx.close();
}

/* ---------- erros: vidas, fila, estrelas, derrota, sair ---------- */
async function lerCurso(browser, srv) {
  const c = await novoContexto(browser, srv, TELAS[0] || { w: 390, h: 844 }, 'dark');
  await abrirApp(c, '/jogos');
  const curso = await carregarCurso(c.page);
  /* a lição com mais tipos de exercício diferentes (empate: a primeira) */
  const lido = await c.page.evaluate(async lista => {
    const out = {};
    for (const l of lista) { const x = await ENIAC.carregarLicao(l.id).catch(() => null); out[l.id] = x ? x.exercicios.map(e => e.tipo) : null; }
    return { out, problemas: ENIAC.problemas() };
  }, curso);
  await c.ctx.close();
  const tipos = lido.out;
  t(lido.problemas.length === 0, 'o motor aceitou todos os exercícios do curso', lido.problemas.slice(0, 3).join(' | '));
  curso.forEach(l => t(tipos[l.id] && tipos[l.id].length === l.n, l.id + ': o manifesto diz ' + l.n + ' exercícios e a lição tem ' + (tipos[l.id] ? tipos[l.id].length : 'nenhum')));
  let melhor = curso[0], n = -1;
  curso.forEach(l => { const q = new Set(tipos[l.id]).size; if (q > n) { n = q; melhor = l; } });
  return { curso, tipos, rica: melhor };
}
async function abrirLicao(c, id) {
  await abrirApp(c, '/jogos'); await carregarCurso(c.page);
  await c.page.evaluate(() => ENIAC.est.setCfg('liberarTudo', true));
  await irPara(c.page, '/jogo/' + id);
  await esperarFase(c.page, ['aula']);
}
async function suiteErros(browser, srv, tela, info) {
  titulo('erros · ' + tela.nome + ' (lição ' + info.rica.id + ', tipos: ' + [...new Set(info.tipos[info.rica.id])].join(', ') + ')');
  const L = info.rica, n = L.n, tiposDa = [...new Set(info.tipos[L.id])];
  /* E1: um erro no primeiro exercício -> 2 estrelas */
  let c = await novoContexto(browser, srv, tela, 'dark'); let pg = c.page;
  await abrirLicao(c, L.id);
  let r = await jogarLicao(pg, { errar: (ex, i) => i === 0 });
  t(r.erros === 1 && r.exercicios === n + 1, 'um erro: o exercício volta e a lição tem ' + (n + 1) + ' respostas', JSON.stringify([r.erros, r.exercicios]));
  t(r.resultado.xp === '+' + (10 * (n - 1) + 5), 'um erro: XP = ' + (10 * (n - 1) + 5) + ' (5 na segunda tentativa)', r.resultado.xp);
  t(/^2 /.test(r.resultado.estrelas) && r.resultado.vidas === '4', 'um erro: 2 estrelas e 4 vidas', JSON.stringify(r.resultado));
  t(r.resultado.prec === Math.round(100 * n / (n + 1)) + '%', 'um erro: acertos ' + Math.round(100 * n / (n + 1)) + '%', r.resultado.prec);
  t(await pg.evaluate(id => ENIAC.est.estrelas(id), L.id) === 2, 'um erro: ficou com 2 estrelas');
  /* "Refazer esta lição" não tira as estrelas que já tem, mesmo se errar mais */
  await pg.locator('[data-act="jg-refazer"]').click();
  await esperarFase(pg, ['ex']);
  const st = await estado(pg);
  t(st.vidas === 5 && st.feitos === 0, 'refazer: começa de novo com 5 vidas, direto nos exercícios', JSON.stringify([st.vidas, st.feitos]));
  r = await jogarLicao(pg, { errar: (ex, i) => i < 3 });
  t(/^1 /.test(r.resultado.estrelas), 'refazer com 3 erros mostra 1 estrela', r.resultado.estrelas);
  t(await pg.evaluate(id => ENIAC.est.estrelas(id), L.id) === 2, 'a melhor nota (2 estrelas) é mantida');
  semErrosNoConsole(c, 'erros E1 ' + tela.nome); await c.ctx.close();

  /* E2 e E3: erra o primeiro exemplar de cada tipo (3 tipos por vez) -> 1 estrela */
  for (let parte = 0; parte < 2; parte++) {
    const meus = tiposDa.slice(parte * 3, parte * 3 + 3);
    if (!meus.length) continue;
    c = await novoContexto(browser, srv, tela, 'dark'); pg = c.page;
    await abrirLicao(c, L.id);
    const jaErrou = {};
    r = await jogarLicao(pg, { errar: ex => { if (meus.includes(ex.tipo) && !jaErrou[ex.tipo]) { jaErrou[ex.tipo] = true; return true; } return false; } });
    t(r.erros === meus.length, 'errou um de cada tipo (' + meus.join(', ') + ')', String(r.erros));
    t(r.resultado.estrelas.startsWith(meus.length >= 3 ? '1 ' : '2 '), meus.length + ' erros dão ' + (meus.length >= 3 ? 1 : 2) + ' estrela(s)', r.resultado.estrelas);
    semErrosNoConsole(c, 'erros tipos ' + meus.join(',')); await c.ctx.close();
  }

  /* E4: acabam as vidas */
  c = await novoContexto(browser, srv, tela, 'dark'); pg = c.page;
  await abrirLicao(c, L.id);
  let derrotas = 0;
  r = await jogarLicao(pg, {
    errar: (ex, i) => derrotas === 0 && i < 5,
    aoDerrota: async p => {
      derrotas++;
      t(await p.locator('.jg-fundo .jg-janela').count() === 1 && /vidas/i.test(await p.locator('.jg-jt').innerText()), 'ao zerar as vidas aparece a janela "Suas vidas acabaram"');
      t(await p.locator('.jg-fundo .jg-robo').count() >= 1, 'a janela de derrota tem o robô');
      const em = await estado(p);
      t(em.vidas === 0, 'as vidas estão zeradas', String(em.vidas));
      await p.locator('.jg-fundo .btn', { hasText: 'Recomeçar' }).click();
      const dep = await estado(p);
      t(dep.vidas === 5 && dep.feitos === 0 && dep.fase === 'ex', 'recomeçar: 5 vidas, 0 feitos, direto nos exercícios', JSON.stringify([dep.vidas, dep.feitos, dep.fase]));
      t(await p.locator('.jg-fundo').count() === 0, 'a janela fechou');
      return true;
    }
  });
  t(derrotas === 1, 'houve uma derrota', String(derrotas));
  t(r.resultado && /^3 /.test(r.resultado.estrelas), 'depois de recomeçar, jogando certo: 3 estrelas', JSON.stringify(r.resultado));
  t(r.resultado && r.resultado.novas.some(x => /volta/i.test(x)), 'ganhou a conquista de recomeçar', JSON.stringify(r.resultado && r.resultado.novas));
  semErrosNoConsole(c, 'erros derrota ' + tela.nome); await c.ctx.close();

  /* E5: sair da lição (X, "Continuar a lição", "Sair da lição") e Voltar do navegador */
  c = await novoContexto(browser, srv, tela, 'dark'); pg = c.page;
  await abrirLicao(c, L.id);
  await pg.locator('[data-act="jg-sair"]').count();                            /* na mini-aula sai direto: sem pergunta */
  await pg.locator('[data-act="jg-comecar"]').click(); await esperarFase(pg, ['ex']);
  await pg.locator('[data-act="jg-resumo"]').click();
  t(await pg.locator('.jg-fundo').count() === 1 && /^Resumo:/.test(await pg.locator('.jg-jt').innerText()) && await pg.locator('.jg-fundo .jg-conceito').count() === 1, 'a lâmpada nos exercícios abre o resumo da lição');
  await pg.locator('.jg-fundo .btn', { hasText: 'Voltar para a lição' }).click();
  t(await pg.locator('.jg-fundo').count() === 0 && (await estado(pg)).fase === 'ex', 'fechar o resumo volta ao exercício sem perder nada');
  await pg.locator('[data-act="jg-sair"]').click();
  t(await pg.locator('.jg-fundo').count() === 1 && /Sair da lição/.test(await pg.locator('.jg-jt').innerText()), 'X no meio da lição pergunta se quer sair');
  await pg.locator('.jg-fundo .btn', { hasText: 'Continuar a lição' }).click();
  t(await pg.locator('.jg-fundo').count() === 0 && (await estado(pg)).fase === 'ex', 'Continuar a lição fecha a janela e segue');
  await pg.keyboard.press('Escape');
  t(await pg.locator('.jg-fundo').count() === 1, 'Esc no meio da lição pergunta se quer sair');
  await pg.keyboard.press('Escape');
  t(await pg.locator('.jg-fundo').count() === 0 && (await estado(pg)).fase === 'ex', 'Esc fecha a janela e a lição continua');
  await pg.goBack();                                                                 /* botão Voltar do navegador */
  await pg.waitForSelector('.jg-fundo');
  t(await pg.evaluate(() => location.hash) === '#/jogo/' + L.id, 'Voltar do navegador pergunta e fica na lição');
  await pg.locator('.jg-fundo .btn', { hasText: 'Continuar a lição' }).click();
  t((await estado(pg)).fase === 'ex', 'depois de continuar, a lição segue');
  await pg.locator('[data-act="jg-sair"]').click();
  await pg.locator('.jg-fundo .btn', { hasText: 'Sair da lição' }).click();
  await pg.waitForSelector('.jg-hero');
  t(await pg.evaluate(() => location.hash) === '#/jogos', 'sair leva para a trilha');
  t(await pg.evaluate(id => !ENIAC.est.feita(id) && ENIAC.est.xpTotal() === 0, L.id), 'sair no meio não conta XP nem conclui a lição');
  semErrosNoConsole(c, 'erros sair ' + tela.nome); await c.ctx.close();
}

/* ---------- teclado ---------- */
async function suiteTeclado(browser, srv) {
  const tela = TELAS.find(x => x.nome === 'desktop') || TELAS[0];
  titulo('teclado · ' + tela.nome);
  const c = await novoContexto(browser, srv, tela, 'dark'); const pg = c.page;
  await abrirApp(c, '/jogos'); const curso = await carregarCurso(pg);
  await irPara(pg, '/jogo/' + curso[0].id); await esperarFase(pg, ['aula']);
  await pg.keyboard.press('Enter');
  await esperarFase(pg, ['ex']);
  t(true, 'Enter na mini-aula começa os exercícios');
  /* resolve só com o teclado os exercícios que dá: quiz (1 a 4) e Enter */
  let usou = 0;
  for (let i = 0; i < 12; i++) {
    const st = await estado(pg);
    if (st.fase !== 'ex') break;
    await esperarArea(pg);
    if (st.ex.tipo === 'quiz') {
      const idx = await pg.evaluate(e => { const alvo = [e.opcoes[0], ENIAC.plano(e.opcoes[0])]; return [...document.querySelectorAll('.jg-op .jg-ot')].findIndex(x => alvo.includes(x.textContent)); }, st.ex);
      await pg.keyboard.press(String(idx + 1));
      t(await pg.evaluate(() => !!document.querySelector('.jg-op.sel') && !document.querySelector('#jg-acao').disabled), 'tecla ' + (idx + 1) + ' escolhe a opção e libera o botão');
      await pg.keyboard.press('Enter');
      await esperarFase(pg, ['fb']);
      t(await pg.locator('#jg-fb .jg-fbc.ok').count() === 1, 'Enter confere a resposta (certa)');
      await pg.keyboard.press('Enter');
      await pg.waitForFunction(() => { const s = ENIAC.jogador._s(); return s && (s.fase === 'ex' || s.fase === 'fim'); });
      usou++;
      if (usou >= 2) break;
    } else {
      await resolverEx(pg, st.ex);
      await pg.locator('#jg-acao').click(); await esperarFase(pg, ['fb']);
      await pg.locator('#jg-acao').click();
      await pg.waitForFunction(() => { const s = ENIAC.jogador._s(); return s && (s.fase === 'ex' || s.fase === 'fim'); });
    }
  }
  t(usou >= 1, 'o teclado resolveu quiz');
  /* foco preso na janela */
  await pg.keyboard.press('Escape');
  await pg.waitForSelector('.jg-fundo');
  const dentro = [];
  for (let i = 0; i < 5; i++) { await pg.keyboard.press('Tab'); dentro.push(await pg.evaluate(() => !!document.activeElement.closest('.jg-fundo'))); }
  t(dentro.every(Boolean), 'Tab fica preso dentro da janela', dentro.join(','));
  await pg.keyboard.press('Shift+Tab');
  t(await pg.evaluate(() => !!document.activeElement.closest('.jg-fundo')), 'Shift+Tab também');
  t(await pg.evaluate(() => document.getElementById('app').inert === true), 'o resto da página fica inerte enquanto a janela está aberta');
  await pg.keyboard.press('Escape');
  t(await pg.locator('.jg-fundo').count() === 0 && await pg.evaluate(() => document.getElementById('app').inert === false), 'Esc fecha a janela e devolve a página');
  t(await pg.evaluate(() => !!document.activeElement && document.activeElement !== document.body), 'o foco volta para algum controle depois de fechar a janela');
  semErrosNoConsole(c, 'teclado'); await c.ctx.close();
}

/* ---------- rotas e integração ---------- */
async function suiteRotas(browser, srv) {
  const tela = TELAS.find(x => x.celular) || TELAS[0];
  titulo('rotas e integração · ' + tela.nome);
  let c = await novoContexto(browser, srv, tela, 'dark'), pg = c.page;
  await abrirApp(c, '/jogos');
  const curso = await carregarCurso(pg);
  const [p1, p2] = curso;
  await pg.waitForSelector('.jg-hero');
  t((await pg.title()).includes('ENIAC'), 'o título da aba da trilha traz ENIAC', await pg.title());
  t(await pg.locator('#view .jg-hero svg.jg-robo').count() >= 1, 'a trilha mostra o robô');
  const menu = await pg.evaluate(() => { const b = [...document.querySelectorAll('[data-act="jogos"]')].find(x => /ENIAC/.test(x.textContent)); return b ? { txt: b.textContent.replace(/\s+/g, ' ').trim(), atual: b.getAttribute('aria-current') || b.className } : null; });
  t(!!menu && menu.txt.includes('0/' + curso.length), 'o menu lateral tem o item ENIAC com 0/' + curso.length, JSON.stringify(menu));
  /* lição bloqueada: pelo endereço e pelo nó da trilha */
  await irPara(pg, '/jogo/' + p2.id); await esperarFase(pg, ['bloqueada']);
  t(/ainda está bloqueada/.test(await pg.locator('.jg-estado').innerText()), 'lição bloqueada pelo endereço mostra aviso');
  t(await pg.locator('.jg-estado svg.jg-robo').count() === 1, 'o aviso tem o robô');
  await pg.locator('.jg-estado [data-act="jg-abrir"]').click(); await esperarFase(pg, ['aula']);
  t((await estado(pg)).id === p1.id, '"Ir para a lição liberada" abre a ' + p1.id);
  await irPara(pg, '/jogo/u99l99'); await pg.waitForSelector('.jg-estado');
  t(/Não encontrei/.test(await pg.locator('.jg-estado').innerText()), 'lição que não existe mostra "Não encontrei esta lição"');
  await irPara(pg, '/jogos'); await pg.waitForSelector('.jg-hero');
  await pg.locator('.jg-no.trancada').first().click({ force: true });          /* aria-disabled: o Playwright não clica sem force, a pessoa clica */
  await pg.waitForSelector('.toast');
  t(/Conclua a lição anterior/.test(await pg.locator('.toast').first().innerText()) && await pg.evaluate(() => location.hash) === '#/jogos', 'tocar numa lição bloqueada só avisa (toast)');
  /* painel: cartão e botão Continuar */
  await irPara(pg, '/'); await pg.waitForSelector('.jg-cta');
  const cartao = await pg.locator('.jg-cta').innerText();
  t(/ENIAC/.test(cartao) && /0 de \d+|lições|Começar/i.test(cartao), 'o painel tem o cartão do ENIAC', cartao.replace(/\s+/g, ' '));
  await pg.locator('.jg-cta [data-act="jg-continuar"]').click(); await esperarFase(pg, ['aula']);
  t(await pg.evaluate(() => location.hash) === '#/jogo/' + p1.id, 'o botão do cartão abre a primeira lição');
  await pg.goBack(); await pg.waitForSelector('.jg-cta');
  t(await pg.evaluate(() => location.hash) === '#/' || await pg.evaluate(() => location.hash) === '', 'Voltar (sem lição em andamento) volta ao painel sem perguntar');
  await pg.locator('.jg-cta a.jg-cta-l').click(); await pg.waitForSelector('.jg-hero');
  t(await pg.evaluate(() => location.hash) === '#/jogos', 'o cartão leva para #/jogos');
  /* recarregar no meio de uma lição volta para a mini-aula */
  await irPara(pg, '/jogo/' + p1.id); await esperarFase(pg, ['aula']);
  await pg.locator('[data-act="jg-comecar"]').click(); await esperarFase(pg, ['ex']);
  await pg.reload({ waitUntil: 'load' }); await abrirApp(c, '/jogo/' + p1.id); await esperarFase(pg, ['aula']);
  t(true, 'recarregar a página no meio da lição reabre a mini-aula');
  semErrosNoConsole(c, 'rotas'); await c.ctx.close();

  /* endereço antigo (jogos/) */
  c = await novoContexto(browser, srv, tela, 'dark'); pg = c.page;
  await pg.goto(c.url + 'jogos/', { waitUntil: 'load' });
  await pg.waitForURL(/#\/jogos$/, { timeout: 8000 });
  await pg.waitForSelector('.jg-hero');
  t(/\/#\/jogos$/.test(pg.url()) && !/\/jogos\/#/.test(pg.url()), 'jogos/ redireciona para o ENIAC dentro do app', pg.url());
  semErrosNoConsole(c, 'redirecionamento'); await c.ctx.close();

  /* sem o manifesto: estado de erro com robô e "Tentar de novo" */
  c = await novoContexto(browser, srv, tela, 'dark'); pg = c.page;
  await pg.route('**/jogos/curso/manifesto.js*', r => r.abort());
  await pg.goto(c.url + '#/jogos', { waitUntil: 'load' });
  await pg.waitForSelector('#view [data-act="jg-tentar-trilha"]', { timeout: 15000 });
  t(await pg.locator('#view svg.jg-robo').count() >= 1, 'sem o manifesto: a tela de erro tem o robô');
  t(await pg.evaluate(() => !document.querySelector('.jg-hero')), 'sem o manifesto: não finge que tem trilha');
  await pg.unroute('**/jogos/curso/manifesto.js*');
  await pg.locator('#view [data-act="jg-tentar-trilha"]').click();
  await pg.waitForSelector('.jg-hero', { timeout: 15000 });
  t(true, 'Tentar de novo traz a trilha quando a rede volta');
  semErrosNoConsole(c, 'manifesto ausente', /Failed to load resource|net::ERR/);
  /* sem o arquivo de uma unidade: a lição mostra "Não consegui carregar" e tenta de novo */
  await pg.route('**/jogos/curso/u01.js*', r => r.abort());
  await irPara(pg, '/jogo/' + p1.id);
  await pg.waitForSelector('[data-act="jg-tentar"]', { timeout: 15000 });
  t(/Não consegui carregar/.test(await pg.locator('.jg-estado').innerText()), 'sem o arquivo da unidade: "Não consegui carregar esta lição"');
  await pg.unroute('**/jogos/curso/u01.js*');
  await pg.locator('[data-act="jg-tentar"]').click();
  await esperarFase(pg, ['aula']);
  t(true, 'Tentar de novo abre a lição quando a rede volta');
  semErrosNoConsole(c, 'unidade ausente', /Failed to load resource|net::ERR/);
  await c.ctx.close();
}

/* ---------- ajustes, conquistas, apagar progresso ---------- */
async function suiteAjustes(browser, srv) {
  const tela = TELAS.find(x => x.celular) || TELAS[0];
  titulo('ajustes e conquistas · ' + tela.nome);
  const c = await novoContexto(browser, srv, tela, 'dark'), pg = c.page;
  await abrirApp(c, '/jogos');
  const curso = await carregarCurso(pg); const [p1, p2] = curso;
  await pg.waitForSelector('.jg-hero');
  await pg.locator('#view [data-act="jg-conquistas"]').first().click();
  await pg.waitForSelector('.jg-fundo');
  const nConq = await pg.locator('.jg-cq').count();
  t(nConq >= 20, 'há 20 conquistas ou mais', String(nConq));
  t(new RegExp('Conquistas · 0 de ' + nConq).test(await pg.locator('.jg-jt').innerText()), 'o título mostra 0 de ' + nConq);
  await pg.keyboard.press('Escape');
  t(await pg.locator('.jg-fundo').count() === 0 && await pg.evaluate(() => (document.activeElement.getAttribute('data-act') || '') === 'jg-conquistas'), 'Esc fecha a janela e o foco volta ao botão Conquistas');

  await pg.locator('#view [data-act="jg-config"]').first().click();
  await pg.waitForSelector('.jg-fundo #jg-sw');
  t(await pg.evaluate(() => document.activeElement.id === 'jg-sw'), 'ao abrir os ajustes o foco vai para o interruptor');
  t(await pg.locator('#jg-sw').getAttribute('aria-checked') === 'false', '"Liberar todas as lições" começa desligado');
  await pg.keyboard.press('Space');
  t(await pg.locator('#jg-sw').getAttribute('aria-checked') === 'true' && await pg.evaluate(() => ENIAC.est.cfg().liberarTudo === true), 'Espaço liga o interruptor e guarda o ajuste');
  await pg.keyboard.press('Escape');
  t(await pg.locator('.jg-no.trancada').count() === 0, 'com tudo liberado nenhuma lição fica bloqueada');
  await irPara(pg, '/jogo/' + p2.id); await esperarFase(pg, ['aula']);
  t((await estado(pg)).id === p2.id, 'com tudo liberado a ' + p2.id + ' abre direto');
  await pg.reload({ waitUntil: 'load' }); await abrirApp(c, '/jogos'); await carregarCurso(pg);
  t(await pg.evaluate(() => ENIAC.est.cfg().liberarTudo === true), 'o ajuste continua depois de recarregar');
  await pg.locator('#view [data-act="jg-config"]').first().click();
  await pg.waitForSelector('.jg-fundo #jg-sw');
  await pg.locator('#jg-sw').click();
  await pg.keyboard.press('Escape');
  t(await pg.locator('.jg-no.trancada').count() >= 1, 'desligando, as lições voltam a ficar bloqueadas em sequência');
  await irPara(pg, '/jogo/' + p2.id); await esperarFase(pg, ['bloqueada']);
  t(true, 'e a ' + p2.id + ' volta a mostrar o aviso de bloqueada');

  /* joga a primeira lição e depois apaga tudo */
  await irPara(pg, '/jogo/' + p1.id); await esperarFase(pg, ['aula']);
  const r = await jogarLicao(pg);
  t(!!r.resultado, 'jogou ' + p1.id);
  await irPara(pg, '/jogos'); await pg.waitForSelector('.jg-hero');
  t(await pg.evaluate(() => ENIAC.est.xpTotal() > 0), 'tem XP antes de apagar');
  await pg.locator('#view [data-act="jg-config"]').first().click();
  await pg.locator('.jg-fundo [data-act="jg-reiniciar"]').click();
  t(/Apagar o progresso/.test(await pg.locator('.jg-jt').innerText()), 'apagar pede confirmação');
  await pg.locator('.jg-fundo .jg-ja .btn', { hasText: 'Cancelar' }).click();
  t(/Ajustes do ENIAC/.test(await pg.locator('.jg-jt').innerText()) && await pg.evaluate(() => ENIAC.est.xpTotal() > 0), 'Cancelar volta aos ajustes e não apaga nada');
  await pg.locator('.jg-fundo [data-act="jg-reiniciar"]').click();
  await pg.locator('.jg-fundo .jg-ja .btn.perigo').click();
  await pg.waitForFunction(() => ENIAC.est.xpTotal() === 0);
  t(await pg.evaluate(() => ENIAC.est.contagem().feitas === 0 && ENIAC.est.seq().n === 0 && ENIAC.est.listaConquistas().every(x => !x.data)), 'confirmar apaga XP, lições, sequência e conquistas');
  t(await pg.locator('.jg-fundo').count() === 0, 'a janela fecha depois de apagar');
  await pg.reload({ waitUntil: 'load' }); await abrirApp(c, '/jogos'); await carregarCurso(pg);
  t(await pg.evaluate(() => ENIAC.est.xpTotal() === 0 && ENIAC.est.contagem().feitas === 0), 'depois de recarregar continua apagado');
  semErrosNoConsole(c, 'ajustes'); await c.ctx.close();
}

/* ---------- migração do Codivara ---------- */
const diaLocal = atras => { const x = new Date(); x.setDate(x.getDate() - atras); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); };
async function suiteMigracao(browser, srv) {
  const tela = TELAS.find(x => x.celular) || TELAS[0];
  titulo('migração do Codivara · ' + tela.nome);
  const LEG = 'codivara:progresso:v1';
  const legado = { xp: 120, sequencia: 3, ultimoDia: diaLocal(1), conquistas: { primeira: diaLocal(3) },
    licoes: { l1: { feita: true, vezes: 2, semErros: true, melhor: 100 }, l2: { feita: true, vezes: 1, semErros: false, melhor: 85 }, l3: { feita: true, vezes: 1, semErros: false, melhor: 60 }, l4: { feita: false, vezes: 0 } } };
  let c = await novoContexto(browser, srv, tela, 'dark', { sementes: { [LEG]: JSON.stringify(legado) } }), pg = c.page;
  await abrirApp(c, '/jogos'); await carregarCurso(pg);
  await pg.waitForSelector('.jg-hero');
  const ler = () => pg.evaluate(() => ({ f: ['u01l01', 'u01l02', 'u01l03', 'u01l04'].map(id => ENIAC.est.feita(id)), e: ['u01l01', 'u01l02', 'u01l03'].map(id => ENIAC.est.estrelas(id)), xp: ENIAC.est.xpTotal(), n: ENIAC.est.nivelDe(ENIAC.est.xpTotal()).n,
    seq: ENIAC.est.seq().n, c1: ENIAC.est.listaConquistas().filter(x => x.data).map(x => x.t), mig: STORE.pref().jogoMig, lib: ENIAC.est.liberada(3) && !ENIAC.est.liberada(4) }));
  let a = await ler();
  t(JSON.stringify(a.f) === '[true,true,true,false]', 'l1, l2 e l3 viraram u01l01, u01l02 e u01l03 concluídas (l4 não)', JSON.stringify(a.f));
  t(JSON.stringify(a.e) === '[3,2,1]', 'estrelas: sem erros = 3, melhor 85 = 2, melhor 60 = 1', JSON.stringify(a.e));
  t(a.xp === 120 && a.n === nivelEsperado(120), 'o XP do Codivara (120) foi trazido', JSON.stringify([a.xp, a.n]));
  t(a.seq === 3, 'a sequência de 3 dias foi trazida', String(a.seq));
  t(a.c1.length >= 1, 'a conquista de primeira lição foi trazida', a.c1.join(', '));
  t(a.mig === 1 && a.lib, 'marcou a migração como feita e a quarta lição é a próxima', JSON.stringify([a.mig, a.lib]));
  await pg.reload({ waitUntil: 'load' }); await abrirApp(c, '/jogos'); await carregarCurso(pg);
  let b = await ler();
  t(JSON.stringify(b) === JSON.stringify(a), 'recarregar não migra de novo (nada dobra)', JSON.stringify(b));
  /* com progresso do ENIAC já existente, o legado não entra */
  const dep = await pg.evaluate(LEG_ => {
    localStorage.setItem(LEG_, JSON.stringify({ xp: 999, licoes: { l4: { feita: true, vezes: 1, semErros: true, melhor: 100 } } }));
    delete STORE.pref().jogoMig;
    const r = ENIAC.est.migrar();
    return { r, xp: ENIAC.est.xpTotal(), l4: ENIAC.est.feita('u01l04'), mig: STORE.pref().jogoMig };
  }, LEG);
  t(dep.r === false && dep.xp === 120 && !dep.l4 && dep.mig === 1, 'se já existe progresso do ENIAC, o do Codivara não entra', JSON.stringify(dep));
  semErrosNoConsole(c, 'migração'); await c.ctx.close();

  /* dados quebrados ou vazios: sem erro e sem inventar progresso */
  for (const [rotulo, bruto] of [['JSON quebrado', '{nao-e-json'], ['objeto vazio', '{}'], ['valores absurdos', JSON.stringify({ xp: -5, sequencia: 99999, ultimoDia: 'ontem', licoes: { l1: { feita: 'sim', vezes: 'muitas' } } })]]) {
    c = await novoContexto(browser, srv, tela, 'dark', { sementes: { [LEG]: bruto } }); pg = c.page;
    await abrirApp(c, '/jogos'); await carregarCurso(pg); await pg.waitForSelector('.jg-hero');
    const z = await pg.evaluate(() => ({ xp: ENIAC.est.xpTotal(), f: ENIAC.est.contagem().feitas, seq: ENIAC.est.seq().n, mig: STORE.pref().jogoMig }));
    t(z.xp === 0 && z.f === 0 && z.mig === 1, 'legado "' + rotulo + '": sem progresso inventado e sem travar', JSON.stringify(z));
    semErrosNoConsole(c, 'migração ' + rotulo); await c.ctx.close();
  }
}

/* ---------- offline (service worker) ---------- */
async function suiteOffline(browser, srv) {
  const tela = TELAS.find(x => x.celular) || TELAS[0];
  titulo('offline · ' + tela.nome);
  const c = await novoContexto(browser, srv, tela, 'dark', { sw: true }), pg = c.page;
  await abrirApp(c, '/jogos');
  const curso = await carregarCurso(pg);
  const unidades = await pg.evaluate(() => ENIAC.unidades().map(u => u.arquivo));
  await pg.waitForFunction(() => !!navigator.serviceWorker && !!navigator.serviceWorker.controller, null, { timeout: 20000 });
  t(true, 'o service worker assumiu a página');
  /* o app abre todas as unidades em segundo plano, logo depois do manifesto: espera o cache ter todas */
  const guardadas = await esperarAte(() => pg.evaluate(async arq => {            /* (o waitForFunction não espera funções assíncronas: por isso o laço) */
    const ks = (await (await caches.open('dev-easy-v2')).keys()).map(k => k.url);
    return arq.every(a => ks.some(u => u.endsWith('/jogos/curso/' + a)));
  }, unidades), 40000);
  t(guardadas, 'todas as ' + unidades.length + ' unidades do curso ficaram guardadas no cache (sem "?v=")', unidades.join(','));
  if (!guardadas) { semErrosNoConsole(c, 'offline'); await c.ctx.close(); return; }
  const duplas = await pg.evaluate(async () => (await (await caches.open('dev-easy-v2')).keys()).map(k => k.url).filter(u => /\/jogos\/curso\/.*\?/.test(u)));
  t(duplas.length === 0, 'o cache não guarda versões antigas do curso com "?v="', duplas.join(', '));
  await dorme(500);
  c.falhas.length = 0;
  srv.offline = true;
  try {
    await pg.reload({ waitUntil: 'load' });
    await abrirApp(c, '/jogos'); await carregarCurso(pg);
    await pg.waitForSelector('.jg-hero');
    t(true, 'sem servidor: o app e a trilha abrem');
    const primeira = curso[0];
    await irPara(pg, '/jogo/' + primeira.id); await esperarFase(pg, ['aula']);
    const r = await jogarLicao(pg);
    t(!!r.resultado && /^3 /.test(r.resultado.estrelas), 'sem servidor: jogou ' + primeira.id + ' do começo ao fim');
    /* uma lição de cada unidade abre (todas as unidades estão guardadas) */
    await pg.evaluate(() => ENIAC.est.setCfg('liberarTudo', true));
    const unis = [...new Set(curso.map(l => l.un))];
    for (const u of unis) {
      const l = curso.find(x => x.un === u);
      await irPara(pg, '/jogos'); await pg.waitForSelector('.jg-hero');
      await irPara(pg, '/jogo/' + l.id); await esperarFase(pg, ['aula']);
      const ok = (await estado(pg)).total > 0;
      t(ok, 'sem servidor: a unidade ' + u + ' abre (' + l.id + ')');
    }
    await pg.goto(c.url + 'jogos/', { waitUntil: 'load' });
    await pg.waitForURL(/#\/jogos$/, { timeout: 8000 });
    await pg.waitForSelector('.jg-hero');
    t(true, 'sem servidor: o endereço antigo jogos/ também redireciona');
    const ruins = c.falhas.filter(f => /\/(jogos|js|css)\//.test(f) || /\s\/\s/.test(f));
    t(ruins.length === 0, 'sem servidor: nenhum arquivo do app ou do curso falhou', ruins.slice(0, 4).join(' | '));
  } finally { srv.offline = false; }
  semErrosNoConsole(c, 'offline', /Failed to load resource|net::ERR|Firebase|firebase|gstatic|googleapis/);
  await c.ctx.close();
}

/* ---------- acessibilidade ---------- */
const TAGS_AXE = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'];
const A11Y = { telas: 0, semAxe: !AXE || flag('--sem-axe'), contrasteManual: 0 };

/* roda dentro da página: nomes acessíveis, aria-live, janelas, barras de progresso, ids repetidos */
const auditoriaManual = esc => {
  const out = [];
  const raizes = esc.map(s => document.querySelector(s)).filter(Boolean);
  const vis = el => { const r = el.getBoundingClientRect(), cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'; };
  const nome = el => {
    const l = el.getAttribute('aria-label'); if (l && l.trim()) return l.trim();
    const lb = el.getAttribute('aria-labelledby');
    if (lb) { const tx = lb.split(/\s+/).map(i => (document.getElementById(i) || {}).textContent || '').join(' ').trim(); if (tx) return tx; }
    if (el.labels && el.labels.length) { const tx = [...el.labels].map(x => x.textContent).join(' ').trim(); if (tx) return tx; }
    const tx = (el.innerText || el.textContent || '').trim(); if (tx) return tx;
    return (el.getAttribute('title') || '').trim();
  };
  const desc = el => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (typeof el.className === 'string' && el.className ? '.' + el.className.split(' ')[0] : '');
  raizes.forEach(r => {
    r.querySelectorAll('button, a[href], input, select, textarea, [role="button"], [role="switch"], [role="radio"], [role="checkbox"], [role="tab"]').forEach(el => { if (vis(el) && !nome(el)) out.push('sem nome acessível: ' + desc(el)); });
    r.querySelectorAll('[role="progressbar"]').forEach(el => { if (!el.hasAttribute('aria-valuenow') || !nome(el)) out.push('barra de progresso sem valor ou sem nome: ' + desc(el)); });
    r.querySelectorAll('[role="img"]').forEach(el => { if (!el.getAttribute('aria-label') && !el.getAttribute('aria-labelledby')) out.push('role=img sem nome: ' + desc(el)); });
    r.querySelectorAll('svg:not([aria-hidden="true"])').forEach(el => { if (vis(el) && !el.closest('[role="img"]') && !el.getAttribute('aria-label') && !el.getAttribute('role') && !el.querySelector('title')) out.push('ícone svg sem aria-hidden e sem nome: ' + desc(el)); });
    r.querySelectorAll('[id]').forEach(el => { if (document.querySelectorAll('[id="' + el.id.replace(/"/g, '\\"') + '"]').length > 1) out.push('id repetido: ' + el.id); });
  });
  const fb = document.querySelector('#jg-fb');
  if (fb && !/polite|assertive/.test(fb.getAttribute('aria-live') || '')) out.push('o painel de resposta não tem aria-live');
  const jan = document.querySelector('.jg-fundo .jg-janela');
  if (jan && (jan.getAttribute('role') !== 'dialog' || jan.getAttribute('aria-modal') !== 'true' || !jan.getAttribute('aria-labelledby'))) out.push('janela sem role=dialog, aria-modal e aria-labelledby');
  if (raizes.some(r => r.id === 'view') && document.querySelectorAll('#view h1').length !== 1) out.push('a tela deveria ter um único h1 (tem ' + document.querySelectorAll('#view h1').length + ')');
  return [...new Set(out)];
};

/* roda dentro da página, só quando não há axe-core: contraste do texto contra o fundo (aproximado: ignora imagens de fundo) */
const contrasteManual = esc => {
  const out = [];
  const parse = s => {
    let m = s.match(/^rgba?\(([^)]+)\)$/);
    if (m) { const p = m[1].split(/[ ,\/]+/).filter(Boolean).map(parseFloat); return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1]; }
    m = s.match(/^color\(srgb ([^)]+)\)$/);
    if (m) { const p = m[1].split(/[ \/]+/).filter(Boolean).map(parseFloat); return [p[0] * 255, p[1] * 255, p[2] * 255, p.length > 3 ? p[3] : 1]; }
    return null;
  };
  const sobre = (f, b) => [f[0] * f[3] + b[0] * (1 - f[3]), f[1] * f[3] + b[1] * (1 - f[3]), f[2] * f[3] + b[2] * (1 - f[3]), 1];
  const lum = c => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
  const fundo = el => {
    const camadas = [];
    for (let e = el; e; e = e.parentElement) { const c = parse(getComputedStyle(e).backgroundColor); if (c && c[3] > 0) { camadas.push(c); if (c[3] >= 1) break; } }
    let base = camadas.length && camadas[camadas.length - 1][3] >= 1 ? camadas.pop() : [255, 255, 255, 1];
    while (camadas.length) base = sobre(camadas.pop(), base);
    return base;
  };
  esc.map(s => document.querySelector(s)).filter(Boolean).forEach(raiz => {
    const it = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT);
    const vistos = new Set();
    for (let n = it.nextNode(); n; n = it.nextNode()) {
      const el = n.parentElement;
      if (!el || vistos.has(el) || !n.textContent.trim()) continue;
      vistos.add(el);
      const cs = getComputedStyle(el), r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0 || cs.visibility === 'hidden' || el.closest('[disabled], [hidden], .sr-so, .jg-sr')) continue;
      const fg = parse(cs.color); if (!fg || fg[3] === 0) continue;               /* texto transparente = título em degradê (as cores das pontas são confirmadas à parte) */
      const bg = fundo(el), cor = sobre([fg[0], fg[1], fg[2], fg[3]], bg);
      const l1 = lum(cor), l2 = lum(bg), razao = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      const px = parseFloat(cs.fontSize), grande = px >= 24 || (px >= 18.66 && parseInt(cs.fontWeight, 10) >= 700);
      if (razao < (grande ? 3 : 4.5)) out.push(el.tagName.toLowerCase() + (typeof el.className === 'string' && el.className ? '.' + el.className.split(' ')[0] : '') + ' "' + n.textContent.trim().slice(0, 24) + '" ' + razao.toFixed(2) + ':1');
    }
  });
  return out;
};

/* foco visível: ao focar com o teclado cada controle tem de mudar de aparência (ele ou a caixa dele) */
const focoVisivel = esc => {
  const out = [];
  const snap = x => { const c = getComputedStyle(x); return [c.outlineStyle, c.outlineWidth, c.outlineColor, c.boxShadow, c.borderTopColor, c.backgroundColor].join('|'); };
  const lista = [];
  esc.forEach(s => { const r = document.querySelector(s); if (r) r.querySelectorAll('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"]), [role="button"], [role="switch"]').forEach(e => lista.push(e)); });
  lista.slice(0, 40).forEach(el => {
    if (el.disabled) return;
    const pai = el.closest('label, .jg-op, .jg-par, .jg-chip, .jg-l'), usaPai = pai && pai !== el;
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    const a1 = snap(el), a2 = usaPai ? snap(pai) : null;
    try { el.focus({ preventScroll: true }); } catch (e) { return; }
    if (document.activeElement !== el) return;
    if (snap(el) === a1 && (!usaPai || snap(pai) === a2)) out.push(el.tagName.toLowerCase() + (typeof el.className === 'string' && el.className ? '.' + el.className.split(' ')[0] : ''));
    el.blur();
  });
  return [...new Set(out)];
};

async function auditar(pg, rotulo, escopo) {
  if (!(await pg.evaluate(esc => esc.some(s => !!document.querySelector(s)), escopo))) { t(false, 'a11y · ' + rotulo + ': a tela para auditar não existe (' + escopo.join(',') + ')'); return; }
  A11Y.telas++;
  (await pg.evaluate(auditoriaManual, escopo)).forEach(m => t(false, 'a11y · ' + rotulo + ': ' + m));
  await pg.keyboard.press('Tab').catch(() => {});                  /* liga a "modalidade de teclado" para o :focus-visible */
  (await pg.evaluate(focoVisivel, escopo)).forEach(m => t(false, 'a11y · ' + rotulo + ': sem foco visível em ' + m));
  if (!A11Y.semAxe) {
    if (!(await pg.evaluate(() => typeof window.axe !== 'undefined'))) await pg.addScriptTag({ path: AXE });
    const v = await pg.evaluate(async a => {
      const r = await axe.run({ include: a.esc.map(s => [s]) }, { runOnly: { type: 'tag', values: a.tags }, rules: { region: { enabled: false } }, resultTypes: ['violations'] });
      return r.violations.map(x => ({ id: x.id, impact: x.impact, help: x.help, n: x.nodes.length, alvo: x.nodes.slice(0, 2).map(n => n.target.join(' ') + ' :: ' + ((n.any[0] || n.all[0] || n.none[0] || {}).message || '').slice(0, 140)) }));
    }, { esc: escopo, tags: TAGS_AXE });
    v.forEach(x => {
      const msg = 'axe ' + x.id + ' (' + x.impact + '): ' + x.help + ' · ' + x.n + ' nó(s) · ' + x.alvo.join(' | ');
      if (x.impact === 'critical' || x.impact === 'serious') t(false, 'a11y · ' + rotulo + ': ' + msg); else aviso(rotulo + ': ' + msg);
    });
  }
  /* contraste pelo script: no lugar do axe (se não achou) ou a mais (o axe desiste de textos sobre fundo em degradê, e o script confere esses) */
  A11Y.contrasteManual++;
  (await pg.evaluate(contrasteManual, escopo)).slice(0, 6).forEach(m => t(false, 'a11y · ' + rotulo + ': contraste baixo em ' + m));
}

async function suiteA11y(browser, srv, info) {
  titulo('acessibilidade · ' + (A11Y.semAxe ? 'conferências próprias (sem axe-core)' : 'axe-core + conferências próprias'));
  const L = info.rica;
  for (const tela of PRINCIPAIS) for (const tema of ['dark', 'light']) {
    const rot = tela.nome + '/' + tema;
    const c = await novoContexto(browser, srv, tela, tema), pg = c.page;
    await abrirApp(c, '/jogos'); await carregarCurso(pg); await pg.waitForSelector('.jg-hero');
    await auditar(pg, rot + ' trilha', ['#view']);
    await pg.locator('#view [data-act="jg-conquistas"]').first().click(); await pg.waitForSelector('.jg-fundo'); await dorme(450);
    await auditar(pg, rot + ' janela de conquistas', ['.jg-fundo']); await pg.keyboard.press('Escape');
    await pg.locator('#view [data-act="jg-config"]').first().click(); await pg.waitForSelector('.jg-fundo'); await dorme(450);
    await auditar(pg, rot + ' janela de ajustes', ['.jg-fundo']); await pg.keyboard.press('Escape');
    await pg.evaluate(() => ENIAC.est.setCfg('liberarTudo', true));
    await abrirDoZero(pg, L.id);
    const visto = {}, errou = {};
    await jogarLicao(pg, {
      errar: ex => { if ((ex.tipo === 'quiz' || ex.tipo === 'bug') && !errou[ex.tipo]) { errou[ex.tipo] = true; return true; } return false; },
      gancho: async g => {
        if (g.momento === 'aula') { await dorme(450); await auditar(pg, rot + ' mini-aula', ['#view']); }
        else if (g.momento === 'ex' && !visto['ex' + g.ex.tipo]) { visto['ex' + g.ex.tipo] = 1; await dorme(450); await auditar(pg, rot + ' exercício ' + g.ex.tipo, ['#view']); }
        else if (g.momento === 'fb' && !visto['fb' + g.ok + g.ex.tipo]) { visto['fb' + g.ok + g.ex.tipo] = 1; await dorme(600); await auditar(pg, rot + ' resposta ' + (g.ok ? 'certa' : 'errada') + ' ' + g.ex.tipo, ['#view']); }
        else if (g.momento === 'fim') { await dorme(1000); await auditar(pg, rot + ' resultado', ['#view']); }
      }
    });
    /* janela de sair e de vidas */
    await abrirDoZero(pg, L.id);
    await pg.locator('[data-act="jg-comecar"]').click(); await esperarFase(pg, ['ex']);
    await pg.locator('[data-act="jg-sair"]').click(); await pg.waitForSelector('.jg-fundo'); await dorme(450);
    await auditar(pg, rot + ' janela de sair', ['.jg-fundo']);
    await pg.keyboard.press('Escape');
    await pg.locator('[data-act="jg-resumo"]').click(); await pg.waitForSelector('.jg-fundo'); await dorme(450);
    await auditar(pg, rot + ' janela de resumo', ['.jg-fundo']);
    await pg.keyboard.press('Escape');
    await jogarLicao(pg, {}).catch(() => {});
    semErrosNoConsole(c, 'a11y ' + rot);
    await c.ctx.close();
  }
  /* "reduzir movimento": sem confete e sem animação */
  const tela = PRINCIPAIS[0];
  const c = await novoContexto(browser, srv, tela, 'dark', { reduzir: true }), pg = c.page;
  await abrirApp(c, '/jogos'); await carregarCurso(pg);
  await irPara(pg, '/jogo/' + info.curso[0].id); await esperarFase(pg, ['aula']);
  await jogarLicao(pg, {});
  await dorme(800);
  const mov = await pg.evaluate(() => {
    const seg = v => { const m = String(v).split(',').map(s => parseFloat(s) * (/ms$/.test(s.trim()) ? 0.001 : 1)); return Math.max.apply(null, m.concat([0])); };
    let max = 0, onde = '';
    document.querySelectorAll('#view *, #view *::before').forEach(el => { const cs = getComputedStyle(el); const d = Math.max(seg(cs.animationDuration), seg(cs.transitionDuration)); if (d > max) { max = d; onde = el.tagName + '.' + (el.className && el.className.baseVal === undefined ? el.className : ''); } });
    return { confete: document.querySelectorAll('#jg-confete *').length, max, onde, reduz: matchMedia('(prefers-reduced-motion: reduce)').matches };
  });
  t(mov.reduz, 'o navegador de teste está com "reduzir movimento"');
  t(mov.confete === 0, '"reduzir movimento": sem confete', String(mov.confete));
  t(mov.max <= 0.01, '"reduzir movimento": nenhuma animação ou transição passa de 10 ms', mov.max + 's em ' + mov.onde);
  semErrosNoConsole(c, 'reduzir movimento'); await c.ctx.close();
  console.log('    telas auditadas: ' + A11Y.telas + (A11Y.semAxe ? ' (sem axe-core: só as conferências próprias, contraste incluído)' : ' (axe-core e conferências próprias)'));
}

/* ---------- capturas de tela ---------- */
async function suiteFotos(browser, srv, info) {
  const pasta = path.resolve(OPC.fotos);
  fs.mkdirSync(pasta, { recursive: true });
  titulo('capturas de tela em ' + pasta);
  const L = info.rica;
  for (const tela of PRINCIPAIS) for (const tema of ['dark', 'light']) {
    const leve = tema === 'light';
    const c = await novoContexto(browser, srv, tela, tema), pg = c.page;
    let n = 0;
    const foto = async (nome, o) => { n++; await pg.screenshot(Object.assign({ path: path.join(pasta, [tela.nome, tema, String(n).padStart(2, '0'), fotoNome(nome)].join('-') + '.png') }, o || {})); };
    await abrirApp(c, '/jogos'); await carregarCurso(pg); await pg.waitForSelector('.jg-hero');
    await dorme(500);
    await foto('trilha-inicio'); if (!leve) await foto('trilha-inicio-completa', { fullPage: true });
    if (!leve) {
      await pg.locator('#view [data-act="jg-conquistas"]').first().click(); await pg.waitForSelector('.jg-fundo'); await dorme(350); await foto('janela-conquistas'); await pg.keyboard.press('Escape');
      await pg.locator('#view [data-act="jg-config"]').first().click(); await pg.waitForSelector('.jg-fundo'); await dorme(350); await foto('janela-ajustes'); await pg.keyboard.press('Escape');
    }
    await pg.evaluate(() => ENIAC.est.setCfg('liberarTudo', true));
    await abrirDoZero(pg, L.id); await dorme(400);
    const visto = {}, errou = {};
    await jogarLicao(pg, {
      errar: ex => { if (!leve && (ex.tipo === 'quiz' || ex.tipo === 'bug' || ex.tipo === 'pares') && !errou[ex.tipo]) { errou[ex.tipo] = true; return true; } return false; },
      gancho: async g => {
        if (g.momento === 'aula') { await foto('mini-aula'); if (!leve) await foto('mini-aula-completa', { fullPage: true }); }
        else if (g.momento === 'ex' && !visto['ex' + g.ex.tipo] && !(leve && g.ex.tipo !== 'quiz' && g.ex.tipo !== 'bug')) { visto['ex' + g.ex.tipo] = 1; await dorme(250); await foto('exercicio-' + g.ex.tipo); }
        else if (g.momento === 'resp' && visto['ex' + g.ex.tipo] === 1 && !leve) { visto['ex' + g.ex.tipo] = 2; await foto('exercicio-' + g.ex.tipo + '-respondido'); }
        else if (g.momento === 'fb' && !visto['fb' + g.ok + g.ex.tipo] && !(leve && g.ex.tipo !== 'quiz')) { visto['fb' + g.ok + g.ex.tipo] = 1; await dorme(500); await foto('resposta-' + (g.ok ? 'certa' : 'errada') + '-' + g.ex.tipo); }
        else if (g.momento === 'fim') { await dorme(1200); await foto('resultado'); await foto('resultado-completo', { fullPage: true }); }
      }
    });
    if (!leve) {
      /* janela de sair e janela das vidas */
      await abrirDoZero(pg, L.id);
      await pg.locator('[data-act="jg-comecar"]').click(); await esperarFase(pg, ['ex']);
      await pg.locator('[data-act="jg-sair"]').click(); await pg.waitForSelector('.jg-fundo'); await dorme(350); await foto('janela-sair'); await pg.keyboard.press('Escape');
      let erros = 0;
      await jogarLicao(pg, { errar: () => erros++ < 5, gancho: async g => { if (g.momento === 'derrota') { await dorme(450); await foto('janela-sem-vidas'); } }, aoDerrota: async p => { await p.locator('.jg-fundo .btn', { hasText: 'Recomeçar' }).click(); return true; } });
    }
    /* trilha com progresso: algumas lições com estrelas variadas */
    await pg.evaluate(async () => {
      const ord = ENIAC.ordem();
      [[0, 10], [2, 10], [0, 10], [1, 10], [0, 10]].forEach((x, i) => { if (ord[i]) ENIAC.est.registrar(ord[i], { erros: x[0], acertos: x[1], respostas: x[1] + x[0], xp: 10 * x[1] - 5 * x[0], vidas: 5 - x[0], reinicios: 0 }); });
    });
    await pg.evaluate(() => ENIAC.est.setCfg('liberarTudo', false));
    await irPara(pg, '/jogos'); await pg.waitForSelector('.jg-hero'); await dorme(500);
    await foto('trilha-progresso'); if (!leve) await foto('trilha-progresso-completa', { fullPage: true });
    await irPara(pg, '/'); await pg.waitForSelector('.jg-cta'); await dorme(500);
    await pg.locator('.jg-cta').scrollIntoViewIfNeeded(); await foto('painel-cartao');
    semErrosNoConsole(c, 'fotos ' + tela.nome + '/' + tema);
    console.log('    ' + n + ' capturas: ' + tela.nome + ' ' + tema);
    await c.ctx.close();
  }
}

/* ---------- principal ---------- */
(async () => {
  const pw = carregarPlaywright();
  const srv = await iniciarServidor();
  console.log('Servidor de teste em ' + srv.url);
  console.log('Suítes: ' + SUITES.join(', ') + ' | telas: ' + TELAS.map(x => x.nome).join(', ') + ' | axe-core: ' + (AXE && !flag('--sem-axe') ? AXE : 'não (só as conferências próprias)'));
  const inicio = Date.now();
  const browser = await pw.chromium.launch({ headless: !OPC.visivel });
  try {
    let info = null;
    if (quer('erros') || quer('a11y') || quer('fotos')) {
      info = await lerCurso(browser, srv);
      console.log('Curso: ' + info.curso.length + ' lições em ' + new Set(info.curso.map(l => l.un)).size + ' unidades. Lição usada nos testes de erro e acessibilidade: ' + info.rica.id);
    }
    if (quer('percurso')) for (const tela of TELAS) await suitePercurso(browser, srv, tela);
    if (quer('erros')) for (const tela of PRINCIPAIS) await suiteErros(browser, srv, tela, info);
    if (quer('teclado')) await suiteTeclado(browser, srv);
    if (quer('rotas')) await suiteRotas(browser, srv);
    if (quer('ajustes')) await suiteAjustes(browser, srv);
    if (quer('migracao')) await suiteMigracao(browser, srv);
    if (quer('offline')) await suiteOffline(browser, srv);
    if (quer('a11y')) await suiteA11y(browser, srv, info);
    if (quer('fotos')) await suiteFotos(browser, srv, info);
  } catch (e) {
    t(false, 'o teste quebrou', (e && e.stack) || String(e));
  }
  await browser.close().catch(() => {});
  srv.fechar();
  console.log('\n====================================================');
  console.log(R.ok + ' conferências ok, ' + R.falhas.length + ' falhas, ' + R.avisos.length + ' avisos. Tempo: ' + Math.round((Date.now() - inicio) / 1000) + ' s');
  if (R.falhas.length) { console.log('\nFALHAS:'); R.falhas.forEach(f => console.log(' - ' + f)); }
  if (R.avisos.length) { console.log('\nAVISOS (não reprovam):'); [...new Set(R.avisos)].slice(0, 30).forEach(f => console.log(' - ' + f)); }
  process.exit(R.falhas.length ? 1 : 0);
})();
