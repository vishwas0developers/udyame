from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.routers.deps import get_current_user
from app.models.all_models import User
from app.services.ai_service import ai_service
from app.core.credits import check_and_deduct_credits
from app.models.all_models import InternalPlanning, Company
from app.core.guardrails import guardrail
from decimal import Decimal
from pydantic import BaseModel

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
    # For now, we'll assume a single planning session per user for simplicity
    planning = db.query(InternalPlanning).join(Company).filter(Company.user_id == current_user.id).first()
    
    if not planning:
        # Create a dummy company if none exists
        new_company = Company(user_id=current_user.id, name="My New Venture")
        db.add(new_company)
        db.commit()
        db.refresh(new_company)
        planning = InternalPlanning(company_id=new_company.id, core_data={"answers": [], "index": 0})
        db.add(planning)
        db.commit()
        db.refresh(planning)

    current_index = planning.core_data.get("index", 0)
    
    # 2. Check and deduct credits
    check_and_deduct_credits(
        db=db,
        user_id=current_user.id,
        cost=Decimal("0.5"), # Lower cost for wizard steps
        reference_id=f"wizard_step_{current_index}"
    )
    
    # 3. Save current answer & Get next question
    answers = planning.core_data.get("answers", [])
    if chat_in.prompt:
        # PII Cleanup
        clean_prompt = guardrail.redact(chat_in.prompt)
        answers.append({"question": CORE_QUESTIONS[current_index], "answer": clean_prompt})
    
    next_index = current_index + 1
    
    # Check if we finished core questions
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
        
        # Prepare context for AI
        context = "\n".join([f"Q: {a['question']} A: {a['answer']}" for a in answers])
        messages = [
            {"role": "system", "content": "You are Udyame AI. You have just completed the core discovery. Provide a 2-sentence summary of the business and ask if they have any specific concerns."},
            {"role": "user", "content": f"Here is my business profile:\n{context}"}
        ]
        ai_response = ai_service.generate_response(messages)
        
        return {
            "response": ai_response["content"],
            "remaining_credits": float(current_user.credit_balance)
        }
