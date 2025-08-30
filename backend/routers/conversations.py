from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models.conversation import Conversation
from infraestructure.database import open_connection

router = APIRouter(
    prefix="/conversations",
    tags=["conversations"]
)

from pydantic import BaseModel

class ConversationUpdate(BaseModel):
    idConversation: int
    title: str

@router.get('/')
async def get_conversations(db: Session = Depends(open_connection)):
    conversations = db.query(Conversation).all()

    if not conversations:
        return HTTPException(status_code=404, detail="There is no conversation yet.")

    return conversations

@router.put('/')
async def update_conversation(conversation: ConversationUpdate, db: Session = Depends(open_connection)):
    db_conversation = db.query(Conversation).filter(Conversation.idConversation == conversation.idConversation).first()

    if not db_conversation:
        raise HTTPException(status_code=404, detail='The conversation was not found.')
    
    db_conversation.title = conversation.title
    db.commit()
    db.refresh(db_conversation)

@router.delete('/')
async def delete_conversations(conversation_id: int, db: Session = Depends(open_connection)):
    conversation = db.query(Conversation).filter(Conversation.idConversation == conversation_id).first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="The conversation was not found.")

    db.delete(conversation)
    db.commit()
    return { "message": "Conversation was deleted successfully." }