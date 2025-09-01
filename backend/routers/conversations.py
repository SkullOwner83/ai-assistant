import tempfile
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from models.conversation import Conversation
from infraestructure.database import open_connection
from models.message import Message

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
        raise HTTPException(status_code=404, detail="There is no conversation yet.")

    return conversations

@router.put('/')
async def update_conversation(conversation: ConversationUpdate, db: Session = Depends(open_connection)):
    db_conversation = db.query(Conversation).filter(Conversation.idConversation == conversation.idConversation).first()

    if not db_conversation:
        raise HTTPException(status_code=404, detail='The conversation was not found.')
    
    db_conversation.title = conversation.title
    db.commit()
    db.refresh(db_conversation)
    return {"message": "Conversation updated successfully", "conversation": db_conversation}

@router.delete('/')
async def delete_conversations(conversation_id: int, db: Session = Depends(open_connection)):
    conversation = db.query(Conversation).filter(Conversation.idConversation == conversation_id).first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="The conversation was not found.")

    db.delete(conversation)
    db.commit()
    return { "message": "Conversation was deleted successfully." }

@router.get('/download')
async def download_conversation(conversation_id: int, db: Session = Depends(open_connection)):
    conversation = db.query(Conversation).filter(Conversation.idConversation == conversation_id).first()

    if not conversation:
        raise HTTPException(status_code=404, detail="The conversation was not found.")
    
    filename = f'{conversation.title}.txt'
    messages = db.query(Message).filter(Message.conversationId == conversation_id).all()

    with tempfile.TemporaryFile(delete=False, suffix='.txt', mode='w', encoding='utf-8') as tmp:
        for c in messages:
            tmp.write(f'{c.messageFrom}:\n{c.content}\n\n')

        tmp_path = tmp.name

    return FileResponse(path=tmp_path, filename=filename, media_type="text/plain")