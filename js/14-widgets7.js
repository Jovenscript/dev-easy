/* ===== demos ao vivo (parte 7: um neurônio que aprende) ===== */

W.neuron=function(el){
  /* 14 leituras inventadas: [vibração em mm/s, temperatura em °C, 1 se a máquina deveria parar] */
  var P=[[2,60,0],[3,65,0],[2.5,62,0],[4,70,0],[3.5,68,0],[5,74,0],[6,72,0],
    [9,90,1],[8,85,1],[10,95,1],[7.5,88,1],[9.5,80,1],[6.5,84,1],[8.5,78,1]];
  var VMIN=0,VMAX=12,TMIN=50,TMAX=110,G={x0:40,y0:16,w:290,h:186};
  var MV=5.5,SV=2.8,MT=77,ST=11,LR=0.3;           /* escala usada só dentro do treino */
  var RG={v:[-2.5,2.5],t:[-1,1],b:[-100,50]};
  var INI={v:-0.2,t:0.1,b:-4},EXE={v:0.6,t:0.3,b:-25};
  var w={v:INI.v,t:INI.t,b:INI.b},foco=-1,prox=0,passos=0,msg='',probe=[7,80],timer=null;
  function X(v){return G.x0+(v-VMIN)/(VMAX-VMIN)*G.w}
  function Y(t){return G.y0+(TMAX-t)/(TMAX-TMIN)*G.h}
  function soma(v,t){return w.v*v+w.t*t+w.b}
  function dec(v,t){return soma(v,t)>0?1:0}
  function acertos(){return P.filter(function(p){return dec(p[0],p[1])===p[2]}).length}
  function cl(x,r){return Math.max(r[0],Math.min(r[1],x))}
  function area(sinal){
    var R=[[VMIN,TMIN],[VMAX,TMIN],[VMAX,TMAX],[VMIN,TMAX]],out=[],corte=[];
    for(var i=0;i<4;i++){
      var a=R[i],b=R[(i+1)%4],fa=sinal*soma(a[0],a[1]),fb=sinal*soma(b[0],b[1]);
      if(fa>0)out.push(a);
      if((fa>0)!==(fb>0)){var k=fa/(fa-fb),q=[a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k];out.push(q);corte.push(q)}
    }
    return {poly:out,corte:corte};
  }
  function pts(poly){return poly.map(function(q){return X(q[0]).toFixed(1)+','+Y(q[1]).toFixed(1)}).join(' ')}
  function centro(poly){
    var sx=0,sy=0;poly.forEach(function(q){sx+=q[0];sy+=q[1]});
    return [sx/poly.length,sy/poly.length];
  }
  el.innerHTML='<p class="ins">Um <b>neurônio</b> com 2 entradas decide se a máquina deve <b>parar</b>. Cada ponto é uma leitura antiga, com a resposta certa. A linha preta é a fronteira da decisão. Anel vermelho = o neurônio errou aquela leitura.</p>'+
    '<svg class="nfp" viewBox="0 0 340 250" role="img" aria-label="Gráfico de vibração e temperatura com a reta de decisão do neurônio"></svg>'+
    '<p class="lbl3">Círculo = máquina boa. Quadrado = falha. Losango = peça nova: toque no gráfico para testar.</p>'+
    '<p class="wres nst"></p>'+
    '<label class="fl">Peso da vibração: <b class="nv1"></b><input class="resz" data-k="v" type="range" min="'+RG.v[0]+'" max="'+RG.v[1]+'" step="0.01" aria-label="Peso da vibração"></label>'+
    '<label class="fl">Peso da temperatura: <b class="nv2"></b><input class="resz" data-k="t" type="range" min="'+RG.t[0]+'" max="'+RG.t[1]+'" step="0.005" aria-label="Peso da temperatura"></label>'+
    '<label class="fl">Bias (limite): <b class="nv3"></b><input class="resz" data-k="b" type="range" min="'+RG.b[0]+'" max="'+RG.b[1]+'" step="0.5" aria-label="Bias"></label>'+
    '<div class="acts2 nbt"><button class="btn sm" data-do="passo">Treinar 1 passo</button><button class="btn sm" data-do="auto">Treinar até acertar</button>'+
    '<button class="btn sm ghost" data-do="ini">Recomeçar errando</button><button class="btn sm ghost" data-do="exe">Pesos do exemplo</button></div>'+
    '<p class="ins">A conta do neurônio para a peça nova (losango):</p>'+
    '<div class="nfc"></div>'+
    '<p class="wnote">Treinar é isto: quando o neurônio erra uma leitura, os três números são empurrados um pouquinho na direção que teria acertado, e repete. Ninguém escolheu os pesos: saíram dos exemplos. Uma rede tem milhões desses números. Os neurônios de verdade usam uma curva suave no lugar do degrau (soma maior que zero), mas a ideia é a mesma. Dentro do treino, as entradas são colocadas numa escala parecida, como se faz nos modelos reais.</p>';
  var svg=el.querySelector('.nfp'),nst=el.querySelector('.nst'),nfc=el.querySelector('.nfc'),
      sl={};
  Array.prototype.forEach.call(el.querySelectorAll('input[type=range]'),function(i){sl[i.dataset.k]=i});
  var lab={v:el.querySelector('.nv1'),t:el.querySelector('.nv2'),b:el.querySelector('.nv3')};
  var btnAuto=el.querySelector('[data-do=auto]');
  function stop(){if(timer){clearInterval(timer);timer=null}btnAuto.textContent='Treinar até acertar'}
  CLEAN.push(stop);
  function desenha(skip){
    var s='',pos=area(1),neg=area(-1),i;
    s+='<rect class="nfn" x="'+G.x0+'" y="'+G.y0+'" width="'+G.w+'" height="'+G.h+'"/>';
    if(pos.poly.length)s+='<polygon class="nfz" points="'+pts(pos.poly)+'"/>';
    [50,70,90,110].forEach(function(t){s+='<line class="nfg" x1="'+G.x0+'" y1="'+Y(t)+'" x2="'+(G.x0+G.w)+'" y2="'+Y(t)+'"/><text class="nft" x="'+(G.x0-5)+'" y="'+(Y(t)+3)+'" text-anchor="end">'+t+'</text>'});
    [0,3,6,9,12].forEach(function(v){s+='<line class="nfg" x1="'+X(v)+'" y1="'+G.y0+'" x2="'+X(v)+'" y2="'+(G.y0+G.h)+'"/><text class="nft" x="'+X(v)+'" y="'+(G.y0+G.h+13)+'" text-anchor="middle">'+v+'</text>'});
    s+='<text class="nft" x="'+G.x0+'" y="9">temperatura (°C)</text><text class="nft" x="'+(G.x0+G.w/2)+'" y="244" text-anchor="middle">vibração (mm/s)</text>';
    if(pos.poly.length>=3){var c=centro(pos.poly);s+='<text class="nfw bad" x="'+X(c[0])+'" y="'+Y(c[1])+'" text-anchor="middle">PARAR</text>'}
    if(neg.poly.length>=3){var d=centro(neg.poly);s+='<text class="nfw ok" x="'+X(d[0])+'" y="'+Y(d[1])+'" text-anchor="middle">SEGUE</text>'}
    if(pos.corte.length===2)s+='<line class="nfl" x1="'+X(pos.corte[0][0])+'" y1="'+Y(pos.corte[0][1])+'" x2="'+X(pos.corte[1][0])+'" y2="'+Y(pos.corte[1][1])+'"/>';
    P.forEach(function(p,j){
      var x=X(p[0]),y=Y(p[1]),errou=dec(p[0],p[1])!==p[2];
      s+=p[2]?'<rect class="nff" x="'+(x-4.5)+'" y="'+(y-4.5)+'" width="9" height="9"/>':'<circle class="nfo" cx="'+x+'" cy="'+y+'" r="5"/>';
      if(errou)s+='<circle class="nfr" cx="'+x+'" cy="'+y+'" r="10"/>';
      if(j===foco)s+='<circle class="nfx" cx="'+x+'" cy="'+y+'" r="14"/>';
    });
    var px=X(probe[0]),py=Y(probe[1]);
    s+='<path class="nfq" d="M'+px+' '+(py-9)+'L'+(px+9)+' '+py+'L'+px+' '+(py+9)+'L'+(px-9)+' '+py+'Z"/><circle class="nfk" cx="'+px+'" cy="'+py+'" r="2"/>';
    svg.innerHTML=s;
    var ok=acertos(),n=P.length;
    nst.innerHTML=(ok===n?'<b class="okc">Acertou as '+n+' leituras.</b>':'Acertos: <b>'+ok+' de '+n+'</b>.')+(msg?' '+msg:'');
    lab.v.textContent=fnum(w.v,2);lab.t.textContent=fnum(w.t,3);lab.b.textContent=fnum(w.b,1);
    Object.keys(sl).forEach(function(k){if(k!==skip)sl[k].value=w[k]});
    var sm=soma(probe[0],probe[1]),dd=sm>0;
    nfc.innerHTML='<span>vibração</span><span>'+fnum(probe[0],1)+' × '+fnum(w.v,2)+'</span><b>'+fnum(w.v*probe[0],2)+'</b>'+
      '<span>temperatura</span><span>'+fnum(probe[1],0)+' × '+fnum(w.t,3)+'</span><b>'+fnum(w.t*probe[1],2)+'</b>'+
      '<span>bias</span><span></span><b>'+fnum(w.b,1)+'</b>'+
      '<span class="nfs">soma</span><span class="nfs"><span class="bd '+(dd?'block':'pass')+'">'+(dd?'PARAR':'SEGUE')+'</span></span><b class="nfs">'+fnum(sm,2)+'</b>';
  }
  function passo(){
    var n=P.length,i,e=0,p;
    for(var k=0;k<n;k++){i=(prox+k)%n;p=P[i];e=p[2]-dec(p[0],p[1]);if(e)break}
    if(!e)return false;
    var s0=soma(p[0],p[1]),w1=w.v*SV,w2=w.t*ST,bn=w.b+w.v*MV+w.t*MT,x1=(p[0]-MV)/SV,x2=(p[1]-MT)/ST;
    w1+=LR*e*x1;w2+=LR*e*x2;bn+=LR*e;
    w.v=cl(w1/SV,RG.v);w.t=cl(w2/ST,RG.t);w.b=cl(bn-w1*MV/SV-w2*MT/ST,RG.b);
    foco=i;prox=(i+1)%n;passos++;
    msg='<br>Passo '+passos+': errou a leitura ('+fnum(p[0],1)+' mm/s, '+p[1]+' °C). Era <b>'+(p[2]?'falha':'máquina boa')+'</b> (a soma deveria ser '+(p[2]?'positiva':'negativa')+'), mas deu <b>'+fnum(s0,1)+'</b>. Os três números mudaram um pouquinho e agora essa leitura dá <b>'+fnum(soma(p[0],p[1]),1)+'</b>: '+(dec(p[0],p[1])===p[2]?'já ficou do lado certo.':'ainda do lado errado, mas mais perto.');
    return true;
  }
  function pronto(){msg='<br><b>Pronto:</b> em '+passos+(passos===1?' passo':' passos')+' os números certos apareceram sozinhos, só a partir dos exemplos.'}
  function recomeca(p){
    stop();w={v:p.v,t:p.t,b:p.b};foco=-1;prox=0;passos=0;msg='';desenha();
  }
  el.addEventListener('input',function(e){
    var k=e.target.dataset&&e.target.dataset.k;if(!k)return;
    stop();w[k]=+e.target.value;foco=-1;passos=0;msg='';desenha(k);
  });
  el.addEventListener('click',function(e){
    var b=e.target.closest('button');
    if(b&&b.dataset.do){
      var d=b.dataset.do;
      if(d==='ini')recomeca(INI);
      else if(d==='exe')recomeca(EXE);
      else if(d==='passo'){
        stop();
        if(!passo()){foco=-1;msg='<br>Já acertou todas as leituras. Não há o que corrigir.'}
        else if(acertos()===P.length)pronto();
        desenha();
      }else if(d==='auto'){
        if(timer){stop();desenha();return}
        if(acertos()===P.length){foco=-1;msg='<br>Já acertou todas as leituras. Não há o que corrigir.';desenha();return}
        btnAuto.textContent='Parar';
        timer=setInterval(function(){
          var fez=passo();
          if(!fez||acertos()===P.length||passos>=80){stop();if(fez&&acertos()===P.length)pronto();else if(fez)msg+='<br>Passou de 80 passos sem separar tudo. Tente &quot;Recomeçar errando&quot;.'}
          desenha();
        },600);
      }
      return;
    }
    var sv=e.target.closest('.nfp');
    if(sv){
      var r=sv.getBoundingClientRect(),vx=(e.clientX-r.left)/r.width*340,vy=(e.clientY-r.top)/r.height*250;
      var v=VMIN+(vx-G.x0)/G.w*(VMAX-VMIN),t=TMAX-(vy-G.y0)/G.h*(TMAX-TMIN);
      probe=[Math.max(VMIN,Math.min(VMAX,v)),Math.max(TMIN,Math.min(TMAX,t))];
      desenha();
    }
  });
  desenha();
};
