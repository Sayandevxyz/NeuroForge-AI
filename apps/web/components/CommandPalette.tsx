"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Sparkles,
  FlaskConical,
  Cpu,
  Bot,
  Database,
  FileText,
  Settings,
  X,
  Play
} from "lucide-react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchDemo?: () => void;
}

export function CommandPalette({ isOpen, onClose, onLaunchDemo }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent handles toggle
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const commands = [
    {
      title: "Run Hackathon Live Demo",
      description: "Trigger the autonomous closed-loop 2-minute demo workflow",
      icon: Play,
      color: "text-emerald-400 bg-emerald-500/10",
      action: () => {
        onClose();
        if (onLaunchDemo) onLaunchDemo();
        else router.push("/research/NF-027");
      }
    },
    {
      title: "Start Autonomous Research",
      description: "Input research goal and define optimization constraints",
      icon: Sparkles,
      color: "text-blue-400 bg-blue-500/10",
      action: () => {
        onClose();
        router.push("/research");
      }
    },
    {
      title: "Open Experiment Genome",
      description: "Inspect evolutionary lineage DAG and mutations",
      icon: FlaskConical,
      color: "text-purple-400 bg-purple-500/10",
      action: () => {
        onClose();
        router.push("/genome");
      }
    },
    {
      title: "Open Experiments Table",
      description: "Browse 12 autonomous experiments and metrics",
      icon: FlaskConical,
      color: "text-cyan-400 bg-cyan-500/10",
      action: () => {
        onClose();
        router.push("/experiments");
      }
    },
    {
      title: "Open GPU Lab",
      description: "Real-time Nebius Cloud NVIDIA H100 telemetry",
      icon: Cpu,
      color: "text-lime-400 bg-lime-500/10",
      action: () => {
        onClose();
        router.push("/gpu");
      }
    },
    {
      title: "Explore Model Lab",
      description: "Compare Qwen, Llama, and DeepSeek architectures",
      icon: Bot,
      color: "text-amber-400 bg-amber-500/10",
      action: () => {
        onClose();
        router.push("/models");
      }
    },
    {
      title: "Dataset Lab",
      description: "Inspect GSM8K, MATH, and quality scores",
      icon: Database,
      color: "text-rose-400 bg-rose-500/10",
      action: () => {
        onClose();
        router.push("/datasets");
      }
    },
    {
      title: "View Research Reports",
      description: "Read generated empirical reports and reproduction code",
      icon: FileText,
      color: "text-indigo-400 bg-indigo-500/10",
      action: () => {
        onClose();
        router.push("/reports");
      }
    },
    {
      title: "Open Settings",
      description: "Configure Nebius API keys and execution engines",
      icon: Settings,
      color: "text-zinc-400 bg-zinc-500/10",
      action: () => {
        onClose();
        router.push("/settings");
      }
    }
  ];

  const filtered = commands.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase()) ||
    c.description.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-start justify-center pt-24 p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-[#0D121B] border border-[#1F2937] rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Search header */}
        <div className="p-4 border-b border-[#1F2937] flex items-center gap-3">
          <Search className="w-5 h-5 text-cyan-400" />
          <input
            type="text"
            placeholder="Type a command or search destination..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-500 hover:text-zinc-300 hover:bg-[#111827]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Command list */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500">
              No matching commands found.
            </div>
          ) : (
            filtered.map((cmd, idx) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={idx}
                  onClick={cmd.action}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-[#151D2C] transition-colors text-left group"
                >
                  <div className={`p-2 rounded-lg ${cmd.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-zinc-200 group-hover:text-cyan-400 transition-colors">
                      {cmd.title}
                    </div>
                    <div className="text-[11px] text-zinc-500">{cmd.description}</div>
                  </div>
                  <kbd className="text-[10px] text-zinc-500 font-mono">↵</kbd>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#090D14] border-t border-[#1F2937] flex items-center justify-between text-[11px] text-zinc-500 font-mono">
          <span>Navigation: ↑ ↓ Enter</span>
          <span>NeuroForge OS Command Line</span>
        </div>
      </div>
    </div>
  );
}
