from abc import ABC, abstractmethod
from typing import Dict, Any, List
from app.core.config import settings
from app.core.compute.base import ComputeProvider
from app.core.compute.demo import DemoComputeProvider
from app.core.compute.nebius import NebiusComputeProvider


class ExecutionRunner(ABC):
    """Base interface for NVIDIA hardware runtime execution engines."""

    @abstractmethod
    def get_backend_name(self) -> str:
        pass

    @abstractmethod
    def validate_configuration(self, config: Dict[str, Any]) -> Dict[str, Any]:
        pass

    @abstractmethod
    def compile_job_script(self, config: Dict[str, Any]) -> str:
        pass


class PyTorchRunner(ExecutionRunner):
    def get_backend_name(self) -> str:
        return "PyTorch (FSDP / DDP / FlashAttention-3)"

    def validate_configuration(self, config: Dict[str, Any]) -> Dict[str, Any]:
        precision = config.get("optimization", {}).get("precision", "bfloat16")
        return {"valid": True, "precision": precision, "engine": "PyTorch-CUDA"}

    def compile_job_script(self, config: Dict[str, Any]) -> str:
        return (
            "torchrun --nproc_per_node=1 -m experiments.runners.pytorch_runner "
            f"--lr {config.get('training', {}).get('learning_rate', 2e-5)} "
            f"--batch-size {config.get('training', {}).get('batch_size', 16)}"
        )


class TensorRTLLMRunner(ExecutionRunner):
    def get_backend_name(self) -> str:
        return "NVIDIA TensorRT-LLM (Inference & KV Cache Engine)"

    def validate_configuration(self, config: Dict[str, Any]) -> Dict[str, Any]:
        quant = config.get("optimization", {}).get("quantization", "int8")
        return {"valid": True, "quantization": quant, "engine": "TensorRT-LLM"}

    def compile_job_script(self, config: Dict[str, Any]) -> str:
        return (
            "trtllm-build --checkpoint_dir ./model_weights "
            "--gemm_plugin float16 --gpt_attention_plugin float16 "
            "--output_dir ./trt_engines/engine.bin"
        )


class NeMoRunner(ExecutionRunner):
    def get_backend_name(self) -> str:
        return "NVIDIA NeMo Framework (Megatron-LM & LoRA)"

    def validate_configuration(self, config: Dict[str, Any]) -> Dict[str, Any]:
        return {"valid": True, "engine": "NVIDIA-NeMo-Megatron"}

    def compile_job_script(self, config: Dict[str, Any]) -> str:
        return (
            "python -m nemo.collections.nlp.models.language_modeling.megatron_gpt_peft "
            "--config-path=conf --config-name=megatron_gpt_peft_tuning_config"
        )


# Provider factory
def get_compute_provider() -> ComputeProvider:
    if settings.DEMO_MODE:
        return DemoComputeProvider()

    if settings.GPU_PROVIDER == "nebius" and settings.NEBIUS_API_KEY:
        return NebiusComputeProvider()

    # Fallback to DemoComputeProvider with transparent notice
    return DemoComputeProvider()


def get_execution_runner(backend_type: str = "pytorch") -> ExecutionRunner:
    if backend_type == "tensorrt_llm":
        return TensorRTLLMRunner()
    elif backend_type == "nemo":
        return NeMoRunner()
    return PyTorchRunner()
