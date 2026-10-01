"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bot,
  Cpu,
  Layers,
  Sparkles,
  ExternalLink,
  Shield,
  Zap,
  ArrowRight
} from "lucide-react";
import { fetchApi } from "@/lib/api";
import { ModelItem } from "@/types";

export default function ModelLabPage() {
  const [models, setModels] = useState<ModelItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFamily, setSelectedFamily] = useState("all");

  useEffect(() => {
    async function loadModels() {
      try {
        const data = await fetchApi<ModelItem[]>("/api/models");
        setModels(data);
      } catch (err) {
        console.error("Failed to load models:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadModels();
  }, []);

  const families = ["all", "Qwen", "Llama", "DeepSeek", "Mistral", "Gemma", "Phi"];

  const filtered = selectedFamily === "all"
    ? models
    : models.filter((m) => m.family.toLowerCase() === selectedFamily.toLowerCase());

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-mono mb-2">
            <Bot className="w-3.5 h-3.5 text-cyan-400" />
            ARCHITECTURE CATALOGUE
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Model Lab & Candidate Architectures
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Compare parameter scale, context lengths, supported hardware quantizations, and reasoning benchmarks.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-1 bg-[#0D121B] p-1 rounded-xl border border-[#1F2937] text-xs">
          {families.map((f) => (
            <button
              key={f}
              onClick={() => setSelectedFamily(f)}
              className={`px-3 py-1.5 rounded-lg capitalize font-mono text-[11px] transition-all ${
                selectedFamily === f
                  ? "bg-blue-600 text-white font-semibold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Model Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((m) => (
          <div
            key={m.id}
            className="p-6 rounded-2xl bg-[#0D121B] border border-[#1F2937] hover:border-blue-500/50 transition-all flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-cyan-400 border border-blue-500/30">
                    {m.family} FAMILY
                  </span>
                  <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors mt-1.5">
                    {m.name}
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-purple-400 bg-purple-500/10 px-2 py-1 rounded">
                  {m.parameter_count}
                </span>
              </div>

              <p className="text-xs text-zinc-400 line-clamp-2 font-sans">
                {m.description}
              </p>

              {/* Hardware specifications matrix */}
              <div className="grid grid-cols-2 gap-2 bg-[#111827] p-3 rounded-xl border border-[#1F2937] text-xs font-mono">
                <div>
                  <div className="text-[10px] text-zinc-500">CONTEXT LENGTH</div>
                  <div className="text-zinc-200 font-semibold">{m.context_window.toLocaleString()} tok</div>
                </div>
                <div>
                  <div className="text-[10px] text-zinc-500">VRAM REQ (MIN)</div>
                  <div className="text-cyan-400 font-semibold">{m.vram_min_gb} GB</div>
                </div>
                <div className="pt-1.5">
                  <div className="text-[10px] text-zinc-500">DEFAULT PRECISION</div>
                  <div className="text-zinc-200 font-semibold uppercase">{m.default_precision}</div>
                </div>
                <div className="pt-1.5">
                  <div className="text-[10px] text-zinc-500">LICENSE</div>
                  <div className="text-zinc-200 font-semibold truncate">{m.license}</div>
                </div>
              </div>

              {/* Quantization tags */}
              <div className="space-y-1">
                <div className="text-[10px] text-zinc-500 font-mono uppercase">Supported Quantizations</div>
                <div className="flex flex-wrap gap-1.5">
                  {m.supported_quantizations?.map((q) => (
                    <span
                      key={q}
                      className="px-2 py-0.5 rounded bg-[#1A2333] text-zinc-300 text-[10px] font-mono border border-zinc-700"
                    >
                      {q}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Action */}
            <div className="pt-2 border-t border-[#1F2937] flex items-center justify-between">
              <span className="text-[11px] text-zinc-500">
                {m.recommended_target?.slice(0, 30)}...
              </span>
              <Link
                href={`/research?model=${encodeURIComponent(m.name)}`}
                className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-cyan-300 border border-blue-500/30 text-xs font-medium inline-flex items-center gap-1.5 transition-all"
              >
                Use in Research <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
