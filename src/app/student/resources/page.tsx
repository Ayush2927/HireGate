"use client";

import React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { BookOpen, FileText, ExternalLink } from "lucide-react";

const RESOURCES = [
  {
    title: "Campus Placement Policy Handbook 2025–2026",
    category: "Policy",
    desc: "Official TPO guidelines on tier upgrades, attendance rules, and offer acceptance deadlines.",
  },
  {
    title: "Resume Formatting & Verification Checklist",
    category: "Preparation",
    desc: "Standardized 1-page technical resume template approved by the placement cell.",
  },
  {
    title: "Online Assessment & Proctoring Guidelines",
    category: "Assessments",
    desc: "Instructions for on-campus lab tests, system checks, and attendance verification.",
  },
];

export default function StudentResourcesPage() {
  return (
    <AppShell initialRole="STUDENT" pageTitle="Resources">
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
            Placement Resources
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Official handbooks, resume guidelines, and assessment instructions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {RESOURCES.map((res) => (
            <div
              key={res.title}
              className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-2xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#2563EB]">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {res.category}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[#0F172A]">{res.title}</h3>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  {res.desc}
                </p>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2563EB] hover:underline"
              >
                <FileText className="h-3.5 w-3.5" />
                Open Document
                <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

