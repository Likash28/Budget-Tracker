#!/usr/bin/env python3
"""
Script to create database tables and insert sample data into Supabase
"""

import psycopg2
from dotenv import load_dotenv
import os
import sys
from pathlib import Path

# Load environment variables
load_dotenv()

# Get connection details
USER = os.getenv("user")
PASSWORD = os.getenv("password")
HOST = os.getenv("host")
PORT = os.getenv("port")
DBNAME = os.getenv("dbname")

def create_database():
    """Create database tables and insert sample data"""
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
        
        # Create cursor
        cursor = connection.cursor()
        
        # Read SQL file
        sql_file = Path(__file__).parent.parent / "create_database.sql"
        with open(sql_file, 'r') as f:
            sql_script = f.read()
        
        print("📝 Executing SQL script...")
        
        # Execute the SQL script
        cursor.execute(sql_script)
        
        # Commit the transaction
        connection.commit()
        
        print("✅ Database tables created and sample data inserted successfully!")
        
        # Verify the data
        print("\n📊 Verifying data...")
        
        # Check users count
        cursor.execute("SELECT COUNT(*) FROM users")
        users_count = cursor.fetchone()[0]
        print(f"   Users: {users_count}")
        
        # Check transactions count
        cursor.execute("SELECT COUNT(*) FROM transactions")
        transactions_count = cursor.fetchone()[0]
        print(f"   Transactions: {transactions_count}")
        
        # Show sample data
        print("\n👥 Sample users:")
        cursor.execute("SELECT id, name, email FROM users LIMIT 5")
        for row in cursor.fetchall():
            print(f"   {row[0]}: {row[1]} ({row[2]})")
        
        print("\n💰 Sample transactions:")
        cursor.execute("SELECT id, user_id, amount, description, type FROM transactions LIMIT 5")
        for row in cursor.fetchall():
            print(f"   {row[0]}: User {row[1]} - ${row[2]:.2f} - {row[3]} ({row[4]})")
        
        # Close cursor and connection
        cursor.close()
        connection.close()
        print("\n✅ Database setup completed successfully!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    
    return True

if __name__ == "__main__":
    success = create_database()
    sys.exit(0 if success else 1)
