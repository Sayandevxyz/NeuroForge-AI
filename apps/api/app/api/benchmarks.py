from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.session import get_db
from app.models.entities import Benchmark
from app.schemas.schemas import BenchmarkSchema

router = APIRouter(prefix="/api/benchmarks", tags=["Benchmarks"])


@router.get("", response_model=List[BenchmarkSchema])
async def list_benchmarks(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Benchmark).order_by(Benchmark.name.asc()))
    return result.scalars().all()
