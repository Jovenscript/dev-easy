/* ===== demos de segurança em página (iframe) e passo a passo ===== */
/* FN: o script da página de demonstração é uma função de verdade (o editor confere a sintaxe) e vai para dentro do iframe como texto */
function FN(fn,args){return SC('('+fn.toString()+').apply(null,'+JSON.stringify(args||[])+')')}

var SECCSS=L(
'*{box-sizing:border-box}',
'body{margin:0;padding:12px;font-family:system-ui,Segoe UI,Roboto,sans-serif;background:#f2f5f8;color:#1b2630;font-size:14px;line-height:1.4}',
'.row{display:flex;flex-wrap:wrap;gap:8px;align-items:flex-end}',
'label{display:grid;gap:3px;font-size:12px;color:#4a5a69}',
'input{padding:9px;border:1px solid #9fb0c0;border-radius:6px;font-size:15px;min-width:0;width:150px;max-width:100%;background:#fff;color:#1b2630}',
'textarea{padding:9px;border:1px solid #9fb0c0;border-radius:6px;font:13px/1.4 ui-monospace,Menlo,Consolas,monospace;width:100%;resize:vertical;background:#fff;color:#1b2630}',
'button{border:0;border-radius:6px;padding:10px 14px;font:700 14px system-ui,sans-serif;cursor:pointer;background:#0b5cc4;color:#fff}',
'.chips{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0}',
'.chips button{background:#fff;color:#1b2630;border:1px solid #9fb0c0;font:13px system-ui,sans-serif;padding:7px 10px}',
'.lb{margin:10px 0 4px;font-size:12px;color:#4a5a69}',
'pre{margin:0;background:#0f1b26;color:#dde8f2;padding:10px;border-radius:6px;font:12.5px/1.55 ui-monospace,Menlo,Consolas,monospace;white-space:pre-wrap;word-break:break-word}',
'.inp{background:#e0a100;color:#1a1200;border-radius:2px;padding:0 1px}',
'.ign{opacity:.45;text-decoration:line-through}',
'.res{margin:10px 0 0;padding:10px;border-radius:6px;font-size:14px}',
'.res.ok{background:#d4f1de;color:#0d4a23}.res.bad{background:#fbe0dd;color:#7a1710}.res.no{background:#e3e9ee;color:#1b2630}',
'small{color:#5a6a79}',
'.topo{display:flex;flex-wrap:wrap;justify-content:space-between;gap:4px 10px;padding:9px 11px;background:#12263f;color:#fff;border-radius:6px 6px 0 0}',
'.topo span{font:12px ui-monospace,Menlo,Consolas,monospace;color:#bcd8ff}',
'.aviso{margin:8px 0;padding:10px;background:#fbe0dd;color:#7a1710;border-radius:6px;font-weight:600}',
'.com{background:#fff;border:1px solid #d3dce5;border-left:4px solid #1f6fdb;border-radius:6px;padding:8px 10px;margin:6px 0;word-break:break-word}',
'[hidden]{display:none!important}');

