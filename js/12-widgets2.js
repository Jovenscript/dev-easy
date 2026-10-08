/* ===== demos ao vivo (parte 2) ===== */

W.subnet=function(el){
  el.innerHTML='<div class="two"><label class="fl">Endereço IPv4<input class="in mono ip" value="192.168.0.10" inputmode="decimal" spellcheck="false" autocapitalize="off"></label>'+
    '<label class="fl">Prefixo (barra)<input class="in mono pf" type="number" min="8" max="30" value="24"></label></div><div class="sres"></div>'+
    '<p class="wnote">Troque o endereço e o prefixo. Os bits em destaque são a parte da <b>rede</b> (o bairro); os outros identificam o <b>aparelho</b> (a casa). Com /24 cabem 254 aparelhos; com /16, mais de 65 mil.</p>';
  var ip=el.querySelector('.ip'),pf=el.querySelector('.pf'),out=el.querySelector('.sres');
  function dot(n){return [n>>>24,(n>>>16)&255,(n>>>8)&255,n&255].join('.')}
  function bin(n){var s='';for(var i=31;i>=0;i--)s+=((n>>>i)&1);return s}
  function kind(a,b){
    if(a===10)return 'privado (uso interno)';
    if(a===172&&b>=16&&b<=31)return 'privado (uso interno)';
    if(a===192&&b===168)return 'privado (uso interno)';
    if(a===127)return 'loopback (a própria máquina)';
    if(a===169&&b===254)return 'link-local (sem DHCP)';
    if(a>=224&&a<=239)return 'multicast';
    return 'público (internet)';
  }
  function run(){
    var m=ip.value.trim().match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/),p=parseInt(pf.value,10);
    if(!m||m.slice(1).some(function(x){return +x>255})){out.innerHTML='<p class="bad">Endereço inválido. Use quatro números de 0 a 255, como 192.168.0.10.</p>';return}
    if(!(p>=8&&p<=30)){out.innerHTML='<p class="bad">Use um prefixo entre 8 e 30.</p>';return}
    var n=((+m[1]<<24)|(+m[2]<<16)|(+m[3]<<8)|+m[4])>>>0,mask=(0xFFFFFFFF<<(32-p))>>>0,net=(n&mask)>>>0,bc=(net|(~mask>>>0))>>>0,hosts=Math.pow(2,32-p)-2;
    var b=bin(n),bb=b.slice(0,p)+'|'+b.slice(p);
    var g=function(s){return s.replace(/(.{8})(?=.)/g,'$1 ')};
    var shown='<mark>'+g(b.slice(0,p)).replace(/ $/,'')+'</mark>';
    // monta com espaços entre octetos, destacando só os bits de rede
    var html='',pos=0;
    for(var i=0;i<4;i++){
      var oct=b.slice(i*8,i*8+8),net_bits=Math.max(0,Math.min(8,p-i*8));
      html+=(i?' ':'')+(net_bits?'<mark>'+oct.slice(0,net_bits)+'</mark>':'')+oct.slice(net_bits);
    }
    var rows=[['Máscara',dot(mask)+'  (/'+p+')'],['Rede',dot(net)],['Broadcast',dot(bc)],['Primeiro aparelho',dot(net+1)],['Último aparelho',dot(bc-1)],['Aparelhos possíveis',hosts.toLocaleString('pt-BR')],['Tipo',kind(+m[1],+m[2])]];
    out.innerHTML='<div class="rbox" style="margin-bottom:10px">'+html+'</div><div class="scrollx"><table class="tbl"><tbody>'+rows.map(function(r){return '<tr><th>'+r[0]+'</th><td>'+esc(r[1])+'</td></tr>'}).join('')+'</tbody></table></div>';
  }
  ip.oninput=pf.oninput=run;run();
};

W.utf8=function(el){
  el.innerHTML='<label class="fl">Digite um texto (até 24 símbolos)<input class="in" value="Parada ç 😀" spellcheck="false"></label><div class="ures"></div>'+
    '<p class="wnote">Cada símbolo tem um número no Unicode (o U+...). Para gravar em arquivo ou mandar pela rede, o UTF-8 transforma esse número em 1 a 4 bytes. Letras simples ocupam 1 byte; acentos, 2; emojis, 4.</p>';
  var i=el.querySelector('input'),o=el.querySelector('.ures');
  function run(){
    var chars=Array.from(i.value).slice(0,24),total=0;
    var rows=chars.map(function(c){
      var cp=c.codePointAt(0),by=Array.from(new TextEncoder().encode(c));total+=by.length;
      return '<tr><td>'+(cp<33?'(espaço)':esc(c))+'</td><td>U+'+cp.toString(16).toUpperCase().padStart(4,'0')+'</td><td>'+by.map(function(x){return x.toString(16).toUpperCase().padStart(2,'0')}).join(' ')+'</td><td>'+by.length+'</td></tr>';
    }).join('');
    o.innerHTML=chars.length?'<div class="scrollx"><table class="tbl"><thead><tr><th>Símbolo</th><th>Unicode</th><th>Bytes (hex)</th><th>Qtd</th></tr></thead><tbody>'+rows+'</tbody></table></div><p class="wres"><b>'+chars.length+'</b> símbolos, <b>'+total+'</b> bytes.</p>':'<p class="empty">Digite alguma coisa.</p>';
  }
  i.oninput=run;run();
};

