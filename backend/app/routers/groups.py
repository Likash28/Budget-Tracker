from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy import and_
from ..db import get_db
from ..models import Group, GroupMember, GroupExpense, Settlement, User
from ..schemas import (
    GroupCreate, GroupResponse, GroupMemberResponse, GroupExpenseCreate, 
    GroupExpenseResponse, SettlementCreate, SettlementResponse, GroupBalancesResponse
)
from ..auth import verify_token
from ..utils.balance import calculate_group_balances

router = APIRouter()
security = HTTPBearer()

def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> int:
    """Extract user ID from JWT token"""
    token = credentials.credentials
    payload = verify_token(token)
    return int(payload["sub"])

@router.get("/", response_model=list[GroupResponse])
async def get_groups(
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """Get all groups the user is a member of"""
    groups = db.query(Group).join(GroupMember).filter(
        GroupMember.user_id == current_user_id
    ).all()
    return groups

@router.post("/", response_model=GroupResponse)
async def create_group(
    group_data: GroupCreate,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """Create a new group"""
    db_group = Group(
        created_by=current_user_id,
        **group_data.dict()
    )
    db.add(db_group)
    db.commit()
    db.refresh(db_group)
    
    # Add creator as a member
    db_member = GroupMember(
        group_id=db_group.id,
        user_id=current_user_id
    )
    db.add(db_member)
    db.commit()
    
    return db_group

@router.get("/{group_id}/members", response_model=list[GroupMemberResponse])
async def get_group_members(
    group_id: int,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """Get all members of a group"""
    # Check if user is a member of the group
    membership = db.query(GroupMember).filter(
        and_(GroupMember.group_id == group_id, GroupMember.user_id == current_user_id)
    ).first()
    
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not a member of this group"
        )
    
    members = db.query(GroupMember).filter(GroupMember.group_id == group_id).all()
    return members

@router.post("/{group_id}/expenses", response_model=GroupExpenseResponse)
async def create_group_expense(
    group_id: int,
    expense_data: GroupExpenseCreate,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """Create a new group expense"""
    # Check if user is a member of the group
    membership = db.query(GroupMember).filter(
        and_(GroupMember.group_id == group_id, GroupMember.user_id == current_user_id)
    ).first()
    
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not a member of this group"
        )
    
    db_expense = GroupExpense(
        group_id=group_id,
        paid_by_user_id=current_user_id,
        **expense_data.dict()
    )
    
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    
    return db_expense

@router.get("/{group_id}/balances", response_model=GroupBalancesResponse)
async def get_group_balances(
    group_id: int,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """Get group balances and settlement suggestions"""
    # Check if user is a member of the group
    membership = db.query(GroupMember).filter(
        and_(GroupMember.group_id == group_id, GroupMember.user_id == current_user_id)
    ).first()
    
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not a member of this group"
        )
    
    # Get all group members
    members = db.query(User).join(GroupMember).filter(
        GroupMember.group_id == group_id
    ).all()
    
    # Get all group expenses
    expenses = db.query(GroupExpense).filter(GroupExpense.group_id == group_id).all()
    
    # Convert to dict format for balance calculation
    users_data = [{"id": user.id, "name": user.name} for user in members]
    expenses_data = [
        {
            "paid_by_user_id": expense.paid_by_user_id,
            "amount": expense.amount,
            "splits": expense.splits
        }
        for expense in expenses
    ]
    
    # Calculate balances and settlements
    balances, settlements = calculate_group_balances(expenses_data, users_data)
    
    return GroupBalancesResponse(
        balances=balances,
        settlements=settlements
    )

@router.post("/{group_id}/settlements", response_model=SettlementResponse)
async def create_settlement(
    group_id: int,
    settlement_data: SettlementCreate,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """Create a settlement between users"""
    # Check if user is a member of the group
    membership = db.query(GroupMember).filter(
        and_(GroupMember.group_id == group_id, GroupMember.user_id == current_user_id)
    ).first()
    
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not a member of this group"
        )
    
    # Verify both users are members of the group
    from_membership = db.query(GroupMember).filter(
        and_(GroupMember.group_id == group_id, GroupMember.user_id == settlement_data.from_user_id)
    ).first()
    
    to_membership = db.query(GroupMember).filter(
        and_(GroupMember.group_id == group_id, GroupMember.user_id == settlement_data.to_user_id)
    ).first()
    
    if not from_membership or not to_membership:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Both users must be members of the group"
        )
    
    db_settlement = Settlement(
        group_id=group_id,
        **settlement_data.dict()
    )
    
    db.add(db_settlement)
    db.commit()
    db.refresh(db_settlement)
    
    return db_settlement

@router.post("/{group_id}/members")
async def add_group_member(
    group_id: int,
    email: str,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """Add a member to a group by email"""
    # Check if current user is a member of the group
    membership = db.query(GroupMember).filter(
        and_(GroupMember.group_id == group_id, GroupMember.user_id == current_user_id)
    ).first()
    
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not a member of this group"
        )
    
    # Find user by email
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if user is already a member
    existing_member = db.query(GroupMember).filter(
        and_(GroupMember.group_id == group_id, GroupMember.user_id == user.id)
    ).first()
    
    if existing_member:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already a member of this group"
        )
    
    # Add user to group
    db_member = GroupMember(
        group_id=group_id,
        user_id=user.id
    )
    db.add(db_member)
    db.commit()
    db.refresh(db_member)
    
    return {"message": "User added to group successfully"}

@router.delete("/{group_id}/members/{user_id}")
async def remove_group_member(
    group_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """Remove a member from a group"""
    # Check if current user is a member of the group
    membership = db.query(GroupMember).filter(
        and_(GroupMember.group_id == group_id, GroupMember.user_id == current_user_id)
    ).first()
    
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not a member of this group"
        )
    
    # Find the member to remove
    member_to_remove = db.query(GroupMember).filter(
        and_(GroupMember.group_id == group_id, GroupMember.user_id == user_id)
    ).first()
    
    if not member_to_remove:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User is not a member of this group"
        )
    
    # Remove member
    db.delete(member_to_remove)
    db.commit()
    
    return {"message": "User removed from group successfully"}
