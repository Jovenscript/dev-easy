/* ===== dados do usuário: progresso, anotações e marcadores =====
   Tudo que é guardado vira um "registro": {v: valor, u: hora da última mudança, em ms}.
   v = null quer dizer "apagado" (o registro fica guardado para o apagamento também ser sincronizado).
   Quando dois aparelhos se encontram, para cada item vence o registro mais novo.
   Grupos:  done = fichas que você entendeu · fav = favoritas · note = anotações (uma por ficha)
            mark = marcadores "onde parei" · resume = o último ponto em que você estava
            jogo = progresso do ENIAC (lições, dias de prática, conquistas e ajustes; veja js/30-jogo-2-estado.js).
   As preferências de voz (velocidade, voz do aparelho...) ficam só neste aparelho, em STORE.loc. */
const STORE=(function(){
  var KEY='dev-easy-v1',NS=['done','fav','note','mark','resume','jogo'];
  var st={reg:{},dirty:{},loc:{},lastU:0},subs=[],saveT=0;
  NS.forEach(function(n){st.reg[n]={}});
  function js(v){return JSON.stringify(v===undefined?null:v)}
  function nextU(){var t=Date.now();if(t<=st.lastU)t=st.lastU+1;st.lastU=t;return t}
  /* o registro "rec" deve substituir o "cur"? (mais novo vence; em empate, um critério fixo igual em todo aparelho) */
  function wins(cur,rec){if(!cur)return true;if(rec.u!==cur.u)return rec.u>cur.u;return js(rec.v)>js(cur.v)}
  function emit(info){subs.forEach(function(f){try{f(info)}catch(e){if(window.console)console.error(e)}})}
  function write(){
    clearTimeout(saveT);saveT=0;
    try{localStorage.setItem(KEY,JSON.stringify({v:2,lastU:st.lastU,reg:st.reg,dirty:st.dirty,loc:st.loc}))}catch(e){}
  }
  function save(agora){if(agora===true){write();return}clearTimeout(saveT);saveT=setTimeout(write,350)}
  function load(){
    try{
      var raw=localStorage.getItem(KEY);if(!raw)return false;
      var o;try{o=JSON.parse(raw)}catch(e){try{localStorage.setItem(KEY+'-corrompido',raw)}catch(e2){}return false}
      if(!o||typeof o!=='object')return false;
      NS.forEach(function(n){
        var m=o.reg&&o.reg[n];if(!m||typeof m!=='object')return;
        Object.keys(m).forEach(function(k){var r=m[k];if(r&&typeof r==='object'&&typeof r.u==='number'&&isFinite(r.u)){st.reg[n][k]={v:r.v===undefined?null:r.v,u:r.u};if(r.u>st.lastU&&r.u<Date.now()+864e5)st.lastU=r.u}});
      });
      st.dirty=(o.dirty&&typeof o.dirty==='object')?o.dirty:{};
      st.loc=(o.loc&&typeof o.loc==='object')?o.loc:{};
      if(typeof o.lastU==='number'&&o.lastU>st.lastU&&o.lastU<Date.now()+864e5)st.lastU=o.lastU;
      return true;
    }catch(e){return false}
  }
  function get(ns,key){var r=st.reg[ns]&&st.reg[ns][key];return r&&r.v!==null&&r.v!==undefined?r.v:null}
  function rec(ns,key){return (st.reg[ns]&&st.reg[ns][key])||null}
  function live(ns){var out=[],m=st.reg[ns]||{};Object.keys(m).forEach(function(k){var r=m[k];if(r.v!==null&&r.v!==undefined)out.push({k:k,v:r.v,u:r.u})});return out}
  function set(ns,key,v,quiet){
    if(!st.reg[ns])return null;
    var r={v:v===undefined?null:v,u:nextU()};
    st.reg[ns][key]=r;st.dirty[ns+'/'+key]=r.u;save();
    if(!quiet)emit({src:'local',ns:ns,key:key});
    return r;
  }
  function del(ns,key){return set(ns,key,null)}
  /* junta registros que vieram de fora (nuvem, backup) */
  function merge(remote,src,marcarEnvio){
    var n=0,keys=[];
    if(!remote||typeof remote!=='object')return 0;
    NS.forEach(function(ns){
      var r=remote[ns];if(!r||typeof r!=='object')return;
      Object.keys(r).forEach(function(k){
        var rc=r[k];if(!rc||typeof rc!=='object'||typeof rc.u!=='number'||!isFinite(rc.u))return;
        var cur=st.reg[ns][k],id=ns+'/'+k;
        if(wins(cur,rc)&&!(cur&&cur.u===rc.u&&js(cur.v)===js(rc.v))){
          st.reg[ns][k]={v:rc.v===undefined?null:rc.v,u:rc.u};n++;keys.push(id);
          if(marcarEnvio)st.dirty[id]=rc.u;else if(st.dirty[id]&&st.dirty[id]<=rc.u)delete st.dirty[id];
        }
        /* o relógio local nunca fica atrás do que já vimos: assim uma edição sua nova sempre vence a antiga, mesmo com relógios diferentes */
        if(rc.u>st.lastU&&rc.u<Date.now()+864e5)st.lastU=rc.u;
      });
    });
    if(n){save();emit({src:src||'remote',keys:keys,n:n})}
    return n;
  }
  /* depois do primeiro contato com a nuvem: marca para envio o que aqui é mais novo (ou que lá não existe) */
  function dirtyAgainst(remote,nss){
    var n=0;
    (nss||NS).forEach(function(ns){
      var r=(remote&&remote[ns])||{};
      Object.keys(st.reg[ns]).forEach(function(k){
        var c=st.reg[ns][k],rc=r[k];
        if(!rc||typeof rc.u!=='number'||wins(rc,c)&&!(rc.u===c.u&&js(rc.v)===js(c.v))){if(!st.dirty[ns+'/'+k]||st.dirty[ns+'/'+k]!==c.u){st.dirty[ns+'/'+k]=c.u;n++}}
      });
    });
    if(n)save();return n;
  }
  function clearDirty(map){var n=0;Object.keys(map||{}).forEach(function(id){if(st.dirty[id]===map[id]){delete st.dirty[id];n++}});if(n)save();return n}
  function dirtyList(){return Object.assign({},st.dirty)}
  function exportAll(){return {app:'dev-easy',v:2,exportado:new Date().toISOString(),reg:JSON.parse(JSON.stringify(st.reg))}}
  /* aceita o backup novo e também o formato simples do protótipo ({studied:[...],fav:[...],last:'id'}) */
  function importAll(o){
    if(!o||typeof o!=='object')return -1;
    if(o.reg&&typeof o.reg==='object')return merge(o.reg,'backup',true);
    if(Array.isArray(o.studied)||Array.isArray(o.fav)){
      var t=+o.t||Date.now(),reg={done:{},fav:{},resume:{}};
      (o.studied||[]).forEach(function(i){if(typeof i==='string')reg.done[i]={v:1,u:t}});
      (o.fav||[]).forEach(function(i){if(typeof i==='string')reg.fav[i]={v:1,u:t}});
      if(typeof o.last==='string'&&o.last)reg.resume.cur={v:{id:o.last,sec:'top',f:0},u:t};
      return merge(reg,'backup',true);
    }
    return -1;
  }
  function wipe(){NS.forEach(function(n){st.reg[n]={}});st.dirty={};st.lastU=Date.now();save(true);emit({src:'local',wipe:true})}
  function init(){
    window.addEventListener('pagehide',function(){write()});
    document.addEventListener('visibilitychange',function(){if(document.visibilityState==='hidden')write()});
    /* duas abas abertas: o que uma salvar, a outra junta (senão a segunda sobrescreveria a primeira) */
    window.addEventListener('storage',function(e){
      if(e.key!==KEY||!e.newValue)return;
      try{var o=JSON.parse(e.newValue);if(o&&o.reg)merge(o.reg,'outra aba')}catch(x){}
    });
  }
  return {NS:NS,load:load,save:save,get:get,rec:rec,live:live,set:set,del:del,merge:merge,dirtyAgainst:dirtyAgainst,clearDirty:clearDirty,dirtyList:dirtyList,
    exportAll:exportAll,importAll:importAll,wipe:wipe,init:init,wins:wins,
    on:function(f){subs.push(f)},pref:function(){return st.loc},_st:st};
})();

/* conjuntos usados pelas telas (S.studied e S.fav) são refeitos a partir dos registros */
function rebuildSets(){
  S.studied=new Set(STORE.live('done').map(function(r){return r.k}).filter(function(i){return byId[i]}));
  S.fav=new Set(STORE.live('fav').map(function(r){return r.k}).filter(function(i){return byId[i]}));
}
/* compatibilidade com o motor de voz: as preferências da voz ficam só neste aparelho */
function saveLocal(){var l=STORE.pref();l.rate=S.rate;l.modo=S.modo;l.voz=S.voz;l.pausa=S.pausa;l.med=S.med;STORE.save()}
function loadLocal(){
  STORE.load();var l=STORE.pref();
  S.rate=l.rate||1;S.modo=l.modo==='aparelho'?'aparelho':'natural';S.voz=l.voz||'';if(l.pausa)S.pausa=l.pausa;if(l.med&&typeof l.med==='object')S.med=l.med;
  rebuildSets();
}
