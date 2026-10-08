/* ===== demos em página (iframe) e passo a passo ===== */
function ST(css){return '<style>'+css+'</style>'}
function SC(js){return '<script>'+js+'<\/script>'}

/* ---- a mesma página de exemplo, usada em HTML / CSS ---- */
var PAGE=L(
'<header><h1>Oficina Central</h1><nav><a href="#">Início</a> <a href="#">Serviços</a> <a href="#">Contato</a></nav></header>',
'<main>',
'<h2>Manutenção que não deixa a linha parar</h2>',
'<p>Revisão de motores, painéis e inversores, com técnico no local.</p>',
'<button>Pedir orçamento</button>',
'<h2>Serviços</h2>',
'<ul><li><b>Motores</b> Rebobinamento e balanceamento</li><li><b>Painéis</b> Revisão e troca de componentes</li><li><b>Inversores</b> Parametrização e testes</li></ul>',
'<h2>Contato</h2>',
'<form><label>Seu nome <input placeholder="Digite aqui"></label> <button type="button">Enviar</button></form>',
'</main>',
'<footer>Oficina Central · seg a sex, 7h às 17h</footer>');

var CSS1=L(
'*{box-sizing:border-box}',
'body{margin:0;font-family:system-ui,Segoe UI,Roboto,sans-serif;color:#1b2630;background:#f2f5f8;line-height:1.45}',
'header{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:6px 14px;padding:14px 18px;background:#12263f;color:#fff}',
'header h1{margin:0;font-size:21px;letter-spacing:.02em}',
'nav a{color:#bcd8ff;text-decoration:none;font-size:14px;margin-right:12px}',
'main{padding:6px 18px 4px;max-width:640px;margin:0 auto}',
'h2{font-size:19px;margin:20px 0 8px}',
'main>h2:first-child{font-size:26px;line-height:1.12}',
'button{background:#e0a100;color:#1a1200;border:0;border-radius:8px;padding:12px 18px;font:700 15px system-ui,sans-serif;cursor:pointer}',
'ul{list-style:none;margin:0;padding:0;display:grid;gap:10px}',
'li{background:#fff;border:1px solid #d3dce5;border-left:5px solid #1f6fdb;border-radius:8px;padding:10px 12px}',
'li b{display:block}',
'form{display:flex;flex-wrap:wrap;gap:10px;align-items:flex-end}',
'label{display:grid;gap:4px;font-size:13px;color:#4a5a69}',
'input{padding:10px;border:1px solid #9fb0c0;border-radius:6px;font-size:15px;min-width:0}',
'footer{text-align:center;color:#5a6a79;font-size:13px;padding:22px 12px}');

var CSS2=L(
'html{background:#14110d}',
'body{margin:0;font-family:Georgia,serif;color:#f1e6d0;background:#14110d;line-height:1.5}',
'header{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;gap:6px 14px;padding:16px 18px;border-bottom:2px solid #d99a1d}',
'h1{margin:0;font-size:22px;font-style:italic;color:#ffcf6a}',
'nav a{color:#d99a1d;text-decoration:none;font:12px system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;margin-right:12px}',
'main{padding:6px 18px;max-width:640px;margin:auto}',
'h2{font-size:20px;color:#ffcf6a;margin:20px 0 8px;font-weight:400}',
'main>h2:first-child{font-size:30px;line-height:1.08}',
'button{background:transparent;color:#ffcf6a;border:2px solid #d99a1d;border-radius:0;padding:11px 18px;font:600 13px system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase;cursor:pointer}',
'ul{margin:0;padding-left:20px}li{margin-bottom:6px}li b{color:#ffcf6a}',
'form{display:flex;flex-wrap:wrap;gap:10px;align-items:flex-end}',
'label{display:grid;gap:4px;font:12px system-ui,sans-serif;color:#bfae8c}',
'input{padding:10px;background:#1f1a13;color:#f1e6d0;border:1px solid #6f5a2e;font-size:15px;min-width:0}',
'footer{text-align:center;color:#8f8062;font:12px system-ui,sans-serif;padding:22px 12px}');

var TAGS=['header','nav','main','h1','h2','p','ul','li','form','label','button','footer'];
var OUTLINE=L('*{outline:1px dashed #cc3344;outline-offset:-1px}','header,main,footer{outline:2px solid #1f6fdb}',
  TAGS.map(function(t){return t+'::before{content:"<'+t+'>";font:10px monospace;color:#cc3344;background:#fff;margin-right:4px}'}).join('\n'));

FR.css={h:440,hint:'Toque nas abas. O **HTML é exatamente o mesmo** nas três. A única coisa que muda é o CSS.',v:[
  ['Sem CSS',PAGE],['Com CSS',ST(CSS1)+PAGE],['Outro CSS',ST(CSS2)+PAGE]]};

FR.html={h:440,hint:'Primeira aba: a página só com HTML, do jeito que o navegador desenha sem enfeite. Segunda: as mesmas **caixas e etiquetas (tags)** desenhadas por cima, para você ver a estrutura.',v:[
  ['Só HTML',PAGE],['Caixas e tags',ST(OUTLINE+'body{font-family:system-ui,sans-serif}')+PAGE]]};

/* ---- JavaScript: sem e com ---- */
var PSTYLE=L('*{box-sizing:border-box}body{font-family:system-ui,sans-serif;margin:0;padding:14px;color:#1b2630;background:#f2f5f8}h3{margin:0 0 10px}',
 'button{background:#1f6fdb;color:#fff;border:0;border-radius:8px;padding:11px 14px;font:600 14px system-ui;margin:2px 0}',
 'input{width:100%;padding:10px;border:1px solid #9fb0c0;border-radius:6px;font-size:15px;margin:6px 0}',
 'ul{margin:6px 0;padding-left:20px}p{margin:8px 0}');
