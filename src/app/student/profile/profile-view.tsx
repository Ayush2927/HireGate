"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import {
  ShieldCheck,
  Lock,
  GraduationCap,
  FileCheck,
  Building,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { updateProfileAction } from "@/server/actions/student.actions";
import type { SerializedResume } from "@/server/queries/student.queries";

interface StudentProfileViewProps {
  userName: string;
  initialStudent: {
    rollNo: string;
    branch: string;
    batch: number;
    cgpa: string;
    activeBacklogs: number;
    tenthPercentage: string | null;
    twelfthPercentage: string | null;
    verifiedAt: string | null;
    verifierName: string | null;
  } | null;
  resumes: SerializedResume[];
}

export function StudentProfileView({
  userName,
  initialStudent,
  resumes,
}: StudentProfileViewProps) {
  const router = useRouter();
  const isVerified = Boolean(initialStudent?.verifiedAt);

  const [rollNo, setRollNo] = useState(initialStudent?.rollNo ?? "");
  const [branch, setBranch] = useState(initialStudent?.branch ?? "CSE");
  const [batch, setBatch] = useState(String(initialStudent?.batch ?? 2026));
  const [cgpa, setCgpa] = useState(initialStudent?.cgpa ?? "");
  const [activeBacklogs, setActiveBacklogs] = useState(
    String(initialStudent?.activeBacklogs ?? 0)
  );
  const [tenthPercentage, setTenthPercentage] = useState(
    initialStudent?.tenthPercentage ?? ""
  );
  const [twelfthPercentage, setTwelfthPercentage] = useState(
    initialStudent?.twelfthPercentage ?? ""
  );

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isVerified) return;

    setErrorMsg(null);
    setSavedMsg(null);

    const parsedCgpa = parseFloat(cgpa);
    const parsedBatch = parseInt(batch, 10);
    const parsedBacklogs = parseInt(activeBacklogs, 10);
    const parsedTenth = tenthPercentage ? parseFloat(tenthPercentage) : undefined;
    const parsedTwelfth = twelfthPercentage
      ? parseFloat(twelfthPercentage)
      : undefined;

    if (!rollNo.trim() || !branch.trim() || Number.isNaN(parsedCgpa)) {
      setErrorMsg("Please fill in your Roll No, Branch, and valid CGPA.");
      return;
    }

    setSaving(true);
    const res = await updateProfileAction({
      rollNo: rollNo.trim(),
      branch: branch.trim(),
      batch: Number.isNaN(parsedBatch) ? 2026 : parsedBatch,
      cgpa: parsedCgpa,
      activeBacklogs: Number.isNaN(parsedBacklogs) ? 0 : parsedBacklogs,
      tenthPercentage: Number.isNaN(parsedTenth ?? NaN) ? undefined : parsedTenth,
      twelfthPercentage: Number.isNaN(parsedTwelfth ?? NaN)
        ? undefined
        : parsedTwelfth,
    });
    setSaving(false);

    if (!res.success) {
      setErrorMsg(res.error ?? "Failed to save Academic Passport.");
      return;
    }

    setSavedMsg("Academic Passport saved. Waiting for TPO verification.");
    router.refresh();
  };

  return (
    <AppShell initialRole="STUDENT" pageTitle="Academic Passport">
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
            Academic Passport
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Your verified institutional academic record used for automated drive
            eligibility evaluation.
          </p>
        </div>

        {isVerified ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 flex items-start gap-3.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                <span>Record Verified &amp; Locked</span>
                <span className="rounded bg-emerald-200/70 text-emerald-800 text-[10px] font-bold px-2 py-0.5 uppercase tracking-wide">
                  Official
                </span>
              </div>
              <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                Verified by{" "}
                <strong>
                  {initialStudent?.verifierName ?? "Placement Cell (TPO)"}
                </strong>{" "}
                on {initialStudent?.verifiedAt}. Academic benchmarks are locked
                read-only to protect application integrity.
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 flex items-start gap-3.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 text-white shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-amber-950">
                {initialStudent
                  ? "Pending TPO Verification"
                  : "Complete Your Academic Passport"}
              </div>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                {initialStudent
                  ? "You can still update your marks while your profile is unverified. Once verified by the TPO, records lock automatically."
                  : "Enter your institutional academic details below so the TPO Desk can verify your profile for placement drives."}
              </p>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {savedMsg && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{savedMsg}</span>
          </div>
        )}

        <form
          onSubmit={handleSave}
          className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-2xs space-y-6"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-slate-500" />
              University Academic Benchmarks
            </h2>
            {isVerified && (
              <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium">
                <Lock className="h-3 w-3" />
                Read-Only
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                readOnly
                value={userName}
                className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2 text-xs text-slate-800 font-medium focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                University Roll No
              </label>
              <input
                type="text"
                required
                readOnly={isVerified}
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                placeholder="e.g. 22BCS041"
                className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2 text-xs font-mono text-slate-800 font-bold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Branch / Department
              </label>
              <input
                type="text"
                required
                readOnly={isVerified}
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="e.g. CSE"
                className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2 text-xs text-slate-800 font-medium focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Graduating Batch
              </label>
              <input
                type="number"
                required
                readOnly={isVerified}
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2 text-xs font-mono text-slate-800 font-medium focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cumulative CGPA (out of 10.0)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                required
                readOnly={isVerified}
                value={cgpa}
                onChange={(e) => setCgpa(e.target.value)}
                placeholder="e.g. 8.74"
                className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2 text-xs font-mono text-emerald-700 font-bold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Active Backlogs
              </label>
              <input
                type="number"
                min="0"
                required
                readOnly={isVerified}
                value={activeBacklogs}
                onChange={(e) => setActiveBacklogs(e.target.value)}
                className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2 text-xs font-mono text-slate-800 font-bold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                10th Standard Percentage
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                readOnly={isVerified}
                value={tenthPercentage}
                onChange={(e) => setTenthPercentage(e.target.value)}
                placeholder="e.g. 92.40"
                className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2 text-xs font-mono text-slate-800 font-medium focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                12th Standard Percentage
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                readOnly={isVerified}
                value={twelfthPercentage}
                onChange={(e) => setTwelfthPercentage(e.target.value)}
                placeholder="e.g. 90.00"
                className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2 text-xs font-mono text-slate-800 font-medium focus:outline-none"
              />
            </div>
          </div>

          {!isVerified && (
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-[#2563EB] px-5 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition disabled:opacity-70"
              >
                {saving ? "Saving..." : "Save Academic Passport"}
              </button>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Uploaded Resumes
            </h3>
            {resumes.length === 0 ? (
              <div className="p-3.5 rounded-lg border border-dashed border-[#E2E8F0] bg-[#F8FAFC] text-xs text-slate-500">
                No resumes uploaded yet. (Cloudflare R2 upload wiring comes in Step 3.)
              </div>
            ) : (
              resumes.map((resume) => (
                <div
                  key={resume.id}
                  className="p-3.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <FileCheck className="h-5 w-5 text-[#2563EB]" />
                    <div>
                      <div className="text-xs font-bold text-slate-800">
                        {resume.fileKey}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Version {resume.version} • Uploaded {resume.createdAt}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-[#2563EB]">
                    Active
                  </span>
                </div>
              ))
            )}
          </div>
        </form>

        <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 text-xs text-slate-600 flex items-center gap-2">
          <Building className="h-4 w-4 text-slate-400" />
          <span>
            Need corrections on verified records? Submit an unlock request to
            the TPO Desk.
          </span>
        </div>
      </div>
    </AppShell>
  );
}
