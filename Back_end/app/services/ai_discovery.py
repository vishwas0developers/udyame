import httpx
import os
from typing import List, Dict, Any

async def fetch_models_for_provider(provider: str, api_key: str = None, endpoint: str = None) -> List[Dict[str, Any]]:
    """
    Fetches available models from the specified provider's API.
    Mirroring the logic from ocr_for_mcq.
    """
    if not api_key and provider in ['gemini', 'openai']:
        # Try to get from env if not provided
        if provider == 'gemini':
            api_key = os.getenv("GEMINI_API_KEY")
        elif provider == 'openai':
            api_key = os.getenv("OPENAI_API_KEY")

    if provider == 'gemini':
        if not api_key:
            return [{"error": "Gemini API Key is missing"}]
        
        url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url)
                if response.status_code == 200:
                    data = response.json()
                    models = []
                    for m in data.get('models', []):
                        # Filter for generation models
                        if 'generateContent' in m.get('supportedGenerationMethods', []):
                            model_id = m.get('name', '').replace('models/', '')
                            models.append({
                                "model_id": model_id,
                                "display_name": m.get('displayName', model_id),
                                "is_vision": 'vision' in model_id.lower() or 'pro' in model_id.lower() or 'flash' in model_id.lower()
                            })
                    return models
                else:
                    return [{"error": f"Gemini API error: {response.text}"}]
        except Exception as e:
            return [{"error": str(e)}]

    elif provider == 'openai':
        if not api_key:
            return [{"error": "OpenAI API Key is missing"}]
        
        url = endpoint or "https://api.openai.com/v1/models"
        headers = {"Authorization": f"Bearer {api_key}"}
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, headers=headers)
                if response.status_code == 200:
                    data = response.json()
                    models = []
                    # Filter for common chat/completion models
                    allowed_prefixes = ('gpt-', 'text-davinci', 'o1-', 'o3-')
                    for m in data.get('data', []):
                        model_id = m.get('id', '')
                        if model_id.startswith(allowed_prefixes):
                            models.append({
                                "model_id": model_id,
                                "display_name": model_id.upper(),
                                "is_vision": 'vision' in model_id.lower() or 'gpt-4o' in model_id.lower()
                            })
                    return sorted(models, key=lambda x: x['model_id'])
                else:
                    return [{"error": f"OpenAI API error: {response.text}"}]
        except Exception as e:
            return [{"error": str(e)}]

    elif provider in ['ollama', 'lm_studio']:
        url = endpoint or ("http://localhost:11434/v1/models" if provider == 'ollama' else "http://localhost:1234/v1/models")
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url)
                if response.status_code == 200:
                    data = response.json()
                    models = []
                    for m in data.get('data', []):
                        model_id = m.get('id', '')
                        models.append({
                            "model_id": model_id,
                            "display_name": model_id,
                            "is_vision": False # Default for local
                        })
                    return models
                else:
                    return [{"error": f"{provider.upper()} API error: {response.text}"}]
        except Exception as e:
            return [{"error": f"Could not connect to {provider.upper()}. Is it running?"}]

    return [{"error": f"Unsupported provider: {provider}"}]
