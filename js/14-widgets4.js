/* ===== demos ao vivo (parte 4: segurança, senhas e 2FA) ===== */

function plural(n,um,varios){return n===1?um:varios}
function fmtBig(n){
  if(n<1e15)return Math.round(n).toLocaleString('pt-BR');
  var e=Math.floor(Math.log10(n)),m=n/Math.pow(10,e);
  return m.toLocaleString('pt-BR',{maximumFractionDigits:1})+' × 10<sup>'+e+'</sup>';
}
function fmtTempo(s){
  if(s<1)return 'menos de 1 segundo';
  var a=31557600,n;
  if(s<60){n=Math.round(s);return n+plural(n,' segundo',' segundos')}
  if(s<3600){n=Math.round(s/60);return n+plural(n,' minuto',' minutos')}
  if(s<86400){n=Math.round(s/3600);return n+plural(n,' hora',' horas')}
  if(s<a){n=Math.round(s/86400);return n+plural(n,' dia',' dias')}
  var y=s/a;
  if(y<1000){n=Math.round(y);return n.toLocaleString('pt-BR')+plural(n,' ano',' anos')}
  if(y<1e6)return Math.round(y/1000).toLocaleString('pt-BR')+' mil anos';
  if(y<1e9){n=Math.round(y/1e6);return n.toLocaleString('pt-BR')+plural(n,' milhão',' milhões')+' de anos'}
  if(y<1.38e10){n=Math.round(y/1e9);return n.toLocaleString('pt-BR')+plural(n,' bilhão',' bilhões')+' de anos'}
  return 'mais que a idade do universo (13,8 bilhões de anos)';
}

W.senha=function(el){
  var SETS=[['a-z','minúsculas',26],['A-Z','MAIÚSCULAS',26],['0-9','números',10],['!@#','símbolos',32]];
  var ATK=[['Site comum, chutando uma por uma',100,'100 por segundo, sem bloqueio de tentativas'],
    ['Vazamento + hash lento (bcrypt)',1e4,'10 mil por segundo'],
    ['Vazamento + hash rápido (MD5 sem sal)',1e11,'100 bilhões por segundo']];
  var EX=[
    ['123456','bad','Curta e só números, mas o problema é outro: está no topo de todas as listas de senhas vazadas. O atacante nem calcula, só consulta a lista. Cai na hora.'],
    ['Senha@2024','bad','Tem maiúscula, número e símbolo, então o cálculo ingênuo acha forte. Mas é palavra + símbolo + ano, um padrão que as ferramentas de ataque testam logo no começo.'],
    ['maria1990','bad','Nome + ano de nascimento. Dados assim se descobrem em redes sociais e entram nas listas de tentativas do atacante.'],
    ['Kx7#pQ2!vR9m','ok','12 caracteres sorteados entre 94 possíveis: cerca de 79 bits. Forte de verdade. Gerenciadores de senha criam assim.'],
    ['cavalo bateria grampo lua','ok','Quatro palavras sorteadas de uma lista de 7.776 (método Diceware): cerca de 52 bits. Forte e fácil de lembrar. O sorteio precisa ser de verdade, e não escolha sua.']];
  var on=[true,true,true,false],len=8,atk=2;
  el.innerHTML='<p class="ins">Imagine uma senha <b>sorteada ao acaso</b> com estes tipos de caractere:</p>'+
    '<div class="qchips h sps">'+SETS.map(function(s,i){return '<button data-i="'+i+'" aria-pressed="false">'+s[0]+' '+s[1]+'</button>'}).join('')+'</div>'+
    '<label class="fl">Tamanho: <b class="spl"></b><input class="resz" type="range" min="4" max="24" step="1" value="'+len+'"></label>'+
    '<p class="ins">Quem está tentando adivinhar:</p>'+
    '<div class="qchips spa">'+ATK.map(function(a,i){return '<button data-i="'+i+'" aria-pressed="false">'+a[0]+'<br><small>'+a[2]+'</small></button>'}).join('')+'</div>'+
    '<div class="kv2 spo"></div><p class="wres spv"></p>'+
    '<p class="ins" style="margin-top:16px">Só que essa conta vale para senha <b>sorteada</b>. Veja o que ela não enxerga:</p><div class="spx"></div>'+
    '<p class="wnote">Nunca digite a sua senha verdadeira em páginas de teste. Aqui só existem exemplos. Os números são ordens de grandeza para comparar: a velocidade real depende do equipamento do atacante e do algoritmo que o site usa para guardar a senha.</p>';
  var sets=el.querySelector('.sps'),rng=el.querySelector('input'),spl=el.querySelector('.spl'),spa=el.querySelector('.spa'),out=el.querySelector('.spo'),vd=el.querySelector('.spv');
  el.querySelector('.spx').innerHTML=EX.map(function(x){return '<div class="ex2 '+x[1]+'"><code>'+esc(x[0])+'</code><p>'+esc(x[2])+'</p></div>'}).join('');
  function run(){
    var pool=0;
    SETS.forEach(function(s,i){if(on[i])pool+=s[2]});
    sets.querySelectorAll('button').forEach(function(b,i){b.setAttribute('aria-pressed',on[i]?'true':'false')});
    spa.querySelectorAll('button').forEach(function(b,i){b.setAttribute('aria-pressed',i===atk?'true':'false')});
    spl.textContent=len+' caracteres';
    var comb=Math.pow(pool,len),bits=len*Math.log(pool)/Math.LN2,sec=comb/2/ATK[atk][1];
    out.innerHTML='<span>Combinações possíveis</span><b>'+fmtBig(comb)+'</b>'+
      '<span>Força</span><b>'+Math.round(bits)+' bits</b>'+
      '<span>Tempo médio para achar</span><b>'+fmtTempo(sec)+'</b>';
    var nivel=sec<3600?['Muito fraca','bad']:sec<31557600?['Fraca','bad']:sec<31557600*1000?['Boa','ok']:['Muito forte','ok'];
    vd.innerHTML='<b class="'+(nivel[1]==='bad'?'bad':'')+'">'+nivel[0]+'</b> contra esse atacante. Cada caractere a mais multiplica o trabalho dele por <b>'+pool+'</b>.';
  }
  sets.addEventListener('click',function(e){
    var b=e.target.closest('button');if(!b)return;
    var i=+b.dataset.i,n=on.filter(Boolean).length;
    if(on[i]&&n===1)return;
    on[i]=!on[i];run();
  });
  spa.addEventListener('click',function(e){var b=e.target.closest('button');if(b){atk=+b.dataset.i;run()}});
  rng.oninput=function(){len=+rng.value;run()};
  run();
};

