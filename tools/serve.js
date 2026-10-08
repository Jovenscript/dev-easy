#!/usr/bin/env node
/* Servidor local simples para abrir o DEV EASY sem instalar nada além do Node.
   Uso:  node tools/serve.js        (abre em http://localhost:5500; só este computador enxerga. Para a rede local: HOST=0.0.0.0 node tools/serve.js)
   Ele aceita "Range", que o navegador usa para tocar e avançar o áudio. */
const http = require('http'), fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '..');
const port = +process.env.PORT || +process.argv[2] || 5500;
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png', '.mp3': 'audio/mpeg', '.ico': 'image/x-icon', '.md': 'text/plain; charset=utf-8' };
http.createServer((req, res) => {
  let p; try { p = decodeURIComponent(req.url.split('?')[0]); } catch (e) { res.writeHead(400); return res.end('endereço inválido'); }
  if (p.endsWith('/')) p += 'index.html';
  const file = path.normalize(path.join(root, p));
  if (file !== root && !file.startsWith(root + path.sep)) { res.writeHead(403); return res.end('proibido'); }
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) { res.writeHead(404); return res.end('não achei ' + p); }
    const type = types[path.extname(file).toLowerCase()] || 'application/octet-stream';
    const base = { 'content-type': type, 'accept-ranges': 'bytes', 'cache-control': 'no-cache' };
    const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
    if (m && (m[1] || m[2])) {
      let a = m[1] ? +m[1] : Math.max(0, st.size - +m[2]), b = m[1] && m[2] ? Math.min(+m[2], st.size - 1) : st.size - 1;
      if (a > b || a >= st.size) { res.writeHead(416, { 'content-range': 'bytes */' + st.size }); return res.end(); }
      res.writeHead(206, { ...base, 'content-range': `bytes ${a}-${b}/${st.size}`, 'content-length': b - a + 1 });
      return req.method === 'HEAD' ? res.end() : fs.createReadStream(file, { start: a, end: b }).pipe(res);
    }
    res.writeHead(200, { ...base, 'content-length': st.size });
    req.method === 'HEAD' ? res.end() : fs.createReadStream(file).pipe(res);
  });
}).listen(port, process.env.HOST || '127.0.0.1', () => console.log('DEV EASY em http://localhost:' + port + '  (Ctrl+C para parar)'));
