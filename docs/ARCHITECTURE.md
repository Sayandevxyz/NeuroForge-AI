# NeuroForge AI Architecture Specification

## 1. System Overview

NeuroForge AI is designed around a decoupled, event-driven multi-agent architecture. The platform treats machine learning research as a formal state transition graph, transitioning through hypothesis generation, dataset curation, hardware workload scheduling, and root-cause failure attribution.

## 2. Multi-Agent Orchestration Flow

```
[ User Prompt / Objective ]
             │
             ▼
      Research Agent
   (Formulates Hypotheses H1..H8)
             │
             ▼
       Dataset Agent
   (Validates GSM8K, MATH)
             │
             ▼
      Experiment Agent
   (Generates Config YAML)
             │
             ▼
         GPU Agent
   (Dispatches to Nebius H100)
             │
             ▼
      Evaluation Agent
   (Measures Accuracy, Latency)
             │
      ┌──────┴──────┐
      │             │
    FAILED        PASSED
      │             │
      ▼             ▼
Failure Analyst  Research Writer
(Diagnoses KV)  (Compiles Report)
      │
      ▼
Experiment Agent
(Mutates Config)
```

## 3. Compute Abstraction Layer

NeuroForge defines a unified `ComputeProvider` interface:
* `submit_job(experiment_id, configuration)`
* `get_job(job_id)`
* `cancel_job(job_id)`
* `get_logs(job_id)`
* `get_metrics(job_id)`
* `get_cluster_status()`

Implementations:
1. `NebiusComputeProvider`: Submits distributed Slurm/K8s jobs to real Nebius Cloud GPU nodes.
2. `DemoComputeProvider`: High-fidelity deterministic simulation engine modelling NVIDIA H100 SXM5 thermals, step loss decay, and memory allocation.
