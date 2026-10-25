# Inkloom AI — Frontend (Phase 1)

AI-powered Brand Governance and Content Intelligence Platform. This is the Phase 1 frontend only: UI with realistic sample data. No backend, database, authentication, or live AI integration.

## Tech stack

- React 19 + TypeScript
- Vite 8
- Tailwind CSS 4
- Recharts
- Lucide React
- React Router DOM

## Windows + VS Code setup

### 1. Check Node.js

```powershell
node --version
npm --version
```

Requires Node.js 18+ (tested with v24) and npm 9+.

### 2. Install dependencies

```powershell
cd C:\Users\Admin\Desktop\Inkloom
npm install
```

### 3. Start dev server

```powershell
npm run dev
```

Open http://localhost:5173 in your browser.

### 4. Build for production

```powershell
npm run build
npm run preview
```

## Project structure

```
src/
  App.tsx
  main.tsx
  index.css
  components/
    layout/   (Sidebar, TopNav, Layout)
    ui/       (Button, Card, Badge, Input, Textarea, Select, MetricCard, StatusBadge, SeverityBadge)
  pages/      (Dashboard, ContentReview, Scorecard, BrandGuidelines, ApprovalCenter, FeedbackInsights)
  data/       (sampleData.ts)
  types/      (index.ts)
```

## Testing each page

- **Dashboard**: metrics, quality trend line chart, issue distribution bar chart, recent reviews, activity, pending reviews. Banner labels data as demonstration.
- **Content Review**: paste/edit content, upload .txt/.md, select content type, click "Review Content" (simulated), view original + working draft, issues grouped by category with severity/explanation/guideline/suggestion, Accept/Edit/Reject suggestions, manual edit, Re-analyse.
- **Scorecard**: overall score, category radar, original vs revised bar, strengths/improvements, unresolved critical warning.
- **Brand Guidelines**: view rules, add/edit/remove (frontend state only).
- **Approval Center**: search + status filter table, review detail panel, approve (blocked if critical issues) or request changes.
- **Feedback & Insights**: issue category chart, violated guidelines, feedback table, disputed findings, recurring problems.

## Phase 6 Backend

Backend location: `backend/`

### Backend setup (Windows PowerShell)

```powershell
cd C:\Users\Admin\Desktop\Inkloom\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

Edit `.env` with your PostgreSQL connection string.

### Migrations

```powershell
alembic upgrade head
```

### Run backend

```powershell
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Swagger docs: `http://127.0.0.1:8000/docs`

### Frontend API configuration

Create `.env` in the project root:

```env
VITE_API_BASE_URL=http://localhost:8000
```

### Backend tests

```powershell
cd C:\Users\Admin\Desktop\Inkloom\backend
pytest
```

## Troubleshooting

- **Tailwind classes not applying**: ensure `@tailwindcss/vite` plugin is in `vite.config.ts` and `@import "tailwindcss";` in `src/index.css`.
- **Port in use**: run `npm run dev -- --port 5174`.
- **Type errors**: run `npx tsc -b` to see details.
- **Module not found**: delete `node_modules` and `package-lock.json`, then `npm install`.
- **Browser shows blank**: check console; ensure dev server running.