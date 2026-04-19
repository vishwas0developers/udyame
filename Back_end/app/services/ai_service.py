import litellm
from typing import List, Dict, Any, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.core.config import settings
from app.services.credit_service import credit_service

class AIService:
    @staticmethod
    def generate_response(
        db: Session,
        user_id: UUID,
        messages: List[Dict[str, str]],
        model: str = "gpt-3.5-turbo",
        temperature: float = 0.7,
        max_tokens: int = 1000,
        reference_id: str = "ai_generation"
    ) -> Dict[str, Any]:
        """
        Generic AI response generator via LiteLLM with credit deduction.
        """
        try:
            # 1. Pre-check balance (approximate)
            current_balance = credit_service.get_balance(db, user_id)
            if current_balance <= 0:
                raise HTTPException(status_code=402, detail="Insufficient credits")

            # 2. Call LiteLLM
            # LiteLLM automatically handles different providers
            response = litellm.completion(
                model=model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens
            )
            
            # 3. Extract content and token counts
            content = response.choices[0].message.content
            usage = response.usage
            
            # 4. Calculate cost and deduct tokens
            cost = credit_service.calculate_cost(usage.total_tokens, model, db)
            credit_service.deduct_credits(
                db=db,
                user_id=user_id,
                amount=cost,
                reference_id=reference_id,
                transaction_type="AI_GENERATION"
            )
            
            return {
                "content": content,
                "input_tokens": usage.prompt_tokens,
                "output_tokens": usage.completion_tokens,
                "total_tokens": usage.total_tokens,
                "cost": float(cost),
                "model": model
            }
        except HTTPException:
            raise
        except Exception as e:
            # In a real app, log the error and handle specific provider failures
            raise Exception(f"AI Generation Error: {str(e)}")

ai_service = AIService()
