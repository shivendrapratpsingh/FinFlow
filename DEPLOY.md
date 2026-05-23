# FinFlow — Free Deployment Guide
**Host your accounting app online for free so your family can use it from anywhere.**

Stack: **Neon** (free PostgreSQL) + **Render** (free Python backend) + **Vercel** (free Next.js frontend)

---

## Step 1 — Get a Free Database (Neon)

1. Go to **https://console.neon.tech** → Sign up (free, no credit card)
2. Click **New Project** → name it `finflow`
3. Go to **Connection Details** → select driver **"asyncpg"** from the dropdown
4. Copy the connection string — it looks like:
   ```
   postgresql+asyncpg://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?ssl=require
   ```
5. Save this — you'll need it in Step 2.

---

## Step 2 — Deploy the Backend (Render)

1. Push your code to **GitHub** (free):
   - Go to https://github.com/new → create repo `finflow`
   - In this folder, run:
     ```
     git init
     git add .
     git commit -m "FinFlow initial"
     git remote add origin https://github.com/YOUR_NAME/finflow.git
     git push -u origin main
     ```

2. Go to **https://render.com** → Sign up (free, no credit card)

3. Click **New → Web Service** → Connect your GitHub → select `finflow`

4. Fill in:
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app.main:app -w 2 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT --timeout 120`
   - **Instance Type**: Free

5. Add **Environment Variables** (click "Add Environment Variable"):
   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | (paste your Neon connection string from Step 1) |
   | `SECRET_KEY` | (any random 32+ character string, e.g. `myfinflow2024secretkey123456789`) |
   | `APP_ENV` | `production` |
   | `ALLOWED_ORIGINS` | `https://your-app.vercel.app` (update after Step 3) |
   | `LOG_LEVEL` | `WARNING` |

6. Click **Create Web Service** → wait ~3 minutes for it to deploy

7. Note your backend URL: `https://finflow-api-xxxx.onrender.com`

8. **Create your admin account** — in Render dashboard, go to **Shell** tab and run:
   ```bash
   python seed_admin.py
   ```
   This creates login: `pratapsinghshivendra21@gmail.com` / `FinFlow@123`

---

## Step 3 — Deploy the Frontend (Vercel)

1. Go to **https://vercel.com** → Sign up with GitHub (free)

2. Click **Add New → Project** → Import your `finflow` repo

3. Set **Root Directory** to `frontend`

4. Add **Environment Variable**:
   | Key | Value |
   |-----|-------|
   | `NEXT_PUBLIC_API_URL` | `https://finflow-api-xxxx.onrender.com` (your Render URL from Step 2) |

5. Click **Deploy** → wait ~2 minutes

6. Your app is now live at: `https://finflow-xxxx.vercel.app` 🎉

---

## Step 4 — Keep Backend Awake (Free Tier)

Render's free tier sleeps after 15 minutes of inactivity (first request takes ~30s to wake up).
To prevent sleeping:

1. Go to **https://cron-job.org** → Sign up (free)
2. Create a new cron job:
   - **URL**: `https://your-finflow-api.onrender.com/ping`
   - **Schedule**: Every 14 minutes
3. Save → this keeps your backend always awake

---

## Step 5 — Update CORS after Deployment

Once you have your Vercel URL (e.g. `https://finflow-abc.vercel.app`):
1. Go to Render dashboard → your service → Environment
2. Update `ALLOWED_ORIGINS` to `https://finflow-abc.vercel.app`
3. Render will auto-redeploy

---

## Running Locally (on your own computer)

**Windows**: Double-click `START.bat`

**Manual**:
```bash
# Backend
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

Open: http://localhost:3000

---

## What's Free Forever

| Service | Free Tier |
|---------|-----------|
| Neon (Database) | 512 MB PostgreSQL, unlimited projects |
| Render (Backend) | 750 hours/month (enough for 1 service 24/7) |
| Vercel (Frontend) | Unlimited deployments, 100GB bandwidth |
| cron-job.org | Unlimited cron jobs |

**Total cost: ₹0/month** for family use.

---

## Optional: Add AI Assistant

1. Get an OpenAI API key from https://platform.openai.com (pay-as-you-go, ~₹1/day for light use)
2. In Render → Environment Variables → add `OPENAI_API_KEY=sk-...`
3. The AI chat in the app will now answer accounting questions in plain language

---

## Features Available

- ✅ **GST Billing** — Create invoices with automatic CGST/SGST/IGST calculation
- ✅ **Inventory** — Track products, stock levels, low-stock alerts
- ✅ **Accounting** — Ledgers, trial balance, journal entries (auto)
- ✅ **GST Reports** — GSTR-1 data, monthly GST summary, ITC calculation
- ✅ **P&L Report** — Profit & Loss, Cash Flow, Outstanding receivables
- ✅ **Dashboard** — Revenue KPIs, top customers, alerts
- ✅ **Multi-user** — Each family member gets their own login
- ✅ **PDF Invoices** — Download/share professional GST invoices
- 🔧 **AI Assistant** — Needs OpenAI key (optional)
- 🔧 **Email sending** — Needs Gmail app password (optional)
- 🔧 **Razorpay payments** — Needs Razorpay account (optional)