var PPANEL=L('<h3>Painel da Prensa 01</h3>',
 '<p>Status: <b id="st" style="color:#c0352b">Parada</b> <button id="b1">Ligar / desligar</button></p>',
 '<p>Peças produzidas: <b id="n">0</b> <button id="b2">+1 peça</button></p>',
 '<input id="f" placeholder="Filtrar peças (ex: rolamento)">',
 '<ul id="l"><li>A12 Eixo</li><li>B07 Rolamento</li><li>C33 Correia</li><li>D01 Rolamento</li></ul>');
var PJS=L('var st=document.getElementById("st"),on=false,n=0;',
 'document.getElementById("b1").onclick=function(){on=!on;st.textContent=on?"Rodando":"Parada";st.style.color=on?"#168a3a":"#c0352b"};',
 'document.getElementById("b2").onclick=function(){n++;document.getElementById("n").textContent=n};',
 'document.getElementById("f").oninput=function(e){var q=e.target.value.toLowerCase();',
 '  document.querySelectorAll("#l li").forEach(function(li){li.style.display=li.textContent.toLowerCase().indexOf(q)>=0?"":"none"})};');
FR.js={h:330,hint:'A página é a mesma. Na aba **Sem JavaScript** os botões e o filtro não fazem nada. Na aba **Com JavaScript** eles funcionam: toque neles.',v:[
  ['Sem JavaScript',ST(PSTYLE)+PPANEL],['Com JavaScript',ST(PSTYLE)+PPANEL+SC(PJS)]]};

/* ---- DOM ---- */
var TREE=L('document','└─ html','   ├─ head','   │  └─ title  "Oficina Central"','   └─ body','      ├─ h1  "Oficina Central"','      ├─ p   "Manutenção de motores"','      └─ ul','         ├─ li  "Motores"','         └─ li  "Painéis"');
var DOMJS=L('var box=document.getElementById("box"),ul=document.getElementById("ul"),src=document.getElementById("src"),k=0;',
 'function show(){src.textContent=box.innerHTML.replace(/></g,">\\n<")}',
 'document.getElementById("a").onclick=function(){box.querySelector("h3").textContent="Tarefas de hoje";show()};',
 'document.getElementById("b").onclick=function(){k++;var li=document.createElement("li");li.textContent="Item novo "+k;ul.appendChild(li);show()};',
 'document.getElementById("c").onclick=function(){if(ul.lastElementChild)ul.removeChild(ul.lastElementChild);show()};',
 'document.getElementById("d").onclick=function(){ul.style.background=ul.style.background?"":"#fff0cc";show()};',
 'show();');
var DOMPAGE=L('<div id="box"><h3>Lista de tarefas</h3><ul id="ul"><li>Lubrificar rolamento</li><li>Apertar bornes</li></ul></div>',
 '<p><button id="a">Trocar o título</button> <button id="b">Criar item</button> <button id="c">Apagar o último</button> <button id="d">Pintar a lista</button></p>',
 '<p class="m">HTML da caixa acima, agora, ao vivo:</p><pre id="src"></pre>');
var DOMCSS=L('body{font-family:system-ui,sans-serif;margin:0;padding:14px;color:#1b2630;background:#f2f5f8}h3{margin:0 0 6px}',
 'button{background:#1f6fdb;color:#fff;border:0;border-radius:8px;padding:9px 11px;font:600 13px system-ui;margin:2px 0}',
 '#box{background:#fff;border:1px solid #c9d3dc;border-radius:8px;padding:10px}ul{margin:6px 0;padding-left:20px}',
 'pre{background:#0f1b26;color:#dde8f2;padding:10px;border-radius:6px;font:12px/1.5 monospace;white-space:pre-wrap;margin:0}.m{margin:8px 0 6px;font-size:13px;color:#4d5c69}');
FR.dom={h:420,hint:'O navegador transforma o HTML numa **árvore de objetos** (o DOM). O JavaScript mexe nessa árvore e a tela muda na hora. Na segunda aba, toque nos botões e olhe o HTML se reescrevendo.',v:[
  ['A árvore',ST('body{margin:0;padding:14px;background:#f2f5f8}pre{background:#0f1b26;color:#dde8f2;padding:14px;border-radius:6px;font:13px/1.6 monospace;margin:0}')+'<pre>'+TREE+'</pre>'],
  ['Mexendo ao vivo',ST(DOMCSS)+DOMPAGE+SC(DOMJS)]]};

/* ---- Flexbox ---- */
var FXCSS=L('body{margin:0;padding:12px;font-family:system-ui,sans-serif;background:#f2f5f8;color:#1b2630}',
 '.c{border:2px dashed #7a8a99;padding:8px;margin:0 0 10px;background:#fff}',
 '.b{background:#1f6fdb;color:#fff;font:700 15px system-ui;border-radius:6px;padding:10px 14px}',
 '.b2{padding-top:22px;padding-bottom:22px;background:#c2410c}.b3{padding-left:26px;padding-right:26px;background:#0b7a6d}',
 'pre{background:#0f1b26;color:#dde8f2;padding:10px;border-radius:6px;font:12.5px/1.5 monospace;margin:0;white-space:pre-wrap}',
 '.ctl{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px}.ctl label{font-size:12px;color:#4d5c69;display:grid;gap:3px}.ctl select{padding:8px;font-size:14px}');
var FXB='<div class="b">1</div><div class="b b2">2</div><div class="b b3">3</div>';
function fx(style,code){return ST(FXCSS)+'<div class="c" style="'+style+'">'+FXB+'</div><pre>'+code+'</pre>'}
var FXPLAY=ST(FXCSS)+L('<div class="ctl"><label>flex-direction<select id="fd"><option>row<option>column</select></label>',
 '<label>justify-content<select id="jc"><option>flex-start<option>center<option>space-between<option>space-around<option>flex-end</select></label>',
 '<label>align-items<select id="ai"><option>stretch<option>flex-start<option>center<option>flex-end</select></label></div>',
 '<div class="c" id="c" style="display:flex;height:170px">'+FXB+'</div><pre id="code"></pre>')+
 SC(L('var c=document.getElementById("c"),code=document.getElementById("code"),fd=document.getElementById("fd"),jc=document.getElementById("jc"),ai=document.getElementById("ai");',
 'function up(){c.style.flexDirection=fd.value;c.style.justifyContent=jc.value;c.style.alignItems=ai.value;',
 '  code.textContent=".caixa {\\n  display: flex;\\n  flex-direction: "+fd.value+";\\n  justify-content: "+jc.value+";\\n  align-items: "+ai.value+";\\n}"}',
 'fd.onchange=jc.onchange=ai.onchange=up;up();'));
