from fastapi import APIRouter, Depends, Query, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime, timedelta
from typing import Optional, List
from ..db import get_db
from ..models import Transaction
from ..schemas import ReportSummaryResponse, CategorySummary, TrendReportResponse
from ..auth import verify_token

router = APIRouter()
security = HTTPBearer()

def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> int:
    """Extract user ID from JWT token"""
    token = credentials.credentials
    payload = verify_token(token)
    return int(payload["sub"])

@router.get("/summary", response_model=ReportSummaryResponse)
async def get_summary_report(
    month: Optional[str] = Query(None, description="Month in YYYY-MM format"),
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """Get summary report for income, expenses, and savings"""
    # Build date filter
    date_filter = Transaction.user_id == current_user_id
    if month:
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
    
    # Get category breakdown for expenses
    category_results = db.query(
        Transaction.category,
        func.sum(Transaction.amount).label('total')
    ).filter(
        and_(date_filter, Transaction.type == "expense")
    ).group_by(Transaction.category).all()
    
    categories = [
        CategorySummary(category=row.category, total=row.total)
        for row in category_results
    ]
    
    return ReportSummaryResponse(
        income=income,
        expense=expense,
        savings=savings,
        categories=categories
    )

@router.get("/trend", response_model=TrendReportResponse)
async def get_trend_report(
    months: int = Query(6, description="Number of months to include in trend"),
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """Get trend data for the specified number of months"""
    trend_data = []
    
    # Get current date and calculate start date
    current_date = datetime.now()
    start_date = current_date.replace(day=1) - timedelta(days=months * 30)
    
    # Generate data for each month
    for i in range(months):
        # Calculate month date
        month_date = start_date + timedelta(days=i * 30)
        month_str = month_date.strftime("%Y-%m")
        
        # Calculate start and end of month
        month_start = month_date.replace(day=1)
        if month_start.month == 12:
            month_end = month_start.replace(year=month_start.year + 1, month=1)
        else:
            month_end = month_start.replace(month=month_start.month + 1)
        
        # Calculate income for the month
        income_result = db.query(func.sum(Transaction.amount)).filter(
            and_(
                Transaction.user_id == current_user_id,
                Transaction.type == "income",
                Transaction.date >= month_start,
                Transaction.date < month_end
            )
        ).scalar()
        income = income_result or 0.0
        
        # Calculate expenses for the month
        expense_result = db.query(func.sum(Transaction.amount)).filter(
            and_(
                Transaction.user_id == current_user_id,
                Transaction.type == "expense",
                Transaction.date >= month_start,
                Transaction.date < month_end
            )
        ).scalar()
        expense = expense_result or 0.0
        
        # Calculate savings
        savings = income - expense
        
        trend_data.append({
            "month": month_str,
            "income": income,
            "expense": expense,
            "savings": savings
        })
    
    return TrendReportResponse(trend_data=trend_data)
