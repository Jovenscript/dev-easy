/* ===== demos ao vivo (parte 10: controle PID e sinal de 4 a 20 mA) ===== */

W.pid=function(el){
  var DT=0.05,TF=80,SPD=50,AMB=20,TSP=2,TDIST=45,DIST=-12,K=1.5,TAU=8,ATR=1.5;
  var PR=[['Só P',2,0,0],['P forte',4.5,0,0],['PI',3,0.5,0],['Agressivo',5,1,0],['PID',5,1,3],['Instável',14,0,0]];
  var v={kp:PR[0][1],ki:PR[0][2],kd:PR[0][3]},porta=true;
  var G={x0:34,x1:322,y0:12,y1:134,u0:164,u1:208};
  el.innerHTML='<p class="ins">Um forno precisa chegar a <b>70 °C</b> e ficar lá. O PID decide a potência da resistência. Toque numa receita ou mexa nos três ganhos: o gráfico é recalculado na hora.</p>'+
    '<div class="qchips h pdc">'+PR.map(function(p,i){return '<button data-p="'+i+'" aria-pressed="false">'+p[0]+'</button>'}).join('')+'</div>'+
    '<svg class="pdp" viewBox="0 0 340 230" role="img" aria-label="Gráfico da temperatura do forno e da saída do controlador ao longo do tempo"></svg>'+
    '<p class="lbl3">Azul: temperatura. Tracejado: alvo, com faixa de ±1 °C. Âmbar: saída do controlador.</p>'+
    '<div class="pdm"></div>'+
    '<p class="wres pdr" aria-live="polite"></p>'+
    '<label class="fl">Kp (proporcional): <b class="pv1"></b><input class="resz" data-k="kp" type="range" min="0" max="15" step="0.1" aria-label="Ganho proporcional Kp"></label>'+
    '<label class="fl">Ki (integral): <b class="pv2"></b><input class="resz" data-k="ki" type="range" min="0" max="2" step="0.05" aria-label="Ganho integral Ki"></label>'+
    '<label class="fl">Kd (derivativo): <b class="pv3"></b><input class="resz" data-k="kd" type="range" min="0" max="8" step="0.1" aria-label="Ganho derivativo Kd"></label>'+
    '<button class="btn sm ghost" data-do="porta" aria-pressed="true">Porta do forno abre aos 45 s: sim</button>'+
    '<p class="wnote">O forno aqui é um modelo simples: esquenta devagar (constante de tempo de 8 s, acelerada; num forno de verdade seriam minutos) e o sensor demora 1,5 s para perceber a mudança. O <b>P</b> reage ao erro de agora. O <b>I</b> soma o erro acumulado e elimina a diferença que sobra. O <b>D</b> olha a velocidade da subida e freia antes de passar. A saída é limitada a 0 a 100 %, e o I congela quando a saída satura. Os ganhos bons daqui servem para este forno de brinquedo: cada processo real precisa da sua própria sintonia.</p>';
  var svg=el.querySelector('.pdp'),mt=el.querySelector('.pdm'),rs=el.querySelector('.pdr'),bp=el.querySelector('[data-do=porta]'),
      sl={},lab={kp:el.querySelector('.pv1'),ki:el.querySelector('.pv2'),kd:el.querySelector('.pv3')},
      chips=el.querySelectorAll('.pdc button');
  Array.prototype.forEach.call(el.querySelectorAll('input[type=range]'),function(i){sl[i.dataset.k]=i});
  function sim(){
    var n=Math.round(TF/DT),buf=[],at=Math.round(ATR/DT),i,k,y=0,ym=0,I=0,o={y:[],u:[]};
    for(i=0;i<at;i++)buf.push(0);
    for(k=0;k<n;k++){
      var t=k*DT,sp=t>=TSP?SPD:0,d=(porta&&t>=TDIST)?DIST:0;
      var e=sp-y,D=-v.kd*(y-ym)/DT,u=v.kp*e+I+D,uc=Math.max(0,Math.min(100,u));
      if(u===uc||(u>100&&e<0)||(u<0&&e>0))I+=v.ki*e*DT;
      ym=y;buf.push(uc);
      y+=DT*(-y+K*buf.shift()+d)/TAU;
      if(y<0)y=0;
      o.y.push(y);o.u.push(uc);
    }
    return o;
  }
  function medidas(o){
    var n=o.y.length,i0=Math.round(TSP/DT),i1=Math.round(TDIST/DT),j,pico=0,ult=-1,mn=1e9,mx=-1e9,sat=0,w0=i1-Math.round(10/DT);
    for(j=i0;j<i1;j++){pico=Math.max(pico,o.y[j]);if(Math.abs(o.y[j]-SPD)>0.02*SPD)ult=j}
    for(j=w0;j<i1;j++){mn=Math.min(mn,o.y[j]);mx=Math.max(mx,o.y[j]);if(o.u[j]<0.01||o.u[j]>99.99)sat++}
    var minD=1e9,ultD=-1;
    for(j=i1;j<n;j++){minD=Math.min(minD,o.y[j]);if(Math.abs(o.y[j]-SPD)>0.02*SPD)ultD=j}
    return {passou:Math.max(0,(pico-SPD)/SPD*100),
      ts:ult===i1-1?null:(ult<0?0:(ult+1-i0)*DT),
      erro:SPD-o.y[i1-1],osc:mx-mn,sat:sat/(i1-w0),
      queda:SPD-minD,rec:ultD===n-1?null:(ultD<0?0:(ultD+1-i1)*DT)};
  }
  function texto(m){
    var s;
    if(v.kp===0&&v.ki===0)return '<b>Controlador sem ação.</b> Com Kp e Ki zerados a saída fica em 0 % e o forno não esquenta.';
    if(m.osc>15||(m.osc>5&&m.sat>0.25))s='<b>Instável.</b> A oscilação só cresce, até a saída bater em 0 % e em 100 %: o controle virou um liga e desliga. O ganho está alto demais para este forno.';
    else if(m.osc>2.5)s='<b>Oscilando.</b> A temperatura balança em volta do alvo e demora a assentar. O ganho está alto para um forno que demora a responder. Reduza o Kp ou o Ki, ou tente um pouco de Kd.';
    else if(m.ts===null&&v.ki===0&&Math.abs(m.erro)>1)s='<b>Sobrou erro de '+fnum(Math.abs(m.erro),1)+' °C.</b> Com só P, a saída é proporcional ao erro, então ela só existe enquanto o erro existir: por isso nunca chega exatamente ao alvo. O termo I resolve isso.';
    else if(m.ts===null)s='<b>Ainda não estabilizou aos 45 s.</b> Está lento ou ainda balançando. Ajuste o Ki ou o Kp.';
    else if(m.passou>10)s='<b>Passou '+fnum(m.passou,0)+' % do degrau</b> antes de voltar ao alvo. Chegou, mas ultrapassou. Menos Ki, ou um pouco de Kd, reduz isso.';
    else s='<b>Bom resultado:</b> estabilizou em '+fnum(m.ts,1)+' s'+(m.passou>0.5?', passando '+fnum(m.passou,1)+' % do degrau.':', sem ultrapassar o alvo.');
    if(porta&&!(m.osc>2.5)){
      if(m.queda<1)s+=' Quando a porta abriu, quase não fez diferença.';
      else if(m.rec===null)s+=' Quando a porta abriu, a temperatura caiu até '+fnum(m.queda,1)+' °C abaixo do alvo e '+(v.ki===0?'não voltou: sem o I, o controlador aceita ficar com erro.':'não voltou ao alvo até o fim.');
      else s+=' Quando a porta abriu, a temperatura caiu até '+fnum(m.queda,1)+' °C abaixo do alvo e voltou em '+fnum(m.rec,1)+' s.';
    }
    return s;
  }
  function X(t){return G.x0+t/TF*(G.x1-G.x0)}
  function Y(T){return G.y1-(Math.min(100,Math.max(AMB,T))-AMB)/80*(G.y1-G.y0)}
  function U(u){return G.u1-u/100*(G.u1-G.u0)}
  function trilha(a,f){var s='',i;for(i=0;i<a.length;i+=4)s+=(i?'L':'M')+X(i*DT).toFixed(1)+' '+f(a[i]).toFixed(1);return s}
  function desenha(){
    var o=sim(),m=medidas(o),s='',i;
    s+='<rect class="pdb" x="'+G.x0+'" y="'+Y(AMB+SPD+1)+'" width="'+(G.x1-G.x0)+'" height="'+(Y(AMB+SPD-1)-Y(AMB+SPD+1))+'"/>';
    [20,40,60,80,100].forEach(function(T){s+='<line class="pdg" x1="'+G.x0+'" y1="'+Y(T)+'" x2="'+G.x1+'" y2="'+Y(T)+'"/><text class="pdt" x="'+(G.x0-4)+'" y="'+(Y(T)+3)+'" text-anchor="end">'+T+'</text>'});
    [0,50,100].forEach(function(u){s+='<line class="pdg" x1="'+G.x0+'" y1="'+U(u)+'" x2="'+G.x1+'" y2="'+U(u)+'"/><text class="pdt" x="'+(G.x0-4)+'" y="'+(U(u)+3)+'" text-anchor="end">'+u+'</text>'});
    [0,20,40,60,80].forEach(function(t){s+='<line class="pdg v" x1="'+X(t)+'" y1="'+G.y0+'" x2="'+X(t)+'" y2="'+G.u1+'"/><text class="pdt" x="'+X(t)+'" y="224" text-anchor="middle">'+t+(t===80?' s':'')+'</text>'});
    s+='<text class="pdt k" x="'+(G.x0+4)+'" y="'+(G.y0+9)+'">temperatura (°C)</text><text class="pdt k" x="'+(G.x0+4)+'" y="'+(G.u0-5)+'">saída do controlador (%)</text>';
    if(porta)s+='<line class="pdd" x1="'+X(TDIST)+'" y1="'+G.y0+'" x2="'+X(TDIST)+'" y2="'+G.u1+'"/><text class="pdt k" x="'+(X(TDIST)+3)+'" y="'+(G.y1-5)+'">porta abre</text>';
    s+='<path class="pdsp" d="M'+X(0)+' '+Y(AMB)+'L'+X(TSP)+' '+Y(AMB)+'L'+X(TSP)+' '+Y(AMB+SPD)+'L'+X(TF)+' '+Y(AMB+SPD)+'"/>';
    s+='<path class="pdu" d="'+trilha(o.u,U)+'"/><path class="pdv" d="'+trilha(o.y,function(y){return Y(AMB+y)})+'"/>';
    svg.innerHTML=s;
    var elab=Math.abs(m.erro)>=0.1?(m.erro>0?'Faltou no fim':'Passou no fim'):'Erro no fim';
    mt.innerHTML='<div><small>Passou do alvo</small><b>'+fnum(m.passou,0)+' %</b></div><div><small>Estabilizou em</small><b>'+(m.ts===null?'mais de 43 s':fnum(m.ts,1)+' s')+'</b></div><div><small>'+elab+'</small><b>'+fnum(Math.abs(m.erro),1)+' °C</b></div>';
    rs.innerHTML=texto(m);
    lab.kp.textContent=fnum(v.kp,1);lab.ki.textContent=fnum(v.ki,2);lab.kd.textContent=fnum(v.kd,1);
    Object.keys(sl).forEach(function(k){sl[k].value=v[k]});
    for(i=0;i<PR.length;i++)chips[i].setAttribute('aria-pressed',(PR[i][1]===v.kp&&PR[i][2]===v.ki&&PR[i][3]===v.kd)?'true':'false');
    bp.setAttribute('aria-pressed',porta?'true':'false');
    bp.textContent='Porta do forno abre aos 45 s: '+(porta?'sim':'não');
  }
  el.addEventListener('input',function(e){
    var k=e.target.dataset&&e.target.dataset.k;if(!k)return;
    v[k]=+e.target.value;desenha();
  });
  el.addEventListener('click',function(e){
    var c=e.target.closest('.pdc button');
    if(c){var p=PR[+c.dataset.p];v={kp:p[1],ki:p[2],kd:p[3]};desenha();return}
    var b=e.target.closest('[data-do=porta]');
    if(b){porta=!porta;desenha()}
  });
  desenha();
};

