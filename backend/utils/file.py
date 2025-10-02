import hashlib
from fastapi import UploadFile

MAX_SIZE = 500
ALLOWED_EXTENSIONS = ['txt', 'pdf', 'docx']

class File():

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