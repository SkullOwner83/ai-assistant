from sqlalchemy.orm import Session
from models.message import Message
from models.conversation import Conversation

class ChatService():
    async def create_conversation(self, title: str, file_hash: str, db_session: Session) -> Conversation:
        new_conversation = Conversation(title=title, fileHash=file_hash)
        db_session.add(new_conversation)
        db_session.commit()
        db_session.refresh(new_conversation)
        return new_conversation

    async def create_message(self, message: str, message_from: str, conversation_id: int, db_session: Session) -> Message:
        new_message = Message(
            messageFrom = message_from,
            content = message,
            conversationId = conversation_id
        )

        db_session.add(new_message)
        db_session.commit()
        db_session.refresh(new_message)
        return new_message