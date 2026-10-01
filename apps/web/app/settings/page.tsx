"use client";

import { useEffect, useState } from "react";
import {
  Settings,
  Shield,
  Cpu,
  Cloud,
  Database,
  CheckCircle2,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Sliders
} from "lucide-react";
import { fetchApi } from "@/lib/api";

export default function SettingsPage() {
  const [demoMode, setDemoMode] = useState(true);
  const [gpuProvider, setGpuProvider] = useState("demo");
  const [nvidiaBackend, setNvidiaBackend] = useState("demo");
  const [aiProvider, setAiProvider] = useState("demo");
  const [nebiusKey, setNebiusKey] = useState("");
  const [nebiusProjectId, setNebiusProjectId] = useState("");
  const [nebiusClusterId, setNebiusClusterId] = useState("nebius-nordic-h100-sxm5");
  const [statusMsg, setStatusMsg] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await fetchApi<any>("/api/settings");
        setDemoMode(data.demo_mode);
        setGpuProvider(data.gpu_provider);
        setNvidiaBackend(data.nvidia_backend);
        setAiProvider(data.ai_provider);
        setNebiusClusterId(data.cluster_name);
      } catch (err) {
        console.error("Failed to load settings:", err);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchApi("/api/settings", {
        method: "POST",
        body: JSON.stringify({
          demo_mode: demoMode,
          gpu_provider: gpuProvider,
          nvidia_backend: nvidiaBackend,
          ai_provider: aiProvider,
          nebius_api_key: nebiusKey || undefined,
          nebius_project_id: nebiusProjectId || undefined,
          nebius_cluster_id: nebiusClusterId
        })
      });
      setStatusMsg("Configuration saved successfully.");
      setTimeout(() => setStatusMsg(""), 3000);
    } catch (err) {
      console.error("Error saving settings:", err);
    }
  };

  const handleResetDemoDb = async () => {
    if (!confirm("Reset database to initial NeuroForge demo state? This will recreate all 12 experiments for NF-027.")) return;
    setIsResetting(true);
    try {
      await fetchApi("/api/settings/reset-demo", { method: "POST" });
      setStatusMsg("Database reset and re-seeded with demo run NF-027.");
      setTimeout(() => setStatusMsg(""), 4000);
    } catch (err) {
      console.error("Reset error:", err);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-mono mb-2">
          <Settings className="w-3.5 h-3.5 text-cyan-400" />
          SYSTEM CONFIGURATION
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          Settings & Infrastructure Connectors
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Configure real Nebius Cloud credentials, select NVIDIA runtime engines, or switch to simulated demo mode.
        </p>
      </div>

      {statusMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 font-mono animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {statusMsg}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Execution & Demo Mode */}
        <div className="p-6 rounded-2xl bg-[#0D121B] border border-[#1F2937] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" />
                Execution Mode
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Toggle between deterministic hardware simulation (Demo Mode) and live cloud GPU dispatch.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                const nextVal = !demoMode;
                setDemoMode(nextVal);
                if (nextVal) {
                  setGpuProvider("demo");
                  setNvidiaBackend("demo");
                } else {
                  setGpuProvider("nebius");
                  setNvidiaBackend("pytorch");
                }
              }}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                demoMode
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                  : "bg-emerald-500/20 text-emerald-300 border-emerald-500/50"
              }`}
            >
              {demoMode ? "DEMO MODE ACTIVE" : "LIVE INFRASTRUCTURE ACTIVE"}
            </button>
          </div>
        </div>

        {/* Section 2: Nebius Cloud Configuration */}
        <div className="p-6 rounded-2xl bg-[#0D121B] border border-[#1F2937] space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Cloud className="w-4 h-4 text-purple-400" />
              Nebius Cloud Infrastructure Connector
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Credentials are kept in-memory and in environment variables. Never committed to version control.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-zinc-400">NEBIUS API KEY</label>
              <input
                type="password"
                placeholder="neb_live_..."
                value={nebiusKey}
                onChange={(e) => setNebiusKey(e.target.value)}
                className="w-full bg-[#111827] border border-[#1F2937] rounded-xl px-4 py-2.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-zinc-400">NEBIUS PROJECT ID</label>
              <input
                type="text"
                placeholder="project-nordic-reasoning-01"
                value={nebiusProjectId}
                onChange={(e) => setNebiusProjectId(e.target.value)}
                className="w-full bg-[#111827] border border-[#1F2937] rounded-xl px-4 py-2.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[11px] font-mono text-zinc-400">CLUSTER ID / RESOURCE POOL</label>
              <input
                type="text"
                value={nebiusClusterId}
                onChange={(e) => setNebiusClusterId(e.target.value)}
                className="w-full bg-[#111827] border border-[#1F2937] rounded-xl px-4 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 3: NVIDIA Execution Backend */}
        <div className="p-6 rounded-2xl bg-[#0D121B] border border-[#1F2937] space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              NVIDIA Acceleration Engine
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Modular execution runner interface for training and low-latency inference compilation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { id: "demo", title: "Demo Simulation Engine", desc: "Deterministic NVIDIA H100 modeling" },
              { id: "pytorch", title: "PyTorch 2.4 + FlashAttention-3", desc: "Distributed FSDP / DDP training" },
              { id: "tensorrt_llm", title: "NVIDIA TensorRT-LLM", desc: "Low-latency FP8 / Paged KV compilation" },
              { id: "nemo", title: "NVIDIA NeMo Framework", desc: "Megatron-LM tensor and pipeline parallelism" }
            ].map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setNvidiaBackend(b.id)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  nvidiaBackend === b.id
                    ? "bg-emerald-600/10 border-emerald-500/50 text-white"
                    : "bg-[#111827] border-[#1F2937] text-zinc-400 hover:border-zinc-700"
                }`}
              >
                <div className={`text-xs font-semibold ${nvidiaBackend === b.id ? "text-emerald-400" : "text-zinc-200"}`}>
                  {b.title}
                </div>
                <div className="text-[11px] text-zinc-500 mt-1">{b.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleResetDemoDb}
            disabled={isResetting}
            className="px-4 py-2.5 rounded-xl bg-[#111827] border border-[#1F2937] hover:border-zinc-700 text-zinc-300 text-xs font-mono flex items-center gap-2 transition-colors"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? "animate-spin" : ""}`} />
            Reset Demo Database
          </button>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 hover:opacity-90"
          >
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
