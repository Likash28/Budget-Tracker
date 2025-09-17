#!/usr/bin/env python3
"""
Final Supabase Migration - Independent script
"""

import os
import sys
import sqlite3
import json
from pathlib import Path
from datetime import datetime
from sqlalchemy import create_engine, text, Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.sql import func

# Supabase Configuration
SUPABASE_URL = "https://lhkchljnupsdabtryxne.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxoa2NobGpudXBzZGFidHJ5eG5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMzg3MTAsImV4cCI6MjA3MzYxNDcxMH0.dWbajxuKyKHxnsKRpW2Yf5iCIIozMsu9O0iLXZ_GS4U"
DATABASE_URL = "postgresql://postgres.lhkchljnupsdabtryxne:Likash%40123@aws-0-us-west-1.pooler.supabase.com:5432/postgres"

# Create Base for Supabase
Base = declarative_base()

# Define models exactly as in your SQLite schema
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

class FinalMigrator:
    def __init__(self):
        self.sqlite_path = "budget_tracker.db"
        self.supabase_engine = None
        self.supabase_session = None
        
    def connect_to_supabase(self):
        """Connect to Supabase database"""
        try:
            print("🔌 Connecting to Supabase...")
            print(f"📊 Project URL: {SUPABASE_URL}")
            print(f"🔑 Database URL: {DATABASE_URL}")
            
            self.supabase_engine = create_engine(DATABASE_URL)
            SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.supabase_engine)
            self.supabase_session = SessionLocal()
            
            # Test connection
            with self.supabase_engine.connect() as conn:
                result = conn.execute(text("SELECT 1"))
                print("✅ Connected to Supabase successfully!")
                return True
                
        except Exception as e:
            print(f"❌ Failed to connect to Supabase: {e}")
            return False
    
    def export_from_sqlite(self):
        """Export all data from SQLite database"""
        print("📤 Exporting data from SQLite...")
        
        if not os.path.exists(self.sqlite_path):
            print(f"❌ SQLite database not found: {self.sqlite_path}")
            return None
        
        try:
            conn = sqlite3.connect(self.sqlite_path)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            # Export all tables
            tables = ['users', 'transactions', 'budgets', 'groups', 'group_members', 'group_expenses', 'settlements']
            exported_data = {}
            
            for table in tables:
                cursor.execute(f"SELECT * FROM {table}")
                rows = cursor.fetchall()
                exported_data[table] = [dict(row) for row in rows]
                print(f"  📊 Exported {len(rows)} records from {table}")
            
            conn.close()
            print("✅ SQLite export completed!")
            return exported_data
            
        except Exception as e:
            print(f"❌ SQLite export failed: {e}")
            return None
    
    def create_supabase_schema(self):
        """Create exact same schema in Supabase"""
        try:
            print("🏗️ Creating Supabase schema...")
            
            # Drop existing tables if they exist
            print("  🗑️ Dropping existing tables...")
            tables_to_drop = [
                'settlements', 'group_expenses', 'group_members', 
                'groups', 'budgets', 'transactions', 'users'
            ]
            
            for table in tables_to_drop:
                try:
                    self.supabase_session.execute(text(f"DROP TABLE IF EXISTS {table} CASCADE"))
                except:
                    pass  # Table might not exist
            
            self.supabase_session.commit()
            
            # Create all tables
            print("  🏗️ Creating new tables...")
            Base.metadata.create_all(bind=self.supabase_engine)
            
            print("✅ Supabase schema created successfully!")
            return True
            
        except Exception as e:
            print(f"❌ Failed to create schema: {e}")
            return False
    
    def import_data_to_supabase(self, data):
        """Import all data to Supabase"""
        print("📥 Importing data to Supabase...")
        
        try:
            # Import users first
            if 'users' in data and data['users']:
                print("  👥 Importing users...")
                for user_data in data['users']:
                    user = User(
                        id=user_data['id'],
                        name=user_data['name'],
                        email=user_data['email'],
                        password_hash=user_data['password_hash'],
                        created_at=datetime.fromisoformat(user_data['created_at'].replace('Z', '+00:00')) if user_data['created_at'] else datetime.now()
                    )
                    self.supabase_session.add(user)
                self.supabase_session.commit()
                print(f"    ✅ Imported {len(data['users'])} users")
            
            # Import transactions
            if 'transactions' in data and data['transactions']:
                print("  💰 Importing transactions...")
                for trans_data in data['transactions']:
                    transaction = Transaction(
                        id=trans_data['id'],
                        user_id=trans_data['user_id'],
                        amount=float(trans_data['amount']),
                        description=trans_data['description'],
                        category=trans_data['category'],
                        type=trans_data['type'],
                        date=datetime.fromisoformat(trans_data['date'].replace('Z', '+00:00')) if trans_data['date'] else datetime.now(),
                        created_at=datetime.fromisoformat(trans_data['created_at'].replace('Z', '+00:00')) if trans_data['created_at'] else datetime.now()
                    )
                    self.supabase_session.add(transaction)
                self.supabase_session.commit()
                print(f"    ✅ Imported {len(data['transactions'])} transactions")
            
            # Import budgets
            if 'budgets' in data and data['budgets']:
                print("  📊 Importing budgets...")
                for budget_data in data['budgets']:
                    budget = Budget(
                        id=budget_data['id'],
                        user_id=budget_data['user_id'],
                        category=budget_data['category'],
                        limit=float(budget_data['limit']),
                        month=budget_data['month'],
                        created_at=datetime.fromisoformat(budget_data['created_at'].replace('Z', '+00:00')) if budget_data['created_at'] else datetime.now()
                    )
                    self.supabase_session.add(budget)
                self.supabase_session.commit()
                print(f"    ✅ Imported {len(data['budgets'])} budgets")
            
            # Import groups
            if 'groups' in data and data['groups']:
                print("  👥 Importing groups...")
                for group_data in data['groups']:
                    group = Group(
                        id=group_data['id'],
                        name=group_data['name'],
                        description=group_data.get('description'),
                        created_by=group_data['created_by'],
                        created_at=datetime.fromisoformat(group_data['created_at'].replace('Z', '+00:00')) if group_data['created_at'] else datetime.now()
                    )
                    self.supabase_session.add(group)
                self.supabase_session.commit()
                print(f"    ✅ Imported {len(data['groups'])} groups")
            
            # Import group members
            if 'group_members' in data and data['group_members']:
                print("  👥 Importing group members...")
                for member_data in data['group_members']:
                    member = GroupMember(
                        id=member_data['id'],
                        group_id=member_data['group_id'],
                        user_id=member_data['user_id'],
                        joined_at=datetime.fromisoformat(member_data['joined_at'].replace('Z', '+00:00')) if member_data['joined_at'] else datetime.now()
                    )
                    self.supabase_session.add(member)
                self.supabase_session.commit()
                print(f"    ✅ Imported {len(data['group_members'])} group members")
            
            # Import group expenses
            if 'group_expenses' in data and data['group_expenses']:
                print("  💸 Importing group expenses...")
                for expense_data in data['group_expenses']:
                    # Convert JSON string to dict if needed
                    splits = expense_data['splits']
                    if isinstance(splits, str):
                        splits = json.loads(splits)
                    
                    expense = GroupExpense(
                        id=expense_data['id'],
                        group_id=expense_data['group_id'],
                        paid_by_user_id=expense_data['paid_by_user_id'],
                        amount=float(expense_data['amount']),
                        description=expense_data['description'],
                        category=expense_data['category'],
                        date=datetime.fromisoformat(expense_data['date'].replace('Z', '+00:00')) if expense_data['date'] else datetime.now(),
                        splits=splits,
                        created_at=datetime.fromisoformat(expense_data['created_at'].replace('Z', '+00:00')) if expense_data['created_at'] else datetime.now()
                    )
                    self.supabase_session.add(expense)
                self.supabase_session.commit()
                print(f"    ✅ Imported {len(data['group_expenses'])} group expenses")
            
            # Import settlements
            if 'settlements' in data and data['settlements']:
                print("  🤝 Importing settlements...")
                for settlement_data in data['settlements']:
                    settlement = Settlement(
                        id=settlement_data['id'],
                        group_id=settlement_data['group_id'],
                        from_user_id=settlement_data['from_user_id'],
                        to_user_id=settlement_data['to_user_id'],
                        amount=float(settlement_data['amount']),
                        description=settlement_data.get('description'),
                        settled_at=datetime.fromisoformat(settlement_data['settled_at'].replace('Z', '+00:00')) if settlement_data['settled_at'] else datetime.now()
                    )
                    self.supabase_session.add(settlement)
                self.supabase_session.commit()
                print(f"    ✅ Imported {len(data['settlements'])} settlements")
            
            print("✅ Data import completed successfully!")
            return True
            
        except Exception as e:
            print(f"❌ Data import failed: {e}")
            self.supabase_session.rollback()
            return False
    
    def verify_migration(self):
        """Verify migration was successful"""
        print("🔍 Verifying migration...")
        
        try:
            tables = ['users', 'transactions', 'budgets', 'groups', 'group_members', 'group_expenses', 'settlements']
            total_records = 0
            
            for table in tables:
                result = self.supabase_session.execute(text(f"SELECT COUNT(*) FROM {table}"))
                count = result.scalar()
                total_records += count
                print(f"  📊 {table}: {count} records")
            
            print(f"✅ Total records migrated: {total_records}")
            print("✅ Migration verification completed!")
            return True
            
        except Exception as e:
            print(f"❌ Verification failed: {e}")
            return False
    
    def run_complete_migration(self):
        """Run the complete migration process"""
        print("🚀 Starting Final Supabase Migration")
        print("=" * 60)
        print(f"📊 Supabase URL: {SUPABASE_URL}")
        print(f"🔑 Database: {DATABASE_URL}")
        print("=" * 60)
        
        # Step 1: Connect to Supabase
        if not self.connect_to_supabase():
            return False
        
        # Step 2: Export from SQLite
        data = self.export_from_sqlite()
        if not data:
            return False
        
        # Step 3: Create Supabase schema
        if not self.create_supabase_schema():
            return False
        
        # Step 4: Import data
        if not self.import_data_to_supabase(data):
            return False
        
        # Step 5: Verify migration
        if not self.verify_migration():
            return False
        
        print("=" * 60)
        print("🎉 Final Supabase Migration Successful!")
        print("📝 Next steps:")
        print("1. Update your Netlify environment variables")
        print("2. Deploy your backend to Railway/Render")
        print("3. Update your frontend API URL")
        print("4. Test your application with Supabase")
        
        return True

def main():
    migrator = FinalMigrator()
    success = migrator.run_complete_migration()
    
    if not success:
        print("\n💥 Migration failed. Please check the errors above.")
        sys.exit(1)

if __name__ == "__main__":
    main()
