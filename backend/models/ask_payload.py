from pydantic import BaseModel

class AskPayload(BaseModel):
    question: str