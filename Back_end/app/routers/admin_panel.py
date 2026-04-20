from fastapi import APIRouter, Request, Depends, Form, HTTPException, status
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from uuid import UUID
import os

from app.db.session import get_db
from app.routers.deps import get_current_user
from app.models.all_models import User, QuestionBank, AIModel, CreditLedger, SubscriptionPlan
from app.core import security

# Setup templates
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
templates = Jinja2Templates(directory=os.path.join(base_dir, "templates"))

router = APIRouter()

# --- Schemas ---
class QuestionUpdate(BaseModel):
    action: str  # approve, reject, edit
    new_text: Optional[str] = None

class PlanModify(BaseModel):
    name: str
    price: float
    credits_included: int
    features: List[str]
    is_active: bool
    is_recommended: bool

# --- Admin UI Routes ---

@router.get("/")
async def admin_root():
    return RedirectResponse(url="/dashboard")

@router.get("/login", response_class=HTMLResponse)
async def admin_login_get(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

@router.post("/login")
async def admin_login_post(request: Request, email: str = Form(...), password: str = Form(...)):
    # Placeholder for secure admin login logic
    response = RedirectResponse(url="/dashboard", status_code=303)
    response.set_cookie(key="admin_session", value="mock_session_id")
    return response

@router.get("/dashboard", response_class=HTMLResponse)
async def admin_dashboard(request: Request, db: Session = Depends(get_db)):
    if not request.cookies.get("admin_session"):
        return templates.TemplateResponse("dashboard.html", {
            "request": request,
            "active_page": "dashboard",
            "requires_login": True,
            "stats": {"users": 0, "pending_q": 0, "models": 0, "plans": 0}
        })
    
    user_count = db.query(User).count()
    pending_questions = db.query(QuestionBank).filter(QuestionBank.status == "PENDING").count()
    active_models = db.query(AIModel).filter(AIModel.is_active == True).count()
    
    return templates.TemplateResponse("dashboard.html", {
        "request": request,
        "active_page": "dashboard",
        "stats": {
            "users": user_count,
            "pending_q": pending_questions,
            "models": active_models,
            "plans": db.query(SubscriptionPlan).count()
        }
    })

@router.get("/plans", response_class=HTMLResponse)
async def admin_plans(request: Request, db: Session = Depends(get_db)):
    if not request.cookies.get("admin_session"):
        return templates.TemplateResponse("plans.html", {
            "request": request,
            "active_page": "plans",
            "requires_login": True,
            "plans": []
        })
    plans = db.query(SubscriptionPlan).all()
    return templates.TemplateResponse("plans.html", {
        "request": request,
        "active_page": "plans",
        "plans": plans
    })

@router.post("/plans/{plan_id}/toggle")
async def admin_toggle_plan(plan_id: str, db: Session = Depends(get_db)):
    plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == plan_id).first()
    if plan:
        plan.is_active = not plan.is_active
        db.commit()
    return RedirectResponse(url="/plans", status_code=303)

@router.post("/plans/{plan_id}/update")
async def admin_update_plan(
    plan_id: str, 
    name: str = Form(...),
    price: float = Form(...),
    credits_included: int = Form(...),
    features: str = Form(...), # Comma separated
    is_active: bool = Form(False),
    is_recommended: bool = Form(False),
    db: Session = Depends(get_db)
):
    plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == plan_id).first()
    if plan:
        plan.name = name
        plan.price = price
        plan.credits_included = credits_included
        plan.features = [f.strip() for f in features.split(",") if f.strip()]
        plan.is_active = is_active
        plan.is_recommended = is_recommended
        db.commit()
    return RedirectResponse(url="/plans", status_code=303)

@router.get("/questions", response_class=HTMLResponse)
async def admin_questions(request: Request, db: Session = Depends(get_db)):
    if not request.cookies.get("admin_session"):
        return templates.TemplateResponse("questions.html", {
            "request": request,
            "active_page": "questions",
            "requires_login": True,
            "questions": []
        })
    questions = db.query(QuestionBank).all()
    return templates.TemplateResponse("questions.html", {
        "request": request,
        "active_page": "questions",
        "questions": questions
    })

@router.get("/models", response_class=HTMLResponse)
async def admin_models(request: Request):
    return templates.TemplateResponse("dashboard.html", {"request": request, "active_page": "models", "stats": {}})

@router.get("/users", response_class=HTMLResponse)
async def admin_users(request: Request):
    return templates.TemplateResponse("dashboard.html", {"request": request, "active_page": "users", "stats": {}})

@router.get("/logout")
async def admin_logout():
    response = RedirectResponse(url="/login")
    response.delete_cookie("admin_session")
    return response

# --- Admin API Routes ---

@router.get("/api/questions/pending")
def list_pending_questions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return db.query(QuestionBank).filter(QuestionBank.status == 'PENDING').all()

@router.post("/api/questions/{question_id}/review")
def review_question(
    question_id: UUID,
    update: QuestionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
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
