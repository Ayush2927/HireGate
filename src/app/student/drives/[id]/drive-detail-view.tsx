"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileCheck,
  AlertTriangle,
  AlertCircle,
} from "lucide-react";
import { applyToDriveAction } from "@/server/actions/application.actions";
import type {
  SerializedDriveItem,
  SerializedResume,
} from "@/server/queries/student.queries";

export function StudentDriveDetailView({
  drive,
  resumes,
}: {
  drive: SerializedDriveItem;
  resumes: SerializedResume[];
}) {
  const router = useRouter();
  const [applied, setApplied] = useState(drive.applied);
  const [applying, setApplying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedResumeId, setSelectedResumeId] = useState(
    resumes[0]?.id ?? ""
  );

  const handleApply = async () => {
    setErrorMsg(null);
    setApplying(true);

    const idempotencyKey =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : undefined;

    const res = await applyToDriveAction(
      drive.id,
      selectedResumeId || undefined,
      idempotencyKey
    );

    setApplying(false);

    if (!res.success) {
      setErrorMsg(res.error.message);
      return;
    }

    setApplied(true);
    router.refresh();
  };

  return (
    <AppShell initialRole="STUDENT" pageTitle={drive.title}>
      <div className="space-y-6 max-w-4xl">
        <Link
          href="/student/drives"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Placement Drives
        </Link>

        {/* Drive Header Card */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-slate-200 bg-[#101827] text-white font-extrabold text-lg shrink-0">
              {drive.companyName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#0F172A]">{drive.title}</h1>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                <span className="font-semibold text-slate-700">
                  {drive.companyName}
                </span>
                <span>•</span>
                <span>{drive.rounds.length} selection rounds</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="rounded bg-blue-50 text-[#2563EB] font-semibold px-2.5 py-0.5 text-xs border border-blue-200">
                  {drive.tier}
                </span>
                <span className="rounded bg-slate-100 text-slate-900 font-bold px-2.5 py-0.5 text-xs border border-slate-200 font-mono">
                  {drive.ctcFormatted}
                </span>
              </div>
            </div>
          </div>

          <div className="text-left md:text-right border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 space-y-2 shrink-0">
            <div>
              <div className="text-[11px] text-slate-400">
                Application Deadline
              </div>
              <div className="text-xs font-semibold text-[#F43F5E]">
                {drive.deadlineLabel}
              </div>
              <div className="text-xs font-bold text-[#F43F5E] font-mono inline-flex items-center gap-1 mt-0.5">
                <Clock className="h-3.5 w-3.5" />
                {drive.timeLeftLabel}
              </div>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: JD & Rounds */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 space-y-3">
              <h2 className="text-sm font-bold text-[#0F172A]">
                Role Description
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {drive.description}
              </p>
            </div>

            <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 space-y-4">
              <h2 className="text-sm font-bold text-[#0F172A]">
                Selection Rounds ({drive.rounds.length})
              </h2>
              <div className="space-y-2.5">
                {drive.rounds.map((round) => (
                  <div
                    key={round.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-[#F8FAFC] text-xs"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white border border-slate-200 font-mono font-bold text-[11px] text-[#2563EB]">
                      {round.sequence}
                    </span>
                    <span className="font-semibold text-slate-800">
                      {round.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Eligibility Check & Apply Box */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 space-y-4">
              <h2 className="text-sm font-bold text-[#0F172A]">
                Eligibility Evaluation
              </h2>

              {drive.isEligible ? (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>You meet all verified eligibility criteria.</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {drive.failures.map((reason) => (
                    <div
                      key={reason}
                      className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2 font-medium"
                    >
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 space-y-3">
                {resumes.length > 0 && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Select Resume
                    </label>
                    <select
                      aria-label="Select resume for application"
                      value={selectedResumeId}
                      onChange={(e) => setSelectedResumeId(e.target.value)}
                      disabled={applied || !drive.isEligible}
                      className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-xs font-medium text-slate-800 focus:border-[#2563EB] focus:outline-none"
                    >
                      {resumes.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.fileKey} (v{r.version})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {applied ? (
                  <div className="w-full rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 py-2.5 px-4 text-xs font-bold flex items-center justify-center gap-2">
                    <FileCheck className="h-4 w-4" />
                    Application Submitted
                  </div>
                ) : !drive.isEligible ? (
                  <button
                    type="button"
                    disabled
                    className="w-full rounded-lg bg-slate-100 text-slate-400 border border-slate-200 py-2.5 px-4 text-xs font-semibold cursor-not-allowed"
                  >
                    Ineligible for this Drive
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={applying}
                    onClick={handleApply}
                    className="w-full rounded-lg bg-[#2563EB] text-white py-2.5 px-4 text-xs font-semibold hover:bg-blue-700 transition disabled:opacity-70"
                  >
                    {applying ? "Submitting Application..." : "Submit Application"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
