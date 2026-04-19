# PRODUCT REQUIREMENTS DOCUMENT: BACK-END (Udyame AI)

## 1. OVERVIEW
The backend of **Udyame AI** is a high-performance orchestration engine, administrative hub, and multi-tenant SaaS platform. It handles business data, persists context-aware memory via RAG, and includes an integrated Admin Panel for system governance. Built on FastAPI, PostgreSQL, Redis, and LiteLLM proxy, it serves as the "Source of Truth" and control center, completely isolated from the user-facing frontend.

## 2. CORE OBJECTIVES
- **Conversational Planning**: Enable zero-data-loss conversational planning with persistent memory.
- **Dynamic Routing**: Route queries dynamically across multiple AI providers (OpenAI, Gemini, Qwen, Groq) based on cost, latency, and subscription tier.
- **SaaS Governance**: Enforce strict credit consumption, usage limits, and subscription gating.
- **Self-Learning**: Provide admin-controlled approval workflows for AI-generated self-learning questions.
- **Security & Compliance**: Ensure PII protection (DPDP India/GDPR), output guardrails, and RLS data isolation.

## 3. TECHNOLOGY STACK
- **Framework**: FastAPI (Python 3.11+)
- **Primary Database**: PostgreSQL 16 (Relational & Metadata)
- **Vector Search**: `pgvector` extension for semantic similarity.
- **Caching & Sessions**: Redis 7
- **Object Storage**: MinIO / S3 (Images, Documents, Exported Assets)
- **AI Orchestration**: LiteLLM (OpenAI-compatible proxy for multi-provider routing)
- **Task Queue**: Celery / Redis (for long-running document generation)
- **Auth**: JWT-based stateless auth with RBAC (User, Admin, Superadmin) and multi-tenant isolation.

---

## 4. CORE SYSTEMS & LOGIC

### 4.1 Authentication & Multi-Tenancy
- JWT-based stateless auth with RBAC (user, admin, superadmin).
- Google OAuth 2.0 integration for seamless user onboarding.
- Stateless session management with rotated Refresh Tokens.
- Row-Level Security (RLS) isolating company data per user.
- Configurable token expiry and secure cookie options for production.

### 4.2 Company & Internal Planning Engine
- Single master internal planning per company (locked post-completion).
- Persistent JSONB storage for 10 permanent + dynamic contextual answers.
- Versioning system for master profile amendments.
- **Hierarchical Data Structure**:
    - **Single-Instance (Master)**: Internal Planning — the "Source of Truth" for each company.
    - **Multi-Instance**: Products, Business Plans, Proposals, Diagnostics, Team/Roles.
    - Rule: What defines the company's identity → Single. What is part of execution → Multi.
- Amendment workflow: Locked after completion, editable only via "Request Amendment" with full version history.

### 4.3 RAG & Contextual Memory
- **Embedding Model**: `multilingual-e5-large` (Optimized for Hindi/English mix).
- **Retrieval Flow**: Semantic search in `company_profiles` and `approved_question_bank` stored in `pgvector`.
- **Context Management**: Context injection into LLM prompts to ensure "Master Internal Planning" consistency.
- Context chunking and semantic reranking before LLM injection.
- Cached retrieval results via Redis for repeated queries (TTL 15m).
- Fallback to text-only search if vector index fails.

### 4.4 Self-Learning Question Engine
- **Logic**: AI detects gaps in user answers and generates dynamic follow-up questions.
- **Question Bank Categories**: PERMANENT, CONTEXTUAL, SELF_LEARNED.
- **Core 10 Permanent Questions** (Internal Planning):
    1. Company/Brand Name (Text — Identity & Branding, MCA name check).
    2. Industry/Field (Dropdown — MSME/Udyam category mapping).
    3. Target Market Region (Multi-select — State-specific license auto-suggest).
    4. Budget Range in INR (Radio — GST-inclusive/exclusive toggle).
    5. Legal Structure (Dropdown — Registration checklist per structure).
    6. Primary Goal (Multi-select — Link to PMEGP, Standup India schemes).
    7. Business Stage: New/Existing (Radio — Existing triggers Health Check).
    8. Team Size (Radio — PF/ESI compliance threshold auto-suggest).
    9. Value Proposition one-liner (Text — Messaging & positioning).
    10. Top 3 Concerns (Multi-select — Priority-based risk alerts).
- **Contextual Questions**: Dynamic branching based on industry/goal/region (e.g., F&B → FSSAI, Franchise → Royalty model).
- **Self-Learning Algorithm** (5-step):
    1. **Trigger**: AI detects answer gap (vague answer, industry norm conflict, or user asks about uncovered topic).
    2. **Generate**: AI creates context-aware follow-up question.
    3. **Feedback**: Post-answer, ask user "Was this question useful?" (Yes/No/Edit).
    4. **Save Criteria**: User voted Yes + properly tagged + no PII + not duplicate → Save with `PENDING` status.
    5. **Activation**: When `approval_count >= 5` OR admin override → Status: `ACTIVE` → Globally available.
