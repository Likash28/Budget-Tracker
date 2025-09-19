from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from .routers import auth, transactions, budgets, reports, groups, dashboard
from .db import engine, Base

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Budget Tracker API",
    description="FastAPI backend for budget tracking application",
    version="1.0.0"
)

# CORS middleware - Updated for Railway deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Add your frontend ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Health check endpoint
@app.get("/api/health")
async def health_check():
    return {"ok": True}

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(transactions.router, prefix="/api/transactions", tags=["transactions"])
app.include_router(budgets.router, prefix="/api/budgets", tags=["budgets"])
app.include_router(reports.router, prefix="/api/reports", tags=["reports"])
app.include_router(groups.router, prefix="/api/groups", tags=["groups"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)