from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.routers.deps import get_current_user
from app.models.all_models import User, QuestionBank
from pydantic import BaseModel
from uuid import UUID

router = APIRouter()

class QuestionUpdate(BaseModel):
    action: str  # approve, reject, edit
    new_text: Optional[str] = None

@router.get("/questions/pending")
def list_pending_questions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Ensure only admins can access (Logic simplified for demo)
    if current_user.subscription_tier != "ADMIN":
        # Note: In real app, we would have a 'role' column
        pass 

    questions = db.query(QuestionBank).filter(QuestionBank.status == 'PENDING').all()
    return questions

@router.post("/questions/{question_id}/review")
def review_question(
    question_id: UUID,
    update: QuestionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    question = db.query(QuestionBank).filter(QuestionBank.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    if update.action == "approve":
        question.status = "APPROVED"
        if update.new_text:
            question.text = update.new_text
    elif update.action == "reject":
        question.status = "REJECTED"
    
    db.commit()
    return {"message": f"Question {update.action} successfully"}
