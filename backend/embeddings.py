from openai import OpenAI
from numpy import dot
from numpy.linalg import norm

class Embeddings:
    def __init__(self, openai: OpenAI):
        self.openai = openai

    def get_embedings(self, text: str):
        text = text.replace('\n', ' ')
        embeddings = self.openai.embeddings.create(
            model='text-embedding-3-small',
            input=text,
            encoding_format='float'
        )

        return embeddings.data[0].embedding

    def check_similarity(self, vec1, vec2):
        return dot(vec1, vec2) / (norm(vec1) * norm(vec2))
