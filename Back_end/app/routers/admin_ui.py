from fastapi import APIRouter, Request, Depends, Form
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
import os
from app.db.session import get_db
from app.models.all_models import User, QuestionBank, AIModel, CreditLedger

# Setup templates
# __file__ is Back_end/app/routers/admin_ui.py
# dirname(__file__) is Back_end/app/routers
# dirname(dirname(__file__)) is Back_end/app
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
templates = Jinja2Templates(directory=os.path.join(base_dir, "templates"))

router = APIRouter()

@router.get("/login", response_class=HTMLResponse)
async def admin_login_get(request: Request):
    return templates.TemplateResponse("admin/login.html", {"request": request})

@router.post("/login")
async def admin_login_post(request: Request, email: str = Form(...), password: str = Form(...)):
    # Placeholder for secure admin login logic
    # In a real app, verify against admin credentials 
    # and set a secure session cookie
    response = RedirectResponse(url="/dashboard", status_code=303)
    response.set_cookie(key="admin_session", value="mock_session_id")
    return response

@router.get("/dashboard", response_class=HTMLResponse)
async def admin_dashboard(request: Request, db: Session = Depends(get_db)):
    # Fetch high-level stats
    user_count = db.query(User).count()
    pending_questions = db.query(QuestionBank).filter(QuestionBank.status == "PENDING").count()
    active_models = db.query(AIModel).filter(AIModel.is_active == True).count()
    
    return templates.TemplateResponse("admin/dashboard.html", {
        "request": request,
        "active_page": "dashboard",
        "stats": {
            "users": user_count,
            "pending_q": pending_questions,
            "models": active_models
        }
    })

@router.get("/questions", response_class=HTMLResponse)
async def admin_questions(request: Request, db: Session = Depends(get_db)):
    questions = db.query(QuestionBank).all()
    return templates.TemplateResponse("admin/questions.html", {
        "request": request,
        "active_page": "questions",
        "questions": questions
    })

@router.get("/logout")
async def admin_logout():
    response = RedirectResponse(url="/login")
    response.delete_cookie("admin_session")
    return response
