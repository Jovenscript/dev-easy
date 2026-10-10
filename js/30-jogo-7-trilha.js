/* ===== ENIAC · 7 · a trilha (tela #/jogos), conquistas, ajustes, cartão do painel e número do menu =====
   A trilha mostra as unidades como seções (a que tem a próxima lição fica aberta, as outras recolhidas) e, dentro de cada uma, as lições como
   bolinhas num caminho que serpenteia. Estados de cada bolinha: bloqueada (cadeado), disponível (play), concluída (✓ e 1 a 3 estrelas; anel dourado se perfeita). */
ENIAC.trilha=(function(){
  var ic=ENIAC.ic,robo=ENIAC.robo;
  var RH=108;                               /* altura de cada linha do caminho, em px (o desenho do fio usa o mesmo número) */

  function plural(n,um,varios){return n+' '+(n===1?um:varios)}
  function numL(id){return parseInt(String(id).slice(4),10)||0}
  function numU(u){return parseInt(String(u.id).slice(1),10)||0}
  function dataBR(d){var p=String(d).split('-');return p.length===3?p[2]+'/'+p[1]+'/'+p[0]:String(d)}

  /* ----- o que o botão "Continuar" abre ----- */
  function alvo(){
    var px=ENIAC.est.proxima();
    if(px)return {m:px,rot:ENIAC.est.resumo().comecou?'Continuar':'Começar'};
    var mf=ENIAC.est.maisFraca();
    if(mf)return {m:mf,rot:'Praticar de novo'};
    return null;
  }
  /* a fala do robô e o jeito dele */
  function mensagem(){
    var r=ENIAC.est.resumo(),q=r.seq;
    if(!r.comecou)return {rb:'feliz',t:'Oi! Vamos aprender Python?',s:'Comece pela primeira lição. São poucos minutos por vez.'};
    if(r.total&&r.feitas>=r.total)return {rb:'comemorando',t:'Você concluiu todas as lições!',s:'Refaça as que ficaram com menos de 3 estrelas para treinar.'};
    if(q.hoje)return {rb:'feliz',t:'Boa! Você já praticou hoje.',s:'Sequência de '+plural(q.n,'dia','dias')+'. Que tal mais uma lição?'};
    if(q.n>0)return {rb:'normal',t:'Sua sequência é de '+plural(q.n,'dia','dias')+'.',s:'Faça uma lição hoje para mantê-la.'};
    return {rb:'normal',t:'Que bom ver você de volta!',s:'Continue de onde parou.'};
  }

  /* ----- unidades abertas e fechadas (só neste aparelho) ----- */
  function ab(){var p=STORE.pref();return (p.jogoAb&&typeof p.jogoAb==='object')?p.jogoAb:{}}
  function unidadeAtual(){
    var px=ENIAC.est.proxima(),us=ENIAC.unidades();
    if(px)return px.un;
    return us.length?us[us.length-1].id:'';
  }
  function aberta(u){var a=ab();return a[u.id]!==undefined?!!a[u.id]:u.id===unidadeAtual()}
  function lembrar(uid,v){var p=STORE.pref();if(!p.jogoAb||typeof p.jogoAb!=='object')p.jogoAb={};p.jogoAb[uid]=!!v;STORE.save()}

  /* ----- peças ----- */
  function estrelas(n){
    var h='<span class="jg-estr" aria-hidden="true">';
    for(var i=1;i<=3;i++)h+='<span class="'+(i<=n?'on':'')+'">'+ic('star')+'</span>';
    return h+'</span>';
  }
  function no(m,k,x,atualId){
    var E=ENIAC.est,feita=E.feita(m.id),lib=E.liberada(m.g),est=E.estrelas(m.id),atual=(m.id===atualId);
    var cls='jg-no '+(feita?'feita':(lib?'livre':'trancada'))+(est>=3?' perfeita':'')+(atual?' atual':'');
    var estado=feita?('concluída, '+est+(est===1?' estrela':' estrelas')):(lib?'disponível':'bloqueada');
    return '<li class="jg-li lado-'+(x>=52?'e':'d')+'" style="--x:'+x+'">'+
      '<button type="button" class="'+cls+'" data-act="jg-abrir" data-id="'+esc(m.id)+'"'+(lib?'':' aria-disabled="true"')+
      ' aria-label="Lição '+numL(m.id)+': '+esc(m.titulo)+', '+estado+(atual?'. É a próxima lição':'')+'">'+ic(feita?'check':(lib?'play':'lock'))+(feita?estrelas(est):'')+'</button>'+
      '<div class="jg-rotulo" aria-hidden="true"><span class="jg-ln">Lição '+numL(m.id)+'</span><b>'+esc(m.titulo)+'</b>'+(atual?'<em class="jg-tag">Próxima</em>':'')+'</div></li>';
  }
  function caminho(u,atualId){
    var n=u.licoes.length,xs=u.licoes.map(function(_,k){return Math.round(50+28*Math.sin(k*Math.PI/4))});
    var svg='<svg class="jg-fio" viewBox="0 0 100 '+(n*RH)+'" preserveAspectRatio="none" aria-hidden="true" focusable="false">';
    for(var k=0;k<n-1;k++){
      var y1=k*RH+RH/2,y2=(k+1)*RH+RH/2,cy=(y1+y2)/2,feito=ENIAC.est.feita(u.licoes[k].id);
      svg+='<path'+(feito?' class="on"':'')+' d="M'+xs[k]+' '+y1+'C'+xs[k]+' '+cy+' '+xs[k+1]+' '+cy+' '+xs[k+1]+' '+y2+'"/>';
    }
    svg+='</svg>';
    return '<div class="jg-cam" style="--rh:'+RH+'px">'+svg+'<ol class="jg-nos" aria-label="Lições da unidade '+numU(u)+'">'+
      u.licoes.map(function(m,i){return no(m,i,xs[i],atualId)}).join('')+'</ol></div>';
  }
  function unidade(u,atualId){
    var inf=ENIAC.est.unidadeInfo(u),pct=inf.total?Math.round(100*inf.feitas/inf.total):0,op=aberta(u),id='jg-un-'+esc(u.id);
    return '<section class="gl jg-un'+(inf.completa?' completa':'')+(op?' aberta':'')+'" data-un="'+esc(u.id)+'">'+
      '<h2 class="jg-un-h"><button type="button" class="jg-un-cab" data-act="jg-un" data-id="'+esc(u.id)+'" aria-expanded="'+op+'" aria-controls="'+id+'">'+
        '<span class="jg-un-num">'+(inf.completa?ic('check'):'')+'Unidade '+numU(u)+(inf.completa?' · concluída':'')+'</span>'+
        '<b class="jg-un-t">'+esc(u.titulo)+'</b>'+
        (u.descricao?'<span class="jg-un-d">'+esc(u.descricao)+'</span>':'')+
        '<span class="jg-un-pg"><span class="jg-pb" role="progressbar" aria-label="Lições concluídas na unidade '+numU(u)+'" aria-valuemin="0" aria-valuemax="'+inf.total+'" aria-valuenow="'+inf.feitas+'"><i style="width:'+pct+'%"></i></span><em>'+inf.feitas+'/'+inf.total+'</em></span>'+
        ic('chevron','jg-chev')+'</button></h2>'+
      '<div class="jg-un-corpo" id="'+id+'"'+(op?'':' hidden')+'>'+caminho(u,atualId)+'</div></section>';
  }
  function hero(){
    var r=ENIAC.est.resumo(),msg=mensagem(),nv=r.nivel,a=alvo(),cq=ENIAC.est.listaConquistas(),ganhas=cq.filter(function(c){return c.data}).length;
    return '<section class="gl jg-hero" aria-label="Seu progresso no ENIAC">'+
      '<p class="jg-et">Curso de Python</p><h1 class="jg-h1">ENIAC</h1>'+
      '<div class="jg-fala">'+robo(msg.rb,92,'jg-hero-rb')+'<div class="jg-balao"><b>'+esc(msg.t)+'</b><span>'+esc(msg.s)+'</span></div></div>'+
      '<ul class="jg-stats" aria-label="Seus números">'+
        '<li class="jg-stat nivel"><span class="jg-stat-t">Nível</span><b>'+nv.n+'</b><div class="jg-pb" role="progressbar" aria-label="Progresso no nível '+nv.n+'" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+nv.pct+'"><i style="width:'+nv.pct+'%"></i></div><small>'+nv.dentro+' de '+nv.precisa+' XP</small></li>'+
        '<li class="jg-stat seq">'+ic('flame')+'<b>'+r.seq.n+'</b><span>'+(r.seq.n===1?'dia seguido':'dias seguidos')+'</span></li>'+
        '<li class="jg-stat xp">'+ic('bolt')+'<b>'+UI.fmt(r.xp)+'</b><span>XP total</span></li>'+
      '</ul>'+
      (a?'<button type="button" class="btn jg-continuar" data-act="jg-continuar"><span class="jg-cont-t"><b>'+esc(a.rot)+'</b><small>Lição '+numL(a.m.id)+': '+esc(a.m.titulo)+'</small></span>'+ic('play')+'</button>':'')+
      '<div class="jg-hero-bt"><button type="button" class="btn ghost" data-act="jg-conquistas">'+ic('trofeu')+' Conquistas <span class="jg-cnt">'+ganhas+'/'+cq.length+'</span></button>'+
      '<button type="button" class="btn ghost" data-act="jg-config">'+ic('ajustes')+' Ajustes</button></div></section>';
  }

  /* ----- a tela ----- */
  function estado(rb,titulo,texto,botoes){
    return '<div class="jg jg-trilha"><div class="jg-estado" role="status"><h1 class="sr-so">ENIAC</h1>'+robo(rb,120)+'<p class="jg-estado-t">'+esc(titulo)+'</p>'+(texto?'<p>'+esc(texto)+'</p>':'')+
      (botoes?'<div class="jg-estado-bt">'+botoes+'</div>':'')+'</div></div>';
  }
  function html(){
    if(!ENIAC.pronto()){
      if(ENIAC.erroManifesto())return estado('errou','Não consegui carregar as lições','Confira a conexão e tente de novo. Depois da primeira vez, o ENIAC funciona sem internet.','<button type="button" class="btn" data-act="jg-tentar-trilha">'+ic('refazer')+' Tentar de novo</button>');
      ENIAC.carregarManifesto().then(function(){},function(){});
      return estado('pensando','Carregando as lições…','','');
    }
    var us=ENIAC.unidades();
    if(!us.length)return estado('normal','Ainda não há lições por aqui','As lições chegam em breve.','');
    var atual=ENIAC.est.proxima(),atualId=atual?atual.id:'';
    return '<div class="jg jg-trilha">'+hero()+'<div class="jg-lista">'+us.map(function(u){return unidade(u,atualId)}).join('')+
      '<p class="jg-rodape">Seu progresso fica salvo neste aparelho e, se você entrou na conta, também na nuvem. Depois de abrir o ENIAC uma vez com internet, ele funciona sem conexão.</p></div></div>';
  }
  function montar(){
    var id=ENIAC.foco;ENIAC.foco=null;
    if(!id)return;
    setTimeout(function(){
      if(S.view!=='jogos')return;
      var b=document.querySelector('.jg-no[data-id="'+id+'"]');
      if(b&&b.offsetParent!==null)ENIAC.rolar(b,'center');
    },40);
  }

  /* ----- ações da trilha ----- */
  function alternar(uid){
    var sec=document.querySelector('.jg-un[data-un="'+uid+'"]');
    if(!sec)return;
    var b=sec.querySelector('.jg-un-cab'),corpo=sec.querySelector('.jg-un-corpo'),abre=corpo.hidden;
    corpo.hidden=!abre;b.setAttribute('aria-expanded',abre?'true':'false');sec.classList.toggle('aberta',abre);
    lembrar(uid,abre);
  }
  function continuar(){
    if(!ENIAC.pronto()){go('jogos');return}
    var a=alvo();
    if(!a){go('jogos');return}
    abrir(a.m.id);
  }
  function abrir(id){
    var m=ENIAC.meta(id);
    if(!m)return;
    if(!ENIAC.est.liberada(m.g)){UI.toast('Conclua a lição anterior para liberar esta.');return}
    lembrar(m.un,true);
    ENIAC.jogador.abrir(id);
  }
  function conquistas(){
    var lista=ENIAC.est.listaConquistas(),n=lista.filter(function(c){return c.data}).length;
    ENIAC.janela.abrir({titulo:'Conquistas · '+n+' de '+lista.length,classe:'jg-j-conq',
      html:'<ul class="jg-conq">'+lista.map(function(c){
        return '<li class="jg-cq'+(c.data?' ok':'')+'"><span class="jg-med">'+ic(c.data?c.ic:'lock')+'</span><div><b>'+esc(c.t)+'</b><small>'+esc(c.d)+'</small>'+
          (c.data?'<em>Conquistada em '+dataBR(c.data)+'</em>':'<em class="fechada">Ainda bloqueada</em>')+'</div></li>';
      }).join('')+'</ul>',
      botoes:[{rotulo:'Fechar',tipo:'prim'}]});
  }
  function ajustesHtml(){
    var on=ENIAC.est.cfg().liberarTudo;
    return '<div class="jg-aj"><div class="jg-aj-l"><b id="jg-sw-t">Liberar todas as lições</b><small id="jg-sw-d">Abre toda a trilha, sem precisar concluir a lição anterior.</small></div>'+
      '<button type="button" class="jg-sw" id="jg-sw" role="switch" aria-checked="'+on+'" aria-labelledby="jg-sw-t" aria-describedby="jg-sw-d" data-act="jg-liberar"><i></i></button></div>'+
      '<div class="jg-aj"><div class="jg-aj-l"><b>Reiniciar progresso</b><small>Apaga o XP, a sequência, as lições concluídas e as conquistas do ENIAC.</small></div>'+
      '<button type="button" class="btn ghost sm jg-perigo" data-act="jg-reiniciar">Apagar tudo</button></div>';
  }
  function ajustes(){
    ENIAC.janela.abrir({titulo:'Ajustes do ENIAC',classe:'jg-j-aj',html:ajustesHtml(),botoes:[{rotulo:'Fechar',tipo:'prim'}],foco:'#jg-sw'});
  }
  function liberar(){
    var nv=!ENIAC.est.cfg().liberarTudo;
    ENIAC.est.setCfg('liberarTudo',nv);
    var sw=document.getElementById('jg-sw');
    if(sw)sw.setAttribute('aria-checked',nv?'true':'false');
    if(S.view==='jogos'){var y=window.scrollY||0;render();window.scrollTo(0,y)}
    else if(S.view==='home'){render()}
  }
  function reiniciar(){
    ENIAC.janela.trocar('Apagar o progresso do ENIAC?',
      '<div class="jg-jrobo">'+robo('pensando',84)+'</div><p>Isso apaga o XP, a sequência, as lições concluídas e as conquistas do ENIAC <b>neste aparelho e na sua conta</b>. Não dá para desfazer.</p>',
      [{rotulo:'Cancelar',tipo:'prim',acao:ajustes},
       {rotulo:'Apagar tudo',tipo:'perigo',acao:function(){ENIAC.est.reiniciar();UI.toast('Progresso do ENIAC apagado.');render();window.scrollTo(0,0)}}]);
  }

  /* ----- cartão do painel e item do menu ----- */
  function cartao(){
    var r=ENIAC.est.resumo(),a=r.pronto?alvo():null,pct=r.total?Math.round(100*r.feitas/r.total):0;
    var sub=r.comecou
      ?r.feitas+(r.total?' de '+r.total:'')+(r.feitas===1?' lição concluída':' lições concluídas')+' · nível '+r.nivel.n+' · '+UI.fmt(r.xp)+' XP'+(r.seq.n?' · '+plural(r.seq.n,'dia seguido','dias seguidos'):'')
      :'Lições curtas de Python com quiz, caça ao bug e outros desafios. Funciona sem internet.';
    var rb=!r.comecou?'feliz':(r.total&&r.feitas>=r.total?'comemorando':(r.seq.hoje?'feliz':'normal'));
    return '<div class="gl card jg-cta"><a class="jg-cta-l" href="#/jogos" data-act="jogos"><span class="jg-cta-rb" aria-hidden="true">'+robo(rb,52)+'</span>'+
      '<span class="jg-cta-t"><b>ENIAC: treine Python jogando</b><small>'+esc(sub)+'</small>'+
      (r.comecou&&r.total?'<span class="jg-pb" role="progressbar" aria-label="Lições concluídas" aria-valuemin="0" aria-valuemax="'+r.total+'" aria-valuenow="'+r.feitas+'"><i style="width:'+pct+'%"></i></span>':'')+'</span></a>'+
      '<button type="button" class="btn sm jg-cta-b" data-act="jg-continuar">'+esc(a?a.rot:(r.comecou?'Abrir':'Jogar'))+'</button></div>';
  }
  function menuContagem(){
    var r=ENIAC.est.resumo();
    return r.total?(r.feitas+'/'+r.total):'Python';
  }
  function menuIcone(){return ic('robo')}

  return {html:html,montar:montar,alternar:alternar,continuar:continuar,abrir:abrir,conquistas:conquistas,ajustes:ajustes,liberar:liberar,reiniciar:reiniciar,
    cartao:cartao,menuContagem:menuContagem,menuIcone:menuIcone,lembrar:lembrar};
})();
