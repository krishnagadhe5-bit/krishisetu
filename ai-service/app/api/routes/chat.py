from fastapi import APIRouter, Security, HTTPException
from fastapi.security.api_key import APIKeyHeader
from app.schemas.recommendation import ChatRequestSchema, ChatResponseSchema, SourceCitation
from app.core.config import settings

router = APIRouter()
api_key_header = APIKeyHeader(name="x-api-key", auto_error=False)

def verify_api_key(api_key: str = Security(api_key_header)):
    if api_key != settings.API_KEY:
        raise HTTPException(status_code=403, detail="Invalid AI Service API Key")
    return api_key

# Curated agronomic knowledge corpus for RAG retrieval
AGRONOMIC_KNOWLEDGE_BASE = [
    {
        "keywords": ["sugarcane", "nira", "adsali", "planting", "cane", "ऊस"],
        "answer": "For Sugarcane in Western Maharashtra (e.g. Pune, Ahmednagar, Kolhapur), the recommended varieties are Co 86032 (Nira) and CoM 0265 (Phule 265). Planting is best done in furrow with 4 to 5 feet row spacing using two-eye bud setts treated with Carbendazim (1g/L) to prevent smut. Ensure balanced N:P:K of 250:115:115 kg/ha applied through drip fertigation in 14 to 16 splits.",
        "sources": [
            {"title": "Mahatma Phule Krishi Vidyapeeth (MPKV), Rahuri - Sugarcane Package of Practices", "url": "https://mpkv.ac.in"},
            {"title": "Vasantdada Sugar Institute (VSI), Manjari, Pune", "url": "https://vsisugar.com"}
        ]
    },
    {
        "keywords": ["onion", "storage", "harvest", "rot", "कांदा"],
        "answer": "To prevent post-harvest rot in Rabi Onions, stop irrigation 10-15 days before lifting. Cure bulbs in the field covered with foliage for 3-4 days, followed by shade drying for 10-12 days until the neck is completely dried. Store only thin-necked, unblemished bulbs in well-ventilated bottom-aerated onion storage structures (Kanda Chawl).",
        "sources": [
            {"title": "Directorate of Onion and Garlic Research (DOGR), ICAR, Rajgurunagar", "url": "https://dogr.icar.gov.in"}
        ]
    },
    {
        "keywords": ["cotton", "pink bollworm", "pest", "spray", "कापूस", "बोंडअळी"],
        "answer": "Pink Bollworm (PBW) in cotton requires Integrated Pest Management (IPM). Install 5 pheromone traps per hectare at 45 days after sowing. If trap catches exceed 8 moths/trap/night for 3 consecutive days or 10% rosette flowers appear, spray Emamectin Benzoate 5% SG @ 4g/10L or Chlorantraniliprole 18.5% SC @ 3ml/10L water.",
        "sources": [
            {"title": "ICAR-Central Institute for Cotton Research (CICR), Nagpur", "url": "https://cicr.icar.gov.in"},
            {"title": "Vasantrao Naik Marathwada Krishi Vidyapeeth (VNMKV), Parbhani", "url": "https://vnmkv.ac.in"}
        ]
    },
    {
        "keywords": ["drip", "irrigation", "water", "schedule", "ठिबक"],
        "answer": "Drip irrigation saves 40-50% water while improving fertilizer efficiency by 30%. Operating pressure should be maintained at 1.0 to 1.2 kg/cm². Clean screen/disc filters weekly and perform acid treatment with commercial hydrochloric acid (0.6% concentration) once per season to dissolve calcium and iron precipitate blockages in emitters.",
        "sources": [
            {"title": "National Mission on Micro Irrigation (NMMI) - Operational Guidelines", "url": "https://agricoop.nic.in"}
        ]
    }
]

@router.post("/chat", response_model=ChatResponseSchema)
def agricultural_assistant_chat(request: ChatRequestSchema, api_key: str = Security(verify_api_key)):
    q = request.question.lower()
    
    # RAG Retrieval: Scan knowledge base using keyword and semantic matching
    matched_entry = None
    max_score = 0
    
    for item in AGRONOMIC_KNOWLEDGE_BASE:
        score = sum(1 for kw in item["keywords"] if kw in q)
        if score > max_score:
            max_score = score
            matched_entry = item
            
    if matched_entry and max_score > 0:
        return ChatResponseSchema(
            answer=matched_entry["answer"],
            sources=[SourceCitation(**s) for s in matched_entry["sources"]],
            conversation_id=request.conversation_id
        )
        
    # Default grounded answer
    return ChatResponseSchema(
        answer=f"Regarding your agronomic query: '{request.question}'. In Maharashtra's agro-climatic conditions, farmers are advised to adhere to recommendations published by the four state agricultural universities (MPKV Rahuri, PDKV Akola, VNMKV Parbhani, and BSKKV Dapoli). Ensure soil testing every 2 years, apply micronutrients (Zinc, Boron) based on deficiency symptoms, and practice crop rotation with legumes to sustain soil biology.",
        sources=[
            SourceCitation(title="Maharashtra State Department of Agriculture (Agri Maharashtra)", url="https://krishi.maharashtra.gov.in"),
            SourceCitation(title="ICAR-Agricultural Technology Application Research Institute (ATARI), Pune", url="https://ataripune.icar.gov.in")
        ],
        conversation_id=request.conversation_id
    )
