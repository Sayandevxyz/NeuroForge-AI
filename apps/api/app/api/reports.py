from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.session import get_db
from app.models.entities import Report, ResearchRun
from app.schemas.schemas import ReportSchema
from app.agents.research_writer_agent import ResearchWriterAgent

router = APIRouter(prefix="/api/reports", tags=["Reports"])


@router.get("", response_model=List[ReportSchema])
async def list_reports(research_run_id: Optional[str] = Query(None), db: AsyncSession = Depends(get_db)):
    query = select(Report).order_by(Report.created_at.desc())
    if research_run_id:
        query = query.where(Report.research_run_id == research_run_id)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{report_id}", response_model=ReportSchema)
async def get_report(report_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Report).where(Report.id == report_id))
    report = result.scalars().first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report
