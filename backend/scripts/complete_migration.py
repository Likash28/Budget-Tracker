#!/usr/bin/env python3
"""
Complete data migration script: SQLite -> Supabase PostgreSQL
Exports data from SQLite, converts for PostgreSQL, and imports to Supabase
"""

import os
import sys
import sqlite3
import json
from pathlib import Path
from datetime import datetime
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Add the parent directory to the path so we can import from app
sys.path.append(str(Path(__file__).parent.parent))

from app.db import Base
from app.models import *
from app.config import settings

class DataMigrator:
    def __init__(self):
        self.sqlite_path = "budget_tracker.db"
        self.supabase_engine = None
        self.supabase_session = None
        
    def connect_to_supabase(self):
        """Connect to Supabase database"""
        try:
            print("🔌 Connecting to Supabase...")
            self.supabase_engine = create_engine(settings.DATABASE_URL)
            SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.supabase_engine)
            self.supabase_session = SessionLocal()
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
    
    def create_supabase_tables(self):
        """Create all tables in Supabase"""
        try:
            print("🏗️ Creating tables in Supabase...")
            Base.metadata.create_all(bind=self.supabase_engine)
            print("✅ Tables created successfully!")
            return True
        except Exception as e:
            print(f"❌ Failed to create tables: {e}")
            return False
    
    def clear_supabase_tables(self):
        """Clear all existing data from Supabase tables"""
        try:
            print("🧹 Clearing existing data from Supabase...")
            
            # Clear tables in reverse dependency order
            tables_to_clear = [
                'settlements', 'group_expenses', 'group_members', 
                'groups', 'budgets', 'transactions', 'users'
            ]
            
            for table in tables_to_clear:
                self.supabase_session.execute(text(f"DELETE FROM {table}"))
                print(f"  🗑️ Cleared {table}")
            
            self.supabase_session.commit()
            print("✅ All tables cleared successfully!")
            return True
            
        except Exception as e:
            print(f"❌ Failed to clear tables: {e}")
            self.supabase_session.rollback()
            return False
    
    def import_to_supabase(self, data):
        """Import data to Supabase with proper data type conversion"""
        print("📥 Importing data to Supabase...")
        
        try:
            # Import users first (no dependencies)
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
        """Verify that data was migrated correctly"""
        print("🔍 Verifying migration...")
        
        try:
            # Check table counts
            tables = ['users', 'transactions', 'budgets', 'groups', 'group_members', 'group_expenses', 'settlements']
            
            for table in tables:
                result = self.supabase_session.execute(text(f"SELECT COUNT(*) FROM {table}"))
                count = result.scalar()
                print(f"  📊 {table}: {count} records")
            
            print("✅ Migration verification completed!")
            return True
            
        except Exception as e:
            print(f"❌ Verification failed: {e}")
            return False
    
    def run_complete_migration(self):
        """Run the complete migration process"""
        print("🚀 Starting complete data migration: SQLite -> Supabase")
        print("=" * 60)
        
        # Step 1: Connect to Supabase
        if not self.connect_to_supabase():
            return False
        
        # Step 2: Export from SQLite
        data = self.export_from_sqlite()
        if not data:
            return False
        
        # Step 3: Create tables in Supabase
        if not self.create_supabase_tables():
            return False
        
        # Step 4: Clear existing data (if any)
        if not self.clear_supabase_tables():
            return False
        
        # Step 5: Import data to Supabase
        if not self.import_to_supabase(data):
            return False
        
        # Step 6: Verify migration
        if not self.verify_migration():
            return False
        
        print("=" * 60)
        print("🎉 Complete migration successful!")
        print("📝 Next steps:")
        print("1. Update your Netlify environment variables")
        print("2. Deploy your backend to a cloud service")
        print("3. Update your frontend API URL")
        
        return True

def main():
    migrator = DataMigrator()
    success = migrator.run_complete_migration()
    
    if not success:
        print("\n💥 Migration failed. Please check the errors above.")
        sys.exit(1)

if __name__ == "__main__":
    main()
