/* ===== demos ao vivo (parte 12: espectro de vibração e OEE) ===== */

W.vibra=function(el){
  var LF=60,FMAX=400,YMAX=6,ATV=3.585;      /* rede de 60 Hz; escala; fator do rolamento de exemplo */
  var D=[
    {n:'Saudável',t:'Só um pico pequeno na rotação (1x) e o resto no chão de ruído. Este é o espectro que se guarda como referência de uma máquina nova ou recém-revisada.',
     f:function(f1){return [[f1,0.5,'1x'],[2*f1,0.18,'2x']]}},
    {n:'Desbalanceamento',t:'Um pico dominante na rotação (1x), bem acima dos outros, em geral maior na direção radial. Causas típicas: sujeira acumulada no rotor ou na pá, peça solta, desgaste desigual.',
     f:function(f1){return [[f1,4.6,'1x'],[2*f1,0.5,'2x']]}},
    {n:'Desalinhamento',t:'Picos em 1x e 2x, e o 2x pode igualar ou passar o 1x. Costuma aparecer forte também na direção axial. Causas típicas: acoplamento desalinhado, base empenada, pé manco, tubulação forçando a máquina.',
     f:function(f1){return [[f1,2.4,'1x'],[2*f1,3.5,'2x'],[3*f1,1.1,'3x']]}},
    {n:'Folga mecânica',t:'Muitas harmônicas da rotação (1x, 2x, 3x, 4x e mais) e, às vezes, picos em meia rotação. Causas típicas: parafusos de fixação soltos, base trincada, folga num mancal.',
     f:function(f1){return [[0.5*f1,0.9,'0,5x'],[f1,2.5,'1x'],[2*f1,1.7,'2x'],[3*f1,1.4,'3x'],[4*f1,1,'4x'],[5*f1,0.7,'5x']]}},
    {n:'Rolamento (pista externa)',t:'Picos em frequências que não são múltiplos da rotação (aqui, 3,6x e seus múltiplos, valores de um rolamento de exemplo). Costumam aparecer cedo e em frequências mais altas, enquanto o 1x ainda está baixo. É o momento de acompanhar a tendência e planejar a troca.',
     f:function(f1){return [[f1,0.5,'1x'],[ATV*f1,1.4,'BPFO'],[2*ATV*f1,0.95,'2×'],[3*ATV*f1,0.6,'3×']]}},
    {n:'Elétrico (rede de 60 Hz)',t:'Um pico em 120 Hz, o dobro da frequência da rede, não ligado à rotação. Causas típicas: problemas no estator ou no rotor, entreferro irregular. O teste clássico: o pico some no instante em que se corta a energia, enquanto os defeitos mecânicos continuam com o eixo girando.',
     f:function(f1){return [[f1,0.5,'1x'],[2*LF,2.6,'2×rede']]}}];
  var k=1,rpm=1780;
  el.innerHTML='<p class="ins">Cada defeito deixa uma <b>assinatura</b> no espectro de vibração. Escolha um defeito e a rotação do motor. Os valores são inventados, para mostrar os padrões.</p>'+
    '<div class="qchips h vbc">'+D.map(function(d,i){return '<button data-k="'+i+'" aria-pressed="false">'+d.n+'</button>'}).join('')+'</div>'+
    '<svg class="vbp" viewBox="0 0 340 200" role="img" aria-label="Espectro de vibração: velocidade em milímetros por segundo contra frequência em hertz"></svg>'+
    '<label class="fl">Rotação do motor: <b class="vbr"></b><input class="resz" type="range" min="1200" max="3600" step="10" value="1780" aria-label="Rotação em rpm"></label>'+
    '<div class="pdm vbm"></div>'+
    '<p class="wres vbt"></p>'+
    '<p class="wnote">Este é um espectro de velocidade de vibração, em milímetros por segundo, como o de um analisador portátil. A frequência 1x é a rotação do eixo em hertz (rpm dividido por 60). Para saber se um nível é alto, valem a norma (como a ISO 20816), o manual do fabricante e o histórico da própria máquina, e a tendência pesa mais que um número isolado. As regras acima são gerais: o diagnóstico de verdade combina espectro, fase, tendência e conhecimento da máquina, e é trabalho de um analista de vibração certificado.</p>';
  var svg=el.querySelector('.vbp'),mt=el.querySelector('.vbm'),tx=el.querySelector('.vbt'),lr=el.querySelector('.vbr'),sl=el.querySelector('input[type=range]'),chips=el.querySelectorAll('.vbc button');
  var G={x0:34,x1:316,y0:12,y1:170};
  function X(f){return G.x0+f/FMAX*(G.x1-G.x0)}
  function Y(a){return G.y1-Math.min(a,YMAX)/YMAX*(G.y1-G.y0)}
  function ruido(f){var s=Math.sin(f*12.9898+3.1)*43758.5453;return 0.02+0.05*(s-Math.floor(s))}
  function desenha(){
    var f1=rpm/60,d=D[k],pk=d.f(f1).filter(function(p){return p[0]<=FMAX}),s='',i,rms=0,top=pk[0],ult=-99;
    [0,2,4,6].forEach(function(a){s+='<line class="vbg" x1="'+G.x0+'" y1="'+Y(a)+'" x2="'+G.x1+'" y2="'+Y(a)+'"/><text class="vbt2" x="'+(G.x0-4)+'" y="'+(Y(a)+3)+'" text-anchor="end">'+a+'</text>'});
    [0,100,200,300,400].forEach(function(f){s+='<line class="vbg v" x1="'+X(f)+'" y1="'+G.y0+'" x2="'+X(f)+'" y2="'+G.y1+'"/><text class="vbt2" x="'+X(f)+'" y="184" text-anchor="middle">'+f+(f===400?' Hz':'')+'</text>'});
    s+='<text class="vbt2 k" x="'+(G.x0+4)+'" y="'+(G.y0+9)+'">mm/s</text>';
    var fl='M'+X(0)+' '+Y(0.03);for(i=2;i<=FMAX;i+=2)fl+='L'+X(i).toFixed(1)+' '+Y(ruido(i)).toFixed(1);
    s+='<path class="vbf" d="'+fl+'"/>';
    pk.slice().sort(function(a,b){return a[0]-b[0]}).forEach(function(p){
      rms+=p[1]*p[1];if(p[1]>top[1])top=p;
      s+='<line class="vbk" x1="'+X(p[0])+'" y1="'+Y(0)+'" x2="'+X(p[0])+'" y2="'+Y(p[1])+'"/>';
      if(p[1]>=0.45&&X(p[0])-ult>20){s+='<text class="vbl" x="'+X(p[0])+'" y="'+(Y(p[1])-4)+'" text-anchor="middle">'+p[2]+'</text>';ult=X(p[0])}
    });
    svg.innerHTML=s;
    mt.innerHTML='<div><small>Rotação (1x)</small><b>'+fnum(f1,1)+' Hz</b></div><div><small>Nível global</small><b>'+fnum(Math.sqrt(rms),1)+' mm/s</b></div><div><small>Maior pico</small><b>'+top[2]+' · '+fnum(top[0],0)+' Hz</b></div>';
    tx.innerHTML='<b>'+d.n+'.</b> '+d.t;
    lr.textContent=fnum(rpm,0)+' rpm';
    for(i=0;i<chips.length;i++)chips[i].setAttribute('aria-pressed',i===k?'true':'false');
  }
  sl.addEventListener('input',function(){rpm=+sl.value;desenha()});
  el.addEventListener('click',function(e){var c=e.target.closest('.vbc button');if(c){k=+c.dataset.k;desenha()}});
  desenha();
};

