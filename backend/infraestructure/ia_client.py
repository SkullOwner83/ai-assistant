from typing import Optional
from openai import OpenAI, AuthenticationError
from typing import Optional
from openai import OpenAI, AuthenticationError
import requests

class IAClient():
    def __init__(self, api_key: Optional[str] = None) -> None:
        self.client_openai = OpenAI(api_key=api_key)
        self.hf_api_key = api_key

    async def ask(self, promp, instructions: str = None) -> str:
        instructions = 'Eres un asistente virtual especializado en ayudar al usuario a comprender y analizar archivos cargados.' if not instructions else instructions

        try:
            response = self.client_openai.responses.create(
                model='gpt-4o-mini',
                instructions=instructions,
                input=[{"role": "user", "content": promp}]
            )

            return response.output[0].content[0].text
        except AuthenticationError:
            print("OpenAI API Key no válida o no disponible. Probando Hugging Face...")

            try:
                HF_MODEL = "meta-llama/Llama-3.1-8B-Instruct"
                API_URL = f"https://api-inference.huggingface.co/models/{HF_MODEL}"
                headers = {"Authorization": f"Bearer {self.hf_api_key}"}

                payload = {
                    "inputs": f"{instructions}\nUsuario: {promp}\nAsistente:",
                    "parameters": {
                        "max_new_tokens": 300,
                        "temperature": 0.6,
                        "return_full_text": False
                    }
                }

                response = requests.post(API_URL, headers=headers, json=payload)

                if response.status_code != 200:
                    raise Exception(f"Error Hugging Face: {response.text}")

                data = response.json()

                if isinstance(data, list) and "generated_text" in data[0]:
                    return data[0]["generated_text"]
                else:
                    raise Exception(str(data))

            except Exception as e:
                raise e