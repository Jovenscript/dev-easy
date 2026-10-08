/* ===== demos ao vivo (parte 5: segurança, firewall e phishing) ===== */

W.firewall=function(el){
  /* endereços de documentação (RFC 5737) e rede privada: nada aqui é real */
  var PK=[
    ['Visitante abre o site (HTTPS)','192.0.2.44',443,true],
    ['Visitante abre o site (HTTP)','192.0.2.44',80,true],
    ['Técnico no escritório acessa por SSH','198.51.100.7',22,true],
    ['App interno consulta o banco (MySQL)','10.0.0.5',3306,true],
    ['Desconhecido tenta SSH','192.0.2.99',22,false],
    ['Desconhecido tenta o banco (MySQL)','192.0.2.99',3306,false],
    ['Desconhecido tenta Telnet','192.0.2.99',23,false],
    ['Desconhecido tenta área de trabalho remota','192.0.2.99',3389,false]];
  var BASE=[
    {a:'A',s:'qualquer',p:443,t:'Site (HTTPS)'},
    {a:'A',s:'qualquer',p:80,t:'Site (HTTP)'},
    {a:'A',s:'198.51.100.7',p:22,t:'SSH só do escritório'},
    {a:'A',s:'10.0.0.0/24',p:3306,t:'Banco só da rede interna'},
    {a:'N',s:'qualquer',p:0,t:'Negar todo o resto'}];
  var rules;
  function copia(l){return l.map(function(r){return {a:r.a,s:r.s,p:r.p,t:r.t,on:r.on!==false}})}
  var PRE={
    desafio:function(){var l=copia(BASE);l.unshift({a:'A',s:'qualquer',p:0,t:'Teste temporário (esquecida ali)',on:true});return l},
    certa:function(){return copia(BASE)},
    semfim:function(){var l=copia(BASE);l[4].on=false;return l}};
  function ip2n(ip){var p=ip.split('.');return (((+p[0])<<24)|((+p[1])<<16)|((+p[2])<<8)|(+p[3]))>>>0}
  function dentro(ip,r){
    if(r==='qualquer')return true;
    var a=r.split('/'),m=a.length>1?+a[1]:32,mask=m===0?0:((0xFFFFFFFF<<(32-m))>>>0);
    return ((ip2n(ip)&mask)>>>0)===((ip2n(a[0])&mask)>>>0);
  }
  function casa(r,pk){return r.on&&dentro(pk[1],r.s)&&(r.p===0||r.p===pk[2])}
  function desc(r){return (r.s==='qualquer'?'de qualquer origem':'de '+r.s)+' → '+(r.p===0?'qualquer porta':'porta '+r.p)+' · '+r.t}
  el.innerHTML='<p class="ins">Regras do firewall do servidor. O pacote é comparado de <b>cima para baixo</b> e vale a <b>primeira regra</b> que combina.</p>'+
    '<div class="fwl"></div>'+
    '<div class="acts2" style="margin:8px 0"><button class="btn sm ghost" data-pre="desafio">Desafio: tem um erro</button><button class="btn sm ghost" data-pre="certa">Configuração correta</button><button class="btn sm ghost" data-pre="semfim">Sem a regra final</button></div>'+
    '<p class="ins" style="margin-top:12px">Tráfego que chega ao servidor <code>203.0.113.10</code> e o que deveria acontecer com ele:</p>'+
    '<div class="fwk"></div><p class="wres fwv"></p>'+
    '<p class="wnote">Mexa nas regras: desligue, suba ou desça. A ideia central é <b>negar por padrão</b> e abrir só o necessário, só para quem precisa. Atenção: no mundo real, ordem errada ou uma regra &quot;temporária&quot; esquecida é como surgem muitos buracos.</p>';
  var lst=el.querySelector('.fwl'),pkt=el.querySelector('.fwk'),vd=el.querySelector('.fwv');
  function draw(){
    lst.innerHTML=rules.map(function(r,i){
      return '<div class="fwr'+(r.on?'':' off')+'"><span class="n">'+(i+1)+'</span><span class="bd '+(r.a==='A'?'pass':'block')+'">'+(r.a==='A'?'PERMITIR':'NEGAR')+'</span><span class="tx">'+esc(desc(r))+'</span>'+
        '<span class="ct"><button data-do="up" data-i="'+i+'" aria-label="Subir a regra '+(i+1)+'"'+(i===0?' disabled':'')+'>▲</button><button data-do="down" data-i="'+i+'" aria-label="Descer a regra '+(i+1)+'"'+(i===rules.length-1?' disabled':'')+'>▼</button><button data-do="tog" data-i="'+i+'" aria-pressed="'+(r.on?'true':'false')+'">'+(r.on?'ligada':'desligada')+'</button></span></div>';
    }).join('');
    var certos=0;
    pkt.innerHTML=PK.map(function(pk){
      var hit=-1;
      for(var i=0;i<rules.length;i++){if(casa(rules[i],pk)){hit=i;break}}
      var passa=hit<0?true:rules[hit].a==='A';
      var certo=passa===pk[3];
      if(certo)certos++;
      var quem=hit<0?'nenhuma regra combinou: passa por padrão':'regra '+(hit+1);
      return '<div class="fwp '+(certo?'right':'wrong')+'"><span><b>'+esc(pk[0])+'</b><small>'+pk[1]+' → porta '+pk[2]+'</small></span>'+
        '<span><span class="bd '+(passa?'pass':'block')+'">'+(passa?'PASSA':'BLOQUEADO')+'</span><small>'+quem+(certo?'':' · errado')+'</small></span></div>';
    }).join('');
    vd.innerHTML=certos===PK.length?'<b>Tudo certo.</b> Passa só o que precisa e o resto é negado.':'<b class="bad">'+certos+' de '+PK.length+' certos.</b> Veja os marcados como errado: ou passou o que não devia, ou foi barrado o que devia passar.';
  }
  el.addEventListener('click',function(e){
    var b=e.target.closest('button');if(!b)return;
    if(b.dataset.pre){rules=PRE[b.dataset.pre]();draw();return}
    var i=+b.dataset.i,d=b.dataset.do;
    if(d==='tog')rules[i].on=!rules[i].on;
    else if(d==='up'&&i>0){var t=rules[i-1];rules[i-1]=rules[i];rules[i]=t}
    else if(d==='down'&&i<rules.length-1){var u=rules[i+1];rules[i+1]=rules[i];rules[i]=u}
    draw();
  });
  rules=PRE.desafio();draw();
};

