from typing import Optional
from pydantic import BaseModel
from schemas.conversation_schema import ConversationSchema
from schemas.messages_schema import MessageSchema

class AskResponseSchema(BaseModel):
    answer: MessageSchema
    conversation: Optional[ConversationSchema]

    model_config = {
        "from_attributes": True
    }