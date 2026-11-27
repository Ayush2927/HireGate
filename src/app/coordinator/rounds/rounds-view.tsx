"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Search, CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";
import { updateRoundResultAction } from "@/server/actions/coordinator.actions";
import type { CoordinatorDriveItem } from "@/server/queries/coordinator.queries";

export function CoordinatorRoundsView({
  drives,
}: {
  drives: CoordinatorDriveItem[];
}) {
  const router = useRouter();
  const [selectedDriveId, setSelectedDriveId] = useState(drives[0]?.id ?? "");
  const activeDrive =
    drives.find((d) => d.id === selectedDriveId) ?? drives[0] ?? null;

  const [selectedRoundId, setSelectedRoundId] = useState(
    activeDrive?.rounds[0]?.id ?? ""
  );
  const activeRound =
    activeDrive?.rounds.find((r) => r.id === selectedRoundId) ??
    activeDrive?.rounds[0] ??
    null;

  const [searchQuery, setSearchQuery] = useState("");
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDriveChange = (driveId: string) => {
    setSelectedDriveId(driveId);
    const nextDrive = drives.find((d) => d.id === driveId);
    setSelectedRoundId(nextDrive?.rounds[0]?.id ?? "");
  };

  const handleResultUpdate = async (
    applicationId: string,
    result: "PENDING" | "PASSED" | "FAILED" | "ABSENT"
  ) => {
    if (!activeRound) return;
    setErrorMsg(null);
    const key = `${applicationId}:${activeRound.id}`;
    setUpdatingKey(key);

    const res = await updateRoundResultAction({
      applicationId,
      roundId: activeRound.id,
      result,
    });

    setUpdatingKey(null);
    if (!res.success) {
      setErrorMsg(res.error);
      return;
    }
    router.refresh();
  };

  const filteredCandidates = (activeDrive?.candidates ?? []).filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.rollNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppShell initialRole="COORDINATOR" pageTitle="Interview Rounds">
      <div className="space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
              Coordinator Round Desk
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
              Manage round progression, attendance, and candidate results in
              real time.
            </p>
          </div>

          {drives.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <select
                aria-label="Select drive"
                value={activeDrive?.id ?? ""}
                onChange={(e) => handleDriveChange(e.target.value)}
                className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-xs font-semibold text-slate-800"
              >
                {drives.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.companyName} — {d.title}
                  </option>
                ))}
              </select>

              {activeDrive && activeDrive.rounds.length > 0 && (
                <select
                  aria-label="Select round"
                  value={activeRound?.id ?? ""}
                  onChange={(e) => setSelectedRoundId(e.target.value)}
                  className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-xs font-semibold text-slate-800"
                >
                  {activeDrive.rounds.map((r) => (
                    <option key={r.id} value={r.id}>
                      Round {r.sequence}: {r.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
        </div>

        {errorMsg && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="bg-white p-3 rounded-xl border border-[#E2E8F0] flex items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or roll no..."
              className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] pl-8 pr-3 py-1.5 text-xs focus:border-[#2563EB] focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Roll No</th>
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Branch • CGPA</th>
                  <th className="py-3 px-4">Round Status</th>
                  <th className="py-3 px-4 text-right">Update Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCandidates.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-10 text-center text-slate-500"
                    >
                      {drives.length === 0
                        ? "No drives assigned to you yet."
                        : "No applicants found for this drive."}
                    </td>
                  </tr>
                ) : (
                  filteredCandidates.map((c) => {
                    const currentResult = activeRound
                      ? (c.roundResults[activeRound.id] ?? "PENDING")
                      : "PENDING";
                    const busy =
                      activeRound &&
                      updatingKey === `${c.applicationId}:${activeRound.id}`;

                    return (
                      <tr
                        key={c.applicationId}
                        className="hover:bg-slate-50/60 transition"
                      >
                        <td className="py-3 px-4 font-mono font-bold text-slate-800">
                          {c.rollNo}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {c.name}
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-mono">
                          {c.branch} • {c.cgpa.toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${
                              currentResult === "PASSED"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : currentResult === "FAILED" ||
                                  currentResult === "ABSENT"
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                          >
                            {currentResult === "PASSED" ? (
                              <CheckCircle2 className="h-3 w-3" />
                            ) : currentResult === "FAILED" ||
                              currentResult === "ABSENT" ? (
                              <XCircle className="h-3 w-3" />
                            ) : (
                              <Clock className="h-3 w-3" />
                            )}
                            {currentResult}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            type="button"
                            disabled={Boolean(busy) || !activeRound}
                            onClick={() =>
                              handleResultUpdate(c.applicationId, "PASSED")
                            }
                            className="rounded bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                          >
                            Pass
                          </button>
                          <button
                            type="button"
                            disabled={Boolean(busy) || !activeRound}
                            onClick={() =>
                              handleResultUpdate(c.applicationId, "FAILED")
                            }
                            className="rounded bg-rose-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
                          >
                            Fail
                          </button>
                          <button
                            type="button"
                            disabled={Boolean(busy) || !activeRound}
                            onClick={() =>
                              handleResultUpdate(c.applicationId, "ABSENT")
                            }
                            className="rounded border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                          >
                            Absent
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
