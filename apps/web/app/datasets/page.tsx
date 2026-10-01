"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Database,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  FileCheck,
  Languages,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { fetchApi } from "@/lib/api";
import { DatasetItem } from "@/types";

export default function DatasetLabPage() {
  const [datasets, setDatasets] = useState<DatasetItem[]>([]);
  const [validatingId, setValidatingId] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDatasets() {
      try {
        const data = await fetchApi<DatasetItem[]>("/api/datasets");
        setDatasets(data);
      } catch (err) {
        console.error("Failed to load datasets:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDatasets();
  }, []);

  const handleValidate = async (datasetId: string) => {
    setValidatingId(datasetId);
    try {
      const res = await fetchApi(`/api/datasets/${datasetId}/validate`, { method: "POST" });
      setValidationResult(res);
    } catch (err) {
      console.error("Validation error:", err);
    } finally {
      setValidatingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-mono mb-2">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            BENCHMARK & TUNING CURATION
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Dataset Lab
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Curated mathematical reasoning, algorithmic logic, and LaTeX competition corpora ready for high-throughput GPU training.
          </p>
        </div>
      </div>

      {/* Validation modal / notice banner if just validated */}
      {validationResult && (
        <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>
              <strong>{validationResult.dataset}:</strong> {validationResult.message} (Quality Score: {validationResult.token_integrity_score})
            </span>
          </div>
          <button
            onClick={() => setValidationResult(null)}
            className="text-xs text-zinc-400 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Dataset Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {datasets.map((d) => (
          <div
            key={d.id}
            className="p-6 rounded-2xl bg-[#0D121B] border border-[#1F2937] hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                    {d.task_type}
                  </span>
                  <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors mt-1.5">
                    {d.name}
                  </h3>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-zinc-500 font-mono">QUALITY</div>
                  <div className="text-sm font-bold text-emerald-400 font-mono">
                    {d.quality_score}/100
                  </div>
                </div>
              </div>

              <p className="text-xs text-zinc-400 font-sans line-clamp-2">
                {d.description}
              </p>

              {/* Stats matrix */}
              <div className="grid grid-cols-2 gap-2 bg-[#111827] p-3 rounded-xl border border-[#1F2937] text-xs font-mono">
                <div>
                  <div className="text-[10px] text-zinc-500">SAMPLE COUNT</div>
                  <div className="text-zinc-200 font-semibold">{d.sample_count.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-[10px] text-zinc-500">TOKEN VOLUME</div>
                  <div className="text-cyan-400 font-semibold">{d.token_count}</div>
                </div>
                <div className="pt-1.5">
                  <div className="text-[10px] text-zinc-500">LANGUAGES</div>
                  <div className="text-zinc-300 font-semibold truncate">{d.languages?.join(", ")}</div>
                </div>
                <div className="pt-1.5">
                  <div className="text-[10px] text-zinc-500">LICENSE</div>
                  <div className="text-zinc-300 font-semibold truncate">{d.license}</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-[#1F2937] flex items-center justify-between">
              <button
                onClick={() => handleValidate(d.id)}
                disabled={validatingId === d.id}
                className="px-3 py-1.5 rounded-lg bg-[#111827] hover:bg-[#1A2333] border border-[#1F2937] text-zinc-300 text-xs font-mono transition-colors flex items-center gap-1.5"
              >
                {validatingId === d.id ? (
                  <div className="w-3 h-3 rounded-full border border-white border-t-transparent animate-spin" />
                ) : (
                  <FileCheck className="w-3.5 h-3.5 text-cyan-400" />
                )}
                Validate Schema
              </button>

              <Link
                href={`/research?dataset=${encodeURIComponent(d.name)}`}
                className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-cyan-300 border border-blue-500/30 text-xs font-medium inline-flex items-center gap-1.5 transition-all"
              >
                Use in Run <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