W.jwt=function(el){
  var SECRET='segredo-do-servidor',enc=new TextEncoder(),tok='';
  el.innerHTML='<label class="fl">Token (pode editar)<textarea class="in mono tk" rows="5" spellcheck="false" autocapitalize="off"></textarea></label>'+
    '<div class="acts2"><button class="btn sm n">Gerar token de leitor</button><button class="btn sm ghost a">Trocar para admin (sem assinar)</button><button class="btn sm ghost s">Assinar de novo (só o servidor faz)</button></div>'+
    '<p class="wres st"></p><div class="hrow"><span class="hl">Cabeçalho (header)</span><code class="hv hh"></code></div><div class="hrow"><span class="hl">Conteúdo (payload)</span><code class="hv hp"></code></div>'+
    '<p class="wnote">O token tem 3 partes separadas por ponto. As duas primeiras são só Base64: qualquer um lê. A terceira é a <b>assinatura</b>, feita com um segredo que só o servidor conhece. Se mudar o conteúdo e não refizer a assinatura, o servidor percebe e recusa.</p>';
  var ta=el.querySelector('.tk'),st=el.querySelector('.st'),hh=el.querySelector('.hh'),hp=el.querySelector('.hp');
  function b64u(bytes){var s='';for(var k=0;k<bytes.length;k++)s+=String.fromCharCode(bytes[k]);return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
  function ub64(s){s=s.replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';var b=atob(s);return new TextDecoder().decode(Uint8Array.from(b,function(c){return c.charCodeAt(0)}))}
  function part(o){return b64u(enc.encode(JSON.stringify(o)))}
  function sign(data){return crypto.subtle.importKey('raw',enc.encode(SECRET),{name:'HMAC',hash:'SHA-256'},false,['sign']).then(function(k){return crypto.subtle.sign('HMAC',k,enc.encode(data))}).then(function(sig){return b64u(new Uint8Array(sig))})}
  var can=!!(window.crypto&&crypto.subtle);
  function pretty(s){try{return JSON.stringify(JSON.parse(ub64(s)),null,2)}catch(e){return '(não consegui ler esta parte)'}}
  function show(){
    var p=ta.value.trim().split('.');
    if(p.length!==3){st.innerHTML='<span class="bad">Token inválido: precisa de 3 partes separadas por ponto.</span>';hh.textContent='';hp.textContent='';return}
    hh.textContent=pretty(p[0]);hp.textContent=pretty(p[1]);
    if(!can){st.textContent='Este navegador não oferece a verificação de assinatura.';return}
    sign(p[0]+'.'+p[1]).then(function(sig){
      st.innerHTML=sig===p[2]?'<b style="color:var(--ok)">Assinatura confere.</b> O servidor aceita este token.':'<span class="bad"><b>Assinatura NÃO confere.</b> O servidor recusa: o conteúdo foi alterado, ou a assinatura é falsa.</span>';
    }).catch(function(){st.textContent='Não consegui verificar a assinatura.'});
  }
  function novo(){
    if(!can){return}
    var h=part({alg:'HS256',typ:'JWT'}),pl=part({sub:'1042',nome:'Técnico 01',papel:'leitor'});
    sign(h+'.'+pl).then(function(sig){ta.value=h+'.'+pl+'.'+sig;show()});
  }
  el.querySelector('.n').onclick=novo;
  el.querySelector('.a').onclick=function(){
    var p=ta.value.trim().split('.');if(p.length!==3)return;
    try{var o=JSON.parse(ub64(p[1]));o.papel='admin';ta.value=p[0]+'.'+part(o)+'.'+p[2];show()}catch(e){}
  };
  el.querySelector('.s').onclick=function(){
    var p=ta.value.trim().split('.');if(p.length!==3||!can)return;
    sign(p[0]+'.'+p[1]).then(function(sig){ta.value=p[0]+'.'+p[1]+'.'+sig;show()});
  };
  ta.oninput=show;
  if(can)novo();else{ta.value='Este navegador não oferece o recurso usado nesta demonstração.';st.textContent=''}
};

W.async=function(el){
  var T=[['Café',3],['Pão',2],['Ovos',2]],K=0.45,t0=0,timer=null,SEQ=7;
  function lane(id){return T.map(function(t,i){return '<div class="bo"><span>'+t[0]+'</span><div class="bar"><i class="'+id+i+'" style="width:0%"></i></div><span>'+t[1]+' s</span></div>'}).join('')}
  el.innerHTML='<p class="lbl2"><b>Um de cada vez</b> (síncrono): espera cada coisa terminar antes de começar a próxima</p>'+lane('s')+'<p class="wres sr"></p>'+
    '<p class="lbl2" style="margin-top:14px"><b>Tudo junto</b> (assíncrono): começa tudo e vai atendendo conforme fica pronto</p>'+lane('a')+'<p class="wres ar"></p>'+
    '<div class="acts2" style="margin-top:10px"><button class="btn sm go">Rodar a comparação</button></div>'+
    '<p class="wnote">É o café da manhã: ligar a cafeteira, esperar, só depois esquentar o pão, e só depois fritar o ovo (7 segundos), ou ligar os três e ir cuidando do que ficar pronto (3 segundos). O tempo é de mentirinha, acelerado para caber na tela.</p>';
  var sr=el.querySelector('.sr'),ar=el.querySelector('.ar');
  function stop(){if(timer){clearInterval(timer);timer=null}}
  CLEAN.push(stop);
  function bar(c,v){var b=el.querySelector('.'+c);if(b)b.style.width=Math.max(0,Math.min(1,v))*100+'%'}
  function reset(){T.forEach(function(t,i){bar('s'+i,0);bar('a'+i,0)});sr.textContent='';ar.textContent=''}
  function tick(){
    var f=(Date.now()-t0)/1000/K,start=0;
    T.forEach(function(t,i){bar('s'+i,(f-start)/t[1]);start+=t[1];bar('a'+i,f/t[1])});
    if(f>=3&&!ar.textContent)ar.innerHTML='Terminou em <b>3 s</b>.';
    if(f>=SEQ){sr.innerHTML='Terminou em <b>'+SEQ+' s</b>.';stop()}
  }
  el.querySelector('.go').onclick=function(){stop();reset();t0=Date.now();timer=setInterval(tick,50)};
  reset();
};

W.crud=function(el){
  var rows=[{id:1,nome:'Prensa 01',status:'rodando'},{id:2,nome:'Torno 02',status:'parada'},{id:3,nome:'Esteira A',status:'rodando'}],nid=4;
  el.innerHTML='<div class="acts2"><button class="btn sm c">Criar</button><button class="btn sm ghost r">Ler</button><button class="btn sm ghost u">Atualizar</button><button class="btn sm ghost d">Apagar</button></div>'+
    '<div class="cres" style="margin-top:10px"></div><pre class="mini cop"></pre>'+
    '<p class="wnote">As quatro operações básicas de qualquer sistema de cadastro (CRUD). Repare que cada uma tem um nome no HTTP e outro no SQL, mas é a mesma ideia.</p>';
  var res=el.querySelector('.cres'),op=el.querySelector('.cop');
  function draw(){res.innerHTML=rows.length?'<div class="scrollx"><table class="tbl"><thead><tr><th>id</th><th>nome</th><th>status</th></tr></thead><tbody>'+rows.map(function(r){return '<tr><td>'+r.id+'</td><td>'+esc(r.nome)+'</td><td>'+esc(r.status)+'</td></tr>'}).join('')+'</tbody></table></div>':'<p class="empty">Tabela vazia.</p>'}
  function say(a,b){op.textContent='HTTP:  '+a+'\nSQL:   '+b}
  el.querySelector('.c').onclick=function(){var r={id:nid++,nome:'Máquina '+(nid-1),status:'parada'};rows.push(r);draw();say('POST /maquinas   {"nome":"'+r.nome+'"}',"INSERT INTO maquinas (nome, status) VALUES ('"+r.nome+"', 'parada');")};
  el.querySelector('.r').onclick=function(){draw();say('GET /maquinas','SELECT * FROM maquinas;')};
  el.querySelector('.u').onclick=function(){if(!rows.length){say('(nada para atualizar)','');return}var r=rows[0];r.status=r.status==='rodando'?'parada':'rodando';draw();say('PUT /maquinas/'+r.id+'   {"status":"'+r.status+'"}',"UPDATE maquinas SET status = '"+r.status+"' WHERE id = "+r.id+';')};
  el.querySelector('.d').onclick=function(){if(!rows.length){say('(nada para apagar)','');return}var r=rows.pop();draw();say('DELETE /maquinas/'+r.id,'DELETE FROM maquinas WHERE id = '+r.id+';')};
  draw();say('(escolha uma operação)','');
};
