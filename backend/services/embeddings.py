import faiss
import torch
import numpy as np
from typing import List, Optional
from openai import OpenAI
from langchain.docstore.document import Document
from transformers import AutoTokenizer, AutoModel, PreTrainedModel, PreTrainedTokenizerBase
from transformers.modeling_outputs import BaseModelOutput

class Embeddings():
    def __init__(self, openai: OpenAI):
        self.openai = openai
        model_name = 'sentence-transformers/distiluse-base-multilingual-cased-v2'
        self.model: PreTrainedModel = AutoModel.from_pretrained(model_name)
        self.tokenizer: PreTrainedTokenizerBase = AutoTokenizer.from_pretrained(model_name)
        self.model.eval()

    # Generate the vector representation of a text to be used as input to the model
    def get_embedding(self, text: str) -> List[float]:
        text = text.replace('\n', ' ')
        tensors = self.tokenizer(text, return_tensors="pt", padding=True, truncation=True)

        with torch.no_grad():
            outputs: BaseModelOutput = self.model(**tensors)

        embedding = outputs.last_hidden_state.mean(dim=1)
        vector = embedding.squeeze().numpy()
        return vector
    
        # text = text.replace('\n', ' ')
        # embeddings = self.openai.embeddings.create(
        #     model='text-embedding-3-small',
        #     input=text,
        #     encoding_format='float'
        # )

        # return embeddings.data[0].embedding
    
    # Generate a file with the vector representation of a text to be used as input to the model
    async def get_document_embeddings(self, chunks: List[Document]) -> List[List[float]]:
        embeddings_list = []

        for text in chunks:
            embedding = self.get_embedding(text.page_content)
            embeddings_list.append(embedding)
 
        return embeddings_list

    # Search the best matches for a given text in a list of texts and return the top N matches
    async def search(self, search: str, embeddings: List[List[float]], texts: List[str], top_matches: Optional[int] = 5) -> List[str]:
        query = self.get_embedding(search)
        query = np.array([query], dtype="float32")
        faiss.normalize_L2(query)

        embeddings = np.array(embeddings, dtype="float32")
        faiss.normalize_L2(embeddings)

        dimension = embeddings.shape[1]
        index = faiss.IndexFlatIP(dimension)
        index.add(embeddings)

        scores, indexes = index.search(query, top_matches)
        return [texts[i] for i in indexes[0]]