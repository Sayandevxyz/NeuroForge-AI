import uuid
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from sqlalchemy import (
    Column, String, Text, Integer, Float, Boolean, DateTime, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from app.db.session import Base


def get_utc_now():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False, default="Lead AI Researcher")
    email = Column(String(255), unique=True, nullable=False, default="researcher@neuroforge.ai")
    role = Column(String(50), nullable=False, default="Principal Investigator")
    created_at = Column(DateTime, default=get_utc_now)

    workspaces = relationship("Workspace", back_populates="owner", cascade="all, delete-orphan")


class Workspace(Base):
    __tablename__ = "workspaces"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False, default="Default Research Lab")
    slug = Column(String(100), unique=True, nullable=False, default="default-lab")
    description = Column(Text, nullable=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=get_utc_now)

    owner = relationship("User", back_populates="workspaces")
    research_runs = relationship("ResearchRun", back_populates="workspace", cascade="all, delete-orphan")


class ResearchRun(Base):
    __tablename__ = "research_runs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    run_code = Column(String(20), unique=True, nullable=False)  # e.g., NF-027
    title = Column(String(255), nullable=False)
    goal = Column(Text, nullable=False)
    workspace_id = Column(String(36), ForeignKey("workspaces.id"), nullable=True)
    
    # Optimization config
    optimization_target = Column(String(50), nullable=False, default="balanced")  # accuracy, latency, vram, throughput, cost, balanced
    target_accuracy = Column(Float, nullable=True, default=85.0)
    target_latency_ms = Column(Float, nullable=True, default=150.0)
    target_vram_gb = Column(Float, nullable=True, default=8.0)
    
    # Budgets
    gpu_budget_hours = Column(Float, nullable=False, default=100.0)
    experiment_budget_max = Column(Integer, nullable=False, default=12)
    current_iteration = Column(Integer, default=1)
    
    # Execution status
    status = Column(String(30), nullable=False, default="queued")  # queued, running, paused, completed, failed, cancelled
    active_stage = Column(String(50), default="goal_analysis")  # goal_analysis, hypothesis_generation, dataset_prep, experiment_design, gpu_training, evaluation, failure_analysis, report_generation
    
    best_experiment_id = Column(String(36), nullable=True)
    best_metrics = Column(JSON, nullable=True)
    
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=get_utc_now)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)

    # Relationships
    workspace = relationship("Workspace", back_populates="research_runs")
    hypotheses = relationship("Hypothesis", back_populates="research_run", cascade="all, delete-orphan")
    experiments = relationship("Experiment", back_populates="research_run", cascade="all, delete-orphan")
    agent_events = relationship("AgentEvent", back_populates="research_run", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="research_run", cascade="all, delete-orphan")


class Hypothesis(Base):
    __tablename__ = "hypotheses"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    research_run_id = Column(String(36), ForeignKey("research_runs.id"), nullable=False)
    hypothesis_code = Column(String(20), nullable=False)  # H1, H2, etc.
    title = Column(String(255), nullable=False)
    statement = Column(Text, nullable=False)
    rationale = Column(Text, nullable=True)
    confidence_score = Column(Float, default=0.85)
    status = Column(String(30), default="proposed")  # proposed, testing, validated, refuted
    outcome_summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=get_utc_now)

    research_run = relationship("ResearchRun", back_populates="hypotheses")


class Model(Base):
    __tablename__ = "models"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), unique=True, nullable=False)  # e.g., Qwen2.5-Coder-7B-Instruct, Llama-3.1-8B-Instruct
    family = Column(String(50), nullable=False)  # Qwen, Llama, Mistral, Gemma
    parameter_count = Column(String(20), nullable=False)  # 7B, 8B, 14B
    context_window = Column(Integer, nullable=False, default=32768)
    default_precision = Column(String(20), default="bfloat16")
    supported_quantizations = Column(JSON, default=list)  # ["int8", "fp8", "int4-awq", "int4-gptq"]
    vram_min_gb = Column(Float, nullable=False, default=14.0)
    license = Column(String(50), default="Apache-2.0")
    description = Column(Text, nullable=True)
    recommended_target = Column(String(100), default="Reasoning & Code Generation")
    created_at = Column(DateTime, default=get_utc_now)

    experiments = relationship("Experiment", back_populates="model")


