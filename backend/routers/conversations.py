from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models.conversation import Conversation
from infraestructure.database import open_connection

router = APIRouter(
    prefix="/conversations",
    tags=["conversations"]
)

@router.get('/')
async def get_conversations(db: Session = Depends(open_connection)):
    conversations = db.query(Conversation).all()

    if not conversations:
        return HTTPException(status_code=404, detail="There is no conversation yet.")

    return conversations

@router.delete('/{conversation_id}')
async def delete_conversations(conversation_id: int, db: Session = Depends(open_connection)):
    conversation = db.query(Conversation).filter(Conversation.idConversation == conversation_id).first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found.")

    db.delete(conversation)
    db.commit()
    return { "message": "Conversation was deleted successfully." }