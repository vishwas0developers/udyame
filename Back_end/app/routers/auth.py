from datetime import timedelta, datetime
import secrets
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import httpx

from app.db.session import get_db
from app.core import security
from app.core.config import settings
from app.models.all_models import User, OAuthAccount, RefreshToken
from app.schemas.user import UserCreate, UserOut, Token
from app.services.email_service import email_service

router = APIRouter()

def set_auth_cookies(response: Response, access_token: str, refresh_token: str):
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600
    )

@router.post("/register", response_model=UserOut)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    
    verification_token = secrets.token_urlsafe(32)
    new_user = User(
        email=user_in.email,
        password_hash=security.get_password_hash(user_in.password),
        full_name=user_in.full_name,
        verification_token=verification_token,
        is_verified=False,
        credit_balance=0.0
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Send verification email
    email_service.send_verification_email(new_user.email, verification_token)
    
    return new_user

@router.get("/verify-email")
def verify_email(token: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.verification_token == token).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid verification token")
    
    user.is_verified = True
    user.verification_token = None
    db.commit()
    return {"message": "Account verified successfully"}

@router.post("/login")
def login(response: Response, db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not security.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account not verified. Please check your email.",
        )
    
    access_token = security.create_access_token(user.id)
    refresh_token_str = secrets.token_urlsafe(32)
    
    db_refresh = RefreshToken(
        user_id=user.id,
        token=refresh_token_str,
        expires_at=datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )
    db.add(db_refresh)
    db.commit()
    
    set_auth_cookies(response, access_token, refresh_token_str)
    
    return {"message": "Logged in successfully", "access_token": access_token}

@router.get("/google/login")
def google_login():
    state = secrets.token_urlsafe(16)
    google_auth_url = (
        f"https://accounts.google.com/o/oauth2/v2/auth?"
        f"client_id={settings.GOOGLE_CLIENT_ID}&"
        f"response_type=code&"
        f"scope=openid%20email%20profile&"
        f"redirect_uri={settings.GOOGLE_CALLBACK_URL}&"
        f"state={state}"
    )
    return {"url": google_auth_url}

@router.get("/google/callback")
async def google_callback(code: str, response: Response, db: Session = Depends(get_db)):
    async with httpx.AsyncClient() as client:
        token_res = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "redirect_uri": settings.GOOGLE_CALLBACK_URL,
                "grant_type": "authorization_code",
            },
        )
        token_data = token_res.json()
        
        if "error" in token_data:
            raise HTTPException(status_code=400, detail=token_data.get("error_description", "OAuth failed"))
            
        user_res = await client.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {token_data['access_token']}"},
        )
        user_info = user_res.json()
        
    email = user_info["email"]
    google_id = user_info["sub"]
    
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            email=email, 
            full_name=user_info.get("name"), 
            is_verified=True, # OAuth emails are typically verified
            credit_balance=0.0
        )
        db.add(user)
        db.flush()
        
    oauth_acc = db.query(OAuthAccount).filter(OAuthAccount.provider_user_id == google_id).first()
    if not oauth_acc:
        oauth_acc = OAuthAccount(user_id=user.id, provider="google", provider_user_id=google_id)
        db.add(oauth_acc)
    
    access_token = security.create_access_token(user.id)
    refresh_token_str = secrets.token_urlsafe(32)
    
    db_refresh = RefreshToken(
        user_id=user.id,
        token=refresh_token_str,
        expires_at=datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )
    db.add(db_refresh)
    db.commit()
    
    set_auth_cookies(response, access_token, refresh_token_str)
    
    # Redirect back to frontend with the access token in the URL for the store to pick up
    from fastapi.responses import RedirectResponse
    redirect_url = f"{settings.FRONTEND_URL}/dashboard?token={access_token}"
    return RedirectResponse(url=redirect_url)

@router.get("/me", response_model=UserOut)
def get_me(user_id: str = Depends(security.get_current_user_id), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/refresh")
def refresh_token(request: Request, response: Response, db: Session = Depends(get_db)):
    rf_token = request.cookies.get("refresh_token")
    if not rf_token:
        raise HTTPException(status_code=401, detail="Refresh token missing")
        
    db_token = db.query(RefreshToken).filter(RefreshToken.token == rf_token, RefreshToken.is_revoked == False).first()
    if not db_token or db_token.expires_at < datetime.utcnow():
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")
        
    db_token.is_revoked = True
    new_rf_token = secrets.token_urlsafe(32)
    new_db_token = RefreshToken(
        user_id=db_token.user_id,
        token=new_rf_token,
        expires_at=datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )
    db.add(new_db_token)
    
    new_access_token = security.create_access_token(db_token.user_id)
    db.commit()
    
    set_auth_cookies(response, new_access_token, new_rf_token)
    
    return {"message": "Token refreshed", "access_token": new_access_token}

@router.post("/logout")
def logout(request: Request, response: Response, db: Session = Depends(get_db)):
    rf_token = request.cookies.get("refresh_token")
    if rf_token:
        db.query(RefreshToken).filter(RefreshToken.token == rf_token).update({"is_revoked": True})
        db.commit()
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return {"message": "Logged out"}

@router.post("/magic-link")
def send_magic_link(email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        # For security, don't reveal if user exists. Just say email sent.
        return {"message": "If your email is registered, a magic link has been sent."}
    
    magic_token = secrets.token_urlsafe(32)
    user.verification_token = magic_token
    db.commit()
    
    email_service.send_magic_link(user.email, magic_token)
    return {"message": "Magic link sent successfully"}

@router.get("/magic-login")
def magic_login(token: str, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.verification_token == token).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired magic link")
    
    user.is_verified = True
    user.verification_token = None
    
    access_token = security.create_access_token(user.id)
    refresh_token_str = secrets.token_urlsafe(32)
    
    db_refresh = RefreshToken(
        user_id=user.id,
        token=refresh_token_str,
        expires_at=datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )
    db.add(db_refresh)
    db.commit()
    
    set_auth_cookies(response, access_token, refresh_token_str)
    
    from fastapi.responses import RedirectResponse
    redirect_url = f"{settings.FRONTEND_URL}/dashboard?token={access_token}"
    return RedirectResponse(url=redirect_url)
