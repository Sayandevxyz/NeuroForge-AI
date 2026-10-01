"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Brain,
  Sparkles,
  Cpu,
  Layers,
  Zap,
  Sliders,
  ArrowRight,
  Shield,
  HelpCircle,
  Lightbulb
} from "lucide-react";
import { fetchApi } from "@/lib/api";

const PRESETS = [
  {
    title: "Reasoning & Latency Bound (Hackathon Default)",
    goal: "Optimize a small language model for reasoning while minimizing VRAM and inference latency.",
    model: "Qwen2.5-Coder-7B-Instruct",
    dataset: "GSM8K-Hard-Cleaned",
    target: "balanced",
    targetAcc: 85.0,
    targetLat: 150.0,
    targetVram: 8.0,
    budget: 8
  },
  {
    title: "Code Synthesis & Pass@1 Optimization",
    goal: "Fine-tune and compress a 7B coder to achieve >80% pass@1 on Python algorithms under 100ms TTFT.",
    model: "Qwen2.5-Coder-7B-Instruct",
    dataset: "HumanEval-Python-Pro",
    target: "latency",
    targetAcc: 82.0,
    targetLat: 100.0,
    targetVram: 7.5,
    budget: 6
  },
  {
    title: "Ultra-Low Memory Edge Deployment",
    goal: "Minimize VRAM below 6GB for mobile/edge inference while retaining mathematical deduction accuracy.",
    model: "Phi-3.5-mini-instruct",
    dataset: "OpenMathInstruct-2",
    target: "vram",
    targetAcc: 80.0,
    targetLat: 160.0,
    targetVram: 5.5,
    budget: 10
  }
];

