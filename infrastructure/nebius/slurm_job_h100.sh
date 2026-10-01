#!/bin/bash
#SBATCH --job-name=neuroforge-h100
#SBATCH --partition=gpu-h100-sxm5
#SBATCH --nodes=1
#SBATCH --gpus=1
#SBATCH --cpus-per-task=16
#SBATCH --mem=120G
#SBATCH --time=04:00:00
#SBATCH --output=/var/log/neuroforge/%j.out
#SBATCH --error=/var/log/neuroforge/%j.err

echo "=== Nebius Cloud NVIDIA H100 Workload Execution ==="
echo "Node: $SLURMD_NODENAME"
echo "Allocated GPUs: $CUDA_VISIBLE_DEVICES"

nvidia-smi

# Load modules on Nebius cluster
module load cuda/12.4
module load cudnn/9.1

# Execute NeuroForge PyTorch / TensorRT-LLM container
singularity exec --nv \
    --bind /data/neuroforge:/data \
    cr.nebius.ai/neuroforge/runtime:latest \
    python3 -m experiments.runners.pytorch_runner --config /data/config.yaml
