import json
import logging
from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.models.all_models import QuestionBank, InternalPlanning
from app.services.embedding_service import embedding_service
from app.core.redis_client import redis_client

logger = logging.getLogger(__name__)

class RAGService:
    async def find_similar_questions(self, db: Session, query: str, limit: int = 5) -> List[Dict]:
        """
        Performs semantic search in the approved question bank.
        """
        query_embedding = await embedding_service.get_embeddings(query)
        
        # pgvector similarity search (using L2 distance <->)
        stmt = text("""
            SELECT id, text, category, industry_tag, approval_count
            FROM question_bank
            WHERE status = 'APPROVED'
            ORDER BY embedding <-> :query_vec
            LIMIT :limit
        """)
        
        results = db.execute(stmt, {"query_vec": str(query_embedding), "limit": limit}).fetchall()
        
        return [
            {"id": str(r[0]), "text": r[1], "category": r[2], "industry": r[3], "score": r[4]}
            for r in results
        ]

    async def get_grounded_context(self, db: Session, query: str, company_id: Optional[str] = None) -> str:
        """
        Fetches relevant context from the question bank and company profile.
        Includes Redis caching and top-3 semantic reranking.
        """
        cache_key = f"rag_context:{hash(query)}:{company_id}"
        
        try:
            cached_context = await redis_client.get(cache_key)
            if cached_context:
                return cached_context
        except Exception as e:
            logger.error(f"Redis cache fetch error: {e}")

        # 1. Semantic Search in Question Bank
        similar_qs = await self.find_similar_questions(db, query, limit=5)
        
        # 2. Reranking (Simple: Top 3 by similarity, then by approval_count)
        # Since pgvector already did similarity, we just pick top 3
        top_context = similar_qs[:3]
        
        context_parts = ["### Relevant Business Knowledge:"]
        for item in top_context:
            context_parts.append(f"- {item['text']} (Category: {item['category']})")

        # 3. Inject Company Profile if available
        if company_id:
            planning = db.query(InternalPlanning).filter(InternalPlanning.company_id == company_id).first()
            if planning and planning.core_data:
                context_parts.append("\n### Current Company Context (Answered Questions):")
                # Only include the last 5 answers to keep context window small
                answers = list(planning.core_data.items())[-5:]
                for q, a in answers:
                    context_parts.append(f"Q: {q}\nA: {a}")

        final_context = "\n".join(context_parts)
        
        # Cache for 15 minutes
        try:
            await redis_client.set(cache_key, final_context, expire=900)
        except Exception as e:
            logger.error(f"Redis cache set error: {e}")

        return final_context

    async def add_learned_question(self, db: Session, question_text: str, category: str, industry: str, embedding: List[float]):
        """
        Saves a new AI-generated question for admin approval.
        """
        new_q = QuestionBank(
            text=question_text,
            category=category,
            industry_tag=industry,
            embedding=embedding,
            status='PENDING'
        )
        db.add(new_q)
        db.commit()
        return new_q

rag_service = RAGService()
