import os
from typing import Optional
from openai import OpenAI
from services.embeddings import Embeddings
from fastapi import APIRouter, Depends, Form, UploadFile
from sqlalchemy.orm import Session
from infraestructure.database import open_connection
from services.dataset_procesator import DatasetProcesator
from models.conversation import Conversation
from models.message import Message

API_KEY = os.getenv('OPENAI_KEY')
client = OpenAI(api_key=API_KEY)
embeddings = Embeddings(client)

router = APIRouter(
    prefix="/assistant",
    tags=["assistant"]
)

@router.post('/')
async def ask(question: str = Form(...), conversation_id: Optional[int] = Form(None), file: Optional[UploadFile] = None, db: Session = Depends(open_connection)):
    context_text = None
    conversation_created = None

    if file:
        document_chunks = await DatasetProcesator.chunk_file(file)
        chunks_embedings = await embeddings.get_document_embeddings(document_chunks)

        relevant_chunks = await embeddings.search(question, chunks_embedings, 0)
        context_text = ".\n".join(relevant_chunks)

    promp = f"Context: {context_text}\n\nQuestion: {question}" if context_text else f"question: {question}"

    response = client.responses.create(
        model='gpt-4o-mini',
        instructions='Eres un asistente virtual.',
        input=[{"role": "user", "content": promp}]
    )

    if not conversation_id:
        conversation_created = Conversation(title=question[:50])
        db.add(conversation_created)
        db.commit()
        db.refresh(conversation_created)
        conversation_id = conversation_created.idConversation

    answer = Message(
        messageFrom = 'Server',
        content = response.output[0].content[0].text,
        conversationId = conversation_id
    )

    message = Message(
        messageFrom = 'Client',
        content = question,
        conversationId = conversation_id
    )

    db.add(message)
    db.add(answer)
    db.commit()
    db.refresh(message)
    db.refresh(answer)

    return { 'answer': answer, 'conversation': conversation_created }

