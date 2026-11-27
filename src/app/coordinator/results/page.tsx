"use client";

import { useState } from "react";
import { Award, CheckCircle2, Clock, XCircle } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { DEMO_ATTENDANCE, type DemoAttendance } from "@/lib/demo-data";

export default function CoordinatorResultsPage() {
  const [rows, setRows] = useState<DemoAttendance[]>(DEMO_ATTENDANCE);
  const [published, setPublished] = useState<boolean>(false);

  function setResult(id: string, result: DemoAttendance["result"]) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, result } : r)));
    setPublished(false);
  }

  const passed = rows.filter((r) => r.result === "PASSED").length;
  const pending = rows.filter((r) => r.result === "PENDING").length;
  const failed = rows.filter((r) => r.result === "FAILED").length;

  return (
    <AppShell
      initialRole="COORDINATOR"
      pageTitle="Round Results"
      searchPlaceholder="Search candidate results..."
    >
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Round Results &amp; Shortlist Publication
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Record evaluation outcomes and publish verified shortlists to students.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPublished(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700"
          >
            <Award className="h-4 w-4" />
            Publish Round Results
          </button>
        </div>

        {published && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            Shortlist results published. {passed} candidate(s) notified for the next
            interview round.
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Passed
              </span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900">{passed}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Pending
              </span>
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900">{pending}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Not Shortlisted
              </span>
              <XCircle className="h-4 w-4 text-rose-600" />
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900">{failed}</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-3">Candidate</th>
                  <th className="px-6 py-3">Roll No</th>
                  <th className="px-6 py-3">Branch</th>
                  <th className="px-6 py-3">Attendance</th>
                  <th className="px-6 py-3">Result</th>
                  <th className="px-6 py-3 text-right">Update Outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/70">
                    <td className="px-6 py-3.5 font-medium text-slate-900">
                      {row.studentName}
                    </td>
                    <td className="px-6 py-3.5 font-mono text-xs text-slate-600">
                      {row.rollNo}
                    </td>
                    <td className="px-6 py-3.5 text-slate-600">{row.branch}</td>
                    <td className="px-6 py-3.5 text-xs text-slate-600">{row.attendance}</td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          row.result === "PASSED"
                            ? "bg-emerald-50 text-emerald-700"
                            : row.result === "FAILED"
                              ? "bg-rose-50 text-rose-700"
                              : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {row.result}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setResult(row.id, "PASSED")}
                          className="rounded border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                        >
                          Pass
                        </button>
                        <button
                          type="button"
                          onClick={() => setResult(row.id, "PENDING")}
                          className="rounded border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100"
                        >
                          Pending
                        </button>
                        <button
                          type="button"
                          onClick={() => setResult(row.id, "FAILED")}
                          className="rounded border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100"
                        >
                          Fail
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