class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), unique=True, nullable=False)  # e.g. GSM8K-Hard-Cleaned, MATH-Reasoning-v2
    task_type = Column(String(50), nullable=False)  # Reasoning, Math, Code, Instruction Tuning
    sample_count = Column(Integer, nullable=False, default=25000)
    token_count = Column(String(20), default="12.5M")
    languages = Column(JSON, default=lambda: ["Python", "English"])
    quality_score = Column(Float, default=94.2)
    license = Column(String(50), default="MIT")
    description = Column(Text, nullable=True)
    default_split = Column(JSON, default=lambda: {"train": 0.85, "validation": 0.15})
    created_at = Column(DateTime, default=get_utc_now)

    experiments = relationship("Experiment", back_populates="dataset")


class Experiment(Base):
    __tablename__ = "experiments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    experiment_number = Column(Integer, nullable=False)  # 1, 2, 3...
    name = Column(String(150), nullable=False)
    research_run_id = Column(String(36), ForeignKey("research_runs.id"), nullable=False)
    parent_experiment_id = Column(String(36), ForeignKey("experiments.id"), nullable=True)
    model_id = Column(String(36), ForeignKey("models.id"), nullable=False)
    dataset_id = Column(String(36), ForeignKey("datasets.id"), nullable=False)
    
    # Status & Iteration
    iteration = Column(Integer, default=1)
    status = Column(String(30), nullable=False, default="queued")  # queued, running, completed, failed, cancelled
    is_best_run = Column(Boolean, default=False)
    
    # Configuration (Full YAML/JSON spec)
    configuration = Column(JSON, nullable=False)
    
    # Evaluated Performance Metrics
    accuracy = Column(Float, nullable=True)
    latency_ms = Column(Float, nullable=True)
    vram_gb = Column(Float, nullable=True)
    throughput_tokens_sec = Column(Float, nullable=True)
    training_time_minutes = Column(Float, nullable=True)
    gpu_utilization_avg = Column(Float, nullable=True)
    power_watts_avg = Column(Float, nullable=True)
    temperature_c_avg = Column(Float, nullable=True)
    metrics_summary = Column(JSON, nullable=True)
    
    # Failure Analysis
    failure_reason = Column(Text, nullable=True)
    bottleneck_detected = Column(String(100), nullable=True)  # "VRAM Pressure", "KV Cache Memory", "Gradient Instability", "Latency Target Exceeded"
    mutation_applied = Column(Text, nullable=True)
    mutation_details = Column(JSON, nullable=True)
    
    # Execution timeline
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=get_utc_now)

    # Relationships
    research_run = relationship("ResearchRun", back_populates="experiments")
    parent = relationship("Experiment", remote_side=[id], backref="children")
    model = relationship("Model", back_populates="experiments")
    dataset = relationship("Dataset", back_populates="experiments")
    metrics = relationship("ExperimentMetric", back_populates="experiment", cascade="all, delete-orphan")
    artifacts = relationship("ExperimentArtifact", back_populates="experiment", cascade="all, delete-orphan")
    gpu_jobs = relationship("GPUJob", back_populates="experiment", cascade="all, delete-orphan")


class ExperimentMetric(Base):
    __tablename__ = "experiment_metrics"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    experiment_id = Column(String(36), ForeignKey("experiments.id"), nullable=False)
    step = Column(Integer, nullable=False)
    epoch = Column(Float, nullable=False)
    loss = Column(Float, nullable=False)
    val_loss = Column(Float, nullable=True)
    accuracy = Column(Float, nullable=True)
    latency_ms = Column(Float, nullable=True)
    vram_gb = Column(Float, nullable=True)
    throughput_tokens_sec = Column(Float, nullable=True)
    gpu_util_pct = Column(Float, nullable=True)
    power_watts = Column(Float, nullable=True)
    temp_c = Column(Float, nullable=True)
    timestamp = Column(DateTime, default=get_utc_now)

    experiment = relationship("Experiment", back_populates="metrics")


