from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.db.session import get_db, Base, engine
from app.services.seed_service import seed_database

router = APIRouter(prefix="/api/settings", tags=["Settings"])


class SystemSettingsSchema(BaseModel):
    app_name: str
    app_env: str
    demo_mode: bool
    gpu_provider: str
    nvidia_backend: str
    ai_provider: str
    ai_model: str
    nebius_region: str
    nebius_configured: bool
    cluster_name: str


class SettingsUpdateRequest(BaseModel):
    demo_mode: Optional[bool] = None
    gpu_provider: Optional[str] = None
    nvidia_backend: Optional[str] = None
    ai_provider: Optional[str] = None
    nebius_api_key: Optional[str] = None
    nebius_project_id: Optional[str] = None
    nebius_cluster_id: Optional[str] = None


@router.get("", response_model=SystemSettingsSchema)
async def get_system_settings():
    return {
        "app_name": settings.APP_NAME,
        "app_env": settings.APP_ENV,
        "demo_mode": settings.DEMO_MODE,
        "gpu_provider": settings.GPU_PROVIDER,
        "nvidia_backend": settings.NVIDIA_BACKEND,
        "ai_provider": settings.AI_PROVIDER,
        "ai_model": settings.AI_MODEL,
        "nebius_region": settings.NEBIUS_REGION,
        "nebius_configured": bool(settings.NEBIUS_API_KEY and settings.NEBIUS_PROJECT_ID),
        "cluster_name": settings.NEBIUS_CLUSTER_ID or "nebius-nordic-h100-sxm5"
    }


@router.post("")
async def update_system_settings(payload: SettingsUpdateRequest):
    if payload.demo_mode is not None:
        settings.DEMO_MODE = payload.demo_mode
    if payload.gpu_provider is not None:
        settings.GPU_PROVIDER = payload.gpu_provider
    if payload.nvidia_backend is not None:
        settings.NVIDIA_BACKEND = payload.nvidia_backend
    if payload.ai_provider is not None:
        settings.AI_PROVIDER = payload.ai_provider
    if payload.nebius_api_key is not None:
        settings.NEBIUS_API_KEY = payload.nebius_api_key
    if payload.nebius_project_id is not None:
        settings.NEBIUS_PROJECT_ID = payload.nebius_project_id
    if payload.nebius_cluster_id is not None:
        settings.NEBIUS_CLUSTER_ID = payload.nebius_cluster_id

    return {
        "message": "Settings updated successfully",
        "demo_mode": settings.DEMO_MODE,
        "gpu_provider": settings.GPU_PROVIDER,
        "nvidia_backend": settings.NVIDIA_BACKEND
    }


@router.post("/reset-demo")
async def reset_demo_database(db: AsyncSession = Depends(get_db)):
    # Drop and recreate all tables, then seed fresh
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    
    await seed_database(db)
    return {"message": "Database reset and seeded with fresh NeuroForge demo data (NF-027)."}
