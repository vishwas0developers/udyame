import os
import asyncio
from datetime import datetime
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel
from sqlalchemy.orm import Session
from fastapi import APIRouter, Request, Depends, Form, HTTPException, status, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates


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

# --- Helper ---
def check_admin_auth(request: Request):
    return request.cookies.get("admin_session")

# --- Admin UI Routes ---

@router.get("/")
async def admin_root(request: Request):
    if check_admin_auth(request):
        return RedirectResponse(url="/dashboard")
    return RedirectResponse(url="/login")

@router.get("/login", response_class=HTMLResponse)
async def admin_login_get(request: Request, next: Optional[str] = None):
    # If already logged in, go to dashboard
    if check_admin_auth(request):
        return RedirectResponse(url="/dashboard")
    return templates.TemplateResponse("login.html", {"request": request, "next_url": next})

@router.post("/login")
async def admin_login_post(request: Request, email: str = Form(...), password: str = Form(...), next: Optional[str] = Form(None)):
    # Placeholder for secure admin login logic
    target_url = next if next else "/dashboard"
    response = RedirectResponse(url=target_url, status_code=303)
    response.set_cookie(key="admin_session", value="mock_session_id")
    return response

@router.get("/dashboard", response_class=HTMLResponse)
async def admin_dashboard(request: Request, db: Session = Depends(get_db)):
    requires_login = not check_admin_auth(request)
    
    user_count = 0
    pending_questions = 0
    active_models = 0
    plan_count = 0
    
    if not requires_login:
        user_count = db.query(User).count()
        pending_questions = db.query(QuestionBank).filter(QuestionBank.status == "PENDING").count()
        active_models = db.query(AIModel).filter(AIModel.is_active == True).count()
        plan_count = db.query(SubscriptionPlan).count()
    
    return templates.TemplateResponse("dashboard.html", {
        "request": request,
        "active_page": "dashboard",
        "requires_login": requires_login,
        "stats": {
            "users": user_count,
            "pending_q": pending_questions,
            "models": active_models,
            "plans": plan_count
        }
    })

@router.get("/plans", response_class=HTMLResponse)
async def admin_plans(request: Request, db: Session = Depends(get_db)):
    requires_login = not check_admin_auth(request)
    plans = []
    if not requires_login:
        plans = db.query(SubscriptionPlan).all()
        
    return templates.TemplateResponse("plans.html", {
        "request": request,
        "active_page": "plans",
        "requires_login": requires_login,
        "plans": plans
    })

@router.post("/plans/{plan_id}/toggle")
async def admin_toggle_plan(plan_id: str, request: Request, db: Session = Depends(get_db)):
    if not check_admin_auth(request):
        raise HTTPException(status_code=401)
        
    plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == plan_id).first()
    if plan:
        plan.is_active = not plan.is_active
        db.commit()
    return RedirectResponse(url="/plans", status_code=303)

@router.post("/plans/{plan_id}/update")
async def admin_update_plan(
    plan_id: str, 
    request: Request,
    name: str = Form(...),
    price: float = Form(...),
    credits_included: int = Form(...),
    features: str = Form(...), # Comma separated
    is_active: bool = Form(False),
    is_recommended: bool = Form(False),
    db: Session = Depends(get_db)
):
    if not check_admin_auth(request):
        raise HTTPException(status_code=401)

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
    requires_login = not check_admin_auth(request)
    questions = []
    if not requires_login:
        questions = db.query(QuestionBank).all()
        
    return templates.TemplateResponse("questions.html", {
        "request": request,
        "active_page": "questions",
        "requires_login": requires_login,
        "questions": questions
    })

@router.get("/models", response_class=HTMLResponse)
async def admin_models(request: Request):
    return templates.TemplateResponse("dashboard.html", {
        "request": request, 
        "active_page": "models", 
        "requires_login": not check_admin_auth(request),
        "stats": {"users": 0, "pending_q": 0, "models": 0, "plans": 0}
    })

@router.get("/users", response_class=HTMLResponse)
async def admin_users(request: Request, db: Session = Depends(get_db)):
    requires_login = not check_admin_auth(request)
    users = []
    if not requires_login:
        from sqlalchemy.orm import joinedload
        users = db.query(User).options(joinedload(User.subscription_plan)).order_by(User.created_at.desc()).all()
        
    return templates.TemplateResponse("users.html", {
        "request": request,
        "active_page": "users",
        "requires_login": requires_login,
        "users": users
    })

@router.get("/logout")
async def admin_logout(request: Request, next: Optional[str] = None):
    # Determine where to send them back (stay on same page)
    target = next if next else request.headers.get("referer", "/dashboard")
    response = RedirectResponse(url=target, status_code=303)
    response.delete_cookie("admin_session")
    return response

# --- Log Management ---

def get_last_n_lines(file_path, n=500):
    if not os.path.exists(file_path):
        return f"Log file not found at {file_path}"
    try:
        with open(file_path, "r", encoding="utf-8", errors="replace") as f:
            lines = f.readlines()
            return "".join(lines[-n:])
    except Exception as e:
        return f"Error reading logs: {str(e)}"

@router.get("/logs", response_class=HTMLResponse)
async def admin_logs_page(request: Request):
    requires_login = not check_admin_auth(request)
    return templates.TemplateResponse("logs.html", {
        "request": request,
        "active_page": "logs",
        "requires_login": requires_login
    })

@router.get("/api/admin/logs/{source}")
async def admin_logs_api(source: str, request: Request):
    if not check_admin_auth(request):
        raise HTTPException(status_code=401)
    
    # Get the project root directory (udyame/)
    # Current file: Back_end/app/routers/admin_panel.py
    # 1. routers/, 2. app/, 3. Back_end/, 4. project_root/
    project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
    
    if source == "backend":
        log_path = os.path.join(project_root, "Back_end", "logs", "backend.log")
    elif source == "frontend":
        log_path = os.path.join(project_root, "frontend", "logs", "frontend.log")
    else:
        raise HTTPException(status_code=400, detail="Invalid log source")
        
    content = get_last_n_lines(log_path)
    return {"content": content, "source": source, "timestamp": datetime.now().isoformat()}

@router.websocket("/ws/admin/logs/{source}")
async def admin_logs_ws(websocket: WebSocket, source: str):
    await websocket.accept()
    
    # Check session (simplified for WS)
    if not websocket.cookies.get("admin_session"):
        await websocket.send_text("Unauthorized")
        await websocket.close()
        return

    project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
    
    if source == "backend":
        log_path = os.path.join(project_root, "Back_end", "logs", "backend.log")
    elif source == "frontend":
        log_path = os.path.join(project_root, "frontend", "logs", "frontend.log")
    else:
        await websocket.send_text("Invalid log source")
        await websocket.close()
        return

    if not os.path.exists(log_path):
        await websocket.send_text(f"Log file not found: {log_path}")
        await websocket.close()
        return

    try:
        with open(log_path, "r", encoding="utf-8", errors="replace") as f:
            # Send last 100 lines initially
            lines = f.readlines()
            for line in lines[-100:]:
                await websocket.send_text(line)
            
            # Tail the file
            f.seek(0, os.SEEK_END)
            while True:
                line = f.readline()
                if not line:
                    await asyncio.sleep(0.5)
                    continue
                await websocket.send_text(line)
    except WebSocketDisconnect:
        pass
    except Exception as e:
        try:
            await websocket.send_text(f"Error: {str(e)}")
        except:
            pass
    finally:
        try:
            await websocket.close()
        except:
            pass

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
