/* ===== ENIAC: jogo de lições de Python, dentro do painel =====
   O ENIAC é parte do app (mesma barra lateral, mesmo tema, mesmo roteador). Os arquivos carregam em ordem alfabética:
     30-jogo-1-base.js    recebe o curso gerado (ENIAC.manifesto / ENIAC.unidade), carrega as unidades sob demanda, texto, realce de código, datas
     30-jogo-2-estado.js  progresso guardado no STORE (grupo "jogo"): XP, nível, sequência, conquistas, desbloqueio e migração do Codivara
     30-jogo-3-robo.js    o robozinho (SVG desenhado por função)
     30-jogo-4-tipos.js   os 6 tipos de exercício (quiz, digite, bug, monte, lacuna, pares)
     30-jogo-5-janela.js  janelas (modal), confete
     30-jogo-6-licao.js   o jogador de lição: mini-aula, exercícios, vidas, resultado (tela #/jogo/<id>)
     30-jogo-7-trilha.js  a trilha (tela #/jogos), conquistas, ajustes, cartão do painel e número do menu
     30-jogo-8-rotas.js   botões, voltar do navegador e início
   O conteúdo (jogos/curso/*.js) é GERADO por tools/curso/build.py: nunca edite aqueles arquivos. Veja jogos/LEIAME.md. */
