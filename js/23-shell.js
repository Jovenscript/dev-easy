/* ===== casca do app: menu lateral, avisos, tema, ícones ===== */
Object.assign(ICON,(function(){
  function i(p){return '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">'+p+'</svg>'}
  return {
    grid:i('<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>'),
    note:i('<path d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17z"/><path d="M14 8l3 3"/>'),
    mark:i('<path d="M7 4h10a1 1 0 0 1 1 1v15l-6-4-6 4V5a1 1 0 0 1 1-1z"/>'),
    voz:i('<path d="M4 10v4h3.5L12 18V6L7.5 10z"/><path d="M15.5 9a4.2 4.2 0 0 1 0 6"/><path d="M18 6.5a8 8 0 0 1 0 11"/>'),
    cloud:i('<path d="M7 18a4 4 0 0 1-.6-7.95A5.5 5.5 0 0 1 17 8.6 4.7 4.7 0 0 1 17.5 18z"/>'),
    sun:i('<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/>'),
    moon:i('<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>'),
    auto:i('<circle cx="12" cy="12" r="8"/><path d="M12 4v16"/><path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor" stroke="none"/>'),
    menu:i('<path d="M4 7h16M4 12h16M4 17h16"/>'),
    x:i('<path d="M6 6l12 12M18 6 6 18"/>'),
    trash:i('<path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13"/>'),
    down:i('<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>'),
    up:i('<path d="M12 16V5M7 9l5-5 5 5M5 20h14"/>'),
    flame:i('<path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 .3 1.2 1 2 2 2 0-3-.5-5 1-8z"/>'),
    check:i('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
    star:i('<path d="M12 4l2.4 5 5.4.7-4 3.8 1 5.4-4.8-2.7-4.8 2.7 1-5.4-4-3.8 5.4-.7z"/>'),
    pen:i('<path d="M4 20l1-4L16.5 4.5a2 2 0 0 1 3 3L8 19z"/>'),
    link:i('<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7L11.8 6.5"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3A4 4 0 0 0 11 18.7l1.2-1.2"/>'),
    play2:i('<path d="M8 5.5v13l11-6.5z"/>'),
    search:i('<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/>')
  };
})());
const LOGO='<svg viewBox="0 0 32 32" aria-hidden="true"><defs><linearGradient id="lgx" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2DD4BF"/><stop offset="1" stop-color="#60A5FA"/></linearGradient></defs><rect width="32" height="32" rx="9" fill="#0B1118"/><rect x=".75" y=".75" width="30.5" height="30.5" rx="8.25" fill="none" stroke="url(#lgx)" stroke-opacity=".6" stroke-width="1.5"/><path d="M13.5 10.5 8 16l5.5 5.5" fill="none" stroke="url(#lgx)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M18.5 10.5 24 16l-5.5 5.5" fill="none" stroke="#FB923C" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const UI=(function(){
  var TKEY='dev-easy-theme',lastView=null,toastT=0,toastFn=null;
  function reduced(){try{return window.matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){return false}}
  function fmt(n){return String(n).replace(/\B(?=(\d{3})+(?!\d))/g,'.')}

  /* ----- tema: dark (padrão), light ou auto (segue o aparelho) ----- */
  function theme(){var t='dark';try{t=localStorage.getItem(TKEY)||'dark'}catch(e){}return /^(dark|light|auto)$/.test(t)?t:'dark'}
  function resolved(t){return t==='auto'?((window.matchMedia&&matchMedia('(prefers-color-scheme: light)').matches)?'light':'dark'):t}
  function setTheme(t){
    if(!/^(dark|light|auto)$/.test(t))t='dark';
    try{localStorage.setItem(TKEY,t)}catch(e){}
    document.documentElement.dataset.theme=t;
    var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content',resolved(t)==='light'?'#EEF3F8':'#080B11');
  }
  function themeNext(){var o=['dark','light','auto'],t=theme();setTheme(o[(o.indexOf(t)+1)%3]);side();if(S.view==='conta')render()}
  function themeLabel(t){return t==='light'?'Claro':t==='auto'?'Automático':'Escuro'}
  function themeIcon(t){return t==='light'?ICON.sun:t==='auto'?ICON.auto:ICON.moon}

  /* ----- menu lateral ----- */
  function nv(href,act,label,icon,on,extra,id,style){
    return '<a class="sbn'+(on?' on':'')+'" href="'+href+'" data-act="'+act+'"'+(id?' data-id="'+id+'"':'')+(style?' style="'+style+'"':'')+(on?' aria-current="page"':'')+'>'+icon+'<span class="sbl">'+label+'</span>'+(extra||'')+'</a>';
  }
  function curCat(){return S.view==='cat'?S.cat:(S.view==='entry'&&byId[S.id]?byId[S.id].cat:null)}
  function side(){
    var el=$('#side');if(!el)return;
    var nn=STORE.live('note').filter(function(r){return byId[r.k]}).length,mm=STORE.live('mark').filter(function(r){return r.v&&byId[r.v.id]}).length,cc=curCat();
    var h='<div class="sb-brand"><button class="sb-logo" data-act="home" aria-label="DEV EASY, início">'+LOGO+'<span class="sb-name">DEV <b>EASY</b></span></button><button class="ib sm sb-x" data-act="menu-close" aria-label="Fechar menu">'+ICON.x+'</button></div><nav class="sb-nav" aria-label="Menu principal">';
    h+=nv('#/','home','Painel',ICON.grid,S.view==='home');
    h+='<p class="sb-h">Áreas</p>';
    CATS.filter(hasOwn).forEach(function(c){
      var ids=catItems(c.id).map(function(x){return x.id});
      h+=nv('#/area/'+c.id,'cat',nb(esc(c.name)),'<i class="dot" aria-hidden="true"></i>',cc===c.id,'<small class="cnt">'+seen(ids)+'/'+ids.length+'</small>',c.id,'--c:'+c.c);
    });
    h+='<p class="sb-h">Meu espaço</p>';
    h+=nv('#/notas','notas','Anotações',ICON.note,S.view==='notas','<small class="cnt">'+nn+'</small>');
    h+=nv('#/marcadores','marcas','Marcadores',ICON.mark,S.view==='marcas','<small class="cnt">'+mm+'</small>');
    h+='<p class="sb-h">Ajustes</p>';
    h+=nv('#/voz','voz','Voz e áudio',ICON.voz,S.view==='voz');
    var sb=(typeof SYNC!=='undefined')?SYNC.badge():{cls:'off',text:'Só neste aparelho'};
    h+=nv('#/conta','conta','Conta e nuvem',ICON.cloud,S.view==='conta','<i class="sdot '+sb.cls+'" title="'+esc(sb.text)+'"></i>');
    h+='</nav><div class="sb-foot"><button class="sbn" data-act="tema" aria-label="Tema: '+themeLabel(theme())+'. Toque para trocar">'+themeIcon(theme())+'<span class="sbl">Tema: '+themeLabel(theme())+'</span></button><p class="sb-ver">'+DATA.length+' fichas · áudio de '+(typeof AUDIOMAP!=='undefined'?Object.keys(AUDIOMAP).filter(function(k){return k.charAt(0)!=='_'}).length:0)+'</p></div>';
    el.innerHTML=h;
  }
  function badges(){side();syncBadge()}
  function syncBadge(){
    var b=$('#syncst');if(!b)return;
    var sb=(typeof SYNC!=='undefined')?SYNC.badge():{cls:'off',text:'Só neste aparelho'};
    b.className='syncst '+sb.cls;b.innerHTML='<i class="sdot '+sb.cls+'"></i><span>'+esc(sb.text)+'</span>';
    b.setAttribute('data-act','conta');b.setAttribute('title','Conta e nuvem');
  }
  function menu(open){
    document.body.classList.toggle('menu-open',!!open);
    var b=$('[data-act="menu"]');if(b)b.setAttribute('aria-expanded',open?'true':'false');
    var sc=$('#scrim');if(sc)sc.hidden=!open;
    if(open){var f=$('#side .sbn.on')||$('#side .sbn');if(f)try{f.focus({preventScroll:true})}catch(e){}}
  }

  /* ----- números que sobem ----- */
  function countUps(anim){
    Array.prototype.forEach.call(document.querySelectorAll('#view [data-count]'),function(el){
      var to=+el.dataset.count||0;
      if(!anim||to===0){el.textContent=fmt(to);return}
      var t0=performance.now(),d=800;el.textContent='0';
      (function f(t){var k=Math.min(1,(t-t0)/d),e=1-Math.pow(1-k,3);el.textContent=fmt(Math.round(to*e));if(k<1&&el.isConnected)requestAnimationFrame(f)})(t0);
    });
  }
  function after(){
    side();syncBadge();
    var x=S.view==='entry'&&byId[S.id];document.title=x?x.name+' · DEV EASY':'DEV EASY';
    if(document.body.classList.contains('menu-open'))menu(false);
    var anim=(lastView!==S.view)&&!reduced();lastView=S.view;
    $('#view').classList.toggle('noanim',!anim);
    countUps(anim);
    if(typeof DASH!=='undefined'&&S.view==='home')DASH.after();
    if(typeof NOTES!=='undefined')NOTES.after();
    if(typeof ACC!=='undefined')ACC.after();
  }
  /* baixar um texto como arquivo e copiar para a área de transferência */
  function download(name,text,type){
    try{
      var b=new Blob([text],{type:(type||'text/plain')+';charset=utf-8'}),u=URL.createObjectURL(b),a=document.createElement('a');
      a.href=u;a.download=name;a.rel='noopener';document.body.appendChild(a);a.click();
      setTimeout(function(){document.body.removeChild(a);URL.revokeObjectURL(u)},1500);
      return true;
    }catch(e){toast('Não consegui baixar o arquivo neste navegador.');return false}
  }
  function copy(text,fim){
    function viaSel(){
      try{var ta=document.createElement('textarea');ta.value=text;ta.setAttribute('readonly','');ta.style.cssText='position:fixed;top:0;left:0;opacity:0';document.body.appendChild(ta);ta.select();var ok=document.execCommand('copy');document.body.removeChild(ta);fim(!!ok)}catch(e){fim(false)}
    }
    try{if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(function(){fim(true)},viaSel);return}}catch(e){}
    viaSel();
  }

  /* ----- aviso rápido (com botão opcional, ex.: Desfazer) ----- */
  function toast(msg,opt){
    var el=$('#toast');if(!el)return;opt=opt||{};
    clearTimeout(toastT);toastFn=opt.fn||null;
    el.innerHTML='<span>'+esc(msg)+'</span>'+(opt.label?'<button class="tbtn" data-act="toast-act">'+esc(opt.label)+'</button>':'');
    el.hidden=false;el.classList.remove('in');void el.offsetWidth;el.classList.add('in');
    toastT=setTimeout(function(){el.hidden=true;toastFn=null},opt.ms||5000);
  }
  function init(){
    setTheme(theme());
    /* altura do player (que muda de 1 para 2 linhas conforme a largura): o aviso e o botão flutuante ficam sempre acima dele */
    var pl=$('#player');
    function ph(){document.documentElement.style.setProperty('--ph',(pl.hidden?0:Math.round(pl.getBoundingClientRect().height))+'px')}
    if(pl&&window.ResizeObserver){try{new ResizeObserver(ph).observe(pl)}catch(e){}}
    if(pl)window.addEventListener('resize',ph);
    window.addEventListener('resize',function(){if(window.innerWidth>=960&&document.body.classList.contains('menu-open'))menu(false)});
    document.addEventListener('keydown',function(e){
      if(e.key==='Escape'&&document.body.classList.contains('menu-open')){menu(false);return}
      if(e.key==='/'&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!/^(INPUT|TEXTAREA|SELECT)$/.test((document.activeElement||{}).tagName||'')){e.preventDefault();var q=$('#q');if(q)q.focus()}
    });
    if(window.matchMedia){try{matchMedia('(prefers-color-scheme: light)').addEventListener('change',function(){if(theme()==='auto')setTheme('auto')})}catch(e){}}
  }
  return {init:init,after:after,badges:badges,side:side,menu:menu,toast:toast,download:download,copy:copy,theme:theme,setTheme:setTheme,themeNext:themeNext,themeLabel:themeLabel,fmt:fmt,reduced:reduced,syncBadge:syncBadge,
    toastRun:function(){var f=toastFn;toastFn=null;var el=$('#toast');if(el)el.hidden=true;if(f)f()}};
})();
ACTS.menu=function(){UI.menu(!document.body.classList.contains('menu-open'))};
ACTS['menu-close']=function(){UI.menu(false)};
ACTS.tema=function(){UI.themeNext()};
ACTS['toast-act']=function(){UI.toastRun()};
ACTS.notas=function(){go('notas')};
ACTS.marcas=function(){go('marcas')};
ACTS.conta=function(){go('conta')};
