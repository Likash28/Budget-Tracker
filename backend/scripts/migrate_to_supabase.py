#!/usr/bin/env python3
"""
Migration script to set up Supabase database tables
Run this after updating your DATABASE_URL environment variable
"""

import os
import sys
from pathlib import Path

# Add the parent directory to the path so we can import from app
sys.path.append(str(Path(__file__).parent.parent))

from app.db import engine, Base
from app.models import *  # Import all models to ensure they're registered
from app.config import settings

def migrate_to_supabase():
    """Create all tables in Supabase database"""
    try:
        print("🔄 Creating tables in Supabase...")
        
        # Create all tables
        Base.metadata.create_all(bind=engine)
        
        print("✅ Successfully created all tables in Supabase!")
        print(f"📊 Database URL: {settings.DATABASE_URL}")
        
        # Test connection
        from sqlalchemy import text
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            print("✅ Database connection test successful!")
            
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        print("\n🔧 Troubleshooting:")
        print("1. Make sure your DATABASE_URL is correct")
        print("2. Check if your Supabase password is correct")
        print("3. Ensure your Supabase project is active")
        return False
    
    return True

if __name__ == "__main__":
    print("🚀 Starting Supabase migration...")
    success = migrate_to_supabase()
    
    if success:
        print("\n🎉 Migration completed successfully!")
        print("📝 Next steps:")
        print("1. Update your Netlify environment variables")
        print("2. Deploy your backend to a cloud service (Railway, Render, etc.)")
        print("3. Update your frontend API URL to point to the deployed backend")
    else:
        print("\n💥 Migration failed. Please check the errors above.")
        sys.exit(1)
