from typing import List
from openai import OpenAI

from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from langchain.docstore.document import Document
    from transformers import PreTrainedModel, PreTrainedTokenizerBase
    from transformers.modeling_outputs import BaseModelOutput

class Embeddings():
    def __init__(self, openai: OpenAI = None):
        self.openai = openai
        self.model = None
        self.tokenizer = None

    # Generate the vector representation of a text to be used as input to the model
    def get_embedding(self, text: str) -> List[float]:
        from transformers import AutoTokenizer, AutoModel
        import torch

        if self.model is None or self.tokenizer is None:
            model_name = 'sentence-transformers/distiluse-base-multilingual-cased-v2'
            self.model: PreTrainedModel = AutoModel.from_pretrained(model_name)
            self.tokenizer: PreTrainedTokenizerBase = AutoTokenizer.from_pretrained(model_name)
            self.model.eval()

        text = text.replace('\n', ' ')
        tensors = self.tokenizer(text, return_tensors="pt", padding=True, truncation=True)

        with torch.no_grad():
            outputs: BaseModelOutput = self.model(**tensors)

        embedding = outputs.last_hidden_state.mean(dim=1)
        vector = embedding.squeeze().numpy()
        return vector
    
    # Generate a file with the vector representation of a text to be used as input to the model
    def get_document_embeddings(self, chunks: "List[Document]") -> List[List[float]]:
        embeddings_list = []

        for text in chunks:
            embedding = self.get_embedding(text.page_content)
            embeddings_list.append(embedding)
 
        return embeddings_list