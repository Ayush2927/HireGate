"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { CheckCircle2 } from "lucide-react";

export default function StudentSettingsPage() {
  const [saved, setSaved] = useState(false);

  return (
    <AppShell initialRole="STUDENT" pageTitle="Settings">
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
            Account &amp; Notification Settings
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Manage drive alerts, deadline reminders, and portal preferences.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-2xs space-y-5">
          <h2 className="text-sm font-bold text-[#0F172A] border-b border-slate-100 pb-3">
            Notification Preferences
          </h2>

          <div className="space-y-3 text-xs">
            {[
              {
                label: "New Eligible Drive Alerts",
                desc: "Notify immediately when a published drive matches your verified Academic Passport.",
                checked: true,
              },
              {
                label: "Deadline Reminders (24h & 2h before close)",
                desc: "Receive reminder alerts for eligible drives closing soon.",
                checked: true,
              },
              {
                label: "Shortlist & Round Progression Updates",
                desc: "Notify when recruiters or coordinators update your round status.",
                checked: true,
              },
            ].map((item) => (
              <label
                key={item.label}
                className="flex items-start justify-between gap-4 p-3 rounded-lg bg-[#F8FAFC] border border-slate-200 cursor-pointer"
              >
                <div>
                  <div className="font-semibold text-slate-900">{item.label}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {item.desc}
                  </div>
                </div>
                <input
                  type="checkbox"
                  defaultChecked={item.checked}
                  className="h-4 w-4 rounded border-slate-300 text-[#2563EB] mt-0.5"
                />
              </label>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            {saved ? (
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" /> Preferences saved
              </span>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={() => setSaved(true)}
              className="rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition"
            >
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

