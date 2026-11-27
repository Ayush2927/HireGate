"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import {
  CheckCircle2,
  Clock,
  Filter,
  AlertTriangle,
  FileCheck,
  Search,
  ArrowUpRight,
  AlertCircle,
} from "lucide-react";
import { applyToDriveAction } from "@/server/actions/application.actions";
import type {
  SerializedDriveItem,
  SerializedResume,
} from "@/server/queries/student.queries";

interface StudentDashboardViewProps {
  userName: string;
  student: {
    rollNo: string;
    branch: string;
    batch: number;
    cgpa: string;
    isVerified: boolean;
    placementStatus: string;
    placedTier: string | null;
  } | null;
  drives: SerializedDriveItem[];
  resumes: SerializedResume[];
  offersCount: number;
  inProgressCount: number;
}

export function StudentDashboardView({
  userName,
  student,
  drives,
  resumes,
  offersCount,
  inProgressCount,
}: StudentDashboardViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "eligible" | "ineligible" | "applied"
  >("eligible");
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("ALL");
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [localAppliedIds, setLocalAppliedIds] = useState<Set<string>>(
    () => new Set(drives.filter((d) => d.applied).map((d) => d.id))
  );
  const [selectedResumeId, setSelectedResumeId] = useState<string>(
    resumes[0]?.id ?? ""
  );

  const uniqueTiers = Array.from(new Set(drives.map((d) => d.tier)));

  const handleApply = async (driveId: string) => {
    setApplyError(null);
    setApplyingId(driveId);

    const idempotencyKey =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : undefined;

    const res = await applyToDriveAction(
      driveId,
      selectedResumeId || undefined,
      idempotencyKey
    );

    setApplyingId(null);

    if (!res.success) {
      setApplyError(res.error.message);
      return;
    }

    setLocalAppliedIds((prev) => new Set(prev).add(driveId));
    router.refresh();
  };

  const eligibleCount = drives.filter(
    (d) => d.isEligible && !localAppliedIds.has(d.id)
  ).length;
  const ineligibleCount = drives.filter((d) => !d.isEligible).length;
  const appliedCount = localAppliedIds.size;

  const filteredDrives = drives.filter((d) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      d.companyName.toLowerCase().includes(q) ||
      d.title.toLowerCase().includes(q) ||
      d.tier.toLowerCase().includes(q);
    if (!matchesSearch) return false;
    if (tierFilter !== "ALL" && d.tier !== tierFilter) return false;

    const isApplied = localAppliedIds.has(d.id);
    if (activeTab === "eligible") return d.isEligible && !isApplied;
    if (activeTab === "ineligible") return !d.isEligible;
    return isApplied;
  });

  return (
    <AppShell initialRole="STUDENT" pageTitle="Student Dashboard">
      <div className="space-y-5">
        {/* ── 1. Welcome Banner ───────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-xl bg-[#101827] text-white shadow-xs border border-slate-800 px-6 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-blue-400">
              {student
                ? `${student.branch} • Batch ${student.batch} • ${student.rollNo}`
                : "Academic Passport Not Completed"}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
              Good Evening, {userName.split(" ")[0]}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-300">
              Explore eligible campus placement drives and track your
              application progress.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="rounded-lg bg-slate-900/90 border border-slate-700 px-3.5 py-2 text-right">
              <div className="text-[10px] uppercase tracking-wider text-slate-400">
                Active Resume
              </div>
              {resumes.length === 0 ? (
                <Link
                  href="/student/profile"
                  className="mt-0.5 inline-block text-xs font-semibold text-blue-400 hover:underline"
                >
                  {student ? "No resume uploaded" : "Complete Passport →"}
                </Link>
              ) : (
                <select
                  aria-label="Select default resume"
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="mt-0.5 bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
                >
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id} className="text-slate-900">
                      {r.fileKey} (v{r.version})
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>

        {!student && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
            <div>
              <strong className="font-bold">Action Required:</strong> Complete
              your Academic Passport so the TPO can verify your CGPA and unlock
              placement drive applications.
            </div>
            <Link
              href="/student/profile"
              className="rounded-lg bg-[#2563EB] px-4 py-2 font-semibold text-white hover:bg-blue-700 transition shrink-0 text-center"
            >
              Complete Academic Passport →
            </Link>
          </div>
        )}

        {applyError && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{applyError}</span>
          </div>
        )}

        {/* ── 2. Top 4-Metric Ribbon ──────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col justify-between">
            <span className="text-xs font-medium text-[#64748B]">
              Profile Status
            </span>
            <div className="mt-2">
              {student?.isVerified ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 text-xs font-bold">
                  <Clock className="h-3.5 w-3.5" />
                  {student ? "Pending Verification" : "Incomplete"}
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-400 mt-1.5">
              {student
                ? `CGPA ${Number(student.cgpa).toFixed(2)} • ${
                    student.isVerified ? "Locked" : "Editable"
                  }`
                : "Fill Academic Passport"}
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col justify-between">
            <span className="text-xs font-medium text-[#64748B]">
              Placement Tier
            </span>
            <div className="mt-1.5 text-2xl font-extrabold text-[#0F172A]">
              {student?.placedTier ?? "Open"}
            </div>
            <span className="text-[11px] text-slate-400 mt-1">
              {student?.placementStatus === "PLACED"
                ? "Placed — higher tiers only"
                : "Eligible for all open tiers"}
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col justify-between">
            <span className="text-xs font-medium text-[#64748B]">
              Applications
            </span>
            <div className="mt-1.5 text-2xl font-extrabold text-[#0F172A] font-mono">
              {appliedCount}
            </div>
            <span className="text-[11px] text-slate-400 mt-1">
              {eligibleCount} eligible drives open
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col justify-between">
            <span className="text-xs font-medium text-[#64748B]">Offers</span>
            <div className="mt-1.5 text-2xl font-extrabold text-[#0F172A] font-mono">
              {offersCount}
            </div>
            <span className="text-[11px] text-slate-400 mt-1">
              {inProgressCount} active in pipeline
            </span>
          </div>
        </div>

        {/* ── 3. Tabs, Search & Tier Filter ───────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-2">
          <div className="flex items-center gap-5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab("eligible")}
              className={`pb-2.5 -mb-[9px] transition ${
                activeTab === "eligible"
                  ? "text-[#0F172A] font-bold border-b-2 border-[#2563EB]"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              Eligible ({eligibleCount})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("ineligible")}
              className={`pb-2.5 -mb-[9px] transition ${
                activeTab === "ineligible"
                  ? "text-[#0F172A] font-bold border-b-2 border-[#2563EB]"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              Ineligible ({ineligibleCount})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("applied")}
              className={`pb-2.5 -mb-[9px] transition ${
                activeTab === "applied"
                  ? "text-[#0F172A] font-bold border-b-2 border-[#2563EB]"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              Applied ({appliedCount})
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search drives..."
                className="w-44 sm:w-52 rounded-lg border border-[#E2E8F0] bg-white pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#2563EB] focus:outline-none"
              />
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-2.5 py-1.5 text-xs text-slate-700">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <select
                aria-label="Filter drives by tier"
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Tiers</option>
                {uniqueTiers.map((tier) => (
                  <option key={tier} value={tier}>
                    {tier}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ── 4. Drive Cards List ─────────────────────────────────────── */}
        <div className="space-y-3.5">
          {filteredDrives.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-10 text-center space-y-2">
              <div className="text-sm font-semibold text-slate-900">
                No placement drives match this view
              </div>
              <p className="text-xs text-slate-500">
                {drives.length === 0
                  ? "No published placement drives are open for your college yet."
                  : "Try switching tabs or clearing your search filter."}
              </p>
            </div>
          ) : (
            filteredDrives.map((drive) => {
              const isApplied = localAppliedIds.has(drive.id);
              const isProcessing = applyingId === drive.id;

              return (
                <div
                  key={drive.id}
                  className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-2xs hover:border-slate-300 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-[#101827] text-white font-extrabold text-sm shrink-0">
                      {drive.companyName.slice(0, 2).toUpperCase()}
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/student/drives/${drive.id}`}
                          className="text-base font-bold text-[#0F172A] hover:text-[#2563EB] transition inline-flex items-center gap-1"
                        >
                          {drive.title}
                          <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
                        </Link>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#64748B] font-medium">
                        <span>{drive.companyName}</span>
                        <span className="text-slate-300">•</span>
                        <span>{drive.rounds.length} rounds</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-0.5">
                        <span className="rounded bg-blue-50 text-[#2563EB] font-semibold px-2.5 py-0.5 text-[11px] border border-blue-200/70">
                          {drive.tier}
                        </span>
                        <span className="rounded bg-slate-100 text-slate-900 font-bold px-2.5 py-0.5 text-[11px] border border-slate-200 font-mono">
                          {drive.ctcFormatted}
                        </span>
                      </div>

                      {!drive.isEligible && drive.failures.length > 0 && (
                        <div className="pt-1.5 flex flex-wrap gap-1.5">
                          {drive.failures.map((reason) => (
                            <span
                              key={reason}
                              className="inline-flex items-center gap-1 text-[11px] text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded font-medium"
                            >
                              <AlertTriangle className="h-3 w-3 shrink-0" />
                              {reason}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Action Column */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2.5 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                    <div className="text-left md:text-right">
                      <div className="text-[11px] text-slate-400">
                        Apply before
                      </div>
                      <div className="text-xs font-semibold text-[#F43F5E]">
                        {drive.deadlineLabel}
                      </div>
                      <div className="text-xs font-bold text-[#F43F5E] flex items-center md:justify-end gap-1 font-mono mt-0.5">
                        <Clock className="h-3.5 w-3.5" />
                        {drive.timeLeftLabel}
                      </div>
                    </div>

                    {isApplied ? (
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2 text-xs font-bold">
                        <FileCheck className="h-4 w-4" />
                        Applied
                      </span>
                    ) : !drive.isEligible ? (
                      <button
                        type="button"
                        disabled
                        className="rounded-lg bg-slate-100 text-slate-400 px-4 py-2 text-xs font-semibold cursor-not-allowed border border-slate-200"
                      >
                        Ineligible
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleApply(drive.id)}
                        className="rounded-lg bg-[#2563EB] text-white px-5 py-2 text-xs font-semibold hover:bg-blue-700 transition shadow-2xs disabled:opacity-70"
                      >
                        {isProcessing ? "Applying..." : "Apply Now"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </AppShell>
  );
}
