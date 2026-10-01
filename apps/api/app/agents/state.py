from typing import TypedDict, List, Dict, Any, Optional
from datetime import datetime


class ExperimentState(TypedDict, total=False):
    experiment_id: str
    experiment_number: int
    name: str
    parent_id: Optional[str]
    model: str
    dataset: str
    configuration: Dict[str, Any]
    status: str
    metrics: Dict[str, Any]
    failure_reason: Optional[str]
    bottleneck: Optional[str]
    mutation_applied: Optional[str]
    is_best: bool


class ResearchState(TypedDict, total=False):
    research_id: str
    run_code: str
    goal: str
    optimization_target: str
    target_accuracy: float
    target_latency_ms: float
    target_vram_gb: float
    hypotheses: List[Dict[str, Any]]
    datasets: List[Dict[str, Any]]
    models: List[Dict[str, Any]]
    experiments: List[ExperimentState]
    current_experiment: Optional[ExperimentState]
    current_iteration: int
    max_experiments: int
    budget: Dict[str, Any]
    failures: List[Dict[str, Any]]
    best_experiment: Optional[ExperimentState]
    final_report: Optional[Dict[str, Any]]
    is_completed: bool
    status: str
    active_stage: str
    last_event: Optional[Dict[str, Any]]
