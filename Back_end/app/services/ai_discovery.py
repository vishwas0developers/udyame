import httpx
import os
from typing import List, Dict, Any, Optional

async def fetch_models_for_provider(provider_type: str, api_key: Optional[str] = None, base_url: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Fetches available models from the specified provider's API.
    REQUIREMENT: NOTHING IS HARD-CODED. base_url must be provided.
    """
    
    if not base_url:
        return [{"error": f"Base URL for {provider_type.upper()} is not configured in the database."}]

    # Handle Gemini (Gemini usually needs the key in the URL or headers)
    if provider_type == 'gemini':
        key = api_key or os.getenv("GEMINI_API_KEY")
        if not key:
            return [{"error": "Gemini API Key is missing"}]
        
        # We expect base_url to be the full models endpoint for Gemini, 
        # or we append the key if it's missing from the stored URL.
        url = base_url
        if "key=" not in url:
            separator = "&" if "?" in url else "?"
            url = f"{url}{separator}key={key}"
            
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url)
                if response.status_code == 200:
                    data = response.json()
                    models = []
                    for m in data.get('models', []):
                        if 'generateContent' in m.get('supportedGenerationMethods', []):
                            model_id = m.get('name', '').replace('models/', '')
                            models.append({
                                "model_id": model_id,
                                "display_name": m.get('displayName', model_id),
                                "is_vision": any(x in model_id.lower() for x in ['vision', 'pro', 'flash']),
                                "is_text": True
                            })
                    return models
                else:
                    return [{"error": f"Gemini API error ({response.status_code}): {response.text[:200]}"}]
        except Exception as e:
            return [{"error": f"Discovery failed: {str(e)}"}]

    # Handle OpenAI-compatible (openai, custom-openai, groq, openrouter, etc.)
    elif provider_type in ['openai', 'custom-openai', 'groq', 'openrouter', 'lm_studio', 'ollama'] or True: # Default to OpenAI-compatible logic
        key = api_key or os.getenv("OPENAI_API_KEY")
        if not key and provider_type not in ['ollama', 'lm_studio']:
            return [{"error": f"{provider_type.upper()} API Key is missing"}]
        
        url = base_url
        if not url.endswith('/models'):
            url = url.rstrip('/') + "/models"
            
        headers = {}
        if key:
            headers["Authorization"] = f"Bearer {key}"
            
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, headers=headers)
                if response.status_code == 200:
                    data = response.json()
                    models = []
                    
                    # For standard OpenAI, we might want to filter, but since "nothing is hard-coded", 
                    # we should probably just return what the API gives us.
                    for m in data.get('data', []):
                        model_id = m.get('id', '')
                        models.append({
                            "model_id": model_id,
                            "display_name": model_id.upper(),
                            "is_vision": any(x in model_id.lower() for x in ['vision', 'gpt-4o', 'claude-3', 'gemini']),
                            "is_text": True
                        })
                    return sorted(models, key=lambda x: x['model_id'])
                else:
                    return [{"error": f"API error ({response.status_code}): {response.text[:200]}"}]
        except Exception as e:
            return [{"error": f"Discovery failed: {str(e)}"}]

    return [{"error": f"Unsupported provider type: {provider_type}"}]
