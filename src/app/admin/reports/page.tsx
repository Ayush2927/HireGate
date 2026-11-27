"use client";

import React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { ApplicationsTrendChart } from "@/components/charts/applications-trend-chart";
import { TierDonutChart } from "@/components/charts/tier-donut-chart";
import { Download } from "lucide-react";

export default function AdminReportsPage() {
  return (
    <AppShell initialRole="ADMIN" pageTitle="Reports">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
              Placement Reports &amp; Analytics
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
              Department-wise placement breakdown and application trends.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 self-start sm:self-auto"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV Report
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-[#0F172A]">
              Applications &amp; Shortlisting Trend
            </h3>
            <ApplicationsTrendChart />
          </div>
          <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-[#0F172A]">
              Placement Tier Distribution
            </h3>
            <TierDonutChart />
          </div>
        </div>
      </div>
    </AppShell>
  );
}