const ENIAC=(function(){
  var BASE='jogos/curso/';
  var VIDAS=5,XP1=10,XP2=5;                       /* vidas por lição; XP de quem acerta de primeira / depois de errar */
  var man=null,ordem=[],meta={},unids=[],manP=null,manErro='';
  var uni={},lic={},uniP={},falhou={};
  var problemas=[],ouvintes=[];
  var TIPOS={quiz:'Quiz',digite:'Digite a saída',bug:'Caça ao bug',monte:'Monte o código',lacuna:'Complete a lacuna',pares:'Ligue os pares'};

  /* ----- datas: sempre no horário LOCAL, formato AAAA-MM-DD ----- */
  function pad(n){return n<10?'0'+n:''+n}
  function hoje(){var d=new Date();return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())}
  function somaDias(s,n){var p=String(s).split('-'),d=new Date(Date.UTC(+p[0],+p[1]-1,+p[2]+n));return d.getUTCFullYear()+'-'+pad(d.getUTCMonth()+1)+'-'+pad(d.getUTCDate())}
  function diasEntre(a,b){var pa=String(a).split('-').map(Number),pb=String(b).split('-').map(Number);return Math.round((Date.UTC(pb[0],pb[1]-1,pb[2])-Date.UTC(pa[0],pa[1]-1,pa[2]))/864e5)}

  /* ----- embaralhar (Fisher-Yates). "proibida" recebe a lista embaralhada e diz se ela não serve (ex.: ficou na ordem certa) ----- */
  function embaralhar(lista,proibida){
    var r,t=0;
    do{
      r=lista.slice();
      for(var i=r.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),x=r[i];r[i]=r[j];r[j]=x}
      t++;
    }while(proibida&&proibida(r)&&t<40);
    return r;
  }

  /* ----- texto dos exercícios: só `código` entre crases e **negrito**. Escapa o HTML primeiro; os trechos de código saem antes do negrito
     (então ** dentro de crases não vira negrito). Crase sem par fica como texto. ----- */
  function fmt(t){
    var s=esc(t==null?'':String(t)),cods=[];
    s=s.replace(/`([^`\n]+)`/g,function(_,c){cods.push(c);return '\uE000'+(cods.length-1)+'\uE001'});
    s=s.replace(/\*\*([\s\S]+?)\*\*/g,'<strong>$1</strong>');
    return s.replace(/\uE000(\d+)\uE001/g,function(_,i){return '<code>'+cods[+i]+'</code>'});
  }
  function plano(t){return String(t==null?'':t).replace(/\*\*/g,'').replace(/`/g,'')}

  /* ----- realce de sintaxe do Python (só enfeite: nada aqui executa código). Cores nas classes .tk-* de css/jogo.css ----- */
  var KW={},BI={};
  ('False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield').split(' ').forEach(function(w){KW[w]=1});
  ('print input int float str bool list dict set tuple len range type sum min max abs round sorted reversed enumerate zip map filter open isinstance format repr chr ord any all divmod pow super property staticmethod classmethod iter next vars dir id hash bytes object callable getattr setattr hasattr issubclass slice frozenset complex bin hex oct ascii').split(' ').forEach(function(w){BI[w]=1});
  var RE_PY=/(#[^\n]*)|("""[\s\S]*?(?:"""|$)|'''[\s\S]*?(?:'''|$))|([rRbBfFuU]{1,2}(?="|')"(?:[^"\\\n]|\\.)*"?|[rRbBfFuU]{1,2}(?="|')'(?:[^'\\\n]|\\.)*'?|"(?:[^"\\\n]|\\.)*"?|'(?:[^'\\\n]|\\.)*'?)|(\b\d[\d_]*(?:\.\d+)?(?:[eE][+-]?\d+)?\b|\.\d+\b)|(@[A-Za-z_][\w.]*)|([A-Za-z_]\w*)/g;
  /* devolve uma lista com o HTML de cada linha. Trechos de duas linhas (texto entre aspas triplas) são cortados por linha. */
  function realce(codigo){
    var s=String(codigo==null?'':codigo),linhas=[[]],ult=0,m,prev='',gapTxt='';
    function ponta(cls,txt){
      txt.split('\n').forEach(function(p,i){
        if(i>0)linhas.push([]);
        if(p!=='')linhas[linhas.length-1].push(cls?'<span class="'+cls+'">'+esc(p)+'</span>':esc(p));
      });
    }
    RE_PY.lastIndex=0;
    while((m=RE_PY.exec(s))!==null){
      gapTxt=s.slice(ult,m.index);
      if(gapTxt)ponta('',gapTxt);
      var tok=m[0],cls='',seguido=s.charAt(RE_PY.lastIndex);
      if(m[1])cls='tk-c';
      else if(m[2]||m[3])cls='tk-s';
      else if(m[4])cls='tk-n';
      else if(m[5])cls='tk-d';
      else{
        var colado=!/\S/.test(gapTxt);
        if(KW[tok])cls='tk-k';
        else if((prev==='def'||prev==='class')&&colado)cls='tk-f';
        else if(/(?:Error|Exception|Warning)$/.test(tok))cls='tk-f';
        else if(seguido==='('&&(BI[tok]||/^[A-Za-z_]/.test(tok)))cls='tk-f';
        prev=tok;
      }
      if(!m[6]){prev=''}
      ponta(cls,tok);
      ult=RE_PY.lastIndex;
      if(tok.length===0)RE_PY.lastIndex++;
    }
    if(ult<s.length)ponta('',s.slice(ult));
    return linhas.map(function(p){return p.join('')});
  }
  function realceTexto(t){return realce(t).join('\n')}

  /* bloco de código com números de linha; "extra" acrescenta classes */
  function blocoCodigo(codigo,rotulo,extra){
    var ls=realce(codigo);
    return '<div class="jg-cod scrollx'+(extra?' '+extra:'')+'" role="group" aria-label="'+esc(rotulo||'Código')+'">'+
      ls.map(function(l,i){return '<div class="jg-l"><span class="jg-n" aria-hidden="true">'+(i+1)+'</span><code>'+(l||' ')+'</code></div>'}).join('')+'</div>';
  }
  /* caixa escura com o que o programa mostra (ou, com erro=true, a mensagem de erro, em vermelho) */
  function blocoSaida(texto,erro,rotulo){
    var t=String(texto==null?'':texto);
    return '<div class="jg-saida scrollx'+(erro?' erro':'')+'"><span class="jg-rot">'+esc(rotulo||(erro?'O Python mostra este erro':'Na tela aparece'))+'</span>'+
      (t===''&&!erro?'<p class="jg-nada">Nada aparece na tela.</p>':'<pre>'+esc(t)+'</pre>')+'</div>';
  }

  /* ----- ícones (mesmo traço dos ícones do app) ----- */
  var IC={
    check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    x:'<path d="M6 6l12 12M18 6 6 18"/>',
    lock:'<rect x="5" y="11" width="14" height="9" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    play:'<path d="M8 5.5v13l11-6.5z"/>',
    star:'<path d="M12 4l2.4 5 5.4.7-4 3.8 1 5.4-4.8-2.7-4.8 2.7 1-5.4-4-3.8 5.4-.7z"/>',
    heart:'<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
    bolt:'<path d="M13 3 5 13.5h6L10 21l8-10.5h-6z"/>',
    flame:'<path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 .3 1.2 1 2 2 2 0-3-.5-5 1-8z"/>',
    bulb:'<path d="M9.5 18h5M10.5 21h3M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.2h5c0-.9.4-1.7 1.1-2.2A6 6 0 0 0 12 3z"/>',
    alvo:'<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/>',
    chevron:'<path d="M6 9l6 6 6-6"/>',
    seta:'<path d="M19 12H5M11 6l-6 6 6 6"/>',
    refazer:'<path d="M4.5 12a7.5 7.5 0 1 0 2.4-5.5M4.5 4.5V9H9"/>',
    trofeu:'<path d="M8 4h8v5.5a4 4 0 0 1-8 0zM8 6.5H5.2a2.8 2.8 0 0 0 3 3.7M16 6.5h2.8a2.8 2.8 0 0 1-3 3.7M12 13.5V17M8.5 20h7M10 17h4"/>',
    medalha:'<circle cx="12" cy="14.5" r="5"/><path d="M8.5 3.5 12 10l3.5-6.5"/>',
    livro:'<path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H19v14H7.5A2.5 2.5 0 0 0 5 19.5zM5 19.5A2.5 2.5 0 0 0 7.5 22H19v-2"/>',
    pilha:'<path d="M12 4 3.5 8.5 12 13l8.5-4.5zM3.5 12.5 12 17l8.5-4.5M3.5 16.5 12 21l8.5-4.5"/>',
    brilho:'<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM18.5 15l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/>',
    calendario:'<rect x="4" y="5.5" width="16" height="14.5" rx="3"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>',
    ajustes:'<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
    robo:'<rect x="4.5" y="8.5" width="15" height="11" rx="4.5"/><path d="M12 8.5V5.5"/><circle cx="12" cy="4.3" r="1.3"/><circle cx="9.3" cy="13.6" r=".9" fill="currentColor"/><circle cx="14.7" cy="13.6" r=".9" fill="currentColor"/><path d="M2.5 12.5v3M21.5 12.5v3"/>'
  };
  function ic(n,cls){return '<svg class="ic jg-ic'+(cls?' '+cls:'')+'" viewBox="0 0 24 24" aria-hidden="true" focusable="false">'+(IC[n]||'')+'</svg>'}

  /* ----- avisar quem depende do manifesto (menu, painel) ----- */
  function aoMudar(f){ouvintes.push(f)}
  function avisar(){ouvintes.slice().forEach(function(f){try{f()}catch(e){if(window.console)console.error(e)}})}

  /* ----- conferência dos exercícios: rede de segurança. O gerador já confere tudo; aqui só evitamos quebrar a tela se algo vier torto. ----- */
  function ehTxt(x){return typeof x==='string'&&x.trim()!==''}
  function ehLista(a,min,max){return Array.isArray(a)&&a.length>=min&&(!max||a.length<=max)}
  function exProblema(ex){
    if(!ex||typeof ex!=='object'||!TIPOS[ex.tipo])return 'tipo desconhecido';
    var t=ex.tipo,i;
    if(!ehTxt(ex.enunciado))return 'sem enunciado';
    if(t==='quiz'){if(!ehLista(ex.opcoes,2,6)||!ex.opcoes.every(ehTxt))return 'opcoes'}
    else if(t==='digite'){
      if(!ehTxt(ex.codigo)||!ehTxt(ex.resposta))return 'codigo ou resposta';
      if(ex.aceitas!==undefined&&!(Array.isArray(ex.aceitas)&&ex.aceitas.every(ehTxt)))return 'aceitas';
    }else if(t==='bug'){
      if(!ehLista(ex.linhas,2)||!ex.linhas.every(function(l){return typeof l==='string'}))return 'linhas';
      if(!(ex.linhaErrada>=1&&ex.linhaErrada<=ex.linhas.length&&Math.floor(ex.linhaErrada)===ex.linhaErrada))return 'linhaErrada';
      if(!ehLista(ex.opcoes,2,4)||!ex.opcoes.every(ehTxt))return 'opcoes';
    }else if(t==='monte'){
      if(!ehLista(ex.linhas,2)||!ex.linhas.every(ehTxt))return 'linhas';
    }else if(t==='lacuna'){
      if(!ehTxt(ex.codigo)||!ehLista(ex.respostas,1)||!ex.respostas.every(ehTxt)||!ehLista(ex.banco,1)||!ex.banco.every(ehTxt))return 'codigo, respostas ou banco';
      var sobra=ex.banco.slice();
      for(i=0;i<ex.respostas.length;i++){var k=sobra.indexOf(ex.respostas[i]);if(k<0)return 'resposta fora do banco';sobra.splice(k,1)}
      for(i=1;i<=ex.respostas.length;i++)if(ex.codigo.indexOf('{'+i+'}')<0)return 'falta o buraco {'+i+'}';
    }else if(t==='pares'){
      if(!ehLista(ex.pares,2)||!ex.pares.every(function(p){return Array.isArray(p)&&p.length===2&&ehTxt(p[0])&&ehTxt(p[1])}))return 'pares';
    }
    return '';
  }
  function sanear(l){
    if(!l||typeof l!=='object'||typeof l.id!=='string'||!Array.isArray(l.exercicios))return null;
    var ok=[];
    l.exercicios.forEach(function(ex,i){var p=exProblema(ex);if(p)problemas.push(l.id+' #'+(i+1)+': '+p);else ok.push(ex)});
    if(!ok.length)return null;
    var it=l.intro&&typeof l.intro==='object'?l.intro:{};
    return {id:l.id,titulo:String(l.titulo||l.id),resumo:String(l.resumo||''),
      intro:{paragrafos:Array.isArray(it.paragrafos)?it.paragrafos.filter(ehTxt):[],lista:Array.isArray(it.lista)?it.lista.filter(ehTxt):[],depois:Array.isArray(it.depois)?it.depois.filter(ehTxt):[],
        exemplos:Array.isArray(it.exemplos)?it.exemplos.filter(function(e){return e&&typeof e.codigo==='string'}):[]},
      exercicios:ok};
  }

  /* ----- o curso gerado chama estas duas funções ----- */
  function manifesto(m){
    var us=[],ord=[],mt={};
    if(m&&Array.isArray(m.unidades))m.unidades.forEach(function(u){
      if(!u||typeof u.id!=='string'||!Array.isArray(u.licoes))return;
      var uo={id:u.id,titulo:String(u.titulo||u.id),descricao:String(u.descricao||''),arquivo:String(u.arquivo||(u.id+'.js')),v:String(u.v||''),licoes:[],num:us.length+1};
      u.licoes.forEach(function(l){
        if(!l||typeof l.id!=='string'||!/^u\d{2}l\d{2}$/.test(l.id)||mt[l.id])return;
        var o={id:l.id,titulo:String(l.titulo||l.id),resumo:String(l.resumo||''),n:+l.n||0,un:u.id,k:uo.licoes.length,g:ord.length,ui:us.length};
        uo.licoes.push(o);ord.push(o);mt[o.id]=o;
      });
      if(uo.licoes.length)us.push(uo);
    });
    man={v:String((m&&m.v)||''),unidades:us};ordem=ord;meta=mt;unids=us;manErro='';
    try{var p=STORE.pref();if(p.jogoTotal!==ord.length){p.jogoTotal=ord.length;STORE.save()}}catch(e){}
    avisar();
  }
  function unidade(cab,ls){
    if(!cab||typeof cab.id!=='string'||!Array.isArray(ls))return;
    var ok=[];
    ls.forEach(function(l){var s=sanear(l);if(s){ok.push(s);lic[s.id]=s}});
    uni[cab.id]={cab:cab,licoes:ok};
  }

  /* ----- carregar arquivos do curso (tag <script>: funciona também offline, pelo service worker) ----- */
  function injetar(src){
    return new Promise(function(res,rej){
      var s=document.createElement('script');
      s.src=src;s.async=true;
      s.onload=function(){res()};
      s.onerror=function(){try{s.parentNode.removeChild(s)}catch(e){}rej(new Error('Não consegui carregar '+src))};
      document.head.appendChild(s);
    });
  }
  function carregarManifesto(forcar){
    if(man&&!forcar)return Promise.resolve(man);
    if(manP&&!forcar)return manP;
    if(forcar)manErro='';
    var p=injetar(BASE+'manifesto.js').then(function(){if(!man)throw new Error('O manifesto veio vazio.');return man},function(e){manErro=e.message||'falha';manP=null;avisar();throw e});
    manP=p;return p;
  }
  function carregarUnidade(uid){
    if(uni[uid])return Promise.resolve(uni[uid]);
    if(uniP[uid])return uniP[uid];
    var u=unids.filter(function(x){return x.id===uid})[0];
    if(!u)return Promise.reject(new Error('Unidade desconhecida: '+uid));
    var p=injetar(BASE+u.arquivo+(u.v?'?v='+encodeURIComponent(u.v):'')).then(function(){
      delete uniP[uid];delete falhou[uid];
      if(!uni[uid])throw new Error('O arquivo de '+uid+' não trouxe a unidade.');
      return uni[uid];
    },function(e){delete uniP[uid];falhou[uid]=1;throw e});
    uniP[uid]=p;return p;
  }
  function carregarLicao(id){
    var m=meta[id];
    if(!m)return Promise.reject(new Error('Lição desconhecida: '+id));
    return carregarUnidade(m.un).then(function(){var l=lic[id];if(!l)throw new Error('A lição '+id+' não está no arquivo da unidade.');return l});
  }
  /* guarda o curso inteiro para uso sem internet (uma unidade por vez, sem pressa) */
  var pfOn=false;
  function aquecer(){
    if(pfOn||!unids.length)return;
    try{var cn=navigator.connection;if(cn&&(cn.saveData||cn.type==='cellular'||/(^|-)2g$/.test(cn.effectiveType||'')))return}catch(e){}
    if(navigator.onLine===false)return;
    pfOn=true;
    (function prox(){
      var u=unids.filter(function(x){return !uni[x.id]&&!falhou[x.id]})[0];
      if(!u){pfOn=false;return}
      carregarUnidade(u.id).then(function(){setTimeout(prox,250)},function(){pfOn=false});
    })();
  }

  return {
    VIDAS:VIDAS,XP1:XP1,XP2:XP2,TIPOS:TIPOS,BASE:BASE,
    hoje:hoje,somaDias:somaDias,diasEntre:diasEntre,embaralhar:embaralhar,
    fmt:fmt,plano:plano,realce:realce,realceTexto:realceTexto,blocoCodigo:blocoCodigo,blocoSaida:blocoSaida,ic:ic,
    manifesto:manifesto,unidade:unidade,carregarManifesto:carregarManifesto,carregarUnidade:carregarUnidade,carregarLicao:carregarLicao,aquecer:aquecer,aoMudar:aoMudar,
    pronto:function(){return !!man},
    erroManifesto:function(){return manErro},
    falhouUnidade:function(uid){return !!falhou[uid]},
    ordem:function(){return ordem},
    unidades:function(){return unids},
    meta:function(id){return meta[id]||null},
    unidadeDe:function(id){var m=meta[id];return m?unids[m.ui]:null},
    licao:function(id){return lic[id]||null},
    problemas:function(){return problemas.slice()},
    versao:function(){return man?man.v:''}
  };
})();
