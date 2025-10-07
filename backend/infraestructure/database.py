import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.orm import DeclarativeMeta

load_dotenv()
appdata_dir = os.path.join(os.getenv('LOCALAPPDATA'), 'AI Assistant')
os.makedirs(appdata_dir, exist_ok=True)
sqlite_path = os.path.join(appdata_dir, 'data.sqlite3')

DB_URL = f"sqlite:///{sqlite_path}"
engine = create_engine(DB_URL, echo=True, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False)
Base: DeclarativeMeta = declarative_base()
Base.metadata.create_all(bind=engine)

def open_connection():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()