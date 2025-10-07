import os
import json
import hashlib
from fastapi import UploadFile

MAX_SIZE = 500
ALLOWED_EXTENSIONS = ['txt', 'pdf', 'docx']

class File():
    @staticmethod
    def open(path: str) -> dict:
        if os.path.exists(path):
            with open(path, 'r', encoding='utf-8') as file:
                return json.load(file)
            
        return None
    
    @staticmethod
    def save(path: str, data: dict) -> None:
        with open(path, 'w', encoding='utf-8') as file:
            json.dump(data, file, ensure_ascii=False, indent=4)

    @staticmethod
    def get_hash(file: UploadFile) -> str:
        content = file.file.read()
        file.file.seek(0)
        hash = hashlib.md5(content).hexdigest()
        return hash
    
    @staticmethod
    def validate(file: UploadFile) -> bool:
        size = len(file.file.read()) / (1024 * 1024)
        file.file.seek(0)
        extension = file.filename.split('.')[-1].lower()

        return size <= MAX_SIZE and extension in ALLOWED_EXTENSIONS