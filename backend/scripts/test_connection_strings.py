#!/usr/bin/env python3
"""
Test different Supabase connection string formats
"""

from sqlalchemy import create_engine, text

# Different connection string formats to try
connection_strings = [
    # Format 1: Direct connection
    "postgresql://postgres.lhkchljnupsdabtryxne:Likash%40123@db.lhkchljnupsdabtryxne.supabase.co:5432/postgres",
    
    # Format 2: Pooler connection
    "postgresql://postgres.lhkchljnupsdabtryxne:Likash%40123@aws-0-us-west-1.pooler.supabase.com:6543/postgres",
    
    # Format 3: Alternative pooler
    "postgresql://postgres.lhkchljnupsdabtryxne:Likash%40123@aws-0-us-west-1.pooler.supabase.com:5432/postgres",
    
    # Format 4: With project reference
    "postgresql://postgres:[Likash@123]@db.lhkchljnupsdabtryxne.supabase.co:5432/postgres",
]

def test_connection_string(conn_str, name):
    """Test a connection string"""
    print(f"\n🔌 Testing {name}...")
    print(f"📊 URL: {conn_str}")
    
    try:
        engine = create_engine(conn_str)
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1 as test"))
            print("✅ Connection successful!")
            return True
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return False

def main():
    print("🚀 Testing Supabase Connection Strings")
    print("=" * 60)
    
    for i, conn_str in enumerate(connection_strings, 1):
        name = f"Format {i}"
        if test_connection_string(conn_str, name):
            print(f"\n🎉 SUCCESS! Use this connection string:")
            print(f"📊 {conn_str}")
            return conn_str
    
    print("\n💥 All connection attempts failed.")
    print("🔧 Please check your Supabase project settings and get the correct connection string.")
    return None

if __name__ == "__main__":
    main()
