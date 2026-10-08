/* ===== demos ao vivo (parte 6: estatística e métricas de IA) ===== */

function fnum(n,d){return n.toLocaleString('pt-BR',{minimumFractionDigits:d,maximumFractionDigits:d})}

W.media=function(el){
  var BASE=[12,15,9,14,11,13,10,16,12];
  function stats(a){
    var n=a.length,soma=a.reduce(function(x,y){return x+y},0),m=soma/n;
    var o=a.slice().sort(function(x,y){return x-y});
    var md=n%2?o[(n-1)/2]:(o[n/2-1]+o[n/2])/2;
    var v=a.reduce(function(x,y){return x+(y-m)*(y-m)},0)/(n-1);
    return {m:m,md:md,sd:Math.sqrt(v)};
  }
  var b0=stats(BASE);
  function dur(g){
    if(!g)return 'nenhuma';
    return g+' min'+(g>=60?' ('+fnum(g/60,g%60?1:0)+' h)':'');
  }
  el.innerHTML='<p class="ins">Nove paradas normais de uma máquina, em minutos. Agora imagine que aparece <b>uma parada gigante</b>. Arraste e veja quem se assusta primeiro.</p>'+
    '<label class="fl">Parada gigante: <b class="gv"></b><input class="resz" type="range" min="0" max="480" step="10" value="0" aria-label="Duração da parada gigante em minutos"></label>'+
    '<div class="qchips h mq"><button data-g="0">Nenhuma</button><button data-g="60">1 hora</button><button data-g="240">4 horas</button><button data-g="480">8 horas</button></div>'+
    '<div class="mbw"><div class="mpl"><div class="bars2 mb"></div><div class="mln me"></div><div class="mln md"></div></div>'+
    '<div class="mgt"><span class="ml me"></span><span class="ml md"></span></div></div>'+
    '<p class="lbl3">Gráfico de 0 a 60 minutos. Se a parada passa de 60, a barra âmbar é cortada no topo.</p>'+
    '<div class="acc3 mn"></div>'+
    '<p class="wres mv"></p>'+
    '<p class="wnote">Quando há valores extremos (tempo de parada, salário, preço de imóvel), olhe a <b>mediana</b>, ou olhe a média <b>junto</b> com o desvio padrão. Repare que o desvio padrão também dispara com um valor extremo, e isso ajuda a perceber que tem algo estranho nos dados.</p>';
  var sl=el.querySelector('input'),gv=el.querySelector('.gv'),mb=el.querySelector('.mb'),
      me=el.querySelector('.mln.me'),md=el.querySelector('.mln.md'),lme=el.querySelector('.ml.me'),lmd=el.querySelector('.ml.md'),
      mn=el.querySelector('.mn'),mv=el.querySelector('.mv'),chips=el.querySelectorAll('.mq button');
  var ESC=60,ALT=120;
  function upd(){
    var g=+sl.value,a=g?BASE.concat([g]):BASE.slice(),s=stats(a);
    gv.textContent=dur(g);
    mb.innerHTML=a.map(function(v,i){
      var gig=g&&i===a.length-1,h=Math.max(3,Math.min(v/ESC,1)*100);
      return '<i'+(gig?' class="hot"':'')+' style="height:'+h+'%" title="'+v+' min">'+(gig&&v>ESC?'<u>'+v+'</u>':'')+'</i>';
    }).join('');
    var pm=Math.min(s.m/ESC,1)*ALT,pd=Math.min(s.md/ESC,1)*ALT,lm=pm,ld=pd;
    if(Math.abs(pm-pd)<14){var mi=(pm+pd)/2;if(pm>=pd){lm=mi+7;ld=mi-7}else{lm=mi-7;ld=mi+7}}
    function cl(x){return Math.max(7,Math.min(ALT-7,x))}
    me.style.bottom=pm+'px';md.style.bottom=pd+'px';lme.style.bottom=cl(lm)+'px';lmd.style.bottom=cl(ld)+'px';
    lme.textContent='média '+fnum(s.m,1);lmd.textContent='mediana '+fnum(s.md,1);
    mn.innerHTML='<div class="acc"><span>Média</span><b>'+fnum(s.m,1)+'</b><small>min</small></div>'+
      '<div class="acc"><span>Mediana</span><b>'+fnum(s.md,1)+'</b><small>min</small></div>'+
      '<div class="acc"><span>Desvio padrão</span><b>'+fnum(s.sd,1)+'</b><small>min</small></div>';
    if(!g){
      mv.innerHTML='Sem parada gigante, a média ('+fnum(b0.m,1)+') e a mediana ('+fnum(b0.md,1)+') quase coincidem: tanto faz qual você usa.';
    }else{
      var up=(s.m/b0.m-1)*100;
      var fim=s.m>2*s.md?'<b class="bad">Agora a média não representa nenhuma parada normal.</b>':(s.m>1.25*s.md?'A média já se afastou do que acontece no dia a dia.':'Ainda parecidas: um valor só pesa pouco aqui.');
      mv.innerHTML='A parada de <b>'+dur(g)+'</b> puxou a <b>média</b> de '+fnum(b0.m,1)+' para <b>'+fnum(s.m,1)+'</b> ('+fnum(up,0)+'% a mais), mas a <b>mediana</b> foi só de '+fnum(b0.md,1)+' para <b>'+fnum(s.md,1)+'</b>. '+fim;
    }
    Array.prototype.forEach.call(chips,function(b){b.setAttribute('aria-pressed',+b.dataset.g===g?'true':'false')});
  }
  sl.addEventListener('input',upd);
  el.querySelector('.mq').addEventListener('click',function(e){
    var b=e.target.closest('button');if(!b)return;
    sl.value=b.dataset.g;upd();
  });
  upd();
};

