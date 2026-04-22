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
from app.services import ai_discovery

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

class ModelSave(BaseModel):
    name: str
    provider: str
    model_id: str
    api_endpoint: Optional[str] = None
    is_active: bool = True
    is_default: bool = False
    supports_vision: bool = False
    vision_details: Optional[str] = None
    supports_text: bool = True
    text_details: Optional[str] = None
    supports_tools: bool = False
    tools_details: Optional[str] = None
    supports_thinking: bool = False
    thinking_details: Optional[str] = None
    fallback_priority: int = 99

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
async def admin_models(request: Request, db: Session = Depends(get_db)):
    if not check_admin_auth(request):
        return RedirectResponse(url="/login?next=/models")
        
    models = db.query(AIModel).order_by(AIModel.fallback_priority).all()
    return templates.TemplateResponse("models.html", {
        "request": request, 
        "active_page": "models",
        "models": models
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

# --- Model Management API ---

@router.get("/api/admin/models/list")
async def list_models(request: Request, db: Session = Depends(get_db)):
    if not check_admin_auth(request):
        raise HTTPException(status_code=401)
    models = db.query(AIModel).order_by(AIModel.provider, AIModel.fallback_priority).all()
    return models

@router.post("/api/admin/models/save")
async def save_model(request: Request, model_data: ModelSave, db: Session = Depends(get_db)):
    if not check_admin_auth(request):
        raise HTTPException(status_code=401)
    
    # Check if we are updating or creating
    model = db.query(AIModel).filter(AIModel.model_id == model_data.model_id, AIModel.provider == model_data.provider).first()
    
    if not model:
        model = AIModel(
            model_id=model_data.model_id,
            provider=model_data.provider
        )
        db.add(model)
    
    model.name = model_data.name
    model.api_endpoint = model_data.api_endpoint
    model.is_active = model_data.is_active
    model.is_default = model_data.is_default
    model.supports_vision = model_data.supports_vision
    model.vision_details = model_data.vision_details
    model.supports_text = model_data.supports_text
    model.text_details = model_data.text_details
    model.supports_tools = model_data.supports_tools
    model.tools_details = model_data.tools_details
    model.supports_thinking = model_data.supports_thinking
    model.thinking_details = model_data.thinking_details
    model.fallback_priority = model_data.fallback_priority
    
    # If this is set as default, unset other defaults for this provider
    if model.is_default:
        db.query(AIModel).filter(
            AIModel.provider == model.provider, 
            AIModel.id != model.id
        ).update({"is_default": False})
    
    db.commit()
    return {"status": "success", "message": "Model saved successfully"}

@router.post("/api/admin/models/delete/{model_id}")
async def delete_model(model_id: UUID, request: Request, db: Session = Depends(get_db)):
    if not check_admin_auth(request):
        raise HTTPException(status_code=401)
    
    model = db.query(AIModel).filter(AIModel.id == model_id).first()
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    
    db.delete(model)
    db.commit()
    return {"status": "success", "message": "Model deleted successfully"}

@router.post("/api/admin/models/set-default/{model_id}")
async def set_default_model(model_id: UUID, request: Request, db: Session = Depends(get_db)):
    if not check_admin_auth(request):
        raise HTTPException(status_code=401)
    
    model = db.query(AIModel).filter(AIModel.id == model_id).first()
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    
    # Unset others
    db.query(AIModel).filter(
        AIModel.provider == model.provider,
        AIModel.id != model.id
    ).update({"is_default": False})
    
    model.is_default = True
    db.commit()
    return {"status": "success", "message": f"{model.name} set as default for {model.provider}"}

@router.get("/api/admin/models/fetch/{provider}")
async def fetch_provider_models(provider: str, request: Request):
    if not check_admin_auth(request):
        raise HTTPException(status_code=401)
    
    # In a real app, we might want to allow passing a temporary key for discovery
    # but for now we rely on the backend environment variables
    models = await ai_discovery.fetch_models_for_provider(provider)
    return models
