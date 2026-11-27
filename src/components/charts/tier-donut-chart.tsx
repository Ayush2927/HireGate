"use client";

import React from "react";

export function TierDonutChart() {
  // SVG Donut chart using stroke-dasharray & stroke-dashoffset
  // Total circumference for r=65 is 2 * Math.PI * 65 ≈ 408.4
  // Tier 1: 28% -> 114.3
  // Tier 2: 42% -> 171.5
  // Tier 3: 20% -> 81.7
  // Not Placed: 10% -> 40.8

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
      {/* SVG Donut */}
      <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
          {/* Base background circle */}
          <circle
            cx="80"
            cy="80"
            r="60"
            fill="transparent"
            stroke="#f1f5f9"
            strokeWidth="20"
          />

          {/* Segment 1: Tier 1 (Blue - 28%) */}
          <circle
            cx="80"
            cy="80"
            r="60"
            fill="transparent"
            stroke="#2563eb"
            strokeWidth="20"
            strokeDasharray="105.5 377"
            strokeDashoffset="0"
          />

          {/* Segment 2: Tier 2 (Sky Blue - 42%) */}
          <circle
            cx="80"
            cy="80"
            r="60"
            fill="transparent"
            stroke="#38bdf8"
            strokeWidth="20"
            strokeDasharray="158.3 377"
            strokeDashoffset="-105.5"
          />

          {/* Segment 3: Tier 3 (Amber - 20%) */}
          <circle
            cx="80"
            cy="80"
            r="60"
            fill="transparent"
            stroke="#f59e0b"
            strokeWidth="20"
            strokeDasharray="75.4 377"
            strokeDashoffset="-263.8"
          />

          {/* Segment 4: Not Placed (Slate - 10%) */}
          <circle
            cx="80"
            cy="80"
            r="60"
            fill="transparent"
            stroke="#94a3b8"
            strokeWidth="20"
            strokeDasharray="37.7 377"
            strokeDashoffset="-339.2"
          />
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xl font-extrabold text-slate-900 font-mono">1,102</span>
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            Verified
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-2.5 text-xs w-full max-w-[160px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm bg-[#2563eb]" />
            <span className="text-slate-600 font-medium">Tier 1</span>
          </div>
          <span className="font-bold text-slate-900 font-mono">28%</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm bg-[#38bdf8]" />
            <span className="text-slate-600 font-medium">Tier 2</span>
          </div>
          <span className="font-bold text-slate-900 font-mono">42%</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm bg-[#f59e0b]" />
            <span className="text-slate-600 font-medium">Tier 3</span>
          </div>
          <span className="font-bold text-slate-900 font-mono">20%</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm bg-[#94a3b8]" />
            <span className="text-slate-600 font-medium">Not Placed</span>
          </div>
          <span className="font-bold text-slate-900 font-mono">10%</span>
        </div>
      </div>
    </div>
  );
}

