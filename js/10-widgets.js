/* ===== demos ao vivo ===== */
const W={},CLEAN=[];
function cleanup(){while(CLEAN.length){try{CLEAN.pop()()}catch(e){}}}
const esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
const rich=function(s){return esc(s).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/`([^`]+)`/g,'<code>$1</code>')};

W.binary=function(el){
  var bits=[0,1,0,0,0,0,0,1];
  function draw(){
    var n=bits.reduce(function(a,b){return a*2+b},0);
    el.innerHTML='<div class="bits">'+bits.map(function(b,i){return '<button class="bit'+(b?' on':'')+'" data-i="'+i+'" aria-pressed="'+(b?'true':'false')+'">'+b+'</button>'}).join('')+'</div>'+
      '<p class="wres">Valor: <b>'+n+'</b> &nbsp;|&nbsp; Letra (tabela ASCII): <b>'+(n>=33&&n<127?esc(String.fromCharCode(n)):(n===32?'(espaço)':'(não imprimível)'))+'</b></p>'+
      '<p class="wnote">Toque nos bits. Da esquerda para a direita eles valem 128, 64, 32, 16, 8, 4, 2 e 1. Ligado soma, desligado não soma. O padrão que aparece ao abrir é o 65, que é a letra A.</p>';
  }
  el.addEventListener('click',function(e){var b=e.target.closest('.bit');if(!b)return;bits[+b.dataset.i]^=1;draw()});
  draw();
};

W.regex=function(el){
  el.innerHTML='<label class="fl">Padrão (regex)<input class="in mono" value="\\d{2}/\\d{2}/\\d{4}" spellcheck="false" autocapitalize="off"></label>'+
    '<label class="fl">Texto para testar<textarea class="in" rows="3" spellcheck="false">Parada em 12/03/2025. Retorno em 15/03/2025. Ordem 4471.</textarea></label>'+
    '<div class="rout"></div><p class="wnote">Experimente trocar o padrão por <code>\\d+</code> (só números) ou <code>[A-Z][a-z]+</code> (palavra com inicial maiúscula).</p>';
  var p=el.querySelector('input'),t=el.querySelector('textarea'),o=el.querySelector('.rout');
  function run(){
    var re;try{re=new RegExp(p.value,'g')}catch(e){o.innerHTML='<p class="bad">Regex inválida: '+esc(e.message)+'</p>';return}
    var s=t.value,out='',last=0,n=0,m;
    while((m=re.exec(s))!==null){
      if(m[0]===''){re.lastIndex++;continue}
      out+=esc(s.slice(last,m.index))+'<mark>'+esc(m[0])+'</mark>';last=m.index+m[0].length;n++;if(n>200)break;
    }
    out+=esc(s.slice(last));
    o.innerHTML='<div class="rbox">'+out+'</div><p class="wres"><b>'+n+'</b> '+(n===1?'trecho encontrado':'trechos encontrados')+'</p>';
  }
  p.oninput=t.oninput=run;run();
};

W.hash=function(el){
  el.innerHTML='<label class="fl">Texto<input class="in" value="Ordem de serviço 4471"></label>'+
    '<div class="hrow"><span class="hl">Hash SHA-256 do texto</span><code class="hv h1"></code></div>'+
    '<div class="hrow"><span class="hl">Hash do mesmo texto com um ponto no fim</span><code class="hv h2"></code></div>'+
    '<p class="wnote">Um caractere a mais e o hash inteiro muda. O tamanho é sempre 64 caracteres, seja qual for o texto. E não existe caminho de volta: do hash você não recupera o texto.</p>';
  var i=el.querySelector('input'),a=el.querySelector('.h1'),b=el.querySelector('.h2');
  function sha(s){return crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)).then(function(buf){return Array.from(new Uint8Array(buf)).map(function(x){return x.toString(16).padStart(2,'0')}).join('')})}
  function run(){
    if(!window.crypto||!crypto.subtle){a.textContent='Este navegador não oferece SHA-256.';b.textContent='';return}
    sha(i.value).then(function(x){a.textContent=x});sha(i.value+'.').then(function(y){b.textContent=y});
  }
  i.oninput=run;run();
};

W.base64=function(el){
  el.innerHTML='<label class="fl">Texto normal<textarea class="in t1" rows="2">Linha 3 parada</textarea></label>'+
    '<div class="acts2"><button class="btn sm e">Codificar em Base64</button><button class="btn sm ghost d">Decodificar</button></div>'+
    '<label class="fl" style="margin-top:10px">Base64<textarea class="in mono t2" rows="2"></textarea></label><p class="wnote">Base64 só troca a roupa do texto para ele viajar em sistemas que só aceitam letras e números. Qualquer um desfaz. Não é segredo, não é criptografia.</p>';
  var t1=el.querySelector('.t1'),t2=el.querySelector('.t2');
  function enc(){try{var by=new TextEncoder().encode(t1.value),s='';by.forEach(function(c){s+=String.fromCharCode(c)});t2.value=btoa(s)}catch(e){t2.value='Erro ao codificar'}}
  function dec(){try{var s=atob(t2.value.trim()),by=Uint8Array.from(s,function(c){return c.charCodeAt(0)});t1.value=new TextDecoder().decode(by)}catch(e){t1.value='Base64 inválido'}}
  el.querySelector('.e').onclick=enc;el.querySelector('.d').onclick=dec;enc();
};

W.json=function(el){
  el.innerHTML='<label class="fl">Edite o JSON<textarea class="in mono" rows="7" spellcheck="false">{\n  "maquina": "Prensa 01",\n  "rodando": true,\n  "horas": 1280,\n  "pecas": ["A12", "B07"]\n}</textarea></label>'+
    '<p class="wres st"></p><button class="btn sm ghost fm">Formatar</button><p class="wnote">Tente apagar uma vírgula, trocar aspas duplas por simples ou deixar uma vírgula sobrando no fim. JSON é exigente: se algo estiver fora do padrão, nenhum sistema consegue ler.</p>';
  var t=el.querySelector('textarea'),st=el.querySelector('.st');
  function chk(){try{JSON.parse(t.value);st.innerHTML='<b style="color:var(--ok)">JSON válido.</b> Qualquer sistema consegue ler isso.'}catch(e){st.innerHTML='<span class="bad"><b>JSON inválido:</b> '+esc(e.message)+'</span>'}}
  t.oninput=chk;chk();
  el.querySelector('.fm').onclick=function(){try{t.value=JSON.stringify(JSON.parse(t.value),null,2);chk()}catch(e){}};
};

W.sql=function(el){
  var M=[
    {id:1,nome:'Prensa 01',setor:'Estamparia',status:'rodando',horas:1280},
    {id:2,nome:'Torno CNC 02',setor:'Usinagem',status:'parada',horas:3410},
    {id:3,nome:'Esteira A',setor:'Expedição',status:'rodando',horas:760},
    {id:4,nome:'Compressor 1',setor:'Utilidades',status:'rodando',horas:5120},
    {id:5,nome:'Forno 03',setor:'Fundição',status:'manutenção',horas:2290},
    {id:6,nome:'Robô de solda',setor:'Montagem',status:'rodando',horas:1840},
    {id:7,nome:'Fresadora 04',setor:'Usinagem',status:'parada',horas:990},
    {id:8,nome:'Ponte rolante',setor:'Fundição',status:'rodando',horas:4300}];
  var Q=[
    ['SELECT * FROM maquinas;',function(){return M}],
    ["SELECT nome, status FROM maquinas WHERE status = 'parada';",function(){return M.filter(function(r){return r.status==='parada'}).map(function(r){return {nome:r.nome,status:r.status}})}],
    ['SELECT nome, horas FROM maquinas WHERE horas > 2000 ORDER BY horas DESC;',function(){return M.filter(function(r){return r.horas>2000}).sort(function(a,b){return b.horas-a.horas}).map(function(r){return {nome:r.nome,horas:r.horas}})}],
    ['SELECT setor, COUNT(*) AS total FROM maquinas GROUP BY setor;',function(){var g={};M.forEach(function(r){g[r.setor]=(g[r.setor]||0)+1});return Object.keys(g).map(function(k){return {setor:k,total:g[k]}})}],
    ['SELECT AVG(horas) AS media_horas FROM maquinas;',function(){return [{media_horas:Math.round(M.reduce(function(a,r){return a+r.horas},0)/M.length)}]}]];
  function tbl(rows){if(!rows.length)return '<p class="empty">Nenhuma linha.</p>';var k=Object.keys(rows[0]);return '<div class="scrollx"><table class="tbl"><thead><tr>'+k.map(function(c){return '<th>'+c+'</th>'}).join('')+'</tr></thead><tbody>'+rows.map(function(r){return '<tr>'+k.map(function(c){return '<td>'+esc(r[c])+'</td>'}).join('')+'</tr>'}).join('')+'</tbody></table></div>'}
  el.innerHTML='<p class="lbl2">Tabela <b>maquinas</b> (8 linhas). Toque numa consulta:</p><div class="qchips">'+Q.map(function(q,i){return '<button data-i="'+i+'" aria-pressed="'+(i===0?'true':'false')+'">'+esc(q[0])+'</button>'}).join('')+'</div><div class="qres"></div><p class="wnote">São consultas prontas para mostrar a ideia. Um banco de verdade aceita qualquer pergunta escrita nesse formato.</p>';
  var res=el.querySelector('.qres');
  function show(i){el.querySelectorAll('.qchips button').forEach(function(b,k){b.setAttribute('aria-pressed',k===i?'true':'false')});res.innerHTML=tbl(Q[i][1]())}
  el.addEventListener('click',function(e){var b=e.target.closest('.qchips button');if(b)show(+b.dataset.i)});show(0);
};

W.http=function(el){
  el.innerHTML='<div class="two"><label class="fl">Método<select class="in m"><option>GET<option>POST<option>DELETE</select></label><label class="fl">Caminho<select class="in p"><option>/maquinas<option>/maquinas/7<option>/maquinas/999<option>/admin<option>/quebra</select></label></div>'+
    '<button class="btn sm go">Enviar requisição</button><pre class="mini req"></pre><pre class="mini res"></pre><p class="wnote why"></p>';
  var m=el.querySelector('.m'),p=el.querySelector('.p'),rq=el.querySelector('.req'),rs=el.querySelector('.res'),why=el.querySelector('.why');
  function R(me,pa){
    if(pa==='/quebra')return [500,'Internal Server Error','{"erro":"falha inesperada"}','5xx: o erro foi do servidor. O pedido estava certo, mas algo quebrou lá dentro.'];
    if(pa==='/admin')return me==='DELETE'?[403,'Forbidden','{"erro":"sem permissão"}','403: o servidor sabe quem você é, mas você não tem permissão pra isso.']:[401,'Unauthorized','{"erro":"faça login"}','401: o servidor não sabe quem você é. Falta login ou token.'];
    if(pa==='/maquinas'){if(me==='GET')return [200,'OK','[{"id":7,"nome":"Fresadora 04"}, ...]','200: deu certo. A resposta traz o que você pediu.'];if(me==='POST')return [201,'Created','{"id":9,"nome":"Máquina nova"}','201: criado. Algo novo passou a existir no servidor.'];return [405,'Method Not Allowed','{"erro":"não dá pra apagar a lista toda"}','405: esse caminho não aceita esse método.']}
    if(pa==='/maquinas/7'){if(me==='GET')return [200,'OK','{"id":7,"nome":"Fresadora 04","status":"parada"}','200: deu certo. Aqui veio só a máquina 7.'];if(me==='DELETE')return [204,'No Content','','204: apagou e não tem nada para devolver.'];return [405,'Method Not Allowed','{"erro":"método não permitido"}','405: esse caminho não aceita esse método.']}
    return [404,'Not Found','{"erro":"máquina não encontrada"}','404: o caminho não existe ou o item não foi achado. Erro de quem pediu (4xx).'];
  }
  function go(){var me=m.value,pa=p.value,r=R(me,pa);
    rq.textContent=me+' '+pa+' HTTP/1.1\nHost: api.fabrica.exemplo\nAccept: application/json';
    rs.textContent='HTTP/1.1 '+r[0]+' '+r[1]+'\nContent-Type: application/json\n\n'+r[2];why.textContent=r[3]+' Famílias: 2xx deu certo, 3xx redirecionou, 4xx erro de quem pediu, 5xx erro do servidor.'}
  el.querySelector('.go').onclick=go;go();
};

W.bigo=function(el){
  el.innerHTML='<label class="fl">Quantidade de itens (n): <b class="nv">10</b><input class="resz" type="range" min="1" max="30" value="10"></label><div class="bor"></div><p class="wnote">As barras usam escala logarítmica para caber na tela. Olhe os números: com n = 30, o algoritmo O(2^n) já passa de um bilhão de passos.</p>';
  var r=el.querySelector('input'),nv=el.querySelector('.nv'),o=el.querySelector('.bor');
  var F=[['O(1)',function(){return 1}],['O(log n)',function(n){return Math.max(1,Math.ceil(Math.log2(n)))}],['O(n)',function(n){return n}],['O(n log n)',function(n){return Math.round(n*Math.max(1,Math.log2(n)))}],['O(n²)',function(n){return n*n}],['O(2^n)',function(n){return Math.pow(2,n)}]];
  var mx=Math.log10(Math.pow(2,30)+1);
  function run(){var n=+r.value;nv.textContent=n;o.innerHTML=F.map(function(f){var v=f[1](n);return '<div class="bo"><span>'+f[0]+'</span><div class="bar"><i style="width:'+Math.max(2,Math.log10(v+1)/mx*100)+'%"></i></div><span>'+v.toLocaleString('pt-BR')+'</span></div>'}).join('')}
  r.oninput=run;run();
};

W.sorting=function(el){
  var a=[],i=0,j=0,n=12,swaps=0,cmp=0,t=null;
  el.innerHTML='<div class="bars2"></div><div class="acts2"><button class="btn sm ghost sh">Embaralhar</button><button class="btn sm so">Ordenar (bubble sort)</button></div><p class="wres st"></p><p class="wnote">O bubble sort compara vizinhos e troca quando estão na ordem errada, repetindo até acabar. É lento de propósito: serve para enxergar a ideia.</p>';
  var box=el.querySelector('.bars2'),st=el.querySelector('.st');
  function draw(x,y){box.innerHTML=a.map(function(v,k){return '<i style="height:'+(v*100/n)+'%" class="'+(k===x||k===y?'hot':'')+'"></i>'}).join('');st.textContent='Comparações: '+cmp+' | Trocas: '+swaps}
  function stop(){if(t){clearInterval(t);t=null}}
  CLEAN.push(stop);
  function shuffle(){stop();a=[];for(var k=1;k<=n;k++)a.push(k);for(var q=n-1;q>0;q--){var r=Math.floor(Math.random()*(q+1));var tmp=a[q];a[q]=a[r];a[r]=tmp}i=0;j=0;swaps=0;cmp=0;draw(-1,-1)}
  function step(){
    if(i>=n-1){stop();draw(-1,-1);return}
    if(j>=n-1-i){j=0;i++;draw(-1,-1);return}
    cmp++;if(a[j]>a[j+1]){var tmp=a[j];a[j]=a[j+1];a[j+1]=tmp;swaps++}
    draw(j,j+1);j++;
  }
  el.querySelector('.sh').onclick=shuffle;
  el.querySelector('.so').onclick=function(){stop();i=0;j=0;cmp=0;swaps=0;t=setInterval(step,110)};
  shuffle();
};

W.stackqueue=function(el){
  var s=[],q=[],c=0;
  el.innerHTML='<div class="two2"><div><b>Pilha</b> <span class="lbl2">último a entrar, primeiro a sair</span><div class="stk col pil"></div><div class="acts2"><button class="btn sm ps">Empilhar</button><button class="btn sm ghost pp">Desempilhar</button></div></div>'+
    '<div><b>Fila</b> <span class="lbl2">primeiro a entrar, primeiro a sair</span><div class="stk fil"></div><div class="acts2"><button class="btn sm qs">Entrar na fila</button><button class="btn sm ghost qp">Atender</button></div></div></div><p class="wres st"></p>';
  var pil=el.querySelector('.pil'),fil=el.querySelector('.fil'),st=el.querySelector('.st');
  function chip(v){return '<span class="chip2">'+v+'</span>'}
  function draw(){pil.innerHTML=s.map(chip).join('')||'<em class="lbl2">vazia</em>';fil.innerHTML=q.map(chip).join('')||'<em class="lbl2">vazia</em>'}
  el.querySelector('.ps').onclick=function(){s.push(++c);draw();st.textContent='Empilhou '+c+'. Quem entra por último fica no topo.'};
  el.querySelector('.pp').onclick=function(){if(s.length){st.textContent='Saiu o '+s.pop()+', o último que entrou.'}draw()};
  el.querySelector('.qs').onclick=function(){q.push(++c);draw();st.textContent='Entrou o '+c+' no fim da fila.'};
  el.querySelector('.qp').onclick=function(){if(q.length){st.textContent='Atendeu o '+q.shift()+', o primeiro que chegou.'}draw()};
  draw();
};

W.git=function(el){
  var cs,head,cur,n;
  el.innerHTML='<div class="acts2"><button class="btn sm gc">Commit</button><button class="btn sm ghost gb">Criar branch</button><button class="btn sm ghost gs">Trocar de branch</button><button class="btn sm ghost gm">Merge</button><button class="btn sm ghost gr0">Zerar</button></div><p class="wres gi"></p><div class="glog"></div>';
  var info=el.querySelector('.gi'),log=el.querySelector('.glog');
  function draw(){
    var rows=cs.map(function(c,i){
      var tags='';
      if(head.main===i)tags+='<span class="gtag">main'+(cur==='main'?' (você está aqui)':'')+'</span>';
      if(head.feature===i)tags+='<span class="gtag">feature'+(cur==='feature'?' (você está aqui)':'')+'</span>';
      return '<div class="gr"><span>'+(c.l===0?'<i class="gd"></i>':'')+'</span><span>'+(c.l===1?'<i class="gd f"></i>':'')+'</span><span>'+esc(c.m)+tags+'</span></div>';
    }).reverse().join('');
    log.innerHTML='<div class="gr lbl2"><span>main</span><span>feat</span><span>histórico (mais novo em cima)</span></div>'+rows;
  }
  function say(t){info.textContent=t}
  function reset(){cs=[{m:'início do projeto',l:0}];head={main:0,feature:null};cur='main';n=0;say('Cada commit é uma foto do projeto. Toque em Commit para tirar uma.');draw()}
  el.querySelector('.gc').onclick=function(){n++;cs.push({m:'mudança '+n,l:cur==='main'?0:1});head[cur]=cs.length-1;say('Novo commit na branch '+cur+'.');draw()};
  el.querySelector('.gb').onclick=function(){if(head.feature!==null){say('A branch feature já existe.');return}head.feature=head.main;cur='feature';say('Criou a branch feature a partir da main e foi para ela. Seus commits agora ficam separados.');draw()};
  el.querySelector('.gs').onclick=function(){if(head.feature===null){say('Só existe a main. Crie uma branch primeiro.');return}cur=cur==='main'?'feature':'main';say('Agora você está na branch '+cur+'.');draw()};
  el.querySelector('.gm').onclick=function(){
    if(head.feature===null){say('Nada para juntar. Crie uma branch e faça commits nela.');return}
    if(cur!=='main'){say('Para juntar, volte para a main (Trocar de branch) e faça o merge de lá.');return}
    cs.push({m:'merge da feature na main',l:0});head.main=cs.length-1;head.feature=null;say('Merge feito: o trabalho da feature entrou na main e a branch foi apagada.');draw()};
  el.querySelector('.gr0').onclick=reset;
  reset();
};

W.resize=function(el){
  var html='<meta name="viewport" content="width=device-width,initial-scale=1"><style>html{background:#fff;color:#111}body{margin:0;font:14px system-ui,sans-serif}.nav{display:flex;gap:10px;padding:10px;background:#12263f;color:#fff;align-items:center}.nav .links{margin-left:auto}.menu{display:none;margin-left:auto;font-size:20px}.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:10px}.card{background:#e8eef5;padding:14px;border-radius:6px}@media(max-width:420px){.links{display:none}.menu{display:inline}.cards{grid-template-columns:1fr}}</style><div class=nav><b>Fábrica</b><span class=links>Linhas · Alertas · Relatórios</span><span class=menu>&#9776;</span></div><div class=cards><div class=card>Linha 1</div><div class=card>Linha 2</div><div class=card>Linha 3</div></div>';
  el.innerHTML='<label class="fl">Largura da tela: <b class="wv">520</b> px<input class="resz" type="range" min="260" max="640" value="520"></label><div class="scrollx"><iframe class="fr" title="Demonstração" sandbox="allow-scripts" style="height:200px;width:520px;max-width:100%"></iframe></div><p class="wnote">Arraste e veja o layout se rearranjar sozinho abaixo de 420 px: o menu vira botão e os cartões empilham. É o CSS responsivo trabalhando.</p>';
  var r=el.querySelector('input'),fr=el.querySelector('iframe'),wv=el.querySelector('.wv');
  fr.srcdoc=html;
  r.oninput=function(){fr.style.width=r.value+'px';wv.textContent=r.value};
};

W.tailwind=function(el){
  var cls=['px-4','py-2','rounded-lg','bg-blue-600','text-white','font-bold','shadow-lg','text-lg','uppercase'],on={};
  el.innerHTML='<div class="tw-demo"><button class="tb">Salvar</button></div><div class="chips">'+cls.map(function(c){return '<button class="chip" data-c="'+c+'" aria-pressed="false">'+c+'</button>'}).join('')+'</div><pre class="mini tc"></pre><p class="wnote">Cada classe faz uma coisa pequena e fixa. Você monta o visual empilhando classes direto no HTML, sem escrever CSS à parte. Aqui são classes de brinquedo no estilo do Tailwind.</p>';
  var b=el.querySelector('.tb'),tc=el.querySelector('.tc');
  function draw(){var l=cls.filter(function(c){return on[c]});b.className='tb '+l.join(' ');tc.textContent='<button class="'+l.join(' ')+'">Salvar</button>'}
  el.addEventListener('click',function(e){var c=e.target.closest('.chip');if(!c)return;var k=c.dataset.c;on[k]=!on[k];c.setAttribute('aria-pressed',on[k]?'true':'false');draw()});
  draw();
};

W.flow=function(el,key){
  var d=FLOW[key],k=0;
  function draw(){
    var st=d.s[k];
    el.innerHTML='<div class="fnodes">'+d.n.map(function(n,i){return '<span class="fn'+(st[0].indexOf(i)>=0?' on':'')+'">'+esc(n)+'</span>'}).join('<span class="fa">&rsaquo;</span>')+'</div>'+
      '<p class="fstep"><b>Passo '+(k+1)+' de '+d.s.length+'.</b> '+rich(st[1])+'</p>'+
      '<div class="fbar"><button class="btn sm ghost fp"'+(k?'':' disabled')+'>Anterior</button><button class="btn sm fx">'+(k<d.s.length-1?'Próximo passo':'Recomeçar')+'</button></div>';
  }
  el.onclick=function(e){
    if(e.target.closest('.fp')){if(k>0)k--;draw()}
    else if(e.target.closest('.fx')){k=(k<d.s.length-1)?k+1:0;draw()}
  };
  draw();
};

function frameDemo(el,d){
  var base='<meta name="viewport" content="width=device-width,initial-scale=1"><style>html{background:#fff;color:#111}</style>';
  el.innerHTML=(d.v.length>1?'<div class="tabs" role="tablist">'+d.v.map(function(v,i){return '<button class="tab" role="tab" data-i="'+i+'">'+esc(v[0])+'</button>'}).join('')+'</div>':'')+
    (d.hint?'<p class="wnote" style="margin:0 0 10px">'+rich(d.hint)+'</p>':'')+
    '<iframe class="fr" title="Demonstração" sandbox="allow-scripts" style="height:'+(d.h||240)+'px"></iframe>';
  var fr=el.querySelector('iframe');
  function sel(i){fr.srcdoc=base+d.v[i][1];el.querySelectorAll('.tab').forEach(function(b,k){b.setAttribute('aria-selected',k===i?'true':'false')})}
  el.addEventListener('click',function(e){var b=e.target.closest('.tab');if(b)sel(+b.dataset.i)});
  sel(0);
}
function mountDemo(el){
  var key=el.dataset.demo;
  if(W[key]&&key!=='flow')return W[key](el);
  if(FLOW[key])return W.flow(el,key);
  if(FR[key])return frameDemo(el,FR[key]);
  el.textContent='Demonstração indisponível.';
}
