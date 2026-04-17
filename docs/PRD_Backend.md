# PRD - Backend: BizArchitect AI

## 1. Overview
The backend of **BizArchitect AI** is a high-performance orchestration engine and administrative hub. It handles multi-tenant business data, persists context-aware memory via RAG, and includes an **integrated Admin Panel** for system governance. The backend is completely isolated from the user-facing frontend, serving as the "Source of Truth" and control center.

## 2. Technology Stack
- **Framework**: FastAPI (Python 3.11+)
- **Primary Database**: PostgreSQL 16 (Relational & Metadata)
- **Vector Search**: `pgvector` (Postgres extension for similarity search)
- **Caching & Sessions**: Redis 7
- **Object Storage**: MinIO (Images, Documents, Exported Assets)
- **AI Orchestration**: LiteLLM (OpenAI-compatible proxy for multi-provider routing)
- **Task Queue**: Celery / Redis (for long-running document generation)
- **Auth**: JWT (OAuth2 with support for multi-tenant isolation)

---

## 3. Core Systems & Logic

### A. RAG & Contextual Memory
- **Embedding Model**: `multilingual-e5-large` (Optimized for Hindi/English mix).
- **Retrieval Flow**:
    - Semantic search in `company_profiles` and `approved_question_bank`.
    - Context injection into LLM prompts to ensure "Master Internal Planning" consistency.

### B. Self-Learning Question Engine
- **Logic**: AI detects gaps in user answers -> Generates dynamic follow-up question.
- **Admin Approval Workflow**: 
    - AI-generated questions saved as `PENDING`.
    - Must be approved, edited, or rejected by an Admin before becoming globally active.
    - Status tracking: `PENDING`, `ACTIVE`, `REJECTED`, `ARCHIVED`.

### C. Credit & SaaS Management
- **Credit Tiers**: Free, Pro, Business, Enterprise.
- **Usage Enforcement**: Every AI interaction deducts credits based on token cost + model weight.
- **Hard Limits**: Middleware blocks generation if `credit_balance <= 0`.
- **Refill System**: Automated monthly refreshes based on plan + manual top-up support.

### D. Multi-Provider AI Routing
- **Supported Providers**: Gemini, GPT (OpenAI), Qwen, etc.
- **Dynamic Configuration**: Admin can add/remove models via the Integrated Admin Panel without restarting the backend.
- **Fallback Logic**: Automatic routing to secondary models if the primary provider fails.

### E. Integrated Admin Panel (Internal)
- **Architecture**: Server-side rendered (SSR) or embedded SPA within the backend service, completely isolated from `d:/All_Project/udyame/frontend`.
- **UI Framework**: Tailwind CSS for styling.
- **Features**:
    - **Secure Admin Auth**: Login/Logout restricted to admin roles.
    - **Dashboard**: High-level metrics (active users, total credits, AI usage).
    - **User Management**: List, edit, and verify user accounts.
    - **Model Management**: CRUD operations for AI providers and model settings.
    - **Question Review**: Approval/Rejection queue for self-learned RAG questions.
    - **System Logs**: View backend logs and audit trails.

---

## 4. API Architecture (FastAPI)
- `/api/v1/auth/*` - Multi-tenant login/registration.
- `/api/v1/planning/start` - Initialize a wizard session.
- `/api/v1/planning/answer` - Submit answer and fetch next dynamic question.
- `/api/v1/admin/questions/*` - Approval queue for learned questions.
- `/api/v1/admin/models/*` - Hot-reload configuration for AI models.
- `/api/v1/credits/*` - Balance check and transaction history.
- `/api/v1/generate/*` - RAG-driven document generation.

## 5. Data Schema Highlights
- `users`: Includes `credit_balance`, `subscription_tier`, and `last_refresh_date`.
- `question_bank`: Stores `embedding` (vector), `status`, and `usage_metrics`.
- `ai_models`: Dynamic configuration for endpoints, costs, and fallback priorities.
- `credit_ledger`: Immutable trail of every credit transaction (Allocation, Usage, Refill).

---

## 6. Guard Rails & Security
- **PII Scanner**: Automatic redaction of PAN, Aadhaar, and bank details before sending data to third-party LLMs.
- **Row-Level Security (RLS)**: Enforced at the PostgreSQL level to ensure 100% data isolation between companies.
- **Output Filtering**: Validating AI responses against compliance rules before delivery.

## 7. Storage Strategy
- **PostgreSQL**: Master source for all structured business data and vector embeddings.
- **Redis**: Fast cache for active chat sessions and real-time credit tracking.
- **MinIO**: Scalable storage for all exported PDFs, Excel files, and brand imagery.
