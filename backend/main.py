from fastapi import Depends, FastAPI, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware
from infraestructure.database import open_connection
from sqlalchemy.orm import Session
from sqlalchemy import text
from dotenv import load_dotenv
from routers import *

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

@app.get('/health')
async def health_check(db: Session = Depends(open_connection)):
    try:
        db.execute(text('SELECT 1'))
        return Response(status_code=status.HTTP_200_OK)
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)