import uuid
from typing import Dict, Any, Optional
from app.agents.state import ResearchState, ExperimentState


class ExperimentAgent:
    """
    Synthesizes model configurations, hyperparameter search vectors,
    and evolutionary mutations based on prior run failure feedback.
    """

    def __init__(self):
        self.name = "Experiment Agent"

    async def execute(self, state: ResearchState, parent_experiment: Optional[Dict[str, Any]] = None, mutation_plan: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        iteration = state.get("current_iteration", 1)
        model_name = "Qwen2.5-Coder-7B-Instruct"
        dataset_name = "GSM8K-Hard-Cleaned"
        
        # Base config
        if not parent_experiment or not mutation_plan:
            # Initial baseline experiment
            config = {
                "experiment_name": f"Baseline-Full-BF16-Epoch3",
                "model": {
                    "name": model_name,
                    "family": "Qwen",
                    "architecture": "Transformer-Decoder-7B"
                },
                "dataset": {
                    "name": dataset_name,
                    "max_length": 2048,
                    "packing": True
                },
                "training": {
                    "epochs": 3,
                    "batch_size": 16,
                    "gradient_accumulation_steps": 2,
                    "learning_rate": 2e-5,
                    "lr_scheduler": "cosine",
                    "warmup_ratio": 0.05,
                    "weight_decay": 0.01,
                    "optimizer": "AdamW-8bit"
                },
                "optimization": {
                    "precision": "bfloat16",
                    "quantization": "none",
                    "peft_type": "lora",
                    "lora_rank": 16,
                    "lora_alpha": 32,
                    "target_modules": ["q_proj", "v_proj"]
                },
                "gpu": {
                    "model": "nvidia-h100-80gb-sxm5",
                    "count": 1,
                    "tensor_parallel": 1
                }
            }
            mutation_label = "Initial Baseline Formulation"
        else:
            # Mutate configuration based on failure analyst directives
            parent_cfg = parent_experiment.get("configuration", {})
            config = dict(parent_cfg)
            mutation_label = mutation_plan.get("mutation_title", "Hyperparameter Mutation")
            
            # Apply mutations
            new_optim = dict(config.get("optimization", {}))
            new_train = dict(config.get("training", {}))
            
            if "quantization" in mutation_plan:
                new_optim["quantization"] = mutation_plan["quantization"]
            if "lora_rank" in mutation_plan:
                new_optim["lora_rank"] = mutation_plan["lora_rank"]
            if "lora_alpha" in mutation_plan:
                new_optim["lora_alpha"] = mutation_plan["lora_alpha"]
            if "batch_size" in mutation_plan:
                new_train["batch_size"] = mutation_plan["batch_size"]
            if "learning_rate" in mutation_plan:
                new_train["learning_rate"] = mutation_plan["learning_rate"]
                
            config["optimization"] = new_optim
            config["training"] = new_train
            config["experiment_name"] = f"Mutated-{mutation_plan.get('code', 'MUT')}-{iteration}"

        exp_id = str(uuid.uuid4())
        experiment_obj: ExperimentState = {
            "experiment_id": exp_id,
            "experiment_number": iteration,
            "name": config["experiment_name"],
            "parent_id": parent_experiment.get("experiment_id") if parent_experiment else None,
            "model": model_name,
            "dataset": dataset_name,
            "configuration": config,
            "status": "queued",
            "metrics": {},
            "mutation_applied": mutation_label,
            "is_best": False
        }

        return {
            "agent": self.name,
            "event": "experiment_generated",
            "message": f"Generated Experiment #{iteration} ({config['experiment_name']}) with {mutation_label}.",
            "experiment": experiment_obj,
            "active_stage": "gpu_training"
        }