- **Admin Approval Workflow**:
    - AI-generated questions enter a `PENDING` state.
    - Approval threshold: 5+ positive user feedback signals OR direct admin override.
    - Status tracking: `PENDING`, `ACTIVE`, `REJECTED`, `ARCHIVED`.
- Approved questions become instantly available via vector search routing.

### 4.5 Credit & Subscription Management
- **Subscription Tiers**:
    - **FREE (Starter)**: 1 Company, 5 Proposals/Month, Basic Templates, 50 credits/mo, Basic models only.
    - **PRO (₹999/month)**: 3 Companies, Unlimited Proposals, Advanced Financial Modeling, 500 credits/mo, All models, Priority AI.
    - **BUSINESS (₹2999/month)**: Unlimited Companies, 5 Team Seats, Custom Branding (White-label), API Access, 5000 credits/mo, Dedicated RAG Index.
    - **ENTERPRISE (Custom)**: On-premise Deployment, Custom AI Fine-tuning, SLA + Dedicated Support.
- **Credit System Logic**:
    - **Allocation**: User subscribes → `credit_ledger` (PLAN_ALLOC) → balance updated. Cron job checks `last_credit_refresh` + interval for auto-refresh.
    - **Deduction**: Token-based (input + output tokens × model rate). Middleware blocks if `credit_balance <= 0` (402 Payment Required).
    - **Refill**: Razorpay/Stripe webhook → `payment.success` → `credit_ledger` (PURCHASE). Admin manual top-up bypasses payment.
- **Immutable Ledger**: Credit ledger for audit and reconciliation with reference IDs.
- Redis distributed locks for concurrency safety on deductions.
- **Billing Integration**: Razorpay (India-first UPI/Cards) + Stripe (Global). Webhook-driven entitlement updates. 3-day grace period soft-lock.

### 4.6 AI Model Router
- **Dynamic Configuration**: Admin can add/remove models via the Admin Panel without restarting.
- **Supported Providers**: OpenAI, Gemini, Qwen, Groq, and custom endpoints.
- **Fallback Logic**: Automatic routing to secondary models based on priority, health status, and cost.
- **Unified Proxy**: LiteLLM integration for OpenAI-compatible routing.
- Streaming SSE support, timeout handling, retry logic, and unified response formatting.
- Per-call metadata stored in credit ledger.

### 4.7 Document Generation
- **Engine**: Structured markdown/PDF generation from conversational output.
- **Templates**: Business Plans, Proposals, DPRs, Pitch Decks with India-specific compliance auto-injection.
- **Universal 8-Section Template Structure** (all outputs):
    1. Executive Summary (1-page max: Name, Value Prop, Key Ask, 3 Highlights).
    2. Context & Background (Company Profile from Internal Planning, Problem Statement, Timing).
    3. Solution / Offering (Product/Service, USPs, Deliverables/SOW).
    4. Market & Competitive Analysis (Target Audience, 3-5 Competitors, Differentiator).
    5. Operations & Execution Plan (Timeline/Gantt, Team, Tech Stack/Partners).
    6. Financials — India-Ready (INR Cost Breakdown, Revenue Model, 3-Year Projection, Break-even).
    7. Risk & Compliance (Top 3 Risks + Mitigation, Regulatory Checklist: GST/FSSAI/MSME, Insurance).
    8. Next Steps & CTA (Immediate Actions, Required Approvals, Contact + Follow-up).
- **Tone Adapter**: Investor Docs → Formal English; Client Proposals → Persuasive Hinglish; Internal Plans → Simple Hindi/English mix.
- **Storage**: Binary files in MinIO with metadata in PostgreSQL.
- Support for PDF (WeasyPrint/Playwright) and Excel export.
- Presigned MinIO URL generation for downloads, versioning, and metadata tagging.
- Async rendering via Celery task queue with progress tracking.

### 4.8 Integrated Admin Panel (Internal)
- **Architecture**: Server-side rendered (SSR) or embedded SPA within the backend service, completely isolated from the frontend.
- **Features**:
    - **Dashboard**: High-level metrics (active users, total credits, AI usage).
    - **User Management**: List, edit, and verify user accounts.
    - **Model Management**: CRUD operations for AI providers and model settings.
    - **Question Review**: Approval/Rejection queue for self-learned RAG questions.
    - **System Logs**: View backend logs and audit trails.

