import asyncio
from typing import Dict, Any, List, Optional, Callable
from app.agents.state import ResearchState, ExperimentState
from app.agents.research_agent import ResearchAgent
from app.agents.dataset_agent import DatasetAgent
from app.agents.experiment_agent import ExperimentAgent
from app.agents.gpu_agent import GPUAgent
from app.agents.evaluation_agent import EvaluationAgent
from app.agents.failure_analysis_agent import FailureAnalysisAgent
from app.agents.research_writer_agent import ResearchWriterAgent


class ResearchOrchestrator:
    """
    LangGraph-style autonomous multi-agent state machine.
    Drives the closed research loop:
    Goal -> Hypotheses -> Dataset -> Experiment -> GPU Exec -> Eval -> Failure Analysis -> Mutation -> Best Selection -> Report.
    """

    def __init__(self, event_callback: Optional[Callable[[Dict[str, Any]], Any]] = None):
        self.research_agent = ResearchAgent()
        self.dataset_agent = DatasetAgent()
        self.experiment_agent = ExperimentAgent()
        self.gpu_agent = GPUAgent()
        self.evaluation_agent = EvaluationAgent()
        self.failure_agent = FailureAnalysisAgent()
        self.writer_agent = ResearchWriterAgent()
        self.event_callback = event_callback

    async def emit_event(self, event_data: Dict[str, Any]):
        if self.event_callback:
            try:
                res = self.event_callback(event_data)
                if asyncio.iscoroutine(res):
                    await res
            except Exception as e:
                print(f"[Orchestrator] Callback dispatch warning: {e}")

    async def run(self, initial_state: ResearchState) -> ResearchState:
        state = dict(initial_state)
        state["status"] = "running"
        state["experiments"] = state.get("experiments", [])
        state["failures"] = state.get("failures", [])
        max_experiments = state.get("max_experiments", 8)
        current_iteration = 1

        # 1. Research Agent: Formulate Goal and Hypotheses
        await self.emit_event({
            "agent": "Research Agent",
            "event": "goal_analysis_started",
            "message": f"Analyzing research objective: '{state.get('goal')}'...",
            "stage": "goal_analysis"
        })
        research_out = await self.research_agent.execute(state)
        state["hypotheses"] = research_out["hypotheses"]
        state["active_stage"] = "hypothesis_generation"
        await self.emit_event(research_out)

        # 2. Dataset Agent: Select and Validate Dataset
        await self.emit_event({
            "agent": "Dataset Agent",
            "event": "dataset_selection_started",
            "message": "Searching curated datasets for optimal reasoning coverage...",
            "stage": "dataset_prep"
        })
        dataset_out = await self.dataset_agent.execute(state)
        state["datasets"] = [dataset_out["dataset"]]
        state["active_stage"] = "dataset_prep"
        await self.emit_event(dataset_out)

        # Iterative Loop
        parent_exp: Optional[Dict[str, Any]] = None
        mutation_plan: Optional[Dict[str, Any]] = None
        best_exp: Optional[ExperimentState] = None

        while current_iteration <= max_experiments:
            state["current_iteration"] = current_iteration

            # 3. Experiment Agent: Design / Mutate Configuration
            exp_out = await self.experiment_agent.execute(state, parent_exp, mutation_plan)
            current_exp = exp_out["experiment"]
            state["current_experiment"] = current_exp
            state["active_stage"] = "experiment_design"
            await self.emit_event(exp_out)

            # 4. GPU Agent: Execute Workload on Compute Cluster
            state["active_stage"] = "gpu_training"
            await self.emit_event({
                "agent": "GPU Agent",
                "event": "job_scheduled",
                "message": f"Allocating NVIDIA H100 GPU for Experiment #{current_iteration}...",
                "stage": "gpu_training"
            })
            gpu_out = await self.gpu_agent.execute(current_exp)
            telemetry = gpu_out["telemetry"]
            await self.emit_event(gpu_out)

            # 5. Evaluation Agent: Measure Performance on Benchmarks
            state["active_stage"] = "evaluation"
            eval_out = await self.evaluation_agent.execute(state, current_exp, telemetry)
            metrics = eval_out["metrics"]
            current_exp["metrics"] = metrics
            passed = eval_out["passed"]
            await self.emit_event(eval_out)

            if passed:
                current_exp["status"] = "completed"
                current_exp["is_best"] = True
                best_exp = current_exp
                state["best_experiment"] = best_exp
                state["experiments"].append(current_exp)
                await self.emit_event({
                    "agent": "Decision Agent",
                    "event": "target_achieved",
                    "message": f"🏆 Experiment #{current_iteration} satisfies all target constraints (Accuracy: {metrics['accuracy']}%, Latency: {metrics['latency_ms']}ms, VRAM: {metrics['vram_gb']}GB)!",
                    "stage": "evaluation"
                })
                break
            else:
                current_exp["status"] = "failed"
                # 6. Failure Analysis Agent: Diagnose Bottleneck and Generate Mutation
                state["active_stage"] = "failure_analysis"
                failure_out = await self.failure_agent.execute(state, current_exp, eval_out)
                current_exp["bottleneck"] = failure_out["bottleneck"]
                current_exp["failure_reason"] = "Target constraint violation"
                mutation_plan = failure_out["mutation_plan"]
                state["failures"].append(failure_out)
                state["experiments"].append(current_exp)
                parent_exp = current_exp
                await self.emit_event(failure_out)

                current_iteration += 1

        # Fallback if loop ended without explicit pass
        if not best_exp and state["experiments"]:
            # Pick highest accuracy among runs
            best_exp = max(state["experiments"], key=lambda e: e.get("metrics", {}).get("accuracy", 0.0))
            best_exp["is_best"] = True
            state["best_experiment"] = best_exp

        # 7. Research Writer Agent: Compile Complete Scientific Report
        state["active_stage"] = "report_generation"
        await self.emit_event({
            "agent": "Research Writer",
            "event": "report_generation_started",
            "message": "Synthesizing experiment lineage, Pareto frontier, and reproduction manifest...",
            "stage": "report_generation"
        })
        report_out = await self.writer_agent.execute(state)
        state["final_report"] = report_out["report"]
        state["status"] = "completed"
        state["active_stage"] = "completed"
        state["is_completed"] = True
        await self.emit_event(report_out)

        return state
