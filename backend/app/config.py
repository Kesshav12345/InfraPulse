import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="allow")

    PROJECT_NAME: str = "InfraPulse Intelligence API"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # Database configuration: Supports MySQL (e.g. mysql+pymysql://user:pass@localhost:3306/paimana)
    # or automatic SQLite fallback
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")
    SQLITE_PATH: str = os.getenv("SQLITE_PATH", os.path.abspath(os.path.join(os.path.dirname(__file__), "../../paimana.db")))
    CSV_PATH: str = os.getenv("CSV_PATH", os.path.abspath(os.path.join(os.path.dirname(__file__), "../../paimana_timeseries_master.csv")))
    
    # Analytical Engine
    MODEL_VERSION: str = "heuristic-v1.0"
    ENABLE_PRECOMPUTED_CACHE: bool = True
    
    # CORS
    CORS_ORIGINS: list[str] = ["*"]

settings = Settings()