FR.flexbox={h:330,hint:'Mesmos três blocos em todas as abas. O que muda é só o CSS da caixa de fora. Na última aba você mesmo mexe nas opções.',v:[
  ['Sem flexbox',fx('','.caixa {\n  /* nada: os blocos empilham */\n}')],
  ['display: flex',fx('display:flex','.caixa {\n  display: flex;\n}')],
  ['Espalhar e centralizar',fx('display:flex;justify-content:space-between;align-items:center;height:130px','.caixa {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}')],
  ['Coluna com espaço',fx('display:flex;flex-direction:column;gap:12px;align-items:flex-start','.caixa {\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n  align-items: flex-start;\n}')],
  ['Brinque',FXPLAY]]};

/* ---- Grid ---- */
var GRCSS=L('body{margin:0;padding:12px;font-family:system-ui,sans-serif;background:#f2f5f8;color:#1b2630}',
 '.g>div{background:#1f6fdb;color:#fff;font:700 14px system-ui;border-radius:5px;padding:14px 10px;text-align:center}',
 '.g>div:nth-child(2n){background:#c2410c}.g>div:nth-child(3n){background:#0b7a6d}',
 'pre{background:#0f1b26;color:#dde8f2;padding:10px;border-radius:6px;font:12.5px/1.5 monospace;margin:10px 0 0;white-space:pre-wrap}',
 '.pg{display:grid;gap:6px;grid-template-columns:84px 1fr;grid-template-areas:"top top" "menu main" "foot foot"}',
 '.pg>div{border-radius:5px;color:#fff;font:600 13px system-ui;padding:14px 10px}.t{grid-area:top;background:#12263f}.m{grid-area:menu;background:#c2410c}.n{grid-area:main;background:#1f6fdb;min-height:90px}.f{grid-area:foot;background:#0b7a6d}');
var GRBOXES='<div>1</div><div>2</div><div>3</div><div>4</div><div>5</div><div>6</div>';
function gr(style,code){return ST(GRCSS)+'<div class="g" style="'+style+'">'+GRBOXES+'</div><pre>'+code+'</pre>'}
FR.grid={h:340,hint:'Flexbox arruma em **uma direção** (linha ou coluna). O Grid arruma em **linhas e colunas ao mesmo tempo**, como uma planilha.',v:[
  ['Sem grid',gr('','.caixa {\n  /* nada: um embaixo do outro */\n}')],
  ['3 colunas',gr('display:grid;grid-template-columns:repeat(3,1fr);gap:8px','.caixa {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 8px;\n}')],
  ['2 colunas',gr('display:grid;grid-template-columns:1fr 2fr;gap:8px','.caixa {\n  display: grid;\n  grid-template-columns: 1fr 2fr;\n  gap: 8px;\n}')],
  ['Layout de página',ST(GRCSS)+'<div class="pg"><div class="t">topo</div><div class="m">menu</div><div class="n">conteúdo</div><div class="f">rodapé</div></div><pre>.pagina {\n  display: grid;\n  grid-template-columns: 84px 1fr;\n  grid-template-areas:\n    "topo topo"\n    "menu conteudo"\n    "rodape rodape";\n}</pre>']]};

/* ---- acessibilidade ---- */
var A11C=L('*{box-sizing:border-box}body{margin:0;padding:14px;font-family:system-ui,sans-serif;background:#fff;color:#1b2630}',
 '.say{margin-top:12px;background:#0f1b26;color:#dde8f2;border-radius:6px;padding:10px 12px;font-size:13px;line-height:1.5}.say b{color:#ffcf6a}',
 'img.p{display:block;width:90px;height:60px;background:#cdd6df;border-radius:4px;margin-bottom:10px}');
FR.a11y={h:400,hint:'Parecem quase iguais, mas **não são**. Compare o texto no quadro escuro: é o que um leitor de tela (usado por pessoas cegas) anunciaria. Se puder, aperte **Tab** num computador e veja quem recebe foco.',v:[
 ['Sem cuidado',ST(A11C+'.d{display:inline-block;background:#9bb0c4;color:#c4d2df;padding:11px 16px;border-radius:6px;font-weight:700}.i{width:100%;padding:10px;border:1px solid #d5dde5;color:#c8d0d8;border-radius:6px;font-size:15px;margin-bottom:10px}')+
  '<span class="p" style="display:block;width:90px;height:60px;background:#cdd6df;border-radius:4px;margin-bottom:10px"></span><input class="i" placeholder="Nome completo"><div class="d" onclick="void 0">Enviar</div>'+
  '<div class="say"><b>Leitor de tela diria:</b><br>"imagem, IMG_2231.png"<br>"campo de edição" (sem dizer o que digitar)<br>"Enviar" (como texto comum, nem avisa que é botão)<br><br>Problemas: foto sem descrição, campo sem rótulo, texto com pouco contraste, e uma <b>div</b> fingindo ser botão (o teclado nem alcança).</div>'],
 ['Com cuidado',ST(A11C+'.b{background:#0b5cc4;color:#fff;padding:11px 16px;border:0;border-radius:6px;font:700 15px system-ui}.i{width:100%;padding:10px;border:1px solid #6b7c8c;border-radius:6px;font-size:15px;margin:4px 0 10px}label{font-size:13px;color:#2c3a47}')+
  '<span role="img" aria-label="Motor elétrico trifásico azul" class="p" style="display:block;width:90px;height:60px;background:#cdd6df;border-radius:4px;margin-bottom:10px"></span><label for="n">Nome completo</label><input class="i" id="n"><button class="b">Enviar</button>'+
  '<div class="say"><b>Leitor de tela diria:</b><br>"imagem, motor elétrico trifásico azul"<br>"Nome completo, campo de edição"<br>"Enviar, botão"<br><br>O que mudou: descrição na imagem, <b>label</b> ligado ao campo, contraste forte e um <b>button</b> de verdade (o teclado alcança e o leitor sabe que é botão).</div>']]};

