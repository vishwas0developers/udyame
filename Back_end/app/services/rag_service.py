from sqlalchemy.orm import Session
from sqlalchemy import text
from app.models.all_models import QuestionBank
from app.services.embedding_service import embedding_service
from typing import List, Dict

class RAGService:
    @staticmethod
    async def find_similar_questions(db: Session, query: str, limit: int = 5) -> List[Dict]:
        """
        Performs semantic search in the approved question bank.
        """
        query_embedding = await embedding_service.get_embeddings(query)
        
        # pgvector similarity search (using L2 distance <->)
        # We search specifically for APPROVED questions
        stmt = text("""
            SELECT id, text, category, industry_tag, approval_count
            FROM question_bank
            WHERE status = 'APPROVED'
            ORDER BY embedding <-> :query_vec
            LIMIT :limit
        """)
        
        results = db.execute(stmt, {"query_vec": str(query_embedding), "limit": limit}).fetchall()
        
        return [
            {"id": str(r[0]), "text": r[1], "category": r[2], "industry": r[3]}
            for r in results
        ]

    @staticmethod
    async def add_learned_question(db: Session, question_text: str, category: str, industry: str, embedding: List[float]):
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
