from sqlalchemy import Column, Integer, String
from database import Base

class Conversations():
    __tablename__ = 'conversations'
    idConversation = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)