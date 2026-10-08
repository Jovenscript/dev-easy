#!/usr/bin/env node
/* Exporta o texto falado de cada ficha, já com as regras de pronúncia, em partes (para gerar áudio com vozes neurais).
   uso (na raiz do projeto):  node tools/audio/spoken-json.js tools/audio/spoken.json */
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.resolve(__dirname, '..', '..');
const out = process.argv[2] || path.join(__dirname, 'spoken.json');
const js = path.join(root, 'js');
const ctx = vm.createContext({ console });
/* só os arquivos que são dados e peças soltas (sem tela): os de 19 a 27 e o 99 mexem na página e ficam de fora */
const pular = /^(19|2\d|99)-/;
const files = fs.readdirSync(js).filter(f => f.endsWith('.js') && !pular.test(f)).sort();
vm.runInContext(files.map(f => fs.readFileSync(path.join(js, f), 'utf8')).join('\n;\n'), ctx);
/* regras de pronúncia e divisão em frases vêm do 20-core.js (só o trecho entre PRONW e TTS) */
const core = fs.readFileSync(path.join(js, '20-core.js'), 'utf8');
const i = core.indexOf('var PRONW'), j = core.indexOf('var TTS=');
if (i < 0 || j < 0) throw new Error('não achei o trecho de pronúncia em js/20-core.js');
vm.runInContext("var plain=function(s){return String(s).replace(/\\*\\*/g,'').replace(/`/g,'')};\n" + core.slice(i, j), ctx);
const fn = vm.runInContext('(function(x){return {id:x.id,cat:x.cat,segs:roteiro(x),full:say(speechText(x))}})', ctx);
const all = vm.runInContext('DATA', ctx).map(fn);
fs.writeFileSync(out, JSON.stringify(all, null, 1));
console.log(all.length + ' fichas; ' + all.reduce((a, x) => a + x.full.length, 0) + ' caracteres no total');
