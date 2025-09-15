from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from datetime import datetime
from typing import Optional
from ..db import get_db
from ..models import Transaction, User
from ..schemas import TransactionCreate, TransactionUpdate, TransactionResponse
from ..auth import verify_token

router = APIRouter()
security = HTTPBearer()

def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> int:
    """Extract user ID from JWT token"""
    token = credentials.credentials
    payload = verify_token(token)
    return int(payload["sub"])

@router.get("/", response_model=list[TransactionResponse])
async def get_transactions(
    start: Optional[str] = Query(None, description="Start date (ISO format)"),
    end: Optional[str] = Query(None, description="End date (ISO format)"),
    category: Optional[str] = Query(None, description="Filter by category"),
    type: Optional[str] = Query(None, description="Filter by type (income/expense)"),
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """Get transactions with optional filters"""
    query = db.query(Transaction).filter(Transaction.user_id == current_user_id)
    
    # Apply filters
    if start:
        start_date = datetime.fromisoformat(start.replace('Z', '+00:00'))
        query = query.filter(Transaction.date >= start_date)
    
    if end:
        end_date = datetime.fromisoformat(end.replace('Z', '+00:00'))
        query = query.filter(Transaction.date <= end_date)
    
    if category:
        query = query.filter(Transaction.category == category)
    
    if type:
        query = query.filter(Transaction.type == type)
    
    transactions = query.order_by(Transaction.date.desc()).all()
    return transactions

@router.post("/", response_model=TransactionResponse)
async def create_transaction(
    transaction_data: TransactionCreate,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """Create a new transaction"""
    db_transaction = Transaction(
        user_id=current_user_id,
        **transaction_data.dict()
    )
    
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    
    return db_transaction

@router.put("/{transaction_id}", response_model=TransactionResponse)
async def update_transaction(
    transaction_id: int,
    transaction_data: TransactionUpdate,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """Update a transaction"""
    db_transaction = db.query(Transaction).filter(
        and_(Transaction.id == transaction_id, Transaction.user_id == current_user_id)
    ).first()
    
    if not db_transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    # Update only provided fields
    update_data = transaction_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_transaction, field, value)
    
    db.commit()
    db.refresh(db_transaction)
    
    return db_transaction

@router.delete("/{transaction_id}")
async def delete_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """Delete a transaction"""
    db_transaction = db.query(Transaction).filter(
        and_(Transaction.id == transaction_id, Transaction.user_id == current_user_id)
    ).first()
    
    if not db_transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    db.delete(db_transaction)
    db.commit()
    
    return {"message": "Transaction deleted successfully"}
