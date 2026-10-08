/* ===== tela "Conta e nuvem": login, backup, tema, instalar ===== */
const ACC=(function(){
  var deferred=null;
  function card(t,sub,body){return '<section class="gl card acct"><div class="gh"><div><h2 class="gt">'+t+'</h2>'+(sub?'<p class="gsub">'+sub+'</p>':'')+'</div></div>'+body+'</section>'}
  function cloud(){
    if(!SYNC.configured())return card('Nuvem (Firebase)','Desligada','<p>Seus dados ficam só neste aparelho. Para ter o mesmo guia em casa, no trabalho e no celular, preencha o arquivo <code>firebase-config.js</code> (passo a passo no README).</p>');
    var u=SYNC.user(),b=SYNC.badge(),err=SYNC.error();
    if(!u){
      return card('Nuvem (Firebase)','Entre para sincronizar',
        '<p>Entre com o Google para guardar anotações, marcadores e progresso na nuvem e abrir tudo em qualquer aparelho.</p>'+
        '<div class="acts"><button class="btn" data-act="sy-in">Entrar com Google</button></div>'+
        (err?'<p class="note bad" role="alert">'+esc(err)+'</p>':'<p class="note">O login só serve para separar seus dados dos de outras pessoas.</p>'));
    }
    var last=SYNC.last()?DASH.ago(SYNC.last()):'ainda não';
    return card('Nuvem (Firebase)','Conectada',
      '<div class="who">'+(u.photo?'<img src="'+esc(u.photo)+'" alt="" width="44" height="44" referrerpolicy="no-referrer">':'<span class="av">'+esc((u.name||u.email||'?').charAt(0).toUpperCase())+'</span>')+'<span><b>'+esc(u.name||'Conta Google')+'</b><small>'+esc(u.email)+'</small></span></div>'+
      '<p class="stline"><i class="sdot '+b.cls+'"></i><b>'+esc(b.text)+'</b> · última sincronização: '+last+(SYNC.pending()?' · '+SYNC.pending()+' item(ns) para enviar':'')+'</p>'+
      '<div class="acts"><button class="btn sm" data-act="sy-now">Sincronizar agora</button><button class="btn ghost sm" data-act="sy-out">Sair</button></div>'+
      (err?'<p class="note bad" role="alert">'+esc(err)+'</p>':''));
  }
  function backup(){
    return card('Backup','Uma cópia sua, em arquivo',
      '<p>Baixe um arquivo com suas anotações, marcadores e progresso. Dá para restaurar depois, mesmo em outro aparelho. Restaurar junta com o que já existe, e vale sempre o item mais novo.</p>'+
      '<div class="acts"><button class="btn ghost sm" data-act="bk-save">'+ICON.down+' Baixar backup</button><button class="btn ghost sm" data-act="bk-load">'+ICON.up+' Restaurar backup</button><input type="file" id="bkfile" accept=".json,application/json" hidden></div>');
  }
  function tema(){
    var t=UI.theme();
    return card('Aparência','Tema '+UI.themeLabel(t).toLowerCase(),'<div class="chips" role="group" aria-label="Tema">'+[['dark','Escuro'],['light','Claro'],['auto','Automático']].map(function(o){return '<button class="chip" data-act="tema-set" data-t="'+o[0]+'" aria-pressed="'+(t===o[0])+'">'+o[1]+'</button>'}).join('')+'</div>');
  }
  function instalar(){
    return card('Instalar como app','Abre mais rápido e em tela cheia',
      (deferred?'<div class="acts"><button class="btn sm" data-act="app-inst">Instalar o DEV EASY</button></div>':'<p>No celular: menu do navegador → <b>Adicionar à tela inicial</b>. No computador: ícone de instalar na barra de endereço (Chrome e Edge).</p>')+
      '<p class="note">As fichas e as demonstrações funcionam sem internet depois da primeira visita. O áudio gravado precisa de internet.</p>');
  }
  function dados(){
    var nn=STORE.live('note').filter(function(r){return byId[r.k]}),ch=nn.reduce(function(a,r){return a+String(r.v).length},0);
    var ask=S.wipeAsk;
    return card('Dados deste aparelho','',
      '<ul class="kv"><li><span>Fichas entendidas</span><b>'+S.studied.size+'</b></li><li><span>Favoritas</span><b>'+S.fav.size+'</b></li><li><span>Anotações</span><b>'+nn.length+'</b><small>'+UI.fmt(ch)+' letras</small></li><li><span>Marcadores</span><b>'+STORE.live('mark').filter(function(r){return r.v&&byId[r.v.id]}).length+'</b></li></ul>'+
      (ask?'<p class="note bad" role="alert">Apagar anotações, marcadores e progresso <b>deste aparelho</b>? '+(SYNC.user()?'A cópia na nuvem continua e volta quando você sincronizar.':'Não há cópia na nuvem: baixe um backup antes se quiser guardar.')+'</p><div class="acts"><button class="btn danger sm" data-act="wipe-yes">Sim, apagar</button><button class="btn ghost sm" data-act="wipe-no">Cancelar</button></div>'
           :'<div class="acts"><button class="btn ghost sm" data-act="wipe-ask">Apagar dados deste aparelho</button></div>'));
  }
  function vConta(){
    return '<div class="conta-view"><p class="eyebrow" style="margin-top:6px">Ajustes</p><h1>Conta e nuvem</h1><p class="lead">Para ter as mesmas anotações e marcadores em casa, no trabalho e no celular.</p><div class="grid2">'+cloud()+backup()+tema()+instalar()+dados()+'</div></div>';
  }
  ACTS['sy-in']=function(){SYNC.signIn()};
  ACTS['sy-out']=function(){SYNC.signOut()};
  ACTS['sy-now']=function(){SYNC.syncNow()};
  ACTS['tema-set']=function(t){UI.setTheme(t.dataset.t);UI.side();render()};
  ACTS['bk-save']=function(){var d=new Date(),p=function(n){return n<10?'0'+n:n};UI.download('dev-easy-backup-'+d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())+'.json',JSON.stringify(STORE.exportAll(),null,2),'application/json')};
  ACTS['bk-load']=function(){var f=$('#bkfile');if(f)f.click()};
  ACTS['app-inst']=function(){if(!deferred)return;deferred.prompt();deferred.userChoice.then(function(){deferred=null;if(S.view==='conta')render()},function(){})};
  ACTS['wipe-ask']=function(){S.wipeAsk=true;render()};
  ACTS['wipe-no']=function(){S.wipeAsk=false;render()};
  ACTS['wipe-yes']=function(){S.wipeAsk=false;STORE.wipe();UI.toast('Dados deste aparelho apagados.');render()};
  document.addEventListener('change',function(e){
    var t=e.target;if(!t||t.id!=='bkfile'||!t.files||!t.files[0])return;
    var r=new FileReader();
    r.onload=function(){
      var n=-1;try{n=STORE.importAll(JSON.parse(String(r.result)))}catch(x){n=-1}
      UI.toast(n<0?'Esse arquivo não parece um backup do DEV EASY.':(n===0?'Backup lido. Nada novo para juntar.':'Backup restaurado: '+n+(n===1?' item juntado.':' itens juntados.')));
      t.value='';if(S.view==='conta')render();
    };
    r.onerror=function(){UI.toast('Não consegui ler o arquivo.')};
    r.readAsText(t.files[0]);
  });
  window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();deferred=e;if(S.view==='conta')render()});
  window.addEventListener('appinstalled',function(){deferred=null});
  VIEWS.conta=vConta;
  return {after:function(){if(S.view==='conta')SYNC.preload()}};
})();
