"use client";

import { useState } from "react";
import { Search, Bell, BookOpen, Layers, ShieldCheck, Cpu } from "lucide-react";

interface TopBarProps {
  onOpenCommandPalette: () => void;
}

export function TopBar({ onOpenCommandPalette }: TopBarProps) {
  return (
    <header className="h-16 bg-[#0B0F17]/90 backdrop-blur-md border-b border-[#1B2230] px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Search & Workspace */}
      <div className="flex items-center gap-4">
        {/* Workspace Selector */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111827] border border-[#1F2937] text-xs">
          <Layers className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-zinc-200 font-medium">Frontier Reasoning Lab</span>
          <span className="text-[10px] text-zinc-500 font-mono">v1.0</span>
        </div>

        {/* Global Search / Command Bar */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-3 px-3.5 py-1.5 rounded-lg bg-[#111827]/70 border border-[#1F2937] text-xs text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-all w-64 text-left group"
        >
          <Search className="w-3.5 h-3.5 text-zinc-500 group-hover:text-cyan-400 transition-colors" />
          <span className="flex-1">Search research or commands...</span>
          <kbd className="text-[10px] bg-[#1F2937] text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-700 font-mono">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Operational Status, Demo Badge, User Avatar */}
      <div className="flex items-center gap-4">
        {/* Hardware Status Pill */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/30 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>SYSTEM OPERATIONAL</span>
          <span className="text-zinc-600">|</span>
          <span className="text-zinc-300">Nebius • NVIDIA H100</span>
        </div>

        {/* Demo Mode Indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span>DEMO / SIMULATION MODE</span>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2 text-zinc-400">
          <a
            href="https://docs.neuroforge.ai"
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-lg hover:bg-[#111827] hover:text-zinc-100 transition-colors"
            title="Documentation"
          >
            <BookOpen className="w-4 h-4" />
          </a>
          <button
            className="p-2 rounded-lg hover:bg-[#111827] hover:text-zinc-100 transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500" />
          </button>
        </div>

        {/* User Avatar */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-[#1B2230]">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-xs font-bold text-white shadow-sm">
            AV
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-medium text-zinc-200 leading-tight">Dr. Alex Vance</div>
            <div className="text-[10px] text-zinc-500 font-mono leading-tight">Principal AI Architect</div>
          </div>
        </div>
      </div>
    </header>
  );
}
