/* ===== motor do app ===== */
const byId={};
const S={view:'home',cat:null,tid:null,id:null,q:'',filter:'all',ctx:null,pos:null,searchPushed:false,studied:new Set(),fav:new Set(),rate:1,modo:'natural',voz:'',pausa:1,med:{}};
const LV={1:'Comece por aqui',2:'Depois do básico',3:'Avançado'};
const ICON={
  play:'<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',
  pause:'<svg viewBox="0 0 24 24"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>',
  next:'<svg viewBox="0 0 24 24"><path d="M6 6l8.5 6L6 18zM16 6h2v12h-2z"/></svg>',
  prev:'<svg viewBox="0 0 24 24"><path d="M18 6l-8.5 6L18 18zM6 6h2v12H6z"/></svg>',
  stop:'<svg viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="1"/></svg>'
};
const $=function(s,r){return (r||document).querySelector(s)};
const norm=function(s){return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'')};
const nb=function(s){return s.replace(/(Front|Back)-end/g,'<span class="nw">$1-end</span>')};
const itens=function(n){return n+(n===1?' item':' itens')};
const plain=function(s){return String(s).replace(/\*\*/g,'').replace(/`/g,'')};

/* ----- dados derivados ----- */
function finalize(){
  var cnt={};
  DATA.forEach(function(x){
    byId[x.id]=x;cnt[x.cat]=(cnt[x.cat]||0)+1;
    x.code=CATMAP[x.cat].code+'-'+String(cnt[x.cat]).padStart(3,'0');
    x._s=norm(x.name+' '+x.id+' '+(x.tags||''));x._d=norm(x.sub);x._o=norm(x.oq+' '+x.an);
  });
  DATA.forEach(function(x){x.rel=x.rel.filter(function(r){return byId[r]&&r!==x.id})});
}
function catItems(cid){return DATA.filter(function(x){return x.cat===cid||(x.also&&x.also.indexOf(cid)>=0)})}
function trailIds(t){return t.ids.filter(function(i){return byId[i]})}
function ctxIds(ctx){
  if(ctx&&ctx.indexOf('cat:')===0)return catItems(ctx.slice(4)).map(function(x){return x.id});
  if(ctx&&ctx.indexOf('trail:')===0){var t=TRAILS.filter(function(r){return r.id===ctx.slice(6)})[0];if(t)return trailIds(t)}
  if(ctx==='search')return (S.results||[]).map(function(x){return x.id});
  return null;
}

/* ----- busca ----- */
function search(q){
  var toks=norm(q).split(/\s+/).filter(Boolean);if(!toks.length)return [];
  var out=[];
  DATA.forEach(function(x){
    var sc=0,ok=true;
    toks.forEach(function(t){
      var s=0;
      if(x._s.indexOf(t)===0)s=5;else if(x._s.indexOf(t)>=0)s=3;else if(x._d.indexOf(t)>=0)s=2;else if(x._o.indexOf(t)>=0)s=1;
      if(!s)ok=false;sc+=s;
    });
    if(ok)out.push([sc,x]);
  });
  out.sort(function(a,b){return b[0]-a[0]});
  return out.slice(0,60).map(function(r){return r[1]});
}

/* ----- voz ----- */
var PRONW={JSON:'jêison',URL:'u érre éle',HTTPS:'agá tê tê pê ésse',HTTP:'agá tê tê pê',DNS:'dê ene ésse',IP:'í pê',TCP:'tê cê pê',UDP:'u dê pê',SSH:'ésse ésse agá',TLS:'tê éle ésse',SSL:'ésse ésse éle',CPU:'cê pê u',GPU:'gê pê u',RAM:'rã',USB:'u ésse bê',PDF:'pê dê éfe',XML:'xis ême éle',YAML:'iâmel',CSV:'cê ésse vê',HTML:'agá tê ême éle',CSS:'cê ésse ésse',JS:'jê ésse',SQL:'ésse quê éle',NoSQL:'nô ésse quê éle',API:'á pê í',APIs:'á pê íis',PWA:'pê dáblio á',SEO:'ésse í ô',SSR:'ésse ésse érre',CSR:'cê ésse érre',REST:'rést',GraphQL:'gráf quê éle',gRPC:'gê érre pê cê',JWT:'jê dáblio tê',OAuth:'ôu óf',MVC:'ême vê cê',ORM:'ô érre ême',CRUD:'crud',npm:'ene pê ême',AWS:'á dáblio ésse',IAM:'ai ê ém',SIEM:'sím',SOC:'sóc',XSS:'xis ésse ésse',CSRF:'cê ésse érre éfe',DDoS:'dê dê ôu ésse',OWASP:'ôuasp',MFA:'ême éfe á',CVE:'cê vê é',VPN:'vê pê ene',IoT:'ai ôu tê',IIoT:'ai ai ôu tê',CLP:'cê éle pê',PLC:'pê éle cê',IHM:'í agá ême',HMI:'agá ême í',SCADA:'iscada',MES:'mês',ERP:'é érre pê',MQTT:'ême quê tê tê',OPC:'ô pê cê',SAP:'sap',IA:'í á',LLM:'éle éle ême',RAG:'rag',MCP:'ême cê pê',NLP:'ene éle pê',GPT:'gê pê tê',ML:'ême éle',BI:'bê í',ETL:'é tê éle',ACID:'ásside',TDD:'tê dê dê',SOLID:'sólid',MVP:'ême vê pê',SRE:'ésse érre é',DevOps:'dev ops',DevSecOps:'dev sec ops',MLOps:'ême éle ops',IaC:'ai á cê',Git:'guit',GitHub:'guit rab',GitLab:'guit láb',Docker:'dóquer',Kubernetes:'kubernêtis',Python:'páiton',Java:'djavá',JavaScript:'djavá script',TypeScript:'taip script',React:'riact',Vue:'viu',Svelte:'esvélt',Tailwind:'têilwind',Bootstrap:'butstrap',Firebase:'faierbeis',Firestore:'faierstór',Redis:'rédis',MongoDB:'mongo dê bê',PostgreSQL:'pôst-grês ésse quê éle',MySQL:'mai ésse quê éle',SQLite:'ésse quê éle áite',Nginx:'enginéx',Linux:'línux',iOS:'ai ôu ésse',Android:'andróide',Flutter:'flâter',Kotlin:'kótlin',Swift:'suíft',Rust:'râst',Ruby:'rúbi',PHP:'pê agá pê',Laravel:'laravél',Django:'djângo',Flask:'flésk',Spring:'espring',Electron:'eletrón',Capacitor:'capássitor',Unity:'iunity',Unreal:'anrial',Godot:'godô',Arduino:'arduíno',Raspberry:'ráspberi',Modbus:'módibus',Grafana:'grafana',Prometheus:'promitíus',Terraform:'térraform',Vercel:'vercél',Vite:'vít',Webpack:'uébpack',Babel:'bábel',Redux:'ridâx',Sass:'sass',jQuery:'jê quéri',Angular:'ângular',Nuxt:'nâxt',Deno:'dínou',Bun:'bân',Express:'expréss',Postman:'pôstmen',Figma:'fígma',Jira:'djíra',Scrum:'escrâm',Kanban:'cambã',Cypress:'saipress',Wireshark:'uáirshark',Nmap:'ene mép',Burp:'bârp',Metasploit:'metasplóit',Splunk:'splânk',Kafka:'cáfica',pandas:'pândas',NumPy:'nâmpai',Jupyter:'djúpiter',PyTorch:'pai tórch',TensorFlow:'ténsor flou',Blender:'blênder',WebGL:'ueb gê éle',OpenGL:'ôupen gê éle'};
var PRONS=[[/C#/g,'C sharp'],[/C\+\+/g,'C mais mais'],[/\.NET/g,'dot net'],[/Node\.js/g,'Nôud jê ésse'],[/Next\.js/g,'Next jê ésse'],[/CI\/CD/g,'cê í, cê dê'],[/UI\/UX/g,'iu ai e iu éx'],[/Wi-Fi/g,'uái-fái'],[/Vue\.js/g,'viu jê ésse'],[/Three\.js/g,'três jê ésse'],[/Hugging Face/g,'ráguin feis']];
Object.keys(PRONX).forEach(function(k){PRONW[k]=PRONX[k]});PRONS=PRONSX.concat(PRONS);
var PRONRE=new RegExp('\\b('+Object.keys(PRONW).sort(function(a,b){return b.length-a.length}).join('|')+')\\b','g');
function say(t){PRONS.forEach(function(p){t=t.replace(p[0],p[1])});return t.replace(PRONRE,function(m){return PRONW[m]})}
function speechText(x){return plain(x.name+'. '+x.sub+'. O que é: '+x.oq+' Analogia: '+x.an+' Para que serve: '+x.pq.join('; ')+'.')}
function chunks(text){
  var parts=text.match(/[^.!?;:]+[.!?;:]*\s*/g)||[text],out=[],cur='';
  parts.forEach(function(p){if(cur&&(cur+p).length>170){out.push(cur.trim());cur=p}else cur+=p});
  if(cur.trim())out.push(cur.trim());return out;
}
/* roteiro: lista de {t: texto já com pronúncia, p: pausa depois, em ms}. Serve à voz do aparelho e ao gerador de áudio gravado */
function frasesDe(t){
  t=String(t).replace(/\s+/g,' ').trim();var out=[],cur='',n=t.length;
  for(var i=0;i<n;i++){
    var c=t.charAt(i);cur+=c;
    if((c==='.'||c==='!'||c==='?')&&(i===n-1||t.charAt(i+1)===' ')){
      if(i===n-1||/[A-ZÀ-ÚÇ"“(\d]/.test(t.charAt(i+2))){out.push(cur.trim());cur=''}
    }
  }
  if(cur.trim())out.push(cur.trim());
  return out;
}
function roteiro(x){
  var out=[];
  function add(t,p){t=say(plain(t)).replace(/\s+/g,' ').trim();if(t)out.push({t:t,p:p})}
  function fim(t){t=String(t).trim();return /[.!?]$/.test(t)?t:t+'.'}
  add(fim(x.name),350);add(fim(x.sub),900);
  add('O que é.',450);var a=frasesDe(x.oq);a.forEach(function(f,i){add(f,i<a.length-1?380:800)});
  add('Analogia.',450);a=frasesDe(x.an);a.forEach(function(f,i){add(f,i<a.length-1?380:800)});
  add('Para que serve.',450);x.pq.forEach(function(q,i){add(fim(q.replace(/[;.]+$/,'')),i<x.pq.length-1?420:600)});
  return out;
}
function partir(t,max){
  var out=[];
  while(t.length>max){
    var k=-1,m=/[,;:] /g,r;
    while((r=m.exec(t))&&r.index+1<=max)k=r.index+1;
    if(k<30){k=t.lastIndexOf(' ',max);if(k<30)k=max}
    out.push(t.slice(0,k).trim());t=t.slice(k).trim();
  }
  if(t)out.push(t);return out;
}
/* blocos da voz do aparelho: junta frases curtas (até 170 letras, limite seguro dos motores de voz) e guarda a pausa depois de cada bloco */
function blocosDe(x){
  var seg=roteiro(x),bl=[],cur=null;
  seg.forEach(function(s){
    if(cur&&cur.p<=450&&cur.t.length+1+s.t.length<=170){cur.t+=' '+s.t;cur.p=s.p}
    else{if(cur)bl.push(cur);cur={t:s.t,p:s.p}}
  });
  if(cur)bl.push(cur);
  var res=[];
  bl.forEach(function(b){var ps=partir(b.t,170);ps.forEach(function(t,i){res.push({t:t,p:i===ps.length-1?b.p:0})})});
  return res;
}
var TTS={ok:('speechSynthesis' in window)&&('SpeechSynthesisUtterance' in window),on:false,paused:false,follow:false,ids:[],pos:0,bl:[],ci:0,tok:0,voice:null,loading:false,modo:'',t0:0,tCall:0,tStart:0,diag:null,nota:'',semArq:false,u:null,tp:0,wd:0};
/* o motor de voz fica em 21-voice.js */
