# Budget Tracker - Deployment Guide

## Current Issue
Your frontend is deployed on Netlify but trying to connect to `localhost:8000` (your local backend), which is not accessible from the internet.

## Solution: Deploy Your Backend

### Option 1: Deploy to Railway (Recommended - Easiest)

1. **Go to [Railway.app](https://railway.app)**
2. **Sign up/Login** with GitHub
3. **Create New Project** → **Deploy from GitHub repo**
4. **Select your repository** and **backend folder**
5. **Railway will automatically detect** it's a Python/FastAPI app
6. **Add Environment Variables:**
   ```
   DATABASE_URL=postgresql://postgres.ykwlbhiplaunxocfqrgp:59RBNGNJlJqVdMgv@aws-1-ap-south-1.pooler.supabase.com:6543/postgres
   JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
   JWT_EXPIRE_DAYS=7
   API_PORT=8000
   DEBUG=1
   ```
7. **Deploy** - Railway will give you a URL like `https://your-app.railway.app`

### Option 2: Deploy to Render

1. **Go to [Render.com](https://render.com)**
2. **Sign up/Login** with GitHub
3. **Create New Web Service** → **Connect GitHub repo**
4. **Configure:**
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. **Add Environment Variables** (same as above)
6. **Deploy**

### Option 3: Deploy to Heroku

1. **Install Heroku CLI**
2. **Create `Procfile` in backend folder:**
   ```
   web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```
3. **Deploy:**
   ```bash
   cd backend
   heroku create your-app-name
   heroku config:set DATABASE_URL=your_database_url
   heroku config:set JWT_SECRET=your_jwt_secret
   git push heroku main
   ```

## After Backend Deployment

1. **Get your backend URL** (e.g., `https://your-app.railway.app`)
2. **Update `netlify.toml`:**
   ```toml
   VITE_API_URL = "https://your-backend-url.railway.app/api"
   ```
3. **Or set in Netlify Dashboard:**
   - Go to Site Settings → Environment Variables
   - Add `VITE_API_URL` with your backend URL
4. **Redeploy your frontend**

## Quick Fix for Testing

If you want to test immediately, you can temporarily use a CORS proxy:

```javascript
// In frontend/src/services/api.js - TEMPORARY ONLY
const API_BASE_URL = 'https://cors-anywhere.herokuapp.com/http://your-backend-url.railway.app/api'
```

**Note:** This is only for testing and not recommended for production.

## Environment Variables Summary

### Backend (Railway/Render/Heroku):
```
DATABASE_URL=postgresql://postgres.ykwlbhiplaunxocfqrgp:59RBNGNJlJqVdMgv@aws-1-ap-south-1.pooler.supabase.com:6543/postgres
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
JWT_EXPIRE_DAYS=7
API_PORT=8000
DEBUG=1
```

### Frontend (Netlify):
```
VITE_API_URL=https://your-backend-url.railway.app/api
```

## Next Steps

1. **Deploy your backend** using one of the options above
2. **Update the VITE_API_URL** in your Netlify environment variables
3. **Redeploy your frontend**
4. **Test the login functionality**

Your app should then work properly! 🚀
