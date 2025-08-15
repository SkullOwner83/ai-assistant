from typing import Any, List
from openai import OpenAI
from numpy import dot
from numpy.linalg import norm

class Embeddings:
    def __init__(self, openai: OpenAI):
        self.openai = openai

    def process_dataset(self, file: Any):
        pass

    # Generate the vector representation of a text to be used as input to the model
    def get_embeding(self, text: str) -> List[float]:
        text = text.replace('\n', ' ')
        embeddings = self.openai.embeddings.create(
            model='text-embedding-3-small',
            input=text,
            encoding_format='float'
        )

        return embeddings.data[0].embedding

    # Search the best matches for a given text in a list of texts and return the top N matches
    def search(self, search: str, data: List[dict[str, str]], threshold: float = 0.5) -> List[str]:
        search_embed = self.get_embeding(search)
        results = []

        for item in data:
            similarity = self.check_similarity(search_embed, item['embedding'])

            if similarity >= threshold:
                results.append({'text': item['text'], 'similarity': similarity})

        results.sort(key=lambda x: x['similarity'], reverse=True)
        return [r['text'] for r in results]

    # Calculate the similarity between two vectors using cosine similarity
    @staticmethod
    def check_similarity(vec1, vec2) -> float:
        return dot(vec1, vec2) / (norm(vec1) * norm(vec2))
