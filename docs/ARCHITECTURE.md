# FinFlow — System Architecture

## Overview

FinFlow is a **cloud-native, multi-tenant SaaS** accounting platform built for Indian small businesses. It follows a modular monolith backend (FastAPI) with a clean API-first design, ready to be split into microservices as scale demands.

---

## High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                         CLIENTS                                  │
├────────────┬───────────────────┬────────────────────────────────┤
│  Web App   │   Mobile (RN)     │    Desktop (Electron)          │
│  Next.js   │   Expo + React    │    Wraps Web App               │
│  Port 3000 │   Native          │                                │
└─────┬──────┴────────┬──────────┴───────────────────────────────-┘
      │               │
      ▼               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NGINX REVERSE PROXY                           │
│   Rate limiting · SSL termination · Static asset caching        │
│                        Port 80 / 443                            │
└───────────────────────┬─────────────────────────────────────────┘
                        │
         ┌──────────────┼──────────────┐
         ▼              ▼              ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   FastAPI    │  │   Celery     │  │  ChromaDB    │
│   Backend    │  │   Workers    │  │  (VectorDB)  │
│   Port 8000  │  │  Background  │  │  Port 8008   │
│              │  │   Tasks      │  │              │
└──────┬───────┘  └──────────────┘  └──────────────┘
       │
       ├──────────────────────────┐
       ▼                          ▼
┌──────────────┐          ┌──────────────┐
│  PostgreSQL  │          │    Redis     │
│  Port 5432   │          │  Port 6379   │
│  Multi-tenant│          │  Cache +     │
│  (RLS)       │          │  Sessions    │
└──────────────┘          └──────────────┘
```

---

## Backend Module Architecture

```
app/
├── api/v1/
│   ├── auth/          JWT, OAuth2, OTP
│   ├── dashboard/     KPIs, charts, alerts
│   ├── billing/       Invoices, customers, payments
│   ├── inventory/     Products, stock, purchase orders
│   ├── accounting/    Ledgers, journal entries, P&L
│   ├── gst/           Tax engine, GSTR reports
│   ├── reports/       Export PDF/Excel, analytics
│   ├── ai/            AI assistant, OCR, voice
│   └── payments/      Razorpay, Stripe integration
├── services/
│   ├── ai/            LLM (GPT-4o), OCR, embeddings
│   ├── billing/       Invoice engine, PDF generation
│   ├── gst/           GST calculation engine
│   ├── accounting/    Double-entry automation
│   ├── inventory/     Stock management
│   ├── notifications/ Email, SMS, WhatsApp
│   └── payments/      Payment gateway abstractions
├── db/models/         SQLAlchemy ORM models
├── schemas/           Pydantic v2 request/response
├── core/              Config, DB, security, dependencies
├── middleware/        Logging, rate limiting
└── workers/           Celery tasks, beat schedule
```

---

## Multi-Tenancy Design

All data is isolated by `business_id`:
- Every table has a `business_id` FK
- Row-Level Security (RLS) enforced at DB level
- API middleware injects `business_id` from JWT
- Users can belong to multiple businesses with different roles

```sql
-- Row Level Security example
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY business_isolation ON invoices
  USING (business_id = current_setting('app.business_id')::uuid);
```

---

## Authentication Flow

```
1. User submits email+password
2. Backend validates credentials
3. Returns JWT (access token, 60min) + Refresh token (30 days)
4. Frontend stores refresh token in localStorage, access in cookie (HttpOnly in prod)
5. Every API request includes Authorization: Bearer <token>
6. On 401 → auto-refresh via refresh token
7. On refresh failure → redirect to /login

