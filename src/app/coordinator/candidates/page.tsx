"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, Layers } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { DEMO_ATTENDANCE, type DemoAttendance } from "@/lib/demo-data";

export default function CoordinatorCandidatesPage() {
  const [candidates, setCandidates] = useState<DemoAttendance[]>(DEMO_ATTENDANCE);
  const [stageFilter, setStageFilter] = useState<string>("ALL");

  const filtered = candidates.filter((c) =>
    stageFilter === "ALL" ? true : c.result === stageFilter
  );

  function promoteCandidate(id: string) {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, result: "PASSED" } : c))
    );
  }

  return (
    <AppShell
      initialRole="COORDINATOR"
      pageTitle="Candidate Progression"
      searchPlaceholder="Search candidates by name or roll no..."
    >
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Candidate Round Progression
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Track candidate advancement across Online Assessment, Technical, and Final
              HR rounds.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {(["ALL", "PASSED", "PENDING", "FAILED"] as const).map((state) => (
              <button
                key={state}
                type="button"
                onClick={() => setStageFilter(state)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  stageFilter === state
                    ? "bg-blue-600 text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {state === "ALL" ? "All Candidates" : state}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center gap-2 border-b border-slate-200 px-6 py-4">
            <Layers className="h-4 w-4 text-blue-600" />
            <h2 className="text-sm font-semibold text-slate-900">
              Google — Software Engineer Pipeline ({filtered.length})
            </h2>
          </div>

          <div className="divide-y divide-slate-200">
            {filtered.map((candidate) => (
              <div
                key={candidate.id}
                className="flex flex-col justify-between gap-4 px-6 py-4 sm:flex-row sm:items-center"
              >
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-semibold text-slate-900">
                      {candidate.studentName}
                    </span>
                    <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600">
                      {candidate.rollNo}
                    </span>
                    <span className="text-xs text-slate-500">{candidate.branch}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Attendance:{" "}
                    <span className="font-medium text-slate-700">{candidate.attendance}</span>{" "}
                    · Remarks: {candidate.remarks}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      candidate.result === "PASSED"
                        ? "bg-emerald-50 text-emerald-700"
                        : candidate.result === "FAILED"
                          ? "bg-rose-50 text-rose-700"
                          : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {candidate.result === "PASSED"
                      ? "Advanced to Next Round"
                      : candidate.result === "FAILED"
                        ? "Eliminated"
                        : "Awaiting Evaluation"}
                  </span>

                  {candidate.result !== "PASSED" ? (
                    <button
                      type="button"
                      onClick={() => promoteCandidate(candidate.id)}
                      className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                    >
                      Advance
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" />
                      Shortlisted
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
