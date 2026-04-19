# FRONT-END USER INTERFACE DESIGN

## PAGE 1: LANDING & AUTH
- **Layout**: Centered auth container (max-width: 420px), full-height gradient background (slate-50 to blue-50), floating glassmorphism card with backdrop-blur-md and subtle drop-shadow.
- **Typography**: Heading (Inter 24px, font-semibold, slate-900), Subtext (Inter 14px, slate-500), Input labels (13px, medium, slate-700).
- **Components**: Email/password inputs (h-11, rounded-xl, border-slate-200, focus:ring-2 ring-blue-500), Submit button (full-width, h-11, bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all), OAuth divider with line-through separators.
- **States**: Loading (spinner icon inside button, disabled cursor), Error (red border, 12px text below input), Success (green checkmark toast).
- **Responsive**: Mobile (stacked, full-width card with px-4), Tablet/Desktop (centered, max-w-md).
- **Micro-interactions**: Button press scale-95, input focus smooth border transition, floating label animation on focus.

## PAGE 2: MAIN DASHBOARD
- **Layout**: 12-column responsive grid, persistent left sidebar (w-64, hidden on mobile, slide-over drawer), top header (h-16, sticky, bg-white border-b), main content area (p-6, bg-slate-50).
- **Components**: Company selector (dropdown with avatar + name), Quick action tiles (4-column grid, hover:shadow-lg, hover:-translate-y-1, rounded-2xl bg-white), Recent documents list (table with status badges, pagination at bottom).
- **Credit Indicator**: Pill-shaped badge (bg-amber-100 text-amber-800, progress ring SVG), tooltip on hover showing usage breakdown.
- **Typography**: Section headings (18px, bold, slate-900), Card titles (15px, medium, slate-800), Meta text (12px, slate-500).
- **States**: Tile hover (scale-105, ring-1 ring-slate-200), Loading skeleton (pulse animation on gray-200 placeholders), Empty state (illustration + CTA button, centered).
- **Responsive**: Mobile (single column tiles, collapsible sidebar, sticky header with hamburger), Desktop (3-4 column grid, persistent sidebar).
- **Micro-interactions**: Tile hover lift, badge progress animation, smooth route transition fade-in.

## PAGE 3: CONVERSATIONAL PLANNING INTERFACE
- **Layout**: Split pane (left 65% chat, right 35% context sidebar), chat container (flex-col-reverse, overflow-y-auto, pb-4), input area (sticky bottom, px-4 py-3 bg-white border-t).
- **Components**: Message bubbles (AI: bg-slate-100 rounded-tr-2xl rounded-br-2xl rounded-tl-2xl, User: bg-blue-600 text-white rounded-tl-2xl rounded-bl-2xl rounded-tr-2xl), Context cards (border-l-4 border-blue-500 bg-blue-50/50), Feedback buttons (inline 👍/👎, hover:bg-slate-100 rounded).
- **Typography**: AI messages (14px, leading-relaxed, slate-800), User messages (14px, white), Inline code (monospace bg-slate-200 px-1 py-0.5 rounded).
- **Input**: Auto-growing textarea (max-h-32, resize-none, ring focus), Send button (circular, h-10 w-10 bg-blue-600 disabled:opacity-50), Attach icon (hover:bg-slate-100 rounded-full).
- **States**: Streaming (typing dots animation, cursor-blink), Loading (spinner + "Thinking..." text), Error (red banner inline), Pause/Resume controls (floating pill on scroll-up).
- **Responsive**: Mobile (single column, sidebar collapses to bottom sheet toggle, input fixed bottom), Desktop (split view, sidebar fixed height with internal scroll).
- **Micro-interactions**: Message slide-up fade, button press scale-95, auto-scroll with smooth behavior, context panel expand/collapse accordion.

## PAGE 4: DOCUMENT LIBRARY & VIEWER
- **Layout**: Header with search + filter dropdowns (industry, date, status), grid/list toggle, document cards (2-col mobile, 3-col tablet, 4-col desktop), viewer modal (fixed inset, bg-black/40 backdrop-blur).
- **Components**: Document card (thumbnail preview, title 14px medium, meta row with icons, status badge, download button hover:bg-blue-600), Filter chips (rounded-full border, active:bg-blue-50 active:border-blue-500 active:text-blue-700), Viewer frame (PDF.js container, toolbar top, zoom controls, page nav).
- **Typography**: Titles (15px font-medium), Meta (12px slate-500), Toolbar labels (13px).
- **States**: Hover (shadow-md, ring-1), Loading (skeleton grid), Empty (centered illustration + "Generate First Doc" CTA), Error (toast + retry link).
- **Responsive**: Mobile (stacked filters, single column cards, viewer fullscreen), Desktop (inline filters, multi-column grid, modal 80vw max-width).
- **Micro-interactions**: Card hover lift, filter chip tap bounce, modal fade-in + scale-95 to 100, download progress bar.

## PAGE 5: BILLING & SUBSCRIPTION
- **Layout**: Pricing section (3-card horizontal stack, middle card elevated ring-2 ring-blue-500 shadow-xl), Usage dashboard (chart area + ledger table below), Payment modal (centered, secure lock icon).
- **Components**: Plan cards (bg-white rounded-2xl p-6, feature list with check icons, CTA button variant per tier), Credit meter (horizontal progress bar with segment markers, hover tooltip), Ledger table (zebra striping, sortable headers, pagination), Checkout form (card input fields with brand detection icons).
- **Typography**: Plan names (20px bold, slate-900), Prices (32px font-extrabold blue-600), Feature text (14px slate-600), Table headers (12px uppercase tracking-wide slate-500).
- **States**: Card hover (shadow-xl, translate-y-[-4px]), Active plan badge (bg-green-100 text-green-800 px-2 py-1 rounded), Processing (spinner + disabled inputs), Success (confetti + redirect countdown).
- **Responsive**: Mobile (stacked plans, horizontal scroll for ledger, bottom sheet checkout), Desktop (inline layout, table full-width, modal side-by-side with order summary).
- **Micro-interactions**: Plan toggle switch (monthly/yearly pill), progress bar fill animation, table row hover highlight, button ripple effect.
