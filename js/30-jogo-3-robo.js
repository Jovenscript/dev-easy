/* ===== ENIAC · 3 · o robozinho =====
   Desenho original, sem nome: cabeça arredondada com tela escura, olhos de LED na cor de destaque do tema, antena com uma lâmpada na ponta
   (uma lembrança das válvulas dos primeiros computadores) e três luzinhas no peito.
   ENIAC.robo(estado, largura)  ->  HTML de um <svg> decorativo.   Estados: normal, feliz, errou, pensando, comemorando.
   As cores e o piscar vêm de css/jogo.css (classes rb-*); com "reduzir movimento" ligado nada se mexe. */
ENIAC.robo=(function(){
  var ESTADOS={normal:1,feliz:1,errou:1,pensando:1,comemorando:1};

  /* rosto (dentro da tela escura, que vai de x 28 a 92 e de y 38 a 86) */
  function rosto(e){
    var L='class="rb-led"',T='class="rb-traco"';
    switch(e){
      case 'feliz':
        return '<path '+T+' d="M40 62Q46.5 50 53 62"/><path '+T+' d="M67 62Q73.5 50 80 62"/>'+
          '<path '+T+' d="M48 71Q60 84 72 71"/><ellipse class="rb-bochecha" cx="36" cy="72" rx="4.6" ry="3"/><ellipse class="rb-bochecha" cx="84" cy="72" rx="4.6" ry="3"/>';
      case 'errou':
        return '<rect '+L+' x="41" y="54" width="11" height="12" rx="5" /><rect '+L+' x="68" y="54" width="11" height="12" rx="5"/>'+
          '<path '+T+' d="M37 51L53 45"/><path '+T+' d="M83 51L67 45"/><path '+T+' d="M50 77Q60 69 70 77"/>'+
          '<path class="rb-gota" d="M95 35Q100.5 43.5 95 48.5Q89.5 43.5 95 35Z"/>';
      case 'pensando':
        return '<rect class="rb-led rb-olho" x="44" y="47" width="11" height="17" rx="5.5"/><rect class="rb-led rb-olho" x="71" y="47" width="11" height="17" rx="5.5"/>'+
          '<path '+T+' d="M68 42L83 38.5"/><path '+T+' d="M53 76H66"/>'+
          '<circle class="rb-pensa p1" cx="103" cy="23" r="2.4"/><circle class="rb-pensa p2" cx="111" cy="14" r="3.4"/><circle class="rb-pensa p3" cx="121" cy="5.5" r="4.4"/>';
      case 'comemorando':
        return '<path '+T+' d="M39 63Q46.5 48 54 63"/><path '+T+' d="M66 63Q73.5 48 81 63"/>'+
          '<path class="rb-boca" d="M46 68H74Q74 84 60 84Q46 84 46 68Z"/><ellipse class="rb-bochecha" cx="35" cy="73" rx="4.6" ry="3"/><ellipse class="rb-bochecha" cx="85" cy="73" rx="4.6" ry="3"/>';
      default:
        return '<rect class="rb-led rb-olho" x="41" y="49" width="11" height="17" rx="5.5"/><rect class="rb-led rb-olho" x="68" y="49" width="11" height="17" rx="5.5"/>'+
          '<path '+T+' d="M51 75Q60 80 69 75"/>';
    }
  }
  /* braços: abaixados, ou levantados na comemoração */
  function bracos(e){
    if(e==='comemorando')
      return '<path class="rb-braco-o" d="M33 106L9 74"/><path class="rb-braco" d="M33 106L9 74"/><circle class="rb-mao" cx="8" cy="72" r="6.6"/>'+
        '<path class="rb-braco-o" d="M87 106L111 74"/><path class="rb-braco" d="M87 106L111 74"/><circle class="rb-mao" cx="112" cy="72" r="6.6"/>';
    return '<rect class="rb-braco-r" x="20" y="101" width="12" height="25" rx="6"/><rect class="rb-braco-r" x="88" y="101" width="12" height="25" rx="6"/>';
  }
  function brilhos(e){
    if(e!=='comemorando')return '';
    var P='M0-7C.6-2.6 2.6-.6 7 0 2.6.6.6 2.6 0 7-.6 2.6-2.6.6-7 0-2.6-.6-.6-2.6 0-7Z';
    return '<path class="rb-faisca f1" transform="translate(-1 36)" d="'+P+'"/><path class="rb-faisca f2" transform="translate(121 34) scale(.8)" d="'+P+'"/>'+
      '<path class="rb-faisca f3" transform="translate(112 8) scale(.6)" d="'+P+'"/><path class="rb-faisca f4" transform="translate(6 10) scale(.7)" d="'+P+'"/>';
  }
  return function(estado,largura,extra){
    var e=ESTADOS[estado]?estado:'normal',w=largura||96,h=Math.round(w*132/140);
    return '<svg class="jg-robo r-'+e+(extra?' '+extra:'')+'" width="'+w+'" height="'+h+'" viewBox="-10 0 140 132" aria-hidden="true" focusable="false">'+
      '<g class="rb-all">'+bracos(e)+
      '<rect class="rb-corpo" x="35" y="99" width="50" height="30" rx="13"/>'+
      '<rect class="rb-painel" x="45" y="107" width="30" height="14" rx="5"/>'+
      '<circle class="rb-lamp l1" cx="53" cy="114" r="2.8"/><circle class="rb-lamp l2" cx="60" cy="114" r="2.8"/><circle class="rb-lamp l3" cx="67" cy="114" r="2.8"/>'+
      '<rect class="rb-pesco" x="52" y="91" width="16" height="11" rx="3"/>'+
      '<rect class="rb-haste" x="58" y="15" width="4" height="17" rx="2"/><circle class="rb-bulbo" cx="60" cy="11" r="7.5"/><circle class="rb-reflexo" cx="57.4" cy="8.4" r="2.1"/>'+
      '<rect class="rb-orelha" x="8" y="52" width="14" height="27" rx="7"/><rect class="rb-orelha" x="98" y="52" width="14" height="27" rx="7"/>'+
      '<rect class="rb-cabeca" x="19" y="29" width="82" height="66" rx="25"/>'+
      '<rect class="rb-tela" x="28" y="38" width="64" height="48" rx="18"/>'+
      rosto(e)+'</g>'+brilhos(e)+'</svg>';
  };
})();
