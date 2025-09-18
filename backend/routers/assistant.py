import datetime
import os
import chromadb
from uuid import uuid4
from typing import Optional

import numpy as np
from services.embeddings import Embeddings
from fastapi import APIRouter, Depends, Form, UploadFile, status
from sqlalchemy.orm import Session
from infraestructure.database import open_connection
from infraestructure.ia_client import IAClient
from services.dataset_procesator import DatasetProcesator
from services.chat_service import ChatService
from schemas.askresponse_schema import AskResponseSchema

API_KEY = os.getenv('OPENAI_KEY')
ai_client = IAClient(API_KEY)
chroma_client = chromadb.PersistentClient()
chroma_collection = chroma_client.get_or_create_collection(name='Documents')
embeddings = Embeddings(ai_client)
chat_service = ChatService()

router = APIRouter(
    prefix="/assistant",
    tags=["assistant"]
)

import hashlib
from datetime import datetime, timezone

def get_hash(file: UploadFile) -> str:
    content = file.file.read()
    file.file.seek(0)
    hash = hashlib.md5(content).hexdigest()
    return hash

@router.post('/', response_model=AskResponseSchema, status_code=status.HTTP_200_OK)
async def ask(question: str = Form(...), conversation_id: Optional[int] = Form(None), file: Optional[UploadFile] = None, db_session: Session = Depends(open_connection)) -> dict[str, str]:
    context_text = None
    conversation_created = None

    if file:
        file_hash = get_hash(file)
        exists = chroma_collection.get(where={"source": file_hash})

        if not exists["ids"]:
            document_chunks = await DatasetProcesator.chunk_file(file)
            embeddings_chunks = await embeddings.get_document_embeddings(document_chunks)
            texts = [doc.page_content for doc in document_chunks]

            chroma_collection.add(
                documents=texts,
                embeddings=embeddings_chunks,
                ids=[str(uuid4()) for _ in texts],
                metadatas=[
                    {
                        'chunk_index': i,
                        'source': file_hash,
                        'filename': file.filename,
                        'content_type': file.content_type,
                        'upload_date': datetime.now(timezone.utc).isoformat(),
                        'size': getattr(file, "size", None),
                        'page_count': len(texts)
                    }
                    for i in range(len(texts))
                ]
            )

    query_embedding = embeddings.get_embedding(question)
    query_embedding = np.array([query_embedding], dtype='float32')
    results = chroma_collection.query(query_embeddings=query_embedding, n_results=5)
    
    if results and results.get('documents') and results['documents'][0]:
        context_text = results['documents'][0][0]

        # relevant_chunks = await embeddings.search(question, embeddings_chunks, texts)
        # context_text = relevant_chunks[0]

    #prompt = f"Context: {context_text}\n\nQuestion: {question}" if context_text else f"question: {question}"
    #response = await ai_client.ask(prompt)
    response = context_text or "No se encontró información relevante."

    if not conversation_id:
        conversation_created = chat_service.create_conversation(question[:50], db_session)
        conversation_id = conversation_created.idConversation

    chat_service.create_message(question, 'Client', conversation_id, db_session)
    answer = chat_service.create_message(response, 'Server', conversation_id, db_session)
    return AskResponseSchema(
        answer=answer,
        conversation=conversation_created
    )