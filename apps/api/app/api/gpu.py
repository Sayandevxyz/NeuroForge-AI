from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.session import get_db
from app.models.entities import GPUJob
from app.schemas.schemas import GPUJobSchema, GPUClusterStatus
from app.core.compute.runners import get_compute_provider

router = APIRouter(prefix="/api/gpu", tags=["GPU Lab"])


@router.get("/status", response_model=GPUClusterStatus)
async def get_gpu_cluster_status():
    provider = get_compute_provider()
    status_data = await provider.get_cluster_status()
    return status_data


@router.get("/jobs", response_model=List[GPUJobSchema])
async def list_gpu_jobs(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(GPUJob).order_by(GPUJob.created_at.desc())
    )
    return result.scalars().all()
