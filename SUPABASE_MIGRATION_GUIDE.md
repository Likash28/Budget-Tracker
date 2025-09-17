# Supabase Migration Guide

## Step 1: Get Your Database Password
1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to Settings > Database
4. Copy your database password

## Step 2: Update Environment Variables

### For Local Development:
Create a `.env` file in the `backend/` directory:

```env
DATABASE_URL=postgresql://postgres.vtjlpxotiwaeaqhttpwu:[YOUR_PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
JWT_EXPIRE_DAYS=7
API_PORT=8000
DEBUG=1
```

### For Netlify Deployment:
1. Go to your Netlify site dashboard
2. Go to Site settings > Environment variables
3. Add these variables:
   - `DATABASE_URL`: postgresql://postgres.vtjlpxotiwaeaqhttpwu:[YOUR_PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
   - `JWT_SECRET`: your_super_secret_jwt_key_here_make_it_long_and_random

## Step 3: Run Complete Migration
```bash
cd backend
python scripts/complete_migration.py
```

This script will:
- ✅ Export all data from SQLite
- ✅ Convert data types for PostgreSQL
- ✅ Create tables in Supabase
- ✅ Import all your existing data
- ✅ Verify the migration was successful

## Step 4: Deploy Backend
Since Netlify only hosts frontend, you need to deploy your FastAPI backend separately:

### Option A: Railway (Recommended - Free)
1. Go to railway.app
2. Connect your GitHub repo
3. Select the backend folder
4. Add environment variables
5. Deploy

### Option B: Render (Free)
1. Go to render.com
2. Create new Web Service
3. Connect your repo
4. Set build command: `pip install -r requirements.txt`
5. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add environment variables

## Step 5: Update Frontend API URL
Update your frontend to point to the deployed backend URL instead of localhost.

## Your Supabase Details:
- Project URL: https://vtjlpxotiwaeaqhttpwu.supabase.co
- API Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0amxweG90aXdhZWFxaHR0cHd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMDA1MjQsImV4cCI6MjA3MzU3NjUyNH0.C4FJdIDESHtPL272oYj9rXaQviGP6HD5GyceXsiSAe0
