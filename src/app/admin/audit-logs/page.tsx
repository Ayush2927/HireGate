import React from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { ShieldAlert } from "lucide-react";
import {
  getAdminAuditLogs,
  requireAdminUser,
} from "@/server/queries/admin.queries";

export default async function AdminAuditLogsPage() {
  const admin = await requireAdminUser();
  if (!admin) {
    redirect("/login");
  }

  const logs = await getAdminAuditLogs(admin.collegeId);

  return (
    <AppShell initialRole="ADMIN" pageTitle="Audit Logs">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
            Audit Logs
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
            Immutable activity trail of verifications, drive publications, and
            candidate updates.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-10 text-center text-slate-500"
                    >
                      No audit events recorded yet.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {log.timestamp}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">
                          {log.actorName}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {log.actorRole}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 rounded bg-slate-100 text-slate-800 border border-slate-200 px-2 py-0.5 font-mono text-[10px] font-semibold">
                          <ShieldAlert className="h-3 w-3 text-[#2563EB]" />
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {log.entity}
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono text-[11px] max-w-md truncate">
                        {log.details}
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
