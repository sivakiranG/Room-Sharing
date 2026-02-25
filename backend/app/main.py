from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.session import engine
from app.db.base import Base  # noqa – ensures all models are registered
from app.api.v1 import auth, rooms, items, activity, chores
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables if they don't exist (Alembic handles this in prod)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables ready")
    yield
    # Shutdown
    await engine.dispose()
    logger.info("Database engine disposed")


app = FastAPI(
    title="Roommate Grocery Tracker API",
    description="Real-time shared grocery tracking for roommates",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS – pull allowed origins from settings (defaults to ['*'] so every
# origin is permitted).  The environment variable CORS_ORIGINS can be
# a comma-separated list or just "*" for wildcard.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router)
app.include_router(rooms.router)
app.include_router(items.router)
app.include_router(activity.router)
app.include_router(chores.router)


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok", "service": "grocery-tracker-api"}
