from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from datetime import datetime


class ComputeProvider(ABC):
    """
    Abstract interface for GPU compute providers (Nebius Cloud, Local NVIDIA, Demo Simulation).
    """

    @abstractmethod
    async def submit_job(self, experiment_id: str, configuration: Dict[str, Any]) -> Dict[str, Any]:
        """Submits an experiment training or optimization job."""
        pass

    @abstractmethod
    async def get_job(self, job_id: str) -> Dict[str, Any]:
        """Gets current job status, execution state, and allocation."""
        pass

    @abstractmethod
    async def cancel_job(self, job_id: str) -> bool:
        """Terminates a running job."""
        pass

    @abstractmethod
    async def get_logs(self, job_id: str, lines: int = 100) -> List[str]:
        """Streams training console logs."""
        pass

    @abstractmethod
    async def get_metrics(self, job_id: str) -> Dict[str, Any]:
        """Retrieves real-time telemetry (GPU util, VRAM, temp, power, step loss)."""
        pass

    @abstractmethod
    async def get_cluster_status(self) -> Dict[str, Any]:
        """Returns the cluster-wide hardware health and utilization stats."""
        pass
