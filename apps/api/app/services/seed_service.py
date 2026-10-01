import uuid
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.entities import (
    User, Workspace, ResearchRun, Hypothesis, Model, Dataset,
    Experiment, ExperimentMetric, ExperimentArtifact, AgentEvent,
    GPUJob, Benchmark, Report
)


async def seed_database(session: AsyncSession):
    # Check if database already seeded
    existing_user = await session.execute(select(User))
    if existing_user.scalars().first():
        return

    now = datetime.now(timezone.utc)

    # 1. User & Workspace
    user = User(
        id=str(uuid.uuid4()),
        name="Dr. Alex Vance",
        email="alex.vance@neuroforge.ai",
        role="Principal AI Systems Architect",
        created_at=now - timedelta(days=7)
    )
    session.add(user)

    workspace = Workspace(
        id=str(uuid.uuid4()),
        name="Frontier Reasoning Lab",
        slug="frontier-reasoning-lab",
        description="Autonomous model architecture optimization on Nebius Cloud NVIDIA H100 clusters.",
        user_id=user.id,
        created_at=now - timedelta(days=7)
    )
    session.add(workspace)

    # 2. Models
    models_data = [
        {
            "name": "Qwen2.5-Coder-7B-Instruct",
            "family": "Qwen",
            "parameter_count": "7.6B",
            "context_window": 32768,
            "default_precision": "bfloat16",
            "supported_quantizations": ["int8", "fp8", "int4-awq", "int4-gptq"],
            "vram_min_gb": 14.5,
            "license": "Apache-2.0",
            "recommended_target": "Mathematical proofs, algorithmic synthesis, multi-step chain-of-thought",
            "description": "High capability 7B dense transformer with superior instruction following and symbolic math retention."
        },
        {
            "name": "Llama-3.1-8B-Instruct",
            "family": "Llama",
            "parameter_count": "8.0B",
            "context_window": 128000,
            "default_precision": "bfloat16",
            "supported_quantizations": ["int8", "fp8", "int4-awq"],
            "vram_min_gb": 16.0,
            "license": "Llama-3.1-Community",
            "recommended_target": "General instruction, logical deduction, long-context reasoning",
            "description": "Meta's flagship open-weights model fine-tuned for high alignment and extensive reasoning context."
        },
        {
            "name": "DeepSeek-R1-Distill-Qwen-7B",
            "family": "DeepSeek",
            "parameter_count": "7.6B",
            "context_window": 65536,
            "default_precision": "bfloat16",
            "supported_quantizations": ["fp8", "int8", "int4-gptq"],
            "vram_min_gb": 14.8,
            "license": "MIT",
            "recommended_target": "Pure reasoning, competition math, self-verification traces",
            "description": "Distilled from DeepSeek-R1 reinforcement learning outputs, specializing in step-by-step reasoning tokens."
        },
        {
            "name": "Mistral-7B-Instruct-v0.3",
            "family": "Mistral",
            "parameter_count": "7.2B",
            "context_window": 32768,
            "default_precision": "bfloat16",
            "supported_quantizations": ["int8", "fp8"],
            "vram_min_gb": 14.0,
            "license": "Apache-2.0",
            "recommended_target": "Fast structured generation, function calling, agent workflows",
            "description": "Sliding window attention optimized transformer with robust function calling capabilities."
        },
        {
            "name": "Gemma-2-9B-It",
            "family": "Gemma",
            "parameter_count": "9.2B",
            "context_window": 8192,
            "default_precision": "bfloat16",
            "supported_quantizations": ["int8", "fp8"],
            "vram_min_gb": 18.2,
            "license": "Gemma-Terms",
            "recommended_target": "Factual QA, STEM problem solving, academic reasoning",
            "description": "Google's 9B model built on transformer decoder with interleaved local and global attention layers."
        },
        {
            "name": "Phi-3.5-mini-instruct",
            "family": "Phi",
            "parameter_count": "3.8B",
            "context_window": 128000,
            "default_precision": "bfloat16",
            "supported_quantizations": ["int8", "int4-awq"],
            "vram_min_gb": 7.5,
            "license": "MIT",
            "recommended_target": "Ultra-low latency edge reasoning, compressed device inference",
            "description": "Highly compact synthetic dataset trained model with exceptional reasoning-to-parameter ratio."
        }
    ]

    model_records = {}
    for m in models_data:
        mod = Model(id=str(uuid.uuid4()), **m, created_at=now - timedelta(days=5))
        session.add(mod)
        model_records[m["name"]] = mod

    # 3. Datasets
    datasets_data = [
        {
            "name": "GSM8K-Hard-Cleaned",
            "task_type": "Multi-step Mathematical Reasoning",
            "sample_count": 25000,
            "token_count": "12.5M",
            "languages": ["English", "Python"],
            "quality_score": 96.4,
            "license": "MIT",
            "description": "Filtered high-difficulty grade school math problems with verified Python execution traces."
        },
        {
            "name": "MATH-Reasoning-v2",
            "task_type": "Competition Mathematics",
            "sample_count": 12500,
            "token_count": "18.2M",
            "languages": ["English", "LaTeX"],
            "quality_score": 98.1,
            "license": "MIT",
            "description": "Challenging problems from AMC 10, AMC 12, and AIME with full LaTeX reasoning trees."
        },
        {
            "name": "HumanEval-Python-Pro",
            "task_type": "Code Generation & Algorithmic Logic",
            "sample_count": 8200,
            "token_count": "6.4M",
            "languages": ["Python"],
            "quality_score": 95.8,
            "license": "Apache-2.0",
            "description": "Algorithmic unit-test verified programming problems targeting zero-shot code synthesis."
        },
        {
            "name": "OpenMathInstruct-2",
            "task_type": "Chain-of-Thought Synthesis",
            "sample_count": 50000,
            "token_count": "45.0M",
            "languages": ["English"],
            "quality_score": 94.0,
            "license": "CDLA-Permissive-2.0",
            "description": "Massive scale math instruction tuning corpus generated with diverse synthesis strategies."
        },
        {
            "name": "ARC-Challenge-Augmented",
            "task_type": "Complex Scientific Question Answering",
            "sample_count": 7800,
            "token_count": "5.1M",
            "languages": ["English"],
            "quality_score": 93.5,
            "license": "CC-BY-SA-4.0",
            "description": "Grade-school level science questions requiring genuine multi-hop reasoning rather than retrieval."
        }
    ]

    dataset_records = {}
    for d in datasets_data:
        ds = Dataset(id=str(uuid.uuid4()), **d, created_at=now - timedelta(days=5))
        session.add(ds)
        dataset_records[d["name"]] = ds

    # 4. Benchmarks
    benchmarks_data = [
        {"name": "GSM8K", "domain": "Multi-step Math", "sample_test_count": 1319, "metrics_evaluated": ["accuracy", "latency", "throughput", "vram"], "description": "Measures multi-hop reasoning over word math problems."},
        {"name": "HumanEval", "domain": "Code Synthesis", "sample_test_count": 164, "metrics_evaluated": ["pass@1", "latency", "memory"], "description": "Zero-shot function implementation benchmark with unit tests."},
        {"name": "MMLU-Pro", "domain": "Multi-discipline Reasoning", "sample_test_count": 12032, "metrics_evaluated": ["accuracy", "f1"], "description": "Advanced multi-choice reasoning across 14 academic and professional domains."},
        {"name": "ARC-Challenge", "domain": "Scientific Reasoning", "sample_test_count": 1172, "metrics_evaluated": ["accuracy", "latency"], "description": "High-complexity science questions filtered against simple word-association heuristics."},
        {"name": "Inference Latency & VRAM Profiler", "domain": "Hardware Optimization", "sample_test_count": 500, "metrics_evaluated": ["latency_ms", "vram_gb", "throughput_tokens_sec"], "description": "Real-time TTFT and inter-token latency profiler for NVIDIA H100 SXM5 architectures."}
    ]
    for b in benchmarks_data:
        bm = Benchmark(id=str(uuid.uuid4()), **b, created_at=now - timedelta(days=5))
        session.add(bm)

    # 5. Signature Demo Research Run: NF-027
    run_id = str(uuid.uuid4())
    run_027 = ResearchRun(
        id=run_id,
        run_code="NF-027",
        title="Reasoning Optimization: Qwen2.5-Coder-7B with Latency & VRAM Bounds",
        goal="Optimize a small language model for reasoning while minimizing inference latency and GPU memory.",
        workspace_id=workspace.id,
        optimization_target="balanced",
        target_accuracy=85.0,
        target_latency_ms=150.0,
        target_vram_gb=8.0,
        gpu_budget_hours=100.0,
        experiment_budget_max=12,
        current_iteration=12,
        status="completed",
        active_stage="completed",
        best_metrics={
            "accuracy": 87.4,
            "latency_ms": 124.0,
            "vram_gb": 7.8,
            "throughput_tokens_sec": 81.0,
            "training_time_minutes": 42.0
        },
        started_at=now - timedelta(hours=3),
        completed_at=now - timedelta(minutes=15),
        created_at=now - timedelta(hours=3, minutes=10)
    )
    session.add(run_027)

    # 6. Hypotheses for NF-027
    hypotheses_data = [
        ("H1", "Full BF16 Baseline establishes the upper accuracy bound for 7B reasoning.", 0.90, "validated", "Yielded 84.8% accuracy but exceeded VRAM (14.8GB) and latency (214ms) bounds."),
        ("H2", "Post-training INT8 weight-only quantization will reduce VRAM by 45% with <1.5% accuracy loss.", 0.86, "validated", "VRAM reduced to 7.9GB; accuracy held at 83.2%."),
        ("H3", "Increasing LoRA adapter rank from r=16 to r=64 will bridge the reasoning accuracy deficit.", 0.91, "validated", "Accuracy climbed from 83.2% to 86.1% with minimal memory overhead."),
        ("H4", "Dynamic KV-cache paging with FP8 block-wise quantization compresses latency <130ms.", 0.94, "validated", "Latency dropped to 124ms, satisfying the <150ms constraint comfortably."),
        ("H5", "Doubling batch size to 32 will accelerate training throughput without memory overflow.", 0.72, "refuted", "Triggered activation memory overflow on 16GB allocation boundary; aborted."),
        ("H6", "Curriculum filtering of dataset step lengths stabilizes gradient variance.", 0.88, "validated", "Validation loss variance decreased by 34% during epochs 2-4."),
        ("H7", "Cosine annealing learning rate schedule avoids local minima in multi-hop attention.", 0.89, "validated", "Delivered smoother convergence than linear decay schedule."),
        ("H8", "Champion configuration (FP8 + LoRA r=64 + Paged Attention) reaches Pareto frontier.", 0.95, "validated", "Achieved 87.4% accuracy, 124ms latency, 7.8GB VRAM (🏆 Champion).")
    ]

    for code, title, conf, stat, out in hypotheses_data:
        hyp = Hypothesis(
            id=str(uuid.uuid4()),
            research_run_id=run_id,
            hypothesis_code=code,
            title=title,
            statement=title,
            rationale="Derived from autonomous research goal analysis and transformer memory bandwidth constraints.",
            confidence_score=conf,
            status=stat,
            outcome_summary=out,
            created_at=now - timedelta(hours=3)
        )
        session.add(hyp)

    # 7. Experiments for NF-027 (12 Experiments with complete lineage)
    # Lineage topology:
    # Exp #01 (root) -> Exp #02 -> Exp #03, Exp #04
    # Exp #03 -> Exp #05
    # Exp #04 -> Exp #06, Exp #07
    # Exp #07 -> Exp #08 (🏆 Best Run)
    # Exp #08 -> Exp #09, Exp #10, Exp #11, Exp #12 (running)

    primary_model = model_records["Qwen2.5-Coder-7B-Instruct"]
    primary_dataset = dataset_records["GSM8K-Hard-Cleaned"]

    exp_ids = {}
    
    # Define the 12 experiments metadata
    exp_defs = [
        # 1. Root baseline (Failed latency & VRAM)
        {
            "num": 1,
            "name": "Baseline-Full-BF16-Batch16",
            "parent": None,
            "status": "failed",
            "accuracy": 84.8,
            "latency": 214.0,
            "vram": 14.8,
            "throughput": 42.0,
            "time": 38.0,
            "bottleneck": "Memory Bandwidth & KV-Cache Footprint",
            "failure": "Latency (214ms > 150ms) and VRAM (14.8GB > 8GB) violated",
            "mutation": "Initial Baseline Formulation",
            "is_best": False,
            "config": {
                "training": {"epochs": 3, "batch_size": 16, "learning_rate": 2e-5, "optimizer": "AdamW-8bit"},
                "optimization": {"precision": "bfloat16", "quantization": "none", "peft_type": "lora", "lora_rank": 16}
            }
        },
        # 2. Memory compression mutation
        {
            "num": 2,
            "name": "INT8-WeightQuant-Batch8",
            "parent": 1,
            "status": "completed",
            "accuracy": 83.2,
            "latency": 142.0,
            "vram": 7.9,
            "throughput": 68.0,
            "time": 32.0,
            "bottleneck": "Reasoning Accuracy Drop",
            "failure": None,
            "mutation": "INT8 Weight Quantization + Batch 8 Reduction",
            "is_best": False,
            "config": {
                "training": {"epochs": 3, "batch_size": 8, "learning_rate": 2.5e-5, "optimizer": "AdamW-8bit"},
                "optimization": {"precision": "int8", "quantization": "int8", "peft_type": "lora", "lora_rank": 16}
            }
        },
        # 3. Branch A: Rank expansion with INT8
        {
            "num": 3,
            "name": "INT8-LoRA-Rank32",
            "parent": 2,
            "status": "completed",
            "accuracy": 84.6,
            "latency": 146.0,
            "vram": 8.1,
            "throughput": 66.0,
            "time": 35.0,
            "bottleneck": None,
            "failure": None,
            "mutation": "LoRA Rank Scaling r=32",
            "is_best": False,
            "config": {
                "training": {"epochs": 4, "batch_size": 8, "learning_rate": 2.2e-5},
                "optimization": {"precision": "int8", "quantization": "int8", "lora_rank": 32}
            }
        },
        # 4. Branch B: FP8 block-wise quantization
        {
            "num": 4,
            "name": "FP8-Blockwise-Batch8",
            "parent": 2,
            "status": "completed",
            "accuracy": 85.1,
            "latency": 131.0,
            "vram": 7.5,
            "throughput": 76.0,
            "time": 29.0,
            "bottleneck": None,
            "failure": None,
            "mutation": "Transition to FP8 Tensor Core Engine",
            "is_best": False,
            "config": {
                "training": {"epochs": 4, "batch_size": 8, "learning_rate": 2e-5},
                "optimization": {"precision": "fp8", "quantization": "fp8", "lora_rank": 16}
            }
        },
        # 5. Branch A sub-experiment: INT8 r=64
        {
            "num": 5,
            "name": "INT8-LoRA-Rank64-Aggressive",
            "parent": 3,
            "status": "completed",
            "accuracy": 85.8,
            "latency": 152.0,
            "vram": 8.3,
            "throughput": 63.0,
            "time": 40.0,
            "bottleneck": "Slight latency regression",
            "failure": None,
            "mutation": "Maximal Rank r=64 on INT8",
            "is_best": False,
            "config": {
                "training": {"epochs": 4, "batch_size": 8, "learning_rate": 2e-5},
                "optimization": {"precision": "int8", "quantization": "int8", "lora_rank": 64}
            }
        },
        # 6. Branch B failure test: Aggressive Batch 32
        {
            "num": 6,
            "name": "FP8-Batch32-StressTest",
            "parent": 4,
            "status": "failed",
            "accuracy": 79.4,
            "latency": 188.0,
            "vram": 11.2,
            "throughput": 92.0,
            "time": 18.0,
            "bottleneck": "Activation Memory Overflow",
            "failure": "OOM risk & activation memory spiked to 11.2GB",
            "mutation": "Batch Size Scaling 8 -> 32",
            "is_best": False,
            "config": {
                "training": {"epochs": 2, "batch_size": 32, "learning_rate": 4e-5},
                "optimization": {"precision": "fp8", "quantization": "fp8", "lora_rank": 16}
            }
        },
        # 7. Branch B refinement: FP8 + LoRA r=32 + Paged KV
        {
            "num": 7,
            "name": "FP8-PagedKV-LoRA-Rank32",
            "parent": 4,
            "status": "completed",
            "accuracy": 86.3,
            "latency": 128.0,
            "vram": 7.6,
            "throughput": 79.0,
            "time": 34.0,
            "bottleneck": None,
            "failure": None,
            "mutation": "Paged Attention + LoRA r=32",
            "is_best": False,
            "config": {
                "training": {"epochs": 5, "batch_size": 8, "learning_rate": 2e-5},
                "optimization": {"precision": "fp8", "quantization": "fp8", "lora_rank": 32, "paged_attention": True}
            }
        },
        # 8. 🏆 CHAMPION EXPERIMENT #08
        {
            "num": 8,
            "name": "Champion-FP8-LoRA-Rank64-PagedKV",
            "parent": 7,
            "status": "completed",
            "accuracy": 87.4,
            "latency": 124.0,
            "vram": 7.8,
            "throughput": 81.0,
            "time": 42.0,
            "bottleneck": None,
            "failure": None,
            "mutation": "Synergistic LoRA r=64 + FP8 TensorRT Kernel",
            "is_best": True,
            "config": {
                "training": {
                    "epochs": 5,
                    "batch_size": 8,
                    "gradient_accumulation_steps": 2,
                    "learning_rate": 1.8e-5,
                    "lr_scheduler": "cosine",
                    "warmup_ratio": 0.06,
                    "weight_decay": 0.01,
                    "optimizer": "AdamW-8bit"
                },
                "optimization": {
                    "precision": "fp8",
                    "quantization": "fp8_e4m3",
                    "peft_type": "lora",
                    "lora_rank": 64,
                    "lora_alpha": 128,
                    "target_modules": ["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
                    "paged_attention": True,
                    "flash_attention": "v3"
                },
                "gpu": {
                    "model": "nvidia-h100-80gb-sxm5",
                    "count": 1,
                    "tensor_parallel": 1
                }
            }
        },
        # 9. Followup: 4-bit AWQ exploration
        {
            "num": 9,
            "name": "AWQ-INT4-LoRA-Rank64",
            "parent": 8,
            "status": "completed",
            "accuracy": 85.2,
            "latency": 112.0,
            "vram": 5.8,
            "throughput": 88.0,
            "time": 30.0,
            "bottleneck": "Quantization Accuracy Degradation",
            "failure": None,
            "mutation": "INT4 AWQ Ultra-Compression",
            "is_best": False,
            "config": {
                "training": {"epochs": 4, "batch_size": 8, "learning_rate": 1.5e-5},
                "optimization": {"precision": "int4-awq", "quantization": "int4", "lora_rank": 64}
            }
        },
        # 10. Followup: Extreme Rank 128 (Diminishing returns)
        {
            "num": 10,
            "name": "FP8-LoRA-Rank128-DeepTuning",
            "parent": 8,
            "status": "completed",
            "accuracy": 87.5,
            "latency": 136.0,
            "vram": 8.4,
            "throughput": 75.0,
            "time": 48.0,
            "bottleneck": "VRAM slightly exceeded 8.0GB threshold",
            "failure": None,
            "mutation": "Double LoRA Rank 64 -> 128",
            "is_best": False,
            "config": {
                "training": {"epochs": 5, "batch_size": 8, "learning_rate": 1.5e-5},
                "optimization": {"precision": "fp8", "quantization": "fp8", "lora_rank": 128}
            }
        },
        # 11. Followup: Alternative optimizer
        {
            "num": 11,
            "name": "FP8-Rank64-Lion-Optimizer",
            "parent": 8,
            "status": "completed",
            "accuracy": 86.8,
            "latency": 124.0,
            "vram": 7.7,
            "throughput": 82.0,
            "time": 39.0,
            "bottleneck": None,
            "failure": None,
            "mutation": "Lion Optimizer Swap for Memory Efficiency",
            "is_best": False,
            "config": {
                "training": {"epochs": 5, "batch_size": 8, "optimizer": "Lion"},
                "optimization": {"precision": "fp8", "quantization": "fp8", "lora_rank": 64}
            }
        },
        # 12. Active live experiment
        {
            "num": 12,
            "name": "FP8-Rank64-MultiTask-CoT",
            "parent": 8,
            "status": "running",
            "accuracy": 86.9,
            "latency": 125.0,
            "vram": 7.8,
            "throughput": 80.5,
            "time": 25.0,
            "bottleneck": None,
            "failure": None,
            "mutation": "Multi-Task Chain-of-Thought Synthesis",
            "is_best": False,
            "config": {
                "training": {"epochs": 6, "batch_size": 8, "learning_rate": 1.6e-5},
                "optimization": {"precision": "fp8", "quantization": "fp8", "lora_rank": 64}
            }
        }
    ]

    champion_exp_id = None

    for item in exp_defs:
        eid = str(uuid.uuid4())
        exp_ids[item["num"]] = eid
        parent_eid = exp_ids.get(item["parent"]) if item["parent"] else None

        if item["is_best"]:
            champion_exp_id = eid

        exp = Experiment(
            id=eid,
            experiment_number=item["num"],
            name=item["name"],
            research_run_id=run_id,
            parent_experiment_id=parent_eid,
            model_id=primary_model.id,
            dataset_id=primary_dataset.id,
            iteration=item["num"],
            status=item["status"],
            is_best_run=item["is_best"],
            configuration=item["config"],
            accuracy=item["accuracy"],
            latency_ms=item["latency"],
            vram_gb=item["vram"],
            throughput_tokens_sec=item["throughput"],
            training_time_minutes=item["time"],
            gpu_utilization_avg=91.4,
            power_watts_avg=325.0,
            temperature_c_avg=66.5,
            metrics_summary={
                "accuracy": item["accuracy"],
                "latency_ms": item["latency"],
                "vram_gb": item["vram"],
                "throughput_tokens_sec": item["throughput"],
                "eval_samples": 1319
            },
            failure_reason=item["failure"],
            bottleneck_detected=item["bottleneck"],
            mutation_applied=item["mutation"],
            started_at=now - timedelta(hours=3, minutes=-(item["num"] * 12)),
            completed_at=(now - timedelta(hours=3, minutes=-(item["num"] * 12) - int(item["time"]))) if item["status"] != "running" else None,
            created_at=now - timedelta(hours=3, minutes=-(item["num"] * 12))
        )
        session.add(exp)

        # Add detailed step metrics for the champion experiment #08
        if item["num"] == 8:
            for step in range(1, 11):
                p = step / 10.0
                loss_val = round(0.38 + 2.1 * (2.718 ** (-3.8 * p)), 4)
                acc_val = round(48.0 + 39.4 * (1 - (2.718 ** (-4.2 * p))), 2)
                em = ExperimentMetric(
                    id=str(uuid.uuid4()),
                    experiment_id=eid,
                    step=step * 20,
                    epoch=round(step * 0.5, 1),
                    loss=loss_val,
                    val_loss=round(loss_val * 1.08, 4),
                    accuracy=acc_val,
                    latency_ms=124.0,
                    vram_gb=7.8,
                    throughput_tokens_sec=81.0,
                    gpu_util_pct=round(88.0 + 6.0 * (step % 2), 1),
                    power_watts=round(310.0 + 15.0 * (step % 3), 1),
                    temp_c=round(63.0 + step * 0.4, 1),
                    timestamp=now - timedelta(minutes=45 - step * 3)
                )
                session.add(em)

            # Add artifacts for experiment #08
            art1 = ExperimentArtifact(
                id=str(uuid.uuid4()),
                experiment_id=eid,
                artifact_type="adapter_lora",
                name="adapter_model.safetensors",
                path_or_uri="s3://neuroforge-artifacts/runs/NF-027/exp-008/adapter_model.safetensors",
                size_bytes=134217728,
                metadata_json={"rank": 64, "alpha": 128, "target": "all-linear"}
            )
            art2 = ExperimentArtifact(
                id=str(uuid.uuid4()),
                experiment_id=eid,
                artifact_type="trtllm_engine",
                name="qwen7b_fp8_engine.plan",
                path_or_uri="s3://neuroforge-artifacts/runs/NF-027/exp-008/qwen7b_fp8_engine.plan",
                size_bytes=7864320000,
                metadata_json={"precision": "fp8", "paged_kv": True}
            )
            session.add(art1)
            session.add(art2)

    # Update research run with best experiment reference
    run_027.best_experiment_id = champion_exp_id

    # 8. Agent Events for NF-027 (Structured Activity Log)
    agent_logs = [
        ("Research Agent", "goal_analyzed", "Analyzed research objective: Optimize small language model reasoning with latency <150ms and VRAM <8GB.", "success", 420),
        ("Research Agent", "hypotheses_created", "Formulated 8 falsifiable hypotheses (H1 to H8) covering quantization, LoRA ranks, and KV-cache dynamics.", "success", 680),
        ("Dataset Agent", "dataset_validated", "Validated dataset 'GSM8K-Hard-Cleaned' (Quality score 96.4/100, 25,000 samples). Preprocessing packed into 2048 sequence chunks.", "success", 1240),
        ("Experiment Agent", "experiment_created", "Synthesized baseline configuration (Experiment #01) using full BF16 on Qwen2.5-Coder-7B.", "success", 310),
        ("GPU Agent", "job_scheduled", "Allocated NVIDIA H100 80GB SXM5 node on Nebius Cloud (Stockholm pool).", "success", 850),
        ("Evaluation Agent", "benchmark_completed", "Benchmark completed for Experiment #01. Accuracy: 84.8%, Latency: 214 ms (EXCEEDED), VRAM: 14.8 GB (EXCEEDED).", "warning", 3200),
        ("Failure Analyst", "bottleneck_diagnosed", "Target latency and VRAM constraints violated. Diagnosed bottleneck: Memory bandwidth pressure during dense unquantized token decode.", "warning", 540),
        ("Experiment Agent", "mutation_applied", "Applied mutation: Switched weights to INT8 and compressed per-device batch size from 16 to 8 (Experiment #02).", "success", 290),
        ("GPU Agent", "job_scheduled", "Dispatched Experiment #02 on NVIDIA H100. VRAM dropped to 7.9GB.", "success", 910),
        ("Evaluation Agent", "benchmark_completed", "Experiment #02 completed. VRAM: 7.9 GB (PASSED), Latency: 142 ms (PASSED), Accuracy: 83.2% (Need +1.8%).", "info", 2800),
        ("Failure Analyst", "bottleneck_diagnosed", "Accuracy deficit observed. Recommending LoRA rank scaling to r=64 and transitioning to FP8 block-wise quantization.", "info", 460),
        ("Experiment Agent", "mutation_applied", "Formulated Experiment #08: Synergistic LoRA r=64 + FP8 TensorRT-LLM Paged Attention.", "success", 330),
        ("GPU Agent", "job_scheduled", "Dispatched Experiment #08 to Nebius H100 cluster. Step loss smoothly converged to 0.41.", "success", 880),
        ("Evaluation Agent", "benchmark_completed", "🏆 EXPERIMENT #08 EVALUATION: Accuracy: 87.4% (EXCEEDED), Latency: 124 ms (OPTIMAL), VRAM: 7.8 GB (OPTIMAL), Throughput: 81 tokens/s.", "success", 3100),
        ("Research Writer", "report_compiled", "Generated comprehensive scientific research report and verified Python reproduction code.", "success", 1520)
    ]

    for agent, evt, msg, stat, dur in agent_logs:
        ev = AgentEvent(
            id=str(uuid.uuid4()),
            research_run_id=run_id,
            experiment_id=champion_exp_id,
            agent_name=agent,
            event_type=evt,
            message=msg,
            status=stat,
            duration_ms=dur,
            metadata_json={"simulated_notice": "DEMO ENVIRONMENT: Realistic deterministic sample event"},
            created_at=now - timedelta(hours=2, minutes=-(dur // 60))
        )
        session.add(ev)

    # 9. GPU Jobs (Active & Completed Jobs on Nebius Cluster)
    gpu_job_08 = GPUJob(
        id=str(uuid.uuid4()),
        experiment_id=champion_exp_id,
        cluster_name="nebius-nordic-h100-sxm5",
        provider="Nebius Cloud",
        gpu_model="NVIDIA H100 80GB SXM5",
        gpu_count=1,
        status="completed",
        allocated_vram_gb=80.0,
        power_draw_w=318.0,
        temperature_c=65.2,
        memory_used_gb=7.8,
        utilization_pct=92.4,
        started_at=now - timedelta(hours=1, minutes=30),
        completed_at=now - timedelta(minutes=48)
    )
    session.add(gpu_job_08)

    # 10. Research Report for NF-027
    best_config_yaml_str = """model:
  name: Qwen/Qwen2.5-Coder-7B-Instruct
  family: Qwen
  architecture: Transformer-Decoder-7B

dataset:
  name: GSM8K-Hard-Cleaned
  max_length: 2048
  packing: true

training:
  epochs: 5
  batch_size: 8
  gradient_accumulation_steps: 2
  learning_rate: 0.000018
  lr_scheduler: cosine
  warmup_ratio: 0.06
  optimizer: AdamW-8bit

optimization:
  precision: fp8
  quantization: fp8_e4m3
  peft_type: lora
  lora_rank: 64
  lora_alpha: 128
  target_modules: [q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj]
  paged_attention: true
  flash_attention: v3

gpu:
  provider: nebius-cloud
  model: nvidia-h100-80gb-sxm5
  count: 1
"""

    report_027 = Report(
        id=str(uuid.uuid4()),
        research_run_id=run_id,
        title="Autonomous Reasoning Optimization on NVIDIA H100: Qwen2.5-Coder-7B",
        abstract=(
            "We present an empirical report generated by NeuroForge AI on autonomous reasoning model optimization. "
            "Across 12 experiments, the system evaluated architectural trade-offs across quantization, LoRA adapter ranks, "
            "and memory layouts. The champion configuration (Experiment #08) achieved 87.4% accuracy on GSM8K while maintaining "
            "an inference latency of 124 ms and a peak VRAM footprint of 7.8 GB on an NVIDIA H100 GPU."
        ),
        research_question="Optimize a small language model for reasoning while minimizing inference latency and GPU memory.",
        hypotheses_analyzed=[{"code": h[0], "title": h[1], "status": h[3]} for h in hypotheses_data],
        methodology="Autonomous closed-loop hypothesis-experimentation-evaluation cycle executing on Nebius Cloud NVIDIA H100 infrastructure.",
        models_evaluated=["Qwen2.5-Coder-7B-Instruct", "Llama-3.1-8B-Instruct"],
        datasets_used=["GSM8K-Hard-Cleaned", "MATH-Reasoning-v2"],
        experiments_summary=[{"num": e["num"], "name": e["name"], "accuracy": e["accuracy"], "latency": e["latency"], "vram": e["vram"], "is_best": e["is_best"]} for e in exp_defs],
        results_narrative=(
            "The initial baseline (Experiment #01) exhibited severe latency degradation (214 ms) due to uncompressed memory bandwidth pressure. "
            "Subsequent evolutionary iterations demonstrated that FP8 block-wise quantization with Paged Attention drastically mitigated decode latency, "
            "while expanding LoRA adapter rank to r=64 recovered multi-hop reasoning performance to 87.4%."
        ),
        failure_analysis_narrative=(
            "Experiments #01, #05, and #06 failed constraint boundaries due to KV-cache allocation inflation and activation memory spikes. "
            "The Failure Analyst successfully traced root causes to large batch sizes and unquantized attention projections."
        ),
        best_experiment_code="EXP-008",
        best_config_yaml=best_config_yaml_str,
        limitations="Evaluation was performed on mathematical and reasoning-dense benchmarks; multi-turn conversational context was held constant at 2048 tokens.",
        conclusion="NeuroForge AI autonomously discovered a Pareto-optimal configuration that outperforms the baseline by +2.6% accuracy while achieving 42% faster latency and 47% lower VRAM.",
        reproduction_instructions="Clone the configuration YAML and run the provided Python reproduction script via PyTorch or TensorRT-LLM.",
        markdown_content="""# Autonomous Reasoning Optimization on NVIDIA H100: Qwen2.5-Coder-7B

**Research Run ID:** `NF-027`  
**Lab:** NeuroForge AI Autonomous Research Lab  
**Hardware Cluster:** Nebius Cloud • NVIDIA H100 80GB SXM5  
**Status:** Completed  

---

## Executive Summary
NeuroForge AI evaluated 12 distinct configurations in an autonomous loop to optimize reasoning performance under strict latency (<150ms) and memory (<8GB) budgets.

* **Champion Run:** Experiment #08
* **Accuracy:** 87.4% (Target: >85.0%)
* **Latency:** 124 ms (Target: <150 ms)
* **VRAM:** 7.8 GB (Target: <8.0 GB)
* **Throughput:** 81 tokens/sec

```yaml
""" + best_config_yaml_str + """```
""",
        json_content={
            "run_code": "NF-027",
            "best_experiment_number": 8,
            "best_accuracy": 87.4,
            "best_latency_ms": 124.0,
            "best_vram_gb": 7.8
        },
        created_at=now - timedelta(minutes=15)
    )
    session.add(report_027)

    await session.commit()
