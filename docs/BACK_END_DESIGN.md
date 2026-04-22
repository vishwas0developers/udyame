# BACK-END ADMIN PANEL DESIGN

## PAGE 1: ADMIN OVERVIEW & METRICS
- **Layout**: Top metric cards (4-col grid, h-24, bg-white border-b-2 colored accents), main content split (left: active sessions chart 60%, right: system alerts 40%), sticky header (dark slate bg-white text, breadcrumb + role badge).
- **Components**: KPI cards (icon circle left, value 28px bold, label 13px slate-500, trend arrow +/- green/red), Line chart (smooth curve, grid lines hidden, tooltip on hover, legend bottom), Alert list (border-l-4 red/amber, timestamp, dismiss icon, expand details).
- **Typography**: Header (18px font-bold slate-900), Card values (28px font-semibold slate-800), Labels (12px medium slate-500), Chart axis (11px slate-400).
- **States**: Loading (card skeletons + chart placeholder spin), Error (red banner with retry), Real-time update (subtle pulse dot green on KPIs), Hover (chart crosshair + tooltip fade-in).
- **Responsive**: Mobile (stacked KPIs, vertical charts, collapsible alerts), Desktop (inline grid, chart side-by-side, fixed header).
- **Micro-interactions**: Number count-up animation, tooltip slide-up, alert dismiss swipe/fade, KPI pulse on data refresh.

## PAGE 2: QUESTION APPROVAL QUEUE
- **Layout**: Full-width data table (sticky header, scrollable body), top filter bar (search input, dropdowns for industry/status, bulk action bar), pagination footer.
- **Components**: Table rows (hover:bg-slate-50, border-b, checkbox left, question text 14px medium, metadata tags right), Bulk bar (sticky on scroll, bg-white shadow, approve/reject/edit buttons), Status badges (Pending: yellow bg/text, Approved: green, Rejected: red, grayed-out), Context modal (slide-over right 35%, preview AI confidence, user feedback count, approval form).
- **Typography**: Headers (12px uppercase tracking-wide font-medium slate-500), Cell text (14px slate-800), Tag text (11px font-medium px-2 py-0.5 rounded-full), Button text (13px medium).
- **States**: Row hover (scale-100 shadow-sm), Checkbox checked (ring-2 ring-blue-500), Bulk actions disabled until select, Loading (row shimmer), Success toast (green check + undo link).
- **Responsive**: Mobile (card-based list instead of table, horizontal scroll for metadata, bottom sheet for context), Desktop (full table, inline actions, slide-over panel).
- **Micro-interactions**: Checkbox ripple, row selection highlight, modal slide-in, bulk bar fade-down on select, badge transition.

## PAGE 3: AI MODEL CONFIGURATION
- **Layout**: Header with "Add Model" CTA, grid of model cards (3-col desktop, 2-col tablet, 1-col mobile), edit modal (centered, 2-column form layout), test console (collapsible bottom panel).
- **Components**: Model card (header with provider logo, name 16px bold, toggle switch right, status dot, metrics mini-row: latency, cost/token, fallback #), Form inputs (label 13px medium, input/select h-10 rounded-lg border-slate-200, focus:ring-blue-500), Test button (outline style, loading spinner inline), Validation hints (12px red text below invalid field).
- **Typography**: Card titles (15px font-semibold), Metric values (12px mono slate-600), Form labels (13px medium), Input placeholders (13px slate-400).
- **States**: Card active (border-2 border-blue-500 shadow-md), Inactive (opacity-60, grayscale), Toggle on/off (smooth slide, green/gray bg), Testing (spinner + progress bar), Error (red border + shake animation), Success (green border + check toast).
- **Responsive**: Mobile (stacked cards, full-width modal, bottom sheet test console), Desktop (grid layout, inline modal, collapsible test panel).
- **Micro-interactions**: Toggle slide, card hover lift, test button progress fill, error field bounce, success confetti pulse.

## PAGE 4: SYSTEM LOGS & AUDIT TRAIL
- **Layout**: Chronological timeline view (left line, nodes right), filter sidebar (left 20%, collapsible), main feed (right 80%), export dropdown top-right.
- **Workflow Update**: Integrated real-time WebSocket tailing for active console monitoring (bg-slate-950, indigo-400 timestamps).
- **Components**: Timeline nodes (colored dots by severity: blue info, amber warning, red error), Event cards (timestamp 12px mono, actor 13px bold, action description 14px, metadata expand accordion), Filter pills (date range, actor, action type, severity), Source tabs (Backend/Frontend).
- **Typography**: Timestamps (11px mono slate-500), Actor names (13px font-medium blue-600), Descriptions (14px slate-800), Metadata (12px slate-500 mono).
- **States**: Hover on card (bg-slate-50, subtle left border highlight), Expanded metadata (smooth height transition, gray bg), Filter active (pill bg-blue-100 text-blue-800), Loading (timeline node pulse), Error fetching (inline banner with retry).
- **Responsive**: Mobile (vertical stack, filters top horizontal scroll, compact cards), Desktop (side filter + timeline, full metadata inline).
- **Micro-interactions**: Log entry fade-in, auto-scroll to bottom, accordion smooth expand, filter pill press, export progress ring.

## PAGE 5: USER & CREDIT MANAGEMENT
- **Layout**: Master-detail view (left: searchable user list 30%, right: detail panel 70%), top stats bar (total users, active subs, avg credit burn), bulk credit top-up modal.
- **Components**: User list (avatar + name, tier badge, credit balance pill, search highlight match), Detail panel (header with status, credit chart sparkline, recent actions table, top-up form with amount input + reason textarea), Tier badges (Free: gray, Pro: blue, Business: purple, Enterprise: black), Top-up modal (secure lock icon, amount presets, notes field, confirm button).
- **Typography**: User names (14px font-medium), Badges (11px uppercase px-2 py-0.5 rounded), Panel headings (16px bold slate-900), Table cells (13px slate-700).
- **States**: List item selected (bg-blue-50 border-l-4 blue-500), Credit low warning (amber pulse badge), Top-up processing (spinner + disabled), Success (green check + updated balance animation), Search highlight (yellow bg on match).
- **Responsive**: Mobile (stacked list + detail toggle, horizontal scroll for stats, bottom sheet top-up), Desktop (split pane, inline stats, centered modal).
- **Micro-interactions**: List selection slide, balance counter animation, search match flash, modal fade-scale, tier badge color transition.

## PAGE 6: ADMIN LOGIN (Modal)
- **Layout**: Fixed inset, bg-slate-950/80, backdrop-blur-sm.
- **Components**: 
    - **Login Card**: bg-slate-800, border-slate-700, max-w-md, rounded-2xl.
    - **Inputs**: bg-slate-900, border-slate-700, pl-12 (with envelope/key icons).
    - **Submit Button**: bg-indigo-600, shadow-indigo-500/20, py-4.
- **Typography**: Title (2xl font-bold white), labels (slate-300).
