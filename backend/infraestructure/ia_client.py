from typing import Optional
from openai import OpenAI, AuthenticationError

class IAClient():
    def __init__(self, api_key: Optional[str] = None) -> None:
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
                    model="meta-llama/Llama-3.1-8B-Instruct:cerebras",
                    messages=[{"role": "user","content": promp}],
                )

                return completion.choices[0].message.content
            except Exception as e:
                raise e