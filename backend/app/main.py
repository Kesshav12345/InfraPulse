import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.routes import router
from .config import settings
from .database.init_db import init_database

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure database schema is initialized and loaded
    print(f"[PAIMANA API] Starting {settings.PROJECT_NAME} v{settings.VERSION}...")
    try:
        init_database()
    except Exception as e:
        print(f"[PAIMANA API] Warning during DB initialization: {e}")
    yield
    print("[PAIMANA API] Shutting down...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AI-Powered Infrastructure Project Monitoring & Early Warning Decision Support System (MoSPI / IPMD inspired).",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix=settings.API_PREFIX)

@app.get("/")
def root():
    return {
        "status": "online",
        "system": "PAIMANA Intelligence API",
        "version": settings.VERSION,
        "docs_url": "/docs",
        "api_prefix": settings.API_PREFIX
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run("backend.app.main:app", host=host, port=port, reload=False)