W.oee=function(el){
  var PLAN=450,v={par:45,vel:90,ref:5};
  el.innerHTML='<p class="ins">Um turno de 8 h tem 30 min de refeição programada, então a máquina deveria produzir por <b>450 min</b>, no ritmo ideal de <b>1 peça por minuto</b>. Mexa nos três problemas e veja o OEE.</p>'+
    '<label class="fl">Paradas sem querer: <b class="o1"></b><input class="resz" data-k="par" type="range" min="0" max="180" step="5" aria-label="Minutos de parada"></label>'+
    '<label class="fl">Velocidade média, em % do ideal: <b class="o2"></b><input class="resz" data-k="vel" type="range" min="50" max="100" step="1" aria-label="Velocidade média em porcentagem do ideal"></label>'+
    '<label class="fl">Peças ruins, em % do total: <b class="o3"></b><input class="resz" data-k="ref" type="range" min="0" max="20" step="0.5" aria-label="Porcentagem de peças ruins"></label>'+
    '<div class="oeg"></div>'+
    '<div class="oeb"></div>'+
    '<div class="oel"></div>'+
    '<div class="pdm oem rows"></div>'+
    '<p class="wres oer"></p>'+
    '<p class="wnote">A barra mostra para onde foram os 450 minutos. A perda de velocidade e a de qualidade estão em minutos equivalentes: produzir devagar ou fazer peça ruim desperdiça tempo da mesma forma que parar. Nesta conta, 1 peça por minuto é o ritmo ideal, e o OEE só vale se esse tempo ideal de ciclo for honesto.</p>';
  var gr=el.querySelector('.oeg'),bar=el.querySelector('.oeb'),lg=el.querySelector('.oel'),mt=el.querySelector('.oem'),rs=el.querySelector('.oer'),
      sl={},lab={par:el.querySelector('.o1'),vel:el.querySelector('.o2'),ref:el.querySelector('.o3')};
  Array.prototype.forEach.call(el.querySelectorAll('input[type=range]'),function(i){sl[i.dataset.k]=i});
  function oeeDe(par,vel,ref){return (PLAN-par)/PLAN*(vel/100)*(1-ref/100)}
  function desenha(){
    var op=PLAN-v.par,perf=v.vel/100,A=op/PLAN,Q=1-v.ref/100,O=A*perf*Q;
    var perdP=v.par,perdV=op*(1-perf),perdQ=op*perf*(v.ref/100),prod=op*perf*Q;
    gr.innerHTML='<small>OEE</small><b>'+fnum(O*100,1)+' %</b>';
    bar.innerHTML=[['p',prod],['s',perdP],['v',perdV],['q',perdQ]].map(function(x){return '<i class="'+x[0]+'" style="flex:'+Math.max(x[1],0.0001)+'"></i>'}).join('');
    lg.innerHTML='<i class="p"></i><span>Tempo produtivo</span><b>'+fnum(prod,0)+' min</b>'+
      '<i class="s"></i><span>Paradas</span><b>'+fnum(perdP,0)+' min</b>'+
      '<i class="v"></i><span>Perda de velocidade</span><b>'+fnum(perdV,0)+' min</b>'+
      '<i class="q"></i><span>Perda de qualidade</span><b>'+fnum(perdQ,0)+' min</b>';
    mt.innerHTML='<div><small>Disponibilidade</small><b>'+fnum(A*100,0)+' %</b></div><div><small>Desempenho</small><b>'+fnum(perf*100,0)+' %</b></div><div><small>Qualidade</small><b>'+fnum(Q*100,1)+' %</b></div>';
    var L=[['paradas',perdP,oeeDe(0,v.vel,v.ref)],['velocidade abaixo da ideal',perdV,oeeDe(v.par,100,v.ref)],['peças ruins',perdQ,oeeDe(v.par,v.vel,0)]];
    L.sort(function(a,b){return b[1]-a[1]});
    var m=L[0];
    rs.innerHTML=(O>=0.995?'<b>OEE de 100 %.</b> Nenhuma perda: máquina no ritmo ideal, sem parar e sem refugo. Na vida real, isso não acontece.':
      '<b>Maior perda: '+m[0]+'</b> (cerca de '+fnum(m[1],0)+' min). Zerar só esse problema levaria o OEE de '+fnum(O*100,1)+' % para '+fnum(m[2]*100,1)+' %.')+
      ' As três porcentagens se multiplicam: '+fnum(A*100,0)+' % × '+fnum(perf*100,0)+' % × '+fnum(Q*100,1)+' % = '+fnum(O*100,1)+' %.'+(O>=0.85&&O<0.995?' Passou de 85 %, referência muito citada de excelência.':'');
    lab.par.textContent=v.par+' min';lab.vel.textContent=v.vel+' %';lab.ref.textContent=fnum(v.ref,1)+' %';
    Object.keys(sl).forEach(function(k){sl[k].value=v[k]});
  }
  el.addEventListener('input',function(e){var k=e.target.dataset&&e.target.dataset.k;if(!k)return;v[k]=+e.target.value;desenha()});
  desenha();
};
