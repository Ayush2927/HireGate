"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { ShieldCheck, Lock, Search, AlertCircle } from "lucide-react";
import { verifyStudentAction } from "@/server/actions/student.actions";
import type { AdminStudentItem } from "@/server/queries/admin.queries";

export function AdminStudentsView({
  initialStudents,
}: {
  initialStudents: AdminStudentItem[];
}) {
  const router = useRouter();
  const [students, setStudents] = useState<AdminStudentItem[]>(initialStudents);
  const [searchQuery, setSearchQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const branches = Array.from(new Set(students.map((s) => s.branch)));

  const handleVerify = async (userId: string) => {
    setErrorMsg(null);
    setVerifyingId(userId);
    const res = await verifyStudentAction(userId);
    setVerifyingId(null);

    if (!res.success) {
      setErrorMsg(res.error ?? "Failed to verify student.");
      return;
    }

    setStudents((prev) =>
      prev.map((s) => (s.userId === userId ? { ...s, isVerified: true } : s))
    );
    router.refresh();
  };

  const filtered = students.filter((s) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      s.name.toLowerCase().includes(q) ||
      s.rollNo.toLowerCase().includes(q) ||
      s.branch.toLowerCase().includes(q);
    if (!matchesSearch) return false;
    if (branchFilter !== "ALL" && s.branch !== branchFilter) return false;
    if (statusFilter === "PENDING" && s.isVerified) return false;
    if (statusFilter === "VERIFIED" && !s.isVerified) return false;
    return true;
  });

  return (
    <AppShell initialRole="ADMIN" pageTitle="Students & Verification">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Academic Verification Desk
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Verify student records and apply tamper-proof locks to prevent
              eligibility manipulation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">
              Pending Verification:{" "}
              <strong className="text-amber-600 font-mono">
                {students.filter((s) => !s.isVerified).length}
              </strong>
            </span>
          </div>
        </div>

        {errorMsg && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name or roll no..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              aria-label="Filter students by branch"
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Branches</option>
              {branches.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            <select
              aria-label="Filter students by verification status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="VERIFIED">Verified</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Roll No</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Branch</th>
                  <th className="py-3 px-4">CGPA</th>
                  <th className="py-3 px-4">10th / 12th</th>
                  <th className="py-3 px-4">Backlogs</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-10 text-center text-slate-500"
                    >
                      No student Academic Passports found yet.
                    </td>
                  </tr>
                ) : (
                  filtered.map((s) => (
                    <tr key={s.userId} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        {s.rollNo}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">
                          {s.name}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {s.email}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{s.branch}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {s.cgpa.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {s.marks10th} / {s.marks12th}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700">
                        {s.activeBacklogs}
                      </td>
                      <td className="py-3 px-4">
                        {s.isVerified ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold">
                            <Lock className="h-3 w-3" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 text-[11px] font-bold">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {s.isVerified ? (
                          <span className="text-[11px] text-slate-400 font-medium">
                            Locked
                          </span>
                        ) : (
                          <button
                            type="button"
                            disabled={verifyingId === s.userId}
                            onClick={() => handleVerify(s.userId)}
                            className="inline-flex items-center gap-1 rounded-lg bg-[#2563EB] px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-blue-700 transition disabled:opacity-60"
                          >
                            <ShieldCheck className="h-3.5 w-3.5" />
                            {verifyingId === s.userId
                              ? "Verifying..."
                              : "Verify & Lock"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
