from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from datetime import datetime
from ..db import get_db
from ..models import Budget, Transaction
from ..schemas import BudgetCreate, BudgetResponse, BudgetUsageResponse
from ..auth import verify_token

router = APIRouter()
security = HTTPBearer()

def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> int:
    """Extract user ID from JWT token"""
    token = credentials.credentials
    payload = verify_token(token)
    return int(payload["sub"])

@router.get("/", response_model=list[BudgetResponse])
async def get_budgets(
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """Get all budgets for the current user"""
    budgets = db.query(Budget).filter(Budget.user_id == current_user_id).all()
    return budgets

@router.post("/", response_model=BudgetResponse)
async def create_or_update_budget(
    budget_data: BudgetCreate,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """Create or update a budget for a category and month"""
    # Check if budget already exists for this category and month
    existing_budget = db.query(Budget).filter(
        and_(
            Budget.user_id == current_user_id,
            Budget.category == budget_data.category,
            Budget.month == budget_data.month
        )
    ).first()
    
    if existing_budget:
        # Update existing budget
        existing_budget.limit = budget_data.limit
        db.commit()
        db.refresh(existing_budget)
        return existing_budget
    else:
        # Create new budget
        db_budget = Budget(
            user_id=current_user_id,
            **budget_data.dict()
        )
        db.add(db_budget)
        db.commit()
        db.refresh(db_budget)
        return db_budget

@router.get("/usage/{month}", response_model=list[BudgetUsageResponse])
async def get_budget_usage(
    month: str,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """Get budget usage for a specific month"""
    # Get all budgets for the month
    budgets = db.query(Budget).filter(
        and_(Budget.user_id == current_user_id, Budget.month == month)
    ).all()
    
    # Calculate spent amounts for each budget category
    usage_data = []
    for budget in budgets:
        # Calculate total spent in this category for the month
        start_date = datetime.strptime(f"{month}-01", "%Y-%m-%d")
        if month.endswith("-12"):
            end_date = datetime.strptime(f"{month[:4]}-12-31", "%Y-%m-%d")
        else:
            next_month = f"{int(month[5:7]) + 1:02d}"
            end_date = datetime.strptime(f"{month[:4]}-{next_month}-01", "%Y-%m-%d")
        
        spent_result = db.query(func.sum(Transaction.amount)).filter(
            and_(
                Transaction.user_id == current_user_id,
                Transaction.category == budget.category,
                Transaction.type == "expense",
                Transaction.date >= start_date,
                Transaction.date < end_date
            )
        ).scalar()
        
        spent = spent_result or 0.0
        remaining = budget.limit - spent
        
        usage_data.append(BudgetUsageResponse(
            category=budget.category,
            limit=budget.limit,
            spent=spent,
            remaining=remaining
        ))
    
    return usage_data
