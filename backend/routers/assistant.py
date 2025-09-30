import os
from typing import Optional
from fastapi import APIRouter, Depends, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session
from infraestructure.database import open_connection
from infraestructure.ia_client import IAClient
from services.chat_service import ChatService
from schemas.askresponse_schema import AskResponseSchema
from services.rag_service import RAGService
from models.conversation import Conversation
from utils.file import File

API_KEY = os.getenv('API_KEY')
ai_client = IAClient(API_KEY)
rag_service = RAGService()
chat_service = ChatService()

router = APIRouter(
    prefix="/assistant",
    tags=["assistant"]
)

@router.post('/', response_model=AskResponseSchema, status_code=status.HTTP_200_OK)
async def ask(question: str = Form(...), conversation_id: Optional[int] = Form(None), file: Optional[UploadFile] = None, db_session: Session = Depends(open_connection)) -> dict[str, str]:
    conversation_created = None
    file_hash = None

    # Create a new conversation and process the attached file
    if not conversation_id:
        if not file: raise HTTPException(status_code=404, detail="No se ha proporcionado un archivo para trabajarlo.")
        if not File.validate(file): raise HTTPException(status_code=404, detail="El archivo no es valido.")
        
        file_hash = File.get_hash(file)
        print(file_hash)
        print("-------------------------------------------------------------")
        await rag_service.process_file(file)
        conversation_created = await chat_service.create_conversation(question[:50], file_hash, db_session)
        conversation_id = conversation_created.idConversation
    else:
        conversation = db_session.query(Conversation).filter_by(idConversation=conversation_id).first()

        if not conversation: raise HTTPException(status_code=404, detail="No se encontró archivo asociado a la conversación.")
        if not conversation.fileHash: raise HTTPException(status_code=404, detail="La conversación no tiene un dataset ligado para trabajar.")

        file_hash = conversation.fileHash

    # Perform the semantic search in chroma database and return the most relevant chunks
    results = rag_service.search(question, file_hash)

    # Generate an aumented response if the open ai is accessed
    try:
        context = "\n\n".join(results) if results else None
        prompt = f"Context: {context}\n\nQuestion: {question}" if context else f"question: {question}"
        response = await ai_client.ask(prompt)
    except Exception as e:
        print(f"Error. No se pudo generar una respuesta: {e}")
        response = results[0] if results and len(results) > 0 else "No se encontró información relevante."


    await chat_service.create_message(question, 'Client', conversation_id, db_session)
    answer = await chat_service.create_message(response, 'Server', conversation_id, db_session)
    return AskResponseSchema(answer=answer, conversation=conversation_created)