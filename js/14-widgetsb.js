/* ===== demos ao vivo (parte 11: Modbus RTU e filtros de tópico MQTT) ===== */

W.modbus=function(el){
  /* o escravo 1 é um inversor inventado, com 5 registradores */
  var REG=[
    {n:'Frequência de saída',v:600,w:false,f:function(x){return fnum(x/10,1)+' Hz'}},
    {n:'Corrente do motor',v:124,w:false,f:function(x){return fnum(x/10,1)+' A'}},
    {n:'Temperatura do dissipador',v:45,w:false,f:function(x){return x+' °C'}},
    {n:'Estado (0 parado, 1 rodando, 2 falha)',v:1,w:false,f:function(x){return ['parado','rodando','em falha'][x]||('código '+x)}},
    {n:'Referência de velocidade',v:1750,w:true,f:function(x){return x+' rpm'}}];
  var PRE=[['Ler 2 registradores',{a:1,f:3,r:0,q:2}],['Gravar velocidade',{a:1,f:6,r:4,q:1200}],['Ler fora do mapa',{a:1,f:3,r:3,q:4}],['Escravo errado',{a:7,f:3,r:0,q:2}],['Gravar só-leitura',{a:1,f:6,r:0,q:100}],['Função inexistente',{a:1,f:5,r:0,q:0}]];
  var S={a:1,f:3,r:0,q:2},res=null;
  el.innerHTML='<p class="ins">Você é o <b>mestre</b> (um CLP ou supervisório) falando com um inversor de exemplo, o <b>escravo 1</b>. Monte a pergunta (escravo de 1 a 247), veja os bytes que viajam no cabo RS-485 e envie.</p>'+
    '<div class="qchips h mbp">'+PRE.map(function(p,i){return '<button data-p="'+i+'">'+p[0]+'</button>'}).join('')+'</div>'+
    '<div class="mbi">'+
    '<label class="fl mbfn">Função<select class="in" data-k="f"><option value="3">03: ler registradores</option><option value="6">06: escrever 1 registrador</option><option value="5">05: escrever 1 bobina</option></select></label>'+
    '<label class="fl">Escravo<input class="in mono" data-k="a" type="number" inputmode="numeric" min="1" max="247" value="1"></label>'+
    '<label class="fl">Endereço<input class="in mono" data-k="r" type="number" inputmode="numeric" min="0" max="65535" value="0"></label>'+
    '<label class="fl mbq"><span class="mbl">Quantidade</span><input class="in mono" data-k="q" type="number" inputmode="numeric" min="0" max="65535" value="2"></label></div>'+
    '<p class="lbl3">Pergunta do mestre, em hexadecimal</p><div class="mbf mbr"></div>'+
    '<button class="btn sm mbs">Enviar pergunta</button>'+
    '<p class="lbl3" style="margin-top:12px">Resposta do escravo</p><div class="mbf mba"></div>'+
    '<p class="wres mbm" aria-live="polite"></p>'+
    '<details class="llx"><summary>Mapa de registradores do inversor de exemplo</summary><div class="scrollx"><table class="tbl sm"><thead><tr><th>End.</th><th>O que é</th><th>Valor</th><th>Grava</th></tr></thead><tbody class="mbt"></tbody></table></div></details>'+
    '<p class="wnote">Mude qualquer número da pergunta e o CRC muda: ele é calculado sobre todos os bytes anteriores, e o receptor confere. Se não bater, a mensagem é descartada. O mapa de registradores é inventado: no equipamento real, o manual do fabricante diz o que é cada endereço, e muitos usam escalas como décimos de hertz.</p>';
  var qr=el.querySelector('.mbr'),qa=el.querySelector('.mba'),qm=el.querySelector('.mbm'),tb=el.querySelector('.mbt'),
      inA=el.querySelector('[data-k=a]'),inF=el.querySelector('[data-k=f]'),inR=el.querySelector('[data-k=r]'),inQ=el.querySelector('[data-k=q]'),
      lblQ=el.querySelector('.mbl'),chips=el.querySelectorAll('.mbp button');
  function crc(b){var c=0xFFFF,i,j;for(i=0;i<b.length;i++){c^=b[i];for(j=0;j<8;j++)c=(c&1)?((c>>1)^0xA001):(c>>1)}return [c&255,c>>8]}
  function hx(n){return (n<16?'0':'')+n.toString(16).toUpperCase()}
  function hx4(n){return hx(n>>8)+hx(n&255)}
  function grp(label,b,cls){return '<span class="mbg'+(cls?' '+cls:'')+'"><span class="mbb">'+b.map(hx).join(' ')+'</span><small>'+label+'</small></span>'}
  function exc(f,c,x){return {t:'exc',b:[1,f|0x80,c],f:f,c:c,x:x}}
  function pergunta(){
    var a=S.a,f=S.f,r=S.r,q=f===5?0xFF00:S.q;
    return [a,f,r>>8,r&255,q>>8,q&255];
  }
  function responde(){
    var f=S.f,r=S.r,q=S.q,b,i,v;
    if(S.a!==1)return {t:'none'};
    if(f===3){
      if(q<1||q>125)return exc(3,3);
      if(r+q>REG.length)return exc(3,2);
      b=[1,3,q*2];
      for(i=0;i<q;i++){v=REG[r+i].v;b.push(v>>8,v&255)}
      return {t:'ok',b:b};
    }
    if(f===6){
      if(r>=REG.length)return exc(6,2);
      if(!REG[r].w)return exc(6,2,'ro');
      if(q>3600)return exc(6,3);
      REG[r].v=q;
      return {t:'ok',b:[1,6,r>>8,r&255,q>>8,q&255]};
    }
    return exc(f,1);
  }
  function explica(){
    var o=res,s,i,f=S.f;
    if(!o)return 'Monte a pergunta e toque em <b>Enviar</b>. As receitas de cima fazem isso por você.';
    if(o.t==='none')return '<b>Silêncio.</b> Nenhum escravo com endereço '+S.a+' respondeu. O mestre espera um tempo e desiste (timeout). No campo, isso é endereço errado, cabo solto, velocidade ou paridade diferentes, ou equipamento desligado.';
    if(o.t==='exc'){
      var mot={1:'01 significa que o equipamento não tem essa função.',2:'02 significa endereço de dado inválido'+(o.x==='ro'?': neste inversor de exemplo, esse registrador é só de leitura.':'.'),3:f===6?'03 significa valor inválido: a referência de velocidade vai de 0 a 3600 rpm.':'03 significa quantidade inválida: o pedido aceita de 1 a 125 registradores.'}[o.c];
      return '<b>Resposta de erro.</b> A função volta com o bit mais alto ligado ('+hx(o.f)+' vira '+hx(o.f|0x80)+'), e o byte seguinte diz o motivo. '+mot;
    }
    if(f===6)return '<b>Escrita aceita.</b> O inversor devolve a própria pergunta como confirmação, e a referência de velocidade agora vale <b>'+S.q+' rpm</b>. Leia o registrador 4 para conferir.';
    s='<b>O escravo respondeu</b> com '+(S.q*2)+' bytes de dados. Para saber o que eles significam, só com o manual:';
    for(i=0;i<S.q;i++)s+='<span class="mbd">Reg. '+(S.r+i)+' · '+REG[S.r+i].n+': '+hx4(REG[S.r+i].v)+' = '+REG[S.r+i].v+' → '+REG[S.r+i].f(REG[S.r+i].v)+'</span>';
    return s;
  }
  function desenha(skip){
    var p=pergunta(),c=crc(p),f=S.f,o=res,h='';
    qr.innerHTML=grp('escravo',[p[0]],'c1')+grp('função',[p[1]],'c2')+grp(f===5?'bobina':'endereço',[p[2],p[3]],'c3')+grp(f===3?'quantidade':(f===6?'valor':'ligar'),[p[4],p[5]],'c3')+grp('CRC',c,'c4');
    if(!o)h='<span class="mbz">(ainda sem resposta)</span>';
    else if(o.t==='none')h='<span class="mbz">(silêncio: ninguém respondeu)</span>';
    else{
      var cr=crc(o.b);
      if(o.t==='exc')h=grp('escravo',[o.b[0]],'c1')+grp('função com erro',[o.b[1]],'c2 bad')+grp('motivo',[o.b[2]],'bad')+grp('CRC',cr,'c4');
      else if(f===3){
        h=grp('escravo',[o.b[0]],'c1')+grp('função',[o.b[1]],'c2')+grp('bytes',[o.b[2]],'c3');
        for(var i=0;i<S.q;i++)h+=grp('reg. '+(S.r+i),[o.b[3+2*i],o.b[4+2*i]],'c5');
        h+=grp('CRC',cr,'c4');
      }else h=grp('escravo',[o.b[0]],'c1')+grp('função',[o.b[1]],'c2')+grp('endereço',[o.b[2],o.b[3]],'c3')+grp('valor',[o.b[4],o.b[5]],'c3')+grp('CRC',cr,'c4');
    }
    qa.innerHTML=h;
    qm.innerHTML=explica();
    tb.innerHTML=REG.map(function(g,i){return '<tr><td>'+i+'</td><td>'+g.n+'</td><td>'+g.v+'</td><td>'+(g.w?'sim':'não')+'</td></tr>'}).join('');
    lblQ.textContent=f===3?'Quantidade':(f===6?'Valor (rpm)':'Valor fixo');
    inQ.disabled=f===5;
    if(skip!=='a')inA.value=S.a;
    inF.value=f;
    if(skip!=='r')inR.value=S.r;
    if(skip!=='q')inQ.value=S.q;
    Array.prototype.forEach.call(chips,function(b){b.setAttribute('aria-pressed','false')});
  }
  function num(x,lo,hi,d){var n=parseInt(x,10);if(isNaN(n))n=d;return Math.max(lo,Math.min(hi,n))}
  el.addEventListener('input',function(e){
    var k=e.target.dataset&&e.target.dataset.k;if(!k)return;
    if(k==='a')S.a=num(e.target.value,1,247,1);
    else if(k==='f'){S.f=+e.target.value;if(S.f===6){S.r=4;S.q=1200}else if(S.f===3){S.r=0;S.q=2}}
    else if(k==='r')S.r=num(e.target.value,0,65535,0);
    else S.q=num(e.target.value,0,65535,0);
    res=null;
    desenha(k);   /* o campo que está sendo digitado não é reescrito, senão o cursor pula */
  });
  el.addEventListener('click',function(e){
    var c=e.target.closest('.mbp button');
    if(c){S=JSON.parse(JSON.stringify(PRE[+c.dataset.p][1]));res=responde();desenha();c.setAttribute('aria-pressed','true');return}
    if(e.target.closest('.mbs')){res=responde();desenha()}
  });
  desenha();
};

