/* ===== ENIAC · 8 · botões, telas no roteador e início =====
   Liga o ENIAC ao resto do app:
   - telas:    VIEWS.jogos (trilha, #/jogos) e VIEWS.jogo (lição, #/jogo/<id>), registradas aqui; o endereço de cada uma está em js/22-views.js
   - botões:   ACTS["jg-..."] (o clique em qualquer [data-act] chega por js/22-views.js)
   - ganchos:  ENIAC.iniciar() (boot), ENIAC.depois() (depois de cada tela desenhada, em UI.after), ENIAC.guarda() e ENIAC.aoVoltar() (sair no meio da lição) */
VIEWS.jogos=function(){return ENIAC.trilha.html()};
VIEWS.jogo=function(){return ENIAC.jogador.html()};

/* trilha */
ACTS.jogos=function(){go('jogos')};
ACTS['jg-continuar']=function(){ENIAC.trilha.continuar()};
ACTS['jg-abrir']=function(t,id){ENIAC.trilha.abrir(id)};
ACTS['jg-un']=function(t,id){ENIAC.trilha.alternar(id)};
ACTS['jg-conquistas']=function(){ENIAC.trilha.conquistas()};
ACTS['jg-config']=function(){ENIAC.trilha.ajustes()};
ACTS['jg-liberar']=function(){ENIAC.trilha.liberar()};
ACTS['jg-reiniciar']=function(){ENIAC.trilha.reiniciar()};
ACTS['jg-tentar-trilha']=function(){ENIAC.carregarManifesto(true).then(function(){},function(){});if(S.view==='jogos')render()};
/* lição */
ACTS['jg-comecar']=function(){ENIAC.jogador.comecar()};
ACTS['jg-verificar']=function(){ENIAC.jogador.verificar()};
ACTS['jg-seguir']=function(){ENIAC.jogador.seguir()};
ACTS['jg-sair']=function(){ENIAC.jogador.sair()};
ACTS['jg-resumo']=function(){ENIAC.jogador.resumo()};
ACTS['jg-trilha']=function(){ENIAC.jogador.voltarTrilha()};
ACTS['jg-proxima']=function(){ENIAC.jogador.proxima()};
ACTS['jg-refazer']=function(){ENIAC.jogador.refazer()};
ACTS['jg-tentar']=function(){ENIAC.jogador.tentar()};

/* chamado por UI.after() depois de cada tela desenhada */
ENIAC.depois=function(){
  var v=S.view;
  document.body.classList.toggle('jg-foco',v==='jogo');       /* na lição o cabeçalho com a busca some (modo foco) */
  if(v==='jogo')ENIAC.jogador.montar();
  else{
    ENIAC.jogador.soltar();                                    /* saiu da lição: a sessão acaba */
    if(v==='jogos')ENIAC.trilha.montar();
  }
};
ENIAC.titulo=function(){
  if(S.view==='jogos')return 'ENIAC · DEV EASY';
  if(S.view==='jogo')return ENIAC.jogador.titulo();
  return '';
};
ENIAC.guarda=function(prosseguir){return ENIAC.jogador.guarda(prosseguir)};
ENIAC.aoVoltar=function(e){return ENIAC.jogador.aoVoltar(e)};

/* quando o manifesto chega (ou falha), o que depende dele se atualiza no lugar: menu, cartão do painel, trilha */
ENIAC.atualizar=function(){
  try{UI.side()}catch(e){}
  if(S.view==='jogos'){var y=window.scrollY||0;render();window.scrollTo(0,y)}
  else if(S.view==='home'){
    var el=document.querySelector('#view .jg-cta');
    if(el){var t=document.createElement('div');t.innerHTML=ENIAC.trilha.cartao();if(t.firstChild)el.replaceWith(t.firstChild)}
  }
};

/* início (chamado pelo boot() de js/22-views.js, depois de carregar os dados salvos) */
ENIAC.iniciar=function(){
  try{ENIAC.est.migrar()}catch(e){if(window.console)console.error(e)}
  ENIAC.aoMudar(ENIAC.atualizar);
  /* com o app em repouso, traz o manifesto (número do menu e botão Continuar do painel); depois guarda o curso para uso sem internet */
  function trazer(){ENIAC.carregarManifesto().then(function(){setTimeout(ENIAC.aquecer,4000)},function(){})}
  if(window.requestIdleCallback)window.requestIdleCallback(trazer,{timeout:4000});else setTimeout(trazer,1500);
};
