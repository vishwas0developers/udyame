# System Architecture Overview: Udyame AI

This document provides a high-level overview of the **Udyame AI** platform, detailing how the various components interact to provide business intelligence and document automation services.

---

## 🌐 System Architecture Diagram

![System Architecture](./SYSTEM_ARCHITECTURE.mmd)

---

## 🚀 Core Components

### 1. Developer & Launch Layer (`/`)
- **[run.bat](../run.bat)**: The main entry point. It orchestrates environment setup, `.env` validation, dependency management, and service launching.
- **[managed_server.py](../Back_end/managed_server.py)**: A custom self-healing watchdog. It resolves port conflicts and provides hot-reloading for the FastAPI server.

### 2. Frontend Application (`/frontend`)
- **Framework**: Next.js 15 with App Router & React 19.
- **State Management**: **Zustand** (UI State) and **React Query** (Server State).
- **Security**: Firebase Authentication for secure user onboarding and RBAC.

### 3. Backend Intelligence Layer (`/Back_end`)
- **Framework**: FastAPI (Python 3.12).
- **Architecture**: Dual-Port Setup (Port 5012: Admin SSR | Port 5014: Public API).
- **Core Services**:
    - **Intent Engine**: NLP-based query classification.
    - **RAG Pipeline**: Semantic search using **pgvector**.
    - **Async Processing**: Dedicated **Celery Workers** and **Celery Beat** for background tasks and scheduled jobs.
    - **Schema Mgmt**: Automated **Database Migrations** for reliable schema updates.
- **AI Integration**: Unified routing via **LiteLLM** (Gemini, OpenAI, etc.).

### 4. Data & Infrastructure Layer
- **PostgreSQL 16**: Relational and vector data store with `pgvector`.
- **Docker Ecosystem**: Orchestrated via `docker-compose.yml`, including **Postgres, Redis, and MinIO**.
- **Storage Subsystem**: **MinIO** acts as the primary S3-compatible object store for documents, templates, and audit logs.
- **Log Management**: Unified logging system with real-time WebSocket tailing from MinIO-stored logs.

---

## 📖 Detailed Documentation

| Document | Description |
| :--- | :--- |
| **[Backend Architecture Detail](./BACK_END_ARCHITECTURE.mmd)** | Service mesh, controllers, and task workers. |
| **[Frontend Architecture Detail](./FRONT_END_ARCHITECTURE.mmd)** | Routing, state, and UI component logic. |
| **[Installation Flow](./INSTALLATION_FLOW.mmd)** | Step-by-step logic of the deployment lifecycle. |

---
*Last Updated: April 22, 2026 | Udyame AI Engineering Team*