/* ---- framework de CSS (estilo Bootstrap) ---- */
var BSMINI=L('body{margin:0;padding:14px;font-family:system-ui,sans-serif;background:#f2f5f8;color:#1b2630}',
 '.card{background:#fff;border:1px solid #d3dce5;border-radius:10px;padding:14px;margin-bottom:12px}.card h4{margin:0 0 6px;font-size:17px}',
 '.btn{display:inline-block;border:0;border-radius:8px;padding:10px 14px;font:600 14px system-ui;color:#fff;margin-right:6px}',
 '.btn-primary{background:#0b5cc4}.btn-danger{background:#b3261e}.btn-outline{background:transparent;color:#0b5cc4;border:2px solid #0b5cc4}',
 '.row{display:flex;gap:10px;flex-wrap:wrap}.col{flex:1 1 130px}.badge{display:inline-block;background:#e0a100;color:#1a1200;border-radius:999px;padding:2px 10px;font-size:12px;font-weight:700}');
FR.bootstrap={h:360,hint:'Um framework de CSS entrega **classes prontas**. Você não escreve o CSS do botão: só coloca o nome da classe no HTML. Aqui é uma versão mínima, só para mostrar a ideia (as classes imitam o estilo do Bootstrap).',v:[
 ['Sem framework','<div style="font-family:serif"><h4>Máquina 07</h4><p>Status: parada <span>alerta</span></p><button>Reiniciar</button> <button>Apagar</button></div>'],
 ['Com classes prontas',ST(BSMINI)+'<div class="row"><div class="col card"><h4>Máquina 07</h4><p>Status: parada <span class="badge">alerta</span></p><span class="btn btn-primary">Reiniciar</span><span class="btn btn-danger">Apagar</span></div><div class="col card"><h4>Máquina 08</h4><p>Status: rodando</p><span class="btn btn-outline">Detalhes</span></div></div>'+
  '<pre style="background:#0f1b26;color:#dde8f2;padding:10px;border-radius:6px;font:12px/1.5 monospace;white-space:pre-wrap;margin:0">&lt;button class="btn btn-primary"&gt;Reiniciar&lt;/button&gt;\n&lt;button class="btn btn-danger"&gt;Apagar&lt;/button&gt;</pre>']]};

/* ---- canvas e svg ---- */
FR.canvas={h:300,hint:'O canvas é uma **folha em branco** onde o JavaScript desenha pixel a pixel, quadro a quadro. Mexa no controle e veja o ponteiro de um manômetro acompanhar.',v:[
 ['Manômetro',ST('body{margin:0;padding:12px;font-family:system-ui,sans-serif;background:#f2f5f8;color:#1b2630;text-align:center}canvas{max-width:100%;background:#fff;border:1px solid #c9d3dc;border-radius:8px}input{width:90%;margin-top:10px}')+
  '<canvas id="c" width="300" height="170"></canvas><br><input id="r" type="range" min="0" max="100" value="40"><p style="font-size:13px;color:#4d5c69;margin:4px">Pressão alvo</p>'+
  SC(L('var c=document.getElementById("c"),x=c.getContext("2d"),v=40,t=40;',
  'function draw(){x.clearRect(0,0,300,170);x.lineWidth=14;x.strokeStyle="#d5dde5";x.beginPath();x.arc(150,150,100,Math.PI,2*Math.PI);x.stroke();',
  'var a=Math.PI+Math.PI*(v/100);x.strokeStyle=v>80?"#c0352b":v>60?"#e0a100":"#168a3a";x.beginPath();x.arc(150,150,100,Math.PI,a);x.stroke();',
  'x.lineWidth=4;x.strokeStyle="#12263f";x.beginPath();x.moveTo(150,150);x.lineTo(150+Math.cos(a)*85,150+Math.sin(a)*85);x.stroke();',
  'x.fillStyle="#12263f";x.beginPath();x.arc(150,150,8,0,7);x.fill();x.font="700 22px system-ui";x.textAlign="center";x.fillText(Math.round(v)+" bar",150,118)}',
  'function tick(){v+=(t-v)*0.12;draw();requestAnimationFrame(tick)}',
  'document.getElementById("r").oninput=function(e){t=+e.target.value};tick();'))]]};

FR.svg={h:300,hint:'Imagem de **pixels** (bitmap) vira escadinha quando ampliada. Imagem **vetorial** (SVG) é feita de fórmulas e continua nítida em qualquer tamanho. Arraste o controle para ampliar.',v:[
 ['Pixel x vetor',ST('body{margin:0;padding:12px;font-family:system-ui,sans-serif;background:#f2f5f8;color:#1b2630}.r{display:flex;gap:14px;flex-wrap:wrap;align-items:flex-start}canvas{image-rendering:pixelated;border:1px solid #c9d3dc;background:#fff;display:block}svg{border:1px solid #c9d3dc;background:#fff;display:block}input{width:100%;margin-top:10px}p{font-size:13px;margin:4px 0}')+
  '<div class="r"><div><canvas id="p" width="12" height="12"></canvas><p>Bitmap (12x12 pixels)</p></div><div><svg id="s" viewBox="0 0 12 12"><circle cx="6" cy="6" r="5" fill="#fff" stroke="#1f6fdb" stroke-width="1.5"/><path d="M6 6 L9 3.5" stroke="#c2410c" stroke-width="1" stroke-linecap="round"/></svg><p>Vetor (SVG)</p></div></div><input id="z" type="range" min="1" max="12" value="3">'+
  SC(L('var p=document.getElementById("p"),s=document.getElementById("s"),z=document.getElementById("z"),x=p.getContext("2d");',
  'x.fillStyle="#fff";x.fillRect(0,0,12,12);x.fillStyle="#1f6fdb";for(var i=0;i<12;i++)for(var j=0;j<12;j++){var d=Math.sqrt((i-5.5)*(i-5.5)+(j-5.5)*(j-5.5));if(d>4.2&&d<5.4)x.fillRect(i,j,1,1)}',
  'x.fillStyle="#c2410c";x.fillRect(8,3,1,1);x.fillRect(7,4,1,1);x.fillRect(6,5,1,1);x.fillRect(6,6,1,1);',
  'function up(){var w=z.value*22;p.style.width=w+"px";p.style.height=w+"px";s.style.width=w+"px";s.style.height=w+"px"}z.oninput=up;up();'))]]};

