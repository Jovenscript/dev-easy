/* ===== demos ao vivo (parte 9: ladder com selo e temporizador) ===== */

W.ladder=function(el){
  var PT=3000,DT=50,MINP=140;            /* tempo do TON, varredura, toque mínimo (ms) */
  var pr={liga:false,desl:false},t0={liga:0,desl:0},tm={liga:null,desl:null};
  var term=false,selo=true;              /* térmico disparado? selo existe no programa? */
  var q0=false,q1=false,et=0,fl={a:false,b:false,j:false,d:false,t:false};
  var ant0=false,msg='',ultMsg=null,ultSig='',timer=null;
  el.innerHTML='<p class="ins">Um degrau clássico de partida de motor, como no painel de comando. <b>Segure LIGA e solte.</b> Depois aperte DESLIGA, dispare o térmico e tire o selo. O desenho acende por onde a corrente passa.</p>'+
    '<svg class="ldp" viewBox="0 0 340 206" role="img" aria-label="Diagrama ladder com LIGA, DESLIGA, térmico, selo, motor e um temporizador"></svg>'+
    '<p class="wres ldm" aria-live="polite"></p>'+
    '<div class="ldk2">'+
    '<button class="btn sm ldh" data-k="liga" aria-pressed="false">LIGA (segure)</button>'+
    '<button class="btn sm ghost ldh" data-k="desl" aria-pressed="false">DESLIGA (segure)</button>'+
    '<button class="btn sm ghost ldbad" data-do="term" aria-pressed="false">Disparar o térmico</button>'+
    '<button class="btn sm ghost ldamb" data-do="selo" aria-pressed="false">Remover o selo</button></div>'+
    '<div class="scrollx"><table class="tbl sm ldtb"><thead><tr><th>Endereço</th><th>O que é</th><th>Valor</th></tr></thead><tbody></tbody></table></div>'+
    '<p class="wnote">O contato Q0.0 em paralelo com o LIGA é o <b>selo</b>: ele lê a própria saída e mantém o degrau fechado. O TON é um temporizador com atraso para ligar: conta enquanto o motor está ligado e zera se ele parar antes de 3 s. Aqui o CLP varre 20 vezes por segundo. Atenção: em máquinas de verdade, o DESLIGA e o térmico costumam entrar no CLP como NF e virar contato NA no programa, para que um fio rompido pare a máquina. O desenho acima segue o esquema elétrico para ficar fácil de ler.</p>';
  var svg=el.querySelector('.ldp'),box=el.querySelector('.ldm'),tb=el.querySelector('tbody'),
      hb={liga:el.querySelector('[data-k=liga]'),desl:el.querySelector('[data-k=desl]')},
      bTerm=el.querySelector('[data-do=term]'),bSelo=el.querySelector('[data-do=selo]');
  function wire(x1,y1,x2,y2,on){return '<path class="ldw'+(on?' on':'')+'" d="M'+x1+' '+y1+'L'+x2+' '+y2+'"/>'}
  function ct(x,y,on,nf){
    return '<g class="ldc'+(on?' on':'')+'"><path d="M'+(x-7)+' '+(y-10)+'V'+(y+10)+'M'+(x+7)+' '+(y-10)+'V'+(y+10)+'"/>'+(nf?'<path d="M'+(x-5)+' '+(y+9)+'L'+(x+5)+' '+(y-9)+'"/>':'')+'</g>';
  }
  function bob(x,y,on){
    return '<g class="ldo'+(on?' on':'')+'"><circle cx="'+x+'" cy="'+y+'" r="10"/><path d="M'+(x-4)+' '+(y-12)+'C'+(x-14)+' '+(y-6)+' '+(x-14)+' '+(y+6)+' '+(x-4)+' '+(y+12)+'M'+(x+4)+' '+(y-12)+'C'+(x+14)+' '+(y-6)+' '+(x+14)+' '+(y+6)+' '+(x+4)+' '+(y+12)+'"/></g>';
  }
  function tx(x,y,t,c){return '<text class="ldt'+(c?' '+c:'')+'" x="'+x+'" y="'+y+'" text-anchor="middle">'+t+'</text>'}
  function desenha(){
    var s='',i0=pr.liga,i1=pr.desl,r2=q0,pct=Math.min(1,et/PT);
    var sig=[i0,i1,term,selo,q0,q1,fl.b,et].join();
    if(sig!==ultSig){
      ultSig=sig;
      s+='<path class="ldr" d="M12 12V196M328 12V196"/>';
      /* degrau 1 */
      s+=wire(12,46,55,46,true)+wire(69,46,92,46,fl.a)+wire(92,46,115,46,fl.j)+wire(129,46,152,46,fl.d)+wire(152,46,175,46,fl.d)+wire(189,46,252,46,fl.t)+wire(280,46,328,46,fl.t);
      s+=ct(62,46,i0,false)+ct(122,46,!i1,true)+ct(182,46,!term,true)+bob(266,46,q0);
      s+=tx(62,30,'LIGA')+tx(122,30,'DESLIGA')+tx(182,30,'TÉRMICO')+tx(266,30,'MOTOR','b')+tx(62,70,'I0.0','a')+tx(122,70,'I0.1','a')+tx(182,70,'I0.2','a')+tx(266,70,'Q0.0','a');
      /* selo */
      s+='<g class="'+(selo?'':'ldx')+'">'+wire(30,46,30,96,true)+wire(30,96,55,96,true)+wire(69,96,92,96,fl.b)+wire(92,96,92,46,fl.b)+ct(62,96,fl.b,false)+'</g>';
      s+=selo?tx(62,120,'Q0.0 selo','a'):tx(62,120,'sem selo','a');
      /* degrau 2 */
      s+=wire(12,164,55,164,true)+wire(69,164,108,164,r2)+wire(186,164,252,164,q1)+wire(280,164,328,164,q1);
      s+=ct(62,164,r2,false)+tx(62,148,'MOTOR')+tx(62,188,'Q0.0','a');
      s+='<rect class="ldn'+(r2?' on':'')+(q1?' dn':'')+'" x="108" y="142" width="78" height="44" rx="3"/>'+
         tx(147,154,'TON  T1','b')+'<rect class="ldbg" x="114" y="159" width="66" height="6"/><rect class="ldfg" x="114" y="159" width="'+(66*pct).toFixed(1)+'" height="6"/>'+tx(147,180,fnum(et/1000,1)+' / '+fnum(PT/1000,1)+' s');
      s+=bob(266,164,q1)+tx(266,148,'REGIME')+tx(266,188,'Q0.1','a');
      svg.innerHTML=s;
      var L=[['I0.0','LIGA (botão)',i0],['I0.1','DESLIGA (botão)',i1],['I0.2','TÉRMICO (disparou)',term],['Q0.0','MOTOR (contator)',q0],['Q0.1','REGIME (lâmpada)',q1]];
      tb.innerHTML=L.map(function(r){return '<tr'+(r[2]?' class="ldon"':'')+'><td>'+r[0]+'</td><td>'+r[1]+'</td><td><b>'+(r[2]?1:0)+'</b></td></tr>'}).join('');
    }
    if(msg!==ultMsg){ultMsg=msg;box.innerHTML=msg}
  }
  function varre(){
    var i0=pr.liga,i1=pr.desl,i2=term,qAnt=q0,q1Ant=q1;
    var a=i0,b=selo&&qAnt,j=a||b,d=j&&!i1,t=d&&!i2;
    fl={a:a,b:b,j:j,d:d,t:t};q0=t;
    if(q0)et=Math.min(PT,et+DT);else et=0;
    q1=q0&&et>=PT;
    if(!qAnt&&q0){
      msg='<b>LIGA apertado:</b> a entrada I0.0 foi a 1, o caminho de cima fechou e a bobina Q0.0 ligou o motor. '+(selo?'Quando a saída ligou, o contato Q0.0 (selo) fechou em paralelo.':'Sem selo no programa, ele só segue ligado enquanto você segura o botão.');
    }else if(qAnt&&!q0){
      if(i1)msg='<b>DESLIGA apertado:</b> o contato NF abriu e cortou o degrau. O motor parou e o selo se desfez junto. Soltar o botão não religa.';
      else if(i2)msg='<b>O térmico disparou:</b> o contato NF abriu, o degrau foi cortado e o motor parou. Mesmo rearmando o térmico, o motor só volta com um novo toque no LIGA.';
      else msg='<b>Sem selo, o motor só roda enquanto você segura o LIGA.</b> Soltou o botão, o caminho abriu e a bobina desligou.';
      if(q1Ant)msg+=' O temporizador T1 zerou e a lâmpada REGIME apagou.';
    }else if(qAnt&&q0&&ant0&&!i0&&selo){
      msg='<b>Soltou o LIGA e o motor continua ligado.</b> O contato Q0.0 (selo) mantém o caminho fechado: o circuito lembra que estava ligado. Aperte DESLIGA para parar.';
    }else if(!qAnt&&!q0&&i0&&!ant0&&i2){
      msg='<b>LIGA apertado, mas nada acontece:</b> o térmico está disparado e o contato I0.2 mantém o degrau aberto. Rearme o térmico primeiro.';
    }else if(!qAnt&&!q0&&i0&&!ant0&&i1){
      msg='<b>LIGA e DESLIGA apertados juntos:</b> o DESLIGA vence, porque o contato dele está em série e corta o degrau.';
    }
    if(!q1Ant&&q1)msg='<b>T1 contou 3,0 s:</b> a saída do temporizador ligou a lâmpada REGIME (Q0.1). Se o motor parar, T1 zera e a lâmpada apaga.';
    ant0=i0;
    desenha();
  }
  function para(){if(timer){clearInterval(timer);timer=null}clearTimeout(tm.liga);clearTimeout(tm.desl)}
  CLEAN.push(para);
  function press(k){clearTimeout(tm[k]);pr[k]=true;t0[k]=Date.now();hb[k].setAttribute('aria-pressed','true')}
  function solta(k){
    if(!pr[k])return;
    var resto=Math.max(0,MINP-(Date.now()-t0[k]));
    clearTimeout(tm[k]);
    tm[k]=setTimeout(function(){pr[k]=false;hb[k].setAttribute('aria-pressed','false')},resto);
  }
  Object.keys(hb).forEach(function(k){
    var b=hb[k];
    b.addEventListener('pointerdown',function(e){
      if(e.button>0)return;
      e.preventDefault();
      try{b.setPointerCapture(e.pointerId)}catch(x){}
      press(k);
    });
    ['pointerup','pointercancel','lostpointercapture'].forEach(function(ev){b.addEventListener(ev,function(){solta(k)})});
    b.addEventListener('keydown',function(e){if((e.key===' '||e.key==='Enter')&&!e.repeat){e.preventDefault();press(k)}});
    b.addEventListener('keyup',function(e){if(e.key===' '||e.key==='Enter'){e.preventDefault();solta(k)}});
    b.addEventListener('blur',function(){solta(k)});
    b.addEventListener('contextmenu',function(e){e.preventDefault()});
  });
  el.addEventListener('click',function(e){
    var b=e.target.closest('button[data-do]');
    if(!b)return;
    if(b.dataset.do==='term'){
      term=!term;
      bTerm.setAttribute('aria-pressed',term?'true':'false');
      bTerm.textContent=term?'Rearmar o térmico':'Disparar o térmico';
      if(term){if(!q0)msg='<b>Térmico disparado.</b> Enquanto estiver assim, o contato I0.2 deixa o degrau aberto e o motor não parte.'}
      else if(!q0)msg='<b>Térmico rearmado, mas o motor não ligou sozinho.</b> O selo já tinha se desfeito. É de propósito: depois de um defeito, a máquina só volta quando alguém aperta LIGA de novo.';
    }else if(b.dataset.do==='selo'){
      selo=!selo;
      bSelo.setAttribute('aria-pressed',selo?'false':'true');
      bSelo.textContent=selo?'Remover o selo':'Recolocar o selo';
      msg=selo?'<b>Selo de volta.</b> O contato Q0.0 em paralelo com o LIGA mantém o motor ligado depois que você solta o botão.':'<b>Selo removido do programa.</b> Agora o motor só funciona enquanto o LIGA estiver apertado.';
    }
    ultSig='';desenha();
  });
  msg='Tudo parado. Segure <b>LIGA</b> por um instante e solte: o motor continua ligado por causa do selo. Depois aperte <b>DESLIGA</b>.';
  desenha();
  timer=setInterval(varre,DT);
};
