import os
from typing import Optional
from services.embeddings import Embeddings
from fastapi import APIRouter, Depends, Form, UploadFile
from sqlalchemy.orm import Session
from infraestructure.database import open_connection
from infraestructure.ia_client import IAClient
from services.dataset_procesator import DatasetProcesator
from services.chat_service import ChatService

API_KEY = os.getenv('OPENAI_KEY')
ai_client = IAClient(API_KEY)
embeddings = Embeddings(ai_client)
chat_service = ChatService()

router = APIRouter(
    prefix="/assistant",
    tags=["assistant"]
)

@router.post('/')
async def ask(question: str = Form(...), conversation_id: Optional[int] = Form(None), file: Optional[UploadFile] = None, db_session: Session = Depends(open_connection)):
    context_text = None
    conversation_created = None

    if file:
        document_chunks = await DatasetProcesator.chunk_file(file)
        chunks_embeddings = await embeddings.get_document_embeddings(document_chunks)
        relevant_chunks = await embeddings.search(question, chunks_embeddings, 0)
        context_text = ".\n".join(relevant_chunks)

    prompt = f"Context: {context_text}\n\nQuestion: {question}" if context_text else f"question: {question}"
    response = await ai_client.ask(prompt)

    if not conversation_id:
        conversation_created = chat_service.create_conversation(question[:50], db_session)
        conversation_id = conversation_created.idConversation

    chat_service.create_message(question, 'Client', conversation_id, db_session)
    answer = chat_service.create_message(response, 'Server', conversation_id, db_session)
    return { 'answer': answer, 'conversation': conversation_created.to_dict() }