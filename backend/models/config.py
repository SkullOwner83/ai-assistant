import os
from dataclasses import dataclass
from typing import Optional
from utils.file import File

@dataclass
class Config():
    apiKey: Optional[str] = ''
    aiProvider: Optional[str] = 'hugging_face'
    openaiModel: Optional[str] = 'gpt-4o-mini'
    hfModel: Optional[str] = 'meta-llama/Llama-3.1-8B-Instruct:cerebras'
    maxTokens: Optional[int] = 1000
    temperature: Optional[float] = 0.8

    def load(self, path: str) -> None:
        if not os.path.exists(path):
            self.save(path)
            return
        
        stored_config = File.open(path)

        if stored_config and isinstance(stored_config, dict):
            for key, value in stored_config.items():
                if hasattr(self, key) and not callable(getattr(self, key)):
                    setattr(self, key, value)

    def save(self, path: str) -> None:
        File.save(path, self.__dict__)
