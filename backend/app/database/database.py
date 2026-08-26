import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from ..config import settings

def get_engine():
    # If DATABASE_URL is provided, try MySQL or specified connection
    if settings.DATABASE_URL:
        try:
            engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
            # Test connection
            with engine.connect() as conn:
                pass
            return engine, "mysql" if "mysql" in settings.DATABASE_URL else "custom"
        except Exception as e:
            print(f"Warning: Could not connect to DATABASE_URL ({e}). Falling back to SQLite.")
            
    # SQLite fallback
    sqlite_url = f"sqlite:///{settings.SQLITE_PATH}"
    engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})
    return engine, "sqlite"

engine, DB_ENGINE_TYPE = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
