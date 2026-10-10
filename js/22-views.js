/* ===== telas do catálogo, navegação e eventos ===== */
const VIEWS={},ACTS={};          /* os outros arquivos registram aqui suas telas (VIEWS) e botões (ACTS) */
const WIDE={home:1,notas:1,marcas:1,conta:1,jogos:1};
const SECN={oq:'O que é',an:'Analogia',pq:'Para que serve',ex:'Na prática',demo:'Veja funcionando',alt:'Alternativas e parecidos',rel:'Veja também',nota:'Minhas anotações'};

function bars(l){return '<span class="bars" aria-hidden="true"><i class="'+(l>=1?'f':'')+'"></i><i class="'+(l>=2?'f':'')+'"></i><i class="'+(l>=3?'f':'')+'"></i></span>'}
function lamp(id){var on=S.studied.has(id);return '<span class="lamp'+(on?' on':'')+'" title="'+(on?'Já entendi':'Ainda não marcado')+'"></span>'}
function row(x,ctx){
  var tg='';
  if(STORE.get('note',x.id))tg+='<span class="tg" title="Tem anotação">'+(ICON.note||'✎')+'</span>';
  if(S.fav.has(x.id))tg+='<span class="tg fv" title="Favorita">★</span>';
  return '<button class="row" data-act="open" data-id="'+x.id+'" data-ctx="'+ctx+'">'+lamp(x.id)+'<span class="t"><b>'+esc(x.name)+'</b><small>'+esc(x.sub)+'</small></span>'+tg+bars(x.lvl)+'</button>';
}
function minutes(ids){var seg=0;ids.forEach(function(i){var m=(S.modo!=='aparelho'&&!TTS.semArq&&typeof AUDIOMAP!=='undefined')?AUDIOMAP[i]:null;seg+=m?m[0]:speechText(byId[i]).split(/\s+/).length/140*60});return Math.max(1,Math.round(seg/60/S.rate))}
function seen(ids){return ids.filter(function(i){return S.studied.has(i)}).length}
function hasOwn(c){return DATA.some(function(x){return x.cat===c.id})}

