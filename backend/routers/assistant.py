import logging
import os
from pathlib import Path
from utils.file import File
from typing import Optional
from fastapi import APIRouter, Depends, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session
from infraestructure.database import open_connection
from infraestructure.ai_client import IAClient
from services.chat_service import ChatService
from schemas.askresponse_schema import AskResponseSchema
from models.conversation import Conversation
from services.services import rag_service

API_KEY = os.getenv('API_KEY')
ai_client = IAClient(API_KEY)
chat_service = ChatService()
logger = logging.getLogger(__name__)

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
        if not file: 
            logger.exception("No file has been provided to work with.")
            raise HTTPException(status_code=404, detail="No file has been provided to work with.")
        
        if not File.validate(file): 
            logger.exception("The file is not valid: %s.", file)
            raise HTTPException(status_code=404, detail="The file is not valid.")
        
        file_hash = File.get_hash(file)
        await rag_service.process_file(file)
        conversation_name = f"{Path(file.filename).stem} - {question[:50]}"
        conversation_created = await chat_service.create_conversation(conversation_name, file_hash, db_session)
        conversation_id = conversation_created.idConversation
    else:
        conversation = db_session.query(Conversation).filter_by(idConversation=conversation_id).first()

        if not conversation: 
            logger.exception("The conversation with the id %s was not found", conversation_id)
            raise HTTPException(status_code=404, detail="The conversation was not found.")

        if not conversation.fileHash: 
            logger.exception("No file was found associated with the conversation with the id %s.", conversation_id)
            raise HTTPException(status_code=404, detail="No file associated with the conversation was found.")

        file_hash = conversation.fileHash

    # Perform the semantic search in chroma database and return the most relevant chunks
    results = rag_service.search(question, file_hash)

    # Generate an aumented response if the open ai is accessed
    try:
        context = "\n\n".join(results) if results else None
        prompt = f"Context: {context}\n\nQuestion: {question}" if context else f"question: {question}"
        response = await ai_client.ask(prompt)
    except Exception as e:
        logger.exception("Could not generate a response: %s.", e)
        response = results[0] if results and len(results) > 0 else "No se encontró información relevante."


    await chat_service.create_message(question, 'Client', conversation_id, db_session)
    answer = await chat_service.create_message(response, 'Server', conversation_id, db_session)
    return AskResponseSchema(answer=answer, conversation=conversation_created)