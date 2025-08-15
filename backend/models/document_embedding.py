from sqlalchemy import Column, Integer
from database import Base

class DocumentEmbedding(Base):
    __tablename__ = 'document_embeddings'
    idDocumentEmbedding = Column(Integer, primary_key=True, index=True)
