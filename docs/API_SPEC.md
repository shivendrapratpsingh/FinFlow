# FinFlow API Specification v1

Base URL: `https://api.finflow.app/api/v1`
Auth: `Authorization: Bearer <JWT>`

---

## Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user + business |
| POST | `/auth/login` | Login with email+password |
| POST | `/auth/send-otp` | Send OTP to phone |
| POST | `/auth/verify-otp` | Verify OTP, get tokens |
| POST | `/auth/google` | Google OAuth2 |
| POST | `/auth/refresh` | Refresh access token |
| GET  | `/auth/me` | Get current user |

---

## Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard/?period=this_month` | Full dashboard data |
| GET | `/dashboard/kpis` | KPI cards only |
| GET | `/dashboard/alerts` | Active alerts |
| GET | `/dashboard/charts/revenue?months=6` | Revenue trend |

---

## Billing

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/billing/invoices` | Create invoice |
| GET  | `/billing/invoices` | List invoices (paginated) |
| GET  | `/billing/invoices/{id}` | Get invoice |
| PUT  | `/billing/invoices/{id}` | Update invoice |
| DELETE | `/billing/invoices/{id}` | Cancel invoice |
| GET  | `/billing/invoices/{id}/pdf` | Download PDF |
| POST | `/billing/invoices/{id}/share` | Share via WhatsApp/email |
| POST | `/billing/invoices/{id}/payment` | Record payment |
| GET  | `/billing/invoices/{id}/payment-link` | Get Razorpay link |
| POST | `/billing/customers` | Create customer |
| GET  | `/billing/customers` | List customers |
| GET  | `/billing/customers/{id}` | Get customer |

---

## Inventory

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/inventory/products` | Create product |
| GET  | `/inventory/products` | List products |
| GET  | `/inventory/products/{id}` | Get product |
| PUT  | `/inventory/products/{id}` | Update product |
| GET  | `/inventory/products/low-stock` | Low stock items |
| POST | `/inventory/stock/adjust` | Adjust stock |
| GET  | `/inventory/suppliers` | List suppliers |
| POST | `/inventory/purchase-orders` | Create PO |

---

## GST

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | `/gst/summary?period=this_month` | GST summary |
| GET  | `/gst/gstr1` | GSTR-1 data |
| GET  | `/gst/gstr3b` | GSTR-3B summary |
| GET  | `/gst/export/gstr1` | Export GSTR-1 JSON |
| POST | `/gst/validate-gstin` | Validate GSTIN |
| GET  | `/gst/hsn-lookup?code=8471` | HSN/SAC lookup |

---

## Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/reports/pl?period=this_year` | P&L Statement |
| GET | `/reports/balance-sheet` | Balance sheet |
| GET | `/reports/cash-flow` | Cash flow statement |
| GET | `/reports/sales` | Sales report |
| GET | `/reports/expenses` | Expense report |
| GET | `/reports/export/pdf?type=pl` | Export report as PDF |
| GET | `/reports/export/excel?type=sales` | Export as Excel |

---

## AI Assistant

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ai/chat` | Chat with AI assistant |
| POST | `/ai/chat/stream` | Streaming chat (SSE) |
| POST | `/ai/ocr/scan` | Scan document (OCR) |
| GET  | `/ai/insights` | AI business insights |
| POST | `/ai/expense/classify` | Classify expense description |
| POST | `/ai/voice/transcribe` | Transcribe voice to text |

---

## Sample Request/Response

### Create Invoice
```json
POST /api/v1/billing/invoices
{
  "customer_name": "Rahul Sharma",
  "invoice_date": "2024-01-15",
  "due_date": "2024-02-15",
  "place_of_supply": "Maharashtra",
  "line_items": [
    {
      "description": "Web Design Services",
      "hsn_sac_code": "9983",
      "quantity": 1,
      "unit": "job",
      "rate": 50000,
      "gst_rate": 18
    }
  ]
}

Response 201:
{
  "id": "uuid",
  "invoice_number": "INV-2401-0001",
  "status": "draft",
  "subtotal": 50000,
  "cgst_amount": 4500,
  "sgst_amount": 4500,
  "total_tax": 9000,
  "total_amount": 59000,
  "balance_due": 59000
}
```

### AI Chat
```json
POST /api/v1/ai/chat
{
  "message": "How much profit did I make this month?",
  "conversation_id": null
}

Response 200:
{
  "message": "Great month! 📈 You've made a profit of ₹1,45,230 in January.\n\nRevenue: ₹3,20,000\nExpenses: ₹1,74,770\n\nYour profit margin is 45.4%, which is excellent for your industry!",
  "conversation_id": "conv_abc123",
  "actions": [
    {"type": "navigate", "label": "View P&L Report", "data": {"url": "/reports/pl"}}
  ]
}
```
