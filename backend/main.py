import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models.ask_payload import AskPayload
from openai import OpenAI

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
    return {'hello': 'world'}

@app.post('/ask')
async def ask(payload: AskPayload):
    response = client.chat.completions.create(  
        model='gpt-4o-mini',
        store=False,
        messages=[
            {'role': 'system', 'content': 'Eres un asistente'},
            {'role': 'user', 'content': payload.question}
        ]
    )

    answer = response.choices[0].message.content
    print('Se ha recibido una peticion.')
    return { 'answer': answer }