/* ---- JSX ---- */
function codeTab(t){return ST('body{margin:0;padding:12px;background:#f2f5f8;font-family:system-ui,sans-serif}pre{background:#0f1b26;color:#dde8f2;padding:12px;border-radius:6px;font:12.5px/1.55 monospace;margin:0;white-space:pre-wrap}p{font-size:13px;color:#4d5c69;margin:0 0 8px}')+t}
FR.jsx={h:300,hint:'JSX **não é** uma linguagem nova que o navegador entende. É um jeito de escrever que uma ferramenta converte em JavaScript comum antes de rodar.',v:[
 ['O que você escreve (JSX)',codeTab('<p>Parece HTML dentro do JavaScript:</p><pre>function Placa({ nome, ok }) {\n  return (\n    &lt;div className="placa"&gt;\n      &lt;h2&gt;{nome}&lt;/h2&gt;\n      &lt;p&gt;{ok ? "Rodando" : "Parada"}&lt;/p&gt;\n    &lt;/div&gt;\n  );\n}</pre>')],
 ['O que o navegador recebe',codeTab('<p>Depois da conversão (feita pelo Vite, Babel...), é só JavaScript puro:</p><pre>function Placa({ nome, ok }) {\n  return React.createElement(\n    "div", { className: "placa" },\n    React.createElement("h2", null, nome),\n    React.createElement("p", null, ok ? "Rodando" : "Parada")\n  );\n}</pre>')],
 ['O resultado na tela',codeTab('<p>O que aparece depois que o React monta:</p><div style="background:#fff;border:1px solid #c9d3dc;border-left:5px solid #168a3a;border-radius:8px;padding:10px 14px"><h2 style="margin:0 0 4px;font-size:18px">Prensa 01</h2><p style="color:#168a3a;font-weight:700;margin:0;font-size:15px">Rodando</p></div>')]]};

/* ---- ideia do React: tela = função do estado ---- */
FR.react={h:360,hint:'Versão de brinquedo da ideia central do React: você descreve **como a tela deve ficar para um dado estado**, e quando o estado muda a tela é refeita. Toque nos botões e repare no contador de "renders".',v:[
 ['Estado muda, tela refaz',ST('body{margin:0;padding:14px;font-family:system-ui,sans-serif;background:#f2f5f8;color:#1b2630}button{background:#1f6fdb;color:#fff;border:0;border-radius:8px;padding:10px 14px;font:600 14px system-ui;margin:2px 4px 2px 0}.card{background:#fff;border:1px solid #c9d3dc;border-radius:8px;padding:12px;margin-bottom:10px}.log{font:12px monospace;color:#4d5c69}')+
  '<div id="app"></div><p class="log" id="log"></p>'+
  SC(L('var state={n:0,ligada:false,renders:0};',
  'function setState(p){for(var k in p)state[k]=p[k];render()}',
  'function Painel(s){return "<div class=card><h3 style=margin:0>Linha 3: "+(s.ligada?"<span style=color:#168a3a>rodando</span>":"<span style=color:#c0352b>parada</span>")+"</h3><p>Peças hoje: <b>"+s.n+"</b></p>"+',
  '  "<button id=a>+1 peça</button><button id=b>"+(s.ligada?"Parar":"Ligar")+"</button></div>"}',
  'function render(){state.renders++;document.getElementById("app").innerHTML=Painel(state);',
  '  document.getElementById("a").onclick=function(){setState({n:state.n+1})};',
  '  document.getElementById("b").onclick=function(){setState({ligada:!state.ligada})};',
  '  document.getElementById("log").textContent="render() chamada "+state.renders+" vez(es). Você nunca mexeu na tela direto: só mudou o estado."}',
  'render();'))]]};

/* ============ passo a passo ============ */
FLOW.navegador={n:['Você','Navegador','DNS','Servidor','Banco de dados'],s:[
 [[0,1],'Você digita **loja.com** e aperta Enter. O navegador só entende **números** (endereços IP), então precisa descobrir qual é o número desse nome.'],
 [[1,2],'O navegador pergunta ao **DNS**: "qual o IP de loja.com?". O DNS funciona como uma **lista telefônica**: o nome entra, o número sai.'],
 [[2,1],'O DNS responde com o IP, por exemplo `203.0.113.10`. Agora o navegador sabe **onde bater**.'],
 [[1,3],'O navegador abre uma conexão segura (**HTTPS**) com o servidor e manda o pedido: `GET /`, que quer dizer "me dá a página inicial".'],
 [[3,4],'O servidor precisa de dados (produtos, preços), então consulta o **banco de dados**.'],
 [[4,3],'O banco devolve os dados e o servidor monta a resposta: HTML, CSS e JavaScript.'],
 [[3,1],'O servidor manda tudo de volta. O navegador **desenha a página**, e o JavaScript pode pedir mais dados depois.'],
 [[1,0],'Você vê a loja na tela. Tudo isso levou menos de um segundo.']]};

