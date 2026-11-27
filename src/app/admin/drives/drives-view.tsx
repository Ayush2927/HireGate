"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Plus, Search, Clock, Users, ArrowUpRight, Rocket } from "lucide-react";
import { publishDriveAction } from "@/server/actions/drive.actions";
import type { AdminDriveItem } from "@/server/queries/admin.queries";

export function AdminDrivesView({
  initialDrives,
}: {
  initialDrives: AdminDriveItem[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [publishingId, setPublishingId] = useState<string | null>(null);

  const filtered = initialDrives.filter(
    (d) =>
      d.companyName.toLowerCase().includes(search.toLowerCase()) ||
      d.title.toLowerCase().includes(search.toLowerCase())
  );

  const handlePublish = async (driveId: string) => {
    setPublishingId(driveId);
    await publishDriveAction(driveId);
    setPublishingId(null);
    router.refresh();
  };

  return (
    <AppShell initialRole="ADMIN" pageTitle="Placement Drives">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
              Placement Drives
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
              Publish recruitment drives, monitor applicant counts, and manage
              deadlines.
            </p>
          </div>

          <Link
            href="/admin/drives/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition shadow-2xs self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            Create Drive
          </Link>
        </div>

        <div className="bg-white p-3 rounded-xl border border-[#E2E8F0] flex items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search drives by company or role..."
              className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:border-[#2563EB] focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Company &amp; Role</th>
                  <th className="py-3 px-4">Tier</th>
                  <th className="py-3 px-4">CTC</th>
                  <th className="py-3 px-4">Eligibility</th>
                  <th className="py-3 px-4">Applicants</th>
                  <th className="py-3 px-4">Deadline</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-10 text-center text-slate-500"
                    >
                      No placement drives created yet. Click &ldquo;Create
                      Drive&rdquo; to publish one.
                    </td>
                  </tr>
                ) : (
                  filtered.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{d.title}</div>
                        <div className="text-[11px] text-slate-500">
                          {d.companyName} • {d.roundsCount} rounds
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="rounded bg-blue-50 text-[#2563EB] font-semibold px-2 py-0.5 text-[11px] border border-blue-200">
                          {d.tier}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {d.ctcFormatted}
                      </td>
                      <td className="py-3 px-4 text-[11px] text-slate-600 font-mono">
                        {d.eligibilitySummary}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 font-mono font-semibold text-slate-800">
                          <Users className="h-3.5 w-3.5 text-slate-400" />
                          {d.applicantCount}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-700">{d.deadlineLabel}</div>
                        <div className="text-[11px] text-rose-600 font-mono flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {d.timeLeftLabel}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {d.status === "DRAFT" ? (
                          <button
                            type="button"
                            disabled={publishingId === d.id}
                            onClick={() => handlePublish(d.id)}
                            className="inline-flex items-center gap-1 rounded bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700 transition disabled:opacity-60"
                          >
                            <Rocket className="h-3 w-3" />
                            {publishingId === d.id ? "Publishing..." : "Publish"}
                          </button>
                        ) : (
                          <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold">
                            {d.status}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/admin/drives/${d.id}`}
                          className="inline-flex items-center gap-1 text-[#2563EB] font-semibold hover:underline"
                        >
                          Manage
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
