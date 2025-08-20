from ast import Pass
import os
from typing import List, Optional
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from fastapi import FastAPI, Depends, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from sympy import content
from models.ask_payload import AskPayload
from openai import OpenAI, embeddings
from database import SessionLocal, open_conecction
from models.message import Message
from models.conversation import Conversation
from embeddings import Embeddings
from dataset_procesator import DatasetProcesator

load_dotenv()
API_KEY = os.getenv('OPENAI_API_KEY')
openai = OpenAI(api_key=API_KEY)
embeddings = Embeddings(openai)
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get('/')
def read_root():
    return 'AI Assistant'

@app.get('/conversations')
async def get_conversations(db: Session = Depends(open_conecction)):
    conversations = db.query(Conversation).all()
    return conversations


@app.get('/messages')
async def get_messages(conversation_id: int, db: Session = Depends(open_conecction)):
    messages = db.query(Message).filter(Message.conversationId == conversation_id).all()
    print(messages)
    return messages

@app.post('/ask')
async def ask(question: str = Form(...), conversation_id: Optional[int] = Form(...), file: Optional[UploadFile] = None, db: Session = Depends(open_conecction)):
    context_text = None

    if file:
        document_chunks = await DatasetProcesator.chunk_file(file)
        chunks_embedings = await embeddings.get_document_embeddings(document_chunks)

        relevant_chunks = await embeddings.search(question, chunks_embedings, 0)
        context_text = ".\n".join(relevant_chunks)

    promp = f"Context: {context_text}\n\nQuestion: {question}" if context_text else f"question: {question}"

    response = openai.chat.completions.create(
        model='gpt-4o-mini',
        store=False,
        messages=[
            {'role': 'system', 'content': 'Eres un asistente'},
            {'role': 'user', 'content': promp}
        ]
    )

    if not conversation_id:
        conversation = Conversation(title=question[:50])
        db.add(conversation)
        db.commit()
        db.refresh(conversation)
        conversation_id = conversation.idConversation

    answer = Message(
        messageFrom = 'Server',
        content = response.choices[0].message.content,
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

    return answer

