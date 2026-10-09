/* ===== painel inicial (dashboard): números, gráfico, rosca, atividade, áreas ===== */
const DASH=(function(){
  var uid=0,GEO={W:640,H:240,pl:34,pr:12,pt:14,pb:30};
  function geo(W,H){return {W:W,H:H,pl:34,pr:12,pt:14,pb:30}}
  function altura(w){return w<420?200:w<560?232:288}
  function pad2(n){return (n<10?'0':'')+n}
  function dkey(ts){var d=new Date(ts);return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate()}
  function lastDays(n){var out=[],t=new Date();t.setHours(12,0,0,0);for(var i=n-1;i>=0;i--){var d=new Date(t.getTime());d.setDate(t.getDate()-i);out.push(d)}return out}
  function perDay(list,n){
    var ds=lastDays(n),idx={},v=ds.map(function(){return 0});
    ds.forEach(function(d,i){idx[dkey(d.getTime())]=i});
    list.forEach(function(r){var i=idx[dkey(r.u)];if(i!==undefined)v[i]++});
    return {ds:ds,v:v,sum:v.reduce(function(a,b){return a+b},0)};
  }
  function ago(ts){return ago0(ts).replace(/ /g,'\u00a0')}   /* espaço que não quebra linha: “há 2 h” fica junto */
  function ago0(ts){
    var s=Math.max(0,(Date.now()-ts)/1000),d=new Date(ts),n=new Date();
    if(s<45)return 'agora';
    if(s<3600)return 'há '+Math.round(s/60)+' min';
    if(dkey(ts)===dkey(n.getTime())&&s<86400)return 'há '+Math.max(1,Math.round(s/3600))+' h';
    var y=new Date(n);y.setDate(n.getDate()-1);
    if(dkey(ts)===dkey(y.getTime()))return 'ontem '+pad2(d.getHours())+':'+pad2(d.getMinutes());
    if(s<7*86400)return 'há '+Math.floor(s/86400)+' dias';
    return pad2(d.getDate())+'/'+pad2(d.getMonth()+1)+(d.getFullYear()!==n.getFullYear()?'/'+d.getFullYear():'');
  }
  function liveOk(ns){return STORE.live(ns).filter(function(r){return ns==='mark'?(r.v&&byId[r.v.id]):byId[r.k]})}
  function activityList(){var out=[];['done','fav','note','mark'].forEach(function(ns){liveOk(ns).forEach(function(r){out.push({ns:ns,k:r.k,v:r.v,u:r.u})})});return out}
  function streakInfo(){
    var set={};activityList().forEach(function(r){set[dkey(r.u)]=1});
    var d=new Date();d.setHours(12,0,0,0);
    var hoje=!!set[dkey(d.getTime())],n=0;
    if(!hoje)d.setDate(d.getDate()-1);
    while(set[dkey(d.getTime())]){n++;d.setDate(d.getDate()-1)}
    var keys=Object.keys(set).map(Number).sort(function(a,b){return a-b}),best=0,run=0,prev=null;
    keys.forEach(function(k){var dt=new Date(Math.floor(k/10000),Math.floor(k/100)%100-1,k%100,12);if(prev&&Math.round((dt-prev)/864e5)===1)run++;else run=1;if(run>best)best=run;prev=dt});
    return {n:n,hoje:hoje,best:Math.max(best,n)};
  }

  /* curva suave que não "estoura" entre os pontos (spline monótona) */
  function smooth(p){
    var n=p.length;if(n<2)return n?'M'+p[0][0].toFixed(1)+' '+p[0][1].toFixed(1):'';
    var dx=[],m=[],t=[],i;
    for(i=0;i<n-1;i++){dx[i]=p[i+1][0]-p[i][0];m[i]=(p[i+1][1]-p[i][1])/dx[i]}
    t[0]=m[0];t[n-1]=m[n-2];
    for(i=1;i<n-1;i++)t[i]=(m[i-1]*m[i]<=0)?0:(m[i-1]+m[i])/2;
    for(i=0;i<n-1;i++){
      if(m[i]===0){t[i]=0;t[i+1]=0}
      else{var a=t[i]/m[i],b=t[i+1]/m[i],s=a*a+b*b;if(s>9){var k=3/Math.sqrt(s);t[i]=k*a*m[i];t[i+1]=k*b*m[i]}}
    }
    var d='M'+p[0][0].toFixed(1)+' '+p[0][1].toFixed(1);
    for(i=0;i<n-1;i++){var h=dx[i]/3;d+=' C'+(p[i][0]+h).toFixed(1)+' '+(p[i][1]+t[i]*h).toFixed(1)+' '+(p[i+1][0]-h).toFixed(1)+' '+(p[i+1][1]-t[i+1]*h).toFixed(1)+' '+p[i+1][0].toFixed(1)+' '+p[i+1][1].toFixed(1);}
    return d;
  }
  function spark(vals,col){
    var w=100,h=30,n=vals.length,max=Math.max.apply(null,vals.concat([1])),id='sp'+(++uid);
    var pts=vals.map(function(v,i){return [n>1?i*(w/(n-1)):w/2,h-3-(v/max)*(h-8)]}),line=smooth(pts);
    return '<svg class="spark" viewBox="0 0 '+w+' '+h+'" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="'+id+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+col+'" stop-opacity=".38"/><stop offset="1" stop-color="'+col+'" stop-opacity="0"/></linearGradient></defs><path d="'+line+' L'+w+' '+h+' L0 '+h+' Z" fill="url(#'+id+')"/><path d="'+line+'" fill="none" stroke="'+col+'" stroke-width="1.8" vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }
  function chart(vals,ds,empty,W,H,still){
    W=W||GEO.W;H=H||altura(W);
    var G=geo(W,H),n=vals.length,max=Math.max.apply(null,vals),step=Math.max(1,Math.ceil(Math.max(max,3)/3)),top=step*3,pw=G.W-G.pl-G.pr,ph=G.H-G.pt-G.pb,id='ch'+(++uid);
    function X(i){return G.pl+(n>1?i*pw/(n-1):pw/2)}
    function Y(v){return G.pt+ph-(v/top)*ph}
    var pts=vals.map(function(v,i){return [X(i),Y(v)]}),line=smooth(pts);
    var area=line+' L'+X(n-1).toFixed(1)+' '+(G.pt+ph)+' L'+X(0).toFixed(1)+' '+(G.pt+ph)+' Z',g='',k;
    for(k=0;k<=3;k++){var yy=Y(k*step).toFixed(1);g+='<line class="grid" x1="'+G.pl+'" x2="'+(G.W-G.pr)+'" y1="'+yy+'" y2="'+yy+'"/><text class="ax" x="'+(G.pl-8)+'" y="'+(+yy+3.5).toFixed(1)+'" text-anchor="end">'+(k*step)+'</text>'}
    var every=Math.ceil(n/7),xl='',dots='';
    ds.forEach(function(d,i){if((n-1-i)%every===0)xl+='<text class="ax" x="'+X(i).toFixed(1)+'" y="'+(G.H-8)+'" text-anchor="middle">'+pad2(d.getDate())+'/'+pad2(d.getMonth()+1)+'</text>'});
    vals.forEach(function(v,i){if(v>0)dots+='<circle class="pt" cx="'+X(i).toFixed(1)+'" cy="'+Y(v).toFixed(1)+'" r="3.3"/>'});
    var labels=ds.map(function(d){return pad2(d.getDate())+'/'+pad2(d.getMonth()+1)}).join('|');
    return '<div class="lc'+(empty?' empty':'')+(still?' still':'')+'" data-w="'+W+'" data-h="'+H+'" data-v="'+vals.join(',')+'" data-l="'+labels+'" data-top="'+top+'">'+
      '<svg viewBox="0 0 '+G.W+' '+G.H+'" role="img" aria-label="Fichas entendidas por dia, últimos '+n+' dias"><defs>'+
      '<linearGradient id="'+id+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="s1"/><stop offset="1" class="s2"/></linearGradient>'+
      '<filter id="'+id+'g" x="-10%" y="-30%" width="120%" height="160%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>'+
      g+xl+'<path class="area" d="'+area+'" fill="url(#'+id+')"/><path class="ln" d="'+line+'" pathLength="1" filter="url(#'+id+'g)"/>'+dots+
      '<line class="cx" hidden x1="0" x2="0" y1="'+G.pt+'" y2="'+(G.pt+ph)+'"/><circle class="cd" hidden r="5.5" cx="0" cy="0"/></svg><div class="lc-tip" hidden></div>'+
      (empty?'<p class="lc-empty">Marque fichas como “Já entendi” e a curva começa a subir.</p>':'')+'</div>';
  }
  function hover(c,e){
    var svg=c.querySelector('svg'),r=svg.getBoundingClientRect();if(!r.width)return;
    var G=geo(+c.dataset.w||GEO.W,+c.dataset.h||GEO.H),v=c.dataset.v.split(',').map(Number),l=c.dataset.l.split('|'),n=v.length,top=+c.dataset.top||3,pw=G.W-G.pl-G.pr,ph=G.H-G.pt-G.pb;
    var x=(e.clientX-r.left)/r.width*G.W,i=n>1?Math.round((x-G.pl)/(pw/(n-1))):0;i=Math.max(0,Math.min(n-1,i));
    var X=G.pl+(n>1?i*pw/(n-1):pw/2),Y=G.pt+ph-(v[i]/top)*ph;
    var cx=c.querySelector('.cx'),cd=c.querySelector('.cd'),tip=c.querySelector('.lc-tip');
    cx.setAttribute('x1',X);cx.setAttribute('x2',X);cx.hidden=false;cd.setAttribute('cx',X);cd.setAttribute('cy',Y);cd.hidden=false;
    tip.innerHTML='<b>'+l[i]+'</b> '+v[i]+(v[i]===1?' ficha':' fichas');tip.hidden=false;
    tip.style.left=(X/G.W*100)+'%';tip.style.top=(Y/G.H*100)+'%';
    tip.className='lc-tip'+(X/G.W<.18?' l':X/G.W>.82?' r':'');
  }
  /* largura útil do gráfico: estimativa antes de desenhar; depois de pronto a tela é medida e, se errou muito, ele é redesenhado */
  function estW(){
    var vw=document.documentElement.clientWidth||window.innerWidth||800,main=vw>=960?vw-272:vw;
    var w=Math.min(main,1240)-32;
    if(vw>=1140)w=Math.round((w-16*11)*8/12+16*7);
    return Math.max(260,Math.min(760,w-36));
  }
  function fit(){
    var c=document.querySelector('#view .lc');if(!c)return;
    var w=Math.round(c.clientWidth),cw=+c.dataset.w;if(!w||!cw||Math.abs(w-cw)/cw<.12)return;
    var v=c.dataset.v.split(',').map(Number);
    c.outerHTML=chart(v,lastDays(v.length),c.classList.contains('empty'),w,altura(w),true);
  }
  var rsT=0;window.addEventListener('resize',function(){clearTimeout(rsT);rsT=setTimeout(fit,180)});
  function unhover(c){var cx=c.querySelector('.cx'),cd=c.querySelector('.cd'),tip=c.querySelector('.lc-tip');if(cx)cx.hidden=true;if(cd)cd.hidden=true;if(tip)tip.hidden=true}
  function mix(c){return 'color-mix(in srgb,'+c+' 70%,#fff)'}
  function donut(parts,total,pct){
    var R=54,C=2*Math.PI*R,off=0,segs='';
    parts.forEach(function(p,i){
      var len=p.n/total*C;if(len<=0)return;
      var gap=parts.length>1?Math.min(2.4,len*.45):0,l2=Math.max(.5,len-gap);
      segs+='<circle class="dn-seg" cx="70" cy="70" r="'+R+'" stroke="'+p.c+'" style="stroke:'+mix(p.c)+';--len:'+l2.toFixed(2)+';--rest:'+(C-l2).toFixed(2)+';--off:'+(-off).toFixed(2)+';--d:'+(i*80)+'ms"/>';
      off+=len;
    });
    return '<div class="donut"><svg viewBox="0 0 140 140" role="img" aria-label="'+pct+'% do guia entendido"><g transform="rotate(-90 70 70)"><circle class="dn-track" cx="70" cy="70" r="'+R+'"/>'+segs+'</g></svg><div class="dn-c"><span class="dn-n"><b data-count="'+pct+'">'+pct+'</b><i>%</i></span><small>do guia</small></div></div>';
  }
  function ritmoMini(sd,rng){
    var best=0,bi=-1,dias=0;sd.v.forEach(function(v,i){if(v>0)dias++;if(v>best){best=v;bi=i}});
    var avg=sd.sum/rng,avgT=(Math.round(avg*10)/10).toString().replace('.',',');
    function cell(l,v,sub){return '<div><small>'+l+'</small><b>'+v+'</b><span>'+sub+'</span></div>'}
    return '<div class="rm">'+cell('Total no período',sd.sum,sd.sum===1?'ficha':'fichas')+cell('Melhor dia',best||'–',bi>=0?pad2(sd.ds[bi].getDate())+'/'+pad2(sd.ds[bi].getMonth()+1):'sem registros')+cell('Dias com estudo',dias,'de '+rng+' · média '+avgT+'/dia')+'</div>';
  }
  function statCard(label,val,suffix,sub,sp,col,icon){
    return '<div class="gl stat" style="--sc:'+col+'"><div class="st-top"><span class="eyebrow">'+label+'</span><span class="st-ic" aria-hidden="true">'+icon+'</span></div><div class="st-val"><b data-count="'+val+'">'+val+'</b>'+(suffix?'<small>'+suffix+'</small>':'')+'</div><div class="st-sub">'+sub+'</div>'+sp+'</div>';
  }
  function snip(t,n){t=String(t||'').replace(/\s+/g,' ').trim();return t.length>n?t.slice(0,n-1).trim()+'…':t}
  function hello(){
    var h=new Date().getHours(),g=h<5?'Boa madrugada':h<12?'Bom dia':h<18?'Boa tarde':'Boa noite';
    var nome=(typeof SYNC!=='undefined'&&SYNC.firstName)?SYNC.firstName():'';
    return g+(nome?', '+esc(nome):'');
  }
  function nextSuggestion(){
    var l1=DATA.filter(function(x){return !S.studied.has(x.id)&&x.lvl===1})[0];
    return l1||DATA.filter(function(x){return !S.studied.has(x.id)})[0]||null;
  }
  function posText(r){
    var t=(SECN[r.sec]?'Parou em “'+SECN[r.sec]+'”':'Parou no começo');
    if(r.au>0)t+=' · áudio em '+mmss(r.au);else if(r.ci>0)t+=' · bloco '+(r.ci+1)+' da leitura';
    return t;
  }
  function contCard(){
    var r=STORE.get('resume','cur'),x=r&&byId[r.id];
    if(!x){
      var s=nextSuggestion();
      if(!s)return '<div class="gl card cont2"><h2 class="gt">Tudo entendido</h2><p class="gsub">Você marcou todas as fichas. Revise as favoritas ou escreva anotações.</p></div>';
      var c=CATMAP[s.cat];
      return '<div class="gl card cont2" style="--c:'+c.c+';--ci:'+c.ci+'"><h2 class="gt">Por onde começar</h2><p class="gsub">Ainda não há ponto salvo. Sugestão:</p><button class="cont" data-act="open" data-id="'+s.id+'" data-ctx="cat:'+s.cat+'"><span class="plate">'+s.code+'</span><span><b>'+esc(s.name)+'</b><small>'+esc(s.sub)+'</small></span></button></div>';
    }
    var c2=CATMAP[x.cat],u=STORE.rec('resume','cur').u;
    return '<div class="gl card cont2" style="--c:'+c2.c+';--ci:'+c2.ci+'"><div class="gh"><div><h2 class="gt">Continuar de onde parei</h2><p class="gsub">'+ago(u)+'</p></div></div>'+
      '<button class="cont" data-act="resume-go"><span class="plate">'+x.code+'</span><span><b>'+esc(x.name)+'</b><small>'+esc(posText(r))+'</small></span></button>'+
      '<div class="acts"><button class="btn sm" data-act="resume-go">Continuar lendo</button>'+(vozOk()?'<button class="btn ghost sm" data-act="resume-play">'+ICON.play+' Ouvir daqui</button>':'')+'</div></div>';
  }
  function actCard(){
    var items=activityList().sort(function(a,b){return b.u-a.u}).slice(0,8),h='<div class="gl card"><div class="gh"><div><h2 class="gt">Atividade recente</h2><p class="gsub">O que você fez, em ordem</p></div></div>';
    if(!items.length)return h+'<p class="empty">Quando você marcar fichas, anotar ou marcar onde parou, aparece aqui.</p></div>';
    h+='<ul class="alog">';
    items.forEach(function(r){
      var id=r.ns==='mark'?r.v.id:r.k,x=byId[id],t,cls,extra='',pos='';
      if(r.ns==='done'){t='Entendeu <b>'+esc(x.name)+'</b>';cls='ok'}
      else if(r.ns==='fav'){t='Favoritou <b>'+esc(x.name)+'</b>';cls='am'}
      else if(r.ns==='note'){t='Anotou em <b>'+esc(x.name)+'</b>';cls='bl';extra='<small>'+esc(snip(r.v,90))+'</small>';pos=' data-pos="nota"'}
      else{t='Marcou ponto em <b>'+esc(x.name)+'</b>';cls='or';extra='<small>'+esc(NOTES.markText(r.v))+'</small>'}
      h+='<li><button class="ai" data-act="'+(r.ns==='mark'?'mk-go':'open')+'" data-id="'+(r.ns==='mark'?r.k:id)+'" data-ctx="cat:'+x.cat+'"'+pos+'><i class="d '+cls+'"></i><span class="at"><span>'+t+'</span>'+extra+'</span><time>'+ago(r.u)+'</time></button></li>';
    });
    return h+'</ul></div>';
  }
  function areaTable(areas){
    var h='<div class="gl card"><div class="gh"><div><h2 class="gt">Áreas</h2><p class="gsub">Toque numa área para ver as fichas</p></div></div><ul class="atbl" aria-label="Progresso por área"><li class="trow th" aria-hidden="true"><span>Área</span><span class="c-n">Entendidas</span><span class="c-p">Progresso</span></li>';
    areas.forEach(function(c){
      var ids=catItems(c.id).map(function(x){return x.id}),s=seen(ids),p=ids.length?Math.round(s*100/ids.length):0;
      h+='<li><a class="trow" href="#/area/'+c.id+'" data-act="cat" data-id="'+c.id+'" aria-label="'+esc(c.name)+': '+s+' de '+ids.length+' fichas entendidas ('+p+'%)" style="--c:'+c.c+';--ci:'+c.ci+'"><span class="c-a"><span class="plate">'+c.code+'</span><span class="an"><b>'+nb(esc(c.name))+'</b><small>'+esc(c.desc)+'</small></span></span><span class="c-n"><b>'+s+'</b><i>/'+ids.length+'</i></span><span class="c-p"><span class="pbar"><i style="width:'+p+'%"></i></span><em>'+p+'%</em></span></a></li>';
    });
    return h+'</ul></div>';
  }
  function trailsBlock(){
    if(!TRAILS.length)return '';
    return '<section class="span12"><h2 class="eyebrow">Trilhas para ouvir</h2><div class="trails">'+TRAILS.map(function(t){var ids=trailIds(t);return '<div class="trail gl"><button class="lnk" style="text-align:left;padding:0" data-act="trail" data-id="'+t.id+'"><b>'+esc(t.name)+'</b><br><small>'+esc(t.desc)+'</small></button><span class="meta">'+ids.length+' itens · cerca de '+minutes(ids)+' min</span>'+(TTS.ok||arqOk()?'<button class="btn sm" data-act="radio" data-list="trail:'+t.id+'">'+ICON.play+' Ouvir trilha</button>':'')+'</div>'}).join('')+'</div></section>';
  }
  /* atalho para a página de jogos (pasta jogos/, link comum: não passa pelo roteador do app) */
  function jogosCard(){
    return '<a class="gl card jogos-cta" href="jogos/"><span class="jc-ic" aria-hidden="true">'+ICON.game+'</span><span class="jc-t"><b>Jogos: treine Python jogando</b><small>Lições curtas com quiz, caça ao bug e outros desafios. Funciona sem internet.</small></span><span class="btn sm jc-b" aria-hidden="true">Jogar</span></a>';
  }
  function view(){
    var N=DATA.length,done=S.studied.size,pct=N?Math.round(done*100/N):0,areas=CATS.filter(hasOwn),rng=(STORE.pref().rng===30)?30:14;
    var sd=perDay(liveOk('done'),rng),s14=perDay(liveOk('done'),14),sn=perDay(liveOk('note'),14),sm=perDay(liveOk('mark'),14),sa=perDay(activityList(),14);
    var nn=liveOk('note').length,mm=liveOk('mark').length,ff=S.fav.size,st=streakInfo();
    var h='<div class="dash"><section class="hero span12"><div><p class="eyebrow">Painel de estudo</p><h1>'+hello()+'</h1><p class="lead">'+
      (done||nn||mm?done+' de '+N+' fichas entendidas, em '+areas.length+' áreas.':'Escolha uma ficha, ouça o áudio e marque “Já entendi”. Seu progresso aparece aqui.')+'</p></div></section>';
    h+='<section class="span12">'+jogosCard()+'</section>';
    h+='<section class="stats span12" aria-label="Resumo">'+
      statCard('Entendidas',done,'/'+N,pct+'% do guia',spark(s14.v,'#2DD4BF'),'#2DD4BF',ICON.check)+
      statCard('Sequência',st.n,st.n===1?'dia':'dias',st.n?(st.hoje?'Hoje já valeu · melhor: '+st.best:'Estude hoje para manter · melhor: '+st.best):'Estude hoje para começar',spark(sa.v,'#FB923C'),'#FB923C',ICON.flame)+
      statCard('Anotações',nn,'',ff+(ff===1?' favorita':' favoritas'),spark(sn.v,'#60A5FA'),'#60A5FA',ICON.note)+
      statCard('Marcadores',mm,'',mm?'Toque em Marcadores para voltar':'Marque onde você parou',spark(sm.v,'#F472B6'),'#F472B6',ICON.mark)+'</section>';
    h+='<section class="gl card span8"><div class="gh"><div><h2 class="gt">Seu ritmo</h2><p class="gsub">Fichas entendidas por dia · <b>'+sd.sum+'</b> nos últimos '+rng+' dias</p></div><div class="seg" role="group" aria-label="Período"><button data-act="rng" data-r="14" aria-pressed="'+(rng===14)+'">14 dias</button><button data-act="rng" data-r="30" aria-pressed="'+(rng===30)+'">30 dias</button></div></div>'+chart(sd.v,sd.ds,!sd.sum,estW())+ritmoMini(sd,rng)+'</section>';
    var parts=areas.map(function(c){var ids=catItems(c.id).map(function(x){return x.id});return {c:c.c,name:c.name,id:c.id,n:seen(ids),t:ids.length}}).filter(function(p){return p.n>0}).sort(function(a,b){return b.n-a.n});
    h+='<section class="gl card span4"><div class="gh"><div><h2 class="gt">Progresso geral</h2><p class="gsub">'+done+' de '+N+' fichas</p></div></div>'+donut(parts,N,pct)+
      '<ul class="legend">'+areas.map(function(c){var ids=catItems(c.id).map(function(x){return x.id}),s=seen(ids);return '<li><i style="background:'+c.c+'"></i><span>'+nb(esc(c.name))+'</span><b>'+s+'</b><em>/'+ids.length+'</em></li>'}).join('')+'</ul></section>';
    h+='<section class="span5">'+contCard()+'</section><section class="span7">'+actCard()+'</section>';
    h+='<section class="span12">'+areaTable(areas)+'</section>'+trailsBlock();
    h+='<p class="foot span12">Este catálogo cobre as principais tecnologias de cada área. Não é uma lista completa: existem milhares de ferramentas e aparecem novas toda semana. A ideia é você ter o mapa e saber onde cavar.</p></div>';
    return h;
  }
  document.addEventListener('pointermove',function(e){var c=e.target.closest&&e.target.closest('.lc');if(c)hover(c,e)});
  document.addEventListener('pointerdown',function(e){var c=e.target.closest&&e.target.closest('.lc');if(c)hover(c,e)});
  document.addEventListener('pointerleave',function(e){if(e.target&&e.target.classList&&e.target.classList.contains('lc'))unhover(e.target)},true);
  return {view:view,fit:fit,after:fit,ago:ago,perDay:perDay,streakInfo:streakInfo,activityList:activityList,snip:snip,dkey:dkey,spark:spark,smooth:smooth,GEO:GEO};
})();
VIEWS.home=DASH.view;
ACTS.rng=function(t){STORE.pref().rng=(+t.dataset.r===30)?30:14;STORE.save();render()};
