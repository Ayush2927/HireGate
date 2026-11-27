"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, Clock, MapPin, Video, Users, CheckCircle2, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { DEMO_ATTENDANCE, DEMO_DRIVES, DEMO_STUDENTS } from "@/lib/demo-data";

interface InterviewSlot {
  id: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  branch: string;
  cgpa: number;
  driveTitle: string;
  roundName: string;
  timeSlot: string;
  mode: "Virtual" | "In-Person";
  venue: string;
  status: "Scheduled" | "In Progress" | "Completed";
}

const INITIAL_INTERVIEWS: InterviewSlot[] = [
  {
    id: "int-1",
    studentId: "stu-1",
    studentName: DEMO_STUDENTS[0].name,
    rollNo: DEMO_STUDENTS[0].rollNo,
    branch: DEMO_STUDENTS[0].branch,
    cgpa: DEMO_STUDENTS[0].cgpa,
    driveTitle: DEMO_DRIVES[0].title,
    roundName: "Technical Interview — Round 1",
    timeSlot: "10:00 AM – 10:45 AM",
    mode: "Virtual",
    venue: "Google Meet Room A",
    status: "Completed",
  },
  {
    id: "int-2",
    studentId: "stu-2",
    studentName: DEMO_STUDENTS[1].name,
    rollNo: DEMO_STUDENTS[1].rollNo,
    branch: DEMO_STUDENTS[1].branch,
    cgpa: DEMO_STUDENTS[1].cgpa,
    driveTitle: DEMO_DRIVES[0].title,
    roundName: "Technical Interview — Round 1",
    timeSlot: "11:00 AM – 11:45 AM",
    mode: "Virtual",
    venue: "Google Meet Room A",
    status: "In Progress",
  },
  {
    id: "int-3",
    studentId: "stu-4",
    studentName: DEMO_STUDENTS[3].name,
    rollNo: DEMO_STUDENTS[3].rollNo,
    branch: DEMO_STUDENTS[3].branch,
    cgpa: DEMO_STUDENTS[3].cgpa,
    driveTitle: DEMO_DRIVES[0].title,
    roundName: "System Design — Round 2",
    timeSlot: "02:00 PM – 02:45 PM",
    mode: "In-Person",
    venue: "Placement Block · Panel Room 3",
    status: "Scheduled",
  },
  {
    id: "int-4",
    studentId: "stu-5",
    studentName: DEMO_STUDENTS[4].name,
    rollNo: DEMO_STUDENTS[4].rollNo,
    branch: DEMO_STUDENTS[4].branch,
    cgpa: DEMO_STUDENTS[4].cgpa,
    driveTitle: DEMO_DRIVES[0].title,
    roundName: "System Design — Round 2",
    timeSlot: "03:00 PM – 03:45 PM",
    mode: "In-Person",
    venue: "Placement Block · Panel Room 3",
    status: "Scheduled",
  },
];

export default function RecruiterInterviewsPage() {
  const [interviews, setInterviews] = useState<InterviewSlot[]>(INITIAL_INTERVIEWS);
  const [filterStatus, setFilterStatus] = useState<"ALL" | InterviewSlot["status"]>("ALL");

  const filtered = interviews.filter((slot) =>
    filterStatus === "ALL" ? true : slot.status === filterStatus
  );

  const presentCount = DEMO_ATTENDANCE.filter((a) => a.attendance === "PRESENT").length;

  function markCompleted(id: string) {
    setInterviews((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "Completed" } : item))
    );
  }

  return (
    <AppShell
      initialRole="RECRUITER"
      pageTitle="Interview Schedule"
      searchPlaceholder="Search scheduled candidates or rooms..."
    >
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Interview Schedule
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage live and upcoming interview panels for Google Campus Recruitment 2026.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {(["ALL", "Scheduled", "In Progress", "Completed"] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFilterStatus(status)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  filterStatus === status
                    ? "bg-blue-600 text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {status === "ALL" ? "All Slots" : status}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Today&apos;s Panels
              </span>
              <Calendar className="h-4 w-4 text-blue-600" />
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900">{interviews.length}</p>
            <p className="mt-1 text-xs text-slate-500">Across 2 evaluation rooms</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Checked-In Candidates
              </span>
              <Users className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900">{presentCount}</p>
            <p className="mt-1 text-xs text-slate-500">Verified by placement coordinator</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Completed Evaluations
              </span>
              <CheckCircle2 className="h-4 w-4 text-indigo-600" />
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {interviews.filter((i) => i.status === "Completed").length}
            </p>
            <p className="mt-1 text-xs text-slate-500">Ready for final feedback</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-sm font-semibold text-slate-900">
              Assigned Candidate Slots ({filtered.length})
            </h2>
          </div>
          <div className="divide-y divide-slate-200">
            {filtered.map((slot) => (
              <div
                key={slot.id}
                className="flex flex-col justify-between gap-4 px-6 py-4 transition-colors hover:bg-slate-50/70 sm:flex-row sm:items-center"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/recruiter/candidates/${slot.studentId}`}
                      className="text-sm font-semibold text-slate-900 hover:text-blue-600"
                    >
                      {slot.studentName}
                    </Link>
                    <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600">
                      {slot.rollNo}
                    </span>
                    <span className="text-xs text-slate-500">
                      {slot.branch} · CGPA {slot.cgpa.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-blue-600">
                    {slot.driveTitle} — {slot.roundName}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      {slot.timeSlot}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      {slot.mode === "Virtual" ? (
                        <Video className="h-3.5 w-3.5 text-slate-400" />
                      ) : (
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      )}
                      {slot.venue}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      slot.status === "Completed"
                        ? "bg-emerald-50 text-emerald-700"
                        : slot.status === "In Progress"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-blue-50 text-blue-700"
                    }`}
                  >
                    {slot.status}
                  </span>
                  {slot.status !== "Completed" && (
                    <button
                      type="button"
                      onClick={() => markCompleted(slot.id)}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Mark Complete
                    </button>
                  )}
                  <Link
                    href="/recruiter/feedback"
                    className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
                  >
                    Evaluate
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
