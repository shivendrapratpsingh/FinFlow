# 🚀 FinFlow — AI-Powered Accounting Platform for Small Businesses

> The Canva + Notion + Stripe of accounting software. Smarter, simpler, and cloud-native — a modern Tally alternative built for Indian small businesses.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14+-black)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue)](https://postgresql.org)

---

## 🌟 What is FinFlow?

FinFlow is a **modern, AI-first accounting operating system** for small businesses, freelancers, wholesalers, and distributors. It solves everything Tally does — but without the complexity, outdated UX, and steep learning curve.

### ✅ Core Capabilities
- 🧾 **Smart Billing** — GST invoices, UPI payment links, WhatsApp sharing
- 📦 **Inventory Management** — Products, stock alerts, demand forecasting
- 📊 **Accounting Engine** — Double-entry bookkeeping, automated internally
- 🇮🇳 **GST Engine** — GSTR reports, HSN/SAC codes, tax calculations
- 🤖 **AI Assistant** — Ask "How much profit did I make?" in plain English
- 🔍 **OCR Document AI** — Scan bills, auto-extract expense data
- 💳 **Payment Integration** — Razorpay, UPI, bank sync
- 📈 **Reports & Analytics** — P&L, cash flow, sales trends with AI summaries

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    FINFLOW PLATFORM                      │
├─────────────┬───────────────────┬───────────────────────┤
│  FRONTEND   │     BACKEND       │      AI LAYER         │
│  Next.js 14 │   FastAPI (Py)    │  OpenAI GPT-4o        │
│  TypeScript │   PostgreSQL      │  LangChain            │
│  Tailwind   │   Redis Cache     │  OCR Pipeline         │
│  ShadCN UI  │   Celery Workers  │  Vector DB (Chroma)   │
├─────────────┴───────────────────┴───────────────────────┤
│                   MOBILE (React Native)                  │
│                   DESKTOP (Electron)                     │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
finflow/
├── frontend/          # Next.js 14 web application
├── backend/           # FastAPI Python backend
├── mobile/            # React Native (Expo) mobile app
├── docker/            # Nginx, PostgreSQL configs
├── docs/              # Architecture, API specs, guides
├── .github/           # CI/CD workflows
├── docker-compose.yml        # Development environment
└── docker-compose.prod.yml   # Production environment
```

---

## 🚀 Quick Start (Development)

### Prerequisites
- Docker & Docker Compose
- Node.js 18+
- Python 3.11+

### 1. Clone & Setup
```bash
git clone https://github.com/your-org/finflow.git
cd finflow
cp .env.example .env
# Edit .env with your API keys
```

### 2. Start with Docker (Recommended)
```bash
docker-compose up --build
```

| Service    | URL                        |
|------------|----------------------------|
| Frontend   | http://localhost:3000      |
| Backend API| http://localhost:8000      |
| API Docs   | http://localhost:8000/docs |
| pgAdmin    | http://localhost:5050      |
| Redis UI   | http://localhost:8001      |

### 3. Manual Setup

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

---

## 🔑 Environment Variables

See `.env.example` for all required variables. Key ones:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `SECRET_KEY` | JWT signing secret |
| `OPENAI_API_KEY` | OpenAI GPT-4o for AI assistant |
| `RAZORPAY_KEY_ID` | Razorpay payment gateway |
| `GOOGLE_VISION_API_KEY` | OCR document scanning |

---

## 🗺️ Development Roadmap

| Phase | Features | Status |
|-------|----------|--------|
| **Phase 1** | Auth, Dashboard, Billing, Basic Accounting | 🔨 In Progress |
| **Phase 2** | Inventory, GST Engine, Reports | 📋 Planned |
| **Phase 3** | AI Assistant, OCR, Voice Input | 📋 Planned |
| **Phase 4** | Mobile Apps, Advanced Analytics | 📋 Planned |
| **Phase 5** | Enterprise, Marketplace, Plugins | 📋 Planned |

---

## 🛡️ Security

- JWT + OAuth2 authentication
- Row-level security (multi-tenant)
- AES-256 encryption for sensitive data
- Audit logs for all financial transactions
- Rate limiting & API gateway
- OWASP-compliant security headers

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit: `git commit -m 'feat: add amazing feature'`
4. Push & open a PR

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 💬 Support

- 📧 Email: support@finflow.app
- 📖 Docs: https://docs.finflow.app
- 💬 Discord: https://discord.gg/finflow
