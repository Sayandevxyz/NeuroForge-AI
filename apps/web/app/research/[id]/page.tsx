"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Brain,
  CheckCircle2,
  Clock,
  Cpu,
  AlertCircle,
  Pause,
  Play,
  XCircle,
  FlaskConical,
  Dna,
  FileText,
  Activity,
  ArrowRight,
  TrendingUp,
  ShieldAlert
} from "lucide-react";
import { fetchApi } from "@/lib/api";
import { ResearchRun, AgentEvent, ExperimentSummary } from "@/types";

const STAGES = [
  { id: "goal_analysis", label: "Goal Analysis" },
  { id: "hypothesis_generation", label: "Hypothesis Generation" },
  { id: "dataset_prep", label: "Dataset Preparation" },
  { id: "experiment_design", label: "Experiment Design" },
  { id: "gpu_training", label: "GPU Training" },
  { id: "evaluation", label: "Evaluation" },
  { id: "failure_analysis", label: "Failure Analysis" },
  { id: "completed", label: "Research Synthesis" }
];

export default function LiveResearchRunPage() {
  const params = useParams();
  const router = useRouter();
  const runId = params.id as string;

  const [run, setRun] = useState<ResearchRun | null>(null);
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const eventsEndRef = useRef<HTMLDivElement>(null);

  // Load run details
  async function loadRun() {
    try {
      const data = await fetchApi<ResearchRun>(`/api/research/${runId}`);
      setRun(data);
      if (data.agent_events) {
        setEvents(data.agent_events);
      }
    } catch (err) {
      console.error("Error loading research run:", err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadRun();

    // Setup polling fallback every 2.5s for live updates
    const interval = setInterval(loadRun, 2500);

    // Setup WebSocket
    let ws: WebSocket | null = null;
    try {
      const wsUrl = `ws://localhost:8000/ws/research/${runId}`;
      ws = new WebSocket(wsUrl);
      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.event) {
            setEvents((prev) => [...prev, {
              id: Math.random().toString(),
              research_run_id: runId,
              agent_name: msg.event.agent || "Orchestrator",
              event_type: msg.event.event || "event",
              message: msg.event.message || "",
              status: msg.event.status || "info",
              duration_ms: msg.event.duration_ms || 300,
              created_at: new Date().toISOString()
            }]);
          }
          if (msg.stage && run) {
            setRun((r) => r ? { ...r, active_stage: msg.stage } : r);
          }
        } catch {}
      };
    } catch {}

    return () => {
      clearInterval(interval);
      if (ws) ws.close();
    };
  }, [runId]);

  useEffect(() => {
    eventsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [events]);

  const handlePause = async () => {
    await fetchApi(`/api/research/${runId}/pause`, { method: "POST" });
    loadRun();
  };

  const handleResume = async () => {
    await fetchApi(`/api/research/${runId}/resume`, { method: "POST" });
    loadRun();
  };

  const handleCancel = async () => {
    await fetchApi(`/api/research/${runId}/cancel`, { method: "POST" });
    loadRun();
  };

  if (isLoading && !run) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mx-auto" />
        <div className="text-xs text-zinc-500 font-mono">Connecting to autonomous research run...</div>
      </div>
    );
  }

  if (!run) {
    return (
      <div className="py-24 text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
        <div className="text-sm font-semibold text-white">Research Run Not Found</div>
        <Link href="/research" className="text-xs text-cyan-400 hover:underline">
          Return to Research Center
        </Link>
      </div>
    );
  }

  const currentStageIndex = STAGES.findIndex((s) => s.id === run.active_stage);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header bar */}
      <div className="p-6 rounded-2xl bg-[#0D121B] border border-[#1F2937] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-500/10 text-cyan-400 border border-blue-500/30">
              {run.run_code}
            </span>
            <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${
              run.status === "running"
                ? "bg-cyan-950/60 text-cyan-400 border border-cyan-500/30"
                : run.status === "completed"
                ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/30"
                : "bg-amber-950/60 text-amber-400 border border-amber-500/30"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                run.status === "running" ? "bg-cyan-400 animate-ping" : run.status === "completed" ? "bg-emerald-400" : "bg-amber-400"
              }`} />
              {run.status.toUpperCase()}
            </span>
          </div>

          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            {run.title}
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl font-sans">
            Goal: "{run.goal}"
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {run.status === "running" && (
            <button
              onClick={handlePause}
              className="px-3.5 py-2 rounded-lg bg-[#111827] border border-[#1F2937] text-zinc-300 text-xs font-medium flex items-center gap-1.5 hover:bg-[#1A2333] transition-colors"
            >
              <Pause className="w-3.5 h-3.5" /> Pause
            </button>
          )}

          {run.status === "paused" && (
            <button
              onClick={handleResume}
              className="px-3.5 py-2 rounded-lg bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 text-xs font-medium flex items-center gap-1.5 hover:bg-emerald-600/30 transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-emerald-400" /> Resume
            </button>
          )}

          {run.status === "running" && (
            <button
              onClick={handleCancel}
              className="px-3 py-2 rounded-lg bg-rose-600/10 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-center gap-1.5 hover:bg-rose-600/20 transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" /> Stop
            </button>
          )}

          <Link
            href="/genome"
            className="px-3.5 py-2 rounded-lg bg-purple-600/20 border border-purple-500/30 text-purple-300 text-xs font-medium flex items-center gap-1.5 hover:bg-purple-600/30 transition-colors"
          >
            <Dna className="w-3.5 h-3.5" /> Genome
          </Link>

          <Link
            href="/reports"
            className="px-3.5 py-2 rounded-lg bg-blue-600/20 border border-blue-500/30 text-cyan-300 text-xs font-medium flex items-center gap-1.5 hover:bg-blue-600/30 transition-colors"
          >
            <FileText className="w-3.5 h-3.5" /> Report
          </Link>
        </div>
      </div>

      {/* Autonomous Pipeline Stepper */}
      <div className="p-6 rounded-2xl bg-[#0D121B] border border-[#1F2937] space-y-4">
        <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" /> Autonomous Pipeline Execution
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
          {STAGES.map((s, idx) => {
            const isDone = run.status === "completed" || (currentStageIndex >= 0 && idx < currentStageIndex);
            const isCurrent = run.status === "running" && (idx === currentStageIndex || (currentStageIndex === -1 && idx === 0));

            return (
              <div
                key={s.id}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                  isCurrent
                    ? "bg-blue-600/20 border-cyan-400 text-cyan-300 shadow-md shadow-blue-500/20"
                    : isDone
                    ? "bg-[#111827] border-emerald-500/40 text-emerald-400"
                    : "bg-[#090D14] border-[#1F2937] text-zinc-600"
                }`}
              >
                <div>
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : isCurrent ? (
                    <div className="w-4 h-4 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                  ) : (
                    <span className="text-[10px] font-mono text-zinc-600">○</span>
                  )}
                </div>
                <span className="text-[11px] font-medium leading-tight">{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Layout: Agent Activity Panel + Hypotheses / Experiments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Agent Activity Panel (Live Terminal Event Stream) */}
        <div className="p-6 rounded-2xl bg-[#0D121B] border border-[#1F2937] flex flex-col h-[520px]">
          <div className="flex items-center justify-between pb-3 border-b border-[#1F2937]">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-cyan-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              Agent Activity Stream
            </div>
            <span className="text-[11px] font-mono text-zinc-500">
              {events.length} Events Logged
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3 font-mono text-xs mt-2">
            {events.length === 0 ? (
              <div className="text-zinc-600 text-center py-16">
                Waiting for agent events...
              </div>
            ) : (
              events.map((ev, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-[#090D14] border border-[#1B2230] space-y-1 hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-cyan-400 font-semibold">{ev.agent_name}</span>
                    <span className="text-zinc-500">
                      {new Date(ev.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-zinc-300 font-sans text-xs">{ev.message}</div>
                  <div className="text-[10px] text-zinc-600 flex items-center justify-between pt-1">
                    <span>{ev.event_type}</span>
                    <span>{ev.duration_ms} ms</span>
                  </div>
                </div>
              ))
            )}
            <div ref={eventsEndRef} />
          </div>
        </div>

        {/* Right: Hypotheses & Active Experiments */}
        <div className="space-y-6">
          {/* Hypotheses Card */}
          <div className="p-6 rounded-2xl bg-[#0D121B] border border-[#1F2937] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                Formulated Hypotheses ({run.hypotheses?.length || 0})
              </h3>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {run.hypotheses?.map((h) => (
                <div
                  key={h.id}
                  className="p-2.5 rounded-lg bg-[#111827] border border-[#1F2937] text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-cyan-400 font-mono font-semibold">{h.hypothesis_code}: {h.title}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                      {h.status}
                    </span>
                  </div>
                  <div className="text-zinc-400 text-[11px]">{h.statement}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Experiments in this run */}
          <div className="p-6 rounded-2xl bg-[#0D121B] border border-[#1F2937] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                Generated Experiments ({run.experiments?.length || 0})
              </h3>
              <Link href="/experiments" className="text-xs text-cyan-400 hover:underline">
                View all table →
              </Link>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {run.experiments?.map((exp) => (
                <Link
                  key={exp.id}
                  href={`/experiments/${exp.id}`}
                  className="block p-3 rounded-lg bg-[#111827] border border-[#1F2937] hover:border-blue-500/50 transition-all text-xs group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-200 group-hover:text-cyan-400 transition-colors">
                      #{String(exp.experiment_number).padStart(2, "0")} {exp.name}
                    </span>
                    {exp.is_best_run ? (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 font-bold border border-yellow-500/40">
                        🏆 BEST RUN
                      </span>
                    ) : (
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        exp.status === "completed" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                      }`}>
                        {exp.status.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-zinc-500 font-mono mt-1.5">
                    <span>Acc: <strong className="text-zinc-300">{exp.accuracy}%</strong></span>
                    <span>Lat: <strong className="text-zinc-300">{exp.latency_ms}ms</strong></span>
                    <span>VRAM: <strong className="text-zinc-300">{exp.vram_gb}GB</strong></span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