/* ---- SQL injection: só simulação, com um avaliador de brinquedo ---- */
function sqliPagina(modo){
  var USUARIOS=[{nome:'ana',senha:'1234'},{nome:'bruno',senha:'abc9'}];
  var $=function(id){return document.getElementById(id)};
  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
  var EXEMPLOS=[['Normal','ana','1234'],['Senha errada','ana','9999'],['Aspa solta',"an'a",'x'],['Comentário --',"ana' --",'x'],['OR sempre verdadeiro',"x' OR '1'='1' --",'x']];
  /* mini leitor: só entende  coluna = 'texto'  com AND, OR e comentário -- */
  function ler(t){
    var tk=[],i=0,ate=-1,m;
    while(i<t.length){
      var c=t.charAt(i);
      if(c===' '){i++;continue}
      if(c==='-'&&t.charAt(i+1)==='-'){ate=i;break}
      if(c==="'"){
        var j=i+1,s='',fechou=false;
        while(j<t.length){
          if(t.charAt(j)==="'"){
            if(t.charAt(j+1)==="'"){s+="'";j+=2;continue}
            fechou=true;break;
          }
          s+=t.charAt(j);j++;
        }
        if(!fechou)return {erro:true};
        tk.push({k:'s',v:s});i=j+1;continue;
      }
      if(c==='='){tk.push({k:'=',v:c});i++;continue}
      m=/^[A-Za-z_][A-Za-z0-9_]*/.exec(t.slice(i));
      if(m){var u=m[0].toUpperCase();tk.push(u==='AND'||u==='OR'?{k:u,v:u}:{k:'id',v:m[0]});i+=m[0].length;continue}
      m=/^[0-9]+/.exec(t.slice(i));
      if(m){tk.push({k:'s',v:m[0]});i+=m[0].length;continue}
      return {erro:true};
    }
    return {tk:tk,ate:ate};
  }
  function avaliar(t){
    var r=ler(t);
    if(r.erro)return {erro:true};
    var tk=r.tk,p=0;
    function val(){
      var x=tk[p];
      if(!x)throw 0;
      if(x.k==='s'){p++;return function(){return x.v}}
      if(x.k==='id'&&(x.v==='nome'||x.v==='senha')){p++;return function(l){return l[x.v]}}
      throw 0;
    }
    function cmp(){
      var a=val();
      if(!tk[p]||tk[p].k!=='=')throw 0;
      p++;
      var b=val();
      return function(l){return a(l)===b(l)};
    }
    function seq(k,filho){
      return function(){
        var a=filho();
        while(tk[p]&&tk[p].k===k){
          p++;
          var b=filho();
          a=(function(x,y){return k==='AND'?function(l){return x(l)&&y(l)}:function(l){return x(l)||y(l)}})(a,b);
        }
        return a;
      };
    }
    try{
      var f=seq('OR',seq('AND',cmp))();
      if(p<tk.length)throw 0;
      return {linhas:USUARIOS.filter(f),ate:r.ate};
    }catch(e){return {erro:true}}
  }
  function pinta(sql,faixas,ate){
    var out='',cur='',buf='',i,c;
    function solta(){if(buf){var e=esc(buf);out+=cur?'<span class="'+cur+'">'+e+'</span>':e}buf=''}
    for(i=0;i<sql.length;i++){
      c=(ate>=0&&i>=ate)?'ign':'';
      if(!c)faixas.forEach(function(f){if(i>=f[0]&&i<f[1])c='inp'});
      if(c!==cur){solta();cur=c}
      buf+=sql.charAt(i);
    }
    solta();
    return out;
  }
  function veredito(linhas,nome,senha){
    if(!linhas.length)return ['no','<b>Login recusado.</b> Nenhuma linha combinou com a consulta.'];
    var u=linhas[0];
    if(u.nome===nome&&u.senha===senha)return ['ok','<b>Entrou como '+esc(u.nome)+'.</b> Usuário e senha corretos.'];
    return ['bad','<b>ENTROU como '+esc(u.nome)+' sem saber a senha.</b> A consulta devolveu '+linhas.length+(linhas.length>1?' linhas':' linha')+', e o programa só olha se veio alguma. O texto digitado virou parte do comando.'];
  }
  function rodar(){
    var nome=$('u').value,senha=$('p').value,v;
    if(modo==='v'){
      var base='SELECT * FROM usuarios WHERE ',ini1="nome = '",meio="' AND senha = '";
      var onde=ini1+nome+meio+senha+"'",sql=base+onde;
      var a=base.length+ini1.length,b=a+nome.length,c=b+meio.length,d=c+senha.length;
      var av=avaliar(onde);
      $('q').innerHTML=pinta(sql,[[a,b],[c,d]],(!av.erro&&av.ate>=0)?base.length+av.ate:-1);
      v=av.erro?['bad','<b>Erro de sintaxe.</b> O banco não entendeu a consulta, porque o texto digitado mudou a estrutura do SQL. Se um sistema real mostra erro ao digitar uma aspa, é sinal de que ele cola o texto dentro do SQL.']:veredito(av.linhas,nome,senha);
    }else{
      $('q').textContent='SELECT * FROM usuarios\nWHERE nome = ? AND senha = ?';
      $('par').innerHTML='Valores enviados <b>à parte</b>, só como dados:<br>1º ? = <span class="inp">'+esc(nome)+'</span><br>2º ? = <span class="inp">'+esc(senha)+'</span>';
      var linhas=USUARIOS.filter(function(l){return l.nome===nome&&l.senha===senha});
      v=linhas.length?['ok','<b>Entrou como '+esc(nome)+'.</b> Usuário e senha corretos.']:['no','<b>Login recusado.</b> O banco procurou alguém com exatamente este nome e esta senha, letra por letra, e não achou. Aspas, OR e -- são só caracteres comuns.'];
    }
    $('r').className='res '+v[0];$('r').innerHTML=v[1];
  }
  EXEMPLOS.forEach(function(e){
    var b=document.createElement('button');
    b.type='button';b.textContent=e[0];
    b.onclick=function(){$('u').value=e[1];$('p').value=e[2];rodar()};
    $('ex').appendChild(b);
  });
  $('u').oninput=$('p').oninput=rodar;
  $('go').onclick=rodar;
  rodar();
}

function sqliHtml(modo){
  return ST(SECCSS)+
    '<div class="row"><label>Usuário<input id="u" value="ana" autocomplete="off" autocapitalize="off" spellcheck="false"></label>'+
    '<label>Senha<input id="p" value="1234" autocomplete="off" autocapitalize="off" spellcheck="false"></label><button id="go" type="button">Entrar</button></div>'+
    '<p class="lb">Exemplos para testar:</p><div class="chips" id="ex"></div>'+
    '<p class="lb">'+(modo==='v'?'Consulta que o servidor monta (texto colado):':'Consulta que o servidor envia (fixa):')+'</p><pre id="q"></pre>'+
    (modo==='v'?'':'<p class="lb" id="par"></p>')+
    '<p class="res" id="r"></p>'+
    '<p class="lb"><small>Tabela usuarios (de mentira): ana / 1234 · bruno / abc9. Para simplificar, as senhas estão em texto puro. Em sistema real ficam como hash.</small></p>'+
    FN(sqliPagina,[modo]);
}

