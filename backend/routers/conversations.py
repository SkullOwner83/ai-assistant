import logging
import tempfile
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from models.conversation import Conversation
from infraestructure.database import open_connection
from schemas.conversation_schema import ConversationSchema
from models.message import Message
from services.services import rag_service

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/conversations",
    tags=["conversations"]
)

@router.get('/', response_model=List[ConversationSchema], status_code=status.HTTP_200_OK)
async def get_conversations(db: Session = Depends(open_connection)) -> List[ConversationSchema]:
    conversations = db.query(Conversation).all()

    if not conversations:
        logger.exception("There is no conversation yet.")
        raise HTTPException(status_code=404, detail="There is no conversation yet.")

    return conversations

@router.put('/', status_code=status.HTTP_204_NO_CONTENT)
async def update_conversation(conversation: ConversationSchema, db: Session = Depends(open_connection)) -> None:
    db_conversation = db.query(Conversation).filter(Conversation.idConversation==conversation.idConversation).first()

    if not db_conversation:
        logger.exception("The conversation with the id %s was not found while trying to update it.", conversation.idConversation)
        raise HTTPException(status_code=404, detail='The conversation was not found.')
    
    db_conversation.title = conversation.title
    db.commit()
    db.refresh(db_conversation)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

@router.delete('/', status_code=status.HTTP_204_NO_CONTENT)
async def delete_conversations(conversation_id: int, db: Session = Depends(open_connection)) -> None:
    conversation = db.query(Conversation).filter(Conversation.idConversation==conversation_id).first()
    file_hash = conversation.fileHash
    
    if not conversation:
        logger.exception("The conversation with the id %s was not found while trying to delete it.", conversation_id)
        raise HTTPException(status_code=404, detail="The conversation was not found.")

    db.query(Message).filter(Message.conversationId==conversation_id).delete()
    db.delete(conversation)
    db.commit()
    rag_service.delete_file(file_hash)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

@router.get('/download', status_code=status.HTTP_200_OK)
async def download_conversation(conversation_id: int, db: Session = Depends(open_connection)) -> FileResponse:
    conversation = db.query(Conversation).filter(Conversation.idConversation==conversation_id).first()

    if not conversation:
        logger.exception("The conversation with the id %s was not found while trying to download it.", conversation_id)
        raise HTTPException(status_code=404, detail="The conversation was not found.")
    
    filename = f'{conversation.title}.txt'
    messages = db.query(Message).filter(Message.conversationId==conversation_id).all()

    with tempfile.NamedTemporaryFile(delete=False, suffix='.txt', mode='w', encoding='utf-8') as tmp:
        for c in messages:
            tmp.write(f'{c.messageFrom}:\n{c.content}\n\n')

        tmp_path = tmp.name

    return FileResponse(path=tmp_path, filename=filename, media_type="text/plain")