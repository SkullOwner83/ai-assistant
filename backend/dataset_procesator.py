from typing import List, Optional
from langchain_text_splitters import RecursiveCharacterTextSplitter
from fastapi import UploadFile
from langchain.docstore.document import Document

class DatasetProcesator():
    @staticmethod
    async def process_file(file: UploadFile) -> List[Document]:
        content = await file.read()

        if file.filename.endswith(".txt"):
            text = content.decode("utf-8", errors="ignore")
            documents = [Document(page_content=text, metadata={"source": file.filename})]
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




import asyncio
import io

async def test():
    file_path = "C:/Users/javier/Desktop/archivo_prueba.txt"

    with open(file_path, "rb") as f:
        file_bytes = f.read()

    uploaded_file = UploadFile(
        filename="archivo_prueba.txt",
        file=io.BytesIO(file_bytes)
    )

    chunks = await DatasetProcesator.chunk_file(uploaded_file, 100)

    for c in chunks:
        print(str(c) + "\n")

#asyncio.run(test())