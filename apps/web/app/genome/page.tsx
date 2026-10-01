"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Dna,
  GitBranch,
  Layers,
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Info,
  Zap,
  Sparkles,
  GitMerge,
  Network
} from "lucide-react";
import { fetchApi } from "@/lib/api";
import { GenomeGraph, ResearchGraph } from "@/types";

export default function ExperimentGenomePage() {
  const [genome, setGenome] = useState<GenomeGraph | null>(null);
  const [researchGraph, setResearchGraph] = useState<ResearchGraph | null>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"lineage" | "research_graph">("lineage");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadGenome() {
      try {
        const [gData, rData] = await Promise.all([
          fetchApi<GenomeGraph>("/api/genome/NF-027"),
          fetchApi<ResearchGraph>("/api/genome/NF-027/research-graph")
        ]);
        setGenome(gData);
        setResearchGraph(rData);
        if (gData.nodes?.length > 0) {
          // Default select the champion run
          const best = gData.nodes.find((n) => n.is_best_run) || gData.nodes[gData.nodes.length - 1];
          setSelectedNode(best);
        }
      } catch (err) {
        console.error("Failed to load genome:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadGenome();
  }, []);

  if (isLoading && !genome) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-purple-400 border-t-transparent animate-spin mx-auto" />
        <div className="text-xs text-zinc-500 font-mono">Synthesizing experiment lineage DAG...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-mono mb-2">
            <Dna className="w-3.5 h-3.5 text-purple-400" />
            SIGNATURE ARCHITECTURE FEATURE
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            Experiment Genome
            <span className="text-xs px-2.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono font-normal">
              NF-027
            </span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1 italic font-sans">
            "Every experiment leaves a trace." NeuroForge preserves complete evolutionary lineage and mutation rationale across all runs.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 bg-[#0D121B] p-1.5 rounded-xl border border-[#1F2937] text-xs">
          <button
            onClick={() => setActiveTab("lineage")}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === "lineage"
                ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            Lineage Genome Tree
          </button>
          <button
            onClick={() => setActiveTab("research_graph")}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === "research_graph"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            Research Knowledge Graph
          </button>
        </div>
      </div>

      {/* Main Interactive Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: The Interactive Graph Canvas */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#0D121B] border border-[#1F2937] flex flex-col justify-between min-h-[580px]">
          <div className="flex items-center justify-between pb-3 border-b border-[#1F2937]">
            <div className="text-xs font-mono uppercase tracking-wider text-purple-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              {activeTab === "lineage" ? "Evolutionary Mutation DAG" : "Goal-to-Conclusion Topology"}
            </div>
            <span className="text-[11px] font-mono text-zinc-500">
              Interactive • Click any node to inspect
            </span>
          </div>

          {activeTab === "lineage" ? (
            /* Lineage DAG Visual Nodes */
            <div className="py-6 space-y-6 overflow-x-auto">
              {/* Generation 1: Root */}
              <div className="flex justify-center">
                {genome?.nodes.filter((n) => n.experiment_number === 1).map((n) => (
                  <button
                    key={n.id}
                    onClick={() => setSelectedNode(n)}
                    className={`p-3.5 rounded-xl border text-left transition-all w-64 shadow-md ${
                      selectedNode?.id === n.id
                        ? "border-rose-400 bg-rose-950/40 ring-1 ring-rose-400"
                        : "border-rose-500/30 bg-[#111827] hover:border-rose-400"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                      <span className="text-rose-400 font-bold">EXP #{String(n.experiment_number).padStart(2, "0")} (ROOT)</span>
                      <span className="text-rose-400">FAILED</span>
                    </div>
                    <div className="text-xs font-semibold text-zinc-100">{n.label}</div>
                    <div className="text-[10px] text-zinc-500 font-mono mt-1">
                      Acc: {n.accuracy}% • Lat: {n.latency_ms}ms (Over Budget)
                    </div>
                  </button>
                ))}
              </div>

              <div className="text-center text-zinc-600 font-mono text-xs">↓ Mutation: INT8 Weight Compression</div>

              {/* Generation 2: Exp #02 */}
              <div className="flex justify-center">
                {genome?.nodes.filter((n) => n.experiment_number === 2).map((n) => (
                  <button
                    key={n.id}
                    onClick={() => setSelectedNode(n)}
                    className={`p-3.5 rounded-xl border text-left transition-all w-64 shadow-md ${
                      selectedNode?.id === n.id
                        ? "border-blue-400 bg-blue-950/40 ring-1 ring-blue-400"
                        : "border-blue-500/30 bg-[#111827] hover:border-blue-400"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                      <span className="text-cyan-400 font-bold">EXP #{String(n.experiment_number).padStart(2, "0")}</span>
                      <span className="text-emerald-400">PASSED</span>
                    </div>
                    <div className="text-xs font-semibold text-zinc-100">INT8-Batch8</div>
                    <div className="text-[10px] text-zinc-500 font-mono mt-1">
                      Acc: {n.accuracy}% • Lat: {n.latency_ms}ms • VRAM: {n.vram_gb}GB
                    </div>
                  </button>
                ))}
              </div>

              <div className="text-center text-zinc-600 font-mono text-xs">↙ Branch A (INT8 r=32) &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ↘ Branch B (FP8 TensorRT)</div>

              {/* Generation 3: Branches */}
              <div className="flex justify-center gap-8">
                {genome?.nodes.filter((n) => n.experiment_number === 3 || n.experiment_number === 4).map((n) => (
                  <button
                    key={n.id}
                    onClick={() => setSelectedNode(n)}
                    className={`p-3.5 rounded-xl border text-left transition-all w-56 shadow-md ${
                      selectedNode?.id === n.id
                        ? "border-cyan-400 bg-cyan-950/40 ring-1 ring-cyan-400"
                        : "border-[#1F2937] bg-[#111827] hover:border-cyan-500/50"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                      <span className="text-cyan-400 font-bold">EXP #{String(n.experiment_number).padStart(2, "0")}</span>
                      <span className="text-emerald-400">PASSED</span>
                    </div>
                    <div className="text-xs font-semibold text-zinc-100 truncate">{n.label}</div>
                    <div className="text-[10px] text-zinc-500 font-mono mt-1">
                      Acc: {n.accuracy}% • Lat: {n.latency_ms}ms
                    </div>
                  </button>
                ))}
              </div>

              <div className="text-center text-zinc-600 font-mono text-xs">↓ Synergistic Mutation (FP8 + LoRA r=64 + Paged KV)</div>

              {/* Generation 4: Champion Run #08 */}
              <div className="flex justify-center">
                {genome?.nodes.filter((n) => n.experiment_number === 8).map((n) => (
                  <button
                    key={n.id}
                    onClick={() => setSelectedNode(n)}
                    className={`p-4 rounded-xl border text-left transition-all w-80 shadow-xl ${
                      selectedNode?.id === n.id
                        ? "border-yellow-400 bg-gradient-to-r from-yellow-950/40 via-blue-950/30 to-[#111827] ring-2 ring-yellow-400"
                        : "border-yellow-500/50 bg-[#111827] hover:border-yellow-400"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                      <span className="text-yellow-400 font-bold flex items-center gap-1">
                        <Trophy className="w-3.5 h-3.5" /> 🏆 EXP #08 (BEST RUN)
                      </span>
                      <span className="text-emerald-400 font-bold">OPTIMAL</span>
                    </div>
                    <div className="text-xs font-bold text-white">Champion-FP8-LoRA-Rank64</div>
                    <div className="text-[11px] text-emerald-400 font-mono font-semibold mt-1">
                      Acc: 87.4% • Lat: 124ms • VRAM: 7.8GB • 81 tok/s
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Research Knowledge Graph Topology */
            <div className="py-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {researchGraph?.nodes.map((node) => (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className="p-3.5 rounded-xl bg-[#111827] border border-[#1F2937] hover:border-cyan-500/50 cursor-pointer transition-all space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="px-2 py-0.5 rounded bg-blue-500/10 text-cyan-400">
                        {node.category.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-zinc-100">{node.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="p-3 bg-[#090D14] rounded-xl border border-[#1F2937] flex items-center justify-between text-[11px] font-mono text-zinc-400">
            <span>Graph status: 12 Nodes, 14 Directed Hyper-Edges</span>
            <span className="text-emerald-400">Verified Reproducible Lineage</span>
          </div>
        </div>

        {/* Right Col: Node Inspector Panel */}
        <div className="p-6 rounded-2xl bg-[#0D121B] border border-[#1F2937] space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-purple-400 border-b border-[#1F2937] pb-3">
              <Info className="w-4 h-4" /> Node Inspector
            </div>

            {selectedNode ? (
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-mono text-zinc-500">SELECTED ENTITY</div>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    {selectedNode.label || selectedNode.name}
                  </h3>
                  <div className="text-[11px] text-zinc-400 font-mono mt-1">
                    Status: <span className="text-emerald-400 uppercase font-semibold">{selectedNode.status || "Optimal"}</span>
                  </div>
                </div>

                {/* Metrics if experiment */}
                {selectedNode.accuracy && (
                  <div className="grid grid-cols-2 gap-2 bg-[#111827] p-3 rounded-xl border border-[#1F2937]">
                    <div>
                      <div className="text-[10px] text-zinc-500 font-mono">ACCURACY</div>
                      <div className="text-sm font-bold text-emerald-400 font-mono">{selectedNode.accuracy}%</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-zinc-500 font-mono">LATENCY</div>
                      <div className="text-sm font-bold text-cyan-400 font-mono">{selectedNode.latency_ms} ms</div>
                    </div>
                    <div className="pt-2">
                      <div className="text-[10px] text-zinc-500 font-mono">VRAM FOOTPRINT</div>
                      <div className="text-sm font-bold text-zinc-200 font-mono">{selectedNode.vram_gb} GB</div>
                    </div>
                    <div className="pt-2">
                      <div className="text-[10px] text-zinc-500 font-mono">THROUGHPUT</div>
                      <div className="text-sm font-bold text-zinc-200 font-mono">{selectedNode.throughput || 81} tok/s</div>
                    </div>
                  </div>
                )}

                {/* Mutation Rationale */}
                {selectedNode.mutation && (
                  <div className="p-3 rounded-xl bg-[#111827] border border-[#1F2937] space-y-1">
                    <div className="text-[10px] text-zinc-400 font-mono uppercase">Applied Mutation</div>
                    <p className="text-xs text-zinc-300 font-sans">{selectedNode.mutation}</p>
                  </div>
                )}

                {/* Failure reason if any */}
                {selectedNode.failure_reason && (
                  <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-1">
                    <div className="text-[10px] text-rose-400 font-mono uppercase">Constraint Violation</div>
                    <p className="text-xs text-rose-300 font-sans">{selectedNode.failure_reason}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-zinc-500 text-center py-16">
                Click any experiment node on the graph to inspect details.
              </div>
            )}
          </div>

          {selectedNode?.id && (
            <Link
              href={`/experiments/${selectedNode.id}`}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-semibold text-center transition-all flex items-center justify-center gap-2 hover:opacity-95"
            >
              Open Full Experiment Dossier →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
