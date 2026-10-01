"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Flame,
  LayoutDashboard,
  FlaskConical,
  Brain,
  Cpu,
  BarChart3,
  Dna,
  Database,
  Bot,
  FileText,
  Settings,
  CircleDot
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Overview", href: "/", icon: LayoutDashboard },
  { label: "Research", href: "/research", icon: Brain },
  { label: "Experiments", href: "/experiments", icon: FlaskConical },
  { label: "GPU Lab", href: "/gpu", icon: Cpu },
  { label: "Benchmarks", href: "/benchmarks", icon: BarChart3 },
  { label: "Experiment Genome", href: "/genome", icon: Dna },
  { label: "Datasets", href: "/datasets", icon: Database },
  { label: "Models", href: "/models", icon: Bot },
  { label: "Reports", href: "/reports", icon: FileText },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#0B0F17] border-r border-[#1B2230] flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none z-30">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-[#1B2230]">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-600 via-cyan-500 to-emerald-400 p-[1.5px] flex items-center justify-center shadow-lg shadow-blue-500/20">
            <div className="w-full h-full bg-[#080B10] rounded-[7px] flex items-center justify-center">
              <Flame className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="font-bold text-sm tracking-wider text-white flex items-center gap-1.5">
              NEUROFORGE <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 font-mono">AI</span>
            </div>
            <div className="text-[10px] text-zinc-500 font-mono tracking-tight">AUTONOMOUS RESEARCH LAB</div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 mt-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-blue-600/10 text-cyan-400 border border-blue-500/30 shadow-sm shadow-blue-500/10"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-[#111827]/60"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-cyan-400" : "text-zinc-500"}`} />
                <span>{item.label}</span>
                {item.label === "Experiment Genome" && (
                  <span className="ml-auto text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono border border-purple-500/30">
                    CORE
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* GPU & Infrastructure Status Card */}
      <div className="p-3 border-t border-[#1B2230]">
        <div className="bg-[#111827]/80 rounded-lg p-3 border border-[#1F2937]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase">GPU Cluster</span>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Connected
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-medium text-white flex items-center justify-between">
              <span>Nebius Nordic</span>
              <span className="text-cyan-400 font-mono text-[11px]">H100 SXM5</span>
            </div>
            <div className="w-full bg-[#1F2937] rounded-full h-1.5 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full w-[89%]" />
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-0.5">
              <span>Pool: 16 GPUs</span>
              <span className="text-zinc-400">89.4% Util</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