export default function ResearchCommandCenter() {
  const router = useRouter();

  const [goal, setGoal] = useState("Optimize a small language model for reasoning while minimizing VRAM and inference latency.");
  const [model, setModel] = useState("Qwen2.5-Coder-7B-Instruct");
  const [dataset, setDataset] = useState("GSM8K-Hard-Cleaned");
  const [target, setTarget] = useState("balanced");
  const [gpuBudget, setGpuBudget] = useState(100);
  const [expBudget, setExpBudget] = useState(8);
  const [targetAccuracy, setTargetAccuracy] = useState(85.0);
  const [targetLatency, setTargetLatency] = useState(150.0);
  const [targetVram, setTargetVram] = useState(8.0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setGoal(preset.goal);
    setModel(preset.model);
    setDataset(preset.dataset);
    setTarget(preset.target);
    setTargetAccuracy(preset.targetAcc);
    setTargetLatency(preset.targetLat);
    setTargetVram(preset.targetVram);
    setExpBudget(preset.budget);
  };

  const handleStartResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const run = await fetchApi<{ id: string; run_code: string }>("/api/research", {
        method: "POST",
        body: JSON.stringify({
          goal,
          model_name: model,
          dataset_name: dataset,
          optimization_target: target,
          gpu_budget_hours: gpuBudget,
          experiment_budget_max: expBudget,
          target_accuracy: targetAccuracy,
          target_latency_ms: targetLatency,
          target_vram_gb: targetVram
        })
      });

      // Trigger autonomous loop execution
      await fetchApi(`/api/research/${run.id}/start`, { method: "POST" });

      // Navigate to live research run page
      router.push(`/research/${run.id}`);
    } catch (err) {
      console.error("Failed to start research:", err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-mono mb-3">
          <Brain className="w-3.5 h-3.5 text-cyan-400" />
          RESEARCH COMMAND CENTER
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Initiate Autonomous AI Research
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          State your research question. NeuroForge agents will autonomously formulate hypotheses, allocate NVIDIA GPU compute, evaluate benchmarks, and evolve toward the optimal configuration.
        </p>
      </div>

      {/* Preset Pills */}
      <div className="space-y-2">
        <div className="text-xs font-mono uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> Quick Presets
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyPreset(p)}
              className="p-3 rounded-xl bg-[#0D121B] border border-[#1F2937] hover:border-blue-500/50 hover:bg-[#111827] text-left transition-all group"
            >
              <div className="text-xs font-semibold text-zinc-200 group-hover:text-cyan-400 transition-colors">
                {p.title}
              </div>
              <div className="text-[11px] text-zinc-500 line-clamp-2 mt-1">
                {p.goal}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Research Form */}
      <form onSubmit={handleStartResearch} className="space-y-6 bg-[#0D121B] border border-[#1F2937] p-6 md:p-8 rounded-2xl shadow-xl">
        {/* Research Goal Prompt Input */}
        <div className="space-y-2">
          <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300">
            What do you want NeuroForge to discover?
          </label>
          <div className="relative">
            <textarea
              rows={4}
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. Optimize a small language model for reasoning while minimizing VRAM and inference latency."
              className="w-full bg-[#111827] border border-[#1F2937] rounded-xl p-4 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 transition-all font-sans leading-relaxed"
              required
            />
            <div className="absolute right-3 bottom-3 text-[11px] text-zinc-500 font-mono">
              Natural Language Research Objective
            </div>
          </div>
        </div>

        {/* Configuration Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Model Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400">
              Candidate Architecture
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-[#111827] border border-[#1F2937] rounded-xl px-4 py-3 text-xs text-zinc-200 focus:outline-none focus:border-blue-500 font-mono"
            >
              <option value="Qwen2.5-Coder-7B-Instruct">Qwen2.5-Coder-7B-Instruct (Recommended)</option>
              <option value="Llama-3.1-8B-Instruct">Llama-3.1-8B-Instruct</option>
              <option value="DeepSeek-R1-Distill-Qwen-7B">DeepSeek-R1-Distill-Qwen-7B</option>
              <option value="Mistral-7B-Instruct-v0.3">Mistral-7B-Instruct-v0.3</option>
              <option value="Phi-3.5-mini-instruct">Phi-3.5-mini-instruct (3.8B)</option>
            </select>
          </div>

          {/* Dataset Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400">
              Evaluation & Tuning Dataset
            </label>
            <select
              value={dataset}
              onChange={(e) => setDataset(e.target.value)}
              className="w-full bg-[#111827] border border-[#1F2937] rounded-xl px-4 py-3 text-xs text-zinc-200 focus:outline-none focus:border-blue-500 font-mono"
            >
              <option value="GSM8K-Hard-Cleaned">GSM8K-Hard-Cleaned (25k Multi-step Math)</option>
              <option value="MATH-Reasoning-v2">MATH-Reasoning-v2 (12.5k Competition LaTeX)</option>
              <option value="HumanEval-Python-Pro">HumanEval-Python-Pro (Code Synthesis)</option>
              <option value="OpenMathInstruct-2">OpenMathInstruct-2 (50k Synthesis)</option>
            </select>
          </div>

          {/* Optimization Target */}
          <div className="space-y-2 md:col-span-2">
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400">
              Primary Optimization Objective
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {["Accuracy", "Latency", "VRAM", "Throughput", "Cost", "Balanced"].map((opt) => {
                const optKey = opt.toLowerCase();
                const isSelected = target === optKey;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setTarget(optKey)}
                    className={`py-2.5 px-3 rounded-lg text-xs font-medium border text-center transition-all ${
                      isSelected
                        ? "bg-blue-600/20 text-cyan-400 border-blue-500 shadow-sm"
                        : "bg-[#111827] text-zinc-400 border-[#1F2937] hover:border-zinc-700"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Constraint Inputs */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-zinc-400">TARGET ACCURACY (MIN)</span>
              <span className="text-emerald-400">{targetAccuracy}%</span>
            </div>
            <input
              type="range"
              min={70}
              max={95}
              step={0.5}
              value={targetAccuracy}
              onChange={(e) => setTargetAccuracy(parseFloat(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-zinc-400">TARGET LATENCY (MAX)</span>
              <span className="text-amber-400">{targetLatency} ms</span>
            </div>
            <input
              type="range"
              min={80}
              max={300}
              step={5}
              value={targetLatency}
              onChange={(e) => setTargetLatency(parseFloat(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>

          {/* Budgets */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-zinc-400">GPU TIME BUDGET</span>
              <span className="text-white">{gpuBudget} Hours</span>
            </div>
            <input
              type="range"
              min={10}
              max={250}
              step={10}
              value={gpuBudget}
              onChange={(e) => setGpuBudget(parseInt(e.target.value))}
              className="w-full accent-cyan-500"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-zinc-400">EXPERIMENT BUDGET (MAX RUNS)</span>
              <span className="text-cyan-400">{expBudget} Experiments</span>
            </div>
            <input
              type="range"
              min={4}
              max={20}
              step={1}
              value={expBudget}
              onChange={(e) => setExpBudget(parseInt(e.target.value))}
              className="w-full accent-cyan-500"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-[#1F2937] flex items-center justify-between">
          <div className="text-xs text-zinc-500 font-mono flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            Deterministic simulation active (Demo Mode)
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 text-white text-xs md:text-sm font-bold flex items-center gap-3 hover:opacity-95 shadow-xl shadow-blue-500/20 disabled:opacity-50 transition-all uppercase tracking-wider"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                INITIATING ORCHESTRATOR...
              </>
            ) : (
              <>
                START AUTONOMOUS RESEARCH →
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
