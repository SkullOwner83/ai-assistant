from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routers import *
from services.rag_service import RAGService

load_dotenv()
app = FastAPI()
app.include_router(messages.router)
app.include_router(conversations.router)
app.include_router(assistant.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get('/')
async def root():
    return {"message": "AI Assistant"}