FLOW.dns={n:['Navegador','Resolvedor do provedor','Servidor raiz','Servidor .com','Servidor do site'],s:[
 [[0,1],'O navegador pergunta ao **resolvedor** (em geral do seu provedor): "qual o IP de `www.loja.com`?". Se ele já tiver a resposta guardada (cache), responde na hora e acabou.'],
 [[1,2],'Sem cache, ele pergunta a um **servidor raiz**: "quem cuida de .com?". A raiz não sabe o IP, mas sabe indicar o caminho.'],
 [[1,3],'A raiz aponta para os servidores do **.com**. O resolvedor pergunta a eles: "quem cuida de loja.com?".'],
 [[1,4],'Eles apontam para o **servidor DNS da própria loja**, o "autoritativo", que guarda os registros oficiais.'],
 [[4,1],'O servidor da loja responde: "www.loja.com é o IP tal".'],
 [[1,0],'O resolvedor guarda a resposta por um tempo (**TTL**) e entrega ao navegador. Quando você troca o IP de um site, a mudança demora a "propagar" porque cada cache espera o TTL acabar.']]};

FLOW.tls={n:['Navegador','Servidor'],s:[
 [[0,1],'O navegador diz oi: "quero falar com você em segredo; eu sei fazer estes tipos de criptografia".'],
 [[1,0],'O servidor responde e manda o **certificado**: um documento que diz "este servidor é mesmo loja.com", assinado por uma autoridade em que o navegador confia.'],
 [[0],'O navegador confere: a assinatura é válida? O nome bate? Está dentro do prazo? Se algo falha, aparece aquele aviso vermelho de "site não seguro".'],
 [[0,1],'Os dois combinam uma **chave secreta** só deles, com uma matemática que permite combinar a chave sem que quem está escutando consiga descobri-la.'],
 [[0,1],'Dali em diante tudo é **criptografado** com essa chave. Quem estiver no meio do caminho (wi-fi do café, provedor) só vê embaralhado. É o cadeado do navegador.']]};

FLOW.tcp={n:['Cliente','Servidor'],s:[
 [[0,1],'**SYN**: o cliente pergunta "dá pra conversar?".'],
 [[1,0],'**SYN-ACK**: o servidor responde "dá, e você me ouve?".'],
 [[0,1],'**ACK**: o cliente confirma "ouço sim". Conexão aberta. Esse "aperto de mão de 3 vias" garante que os dois lados estão prontos.'],
 [[0,1],'Os dados vão em **pacotes numerados**. Quem recebe confirma o que chegou.'],
 [[1,0],'Se um pacote some no caminho, o remetente percebe que a confirmação não veio e **manda de novo**. Por isso o TCP é confiável (e um pouco mais lento que o UDP, que não confirma nada).'],
 [[0,1],'No fim, os dois se despedem (**FIN**) e a conexão é fechada.']]};

FLOW.api={n:['Seu app','API (o garçom)','Cozinha (servidor + banco)'],s:[
 [[0,1],'Seu app quer a lista de máquinas. Ele não entra na cozinha: faz o **pedido ao garçom** no formato do cardápio, `GET /maquinas`.'],
 [[1,2],'A API confere o pedido (formato certo? você tem permissão?) e leva até a **cozinha**, onde ficam as regras e os dados.'],
 [[2],'A cozinha prepara: consulta o banco, aplica as regras. Você não precisa saber como ela faz.'],
 [[2,1],'O resultado volta ao garçom em formato padrão, quase sempre **JSON**.'],
 [[1,0],'A API entrega ao app, que mostra na tela. **Contrato respeitado**: se o cardápio não mudar, a cozinha pode trocar de fogão sem ninguém notar.']]};

FLOW.docker={n:['Dockerfile (receita)','Imagem (marmita pronta)','Container (marmita no micro-ondas)'],s:[
 [[0],'Você escreve o **Dockerfile**: uma receita com os passos ("parta do Linux com Node, copie meu código, instale as dependências, rode assim").'],
 [[0,1],'Comando `docker build`: o Docker segue a receita e gera uma **imagem**, um pacote fechado com tudo que o programa precisa.'],
 [[1],'A imagem pode ser guardada num registro (como o Docker Hub) e baixada em qualquer máquina. Roda igual no seu PC e no servidor.'],
 [[1,2],'Comando `docker run`: o Docker liga a imagem e cria um **container**, o programa rodando isolado do resto.'],
 [[2],'Dá para rodar **vários containers** da mesma imagem. Apagou um? Sobe outro idêntico em segundos.']]};

FLOW.cicd={n:['Commit','Build','Testes','Deploy','Produção'],s:[
 [[0],'Você envia o código para o repositório (`git push`). Isso dispara a esteira automática.'],
 [[1],'**Build**: a esteira monta o projeto (instala dependências, compila, gera o pacote).'],
 [[2],'**Testes**: roda centenas de testes automáticos. Se um falhar, a esteira para e avisa. Nada quebrado segue adiante.'],
 [[3],'**Deploy**: se tudo passou, o pacote é enviado ao servidor (às vezes só depois de uma aprovação manual).'],
 [[4],'Está no ar, sem copiar arquivo à mão e sem o "esqueci de rodar o teste". **CI** são as etapas 1 a 3; **CD** é a 4 e a 5.']]};

FLOW.k8s={n:['Você (arquivo YAML)','Kubernetes','Container A','Container B','Container C'],s:[
 [[0,1],'Você declara: "quero **3 cópias** deste app rodando sempre". Não diz como, só o resultado desejado.'],
 [[1,2,3,4],'O Kubernetes sobe 3 containers e os espalha pelos servidores disponíveis.'],
 [[3],'Um servidor falha e o **Container B morre**.'],
 [[1,3],'O Kubernetes vê que agora tem 2 e você pediu 3. Sem ninguém mandar, ele **cria outro** em outro servidor.'],
 [[1],'Chegou muito acesso? Com autoscaling ele sobe mais cópias, e diminui quando o pico passa. É um **supervisório** que corrige o estado real até bater com o desejado.']]};

