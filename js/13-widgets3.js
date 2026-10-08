/* ===== demos ao vivo (parte 3: dados e bancos) ===== */

W.joins=function(el){
  var M=[[1,'Prensa 01'],[2,'Torno CNC 02'],[3,'Esteira A'],[4,'Compressor 1'],[5,'Forno 03']];
  var O=[[101,1,'Trocar correia'],[102,1,'Lubrificar'],[103,3,'Trocar rolete'],[104,5,'Revisar queimador'],[105,null,'Pintar o pátio']];
  var K=[['inner','INNER JOIN','Só as linhas que têm par nas duas tabelas. A máquina sem ordem e a ordem sem máquina ficam de fora.'],
    ['left','LEFT JOIN','Todas as máquinas, que estão na tabela da esquerda. Onde não existe ordem, as colunas da ordem ficam NULL, ou seja, vazias.'],
    ['right','RIGHT JOIN','Todas as ordens, que estão na tabela da direita. A ordem 105 não tem máquina, então o nome da máquina fica NULL.'],
    ['full','FULL JOIN','Tudo dos dois lados. Quando falta o par, o lado que falta fica NULL.']];
  var cur='inner';
  function nome(id){for(var i=0;i<M.length;i++)if(M[i][0]===id)return M[i][1];return null}
  function temOrdem(id){return O.some(function(o){return o[1]===id})}
  function calc(k){
    var r=[];
    if(k==='inner'||k==='left'){
      M.forEach(function(m){
        var achou=false;
        O.forEach(function(o){if(o[1]===m[0]){r.push([m[1],o[0],o[2]]);achou=true}});
        if(!achou&&k==='left')r.push([m[1],null,null]);
      });
    }else{
      O.forEach(function(o){r.push([nome(o[1]),o[0],o[2]])});
      if(k==='full')M.forEach(function(m){if(!temOrdem(m[0]))r.push([m[1],null,null])});
    }
    return r;
  }
  function cell(v){return v===null?'<span class="nl">NULL</span>':esc(v)}
  function tb(cols,rows){return '<div class="scrollx"><table class="tbl sm"><thead><tr>'+cols.map(function(c){return '<th>'+c+'</th>'}).join('')+'</tr></thead><tbody>'+rows.map(function(r){return '<tr class="'+(r.some(function(v){return v===null})?'nul':'')+'">'+r.map(function(v){return '<td>'+cell(v)+'</td>'}).join('')+'</tr>'}).join('')+'</tbody></table></div>'}
  el.innerHTML='<div class="two2"><div><p class="lbl2">Tabela <b>maquinas</b></p>'+tb(['id','nome'],M)+'</div><div><p class="lbl2">Tabela <b>ordens</b></p>'+tb(['id','maquina_id','descricao'],O)+'</div></div>'+
    '<p class="lbl2" style="margin-top:14px">Escolha o tipo de JOIN:</p><div class="acts2 jk">'+K.map(function(k){return '<button class="btn sm ghost" data-k="'+k[0]+'" aria-pressed="false">'+k[1].split(' ')[0]+'</button>'}).join('')+'</div>'+
    '<pre class="mini jq"></pre><div class="jr"></div><p class="wres jn"></p><p class="wnote jx"></p>';
  var q=el.querySelector('.jq'),r=el.querySelector('.jr'),n=el.querySelector('.jn'),x=el.querySelector('.jx');
  function show(k){
    cur=k;
    el.querySelectorAll('.jk button').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.k===k?'true':'false')});
    var info=K.filter(function(z){return z[0]===k})[0],rows=calc(k);
    q.textContent='SELECT m.nome, o.id, o.descricao\nFROM maquinas AS m\n'+info[1]+' ordens AS o ON o.maquina_id = m.id;';
    r.innerHTML=tb(['nome','id','descricao'],rows);
    n.innerHTML='<b>'+rows.length+'</b> '+(rows.length===1?'linha':'linhas')+' no resultado';
    x.textContent=info[2]+' As linhas em amarelo são as que ficaram com NULL.';
  }
  el.querySelector('.jk').addEventListener('click',function(e){var b=e.target.closest('button');if(b)show(b.dataset.k)});
  show(cur);
};

