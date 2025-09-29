import hashlib
from io import BytesIO
from fastapi import UploadFile

class File():
    @staticmethod
    def get_hash(file: UploadFile) -> str:
        content = file.file.read()
        file.file.seek(0)
        hash = hashlib.md5(content).hexdigest()
        return hash
    
    @staticmethod
    def bytes_to_upload_file(file_bytes: bytes, filename: str = "unknown") -> UploadFile:
        return UploadFile(file=BytesIO(file_bytes), filename=filename)