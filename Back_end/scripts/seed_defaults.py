import sys
import os
import uuid
from sqlalchemy.orm import Session
from datetime import datetime

# Add the parent directory to sys.path to allow imports of the 'app' module
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.models.all_models import AIProvider, AIModel, SubscriptionPlan, User
from app.core import security

def seed_infrastructure():
    print("--- Infrastructure Seeding Utility ---")
    db = SessionLocal()
    try:
        # 1. Seed Plans (Ensure canonical 3 exist)
        print("[1/4] Seeding Subscription Plans...")
        db.query(SubscriptionPlan).delete()
        plans = [
            SubscriptionPlan(name="FREE", price=0.00, credits_included=50, features=["Conversational Planning", "1 Business Plan/mo", "Community Support"], is_active=True),
            SubscriptionPlan(name="PRO", price=999.00, credits_included=500, features=["Everything in FREE", "Unlimited Planning", "Priority AI Responses", "PDF Export"], is_active=True, is_recommended=True),
            SubscriptionPlan(name="BUSINESS", price=2999.00, credits_included=1500, features=["Everything in PRO", "Team Collaboration", "Custom Templates", "Advanced Analytics"], is_active=True)
        ]
        db.add_all(plans)
        
        # 2. Seed Default Admin
        print("[2/4] Ensuring Default Admin exists...")
        admin_email = "admin@udyame.ai"
        if not db.query(User).filter(User.email == admin_email).first():
            admin = User(
                email=admin_email,
                password_hash=security.get_password_hash("admin123"),
                full_name="System Administrator",
                role="ADMIN",
                is_verified=True
            )
            db.add(admin)

        # 3. Seed Default Providers
        print("[3/4] Seeding Default AI Providers...")
        db.query(AIProvider).delete() # Full reset of infrastructure
        
        providers = {
            "openai": AIProvider(name="OpenAI", provider_type="openai", is_active=True),
            "gemini": AIProvider(name="Google Gemini", provider_type="gemini", is_active=True),
            "groq": AIProvider(name="Groq", provider_type="openai", base_url="https://api.groq.com/openai/v1", is_active=True),
            "ollama": AIProvider(name="Ollama (Local)", provider_type="ollama", base_url="http://localhost:11434/v1", is_active=True),
            "lmstudio": AIProvider(name="LM Studio", provider_type="custom-openai", base_url="http://localhost:1234/v1", is_active=True)
        }
        for p in providers.values():
            db.add(p)
        db.flush() # Get IDs

        # 4. Seed Default Models
        print("[4/4] Seeding Predefined AI Models...")
        db.query(AIModel).delete()
        
        models = [
            # OpenAI
            AIModel(provider_id=providers["openai"].id, name="GPT-4o", model_id="gpt-4o", provider="openai", is_predefined=True, is_default=True, supports_vision=True, supports_tools=True),
            AIModel(provider_id=providers["openai"].id, name="GPT-4o Mini", model_id="gpt-4o-mini", provider="openai", is_predefined=True, supports_text=True),
            
            # Gemini
            AIModel(provider_id=providers["gemini"].id, name="Gemini 1.5 Pro", model_id="gemini-1.5-pro", provider="gemini", is_predefined=True, supports_vision=True, supports_tools=True),
            AIModel(provider_id=providers["gemini"].id, name="Gemini 1.5 Flash", model_id="gemini-1.5-flash", provider="gemini", is_predefined=True, supports_text=True),
            
            # Groq
            AIModel(provider_id=providers["groq"].id, name="Llama 3.1 70B", model_id="llama-3.1-70b-versatile", provider="openai", is_predefined=True, supports_text=True, fallback_priority=1),
            AIModel(provider_id=providers["groq"].id, name="Mixtral 8x7B", model_id="mixtral-8x7b-32768", provider="openai", is_predefined=True),
            
            # Ollama
            AIModel(provider_id=providers["ollama"].id, name="Llama 3 (Local)", model_id="llama3", provider="ollama", is_predefined=True),

            # LM Studio
            AIModel(provider_id=providers["lmstudio"].id, name="LM Studio Model", model_id="local-model", provider="custom-openai", is_predefined=True, supports_text=True),
        ]
        db.add_all(models)
        
        db.commit()
        print("[SUCCESS] Infrastructure has been restored to default values.")
        
    except Exception as e:
        print(f"[ERROR] Seeding failed: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_infrastructure()
