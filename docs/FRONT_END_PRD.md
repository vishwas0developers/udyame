# PRODUCT REQUIREMENTS DOCUMENT: FRONT-END (Udyame AI)

## 1. OVERVIEW
The frontend of **Udyame AI** is a professional-grade, user-oriented SaaS application focusing on guided business growth. Built with Next.js 14+, it delivers a conversational business architect interface, a comprehensive user dashboard, and seamless document management workflows. All administrative functions are isolated within the backend system, while the frontend focuses strictly on the end-user experience.

## 2. CORE OBJECTIVES
- **Conversational UX**: Provide a frictionless, step-by-step conversational interface for business planning.
- **Seamless Workflows**: Enable easy switching between planning modes, proposal generation, and document review.
- **Credit Transparency**: Deliver a real-time credit and subscription management interface.
- **Multi-Tenant Support**: Allow users to manage multiple business ventures efficiently.
- **Professional Aesthetic**: Ensure full responsiveness, accessibility (WCAG 2.1), and a premium trust-inspiring look.
- **PWA Readiness**: Progressive Web App capabilities for offline and mobile use.

## 3. TECHNOLOGY STACK
- **Framework**: Next.js 14+ (App Router, React)
- **Language**: TypeScript for strict type safety.
- **Styling**: TailwindCSS & Shadcn UI (Professional, clean aesthetic).
- **State Management**: Zustand (Client-side) & TanStack React Query (Server-side cache/sync).
- **Form Handling**: React Hook Form + Zod (Validation).
- **Real-time**: WebSockets / Server-Sent Events (SSE) for live AI chat streaming and generation progress.
- **Authentication**: NextAuth / Clerk integration with Google OAuth and Email/Password support.
- **API Client**: Axios with interceptors for JWT auth, tenant isolation, and credit checks.

---

## 4. UI/UX PRINCIPLES
- **Conversational Planning**: A chat-centric primary interface that feels like talking to a business architect.
- **Context Awareness**: A persistent side panel showing "Master Planning" data currently influencing the AI's logic.
- **Dynamic Wizards**: Step-by-step onboarding and product creation flows.
- **Premium Design**: Minimalist SaaS aesthetic (Zinc/Slate) with modern typography (Outfit/Inter) and subtle micro-animations.
- **Hinglish/English Toggle**: For AI responses and UI labels.
- **Keyboard Navigation**: Full support and screen reader compatibility.

---

## 5. CORE USER INTERFACES

### 5.1 Landing & Authentication
- Google Login (One-click social authentication).
- Email Registration with verification.
- Secure redirects, protected routes, and subscription tier gating.
- SEO meta tags, OpenGraph previews, and PWA manifest setup.

### 5.2 Company Workspace
- **Left Sidebar Navigation**: Internal Planning (locked after completion), Products (+ Add New), Business Plans (+ Generate New), Proposals (+ Create Proposal), Diagnostics (Run Analysis), Settings.
- **Main Panel (Context-Aware)**: Renders based on active selection — Master Form (read-only after save), New Proposal (auto-pulls Internal Planning + Product context), Diagnostic (compares vs. Internal Planning baseline).
- **Smart Assistant Panel (Right)**: Context-aware AI suggestions — franchise city recommendations, GST-inclusive pricing prompts, memory hints from past sessions.
- **Internal Planning Wizard**: One-time setup wizard with 10 permanent questions. Locked post-completion. Editable only via "Request Amendment" workflow with version history.

### 5.3 The "Udyame" Chat
- **Conversational Q&A**: Handles the 10 permanent questions and dynamic follow-ups.
- **Interface Elements**: Typing indicators, pause/resume controls, and streaming response support.
- **Micro-Interactions**: Auto-save status, "Explain This" tooltips, and gap detection alerts.
- **Inline Editing**: Revision of previous answers with version diff visualization.
- **Self-Learning Feedback**: Post-answer prompt "Was this question useful?" (Yes/No/Edit) for AI-generated questions.

### 5.4 User Dashboard
- **Company Selector**: Multi-tenant switcher with quick-access tiles (Planning, Proposals, Diagnostics, Documents).
- **Progress Tracker**: Real-time visualization of active planning session completeness (e.g., 2/10 permanent questions answered).
- **Activity Feed**: Recent activity and document version history.
- **Credit Badge**: Real-time display of remaining AI credits with refill triggers and threshold warnings.

### 5.5 Document Library & Vault
- **Management**: Grid/list view of all generated plans, proposals, DPRs, and roadmaps.
- **Preview & Export**: Modal preview with format toggles (Markdown, PDF, Excel, PPT).
- **Downloads**: One-click download with branded templates and watermark options.
- **Metadata**: Tagging by industry, date, status, and credit cost.

### 5.6 Billing & Subscription
- **Plan Comparison**: Table showing feature matrices and credit allocations (FREE / PRO ₹999 / BUSINESS ₹2999 / ENTERPRISE).
- **Checkout**: Secure integration via Razorpay/Stripe with webhook sync.
- **Usage Stats**: Breakdown by session, model, and document type.
- **Auto-refresh**: Countdown timer and manual top-up interface.

### 5.7 Admin Dashboard (Role-Gated)
- Role-gated access for moderators and superadmins.
- Pending question queue with bulk approve/reject/edit actions.
- AI model registry with provider dropdowns, endpoint testing, and cost calculators.
- System metrics panel (API latency, error rates, active sessions, credit burn).
- User & Credit Management: Master-detail view with manual top-up, tier badges, and credit sparklines.

