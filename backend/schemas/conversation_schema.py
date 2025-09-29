from datetime import datetime
from pydantic import BaseModel

class ConversationSchema(BaseModel):
    idConversation: int
    title: str
    createdAt: datetime
    
    model_config = {
        "from_attributes": True
    }