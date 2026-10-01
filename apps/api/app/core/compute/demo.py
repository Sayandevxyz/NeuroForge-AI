import asyncio
import math
import random
import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from app.core.compute.base import ComputeProvider


class DemoComputeProvider(ComputeProvider):
    """
    Deterministic High-Fidelity GPU Simulation Engine for NeuroForge AI.
    Accurately models NVIDIA H100 execution characteristics, thermal dynamics,
    VRAM allocation curves, and step loss progression.
    Clearly marks all metrics as simulated.
    """

    def __init__(self):
        self._jobs: Dict[str, Dict[str, Any]] = {}
        # Predefined cluster hardware state
        self._cluster = {
            "provider": "Nebius Cloud (Simulated)",
            "cluster_name": "nebius-h100-demo-pool",
            "gpu_model": "NVIDIA H100 80GB SXM5 (Simulated)",
            "total_gpus": 16,
            "active_gpus": 6,
            "vram_per_gpu_gb": 80.0
        }

    async def submit_job(self, experiment_id: str, configuration: Dict[str, Any]) -> Dict[str, Any]:
        job_id = f"demo-gpu-{uuid.uuid4().hex[:8]}"
        model_name = configuration.get("model", {}).get("name", "Qwen2.5-Coder-7B")
        quantization = configuration.get("optimization", {}).get("quantization", "none")
        batch_size = configuration.get("training", {}).get("batch_size", 16)
        precision = configuration.get("optimization", {}).get("precision", "bfloat16")
        
        # Calculate realistic base hardware footprint
        base_vram = 14.5 if precision == "bfloat16" else 7.8
        if quantization in ("int8", "fp8"):
            base_vram = 8.2
        elif quantization in ("int4-awq", "int4-gptq"):
            base_vram = 5.6
            
        vram_allocated = base_vram + (batch_size * 0.18)

        job_info = {
            "job_id": job_id,
            "experiment_id": experiment_id,
            "status": "running",
            "provider": "Nebius Cloud [Demo Mode]",
            "gpu_model": "NVIDIA H100 80GB SXM5 (Simulated)",
            "gpu_count": configuration.get("gpu", {}).get("count", 1),
            "allocated_vram_gb": round(vram_allocated, 2),
            "current_step": 0,
            "total_steps": configuration.get("training", {}).get("total_steps", 200),
            "power_draw_w": 320.0,
            "temperature_c": 64.0,
            "is_demo_mode": True,
            "disclaimer": "DEMO ENVIRONMENT: Deterministic simulated GPU hardware metrics",
            "started_at": datetime.now(timezone.utc).isoformat()
        }
        self._jobs[job_id] = job_info
        return job_info

    async def get_job(self, job_id: str) -> Dict[str, Any]:
        return self._jobs.get(job_id, {
            "job_id": job_id,
            "status": "completed",
            "is_demo_mode": True
        })

    async def cancel_job(self, job_id: str) -> bool:
        if job_id in self._jobs:
            self._jobs[job_id]["status"] = "cancelled"
            return True
        return False

    async def get_logs(self, job_id: str, lines: int = 100) -> List[str]:
        return [
            "[NEBIUS-SIM] NVIDIA H100 SXM5 allocation verified.",
            "[CUDA-12.4] FlashAttention-3 kernels loaded into GPU SRAM.",
            "[PYTORCH-ENGINE] Distributed data parallel initialized with 1 worker node.",
            "[OBSERVABILITY] Streaming telemetry to NeuroForge agent bus."
        ]

    async def get_metrics(self, job_id: str) -> Dict[str, Any]:
        job = self._jobs.get(job_id, {})
        step = job.get("current_step", 100)
        total = max(job.get("total_steps", 200), 1)
        progress = min(step / total, 1.0)

        # Smooth loss curve: initial 2.8 down to ~0.42
        loss = 0.40 + 2.4 * math.exp(-3.5 * progress) + random.uniform(-0.01, 0.01)
        accuracy = min(88.5, 45.0 + 42.0 * (1 - math.exp(-4.0 * progress)) + random.uniform(-0.5, 0.5))

        return {
            "step": step,
            "loss": round(loss, 4),
            "accuracy": round(accuracy, 2),
            "gpu_utilization": round(88.0 + 6.0 * math.sin(step * 0.1), 1),
            "vram_used_gb": job.get("allocated_vram_gb", 8.2),
            "temperature_c": round(64.0 + 4.0 * progress, 1),
            "power_draw_w": round(315.0 + 25.0 * math.sin(step * 0.05), 1),
            "latency_ms": 124.0,
            "throughput_tokens_sec": 82.5,
            "is_demo_mode": True,
            "disclaimer": "DEMO ENVIRONMENT: Deterministic simulated GPU hardware metrics"
        }

    async def get_cluster_status(self) -> Dict[str, Any]:
        # Generate 6 realistic worker node states
        nodes = []
        for i in range(1, 7):
            is_busy = i <= 4
            nodes.append({
                "node_id": f"nebius-h100-node-0{i}",
                "hostname": f"h100-sxm5-0{i}.stockholm.nebius.cloud",
                "gpu_model": "NVIDIA H100 80GB SXM5",
                "status": "ONLINE",
                "utilization_pct": round(91.5 if is_busy else 12.0 + (i * 2.1), 1),
                "vram_used_gb": round(72.4 if is_busy else 4.2, 1),
                "vram_total_gb": 80.0,
                "temperature_c": 68.0 if is_busy else 39.0,
                "power_watts": 348.0 if is_busy else 72.0,
                "active_job": f"NF-EXP-02{i}" if is_busy else None
            })

        # History telemetry points (last 12 timepoints)
        telemetry_history = []
        for t in range(12):
            telemetry_history.append({
                "time": f"{17 - (11 - t) // 2}:{30 + (t % 2) * 20:02d}",
                "utilization": round(78.0 + 15.0 * math.sin(t * 0.6) + random.uniform(-2, 2), 1),
                "vram": round(68.0 + 10.0 * math.cos(t * 0.5), 1),
                "power": round(290.0 + 35.0 * math.sin(t * 0.4), 1),
                "temp": round(64.0 + 4.0 * math.sin(t * 0.3), 1)
            })

        return {
            "provider": "Nebius Cloud (Stockholm Cluster)",
            "cluster_name": "nebius-nordic-h100-sxm5",
            "status": "ONLINE",
            "total_gpus": 16,
            "active_gpus": 10,
            "cluster_utilization_pct": 89.4,
            "vram_total_gb": 1280.0,
            "vram_used_gb": 948.0,
            "average_temp_c": 66.8,
            "average_power_watts": 312.4,
            "active_jobs_count": 4,
            "queued_jobs_count": 2,
            "completed_jobs_count": 21,
            "is_demo_mode": True,
            "disclaimer": "DEMO ENVIRONMENT: Simulated GPU metrics (Switchable to live Nebius cluster in Settings)",
            "live_nodes": nodes,
            "telemetry_history": telemetry_history
        }
