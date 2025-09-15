from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, desc
from datetime import datetime, timedelta
from typing import Optional
from ..db import get_db
from ..models import Transaction
from ..schemas import TransactionResponse, DashboardOverviewResponse, TransactionCategoriesResponse
from ..auth import verify_token

router = APIRouter()
security = HTTPBearer()

def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> int:
    """Extract user ID from JWT token"""
    token = credentials.credentials
    payload = verify_token(token)
    return int(payload["sub"])

@router.get("/overview", response_model=DashboardOverviewResponse)
async def get_dashboard_overview(
    month: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """Get dashboard overview with monthly summary and recent transactions"""
    # Use current month if not specified
    if not month:
        month = datetime.now().strftime("%Y-%m")
    
    # Build date filter for the month
    start_date = datetime.strptime(f"{month}-01", "%Y-%m-%d")
    if month.endswith("-12"):
        end_date = datetime.strptime(f"{month[:4]}-12-31", "%Y-%m-%d")
    else:
        next_month = f"{int(month[5:7]) + 1:02d}"
        end_date = datetime.strptime(f"{month[:4]}-{next_month}-01", "%Y-%m-%d")
    
    date_filter = and_(
        Transaction.user_id == current_user_id,
        Transaction.date >= start_date,
        Transaction.date < end_date
    )
    
    # Calculate total income
    income_result = db.query(func.sum(Transaction.amount)).filter(
        and_(date_filter, Transaction.type == "income")
    ).scalar()
    income = income_result or 0.0
    
    # Calculate total expenses
    expense_result = db.query(func.sum(Transaction.amount)).filter(
        and_(date_filter, Transaction.type == "expense")
    ).scalar()
    expense = expense_result or 0.0
    
    # Calculate savings
    savings = income - expense
    
    # Get recent transactions (last 5)
    recent_transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user_id
    ).order_by(desc(Transaction.date)).limit(5).all()
    
    return DashboardOverviewResponse(
        month=month,
        income=income,
        expense=expense,
        savings=savings,
        recent_transactions=recent_transactions
    )

@router.get("/categories", response_model=TransactionCategoriesResponse)
async def get_transaction_categories():
    """Get predefined transaction categories"""
    return TransactionCategoriesResponse(
        income_categories=[
            "Salary",
            "Freelance",
            "Investment",
            "Bonus",
            "Rental Income",
            "Business Income",
            "Other Income"
        ],
        expense_categories=[
            "Food",
            "Transport",
            "Entertainment",
            "Shopping",
            "Health",
            "Education",
            "Travel",
            "Utilities",
            "Rent",
            "Insurance",
            "Other"
        ]
    )