W.indice=function(el){
  el.innerHTML='<label class="fl">Linhas na tabela: <b class="nv"></b><input class="resz" type="range" min="2" max="9" step="0.25" value="6"></label><div class="bor ix"></div><p class="wres ixt"></p>'+
    '<p class="wnote">Aproximação: considera que cada nível do índice aponta para cerca de 200 filhos, e que achar a linha custa mais uma leitura. As barras usam escala logarítmica para caber na tela. O tempo é só para dar escala: imagina que cada leitura levasse 1 microssegundo.</p>';
  var r=el.querySelector('input'),nv=el.querySelector('.nv'),o=el.querySelector('.ix'),t=el.querySelector('.ixt');
  function dur(us){
    if(us<1000)return Math.round(us)+' µs';
    if(us<1e6)return (us/1000).toLocaleString('pt-BR',{maximumFractionDigits:1})+' ms';
    var s=us/1e6;
    if(s<120)return s.toLocaleString('pt-BR',{maximumFractionDigits:1})+' s';
    if(s<7200)return Math.round(s/60)+' min';
    return (s/3600).toLocaleString('pt-BR',{maximumFractionDigits:1})+' h';
  }
  function run(){
    var n=Math.round(Math.pow(10,+r.value)),niv=Math.max(1,Math.ceil(Math.log(n)/Math.log(200))),com=niv+1,mx=Math.log10(1e9+1);
    nv.textContent=n.toLocaleString('pt-BR');
    function bar(l,v){return '<div class="bo"><span>'+l+'</span><div class="bar"><i style="width:'+Math.max(2,Math.log10(v+1)/mx*100)+'%"></i></div><span>'+v.toLocaleString('pt-BR')+'</span></div>'}
    o.innerHTML=bar('Sem índice',n)+bar('Com índice',com);
    t.innerHTML='Sem índice, no pior caso, o banco lê <b>'+n.toLocaleString('pt-BR')+'</b> linhas (cerca de '+dur(n)+'). Com índice, desce <b>'+niv+'</b> '+(niv===1?'nível':'níveis')+' e lê a linha: <b>'+com+'</b> leituras (cerca de '+dur(com)+').';
  }
  r.oninput=run;run();
};