---

## 6. STATE & DATA MANAGEMENT
- **React Query**: Server-state caching, refetching, background sync, and pagination helpers.
- **Zustand**: Client-state (chat history, UI preferences, credit status, tenant context).
- **Optimistic UI**: Updates with rollback on API failure.
- **Form Validation**: Zod + React Hook Form for all user inputs.
- **TypeScript Strict Mode**: Enforced across all modules.
- **Error Boundaries**: Integrated for graceful failure handling.

---

## 7. ROUTING STRUCTURE
- `/` → Landing & Pricing
- `/auth/*` → Login, Register, Verification
- `/dashboard` → Company overview, quick actions, recent docs
- `/planning/[sessionId]` → Conversational interface with context sidebar
- `/documents/[docId]` → Viewer, editor, export controls
- `/billing` → Subscription, invoices, credit ledger
- `/admin` → Moderation dashboard, model config, system logs (Role-gated)

---

## 8. FUNCTIONAL REQUIREMENTS
- **Guard Rail UI**: Visual warnings for PII redaction or content requiring manual review.
- **Offline Readiness**: Local storage persistence to prevent data loss during connectivity drops. PWA offline fallback logic for non-critical routes.
- **Responsive Design**: Desktop-first for long-form planning with full mobile compatibility.
- **Performance Targets**: LCP < 1.5s, TTI < 2s on 4G networks.
- **Optimization**: Code-splitting per route, dynamic imports for heavy UI components, image optimization, font self-hosting, API request batching, and debounced search inputs.

---

## 9. BRANDING & THEMING
- **Palette**: `Zinc/Slate` (Backgrounds), `Indigo` (Primary actions), `Emerald` (Success/Credits).
- **Typography**: `Outfit` (Headings), `Inter` (Body).
- **Iconography**: Consistent Lucide React icons.
- **Design System**: Reusable components with subtle transitions for sidebar collapses and wizard step changes.

---

## APPENDIX A: GENERATION PROMPTS

### PROMPT 1: LANDING & AUTH PAGES
"Build Next.js 14 app router pages for landing, pricing, and authentication (/auth/login, /auth/register, /auth/forgot). Implement NextAuth/Clerk session handling with secure redirects, protected routes, and subscription tier gating. Create responsive UI with Tailwind + Shadcn, form validation via Zod, and loading skeletons. Ensure SEO meta tags, OpenGraph previews, and PWA manifest setup."

### PROMPT 2: USER DASHBOARD LAYOUT & NAVIGATION
"Develop /dashboard page with persistent sidebar navigation, top header (user profile, credit badge, notifications), and main content grid. Use React Query to fetch company list, recent documents, and active sessions. Implement quick-action tiles, progress rings, and state-aware routing. Ensure keyboard navigation, responsive breakpoints, and Zustand for UI preferences (theme, layout, Hinglish toggle)."

### PROMPT 3: CONVERSATIONAL PLANNING INTERFACE
"Create /planning/[sessionId] page with chat-based UI, streaming message rendering, and dynamic question injection. Implement React Hook Form + Zod for answer submission, inline edit mode with version diff, and AI suggestion sidebar showing live context population. Add typing indicators, pause/resume controls, and optimistic updates. Use WebSocket/SSE for real-time LLM streaming and credit deduction display."

### PROMPT 4: DOCUMENT LIBRARY & VIEWER/EXPORT
"Build /documents page with grid/list toggle, metadata filtering, and search. Implement preview modal supporting PDF, Excel, PPT, and markdown rendering via react-pdf and xlsx libraries. Add export controls with template selection, watermark toggles, and presigned URL downloads. Use React Query for pagination, Zustand for download queue state, and toast notifications for completion/errors."

### PROMPT 5: BILLING & CREDIT MANAGEMENT UI
"Develop /billing page with plan comparison table, feature matrices, and credit allocation display. Integrate Razorpay/Stripe checkout modals with webhook sync indicators and loading states. Create credit usage breakdown charts by session/model/type, auto-refresh countdown timer, and manual top-up form. Implement error boundaries for payment failures, success redirects, and ledger history table with pagination."

### PROMPT 6: ADMIN DASHBOARD & QUESTION APPROVAL QUEUE
"Build /admin layout with role-gated access, sidebar navigation, and main content area. Create /admin/queue page with paginated table of pending questions, bulk select, approve/reject/edit modals, and optimistic UI updates. Add filtering by industry, confidence, and date. Implement toast confirmations, audit log viewer, and real-time polling via React Query. Ensure RBAC checks and fallback UI for unauthorized access."

### PROMPT 7: AI MODEL CONFIGURATION PANEL
"Create /admin/models page with model registry table, provider dropdowns (OpenAI, Gemini, Qwen, Groq, Custom), endpoint input, API key masking, and cost calculator. Add 'Test Connection' button with status indicators, fallback priority sliders, and toggle switches for active/inactive states. Implement form validation, error toast for failed tests, and React Query mutations for CRUD operations with optimistic rollback."

### PROMPT 8: RESPONSIVE STATE & API INTEGRATION LAYER
"Develop centralized API client using Axios/RTK Query with interceptors for JWT attachment, error handling, and credit status checks. Implement Zustand store for global state (chat history, credit balance, UI preferences, tenant context). Add React Query wrappers for all endpoints with caching, background refetch, and pagination helpers. Ensure TypeScript strict mode, error boundary integration, and PWA offline fallback logic for non-critical routes."