### 4.9 Guard Rails & Security
- **PII Scanner**: Regex + NER-based detection and auto-redaction of PAN, Aadhaar, GST, phone, email, and bank details before LLM calls.
- **Row-Level Security (RLS)**: Enforced at the PostgreSQL level for 100% data isolation between companies.
- **Output Filtering**: Compliance hallucination prevention by cross-referencing with RAG context chunks.
- **Structured Safety Scores**: Block generation if threshold breached; log all guard rail triggers to audit table.
- **Data Protection**: TLS 1.3 in transit, AES-256 at rest, encrypted API keys in vault.
- **Compliance by Design**: GDPR/DPDP Act Ready — Right to Delete (Anonymize), Data Portability (Export). Explicit opt-in consent for AI learning from answers and sharing anonymized insights.

---

## 4.10 Business Management Pipeline
- **Stage 1 — Ideation & Validation**: Idea Stress Test, Market Fit Analysis, MVP Definition. Output: Lean Canvas.
- **Stage 2 — Strategic Planning**: Comprehensive Business Plan, Financial Modeling, Legal/Compliance Checklist. Output: DPR & Roadmap.
- **Stage 3 — Operational Execution**: Marketing Calendar, Hiring/JD Generation, Supply Chain Optimization. Output: Monthly Action Plan.
- **Stage 4 — Diagnostics & Problem Solving**: Root Cause Analysis (5 Whys), Turnaround Strategy, Customer Feedback Loop. Output: Diagnostic Report.

### 4.11 Proposal & Sales Pipeline
- **Stage 1 — Discovery**: Client Brief Analysis, Pain Point Extraction, Go/No-Go Decision. Output: Client Persona Summary.
- **Stage 2 — Solution Design**: Custom Solution Architecting, Scope of Work (SOW) Generator. Output: Technical Solution Outline.
- **Stage 3 — Commercials & Drafting**: Dynamic Pricing Engine, Persuasive Writing (AIDA/PAS), Template Selection. Output: Full Proposal Document.
- **Stage 4 — Negotiation & Closing**: Objection Handling Scripts, Follow-up Email Sequences. Output: Negotiation Strategy.

### 4.12 Intent Classification Engine
- **Purpose**: Analyze user input and route to the correct processing module.
- **Module Routing Options**:
    - `BUSINESS_MANAGEMENT` → Ideation, Planning, Operations, Diagnostics.
    - `PROPOSAL_SALES` → Client Discovery, Solution Design, Commercials, Closing.
    - `CLARIFICATION_NEEDED` → Ambiguous input; requires follow-up (confidence < 0.6).
    - `GENERAL_QUERY` → Non-actionable questions about the tool itself.
- **Context-Aware**: Checks existing conversation memory — maintains stage progression, auto-fills known context.
- **Indian Context**: Recognizes Hinglish inputs. Prioritizes local terms (Udyam registration, MSME loan, GST return).
- **Output**: Structured JSON (intent, confidence, detected_keywords, suggested_stage).

---

## 5. API ARCHITECTURE

### 5.1 Endpoints
- `/api/v1/auth/*` — Multi-tenant login/registration.
- `/api/v1/planning/*` — Wizard session initialization and answer submission.
- `/api/v1/admin/questions/*` — Approval queue for learned questions.
- `/api/v1/admin/models/*` — Hot-reload configuration for AI models.
- `/api/v1/credits/*` — Balance check and transaction history.
- `/api/v1/generate/*` — RAG-driven document generation.
- `/api/v1/admin/logs` — System audit logs.

### 5.2 Design Principles
- RESTful + WebSocket for live chat streaming.
- Pydantic validation on all inputs/outputs.
- Idempotency keys for credit transactions and document generation.
- Pagination, filtering, and sorting for admin queues and document lists.

---

## 6. DATA SCHEMA HIGHLIGHTS
- `users`: Includes `full_name`, `email`, `credit_balance`, `subscription_tier`, and `last_refresh_date`.
- `oauth_accounts`: Links users to external providers (e.g., Google).
- `refresh_tokens`: Manages server-side token revocation and rotation.
- `companies`: Multi-tenant company profiles with RLS.
- `internal_plannings`: JSONB storage for conversational planning data.
- `question_bank`: Stores `embedding` (vector), `status`, and `usage_metrics`.
- `ai_models`: Dynamic configuration for endpoints, costs, and fallback priorities.
- `credit_ledger`: Immutable trail of every credit transaction (Allocation, Usage, Refill).
- `documents`: Generated document metadata with MinIO references.

---

## 7. STORAGE STRATEGY
- **PostgreSQL 16 + pgvector**: Master source for relational + semantic data.
- **Redis 7**: Sessions, credit locks, rate limiting, RAG cache.
- **MinIO / S3**: Exported documents, templates, audit snapshots.
- **Data Isolation**: Strict RLS, logical tenant namespaces, presigned URL access.

---

