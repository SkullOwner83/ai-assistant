import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import exists
from sqlalchemy.orm import Session
from infraestructure.database import open_connection
from models.message import Message
from models.conversation import Conversation
from schemas.messages_schema import MessageSchema

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/messages",
    tags=["messages"]
)

@router.get('', response_model=List[MessageSchema], status_code=status.HTTP_200_OK)
async def get_messages(conversation_id: int, db: Session = Depends(open_connection)) -> List[MessageSchema]:
    conversation = db.query(
        exists().where(Conversation.idConversation == conversation_id)
    ).scalar()

    if not conversation:
        logger.exception("The conversation with the id %s was not found.", conversation_id)
        raise HTTPException(status_code=404, detail="Message from conversation not found.")
    
    messages = db.query(Message).filter(Message.conversationId == conversation_id).all()
    return messages