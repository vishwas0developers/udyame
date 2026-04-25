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

from sse_starlette.sse import EventSourceResponse

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

from app.models.all_models import User, InternalPlanning, Company, PlanningVersion
from uuid import UUID

@router.post("/chat")
async def chat_with_architect(
    chat_in: ChatInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Fetch or Create Planning State
    if chat_in.company_id:
        planning = db.query(InternalPlanning).filter(InternalPlanning.company_id == chat_in.company_id).first()
        # Verify ownership
        company = db.query(Company).filter(Company.id == chat_in.company_id, Company.user_id == current_user.id).first()
        if not company:
            raise HTTPException(status_code=404, detail="Company workspace not found or unauthorized")
    else:
        planning = db.query(InternalPlanning).join(Company).filter(Company.user_id == current_user.id).first()
    
    if not planning:
        # Create a default company if none exists
        new_company = Company(user_id=current_user.id, name="My New Venture")
        db.add(new_company)
        db.commit()
        db.refresh(new_company)
        planning = InternalPlanning(company_id=new_company.id, core_data={"answers": [], "index": 0})
        db.add(planning)
        db.commit()
        db.refresh(planning)

    # Check if plan is locked
    if planning.status == "COMPLETED":
        raise HTTPException(status_code=400, detail="Planning is completed and locked. Request an amendment to make changes.")

    current_index = planning.core_data.get("index", 0)
    
    # 2. Check and deduct credits for wizard step
    credit_service.deduct_credits(
        db=db,
        user_id=current_user.id,
        amount=Decimal("0.10"), 
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
        # Core questions finished
        planning.status = "COMPLETED"
        planning.core_data = {"answers": answers, "index": next_index}
        db.commit()
        
        context = "\n".join([f"Q: {a['question']} A: {a['answer']}" for a in answers])
        messages = [
            {"role": "system", "content": "You are Udyame AI. You have just completed the core discovery. Provide a professional summary of the business and explain that the planning is now locked for generation."},
            {"role": "user", "content": f"Here is my business profile:\n{context}"}
        ]
        
        ai_response = ai_service.generate_response(db, current_user.id, messages, reference_id="core_summary")
        
        return {
            "response": ai_response["content"],
            "remaining_credits": float(current_user.credit_balance)
        }

@router.post("/{company_id}/amend")
def request_amendment(
    company_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Unlocks a completed planning by creating a historical version and moving to AMENDING status.
    """
    planning = db.query(InternalPlanning).join(Company).filter(
        Company.id == company_id, 
        Company.user_id == current_user.id
    ).first()
    
    if not planning:
        raise HTTPException(status_code=404, detail="Planning not found")
        
    if planning.status != "COMPLETED":
        return {"message": "Planning is already open for editing.", "status": planning.status}

    # 1. Create a version snapshot
    version = PlanningVersion(
        planning_id=planning.id,
        version_number=planning.version,
        core_data=planning.core_data
    )
    db.add(version)
    
    # 2. Update planning
    planning.status = "AMENDING"
    planning.version += 1
    # Reset index to allow re-evaluation if needed, or keep it. 
    # For now we just unlock.
    
    db.commit()
    return {
        "message": "Amendment requested. Planning is now unlocked.", 
        "version": planning.version
    }

@router.get("/chat/stream")
async def chat_stream(
    prompt: str,
    company_id: Optional[UUID] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    SSE streaming endpoint for AI chat.
    Includes RAG context if company_id is provided.
    """
    from app.services.rag_service import rag_service
    
    # 1. Build Context
    context = ""
    if company_id:
        context = await rag_service.get_grounded_context(db, prompt, str(company_id))
    
    # 2. Build Messages
    messages = [
        {
            "role": "system", 
            "content": f"You are Udyame AI, a helpful business consultant. Use the following context to ground your answer if relevant:\n{context}"
        },
        {"role": "user", "content": prompt}
    ]
    
    # 3. Return Stream
    return EventSourceResponse(
        ai_service.generate_stream(
            db=db, 
            user_id=current_user.id, 
            messages=messages,
            reference_id=f"chat_stream_{company_id or 'general'}"
        )
    )

@router.post("/{company_id}/export")
def trigger_export(
    company_id: UUID,
    format: str = "pdf",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Triggers an asynchronous document generation task.
    Returns a task_id for status polling.
    """
    from app.services.export_service import run_export_task
    
    planning = db.query(InternalPlanning).filter(
        InternalPlanning.company_id == company_id
    ).first()
    
    if not planning:
        raise HTTPException(status_code=404, detail="Planning data not found")
        
    # Check ownership
    if planning.company.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized")

    # Prepare data for export
    data = {
        "company_name": planning.company.name,
        "industry": planning.company.industry,
        "answers": planning.core_data.get("answers", [])
    }
    
    # Trigger Celery
    task = run_export_task.delay(data, format=format)
    return {"task_id": task.id, "status": "PENDING"}

@router.get("/export/status/{task_id}")
def get_export_status(
    task_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Polls the status of an export task.
    Returns a signed download URL upon completion.
    """
    from celery.result import AsyncResult
    from app.core.celery_app import celery_app
    from app.services.storage_service import storage_service
    
    result = AsyncResult(task_id, app=celery_app)
    
    if result.ready():
        res_data = result.result
        if isinstance(res_data, dict) and res_data.get("status") == "success":
             # Generate a signed URL for secure download (expires in 1 hour)
             bucket, key = res_data["storage_path"].split("/", 1)
             download_url = storage_service.get_presigned_url(bucket, key)
             
             return {
                 "status": "COMPLETED",
                 "download_url": download_url,
                 "format": res_data["format"],
                 "file_name": res_data["file_name"]
             }
        return {"status": "FAILED", "error": str(res_data)}
        
    return {"status": result.state}
