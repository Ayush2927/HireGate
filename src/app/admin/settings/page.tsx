"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { CheckCircle2 } from "lucide-react";

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);

  return (
    <AppShell initialRole="ADMIN" pageTitle="Settings">
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
            Institutional Settings
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
            Configure allowed email domains, placement tier cutoffs, and verification policies.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-2xs space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Allowed Institutional Domain
              </label>
              <input
                type="text"
                defaultValue="@college.edu"
                className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-xs font-mono focus:border-[#2563EB] focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Active Placement Cycle
              </label>
              <input
                type="text"
                defaultValue="2025 – 2026"
                className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-xs font-mono focus:border-[#2563EB] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {saved ? (
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" /> Settings saved
              </span>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={() => setSaved(true)}
              className="rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

