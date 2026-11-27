"use client";

import React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Award, CheckCircle2, Info } from "lucide-react";

export default function StudentPlacementStatusPage() {
  return (
    <AppShell initialRole="STUDENT" pageTitle="Placement Status">
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
            Placement Status &amp; Tier Policy
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Review your current offer status and institutional tier upgrade rules.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-2xs flex items-start gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB] border border-blue-200 shrink-0">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-[#64748B]">
              Current Standing
            </div>
            <div className="text-xl font-bold text-[#0F172A] mt-0.5">
              Unplaced — Eligible for All Tiers
            </div>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              You currently hold 0 final offers and 1 active interview in progress (Adobe — Product Intern). You may apply to Tier 1, Tier 2, and Tier 3 drives freely.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 space-y-4">
          <h2 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
            <Info className="h-4 w-4 text-[#2563EB]" />
            Institutional Placement Policy Rules
          </h2>
          <div className="space-y-3 text-xs text-slate-600">
            <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-slate-200 flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900">Tier 1 (Dream Offers • ≥ ₹ 25 LPA):</strong>{" "}
                Accepting a Tier 1 offer locks further campus applications across all tiers.
              </div>
            </div>
            <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-slate-200 flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900">Tier 2 (Core • ₹ 10–25 LPA):</strong>{" "}
                Students placed in Tier 2 may upgrade once to a Tier 1 drive.
              </div>
            </div>
            <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-slate-200 flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900">Tier 3 (&lt; ₹ 10 LPA):</strong>{" "}
                Eligible to apply for both Tier 1 and Tier 2 upgrades.
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

