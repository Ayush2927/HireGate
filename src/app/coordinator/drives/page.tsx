import React from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import Link from "next/link";
import { Briefcase, Users, ArrowUpRight } from "lucide-react";
import {
  getCoordinatorWorkspaceData,
  requireCoordinatorUser,
} from "@/server/queries/coordinator.queries";

export default async function CoordinatorDrivesPage() {
  const user = await requireCoordinatorUser();
  if (!user) {
    redirect("/login");
  }

  const { drives } = await getCoordinatorWorkspaceData(
    user.id,
    user.collegeId,
    user.role
  );

  return (
    <AppShell initialRole="COORDINATOR" pageTitle="Assigned Drives">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
            Assigned Placement Drives
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
            Coordinate interview rounds, attendance, and candidate updates.
          </p>
        </div>

        {drives.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-10 text-center text-xs text-slate-500">
            No placement drives assigned yet.
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
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
                      {d.status}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900">
                    {d.title}
                  </h2>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-3.5 w-3.5" />
                      {d.rounds.length} rounds
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {d.candidates.length} candidates
                    </span>
                  </div>
                </div>

                <Link
                  href="/coordinator/rounds"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#2563EB] hover:underline"
                >
                  Open Round Desk
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
