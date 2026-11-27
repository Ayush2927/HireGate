"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Building, Briefcase, Plus, Globe, AlertCircle } from "lucide-react";
import { createCompanyAction } from "@/server/actions/admin.actions";
import type { AdminCompanyItem } from "@/server/queries/admin.queries";

export function AdminCompaniesView({
  initialCompanies,
}: {
  initialCompanies: AdminCompanyItem[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSaving(true);
    const res = await createCompanyAction({ name, website });
    setSaving(false);

    if (!res.success) {
      setErrorMsg(res.error);
      return;
    }

    setName("");
    setWebsite("");
    router.refresh();
  };

  return (
    <AppShell initialRole="ADMIN" pageTitle="Companies">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
            Recruiting Companies
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
            Active corporate partners and their placement drive history.
          </p>
        </div>

        <form
          onSubmit={handleCreate}
          className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-end gap-3"
        >
          <div className="flex-1">
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Company Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Google"
              className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1.5 text-xs focus:border-[#2563EB] focus:bg-white focus:outline-none"
            />
          </div>
          <div className="flex-1">
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Website (optional)
            </label>
            <input
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://careers.google.com"
              className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1.5 text-xs focus:border-[#2563EB] focus:bg-white focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition disabled:opacity-60"
          >
            <Plus className="h-3.5 w-3.5" />
            {saving ? "Adding..." : "Add Company"}
          </button>
        </form>

        {errorMsg && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {initialCompanies.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-10 text-center text-xs text-slate-500">
            No companies added yet. Add a recruiting partner above to start
            creating drives.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {initialCompanies.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-[#101827] text-white font-bold text-sm">
                      {c.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {c.name}
                      </h3>
                      {c.website && (
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Globe className="h-3 w-3" /> {c.website}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                    {c.latestRole ?? "No drives yet"}
                  </span>
                  {c.latestCtc && (
                    <span className="font-mono font-bold text-slate-900">
                      {c.latestCtc}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Building className="h-3 w-3" /> {c.driveCount} placement
                  drive(s)
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
