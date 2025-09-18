import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # Supabase Configuration
    user: str = os.getenv("user", "postgres.ykwlbhiplaunxocfqrgp")   
    password: str = os.getenv("password", "59RBNGNJlJqVdMgv")
    host: str = os.getenv("host", "aws-1-ap-south-1.pooler.supabase.com")
    port: int = int(os.getenv("port", "6543"))
    dbname: str = os.getenv("dbname", "postgres")

    # JWT Configuration
    JWT_SECRET: str = os.getenv("JWT_SECRET", "change_me_to_a_long_random_string")
    JWT_EXPIRE_DAYS: int = int(os.getenv("JWT_EXPIRE_DAYS", "7"))
    API_PORT: int = int(os.getenv("API_PORT", "8000"))
    DEBUG: bool = os.getenv("DEBUG", "1") == "1"
    
    # Database URL for SQLAlchemy
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"postgresql://{user}:{password}@{host}:{port}/{dbname}")
    class Config:
        env_file = ".env"
        extra = "ignore"  # Optional: ignore any extra env variables

settings = Settings()