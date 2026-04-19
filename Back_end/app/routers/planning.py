from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.routers.deps import get_current_user
from app.models.all_models import User, InternalPlanning, Company
from app.services.ai_service import ai_service
from app.services.credit_service import credit_service
from app.services.guard_rail_service import guard_rail_service
from decimal import Decimal
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class ChatInput(BaseModel):
    prompt: str
    company_id: Optional[str] = None

CORE_QUESTIONS = [
    "What is your company's name?",
    "Which industry does your business operate in (e.g., Tech, Retail, Manufacturing)?",
    "What is the primary problem you are solving for your customers?",
    "Who is your target audience (be specific)?",
    "What is your primary product or service?",
    "How do you plan to generate revenue?",
    "Do you have a team, or are you a solo founder?",
    "What are your top 3 goals for the next 12 months?",
    "Which region of India (or globally) do you primarily serve?",
    "What is your estimated initial investment or budget?"
]

@router.post("/chat")
async def chat_with_architect(
    chat_in: ChatInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Fetch or Create Planning State
    planning = db.query(InternalPlanning).join(Company).filter(Company.user_id == current_user.id).first()
    
    if not planning:
        new_company = Company(user_id=current_user.id, name="My New Venture")
        db.add(new_company)
        db.commit()
        db.refresh(new_company)
        planning = InternalPlanning(company_id=new_company.id, core_data={"answers": [], "index": 0})
        db.add(planning)
        db.commit()
        db.refresh(planning)

    current_index = planning.core_data.get("index", 0)
    
    # 2. Check and deduct credits for wizard step
    credit_service.deduct_credits(
        db=db,
        user_id=current_user.id,
        amount=Decimal("0.10"), # Wizard steps are flat rate 0.10
        reference_id=f"wizard_step_{current_index}",
        transaction_type="WIZARD_STEP"
    )
    
    # 3. Save current answer & Get next question
    answers = planning.core_data.get("answers", [])
    if chat_in.prompt:
        clean_prompt = guard_rail_service.redact(chat_in.prompt)
        answers.append({"question": CORE_QUESTIONS[current_index], "answer": clean_prompt})
    
    next_index = current_index + 1
    
    if next_index < len(CORE_QUESTIONS):
        next_question = CORE_QUESTIONS[next_index]
        planning.core_data = {"answers": answers, "index": next_index}
        db.commit()
        return {
            "response": f"Got it. Next: {next_question}",
            "remaining_credits": float(current_user.credit_balance)
        }
    else:
        # Core questions finished - Trigger AI for dynamic analysis
        planning.core_data = {"answers": answers, "index": next_index, "status": "CORE_COMPLETE"}
        db.commit()
        
        context = "\n".join([f"Q: {a['question']} A: {a['answer']}" for a in answers])
        messages = [
            {"role": "system", "content": "You are Udyame AI. You have just completed the core discovery. Provide a 2-sentence summary of the business and ask if they have any specific concerns."},
            {"role": "user", "content": f"Here is my business profile:\n{context}"}
        ]
        
        # ai_service now automatically deducts credits based on token usage
        ai_response = ai_service.generate_response(db, current_user.id, messages, reference_id="core_summary")
        
        return {
            "response": ai_response["content"],
            "remaining_credits": float(current_user.credit_balance)
        }