W.mqtt=function(el){
  var MSG=[
    ['fabrica/linha1/prensa02/temperatura','72.5'],
    ['fabrica/linha1/prensa02/vibracao','3.1'],
    ['fabrica/linha1/esteira01/temperatura','41.0'],
    ['fabrica/linha1/esteira01/alarme','sobrecarga'],
    ['fabrica/linha2/prensa05/temperatura','68.2'],
    ['fabrica/linha2/prensa05/alarme','temperatura alta'],
    ['fabrica/predio/energia/kw','410'],
    ['oficina/compressor/pressao','7.1']];
  var PRE=['fabrica/linha1/prensa02/temperatura','fabrica/linha1/+/temperatura','fabrica/+/+/temperatura','fabrica/linha1/#','fabrica/+/+/alarme','#'];
  el.innerHTML='<p class="ins">Oito mensagens chegam ao <b>broker</b>, cada uma num tópico. Escreva um <b>filtro de assinatura</b>, ou toque numa receita, e veja quais delas chegam até você.</p>'+
    '<div class="qchips h mqp">'+PRE.map(function(p,i){return '<button data-p="'+i+'">'+p+'</button>'}).join('')+'</div>'+
    '<label class="fl">Seu filtro de assinatura<input class="in mono mqf" type="text" value="fabrica/linha1/+/temperatura" autocapitalize="off" autocomplete="off" autocorrect="off" spellcheck="false" aria-label="Filtro de assinatura MQTT"></label>'+
    '<div class="mqn"></div>'+
    '<p class="wres mqm" aria-live="polite"></p>'+
    '<div class="mql"></div>'+
    '<p class="wnote">As regras: os níveis são separados por barra. O <b>+</b> casa com exatamente um nível, qualquer que seja o nome. O <b>#</b> casa com todos os níveis daquele ponto em diante, inclusive o nível anterior (<b>a/#</b> pega também <b>a</b>), e só pode ficar no fim do filtro. Maiúsculas e minúsculas fazem diferença. Os nomes desta demonstração são inventados.</p>';
  var inp=el.querySelector('.mqf'),nv=el.querySelector('.mqn'),mm=el.querySelector('.mqm'),ls=el.querySelector('.mql'),chips=el.querySelectorAll('.mqp button');
  function invalido(f){
    if(!f)return 'O filtro está vazio.';
    var p=f.split('/'),i;
    for(i=0;i<p.length;i++){
      if(p[i].indexOf('#')>=0){if(p[i]!=='#')return 'O # precisa ficar sozinho no seu nível.';if(i!==p.length-1)return 'O # só pode aparecer no último nível do filtro.'}
      if(p[i].indexOf('+')>=0&&p[i]!=='+')return 'O + precisa ficar sozinho no seu nível.';
    }
    return '';
  }
  function casa(f,t){
    var a=f.split('/'),b=t.split('/'),i;
    for(i=0;i<a.length;i++){
      if(a[i]==='#')return true;
      if(i>=b.length)return false;
      if(a[i]!=='+'&&a[i]!==b[i])return false;
    }
    return a.length===b.length;
  }
  function desenha(){
    var f=inp.value.trim(),erro=invalido(f),n=0,i;
    nv.innerHTML=f?f.split('/').map(function(p){return '<span class="mqc'+(p==='+'||p==='#'?' w':'')+'">'+esc(p||'(vazio)')+'</span>'}).join('<span class="mqs">/</span>'):'';
    ls.innerHTML=MSG.map(function(m){
      var ok=!erro&&casa(f,m[0]);if(ok)n++;
      return '<div class="mqr'+(ok?' ok':'')+'"><span class="mqt">'+esc(m[0])+'<small>mensagem: '+esc(m[1])+'</small></span><span class="bd '+(ok?'pass':'')+'">'+(ok?'RECEBE':'não')+'</span></div>';
    }).join('');
    if(erro)mm.innerHTML='<b>Filtro inválido.</b> '+erro;
    else{
      var dica=f.indexOf('#')>=0?'O # vale para todos os níveis a partir dali.':(f.indexOf('+')>=0?'O + vale para exatamente um nível.':'Sem curingas, só casa o tópico exato.');
      mm.innerHTML='<b>'+n+' de '+MSG.length+' mensagens</b> chegam a este filtro. '+dica+(n===0?' Confira os nomes: o MQTT diferencia maiúsculas de minúsculas.':'');
    }
    Array.prototype.forEach.call(chips,function(b){b.setAttribute('aria-pressed',PRE[+b.dataset.p]===f?'true':'false')});
  }
  inp.addEventListener('input',desenha);
  el.addEventListener('click',function(e){
    var c=e.target.closest('.mqp button');
    if(c){inp.value=PRE[+c.dataset.p];desenha()}
  });
  desenha();
};
