import Link from "next/link";
import { Building2, Globe, Mail, MapPin, ShieldCheck, Briefcase, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { DEMO_DRIVES } from "@/lib/demo-data";

export default function RecruiterCompanyProfilePage() {
  const googleDrives = DEMO_DRIVES.filter((d) => d.companyName === "Google");

  return (
    <AppShell
      initialRole="RECRUITER"
      pageTitle="Company Profile"
      searchPlaceholder="Search drives or contacts..."
    >
      <div className="space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-xl font-bold text-blue-600">
                G
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-slate-900">Google</h1>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Verified Partner
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-slate-500">
                  Campus Recruitment 2026 · Engineering &amp; Product Hiring
                </p>
              </div>
            </div>
            <Link
              href="/recruiter/drives"
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800"
            >
              View Active Drives
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-6 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-3">
            <div className="flex items-center gap-2.5 text-sm text-slate-600">
              <MapPin className="h-4 w-4 text-slate-400" />
              <span>Bengaluru &amp; Hyderabad, India</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-slate-600">
              <Globe className="h-4 w-4 text-slate-400" />
              <span>careers.google.com</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-slate-600">
              <Mail className="h-4 w-4 text-slate-400" />
              <span>rajiv.mehta@google.com</span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-2">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-600" />
              <h2 className="text-sm font-semibold text-slate-900">
                Organization Overview
              </h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Google University Recruiting partners with campus Training &amp; Placement
              Offices through HireGate to manage structured eligibility screening,
              transparent round evaluations, and timely offer rollouts across B.Tech
              and M.Tech cohorts.
            </p>
            <div className="mt-6 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Active Campus Drives
              </h3>
              {googleDrives.map((drive) => (
                <div
                  key={drive.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 p-4"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {drive.title}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {drive.ctcFormatted} · Min CGPA {drive.criteria.minCgpa.toFixed(1)} ·{" "}
                      {drive.criteria.branches.join(", ")}
                    </p>
                  </div>
                  <Link
                    href={`/recruiter/drives/${drive.id}`}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Manage
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-blue-600" />
              <h2 className="text-sm font-semibold text-slate-900">
                Recruiting Team Contacts
              </h2>
            </div>
            <div className="mt-4 space-y-4">
              <div className="rounded-lg bg-slate-50 p-3.5">
                <p className="text-sm font-semibold text-slate-900">Rajiv Mehta</p>
                <p className="text-xs text-slate-500">Lead University Recruiter</p>
                <p className="mt-1 text-xs text-blue-600">rajiv.mehta@google.com</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3.5">
                <p className="text-sm font-semibold text-slate-900">Ananya Krishnan</p>
                <p className="text-xs text-slate-500">Technical Panel Coordinator</p>
                <p className="mt-1 text-xs text-blue-600">ananya.k@google.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
