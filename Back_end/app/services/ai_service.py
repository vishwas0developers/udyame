import litellm
from typing import List, Dict, Any
from app.core.config import settings

class AIService:
    @staticmethod
    def generate_response(
        messages: List[Dict[str, str]],
        model: str = "gpt-3.5-turbo",  # Default if not specified
        provider: str = "openai",
        temperature: float = 0.7,
        max_tokens: int = 1000
    ) -> Dict[str, Any]:
        """
        Generic AI response generator via LiteLLM.
        """
        try:
            # LiteLLM automatically handles different providers
            response = litellm.completion(
                model=model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens
            )
            
            # Extract content and token counts
            content = response.choices[0].message.content
            usage = response.usage
            
            return {
                "content": content,
                "input_tokens": usage.prompt_tokens,
                "output_tokens": usage.completion_tokens,
                "total_tokens": usage.total_tokens,
                "model": model
            }
        except Exception as e:
            # In a real app, log the error and handle specific provider failures
            raise Exception(f"AI Generation Error: {str(e)}")

ai_service = AIService()