## 8. NON-FUNCTIONAL REQUIREMENTS
- **Performance**: Latency <800ms for API routing, <20ms for vector search.
- **Scalability**: Async architecture supporting 5k concurrent sessions.
- **Reliability**: Circuit breakers for AI providers, Redis-backed retries.
- **Observability**: LangSmith tracing, Sentry error tracking, Prometheus metrics.
- **Compliance**: DPDP India ready, GDPR export/delete endpoints, consent logging.

---

## 9. DEPLOYMENT & DEVOPS
- **Containerization**: Docker Compose (App, Postgres, Redis, MinIO).
- **CI/CD**: GitHub Actions with automated Alembic migrations.
- **Health Checks**: Graceful shutdown, zero-downtime rolling updates.
- **Environment**: Environment-driven config (.env) with secret rotation policies.

---

## APPENDIX A: GENERATION PROMPTS

### PROMPT 1: AUTH & MULTI-TENANT SETUP
"Generate a FastAPI authentication module with JWT issuance, refresh tokens, and RBAC decorators. Implement PostgreSQL Row-Level Security (RLS) for company-level isolation. Include middleware for tenant extraction from auth context. Use SQLAlchemy 2.0 async, Pydantic for schemas, and bcrypt for password hashing. Ensure stateless design with configurable token expiry and secure cookie options for production."

### PROMPT 2: DATABASE SCHEMA & MIGRATIONS
"Write complete SQLAlchemy 2.0 models for: users, companies, internal_plannings, question_bank, ai_models, credit_ledger, documents. Include pgvector column for embeddings, JSONB for core planning data, and ENUMs for statuses. Generate Alembic migration script with proper indexes (GIN, BRIN), RLS policies, and foreign key constraints. Ensure async-compatible session factory and connection pooling."

### PROMPT 3: FASTAPI BASE & MIDDLEWARE STACK
"Create FastAPI app entrypoint with lifespan context managers for PostgreSQL, Redis, and MinIO initialization. Implement middleware for CORS, request logging, rate limiting (Redis sliding window), and global exception handling. Configure OpenAPI docs with security schemes, versioning, and Pydantic validation errors formatted to RFC 7807. Enable async request lifecycle and graceful shutdown hooks."

### PROMPT 4: CREDIT SYSTEM & SUBSCRIPTION LOGIC
"Build a credit management service with token-based deduction (input+output × model rate), Redis distributed locks for concurrency safety, and an immutable PostgreSQL ledger. Implement auto-refresh logic tied to billing cycle dates. Add middleware that checks balance before routing to AI services, returns 402 on exhaustion, and logs all transactions with reference IDs. Include plan tier validation and usage quota enforcement."

### PROMPT 5: AI MODEL ROUTER & LITELLM INTEGRATION
"Develop an AI routing service using LiteLLM proxy that reads active models from ai_models table at runtime. Implement fallback chain based on priority, health checks, and cost limits. Add dynamic model registration endpoints (create/update/disable) without server restart. Include streaming SSE support, timeout handling, retry logic, and unified response formatting. Store per-call metadata in credit ledger."

### PROMPT 6: RAG PIPELINE & VECTOR SEARCH
"Implement a RAG service using multilingual-e5-large embeddings stored in pgvector. Create retrieval logic that chunks user queries, searches company_profiles, approved_question_bank, and compliance_rules, reranks top-3 results, and returns formatted context. Add Redis caching with TTL for repeated queries. Ensure async execution, fallback to text-only search if vector index fails, and integrate with LiteLLM prompt construction."

### PROMPT 7: ADMIN APPROVAL WORKFLOW API
"Create REST endpoints for admin question moderation: GET pending queue (paginated, filterable), PATCH approve/reject/edit with audit logging, bulk action support, and role-based access (superadmin/moderator). Update question_bank status from PENDING to ACTIVE/ARCHIVED instantly. Include validation for edit payloads, prevent race conditions via optimistic locking, and return updated counts for UI polling."

### PROMPT 8: GUARD RAIL & PII SCANNER SERVICE
"Build a pre/post LLM processing service that scans text using regex and NER for Indian PII (PAN, Aadhaar, GST, phone, email, bank). Implement auto-redaction, user notification flags, and compliance rule checks. Add hallucination guard that cross-references LLM output with RAG context chunks. Return structured safety scores and block generation if threshold breached. Log all guard rail triggers to audit table."

### PROMPT 9: DOCUMENT GENERATION SERVICE
"Create a document generation service that converts conversational JSONB outputs into structured templates (Business Plan, Proposal, DPR, Pitch Deck). Support markdown, PDF (WeasyPrint/Playwright), and Excel export. Inject India-specific compliance checklists based on region/industry. Add presigned MinIO URL generation for downloads, versioning, and metadata tagging. Ensure async rendering with progress tracking."