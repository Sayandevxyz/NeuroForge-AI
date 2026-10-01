export interface ResearchRun {
  id: string;
  run_code: string;
  title: string;
  goal: string;
  optimization_target: string;
  target_accuracy: number | null;
  target_latency_ms: number | null;
  target_vram_gb: number | null;
  gpu_budget_hours: number;
  experiment_budget_max: number;
  current_iteration: number;
  status: string;
  active_stage: string;
  best_experiment_id: string | null;
  best_metrics: {
    accuracy?: number;
    latency_ms?: number;
    vram_gb?: number;
    throughput_tokens_sec?: number;
    training_time_minutes?: number;
  } | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  hypotheses?: Hypothesis[];
  experiments?: ExperimentSummary[];
  agent_events?: AgentEvent[];
}

export interface Hypothesis {
  id: string;
  hypothesis_code: string;
  title: string;
  statement: string;
  rationale?: string;
  confidence_score: number;
  status: string;
  outcome_summary?: string;
}

export interface ExperimentSummary {
  id: string;
  experiment_number: number;
  name: string;
  research_run_id: string;
  parent_experiment_id: string | null;
  model_name: string;
  dataset_name: string;
  iteration: number;
  status: string;
  is_best_run: boolean;
  accuracy: number | null;
  latency_ms: number | null;
  vram_gb: number | null;
  throughput_tokens_sec: number | null;
  training_time_minutes: number | null;
  bottleneck_detected: string | null;
  failure_reason: string | null;
  mutation_applied: string | null;
  created_at: string;
}

export interface ExperimentDetail extends ExperimentSummary {
  configuration: Record<string, any>;
  metrics_summary?: Record<string, any>;
  gpu_utilization_avg?: number;
  power_watts_avg?: number;
  temperature_c_avg?: number;
  started_at?: string;
  completed_at?: string;
  metrics_history: ExperimentMetricPoint[];
}

export interface ExperimentMetricPoint {
  step: number;
  epoch: number;
  loss: number;
  val_loss?: number;
  accuracy?: number;
  latency_ms?: number;
  vram_gb?: number;
  throughput_tokens_sec?: number;
  gpu_util_pct?: number;
  power_watts?: number;
  temp_c?: number;
  timestamp: string;
}

export interface AgentEvent {
  id: string;
  research_run_id: string;
  experiment_id?: string;
  agent_name: string;
  event_type: string;
  message: string;
  status: string;
  duration_ms: number;
  metadata_json?: Record<string, any>;
  created_at: string;
}

export interface GPUClusterStatus {
  provider: string;
  cluster_name: string;
  status: string;
  total_gpus: number;
  active_gpus: number;
  cluster_utilization_pct: number;
  vram_total_gb: number;
  vram_used_gb: number;
  average_temp_c: number;
  average_power_watts: number;
  active_jobs_count: number;
  queued_jobs_count: number;
  completed_jobs_count: number;
  is_demo_mode: boolean;
  disclaimer?: string;
  live_nodes: Array<{
    node_id: string;
    hostname: string;
    gpu_model: string;
    status: string;
    utilization_pct: number;
    vram_used_gb: number;
    vram_total_gb: number;
    temperature_c: number;
    power_watts: number;
    active_job?: string;
  }>;
  telemetry_history: Array<{
    time: string;
    utilization: number;
    vram: number;
    power: number;
    temp: number;
  }>;
}

export interface ModelItem {
  id: string;
  name: string;
  family: string;
  parameter_count: string;
  context_window: number;
  default_precision: string;
  supported_quantizations: string[];
  vram_min_gb: number;
  license: string;
  description?: string;
  recommended_target?: string;
}

export interface DatasetItem {
  id: string;
  name: string;
  task_type: string;
  sample_count: number;
  token_count: string;
  languages: string[];
  quality_score: number;
  license: string;
  description?: string;
  default_split?: Record<string, number>;
}

export interface BenchmarkItem {
  id: string;
  name: string;
  domain: string;
  description?: string;
  metrics_evaluated: string[];
  sample_test_count: number;
}

export interface ReportItem {
  id: string;
  research_run_id: string;
  title: string;
  abstract: string;
  research_question: string;
  hypotheses_analyzed: any[];
  methodology: string;
  models_evaluated: string[];
  datasets_used: string[];
  experiments_summary: any[];
  results_narrative: string;
  failure_analysis_narrative: string;
  best_experiment_code: string;
  best_config_yaml: string;
  limitations: string;
  conclusion: string;
  reproduction_instructions: string;
  markdown_content: string;
  json_content: Record<string, any>;
  created_at: string;
}

export interface GenomeGraph {
  research_run_id: string;
  run_code: string;
  title: string;
  best_experiment_id: string | null;
  nodes: Array<{
    id: string;
    label: string;
    experiment_number: number;
    status: string;
    is_best_run: boolean;
    parent_id?: string;
    model: string;
    accuracy?: number;
    latency_ms?: number;
    vram_gb?: number;
    throughput?: number;
    bottleneck?: string;
    failure_reason?: string;
    mutation?: string;
    created_at: string;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    mutation_label?: string;
  }>;
}

export interface ResearchGraph {
  research_run_id: string;
  nodes: Array<{
    id: string;
    label: string;
    node_type: string;
    category: string;
    metadata: Record<string, any>;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    relation: string;
  }>;
}
