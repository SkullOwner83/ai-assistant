CREATE DATABASE ai_assistant;
USE ai_assistant;

CREATE TABLE Conversations(
	idConversation INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255)
);

CREATE TABLE Messages(
	idMessage INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    messageFrom VARCHAR(250) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    content TEXT NOT NULL,
    conversationId INT NOT NULL,
	FOREIGN KEY (conversationId) REFERENCES Conversations(idConversation)
);