FR.sqli={h:580,hint:'Tela de login de brinquedo, **tudo simulado aqui dentro**: nada acessa banco de verdade. A parte em **amarelo** é o que o usuário digitou. Teste os mesmos exemplos nas duas abas.',v:[
  ['Código vulnerável',sqliHtml('v')],['Código seguro',sqliHtml('s')]]};

/* ---- XSS: o que o navegador faz com o texto de um visitante ---- */
function xssPagina(modo){
  var $=function(id){return document.getElementById(id)};
  var EXEMPLOS=[['Recado normal','Bom trabalho, equipe!'],['Com negrito (HTML)','Ótimo <b>trabalho</b>, equipe!'],['Com código','<img src=x onerror="aviso.hidden=false;lido.textContent=sessao.textContent">']];
  function publicar(){
    var txt=$('c').value;
    if(!txt)return;
    var d=document.createElement('div');
    d.className='com';
    if(modo==='v')d.innerHTML=txt;else d.textContent=txt;
    $('lista').insertBefore(d,$('lista').firstChild);
    while($('lista').children.length>3)$('lista').removeChild($('lista').lastChild);
  }
  EXEMPLOS.forEach(function(e){
    var b=document.createElement('button');
    b.type='button';b.textContent=e[0];
    b.onclick=function(){$('c').value=e[1]};
    $('ex').appendChild(b);
  });
  $('pub').onclick=publicar;
}

function xssHtml(modo){
  return ST(SECCSS)+
    '<div class="topo"><b>Mural da Oficina</b><span id="sessao">sessão: demo-7f3a (fictícia)</span></div>'+
    '<div class="aviso" id="aviso" hidden>⚠ Um código que veio de dentro de um comentário <u>rodou como se fosse do site</u> e conseguiu ler: <span id="lido"></span></div>'+
    '<label style="margin-top:8px">Seu recado<textarea id="c" rows="3" autocomplete="off" spellcheck="false" placeholder="Escreva ou escolha um exemplo"></textarea></label>'+
    '<div class="chips" id="ex"></div><div class="row"><button id="pub" type="button">Publicar</button></div>'+
    '<p class="lb">Como o site coloca o recado na página:</p>'+
    '<pre>'+(modo==='v'?'div.innerHTML = recado;   // o navegador INTERPRETA como HTML':'div.textContent = recado; // o navegador MOSTRA como texto')+'</pre>'+
    '<p class="lb">Recados publicados:</p><div id="lista"><div class="com">Primeiro recado do mural.</div></div>'+
    FN(xssPagina,[modo]);
}

FR.xss={h:660,hint:'Mural de recados de brinquedo, **simulado aqui dentro**. As duas abas diferem em **uma linha** de código. Escolha **Com código**, publique, e compare. O "código" aqui só lê uma sessão fictícia da própria página.',v:[
  ['Código vulnerável',xssHtml('v')],['Código seguro',xssHtml('s')]]};

/* ---- resposta a incidentes ---- */
FLOW.incidente={n:['Alerta (SIEM ou EDR)','Equipe de resposta','Máquina afetada','Evidências e backup','Gestão e jurídico'],s:[
 [[0],'O **SIEM** avisa: um servidor de arquivos está renomeando milhares de arquivos em poucos minutos. Pode ser **ransomware**.'],
 [[0,1],'**Triagem**: o analista confirma que não é falso alarme, abre o incidente e aciona o plano de resposta, que já estava escrito.'],
 [[1,2],'**Contenção**: isola a máquina da rede (quarentena do EDR ou cabo desconectado) e bloqueia as contas envolvidas. **Não desliga**: a memória guarda pistas.'],
 [[1,3],'**Evidências**: copia logs e imagem do disco e da memória, anota horários e quem mexeu. Confere se o **backup** está fora do alcance do ataque.'],
 [[1,2],'**Erradicação**: descobre a causa (por exemplo, um anexo aberto), remove o malware, fecha a porta de entrada e **troca as senhas** das contas afetadas.'],
 [[3,2],'**Recuperação**: restaura a partir de um backup limpo e testado, volta aos poucos e fica de olho em sinais de reinfecção.'],
 [[4,1],'**Comunicação**: avisa a gestão e o jurídico. Se houve dados pessoais, a LGPD exige comunicar a ANPD e os titulares quando o risco é relevante. A regulamentação define o prazo.'],
 [[1,4],'**Lições aprendidas**: reunião sem caça-culpados. O que falhou, o que funcionou e o que muda. O plano é atualizado e treinado de novo.']]};
