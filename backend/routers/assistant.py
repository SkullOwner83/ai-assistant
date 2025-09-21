import os
from typing import List, Optional
from fastapi import APIRouter, Depends, Form, UploadFile, status
from httpx import HTTPError
from openai import APIError
from sqlalchemy.orm import Session
from infraestructure.database import open_connection
from infraestructure.ia_client import IAClient
from services.chat_service import ChatService
from schemas.askresponse_schema import AskResponseSchema
from services.rag_service import RAGService

API_KEY = os.getenv('OPENAI_KEY')
ai_client = IAClient(API_KEY)
rag_service = RAGService()
chat_service = ChatService()

router = APIRouter(
    prefix="/assistant",
    tags=["assistant"]
)

@router.post('/', response_model=AskResponseSchema, status_code=status.HTTP_200_OK)
async def ask(question: str = Form(...), conversation_id: Optional[int] = Form(None), file: Optional[UploadFile] = None, db_session: Session = Depends(open_connection)) -> dict[str, str]:
    if file: await rag_service.process_file(file)
    results = rag_service.search(question)
    context = "\n\n".join(results) if results else None
    conversation_created = None

    try:
        prompt = f"Context: {context}\n\nQuestion: {question}" if context else f"question: {question}"
        response = await ai_client.ask(prompt)
    except (APIError, HTTPError, TimeoutError) as e:
        print(f"Error. No se pudo generar una respuesta: {e}")
        response = context or "No se encontró información relevante."

    if not conversation_id:
        conversation_created = chat_service.create_conversation(question[:50], db_session)
        conversation_id = conversation_created.idConversation

    chat_service.create_message(question, 'Client', conversation_id, db_session)
    answer = chat_service.create_message(response, 'Server', conversation_id, db_session)
    return AskResponseSchema(answer=answer, conversation=conversation_created)