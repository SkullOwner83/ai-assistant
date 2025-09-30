USE ai_assistant;

SET @file_hash = "7e158dc3b9ce7dba84b37cb7009ea31c";
INSERT INTO Conversations (title, fileHash) VALUES ("Conversación de prueba.", @file_hash);
SET @conversation_id = LAST_INSERT_ID();
INSERT INTO Messages (messageFrom, createdAt, content, conversationId) VALUES ("Client", NOW(), "¡Hola!", @conversation_id);
INSERT INTO Messages (messageFrom, createdAt, content, conversationId) VALUES ("Server", NOW(), "¡Hola! soy tu asistente virtual. ¿Cómo puedo ayudarte?", @conversation_id);
INSERT INTO Messages (messageFrom, createdAt, content, conversationId) VALUES ("Client", NOW(), "¿Cómo funciona este asistente?", @conversation_id);
INSERT INTO Messages (messageFrom, createdAt, content, conversationId) VALUES ("Server", NOW(), "Puedes preguntarme cualquier cosa y te responderé al instante. Además, si subes un archivo arrastrándolo al chat, podré analizar su contenido y responder preguntas basadas en él. Ten en cuenta que puedo procesar texto, PDFs y archivos compatibles, y trataré de darte respuestas precisas según la información disponible en el archivo.", @conversation_id);