W.phishing=function(el){
  /* marca fictícia e domínios .example, que nunca existem de verdade */
  var SIG={
    remetente:['Remetente','O nome diz BancoExemplo, mas o endereço de verdade termina em bancoexemplo-seguranca.example, que não é o domínio oficial (bancoexemplo.example). Olhe sempre o endereço entre os sinais de menor e maior, e não só o nome.'],
    urgencia:['Urgência e ameaça','"Bloqueada em 24 horas" é o truque preferido: o medo faz você clicar sem pensar. Banco de verdade não avisa assim.'],
    anexo:['Anexo que você não pediu','Arquivo .zip inesperado pode esconder programa malicioso. Anexo que você não esperava não se abre, mesmo vindo de "conhecido".'],
    saudacao:['Saudação genérica','"Prezado cliente" mostra que a mensagem foi mandada em massa. Mas golpe direcionado pode usar o seu nome, então isso sozinho não decide.'],
    portugues:['Erro de português','Falta o acento em "Voce". Erros assim aparecem em golpes escritos às pressas. Cuidado: golpe bem feito não tem erro, então a ausência de erro não prova que é seguro.'],
    pedido:['Pedido de dados e senha','Banco não pede senha, token nem dados do cartão por e-mail, SMS ou link. Se pede, é golpe.'],
    link:['Link com destino diferente do texto','O texto mostra o site oficial, mas o destino de verdade é https://bancoexemplo-seguranca.example/entrar. Em computador, passe o mouse sobre o link; no celular, segure o dedo. Melhor: não clique, abra o app ou digite o endereço.']};
  var DEC={
    logo:'O logotipo não prova nada: qualquer um copia uma imagem em segundos. Não é sinal de golpe nem de e-mail verdadeiro.',
    assinatura:'Uma assinatura bonita também é fácil de copiar. Não ajuda a decidir nada.'};
  var ORD=['remetente','urgencia','anexo','saudacao','portugues','pedido','link'];
  var found={},decs={};
  function s(id,t){return '<button class="sg" data-s="'+id+'">'+t+'</button>'}
  function d(id,t){return '<button class="sg" data-d="'+id+'">'+t+'</button>'}
  el.innerHTML='<p class="ins">Um e-mail de uma marca <b>fictícia</b>. Toque em tudo que parecer <b>sinal de golpe</b>. Nem tudo que aparece é sinal.</p>'+
    '<div class="mail"><div class="mh">'+
      '<div><b>De:</b> '+s('remetente','BancoExemplo Suporte &lt;atendimento@bancoexemplo-seguranca.example&gt;')+'</div>'+
      '<div><b>Assunto:</b> '+s('urgencia','URGENTE!! Sua conta será bloqueada em 24 horas')+'</div>'+
      '<div><b>Anexo:</b> '+s('anexo','Comprovante_9921.zip')+'</div></div>'+
    '<div class="mb"><p>'+d('logo','[ BancoExemplo ]')+'</p>'+
      '<p>'+s('saudacao','Prezado cliente,')+'</p>'+
      '<p>Detectamos uma atividade suspeita na sua conta. '+s('portugues','Voce precisa')+' '+s('pedido','confirmar seus dados e senha')+' hoje, pelo link abaixo:</p>'+
      '<p>'+s('link','https://www.bancoexemplo.example/confirmar')+'</p>'+
      '<p>Atenciosamente,<br>'+d('assinatura','Equipe de Segurança')+'</p></div></div>'+
    '<p class="wres phc"></p><div class="pho"></div>'+
    '<div class="acts2" style="margin-top:10px"><button class="btn sm ghost sa">Mostrar todos os sinais</button><button class="btn sm ghost rs">Recomeçar</button></div>'+
    '<p class="wnote">Na dúvida, não clique em nada do e-mail. Abra o aplicativo oficial ou digite o endereço você mesmo. Se for sobre cartão ou conta, ligue para o número que está no verso do cartão.</p>';
  var cnt=el.querySelector('.phc'),out=el.querySelector('.pho');
  function draw(){
    el.querySelectorAll('[data-s]').forEach(function(b){b.classList.toggle('f',!!found[b.dataset.s])});
    el.querySelectorAll('[data-d]').forEach(function(b){b.classList.toggle('d',!!decs[b.dataset.d])});
    var n=Object.keys(found).length,m=Object.keys(decs).length;
    cnt.innerHTML='Sinais encontrados: <b>'+n+' de '+ORD.length+'</b>'+(m?' · toques que não eram sinal: <b>'+m+'</b>':'');
    var h='';
    ORD.forEach(function(k){if(found[k])h+='<div class="phx"><b>'+SIG[k][0]+'.</b> '+esc(SIG[k][1])+'</div>'});
    Object.keys(decs).forEach(function(k){h+='<div class="phx d"><b>Isto não é sinal.</b> '+esc(DEC[k])+'</div>'});
    if(n===ORD.length)h+='<div class="phx"><b>Achou todos.</b> Repare que nenhum sinal sozinho decide: o que pesa é o conjunto, principalmente urgência + pedido de dados + link estranho.</div>';
    out.innerHTML=h;
  }
  el.addEventListener('click',function(e){
    var b=e.target.closest('button');if(!b)return;
    if(b.dataset.s){found[b.dataset.s]=true;draw()}
    else if(b.dataset.d){decs[b.dataset.d]=true;draw()}
    else if(b.classList.contains('sa')){ORD.forEach(function(k){found[k]=true});draw()}
    else if(b.classList.contains('rs')){found={};decs={};draw()}
  });
  draw();
};
