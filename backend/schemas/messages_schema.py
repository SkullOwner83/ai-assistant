from pydantic import BaseModel

class MessageSchema(BaseModel):
    idMessage: int
    conversationId: int
    messageFrom: str
    content: str
    model_config = {
        "from_attributes": True
    }