W.transacao=function(el){
  var A=500,B=300,TOTAL=800;
  el.innerHTML='<div class="acts2"><button class="btn sm ghost tx" aria-pressed="false">Transação: desligada</button><button class="btn sm ghost fa" aria-pressed="false">Queda de energia: não</button></div>'+
    '<div class="two" style="margin:12px 0"><div class="acc"><span class="lbl2">Conta A</span><b class="va"></b></div><div class="acc"><span class="lbl2">Conta B</span><b class="vb"></b></div></div>'+
    '<div class="acts2"><button class="btn sm go">Transferir R$ 100 da A para a B</button><button class="btn sm ghost rs">Voltar ao início</button></div>'+
    '<pre class="mini lg"></pre><p class="wres tt"></p>'+
    '<p class="wnote">Experimente as quatro combinações. Sem transação e com queda de energia, o dinheiro saiu da conta A e nunca chegou na B: R$ 100 sumiram. Com transação, o banco percebe que faltou o COMMIT e desfaz o primeiro passo.</p>';
  var tx=el.querySelector('.tx'),fa=el.querySelector('.fa'),va=el.querySelector('.va'),vb=el.querySelector('.vb'),lg=el.querySelector('.lg'),tt=el.querySelector('.tt');
  function money(v){return 'R$ '+v.toLocaleString('pt-BR')}
  function tog(b,t){var v=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',v?'true':'false');b.textContent=t[v?1:0]}
  function on(b){return b.getAttribute('aria-pressed')==='true'}
  function draw(msg,cls){
    va.textContent=money(A);vb.textContent=money(B);
    var tot=A+B;
    tt.innerHTML=(msg?msg+' ':'')+'Total nas duas contas: <b class="'+(tot===TOTAL?'':'bad')+'">'+money(tot)+'</b>'+(tot===TOTAL?' (confere).':' (deveria ser '+money(TOTAL)+').');
  }
  tx.onclick=function(){tog(tx,['Transação: desligada','Transação: ligada'])};fa.onclick=function(){tog(fa,['Queda de energia: não','Queda de energia: sim'])};
  el.querySelector('.go').onclick=function(){
    if(A<100){lg.textContent='Saldo insuficiente na conta A. Toque em “Voltar ao início”.';return}
    var L=[],t=on(tx),f=on(fa);
    if(t)L.push('BEGIN;');
    L.push('UPDATE contas SET saldo = saldo - 100 WHERE id = A;   -- tira da A');
    if(f){
      L.push('');L.push('*** QUEDA DE ENERGIA ***');L.push('');
      if(t){L.push('-- O banco volta, vê que não houve COMMIT e desfaz tudo.');L.push('ROLLBACK;   -- automático');draw('Nada mudou: a transação foi desfeita.')}
      else{A-=100;L.push('-- O primeiro UPDATE já tinha sido confirmado sozinho.');L.push('-- O segundo nunca rodou.');draw('A conta A perdeu R$ 100 e a B não recebeu nada.')}
    }else{
      A-=100;B+=100;
      L.push('UPDATE contas SET saldo = saldo + 100 WHERE id = B;   -- põe na B');
      if(t)L.push('COMMIT;');
      draw('Deu certo.');
    }
    lg.textContent=L.join('\n');
  };
  el.querySelector('.rs').onclick=function(){A=500;B=300;lg.textContent='';draw('')};
  draw('');
};

W.kv=function(el){
  var store={},timer=null;
  var EX=['SET maquina:7:status parada','GET maquina:7:status','INCR visitas','SET sessao:abc ativo EX 20','TTL sessao:abc','EXPIRE visitas 30','DEL maquina:7:status','KEYS *'];
  el.innerHTML='<p class="lbl2">Toque num exemplo ou digite o seu comando:</p><div class="qchips h">'+EX.map(function(c,i){return '<button data-i="'+i+'">'+esc(c)+'</button>'}).join('')+'</div>'+
    '<div class="kvrow"><input class="in mono kvi" placeholder="Ex.: SET nome Prensa" autocapitalize="off" autocomplete="off" autocorrect="off" spellcheck="false"><button class="btn sm kvg">Enviar</button></div>'+
    '<pre class="mini kvo">Comandos: SET, GET, DEL, EXISTS, INCR, DECR, EXPIRE, TTL, KEYS, FLUSHALL</pre>'+
    '<p class="lbl2" style="margin-top:12px">Na memória agora</p><div class="kvm"></div>'+
    '<p class="wnote">Isto é uma versão simplificada do Redis, rodando só no seu navegador, sem servidor. Os comandos e as respostas são os do redis-cli de verdade. Grave uma chave com tempo de expiração e espere: ela some sozinha.</p>';
  var inp=el.querySelector('.kvi'),out=el.querySelector('.kvo'),mem=el.querySelector('.kvm'),lines=[];
  function tok(s){var r=[],m,re=/"([^"]*)"|(\S+)/g;while((m=re.exec(s)))r.push(m[1]!==undefined?m[1]:m[2]);return r}
  function live(){var n=Date.now();Object.keys(store).forEach(function(k){if(store[k].exp&&store[k].exp<=n)delete store[k]})}
  function ttl(k){return store[k].exp?Math.max(0,Math.ceil((store[k].exp-Date.now())/1000)):-1}
  function exec(line){
    live();
    var a=tok(line),c=a[0].toUpperCase(),k=a[1],i,n;
    var need={SET:3,GET:2,EXISTS:2,DEL:2,INCR:2,DECR:2,EXPIRE:3,TTL:2,KEYS:2};
    if(need[c]&&a.length<need[c])return '(error) ERR wrong number of arguments for \''+c.toLowerCase()+'\' command';
    switch(c){
      case 'SET':{
        var o={v:a[2],exp:0};
        for(i=3;i<a.length;i++){if(a[i].toUpperCase()==='EX'&&/^\d+$/.test(a[i+1]||'')&&+a[i+1]>0){o.exp=Date.now()+(+a[i+1])*1000;i++}else return '(error) ERR syntax error'}
        store[k]=o;return 'OK';
      }
      case 'GET':return store[k]?'"'+store[k].v+'"':'(nil)';
      case 'EXISTS':n=0;for(i=1;i<a.length;i++)if(store[a[i]])n++;return '(integer) '+n;
      case 'DEL':n=0;for(i=1;i<a.length;i++)if(store[a[i]]){delete store[a[i]];n++}return '(integer) '+n;
      case 'INCR':case 'DECR':{
        var cur=store[k]?store[k].v:'0';
        if(!/^-?\d+$/.test(cur))return '(error) ERR value is not an integer or out of range';
        var nv=(+cur)+(c==='INCR'?1:-1);
        if(store[k])store[k].v=String(nv);else store[k]={v:String(nv),exp:0};
        return '(integer) '+nv;
      }
      case 'EXPIRE':
        if(!/^\d+$/.test(a[2]))return '(error) ERR value is not an integer or out of range';
        if(!store[k])return '(integer) 0';
        store[k].exp=Date.now()+(+a[2])*1000;return '(integer) 1';
      case 'TTL':return store[k]?'(integer) '+ttl(k):'(integer) -2';
      case 'KEYS':{
        var re=new RegExp('^'+k.replace(/[.+^${}()|[\]\\]/g,'\\$&').replace(/\*/g,'.*').replace(/\?/g,'.')+'$');
        var ks=Object.keys(store).filter(function(x){return re.test(x)});
        return ks.length?ks.map(function(x,j){return (j+1)+') "'+x+'"'}).join('\n'):'(empty array)';
      }
      case 'FLUSHALL':store={};return 'OK';
      default:return '(error) ERR unknown command \''+a[0]+'\'';
    }
  }
  function paint(){
    live();
    var ks=Object.keys(store);
    mem.innerHTML=ks.length?'<div class="scrollx"><table class="tbl sm"><thead><tr><th>chave</th><th>valor</th><th>expira em</th></tr></thead><tbody>'+ks.map(function(k){var t=ttl(k);return '<tr><td>'+esc(k)+'</td><td>'+esc(store[k].v)+'</td><td>'+(t<0?'nunca':t+' s')+'</td></tr>'}).join('')+'</tbody></table></div>':'<p class="empty" style="padding:6px 0">Memória vazia.</p>';
  }
  function send(line){
    line=line.trim();if(!line)return;
    lines.push('> '+line);lines.push(exec(line));
    if(lines.length>24)lines=lines.slice(-24);
    out.textContent=lines.join('\n');out.scrollTop=out.scrollHeight;paint();
  }
  el.addEventListener('click',function(e){
    var b=e.target.closest('.qchips button');if(b){send(EX[+b.dataset.i]);return}
    if(e.target.closest('.kvg')){send(inp.value);inp.value=''}
  });
  inp.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();send(inp.value);inp.value=''}});
  timer=setInterval(paint,1000);
  CLEAN.push(function(){clearInterval(timer)});
  paint();
};
