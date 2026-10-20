import httpx
from typing import Optional, Dict, Any
from app.core.config import settings

class OllamaService:
    @staticmethod
    def is_available() -> bool:
        """Checks if local Ollama daemon is reachable on configured port."""
        try:
            r = httpx.get(f"{settings.OLLAMA_BASE_URL}/api/tags", timeout=1.5)
            return r.status_code == 200
        except Exception:
            return False

    @staticmethod
    def get_status() -> Dict[str, Any]:
        """Returns Ollama connection health and model info."""
        available = OllamaService.is_available()
        return {
            "provider": "ollama",
            "model": settings.OLLAMA_MODEL,
            "endpoint": settings.OLLAMA_BASE_URL,
            "status": "connected" if available else "offline_or_standby",
            "info": "Local Ollama LLM integration ready" if available else f"Ollama daemon not detected on {settings.OLLAMA_BASE_URL}. Run 'ollama run {settings.OLLAMA_MODEL}' to activate local LLM inference."
        }

    @staticmethod
    def generate_agronomic_response(question: str, context: str = "") -> Optional[str]:
        """
        Queries Ollama model with grounded agricultural context.
        Returns generated answer string if successful, or None on failure.
        """
        system_prompt = (
            "You are KrishiSetu's AI Agricultural Advisor. You provide accurate, safe agronomic advice "
            "for Indian farmers with special focus on Maharashtra agro-climatic zones, black cotton soil, "
            "and seasonal crops (cotton, sugarcane, onion, soybean, pomegranate). "
            "Use simple, clear advice. Avoid unverified pesticide prescriptions."
        )

        full_prompt = (
            f"Verified Agricultural Context:\n{context}\n\n"
            f"Farmer Question: {question}\n\n"
            "Provide a helpful, practical agronomic response:"
        )

        payload = {
            "model": settings.OLLAMA_MODEL,
            "prompt": full_prompt,
            "system": system_prompt,
            "stream": False,
            "options": {
                "temperature": 0.3,
                "top_p": 0.9,
            }
        }

        try:
            with httpx.Client(timeout=30.0) as client:
                res = client.post(f"{settings.OLLAMA_BASE_URL}/api/generate", json=payload)
                if res.status_code == 200:
                    data = res.json()
                    return data.get("response", "").strip()
        except Exception as e:
            # Fall back cleanly without raising unhandled errors
            print(f"[OLLAMA_SERVICE] Notice: Ollama request to {settings.OLLAMA_BASE_URL} bypassed: {e}")

        return None
