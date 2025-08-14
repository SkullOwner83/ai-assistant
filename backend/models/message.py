from sqlalchemy import Column, Integer, String, Text, ForeignKey
from database import Base

class Message(Base):
    __tablename__ = 'messages'
    idMessage = Column(Integer, primary_key=True, index=True)
    conversationId = Column(Integer, ForeignKey('conversations.idConversation'))
    messageFrom = Column(String(255))
    content = Column(Text)