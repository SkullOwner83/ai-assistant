import os
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from models.ask_payload import AskPayload
from openai import OpenAI
from database import SessionLocal, open_conecction
from models.message import Message

load_dotenv()
API_KEY = os.getenv('OPENAI_API_KEY')
client = OpenAI(api_key=API_KEY)
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

@app.get('/messages')
async def get_messages(db: Session = Depends(open_conecction)):
    messages = db.query(Message).all()
    print(messages)
    return messages

@app.post('/ask')
async def ask(payload: AskPayload, db: Session = Depends(open_conecction)):
    response = client.chat.completions.create(  
        model='gpt-4o-mini',
        store=False,
        messages=[
            {'role': 'system', 'content': 'Eres un asistente'},
            {'role': 'user', 'content': payload.question}
        ]
    )

    answer = Message(
        messageFrom = 'Server',
        content = response.choices[0].message.contents
    )
    
    message = Message(
        messageFrom = 'Client',
        content = payload.question,
    )

    db.add(message)
    db.add(answer)
    db.commit()
    db.refresh(message)

    return { 'answer': answer }

