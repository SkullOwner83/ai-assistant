import tempfile
from typing import List, Optional
from langchain_text_splitters import RecursiveCharacterTextSplitter
from fastapi import UploadFile
from langchain.docstore.document import Document
from langchain_community.document_loaders import PyPDFLoader

class DatasetProcesator():
    @staticmethod
    async def process_file(file: UploadFile) -> List[Document]:
        content = await file.read()

        if file.filename.endswith(".txt"):
            text = content.decode("utf-8", errors="ignore")
            documents = [Document(page_content=text, metadata={"source": file.filename})]
        elif file.filename.endswith(".pdf"):
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
                tmp.write(content)
                tmp_path = tmp.name

            loader = PyPDFLoader(tmp_path)
            documents = loader.load()
        else:
            raise ValueError(f"Formato no soportado: {file.filename}")

        return documents

    @staticmethod
    def chunk_text(text: str, chunk_size: Optional[int] = 300, chunk_overlap: Optional[int] = 50, separators: Optional[List[str]] = None):
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
