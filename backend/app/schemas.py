from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import List, Optional, Dict, Any

# User schemas
class UserBase(BaseModel):
    name: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Auth schemas
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    token: str
    user: UserResponse

# Transaction schemas
class TransactionBase(BaseModel):
    amount: float
    description: str
    category: str
    type: str  # 'income' or 'expense'
    date: datetime

class TransactionCreate(TransactionBase):
    pass

class TransactionUpdate(BaseModel):
    amount: Optional[float] = None
    description: Optional[str] = None
    category: Optional[str] = None
    type: Optional[str] = None
    date: Optional[datetime] = None

class TransactionResponse(TransactionBase):
    id: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Budget schemas
class BudgetBase(BaseModel):
    category: str
    limit: float
    month: str  # YYYY-MM format

class BudgetCreate(BudgetBase):
    pass

class BudgetResponse(BudgetBase):
    id: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class BudgetUsageResponse(BaseModel):
    category: str
    limit: float
    spent: float
    remaining: float

# Group schemas
class GroupBase(BaseModel):
    name: str
    description: Optional[str] = None

class GroupCreate(GroupBase):
    pass

class GroupResponse(GroupBase):
    id: int
    created_by: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class GroupMemberResponse(BaseModel):
    id: int
    user: UserResponse
    
    class Config:
        from_attributes = True

# Group Expense schemas
class GroupExpenseBase(BaseModel):
    amount: float
    description: str
    category: str
    date: datetime
    splits: List[Dict[str, Any]]  # [{"user_id": 1, "weight": 2}, ...]

class GroupExpenseCreate(GroupExpenseBase):
    pass

class GroupExpenseResponse(GroupExpenseBase):
    id: int
    group_id: int
    paid_by_user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Settlement schemas
class SettlementBase(BaseModel):
    from_user_id: int
    to_user_id: int
    amount: float
    description: Optional[str] = None

class SettlementCreate(SettlementBase):
    pass

class SettlementResponse(SettlementBase):
    id: int
    group_id: int
    settled_at: datetime
    
    class Config:
        from_attributes = True

# Balance schemas
class UserBalance(BaseModel):
    user_id: int
    user_name: str
    balance: float

class SettlementSuggestion(BaseModel):
    from_user_id: int
    to_user_id: int
    amount: float

class GroupBalancesResponse(BaseModel):
    balances: List[UserBalance]
    settlements: List[SettlementSuggestion]

# Report schemas
class CategorySummary(BaseModel):
    category: str
    total: float

class ReportSummaryResponse(BaseModel):
    income: float
    expense: float
    savings: float
    categories: List[CategorySummary]

# Dashboard schemas
class DashboardOverviewResponse(BaseModel):
    month: str
    income: float
    expense: float
    savings: float
    recent_transactions: List[TransactionResponse]

class TransactionCategoriesResponse(BaseModel):
    income_categories: List[str]
    expense_categories: List[str]

# Trend schemas
class TrendDataPoint(BaseModel):
    month: str
    income: float
    expense: float
    savings: float

class TrendReportResponse(BaseModel):
    trend_data: List[TrendDataPoint]
