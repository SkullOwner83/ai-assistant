from fastapi import UploadFile
from pydantic import BaseModel

class AskPayload(BaseModel):
    question: str
    file: UploadFile