function listView(title,desc,ids,ctx,plate,col){
  var items=ids.map(function(i){return byId[i]});
  if(S.filter==='todo')items=items.filter(function(x){return !S.studied.has(x.id)});
  if(S.filter==='fav')items=items.filter(function(x){return S.fav.has(x.id)});
  var h='<div style="--c:'+col.c+';--ci:'+col.ci+'"><button class="lnk" data-act="back">← Voltar</button><div><span class="plate">'+plate+'</span></div><h1>'+esc(title)+'</h1><p class="lead">'+esc(desc)+'</p>';
  h+='<div class="acts">'+(vozOk()?'<button class="btn" data-act="radio" data-list="'+ctx+'">'+ICON.play+' Ouvir tudo ('+minutes(ids)+' min)</button>':'')+'</div>';
  h+='<div class="chips" role="group" aria-label="Filtro"><button class="chip" data-act="filter" data-f="all" aria-pressed="'+(S.filter==='all')+'">Todas ('+ids.length+')</button><button class="chip" data-act="filter" data-f="todo" aria-pressed="'+(S.filter==='todo')+'">Não vistas ('+(ids.length-seen(ids))+')</button><button class="chip" data-act="filter" data-f="fav" aria-pressed="'+(S.filter==='fav')+'">Favoritas</button></div>';
  h+='<div class="gl rows">'+(items.length?items.map(function(x){return row(x,ctx)}).join(''):'<p class="empty">Nada por aqui com esse filtro.</p>')+'</div>';
  return h+'</div>';
}
function vCat(){var c=CATMAP[S.cat];if(!c)return VIEWS.home();return listView(c.name,c.desc,catItems(c.id).map(function(x){return x.id}),'cat:'+c.id,c.code,c)}
function vTrail(){var t=TRAILS.filter(function(r){return r.id===S.tid})[0];if(!t)return VIEWS.home();return listView(t.name,t.desc,trailIds(t),'trail:'+t.id,'TRILHA',{c:'#5F6F7E',ci:'#FFFFFF'})}
function vSearch(){
  S.results=search(S.q);
  var h='<p class="eyebrow" style="margin-top:6px">Busca</p><h1>'+esc(S.q)+'</h1>';
  h+='<div class="gl rows">'+(S.results.length?S.results.map(function(x){return row(x,'search')}).join(''):'<p class="empty">Nada encontrado nas fichas. Tente uma palavra mais curta, como “api” ou “banco”.</p>')+'</div>';
  var nn=(typeof NOTES!=='undefined')?NOTES.search(S.q):[];
  if(nn.length)h+='<h2 class="eyebrow">Nas suas anotações ('+nn.length+')</h2><div class="gl rows">'+nn.map(function(r){return '<button class="row" data-act="open" data-id="'+r.id+'" data-pos="nota">'+(ICON.note||'')+'<span class="t"><b>'+esc(byId[r.id].name)+'</b><small>'+esc(r.snip)+'</small></span></button>'}).join('')+'</div>';
  return h;
}
function sec(k,inner,cls){return '<section class="gl sec'+(cls?' '+cls:'')+'" data-sec="'+k+'" id="s-'+k+'">'+inner+'</section>'}
function vEntry(){
  var x=byId[S.id];if(!x)return VIEWS.home();
  var c=CATMAP[x.cat],ids=ctxIds(S.ctx);if(!ids||ids.indexOf(x.id)<0){S.ctx='cat:'+x.cat;ids=ctxIds(S.ctx)}
  var i=ids.indexOf(x.id),pv=byId[ids[i-1]],nx=byId[ids[i+1]];
  var h='<article class="entry" style="--c:'+c.c+';--ci:'+c.ci+'"><div class="crumb"><button class="lnk" data-act="back">← Voltar</button><span class="plate">'+x.code+'</span><span class="cc">'+esc(c.name)+'</span></div>';
  h+='<h1>'+esc(x.name)+'</h1><p class="sub">'+rich(x.sub)+'</p><span class="lv">'+bars(x.lvl)+' '+LV[x.lvl]+'</span>';
  h+='<div class="acts">'+(vozOk()?'<button class="btn" data-act="listen">'+rotuloOuvir(x.id)+'</button>'+(nx?'<button class="btn ghost" data-act="radio-here">Ouvir em sequência</button>':''):'<span class="note">O áudio não está disponível neste navegador.</span>')+
    '<button class="btn ghost" data-act="done" aria-pressed="'+S.studied.has(x.id)+'">'+(S.studied.has(x.id)?'Já entendi ✓':'Já entendi')+'</button><button class="btn ghost" data-act="fav" aria-pressed="'+S.fav.has(x.id)+'">'+(S.fav.has(x.id)?'★ Favorita':'☆ Favoritar')+'</button></div>';
  h+='<div class="acts tools"><button class="btn ghost sm" data-act="nota-ir">'+(ICON.note||'')+' Anotar</button><button class="btn ghost sm" data-act="mk-add">'+(ICON.mark||'')+' Marcar onde parei</button>'+(vozOk()?'<button class="lnk" data-act="voz">Voz e velocidade</button>':'')+'</div>';
  h+=sec('oq','<h2 class="eyebrow">O que é</h2><p>'+rich(x.oq)+'</p>');
  h+=sec('an','<h2 class="eyebrow">Analogia</h2><p>'+rich(x.an)+'</p>','ana');
  h+=sec('pq','<h2 class="eyebrow">Para que serve</h2><ul>'+x.pq.map(function(p){return '<li>'+rich(p)+'</li>'}).join('')+'</ul>');
  if(x.ex)h+=sec('ex','<h2 class="eyebrow">Na prática</h2><div class="code"><header><span>'+esc(x.ex[0])+'</span><button data-act="copy">Copiar</button></header><pre role="region" tabindex="0" aria-label="Código: '+esc(x.ex[0])+'">'+esc(x.ex[1])+'</pre></div>'+(x.ex[2]?'<p class="note">'+rich(x.ex[2])+'</p>':''));
  if(x.demo)h+=sec('demo','<h2 class="eyebrow">Veja funcionando</h2><div class="demo" data-demo="'+x.demo+'"></div>');
  if(x.alt)h+=sec('alt','<h2 class="eyebrow">Alternativas e parecidos</h2><p>'+rich(x.alt)+'</p>');
  if(x.rel.length)h+=sec('rel','<h2 class="eyebrow">Veja também</h2><div class="rel">'+x.rel.map(function(r){return '<button data-act="open" data-id="'+r+'" data-ctx="cat:'+byId[r].cat+'">'+esc(byId[r].name)+'</button>'}).join('')+'</div>');
  h+=sec('nota',(typeof NOTES!=='undefined')?NOTES.html(x.id):'');
  h+='<nav class="pn" aria-label="Navegação">'+(pv?'<button data-act="open" data-id="'+pv.id+'" data-ctx="'+S.ctx+'"><small>← Anterior</small><b>'+esc(pv.name)+'</b></button>':'<span></span>')+(nx?'<button class="nx" data-act="open" data-id="'+nx.id+'" data-ctx="'+S.ctx+'"><small>Próxima →</small><b>'+esc(nx.name)+'</b></button>':'')+'</nav></article>';
  return h;
}

