/* ===== ENIAC · 5 · janelas (modal), confete e pequenos ajudantes de tela =====
   O app não tinha janela própria (as confirmações dele são dentro da página); o ENIAC precisa de algumas: sair da lição, acabaram as vidas,
   conquistas e ajustes. Foco preso dentro da janela, Esc fecha (quando permitido), o resto da página fica "inerte" (sem foco nem leitor de tela). */
ENIAC.janela=(function(){
  var atual=null;
  function lista(raiz){return Array.prototype.slice.call(raiz.querySelectorAll('button,[href],input,select,textarea,[tabindex]')).filter(function(x){return !x.disabled&&x.tabIndex>=0&&x.offsetParent!==null})}
  function trava(on){
    document.body.classList.toggle('jg-modal',!!on);
    var app=document.getElementById('app');
    if(app){try{app.inert=!!on}catch(e){}}
  }
  /* quem usa só o teclado precisa conseguir rolar o miolo da janela (lista longa): quando ele rola, vira uma região que recebe foco */
  function rolavel(fundo){
    var jc=fundo.querySelector('.jg-jc'),jt=fundo.querySelector('.jg-jt');
    if(!jc)return;
    if(jc.scrollHeight>jc.clientHeight+1){jc.tabIndex=0;jc.setAttribute('role','region');if(jt)jc.setAttribute('aria-labelledby',jt.id)}
    else{jc.removeAttribute('tabindex');jc.removeAttribute('role');jc.removeAttribute('aria-labelledby')}
  }
  /* opções: titulo, html (já escapado por quem chama), botoes [{rotulo, tipo:'prim'|'perigo'|'', acao, fica}], comEsc (padrão true), aoFechar, classe, foco (seletor) */
  function abrir(o){
    fechar(true);
    var fundo=document.createElement('div');
    fundo.className='jg-fundo';
    fundo.innerHTML='<div class="jg-janela'+(o.classe?' '+o.classe:'')+'" role="dialog" aria-modal="true" aria-labelledby="jg-jt" tabindex="-1">'+
      '<h2 class="jg-jt" id="jg-jt">'+esc(o.titulo)+'</h2><div class="jg-jc">'+(o.html||'')+'</div><div class="jg-ja"></div></div>';
    var acoes=fundo.querySelector('.jg-ja');
    (o.botoes||[]).forEach(function(b){
      var el=document.createElement('button');
      el.type='button';
      el.className='btn jg-jb'+(b.tipo==='prim'?'':' ghost')+(b.tipo==='perigo'?' perigo':'');
      el.textContent=b.rotulo;
      el.addEventListener('click',function(){
        if(!b.fica)fechar();
        if(b.acao)b.acao();
      });
      acoes.appendChild(el);
    });
    if(!acoes.children.length)acoes.remove();
    atual={fundo:fundo,anterior:document.activeElement,comEsc:o.comEsc!==false,aoFechar:o.aoFechar||null};
    document.body.appendChild(fundo);
    trava(true);
    rolavel(fundo);
    var alvo=(o.foco&&fundo.querySelector(o.foco))||fundo.querySelector('.jg-ja .btn')||fundo.querySelector('.jg-janela');
    try{alvo.focus({preventScroll:true})}catch(e){}
    return fundo;
  }
  function fechar(silencioso){
    if(!atual)return;
    var a=atual;atual=null;
    a.fundo.remove();
    trava(false);
    if(!silencioso){try{if(a.anterior&&a.anterior.isConnected&&a.anterior.focus)a.anterior.focus({preventScroll:true})}catch(e){}}
  }
  document.addEventListener('keydown',function(e){
    if(!atual)return;
    if(e.key==='Escape'){
      e.preventDefault();e.stopPropagation();
      if(atual.comEsc){var f=atual.aoFechar;fechar();if(f)f()}
      return;
    }
    if(e.key==='Tab'){
      var it=lista(atual.fundo),jan=atual.fundo.querySelector('.jg-janela');
      if(!it.length){e.preventDefault();return}
      var a=it[0],z=it[it.length-1],ae=document.activeElement;
      if(e.shiftKey&&(ae===a||ae===jan)){e.preventDefault();z.focus()}
      else if(!e.shiftKey&&ae===z){e.preventDefault();a.focus()}
      else if(!atual.fundo.contains(ae)){e.preventDefault();a.focus()}
    }
  },true);
  /* troca o conteúdo da janela aberta, sem fechá-la (ex.: "tem certeza?" dentro dos ajustes) */
  function trocar(titulo,html,botoes){
    if(!atual)return;
    var fundo=atual.fundo,jan=fundo.querySelector('.jg-janela');
    fundo.querySelector('.jg-jt').textContent=titulo;
    fundo.querySelector('.jg-jc').innerHTML=html;
    var acoes=fundo.querySelector('.jg-ja');
    if(!acoes){acoes=document.createElement('div');acoes.className='jg-ja';jan.appendChild(acoes)}
    acoes.innerHTML='';
    (botoes||[]).forEach(function(b){
      var el=document.createElement('button');
      el.type='button';el.className='btn jg-jb'+(b.tipo==='prim'?'':' ghost')+(b.tipo==='perigo'?' perigo':'');
      el.textContent=b.rotulo;
      el.addEventListener('click',function(){if(!b.fica)fechar();if(b.acao)b.acao()});
      acoes.appendChild(el);
    });
    rolavel(fundo);
    var f=acoes.querySelector('.btn')||jan;try{f.focus({preventScroll:true})}catch(e){}
  }
  return {abrir:abrir,fechar:fechar,trocar:trocar,aberta:function(){return !!atual},raiz:function(){return atual?atual.fundo:null}};
})();

/* confete leve: some sozinho; com "reduzir movimento" nem é criado */
ENIAC.confete=function(caixa){
  if(!caixa)return;
  try{if(UI.reduced())return}catch(e){}
  var cores=['#2DD4BF','#FFC24B','#60A5FA','#F472B6','#FB923C','#A78BFA'];
  for(var k=0;k<30;k++){
    var p=document.createElement('i');
    p.style.background=cores[k%cores.length];
    p.style.setProperty('--dx',Math.round((Math.random()-.5)*380)+'px');
    p.style.setProperty('--dy',Math.round(140+Math.random()*300)+'px');
    p.style.setProperty('--rot',Math.round((Math.random()-.5)*760)+'deg');
    p.style.animationDelay=Math.round(Math.random()*260)+'ms';
    caixa.appendChild(p);
  }
  setTimeout(function(){if(caixa.isConnected)caixa.textContent=''},2800);
};

/* rola até o elemento só o necessário (com "reduzir movimento" o salto é direto) */
ENIAC.rolar=function(el,bloco){
  if(!el||!el.scrollIntoView)return;
  var rd=false;try{rd=UI.reduced()}catch(e){}
  try{el.scrollIntoView({block:bloco||'nearest',behavior:rd?'auto':'smooth'})}catch(e){el.scrollIntoView()}
};
