import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { ArrowLeft, Users, CheckCircle2, Clock } from "lucide-react";
import { DEMO_DRIVES, DEMO_APPLICATIONS } from "@/lib/demo-data";

export function generateStaticParams() {
  return DEMO_DRIVES.map((d) => ({ id: d.id }));
}

export default async function AdminDriveDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const drive = DEMO_DRIVES.find((d) => d.id === id) ?? DEMO_DRIVES[0];
  const applicants = DEMO_APPLICATIONS.filter((a) => a.driveId === drive.id);

  return (
    <AppShell initialRole="ADMIN" pageTitle={drive.title}>
      <div className="space-y-6 max-w-5xl">
        <Link
          href="/admin/drives"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Placement Drives
        </Link>

        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-[#2563EB]">
              {drive.companyName} • {drive.tierLabel}
            </div>
            <h1 className="text-xl font-bold text-[#0F172A] mt-0.5">
              {drive.title}
            </h1>
            <div className="text-xs text-slate-500 mt-1 font-mono">
              {drive.ctcFormatted} • {drive.location}
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="px-3 py-2 rounded-lg bg-[#F8FAFC] border border-slate-200 text-center">
              <div className="font-mono font-bold text-slate-900 text-base">
                {drive.applicantCount}
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-1">
                <Users className="h-3 w-3" /> Applicants
              </div>
            </div>
            <div className="px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-center">
              <div className="font-mono font-bold text-emerald-700 text-base">
                {drive.shortlistedCount}
              </div>
              <div className="text-[11px] text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Shortlisted
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#0F172A]">
              Criteria &amp; Deadline
            </h2>
            <span className="text-xs font-mono font-semibold text-rose-600 flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {drive.deadlineLabel}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-mono">
            <span className="bg-slate-100 px-3 py-1 rounded-md border border-slate-200">
              Branches: {drive.criteria.branches.join(", ")}
            </span>
            <span className="bg-slate-100 px-3 py-1 rounded-md border border-slate-200">
              Min CGPA: {drive.criteria.minCgpa.toFixed(1)}
            </span>
            <span className="bg-slate-100 px-3 py-1 rounded-md border border-slate-200">
              Max Backlogs: {drive.criteria.maxBacklogs}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 font-bold text-xs text-slate-900">
            Recent Applicants ({applicants.length})
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
              <tr>
                <th className="py-2.5 px-4">Student</th>
                <th className="py-2.5 px-4">Roll No</th>
                <th className="py-2.5 px-4">CGPA</th>
                <th className="py-2.5 px-4">Round</th>
                <th className="py-2.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {applicants.map((a) => (
                <tr key={a.id}>
                  <td className="py-2.5 px-4 font-semibold text-slate-900">
                    {a.studentName}
                  </td>
                  <td className="py-2.5 px-4 font-mono text-slate-600">
                    {a.rollNo}
                  </td>
                  <td className="py-2.5 px-4 font-mono font-bold text-emerald-700">
                    {a.cgpa.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-4 text-slate-600">
                    {a.currentRound}
                  </td>
                  <td className="py-2.5 px-4 font-semibold text-[#2563EB]">
                    {a.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}

