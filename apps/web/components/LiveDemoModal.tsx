"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  CheckCircle2,
  Cpu,
  TrendingUp,
  AlertTriangle,
  Trophy,
  Dna,
  X,
  Play,
  RotateCcw
} from "lucide-react";
import confetti from "canvas-confetti";

interface LiveDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STAGES = [
  { id: "goal", title: "1. Goal Formulation", agent: "Research Agent", desc: "Parsed objective: Optimize small language model reasoning with latency <150ms & VRAM <8GB." },
  { id: "hypotheses", title: "2. Hypothesis Generation", agent: "Research Agent", desc: "Formulated 8 falsifiable hypotheses covering quantization, LoRA ranks, and KV-cache paging." },
  { id: "dataset", title: "3. Dataset Curation", agent: "Dataset Agent", desc: "Validated GSM8K-Hard-Cleaned (25k samples, 96.4 quality score) with 2048 token chunking." },
  { id: "exp1", title: "4. Baseline GPU Workload", agent: "GPU Agent", desc: "Dispatched Exp #01 (BF16 Dense). Accuracy: 84.8%, Latency: 214ms, VRAM: 14.8GB." },
  { id: "failure", title: "5. Automated Failure Analysis", agent: "Failure Analyst", desc: "Target latency (214ms > 150ms) and VRAM violated. Diagnosed memory bandwidth saturation." },
  { id: "mutation", title: "6. Evolutionary Mutation", agent: "Experiment Agent", desc: "Prescribed FP8 block-wise quantization + scaled LoRA adapter rank to r=64." },
  { id: "champion", title: "7. Champion Optimization", agent: "Evaluation Agent", desc: "🏆 Exp #08 Succeeded! Accuracy: 87.4%, Latency: 124ms, VRAM: 7.8GB, Throughput: 81 tok/s." }
];

export function LiveDemoModal({ isOpen, onClose }: LiveDemoModalProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && currentStep < STAGES.length - 1) {
      timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, 1600);
    } else if (isRunning && currentStep === STAGES.length - 1) {
      setIsCompleted(true);
      setIsRunning(false);
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {}
    }
    return () => clearTimeout(timer);
  }, [isRunning, currentStep]);

  if (!isOpen) return null;

  const handleStart = () => {
    setCurrentStep(0);
    setIsCompleted(false);
    setIsRunning(true);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsCompleted(false);
    setIsRunning(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-[#0D121B] border border-blue-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-[#1B2230] flex items-center justify-between bg-gradient-to-r from-blue-950/40 via-transparent to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                NeuroForge Autonomous AI Research Demo
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
                  LIVE WORKFLOW
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Witness closed-loop experimentation: Hypothesize → Train → Evaluate → Mutate → Crown Champion
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#1A2333] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Research Objective Box */}
          <div className="p-4 rounded-xl bg-[#111827] border border-[#1F2937]">
            <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 mb-1">
              Active Research Objective
            </div>
            <div className="text-sm font-semibold text-zinc-100">
              "Optimize a small language model for reasoning while minimizing inference latency (&lt;150ms) and GPU memory (&lt;8GB)."
            </div>
            <div className="flex items-center gap-4 mt-3 text-xs text-zinc-400 font-mono">
              <span>Model: Qwen2.5-Coder-7B</span>
              <span>•</span>
              <span>Dataset: GSM8K-Hard-Cleaned</span>
              <span>•</span>
              <span>Hardware: Nebius NVIDIA H100</span>
            </div>
          </div>

          {/* Stepper Pipeline */}
          <div className="space-y-3">
            {STAGES.map((stage, idx) => {
              const isDone = isCompleted || idx < currentStep;
              const isCurrent = isRunning && idx === currentStep;
              const isPending = !isCompleted && idx > currentStep;

              return (
                <div
                  key={stage.id}
                  className={`p-3 rounded-lg border transition-all flex items-start gap-3.5 ${
                    isCurrent
                      ? "bg-blue-600/15 border-blue-500 shadow-lg shadow-blue-500/10"
                      : isDone
                      ? "bg-[#111827]/70 border-emerald-500/30 text-zinc-200"
                      : "bg-[#090D14]/40 border-[#1B2230] text-zinc-600 opacity-60"
                  }`}
                >
                  <div className="mt-0.5">
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : isCurrent ? (
                      <div className="w-4 h-4 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-zinc-700 flex items-center justify-center text-[10px] font-mono">
                        {idx + 1}
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold ${isCurrent ? "text-cyan-300" : isDone ? "text-zinc-200" : "text-zinc-500"}`}>
                        {stage.title}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1F2937] text-zinc-400">
                        {stage.agent}
                      </span>
                    </div>
                    <p className={`text-xs mt-1 ${isCurrent ? "text-zinc-300" : isDone ? "text-zinc-400" : "text-zinc-600"}`}>
                      {stage.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Signature WOW Final State */}
          {isCompleted && (
            <div className="p-5 rounded-xl bg-gradient-to-br from-emerald-950/40 via-[#111827] to-blue-950/30 border border-emerald-500/40 animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3 mb-3">
                <Trophy className="w-6 h-6 text-yellow-400" />
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Research Objective Complete
                  </h3>
                  <p className="text-xs text-emerald-400">
                    NeuroForge evaluated 8 experiments: 3 failed target constraints, 5 passed.
                  </p>
                </div>
              </div>

              {/* Champion Card Metrics */}
              <div className="grid grid-cols-4 gap-3 bg-[#080B10]/80 p-3 rounded-lg border border-[#1F2937] my-3">
                <div>
                  <div className="text-[10px] text-zinc-500 font-mono">CHAMPION RUN</div>
                  <div className="text-sm font-bold text-cyan-400 font-mono">EXP #08</div>
                </div>
                <div>
                  <div className="text-[10px] text-zinc-500 font-mono">ACCURACY</div>
                  <div className="text-sm font-bold text-emerald-400 font-mono">87.4%</div>
                </div>
                <div>
                  <div className="text-[10px] text-zinc-500 font-mono">LATENCY</div>
                  <div className="text-sm font-bold text-zinc-200 font-mono">124 ms</div>
                </div>
                <div>
                  <div className="text-[10px] text-zinc-500 font-mono">VRAM FOOTPRINT</div>
                  <div className="text-sm font-bold text-zinc-200 font-mono">7.8 GB</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-zinc-400">
                  How did the agent evolve from Experiment #01 to #08?
                </span>
                <button
                  onClick={() => {
                    onClose();
                    router.push("/genome");
                  }}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-semibold flex items-center gap-2 hover:opacity-90 shadow-md shadow-blue-500/20"
                >
                  <Dna className="w-4 h-4" />
                  Explore Experiment Genome →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Controls */}
        <div className="p-4 bg-[#090D14] border-t border-[#1B2230] flex items-center justify-between">
          <div className="text-xs text-zinc-500 font-mono">
            {isRunning ? "Autonomous cycle running..." : isCompleted ? "Cycle finished." : "Ready to launch."}
          </div>

          <div className="flex items-center gap-3">
            {!isRunning && !isCompleted && (
              <button
                onClick={handleStart}
                className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-semibold flex items-center gap-2 hover:opacity-90 shadow-md shadow-blue-500/20"
              >
                <Play className="w-4 h-4 fill-white" />
                START AUTONOMOUS DEMO →
              </button>
            )}

            {isCompleted && (
              <button
                onClick={handleReset}
                className="px-3.5 py-2 rounded-lg bg-[#151D2C] border border-[#1F2937] text-zinc-300 text-xs font-medium flex items-center gap-2 hover:bg-[#1E293B]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Re-run Demo
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
