/* ===== fluxos passo a passo de automação industrial ===== */

FLOW.piramide={n:['Campo','CLP','SCADA / IHM','MES','ERP'],s:[
 [[0],'**Campo**, o chão de fábrica de verdade: sensores, botões, motores, válvulas, inversores. Um sensor percebe que uma caixa passou. Um motor gira, uma válvula abre. Aqui o sinal é elétrico: liga, desliga, 4 a 20 mA.'],
 [[0,1],'O **CLP** lê os sensores e aciona os atuadores seguindo o programa. Decide em **milissegundos**: caixa passou, liga a esteira. Aqui o tempo de resposta é crítico, e o comando não pode esperar por ninguém.'],
 [[1,2],'A **IHM** e o **SCADA** mostram o que o CLP está fazendo: telas com o desenho da linha, alarmes, botões de partida. A IHM fica na máquina. O SCADA reúne vários CLPs, guarda o histórico e avisa quando algo foge do normal.'],
 [[2,3],'O **MES** acompanha a **ordem de produção**: o que está sendo feito em cada máquina, quantas peças saíram, quantas foram refugo, quanto tempo a máquina parou e por quê. Ele junta os dados das máquinas com a ordem.'],
 [[3,4],'O **ERP** cuida do **negócio**: pedidos de clientes, compras, estoque, custos, notas fiscais. Ele diz **o que produzir e para quando**. O MES diz **o que foi produzido de verdade**.'],
 [[4,3,2,1],'**As ordens descem e os dados sobem.** O ERP manda a ordem de produção para baixo, até chegar ao CLP como comando. Os números sobem de volta: peças contadas, paradas, refugo. Quanto mais embaixo, mais rápido: o CLP responde em milissegundos e o ERP em minutos ou horas.'],
 [[0,1,2,3,4],'Na **Indústria 4.0**, a pirâmide fica mais achatada: o dado do sensor pode chegar direto à nuvem e à análise, por protocolos como MQTT e OPC UA, sem passar camada por camada. Mas o controle rápido e seguro da máquina continua local, no CLP.']]};

FLOW.scan={n:['Ler entradas','Executar programa','Escrever saídas','Comunicar e conferir'],s:[
 [[0],'**Passo 1: ler as entradas.** O CLP olha todos os sensores e botões e **tira uma foto** deles: apertado ou solto, ligado ou desligado, valor analógico. A foto fica guardada na memória e **não muda** até o próximo ciclo.'],
 [[1],'**Passo 2: executar o programa.** Do começo ao fim, degrau por degrau, usando a **foto das entradas** e as memórias internas. Ele calcula o que cada saída deveria fazer, mas **ainda não liga nada de verdade**.'],
 [[2],'**Passo 3: escrever as saídas.** Só agora o CLP copia o resultado para os terminais de saída: o contator liga, a válvula abre, a lâmpada acende. Tudo de uma vez, no fim do ciclo.'],
 [[3],'**Passo 4: comunicar e conferir.** Atende a IHM e as redes, confere se há falha de hardware e vigia o tempo do ciclo: o **cão de guarda** (watchdog) dá erro se o ciclo demorar demais. Depois volta ao passo 1.'],
 [[0,1,2,3],'O ciclo todo leva de **menos de 1 ms a algumas dezenas de ms**, conforme o CLP e o tamanho do programa, e se repete sem parar. Esse tempo é chamado de **tempo de varredura** (scan time).'],
 [[0],'Consequência: um **pulso mais curto que o ciclo pode passar despercebido**. Se um sensor liga e desliga entre uma foto e a próxima, o programa nunca vê. Para sinais muito rápidos existem entradas de contagem rápida e interrupções.'],
 [[1,2],'Outra consequência: se o programa mandar na **mesma saída em dois lugares**, em geral vale a última, porque a saída só é copiada no fim (muitos softwares avisam). É um erro comum de quem está começando.']]};

FLOW.iiot={n:['Máquina','Sensor / CLP','Gateway de borda','Rede segura','Painel e alertas'],s:[
 [[0],'Uma **máquina antiga, sem rede**: um motor, uma bomba, uma prensa. Ninguém sabe a vibração nem a temperatura dela entre uma ronda e outra, e o defeito só aparece quando a linha para.'],
 [[0,1],'Há dois jeitos de tirar dados dela. Um é **colar um sensor por fora**, como um de vibração e temperatura no motor, sem mexer no CLP. O outro é **ler o que o CLP já sabe**, por Modbus ou OPC UA.'],
 [[1,2],'O **gateway de borda** fica perto da máquina. Ele lê os sensores, **converte** os protocolos para um formato comum, **filtra e resume** (manda a média de cada minuto em vez de mil leituras por segundo) e **guarda os dados** se a rede cair.'],
 [[2,3],'Os dados saem por uma rede **separada e protegida**: firewall, conexão que parte de dentro para fora e nenhuma porta aberta para dentro da fábrica. Em geral usa MQTT com criptografia (TLS) até o servidor ou a nuvem.'],
 [[3,4],'A plataforma guarda o histórico e calcula indicadores, como o OEE e a tendência da vibração. O painel **dispara alertas**: "a vibração do motor 3 subiu 40% em duas semanas".'],
 [[4,0],'A manutenção **age**: inspeciona o motor antes de quebrar. O dado só vale quando vira ação. E o sensor novo também precisa de manutenção e de calibração, como qualquer equipamento.'],
 [[0,1,2,3,4],'O ponto sensível é a **segurança**: tudo o que se conecta vira um alvo possível. Por isso a regra é conectar só o necessário, separar a rede da fábrica (OT) da rede do escritório (TI) e nunca expor um CLP direto à internet.']]};
