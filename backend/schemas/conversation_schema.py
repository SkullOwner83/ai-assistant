from pydantic import BaseModel

class ConversationSchema(BaseModel):
    idConversation: int
    title: str
    
    model_config = {
        "from_attributes": True
    }