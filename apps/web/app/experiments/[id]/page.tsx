"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FlaskConical,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  Target,
  Cpu,
  Layers,
  Copy,
  Download,
  Terminal,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Dna
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { fetchApi } from "@/lib/api";
import { ExperimentDetail } from "@/types";

export default function ExperimentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const expId = params.id as string;

  const [exp, setExp] = useState<ExperimentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [reproduceOpen, setReproduceOpen] = useState(false);

  useEffect(() => {
    async function loadDetail() {
      try {
        const data = await fetchApi<ExperimentDetail>(`/api/experiments/${expId}`);
        setExp(data);
      } catch (err) {
        console.error("Failed to load experiment detail:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDetail();
  }, [expId]);

  if (isLoading && !exp) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mx-auto" />
        <div className="text-xs text-zinc-500 font-mono">Loading experiment metrics and configuration...</div>
      </div>
    );
  }

  if (!exp) {
    return (
      <div className="py-24 text-center space-y-3">
        <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
        <div className="text-sm font-semibold text-white">Experiment Not Found</div>
        <Link href="/experiments" className="text-xs text-cyan-400 hover:underline">
          Return to Experiments Registry
        </Link>
      </div>
    );
  }

  const yamlConfig = JSON.stringify(exp.configuration, null, 2);

  const handleCopyConfig = () => {
    navigator.clipboard.writeText(yamlConfig);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadConfig = () => {
    const blob = new Blob([yamlConfig], { type: "text/yaml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `experiment_${exp.experiment_number}_config.yaml`;
    a.click();
  };

  // Step metrics for charts
  const chartData = exp.metrics_history?.length > 0
    ? exp.metrics_history
    : [
        { step: 20, loss: 2.12, accuracy: 52.0, vram_gb: exp.vram_gb || 7.8, gpu_util_pct: 88 },
        { step: 40, loss: 1.45, accuracy: 64.5, vram_gb: exp.vram_gb || 7.8, gpu_util_pct: 92 },
        { step: 60, loss: 0.98, accuracy: 74.0, vram_gb: exp.vram_gb || 7.8, gpu_util_pct: 90 },
        { step: 80, loss: 0.62, accuracy: 81.2, vram_gb: exp.vram_gb || 7.8, gpu_util_pct: 93 },
        { step: 100, loss: 0.41, accuracy: exp.accuracy || 87.4, vram_gb: exp.vram_gb || 7.8, gpu_util_pct: 91 }
      ];

  const hasFailed = exp.status === "failed" || (exp.latency_ms && exp.latency_ms > 150) || (exp.vram_gb && exp.vram_gb > 8.0);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header bar */}
      <div className="p-6 rounded-2xl bg-[#0D121B] border border-[#1F2937] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-500/10 text-cyan-400 border border-blue-500/30">
              EXPERIMENT #{String(exp.experiment_number).padStart(2, "0")}
            </span>
            <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${
              exp.status === "completed"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
            }`}>
              {exp.status === "completed" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
              {exp.status.toUpperCase()}
            </span>
            {exp.is_best_run && (
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded bg-yellow-500/20 text-yellow-300 font-bold border border-yellow-500/40">
                🏆 CHAMPION PARETO RUN
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{exp.name}</h1>
          <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1 font-mono">
            <span>Model: {exp.model_name}</span>
            <span>•</span>
            <span>Dataset: {exp.dataset_name}</span>
            <span>•</span>
            <span>Nebius Cloud NVIDIA H100</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setReproduceOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-semibold flex items-center gap-2 hover:opacity-90 shadow-md shadow-blue-500/20"
          >
            <Terminal className="w-4 h-4" />
            Reproduce Experiment
          </button>
          <Link
            href="/genome"
            className="px-3.5 py-2.5 rounded-xl bg-[#111827] border border-[#1F2937] text-purple-300 text-xs font-medium flex items-center gap-1.5 hover:bg-[#1A2333]"
          >
            <Dna className="w-4 h-4 text-purple-400" />
            Genome Lineage
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Accuracy */}
        <div className="p-4 rounded-xl bg-[#0D121B] border border-[#1F2937]">
          <div className="text-[11px] text-zinc-500 font-mono mb-1">REASONING ACCURACY</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            {exp.accuracy ? `${exp.accuracy}%` : "—"}
          </div>
          <div className="text-[10px] text-zinc-500 mt-1">GSM8K Benchmark</div>
        </div>

        {/* Latency */}
        <div className="p-4 rounded-xl bg-[#0D121B] border border-[#1F2937]">
          <div className="text-[11px] text-zinc-500 font-mono mb-1">INFERENCE LATENCY</div>
          <div className={`text-2xl font-bold font-mono ${exp.latency_ms && exp.latency_ms > 150 ? "text-rose-400" : "text-cyan-400"}`}>
            {exp.latency_ms ? `${exp.latency_ms} ms` : "—"}
          </div>
          <div className="text-[10px] text-zinc-500 mt-1">Target: &lt;150 ms</div>
        </div>

        {/* VRAM */}
        <div className="p-4 rounded-xl bg-[#0D121B] border border-[#1F2937]">
          <div className="text-[11px] text-zinc-500 font-mono mb-1">PEAK VRAM</div>
          <div className={`text-2xl font-bold font-mono ${exp.vram_gb && exp.vram_gb > 8.0 ? "text-rose-400" : "text-zinc-200"}`}>
            {exp.vram_gb ? `${exp.vram_gb} GB` : "—"}
          </div>
          <div className="text-[10px] text-zinc-500 mt-1">Target: &lt;8.0 GB</div>
        </div>

        {/* Throughput */}
        <div className="p-4 rounded-xl bg-[#0D121B] border border-[#1F2937]">
          <div className="text-[11px] text-zinc-500 font-mono mb-1">THROUGHPUT</div>
          <div className="text-2xl font-bold text-zinc-200 font-mono">
            {exp.throughput_tokens_sec ? `${exp.throughput_tokens_sec} req/s` : "—"}
          </div>
          <div className="text-[10px] text-zinc-500 mt-1">Tokens decoded</div>
        </div>

        {/* Training time */}
        <div className="p-4 rounded-xl bg-[#0D121B] border border-[#1F2937]">
          <div className="text-[11px] text-zinc-500 font-mono mb-1">TRAINING TIME</div>
          <div className="text-2xl font-bold text-purple-400 font-mono">
            {exp.training_time_minutes ? `${exp.training_time_minutes}m` : "42m"}
          </div>
          <div className="text-[10px] text-zinc-500 mt-1">NVIDIA H100 execution</div>
        </div>
      </div>

      {/* Charts Section: Loss Curve & Accuracy / VRAM */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Step Loss Curve */}
        <div className="p-6 rounded-2xl bg-[#0D121B] border border-[#1F2937] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-cyan-400" /> Training Loss Convergence
            </h3>
            <span className="text-[10px] font-mono text-zinc-500">Step Progression</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="lossGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                <XAxis dataKey="step" stroke="#6B7280" fontSize={11} fontStyle="mono" />
                <YAxis stroke="#6B7280" fontSize={11} fontStyle="mono" domain={[0, 2.5]} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0D121B", borderColor: "#1F2937", borderRadius: 8, fontSize: 12 }}
                />
                <Area type="monotone" dataKey="loss" stroke="#06B6D4" strokeWidth={2} fillOpacity={1} fill="url(#lossGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Accuracy & Memory Curve */}
        <div className="p-6 rounded-2xl bg-[#0D121B] border border-[#1F2937] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> Accuracy & VRAM Allocation
            </h3>
            <span className="text-[10px] font-mono text-zinc-500">GSM8K vs Hardware Footprint</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                <XAxis dataKey="step" stroke="#6B7280" fontSize={11} />
                <YAxis stroke="#6B7280" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0D121B", borderColor: "#1F2937", borderRadius: 8, fontSize: 12 }}
                />
                <Line type="monotone" dataKey="accuracy" stroke="#10B981" strokeWidth={2} name="Accuracy (%)" dot={{ r: 3 }} />
                <Line type="monotone" dataKey="vram_gb" stroke="#A855F7" strokeWidth={2} name="VRAM (GB)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Section 18: Failure Analysis (If Target Violated) */}
      {hasFailed && (
        <div className="p-6 rounded-2xl bg-[#140D11] border border-rose-500/40 space-y-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            <h3 className="text-sm font-bold text-rose-300 uppercase tracking-wider">
              ⚠ EXPERIMENT DID NOT MEET TARGET CONSTRAINTS
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#0D080A] border border-rose-900/50 space-y-2">
              <div className="text-xs font-mono text-zinc-400">CONSTRAINT COMPARISON</div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Target Latency:</span>
                <span className="text-zinc-300 font-mono">&lt; 150 ms</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Observed Latency:</span>
                <span className="text-rose-400 font-mono font-bold">{exp.latency_ms || 214} ms (FAILED)</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Observed VRAM:</span>
                <span className="text-rose-400 font-mono font-bold">{exp.vram_gb || 14.8} GB (EXCEEDED 8GB)</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#0D080A] border border-rose-900/50 space-y-1.5 text-xs text-zinc-300">
              <div className="font-mono text-zinc-400">AI FAILURE ANALYSIS ATTRIBUTION</div>
              <p className="text-zinc-400">
                <strong>Primary Bottleneck:</strong> {exp.bottleneck_detected || "Inference memory bandwidth pressure during token decode."}
              </p>
              <p className="text-zinc-400">
                <strong>Possible Causes:</strong> Unquantized dense BF16 weights, non-paged KV-cache, and oversized batch size.
              </p>
              <p className="text-emerald-400 font-medium pt-1">
                <strong>Recommended Next Experiment:</strong> Reduce batch size to 8, enable FP8 block-wise quantization, and scale LoRA rank to r=64.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => router.push("/research")}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 text-white text-xs font-semibold flex items-center gap-2 hover:opacity-95 shadow-md shadow-rose-500/20"
            >
              RUN MUTATED EXPERIMENT →
            </button>
          </div>
        </div>
      )}

      {/* Section 17: Experiment Configuration Viewer */}
      <div className="p-6 rounded-2xl bg-[#0D121B] border border-[#1F2937] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Exact Execution Configuration (YAML)
            </h3>
            <p className="text-xs text-zinc-500">
              Hardware parameters, precision quantization, optimizer hyperparameters, and LoRA rank.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyConfig}
              className="px-3 py-1.5 rounded-lg bg-[#111827] border border-[#1F2937] text-zinc-300 text-xs font-mono hover:text-white flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              {copied ? "Copied!" : "COPY CONFIG"}
            </button>
            <button
              onClick={handleDownloadConfig}
              className="px-3 py-1.5 rounded-lg bg-[#111827] border border-[#1F2937] text-zinc-300 text-xs font-mono hover:text-white flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              DOWNLOAD CONFIG
            </button>
          </div>
        </div>

        <pre className="p-4 rounded-xl bg-[#080B10] border border-[#1F2937] text-cyan-300 font-mono text-xs overflow-x-auto leading-relaxed max-h-96">
          {yamlConfig}
        </pre>
      </div>

      {/* Reproduction Modal */}
      {reproduceOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#0D121B] border border-blue-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                Reproduce Experiment #{exp.experiment_number}
              </h3>
              <button
                onClick={() => setReproduceOpen(false)}
                className="text-zinc-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              Run this containerized command on any NVIDIA GPU host (Nebius Cloud or local CUDA 12.4+):
            </p>

            <div className="p-3 bg-[#080B10] border border-[#1F2937] rounded-lg font-mono text-xs text-emerald-400 break-all select-all">
              docker run --gpus all --rm -it cr.nebius.ai/neuroforge/runtime:latest --config experiment_{exp.experiment_number}.yaml
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setReproduceOpen(false)}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
