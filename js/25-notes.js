/* ===== anotações, marcadores ("onde parei") e retomada de leitura/áudio ===== */
const NOTES=(function(){
  var rT=0,nT=0,lastTick=0;

  /* ----- onde o leitor está na ficha: {sec: seção, f: fração (0 a 1) dentro dela}. Assim a posição vale em qualquer tela, celular ou PC ----- */
  function headerH(){var t=$('.top');return t?t.getBoundingClientRect().height:0}
  function where(){
    var els=Array.prototype.slice.call(document.querySelectorAll('#view [data-sec]'));if(!els.length)return {sec:'top',f:0};
    var y=window.scrollY||0,probe=y+headerH()+16,cur=null;
    els.forEach(function(el){var top=el.getBoundingClientRect().top+y;if(top<=probe)cur={el:el,top:top}});
    if(!cur)return {sec:'top',f:0};
    var f=Math.max(0,Math.min(1,(probe-cur.top)/(cur.el.offsetHeight||1)));
    return {sec:cur.el.dataset.sec,f:Math.round(f*1000)/1000};
  }
  function restore(pos){
    if(!pos)return;
    function um(){
      if(!pos.sec||pos.sec==='top'){window.scrollTo(0,0);return}
      var el=document.querySelector('#view [data-sec="'+pos.sec+'"]');if(!el)return;
      var y=el.getBoundingClientRect().top+(window.scrollY||0)+(pos.f||0)*(el.offsetHeight||0)-headerH()-16;
      window.scrollTo(0,Math.max(0,y));
    }
    um();setTimeout(um,350);                       /* de novo: as demonstrações carregam e mudam a altura da página */
  }

  /* ----- retomada automática: sempre guarda a última ficha, o ponto da leitura e o segundo do áudio ----- */
  function saveResume(id,sec,f,au,ci){
    var r=STORE.get('resume','cur');
    if(r&&r.id===id&&r.sec===sec&&Math.abs((r.f||0)-(f||0))<0.02&&(r.au||0)===(au||0)&&(r.ci||0)===(ci||0))return;
    var o={id:id,sec:sec||'top',f:f||0};if(au>0)o.au=au;if(ci>0)o.ci=ci;
    STORE.set('resume','cur',o,true);
  }
  function opened(id,pos){
    if(pos&&pos.sec){restore(pos);saveResume(id,pos.sec,pos.f||0)}
    else saveResume(id,'top',0);
  }
  function trackScroll(){
    if(S.view!=='entry'||!S.id)return;
    var w=where(),r=STORE.get('resume','cur'),same=r&&r.id===S.id;
    saveResume(S.id,w.sec,w.f,same?r.au:0,same?r.ci:0);
  }
  function audioStart(id){
    var r=STORE.get('resume','cur');lastTick=0;
    if(!r||r.id!==id)saveResume(id,'top',0);
  }
  function audioTick(id,sec,force,ci){
    var t=Date.now();if(!force&&t-lastTick<5000)return;lastTick=t;
    var r=STORE.get('resume','cur'),cur=(r&&r.id===id)?r:{sec:'top',f:0};
    saveResume(id,cur.sec,cur.f,(sec!=null&&sec>=2)?Math.floor(sec):0,ci>0?ci:0);
  }
  function audioEnd(id){var r=STORE.get('resume','cur');if(r&&r.id===id)saveResume(id,r.sec,r.f,0,0)}

  /* ----- marcadores ----- */
  function markText(m){
    var p=[];if(m.label&&String(m.label).trim())p.push(String(m.label).trim());
    p.push(SECN[m.sec]||'Início da ficha');
    if(m.au>0)p.push('áudio '+mmss(m.au));else if(m.ci>0)p.push('voz, bloco '+(m.ci+1));
    return p.join(' · ');
  }
  function marksOf(id){return STORE.live('mark').filter(function(r){return r.v&&r.v.id===id}).sort(function(a,b){return b.u-a.u})}
  function addMark(id){
    id=id||S.id;if(!byId[id])return null;
    var w=(S.view==='entry'&&S.id===id)?where():{sec:'top',f:0},m={id:id,sec:w.sec,f:w.f};
    if(TTS.on&&TTS.ids[TTS.pos]===id&&!TTS.loading){
      if(TTS.modo==='natural'&&AUD&&AUD.currentTime>=2)m.au=Math.floor(AUD.currentTime);
      else if(TTS.modo==='aparelho'&&TTS.ci>0)m.ci=TTS.ci;
    }
    var key='m'+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
    STORE.set('mark',key,m);
    return key;
  }
  function markRow(r){
    return '<li class="mk"><button class="mk-go" data-act="mk-go" data-id="'+r.k+'"><b>'+esc(markText(r.v))+'</b><small>'+DASH.ago(r.u)+'</small></button>'+
      (vozOk()?'<button class="ib sm" data-act="mk-play" data-id="'+r.k+'" aria-label="Ouvir a partir daqui">'+ICON.play+'</button>':'')+
      '<button class="ib sm" data-act="mk-del" data-id="'+r.k+'" aria-label="Apagar marcador">'+ICON.trash+'</button></li>';
  }
  function marksList(id){
    var ms=marksOf(id);
    return ms.length?'<ul class="mks">'+ms.map(markRow).join('')+'</ul>':'<p class="empty sm">Nenhum marcador nesta ficha ainda. Toque em “Marcar onde parei” enquanto lê ou ouve.</p>';
  }

  /* ----- anotação da ficha ----- */
  function html(id){
    var v=STORE.get('note',id)||'';
    return '<h2 class="eyebrow">Minhas anotações</h2>'+
      '<textarea id="nota" class="nota" rows="6" data-id="'+id+'" placeholder="Escreva aqui o que você entendeu, dúvidas, comandos para lembrar…" aria-label="Minhas anotações sobre '+esc(byId[id].name)+'">\n'+esc(v)+'</textarea>'+
      '<div class="nbar"><span class="nsv" id="nst" aria-live="polite">'+(v?'Salvo ✓':'Nada escrito ainda')+'</span><span class="ntools"><button class="chip sm" data-act="nota-ins" data-t="❓ Dúvida: ">❓ Dúvida</button><button class="chip sm" data-act="nota-ins" data-t="⭐ Lembrar: ">⭐ Lembrar</button><button class="chip sm" data-act="nota-ins" data-t="💡 Exemplo: ">💡 Exemplo</button><button class="lnk" data-act="nota-copy">Copiar</button></span></div>'+
      '<h3 class="sub2">Marcadores desta ficha</h3><div id="mks">'+marksList(id)+'</div>';
  }
  function setSt(t){var s=$('#nst');if(s)s.textContent=t}
  function saveNote(ta){
    clearTimeout(nT);nT=0;
    var id=ta.dataset.id,txt=ta.value,cur=STORE.get('note',id)||'';
    if(txt===cur){setSt(txt?'Salvo ✓':'Nada escrito ainda');return}
    if(!txt.trim())STORE.del('note',id);else STORE.set('note',id,txt);
    setSt(txt.trim()?'Salvo ✓':'Nada escrito ainda');
  }
  function flush(){if(nT){var ta=$('#nota');if(ta)saveNote(ta);else{clearTimeout(nT);nT=0}}}
  function refreshEntry(){
    if(S.view!=='entry'||!S.id)return;
    var ta=$('#nota');
    if(ta&&document.activeElement!==ta&&!nT){var v=STORE.get('note',S.id)||'';if(ta.value!==v)ta.value=v;setSt(v?'Salvo ✓':'Nada escrito ainda')}
    var mk=$('#mks');if(mk)mk.innerHTML=marksList(S.id);
    var d=$('[data-act="done"]');if(d){var on=S.studied.has(S.id);d.setAttribute('aria-pressed',on);d.textContent=on?'Já entendi ✓':'Já entendi'}
    var f=$('[data-act="fav"]');if(f){var fv=S.fav.has(S.id);f.setAttribute('aria-pressed',fv);f.textContent=fv?'★ Favorita':'☆ Favoritar'}
  }
  function search(q){
    var toks=norm(q).split(/\s+/).filter(Boolean),out=[];if(!toks.length)return out;
    STORE.live('note').forEach(function(r){
      if(!byId[r.k])return;var n=norm(r.v);
      if(toks.every(function(t){return n.indexOf(t)>=0}))out.push({id:r.k,snip:snipAround(r.v,toks[0]),u:r.u});
    });
    return out.sort(function(a,b){return b.u-a.u}).slice(0,20);
  }
  function snipAround(text,tok){
    var t=String(text).replace(/\s+/g,' '),i=norm(t).indexOf(tok);if(i<0)i=0;
    var a=Math.max(0,i-50),b=Math.min(t.length,i+110);return (a>0?'…':'')+t.slice(a,b)+(b<t.length?'…':'');
  }

  /* ----- tela Anotações ----- */
  function noteCards(list,q){
    var toks=norm(q||'').split(/\s+/).filter(Boolean);
    var items=list.filter(function(r){var n=norm(byId[r.k].name+' '+r.v);return toks.every(function(t){return n.indexOf(t)>=0})});
    if(!items.length)return '<p class="empty">'+(list.length?'Nenhuma anotação com essas palavras.':'Você ainda não escreveu nada. Abra uma ficha e use a caixa “Minhas anotações”, no fim da página.')+'</p>';
    return items.map(function(r){
      var x=byId[r.k],c=CATMAP[x.cat];
      return '<button class="gl ncard" data-act="open" data-id="'+x.id+'" data-ctx="cat:'+x.cat+'" data-pos="nota" style="--c:'+c.c+';--ci:'+c.ci+'"><span class="nc-h"><span class="plate">'+x.code+'</span><b>'+esc(x.name)+'</b><time>'+DASH.ago(r.u)+'</time></span><span class="nc-t">'+esc(DASH.snip(r.v,260))+'</span></button>';
    }).join('');
  }
  function vNotas(){
    var all=STORE.live('note').filter(function(r){return byId[r.k]}).sort(function(a,b){return b.u-a.u});
    var h='<div class="notes-view"><p class="eyebrow" style="margin-top:6px">Meu espaço</p><h1>Anotações</h1><p class="lead">'+(all.length?all.length+(all.length===1?' ficha com anotação.':' fichas com anotações.'):'Aqui ficam todas as suas anotações, juntas.')+'</p>';
    h+='<div class="acts"><input id="nq" class="in nq" type="search" placeholder="Buscar nas anotações…" aria-label="Buscar nas anotações" autocomplete="off" value="'+esc(S.nq||'')+'">'+
      '<button class="btn ghost sm" data-act="notas-md" '+(all.length?'':'disabled')+'>'+ICON.down+' Baixar (.md)</button><button class="btn ghost sm" data-act="notas-copy" '+(all.length?'':'disabled')+'>Copiar tudo</button></div>';
    return h+'<div id="nlist" class="nlist">'+noteCards(all,S.nq)+'</div></div>';
  }
  function notesMd(){
    var all=STORE.live('note').filter(function(r){return byId[r.k]}),by={};
    all.forEach(function(r){by[r.k]=r});
    var d=new Date(),p=function(n){return n<10?'0'+n:n};
    var out=['# Minhas anotações — DEV EASY','','Exportado em '+p(d.getDate())+'/'+p(d.getMonth()+1)+'/'+d.getFullYear(),''];
    CATS.forEach(function(c){
      var xs=DATA.filter(function(x){return x.cat===c.id&&by[x.id]});if(!xs.length)return;
      out.push('## '+c.name,'');
      xs.forEach(function(x){out.push('### '+x.name+' ('+x.code+')','',by[x.id].v.trim(),'')});
    });
    return out.join('\n');
  }

  /* ----- tela Marcadores ----- */
  function vMarcas(){
    var ms=STORE.live('mark').filter(function(r){return r.v&&byId[r.v.id]}).sort(function(a,b){return b.u-a.u});
    var h='<div class="marks-view"><p class="eyebrow" style="margin-top:6px">Meu espaço</p><h1>Marcadores</h1><p class="lead">Os lugares onde você parou. Toque para voltar exatamente ali; o ▶ toca o áudio daquele ponto.</p>';
    var r=STORE.get('resume','cur'),x=r&&byId[r.id];
    if(x){var c=CATMAP[x.cat];h+='<div class="gl card cont2" style="--c:'+c.c+';--ci:'+c.ci+'"><div class="gh"><div><h2 class="gt">Último ponto (automático)</h2><p class="gsub">O app guarda sozinho onde você estava · '+DASH.ago(STORE.rec('resume','cur').u)+'</p></div></div><button class="cont" data-act="resume-go"><span class="plate">'+x.code+'</span><span><b>'+esc(x.name)+'</b><small>'+esc(markText(r))+'</small></span></button><div class="acts"><button class="btn sm" data-act="resume-go">Continuar lendo</button>'+(vozOk()?'<button class="btn ghost sm" data-act="resume-play">'+ICON.play+' Ouvir daqui</button>':'')+'</div></div>'}
    h+='<h2 class="eyebrow">Marcadores seus ('+ms.length+')</h2>';
    if(!ms.length)return h+'<p class="empty">Nenhum ainda. Em qualquer ficha, toque em “Marcar onde parei”. Dá para ter vários na mesma ficha.</p></div>';
    h+='<ul class="mlist">'+ms.map(function(r){
      var x2=byId[r.v.id],c2=CATMAP[x2.cat],ed=(S.editMark===r.k);
      return '<li class="gl mkc" style="--c:'+c2.c+';--ci:'+c2.ci+'">'+
        (ed?'<div class="mk-ed"><span class="plate">'+x2.code+'</span><input class="in mk-in" data-k="'+r.k+'" maxlength="60" value="'+esc(r.v.label||'')+'" placeholder="Nome do marcador (opcional)" aria-label="Nome do marcador"></div>'
           :'<button class="mk-go" data-act="mk-go" data-id="'+r.k+'"><span class="plate">'+x2.code+'</span><span class="mt"><b>'+esc(x2.name)+'</b><small>'+esc(markText(r.v))+' · '+DASH.ago(r.u)+'</small></span></button>')+
        '<span class="mk-b">'+(vozOk()?'<button class="ib sm" data-act="mk-play" data-id="'+r.k+'" aria-label="Ouvir a partir daqui">'+ICON.play+'</button>':'')+
        '<button class="ib sm" data-act="mk-ren" data-id="'+r.k+'" aria-label="Renomear marcador">'+ICON.pen+'</button><button class="ib sm" data-act="mk-del" data-id="'+r.k+'" aria-label="Apagar marcador">'+ICON.trash+'</button></span></li>';
    }).join('')+'</ul></div>';
    return h;
  }
  function saveEdit(inp){
    var k=inp.dataset.k;
    if(S.editMark!==k)return;                 /* já salvo ou cancelado (Esc): tirar o campo da tela dispara "blur" de novo e não pode salvar outra vez */
    var m=STORE.get('mark',k);S.editMark=null;
    if(m){var lb=inp.value.trim().slice(0,60);if(lb!==(m.label||'')){var n=Object.assign({},m);if(lb)n.label=lb;else delete n.label;STORE.set('mark',k,n)}}
    render();
  }

  /* ----- botões ----- */
  ACTS['mk-add']=function(t,pid){
    var id=pid||S.id,key=addMark(id);if(!key)return;
    var m=STORE.get('mark',key);
    UI.toast('Marcador salvo: '+markText(m),{label:'Desfazer',fn:function(){STORE.del('mark',key);refreshEntry()}});
    refreshEntry();
  };
  ACTS['mk-go']=function(t,key){var m=STORE.get('mark',key);if(m&&byId[m.id])openEntry(m.id,null,{sec:m.sec,f:m.f})};
  ACTS['mk-play']=function(t,key){
    var m=STORE.get('mark',key);if(!m||!byId[m.id])return;
    openEntry(m.id,null,{sec:m.sec,f:m.f});startTTS([m.id],0,false,{au:m.au,ci:m.ci});
  };
  ACTS['mk-del']=function(t,key){
    var m=STORE.get('mark',key);if(!m)return;
    STORE.del('mark',key);
    UI.toast('Marcador apagado',{label:'Desfazer',fn:function(){STORE.set('mark',key,m);refreshEntry();if(S.view==='marcas')render()}});
    if(S.view==='marcas')render();else refreshEntry();
  };
  ACTS['mk-ren']=function(t,key){S.editMark=key;render()};
  ACTS['resume-go']=function(){var r=STORE.get('resume','cur');if(r&&byId[r.id])openEntry(r.id,null,{sec:r.sec,f:r.f})};
  ACTS['resume-play']=function(){var r=STORE.get('resume','cur');if(!r||!byId[r.id])return;openEntry(r.id,null,{sec:r.sec,f:r.f});startTTS([r.id],0,false,{au:r.au,ci:r.ci})};
  ACTS['nota-ir']=function(){
    var el=$('#s-nota');if(!el)return;
    el.scrollIntoView({behavior:UI.reduced()?'auto':'smooth',block:'center'});
    setTimeout(function(){var ta=$('#nota');if(ta)try{ta.focus({preventScroll:true})}catch(e){}},UI.reduced()?0:380);
  };
  ACTS['nota-ins']=function(t){
    var ta=$('#nota');if(!ta)return;
    var s=ta.selectionStart,e2=ta.selectionEnd,v=ta.value,pre=(s>0&&v.charAt(s-1)!=='\n')?'\n':'',txt=pre+t.dataset.t;
    ta.value=v.slice(0,s)+txt+v.slice(e2);var p=s+txt.length;ta.focus();ta.setSelectionRange(p,p);saveNote(ta);
  };
  ACTS['nota-copy']=function(t){
    var ta=$('#nota');if(!ta||!ta.value.trim()){UI.toast('Nada para copiar ainda.');return}
    UI.copy(ta.value,function(ok){UI.toast(ok?'Anotação copiada.':'Não consegui copiar. Selecione o texto e copie.')});
  };
  ACTS['notas-md']=function(){UI.download('dev-easy-anotacoes.md',notesMd(),'text/markdown')};
  ACTS['notas-copy']=function(){UI.copy(notesMd(),function(ok){UI.toast(ok?'Todas as anotações copiadas.':'Não consegui copiar. Use “Baixar (.md)”.')})};

  /* botão flutuante "Marcar aqui": aparece quando a barra do topo da ficha já saiu da tela, para marcar sem precisar voltar ao topo */
  function fabState(){
    var f=$('#fab');if(!f)return;
    var show=false;
    if(S.view==='entry'&&S.id){
      var t=$('#view .tools');
      show=!!t&&t.getBoundingClientRect().bottom<headerH()+8;
      var ae=document.activeElement;if(ae&&(ae.tagName==='TEXTAREA'||ae.tagName==='INPUT'))show=false;
    }
    if(f.hidden===show)f.hidden=!show;
  }
  var fT=0;
  function init(){
    var fb=$('#fab');if(fb)fb.innerHTML=(ICON.mark||'')+'<span>Marcar aqui</span>';
    window.addEventListener('scroll',function(){if(fT)return;fT=requestAnimationFrame(function(){fT=0;fabState()})},{passive:true});
    document.addEventListener('focusin',fabState);
    document.addEventListener('focusout',function(){setTimeout(fabState,0)});
    document.addEventListener('input',function(e){
      var t=e.target;if(!t)return;
      if(t.id==='nota'){setSt('Salvando…');clearTimeout(nT);nT=setTimeout(function(){saveNote(t)},600)}
      else if(t.id==='nq'){S.nq=t.value;var l=$('#nlist');if(l)l.innerHTML=noteCards(STORE.live('note').filter(function(r){return byId[r.k]}).sort(function(a,b){return b.u-a.u}),S.nq)}
    });
    document.addEventListener('focusout',function(e){
      var t=e.target;if(!t)return;
      if(t.id==='nota')saveNote(t);
      else if(t.classList&&t.classList.contains('mk-in'))saveEdit(t);
    });
    document.addEventListener('keydown',function(e){
      var t=e.target;if(!t||!t.classList||!t.classList.contains('mk-in'))return;
      if(e.key==='Enter'){e.preventDefault();saveEdit(t)}else if(e.key==='Escape'){S.editMark=null;render()}
    });
    window.addEventListener('scroll',function(){if(S.view!=='entry')return;clearTimeout(rT);rT=setTimeout(trackScroll,700)},{passive:true});
    window.addEventListener('pagehide',flush);
    document.addEventListener('visibilitychange',function(){if(document.visibilityState==='hidden')flush()});
  }
  function after(){
    if(S.view==='marcas'&&S.editMark){var i=$('.mk-in');if(i){i.focus();i.select()}}
    fabState();
  }
  VIEWS.notas=vNotas;VIEWS.marcas=vMarcas;
  return {init:init,after:after,flush:flush,html:html,opened:opened,audioStart:audioStart,audioTick:audioTick,audioEnd:audioEnd,markText:markText,marksOf:marksOf,addMark:addMark,
    refreshEntry:refreshEntry,search:search,where:where,restore:restore,notesMd:notesMd};
})();
