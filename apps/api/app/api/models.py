from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.session import get_db
from app.models.entities import Model
from app.schemas.schemas import ModelSchema

router = APIRouter(prefix="/api/models", tags=["Models"])


@router.get("", response_model=List[ModelSchema])
async def list_models(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Model).order_by(Model.name.asc()))
    return result.scalars().all()


@router.get("/{model_id}", response_model=ModelSchema)
async def get_model(model_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Model).where(Model.id == model_id))
    model = result.scalars().first()
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    return model
