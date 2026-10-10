/* ===== ENIAC · 4 · os 6 tipos de exercício =====
   Todo tipo é um objeto  {nome, rotulo, criar(ex, io)}.  criar() devolve:
     el         elemento que a lição coloca na tela
     verificar  () => {ok:true/false}  (ou {parcial:true} quando ainda há uma 2ª etapa, como no bug)
     revelar    pinta certo/errado depois da resposta
     certa      HTML com a resposta certa (mostrado no feedback quando a pessoa erra)
     tecla      (opcional) atalho de teclado: números 1, 2, 3... escolhem opções
   io.pronto(true/false) liga e desliga o botão Verificar; io.focoAcao() leva o foco para ele.
   Sem arrastar e soltar: só toque, clique e teclado. Alvos de toque de 44 px ou mais (veja css/jogo.css). */
ENIAC.tipos=(function(){
  var fmt=ENIAC.fmt,realce=ENIAC.realce,ic=ENIAC.ic;
  function $1(s,r){return (r||document).querySelector(s)}
  function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
  function foca(el,rolar){if(el){try{el.focus({preventScroll:!rolar})}catch(e){}}}

  /* o texto de cada opção quase sempre é o que o programa mostra (ou uma linha de código): fonte de código. Pergunta de ideia (frase): fonte normal. */
  function opcoesCodigo(ex){
    if(ex.codigo)return true;
    return ex.opcoes.every(function(o){return o.length<=44&&(/[()\[\]{}=<>"'\\]/.test(o)||/^[\w.\-+*\/%]+$/.test(o))});
  }
  /* como: 'codigo' (linha de código com realce), 'cru' (saída do programa: texto exato) ou 'texto' (frase, com `código` e **negrito**) */
  function listaOpcoes(itens,nome,rotulo,modo,como){
    function txt(t){return como==='codigo'?realce(t).join('\n'):(como==='texto'?fmt(t):esc(t))}
    return '<div class="jg-ops'+(modo?' '+modo:'')+'" role="radiogroup" aria-label="'+esc(rotulo)+'">'+itens.map(function(o,i){
      return '<label class="jg-op"><input class="jg-sr" type="radio" name="'+nome+'" value="'+i+'"><span class="jg-tecla" aria-hidden="true">'+(i+1)+'</span>'+
        '<span class="jg-ot">'+txt(o.t)+'</span><span class="jg-res"></span></label>';
    }).join('')+'</div>';
  }
  /* liga as opções de um grupo (quiz e correção do bug) */
  function grupo(raiz,itens,io,rotuloCerta,rotuloErrada){
    var rot=$$('.jg-op',raiz),rad=$$('input',raiz),travado=false;
    rad.forEach(function(r,i){
      r.addEventListener('change',function(){rot.forEach(function(l,j){l.classList.toggle('sel',j===i)});io.pronto(true)});
    });
    return {
      escolhido:function(){return rad.findIndex(function(r){return r.checked})},
      tecla:function(n){
        if(travado||n<1||n>rad.length)return false;
        rad[n-1].checked=true;rad[n-1].dispatchEvent(new Event('change',{bubbles:true}));foca(rad[n-1],true);return true;
      },
      revelar:function(){
        travado=true;var i=this.escolhido();
        rad.forEach(function(r){r.disabled=true});
        rot.forEach(function(l,j){
          l.classList.add('travada');
          var res=$1('.jg-res',l);
          if(itens[j].certa){l.classList.add('certa');res.innerHTML=ic('check')+'<span class="jg-srt">'+rotuloCerta+'</span>'}
          else if(j===i){l.classList.add('errada');res.innerHTML=ic('x')+'<span class="jg-srt">'+rotuloErrada+'</span>'}
        });
      }
    };
  }
  function itensOpcoes(lista){return ENIAC.embaralhar(lista.map(function(t,i){return {t:t,certa:i===0}}))}   /* a PRIMEIRA opção escrita no conteúdo é a certa */
  function nada(el,sel){return $1(sel,el)}

  var T={};

  /* ---------- 1. Quiz: múltipla escolha ---------- */
  T.quiz={nome:ENIAC.TIPOS.quiz,rotulo:'Verificar',criar:function(ex,io){
    var itens=itensOpcoes(ex.opcoes),el=document.createElement('div');
    el.className='jg-jogo';
    el.innerHTML=(ex.codigo?ENIAC.blocoCodigo(ex.codigo,'Código do exercício'):'')+listaOpcoes(itens,'jg-q','Opções de resposta',opcoesCodigo(ex)?'mono':'',ex.codigo?'cru':'texto');
    var g=grupo(el,itens,io,'resposta certa','sua resposta, errada');
    return {
      el:el,tecla:g.tecla,
      verificar:function(){var i=g.escolhido();return {ok:i>=0&&itens[i].certa}},
      revelar:function(){g.revelar()},
      certa:function(){
        var c=itens.filter(function(o){return o.certa})[0];
        return ex.codigo?ENIAC.blocoSaida(c.t,false,'Resposta certa'):'<span class="jg-rot">Resposta certa</span><p class="jg-prosa">'+fmt(c.t)+'</p>';
      }
    };
  }};

  /* ---------- 2. Digite a saída: a pessoa escreve o que o programa mostra ----------
     Compara sem espaços nas pontas e com aspas curvas trocadas por retas (o teclado do celular troca sozinho). */
  function normDigite(t){
    return String(t==null?'':t).replace(/[\u2018\u2019\u201A\u201B\u2032]/g,"'").replace(/[\u201C\u201D\u201E\u201F\u2033]/g,'"').replace(/\u00A0/g,' ').trim();
  }
  T.digite={nome:ENIAC.TIPOS.digite,rotulo:'Verificar',normalizar:normDigite,criar:function(ex,io){
    var ok=[ex.resposta].concat(ex.aceitas||[]).map(normDigite),el=document.createElement('div');
    el.className='jg-jogo';
    el.innerHTML=ENIAC.blocoCodigo(ex.codigo,'Código do exercício')+
      '<div class="jg-campo"><label class="jg-lab" for="jg-dig">Sua resposta: o que aparece na tela</label>'+
      '<input id="jg-dig" class="jg-in" type="text" inputmode="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="done" maxlength="160"'+(ex.dica?' aria-describedby="jg-dica"':'')+'>'+
      (ex.dica?'<p class="jg-dica" id="jg-dica">Dica: '+fmt(ex.dica)+'</p>':'')+'</div>';
    var inp=$1('input',el);
    inp.addEventListener('input',function(){io.pronto(inp.value.trim()!=='')});
    return {
      el:el,foco:function(){foca(inp,true)},
      verificar:function(){return {ok:ok.indexOf(normDigite(inp.value))>=0}},
      revelar:function(r){inp.readOnly=true;inp.classList.add(r&&r.ok?'certa':'errada');if(!(r&&r.ok))inp.setAttribute('aria-invalid','true')},
      certa:function(){return ENIAC.blocoSaida(ex.resposta,false,'Resposta certa')}
    };
  }};

  /* ---------- 3. Caça ao bug ----------
     Etapa 1: tocar na linha onde o Python aponta o erro. Etapa 2 (só se acertou a linha): escolher a linha corrigida.
     Errou qualquer etapa = conta como erro e o exercício volta no fim da lição. */
  T.bug={nome:ENIAC.TIPOS.bug,rotulo:'Verificar',criar:function(ex,io){
    var alvo=ex.linhaErrada-1,opcoes=itensOpcoes(ex.opcoes),etapa=1,g2=null,el=document.createElement('div');
    el.className='jg-jogo';
    el.innerHTML='<p class="jg-instr" id="jg-bug-i">Toque na linha onde o Python vai apontar o erro.</p>'+
      '<div class="jg-cod jg-cod-bug" role="radiogroup" aria-labelledby="jg-bug-i">'+ex.linhas.map(function(l,i){
        return '<label class="jg-l tocavel"><input class="jg-sr" type="radio" name="jg-linha" value="'+i+'" aria-label="Linha '+(i+1)+': '+esc(l===''?'em branco':l)+'">'+
          '<span class="jg-n" aria-hidden="true">'+(i+1)+'</span><code>'+(realce(l)[0]||' ')+'</code></label>';
      }).join('')+'</div><div class="jg-etapa2" hidden></div>';
    var linhas=$$('.jg-cod-bug .jg-l',el),radL=$$('.jg-cod-bug input',el),fix=$1('.jg-etapa2',el);
    function linhaEscolhida(){return radL.findIndex(function(r){return r.checked})}
    function marcar(i,cls,texto,boa){
      linhas[i].classList.add(cls);
      var m=document.createElement('span');m.className='jg-marca'+(boa?' boa':'');m.textContent=texto;linhas[i].appendChild(m);
    }
    function travarLinhas(){radL.forEach(function(r){r.disabled=true})}
    radL.forEach(function(r,i){r.addEventListener('change',function(){linhas.forEach(function(l,j){l.classList.toggle('sel',j===i)});io.pronto(true)})});
    function montarEtapa2(){
      fix.hidden=false;
      fix.innerHTML='<p class="jg-pergunta" id="jg-bug-p2" tabindex="-1">Isso! O erro está na linha '+(alvo+1)+'. Como ela deve ficar?</p>'+listaOpcoes(opcoes,'jg-corr','Correções possíveis','mono cod','codigo');
      g2=grupo(fix,opcoes,io,'correção certa','sua escolha, errada');
      var p=$1('#jg-bug-p2',fix);
      if(p){try{p.scrollIntoView({block:'nearest'})}catch(e){}foca(p,false)}
    }
    return {
      el:el,
      tecla:function(n){
        if(etapa===2)return g2?g2.tecla(n):false;
        if(n<1||n>radL.length||radL[n-1].disabled)return false;
        radL[n-1].checked=true;radL[n-1].dispatchEvent(new Event('change',{bubbles:true}));foca(radL[n-1],true);return true;
      },
      verificar:function(){
        if(etapa===1){
          if(linhaEscolhida()!==alvo)return {ok:false};
          etapa=2;travarLinhas();marcar(alvo,'bug','erro aqui',false);montarEtapa2();io.pronto(false);
          return {parcial:true};
        }
        var k=g2.escolhido();return {ok:k>=0&&opcoes[k].certa};
      },
      revelar:function(){
        if(etapa===1){                 /* errou a linha: mostra a escolhida e a verdadeira */
          var i=linhaEscolhida();travarLinhas();
          if(i>=0&&i!==alvo)marcar(i,'bug-errou','não é aqui',false);
          marcar(alvo,'bug-certo','o erro está aqui',true);
          return;
        }
        g2.revelar();
      },
      certa:function(){var c=ex.linhas.slice();c[alvo]=ex.opcoes[0];return ENIAC.blocoCodigo(c.join('\n'),'Código corrigido')}
    };
  }};

  /* ---------- 4. Monte o código ----------
     Toque numa linha do banco: ela vai para a primeira posição vazia. Para escolher a posição, toque antes numa posição vazia.
     Toque numa linha já colocada para devolvê-la ao banco. O recuo (espaços no começo) faz parte da linha. */
  T.monte={nome:ENIAC.TIPOS.monte,rotulo:'Verificar',criar:function(ex,io){
    var n=ex.linhas.length;
    var itens=ENIAC.embaralhar(ex.linhas.map(function(t,i){return {id:i,t:t}}),function(r){return r.every(function(x,k){return x.t===ex.linhas[k]})});
    var slots=new Array(n).fill(null),alvo=null,travado=false,resultado=null;
    var el=document.createElement('div');
    el.className='jg-jogo';
    el.innerHTML=(ex.saida?'<div>'+ENIAC.blocoSaida(ex.saida,false,'O programa deve mostrar')+'</div>':'')+
      '<div><span class="jg-rot" id="jg-mt-s">Seu código</span><ol class="jg-slots" aria-labelledby="jg-mt-s"></ol></div>'+
      '<div><span class="jg-rot" id="jg-mt-b">Linhas disponíveis (toque para colocar)</span><div class="jg-banco" role="group" aria-labelledby="jg-mt-b"></div></div>';
    var lista=$1('.jg-slots',el),banco=$1('.jg-banco',el);
    function noBanco(){return itens.filter(function(it){return slots.indexOf(it)<0})}
    /* foco = {slot: i} ou {chip: posição} (-1: não há mais linhas no banco, foca o botão de ação) */
    function desenhar(foco){
      lista.innerHTML=slots.map(function(it,i){
        var est=resultado?(resultado[i]?' certo':' errado'):'';
        var rot='Linha '+(i+1)+': '+(it?it.t.trim()+'. Toque para devolver ao banco.':'vazia. Toque para escolher esta posição.');
        return '<li><button type="button" class="jg-slot'+(it?' cheio':'')+(alvo===i?' alvo':'')+est+'" data-i="'+i+'"'+(it?'':' aria-pressed="'+(alvo===i)+'"')+' aria-label="'+esc(rot)+'"'+(travado?' disabled':'')+'>'+
          '<span class="jg-n" aria-hidden="true">'+(i+1)+'</span><span class="jg-st">'+(it?realce(it.t).join('\n'):(alvo===i?'Agora toque numa linha abaixo':''))+'</span></button></li>';
      }).join('');
      banco.innerHTML=noBanco().map(function(it){
        return '<button type="button" class="jg-chip" data-id="'+it.id+'"'+(travado?' disabled':'')+'>'+realce(it.t).join('\n')+'</button>';
      }).join('');
      io.pronto(!travado&&slots.every(Boolean));
      if(foco){
        if(foco.slot!==undefined)foca($1('.jg-slot[data-i="'+foco.slot+'"]',lista),true);
        else if(foco.chip>=0)foca($$('.jg-chip',banco)[foco.chip],true);
        else if(io.focoAcao)io.focoAcao();
      }
    }
    function colocar(id){
      var antes=noBanco(),posChip=antes.findIndex(function(x){return x.id===id}),it=antes[posChip];
      if(!it)return;
      var pos=(alvo!==null&&!slots[alvo])?alvo:slots.indexOf(null);
      if(pos<0)return;
      slots[pos]=it;alvo=null;
      var restam=noBanco().length;
      desenhar({chip:restam?Math.min(posChip,restam-1):-1});
    }
    function tocarSlot(i){
      if(slots[i]){slots[i]=null;alvo=null}else alvo=(alvo===i)?null:i;
      desenhar({slot:i});
    }
    el.addEventListener('click',function(e){
      if(travado)return;
      var chip=e.target.closest('.jg-chip'),slot=e.target.closest('.jg-slot');
      if(chip)colocar(+chip.dataset.id);else if(slot)tocarSlot(+slot.dataset.i);
    });
    desenhar();
    return {
      el:el,
      verificar:function(){return {ok:slots.every(function(it,k){return it&&it.t===ex.linhas[k]})}},
      revelar:function(){travado=true;resultado=slots.map(function(it,k){return !!it&&it.t===ex.linhas[k]});desenhar()},
      certa:function(){return ENIAC.blocoCodigo(ex.linhas.join('\n'),'Ordem certa')}
    };
  }};

  /* ---------- 5. Complete a lacuna ----------
     O código tem buracos ({1}, {2}...) e embaixo há um banco de palavras. Toque numa palavra: ela vai para o primeiro buraco vazio
     (ou para o buraco que você tocou antes). Toque num buraco preenchido para tirar a palavra. */
  function preencher(codigo,palavras){return palavras.reduce(function(c,p,i){return c.split('{'+(i+1)+'}').join(p)},codigo)}
  T.lacuna={nome:ENIAC.TIPOS.lacuna,rotulo:'Verificar',criar:function(ex,io){
    var nb=ex.respostas.length;
    var palavras=ENIAC.embaralhar(ex.banco.map(function(t,i){return {id:i,t:t}}));
    var preench=new Array(nb).fill(null),alvo=null,travado=false,resultado=null;
    /* cada {n} vira uma marca que o realce de sintaxe não mexe (uma letra entre dois caracteres privados) e depois vira o botão do buraco */
    var marcado=ex.codigo.replace(/\{(\d+)\}/g,function(_,k){return '\uE010'+String.fromCharCode(96+(+k))+'\uE011'});
    var linhasHtml=realce(marcado).map(function(l,i){
      var h=l.replace(/\uE010([a-z])\uE011/g,function(_,c){return '<button type="button" class="jg-buraco" data-n="'+(c.charCodeAt(0)-97)+'"></button>'});
      return '<div class="jg-l"><span class="jg-n" aria-hidden="true">'+(i+1)+'</span><code>'+(h||' ')+'</code></div>';
    }).join('');
    var el=document.createElement('div');
    el.className='jg-jogo';
    el.innerHTML=(ex.saida?'<div>'+ENIAC.blocoSaida(ex.saida,false,'O programa deve mostrar')+'</div>':'')+
      '<div class="jg-cod" role="group" aria-label="Código com lacunas">'+linhasHtml+'</div>'+
      '<div><span class="jg-rot" id="jg-lc-b">Palavras disponíveis (toque para colocar)</span><div class="jg-banco" role="group" aria-labelledby="jg-lc-b"></div></div>';
    var banco=$1('.jg-banco',el);
    function disponiveis(){return palavras.filter(function(p){return preench.indexOf(p)<0})}
    function atualizar(foco){
      $$('.jg-buraco',el).forEach(function(b){
        var k=+b.dataset.n,p=preench[k];
        b.textContent=p?p.t:'___';
        b.className='jg-buraco'+(p?' cheio':'')+(alvo===k?' alvo':'')+(resultado?(resultado[k]?' certo':' errado'):'');
        b.disabled=travado;
        b.setAttribute('aria-label','Lacuna '+(k+1)+': '+(p?p.t+'. Toque para tirar a palavra.':'vazia'));
        if(!p)b.setAttribute('aria-pressed',alvo===k?'true':'false');else b.removeAttribute('aria-pressed');
      });
      var cheio=preench.every(Boolean);
      banco.innerHTML=disponiveis().map(function(p){return '<button type="button" class="jg-chip" data-id="'+p.id+'"'+((cheio||travado)?' disabled':'')+'>'+esc(p.t)+'</button>'}).join('');
      io.pronto(!travado&&cheio);
      if(foco){
        if(foco.buraco!==undefined)foca($1('.jg-buraco[data-n="'+foco.buraco+'"]',el),true);
        else if(foco.chip>=0)foca($$('.jg-chip',banco)[foco.chip],true);
        else if(io.focoAcao)io.focoAcao();
      }
    }
    function colocar(id){
      var antes=disponiveis(),posChip=antes.findIndex(function(x){return x.id===id}),p=antes[posChip];
      if(!p)return;
      var pos=alvo!==null?alvo:preench.indexOf(null);
      if(pos<0)return;
      preench[pos]=p;alvo=null;          /* se o buraco já tinha palavra, ela volta sozinha para o banco */
      var restam=disponiveis().length;
      atualizar({chip:(restam&&preench.indexOf(null)>=0)?Math.min(posChip,restam-1):-1});
    }
    function tocarBuraco(k){
      if(preench[k]){preench[k]=null;alvo=null}else alvo=(alvo===k)?null:k;
      atualizar({buraco:k});
    }
    el.addEventListener('click',function(e){
      if(travado)return;
      var chip=e.target.closest('.jg-chip'),b=e.target.closest('.jg-buraco');
      if(chip)colocar(+chip.dataset.id);else if(b)tocarBuraco(+b.dataset.n);
    });
    atualizar();
    return {
      el:el,
      verificar:function(){return {ok:preench.every(function(p,k){return !!p&&p.t===ex.respostas[k]})}},
      revelar:function(){travado=true;resultado=preench.map(function(p,k){return !!p&&p.t===ex.respostas[k]});atualizar()},
      certa:function(){return ENIAC.blocoCodigo(preencher(ex.codigo,ex.respostas),'Código completo')}
    };
  }};

  /* ---------- 6. Ligue os pares ----------
     Toque num item da esquerda e num da direita. Se combinam, os dois ficam da mesma cor; se não, tremem e você tenta de novo.
     A primeira ligação errada faz o exercício contar como erro (ele volta no fim da lição), mas você pode terminar de ligar. */
  T.pares={nome:ENIAC.TIPOS.pares,rotulo:'Concluir',criar:function(ex,io){
    var n=ex.pares.length;
    var esq=ex.pares.map(function(p,i){return {id:i,t:p[0]}});
    var dir=ENIAC.embaralhar(ex.pares.map(function(p,i){return {id:i,t:p[1]}}),function(r){return r.every(function(x,k){return x.id===k})});
    var casados={},selE=null,selD=null,errE=null,errD=null,errou=false,travado=false,nCasados=0;
    var el=document.createElement('div');
    el.className='jg-jogo';
    el.innerHTML='<p class="jg-instr" id="jg-pr-i">Toque num item de cada coluna para ligar os dois.</p>'+
      '<div class="jg-pares" role="group" aria-labelledby="jg-pr-i"><div class="jg-col" data-lado="e"></div><div class="jg-col" data-lado="d"></div></div>'+
      '<p class="jg-msgpar" role="status"></p>';
    var colE=$1('.jg-col[data-lado="e"]',el),colD=$1('.jg-col[data-lado="d"]',el),msg=$1('.jg-msgpar',el);
    function botao(lado,it){
      var casado=casados[it.id]!==undefined,sel=(lado==='e'?selE:selD)===it.id,erro=(lado==='e'?errE:errD)===it.id,mono=lado==='e'?ex.esqCodigo:ex.dirCodigo;
      return '<button type="button" class="jg-par'+(mono?' mono':'')+(casado?' casado c'+casados[it.id]:'')+(erro?' erro':'')+'" data-id="'+it.id+'"'+(casado?' data-n="'+(casados[it.id]+1)+'"':'')+' aria-pressed="'+sel+'"'+
        (casado?' aria-label="'+esc(it.t)+' (já ligado)"':'')+((casado||travado)?' disabled':'')+'>'+esc(it.t)+'</button>';
    }
    function desenhar(foco){
      colE.innerHTML=esq.map(function(it){return botao('e',it)}).join('');
      colD.innerHTML=dir.map(function(it){return botao('d',it)}).join('');
      io.pronto(!travado&&nCasados===n);
      if(!foco)return;
      var col=foco.lado==='e'?colE:colD,b=$1('.jg-par[data-id="'+foco.id+'"]',col);
      if(!b||b.disabled)b=$1('.jg-par:not(:disabled)',col)||$1('.jg-par:not(:disabled)',el);
      if(b)foca(b,true);else if(io.focoAcao)io.focoAcao();
    }
    function mensagem(t,ruim){msg.textContent=t;msg.className='jg-msgpar'+(ruim?' ruim':'')}
    function tentar(){
      var e=selE,d=selD;selE=selD=null;
      if(e===d){
        casados[e]=nCasados%6;nCasados++;
        mensagem(nCasados===n?'Todos ligados! Toque em Concluir.':'Isso mesmo!',false);
      }else{
        errou=true;errE=e;errD=d;
        mensagem('Esses dois não combinam. Tente de novo.',true);
        setTimeout(function(){
          errE=errD=null;
          if(!el.isConnected||travado)return;
          /* redesenhar troca os botões: guarda onde estava o foco do teclado e devolve depois */
          var a=document.activeElement,estava=a&&a.classList&&a.classList.contains('jg-par')&&el.contains(a);
          desenhar(estava?{lado:a.parentElement.dataset.lado,id:+a.dataset.id}:null);
        },650);
      }
    }
    el.addEventListener('click',function(ev){
      if(travado)return;
      var b=ev.target.closest('.jg-par');
      if(!b||b.disabled)return;
      var lado=b.parentElement.dataset.lado,id=+b.dataset.id;
      if(lado==='e')selE=(selE===id)?null:id;else selD=(selD===id)?null:id;
      if(selE!==null&&selD!==null)tentar();
      desenhar({lado:lado,id:id});
    });
    desenhar();
    return {
      el:el,
      verificar:function(){return {ok:!errou}},
      revelar:function(){travado=true;desenhar()},
      certa:function(){return '<ul class="jg-lpares">'+ex.pares.map(function(p){return '<li><code>'+esc(p[0])+'</code> '+ic('seta','jg-vai')+' <code>'+esc(p[1])+'</code></li>'}).join('')+'</ul>'}
    };
  }};

  return T;
})();
