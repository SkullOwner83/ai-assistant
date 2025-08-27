import openai

class IAClient():
    def __init__(self, api_key: str) -> None:
        self.client = openai.OpenAI(api_key=api_key)

    async def ask(self, promp, instructions: str ='Eres un asistente virtual.') -> str:
        try:
            response = self.client.responses.create(
                model='gpt-4o-mini',
                instructions=instructions,
                input=[{"role": "user", "content": promp}]
            )
        except openai.AuthenticationError:
            return f'Error: No se ha podido validar tu API Key. Asegurate de que tu API Key o token sea correcto, no haya expirado o sido revocado.'
        except Exception as e:
            return e

        return response.output[0].content[0].text