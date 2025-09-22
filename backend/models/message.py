from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, func
from infraestructure.database import Base

class Message(Base):
    __tablename__ = 'messages'
    idMessage = Column(Integer, primary_key=True, autoincrement=True, nullable=False, index=True)
    conversationId = Column(Integer, ForeignKey('conversations.idConversation'), nullable=False)
    messageFrom = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    createdAt = Column(DateTime, nullable=False, server_default=func.current_timestamp())