/* ===== nuvem (Firebase): login com Google + Firestore =====
   Cada pessoa grava só em users/<id do login>/: data/main (progresso, favoritas, marcadores, último ponto) e notes/<id da ficha> (uma anotação por documento).
   O app funciona sem nuvem; ela só entra se firebase-config.js estiver preenchido e você entrar com o Google. */
const SYNC=(function(){
  var V='10.14.1',BASE='https://www.gstatic.com/firebasejs/'+V+'/',FLAG='dev-easy-sync';
  var cfg=window.DEVEASY_FIREBASE||null;if(cfg&&(!cfg.apiKey||!cfg.projectId))cfg=null;
  var s={state:cfg?'signedout':'off',user:null,last:0,err:''};
  var auth=null,db=null,ready=null,unM=null,unN=null,flushT=0,busy=false,first={m:false,n:false};
  var exiting=false,lastErrToast='';   /* exiting: o próprio usuário tocou em Sair (para a tela de login saber o motivo) */
  var fail={n:0,at:0},lastSig='';   /* falhas seguidas ao carregar o Firebase: espera cada vez mais antes de tentar de novo (nunca em laço) */
  function espera(){return Math.min(300000,15000*Math.pow(2,Math.max(0,fail.n-1)))}
  function sig(){return s.state+'|'+s.err+'|'+(s.user?s.user.uid:'')+'|'+s.last+'|'+Object.keys(STORE.dirtyList()).length}

  function loadScript(src){return new Promise(function(res,rej){var el=document.createElement('script');el.src=src;el.async=false;el.onload=res;el.onerror=function(){try{el.parentNode.removeChild(el)}catch(e){}rej({code:'sdk-offline',message:'Não consegui carregar o Firebase ('+src+')'})};document.head.appendChild(el)})}
  function loadSdk(){
    if(window.firebase&&firebase.auth&&firebase.firestore)return Promise.resolve();
    return loadScript(BASE+'firebase-app-compat.js').then(function(){return loadScript(BASE+'firebase-auth-compat.js')}).then(function(){return loadScript(BASE+'firebase-firestore-compat.js')});
  }
  function friendly(e){
    var c=(e&&e.code)||'',m=(e&&e.message)||'';
    if(c==='auth/popup-closed-by-user'||c==='auth/cancelled-popup-request'||c==='auth/user-cancelled')return '';
    if(c==='auth/popup-blocked')return 'O navegador bloqueou a janela de login. Libere pop-ups para este site e toque em Entrar de novo.';
    if(c==='auth/unauthorized-domain')return 'Este endereço não está liberado no Firebase. Em Authentication → Configurações → Domínios autorizados, adicione: '+location.hostname;
    if(c==='auth/operation-not-allowed')return 'O login com Google não está ativado. No Firebase: Authentication → Método de login → Google → Ativar.';
    if(c==='auth/network-request-failed'||c==='sdk-offline')return 'Não consegui falar com o Firebase: sem internet, ou a rede (empresa, escola) bloqueia o Google. O guia continua funcionando e salva neste aparelho.';
    if(c==='auth/internal-error')return 'Não consegui abrir o login do Google. Se a rede bloqueia o Google (empresa, escola), tente por outra rede, como o 4G. O guia continua funcionando neste aparelho.';
    if(c==='auth/operation-not-supported-in-this-environment')return 'O login só funciona quando o guia é aberto por um endereço http(s) (GitHub Pages ou o servidor local), não direto pelo arquivo.';
    if(c==='auth/web-storage-unsupported')return 'O navegador está bloqueando o armazenamento do site (aba anônima ou cookies bloqueados). Libere e tente de novo.';
    if(c==='auth/too-many-requests')return 'Muitas tentativas seguidas. Espere um pouco e tente de novo.';
    if(c==='auth/invalid-api-key'||c==='auth/api-key-not-valid.-please-pass-a-valid-api-key.')return 'A chave do Firebase no arquivo firebase-config.js está incorreta.';
    if(c==='permission-denied')return 'O Firestore recusou o acesso. No console do Firebase, confira se o banco foi criado (Firestore Database → Criar banco de dados) e se as regras do arquivo firestore.rules foram publicadas (aba Regras → Publicar).';
    if(c==='failed-precondition'||c==='not-found')return 'O banco Firestore ainda não foi criado no console do Firebase (Firestore Database → Criar banco de dados).';
    if(c==='unavailable')return 'Sem conexão com a nuvem agora. Tento de novo sozinho.';
    return (c?c+': ':'')+m.slice(0,160);
  }
  function ui(){
    if(s.state==='ok')lastErrToast='';
    if(typeof GATE!=='undefined')GATE.update();
    if(typeof UI!=='undefined'){UI.syncBadge();UI.side()}
    if(typeof S!=='undefined'&&S.view==='conta'&&typeof render==='function'){
      var sg=sig();if(sg===lastSig)return;lastSig=sg;
      var ae=document.activeElement;if(ae&&ae.id==='bkfile')return;
      var y=window.scrollY||0;render();window.scrollTo(0,y);
    }
  }
  function ensure(force){
    if(ready)return ready;
    if(navigator.onLine===false)return Promise.reject({code:'sdk-offline',message:'Sem internet.'});
    if(!force&&fail.n&&Date.now()-fail.at<espera())return Promise.reject({code:'sdk-offline',message:'Tentarei de novo daqui a pouco.',quiet:true});
    ready=loadSdk().then(function(){
      if(!firebase.apps.length)firebase.initializeApp(cfg);
      auth=firebase.auth();db=firebase.firestore();
      try{db.settings({ignoreUndefinedProperties:true,experimentalAutoDetectLongPolling:true,merge:true})}catch(e){}
      auth.onAuthStateChanged(onUser,onErr);
      fail.n=0;
      if(!s.user){if(s.state==='offline'||s.state==='error')s.state='signedout';s.err=''}      /* o aviso de "não consegui falar com o Firebase" some quando a conexão volta */
    }).catch(function(e){ready=null;fail.n++;fail.at=Date.now();throw e});
    return ready;
  }
  function falhou(e){if(e&&e.quiet)return;onErr(e)}
  function onUser(u){
    if(!u){
      var saiu=exiting;exiting=false;
      stop();s.user=null;s.state='signedout';if(saiu)s.err='';
      try{if(localStorage.getItem(FLAG)==='1')localStorage.setItem(FLAG,'0')}catch(e){}      /* tinha entrado antes e a sessão sumiu: da próxima vez já abre a tela de login */
      ui();
      if(typeof GATE!=='undefined')GATE.signedOut(saiu);
      return;
    }
    s.user={uid:u.uid,name:u.displayName||'',email:u.email||'',photo:u.photoURL||''};
    s.err='';
    try{localStorage.setItem(FLAG,'1')}catch(e){}
    if(typeof GATE!=='undefined')GATE.signedIn(s.user);
    start(u.uid);
  }
  function onErr(e){
    s.err=friendly(e);
    var c=(e&&e.code)||'';
    s.state=(!navigator.onLine||c==='unavailable'||c==='sdk-offline')?'offline':'error';
    ui();
    if(s.user&&s.state==='error'&&s.err&&s.err!==lastErrToast&&typeof UI!=='undefined'){lastErrToast=s.err;UI.toast(s.err,{ms:10000})}
    if(s.user&&(s.state==='offline'||c==='aborted'))schedule(15000);
  }
  function stop(){
    clearTimeout(flushT);flushT=0;busy=false;
    if(unM){try{unM()}catch(e){}unM=null}
    if(unN){try{unN()}catch(e){}unN=null}
    first={m:false,n:false};
  }
  function start(uid){
    stop();s.state='syncing';s.err='';ui();
    var base='users/'+uid,mainRef=db.doc(base+'/data/main'),notesCol=db.collection(base+'/notes');
    unM=mainRef.onSnapshot(function(sn){
      var d=sn.exists?sn.data():{};
      STORE.merge(d,'nuvem');
      if(!first.m){first.m=true;STORE.dirtyAgainst(d,['done','fav','mark','resume'])}
      afterRemote();
    },onErr);
    unN=notesCol.onSnapshot(function(qs){
      var o={note:{}};
      qs.docChanges().forEach(function(ch){if(ch.type!=='removed')o.note[ch.doc.id]=ch.doc.data()});
      STORE.merge(o,'nuvem');
      if(!first.n){first.n=true;STORE.dirtyAgainst(o,['note'])}
      afterRemote();
    },onErr);
  }
  function afterRemote(){
    if(!first.m||!first.n)return;
    if(Object.keys(STORE.dirtyList()).length)schedule(300);else{s.state='ok';s.err='';s.last=Date.now();ui()}
  }
  function schedule(ms){clearTimeout(flushT);if(!s.user||!db)return;flushT=setTimeout(flush,ms==null?1500:ms)}
  function same(a,b){return a.u===b.u&&JSON.stringify(a.v===undefined?null:a.v)===JSON.stringify(b.v===undefined?null:b.v)}
  function pushNote(id,u){
    var key=id.slice(5),rec=STORE.rec('note',key);if(!rec)return Promise.resolve();
    var ref=db.doc('users/'+s.user.uid+'/notes/'+key);
    return db.runTransaction(function(tx){
      return tx.get(ref).then(function(sn){
        var rem=sn.exists?sn.data():null;
        if(!rem||(STORE.wins(rem,rec)&&!same(rem,rec)))tx.set(ref,{v:rec.v===undefined?null:rec.v,u:rec.u});
        return rem;
      });
    }).then(function(rem){
      if(rem){var o={note:{}};o.note[key]=rem;STORE.merge(o,'nuvem')}
      var m={};m[id]=u;STORE.clearDirty(m);
    });
  }
  function pushMain(ids,dirty){
    var ref=db.doc('users/'+s.user.uid+'/data/main'),snap={};
    ids.forEach(function(id){var i=id.indexOf('/'),ns=id.slice(0,i),k=id.slice(i+1),r=STORE.rec(ns,k);if(r){(snap[ns]=snap[ns]||{})[k]={v:r.v===undefined?null:r.v,u:r.u}}});
    return db.runTransaction(function(tx){
      return tx.get(ref).then(function(sn){
        var rem=sn.exists?sn.data():{},out={},changed=false;
        Object.keys(snap).forEach(function(ns){
          out[ns]=Object.assign({},rem[ns]||{});
          Object.keys(snap[ns]).forEach(function(k){var rc=snap[ns][k],cur=out[ns][k];if(!cur||(STORE.wins(cur,rc)&&!same(cur,rc))){out[ns][k]=rc;changed=true}});
        });
        if(changed)tx.set(ref,out,{merge:true});
        return rem;
      });
    }).then(function(rem){
      STORE.merge(rem,'nuvem');
      var m={};ids.forEach(function(id){m[id]=dirty[id]});STORE.clearDirty(m);
    });
  }
  function flush(){
    flushT=0;
    if(!s.user||!db||busy||!first.m||!first.n)return;
    var dirty=STORE.dirtyList(),ids=Object.keys(dirty);
    if(!ids.length){s.state='ok';s.last=Date.now();ui();return}
    if(navigator.onLine===false){s.state='offline';ui();return}
    busy=true;s.state='syncing';ui();
    var mainIds=ids.filter(function(i){return i.indexOf('note/')!==0}),noteIds=ids.filter(function(i){return i.indexOf('note/')===0});
    var chain=Promise.resolve();
    if(mainIds.length)chain=chain.then(function(){return pushMain(mainIds,dirty)});
    for(var i=0;i<noteIds.length;i+=8){(function(part){chain=chain.then(function(){return Promise.all(part.map(function(id){return pushNote(id,dirty[id])}))})})(noteIds.slice(i,i+8))}
    chain.then(function(){
      busy=false;s.err='';s.last=Date.now();
      if(Object.keys(STORE.dirtyList()).length)schedule(500);else s.state='ok';
      ui();
    },function(e){busy=false;onErr(e)});
  }
  function init(){
    if(!cfg)return;
    STORE.on(function(info){
      if(!s.user||!info)return;
      if(info.src==='nuvem')return;
      var ids=Object.keys(STORE.dirtyList());if(!ids.length)return;
      var soResume=ids.every(function(i){return i.indexOf('resume/')===0});
      if(s.state==='ok')s.state='syncing';
      schedule(soResume?15000:1500);
    });
    window.addEventListener('online',function(){
      if(s.user){s.state='syncing';ui();schedule(300)}
      else if(!auth&&localStorage.getItem(FLAG)==='1'){ensure(true).then(function(){ui()},falhou)}
      else if(s.state==='offline'){s.state='signedout';ui()}
    });
    window.addEventListener('offline',function(){if(s.user){s.state='offline';ui()}});
    var want=false;try{want=localStorage.getItem(FLAG)==='1'}catch(e){}
    if(want)ensure().catch(falhou);
  }
  /* Devolve uma promessa que termina quando o login acaba (deu certo, foi cancelado ou deu erro). A janela do Google (popup) precisa ser aberta
     direto no toque do botão: por isso o SDK é carregado antes (prepare) e aqui não se espera por nada. */
  function signIn(){
    s.err='';
    if(!cfg)return Promise.resolve();
    if(!auth){
      s.err='Preparando o login… toque em Entrar de novo em um instante.';ui();
      return ensure(true).then(function(){s.err='';ui()},function(e){falhou(e)});
    }
    var p=new firebase.auth.GoogleAuthProvider();p.setCustomParameters({prompt:'select_account'});
    return auth.signInWithPopup(p).then(function(){},function(e){s.err=friendly(e);if(!s.user)s.state='signedout';ui()});
  }
  function signOut(){
    if(!auth)return;
    try{localStorage.setItem(FLAG,'0')}catch(e){}
    exiting=true;
    auth.signOut().catch(function(e){exiting=false;onErr(e)});
  }
  function syncNow(){
    if(!s.user)return;
    s.state='syncing';s.err='';ui();
    start(s.user.uid);        /* recomeça do zero: lê a nuvem de novo, junta com o local e envia o que faltar */
  }
  function badge(){
    switch(s.state){
      case 'off':return {cls:'off',text:'Só neste aparelho'};
      case 'signedout':return {cls:'out',text:'Entrar para sincronizar'};
      case 'syncing':return {cls:'busy',text:'Sincronizando…'};
      case 'ok':return {cls:'ok',text:'Sincronizado'};
      case 'offline':return {cls:'warn',text:'Sem internet'};
      default:return {cls:'bad',text:'Erro ao sincronizar'};
    }
  }
  return {init:init,badge:badge,signIn:signIn,signOut:signOut,syncNow:syncNow,preload:function(){lastSig=sig();if(cfg&&!auth)ensure().then(ui,falhou)},
    /* carrega o Firebase com antecedência (a tela de login chama ao abrir). Sempre termina; dá true se ficou pronto. */
    prepare:function(force){return cfg?ensure(force).then(function(){ui();return true},function(e){falhou(e);ui();return false}):Promise.resolve(false)},
    ready:function(){return !!auth},
    configured:function(){return !!cfg},user:function(){return s.user},state:function(){return s.state},error:function(){return s.err},last:function(){return s.last},
    pending:function(){return Object.keys(STORE.dirtyList()).length},projectId:function(){return cfg?cfg.projectId:''},
    firstName:function(){return s.user&&s.user.name?s.user.name.split(/\s+/)[0]:''},_s:s};
})();
