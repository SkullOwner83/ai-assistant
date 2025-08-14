from sqlalchemy import Column, Integer, String, Text
from database import Base

class Message(Base):
    __tablename__ = 'messages'
    idMessage = Column(Integer, primary_key=True, index=True)
    messageFrom = Column(String(255))
    content = Column(Text)