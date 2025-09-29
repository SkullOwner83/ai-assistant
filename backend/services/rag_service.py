from typing import Optional
import numpy as np
import chromadb
from uuid import uuid4
from fastapi import UploadFile
from datetime import datetime, timezone
from services.embeddings import Embeddings
from services.dataset_procesator import DatasetProcesator
from utils.file import File

class RAGService():
    def __init__(self):
        self.embeddings_service = Embeddings()
        self.chroma_client = chromadb.PersistentClient()
        self.chroma_collection = self.chroma_client.get_or_create_collection(name='Documents')

    async def process_file(self, file: UploadFile) -> None:
        file_hash = File.get_hash(file)
        exists = self.chroma_collection.get(where={"source": file_hash})

        if not exists["ids"]:
            document_chunks = await DatasetProcesator.chunk_file(file)
            embeddings_chunks = self.embeddings_service.get_document_embeddings(document_chunks)
            texts = [doc.page_content for doc in document_chunks]

            self.chroma_collection.add(
                documents=texts,
                embeddings=embeddings_chunks,
                ids=[str(uuid4()) for _ in texts],
                metadatas=[
                    {
                        'chunk_index': i,
                        'source': file_hash,
                        'filename': file.filename,
                        'content_type': file.content_type,
                        'created_at': datetime.now(timezone.utc).isoformat(),
                        'size': getattr(file, "size", None),
                        'page_count': len(texts)
                    }
                    for i in range(len(texts))
                ]
            )

    def search(self, query: str, file_hash: Optional[str] = None) -> list[str]:
        query_embedding = self.embeddings_service.get_embedding(query)
        query_embedding = np.array([query_embedding], dtype='float32')

        results = self.chroma_collection.query(
            query_embeddings=query_embedding,
            n_results=5,
            where={"source": file_hash} if file_hash else None
        )

        if results and results.get('documents') and results['documents'][0]:
            return results['documents'][0]
        
        return []