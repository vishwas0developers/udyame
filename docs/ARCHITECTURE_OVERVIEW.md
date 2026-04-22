# System Architecture Overview: Udyame AI

This document provides a high-level overview of the **Udyame AI** platform, detailing how the various components interact to provide business intelligence and document automation services.

## System Architecture Diagram

![System Architecture](./SYSTEM_ARCHITECTURE.mmd)

## Core Components

### 1. Developer & Launch Layer (`/`)
- **[run.bat](../run.bat)**: The main entry point for the entire project. It orchestrates environment setup, dependency management, and service launching.
- **[managed_server.py](../Back_end/managed_server.py)**: A custom self-healing watchdog for the backend. It resolves port conflicts (e.g., local Postgres vs. Docker) and provides hot-reloading for the FastAPI server during development.

### 2. Frontend Application (`/frontend`)
- **Framework**: Next.js 15 with App Router.
- **Styling**: TailwindCSS 4 and Shadcn UI.
- **State Management**: **Zustand** for UI state and **React Query** for server-side data synchronization.
- **Authentication**: Firebase Authentication for secure user onboarding.
- **Features**: Dashboard, Planning Wizard, Document Library, and Billing Management.

### 3. Backend Intelligence Layer (`/Back_end`)
- **Framework**: FastAPI (Python 3.12).
- **Core Services**:
    - **Intent Engine**: Classifies user queries into business domains.
    - **Credit Engine**: Manages user quotas and consumption.
    - **RAG Pipeline**: Uses **pgvector** for semantic search and contextual retrieval.
    - **DocGen**: Generates dynamic PDFs and Excel reports.
- **Admin Panel**: A dedicated administrative hub for system governance, question review, and real-time log monitoring.
- **AI Integration**: Unified routing via **LiteLLM** supporting multiple providers (Gemini, OpenAI, etc.).

### 4. Data & Infrastructure Layer
- **PostgreSQL 16**: Relational database for production, enhanced with the **pgvector** extension for vector embeddings.
- **Docker**: Containerization for the database and supporting services (managed via `docker-compose.yml`).
- **Storage Subsystem**: Integration with **Storage FS** (via local filesystem) for handling generated artifacts and templates.
- **Log Management**: Unified logging system for both backend and frontend, accessible via the Admin Panel with real-time WebSocket tailing.

---

## Detailed Documentation

For deeper dives into specific layers, please refer to:
- **[Backend Architecture Detail](./BACK_END_ARCHITECTURE.mmd)**
- **[Frontend Architecture Detail](./FRONT_END_ARCHITECTURE.mmd)**
- **[Installation Flow](./INSTALLATION_FLOW.mmd)**
- **[Installation Guide](./INSTALLATION_GUIDE.md)**
