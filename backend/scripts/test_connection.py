#!/usr/bin/env python3
"""
Test Supabase connection
"""

import os
import sys
from pathlib import Path

# Add the parent directory to the path so we can import from app
sys.path.append(str(Path(__file__).parent.parent))

from app.config import settings
from sqlalchemy import create_engine, text

def test_connection():
    """Test Supabase connection"""
    print("🔌 Testing Supabase Connection...")
    print(f"📊 Project URL: {settings.SUPABASE_URL}")
    print(f"🔑 Database URL: {settings.DATABASE_URL}")
    
    try:
        engine = create_engine(settings.DATABASE_URL)
        
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1 as test"))
            print("✅ Connection successful!")
            print("✅ Ready for migration!")
            return True
            
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        print("\n🔧 Troubleshooting:")
        print("1. Check if your Supabase project is active")
        print("2. Verify the password is correct")
        print("3. Make sure the project URL is correct")
        return False

if __name__ == "__main__":
    success = test_connection()
    
    if success:
        print("\n🎉 Ready to migrate! Run:")
        print("python scripts/supabase_complete_migration.py")
    else:
        print("\n💥 Fix connection issues first.")
        sys.exit(1)
