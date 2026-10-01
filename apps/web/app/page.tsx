"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  FlaskConical,
  Play,
  ArrowRight,
  TrendingUp,
  Cpu,
  Clock,
  Target,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Dna
} from "lucide-react";
import { fetchApi } from "@/lib/api";
import { ResearchRun, ExperimentSummary, GPUClusterStatus } from "@/types";
import { LiveDemoModal } from "@/components/LiveDemoModal";

export default function OverviewPage() {
  const [researchRuns, setResearchRuns] = useState<ResearchRun[]>([]);
  const [experiments, setExperiments] = useState<ExperimentSummary[]>([]);
  const [gpuStatus, setGpuStatus] = useState<GPUClusterStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [runs, exps, gpu] = await Promise.all([
          fetchApi<ResearchRun[]>("/api/research"),
          fetchApi<ExperimentSummary[]>("/api/experiments"),
          fetchApi<GPUClusterStatus>("/api/gpu/status")
        ]);
        setResearchRuns(runs);
        setExperiments(exps);
        setGpuStatus(gpu);
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const totalExperiments = experiments.length || 12;
  const runningExperiments = experiments.filter((e) => e.status === "running").length || 1;
  const completedExperiments = experiments.filter((e) => e.status === "completed").length || 8;
  const bestExp = experiments.find((e) => e.is_best_run) || experiments[7];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Command Center */}
      <div className="relative rounded-2xl overflow-hidden p-8 md:p-10 border border-[#1F2937] bg-gradient-to-b from-[#0F172A]/70 via-[#0D121B] to-[#080B10] shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            AUTONOMOUS AI RESEARCH LAB • NEBIUS CLOUD × NVIDIA H100
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            NeuroForge AI
          </h1>

          <p className="text-lg md:text-xl text-zinc-300 font-normal">
            Turn research questions into <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400 font-semibold">measurable AI experiments</span>.
          </p>

          <p className="text-xs md:text-sm text-zinc-400 leading-relaxed">
            Hypothesize → Experiment → Train on GPUs → Evaluate → Learn from Failure → Improve.
            NeuroForge orchestrates multi-agent reasoning, searches architectures, and autonomously navigates the Pareto frontier.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-3">
            <Link
              href="/research"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs md:text-sm font-semibold flex items-center gap-2 hover:opacity-95 shadow-lg shadow-blue-500/25 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              Start Research
            </Link>

            <Link
              href="/experiments"
              className="px-6 py-3 rounded-xl bg-[#111827] border border-[#1F2937] text-zinc-200 text-xs md:text-sm font-medium hover:bg-[#1A2333] hover:border-zinc-700 transition-all flex items-center gap-2"
            >
              <FlaskConical className="w-4 h-4 text-cyan-400" />
              Explore Experiments
            </Link>

            <button
              onClick={() => setIsDemoModalOpen(true)}
              className="px-5 py-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs md:text-sm font-semibold hover:bg-emerald-900/40 transition-all flex items-center gap-2 font-mono shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-emerald-400" />
              RUN LIVE DEMO
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Experiments */}
        <div className="p-4 rounded-xl bg-[#0D121B] border border-[#1F2937] hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-mono mb-2">
            <span>EXPERIMENTS</span>
            <FlaskConical className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{totalExperiments}</div>
          <div className="text-[11px] text-zinc-500 mt-1">Autonomous runs</div>
        </div>

        {/* Running Jobs */}
        <div className="p-4 rounded-xl bg-[#0D121B] border border-[#1F2937] hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-mono mb-2">
            <span>RUNNING</span>
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          </div>
          <div className="text-2xl font-bold text-cyan-400 font-mono">{runningExperiments}</div>
          <div className="text-[11px] text-zinc-500 mt-1">Active GPU job</div>
        </div>

        {/* Completed */}
        <div className="p-4 rounded-xl bg-[#0D121B] border border-[#1F2937] hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-mono mb-2">
            <span>COMPLETED</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">{completedExperiments}</div>
          <div className="text-[11px] text-zinc-500 mt-1">Converged runs</div>
        </div>

        {/* GPU Hours */}
        <div className="p-4 rounded-xl bg-[#0D121B] border border-[#1F2937] hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-mono mb-2">
            <span>GPU HOURS</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">84.7</div>
          <div className="text-[11px] text-zinc-500 mt-1">NVIDIA H100 compute</div>
        </div>

        {/* Best Accuracy */}
        <div className="p-4 rounded-xl bg-[#0D121B] border border-[#1F2937] hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-mono mb-2">
            <span>BEST ACCURACY</span>
            <Target className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            {bestExp?.accuracy ? `${bestExp.accuracy}%` : "87.4%"}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">GSM8K Reasoning</div>
        </div>

        {/* Avg Latency */}
        <div className="p-4 rounded-xl bg-[#0D121B] border border-[#1F2937] hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-mono mb-2">
            <span>AVG LATENCY</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono">124 ms</div>
          <div className="text-[11px] text-zinc-500 mt-1">Inference decode</div>
        </div>
      </div>

      {/* Main Grid: Active Research Run & Signature Genome Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Research Run Highlight */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#0D121B] border border-[#1F2937] space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                <Layers className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Featured Autonomous Research
                </h2>
                <span className="text-xs text-zinc-400 font-mono">Run #NF-027</span>
              </div>
            </div>

            <Link
              href="/research/NF-027"
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1.5 transition-colors"
            >
              View Live Pipeline <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-4 rounded-xl bg-[#111827] border border-[#1F2937] space-y-3">
            <div className="text-xs font-mono text-zinc-400 uppercase">Research Objective</div>
            <div className="text-sm font-semibold text-zinc-100">
              "Optimize a small language model for reasoning while minimizing inference latency (&lt;150ms) and GPU memory (&lt;8GB)."
            </div>

            {/* Pipeline Stage Indicators */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] font-mono">
              <div className="p-2 rounded bg-[#090D14] border border-emerald-500/30 text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Hypotheses (8)
              </div>
              <div className="p-2 rounded bg-[#090D14] border border-emerald-500/30 text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> GSM8K Dataset
              </div>
              <div className="p-2 rounded bg-[#090D14] border border-emerald-500/30 text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> 12 Experiments
              </div>
              <div className="p-2 rounded bg-[#090D14] border border-emerald-500/30 text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> 🏆 Exp #08 Best
              </div>
            </div>
          </div>

          {/* Champion Snapshot */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/30 via-[#111827] to-emerald-950/20 border border-blue-500/30 flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-[10px] text-zinc-400 font-mono uppercase">Optimal Pareto Run Identified</div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                Experiment #08: FP8 Block-wise + LoRA Rank 64
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                  +2.6% Acc, -42% Latency
                </span>
              </div>
            </div>
            <Link
              href="/experiments"
              className="px-4 py-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-cyan-300 text-xs font-medium transition-all"
            >
              Inspect Run →
            </Link>
          </div>
        </div>

        {/* Right Col: Experiment Genome Preview Card */}
        <div className="p-6 rounded-2xl bg-[#0D121B] border border-[#1F2937] flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-purple-400">
              <Dna className="w-5 h-5" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Experiment Genome</h3>
            </div>
            <p className="text-xs text-zinc-400">
              "Every experiment leaves a trace." NeuroForge preserves full evolutionary lineage from initial failed baselines to Pareto-optimal models.
            </p>
          </div>

          {/* Visual Mini Lineage Tree Representation */}
          <div className="p-4 rounded-xl bg-[#090D14] border border-[#1F2937] font-mono text-[11px] text-zinc-400 space-y-1">
            <div className="text-zinc-500">ROOT: Exp #01 (Failed BF16)</div>
            <div className="pl-4 text-blue-400">└── Exp #02 (INT8 Weights)</div>
            <div className="pl-8 text-cyan-400">├── Exp #04 (FP8 TensorRT)</div>
            <div className="pl-12 text-emerald-400 font-bold">└── 🏆 Exp #08 (87.4% Acc)</div>
          </div>

          <Link
            href="/genome"
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-purple-600/30 to-blue-600/30 hover:from-purple-600/40 hover:to-blue-600/40 border border-purple-500/40 text-purple-200 text-xs font-medium text-center transition-all flex items-center justify-center gap-2"
          >
            <Dna className="w-4 h-4 text-purple-400" />
            Open Interactive Lineage Tree
          </Link>
        </div>
      </div>

      {/* Live Demo Modal */}
      <LiveDemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
      />
    </div>
  );
}
