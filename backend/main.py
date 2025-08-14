import os
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI

API_KEY = os.getenv('OPENAI_API_KEY')
client = OpenAI(api_key=API_KEY)
app = FastAPI()

class AskPayload(BaseModel):
    question: str

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
    return { 'answer': answer }

