from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class CropInputSchema(BaseModel):
    nitrogen: float = Field(..., ge=0, le=300, description="Nitrogen content in soil (kg/ha)")
    phosphorus: float = Field(..., ge=0, le=200, description="Phosphorus content in soil (kg/ha)")
    potassium: float = Field(..., ge=0, le=250, description="Potassium content in soil (kg/ha)")
    temperature: float = Field(..., ge=-10, le=60, description="Average temperature in Celsius")
    humidity: float = Field(..., ge=0, le=100, description="Relative humidity percentage")
    ph: float = Field(..., ge=3.0, le=10.0, description="Soil pH value")
    rainfall: float = Field(..., ge=0, le=4000, description="Annual or seasonal rainfall in mm")
    soil_type: Optional[str] = None
    season: Optional[str] = None

class CropRecommendationItem(BaseModel):
    crop: str
    confidence: float
    matchRationale: str
    season: Optional[str] = None

class CropRecommendationResponse(BaseModel):
    recommendations: List[CropRecommendationItem]
    modelVersion: str
    timestamp: str
    notice: Optional[str] = None

class ChatRequestSchema(BaseModel):
    question: str
    conversation_id: Optional[str] = None

class SourceCitation(BaseModel):
    title: str
    url: Optional[str] = None
    snippet: Optional[str] = None

class ChatResponseSchema(BaseModel):
    answer: str
    sources: List[SourceCitation]
    conversation_id: Optional[str] = None
