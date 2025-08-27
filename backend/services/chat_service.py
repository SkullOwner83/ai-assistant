from models.message import Message
from models.conversation import Conversation
from sqlalchemy.orm import Session

class ChatService():
    def create_conversation(self, title: str, db_session: Session) -> Conversation:
        new_conversation = Conversation(title=title)
        db_session.add(new_conversation)
        db_session.commit()
        db_session.refresh(new_conversation)
        return new_conversation
    
    def create_message(self, message: str, message_from: str, conversation_id: int, db_session: Session) -> Message:
        new_message = Message(
            messageFrom = message_from,
            content = message,
            conversationId = conversation_id
        )

        db_session.add(new_message)
        db_session.commit()
        db_session.refresh(new_message)
        return new_message