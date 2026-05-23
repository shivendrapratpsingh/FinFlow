# FinFlow — Developer Onboarding Guide

## Getting Started in 5 Minutes

### Prerequisites
- Git, Docker Desktop, Node.js 18+, Python 3.11+

### 1. Clone & configure
```bash
git clone https://github.com/your-org/finflow.git
cd finflow
cp .env.example .env
# Open .env and fill in: SECRET_KEY, OPENAI_API_KEY, DATABASE_URL (already set for Docker)
```

### 2. Start everything with Docker
```bash
docker-compose up --build
```

Wait ~60 seconds, then visit:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **pgAdmin**: http://localhost:5050 (admin@finflow.app / admin123)

### 3. Run DB migrations
```bash
docker-compose exec backend alembic upgrade head
```

### 4. Create your first admin user
```bash
docker-compose exec backend python -c "
from app.db.seed import create_demo_data
import asyncio
asyncio.run(create_demo_data())
"
```

---

## Project Structure

```
finflow/
├── frontend/          Next.js 14 web app
│   ├── app/           App Router pages
│   │   ├── (auth)/    Login, Register, OTP
│   │   └── (dashboard)/ All app pages
│   ├── components/    Reusable UI components
│   ├── lib/           API client, utilities
│   ├── store/         Zustand state management
│   └── types/         TypeScript type definitions
│
├── backend/           FastAPI Python API
│   ├── app/
│   │   ├── api/v1/    All route handlers
│   │   ├── services/  Business logic
│   │   ├── db/models/ SQLAlchemy models
│   │   └── schemas/   Pydantic schemas
│   └── tests/         Pytest test suite
│
├── mobile/            React Native (Expo) app
│   └── app/           Expo Router screens
│
└── docs/              Architecture, API docs
```

---

## Backend Development

### Running locally (without Docker)
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env: set DATABASE_URL to your local postgres

alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

### Running tests
```bash
cd backend
pytest tests/ -v --cov=app
```

### Adding a new API module
1. Create `app/api/v1/your_module/routes.py`
2. Create `app/db/models/your_model.py`
3. Create `app/schemas/your_schema.py`
4. Create `app/services/your_module/service.py`
5. Add router to `app/api/v1/router.py`
6. Create Alembic migration: `alembic revision --autogenerate -m "Add your_model"`

### Code style
- Formatter: `black app/`
- Linter: `ruff check app/`
- Type check: `mypy app/`

---

## Frontend Development

### Running locally
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

### Adding a new page
1. Create `app/(dashboard)/your-page/page.tsx`
2. Add to navigation in `components/layout/Sidebar.tsx`
3. Add API function to `lib/api/`
4. Add React Query hook if needed

### Component conventions
- Use ShadCN UI components: `npx shadcn-ui@latest add button`
- Always use TypeScript
- Use `cn()` for conditional class names
- Use `react-hook-form` + `zod` for forms
- Use `@tanstack/react-query` for server state

---

## Mobile Development

```bash
cd mobile
npm install
npx expo start

# Android: press 'a' | iOS: press 'i' | Web: press 'w'
```

---

## Environment Variables Reference

See `.env.example` for full list. Critical ones:

| Variable | Required | Description |
|----------|----------|-------------|
| `SECRET_KEY` | ✅ | JWT signing key (min 32 chars, random) |
| `DATABASE_URL` | ✅ | PostgreSQL async connection string |
| `OPENAI_API_KEY` | ✅ | GPT-4o for AI assistant |
| `RAZORPAY_KEY_ID` | For payments | Razorpay payment gateway |
| `GOOGLE_VISION_API_KEY` | For OCR | Document scanning |
| `SMTP_*` | For emails | Invoice sending |

---

## Common Workflows

### Creating a GST Invoice (Backend flow)
```
POST /api/v1/billing/invoices
    → InvoiceService.create_invoice()
        → auto-number invoice (INV-2401-0001)
        → GSTEngine.calculate_invoice() — compute all taxes
        → Save to DB
        → Trigger background: JournalService.create_from_invoice()
        → Return invoice with all tax breakdowns
```

### AI Assistant Question (Backend flow)
```
POST /api/v1/ai/chat {"message": "How much profit this month?"}
    → FinFlowAssistant.chat()
        → LangChain Agent (GPT-4o)
        → Tool: get_profit_loss("this_month")
            → Queries DB for revenue & expenses
            → Returns formatted string
        → GPT-4o synthesizes human response
        → Returns friendly answer + action buttons
```

---

## Tech Debt & Known Issues

- [ ] Redis-backed rate limiting (currently in-memory)
- [ ] Alembic migrations not yet wired to all models
- [ ] WhatsApp integration needs Meta Business Account approval
- [ ] Voice input (Whisper) requires additional testing
- [ ] Mobile app needs auth flow (login screen)

---

## Deployment

See `docker-compose.prod.yml` and `.github/workflows/ci.yml`.

For production checklist:
1. Set all env vars
2. Generate strong `SECRET_KEY`: `python -c "import secrets; print(secrets.token_hex(32))"`
3. Set up SSL certificates
4. Run migrations: `alembic upgrade head`
5. Enable PostgreSQL RLS policies
6. Configure Sentry DSN for error tracking
7. Set up automated backups
