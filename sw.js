/* DEV EASY: depois da primeira visita o guia abre mesmo sem internet.
   Regra: tenta a internet primeiro (assim uma atualização aparece na hora) e, se estiver sem sinal ou lento (mais de 4 s), usa a cópia guardada.
   O áudio gravado (150 MB) não é guardado aqui: toca com internet; sem internet o app usa a voz do aparelho.
   A lista abaixo é gerada por:  node tools/mkindex.js   (não precisa editar à mão). */
const V = 'dev-easy-v1';
const SHELL = /*shell:start*/["./","index.html","manifest.webmanifest","firebase-config.js","css/fonts.css","css/style.css","css/dash.css","fonts/barlow-condensed-500.woff2","fonts/barlow-condensed-600.woff2","fonts/barlow-condensed-700.woff2","fonts/ibm-plex-mono-400.woff2","fonts/ibm-plex-mono-500.woff2","fonts/ibm-plex-sans-400-italic.woff2","fonts/ibm-plex-sans-400.woff2","fonts/ibm-plex-sans-500.woff2","fonts/ibm-plex-sans-600.woff2","icons/icon.svg","icons/icon-192.png","icons/icon-512.png","js/00-prelude.js","js/05-pron.js","js/05-pron2.js","js/10-widgets.js","js/12-widgets2.js","js/13-widgets3.js","js/14-widgets4.js","js/14-widgets5.js","js/14-widgets6.js","js/14-widgets7.js","js/14-widgets8.js","js/14-widgets9.js","js/14-widgetsa.js","js/14-widgetsb.js","js/14-widgetsc.js","js/15-frames.js","js/16-frames2.js","js/16-frames3.js","js/16-frames4.js","js/18-audiomap.js","js/19-store.js","js/20-core.js","js/21-voice.js","js/22-views.js","js/23-shell.js","js/24-dash.js","js/25-notes.js","js/26-conta.js","js/27-sync.js","js/28-gate.js","js/40-base.js","js/41-front.js","js/42-lang.js","js/43-back.js","js/44-ops.js","js/45-dados.js","js/46-dados2.js","js/47-seg.js","js/48-seg2.js","js/49-seg3.js","js/50-seg4.js","js/51-ia.js","js/52-ia2.js","js/53-ia3.js","js/54-ia4.js","js/55-ia5.js","js/56-ia6.js","js/60-ind.js","js/61-ind2.js","js/62-ind3.js","js/63-ind4.js","js/64-ind5.js","js/80-trails.js","js/99-boot.js"]/*shell:end*/;

self.addEventListener('install', e => {
  /* cada arquivo é guardado separado: se um falhar, os outros continuam valendo */
  e.waitUntil(caches.open(V).then(c => Promise.all(SHELL.map(u => c.add(new Request(u, { cache: 'reload' })).catch(() => {})))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.indexOf('dev-easy-') === 0 && k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;                 /* Firebase, Google...: o navegador resolve */
  if (/\/audio\/[^/]+\.mp3$/.test(url.pathname)) return;      /* áudio: direto da rede (o servidor entende "Range") */
  e.respondWith(rede(req));
});

function rede(req) {
  const nav = req.mode === 'navigate';
  function guardada() {
    return caches.open(V).then(c => c.match(req, { ignoreSearch: true }).then(r => r || (nav ? c.match('index.html').then(x => x || c.match('./')) : undefined)));
  }
  return new Promise(resolve => {
    let fim = false;
    const t = setTimeout(() => { guardada().then(r => { if (r && !fim) { fim = true; resolve(r); } }); }, 4000);
    fetch(req, { cache: 'no-cache' }).then(res => {
      if (res && res.ok && res.type === 'basic' && res.status === 200) {
        const cp = res.clone();
        caches.open(V).then(c => c.put(req, cp)).catch(() => {});
      }
      if (!fim) { fim = true; clearTimeout(t); resolve(res); }
    }, () => {
      clearTimeout(t);
      if (fim) return;
      guardada().then(r => { fim = true; resolve(r || Response.error()); });
    });
  });
}
