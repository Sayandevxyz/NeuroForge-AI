# Nebius Cloud × NVIDIA Integration Guide

## Overview

NeuroForge natively connects to Nebius Cloud infrastructure to provision high-performance NVIDIA H100 80GB SXM5 compute instances.

## Environment Configuration

To connect NeuroForge to a live Nebius Cloud cluster:

1. Obtain your Nebius API Key from the Nebius Cloud Console.
2. Configure `.env` with the following variables:

```env
DEMO_MODE=false
GPU_PROVIDER=nebius
NVIDIA_BACKEND=pytorch

NEBIUS_API_KEY=your_nebius_api_key_here
NEBIUS_PROJECT_ID=your_project_id
NEBIUS_CLUSTER_ID=nebius-nordic-h100-sxm5
NEBIUS_REGION=eu-north1
```

## Supported NVIDIA Execution Runtimes

* **PyTorch 2.4**: Fully Sharded Data Parallel (FSDP), Distributed Data Parallel (DDP), FlashAttention-3 kernels.
* **NVIDIA TensorRT-LLM**: Low-latency FP8 block-wise quantization, Paged KV-Cache allocator, In-flight batching.
* **NVIDIA NeMo Framework**: Megatron-LM tensor and pipeline parallelism across multi-node InfiniBand clusters.
