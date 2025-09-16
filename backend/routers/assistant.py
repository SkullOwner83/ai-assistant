import os
import chromadb
from uuid import uuid4
from typing import Optional
from services.embeddings import Embeddings
from fastapi import APIRouter, Depends, Form, UploadFile, status
from sqlalchemy.orm import Session
from infraestructure.database import open_connection
from infraestructure.ia_client import IAClient
from services.dataset_procesator import DatasetProcesator
from services.chat_service import ChatService
from schemas.askresponse_schema import AskResponseSchema

from chromadb.config import Settings

API_KEY = os.getenv('OPENAI_KEY')
ai_client = IAClient(API_KEY)
chroma_client = chromadb.Client()
chroma_collection = chroma_client.get_or_create_collection('Documents')
embeddings = Embeddings(ai_client)
chat_service = ChatService()

router = APIRouter(
    prefix="/assistant",
    tags=["assistant"]
)

@router.post('/', response_model=AskResponseSchema, status_code=status.HTTP_200_OK)
async def ask(question: str = Form(...), conversation_id: Optional[int] = Form(None), file: Optional[UploadFile] = None, db_session: Session = Depends(open_connection)) -> dict[str, str]:
    context_text = None
    conversation_created = None

    if file:
        document_chunks = await DatasetProcesator.chunk_file(file)
        texts = [doc.page_content for doc in document_chunks]
        embeddings_chunks = await embeddings.get_document_embeddings(document_chunks)
        relevant_chunks = await embeddings.search(question, embeddings_chunks, texts)
        context_text = relevant_chunks[0]

        chroma_collection.add(
            documents=texts,
            embeddings=embeddings_chunks,
            metadatas=[{'source': file.filename}] * len(texts),
            ids=[str(uuid4()) for _ in texts]
        )

    #prompt = f"Context: {context_text}\n\nQuestion: {question}" if context_text else f"question: {question}"
    #response = await ai_client.ask(prompt)
    response = context_text

    if not conversation_id:
        conversation_created = chat_service.create_conversation(question[:50], db_session)
        conversation_id = conversation_created.idConversation

    chat_service.create_message(question, 'Client', conversation_id, db_session)
    answer = chat_service.create_message(response, 'Server', conversation_id, db_session)
    return AskResponseSchema(
        answer=answer,
        conversation=conversation_created
    )