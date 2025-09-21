import hashlib
from fastapi import UploadFile

class File():
    @staticmethod
    def get_hash(file: UploadFile) -> str:
        content = file.file.read()
        file.file.seek(0)
        hash = hashlib.md5(content).hexdigest()
        return hash