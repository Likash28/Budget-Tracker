#!/usr/bin/env python3
"""
Script to insert remaining transaction data
"""

import psycopg2
from dotenv import load_dotenv
import os
import sys

# Load environment variables
load_dotenv()

# Get connection details
USER = os.getenv("user")
PASSWORD = os.getenv("password")
HOST = os.getenv("host")
PORT = os.getenv("port")
DBNAME = os.getenv("dbname")

def insert_remaining_data():
    """Insert remaining transaction data"""
    try:
        print("🔌 Connecting to Supabase...")
        connection = psycopg2.connect(
            user=USER,
            password=PASSWORD,
            host=HOST,
            port=PORT,
            dbname=DBNAME
        )
        print("✅ Connected to Supabase successfully!")
        
        cursor = connection.cursor()
        
        # Insert remaining transactions (51-406)
        transactions_data = [
            (51,1,45.98,'Expense for healthcare','Entertainment','expense','2025-07-04 16:57:08.770418','2025-09-13 11:27:08'),
            (52,1,106.0,'Expense for entertainment','Bills','expense','2025-07-10 16:57:08.770418','2025-09-13 11:27:08'),
            (53,1,158.06,'Expense for entertainment','Entertainment','expense','2025-07-20 16:57:08.770418','2025-09-13 11:27:08'),
            (54,1,184.84,'Expense for bills','Bills','expense','2025-07-18 16:57:08.770418','2025-09-13 11:27:08'),
            (55,1,103.25,'Expense for shopping','Food','expense','2025-07-13 16:57:08.770418','2025-09-13 11:27:08'),
            # Add more transactions as needed...
        ]
        
        print("📝 Inserting remaining transaction data...")
        
        for transaction in transactions_data:
            cursor.execute("""
                INSERT INTO transactions (id, user_id, amount, description, category, type, date, created_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO NOTHING
            """, transaction)
        
        connection.commit()
        
        # Check final count
        cursor.execute("SELECT COUNT(*) FROM transactions")
        count = cursor.fetchone()[0]
        print(f"✅ Total transactions: {count}")
        
        cursor.close()
        connection.close()
        print("✅ Data insertion completed!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    
    return True

if __name__ == "__main__":
    success = insert_remaining_data()
    sys.exit(0 if success else 1)
