/* ===== ENIAC · 2 · progresso =====
   Tudo fica no STORE, no grupo "jogo", como os outros dados do app: cada item é um registro {v, u} e vai para a nuvem pelo mesmo caminho (27-sync.js).
   Chaves (todas dentro do grupo "jogo"):
     l-<id da lição>   {n: vezes concluída, e: melhor nota em estrelas (1 a 3), d: último dia, x: XP ganho nesta lição, a: respostas certas, t: respostas dadas}
     d-AAAAMMDD        1  (dia em que houve lição concluída; a sequência é calculada a partir destes dias)
     c-<id>            "AAAA-MM-DD"  (conquista e o dia em que veio)
     cfg               {liberarTudo: true/false}
     xp0               XP trazido do Codivara (migração; lições novas guardam o próprio XP em "x")
   Por que assim: dois aparelhos que praticam sem internet se juntam sem perder nada (cada lição e cada dia é um registro separado; o XP e a sequência são
   SOMAS/CONTAGENS desses registros, nunca um número único que um aparelho sobrescreve).
   NÍVEL: pelo XP total. Chegar ao nível N exige 50 x N x (N - 1) XP no total: nível 2 com 100 XP, nível 3 com 300, nível 4 com 600...
   (cada nível pede 100 XP a mais que o anterior). Uma lição perfeita rende cerca de 100 XP. */
