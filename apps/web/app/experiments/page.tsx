"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FlaskConical,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Trophy,
  ArrowUpRight,
  Sparkles,
  SlidersHorizontal
} from "lucide-react";
import { fetchApi } from "@/lib/api";
import { ExperimentSummary } from "@/types";

export default function ExperimentsPage() {
  const [experiments, setExperiments] = useState<ExperimentSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [bestOnly, setBestOnly] = useState(false);

  useEffect(() => {
    async function loadExps() {
      try {
        const data = await fetchApi<ExperimentSummary[]>("/api/experiments");
        setExperiments(data);
      } catch (err) {
        console.error("Failed to load experiments:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadExps();
  }, []);

  const filtered = experiments.filter((e) => {
    if (statusFilter !== "all" && e.status !== statusFilter) return false;
    if (bestOnly && !e.is_best_run) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        e.name.toLowerCase().includes(q) ||
        e.model_name.toLowerCase().includes(q) ||
        (e.mutation_applied && e.mutation_applied.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-mono mb-2">
            <FlaskConical className="w-3.5 h-3.5 text-cyan-400" />
            EXPERIMENT REGISTRY
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Autonomous Experiments
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Browse full telemetry, accuracy benchmarks, memory footprints, and lineage mutations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/research"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-semibold flex items-center gap-2 hover:opacity-90 shadow-md shadow-blue-500/20"
          >
            <Sparkles className="w-4 h-4" />
            New Research Run
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-[#0D121B] border border-[#1F2937] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search experiments by name, model, mutation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#111827] border border-[#1F2937] rounded-lg pl-9 pr-4 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Status filter */}
          <div className="flex items-center gap-1 bg-[#111827] p-1 rounded-lg border border-[#1F2937] text-xs">
            {["all", "completed", "failed", "running"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-md capitalize font-mono text-[11px] transition-all ${
                  statusFilter === st
                    ? "bg-blue-600 text-white font-semibold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Best Run Only Toggle */}
          <button
            onClick={() => setBestOnly(!bestOnly)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-all ${
              bestOnly
                ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-300"
                : "bg-[#111827] border-[#1F2937] text-zinc-400 hover:text-white"
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-yellow-400" />
            Best Run Only
          </button>
        </div>
      </div>

      {/* Experiments Table */}
      <div className="rounded-xl border border-[#1F2937] bg-[#0D121B] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111827] text-zinc-400 font-mono uppercase text-[10px] tracking-wider border-b border-[#1F2937]">
              <tr>
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Experiment Name</th>
                <th className="py-3 px-4">Model</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Accuracy</th>
                <th className="py-3 px-4 text-right">Latency</th>
                <th className="py-3 px-4 text-right">VRAM</th>
                <th className="py-3 px-4 text-right">Throughput</th>
                <th className="py-3 px-4">GPU Cluster</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2937] text-zinc-300">
              {filtered.map((exp) => (
                <tr
                  key={exp.id}
                  className="hover:bg-[#111827]/70 transition-colors group"
                >
                  {/* ID */}
                  <td className="py-3.5 px-4 font-mono text-cyan-400 font-semibold">
                    #{String(exp.experiment_number).padStart(2, "0")}
                  </td>

                  {/* Name + Best Badge */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/experiments/${exp.id}`}
                        className="font-semibold text-zinc-100 group-hover:text-cyan-400 transition-colors"
                      >
                        {exp.name}
                      </Link>
                      {exp.is_best_run && (
                        <span className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 font-mono border border-yellow-500/40">
                          <Trophy className="w-3 h-3" /> BEST
                        </span>
                      )}
                    </div>
                    {exp.mutation_applied && (
                      <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                        ↳ {exp.mutation_applied}
                      </div>
                    )}
                  </td>

                  {/* Model */}
                  <td className="py-3.5 px-4 font-mono text-zinc-400 text-[11px]">
                    {exp.model_name}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono ${
                        exp.status === "completed"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : exp.status === "failed"
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                          : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                      }`}
                    >
                      {exp.status === "completed" && <CheckCircle2 className="w-3 h-3" />}
                      {exp.status === "failed" && <XCircle className="w-3 h-3" />}
                      {exp.status === "running" && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />}
                      {exp.status.toUpperCase()}
                    </span>
                  </td>

                  {/* Accuracy */}
                  <td className="py-3.5 px-4 text-right font-mono font-bold">
                    <span className={exp.accuracy && exp.accuracy >= 85 ? "text-emerald-400" : "text-zinc-300"}>
                      {exp.accuracy ? `${exp.accuracy}%` : "—"}
                    </span>
                  </td>

                  {/* Latency */}
                  <td className="py-3.5 px-4 text-right font-mono">
                    <span className={exp.latency_ms && exp.latency_ms > 150 ? "text-rose-400" : "text-zinc-200"}>
                      {exp.latency_ms ? `${exp.latency_ms} ms` : "—"}
                    </span>
                  </td>

                  {/* VRAM */}
                  <td className="py-3.5 px-4 text-right font-mono">
                    <span className={exp.vram_gb && exp.vram_gb > 8.0 ? "text-rose-400" : "text-zinc-200"}>
                      {exp.vram_gb ? `${exp.vram_gb} GB` : "—"}
                    </span>
                  </td>

                  {/* Throughput */}
                  <td className="py-3.5 px-4 text-right font-mono text-zinc-400">
                    {exp.throughput_tokens_sec ? `${exp.throughput_tokens_sec} tok/s` : "—"}
                  </td>

                  {/* GPU Cluster */}
                  <td className="py-3.5 px-4 font-mono text-zinc-400 text-[11px]">
                    Nebius H100
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/experiments/${exp.id}`}
                      className="px-2.5 py-1 rounded bg-[#1F2937] hover:bg-blue-600 hover:text-white text-zinc-300 text-[11px] font-medium transition-all inline-flex items-center gap-1"
                    >
                      Inspect <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
