"use client";

import React from "react";

export function ApplicationsTrendChart() {
  return (
    <div className="w-full h-48 relative">
      <svg
        viewBox="0 0 500 180"
        className="w-full h-full overflow-visible text-slate-400 text-[10px]"
      >
        {/* Horizontal grid lines */}
        <line x1="30" y1="20" x2="490" y2="20" stroke="#f1f5f9" strokeWidth="1" />
        <text x="5" y="24" fill="#94a3b8">200</text>

        <line x1="30" y1="60" x2="490" y2="60" stroke="#f1f5f9" strokeWidth="1" />
        <text x="5" y="64" fill="#94a3b8">150</text>

        <line x1="30" y1="100" x2="490" y2="100" stroke="#f1f5f9" strokeWidth="1" />
        <text x="5" y="104" fill="#94a3b8">100</text>

        <line x1="30" y1="140" x2="490" y2="140" stroke="#f1f5f9" strokeWidth="1" />
        <text x="12" y="144" fill="#94a3b8">50</text>

        {/* X-axis labels */}
        <text x="50" y="170" fill="#94a3b8">Aug 1</text>
        <text x="150" y="170" fill="#94a3b8">Aug 7</text>
        <text x="250" y="170" fill="#94a3b8">Aug 14</text>
        <text x="350" y="170" fill="#94a3b8">Aug 21</text>
        <text x="450" y="170" fill="#94a3b8">Aug 28</text>

        {/* Line 1: Applied (Blue) */}
        <path
          d="M 50 145 Q 150 120, 250 85 T 450 35"
          fill="none"
          stroke="#2563eb"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Line 2: Shortlisted (Emerald) */}
        <path
          d="M 50 155 Q 150 140, 250 125 T 450 75"
          fill="none"
          stroke="#10b981"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Line 3: Offers (Slate/Purple) */}
        <path
          d="M 50 160 Q 150 155, 250 148 T 450 120"
          fill="none"
          stroke="#64748b"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          strokeLinecap="round"
        />

        {/* Data points for Applied line */}
        <circle cx="50" cy="145" r="3.5" fill="#2563eb" />
        <circle cx="150" cy="120" r="3.5" fill="#2563eb" />
        <circle cx="250" cy="85" r="3.5" fill="#2563eb" />
        <circle cx="350" cy="60" r="3.5" fill="#2563eb" />
        <circle cx="450" cy="35" r="4.5" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
      </svg>
    </div>
  );
}

