# PRD - Frontend: Udyame AI

## 1. Overview
The frontend of **Udyame AI** is a professional-grade, user-oriented SaaS application focusing on guided business growth. It is strictly dedicated to the end-user experience, providing tools for conversational planning and document management. All administrative functions are isolated within the backend system.

## 2. Technology Stack
- **Framework**: Next.js 14+ (App Router, React)
- **Language**: TypeScript (for strict type safety)
- **Styling**: TailwindCSS & Shadcn UI (Professional, clean aesthetic)
- **State Management**: Zustand (Client-side) & React Query (Server-side cache)
- **Form Handling**: React Hook Form + Zod (Validation)
- **Real-time**: WebSockets / Server-Sent Events (for live AI chat and generation progress)
- **Authentication**: 
    - Google Authentication (OAuth2).
    - Email Registration with verification.
- **API Client**: Axios with interceptors for JWT and tenant isolation.

---

## 3. UI/UX Principles
- **Conversational Planning**: A chat-centric primary interface that feels like talking to a business architect.
- **Context Awareness**: A persistent side panel showing "Master Planning" data currently influencing the AI's logic.
- **Dynamic Wizards**: Step-by-step onboarding and product creation flows.
- **SaaS Dashboard**: Clean overview of multiple companies, available credits, and historical documents.

---

## 4. Core User Interfaces

### A. The "Udyame" Chat (User)
- **Conversational Q&A**: Handles the 10 permanent questions and dynamic follows-ups.
- **Micro-Interactions**: Typing indicators, auto-save status, and "Explain This" tooltips for complex business terms.
- **Gap Detection Alerts**: Visual cues when AI identifies missing information in the user's business profile.

### B. Company & Document Management
- **Multi-Tenant Switcher**: Easily jump between different business ventures.
- **Vault View**: Central repository for all generated Business Plans, Proposals (PDF/Excel), and Roadmap timelines.
- **Credit Badge**: Real-time display of remaining AI credits with a quick "Refill" trigger.

---

## 5. User Features & Flow
- **Onboarding**: Comprehensive welcome tour and setup wizard.
- **Google Login**: One-click social authentication.
- **Email Verification**: Secure account verification process.
- **Profile Management**: User-specific settings and preference controls.

---

## 6. Functional Requirements
- **Guard Rail UI**: Visual warnings when sensitive data (PII) is redacted or when AI content requires manual review.
- **Responsive Design**: Desktop-first for long-form planning, with mobile support for reviewing and approving proposals.
- **Offline Drafts**: Local storage persistence to prevent data loss during connectivity drops.

---

## 7. Branding & Theming
- **Palette**: `Zinc/Slate` (Backgrounds), `Indigo` (Primary actions), `Emerald` (Success/Credits).
- **Typography**: `Outfit` (Headings), `Inter` (Body) for a modern, trust-inspiring look.
- **Animations**: Subtle transitions for sidebar collapses and wizard step changes.
