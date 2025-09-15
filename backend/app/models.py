from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .db import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    transactions = relationship("Transaction", back_populates="user")
    budgets = relationship("Budget", back_populates="user")
    group_memberships = relationship("GroupMember", back_populates="user")
    group_expenses = relationship("GroupExpense", back_populates="paid_by_user")

class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)
    description = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    type = Column(String(20), nullable=False)  # 'income' or 'expense'
    date = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="transactions")

class Budget(Base):
    __tablename__ = "budgets"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category = Column(String(100), nullable=False)
    limit = Column(Float, nullable=False)
    month = Column(String(7), nullable=False)  # YYYY-MM format
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="budgets")

class Group(Base):
    __tablename__ = "groups"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    members = relationship("GroupMember", back_populates="group")
    expenses = relationship("GroupExpense", back_populates="group")
    settlements = relationship("Settlement", back_populates="group")

class GroupMember(Base):
    __tablename__ = "group_members"
    
    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("groups.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    joined_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    group = relationship("Group", back_populates="members")
    user = relationship("User", back_populates="group_memberships")

class GroupExpense(Base):
    __tablename__ = "group_expenses"
    
    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("groups.id"), nullable=False)
    paid_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)
    description = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    date = Column(DateTime(timezone=True), nullable=False)
    splits = Column(JSON, nullable=False)  # [{"user_id": 1, "weight": 2}, ...]
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    group = relationship("Group", back_populates="expenses")
    paid_by_user = relationship("User", back_populates="group_expenses")

class Settlement(Base):
    __tablename__ = "settlements"
    
    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("groups.id"), nullable=False)
    from_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    to_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)
    description = Column(String(255))
    settled_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    group = relationship("Group", back_populates="settlements")
