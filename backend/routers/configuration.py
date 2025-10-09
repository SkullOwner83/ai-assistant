from fastapi import APIRouter, Request, Response, status
from schemas.config_schema import ConfigSchema
from infraestructure.ai_client import IAClient
from models.config import Config

router = APIRouter(
    prefix="/configuration",
    tags=["config"]
)

@router.get('', response_model=ConfigSchema, status_code=status.HTTP_200_OK)
async def get_config(request: Request) -> Config:
    config = request.app.state.config
    return config

@router.post('', status_code=status.HTTP_200_OK)
async def save_config(request: Request, newConfig: ConfigSchema):
    ai_client: IAClient = request.app.state.ai_client
    ai_client.update_config(api_key=newConfig.apiKey, hf_model=newConfig.hfModel, max_tokens=newConfig.maxTokens)

    config: Config = request.app.state.config
    for key, value in newConfig.__dict__.items():
        setattr(config, key, value)

    config.save(request.app.state.config_path)
    return Response(status_code=status.HTTP_204_NO_CONTENT)