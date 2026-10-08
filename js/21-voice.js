/* ===== voz: áudio gravado (voz natural) e voz do aparelho =====
   Este arquivo só declara funções; nada roda aqui no carregamento (as ferramentas de teste carregam sem o motor do app). */
var BASE_RATE=0.9,AUD=null,PREAUD=null,TICKER=0;
var RATES=[0.85,1,1.15,1.3,1.5],PAUSAS=[[0.6,'Curta'],[1,'Normal'],[1.6,'Longa']];

function agora(){return (window.performance&&performance.now)?performance.now():Date.now()}
function fs1(ms){return (ms/1000).toFixed(1).replace('.',',')}
function mmss(s){s=Math.max(0,Math.floor(+s||0));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')}
function arqOk(){return typeof Audio!=='undefined'&&typeof AUDIOMAP!=='undefined'&&Object.keys(AUDIOMAP).length>0}
function vozOk(){return TTS.ok||arqOk()}
function temArq(id){return typeof AUDIOMAP!=='undefined'&&!!AUDIOMAP[id]}
function modoDe(id){return(S.modo!=='aparelho'&&!TTS.semArq&&temArq(id)&&typeof Audio!=='undefined')?'natural':'aparelho'}
function urlArq(id){return 'audio/'+id+'.mp3'}
function decorrido(){return TTS.loading?(agora()-TTS.t0)/1000:0}

/* ----- vozes do aparelho ----- */
function vozesPt(){try{return(speechSynthesis.getVoices()||[]).filter(function(v){return /^pt/i.test(v.lang)})}catch(e){return[]}}
function notaVoz(v){
  var n=(v.name||'')+' '+(v.voiceURI||''),s=0;
  s+=/pt[-_]BR/i.test(v.lang)?100:40;
  if(/natural|neural/i.test(n))s+=30;
  if(/enhanced|premium|aprimorad/i.test(n))s+=25;
  if(/google/i.test(n))s+=10;
  if(v.localService)s+=18;
  if(/compact|espeak|robot/i.test(n))s-=40;
  return s;
}
function pickVoice(){
  if(!TTS.ok)return;
  var vs=vozesPt();if(!vs.length){TTS.voice=null;return}
  var want=S.voz?vs.filter(function(v){return v.name===S.voz})[0]:null;
  if(want){TTS.voice=want;return}
  vs.sort(function(a,b){return notaVoz(b)-notaVoz(a)});TTS.voice=vs[0];
}
function nomeVoz(v){return v?v.name+(v.localService?' (local)':' (rede)'):'padrão do aparelho'}
function initVoz(){
  document.addEventListener('change',function(e){var t=e.target;if(t&&t.dataset&&t.dataset.sel==='voz')vozEscolhe(t.value)});
  if(TTS.ok){try{speechSynthesis.onvoiceschanged=function(){pickVoice();if(S.view==='voz')render()}}catch(e){}pickVoice()}
}

/* ----- elemento de áudio (um só, reaproveitado: o navegador libera o som depois do primeiro toque) ----- */
function elAudio(){
  if(!AUD){
    AUD=new Audio();AUD.preload='auto';
    try{AUD.preservesPitch=true;AUD.webkitPreservesPitch=true}catch(e){}
  }
  return AUD;
}
function pararSom(){
  clearTimeout(TTS.tp);clearTimeout(TTS.wd);
  try{speechSynthesis.cancel()}catch(e){}
  if(AUD){AUD.onplaying=AUD.onended=AUD.onerror=AUD.onwaiting=AUD.ontimeupdate=AUD.onloadedmetadata=null;try{AUD.pause()}catch(e){}}
}

/* ----- carregando: contador no botão e no player ----- */
function iniciaTick(){clearInterval(TICKER);TICKER=setInterval(function(){if(!TTS.loading||!TTS.on){clearInterval(TICKER);return}syncListen();statusPlayer()},250)}
function rotuloOuvir(id){
  var meu=TTS.on&&TTS.ids[TTS.pos]===id;
  if(meu&&TTS.loading){var d=Math.floor(decorrido());return '<i class="spin" aria-hidden="true"></i> '+(TTS.modo==='natural'?'Carregando áudio…':'Gerando áudio…')+(d>=1?' '+d+' s':'')}
  if(meu&&!TTS.paused)return ICON.pause+' Pausar';
  if(meu&&TTS.paused)return ICON.play+' Continuar';
  return ICON.play+' Ouvir';
}
function syncListen(){
  var b=$('[data-act="listen"]');if(!b)return;
  b.innerHTML=rotuloOuvir(S.id);
  b.setAttribute('aria-busy',(TTS.on&&TTS.loading&&TTS.ids[TTS.pos]===S.id)?'true':'false');
}
function statusPlayer(){
  var s=$('#pst');if(!s)return;
  var t;
  if(TTS.loading){var d=Math.floor(decorrido());t=(TTS.modo==='natural'?'Carregando áudio…':'Gerando áudio…')+(d>=1?' '+d+' s':'');if(d>=8)t+=' Está demorando; toque em ■ para cancelar.'}
  else{t=(TTS.paused?'Pausado':'Falando')+' · '+(TTS.pos+1)+' de '+TTS.ids.length+(TTS.diag&&TTS.diag.total?' · começou em '+fs1(TTS.diag.total)+' s':'')}
  if(TTS.nota)t+=' '+TTS.nota;
  s.textContent=t;
}
function renderPlayer(){
  var p=$('#player');
  if(!TTS.on||!byId[TTS.ids[TTS.pos]]){p.hidden=true;p.innerHTML='';return}
  var x=byId[TTS.ids[TTS.pos]];p.hidden=false;
  p.innerHTML='<div class="pprog" id="pprog" data-act="pseek" role="slider" aria-label="Posição do áudio" aria-valuemin="0" aria-valuemax="100" tabindex="-1"><i id="pprogi"></i></div><div class="in"><div class="tt"><b>'+esc(x.name)+'</b><small id="pst"></small></div>'+
    '<button class="ib" data-act="tprev" aria-label="Anterior">'+ICON.prev+'</button>'+
    '<button class="ib main" data-act="tplay" aria-label="'+(TTS.paused?'Continuar':'Pausar')+'">'+(TTS.paused?ICON.play:ICON.pause)+'</button>'+
    '<button class="ib" data-act="tnext" aria-label="Próxima">'+ICON.next+'</button>'+
    '<button class="ib" data-act="mk-add" data-id="'+x.id+'" aria-label="Marcar onde parei">'+(ICON.mark||'')+'</button>'+
    '<button class="ib sp" data-act="trate" aria-label="Velocidade">'+S.rate+'x</button>'+
    '<button class="ib" data-act="tstop" aria-label="Parar">'+ICON.stop+'</button></div>';
  statusPlayer();progresso();
}
/* barra de progresso do áudio gravado */
function progresso(){
  var i=$('#pprogi'),p=$('#pprog');if(!i||!AUD||TTS.modo!=='natural'||TTS.loading)return;
  var d=AUD.duration,c=AUD.currentTime;
  if(d&&isFinite(d)){var pc=Math.min(100,c/d*100);i.style.width=pc.toFixed(1)+'%';if(p)p.setAttribute('aria-valuenow',Math.round(pc))}
}
function pularPara(ratio){
  if(!TTS.on||TTS.modo!=='natural'||!AUD||!AUD.duration||!isFinite(AUD.duration))return;
  try{AUD.currentTime=Math.max(0,Math.min(1,ratio))*AUD.duration}catch(e){}progresso();
}

/* ----- medição: toque → app → primeiro som ----- */
function chaveMed(){return TTS.modo==='natural'?'Voz gravada':'Aparelho: '+nomeVoz(TTS.voice)}
function anotaMed(chave,ms){var a=S.med[chave]||(S.med[chave]=[]);a.push(Math.round(ms));while(a.length>5)a.shift();saveLocal()}
function comecou(){
  if(!TTS.loading)return;
  TTS.loading=false;clearInterval(TICKER);clearTimeout(TTS.wd);
  TTS.tStart=agora();
  if(TTS.modo==='natural')TTS.falhas=0;
  TTS.diag={modo:TTS.modo,voz:chaveMed(),app:TTS.tCall-TTS.t0,som:TTS.tStart-TTS.tCall,total:TTS.tStart-TTS.t0};
  anotaMed(TTS.diag.voz,TTS.diag.total);
  syncListen();statusPlayer();
  if(S.view==='voz')render();
}

/* ----- voz do aparelho ----- */
function falarBloco(){
  var my=TTS.tok;if(!TTS.on||TTS.paused)return;
  if(TTS.ci>=TTS.bl.length){nextEntry();return}
  if(!TTS.voice)pickVoice();
  var b=TTS.bl[TTS.ci],u=new SpeechSynthesisUtterance(b.t);
  u.lang=(TTS.voice&&TTS.voice.lang)||'pt-BR';if(TTS.voice)u.voice=TTS.voice;
  u.rate=Math.max(0.5,Math.min(2,BASE_RATE*S.rate));u.pitch=1;
  u.onstart=function(){if(my!==TTS.tok)return;if(TTS.loading)comecou()};
  u.onend=function(){
    if(my!==TTS.tok)return;if(TTS.loading)comecou();
    TTS.ci++;var p=Math.round(b.p*S.pausa);
    if(p>0&&TTS.ci<TTS.bl.length)TTS.tp=setTimeout(function(){if(my===TTS.tok)falarBloco()},p);else falarBloco();
  };
  u.onerror=function(ev){if(my!==TTS.tok)return;if(ev&&(ev.error==='interrupted'||ev.error==='canceled'))return;TTS.ci++;falarBloco()};
  TTS.u=u;                       /* guarda a referência: alguns navegadores perdem o evento de fim se o objeto for descartado */
  if(!TTS.tCall)TTS.tCall=agora();
  try{speechSynthesis.speak(u)}catch(e){stopTTS()}
}
function usarAparelho(x,my,at){
  if(!TTS.ok){stopTTS();return}
  TTS.modo='aparelho';TTS.bl=blocosDe(x);TTS.ci=(at&&at.ci>0)?Math.min(at.ci,Math.max(0,TTS.bl.length-1)):0;TTS.tCall=0;
  TTS.tp=setTimeout(function(){if(my===TTS.tok)falarBloco()},80);
}

/* ----- áudio gravado ----- */
function falhaArq(x,my,motivo){
  if(my!==TTS.tok||TTS.modo!=='natural')return;       /* o erro pode chegar duas vezes (evento e promessa): só trata a primeira */
  clearTimeout(TTS.wd);if(AUD){AUD.onplaying=AUD.onended=AUD.onerror=AUD.onwaiting=AUD.ontimeupdate=AUD.onloadedmetadata=null;try{AUD.pause()}catch(e){}}
  TTS.falhas=(TTS.falhas||0)+1;
  if(motivo!=='demorou demais'||TTS.falhas>=2)TTS.semArq=true;      /* uma demora isolada (rede lenta) não desliga a voz gravada; erro ou repetição, sim */
  TTS.modo='aparelho';TTS.nota='O áudio gravado não carregou ('+motivo+'); usei a voz do aparelho.';
  if(!TTS.ok){TTS.loading=false;clearInterval(TICKER);stopTTS();return}
  usarAparelho(x,my);syncListen();statusPlayer();
}
function preCarrega(){
  var prox=TTS.ids[TTS.pos+1];if(!prox||!temArq(prox)||typeof Audio==='undefined')return;
  try{PREAUD=PREAUD||new Audio();PREAUD.preload='auto';PREAUD.src=urlArq(prox)}catch(e){}
}
function mediaSession(x){
  try{
    if(!('mediaSession' in navigator))return;
    navigator.mediaSession.metadata=new MediaMetadata({title:x.name,artist:'DEV EASY',album:CATMAP[x.cat].name});
    navigator.mediaSession.setActionHandler('play',function(){if(TTS.paused)resumeTTS()});
    navigator.mediaSession.setActionHandler('pause',function(){if(!TTS.paused)pauseTTS()});
    navigator.mediaSession.setActionHandler('nexttrack',function(){if(TTS.on){TTS.paused=false;nextEntry()}});
    navigator.mediaSession.setActionHandler('previoustrack',function(){if(TTS.on){TTS.paused=false;TTS.pos=Math.max(0,TTS.pos-1);loadEntry()}});
  }catch(e){}
}
/* ao continuar de um marcador: depois que o arquivo informa a duração, pula para o segundo guardado */
function aplicaSeek(a,my){
  var t=TTS.seek;if(!(t>0))return;
  a.onloadedmetadata=function(){a.onloadedmetadata=null;if(my!==TTS.tok)return;try{if(isFinite(a.duration)&&t<a.duration-1)a.currentTime=t}catch(e){}TTS.seek=0};
}
/* Se o navegador recusar tocar direto do endereço do arquivo (política de segurança da página, por exemplo),
   baixa o arquivo para a memória e toca a partir de lá (endereço blob:). Só depois disso cai para a voz do aparelho. */
function carregaBlob(id,fim){
  try{
    fetch(urlArq(id)).then(function(r){if(!r.ok)throw new Error('http '+r.status);return r.blob()}).then(function(b){
      try{if(TTS.blobUrl)URL.revokeObjectURL(TTS.blobUrl)}catch(e){}
      TTS.blobUrl=URL.createObjectURL(new Blob([b],{type:'audio/mpeg'}));fim(null,TTS.blobUrl);
    }).catch(function(e){fim(e||new Error('falhou'))});
  }catch(e){fim(e)}
}
function tentaBlob(x,my,a){
  if(my!==TTS.tok||TTS.modo!=='natural')return;
  if(TTS.viaBlob===my)return;                       /* já está tentando: o erro chega duas vezes (evento e promessa) */
  if(typeof fetch==='undefined'||typeof URL==='undefined'||!URL.createObjectURL){falhaArq(x,my,'erro');return}
  TTS.viaBlob=my;a.onerror=null;
  clearTimeout(TTS.wd);TTS.wd=setTimeout(function(){if(my===TTS.tok&&TTS.loading)falhaArq(x,my,'demorou demais')},12000);
  carregaBlob(x.id,function(err,url){
    if(my!==TTS.tok||TTS.modo!=='natural')return;
    if(err){falhaArq(x,my,'erro');return}
    a.onerror=function(){if(my===TTS.tok)falhaArq(x,my,'erro')};
    aplicaSeek(a,my);a.src=url;a.playbackRate=S.rate;
    var pr;try{pr=a.play()}catch(e){pr=null}
    if(pr&&pr.catch)pr.catch(function(e){if(my!==TTS.tok||(e&&e.name==='AbortError'))return;falhaArq(x,my,'não tocou')});
  });
}
function tocarArq(x,my,at){
  var a=elAudio();
  a.onplaying=function(){if(my!==TTS.tok)return;a.playbackRate=S.rate;if(TTS.nota==='Carregando…'){TTS.nota='';statusPlayer()}comecou()};
  a.onended=function(){if(my!==TTS.tok)return;if(typeof NOTES!=='undefined')NOTES.audioEnd(x.id);nextEntry()};
  a.ontimeupdate=function(){if(my!==TTS.tok)return;progresso();if(typeof NOTES!=='undefined')NOTES.audioTick(x.id,a.currentTime)};
  a.onerror=function(){if(my!==TTS.tok)return;tentaBlob(x,my,a)};
  a.onwaiting=function(){if(my!==TTS.tok||TTS.loading)return;TTS.nota='Carregando…';statusPlayer()};
  a.defaultPlaybackRate=S.rate;
  TTS.modo='natural';TTS.tCall=agora();TTS.viaBlob=0;TTS.seek=(at&&at.au>0)?at.au:0;
  aplicaSeek(a,my);a.src=urlArq(x.id);a.playbackRate=S.rate;
  var pr;try{pr=a.play()}catch(e){pr=null}
  if(pr&&pr.catch)pr.catch(function(err){
    if(my!==TTS.tok)return;if(err&&err.name==='AbortError')return;
    if(err&&err.name==='NotSupportedError'){tentaBlob(x,my,a);return}
    falhaArq(x,my,err&&err.name==='NotAllowedError'?'bloqueado':'não tocou');
  });
  TTS.wd=setTimeout(function(){if(my===TTS.tok&&TTS.loading)falhaArq(x,my,'demorou demais')},12000);
  mediaSession(x);preCarrega();
}

/* ----- comandos do player ----- */
function loadEntry(){
  var x=byId[TTS.ids[TTS.pos]];if(!x){stopTTS();return}
  var at=TTS.at;TTS.at=null;
  TTS.tok++;var my=TTS.tok;
  pararSom();
  TTS.t0=agora();TTS.tCall=0;TTS.tStart=0;TTS.diag=null;TTS.nota='';TTS.loading=true;
  if(typeof NOTES!=='undefined')NOTES.audioStart(x.id,!!at);
  if(TTS.follow&&!(S.view==='entry'&&S.id===x.id)){
    navTo('entry',{id:x.id,ctx:S.ctx||('cat:'+x.cat)},S.view==='entry');      /* avançando de uma ficha para a outra não enche o histórico do navegador */
  }else renderPlayer();
  syncListen();iniciaTick();
  if(modoDe(x.id)==='natural')tocarArq(x,my,at);else usarAparelho(x,my,at);
}
/* at = {au: segundo do áudio gravado, ci: bloco da voz do aparelho} para continuar de um marcador */
function startTTS(ids,pos,follow,at){
  if(!vozOk()||!ids.length)return;
  TTS.on=true;TTS.paused=false;TTS.follow=!!follow;TTS.ids=ids;TTS.pos=pos||0;TTS.at=at||null;loadEntry();
}
function nextEntry(){TTS.pos++;if(TTS.pos>=TTS.ids.length)stopTTS();else loadEntry()}
function paraTudo(){TTS.tok++;pararSom();TTS.loading=false;clearInterval(TICKER)}
function guardaPonto(){
  if(typeof NOTES==='undefined'||!TTS.on||TTS.loading)return;
  var id=TTS.ids[TTS.pos];
  if(TTS.modo==='natural'&&AUD)NOTES.audioTick(id,AUD.currentTime,true);else if(TTS.modo==='aparelho')NOTES.audioTick(id,null,true,TTS.ci);
}
function stopTTS(){guardaPonto();TTS.on=false;TTS.paused=false;paraTudo();renderPlayer();syncListen()}
function pauseTTS(){
  if(!TTS.on)return;guardaPonto();TTS.paused=true;
  if(TTS.modo==='natural'&&AUD){try{AUD.pause()}catch(e){}}else{TTS.tok++;clearTimeout(TTS.tp);try{speechSynthesis.cancel()}catch(e){}}
  renderPlayer();syncListen();
}
function resumeTTS(){
  if(!TTS.on)return;TTS.paused=false;
  if(TTS.modo==='natural'&&AUD){try{var p=AUD.play();if(p&&p.catch)p.catch(function(){})}catch(e){}renderPlayer();syncListen();return}
  TTS.tok++;renderPlayer();syncListen();var my=TTS.tok;
  TTS.tp=setTimeout(function(){if(my===TTS.tok)falarBloco()},60);
}
function cycleRate(){
  var i=RATES.indexOf(S.rate);S.rate=RATES[(i+1)%RATES.length];saveLocal();
  if(TTS.on&&!TTS.paused){
    if(TTS.modo==='natural'&&AUD){AUD.playbackRate=S.rate;AUD.defaultPlaybackRate=S.rate}
    else{TTS.tok++;clearTimeout(TTS.tp);try{speechSynthesis.cancel()}catch(e){}var my=TTS.tok;TTS.tp=setTimeout(function(){if(my===TTS.tok)falarBloco()},60)}
  }else if(TTS.on&&AUD){AUD.playbackRate=S.rate;AUD.defaultPlaybackRate=S.rate}
  render();
}

/* ----- tela "Voz e áudio" ----- */
function vozModo(m){S.modo=(m==='aparelho')?'aparelho':'natural';if(S.modo==='natural')TTS.nota='';saveLocal();render()}
function vozRate(r){if(RATES.indexOf(r)>=0){S.rate=r;saveLocal();if(AUD){AUD.playbackRate=r;AUD.defaultPlaybackRate=r}render()}}
function vozPausa(p){S.pausa=p;saveLocal();render()}
function vozRetry(){TTS.semArq=false;S.modo='natural';TTS.nota='';saveLocal();render()}
function vozEscolhe(nome){S.voz=nome;saveLocal();pickVoice();render()}
function testarVoz(){
  var out=$('#vtest');if(!out)return;
  stopTTS();
  var modo=(S.modo!=='aparelho'&&!TTS.semArq&&temArq('_teste'))?'natural':'aparelho',t0=agora(),feito=false;
  out.textContent='Testando… aguarde o som.';
  function ok(rot){if(feito)return;feito=true;var ms=agora()-t0;out.textContent=rot+': o som começou em '+fs1(ms)+' s.';anotaMed(rot,ms);var d=$('#vmed');if(d)d.innerHTML=htmlMed()}
  if(modo==='natural'){
    var a=elAudio(),blobTentado=false;
    var falhou=function(){out.textContent='O áudio gravado não carregou aqui. Use a voz do aparelho.'};
    var viaBlob=function(){
      if(blobTentado||feito){if(!feito)falhou();return}
      blobTentado=true;a.onerror=falhou;
      carregaBlob('_teste',function(err,url){if(feito)return;if(err){falhou();return}a.src=url;try{var p2=a.play();if(p2&&p2.catch)p2.catch(falhou)}catch(e){falhou()}});
    };
    a.onplaying=function(){ok('Voz gravada')};a.onended=function(){};a.onerror=viaBlob;
    a.defaultPlaybackRate=S.rate;a.src=urlArq('_teste');a.playbackRate=S.rate;
    try{var pr=a.play();if(pr&&pr.catch)pr.catch(function(e){if(e&&e.name==='AbortError')return;if(e&&e.name==='NotSupportedError')viaBlob();else out.textContent='O navegador bloqueou o som. Toque em Testar de novo.'})}catch(e){}
  }else{
    if(!TTS.ok){out.textContent='Este navegador não tem voz do aparelho.';return}
    pickVoice();var u=new SpeechSynthesisUtterance('Esta é a voz do seu aparelho. Se ela soar natural e começar rápido, pode usar.');
    u.lang=(TTS.voice&&TTS.voice.lang)||'pt-BR';if(TTS.voice)u.voice=TTS.voice;u.rate=BASE_RATE*S.rate;
    u.onstart=function(){ok('Aparelho: '+nomeVoz(TTS.voice))};u.onend=function(){ok('Aparelho: '+nomeVoz(TTS.voice))};
    u.onerror=function(ev){if(!feito)out.textContent='A voz do aparelho deu erro'+(ev&&ev.error?' ('+ev.error+')':'')+'.'};
    TTS.u=u;try{speechSynthesis.cancel();speechSynthesis.speak(u)}catch(e){out.textContent='Não consegui falar.'}
  }
}
function htmlMed(){
  var ks=Object.keys(S.med),d=TTS.diag,ult='';
  if(d)ult='<p class="note"><b>Última vez:</b> o app levou '+fs1(d.app)+' s para preparar e pedir o som; '+(d.modo==='natural'?'o arquivo gravado':'a voz do aparelho')+' levou '+fs1(d.som)+' s para chegar e começar. Total: '+fs1(d.total)+' s.</p>';
  if(!ks.length)return ult+'<p class="note">Ainda não há medições. Toque em Ouvir numa ficha, ou em Testar a voz.</p>';
  return ult+'<ul class="vmed">'+ks.map(function(k){return '<li><b>'+esc(k)+'</b><span>'+S.med[k].map(function(m){return fs1(m)+' s'}).join(' · ')+'</span></li>'}).join('')+'</ul>';
}
function chips(lista,atual,act,attr){
  return '<div class="chips" role="group">'+lista.map(function(v){var val=Array.isArray(v)?v[0]:v,rot=Array.isArray(v)?v[1]:(v+'x');return '<button class="chip" data-act="'+act+'" data-'+attr+'="'+val+'" aria-pressed="'+(val===atual)+'">'+rot+'</button>'}).join('')+'</div>';
}
function vVoz(){
  var tem=arqOk(),n=tem?Object.keys(AUDIOMAP).filter(function(k){return k.charAt(0)!=='_'}).length:0,vs=vozesPt();
  var h='<div style="--c:#5F6F7E;--ci:#FFFFFF"><button class="lnk" data-act="back">← Voltar</button><div><span class="plate">VOZ</span></div><h1>Voz e áudio</h1>';
  h+='<p class="lead">Escolha como o app lê para você. Dá para trocar quando quiser.</p>';
  if(TTS.semArq||S.modo==='aparelho'&&tem&&TTS.nota)h+='<p class="note" style="margin:0 0 12px">'+esc(TTS.nota||'O áudio gravado não carregou neste aparelho. Usando a voz do aparelho.')+' <button class="lnk" data-act="vretry">Tentar a voz gravada de novo</button></p>';
  if(tem){
    h+='<button class="vozcard" data-act="vmodo" data-m="natural" aria-pressed="'+(S.modo!=='aparelho')+'"><b>Voz natural (gravada)</b><small>Voz neural de código aberto, gravada antes. O som começa quase na hora. Cada ficha baixa um arquivo de cerca de 0,4 MB (dez fichas gastam uns 4 MB de internet). Há áudio para '+n+' fichas; as outras usam a voz do aparelho.</small></button>';
  }
  h+='<button class="vozcard" data-act="vmodo" data-m="aparelho" aria-pressed="'+(S.modo==='aparelho'||!tem)+'"><b>Voz do aparelho</b><small>Usa a voz que o seu celular já tem. Vozes “de rede” podem demorar alguns segundos para começar.</small></button>';
  if(TTS.ok){
    h+='<label class="vsel"><span>Qual voz do aparelho?</span><select id="vsel" data-sel="voz"><option value="">Automática (a que costuma começar mais rápido)</option>'+vs.map(function(v){return '<option value="'+esc(v.name)+'"'+(S.voz===v.name?' selected':'')+'>'+esc(nomeVoz(v))+' · '+esc(v.lang)+'</option>'}).join('')+'</select></label>';
    if(!vs.length)h+='<p class="note">Este aparelho não listou nenhuma voz em português. Ele pode estar carregando; abra esta tela de novo em alguns segundos.</p>';
    else h+='<p class="note">Em uso agora: <b>'+esc(nomeVoz(TTS.voice))+'</b>. Voz “local” funciona sem internet e costuma começar mais rápido.</p>';
  }
  h+='<h2 class="eyebrow">Velocidade</h2>'+chips(RATES,S.rate,'vrate','r');
  h+='<h2 class="eyebrow">Pausa entre as frases</h2>'+chips(PAUSAS,S.pausa,'vpausa','p');
  h+='<h2 class="eyebrow">Testar</h2><div class="acts"><button class="btn" data-act="vtest">'+ICON.play+' Testar a voz</button></div><p class="note" id="vtest" aria-live="polite">Toque em Testar para ouvir uma frase e ver em quantos segundos o som começa.</p>';
  h+='<h2 class="eyebrow">Tempo até o som começar</h2><div id="vmed">'+htmlMed()+'</div>';
  h+='<p class="note">Cada número é o tempo entre o seu toque e o primeiro som. Se a voz do aparelho levar vários segundos e a gravada levar menos de um, o atraso vem da voz do aparelho (o app em si leva cerca de 0,1 s).</p>';
  return h+'</div>';
}
