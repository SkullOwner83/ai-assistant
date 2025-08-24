from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import exists
from sqlalchemy.orm import Session
from models.conversation import Conversation
from infraestructure.database import open_connection
from models.message import Message

router = APIRouter(
    prefix="/messages",
    tags=["messages"]
)

@router.get('/')
async def get_messages(conversation_id: int, db: Session = Depends(open_connection)):
    conversation = db.query(
        exists().where(Conversation.idConversation == conversation_id)
    ).scalar()

    if not conversation:
        raise HTTPException(status_code=404, detail="Message from conversation not found.")
    
    messages = db.query(Message).filter(Message.conversationId == conversation_id).all()
    return messages