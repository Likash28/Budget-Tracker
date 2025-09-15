# Budget Tracker

A full-stack budget tracking application with **FastAPI + SQLAlchemy + PostgreSQL** backend and **React + Vite** frontend.

## 🚀 Features

- **Personal Finance Management**: Track income, expenses, and budgets
- **Group Expense Splitting**: Share expenses with friends and family
- **Smart Settlements**: Automatic balance calculations and settlement suggestions
- **Budget Tracking**: Monthly budget limits with usage reports
- **Financial Reports**: Income/expense summaries with category breakdowns
- **JWT Authentication**: Secure user authentication and authorization

## 🏗️ Project Structure

```
budget-tracker-fastapi/
├─ backend/
│  ├─ app/
│  │  ├─ main.py               # FastAPI app + routers + CORS
│  │  ├─ config.py             # env/secret loading
│  │  ├─ db.py                 # SQLAlchemy engine/session/Base
│  │  ├─ models.py             # Users, Transactions, Budgets, Groups, Expenses, Settlements
│  │  ├─ schemas.py            # Pydantic models (Pydantic v2)
│  │  ├─ auth.py               # bcrypt hashing + JWT (HS256)
│  │  ├─ utils/balance.py      # group balance + settlement suggestions
│  │  └─ routers/
│  │     ├─ auth.py            # /api/auth/register, /api/auth/login
│  │     ├─ transactions.py    # /api/transactions CRUD + filters
│  │     ├─ budgets.py         # /api/budgets + /usage/:month
│  │     ├─ reports.py         # /api/reports/summary
│  │     └─ groups.py          # groups + expenses + balances + settlements
│  ├─ scripts/seed.py          # seed demo users/data (creates tables)
│  ├─ requirements.txt
│  ├─ .env.example
│  ├─ README.md
│  └─ .gitignore
└─ frontend/                   # same React UI you've been using
   ├─ .env.example             # VITE_API_URL=http://localhost:8000
   ├─ vite.config.js, index.html
   └─ src/ (App.jsx, pages/, services/api.js, styles.css)
```

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- PostgreSQL 12+

### 1. Database Setup

```bash
# Create PostgreSQL database
psql -U postgres
CREATE DATABASE budget_tracker;
CREATE USER budget_user WITH PASSWORD 'strong_password';
GRANT ALL PRIVILEGES ON DATABASE budget_tracker TO budget_user;
\q
```

### 2. Backend (FastAPI)

```bash
cd backend
cp .env.example .env
# Edit .env with your database credentials and JWT secret

python -m venv .venv && source .venv/bin/activate   # (Windows: .venv\Scripts\activate)
pip install -r requirements.txt

# Seed demo data (will also create tables)
python scripts/seed.py

# Start API
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Health check:** `http://localhost:8000/api/health` → `{ "ok": true }`
**API Documentation:** `http://localhost:8000/docs`

### 3. Frontend (React)

```bash
cd ../frontend
cp .env.example .env   # VITE_API_URL=http://localhost:8000
npm install
npm run dev            # http://localhost:5173
```

## 🔑 Demo Login

**Demo login (seeded):** `alice@budget.test` / `demo1234`

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` → `{name,email,password}`
- `POST /api/auth/login` → `{email,password}` → `{ token }`

### Transactions (JWT)
- `GET /api/transactions?start=ISO&end=ISO&category=X&type=income|expense`
- `POST /api/transactions`
- `PUT /api/transactions/:id`
- `DELETE /api/transactions/:id`

### Budgets (JWT)
- `GET /api/budgets`
- `POST /api/budgets` (upsert)
- `GET /api/budgets/usage/:month` (spent vs limit)

### Reports (JWT)
- `GET /api/reports/summary?month=YYYY-MM` → `{ income, expense, savings, categories:[{_id, total}] }`

### Groups (JWT)
- `GET /api/groups`, `POST /api/groups`
- `POST /api/groups/:id/expenses`
- `GET /api/groups/:id/balances` → net + settlement suggestions
- `POST /api/groups/:id/settlements`

## 🔧 Configuration

### Backend `.env`

```
DATABASE_URL=postgresql+psycopg2://budget_user:strong_password@localhost:5432/budget_tracker
JWT_SECRET=change_me_to_a_long_random_string
JWT_EXPIRE_DAYS=7
API_PORT=8000
DEBUG=1
```

### Frontend `.env`

```
VITE_API_URL=http://localhost:8000
```

### Generate JWT Secret

```bash
python - << 'PY'
import secrets; print(secrets.token_urlsafe(64))
PY
```

## 🚀 Deployment

For cloud deploys (Render/Railway/Fly/etc.), set environment variables in the platform dashboard; point `VITE_API_URL` to your public backend URL.

## 📝 Notes

- Tables are created on startup (and by the seed script) via `Base.metadata.create_all`. When you need real migrations, plug in **Alembic**.
- Group ratio splits use a JSON column: `splits=[{ "user_id": 1, "weight": 2 }, ...]`.
- The balance engine computes per-user net and a minimal set of suggested settlements.
