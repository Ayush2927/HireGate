import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { ArrowUpRight, Users, Award } from "lucide-react";
import {
  getRecruiterWorkspaceData,
  requireRecruiterUser,
} from "@/server/queries/recruiter.queries";

export default async function RecruiterDrivesPage() {
  const user = await requireRecruiterUser();
  if (!user) {
    redirect("/login");
  }

  const { drives } = await getRecruiterWorkspaceData(
    user.collegeId,
    user.companyId
  );

  return (
    <AppShell initialRole="RECRUITER" pageTitle="My Drives">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
            Recruiting Drives
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
            Track applicant counts, shortlists, and offers across your drives.
          </p>
        </div>

        {drives.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-10 text-center text-xs text-slate-500">
            No placement drives found for your company yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {drives.map((d) => (
              <div
                key={d.id}
                className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-2xs flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#2563EB]">
                      {d.companyName} • {d.tier}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-900">
                      {d.ctcFormatted}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900">
                    {d.title}
                  </h2>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {d.applicantCount} applicants
                    </span>
                    <span className="flex items-center gap-1">
                      <Award className="h-3.5 w-3.5 text-emerald-600" />
                      {d.offeredCount} offered
                    </span>
                  </div>
                </div>

                <Link
                  href={`/recruiter/drives/${d.id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#2563EB] hover:underline"
                >
                  Review Candidates
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
