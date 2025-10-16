from typing import Optional
from openai import OpenAI, AuthenticationError

class IAClient():
    def __init__(self, api_key: Optional[str] = '', hf_model='meta-llama/Llama-3.1-8B-Instruct:cerebras', max_tokens: Optional[int] = 1000, temperature: Optional[float] = 0.8) -> None:
        self.update_config(api_key=api_key, hf_model=hf_model, max_tokens=max_tokens, temperature=temperature)

    def update_config(self, api_key: Optional[str] = '', openai_model: Optional[str] = '', hf_model: Optional[str] = '', max_tokens: Optional[int] = 1000, temperature: Optional[float] = 0.8) -> None:
        self.hf_model = hf_model
        self.openai_model = openai_model
        self.max_tokens = max_tokens
        self.temperature = temperature
        self.client_openai = OpenAI(api_key=api_key)
        self.client_hf = OpenAI(
            base_url="https://router.huggingface.co/v1",
            api_key=api_key,
        )

    async def ask(self, promp, instructions: str ='Eres un asistente virtual.') -> str:
        try:
            response = self.client_openai.responses.create(
                model=self.openai_model,
                instructions=instructions,
                input=[{"role": "user", "content": promp}],
                max_output_tokens=self.max_tokens,
                temperature=self.temperature
            )

            return response.output[0].content[0].text
        except AuthenticationError   :
            print("OpenAI API Key no válida o no disponible. Probando Hugging Face...")

            try:
                completion = self.client_hf.chat.completions.create(
                    model=self.hf_model,
                    messages=[{"role": "user","content": promp}],
                    temperature=self.temperature,
                    max_tokens=self.max_tokens
                )

                return completion.choices[0].message.content
            except Exception as e:
                raise e