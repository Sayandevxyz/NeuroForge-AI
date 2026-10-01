import yaml
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.db.session import get_db
from app.models.entities import Experiment, ExperimentMetric, ExperimentArtifact, Model, Dataset
from app.schemas.schemas import ExperimentSummarySchema, ExperimentDetailSchema

router = APIRouter(prefix="/api/experiments", tags=["Experiments"])


@router.get("", response_model=List[ExperimentSummarySchema])
async def list_experiments(
    research_run_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    is_best: Optional[bool] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    query = select(Experiment).options(
        selectinload(Experiment.model),
        selectinload(Experiment.dataset)
    )

    if research_run_id:
        query = query.where(Experiment.research_run_id == research_run_id)
    if status:
        query = query.where(Experiment.status == status)
    if is_best is not None:
        query = query.where(Experiment.is_best_run == is_best)

    query = query.order_by(Experiment.experiment_number.asc())
    result = await db.execute(query)
    exps = result.scalars().all()

    summaries = []
    for e in exps:
        summaries.append({
            "id": e.id,
            "experiment_number": e.experiment_number,
            "name": e.name,
            "research_run_id": e.research_run_id,
            "parent_experiment_id": e.parent_experiment_id,
            "model_name": e.model.name if e.model else "Qwen2.5-Coder-7B",
            "dataset_name": e.dataset.name if e.dataset else "GSM8K-Hard-Cleaned",
            "iteration": e.iteration,
            "status": e.status,
            "is_best_run": e.is_best_run,
            "accuracy": e.accuracy,
            "latency_ms": e.latency_ms,
            "vram_gb": e.vram_gb,
            "throughput_tokens_sec": e.throughput_tokens_sec,
            "training_time_minutes": e.training_time_minutes,
            "bottleneck_detected": e.bottleneck_detected,
            "failure_reason": e.failure_reason,
            "mutation_applied": e.mutation_applied,
            "created_at": e.created_at
        })
    return summaries


@router.get("/{experiment_id}", response_model=ExperimentDetailSchema)
async def get_experiment(experiment_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Experiment)
        .options(
            selectinload(Experiment.model),
            selectinload(Experiment.dataset),
            selectinload(Experiment.metrics)
        )
        .where(Experiment.id == experiment_id)
    )
    exp = result.scalars().first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found")

    metrics_sorted = sorted(exp.metrics, key=lambda m: m.step)

    return {
        "id": exp.id,
        "experiment_number": exp.experiment_number,
        "name": exp.name,
        "research_run_id": exp.research_run_id,
        "parent_experiment_id": exp.parent_experiment_id,
        "model_name": exp.model.name if exp.model else "Qwen2.5-Coder-7B",
        "dataset_name": exp.dataset.name if exp.dataset else "GSM8K-Hard-Cleaned",
        "iteration": exp.iteration,
        "status": exp.status,
        "is_best_run": exp.is_best_run,
        "configuration": exp.configuration,
        "accuracy": exp.accuracy,
        "latency_ms": exp.latency_ms,
        "vram_gb": exp.vram_gb,
        "throughput_tokens_sec": exp.throughput_tokens_sec,
        "training_time_minutes": exp.training_time_minutes,
        "gpu_utilization_avg": exp.gpu_utilization_avg,
        "power_watts_avg": exp.power_watts_avg,
        "temperature_c_avg": exp.temperature_c_avg,
        "metrics_summary": exp.metrics_summary,
        "bottleneck_detected": exp.bottleneck_detected,
        "failure_reason": exp.failure_reason,
        "mutation_applied": exp.mutation_applied,
        "started_at": exp.started_at,
        "completed_at": exp.completed_at,
        "created_at": exp.created_at,
        "metrics_history": metrics_sorted
    }


@router.post("/{experiment_id}/run")
async def run_experiment_action(experiment_id: str, db: AsyncSession = Depends(get_db)):
    exp = await db.get(Experiment, experiment_id)
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found")
    exp.status = "running"
    await db.commit()
    return {"message": f"Experiment #{exp.experiment_number} dispatched to GPU compute pool.", "status": "running"}


@router.post("/{experiment_id}/reproduce")
async def get_reproduction_details(experiment_id: str, db: AsyncSession = Depends(get_db)):
    exp = await db.get(Experiment, experiment_id)
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found")

    yaml_spec = yaml.dump(exp.configuration, default_flow_style=False)
    docker_cmd = (
        f"docker run --gpus all --rm -it "
        f"-v $(pwd)/config.yaml:/app/config.yaml "
        f"cr.nebius.ai/neuroforge/runtime:latest "
        f"--config /app/config.yaml"
    )

    python_snippet = f"""# NeuroForge Autonomous Reproduction Script
# Experiment #{exp.experiment_number}: {exp.name}
import torch
from peft import LoraConfig, get_peft_model
from transformers import AutoModelForCausalLM, AutoTokenizer

model_name = "{exp.configuration.get('model', {}).get('name', 'Qwen2.5-Coder-7B')}"
print(f"Loading {{model_name}} with precision: {exp.configuration.get('optimization', {}).get('precision', 'fp8')}...")

# Hyperparameters:
# LoRA Rank: {exp.configuration.get('optimization', {}).get('lora_rank', 64)}
# Batch Size: {exp.configuration.get('training', {}).get('batch_size', 8)}
# Target Accuracy: {exp.accuracy}%
"""

    return {
        "experiment_id": exp.id,
        "experiment_number": exp.experiment_number,
        "name": exp.name,
        "yaml_configuration": yaml_spec,
        "docker_command": docker_cmd,
        "python_script": python_snippet
    }