W.totp=function(el){
  var SECRET='JBSWY3DPEHPK3PXP',skew=0,last={},cache={};
  var SK=[['Relógio certo',0],['Adiantado 20 s',20000],['Adiantado 3 min',180000]];
  if(!window.crypto||!crypto.subtle){el.textContent='Este navegador não oferece a função de criptografia usada nesta demonstração.';return}
  var KEY=(function(){
    var A='ABCDEFGHIJKLMNOPQRSTUVWXYZ234567',b='',o=[],i;
    for(i=0;i<SECRET.length;i++)b+=('00000'+A.indexOf(SECRET.charAt(i)).toString(2)).slice(-5);
    for(i=0;i+8<=b.length;i+=8)o.push(parseInt(b.substr(i,8),2));
    return new Uint8Array(o);
  })();
  function hex(h){return Array.prototype.map.call(h,function(x){return ('0'+x.toString(16)).slice(-2)}).join('')}
  function get(counter){
    if(!cache[counter]){
      var buf=new ArrayBuffer(8),dv=new DataView(buf);
      dv.setUint32(0,Math.floor(counter/4294967296));dv.setUint32(4,counter%4294967296);
      cache[counter]=crypto.subtle.importKey('raw',KEY,{name:'HMAC',hash:'SHA-1'},false,['sign']).then(function(k){return crypto.subtle.sign('HMAC',k,buf)}).then(function(s){
        var h=new Uint8Array(s),o=h[19]&15,n=((h[o]&127)<<24)|(h[o+1]<<16)|(h[o+2]<<8)|h[o+3];
        return {h:h,c:('000000'+(n%1000000)).slice(-6)};
      });
    }
    return cache[counter];
  }
  function fmt(c){return c.slice(0,3)+' '+c.slice(3)}
  el.innerHTML='<div class="two2"><div class="acc"><span class="lbl2">Seu app autenticador (celular)</span><b class="tpcode tpa">······</b></div>'+
    '<div class="acc"><span class="lbl2">Servidor do site (calcula sozinho)</span><b class="tpcode tps">······</b></div></div>'+
    '<div class="tpbar"><i></i></div><p class="ins tpt" style="margin:0"></p>'+
    '<p class="ins">Relógio do celular:</p><div class="qchips h tpk">'+SK.map(function(s,i){return '<button data-i="'+i+'" aria-pressed="false">'+s[0]+'</button>'}).join('')+'</div>'+
    '<p class="ins" style="margin-top:12px">Agora você é o usuário. Digite o código do app para o servidor conferir:</p>'+
    '<div class="kvrow"><input class="in mono" inputmode="numeric" maxlength="7" placeholder="000 000" aria-label="Código de 6 dígitos"><button class="btn sm go">Verificar</button><button class="btn sm ghost cp">Usar o do app</button></div>'+
    '<p class="wres tpr"></p><pre class="mini tpc"></pre>'+
    '<p class="wnote">O segredo desta demonstração é fictício. O verdadeiro é combinado uma única vez, quando você lê o QR code, e fica guardado só no app e no servidor. Nada viaja pela rede na hora de gerar o código: os dois lados usam a mesma conta, com o mesmo segredo e o mesmo relógio.</p>';
  var A=el.querySelector('.tpa'),S=el.querySelector('.tps'),bar=el.querySelector('.tpbar i'),tt=el.querySelector('.tpt'),inp=el.querySelector('input'),res=el.querySelector('.tpr'),calc=el.querySelector('.tpc'),ks=el.querySelector('.tpk');
  function tick(){
    var t=Date.now(),sc=Math.floor(t/30000),ac=Math.floor((t+SK[skew][1])/30000),rest=30000-(t%30000);
    bar.style.width=(rest/30000*100)+'%';
    tt.textContent='O código do servidor muda em '+Math.ceil(rest/1000)+' s';
    if(sc!==last.sc||ac!==last.ac||last.sk!==skew){
      last={sc:sc,ac:ac,sk:skew};
      Promise.all([get(ac),get(sc)]).then(function(r){
        A.textContent=fmt(r[0].c);S.textContent=fmt(r[1].c);
        calc.textContent='Contador do app:        '+ac.toLocaleString('pt-BR')+'  (hora ÷ 30 s)\n'+
          'Contador do servidor:   '+sc.toLocaleString('pt-BR')+(ac===sc?'  (igual)':'  (DIFERENTE: códigos diferentes)')+'\n'+
          'HMAC-SHA1 (app):        '+hex(r[0].h).slice(0,24)+'…\n'+
          'Código = 4 bytes do HMAC, resto da divisão por 1.000.000 = '+r[0].c;
      });
    }
  }
  function marks(){ks.querySelectorAll('button').forEach(function(b,i){b.setAttribute('aria-pressed',i===skew?'true':'false')})}
  ks.addEventListener('click',function(e){var b=e.target.closest('button');if(b){skew=+b.dataset.i;marks();last={};tick()}});
  el.querySelector('.cp').onclick=function(){if(A.textContent.indexOf('·')<0)inp.value=A.textContent};
  el.querySelector('.go').onclick=function(){
    var v=inp.value.replace(/\D/g,'');
    if(v.length!==6){res.textContent='Digite os 6 números do código.';return}
    var sc=Math.floor(Date.now()/30000);
    Promise.all([get(sc-1),get(sc),get(sc+1)]).then(function(r){
      var idx=-1;
      r.forEach(function(x,i){if(x.c===v)idx=i});
      if(idx<0)res.innerHTML='<b class="bad">Recusado.</b> O servidor calculou o código esperado para este momento (e para os 30 s antes e depois) e nenhum bate com o seu. Com o relógio do celular muito errado, é isso que acontece.';
      else res.innerHTML='<b>Aceito.</b> '+(idx===1?'É o código desta janela de 30 segundos.':'É de uma janela vizinha: o servidor tolera até 30 s de diferença entre os relógios.');
    });
  };
  var timer=setInterval(tick,250);
  CLEAN.push(function(){clearInterval(timer)});
  marks();tick();
};
