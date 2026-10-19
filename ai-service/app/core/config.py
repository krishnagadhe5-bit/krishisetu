import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "KrishiSetu AI Microservice"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    API_KEY: str = os.getenv("AI_SERVICE_API_KEY", "dev-ai-service-key")
    MODEL_PATH: str = os.getenv("MODEL_PATH", "app/models/crop_rf_model.joblib")
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "none")

settings = Settings()
