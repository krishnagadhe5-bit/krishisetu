from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import recommend, disease, chat
from app.services.ollama_service import OllamaService

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="KrishiSetu AI/ML Microservice for Crop Recommendation, Disease Image Diagnostics, and Ollama Agricultural RAG",
    openapi_url="/api/v1/openapi.json"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routes
app.include_router(recommend.router, prefix="/api/v1", tags=["Crop Recommendation"])
app.include_router(disease.router, prefix="/api/v1", tags=["Disease Computer Vision"])
app.include_router(chat.router, prefix="/api/v1", tags=["Agricultural RAG Assistant & Ollama"])

@app.get("/health", tags=["Health"])
def health_check():
    ollama_status = OllamaService.get_status()
    return {
        "status": "healthy",
        "service": "KrishiSetu AI Microservice",
        "version": settings.VERSION,
        "models": {
            "crop_recommendation": "RandomForest-ICAR-v1.0",
            "disease_cv": "MobileNetV3-PlantVillage-v2.1",
            "assistant_rag": "AgronomicCorpus-MH",
            "ollama": ollama_status
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
