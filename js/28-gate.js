/* ===== tela de login: aparece antes do guia para quem ainda não entrou =====
   Duas saídas: "Entrar com Google" (guarda anotações, marcadores e progresso na nuvem) ou "Continuar sem entrar" (tudo fica só neste aparelho).
   Quem já entrou antes nem vê a tela. Sair da conta traz a tela de volta.
   Quem manda é a classe "gate-on" no <html>: o index.html a coloca antes de desenhar a página (para não piscar) e este arquivo a tira.
   Atenção: é uma porta de entrada para sincronizar, não um cofre. O texto do guia é público (o site é estático); o login protege só os dados de cada pessoa na nuvem. */
const GATE=(function(){
  var KL='dev-easy-local';                 /* "continuar sem entrar" escolhido neste aparelho */
  var el=null,shown=false,busy=false,slow=false,notice='',voluntary=false,skipMem=false,slowT=0;

  function root(){return document.documentElement}
  function isLocal(){if(skipMem)return true;try{return localStorage.getItem(KL)==='1'}catch(e){return false}}
  function setLocal(v){skipMem=!!v;try{if(v)localStorage.setItem(KL,'1');else localStorage.removeItem(KL)}catch(e){}}

  /* ----- desenho ----- */
  function paint(){
    if(!el||!shown)return;
    var main=$('#gate-in',el),skip=$('#gate-skip',el),msg=$('#gate-msg',el),card=$('.gate-card',el);
    var ready=SYNC.ready(),err=SYNC.error(),label='Entrar com Google',dis=false,text='',kind='';
    if(busy){label='Abrindo o Google…';dis=true;text='Termine o login na janela do Google.'}
    else if(!ready){
      if(err){label='Tentar de novo';text=err;kind='bad'}
      else if(slow){label='Tentar de novo';text='Está demorando para falar com o Google. A rede (empresa, escola) pode estar bloqueando. Dá para continuar sem entrar.';kind='warn'}
      else{label='Preparando o login…';dis=true}
    }else if(err){text=err;kind='bad'}
    else if(notice){text=notice}
    $('span',main).textContent=label;
    main.disabled=dis;
    msg.textContent=text;msg.hidden=!text;
    msg.className='gate-msg'+(kind?' '+kind:'');
    msg.setAttribute('role',kind?'alert':'status');
    skip.textContent=(isLocal()||voluntary)?'Voltar ao guia':'Continuar sem entrar';skip.disabled=false;
    card.setAttribute('aria-busy',dis&&!busy?'true':'false');
  }
  function facts(){
    var ul=$('#gate-facts',el);if(!ul)return;
    ul.innerHTML=['<b>'+UI.fmt(DATA.length)+'</b> fichas','Voz que lê para você','Abre sem internet'].map(function(t){return '<li>'+t+'</li>'}).join('');
  }

  /* ----- carregar o Firebase com antecedência ----- */
  /* A janela do Google só abre se for chamada direto no toque do botão, então o SDK precisa estar pronto antes do toque. */
  function prepare(force){
    clearTimeout(slowT);slow=false;
    slowT=setTimeout(function(){if(shown&&!SYNC.ready()){slow=true;paint()}},12000);
    SYNC.prepare(!!force).then(function(ok){if(ok){clearTimeout(slowT);slow=false}paint()});
  }

  /* ----- abrir e fechar ----- */
  function show(note,vol){
    if(!el||!SYNC.configured())return;
    notice=note||'';voluntary=!!vol;
    try{if(TTS.on)stopTTS()}catch(e){}
    if(typeof UI!=='undefined')UI.menu(false);
    root().classList.add('gate-on');shown=true;busy=false;
    if(!SYNC.ready())prepare(false);
    paint();
    var c=$('.gate-card',el);if(c)try{c.focus({preventScroll:true})}catch(e){}
  }
  function close(){
    if(!shown)return;
    shown=false;busy=false;notice='';voluntary=false;clearTimeout(slowT);
    root().classList.remove('gate-on');
    /* o app foi montado com a tela escondida (sem medidas): desenha de novo agora que ela aparece */
    try{
      UI.side();UI.syncBadge();render();window.scrollTo(0,0);window.dispatchEvent(new Event('resize'));
      var v=$('#view');if(v){v.setAttribute('tabindex','-1');v.focus({preventScroll:true})}      /* teclado e leitor de tela continuam do começo do conteúdo */
    }catch(e){if(window.console)console.error(e)}
  }

  /* ----- avisos que vêm do SYNC ----- */
  function signedIn(u){
    setLocal(false);
    if(!shown)return;
    var nome=(u&&u.name?u.name.split(/\s+/)[0]:'');
    close();
    UI.toast('Oi'+(nome?', '+nome:'')+'. Você entrou e já está sincronizando.',{ms:5000});
  }
  function signedOut(explicit){
    if(isLocal())return;            /* quem escolheu seguir sem conta não é chamado de volta */
    show(explicit?'Você saiu da conta. As anotações e o progresso continuam neste aparelho.':'');
  }

  /* ----- toques nos botões ----- */
  function press(){                  /* botão principal: entrar (ou tentar de novo, se o Google ainda não carregou) */
    if(busy)return;
    if(!SYNC.ready()){prepare(true);paint();return}
    busy=true;paint();
    SYNC.signIn().then(function(){busy=false;paint()});
  }
  function skip(){                   /* "Continuar sem entrar" / "Voltar ao guia" */
    var primeira=!isLocal();
    setLocal(true);close();
    if(primeira)UI.toast('Tudo certo. Seus dados ficam só neste aparelho. Para sincronizar, entre depois em Conta e nuvem.',{ms:7000});
  }

  function init(){
    el=document.getElementById('gate');
    if(!el||!SYNC.configured()){root().classList.remove('gate-on');shown=false;return}    /* sem nuvem configurada não há o que pedir */
    facts();
    shown=root().classList.contains('gate-on');
    el.dataset.pronto='1';
    if(shown){if(!SYNC.ready())prepare(false);paint();var c=$('.gate-card',el);if(c)try{c.focus({preventScroll:true})}catch(e){}}
    window.addEventListener('online',function(){if(shown&&!SYNC.ready())prepare(true)});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&shown&&voluntary){e.preventDefault();close()}});
    /* foto da conta que não carrega (rede que bloqueia o Google): troca pela inicial do nome */
    document.addEventListener('error',function(e){
      var t=e.target;if(!t||t.tagName!=='IMG'||!t.dataset||!t.dataset.ini)return;
      var sp=document.createElement('span');sp.className='av';sp.textContent=t.dataset.ini;t.replaceWith(sp);
    },true);
  }

  return {init:init,show:show,close:close,update:paint,press:press,skip:skip,signedIn:signedIn,signedOut:signedOut,
    visible:function(){return shown},local:isLocal};
})();

ACTS['gate-in']=function(){GATE.press()};
ACTS['gate-skip']=function(){GATE.skip()};
ACTS['gate-open']=function(){GATE.show('',true)};
