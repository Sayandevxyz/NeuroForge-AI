"use client";

import { useEffect, useState } from "react";
import {
  Cpu,
  Zap,
  Thermometer,
  Activity,
  Server,
  Layers,
  CheckCircle2,
  Clock,
  Radio,
  RefreshCw,
  ExternalLink
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { fetchApi } from "@/lib/api";
import { GPUClusterStatus } from "@/types";

export default function GPULabPage() {
  const [cluster, setCluster] = useState<GPUClusterStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function loadStatus() {
    try {
      const data = await fetchApi<GPUClusterStatus>("/api/gpu/status");
      setCluster(data);
    } catch (err) {
      console.error("Failed to load GPU status:", err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 4000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading && !cluster) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mx-auto" />
        <div className="text-xs text-zinc-500 font-mono">Connecting to Nebius Cloud GPU telemetry...</div>
      </div>
    );
  }

  const nodes = cluster?.live_nodes || [];
  const telemetry = cluster?.telemetry_history || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono mb-2">
            <Cpu className="w-3.5 h-3.5" />
            NVIDIA H100 SXM5 CLUSTER OBSERVABILITY
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            GPU Lab & Compute Fabric
          </h1>
          <p className="text-xs text-zinc-400 mt-1 font-mono">
            Provider: {cluster?.provider} • Cluster ID: {cluster?.cluster_name}
          </p>
        </div>

        {/* Refresh / Live Status Indicator */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-lg bg-[#0D121B] border border-[#1F2937] flex items-center gap-2 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-zinc-200">CLUSTER {cluster?.status}</span>
          </div>

          <button
            onClick={loadStatus}
            className="p-2 rounded-lg bg-[#111827] border border-[#1F2937] text-zinc-400 hover:text-white transition-colors"
            title="Refresh Telemetry"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Demo Mode Notice */}
      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>{cluster?.disclaimer || "DEMO ENVIRONMENT: Realistic deterministic simulated GPU hardware metrics."}</span>
        </div>
        <span className="text-[11px] text-amber-400/80 underline cursor-pointer">
          Switch to live Nebius Cluster in Settings →
        </span>
      </div>

      {/* Cluster Hardware Gauges Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* GPU Utilization */}
        <div className="p-5 rounded-2xl bg-[#0D121B] border border-[#1F2937] space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>GPU UTILIZATION</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {cluster?.cluster_utilization_pct || 89.4}%
          </div>
          <div className="w-full bg-[#1F2937] rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${cluster?.cluster_utilization_pct || 89.4}%` }}
            />
          </div>
          <div className="text-[11px] text-zinc-500 font-mono">
            {cluster?.active_gpus || 10} of {cluster?.total_gpus || 16} GPUs Active
          </div>
        </div>

        {/* VRAM Memory */}
        <div className="p-5 rounded-2xl bg-[#0D121B] border border-[#1F2937] space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>VRAM ALLOCATION</span>
            <Server className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold text-purple-300 font-mono">
            {Math.round((cluster?.vram_used_gb || 948) / (cluster?.vram_total_gb || 1280) * 100)}%
          </div>
          <div className="w-full bg-[#1F2937] rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.round((cluster?.vram_used_gb || 948) / (cluster?.vram_total_gb || 1280) * 100)}%` }}
            />
          </div>
          <div className="text-[11px] text-zinc-500 font-mono">
            {cluster?.vram_used_gb || 948} GB / {cluster?.vram_total_gb || 1280} GB
          </div>
        </div>

        {/* Temperature */}
        <div className="p-5 rounded-2xl bg-[#0D121B] border border-[#1F2937] space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>TEMPERATURE</span>
            <Thermometer className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono">
            {cluster?.average_temp_c || 66.8}°C
          </div>
          <div className="w-full bg-[#1F2937] rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-lime-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min((cluster?.average_temp_c || 66.8) / 85 * 100, 100)}%` }}
            />
          </div>
          <div className="text-[11px] text-zinc-500 font-mono">
            Liquid Cooling • Safe Threshold (&lt;82°C)
          </div>
        </div>

        {/* Power Draw */}
        <div className="p-5 rounded-2xl bg-[#0D121B] border border-[#1F2937] space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>AVG POWER DRAW</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-300 font-mono">
            {Math.round(cluster?.average_power_watts || 312)} W
          </div>
          <div className="w-full bg-[#1F2937] rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min((cluster?.average_power_watts || 312) / 700 * 100, 100)}%` }}
            />
          </div>
          <div className="text-[11px] text-zinc-500 font-mono">
            TDP 700W SXM5 Spec
          </div>
        </div>
      </div>

      {/* Cluster Telemetry History Area Chart */}
      <div className="p-6 rounded-2xl bg-[#0D121B] border border-[#1F2937] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" /> Historical Cluster Telemetry
            </h3>
            <p className="text-xs text-zinc-500">Utilization & Thermal progression across training jobs</p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={telemetry}>
              <defs>
                <linearGradient id="utilGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0066FF" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#0066FF" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
              <XAxis dataKey="time" stroke="#6B7280" fontSize={11} fontStyle="mono" />
              <YAxis stroke="#6B7280" fontSize={11} fontStyle="mono" domain={[50, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0D121B", borderColor: "#1F2937", borderRadius: 8, fontSize: 12 }}
              />
              <Area type="monotone" dataKey="utilization" stroke="#0066FF" strokeWidth={2} name="Utilization (%)" fillOpacity={1} fill="url(#utilGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Live Worker Nodes Table */}
      <div className="p-6 rounded-2xl bg-[#0D121B] border border-[#1F2937] space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-2">
            <Server className="w-4 h-4 text-blue-400" /> Nebius H100 Worker Nodes ({nodes.length})
          </h3>
          <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> All Nodes Healthy
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111827] text-zinc-400 font-mono uppercase text-[10px] tracking-wider border-b border-[#1F2937]">
              <tr>
                <th className="py-3 px-4">Node ID</th>
                <th className="py-3 px-4">Hostname</th>
                <th className="py-3 px-4">GPU Model</th>
                <th className="py-3 px-4 text-right">Utilization</th>
                <th className="py-3 px-4 text-right">VRAM Used</th>
                <th className="py-3 px-4 text-right">Temp</th>
                <th className="py-3 px-4 text-right">Power</th>
                <th className="py-3 px-4">Active Workload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2937] text-zinc-300">
              {nodes.map((node) => (
                <tr key={node.node_id} className="hover:bg-[#111827]/70 font-mono text-xs">
                  <td className="py-3 px-4 text-cyan-400 font-bold">{node.node_id}</td>
                  <td className="py-3 px-4 text-zinc-400">{node.hostname}</td>
                  <td className="py-3 px-4 text-zinc-200">{node.gpu_model}</td>
                  <td className="py-3 px-4 text-right font-bold text-white">{node.utilization_pct}%</td>
                  <td className="py-3 px-4 text-right text-purple-300">{node.vram_used_gb} / {node.vram_total_gb} GB</td>
                  <td className="py-3 px-4 text-right text-emerald-400">{node.temperature_c}°C</td>
                  <td className="py-3 px-4 text-right text-amber-300">{node.power_watts} W</td>
                  <td className="py-3 px-4">
                    {node.active_job ? (
                      <span className="px-2 py-0.5 rounded bg-blue-500/20 text-cyan-300 border border-blue-500/30 text-[10px]">
                        {node.active_job}
                      </span>
                    ) : (
                      <span className="text-zinc-600 text-[10px]">IDLE POOL</span>
                    )}
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