OAuth2 (Google):
1. Frontend gets Google access token
2. POST /auth/google with token
3. Backend verifies with Google API
4. Creates or returns user, issues JWT
```

---

## Accounting Engine

FinFlow hides double-entry complexity from users but maintains correct books internally:

```
User creates invoice ─→ InvoiceService ─→ [auto-creates]
                                              ↓
                                    JournalEntry (Sales voucher)
                                         ├── DEBIT:  Accounts Receivable
                                         └── CREDIT: Sales Revenue
                                                      └── + CREDIT: Output GST

User records payment ─→ PaymentService ─→ [auto-creates]
                                              ↓
                                    JournalEntry (Receipt voucher)
                                         ├── DEBIT:  Bank Account
                                         └── CREDIT: Accounts Receivable
```

---

## GST Engine Architecture

```
GSTEngine
├── calculate_line_item(rate, qty, gst_rate, ...)
│   ├── Intra-state → CGST + SGST (each = rate/2)
│   └── Inter-state → IGST (= full rate)
├── calculate_invoice(line_items) → InvoiceTax
├── validate_gstin(gstin) → bool
├── get_state_from_gstin(gstin) → state
└── get_gst_rate_from_hsn(hsn_code) → rate

Future: AbstractTaxEngine
├── IndiaTaxEngine (current)
├── USTaxEngine
├── UKVATEngine
└── GSTAustraliaEngine
```

---

## AI Assistant Architecture

```
User query
    │
    ▼
FinFlowAssistant
    │
    ├─── LangChain Agent (GPT-4o)
    │         │
    │    [Tool calls]
    │         ├── get_revenue_summary()    → queries DB
    │         ├── get_outstanding_payments()
    │         ├── get_profit_loss()
    │         ├── get_top_products()
    │         ├── get_gst_summary()
    │         └── create_invoice_from_description()
    │
    ├─── ChromaDB (RAG for business knowledge)
    │    - GST rules
    │    - Accounting concepts
    │    - Business-specific historical data
    │
    └─── Response (natural language, Hindi/English)
```

---

## OCR Pipeline

```
User uploads bill/invoice image
    │
    ▼
OCRService
    │
    ├── Pre-process (resize, enhance contrast)
    │
    ├── Provider router
    │    ├── Google Vision API (default)
    │    ├── Tesseract (offline fallback)
    │    └── Azure Document Intelligence (enterprise)
    │
    ├── Post-process with GPT-4o
    │    "Extract: vendor name, date, amount, GST, line items"
    │
    └── Return structured JSON
         → Auto-fill expense/invoice form
```

---

## Scalability Plan

### Phase 1 (0–10K businesses): Modular monolith
- Single FastAPI app
- 1 PostgreSQL instance
- Redis for cache

### Phase 2 (10K–100K): Horizontal scaling
- Multiple backend replicas behind load balancer
- Read replicas for PostgreSQL
- Celery workers scaled independently

### Phase 3 (100K+): Microservices split
- billing-service
- inventory-service
- accounting-service
- ai-service
- notification-service
- Kafka event bus between services

---

## Security Architecture

| Layer | Measure |
|-------|---------|
| Authentication | JWT + OAuth2, OTP via SMS |
| Authorization | RBAC (Owner/Accountant/Staff/Viewer) |
| Data | PostgreSQL RLS, AES-256 encryption for sensitive fields |
| Transport | TLS 1.3, HSTS |
| API | Rate limiting, OWASP headers, input validation (Pydantic) |
| Audit | Full audit log for all financial mutations |
| Backup | Encrypted daily backups to S3 |
| MFA | TOTP (coming in Phase 2) |

---

## Deployment on AWS

```
Route 53 (DNS)
    │
    ▼
CloudFront (CDN + DDoS protection)
    │
    ▼
Application Load Balancer
    │
    ├── ECS Fargate (Backend)   — auto-scales
    ├── ECS Fargate (Frontend)  — auto-scales
    ├── ECS Fargate (Celery)    — auto-scales
    │
    ├── RDS PostgreSQL (Multi-AZ)
    ├── ElastiCache Redis
    └── S3 (Documents, PDFs)
```
