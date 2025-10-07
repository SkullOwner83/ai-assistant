import os
import logging
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from models.config import Config
from infraestructure.database import open_connection, Base, engine
from infraestructure.ai_client import IAClient
from routers import *

load_dotenv()
app = FastAPI(docs_url=None)
app.include_router(messages.router)
app.include_router(conversations.router)
app.include_router(assistant.router)
app.include_router(configuration.router)

Base.metadata.create_all(bind=engine)
appdata = os.path.join(os.getenv('LOCALAPPDATA'), 'AI Assistant')
os.makedirs(appdata, exist_ok=True)
log_path = os.path.join(appdata, 'backend.log')
config_path = os.path.join(appdata, 'config.json')
config = Config()
config.load(config_path)
app.state.config = config
app.state.config_path = config_path
app.state.ai_client = IAClient(api_key=config.apiKey, hf_model=config.hfModel)

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s [%(name)s] %(levelname)s %(message)s',
    handlers=[
        logging.FileHandler(log_path, mode='w', encoding="utf-8"),
        logging.StreamHandler()
    ]
)

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

@app.get('/health')
async def health_check(db: Session = Depends(open_connection)):
    try:
        db.execute(text('SELECT 1'))
        return Response(status_code=status.HTTP_200_OK)
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, workers=1)