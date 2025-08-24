from sqlalchemy import Column, Integer, String
from infraestructure.database import Base

class Conversation(Base):
    __tablename__ = 'conversations'
    idConversation = Column(Integer, primary_key=True, index=True)
    title = Column(String(255))

    class Config:
        orm_mode = True