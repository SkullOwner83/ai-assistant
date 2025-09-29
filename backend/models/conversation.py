from sqlalchemy import Column, DateTime, Integer, String, func
from infraestructure.database import Base

class Conversation(Base):
    __tablename__ = 'conversations'
    idConversation = Column(Integer, primary_key=True, nullable=False, index=True)
    title = Column(String(255), nullable=False)
    createdAt = Column(DateTime, nullable=False, server_default=func.current_timestamp())
    fileHash = Column(String(32), nullable=False)