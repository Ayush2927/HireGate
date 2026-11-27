import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import {
  Users,
  ShieldCheck,
  Briefcase,
  FileText,
  Calendar,
} from "lucide-react";
import { ApplicationsTrendChart } from "@/components/charts/applications-trend-chart";
import { TierDonutChart } from "@/components/charts/tier-donut-chart";
import {
  getAdminDashboardData,
  requireAdminUser,
} from "@/server/queries/admin.queries";

const STATUS_BADGE: Record<string, string> = {
  SHORTLISTED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  APPLIED: "bg-blue-50 text-blue-700 border-blue-200",
  IN_PROGRESS: "bg-amber-50 text-amber-700 border-amber-200",
  OFFERED: "bg-emerald-100 text-emerald-800 border-emerald-300",
  REJECTED: "bg-rose-50 text-rose-700 border-rose-200",
};

export default async function AdminDashboardPage() {
  const admin = await requireAdminUser();
  if (!admin) {
    redirect("/login");
  }

  const { stats, recentApplications, upcomingDeadlines } =
    await getAdminDashboardData(admin.collegeId);

  const verifiedCount = stats.totalStudents - stats.pendingVerifications;
  const verifiedPct =
    stats.totalStudents > 0
      ? `${((verifiedCount / stats.totalStudents) * 100).toFixed(1)}%`
      : "0%";

  return (
    <AppShell initialRole="ADMIN" pageTitle="TPO Dashboard">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Dashboard
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Overview of placement activities at your institution
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-xs text-xs font-semibold text-slate-700">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-slate-500 font-normal">Academic Year</span>
            <span className="text-slate-900 font-bold">2025 – 2026</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shrink-0">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500">
                Total Students
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-2xl font-extrabold text-slate-900">
                  {stats.totalStudents}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500">Verified</div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-2xl font-extrabold text-slate-900">
                  {verifiedCount}
                </span>
                <span className="text-[11px] font-bold text-emerald-600">
                  {verifiedPct}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 shrink-0">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500">
                Active Drives
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-2xl font-extrabold text-slate-900">
                  {stats.activeDrives}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600 shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500">
                Total Applications
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-2xl font-extrabold text-slate-900">
                  {stats.totalApplications}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
            <h2 className="text-sm font-bold text-slate-900 mb-3">
              Application Trend
            </h2>
            <ApplicationsTrendChart />
          </div>
          <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
            <h2 className="text-sm font-bold text-slate-900 mb-3">
              Placement Tier Distribution
            </h2>
            <TierDonutChart />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">
                Recent Applications
              </h2>
              <Link
                href="/admin/applications"
                className="text-xs font-semibold text-[#2563EB] hover:underline"
              >
                View all →
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {recentApplications.length === 0 ? (
                <div className="p-6 text-xs text-slate-500 text-center">
                  No applications submitted yet.
                </div>
              ) : (
                recentApplications.map((app) => (
                  <div
                    key={app.id}
                    className="px-5 py-3 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">
                        {app.studentName}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {app.companyName} • {app.roleTitle}
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${
                        STATUS_BADGE[app.status] ?? STATUS_BADGE.APPLIED
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">
                Active Drive Deadlines
              </h2>
              <Link
                href="/admin/drives"
                className="text-xs font-semibold text-[#2563EB] hover:underline"
              >
                Manage →
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {upcomingDeadlines.length === 0 ? (
                <div className="p-6 text-xs text-slate-500 text-center">
                  No active published drives.
                </div>
              ) : (
                upcomingDeadlines.map((d) => (
                  <div
                    key={d.id}
                    className="px-5 py-3 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">
                        {d.companyName}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {d.title} • {d.deadlineLabel}
                      </div>
                    </div>
                    <span className="rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 text-[11px] font-bold">
                      {d.timeLeftLabel}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
