"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Megaphone, AlertCircle, CheckCircle2 } from "lucide-react";
import { postAnnouncementAction } from "@/server/actions/coordinator.actions";
import type {
  CoordinatorAnnouncementItem,
  CoordinatorDriveItem,
} from "@/server/queries/coordinator.queries";

export function CoordinatorAnnouncementsView({
  drives,
  announcements,
}: {
  drives: CoordinatorDriveItem[];
  announcements: CoordinatorAnnouncementItem[];
}) {
  const router = useRouter();
  const [driveId, setDriveId] = useState(drives[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [venue, setVenue] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sentOk, setSentOk] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driveId) {
      setErrorMsg("Select a drive first.");
      return;
    }
    setErrorMsg(null);
    setSentOk(false);
    setSending(true);

    const res = await postAnnouncementAction({
      driveId,
      title,
      venue,
      message,
    });

    setSending(false);
    if (!res.success) {
      setErrorMsg(res.error);
      return;
    }

    setTitle("");
    setVenue("");
    setMessage("");
    setSentOk(true);
    router.refresh();
  };

  return (
    <AppShell initialRole="COORDINATOR" pageTitle="Announcements">
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
            Drive Announcements
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
            Broadcast round schedules, room numbers, and instructions to
            applicants.
          </p>
        </div>

        {errorMsg && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {sentOk && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>Announcement saved and sent to drive applicants.</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border border-[#E2E8F0] p-6 space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Drive
              </label>
              <select
                aria-label="Target drive"
                value={driveId}
                onChange={(e) => setDriveId(e.target.value)}
                className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-xs"
              >
                {drives.length === 0 ? (
                  <option value="">No drives available</option>
                ) : (
                  drives.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.companyName} — {d.title}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Announcement Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Round 2 Panel Reporting"
                className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Venue / Reporting Link
            </label>
            <input
              type="text"
              required
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="Placement Block Room 204"
              className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Instructions
            </label>
            <textarea
              rows={3}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Provide clear reporting instructions..."
              className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={sending || drives.length === 0}
            className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            <Megaphone className="h-3.5 w-3.5" />
            {sending ? "Sending..." : "Broadcast Announcement"}
          </button>
        </form>

        <div className="space-y-3">
          {announcements.map((a) => (
            <div
              key={a.id}
              className="bg-white rounded-xl border border-[#E2E8F0] p-4 text-xs space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{a.title}</span>
                <span className="text-[11px] font-mono text-slate-400">
                  {a.sentAt}
                </span>
              </div>
              <div className="text-[11px] font-semibold text-[#2563EB]">
                {a.venue}
              </div>
              <p className="text-slate-600">{a.message}</p>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
