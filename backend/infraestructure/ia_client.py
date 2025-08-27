from openai import OpenAI

class IAClient():
    def __init__(self, api_key: str) -> None:
        self.client = OpenAI(api_key=api_key)

    def ask(self, promp, instructions: str ='Eres un asistente virtual.') -> str:
        return self.client.responses.create(
            model='gpt-4o-mini',
            instructions=instructions,
            input=[{"role": "user", "content": promp}]
        )