VIEWS.cat=vCat;VIEWS.trail=vTrail;VIEWS.search=vSearch;VIEWS.entry=vEntry;VIEWS.voz=vVoz;
function updateHeader(){var c=$('#count');if(c)c.textContent=S.studied.size+'/'+DATA.length}
function render(){
  if(typeof NOTES!=='undefined')NOTES.flush();
  cleanup();
  var v=$('#view'),fn=VIEWS[S.view]||VIEWS.home,h;
  try{h=fn()}catch(e){if(window.console)console.error(e);h='<p class="empty">Não consegui montar esta tela. Toque em DEV EASY para voltar ao início.</p>'}
  v.className='wrap'+(WIDE[S.view]?' wide':'');v.dataset.view=S.view;
  v.innerHTML=h;
  Array.prototype.forEach.call(v.querySelectorAll('[data-demo]'),function(el){try{mountDemo(el)}catch(e){el.textContent='Não consegui carregar esta demonstração.'}});
  updateHeader();renderPlayer();
  if(typeof UI!=='undefined')UI.after();
}

/* ----- navegação -----
   Cada tela tem um endereço (#/ficha/docker): o botão Voltar do navegador funciona, recarregar a página volta para a mesma tela e dá para abrir uma ficha em outra aba. */
var NAVN=0,HOK=true,STACK=[];
function hashOf(){
  switch(S.view){
    case 'cat':return '#/area/'+S.cat;
    case 'trail':return '#/trilha/'+S.tid;
    case 'entry':return '#/ficha/'+S.id;
    case 'search':return '#/busca/'+encodeURIComponent(S.q);
    case 'voz':return '#/voz';
    case 'notas':return '#/notas';
    case 'marcas':return '#/marcadores';
    case 'conta':return '#/conta';
    case 'jogos':return '#/jogos';
    case 'jogo':return '#/jogo/'+S.id;
    default:return '#/';
  }
}
function fromHash(h){
  var m=String(h||'').replace(/^#\/?/,'').split('/'),a=m[0],b='';
  try{b=decodeURIComponent(m.slice(1).join('/')||'')}catch(e){b=''}
  if(a==='area'&&CATMAP[b]&&hasOwn(CATMAP[b]))return {view:'cat',cat:b};
  if(a==='trilha'&&TRAILS.some(function(t){return t.id===b}))return {view:'trail',tid:b};
  if(a==='ficha'&&byId[b])return {view:'entry',id:b};
  if(a==='busca'&&b)return {view:'search',q:b};
  if(a==='voz'||a==='notas'||a==='conta')return {view:a};
  if(a==='marcadores')return {view:'marcas'};
  if(a==='jogos')return {view:'jogos'};
  if(a==='jogo'&&/^u\d{2}l\d{2}$/.test(b))return {view:'jogo',id:b};          /* ENIAC: trilha e lição (js/30-jogo-*.js) */
  return {view:'home'};
}
function applyState(st){S.view=st.view||'home';S.cat=st.cat||null;S.tid=st.tid||null;S.id=st.id||null;S.q=st.q||'';S.ctx=st.ctx||null;S.filter=st.filter||'all'}
function stateNow(){return {view:S.view,cat:S.cat,tid:S.tid,id:S.id,q:S.q,ctx:S.ctx,filter:S.filter,n:NAVN}}
function navTo(view,p,replace){
  if(typeof ENIAC!=='undefined'&&ENIAC.guarda(function(){navTo(view,p,replace)}))return;      /* no meio de uma lição, pergunta antes de sair */
  var y=window.scrollY||0,prev=Object.assign(stateNow(),{y:y});
  try{history.replaceState(Object.assign({},history.state||stateNow(),{y:y}),'')}catch(e){}
  S.view=view;S.filter='all';
  if(p){if(p.cat!==undefined)S.cat=p.cat;if(p.id!==undefined)S.id=p.id;if(p.tid!==undefined)S.tid=p.tid;if(p.ctx!==undefined)S.ctx=p.ctx;if(p.q!==undefined)S.q=p.q}
  if(HOK){
    try{
      if(replace)history.replaceState(stateNow(),'',hashOf());
      else{NAVN++;history.pushState(stateNow(),'',hashOf())}
    }catch(e){HOK=false;NAVN=0}      /* abrindo o arquivo direto do disco o navegador não deixa mexer no histórico: usa uma pilha própria */
  }
  if(!HOK&&!replace)STACK.push(prev);
  render();window.scrollTo(0,0);
}
function go(view,p,replace){TTS.follow=false;navTo(view,p,replace)}
function back(){
  if(HOK&&NAVN>0){history.back();return}
  if(STACK.length){var st=STACK.pop();applyState(st);$('#q').value=S.view==='search'?S.q:'';render();window.scrollTo(0,st.y||0);return}
  navTo('home',{},true);
}
window.addEventListener('popstate',function(e){
  if(typeof ENIAC!=='undefined'&&ENIAC.aoVoltar(e))return;                                      /* Voltar do navegador no meio de uma lição: pergunta e fica */
  var st=(e.state&&e.state.view)?e.state:Object.assign(fromHash(location.hash),{n:0});
  applyState(st);NAVN=st.n||0;TTS.follow=false;
  $('#q').value=S.view==='search'?S.q:'';
  render();window.scrollTo(0,st.y||0);
});
function openEntry(id,ctx,pos){
  $('#q').value='';S.searchPushed=false;
  go('entry',{id:id,ctx:ctx||('cat:'+byId[id].cat)});
  if(typeof NOTES!=='undefined')NOTES.opened(id,pos);
}

/* ----- eventos ----- */
function copyText(btn){
  var pre=btn.closest('.code').querySelector('pre'),txt=pre.textContent;
  function ok(){var o=btn.textContent;btn.textContent='Copiado';setTimeout(function(){btn.textContent=o},1200)}
  function fb(){try{var r=document.createRange();r.selectNodeContents(pre);var s=getSelection();s.removeAllRanges();s.addRange(r);btn.textContent='Selecionado'}catch(e){}}
  try{navigator.clipboard.writeText(txt).then(ok,fb)}catch(e){fb()}
}
ACTS.pseek=function(t,id,e){var r=t.getBoundingClientRect();if(r.width>0)pularPara((e.clientX-r.left)/r.width)};
document.addEventListener('click',function(e){
  var t=e.target.closest('[data-act]');if(!t)return;
  var a=t.dataset.act,id=t.dataset.id;
  if(t.tagName==='A'){if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.button)return;e.preventDefault()}
  if(ACTS[a]){ACTS[a](t,id,e);return}
  if(a==='home'){$('#q').value='';S.searchPushed=false;TTS.follow=false;if(S.view==='home'){render();window.scrollTo(0,0)}else go('home')}
  else if(a==='back')back();
  else if(a==='cat')go('cat',{cat:id});
  else if(a==='trail')go('trail',{tid:id});
  else if(a==='open')openEntry(id,t.dataset.ctx,t.dataset.pos?{sec:t.dataset.pos,f:0}:null);
  else if(a==='filter'){S.filter=t.dataset.f;render()}
  else if(a==='radio'){var ids=ctxIds(t.dataset.list)||[],k=ids.findIndex(function(i){return !S.studied.has(i)});if(k<0)k=0;S.ctx=t.dataset.list;startTTS(ids,k,true)}
  else if(a==='radio-here'){var ids2=ctxIds(S.ctx)||[],k2=ids2.indexOf(S.id);startTTS(ids2,Math.max(0,k2),true)}
  else if(a==='listen'){if(TTS.on&&TTS.ids[TTS.pos]===S.id){if(TTS.loading)stopTTS();else if(TTS.paused)resumeTTS();else pauseTTS()}else startTTS([S.id],0,false);syncListen()}
  else if(a==='voz')go('voz');
  else if(a==='vmodo')vozModo(t.dataset.m);
  else if(a==='vrate')vozRate(+t.dataset.r);
  else if(a==='vpausa')vozPausa(+t.dataset.p);
  else if(a==='vtest')testarVoz();
  else if(a==='vretry')vozRetry();
  else if(a==='done'){var on=!S.studied.has(S.id);STORE.set('done',S.id,on?1:null);t.setAttribute('aria-pressed',on);t.textContent=on?'Já entendi ✓':'Já entendi'}
  else if(a==='fav'){var fv=!S.fav.has(S.id);STORE.set('fav',S.id,fv?1:null);t.setAttribute('aria-pressed',fv);t.textContent=fv?'★ Favorita':'☆ Favoritar'}
  else if(a==='copy')copyText(t);
  else if(a==='tplay'){if(TTS.loading)return;if(TTS.paused)resumeTTS();else pauseTTS()}
  else if(a==='tnext'){if(TTS.on){TTS.paused=false;nextEntry()}}
  else if(a==='tprev'){if(TTS.on){TTS.paused=false;TTS.pos=Math.max(0,TTS.pos-1);loadEntry()}}
  else if(a==='tstop')stopTTS();
  else if(a==='trate')cycleRate();
});
$('#q').addEventListener('input',function(){
  var v=this.value.trim();
  if(!v){
    if(S.view==='search'){if(S.searchPushed&&HOK&&NAVN>0)history.back();else navTo('home',{},true)}
    S.searchPushed=false;return;
  }
  if(S.view!=='search'){S.searchPushed=true;navTo('search',{q:v});return}
  S.q=v;try{if(HOK)history.replaceState(stateNow(),'',hashOf())}catch(e){}
  render();
});

