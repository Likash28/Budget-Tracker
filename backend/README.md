# Budget Tracker FastAPI Backend

A FastAPI + SQLAlchemy + PostgreSQL backend for the budget tracking application.

## Features

- **Authentication**: JWT-based auth with bcrypt password hashing
- **Transactions**: CRUD operations with filtering by date, category, type
- **Budgets**: Monthly budget tracking with usage reports
- **Groups**: Shared expense tracking with automatic balance calculations
- **Reports**: Income/expense summaries with category breakdowns
- **Settlements**: Minimal settlement suggestions for group expenses

## Quick Start

### 1. Database Setup

```bash
# Create PostgreSQL database
psql -U postgres
CREATE DATABASE budget_tracker;
CREATE USER budget_user WITH PASSWORD 'strong_password';
GRANT ALL PRIVILEGES ON DATABASE budget_tracker TO budget_user;
```

### 2. Backend Setup

```bash
cd backend

# Copy environment file
cp env.example .env
# Edit .env with your database credentials and JWT secret

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Seed demo data (creates tables + sample data)
python scripts/seed.py

# Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend Setup

```bash
cd ../frontend

# Copy environment file
cp .env.example .env
# Edit .env: VITE_API_URL=http://localhost:8000

# Install and start
npm install
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Transactions
- `GET /api/transactions` - Get transactions (with filters)
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/{id}` - Update transaction
- `DELETE /api/transactions/{id}` - Delete transaction

### Budgets
- `GET /api/budgets` - Get budgets
- `POST /api/budgets` - Create/update budget
- `GET /api/budgets/usage/{month}` - Get budget usage

### Reports
- `GET /api/reports/summary` - Get summary report

### Groups
- `GET /api/groups` - Get user's groups
- `POST /api/groups` - Create group
- `GET /api/groups/{id}/members` - Get group members
- `POST /api/groups/{id}/expenses` - Add group expense
- `GET /api/groups/{id}/balances` - Get group balances
- `POST /api/groups/{id}/settlements` - Create settlement

## Demo Data

The seed script creates:
- 3 demo users (alice@budget.test, bob@budget.test, carol@budget.test)
- Sample transactions for the last 3 months
- Sample budgets and group expenses
- Password for all demo users: `demo1234`

## Environment Variables

### Backend (.env)
```
DATABASE_URL= "YOURs"
JWT_SECRET=your_long_random_secret_key
JWT_EXPIRE_DAYS=YOURs
API_PORT=YOURs
DEBUG=YOURs
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000
```

## Generate JWT Secret

```bash
python -c "import secrets; print(secrets.token_urlsafe(64))"
```
