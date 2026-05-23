# FinFlow — Quick Start (No Docker)

Run FinFlow directly on your Windows machine. No Docker required.

---

## What You Need

- [x] **Python 3.10+** — [python.org](https://python.org)
- [x] **Node.js 18+** — [nodejs.org](https://nodejs.org)
- [x] **PostgreSQL** — already installed ✓

Check versions:
```
python --version
node --version
psql --version
```

---

## Step 1 — Set Up the Database (run once)

Open PowerShell **in the finflow folder** and run:

```powershell
.\setup-database.ps1
```

It will create the `finflow_db` database and `finflow` user automatically.
Enter your PostgreSQL **postgres** password when prompted.

**Or do it manually in pgAdmin / psql:**
```sql
CREATE DATABASE finflow_db;
CREATE USER finflow WITH PASSWORD 'finflow_secret';
GRANT ALL PRIVILEGES ON DATABASE finflow_db TO finflow;
ALTER DATABASE finflow_db OWNER TO finflow;
```

---

## Step 2 — Start the Backend

Open a new PowerShell window and run:

```powershell
cd C:\PROJECTS\finflow
.\start-backend.ps1
```

First run downloads Python packages (~2-3 min). After that it starts instantly.

✅ Backend will be at: **http://localhost:8000**  
✅ API Docs (Swagger): **http://localhost:8000/docs**

---

## Step 3 — Start the Frontend

Open **another** PowerShell window and run:

```powershell
cd C:\PROJECTS\finflow
.\start-frontend.ps1
```

First run installs Node packages (~2-3 min). After that it starts instantly.

✅ App will be at: **http://localhost:3000**

---

## Step 4 — Open FinFlow

Go to **http://localhost:3000** in your browser.

- Register a new account
- Create your business profile
- Start invoicing!

---

## Daily Use

Every time you want to run FinFlow, just open **two PowerShell windows**:

| Window 1 | Window 2 |
|----------|----------|
| `.\start-backend.ps1` | `.\start-frontend.ps1` |

---

## Common Issues

### "psql is not recognized"
Add PostgreSQL bin to your PATH:
`C:\Program Files\PostgreSQL\16\bin` (adjust version number)

### "python is not recognized"
During Python install, tick **"Add Python to PATH"**.

### Backend error: "could not connect to database"
Make sure PostgreSQL service is running. Open **Services** (`Win+R → services.msc`) and start **postgresql-x64-XX**.

### Port already in use
- Backend on 8000: `netstat -ano | findstr :8000` then `taskkill /PID <pid> /F`
- Frontend on 3000: `netstat -ano | findstr :3000` then `taskkill /PID <pid> /F`

---

## Project Structure

```
finflow/
├── backend/          ← FastAPI Python app
│   ├── app/
│   │   ├── main.py           ← App entry point
│   │   ├── api/routes/       ← API endpoints
│   │   ├── db/models/        ← Database models
│   │   ├── services/         ← Business logic (GST, AI, etc.)
│   │   └── core/             ← Config, security, deps
│   └── requirements.txt
├── frontend/         ← Next.js 14 app
│   ├── app/          ← Pages (App Router)
│   ├── components/   ← UI components
│   ├── store/        ← Zustand state
│   └── lib/          ← API client, utils
├── .env              ← All environment variables
├── start-backend.ps1
├── start-frontend.ps1
└── setup-database.ps1
```

---

## Add Your OpenAI Key (for AI Assistant)

Edit `.env` and replace the placeholder:
```
OPENAI_API_KEY=sk-your-real-key-here
```

Get a key at [platform.openai.com](https://platform.openai.com/api-keys).
