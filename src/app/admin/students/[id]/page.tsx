import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { ArrowLeft, Lock, ShieldCheck, FileText } from "lucide-react";
import { DEMO_STUDENTS } from "@/lib/demo-data";

export function generateStaticParams() {
  return DEMO_STUDENTS.map((s) => ({ id: s.id }));
}

export default async function AdminStudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const student =
    DEMO_STUDENTS.find((s) => s.id === id) ?? DEMO_STUDENTS[0];

  return (
    <AppShell initialRole="ADMIN" pageTitle={student.name}>
      <div className="space-y-6 max-w-4xl">
        <Link
          href="/admin/students"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Student Directory
        </Link>

        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono font-semibold text-[#2563EB]">
              {student.rollNo} • {student.branch} • Batch {student.batch}
            </div>
            <h1 className="text-xl font-bold text-[#0F172A] mt-0.5">
              {student.name}
            </h1>
            <div className="text-xs text-slate-500 mt-0.5">{student.email}</div>
          </div>

          {student.isVerified ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 text-xs font-bold self-start sm:self-auto">
              <Lock className="h-3.5 w-3.5" />
              Verified &amp; Locked
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 text-xs font-bold self-start sm:self-auto">
              <ShieldCheck className="h-3.5 w-3.5" />
              Pending Verification
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0]">
            <div className="text-xs text-slate-500">CGPA</div>
            <div className="text-xl font-bold font-mono text-emerald-700 mt-1">
              {student.cgpa.toFixed(2)}
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0]">
            <div className="text-xs text-slate-500">Active Backlogs</div>
            <div className="text-xl font-bold font-mono text-slate-900 mt-1">
              {student.activeBacklogs}
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0]">
            <div className="text-xs text-slate-500">10th Score</div>
            <div className="text-xl font-bold font-mono text-slate-900 mt-1">
              {student.tenthPct}%
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0]">
            <div className="text-xs text-slate-500">12th Score</div>
            <div className="text-xl font-bold font-mono text-slate-900 mt-1">
              {student.twelfthPct}%
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5 text-slate-700">
            <FileText className="h-4 w-4 text-[#2563EB]" />
            <span className="font-mono font-semibold">{student.resumeName}</span>
          </div>
          <span className="text-slate-500">
            {student.isVerified
              ? `Verified by ${student.verifiedBy} on ${student.verifiedAt}`
              : "Awaiting TPO verification"}
          </span>
        </div>
      </div>
    </AppShell>
  );
}