W.ma420=function(el){
  var modo='ma',bar=5,corte=false;
  var X0=14,X1=326;
  el.innerHTML='<p class="ins">Um transmissor mede a <b>pressão de uma linha, de 0 a 10 bar</b>, e manda o valor ao CLP por um par de fios. Mexa na pressão e veja o sinal. Depois <b>corte o fio</b> e compare os dois padrões.</p>'+
    '<div class="tabs" role="tablist"><button class="tab" role="tab" data-m="ma" aria-selected="true">4 a 20 mA</button><button class="tab" role="tab" data-m="v" aria-selected="false">0 a 10 V</button></div>'+
    '<label class="fl">Pressão real: <b class="mpv"></b><input class="resz" type="range" min="0" max="10" step="0.1" value="5" aria-label="Pressão real em bar"></label>'+
    '<svg class="map" viewBox="0 0 340 64" role="img" aria-label="Escala do sinal elétrico e posição atual"></svg>'+
    '<div class="nfc mac"></div>'+
    '<button class="btn sm ghost ldbad" data-do="corte" aria-pressed="false">Cortar o fio</button>'+
    '<p class="wres mar" aria-live="polite"></p>'+
    '<p class="wnote">A corrente de 4 a 20 mA sofre menos com ruído elétrico e com fios longos, e por isso domina o campo. A tensão de 0 a 10 V é comum em distâncias curtas, como o comando de velocidade de inversores. Em muitos transmissores de 2 fios, o mesmo par leva a energia e o sinal. Alguns equipamentos tratam abaixo de 3,6 mA e acima de 21 mA como falha (recomendação NAMUR NE 43).</p>';
  var svg=el.querySelector('.map'),mac=el.querySelector('.mac'),mar=el.querySelector('.mar'),mpv=el.querySelector('.mpv'),
      sl=el.querySelector('input'),bc=el.querySelector('[data-do=corte]'),tabs=el.querySelectorAll('.tab');
  function desenha(){
    var ma=modo==='ma',max=ma?24:10,pct=bar/10,val=corte?0:(ma?4+16*pct:10*pct),
        falha=ma&&val<3.6;
    function X(a){return X0+a/max*(X1-X0)}
    var s='<rect class="mas" x="'+X0+'" y="24" width="'+(X1-X0)+'" height="14"/>';
    if(ma){
      s+='<rect class="maf" x="'+X0+'" y="24" width="'+(X(3.6)-X0)+'" height="14"/><rect class="maf" x="'+X(21)+'" y="24" width="'+(X1-X(21))+'" height="14"/>'+
         '<rect class="man" x="'+X(4)+'" y="24" width="'+(X(20)-X(4))+'" height="14"/>'+
         '<text class="mat" x="'+((X0+X(3.6))/2)+'" y="34" text-anchor="middle">falha</text><text class="mat" x="'+((X(21)+X1)/2)+'" y="34" text-anchor="middle">falha</text>';
      [0,4,12,20,24].forEach(function(a){s+='<line class="mak" x1="'+X(a)+'" y1="38" x2="'+X(a)+'" y2="43"/><text class="mat" x="'+X(a)+'" y="54" text-anchor="middle">'+a+(a===24?' mA':'')+'</text>'});
    }else{
      s+='<rect class="man" x="'+X0+'" y="24" width="'+(X1-X0)+'" height="14"/>';
      [0,5,10].forEach(function(a){s+='<line class="mak" x1="'+X(a)+'" y1="38" x2="'+X(a)+'" y2="43"/><text class="mat" x="'+X(a)+'" y="54" text-anchor="middle">'+a+(a===10?' V':'')+'</text>'});
    }
    var mx=X(val);
    s+='<path class="mam'+(falha?' bad':'')+'" d="M'+mx+' 22L'+(mx-6)+' 10H'+(mx+6)+'Z"/><line class="mam'+(falha?' bad':'')+'" x1="'+mx+'" y1="22" x2="'+mx+'" y2="40"/>';
    svg.innerHTML=s;
    var ent=corte?(ma?'FALHA':fnum(0,1)+' bar'):fnum(bar,1)+' bar';
    mac.innerHTML='<span>Sinal no fio</span><span>'+(corte?'fio cortado':(ma?'4 + 16 × '+fnum(pct*100,0)+' %':'10 × '+fnum(pct*100,0)+' %'))+'</span><b>'+fnum(val,2)+(ma?' mA':' V')+'</b>'+
      '<span class="nfs">Leitura no CLP</span><span class="nfs">'+(corte&&ma?'<span class="bd block">ALARME</span>':'')+'</span><b class="nfs'+(corte&&ma?' bad':'')+'">'+ent+'</b>';
    mpv.textContent=fnum(bar,1)+' bar';
    var t;
    if(corte){
      t=ma?'<b>0 mA: o CLP sabe que é falha.</b> Nenhuma pressão real gera menos de 4 mA, então um valor abaixo de uns 3,6 mA só pode ser fio rompido, transmissor sem energia ou entrada em curto. O programa pode acender um alarme em vez de achar que a pressão caiu a zero.'
        :'<b>0 V: o CLP lê 0,0 bar e acha que está tudo bem.</b> Com 0 a 10 V não dá para distinguir "pressão zero" de "fio rompido". Por isso, em campo, o 4 a 20 mA é o preferido.';
    }else if(bar===0){
      t=ma?'<b>Pressão zero e o sinal vale 4 mA, não 0.</b> Esse "zero vivo" é o truque: 4 mA diz que o transmissor está funcionando e mede zero.':'<b>0 V</b> significa pressão zero. Mas veja o que acontece se o fio for cortado.';
    }else if(bar===10){
      t='<b>Fundo de escala:</b> '+(ma?'20 mA':'10 V')+' correspondem a 10 bar. O CLP converte o valor elétrico de volta em bar com a mesma regra de três.';
    }else{
      t=ma?'<b>'+fnum(val,2)+' mA</b> correspondem a '+fnum(bar,1)+' bar. A faixa útil tem 16 mA (de 4 a 20), e a pressão é a posição dentro dela.':'<b>'+fnum(val,2)+' V</b> correspondem a '+fnum(bar,1)+' bar. Aqui a faixa vai de 0 a 10 V, em linha reta.';
    }
    mar.innerHTML=t;
    bc.setAttribute('aria-pressed',corte?'true':'false');
    bc.textContent=corte?'Religar o fio':'Cortar o fio';
    Array.prototype.forEach.call(tabs,function(b){b.setAttribute('aria-selected',b.dataset.m===modo?'true':'false')});
  }
  sl.addEventListener('input',function(){bar=+sl.value;desenha()});
  el.addEventListener('click',function(e){
    var b=e.target.closest('.tab');
    if(b){modo=b.dataset.m;desenha();return}
    if(e.target.closest('[data-do=corte]')){corte=!corte;desenha()}
  });
  desenha();
};