class ExperimentArtifact(Base):
    __tablename__ = "experiment_artifacts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    experiment_id = Column(String(36), ForeignKey("experiments.id"), nullable=False)
    artifact_type = Column(String(50), nullable=False)  # checkpoint, trtllm_engine, adapter_lora, tokenizer, eval_log
    name = Column(String(150), nullable=False)
    path_or_uri = Column(String(255), nullable=False)
    size_bytes = Column(Integer, default=0)
    metadata_json = Column(JSON, default=dict)
    created_at = Column(DateTime, default=get_utc_now)

    experiment = relationship("Experiment", back_populates="artifacts")


class AgentEvent(Base):
    __tablename__ = "agent_events"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    research_run_id = Column(String(36), ForeignKey("research_runs.id"), nullable=False)
    experiment_id = Column(String(36), nullable=True)
    agent_name = Column(String(60), nullable=False)  # Research Agent, Dataset Agent, Experiment Agent, GPU Agent, Evaluation Agent, Failure Analyst, Research Writer
    event_type = Column(String(50), nullable=False)  # hypothesis_created, dataset_validated, experiment_generated, job_scheduled, training_step, evaluation_completed, failure_identified, mutation_planned, report_generated
    message = Column(Text, nullable=False)
    status = Column(String(20), default="success")  # info, running, success, warning, failed
    duration_ms = Column(Integer, default=0)
    metadata_json = Column(JSON, default=dict)
    created_at = Column(DateTime, default=get_utc_now)

    research_run = relationship("ResearchRun", back_populates="agent_events")


class GPUJob(Base):
    __tablename__ = "gpu_jobs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    experiment_id = Column(String(36), ForeignKey("experiments.id"), nullable=False)
    cluster_name = Column(String(100), default="nebius-nordic-h100-sxm5")
    provider = Column(String(50), default="Nebius Cloud (NVIDIA H100)")
    gpu_model = Column(String(100), default="NVIDIA H100 80GB SXM5")
    gpu_count = Column(Integer, default=1)
    status = Column(String(30), default="running")  # pending, running, completed, failed, cancelled
    allocated_vram_gb = Column(Float, default=80.0)
    power_draw_w = Column(Float, default=320.0)
    temperature_c = Column(Float, default=64.0)
    memory_used_gb = Column(Float, default=24.5)
    utilization_pct = Column(Float, default=88.5)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=get_utc_now)

    experiment = relationship("Experiment", back_populates="gpu_jobs")


class Benchmark(Base):
    __tablename__ = "benchmarks"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), unique=True, nullable=False)  # GSM8K, HumanEval, MMLU-Pro, ARC-Challenge
    domain = Column(String(50), nullable=False)  # Multi-step Math, Code Synthesis, General Reasoning, Common Sense
    description = Column(Text, nullable=True)
    metrics_evaluated = Column(JSON, default=lambda: ["accuracy", "latency", "throughput", "vram"])
    sample_test_count = Column(Integer, default=1319)
    created_at = Column(DateTime, default=get_utc_now)


class Report(Base):
    __tablename__ = "reports"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    research_run_id = Column(String(36), ForeignKey("research_runs.id"), nullable=False)
    title = Column(String(255), nullable=False)
    abstract = Column(Text, nullable=False)
    research_question = Column(Text, nullable=False)
    hypotheses_analyzed = Column(JSON, default=list)
    methodology = Column(Text, nullable=False)
    models_evaluated = Column(JSON, default=list)
    datasets_used = Column(JSON, default=list)
    experiments_summary = Column(JSON, default=list)
    results_narrative = Column(Text, nullable=False)
    failure_analysis_narrative = Column(Text, nullable=False)
    best_experiment_code = Column(String(50), nullable=False)
    best_config_yaml = Column(Text, nullable=False)
    limitations = Column(Text, nullable=False)
    conclusion = Column(Text, nullable=False)
    reproduction_instructions = Column(Text, nullable=False)
    markdown_content = Column(Text, nullable=False)
    json_content = Column(JSON, default=dict)
    created_at = Column(DateTime, default=get_utc_now)

    research_run = relationship("ResearchRun", back_populates="reports")
