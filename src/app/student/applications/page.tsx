import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { ExternalLink } from "lucide-react";
import {
  getStudentApplicationsFeed,
  getStudentPortalContext,
} from "@/server/queries/student.queries";

const STATUS_BADGE: Record<string, string> = {
  SHORTLISTED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  APPLIED: "bg-blue-50 text-blue-700 border-blue-200",
  IN_PROGRESS: "bg-amber-50 text-amber-700 border-amber-200",
  OFFERED: "bg-emerald-100 text-emerald-800 border-emerald-300",
  REJECTED: "bg-rose-50 text-rose-700 border-rose-200",
};

export default async function StudentApplicationsPage() {
  const ctx = await getStudentPortalContext();
  if (!ctx) {
    redirect("/login");
  }

  const myApps = ctx.student
    ? await getStudentApplicationsFeed(ctx.student.userId)
    : [];

  return (
    <AppShell initialRole="STUDENT" pageTitle="My Applications">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
            My Applications
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Track round progression, assessment invitations, and interview
            schedules.
          </p>
        </div>

        {myApps.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-10 text-center space-y-2">
            <div className="text-sm font-semibold text-slate-900">
              No applications submitted yet
            </div>
            <p className="text-xs text-slate-500">
              Browse eligible placement drives on your dashboard to apply.
            </p>
            <Link
              href="/student/drives"
              className="inline-block mt-2 rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition"
            >
              Browse Drives →
            </Link>
          </div>
        ) : (
          <div className="space-y-3.5">
            {myApps.map((app) => (
              <div
                key={app.id}
                className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#101827] text-white font-bold text-sm shrink-0">
                    {app.companyName[0]}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-[#0F172A]">
                        {app.roleTitle}
                      </h3>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs font-semibold text-slate-600">
                        {app.companyName}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="font-mono text-emerald-700 font-bold">
                        {app.ctcFormatted}
                      </span>
                      <span>•</span>
                      <span>{app.tier}</span>
                      <span>•</span>
                      <span>Applied on {app.appliedOn}</span>
                    </div>

                    <div className="pt-1 flex items-center gap-2">
                      <span className="text-xs text-slate-500">
                        Current Stage:
                      </span>
                      <span className="text-xs font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                        {app.currentRound}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold border ${
                      STATUS_BADGE[app.status] ?? STATUS_BADGE.APPLIED
                    }`}
                  >
                    {app.status}
                  </span>

                  <Link
                    href={`/student/applications/${app.id}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    Details
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
