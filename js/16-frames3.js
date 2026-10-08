/* ===== fluxos passo a passo de IA ===== */

FLOW.treino={n:['Dados com resposta','Treino','Modelo','Prova (teste)','Uso real'],s:[
 [[0],'Você junta **exemplos com a resposta certa**: leituras de vibração e temperatura e, ao lado, se a máquina quebrou depois. Isso se chama **dado rotulado**. Quanto melhores os dados, melhor o modelo.'],
 [[0,3],'Antes de tudo, você **guarda uma parte** dos exemplos, uns 20%, num cofre. Eles **não entram no treino**: servem de prova no final.'],
 [[0,1],'**Treino**: o algoritmo olha o resto dos exemplos, chuta uma resposta, **mede o erro** e ajusta os próprios números. Repete milhares de vezes, e o erro vai caindo. Na biblioteca scikit-learn, isso é o comando `fit`.'],
 [[1,2],'O resultado do treino é o **modelo**: um arquivo com os números ajustados, que guardam o padrão. Os exemplos em si não ficam lá dentro.'],
 [[2,3],'**Prova**: o modelo faz previsões nos exemplos guardados, e você compara com a resposta certa. Se foi bem no treino e mal na prova, ele **decorou** em vez de aprender. Isso é o overfitting.'],
 [[2,4],'**Uso real**: chegam dados novos, o modelo prevê (`predict`) e o sistema age, por exemplo avisando que a máquina deve ser inspecionada.'],
 [[4,0],'Com o tempo o mundo muda: máquina nova, outro fornecedor, outro turno. O modelo **envelhece**. Os resultados reais viram dados novos, e o ciclo recomeça.']]};

FLOW.rag={n:['Pergunta','Busca nos documentos','Trechos relevantes','Modelo de linguagem','Resposta com fonte'],s:[
 [[0],'Alguém pergunta: "Como troco a correia da esteira 2?". O modelo sozinho **não conhece** os manuais da sua empresa.'],
 [[0,1],'O sistema transforma a pergunta em um **embedding** e **busca** na base os trechos de significado mais parecido. A base foi preparada antes: manuais cortados em pedaços e guardados num banco vetorial.'],
 [[1,2],'A busca devolve os **trechos mais relevantes**, por exemplo as partes do manual da esteira 2 que falam de correia.'],
 [[2,3],'O sistema monta o **prompt**: instruções, mais os trechos, mais a pergunta. É esse pacote que o modelo recebe.'],
 [[3,4],'O modelo **responde usando aqueles trechos** e cita de onde tirou, como o manual e a página. Se a resposta não estiver nos trechos, ele deve dizer que não achou.'],
 [[4,0],'Quem perguntou **confere a fonte**. Se o manual mudar, basta atualizar o documento, sem retreinar nada. Mas se a busca trouxer o trecho errado, a resposta sai errada.']]};

FLOW.agente={n:['Objetivo','Modelo (pensa)','Ferramenta (age)','Resultado (observa)','Aprovação humana'],s:[
 [[0],'Você dá um **objetivo**: "ache as ordens de serviço atrasadas e avise o responsável".'],
 [[0,1],'O modelo **pensa**: preciso listar as ordens abertas. Ele escolhe uma ferramenta entre as que o sistema deixou à disposição.'],
 [[1,2],'O sistema **executa a ferramenta**, por exemplo uma consulta ao sistema de manutenção, com os parâmetros que o modelo pediu.'],
 [[2,3],'O resultado volta como texto: a lista de ordens. O modelo **observa** e decide o próximo passo. O ciclo pensa, age e observa se repete.'],
 [[3,1],'Ele vê que 3 ordens estão atrasadas, mas falta saber quem é o responsável. Pede outra ferramenta e continua.'],
 [[1,4],'Antes de um passo **sensível ou irreversível**, como enviar a mensagem, o sistema **pede aprovação humana**. Permissões mínimas e registro das ações fazem parte do projeto.'],
 [[4,2],'Com o OK, a ferramenta envia a mensagem e o agente entrega o resumo do que fez. Sem o OK, ele para.']]};

FLOW.mcp={n:['Assistente de IA (cliente)','Servidor MCP','Ferramenta ou dado','Você aprova'],s:[
 [[0,1],'O assistente, que é o **cliente MCP**, se conecta a um **servidor MCP**, como o de arquivos, o da agenda ou o de um banco de dados.'],
 [[1],'O servidor **descreve o que sabe fazer**: lista as ferramentas, como `ler_arquivo`, e os dados que oferece, cada um com nome e parâmetros. Todos os servidores falam o mesmo padrão.'],
 [[0,3],'Você **aprova o que o assistente pode usar**. Em geral, ações sensíveis pedem confirmação. Servidor desconhecido é risco: use só de fontes confiáveis.'],
 [[0,1],'Você pede: "resuma as notas da pasta de projetos". O modelo escolhe a ferramenta certa e **manda o pedido** ao servidor no formato padrão.'],
 [[1,2],'O servidor **executa de verdade**: abre a pasta, lê o arquivo, consulta o banco. Ele só chega até onde as permissões deixam.'],
 [[2,1],'O resultado volta pelo servidor até o assistente, que usa o conteúdo para montar a resposta.'],
 [[0],'O mesmo servidor atende **vários assistentes**, e o mesmo assistente usa **vários servidores**. É a tomada padrão: um plugue só.']]};
