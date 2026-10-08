/* ===== demos ao vivo (parte 8: modelo de linguagem de brinquedo e mapa de embeddings) ===== */

W.llm=function(el){
  /* texto de treino: 41 frases curtas de manutenção, escritas à mão para esta demonstração */
  var CORPUS=[
    'o motor parou porque o rolamento falhou','o motor parou porque a correia soltou','o motor parou porque faltou energia',
    'o motor aqueceu porque a ventilação falhou','o motor aqueceu porque o filtro entupiu','o motor vibrou porque o rolamento falhou',
    'a bomba parou porque o selo vazou','a bomba parou porque o rolamento falhou','a bomba parou porque faltou água',
    'a bomba vibrou porque o acoplamento desalinhou','a bomba vazou porque o selo ressecou',
    'o técnico trocou o rolamento do motor','o técnico trocou o rolamento da bomba','o técnico trocou o selo da bomba','o técnico trocou o filtro do motor',
    'o técnico verificou a vibração do motor','o técnico verificou a temperatura da bomba','o técnico verificou o alinhamento da bomba',
    'o técnico lubrificou o rolamento do motor','o técnico lubrificou o rolamento da bomba',
    'o técnico registrou a falha do motor','o técnico registrou a falha da bomba','o técnico avisou o operador',
    'o sensor mediu a temperatura do motor','o sensor mediu a vibração da bomba','o sensor mediu a temperatura da bomba','o sensor acusou a vibração do motor',
    'a manutenção preventiva evita paradas inesperadas','a manutenção preventiva reduz o custo do reparo','a manutenção corretiva acontece depois da falha','a manutenção preditiva usa sensores para prever a falha',
    'o operador percebeu o barulho do motor','o operador percebeu a vibração da bomba','o operador avisou o técnico',
    'o operador registrou a parada da bomba','o operador registrou a parada do motor',
    'o rolamento falhou porque faltou lubrificação','o selo vazou porque faltou manutenção','a correia soltou porque faltou tensão','o filtro entupiu porque faltou limpeza','a ventilação falhou porque o filtro entupiu'];
  var MAXP=14,INIC=['o motor','a bomba','o técnico','o sensor','a manutenção','o operador'];
  var c2={},c1={},c0={};
  function add(m,k,w){var o=m[k]||(m[k]={});o[w]=(o[w]||0)+1}
  CORPUS.forEach(function(s){
    var t=(s+' .').split(' ');
    add(c0,'',t[0]);
    for(var i=1;i<t.length;i++){add(c1,t[i-1],t[i]);if(i>=2)add(c2,t[i-2]+' '+t[i-1],t[i])}
  });
  var toks=[],ini=[],T=1,aviso='';
  function lista(m){return Object.keys(m).map(function(w){return [w,m[w]]}).sort(function(a,b){return b[1]-a[1]})}
  function contexto(){
    var n=toks.length,k2=n>=2?toks[n-2]+' '+toks[n-1]:null;
    if(k2&&c2[k2])return {u:2,l:lista(c2[k2]),c:k2};
    if(n>=1&&c1[toks[n-1]])return {u:1,l:lista(c1[toks[n-1]]),c:toks[n-1]};
    return {u:0,l:lista(c0['']),c:''};
  }
  function probs(l){
    var q=l.map(function(x){return [x[0],Math.pow(x[1],1/T),x[1]]});
    var s=q.reduce(function(a,b){return a+b[1]},0);
    return q.map(function(x){return [x[0],x[1]/s,x[2]]}).sort(function(a,b){return b[1]-a[1]});
  }
  function fim(){return toks.length&&toks[toks.length-1]==='.'}
  function cheio(){return toks.length>=MAXP}
  function poe(w){toks.push(w);aviso=''}
  function sorteia(p){
    var r=Math.random(),acc=0;
    for(var i=0;i<p.length;i++){acc+=p[i][1];if(r<=acc)return p[i][0]}
    return p[p.length-1][0];
  }
  el.innerHTML='<p class="ins">Este modelo <b>aprendeu com 41 frases curtas</b> de manutenção. Ele só sabe uma coisa: dado o fim do texto, qual palavra costuma vir <b>depois</b>. Comece uma frase:</p>'+
    '<div class="qchips h lls">'+INIC.map(function(s){return '<button data-ini="'+s+'">'+s+'</button>'}).join('')+'<button data-do="limpar">Limpar</button></div>'+
    '<div class="rbox llt"></div>'+
    '<p class="ins llc"></p>'+
    '<div class="lll"></div>'+
    '<label class="fl">Temperatura: <b class="llv"></b><input class="resz" type="range" min="0.2" max="2" step="0.1" value="1" aria-label="Temperatura"></label>'+
    '<div class="acts2"><button class="btn sm" data-do="top">Mais provável</button><button class="btn sm" data-do="sort">Sortear</button><button class="btn sm ghost" data-do="frase">Frase inteira</button></div>'+
    '<p class="wres llr"></p>'+
    '<p class="wnote">Um modelo de linguagem de verdade joga o <b>mesmo jogo</b>: prevê o próximo pedaço de texto e sorteia. A diferença é a escala: bilhões de textos no lugar de 41 frases, e milhares de palavras de contexto no lugar de duas. Mesmo assim, ele não &quot;sabe&quot; o que é um rolamento: segue padrões. Por isso a frase pode soar segura e estar errada.</p>'+
    '<details class="llx"><summary>Ver as 41 frases do treino</summary><div class="rbox">'+esc(CORPUS.join('.\n')+'.')+'</div></details>';
  var txt=el.querySelector('.llt'),ctx=el.querySelector('.llc'),lst=el.querySelector('.lll'),res=el.querySelector('.llr'),
      sl=el.querySelector('input'),tv=el.querySelector('.llv');
  function desenha(){
    tv.textContent=fnum(T,1)+(T<=0.5?' (previsível)':(T>=1.5?' (ousado)':''));
    if(!toks.length)txt.innerHTML='<span class="llz">(texto vazio)</span>';
    else txt.innerHTML=toks.map(function(w,i){return i===toks.length-1?'<mark>'+esc(w)+'</mark>':esc(w)}).join(' ');
    var travado=fim()||cheio();
    if(travado){
      ctx.innerHTML='';
      lst.innerHTML='';
      res.innerHTML=fim()?'<b>Frase pronta.</b> Leia: faz sentido de verdade? O modelo só copiou padrões de palavras que andam juntas. Escolha outro começo para tentar de novo.':'Parei em '+MAXP+' palavras (limite da demonstração). Frases longas são onde esses modelos pequenos mais se perdem.';
      return;
    }
    var c=contexto(),p=probs(c.l),tot=c.l.reduce(function(a,b){return a+b[1]},0);
    if(c.u===2)ctx.innerHTML='O modelo olha as <b>2 últimas palavras</b>: <b>'+esc(c.c)+'</b>. Esse par aparece <b>'+tot+(tot===1?' vez':' vezes')+'</b> no treino. O que veio depois:';
    else if(c.u===1&&toks.length<2)ctx.innerHTML='Só há uma palavra, então o modelo olha só ela: <b>'+esc(c.c)+'</b>. O que veio depois dela no treino:';
    else if(c.u===1)ctx.innerHTML='Esse par de palavras <b>nunca apareceu</b> no treino, então o modelo olhou só a <b>última palavra</b>: <b>'+esc(c.c)+'</b>. O que veio depois dela:';
    else ctx.innerHTML='Texto vazio: como as frases do treino <b>começam</b>?';
    var top=p.slice(0,6),resto=p.length-top.length;
    lst.innerHTML=top.map(function(x){
      var nome=x[0]==='.'?'(fim da frase)':x[0],pc=x[1]*100;
      return '<button class="llp" data-w="'+esc(x[0])+'"><span>'+esc(nome)+'</span><span class="bar"><i style="width:'+pc+'%"></i></span><span>'+(pc>=1?fnum(pc,0):'<1')+'%</span></button>';
    }).join('')+(resto>0?'<small class="mexp">e mais '+resto+(resto===1?' palavra possível':' palavras possíveis')+', com chance pequena.</small>':'');
    res.innerHTML=aviso||'Toque numa palavra para escolhê-la, ou use os botões. Mexa na temperatura e veja as barras mudarem.';
  }
  function escolhe(w){if(fim()||cheio())return;poe(w)}
  el.addEventListener('input',function(e){if(e.target===sl){T=+sl.value;desenha()}});
  el.addEventListener('click',function(e){
    var b=e.target.closest('button');if(!b)return;
    if(b.dataset.ini){toks=b.dataset.ini.split(' ');ini=toks.slice();aviso='';desenha();return}
    if(b.dataset.w){escolhe(b.dataset.w);desenha();return}
    var d=b.dataset.do;
    if(d==='limpar'){toks=[];ini=[];aviso='';desenha()}
    else if(d==='top'){if(!fim()&&!cheio()){var c=contexto();poe(c.l[0][0])}desenha()}
    else if(d==='sort'){if(!fim()&&!cheio()){poe(sorteia(probs(contexto().l)))}desenha()}
    else if(d==='frase'){
      if(fim()||cheio())toks=ini.slice();
      if(!toks.length){toks=INIC[Math.floor(Math.random()*INIC.length)].split(' ');ini=toks.slice()}
      while(!fim()&&!cheio()){poe(sorteia(probs(contexto().l)))}
      desenha();
    }
  });
  toks=['o','motor'];ini=toks.slice();desenha();
};

