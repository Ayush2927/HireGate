"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Search } from "lucide-react";
import type { AdminApplicationItem } from "@/server/queries/admin.queries";

export function AdminApplicationsView({
  initialApplications,
}: {
  initialApplications: AdminApplicationItem[];
}) {
  const [query, setQuery] = useState("");
  const filtered = initialApplications.filter(
    (a) =>
      a.studentName.toLowerCase().includes(query.toLowerCase()) ||
      a.companyName.toLowerCase().includes(query.toLowerCase()) ||
      a.rollNo.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AppShell initialRole="ADMIN" pageTitle="Applications">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
            All Campus Applications
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
            Monitor student submissions and round statuses across all active
            drives.
          </p>
        </div>

        <div className="bg-white p-3 rounded-xl border border-[#E2E8F0]">
          <div className="relative w-full sm:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search student, roll no, or company..."
              className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] pl-8 pr-3 py-1.5 text-xs focus:border-[#2563EB] focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Roll No</th>
                  <th className="py-3 px-4">Company</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4">Applied On</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-10 text-center text-slate-500"
                    >
                      No applications found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {a.studentName}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {a.rollNo}
                      </td>
                      <td className="py-3 px-4 text-slate-800 font-medium">
                        {a.companyName}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {a.roleTitle}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {a.currentRound}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500">
                        {a.appliedOn}
                      </td>
                      <td className="py-3 px-4">
                        <span className="rounded-full bg-blue-50 text-[#2563EB] border border-blue-200 px-2.5 py-0.5 text-[11px] font-bold">
                          {a.status}
                        </span>
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
