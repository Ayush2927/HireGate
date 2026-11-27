"use client";

import { useState } from "react";
import { CheckCircle2, Clock, UserX, Search } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { DEMO_ATTENDANCE, type AttendanceStatus, type DemoAttendance } from "@/lib/demo-data";

export default function CoordinatorAttendancePage() {
  const [records, setRecords] = useState<DemoAttendance[]>(DEMO_ATTENDANCE);
  const [query, setQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | AttendanceStatus>("ALL");

  const filtered = records.filter((row) => {
    const matchesStatus = statusFilter === "ALL" || row.attendance === statusFilter;
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q ||
      row.studentName.toLowerCase().includes(q) ||
      row.rollNo.toLowerCase().includes(q) ||
      row.branch.toLowerCase().includes(q);
    return matchesStatus && matchesQuery;
  });

  function updateAttendance(id: string, status: AttendanceStatus) {
    setRecords((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              attendance: status,
              remarks:
                status === "PRESENT"
                  ? "Checked in at desk"
                  : status === "LATE"
                    ? "Late arrival logged"
                    : "Marked absent",
            }
          : row
      )
    );
  }

  const presentCount = records.filter((r) => r.attendance === "PRESENT").length;
  const lateCount = records.filter((r) => r.attendance === "LATE").length;
  const absentCount = records.filter((r) => r.attendance === "ABSENT").length;

  return (
    <AppShell
      initialRole="COORDINATOR"
      pageTitle="Attendance Desk"
      searchPlaceholder="Search candidate name or roll no..."
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Round Attendance Desk
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Google — Software Engineer · Round 1: Online Assessment &amp; Panel Check-In.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Present
              </span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900">{presentCount}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Late Check-In
              </span>
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900">{lateCount}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Absent
              </span>
              <UserX className="h-4 w-4 text-rose-600" />
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900">{absentCount}</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex flex-col justify-between gap-3 border-b border-slate-200 px-6 py-4 sm:flex-row sm:items-center">
            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter by name, roll no, or branch..."
                className="w-full rounded-lg border border-slate-200 py-1.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              {(["ALL", "PRESENT", "LATE", "ABSENT"] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    statusFilter === status
                      ? "bg-blue-600 text-white"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {status === "ALL" ? "All" : status}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-3">Candidate</th>
                  <th className="px-6 py-3">Roll No</th>
                  <th className="px-6 py-3">Branch</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Remarks</th>
                  <th className="px-6 py-3 text-right">Mark Attendance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filtered.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/70">
                    <td className="px-6 py-3.5 font-medium text-slate-900">
                      {row.studentName}
                    </td>
                    <td className="px-6 py-3.5 font-mono text-xs text-slate-600">
                      {row.rollNo}
                    </td>
                    <td className="px-6 py-3.5 text-slate-600">{row.branch}</td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          row.attendance === "PRESENT"
                            ? "bg-emerald-50 text-emerald-700"
                            : row.attendance === "LATE"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {row.attendance}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-xs text-slate-500">{row.remarks}</td>
                    <td className="px-6 py-3.5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => updateAttendance(row.id, "PRESENT")}
                          className="rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                        >
                          Present
                        </button>
                        <button
                          type="button"
                          onClick={() => updateAttendance(row.id, "LATE")}
                          className="rounded border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100"
                        >
                          Late
                        </button>
                        <button
                          type="button"
                          onClick={() => updateAttendance(row.id, "ABSENT")}
                          className="rounded border border-rose-200 bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100"
                        >
                          Absent
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
