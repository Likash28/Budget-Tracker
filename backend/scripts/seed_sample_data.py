#!/usr/bin/env python3
"""
Sample data seeder for Budget Tracker application.
This script creates sample users and data for testing the complete flow.
"""

import sys
import os
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

# Add the parent directory to the path so we can import from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db import get_db, engine
from app.models import User, Transaction, Budget, Group, GroupMember, GroupExpense
from app.auth import hash_password

def create_sample_users(db: Session):
    """Create sample users"""
    users_data = [
        {
            "name": "John Doe",
            "email": "john.doe@example.com",
            "password": "Password123!"
        },
        {
            "name": "Jane Smith", 
            "email": "jane.smith@example.com",
            "password": "Password123!"
        },
        {
            "name": "Mike Wilson",
            "email": "mike.wilson@example.com", 
            "password": "Password123!"
        }
    ]
    
    users = {}
    for user_data in users_data:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == user_data["email"]).first()
        if existing_user:
            users[user_data["email"]] = existing_user
            continue
            
        hashed_password = hash_password(user_data["password"])
        user = User(
            name=user_data["name"],
            email=user_data["email"],
            password_hash=hashed_password
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        users[user_data["email"]] = user
    
    return users

def create_sample_transactions(db: Session, users: dict):
    """Create sample transactions for John Doe"""
    john = users["john.doe@example.com"]
    current_date = datetime.now()
    
    # Income transactions
    income_transactions = [
        {
            "amount": 75000,
            "description": "Salary",
            "category": "Salary",
            "type": "income",
            "date": current_date.replace(day=1)
        },
        {
            "amount": 15000,
            "description": "Freelance Work",
            "category": "Freelance",
            "type": "income", 
            "date": current_date.replace(day=15)
        },
        {
            "amount": 2500,
            "description": "Investment Returns",
            "category": "Investment",
            "type": "income",
            "date": current_date.replace(day=20)
        },
        {
            "amount": 10000,
            "description": "Bonus",
            "category": "Bonus",
            "type": "income",
            "date": current_date.replace(day=25)
        }
    ]
    
    # Expense transactions
    expense_transactions = [
        {
            "amount": 2500,
            "description": "Grocery Shopping",
            "category": "Food",
            "type": "expense",
            "date": current_date
        },
        {
            "amount": 150,
            "description": "Uber Ride",
            "category": "Transport",
            "type": "expense",
            "date": current_date - timedelta(days=1)
        },
        {
            "amount": 799,
            "description": "Netflix Subscription",
            "category": "Entertainment",
            "type": "expense",
            "date": current_date - timedelta(days=3)
        },
        {
            "amount": 1200,
            "description": "Electricity Bill",
            "category": "Utilities",
            "type": "expense",
            "date": current_date - timedelta(days=7)
        },
        {
            "amount": 800,
            "description": "Gas Station",
            "category": "Transport",
            "type": "expense",
            "date": current_date - timedelta(days=7)
        },
        {
            "amount": 1500,
            "description": "Restaurant Dinner",
            "category": "Food",
            "type": "expense",
            "date": current_date - timedelta(days=14)
        },
        {
            "amount": 2000,
            "description": "Gym Membership",
            "category": "Health",
            "type": "expense",
            "date": current_date - timedelta(days=14)
        },
        {
            "amount": 3500,
            "description": "Online Shopping",
            "category": "Shopping",
            "type": "expense",
            "date": current_date - timedelta(days=21)
        },
        {
            "amount": 800,
            "description": "Doctor Visit",
            "category": "Health",
            "type": "expense",
            "date": current_date - timedelta(days=21)
        },
        {
            "amount": 600,
            "description": "Movie Tickets",
            "category": "Entertainment",
            "type": "expense",
            "date": current_date - timedelta(days=30)
        },
        {
            "amount": 500,
            "description": "Phone Bill",
            "category": "Utilities",
            "type": "expense",
            "date": current_date - timedelta(days=30)
        },
        {
            "amount": 300,
            "description": "Coffee Shop",
            "category": "Food",
            "type": "expense",
            "date": current_date - timedelta(days=30)
        }
    ]
    
    all_transactions = income_transactions + expense_transactions
    
    for transaction_data in all_transactions:
        # Check if transaction already exists
        existing = db.query(Transaction).filter(
            Transaction.user_id == john.id,
            Transaction.description == transaction_data["description"],
            Transaction.amount == transaction_data["amount"]
        ).first()
        
        if existing:
            continue
            
        transaction = Transaction(
            user_id=john.id,
            **transaction_data
        )
        db.add(transaction)
    
    db.commit()

def create_sample_budgets(db: Session, users: dict):
    """Create sample budgets for John Doe"""
    john = users["john.doe@example.com"]
    current_month = datetime.now().strftime("%Y-%m")
    
    budget_data = [
        {"category": "Food", "limit": 8000},
        {"category": "Transport", "limit": 5000},
        {"category": "Entertainment", "limit": 3000},
        {"category": "Shopping", "limit": 10000},
        {"category": "Health", "limit": 4000},
        {"category": "Utilities", "limit": 3000},
        {"category": "Education", "limit": 5000},
        {"category": "Travel", "limit": 15000},
        {"category": "Other", "limit": 2000}
    ]
    
    for budget_info in budget_data:
        # Check if budget already exists
        existing = db.query(Budget).filter(
            Budget.user_id == john.id,
            Budget.category == budget_info["category"],
            Budget.month == current_month
        ).first()
        
        if existing:
            continue
            
        budget = Budget(
            user_id=john.id,
            category=budget_info["category"],
            limit=budget_info["limit"],
            month=current_month
        )
        db.add(budget)
    
    db.commit()

def create_sample_groups(db: Session, users: dict):
    """Create sample groups"""
    john = users["john.doe@example.com"]
    jane = users["jane.smith@example.com"]
    mike = users["mike.wilson@example.com"]
    
    # Create groups
    groups_data = [
        {
            "name": "Family Expenses",
            "description": "Monthly family budget tracking"
        },
        {
            "name": "Office Lunch Group", 
            "description": "Shared lunch expenses with colleagues"
        },
        {
            "name": "Vacation Planning",
            "description": "Trip to Goa expenses"
        }
    ]
    
    groups = {}
    for group_data in groups_data:
        # Check if group already exists
        existing = db.query(Group).filter(Group.name == group_data["name"]).first()
        if existing:
            groups[group_data["name"]] = existing
            continue
            
        group = Group(
            name=group_data["name"],
            description=group_data["description"],
            created_by=john.id
        )
        db.add(group)
        db.commit()
        db.refresh(group)
        groups[group_data["name"]] = group
    
    # Add members to groups
    group_members = [
        ("Family Expenses", [john, jane]),
        ("Office Lunch Group", [john, mike]),
        ("Vacation Planning", [john, jane, mike])
    ]
    
    for group_name, members in group_members:
        group = groups[group_name]
        for user in members:
            # Check if member already exists
            existing = db.query(GroupMember).filter(
                GroupMember.group_id == group.id,
                GroupMember.user_id == user.id
            ).first()
            
            if existing:
                continue
                
            member = GroupMember(
                group_id=group.id,
                user_id=user.id
            )
            db.add(member)
    
    db.commit()
    return groups

def create_sample_group_expenses(db: Session, users: dict, groups: dict):
    """Create sample group expenses"""
    john = users["john.doe@example.com"]
    jane = users["jane.smith@example.com"]
    mike = users["mike.wilson@example.com"]
    
    group_expenses_data = [
        {
            "group_name": "Family Expenses",
            "amount": 2500,
            "description": "Grocery Shopping",
            "category": "Food",
            "date": datetime.now(),
            "paid_by": john,
            "splits": [
                {"user_id": john.id, "weight": 1},
                {"user_id": jane.id, "weight": 1}
            ]
        },
        {
            "group_name": "Family Expenses",
            "amount": 1200,
            "description": "Electricity Bill",
            "category": "Utilities",
            "date": datetime.now() - timedelta(days=7),
            "paid_by": john,
            "splits": [
                {"user_id": john.id, "weight": 1},
                {"user_id": jane.id, "weight": 1}
            ]
        },
        {
            "group_name": "Office Lunch Group",
            "amount": 800,
            "description": "Team Lunch",
            "category": "Food",
            "date": datetime.now() - timedelta(days=3),
            "paid_by": john,
            "splits": [
                {"user_id": john.id, "weight": 1},
                {"user_id": mike.id, "weight": 1}
            ]
        },
        {
            "group_name": "Office Lunch Group",
            "amount": 300,
            "description": "Coffee Break",
            "category": "Food",
            "date": datetime.now() - timedelta(days=5),
            "paid_by": mike,
            "splits": [
                {"user_id": john.id, "weight": 1},
                {"user_id": mike.id, "weight": 1}
            ]
        },
        {
            "group_name": "Vacation Planning",
            "amount": 15000,
            "description": "Hotel Booking",
            "category": "Travel",
            "date": datetime.now() - timedelta(days=10),
            "paid_by": john,
            "splits": [
                {"user_id": john.id, "weight": 1},
                {"user_id": jane.id, "weight": 1},
                {"user_id": mike.id, "weight": 1}
            ]
        },
        {
            "group_name": "Vacation Planning",
            "amount": 45000,
            "description": "Flight Tickets",
            "category": "Travel",
            "date": datetime.now() - timedelta(days=15),
            "paid_by": jane,
            "splits": [
                {"user_id": john.id, "weight": 1},
                {"user_id": jane.id, "weight": 1},
                {"user_id": mike.id, "weight": 1}
            ]
        }
    ]
    
    for expense_data in group_expenses_data:
        group = groups[expense_data["group_name"]]
        
        # Check if expense already exists
        existing = db.query(GroupExpense).filter(
            GroupExpense.group_id == group.id,
            GroupExpense.description == expense_data["description"],
            GroupExpense.amount == expense_data["amount"]
        ).first()
        
        if existing:
            continue
            
        expense = GroupExpense(
            group_id=group.id,
            paid_by_user_id=expense_data["paid_by"].id,
            amount=expense_data["amount"],
            description=expense_data["description"],
            category=expense_data["category"],
            date=expense_data["date"],
            splits=expense_data["splits"]
        )
        db.add(expense)
    
    db.commit()

def main():
    """Main function to seed all sample data"""
    print("🌱 Starting to seed sample data...")
    
    # Get database session
    db = next(get_db())
    
    try:
        # Create users
        print("👥 Creating sample users...")
        users = create_sample_users(db)
        print(f"✅ Created {len(users)} users")
        
        # Create transactions
        print("💰 Creating sample transactions...")
        create_sample_transactions(db, users)
        print("✅ Created sample transactions")
        
        # Create budgets
        print("📊 Creating sample budgets...")
        create_sample_budgets(db, users)
        print("✅ Created sample budgets")
        
        # Create groups
        print("👥 Creating sample groups...")
        groups = create_sample_groups(db, users)
        print(f"✅ Created {len(groups)} groups")
        
        # Create group expenses
        print("💸 Creating sample group expenses...")
        create_sample_group_expenses(db, users, groups)
        print("✅ Created sample group expenses")
        
        print("\n🎉 Sample data seeding completed successfully!")
        print("\n📋 Sample Users Created:")
        for email, user in users.items():
            print(f"  - {user.name} ({email})")
        
        print("\n🔑 Login Credentials:")
        print("  Email: john.doe@example.com")
        print("  Password: Password123!")
        print("\n  Email: jane.smith@example.com") 
        print("  Password: Password123!")
        print("\n  Email: mike.wilson@example.com")
        print("  Password: Password123!")
        
    except Exception as e:
        print(f"❌ Error seeding data: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    main()
