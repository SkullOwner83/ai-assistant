import logging
import tempfile
from typing import List, Optional
from fastapi import UploadFile
from pathlib import Path
from langchain.docstore.document import Document

logger = logging.getLogger(__name__)

class DatasetProcesator():
    @staticmethod
    def create_temporal_file(content: bytes, extension: str) -> str:
        with tempfile.NamedTemporaryFile(delete=False, suffix=extension) as tmp:
            tmp.write(content)
            return tmp.name

    @staticmethod
    async def process_file(file: UploadFile) -> List[Document]:
        from langchain_community.document_loaders.pdf import PDFPlumberLoader
        from langchain_community.document_loaders import UnstructuredWordDocumentLoader

        content = await file.read()
        extension = Path(file.filename).suffix.lower()

        match(extension):
            case '.txt':
                text = content.decode('utf-8', errors='ignore')
                documents = [Document(page_content=text, metadata={'source': file.filename})]

            case '.pdf':
                tmp_path = DatasetProcesator.create_temporal_file(content, 'pdf')
                loader = PDFPlumberLoader(tmp_path)
                documents = loader.load()

            case '.docx':
                tmp_path = DatasetProcesator.create_temporal_file(content, 'docx')
                loader = UnstructuredWordDocumentLoader(tmp_path)
                documents = loader.load()

            case _:
                logger.exception(f"Unsupported format: {file}")
                raise ValueError(f"Unsupported format.")

        return documents

    @staticmethod
    def chunk_text(text: str, chunk_size: Optional[int] = 300, chunk_overlap: Optional[int] = 50, separators: Optional[List[str]] = None):
        from langchain_text_splitters import RecursiveCharacterTextSplitter

        if chunk_overlap >= chunk_size:
            chunk_overlap = chunk_size // 5

        if separators is None:
            separators = ["\n\n", "\n"]

        splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size, 
            chunk_overlap=chunk_overlap,
            separators=separators
        )

        chunks = splitter.split_text(text)
        return chunks
    
    @staticmethod
    async def chunk_file(file: UploadFile, chunk_size: Optional[int] = 300, chunk_overlap: Optional[int] = 50, separators: Optional[List[str]] = None):
        from langchain_text_splitters import RecursiveCharacterTextSplitter
        
        if chunk_overlap >= chunk_size:
            chunk_overlap = chunk_size // 5

        if separators is None:
            separators = ["\n\n", "\n"]

        splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size, 
            chunk_overlap=chunk_overlap,
            separators=separators
        )

        documents = await DatasetProcesator.process_file(file)
        chunks = splitter.split_documents(documents)
        return chunks
