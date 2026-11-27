"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import {
  ArrowLeft,
  CheckCircle2,
  Cpu,
  Plus,
  Trash2,
  Users,
  AlertCircle,
} from "lucide-react";
import { createAndPublishDriveAction } from "@/server/actions/admin.actions";
import type {
  AdminCompanyItem,
  AdminStudentItem,
} from "@/server/queries/admin.queries";

const ALL_BRANCHES = ["CSE", "ECE", "IT", "MECH"] as const;

export function AdminCreateDriveView({
  companies,
  students,
  defaultDeadline,
}: {
  companies: AdminCompanyItem[];
  students: AdminStudentItem[];
  defaultDeadline: string;
}) {
  const router = useRouter();
  const [companyId, setCompanyId] = useState(companies[0]?.id ?? "");
  const [newCompanyName, setNewCompanyName] = useState("");
  const [title, setTitle] = useState("Software Engineer");
  const [description, setDescription] = useState(
    "Full-time campus engineering role."
  );
  const [tier, setTier] = useState("Tier-1");
  const [ctc, setCtc] = useState("18");
  const [deadline, setDeadline] = useState(defaultDeadline);
  const [minCgpa, setMinCgpa] = useState(7.5);
  const [maxBacklogs, setMaxBacklogs] = useState(0);
  const [selectedBranches, setSelectedBranches] = useState<string[]>([
    "CSE",
    "IT",
    "ECE",
  ]);
  const [rounds, setRounds] = useState<string[]>([
    "Online Assessment",
    "Technical Interview",
    "HR Interview",
  ]);
  const [newRound, setNewRound] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [published, setPublished] = useState(false);

  const toggleBranch = (branch: string) => {
    setSelectedBranches((prev) =>
      prev.includes(branch)
        ? prev.filter((b) => b !== branch)
        : [...prev, branch]
    );
  };

  const addRound = () => {
    if (!newRound.trim()) return;
    setRounds((prev) => [...prev, newRound.trim()]);
    setNewRound("");
  };

  const matchingStudents = students.filter(
    (s) =>
      s.isVerified &&
      selectedBranches.includes(s.branch) &&
      s.cgpa >= minCgpa &&
      s.activeBacklogs <= maxBacklogs
  );

  const handleSubmit = async (publishImmediately: boolean) => {
    setErrorMsg(null);
    setSubmitting(true);

    const res = await createAndPublishDriveAction({
      companyId: companyId || undefined,
      newCompanyName: companyId ? undefined : newCompanyName,
      title,
      description,
      ctc: parseFloat(ctc) || 0,
      tier,
      deadlineIso: new Date(deadline).toISOString(),
      minCgpa,
      maxBacklogs,
      branches: selectedBranches,
      rounds,
      publishImmediately,
    });

    setSubmitting(false);

    if (!res.success) {
      setErrorMsg(res.error);
      return;
    }

    setPublished(true);
    router.refresh();
  };

  return (
    <AppShell initialRole="ADMIN" pageTitle="Create Drive">
      <div className="space-y-6 max-w-5xl">
        <div className="flex items-center justify-between">
          <Link
            href="/admin/drives"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Drives
          </Link>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
            Placement Drive Studio
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
            Configure job details, dynamic eligibility rules, and interview
            rounds.
          </p>
        </div>

        {errorMsg && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {published && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex items-center justify-between text-xs text-emerald-900">
            <div className="flex items-center gap-2.5 font-semibold">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <span>
                Drive <strong>{title}</strong> saved! {matchingStudents.length}{" "}
                verified student(s) currently match the criteria.
              </span>
            </div>
            <Link
              href="/admin/drives"
              className="font-bold text-emerald-700 hover:underline"
            >
              View All Drives →
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-5">
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 space-y-4">
              <h2 className="text-sm font-bold text-[#0F172A]">
                1. Drive &amp; Compensation Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Company
                  </label>
                  {companies.length > 0 ? (
                    <select
                      aria-label="Select company"
                      value={companyId}
                      onChange={(e) => setCompanyId(e.target.value)}
                      className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-xs focus:border-[#2563EB] focus:bg-white focus:outline-none"
                    >
                      {companies.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                      <option value="">+ New Company</option>
                    </select>
                  ) : null}

                  {(!companyId || companies.length === 0) && (
                    <input
                      type="text"
                      value={newCompanyName}
                      onChange={(e) => setNewCompanyName(e.target.value)}
                      placeholder="Enter new company name (e.g. Google)"
                      className="mt-2 w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-xs focus:border-[#2563EB] focus:bg-white focus:outline-none"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Role Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-xs focus:border-[#2563EB] focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tier Classification
                  </label>
                  <select
                    aria-label="Tier classification"
                    value={tier}
                    onChange={(e) => setTier(e.target.value)}
                    className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-xs focus:border-[#2563EB] focus:bg-white focus:outline-none"
                  >
                    <option value="Mass">Mass</option>
                    <option value="Standard">Standard</option>
                    <option value="Tier-1">Tier-1</option>
                    <option value="Dream">Dream</option>
                    <option value="Super-Dream">Super-Dream</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    CTC (LPA)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={ctc}
                    onChange={(e) => setCtc(e.target.value)}
                    className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-xs font-mono focus:border-[#2563EB] focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Application Deadline
                  </label>
                  <input
                    type="datetime-local"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-xs font-mono focus:border-[#2563EB] focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Job Description
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-xs focus:border-[#2563EB] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 space-y-4">
              <h2 className="text-sm font-bold text-[#0F172A]">
                2. Eligibility Rules Builder
              </h2>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Eligible Branches
                </label>
                <div className="flex flex-wrap gap-2">
                  {ALL_BRANCHES.map((branch) => {
                    const active = selectedBranches.includes(branch);
                    return (
                      <button
                        key={branch}
                        type="button"
                        onClick={() => toggleBranch(branch)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                          active
                            ? "bg-[#2563EB] text-white border-[#2563EB]"
                            : "bg-[#F8FAFC] text-slate-700 border-[#E2E8F0]"
                        }`}
                      >
                        {branch}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Minimum CGPA
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={minCgpa}
                    onChange={(e) =>
                      setMinCgpa(parseFloat(e.target.value) || 0)
                    }
                    className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Max Active Backlogs
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={maxBacklogs}
                    onChange={(e) =>
                      setMaxBacklogs(parseInt(e.target.value, 10) || 0)
                    }
                    className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 space-y-4">
              <h2 className="text-sm font-bold text-[#0F172A]">
                3. Selection Rounds ({rounds.length})
              </h2>

              <div className="space-y-2">
                {rounds.map((r, idx) => (
                  <div
                    key={`${r}-${idx}`}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-[#F8FAFC] text-xs"
                  >
                    <span className="font-semibold text-slate-800">
                      {idx + 1}. {r}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setRounds((prev) => prev.filter((_, i) => i !== idx))
                      }
                      aria-label={`Remove ${r}`}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newRound}
                  onChange={(e) => setNewRound(e.target.value)}
                  placeholder="Add round (e.g. System Design)..."
                  className="flex-1 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1.5 text-xs focus:border-[#2563EB] focus:bg-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={addRound}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-5">
            <div className="bg-[#101827] text-white rounded-xl p-6 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400">
                <Cpu className="h-4 w-4" />
                Live Eligibility Preview
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold font-mono">
                  {matchingStudents.length}
                </span>
                <span className="text-xs text-slate-400">
                  verified students qualify right now
                </span>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800">
                {matchingStudents.length === 0 ? (
                  <p className="text-xs text-slate-400">
                    No verified students match these criteria yet.
                  </p>
                ) : (
                  matchingStudents.slice(0, 5).map((s) => (
                    <div
                      key={s.userId}
                      className="flex items-center justify-between text-xs bg-slate-900/70 px-3 py-2 rounded-lg border border-slate-800"
                    >
                      <span className="flex items-center gap-2 font-medium">
                        <Users className="h-3.5 w-3.5 text-blue-400" />
                        {s.name}
                      </span>
                      <span className="font-mono text-emerald-400">
                        {s.cgpa.toFixed(2)} • {s.branch}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleSubmit(true)}
                  className="w-full rounded-lg bg-[#2563EB] py-2.5 px-4 text-xs font-semibold text-white hover:bg-blue-700 transition disabled:opacity-60"
                >
                  {submitting ? "Publishing..." : "Create & Publish Drive"}
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleSubmit(false)}
                  className="w-full rounded-lg border border-slate-700 py-2 px-4 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition disabled:opacity-60"
                >
                  Save as Draft
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
