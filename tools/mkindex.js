#!/usr/bin/env node
/* Atualiza, no index.html, a lista de arquivos de js/ (em ordem alfabética) e, no sw.js, a lista de arquivos guardados para funcionar sem internet
   (inclui css/jogo.css e o manifesto do curso do ENIAC; as unidades do curso, jogos/curso/uNN.js, o sw.js guarda quando são abertas).
   Rode depois de criar, apagar ou renomear qualquer arquivo em js/ (ou ao mexer na lista de CSS):   node tools/mkindex.js */
const fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '..');
const js = fs.readdirSync(path.join(root, 'js')).filter(f => f.endsWith('.js')).sort();
let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const tags = js.map(f => `<script src="js/${f}"></script>`).join('\n');
html = html.replace(/<!--scripts:start-->[\s\S]*?<!--scripts:end-->/, `<!--scripts:start-->\n${tags}\n<!--scripts:end-->`);
fs.writeFileSync(path.join(root, 'index.html'), html);
const swp = path.join(root, 'sw.js');
if (fs.existsSync(swp)) {
  const has = p => fs.existsSync(path.join(root, p));
  const shell = ['./', 'index.html', 'manifest.webmanifest', 'firebase-config.js', 'css/fonts.css', 'css/style.css', 'css/dash.css', 'css/jogo.css', ...fs.readdirSync(path.join(root, 'fonts')).filter(f => f.endsWith('.woff2')).map(f => 'fonts/' + f), 'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', ...(has('jogos/index.html') ? ['jogos/', 'jogos/index.html'] : []), ...(has('jogos/curso/manifesto.js') ? ['jogos/curso/manifesto.js'] : []), ...js.map(f => 'js/' + f)];
  let sw = fs.readFileSync(swp, 'utf8');
  sw = sw.replace(/\/\*shell:start\*\/[\s\S]*?\/\*shell:end\*\//, `/*shell:start*/${JSON.stringify(shell)}/*shell:end*/`);
  fs.writeFileSync(swp, sw);
}
console.log(js.length + ' arquivos de js/ listados no index.html' + (fs.existsSync(swp) ? ' e no sw.js' : ''));