FLOW.cache={n:['App','Cache (Redis)','Banco de dados'],s:[
 [[0,1],'O app precisa de um dado. Primeiro pergunta ao **cache**, que é rápido porque fica na memória.'],
 [[1,0],'**Hit**: o cache tinha. Responde em milissegundos e o banco nem fica sabendo.'],
 [[1,2],'**Miss**: o cache não tinha. O app vai ao **banco**, que é mais lento.'],
 [[2,0],'O banco devolve o dado e o app usa.'],
 [[0,1],'O app **guarda no cache** (com prazo de validade) para as próximas vezes serem rápidas.'],
 [[1],'Problema clássico: se o dado mudar no banco e o cache ainda tiver o antigo, o app mostra informação velha. Por isso se define validade, ou se limpa o cache ao alterar.']]};

FLOW.oauth={n:['Você','Seu app','Google (login)','API do Google'],s:[
 [[0,1],'No app você toca em "Entrar com Google". O app **não vai ver a sua senha**.'],
 [[1,2],'O app te manda para a página do Google, avisando o que quer saber (nome, e-mail).'],
 [[0,2],'Você faz login **no Google** e aprova o que o app pediu.'],
 [[2,1],'O Google devolve ao app um **código** temporário.'],
 [[1,2],'O app troca o código por um **token de acesso**, numa conversa direta com o Google.'],
 [[1,3],'Com o token, o app pede ao Google só aquilo que você autorizou. Você pode **revogar** depois. É dar uma chave de visitante em vez da chave mestra.']]};

FLOW.cors={n:['Site A (navegador)','Servidor do site B'],s:[
 [[0],'Você está no `site-a.com`. O JavaScript dele tenta buscar dados em `api.site-b.com`. Para o navegador, isso é outra "origem".'],
 [[0,1],'Antes do pedido real, o navegador faz uma pergunta prévia (**preflight**): "o site A pode pedir isso aí?".'],
 [[1,0],'O servidor B responde com cabeçalhos como `Access-Control-Allow-Origin`, dizendo quem pode.'],
 [[0],'Se o site A está na lista, o navegador libera o pedido real. Se não, **bloqueia** e mostra aquele erro vermelho de CORS no console.'],
 [[1],'O bloqueio é do **navegador**, para proteger o usuário. A correção é feita no **servidor B**, liberando a origem certa.']]};

FLOW.mvc={n:['Navegador','Controller','Model','View'],s:[
 [[0,1],'O navegador pede `/maquinas/7`. Quem recebe é o **Controller** (o recepcionista).'],
 [[1,2],'O Controller pede ao **Model** (dados e regras de negócio): "me dá a máquina 7".'],
 [[2,1],'O Model busca no banco e devolve a máquina.'],
 [[1,3],'O Controller entrega os dados à **View**, o molde da tela.'],
 [[3,0],'A View monta o HTML final e a resposta volta ao navegador. Cada parte tem **um trabalho só**, então dá para mexer numa sem quebrar as outras.']]};

FLOW.filas={n:['Produtor','Fila','Consumidor A','Consumidor B'],s:[
 [[0,1],'O produtor (por exemplo, a loja) deixa uma mensagem na fila: "pedido 501 pago". Ele não espera ninguém processar.'],
 [[1],'A fila guarda as mensagens em ordem, mesmo se os consumidores estiverem fora do ar.'],
 [[1,2],'O Consumidor A pega a mensagem 501 e emite a nota fiscal.'],
 [[1,3],'O Consumidor B, em paralelo, pega a 502 e separa o estoque.'],
 [[2,3],'Chegou muito pedido? Basta **ligar mais consumidores**. Um caiu? A mensagem volta para a fila. É a cozinha de restaurante: o garçom não espera o prato, ele pendura a comanda.']]};

FLOW.webhook={n:['Sistema de pagamento','Seu servidor'],s:[
 [[1],'Seu cliente paga pelo PIX. Você precisa saber quando o pagamento **cair**.'],
 [[1],'Jeito ruim (**polling**): perguntar de minuto em minuto "já pagou?". Gasta pedido à toa.'],
 [[0,1],'Jeito bom (**webhook**): você dá ao sistema de pagamento um endereço seu. Quando o pagamento cai, ele **chama você**.'],
 [[1,0],'Seu servidor responde "recebi" e libera o pedido. Lembre de **conferir a assinatura** da chamada, senão qualquer um pode se passar pelo banco.']]};

FLOW.websocket={n:['Navegador','Servidor'],s:[
 [[0,1],'No HTTP comum o navegador pergunta e o servidor responde, só isso. Para saber de novidade ele teria que perguntar toda hora.'],
 [[0,1],'No **WebSocket** começa um pedido HTTP normal: "podemos virar uma conexão contínua?".'],
 [[1,0],'O servidor aceita. A conexão **fica aberta**.'],
 [[0,1],'Agora os dois lados mandam mensagens quando quiserem. Ideal para chat, painéis em tempo real e jogos.'],
 [[1,0],'O servidor "empurra" a novidade assim que ela acontece (por exemplo, o alarme da máquina 7). É um **interfone aberto**, e não ligar toda hora para perguntar.']]};

FLOW.compilacao={n:['Código-fonte','Compilador ou interpretador','Programa','CPU'],s:[
 [[0],'Você escreve código que humanos conseguem ler.'],
 [[0,1],'**Compilado** (C, Go, Rust): um tradutor converte tudo de uma vez num executável.'],
 [[1,2],'O executável já está em linguagem de máquina. Rodar é só carregar: rápido, mas precisa ser recompilado para cada tipo de máquina.'],
 [[0,1],'**Interpretado** (Python, JavaScript): um programa lê o código e executa na hora, linha por linha.'],
 [[1,3],'Mais flexível e prático para testar (muda e roda), um pouco mais lento na execução. Muitas linguagens misturam as duas ideias.']]};

