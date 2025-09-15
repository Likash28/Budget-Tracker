#!/usr/bin/env python3
"""
Seed script to populate the database with demo data.
Run this after setting up the database to create sample users and data.
"""

import sys
import os
from datetime import datetime, timedelta
import random

# Add the parent directory to the path so we can import from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db import SessionLocal, engine, Base
from app.models import User, Transaction, Budget, Group, GroupMember, GroupExpense
from app.auth import hash_password

def create_tables():
    """Create all tables"""
    Base.metadata.create_all(bind=engine)
    print("✅ Tables created successfully")

def seed_users():
    """Create demo users"""
    db = SessionLocal()
    
    # Demo users
    users_data = [
        {"name": "Alice Johnson", "email": "alice@example.com", "password": "demo1234"},
        {"name": "Bob Smith", "email": "bob@example.com", "password": "demo1234"},
        {"name": "Carol Davis", "email": "carol@example.com", "password": "demo1234"},
    ]
    
    for user_data in users_data:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == user_data["email"]).first()
        if existing_user:
            print(f"⚠️  User {user_data['email']} already exists, skipping...")
            continue
        
        user = User(
            name=user_data["name"],
            email=user_data["email"],
            password_hash=hash_password(user_data["password"])
        )
        db.add(user)
    
    db.commit()
    print("✅ Demo users created")
    db.close()

def seed_transactions():
    """Create sample transactions"""
    db = SessionLocal()
    
    # Get users
    users = db.query(User).all()
    if not users:
        print("❌ No users found. Please run seed_users first.")
        return
    
    # Sample transaction data
    categories = ["Food", "Transportation", "Entertainment", "Shopping", "Bills", "Healthcare"]
    income_categories = ["Salary", "Freelance", "Investment", "Bonus"]
    
    # Create transactions for the last 3 months
    for user in users:
        for month_offset in range(3):
            month_start = datetime.now().replace(day=1) - timedelta(days=30 * month_offset)
            
            # Income transactions
            for _ in range(random.randint(2, 4)):
                transaction = Transaction(
                    user_id=user.id,
                    amount=round(random.uniform(500, 3000), 2),
                    description=f"{random.choice(income_categories)} income",
                    category=random.choice(income_categories),
                    type="income",
                    date=month_start + timedelta(days=random.randint(1, 28))
                )
                db.add(transaction)
            
            # Expense transactions
            for _ in range(random.randint(10, 25)):
                transaction = Transaction(
                    user_id=user.id,
                    amount=round(random.uniform(10, 200), 2),
                    description=f"Expense for {random.choice(categories).lower()}",
                    category=random.choice(categories),
                    type="expense",
                    date=month_start + timedelta(days=random.randint(1, 28))
                )
                db.add(transaction)
    
    db.commit()
    print("✅ Sample transactions created")
    db.close()

def seed_budgets():
    """Create sample budgets"""
    db = SessionLocal()
    
    users = db.query(User).all()
    categories = ["Food", "Transportation", "Entertainment", "Shopping", "Bills"]
    
    for user in users:
        for month_offset in range(3):
            month = (datetime.now() - timedelta(days=30 * month_offset)).strftime("%Y-%m")
            
            for category in random.sample(categories, random.randint(2, 4)):
                budget = Budget(
                    user_id=user.id,
                    category=category,
                    limit=round(random.uniform(200, 1000), 2),
                    month=month
                )
                db.add(budget)
    
    db.commit()
    print("✅ Sample budgets created")
    db.close()

def seed_groups():
    """Create sample groups and group expenses"""
    db = SessionLocal()
    
    users = db.query(User).all()
    if len(users) < 2:
        print("❌ Need at least 2 users to create groups")
        return
    
    # Create a group
    group = Group(
        name="Household Expenses",
        description="Shared expenses for our household",
        created_by=users[0].id
    )
    db.add(group)
    db.commit()
    db.refresh(group)
    
    # Add all users as members
    for user in users:
        member = GroupMember(
            group_id=group.id,
            user_id=user.id
        )
        db.add(member)
    
    # Create group expenses
    expense_descriptions = [
        "Grocery shopping at Whole Foods",
        "Electricity bill",
        "Internet bill",
        "Dinner at restaurant",
        "Uber ride to airport",
        "Movie tickets",
        "Cleaning supplies"
    ]
    
    for _ in range(10):
        paid_by = random.choice(users)
        amount = round(random.uniform(20, 150), 2)
        
        # Create equal splits for all members
        splits = [{"user_id": user.id, "weight": 1} for user in users]
        
        expense = GroupExpense(
            group_id=group.id,
            paid_by_user_id=paid_by.id,
            amount=amount,
            description=random.choice(expense_descriptions),
            category=random.choice(["Food", "Bills", "Entertainment", "Transportation"]),
            date=datetime.now() - timedelta(days=random.randint(1, 30)),
            splits=splits
        )
        db.add(expense)
    
    db.commit()
    print("✅ Sample groups and group expenses created")
    db.close()

def main():
    """Run all seed functions"""
    print("🌱 Starting database seeding...")
    
    try:
        create_tables()
        seed_users()
        seed_transactions()
        seed_budgets()
        seed_groups()
        
        print("\n🎉 Database seeding completed successfully!")
        print("\nDemo login credentials:")
        print("Email: alice@example.com")
        print("Password: demo1234")
        
    except Exception as e:
        print(f"❌ Error during seeding: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
