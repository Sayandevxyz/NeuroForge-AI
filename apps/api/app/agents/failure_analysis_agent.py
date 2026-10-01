from typing import Dict, Any
from app.agents.state import ResearchState, ExperimentState


class FailureAnalysisAgent:
    """
    Diagnoses performance bottlenecks, performs root cause attribution,
    and devises hyperparameter mutation strategies to recover target performance.
    """

    def __init__(self):
        self.name = "Failure Analyst"

    async def execute(self, state: ResearchState, experiment: ExperimentState, eval_results: Dict[str, Any]) -> Dict[str, Any]:
        metrics = eval_results.get("metrics", {})
        acc = metrics.get("accuracy", 0.0)
        lat = metrics.get("latency_ms", 999.0)
        vram = metrics.get("vram_gb", 99.0)

        target_acc = state.get("target_accuracy", 85.0)
        target_lat = state.get("target_latency_ms", 150.0)
        target_vram = state.get("target_vram_gb", 8.0)

        bottlenecks = []
        possible_causes = []
        recommendations = []
        mutation_plan: Dict[str, Any] = {}

        if lat > target_lat:
            bottlenecks.append("Inference Latency Bottleneck")
            possible_causes.append("Dense FP16/BF16 memory bandwidth saturation during token decode")
            possible_causes.append("KV-cache size exceeding L2 cache residency")
            recommendations.append("Switch weights to FP8 block-wise quantization")
            recommendations.append("Apply Paged Attention with dynamic KV-cache compression")
            mutation_plan["quantization"] = "fp8"
            mutation_plan["code"] = "FP8-KV"
            mutation_plan["mutation_title"] = "FP8 Quantization + KV-Cache Paging"

        if vram > target_vram:
            bottlenecks.append("VRAM Footprint Pressure")
            possible_causes.append("Unquantized optimizer states and batch size 16 activation footprint")
            recommendations.append("Reduce per-device batch size from 16 to 8 with gradient accumulation")
            mutation_plan["batch_size"] = 8
            if not mutation_plan.get("quantization"):
                mutation_plan["quantization"] = "int8"
                mutation_plan["mutation_title"] = "INT8 Weights + Batch Size Compression"

        if acc < target_acc:
            bottlenecks.append("Reasoning Accuracy Drop")
            possible_causes.append("LoRA rank r=16 too low to capture multi-hop reasoning transitions")
            recommendations.append("Scale LoRA rank to r=64 with alpha=128 on all linear layers")
            mutation_plan["lora_rank"] = 64
            mutation_plan["lora_alpha"] = 128
            mutation_plan["code"] = "LORA-R64"
            mutation_plan["mutation_title"] = "LoRA Rank Scaling (r=64) + Attention Tuning"

        bottleneck_summary = " & ".join(bottlenecks) if bottlenecks else "Sub-optimal Pareto Frontier"

        return {
            "agent": self.name,
            "event": "failure_analyzed",
            "message": f"Bottleneck identified: {bottleneck_summary}. Recommending mutation: {mutation_plan.get('mutation_title', 'Parameter Tuning')}.",
            "bottleneck": bottleneck_summary,
            "causes": possible_causes,
            "recommendations": recommendations,
            "mutation_plan": mutation_plan,
            "active_stage": "experiment_design"
        }
