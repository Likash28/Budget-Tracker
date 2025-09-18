# Development Setup Guide

This guide shows you how to run both the frontend and backend with a single command.

## 🚀 Quick Start

### Option 1: Using Scripts (Recommended)

**For macOS/Linux:**
```bash
./start_dev.sh
```

**For Windows:**
```cmd
start_dev.bat
```

**Cross-platform (Python):**
```bash
python start_dev.py
```

### Option 2: Using npm/yarn

**First time setup:**
```bash
npm install
npm run setup
```

**Start both servers:**
```bash
npm start
```

### Option 3: Manual (Individual Servers)

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## 📋 Prerequisites

- **Python 3.8+** with pip
- **Node.js 18+** with npm
- **Git** (for cloning)

## 🌐 Access Points

Once both servers are running:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Interactive API**: http://localhost:8000/redoc

## 🛠️ Available Scripts

### Root Level Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start both frontend and backend |
| `npm run setup` | Install all dependencies |
| `npm run backend` | Start only backend |
| `npm run frontend` | Start only frontend |
| `npm run build` | Build frontend for production |

### Backend Scripts

| Command | Description |
|---------|-------------|
| `./backend/install.sh` | Install backend dependencies |
| `uvicorn app.main:app --reload` | Start backend server |

### Frontend Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

## 🔧 Troubleshooting

### Backend Issues

**Port 8000 already in use:**
```bash
# Kill process using port 8000
lsof -ti:8000 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :8000   # Windows
```

**Python virtual environment issues:**
```bash
# Remove and recreate venv
rm -rf backend/venv
python -m venv backend/venv
source backend/venv/bin/activate
pip install -r backend/requirements.txt
```

### Frontend Issues

**Port 5173 already in use:**
```bash
# Kill process using port 5173
lsof -ti:5173 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :5173   # Windows
```

**Node modules issues:**
```bash
# Clear cache and reinstall
rm -rf frontend/node_modules frontend/package-lock.json
cd frontend && npm install
```

## 📁 Project Structure

```
budget-tracker-fastapi/
├── backend/                 # FastAPI backend
│   ├── app/                # Application code
│   ├── requirements.txt    # Python dependencies
│   └── venv/              # Virtual environment
├── frontend/               # React frontend
│   ├── src/               # Source code
│   └── package.json       # Node dependencies
├── start_dev.sh           # Linux/macOS start script
├── start_dev.bat          # Windows start script
├── start_dev.py           # Cross-platform Python script
└── package.json           # Root package.json with scripts
```

## 🎯 Development Workflow

1. **Start development environment:**
   ```bash
   ./start_dev.sh  # or npm start
   ```

2. **Make changes** to frontend or backend code

3. **Hot reload** will automatically restart servers

4. **Test your changes** in the browser

5. **Stop servers** with `Ctrl+C`

## 🚀 Production Deployment

- **Frontend**: Deploy to Netlify
- **Backend**: Deploy to Railway/Render/Heroku
- **Database**: Supabase PostgreSQL

See `DEPLOYMENT_GUIDE.md` for detailed deployment instructions.
