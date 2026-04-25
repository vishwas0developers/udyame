import httpx
from typing import List
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class EmbeddingService:
    def __init__(self):
        self.model_name = "intfloat/multilingual-e5-large"
        self.api_url = f"https://api-inference.huggingface.co/models/{self.model_name}"
        self.hf_token = settings.HF_TOKEN
        self.mode = settings.EMBEDDING_MODE.upper()
        
        # Local model (lazy loaded to save memory if not used)
        self._local_model = None

    async def get_embeddings(self, text: str) -> List[float]:
        """
        Generates 1024-dimensional embeddings for the given text.
        Supports local (sentence-transformers) and remote (HuggingFace) modes.
        """
        if self.mode == "LOCAL":
            return self._get_local_embeddings(text)
        else:
            return await self._get_remote_embeddings(text)

    async def _get_remote_embeddings(self, text: str) -> List[float]:
        if not self.hf_token:
            logger.warning("HF_TOKEN missing in settings, falling back to mock embeddings")
            return self._get_mock_embeddings(text)
            
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.api_url,
                    headers={"Authorization": f"Bearer {self.hf_token}"},
                    json={"inputs": f"query: {text}"}, # E5 requirement
                    timeout=10.0
                )
                if response.status_code == 200:
                    result = response.json()
                    # HF Inference API returns a list of floats for feature-extraction
                    if isinstance(result, list) and len(result) > 0:
                        return result[0] if isinstance(result[0], list) else result
                else:
                    logger.error(f"HF API Error: {response.status_code} - {response.text}")
        except Exception as e:
            logger.error(f"Error calling HF API: {e}")
            
        return self._get_mock_embeddings(text)

    def _get_local_embeddings(self, text: str) -> List[float]:
        try:
            from sentence_transformers import SentenceTransformer
            if self._local_model is None:
                logger.info(f"Loading local embedding model: {self.model_name}")
                self._local_model = SentenceTransformer(self.model_name)
            
            # E5 models require "query: " or "passage: " prefix
            prefixed_text = f"query: {text}"
            embeddings = self._local_model.encode([prefixed_text], normalize_embeddings=True)
            return embeddings[0].tolist()
        except Exception as e:
            logger.error(f"Local embedding error: {e}")
            return self._get_mock_embeddings(text)

    def _get_mock_embeddings(self, text: str) -> List[float]:
        import random
        # Seeded for deterministic output for same text in mock mode
        # Using hash(text) as seed for variety
        random.seed(hash(text)) 
        return [random.uniform(-0.1, 0.1) for _ in range(1024)]

embedding_service = EmbeddingService()
