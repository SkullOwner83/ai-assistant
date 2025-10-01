import os
from typing import Optional
import openai
from openai import OpenAI, AuthenticationError

class IAClient():
    def __init__(self, api_key: Optional[str] = None) -> None:
        self.HF_MODEL = os.getenv('HF_MODEL')
        self.client = openai.OpenAI(api_key=api_key)
        self.client_openai = OpenAI(api_key=api_key)
        self.client_hf = OpenAI(
            base_url="https://router.huggingface.co/v1",
            api_key=api_key,
        )

    async def ask(self, promp, instructions: str ='Eres un asistente virtual.') -> str:
        try:
            response = self.client_openai.responses.create(
                model='gpt-4o-mini',
                instructions=instructions,
                input=[{"role": "user", "content": promp}]
            )

            return response.output[0].content[0].text
        except AuthenticationError   :
            print("OpenAI API Key no válida o no disponible. Probando Hugging Face...")

            try:
                completion = self.client_hf.chat.completions.create(
                    model=self.HF_MODEL,
                    messages=[{"role": "user","content": promp}],
                    temperature=0.8,
                    max_tokens=200
                )

                return completion.choices[0].message.content
            except Exception as e:
                raise e