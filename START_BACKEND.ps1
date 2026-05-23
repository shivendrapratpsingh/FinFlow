cd C:\PROJECTS\finflow\backend
.\venv\Scripts\Activate.ps1
Copy-Item "..\\.env" ".env" -Force -ErrorAction SilentlyContinue
uvicorn app.main:app --reload --host 127.0.0.1 --port 8080