/* ----- quando os dados mudam (aqui, ou vindos da nuvem) ----- */
var rfT=0;
function onData(info){
  rebuildSets();updateHeader();
  if(typeof UI!=='undefined')UI.badges();
  if(info&&info.src==='local'&&!info.wipe)return;          /* mudança feita aqui: a própria tela já se atualizou */
  refreshSoon();
}
function refreshSoon(){
  clearTimeout(rfT);
  rfT=setTimeout(function(){
    var ae=document.activeElement;
    if(ae&&/^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName)&&$('#view').contains(ae)){refreshSoon();return}   /* não mexe na tela enquanto você digita */
    if(S.view==='entry'){if(typeof NOTES!=='undefined')NOTES.refreshEntry();return}
    if(S.view==='jogo')return;                                      /* lição em andamento: a tela não é refeita por mudanças vindas de fora */
    var y=window.scrollY||0;render();window.scrollTo(0,y);
  },300);
}

/* ----- início ----- */
function boot(){
  finalize();loadLocal();if(typeof ENIAC!=='undefined')ENIAC.iniciar();STORE.init();STORE.on(onData);initVoz();
  var hs=history.state,st=(hs&&hs.view)?hs:fromHash(location.hash);
  applyState(st);NAVN=(hs&&hs.n)||0;
  if(S.view==='entry'&&!byId[S.id])applyState({view:'home'});
  try{history.scrollRestoration='manual'}catch(e){}
  try{history.replaceState(Object.assign(stateNow(),{y:(hs&&hs.y)||0}),'',hashOf())}catch(e){HOK=false;NAVN=0}
  if(typeof UI!=='undefined')UI.init();
  if(typeof NOTES!=='undefined')NOTES.init();
  render();
  var y0=(hs&&hs.y)||0;if(y0)window.scrollTo(0,y0);
  var sT=0;window.addEventListener('scroll',function(){clearTimeout(sT);sT=setTimeout(function(){try{if(HOK)history.replaceState(Object.assign({},history.state||stateNow(),{y:window.scrollY||0}),'')}catch(e){}},600)},{passive:true});
  if(typeof SYNC!=='undefined')SYNC.init();
  if(typeof GATE!=='undefined')GATE.init();
}
