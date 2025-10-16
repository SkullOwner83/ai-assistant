from pydantic import BaseModel

class ConfigSchema(BaseModel):
    apiKey: str
    aiProvider: str
    openaiModel: str
    hfModel: str
    maxTokens: int
    temperature: float

    model_config = {
        "from_attributes": True
    }