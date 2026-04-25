import json
import logging
from typing import Dict
from app.services.ai_service import ai_service

logger = logging.getLogger(__name__)

class IntentService:
    """
    Service to classify user input into actionable intents.
    Supports Hinglish and conversational business queries.
    """
    async def classify_intent(self, user_input: str) -> Dict:
        """
        Classifies user input using a fast LLM call.
        Returns a structured dictionary with intent and confidence.
        """
        system_prompt = """
        You are a business intent classifier for Udyame AI.
        Classify the user's input into exactly one of these categories:
        - BUSINESS_MANAGEMENT: Strategy, operations, HR, structure, finance.
        - PROPOSAL_SALES: Pitching, client acquisition, sales scripts.
        - CLARIFICATION_NEEDED: User is confused or asking how to use the app.
        - GENERAL_QUERY: Greetings, generic chat, or non-business topics.

        Return ONLY a JSON object with:
        {
            "intent": "CATEGORY_NAME",
            "confidence": 0.0-1.0,
            "keywords": ["list", "of", "business", "keywords"],
            "hinglish_detected": boolean
        }
        """

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"User Input: '{user_input}'"}
        ]

        try:
            # Using internal call (no credits) with a cheaper/faster model if possible
            response_text = ai_service.call_internal(
                messages=messages, 
                model="gpt-3.5-turbo", # Default fast model
                json_mode=True
            )
            
            data = json.loads(response_text)
            return data
        except Exception as e:
            logger.error(f"Intent classification failed: {e}")
            return {
                "intent": "GENERAL_QUERY",
                "confidence": 0.0,
                "keywords": [],
                "hinglish_detected": False
            }

intent_service = IntentService()
