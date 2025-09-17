import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # Supabase Configuration
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "https://lhkchljnupsdabtryxne.supabase.co")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxoa2NobGpudXBzZGFidHJ5eG5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMzg3MTAsImV4cCI6MjA3MzYxNDcxMH0.dWbajxuKyKHxnsKRpW2Yf5iCIIozMsu9O0iLXZ_GS4U")
    
    # Database URL with URL-encoded password
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres.lhkchljnupsdabtryxne:Likash%40123@aws-0-us-west-1.pooler.supabase.com:5432/postgres")
    
    # JWT Configuration
    JWT_SECRET: str = os.getenv("JWT_SECRET", "your_super_secret_jwt_key_here_make_it_long_and_random")
    JWT_EXPIRE_DAYS: int = int(os.getenv("JWT_EXPIRE_DAYS", "7"))
    
    # API Configuration
    API_PORT: int = int(os.getenv("API_PORT", "8000"))
    DEBUG: bool = os.getenv("DEBUG", "1") == "1"

settings = Settings()
