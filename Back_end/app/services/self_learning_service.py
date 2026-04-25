import json
import logging
from typing import Optional, Dict
from sqlalchemy.orm import Session
from app.models.all_models import QuestionBank
from app.services.ai_service import ai_service
from app.services.rag_service import rag_service
from app.services.embedding_service import embedding_service

logger = logging.getLogger(__name__)

class SelfLearningService:
    """
    Implements the 5-step self-learning question algorithm.
    Detects gaps in company profiles and evolves the question bank.
    """
    async def detect_gap_and_generate(self, db: Session, core_data: Dict, industry: str) -> Optional[QuestionBank]:
        """
        Step 1 & 2: Gap Detection and Question Generation.
        """
        prompt = f"""
        Industry: {industry}
        Current Profile Data: {json.dumps(core_data)}

        Analyze the data and identify a critical GAP that prevents a full business strategy generation.
        Generate a professional, non-redundant question to fill this gap.
        
        Return JSON:
        {{
            "gap_topic": "Short title of the gap",
            "question_text": "The actual question to ask",
            "justification": "Why this is important for this industry"
        }}
        """

        messages = [{"role": "user", "content": prompt}]
        
        try:
            response_text = ai_service.call_internal(messages, json_mode=True)
            data = json.loads(response_text)
            
            # Step 4: Save Criteria (Saved as PENDING)
            embedding = await embedding_service.get_embeddings(data['question_text'])
            new_q = await rag_service.add_learned_question(
                db=db,
                question_text=data['question_text'],
                category='SELF_LEARNED',
                industry=industry,
                embedding=embedding
            )
            return new_q
        except Exception as e:
            logger.error(f"Gap detection/generation failed: {e}")
            return None

    async def process_feedback(self, db: Session, question_id: str, is_positive: bool) -> Optional[QuestionBank]:
        """
        Step 3 & 5: User Feedback and Activation Threshold.
        """
        try:
            q = db.query(QuestionBank).filter(QuestionBank.id == question_id).first()
            if not q:
                return None
                
            if is_positive:
                q.approval_count += 1
            else:
                q.approval_count -= 1
            
            # Step 5: Activation Threshold (e.g., 5 approvals)
            # Thresholds could be moved to config
            if q.approval_count >= 5:
                q.status = 'APPROVED'
                logger.info(f"Question {q.id} auto-approved via threshold.")
            elif q.approval_count <= -3:
                q.status = 'REJECTED'
                logger.info(f"Question {q.id} auto-rejected via threshold.")
            
            db.commit()
            return q
        except Exception as e:
            logger.error(f"Feedback processing failed: {e}")
            return None

self_learning_service = SelfLearningService()
