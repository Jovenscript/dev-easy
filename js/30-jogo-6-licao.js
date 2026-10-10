/* ===== ENIAC · 6 · o jogador de lição (tela #/jogo/<id>) =====
   Fases de uma lição:  carregando -> aula (mini-lição) -> ex (exercício) <-> fb (resposta e explicação) -> fim (resultado)
   Também existem as fases de aviso: erro (não carregou), bloqueada e inexistente.
   Regras (as mesmas do jogo antigo):
   - 5 vidas por lição. Cada resposta errada tira 1 vida. Sem vidas: a lição recomeça do início (a pessoa escolhe).
   - Exercício errado volta no FIM da fila e só sai quando for acertado.
   - XP: acertou de primeira = 10; acertou depois de errar = 5. O XP da lição só entra no total quando ela termina (ENIAC.est.registrar).
   - Estrelas: 3 = nenhum erro, 2 = até 2 erros, 1 = concluída.
   Teclado: 1 a 9 escolhem opções, Enter verifica/continua, Esc pergunta se quer sair.
   O resto do app só conversa com este arquivo por: html(), montar(), guarda(), aoVoltar() e as funções das ações (30-jogo-8-rotas.js). */
ENIAC.jogador=(function(){
  var s=null;                 /* a sessão em andamento (null = nenhuma) */
  var chegou=false;           /* a lição foi aberta andando pelo app (então "sair" = voltar uma tela no histórico) */
  var FRASES={acerto:['Certo!','Boa!','É isso aí!','Mandou bem!','Perfeito!'],erro:['Quase!','Não foi dessa vez.','Ops!','Ainda não.']};
  var ROTULO={bug:'Código corrigido',monte:'Ordem certa',lacuna:'Código completo',pares:'Os pares certos'};
  var fmt=ENIAC.fmt,ic=ENIAC.ic,robo=ENIAC.robo;

  function sorteio(l){return l[Math.floor(Math.random()*l.length)]}
  function foca(el,rolar){if(el){try{el.focus({preventScroll:!rolar})}catch(e){}}}
  function numeroLicao(id){return parseInt(String(id).slice(4),10)||0}
  function vivo(id){return !!s&&s.id===id&&S.view==='jogo'}

  /* ----- a sessão ----- */
  function nova(id){
    return {id:id,licao:null,fase:'carregando',total:0,fila:[],feitos:0,vidas:ENIAC.VIDAS,xp:0,acertos:0,erros:0,respostas:0,tent:{},
      jogo:null,ex:null,atual:-1,num:1,res:null,reinicios:0,pronto:false,fbHtml:'',ultimo:null};
  }
  function zerar(){
    s.fila=s.licao.exercicios.map(function(_,i){return i});
    s.feitos=0;s.vidas=ENIAC.VIDAS;s.xp=0;s.acertos=0;s.erros=0;s.respostas=0;s.tent={};s.jogo=null;s.ex=null;s.atual=-1;s.num=1;s.res=null;s.pronto=false;s.fbHtml='';s.ultimo=null;
  }
  function preparar(l){
    s.licao=l;s.total=l.exercicios.length;zerar();s.fase='aula';
  }
  /* descobre em que fase a lição está: o manifesto e o arquivo da unidade podem ainda não ter chegado (endereço aberto direto, primeira vez) */
  function resolver(){
    var id=s.id;
    if(!ENIAC.pronto()){
      s.fase='carregando';
      ENIAC.carregarManifesto().then(function(){if(vivo(id)){resolver();mostrar()}},function(){if(vivo(id)){s.fase='erro';mostrar()}});
      return;
    }
    var m=ENIAC.meta(id);
    if(!m){s.fase='inexistente';return}
    if(!ENIAC.est.liberada(m.g)){s.fase='bloqueada';return}
    var l=ENIAC.licao(id);
    if(l){preparar(l);return}
    s.fase='carregando';
    ENIAC.carregarLicao(id).then(function(lic){if(vivo(id)){preparar(lic);mostrar()}},function(){if(vivo(id)){s.fase='erro';mostrar()}});
  }

  /* ----- peças da tela ----- */
  function conceito(l){
    var it=l.intro,h='<div class="jg-conceito">';
    it.paragrafos.forEach(function(p){h+='<p>'+fmt(p)+'</p>'});
    if(it.lista.length)h+='<ul>'+it.lista.map(function(x){return '<li>'+fmt(x)+'</li>'}).join('')+'</ul>';
    it.depois.forEach(function(p){h+='<p>'+fmt(p)+'</p>'});
    it.exemplos.forEach(function(e,i){
      h+='<div class="jg-exemplo"><span class="jg-rot">'+(it.exemplos.length>1?'Exemplo '+(i+1):'Exemplo')+'</span>'+
        ENIAC.blocoCodigo(e.codigo,'Código do exemplo')+ENIAC.blocoSaida(e.saida,e.erro===true)+
        (e.nota?'<p class="jg-nota">'+fmt(e.nota)+'</p>':'')+'</div>';
    });
    return h+'</div>';
  }
  function topoHtml(){
    var pct=s.total?Math.round(100*s.feitos/s.total):0,emEx=s.fase==='ex'||s.fase==='fb';
    return '<button type="button" class="jg-ib" data-act="jg-sair" aria-label="Sair da lição">'+ic('x')+'</button>'+
      '<div class="jg-prog" id="jg-prog" role="progressbar" aria-label="Progresso da lição" aria-valuemin="0" aria-valuemax="'+s.total+'" aria-valuenow="'+s.feitos+'"><i style="width:'+pct+'%"></i></div>'+
      (emEx?'<button type="button" class="jg-ib" data-act="jg-resumo" aria-label="Rever o resumo da lição">'+ic('bulb')+'</button>':'')+
      '<div class="jg-vidas'+(s.vidas<=1?' pouca':'')+'" id="jg-vidas" role="img" aria-label="Vidas: '+s.vidas+' de '+ENIAC.VIDAS+'">'+ic('heart')+'<span id="jg-vidas-n">'+s.vidas+'</span></div>';
  }
  function estado(rb,titulo,texto,botoes){
    return '<div class="jg-estado" role="status">'+robo(rb,120)+'<h1 class="jg-tit" id="jg-titulo" tabindex="-1">'+esc(titulo)+'</h1>'+(texto?'<p>'+esc(texto)+'</p>':'')+
      (botoes?'<div class="jg-estado-bt">'+botoes+'</div>':'')+'</div>';
  }
  function corpo(){
    var l=s.licao,m,u;
    switch(s.fase){
      case 'carregando':
        return '<div class="jg-estado" role="status" aria-live="polite" aria-busy="true">'+robo('pensando',120)+'<h1 class="jg-tit" id="jg-titulo" tabindex="-1">Carregando a lição…</h1></div>';
      case 'erro':
        return estado('errou','Não consegui carregar esta lição','Confira a conexão e tente de novo. As lições que você já abriu antes funcionam sem internet.',
          '<button type="button" class="btn" data-act="jg-tentar">'+ic('refazer')+' Tentar de novo</button><button type="button" class="btn ghost" data-act="jg-trilha">Voltar à trilha</button>');
      case 'inexistente':
        return estado('errou','Não encontrei esta lição','O endereço pode estar errado ou a lição foi trocada de lugar.','<button type="button" class="btn" data-act="jg-trilha">Voltar à trilha</button>');
      case 'bloqueada':
        var px=ENIAC.est.proxima();
        return estado('normal','Esta lição ainda está bloqueada','Conclua a lição anterior para liberar esta.',
          (px?'<button type="button" class="btn" data-act="jg-abrir" data-id="'+esc(px.id)+'">'+ic('play')+' Ir para a lição liberada</button>':'')+'<button type="button" class="btn ghost" data-act="jg-trilha">Voltar à trilha</button>');
      case 'aula':
        m=ENIAC.meta(l.id);u=ENIAC.unidadeDe(l.id);
        return '<div class="jg-aula"><div class="jg-cab">'+robo('normal',72,'jg-cab-rb')+'<div><p class="jg-et">Lição '+numeroLicao(l.id)+(u?' · '+esc(u.titulo):'')+'</p>'+
          '<h1 class="jg-tit" id="jg-titulo" tabindex="-1">'+esc(l.titulo)+'</h1>'+(l.resumo?'<p class="jg-resumo">'+esc(l.resumo)+'</p>':'')+'</div></div>'+
          '<div class="gl jg-card">'+conceito(l)+'</div>'+
          '<p class="jg-meta">'+s.total+' exercícios · '+ENIAC.VIDAS+' vidas. Você pode rever este resumo durante a lição.</p></div>';
      case 'ex': case 'fb':
        var ex=s.ex,tipo=ENIAC.tipos[ex.tipo];
        return '<div class="jg-ex"><p class="jg-tipo"><span class="jg-et">'+esc(tipo.nome)+'</span>'+((s.tent[s.atual]||0)>0?'<span class="jg-rev">De novo</span>':'')+
          '<span class="jg-cont">Exercício '+s.num+' de '+s.total+'</span></p>'+
          '<h1 class="jg-enun" id="jg-enun" tabindex="-1">'+fmt(ex.enunciado)+'</h1><div id="jg-area"></div><div class="jg-fb" id="jg-fb" aria-live="polite" aria-atomic="true"></div></div>';
      case 'fim':
        return fimHtml();
    }
    return '';
  }
  function barra(){
    switch(s.fase){
      case 'aula':
        return '<button type="button" class="btn jg-acao" data-act="jg-comecar">'+(ENIAC.est.feita(s.id)?'Praticar de novo':'Começar')+'</button>';
      case 'ex':
        return '<button type="button" class="btn jg-acao" id="jg-acao" data-act="jg-verificar"'+(s.pronto?'':' disabled')+'>'+esc(ENIAC.tipos[s.ex.tipo].rotulo)+'</button>';
      case 'fb':
        return '<button type="button" class="btn jg-acao '+(s.ultimo&&s.ultimo.ok?'ok':'ruim')+'" id="jg-acao" data-act="jg-seguir">Continuar</button>';
      case 'fim':
        var r=s.res,nx=r&&r.proxima;
        return (nx?'<button type="button" class="btn jg-acao" data-act="jg-proxima">Próxima lição</button><button type="button" class="btn ghost jg-acao2" data-act="jg-trilha">Voltar à trilha</button>'
          :'<button type="button" class="btn jg-acao" data-act="jg-trilha">Voltar à trilha</button>');
    }
    return '';
  }
  function fimHtml(){
    var r=s.res,l=s.licao,est='',i;
    for(i=1;i<=3;i++)est+='<span class="jg-es'+(i<=r.estrelas?' on':'')+'" style="--i:'+i+'">'+ic('star')+'</span>';
    function tile(ico,v,rot,cls){return '<div class="jg-tile'+(cls?' '+cls:'')+'">'+ic(ico)+'<b>'+esc(v)+'</b><span>'+esc(rot)+'</span></div>'}
    var nv=r.nivel,seq=r.seq.n;
    var h='<div class="jg-fim"><div class="jg-confete" id="jg-confete" aria-hidden="true"></div>'+robo('comemorando',150,'jg-fim-rb')+
      '<h1 class="jg-tit" id="jg-titulo" tabindex="-1">Lição concluída!</h1>'+
      '<p class="jg-sub">'+esc(l.titulo)+(r.estrelas===3?' · sem nenhum erro':'')+'</p>'+
      '<div class="jg-estrelas" role="img" aria-label="'+r.estrelas+(r.estrelas===1?' estrela':' estrelas')+' de 3">'+est+'</div>'+
      '<div class="jg-tiles">'+tile('bolt','+'+r.xp,'XP','xp')+tile('alvo',r.precisao+'%','Acertos','prec')+tile('heart',String(r.vidas),r.vidas===1?'Vida':'Vidas','vid')+'</div>'+
      '<div class="gl jg-nivel"><div class="jg-nivel-t"><b>Nível '+nv.n+'</b><span>'+UI.fmt(r.xpTotal)+' XP no total</span></div>'+
      '<div class="jg-barra-xp" role="progressbar" aria-label="Progresso no nível '+nv.n+'" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+nv.pct+'"><i style="width:'+nv.pct+'%"></i></div>'+
      '<p class="jg-nivel-s">Faltam '+UI.fmt(nv.falta)+' XP para o nível '+(nv.n+1)+'.</p></div>'+
      '<p class="jg-seq">'+ic('flame')+' Sequência: <b>'+seq+(seq===1?' dia':' dias')+'</b></p>';
    if(r.subiu)h+='<div class="jg-banner">'+ic('brilho')+'<b>Você subiu para o nível '+nv.n+'!</b></div>';
    if(r.novas.length)h+='<ul class="jg-novas" aria-label="Novas conquistas">'+r.novas.map(function(c){
      return '<li class="jg-nova"><span class="jg-med">'+ic(c.ic)+'</span><div><b>Conquista: '+esc(c.t)+'</b><small>'+esc(c.d)+'</small></div></li>';
    }).join('')+'</ul>';
    if(!r.proxima)h+='<p class="jg-final">Você chegou ao fim das lições que existem por enquanto. Refaça as que tiverem menos de 3 estrelas para treinar.</p>';
    h+='<button type="button" class="lnk jg-refazer" data-act="jg-refazer">'+ic('refazer')+' Refazer esta lição</button></div>';
    return h;
  }

  /* ----- montar e redesenhar ----- */
  function visivelTopo(){return s.fase==='aula'||s.fase==='ex'||s.fase==='fb'}
  function html(){
    if(!s||s.id!==S.id){s=nova(S.id);resolver()}
    var barraOcupada=(s.fase==='fim'||s.fase==='aula'||s.fase==='ex'||s.fase==='fb');
    return '<div class="jg jg-licao" id="jg-raiz" data-fase="'+s.fase+'">'+
      '<header class="jg-topo" id="jg-topo" data-ex="'+((s.fase==='ex'||s.fase==='fb')?'1':'0')+'"'+(visivelTopo()?'':' hidden')+'>'+(visivelTopo()?topoHtml():'')+'</header>'+
      '<div class="jg-corpo" id="jg-corpo">'+corpo()+'</div>'+
      '<div class="jg-barra" id="jg-barra" data-est="'+barraEstado()+'"'+(barraOcupada?'':' hidden')+'><div class="jg-barra-in">'+barra()+'</div></div></div>';
  }
  function barraEstado(){return s.fase==='fb'?(s.ultimo&&s.ultimo.ok?'ok':'ruim'):s.fase}
  /* redesenha a fase atual dentro da tela que já existe */
  function mostrar(){
    var raiz=$('#jg-raiz');
    if(!raiz||!s)return;
    var topo=$('#jg-topo'),b=$('#jg-barra');
    raiz.dataset.fase=s.fase;
    var vt=visivelTopo(),emEx=(s.fase==='ex'||s.fase==='fb')?'1':'0';
    if(vt){if(topo.hidden||!topo.firstChild||topo.dataset.ex!==emEx){topo.hidden=false;topo.innerHTML=topoHtml();topo.dataset.ex=emEx}else topoAtualizar(false)}    /* o botão do resumo só existe nos exercícios */
    else topo.hidden=true;
    $('#jg-corpo').innerHTML=corpo();
    var ocupada=(s.fase==='fim'||vt);
    b.hidden=!ocupada;b.dataset.est=barraEstado();
    b.firstChild.innerHTML=barra();
    montar();
    window.scrollTo(0,0);
  }
  function topoAtualizar(perdeu){
    var p=$('#jg-prog'),pct=s.total?Math.round(100*s.feitos/s.total):0;
    if(p){p.setAttribute('aria-valuenow',s.feitos);p.firstChild.style.width=pct+'%'}
    var v=$('#jg-vidas'),n=$('#jg-vidas-n');
    if(v&&n){
      n.textContent=s.vidas;v.setAttribute('aria-label','Vidas: '+s.vidas+' de '+ENIAC.VIDAS);v.classList.toggle('pouca',s.vidas<=1);
      v.classList.remove('treme');if(perdeu){void v.offsetWidth;v.classList.add('treme')}
    }
  }
  function titulo(){
    if(!s)return 'ENIAC · DEV EASY';
    var l=s.licao||ENIAC.meta(s.id);
    return (l&&l.titulo?l.titulo+' · ENIAC':'ENIAC · DEV EASY');
  }
  /* liga o que não dá para escrever como texto: o exercício (um elemento com seus próprios botões), foco, confete */
  function montar(){
    if(!s||S.view!=='jogo')return;
    document.title=titulo();
    var f=s.fase;
    if(f==='ex'||f==='fb'){
      var area=$('#jg-area');
      if(!area)return;
      if(!s.jogo)s.jogo=ENIAC.tipos[s.ex.tipo].criar(s.ex,{pronto:pronto,focoAcao:focoAcao});
      area.appendChild(s.jogo.el);
      if(f==='fb'){$('#jg-fb').innerHTML=s.fbHtml;foca($('#jg-acao'),false)}
      else foca($('#jg-enun'),false);
    }else if(f==='fim'){
      ENIAC.confete($('#jg-confete'));
      foca($('#jg-titulo'),false);
    }else{
      foca($('#jg-titulo'),false);
    }
  }
  function pronto(ok){
    s.pronto=!!ok;
    var b=$('#jg-acao');
    if(b&&s.fase==='ex')b.disabled=!ok;
  }
  function focoAcao(){foca($('#jg-acao'),false)}

  /* ----- as ações da lição ----- */
  function comecar(){
    if(!s||s.fase!=='aula')return;
    proximo();
  }
  function proximo(){
    s.fase='ex';s.atual=s.fila[0];s.ex=s.licao.exercicios[s.atual];s.num=Math.min(s.feitos+1,s.total);s.jogo=null;s.pronto=false;s.fbHtml='';
    mostrar();
  }
  function verificar(){
    if(!s||s.fase!=='ex'||!s.jogo)return;
    var r=s.jogo.verificar();
    if(r.parcial)return;                      /* Caça ao bug: acertou a linha, falta escolher a correção */
    var i=s.fila.shift(),antes=s.tent[i]||0,xp=0,ok=!!r.ok;
    s.respostas++;
    if(ok){s.acertos++;s.feitos++;xp=antes===0?ENIAC.XP1:ENIAC.XP2;s.xp+=xp}
    else{s.erros++;s.vidas--;s.tent[i]=antes+1;s.fila.push(i)}
    s.fase='fb';s.ultimo={ok:ok,xp:xp};
    s.jogo.revelar(r);
    topoAtualizar(!ok);
    s.fbHtml=feedbackHtml(ok,xp);
    $('#jg-fb').innerHTML=s.fbHtml;
    var b=$('#jg-barra');b.dataset.est=ok?'ok':'ruim';
    b.firstChild.innerHTML=barra();
    foca($('#jg-acao'),false);
    ENIAC.rolar($('#jg-fb .jg-fbc'),'nearest');
  }
  function feedbackHtml(ok,xp){
    var ex=s.ex,texto=ex.tipo==='bug'?(ex.porque||ex.explicacao):ex.explicacao,extra='';
    if(ex.tipo==='bug'){
      if(ex.erro)extra+=ENIAC.blocoSaida(ex.erro,true,'O Python mostra este erro');
      if(ex.explicacao&&ex.porque)extra+='<p class="jg-fbc-txt">'+fmt(ex.explicacao)+'</p>';
    }
    if(!ok){
      extra+='<div class="jg-certa">'+(ROTULO[ex.tipo]?'<span class="jg-rot">'+ROTULO[ex.tipo]+'</span>':'')+s.jogo.certa()+'</div>';
    }
    var volta=ok?'':'<p class="jg-volta">'+(s.vidas>0?'Este exercício volta no fim da lição.':'Suas vidas acabaram.')+'</p>';
    return '<div class="jg-fbc '+(ok?'ok':'ruim')+'" role="group" aria-label="'+(ok?'Resposta certa':'Resposta errada')+'">'+
      '<div class="jg-fbc-cab">'+robo(ok?'feliz':'errou',56)+'<div><p class="jg-fbc-tit">'+esc(sorteio(ok?FRASES.acerto:FRASES.erro))+'</p>'+(ok?'<span class="jg-xp">+'+xp+' XP</span>':'')+'</div></div>'+
      (texto?'<p class="jg-fbc-txt">'+fmt(texto)+'</p>':'')+extra+volta+'</div>';
  }
  function seguir(){
    if(!s||s.fase!=='fb')return;
    if(s.vidas<=0){semVidas();return}
    if(!s.fila.length){concluir();return}
    proximo();
  }
  function concluir(){
    var r=ENIAC.est.registrar(s.licao,{erros:s.erros,acertos:s.acertos,respostas:s.respostas,xp:s.xp,vidas:s.vidas,reinicios:s.reinicios});
    s.res=r;s.fase='fim';s.jogo=null;
    mostrar();
  }
  function semVidas(){
    ENIAC.janela.abrir({titulo:'Suas vidas acabaram',classe:'jg-j-vidas',comEsc:false,
      html:'<div class="jg-jrobo">'+robo('errou',96)+'</div><p>Tudo bem: errar faz parte de aprender. A lição vai recomeçar do início, com '+ENIAC.VIDAS+' vidas novas.</p>',
      botoes:[{rotulo:'Recomeçar a lição',tipo:'prim',acao:function(){recomecar(true)}},{rotulo:'Voltar à trilha',acao:voltarTrilha}]});
  }
  /* recomeça direto nos exercícios (sem repetir a mini-lição) */
  function recomecar(contaReinicio){
    if(!s||!s.licao)return;
    var rein=contaReinicio?s.reinicios+1:0;
    zerar();s.reinicios=rein;
    proximo();
  }
  function refazer(){recomecar(false)}
  function tentar(){
    if(!s)return;
    s.fase='carregando';
    if(ENIAC.erroManifesto()||!ENIAC.pronto()){ENIAC.carregarManifesto(true).then(function(){},function(){})}
    mostrar();resolver();
    if(s.fase!=='carregando')mostrar();
  }
  function resumo(){
    if(!s||!s.licao)return;
    ENIAC.janela.abrir({titulo:'Resumo: '+s.licao.titulo,classe:'jg-j-resumo',html:conceito(s.licao),botoes:[{rotulo:'Voltar para a lição',tipo:'prim'}]});
  }

  /* ----- sair ----- */
  function emAndamento(){return !!s&&S.view==='jogo'&&(s.fase==='ex'||s.fase==='fb')}
  function confirmarSaida(aoSair){
    ENIAC.janela.abrir({titulo:'Sair da lição?',
      html:'<p>Se você sair agora, perde o progresso desta lição. O XP só entra no total quando você termina.</p>',
      botoes:[{rotulo:'Continuar a lição',tipo:'prim'},{rotulo:'Sair da lição',acao:aoSair}]});
  }
  function sair(){
    if(!s)return;
    if(emAndamento())confirmarSaida(voltarTrilha);else voltarTrilha();
  }
  /* volta para a tela de onde a lição foi aberta (ou para a trilha, se a lição foi aberta direto pelo endereço) */
  function voltarTrilha(){
    if(s)ENIAC.foco=s.id;
    s=null;
    if(chegou)back();else go('jogos',{},true);
  }
  function proxima(){
    var nx=s&&s.res&&s.res.proxima;
    if(!nx){voltarTrilha();return}
    s=null;
    go('jogo',{id:nx.id},true);
  }
  function abrir(id){chegou=true;go('jogo',{id:id})}
  function soltar(){s=null}                  /* chamado quando a tela deixa de ser a lição: a sessão acaba junto */

  /* o roteador (22-views.js) pergunta antes de sair da tela no meio de uma lição */
  function guarda(prosseguir){
    if(!emAndamento())return false;
    confirmarSaida(function(){s=null;prosseguir()});
    return true;
  }
  /* botão Voltar do navegador no meio da lição: desfaz a volta (empurra a lição de novo) e pergunta */
  function aoVoltar(){
    if(!emAndamento())return false;
    try{if(HOK)history.pushState(stateNow(),'',hashOf())}catch(e){}
    if(!ENIAC.janela.aberta())confirmarSaida(function(){s=null;if(HOK&&NAVN>0)history.back();else back()});
    return true;
  }

  /* ----- teclado ----- */
  document.addEventListener('keydown',function(e){
    if(!s||S.view!=='jogo'||e.defaultPrevented||e.ctrlKey||e.metaKey||e.altKey||ENIAC.janela.aberta())return;
    var t=e.target,tag=(t&&t.tagName)||'',texto=tag==='TEXTAREA'||(tag==='INPUT'&&t.type!=='radio'&&t.type!=='checkbox');
    if(e.key==='Escape'){
      if(s.fase==='fim')return;
      e.preventDefault();sair();return;
    }
    if(e.key==='Enter'){
      if(tag==='BUTTON'||tag==='A'||tag==='SUMMARY'||e.repeat)return;
      if(s.fase==='aula'){e.preventDefault();comecar()}
      else if(s.fase==='ex'){var b=$('#jg-acao');if(b&&!b.disabled){e.preventDefault();verificar()}}
      else if(s.fase==='fb'){e.preventDefault();seguir()}
      return;
    }
    if(s.fase==='ex'&&s.jogo&&s.jogo.tecla&&!texto&&/^[1-9]$/.test(e.key)){
      if(s.jogo.tecla(+e.key))e.preventDefault();
    }
  });

  return {html:html,montar:montar,titulo:titulo,abrir:abrir,comecar:comecar,verificar:verificar,seguir:seguir,sair:sair,resumo:resumo,voltarTrilha:voltarTrilha,
    proxima:proxima,refazer:refazer,tentar:tentar,guarda:guarda,aoVoltar:aoVoltar,soltar:soltar,
    fase:function(){return s?s.fase:''},ativa:function(){return emAndamento()},
    /* só para os testes automáticos: estado resumido da sessão */
    _s:function(){return s?{id:s.id,fase:s.fase,vidas:s.vidas,feitos:s.feitos,total:s.total,xp:s.xp,erros:s.erros,fila:s.fila.slice(),tipo:s.ex?s.ex.tipo:'',ex:s.ex}:null}};
})();
