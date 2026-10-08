/* ===== prelude: estruturas e helpers de dados ===== */
const DATA=[],FR={},FLOW={},TRAILS=[];
const CATS=[
 {id:'base',code:'FUN',name:'Fundamentos',desc:'Como o computador e a internet funcionam por baixo',c:'#5F6F7E',ci:'#FFFFFF'},
 {id:'front',code:'FRT',name:'Front-end',desc:'Tudo o que aparece na tela e reage ao toque',c:'#1F6FDB',ci:'#FFFFFF'},
 {id:'back',code:'BCK',name:'Back-end e APIs',desc:'A sala de máquinas: regras, login e conversa entre sistemas',c:'#C2410C',ci:'#FFFFFF'},
 {id:'lang',code:'LNG',name:'Linguagens',desc:'Onde cada linguagem de programação trabalha',c:'#8E44AD',ci:'#FFFFFF'},
 {id:'dados',code:'DAD',name:'Dados e bancos',desc:'Onde a informação mora e como perguntar pra ela',c:'#0B7A6D',ci:'#FFFFFF'},
 {id:'ops',code:'OPS',name:'DevOps, nuvem e infra',desc:'Colocar no ar e manter rodando',c:'#E0A100',ci:'#1A1200'},
 {id:'seg',code:'SEG',name:'Segurança',desc:'Entender o ataque para saber defender',c:'#C62828',ci:'#FFFFFF'},
 {id:'ia',code:'IA',name:'IA e ciência de dados',desc:'De machine learning a agentes de IA',c:'#B02A80',ci:'#FFFFFF'},
 {id:'app',code:'APP',name:'Mobile, desktop e jogos',desc:'Apps de celular, programas de PC e game engines',c:'#247A35',ci:'#FFFFFF'},
 {id:'ind',code:'IND',name:'Indústria e IoT',desc:'Onde o chão de fábrica encontra o software',c:'#8B5E34',ci:'#FFFFFF'},
 {id:'eng',code:'ENG',name:'Engenharia de software',desc:'Testes, arquitetura, métodos e jeito de trabalhar',c:'#4254B8',ci:'#FFFFFF'},
 {id:'algo',code:'ALG',name:'Algoritmos e estruturas',desc:'A lógica por trás de qualquer programa',c:'#0A7791',ci:'#FFFFFF'},
 {id:'ferr',code:'FER',name:'Ferramentas do dia a dia',desc:'O que o dev tem na bancada',c:'#66722A',ci:'#FFFFFF'},
 {id:'novo',code:'NEW',name:'Emergentes',desc:'Blockchain, quântica, realidade virtual e mais',c:'#A5526B',ci:'#FFFFFF'}
];
const CATMAP={};CATS.forEach(function(c){CATMAP[c.id]=c});
/* E(id,nome,subtítulo,nível 1-3,o que é,analogia,[para que serve],[lang,código,como ler],demo,[relacionados],{alt,tags,also}) */
function E(id,name,sub,lvl,oq,an,pq,ex,demo,rel,x){var o={id:id,name:name,sub:sub,lvl:lvl,oq:oq,an:an,pq:pq,ex:ex||null,demo:demo||null,rel:rel||[]};if(x)Object.assign(o,x);return o}
function C(cat,list){list.forEach(function(o){o.cat=cat;DATA.push(o)})}
function T(id,name,desc,ids){TRAILS.push({id:id,name:name,desc:desc,ids:ids})}
/* junta linhas de código */
function L(){return Array.prototype.slice.call(arguments).join('\n')}
