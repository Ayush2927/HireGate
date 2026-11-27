import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { ArrowLeft, CheckCircle2, Clock, FileText, XCircle } from "lucide-react";
import {
  getStudentApplicationDetail,
  getStudentPortalContext,
} from "@/server/queries/student.queries";

export default async function StudentApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const ctx = await getStudentPortalContext();
  if (!ctx) {
    redirect("/login");
  }
  if (!ctx.student) {
    redirect("/student/profile");
  }

  const { id } = await params;
  const app = await getStudentApplicationDetail(ctx.student.userId, id);
  if (!app) {
    notFound();
  }

  return (
    <AppShell initialRole="STUDENT" pageTitle="Application Details">
      <div className="space-y-6 max-w-4xl">
        <Link
          href="/student/applications"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to My Applications
        </Link>

        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-[#2563EB]">
              {app.companyName} • {app.tier}
            </div>
            <h1 className="text-xl font-bold text-[#0F172A] mt-0.5">
              {app.roleTitle}
            </h1>
            <div className="text-xs text-slate-500 mt-1 font-mono">
              {app.ctcFormatted} • Applied on {app.appliedOn}
            </div>
          </div>
          <span className="inline-flex items-center rounded-full bg-blue-50 text-[#2563EB] border border-blue-200 px-3 py-1 text-xs font-bold self-start sm:self-auto">
            {app.status}
          </span>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 space-y-4">
          <h2 className="text-sm font-bold text-[#0F172A]">
            Round Progression
          </h2>
          {app.rounds.length === 0 ? (
            <p className="text-xs text-slate-500">
              Rounds will appear here once published by the placement team.
            </p>
          ) : (
            <div className="space-y-3">
              {app.rounds.map((round) => {
                const passed = round.result === "PASSED";
                const failed =
                  round.result === "FAILED" || round.result === "ABSENT";

                return (
                  <div
                    key={round.id}
                    className={`p-3.5 rounded-lg border flex items-center justify-between text-xs ${
                      passed
                        ? "border-emerald-200 bg-emerald-50/40"
                        : failed
                        ? "border-rose-200 bg-rose-50/40"
                        : "border-slate-200 bg-[#F8FAFC]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {passed ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      ) : failed ? (
                        <XCircle className="h-4 w-4 text-rose-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-amber-500" />
                      )}
                      <span className="font-semibold text-slate-900">
                        Round {round.sequence}: {round.name}
                      </span>
                    </div>
                    <span className="font-mono text-[11px] font-semibold text-slate-600">
                      {round.result}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5 text-slate-700">
            <FileText className="h-4 w-4 text-[#2563EB]" />
            <span>
              Submitted Resume:{" "}
              <strong className="font-mono">
                {app.resumeFileKey ?? "Profile Snapshot"}
              </strong>
            </span>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
