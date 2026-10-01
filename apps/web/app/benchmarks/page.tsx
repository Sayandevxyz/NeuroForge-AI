"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  Trophy,
  Activity,
  Layers,
  Sparkles,
  Zap,
  Target
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { fetchApi } from "@/lib/api";
import { BenchmarkItem } from "@/types";

const COMPARISON_DATA = [
  { model: "Baseline (Dense BF16)", accuracy: 84.8, latency: 214, vram: 14.8, throughput: 42 },
  { model: "INT8-Weight (Batch 8)", accuracy: 83.2, latency: 142, vram: 7.9, throughput: 68 },
  { model: "FP8 Blockwise (Batch 8)", accuracy: 85.1, latency: 131, vram: 7.5, throughput: 76 },
  { model: "🏆 Champion (FP8 + r=64)", accuracy: 87.4, latency: 124, vram: 7.8, throughput: 81 },
  { model: "INT4 AWQ (Rank 64)", accuracy: 85.2, latency: 112, vram: 5.8, throughput: 88 }
];

export default function BenchmarksPage() {
  const [benchmarks, setBenchmarks] = useState<BenchmarkItem[]>([]);
  const [metricKey, setMetricKey] = useState<"accuracy" | "latency" | "vram" | "throughput">("accuracy");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadBenchmarks() {
      try {
        const data = await fetchApi<BenchmarkItem[]>("/api/benchmarks");
        setBenchmarks(data);
      } catch (err) {
        console.error("Failed to load benchmarks:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadBenchmarks();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-mono mb-2">
            <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
            STANDARDIZED EVALUATION SUITES
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Benchmarks & Leaderboard
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Systematic measurement across reasoning, pass@1 code generation, inference latency, and VRAM efficiency.
          </p>
        </div>

        {/* Metric Selector */}
        <div className="flex items-center gap-1 bg-[#0D121B] p-1.5 rounded-xl border border-[#1F2937] text-xs font-mono">
          {[
            { key: "accuracy", label: "Accuracy (%)" },
            { key: "latency", label: "Latency (ms)" },
            { key: "vram", label: "VRAM (GB)" },
            { key: "throughput", label: "Throughput (tok/s)" }
          ].map((m) => (
            <button
              key={m.key}
              onClick={() => setMetricKey(m.key as any)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                metricKey === m.key
                  ? "bg-blue-600 text-white font-semibold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Benchmark Chart */}
      <div className="p-6 rounded-2xl bg-[#0D121B] border border-[#1F2937] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Pareto Frontier: {metricKey.toUpperCase()} Across Optimization Variants
            </h3>
            <p className="text-xs text-zinc-500">Evaluated on GSM8K-Hard-Cleaned on NVIDIA H100 SXM5</p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={COMPARISON_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
              <XAxis dataKey="model" stroke="#6B7280" fontSize={11} fontStyle="mono" />
              <YAxis stroke="#6B7280" fontSize={11} fontStyle="mono" />
              <Tooltip
                contentStyle={{ backgroundColor: "#0D121B", borderColor: "#1F2937", borderRadius: 8, fontSize: 12 }}
              />
              <Bar
                dataKey={metricKey}
                fill={metricKey === "accuracy" ? "#10B981" : metricKey === "latency" ? "#F59E0B" : "#0066FF"}
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Benchmark Suites Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {benchmarks.map((b) => (
          <div
            key={b.id}
            className="p-6 rounded-2xl bg-[#0D121B] border border-[#1F2937] space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-cyan-400 border border-blue-500/30">
                {b.domain}
              </span>
              <span className="text-xs font-mono text-zinc-500">
                {b.sample_test_count} samples
              </span>
            </div>

            <h3 className="text-base font-bold text-white">{b.name}</h3>
            <p className="text-xs text-zinc-400 font-sans">{b.description}</p>

            <div className="pt-2 border-t border-[#1F2937]">
              <div className="text-[10px] text-zinc-500 font-mono uppercase mb-1">Evaluated Metrics</div>
              <div className="flex flex-wrap gap-1.5">
                {b.metrics_evaluated?.map((m) => (
                  <span
                    key={m}
                    className="px-2 py-0.5 rounded bg-[#111827] text-zinc-300 font-mono text-[10px] border border-[#1F2937]"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