W.confusao=function(el){
  /* 30 peças inventadas: [nota de risco dada pelo modelo (0 a 100), 1 se tem defeito de verdade] */
  var D=[[91,1],[84,1],[77,1],[66,1],[58,1],[41,1],[35,1],
    [72,0],[55,0],[49,0],[46,0],[44,0],[40,0],[38,0],[34,0],[31,0],[29,0],[27,0],[25,0],[22,0],[20,0],[18,0],[15,0],[13,0],[11,0],[9,0],[7,0],[6,0],[4,0],[2,0]];
  var X0=14,XW=312,PRE=[['Rigoroso',30],['Equilibrado',50],['Bonzinho',70],['Preguiçoso',100]];
  var ord=D.slice().sort(function(a,b){return a[0]-b[0]});
  var nd=D.filter(function(p){return p[1]}).length,nb=D.length-nd;
  function X(s){return X0+s/100*XW}
  function conta(c){
    var r={vp:0,fn:0,fp:0,vn:0};
    D.forEach(function(p){
      var acusa=p[0]>=c;
      if(p[1])acusa?r.vp++:r.fn++;else acusa?r.fp++:r.vn++;
    });
    return r;
  }
  el.innerHTML='<p class="ins">30 peças passaram pelo modelo de inspeção. Cada ponto é uma peça, posicionada pela <b>nota de risco</b> que o modelo deu (0 a 100). Você decide a partir de que nota o modelo <b>acusa defeito</b>.</p>'+
    '<label class="fl">Ponto de corte: <b class="cv"></b><input class="resz" type="range" min="0" max="100" step="1" value="50" aria-label="Ponto de corte da nota de risco"></label>'+
    '<div class="qchips h cq">'+PRE.map(function(p){return '<button data-c="'+p[1]+'">'+p[0]+' · '+p[1]+'</button>'}).join('')+'</div>'+
    '<svg class="cfp" viewBox="0 0 340 204" role="img" aria-label="Peças posicionadas pela nota de risco, com a linha do ponto de corte"></svg>'+
    '<p class="lbl3">Círculo verde = o modelo acertou. Cruz vermelha = o modelo errou.</p>'+
    '<div class="cm"></div>'+
    '<div class="cmx"></div>'+
    '<p class="wres cr"></p>'+
    '<p class="wnote">Os números são inventados, só para mostrar a ideia. No mundo real, o ponto de corte se escolhe pelo <b>custo de cada erro</b>: deixar passar um defeito crítico costuma custar muito mais que reinspecionar uma peça boa.</p>';
  var sl=el.querySelector('input'),cv=el.querySelector('.cv'),svg=el.querySelector('.cfp'),cm=el.querySelector('.cm'),cmx=el.querySelector('.cmx'),cr=el.querySelector('.cr'),
      chips=el.querySelectorAll('.cq button');
  function cruz(x,y){return '<path class="cfb" d="M'+(x-4.5)+' '+(y-4.5)+'L'+(x+4.5)+' '+(y+4.5)+'M'+(x+4.5)+' '+(y-4.5)+'L'+(x-4.5)+' '+(y+4.5)+'"/>'}
  function desenha(c){
    var s='<rect class="cfz" x="'+X(c)+'" y="6" width="'+(X0+XW+8-X(c))+'" height="162"/>';
    s+='<text class="cft" x="'+X0+'" y="20">COM DEFEITO ('+nd+')</text><text class="cft" x="'+X0+'" y="94">PEÇAS BOAS ('+nb+')</text>';
    s+='<line class="cfa" x1="'+X0+'" y1="80" x2="'+(X0+XW)+'" y2="80"/>';
    var i1=0,i0=0;
    ord.forEach(function(p){
      var acusa=p[0]>=c,errou=p[1]?!acusa:acusa,x=X(p[0]),y;
      if(p[1]){y=36+(i1++%3)*12}else{y=108+(i0++%4)*14}
      s+=errou?cruz(x,y):'<circle class="cfo" cx="'+x+'" cy="'+y+'" r="4.6"/>';
    });
    s+='<line class="cfl" x1="'+X(c)+'" y1="6" x2="'+X(c)+'" y2="168"/>';
    [0,25,50,75,100].forEach(function(t){s+='<text class="cft k" x="'+X(t)+'" y="182" text-anchor="middle">'+t+'</text>'});
    s+='<text class="cft" x="'+X0+'" y="198">← o modelo libera</text><text class="cft" x="'+(X0+XW)+'" y="198" text-anchor="end">o modelo acusa defeito →</text>';
    svg.innerHTML=s;
  }
  function upd(){
    var c=+sl.value,r=conta(c),acusadas=r.vp+r.fp;
    var acc=(r.vp+r.vn)/D.length,prec=acusadas?r.vp/acusadas:0,rec=r.vp/nd;
    cv.textContent=c===0?'0 (acusa tudo)':(c>=100?'100 (nunca acusa)':c);
    desenha(c);
    cm.innerHTML='<span></span><b class="ch">Modelo acusa defeito</b><b class="ch">Modelo libera</b>'+
      '<b class="rh">Tem defeito de verdade</b><div class="cell ok"><small>VP · achou</small><b>'+r.vp+'</b></div><div class="cell bad"><small>FN · deixou passar</small><b>'+r.fn+'</b></div>'+
      '<b class="rh">É peça boa de verdade</b><div class="cell bad"><small>FP · alarme falso</small><b>'+r.fp+'</b></div><div class="cell ok"><small>VN · liberou certo</small><b>'+r.vn+'</b></div>';
    function barra(nome,v,def,txt){
      return '<div class="bo"><span>'+nome+'</span><span class="bar"><i style="width:'+(def?0:v*100)+'%"></i></span><span>'+(def?'—':fnum(v*100,0)+'%')+'</span></div><small class="mexp">'+txt+'</small>';
    }
    cmx.innerHTML=barra('Acurácia',acc,false,(r.vp+r.vn)+' de '+D.length+' peças classificadas certo.')+
      barra('Precisão',prec,!acusadas,acusadas?'Das '+acusadas+' peças acusadas, '+r.vp+(r.vp===1?' tinha':' tinham')+' defeito de verdade.':'O modelo não acusou nenhuma peça, então não dá para calcular.')+
      barra('Recall',rec,false,'Dos '+nd+' defeitos que existem, o modelo achou '+r.vp+'.');
    var msg;
    if(!r.vp){
      msg='<b class="bad">Armadilha da acurácia:</b> o modelo acerta '+fnum(acc*100,0)+'% e não acha defeito nenhum. Acurácia alta não prova que o modelo serve.';
    }else if(!r.fn&&r.fp){
      msg='Achou <b>todos</b> os defeitos, mas reprovou '+r.fp+(r.fp===1?' peça boa':' peças boas')+' à toa. Bom quando deixar passar defeito é perigoso.';
    }else if(!r.fp&&r.fn){
      msg='<b>Nenhum alarme falso</b>, mas '+r.fn+(r.fn===1?' defeito escapou':' defeitos escaparam')+'. Serve quando reinspecionar é caro, mas é ruim se o defeito for crítico.';
    }else if(!r.fp&&!r.fn){
      msg='<b>Separou tudo certo.</b> Com dados reais isso quase nunca acontece, e é sinal para desconfiar do teste.';
    }else{
      msg='Há <b>'+r.fp+'</b> '+(r.fp===1?'alarme falso':'alarmes falsos')+' e <b>'+r.fn+'</b> '+(r.fn===1?'defeito escapando':'defeitos escapando')+'. Baixar o corte pega mais defeitos, mas gera mais alarmes falsos. Subir faz o contrário.';
    }
    cr.innerHTML=msg;
    Array.prototype.forEach.call(chips,function(b){b.setAttribute('aria-pressed',+b.dataset.c===c?'true':'false')});
  }
  sl.addEventListener('input',upd);
  el.querySelector('.cq').addEventListener('click',function(e){
    var b=e.target.closest('button');if(!b)return;
    sl.value=b.dataset.c;upd();
  });
  upd();
};
