from pydantic import BaseModel

class ConfigSchema(BaseModel):
    apiKey: str
    aiProvider: str
    openaiModel: str
    hfModel: str
    maxTokens: int

    model_config = {
        "from_attributes": True
    }