W.embed=function(el){
  /* mapa desenhado à mão, só para ensinar a ideia: embeddings de verdade têm centenas de dimensões */
  var GR=[['peças e máquinas','g0'],['defeitos','g1'],['manutenção','g2'],['programação','g3'],['frutas','g4']];
  var PT=[['rolamento',50,40,0],['mancal',98,58,0],['motor',68,96,0],['bomba',134,84,0],
    ['falha',232,44,1],['quebra',296,40,1],['defeito',240,90,1],['vazamento',296,86,1],
    ['reparo',140,146,2],['conserto',208,142,2],['lubrificação',134,190,2],['inspeção',214,186,2],
    ['código',48,252,3],['programa',112,246,3],['software',56,294,3],['algoritmo',122,294,3],
    ['maçã',236,250,4],['laranja',300,246,4],['mamão',240,294,4],['banana',298,294,4]];
  function dist(a,b){var dx=PT[a][1]-PT[b][1],dy=PT[a][2]-PT[b][2];return Math.sqrt(dx*dx+dy*dy)}
  var DM=0,i,j;
  for(i=0;i<PT.length;i++)for(j=i+1;j<PT.length;j++)DM=Math.max(DM,dist(i,j));
  var sel=0;
  el.innerHTML='<p class="ins">Cada palavra virou um <b>ponto no mapa</b>. Palavras de significado parecido ficam <b>perto</b>. Toque numa palavra para ver quem está mais perto e quem está mais longe.</p>'+
    '<svg class="emp" viewBox="0 0 340 320" role="group" aria-label="Mapa de palavras, agrupadas por significado"></svg>'+
    '<div class="lbl3 emg"></div>'+
    '<div class="emn"></div>'+
    '<p class="wnote">Este mapa foi <b>desenhado à mão</b>, só para mostrar a ideia, e as porcentagens são ilustração. Um embedding de verdade é uma lista de centenas ou milhares de números, calculada por um modelo treinado, e a parecença costuma ser medida pelo ângulo entre os vetores (similaridade do cosseno). A mesma ideia funciona para frases inteiras e imagens: é assim que a busca por significado e o RAG acham o trecho certo.</p>';
  var svg=el.querySelector('.emp'),emn=el.querySelector('.emn');
  el.querySelector('.emg').innerHTML=GR.map(function(g){return '<span class="emk '+g[1]+'">●</span> '+g[0]}).join(' &nbsp; ');
  function ordem(k){
    var l=[];for(var q=0;q<PT.length;q++)if(q!==k)l.push([q,dist(k,q)]);
    return l.sort(function(a,b){return a[1]-b[1]});
  }
  function sim(d){return Math.max(0,Math.round((1-d/DM)*100))}
  function desenha(){
    var o=ordem(sel),viz=o.slice(0,3),longe=o[o.length-1],s='';
    viz.forEach(function(v){s+='<line class="eml" x1="'+PT[sel][1]+'" y1="'+PT[sel][2]+'" x2="'+PT[v[0]][1]+'" y2="'+PT[v[0]][2]+'"/>'});
    PT.forEach(function(p,k){
      var isViz=viz.some(function(v){return v[0]===k});
      s+='<g class="emq'+(k===sel?' on':'')+(isViz?' viz':'')+'" data-i="'+k+'" tabindex="0" role="button" aria-label="'+p[0]+'" aria-pressed="'+(k===sel?'true':'false')+'">'+
        '<circle class="emh" cx="'+p[1]+'" cy="'+p[2]+'" r="17"/>'+
        (k===sel||isViz?'<circle class="emr" cx="'+p[1]+'" cy="'+p[2]+'" r="'+(k===sel?10:8)+'"/>':'')+
        '<circle class="emd '+GR[p[3]][1]+'" cx="'+p[1]+'" cy="'+p[2]+'" r="5"/>'+
        '<text x="'+p[1]+'" y="'+(p[2]+17)+'" text-anchor="middle">'+p[0]+'</text></g>';
    });
    svg.innerHTML=s;
    function linha(v,n){return '<div class="emr2"><span>'+n+'. '+PT[v[0]][0]+'</span><span class="bar"><i style="width:'+sim(v[1])+'%"></i></span><span>'+sim(v[1])+'%</span></div>'}
    emn.innerHTML='<p class="ins">Mais perto de <b>'+PT[sel][0]+'</b>:</p>'+viz.map(function(v,n){return linha(v,n+1)}).join('')+
      '<p class="ins">Mais longe: <b>'+PT[longe[0]][0]+'</b> ('+sim(longe[1])+'% de parecença).</p>';
  }
  function pega(t){var g=t.closest('.emq');if(g){sel=+g.dataset.i;desenha();var n=svg.querySelector('.emq[data-i="'+sel+'"]');if(n&&document.activeElement!==n)try{n.focus({preventScroll:true})}catch(e){}}}
  svg.addEventListener('click',function(e){pega(e.target)});
  svg.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();pega(e.target)}});
  desenha();
};
