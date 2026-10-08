/* ===== pronúncia extra (parte 2): indústria, automação e eletrônica; só muda o áudio ===== */
Object.assign(PRONX,{
 ABB:'á bê bê',ABS:'á bê ésse',ADC:'á dê cê',AVEVA:'avéva',AVR:'á vê érre',AutoCAD:'ótou cád',CAE:'cê á é',CANopen:'cân ôupen',CATIA:'catía',
 CMMS:'cê ême ême ésse',CRC:'cê érre cê',EAM:'é á ême',GMAO:'gê ême á ô',ESP32:'é ésse pê trinta e dois',Espressif:'espréssif',EtherCAT:'íther cát',
 Ethernet:'íther nét',Engeman:'enjêman',Fanuc:'fânuc',FreeCAD:'fri cád',Fusion:'fiúchon',GPIO:'gê pê í ô',GRBL:'gê érre bê éle',Heidenhain:'ráidenráin',
 KUKA:'cúca',LED:'léd',LEDs:'léds',LPWAN:'éle pê dáblio á ene',Marlin:'márlin',MCU:'ême cê u',MicroPython:'máicro páiton',Microchip:'máicro chip',
 Mitsubishi:'mitsubíchi',NA:'ene á',NF:'ene éfe',NFC:'ene éfe cê',NXP:'ene xis pê',Omron:'ômron',PIC:'pique',PID:'pê í dê',PT100:'pê tê cem',PWM:'pê dáblio ême',
 RFID:'érre éfe í dê',RTOS:'érre tê ô ésse',RTU:'érre tê u',SPI:'ésse pê í',STEP:'estép',STL:'ésse tê éle',STM32:'ésse tê ême trinta e dois',
 STMicroelectronics:'ésse tê máicro eletrônics',SolidWorks:'sólid uórks',Siemens:'símens',Rockwell:'róc uél',Schneider:'chnáider',Sparkplug:'espárc plâg',
 TOTVS:'tótus',Protheus:'protêus',Sinumerik:'sinumérik',UART:'uárt',UA:'u á',WEG:'vê é gê',Yaskawa:'iascáua',Windows:'uíndous',Bluetooth:'blutúf',Profibus:'profíbus',
 I2C:'ai dois cê',IE2:'í é dois',IE3:'í é três',IE4:'í é quatro',QR:'quiu érre',Ladder:'léder',ladder:'léder',
 broker:'brôquer',gateway:'guêitiuêi',gateways:'guêitiuêis',switches:'suítches',firmware:'fârmuér',shield:'chíld',shields:'chílds',sketch:'esquétch',
 jumper:'djâmper',jumpers:'djâmpers',setpoint:'sét póint',watchdog:'uótch dógue',overshoot:'ôver chút',fieldbus:'fíld bus',layout:'leiáut',
 byte:'baite',bytes:'baites'
});
PRONSX.push(
 [/\bNB-IoT\b/g,'ene bê ai ôu tê'],[/\bLTE-M\b/g,'éle tê é ême'],[/\bRS-485\b/g,'érre ésse quatrocentos e oitenta e cinco'],[/\bRS-232\b/g,'érre ésse duzentos e trinta e dois'],
 [/\bNR-(\d+)/g,'ene érre $1'],[/\bESP-IDF\b/g,'é ésse pê í dê éfe'],[/\bG-code\b/g,'gê côud'],
 [/\bG01 X10 Y20 F300\b/g,'gê zero um, xis dez, ípsilon vinte, éfe trezentos'],[/\bPI System\b/g,'pái sístem'],[/\bRaspberry Pi\b/g,'ráspberi pái'],
 [/Supervisory Control And Data Acquisition/g,'supervízori contról énd dêita ékuizíchon'],[/61131-3/g,'sessenta e um mil cento e trinta e um, parte três'],
 [/\b(\d+(?:,\d+)?) mA\b/g,function(m,n){return n+(n==='0'||n==='1'?' miliampère':' miliampères')}],[/\bmA\b/g,'miliampères'],
 [/(\d+) ?°C/g,function(m,n){return n+(n==='1'?' grau Celsius':' graus Celsius')}],[/\b(\d+) V\b/g,'$1 volts'],
 [/\bQR code\b/g,'quiu érre côud'],[/Texas Instruments/g,'téxas ínstruments'],[/Universal Robots/g,'iunivérsal rôbots'],
 [/overall equipment effectiveness/gi,'ôverol ecuípment efétivnes'],[/manufacturing execution systems?/gi,'manufáchuring ecsequiúchon sístem'],
 [/enterprise resource planning/gi,'énterpraiz rissórs plânin'],[/computerized maintenance management systems?/gi,'compiuteraizd mêintenans ménadjment sístem']
);