ENIAC.est=(function(){
  var C=null;
  STORE.on(function(){C=null});

  function compacta(s){return String(s).replace(/-/g,'')}
  function expande(k){return k.slice(0,4)+'-'+k.slice(4,6)+'-'+k.slice(6,8)}
  function inteiro(x,min,max){x=Math.floor(+x);if(!isFinite(x))x=min;return Math.max(min,Math.min(max,x))}

  /* lê os registros e monta as contas (guardado até o STORE mudar) */
  function montar(){
    var c={lic:{},dias:{},conq:{},cfg:{},xp0:0,xpLic:0,resp:0,cert:0};
    STORE.live('jogo').forEach(function(r){
      var k=r.k,v=r.v;
      if(k.indexOf('l-')===0){
        if(v&&typeof v==='object'&&+v.n>0){
          var o={n:inteiro(v.n,1,1e6),e:inteiro(v.e,1,3),d:typeof v.d==='string'?v.d:'',x:inteiro(v.x,0,1e8),a:inteiro(v.a,0,1e8),t:inteiro(v.t,0,1e8)};
          c.lic[k.slice(2)]=o;c.xpLic+=o.x;c.resp+=o.t;c.cert+=o.a;
        }
      }else if(k.indexOf('d-')===0){if(/^\d{8}$/.test(k.slice(2)))c.dias[k.slice(2)]=1}
      else if(k.indexOf('c-')===0){if(typeof v==='string')c.conq[k.slice(2)]=v}
      else if(k==='cfg'){if(v&&typeof v==='object')c.cfg=v}
      else if(k==='xp0'){c.xp0=inteiro(v,0,1e9)}
    });
    return c;
  }
  function c(){return C||(C=montar())}
  function grava(k,v){var r=STORE.set('jogo',k,v);C=null;return r}

  /* ----- consultas ----- */
  function licao(id){return c().lic[id]||null}
  function feita(id){return !!c().lic[id]}
  function estrelas(id){var r=c().lic[id];return r?r.e:0}
  function xpTotal(){return c().xp0+c().xpLic}
  function cfg(){return {liberarTudo:c().cfg.liberarTudo===true}}
  function setCfg(k,v){var o=Object.assign({},c().cfg);o[k]=v;grava('cfg',o)}
  function conquistas(){return Object.assign({},c().conq)}
  function estat(){var r=c().resp;return {respostas:r,certas:c().cert,precisao:r?Math.round(100*c().cert/r):0}}

  /* nível a partir do XP: N = piso((1 + raiz(1 + XP / 12,5)) / 2), isto é, XP total para chegar ao nível N = 50 x N x (N - 1) */
  function nivelDe(xp){
    xp=Math.max(0,Math.floor(xp));
    var n=Math.max(1,Math.floor((1+Math.sqrt(1+xp/12.5))/2));
    while(50*(n+1)*n<=xp)n++;
    while(n>1&&50*n*(n-1)>xp)n--;
    var ini=50*n*(n-1),fim=50*(n+1)*n;
    return {n:n,ini:ini,fim:fim,dentro:xp-ini,precisa:fim-ini,falta:fim-xp,pct:Math.round(100*(xp-ini)/(fim-ini))};
  }
  function nivel(){return nivelDe(xpTotal())}

  /* sequência: dias seguidos com lição concluída, contando até hoje (ou até ontem, se hoje ainda não praticou) */
  function seq(){
    var d=c().dias,h=ENIAC.hoje(),ok=!!d[compacta(h)],dia=ok?h:ENIAC.somaDias(h,-1),n=0;
    while(d[compacta(dia)]&&n<20000){n++;dia=ENIAC.somaDias(dia,-1)}
    var ks=Object.keys(d).sort(),melhor=0,run=0,prev=null;
    ks.forEach(function(k){var dt=expande(k);if(prev&&ENIAC.somaDias(prev,1)===dt)run++;else run=1;if(run>melhor)melhor=run;prev=dt});
    return {n:n,hoje:ok,melhor:Math.max(melhor,n),dias:ks.length};
  }

  /* ----- desbloqueio: a próxima lição abre quando a anterior é concluída (a 1ª de cada unidade abre com a última da unidade anterior).
     "Liberar todas as lições" (config) abre tudo. Lição já concluída fica sempre aberta. ----- */
  function liberada(g){
    var o=ENIAC.ordem(),m=o[g];
    if(!m)return false;
    return c().cfg.liberarTudo===true||g===0||!!c().lic[m.id]||!!c().lic[o[g-1].id];
  }
  function liberadaId(id){var m=ENIAC.meta(id);return !!m&&liberada(m.g)}
  function proxima(){
    var o=ENIAC.ordem();
    for(var i=0;i<o.length;i++)if(!c().lic[o[i].id]&&liberada(i))return o[i];
    return null;
  }
  /* tudo concluído: a lição com menos estrelas (a mais antiga em caso de empate) para praticar de novo */
  function maisFraca(){
    var o=ENIAC.ordem(),b=null,be=9;
    o.forEach(function(m){var e=estrelas(m.id);if(e&&e<be){be=e;b=m}});
    return b;
  }
  function contagem(){
    var o=ENIAC.ordem(),f=0,p=0;
    o.forEach(function(m){var r=c().lic[m.id];if(r){f++;if(r.e>=3)p++}});
    return {feitas:f,perfeitas:p,total:o.length};
  }
  function unidadeInfo(u){
    var f=0,p=0;
    u.licoes.forEach(function(m){var r=c().lic[m.id];if(r){f++;if(r.e>=3)p++}});
    return {feitas:f,total:u.licoes.length,perfeitas:p,completa:f===u.licoes.length&&f>0};
  }
  /* números para o menu e o painel (funciona antes do manifesto carregar: usa o total guardado da última vez) */
  function resumo(){
    var o=ENIAC.ordem(),cc=c(),f=0,total;
    if(o.length){o.forEach(function(m){if(cc.lic[m.id])f++});total=o.length}
    else{f=Object.keys(cc.lic).length;total=(STORE.pref().jogoTotal|0)||0}
    var xp=xpTotal();
    return {feitas:f,total:total,xp:xp,nivel:nivelDe(xp),seq:seq(),pronto:o.length>0,comecou:Object.keys(cc.lic).length>0};
  }

  /* ----- conquistas ----- */
  function ctxConq(extra){
    var cc=c(),n=0,perf=0,uns=0;
    Object.keys(cc.lic).forEach(function(k){n++;if(cc.lic[k].e>=3)perf++});
    ENIAC.unidades().forEach(function(u){if(u.licoes.length&&u.licoes.every(function(m){return !!cc.lic[m.id]}))uns++});
    return {licoes:n,perfeitas:perf,xp:xpTotal(),seq:seq().melhor,unidades:uns,extra:extra||{}};
  }
  var CONQ=[
    {id:'l1',t:'Primeira lição',d:'Conclua 1 lição.',ic:'star',ok:function(x){return x.licoes>=1}},
    {id:'l5',t:'Pegando o jeito',d:'Conclua 5 lições.',ic:'livro',ok:function(x){return x.licoes>=5}},
    {id:'l10',t:'Dez lições',d:'Conclua 10 lições.',ic:'livro',ok:function(x){return x.licoes>=10}},
    {id:'l25',t:'Ritmo firme',d:'Conclua 25 lições.',ic:'livro',ok:function(x){return x.licoes>=25}},
    {id:'l50',t:'Cinquenta lições',d:'Conclua 50 lições.',ic:'livro',ok:function(x){return x.licoes>=50}},
    {id:'l100',t:'Cem lições',d:'Conclua 100 lições.',ic:'livro',ok:function(x){return x.licoes>=100}},
    {id:'s3',t:'3 dias seguidos',d:'Conclua lições em 3 dias seguidos.',ic:'flame',ok:function(x){return x.seq>=3}},
    {id:'s7',t:'Uma semana inteira',d:'Conclua lições em 7 dias seguidos.',ic:'flame',ok:function(x){return x.seq>=7}},
    {id:'s14',t:'Duas semanas',d:'Conclua lições em 14 dias seguidos.',ic:'flame',ok:function(x){return x.seq>=14}},
    {id:'s30',t:'Um mês de treino',d:'Conclua lições em 30 dias seguidos.',ic:'flame',ok:function(x){return x.seq>=30}},
    {id:'p1',t:'Sem errar nada',d:'Conclua uma lição sem nenhum erro.',ic:'alvo',ok:function(x){return x.perfeitas>=1}},
    {id:'p5',t:'Cinco perfeitas',d:'Conclua 5 lições sem nenhum erro.',ic:'alvo',ok:function(x){return x.perfeitas>=5}},
    {id:'p10',t:'Dez perfeitas',d:'Conclua 10 lições sem nenhum erro.',ic:'alvo',ok:function(x){return x.perfeitas>=10}},
    {id:'p25',t:'Precisão de máquina',d:'Conclua 25 lições sem nenhum erro.',ic:'alvo',ok:function(x){return x.perfeitas>=25}},
    {id:'x100',t:'Primeira centena',d:'Some 100 XP.',ic:'bolt',ok:function(x){return x.xp>=100}},
    {id:'x500',t:'500 XP',d:'Some 500 XP.',ic:'bolt',ok:function(x){return x.xp>=500}},
    {id:'x1000',t:'Mil XP',d:'Some 1.000 XP.',ic:'bolt',ok:function(x){return x.xp>=1000}},
    {id:'x5000',t:'Cinco mil XP',d:'Some 5.000 XP.',ic:'bolt',ok:function(x){return x.xp>=5000}},
    {id:'un1',t:'Unidade concluída',d:'Conclua todas as lições de uma unidade.',ic:'trofeu',ok:function(x){return x.unidades>=1}},
    {id:'un3',t:'Três unidades',d:'Conclua 3 unidades.',ic:'trofeu',ok:function(x){return x.unidades>=3}},
    {id:'un5',t:'Cinco unidades',d:'Conclua 5 unidades.',ic:'trofeu',ok:function(x){return x.unidades>=5}},
    {id:'un10',t:'Dez unidades',d:'Conclua 10 unidades.',ic:'trofeu',ok:function(x){return x.unidades>=10}},
    {id:'recomeco',t:'De volta ao jogo',d:'Conclua uma lição depois de ficar sem vidas.',ic:'refazer',ok:function(x){return !!x.extra.recomecou}},
    {id:'revisao',t:'Treino extra',d:'Refaça uma lição que você já tinha concluído.',ic:'refazer',ok:function(x){return !!x.extra.revisao}}
  ];
  /* dá ao jogador as conquistas que ele já cumpriu e ainda não tinha; devolve a lista das novas */
  function conceder(extra){
    var cc=c(),x=ctxConq(extra),novas=[],t=ENIAC.hoje();
    CONQ.forEach(function(q){if(!cc.conq[q.id]&&q.ok(x))novas.push(q)});
    novas.forEach(function(q){grava('c-'+q.id,t)});
    return novas;
  }
  function listaConquistas(){
    var cc=c();
    return CONQ.map(function(q){return {id:q.id,t:q.t,d:q.d,ic:q.ic,data:cc.conq[q.id]||''}});
  }

  /* ----- concluir uma lição: é AQUI (e só aqui) que o XP entra no total ----- */
  function registrar(licaoObj,s){
    var antes=c().lic[licaoObj.id]||null,t=ENIAC.hoje(),xpAntes=xpTotal(),nvAntes=nivelDe(xpAntes).n;
    var estr=s.erros===0?3:(s.erros<=2?2:1);
    grava('l-'+licaoObj.id,{n:(antes?antes.n:0)+1,e:Math.max(antes?antes.e:0,estr),d:t,x:(antes?antes.x:0)+s.xp,a:(antes?antes.a:0)+s.acertos,t:(antes?antes.t:0)+s.respostas});
    if(!c().dias[compacta(t)])grava('d-'+compacta(t),1);
    var novas=conceder({recomecou:(s.reinicios||0)>0,revisao:!!antes});
    var xpDepois=xpTotal(),nv=nivelDe(xpDepois);
    return {estrelas:estr,precisao:s.respostas?Math.round(100*s.acertos/s.respostas):100,xp:s.xp,xpTotal:xpDepois,nivel:nv,subiu:nv.n>nvAntes,seq:seq(),novas:novas,vidas:s.vidas,primeira:!antes,
      proxima:(function(){var m=ENIAC.meta(licaoObj.id);return m?(ENIAC.ordem()[m.g+1]||null):null})()};
  }

  /* ----- apagar tudo do ENIAC (os apagamentos também vão para a nuvem) ----- */
  function reiniciar(){
    STORE.live('jogo').forEach(function(r){STORE.del('jogo',r.k)});
    C=null;
    try{STORE.pref().jogoMig=1;STORE.save()}catch(e){}
  }

  /* ----- migração do Codivara (a página antiga guardava tudo em localStorage['codivara:progresso:v1']) -----
     Roda uma vez: só se o grupo "jogo" estiver vazio. Os registros importados levam a data do último dia de prática (e não "agora"),
     assim, se já existir progresso do ENIAC na nuvem, ele vence. As lições l1..l4 viram u01l01..u01l04. */
  var LEGADO='codivara:progresso:v1';
  function migrar(){
    var pref=STORE.pref();
    if(pref.jogoMig)return false;
    if(STORE.live('jogo').length){pref.jogoMig=1;STORE.save();return false}
    var raw=null;try{raw=localStorage.getItem(LEGADO)}catch(e){}
    if(!raw)return false;
    var o=null;try{o=JSON.parse(raw)}catch(e){}
    if(!o||typeof o!=='object'){pref.jogoMig=1;STORE.save();return false}
    var ultimo=(typeof o.ultimoDia==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(o.ultimoDia))?o.ultimoDia:null;
    var u=ultimo?Math.min(Date.now(),new Date(ultimo+'T12:00:00').getTime()):Date.now();
    if(!isFinite(u))u=Date.now();
    var regs={},n=0;
    function add(k,v){regs[k]={v:v,u:u};n++}
    var xp=Math.floor(+o.xp)||0;if(xp>0)add('xp0',Math.min(xp,1e9));
    var MAPA={l1:'u01l01',l2:'u01l02',l3:'u01l03',l4:'u01l04'};
    Object.keys(MAPA).forEach(function(k){
      var x=o.licoes&&typeof o.licoes==='object'?o.licoes[k]:null;
      if(x&&x.feita===true)add('l-'+MAPA[k],{n:inteiro(x.vezes,1,1e6),e:x.semErros===true?3:(+x.melhor>=80?2:1),d:ultimo||ENIAC.hoje(),x:0,a:0,t:0});
    });
    var sn=inteiro(o.sequencia,0,400);
    if(ultimo&&sn>0)for(var i=0;i<sn;i++)add('d-'+compacta(ENIAC.somaDias(ultimo,-i)),1);
    var CM={primeira:'l1',perfeita:'p1',seq3:'s3'};
    Object.keys(CM).forEach(function(k){var d=o.conquistas&&o.conquistas[k];if(typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d))add('c-'+CM[k],d)});
    pref.jogoMig=1;
    if(!n){STORE.save();return false}
    STORE.merge({jogo:regs},'migração',true);
    C=null;
    STORE.save(true);
    conceder({});
    return true;
  }

  return {licao:licao,feita:feita,estrelas:estrelas,xpTotal:xpTotal,cfg:cfg,setCfg:setCfg,conquistas:conquistas,listaConquistas:listaConquistas,estat:estat,
    nivelDe:nivelDe,nivel:nivel,seq:seq,liberada:liberada,liberadaId:liberadaId,proxima:proxima,maisFraca:maisFraca,contagem:contagem,unidadeInfo:unidadeInfo,resumo:resumo,
    registrar:registrar,reiniciar:reiniciar,migrar:migrar,conceder:conceder,
    _dias:function(){return Object.keys(c().dias).sort()}};
})();
