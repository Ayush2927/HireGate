"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Search, CheckCircle2, XCircle, Award, AlertCircle } from "lucide-react";
import { updateCandidateStatusAction } from "@/server/actions/recruiter.actions";
import type {
  RecruiterCandidateItem,
  RecruiterDriveItem,
} from "@/server/queries/recruiter.queries";

export function RecruiterDashboardView({
  companyName,
  drives,
  candidates,
}: {
  companyName: string | null;
  drives: RecruiterDriveItem[];
  candidates: RecruiterCandidateItem[];
}) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const branches = Array.from(new Set(candidates.map((c) => c.branch)));

  const handleStatusChange = async (
    applicationId: string,
    status: "SHORTLISTED" | "REJECTED" | "OFFERED"
  ) => {
    setErrorMsg(null);
    setUpdatingId(applicationId);
    const res = await updateCandidateStatusAction({ applicationId, status });
    setUpdatingId(null);

    if (!res.success) {
      setErrorMsg(res.error);
      return;
    }

    router.refresh();
  };

  const filtered = candidates.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      c.name.toLowerCase().includes(q) ||
      c.rollNo.toLowerCase().includes(q) ||
      c.driveTitle.toLowerCase().includes(q);
    if (!matchesSearch) return false;
    if (selectedBranch !== "ALL" && c.branch !== selectedBranch) return false;
    if (selectedStatus !== "ALL" && c.status !== selectedStatus) return false;
    return true;
  });

  const shortlistedCount = candidates.filter(
    (c) => c.status === "SHORTLISTED" || c.status === "IN_PROGRESS"
  ).length;
  const offeredCount = candidates.filter((c) => c.status === "OFFERED").length;

  return (
    <AppShell initialRole="RECRUITER" pageTitle="Recruiter Workspace">
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
              {companyName ? `${companyName} — Candidate Pipeline` : "Recruiter Workspace"}
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
              Review applicants, shortlist candidates, and issue final offers.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0]">
            <div className="text-xs text-slate-500">Active Drives</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">
              {drives.length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0]">
            <div className="text-xs text-slate-500">Shortlisted / In Progress</div>
            <div className="text-2xl font-extrabold text-emerald-700 mt-1 font-mono">
              {shortlistedCount}
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0]">
            <div className="text-xs text-slate-500">Offers Extended</div>
            <div className="text-2xl font-extrabold text-[#2563EB] mt-1 font-mono">
              {offeredCount}
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="bg-white p-3 rounded-xl border border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, roll no, or role..."
              className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] pl-8 pr-3 py-1.5 text-xs focus:border-[#2563EB] focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              aria-label="Filter by branch"
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700"
            >
              <option value="ALL">All Branches</option>
              {branches.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            <select
              aria-label="Filter by status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700"
            >
              <option value="ALL">All Statuses</option>
              <option value="APPLIED">Applied</option>
              <option value="SHORTLISTED">Shortlisted</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="OFFERED">Offered</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Roll No</th>
                  <th className="py-3 px-4">Branch • CGPA</th>
                  <th className="py-3 px-4">Drive</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-10 text-center text-slate-500"
                    >
                      No applicants found for your drives yet.
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => {
                    const busy = updatingId === c.applicationId;
                    return (
                      <tr
                        key={c.applicationId}
                        className="hover:bg-slate-50/60 transition"
                      >
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">
                            {c.name}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {c.email}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-700">
                          {c.rollNo}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-700">
                          {c.branch} • {c.cgpa.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          {c.driveTitle}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${
                              c.status === "OFFERED"
                                ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                : c.status === "SHORTLISTED"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : c.status === "REJECTED"
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : "bg-blue-50 text-[#2563EB] border-blue-200"
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            type="button"
                            disabled={busy || c.status === "SHORTLISTED"}
                            onClick={() =>
                              handleStatusChange(c.applicationId, "SHORTLISTED")
                            }
                            className="inline-flex items-center gap-1 rounded bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            Shortlist
                          </button>
                          <button
                            type="button"
                            disabled={busy || c.status === "OFFERED"}
                            onClick={() =>
                              handleStatusChange(c.applicationId, "OFFERED")
                            }
                            className="inline-flex items-center gap-1 rounded bg-[#2563EB] px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                          >
                            <Award className="h-3 w-3" />
                            Offer
                          </button>
                          <button
                            type="button"
                            disabled={busy || c.status === "REJECTED"}
                            onClick={() =>
                              handleStatusChange(c.applicationId, "REJECTED")
                            }
                            className="inline-flex items-center gap-1 rounded border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-50"
                          >
                            <XCircle className="h-3 w-3" />
                            Reject
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
