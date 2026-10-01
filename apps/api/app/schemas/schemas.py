from datetime import datetime
from typing import Optional, List, Dict, Any, Union
from pydantic import BaseModel, Field, ConfigDict


# Base schemas
class HypothesisSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True, protected_namespaces=())

    id: str
    hypothesis_code: str
    title: str
    statement: str
    rationale: Optional[str] = None
    confidence_score: float = 0.85
    status: str = "proposed"
    outcome_summary: Optional[str] = None


class ModelSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True, protected_namespaces=())

    id: str
    name: str
    family: str
    parameter_count: str
    context_window: int
    default_precision: str
    supported_quantizations: List[str]
    vram_min_gb: float
    license: str
    description: Optional[str] = None
    recommended_target: Optional[str] = None


class DatasetSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True, protected_namespaces=())

    id: str
    name: str
    task_type: str
    sample_count: int
    token_count: str
    languages: List[str]
    quality_score: float
    license: str
    description: Optional[str] = None
    default_split: Dict[str, float] = {}


class BenchmarkSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True, protected_namespaces=())

    id: str
    name: str
    domain: str
    description: Optional[str] = None
    metrics_evaluated: List[str]
    sample_test_count: int


class ExperimentMetricPoint(BaseModel):
    model_config = ConfigDict(from_attributes=True, protected_namespaces=())

    step: int
    epoch: float
    loss: float
    val_loss: Optional[float] = None
    accuracy: Optional[float] = None
    latency_ms: Optional[float] = None
    vram_gb: Optional[float] = None
    throughput_tokens_sec: Optional[float] = None
    gpu_util_pct: Optional[float] = None
    power_watts: Optional[float] = None
    temp_c: Optional[float] = None
    timestamp: datetime


class ExperimentSummarySchema(BaseModel):
    model_config = ConfigDict(from_attributes=True, protected_namespaces=())

    id: str
    experiment_number: int
    name: str
    research_run_id: str
    parent_experiment_id: Optional[str] = None
    model_name: Optional[str] = None
    dataset_name: Optional[str] = None
    iteration: int
    status: str
    is_best_run: bool
    accuracy: Optional[float] = None
    latency_ms: Optional[float] = None
    vram_gb: Optional[float] = None
    throughput_tokens_sec: Optional[float] = None
    training_time_minutes: Optional[float] = None
    bottleneck_detected: Optional[str] = None
    failure_reason: Optional[str] = None
    mutation_applied: Optional[str] = None
    created_at: datetime


class ExperimentDetailSchema(ExperimentSummarySchema):
    configuration: Dict[str, Any]
    metrics_summary: Optional[Dict[str, Any]] = None
    mutation_details: Optional[Dict[str, Any]] = None
    gpu_utilization_avg: Optional[float] = None
    power_watts_avg: Optional[float] = None
    temperature_c_avg: Optional[float] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    metrics_history: List[ExperimentMetricPoint] = []


class AgentEventSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True, protected_namespaces=())

    id: str
    research_run_id: str
    experiment_id: Optional[str] = None
    agent_name: str
    event_type: str
    message: str
    status: str
    duration_ms: int
    metadata_json: Dict[str, Any] = {}
    created_at: datetime


class ResearchRunCreate(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    title: Optional[str] = None
    goal: str = Field(..., min_length=5, description="Research objective statement")
    model_name: Optional[str] = "Qwen2.5-Coder-7B-Instruct"
    dataset_name: Optional[str] = "GSM8K-Hard-Cleaned"
    optimization_target: str = Field("balanced", description="accuracy | latency | vram | throughput | cost | balanced")
    gpu_budget_hours: float = Field(100.0, ge=1.0, le=1000.0)
    experiment_budget_max: int = Field(8, ge=2, le=30)
    target_accuracy: Optional[float] = 85.0
    target_latency_ms: Optional[float] = 150.0
    target_vram_gb: Optional[float] = 8.0


class ResearchRunSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True, protected_namespaces=())

    id: str
    run_code: str
    title: str
    goal: str
    optimization_target: str
    target_accuracy: Optional[float] = None
    target_latency_ms: Optional[float] = None
    target_vram_gb: Optional[float] = None
    gpu_budget_hours: float
    experiment_budget_max: int
    current_iteration: int
    status: str
    active_stage: str
    best_experiment_id: Optional[str] = None
    best_metrics: Optional[Dict[str, Any]] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class ResearchRunDetail(ResearchRunSummary):
    hypotheses: List[HypothesisSchema] = []
    experiments: List[ExperimentSummarySchema] = []
    agent_events: List[AgentEventSchema] = []


class GPUJobSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True, protected_namespaces=())

    id: str
    experiment_id: str
    cluster_name: str
    provider: str
    gpu_model: str
    gpu_count: int
    status: str
    allocated_vram_gb: float
    power_draw_w: float
    temperature_c: float
    memory_used_gb: float
    utilization_pct: float
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime


class GPUClusterStatus(BaseModel):
    provider: str
    cluster_name: str
    status: str
    total_gpus: int
    active_gpus: int
    cluster_utilization_pct: float
    vram_total_gb: float
    vram_used_gb: float
    average_temp_c: float
    average_power_watts: float
    active_jobs_count: int
    queued_jobs_count: int
    completed_jobs_count: int
    is_demo_mode: bool
    live_nodes: List[Dict[str, Any]]
    telemetry_history: List[Dict[str, Any]]


class ReportSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True, protected_namespaces=())

    id: str
    research_run_id: str
    title: str
    abstract: str
    research_question: str
    hypotheses_analyzed: List[Dict[str, Any]]
    methodology: str
    models_evaluated: List[str]
    datasets_used: List[str]
    experiments_summary: List[Dict[str, Any]]
    results_narrative: str
    failure_analysis_narrative: str
    best_experiment_code: str
    best_config_yaml: str
    limitations: str
    conclusion: str
    reproduction_instructions: str
    markdown_content: str
    json_content: Dict[str, Any]
    created_at: datetime


# Genome graph schemas
class GenomeNode(BaseModel):
    id: str
    label: str
    experiment_number: int
    status: str
    is_best_run: bool
    parent_id: Optional[str] = None
    model: str
    accuracy: Optional[float] = None
    latency_ms: Optional[float] = None
    vram_gb: Optional[float] = None
    throughput: Optional[float] = None
    bottleneck: Optional[str] = None
    failure_reason: Optional[str] = None
    mutation: Optional[str] = None
    created_at: datetime


class GenomeEdge(BaseModel):
    id: str
    source: str
    target: str
    mutation_label: Optional[str] = None


class ExperimentGenomeGraph(BaseModel):
    research_run_id: str
    run_code: str
    title: str
    best_experiment_id: Optional[str] = None
    nodes: List[GenomeNode]
    edges: List[GenomeEdge]


# Research Knowledge Graph schemas
class ResearchGraphNode(BaseModel):
    id: str
    label: str
    node_type: str  # goal, hypothesis, model, dataset, experiment, metric, conclusion
    category: str
    metadata: Dict[str, Any] = {}


class ResearchGraphEdge(BaseModel):
    id: str
    source: str
    target: str
    relation: str  # formulates, uses, evaluates, tests, yields, proves


class ResearchGraphResponse(BaseModel):
    research_run_id: str
    nodes: List[ResearchGraphNode]
    edges: List[ResearchGraphEdge]
