import litellm
from typing import List, Dict, Any, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.core.config import settings
from app.services.credit_service import credit_service

class AIService:
    @staticmethod
    def get_active_model(db: Session) -> str:
        """
        Fetches the default active model from the database.
        Falls back to models with highest priority if default is inactive.
        """
        from app.models.all_models import AIModel
        model = db.query(AIModel).filter(
            AIModel.is_default == True, 
            AIModel.is_active == True
        ).first()
        
        if model:
            return model.model_id
            
        # Fallback chain
        fallback = db.query(AIModel).filter(
            AIModel.is_active == True
        ).order_by(AIModel.fallback_priority.asc()).first()
        
        return fallback.model_id if fallback else "gpt-3.5-turbo"

    @staticmethod
    def generate_response(
        db: Session,
        user_id: UUID,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 1000,
        reference_id: str = "ai_generation"
    ) -> Dict[str, Any]:
        """
        Generic AI response generator via LiteLLM with credit deduction.
        Uses DB-configured model if none specified.
        """
        # Use dynamic model if none provided
        if not model:
            model = AIService.get_active_model(db)
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

    @staticmethod
    async def generate_stream(
        db: Session,
        user_id: UUID,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 1000,
        reference_id: str = "ai_stream"
    ):
        """
        Async generator for SSE streaming via LiteLLM.
        Deducts credits after stream completion.
        """
        import litellm
        import json
        if not model:
            model = AIService.get_active_model(db)

        # 1. Pre-check
        current_balance = credit_service.get_balance(db, user_id)
        if current_balance <= 0:
            yield f"data: {json.dumps({'error': 'Insufficient credits'})}\n\n"
            return

        try:
            response = litellm.completion(
                model=model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                stream=True
            )

            full_content = ""
            for chunk in response:
                if chunk.choices and chunk.choices[0].delta.content:
                    token = chunk.choices[0].delta.content
                    full_content += token
                    yield f"data: {json.dumps({'token': token})}\n\n"

            # 2. Post-stream Accounting
            input_tokens = litellm.token_counter(model=model, messages=messages)
            output_tokens = litellm.token_counter(model=model, text=full_content)
            total_tokens = input_tokens + output_tokens
            
            cost = credit_service.calculate_cost(total_tokens, model, db)
            credit_service.deduct_credits(
                db=db, user_id=user_id, amount=cost,
                reference_id=reference_id, transaction_type="AI_STREAM"
            )
            
            yield f"data: {json.dumps({'done': True, 'cost': float(cost)})}\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    @staticmethod
    def call_internal(
        messages: List[Dict[str, str]], 
        model: str = "gpt-3.5-turbo",
        json_mode: bool = False
    ) -> str:
        """
        Internal utility for system tasks (Intent classification, summarization) 
        that does NOT deduct user credits.
        """
        try:
            import litellm
            response = litellm.completion(
                model=model, 
                messages=messages,
                response_format={"type": "json_object"} if json_mode else None
            )
            return response.choices[0].message.content
        except Exception as e:
            # logger.error(f"Internal AI Call Error: {e}")
            return "{}" if json_mode else ""

ai_service = AIService()
