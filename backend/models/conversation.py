from sqlalchemy import Column, Integer, LargeBinary, String
from infraestructure.database import Base

class Conversation(Base):
    __tablename__ = 'conversations'
    idConversation = Column(Integer, primary_key=True, nullable=False, index=True)
    title = Column(String(255), nullable=False)