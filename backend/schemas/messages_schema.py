from datetime import datetime
from pydantic import BaseModel

class MessageSchema(BaseModel):
    idMessage: int
    conversationId: int
    messageFrom: str
    content: str
    createdAt: datetime  

    model_config = {
        "from_attributes": True
    }