FLOW.eventloop={n:['Pilha de chamadas','APIs do navegador','Fila de tarefas','Event loop'],s:[
 [[0],'O JavaScript faz **uma coisa por vez**. A pilha de chamadas é onde fica o código que está rodando agora.'],
 [[0,1],'Chegou um `setTimeout` ou um `fetch`? A pilha entrega o serviço às **APIs do navegador**, que cuidam da espera em outro lugar.'],
 [[0],'Enquanto isso a pilha **continua** e executa o resto do código, sem travar a tela.'],
 [[1,2],'Passou o tempo, ou a resposta chegou: a função combinada vai para a **fila de tarefas**.'],
 [[3,0],'O **event loop** só tira da fila quando a pilha está vazia, e coloca a função para rodar. É o torneiro que só pega a próxima ordem de serviço quando termina a peça atual.']]};

FLOW.recursao={n:['fatorial(3)','fatorial(2)','fatorial(1)'],s:[
 [[0],'Queremos `fatorial(3)`, que é 3 × 2 × 1. A função diz: "3 vezes **fatorial(2)**". Mas ainda não sabe o fatorial(2), então espera.'],
 [[0,1],'Chama `fatorial(2)`: "2 vezes **fatorial(1)**". Também espera.'],
 [[1,2],'Chama `fatorial(1)`. Aqui está o **caso base**: devolve 1 sem chamar ninguém. Sem ele a recursão nunca pararia.'],
 [[1,2],'O 1 volta: fatorial(2) = 2 × 1 = **2**.'],
 [[0,1],'O 2 volta: fatorial(3) = 3 × 2 = **6**.'],
 [[0],'Pronto: 6. A função chamou a si mesma, cada vez com um problema menor, até chegar no mais simples.']]};

FLOW.tdd={n:['Vermelho: teste falha','Verde: faz passar','Refatorar: arruma'],s:[
 [[0],'**Vermelho**: escreva primeiro um teste do que o código deveria fazer. Ele falha, porque o código ainda não existe.'],
 [[1],'**Verde**: escreva o mínimo de código para o teste passar. Nada de capricho ainda.'],
 [[2],'**Refatorar**: agora que há teste protegendo, arrume e simplifique. Se quebrar algo, o teste avisa.'],
 [[0],'Repita com o próximo pedacinho. Ciclos curtos, de minutos.']]};

FLOW.scrum={n:['Backlog','Planejamento','Sprint (1 a 4 semanas)','Review','Retrospectiva'],s:[
 [[0],'O **Product Owner** mantém o backlog: a lista priorizada de tudo que o produto precisa.'],
 [[0,1],'No **planejamento** o time escolhe o que cabe na próxima sprint.'],
 [[2],'Na **sprint** o time trabalha, com uma reunião diária curta (a daily) de uns 15 minutos.'],
 [[3],'No fim, a **review** mostra o que ficou pronto para quem interessa opinar.'],
 [[4],'A **retrospectiva** olha para dentro: o que melhorar no jeito de trabalhar. Depois volta ao início com a próxima sprint.']]};

FLOW.cdn={n:['Usuário (Recife)','CDN (borda em São Paulo)','Servidor de origem (EUA)'],s:[
 [[0,1],'O usuário pede uma imagem do site. Em vez de ir até os EUA, o pedido cai no servidor da CDN mais **próximo**.'],
 [[1,2],'Na primeira vez a CDN ainda não tem a imagem: busca na **origem** e guarda uma cópia.'],
 [[2,1],'A origem entrega a imagem.'],
 [[1,0],'A CDN entrega ao usuário.'],
 [[0,1],'Quem pedir depois, naquela região, recebe direto da cópia local: mais rápido, e a origem quase não sofre. É como ter um **almoxarifado em cada filial**.']]};

FLOW.lb={n:['Usuários','Balanceador','Servidor 1','Servidor 2','Servidor 3'],s:[
 [[0,1],'Todos os acessos chegam a um endereço só: o **balanceador de carga**.'],
 [[1,2],'Ele distribui: o primeiro pedido vai para o servidor 1...'],
 [[1,3],'...o segundo para o servidor 2...'],
 [[1,4],'...o terceiro para o servidor 3, e recomeça (**round robin**). Há outras regras, como mandar para o menos ocupado.'],
 [[1,2,4],'O balanceador testa a saúde dos servidores. Se o 2 cair, ele **para de mandar** pedidos para ele, e ninguém percebe.'],
 [[1],'Crescendo o acesso, é só colocar mais servidores atrás do balanceador. É o chefe de fila do guichê.']]};

FLOW.spa={n:['Você','Navegador','Servidor'],s:[
 [[0,1],'**Site tradicional (várias páginas)**: você clica num link.'],
 [[1,2],'O navegador pede a página inteira nova ao servidor.'],
 [[2,1],'O servidor devolve o HTML completo e o navegador **joga fora a tela antiga** e desenha tudo de novo (a tela pisca).'],
 [[1,2],'**SPA (aplicação de página única)**: na primeira visita o navegador baixa o "esqueleto" e o JavaScript do app.'],
 [[0,1],'Ao clicar num link, o JavaScript **não recarrega a página**. Troca só o miolo da tela.'],
 [[1,2],'Se precisa de dados novos, pede só os **dados** (JSON) ao servidor, bem menores que uma página inteira.'],
 [[1],'Resultado: sensação de aplicativo, sem piscar. Custo: primeira carga maior e cuidado extra com os buscadores (SEO).']]};

FLOW.ssr={n:['Navegador','Servidor','Banco'],s:[
 [[0,1],'**CSR (renderiza no navegador)**: o servidor manda uma página quase vazia mais o JavaScript.'],
 [[0],'O navegador baixa o JS, executa, pede os dados à API e **só então** monta a tela. Até lá, tela em branco.'],
 [[0,1],'**SSR (renderiza no servidor)**: o navegador pede a página.'],
 [[1,2],'O servidor busca os dados no banco e já **monta o HTML pronto**.'],
 [[1,0],'O navegador recebe a página completa: aparece rápido e os buscadores leem o conteúdo com facilidade.'],
 [[0],'Depois o JavaScript "assume" a página e a deixa interativa (isso se chama **hidratação**). Next.js e Nuxt fazem assim.']]};
