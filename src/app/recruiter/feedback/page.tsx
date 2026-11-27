"use client";

import { useState } from "react";
import { CheckCircle2, MessageSquareText, Star, Send } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { DEMO_STUDENTS } from "@/lib/demo-data";

interface FeedbackRecord {
  id: string;
  studentName: string;
  rollNo: string;
  round: string;
  rating: number;
  recommendation: "Strong Hire" | "Hire" | "Hold" | "No Hire";
  notes: string;
}

const INITIAL_FEEDBACK: FeedbackRecord[] = [
  {
    id: "fb-1",
    studentName: DEMO_STUDENTS[0].name,
    rollNo: DEMO_STUDENTS[0].rollNo,
    round: "Technical Interview — Round 1",
    rating: 5,
    recommendation: "Strong Hire",
    notes: "Strong algorithmic problem solving and clean complexity trade-off analysis.",
  },
  {
    id: "fb-2",
    studentName: DEMO_STUDENTS[3].name,
    rollNo: DEMO_STUDENTS[3].rollNo,
    round: "Technical Interview — Round 1",
    rating: 4,
    recommendation: "Hire",
    notes: "Solid backend architecture fundamentals; communicated edge cases clearly.",
  },
];

export default function RecruiterFeedbackPage() {
  const [records, setRecords] = useState<FeedbackRecord[]>(INITIAL_FEEDBACK);
  const [selectedStudentId, setSelectedStudentId] = useState<string>(DEMO_STUDENTS[1].id);
  const [round, setRound] = useState<string>("Technical Interview — Round 1");
  const [rating, setRating] = useState<number>(4);
  const [recommendation, setRecommendation] =
    useState<FeedbackRecord["recommendation"]>("Hire");
  const [notes, setNotes] = useState<string>("");
  const [submittedNotice, setSubmittedNotice] = useState<boolean>(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const student =
      DEMO_STUDENTS.find((s) => s.id === selectedStudentId) ?? DEMO_STUDENTS[0];
    const newRecord: FeedbackRecord = {
      id: `fb-${records.length + 1}`,
      studentName: student.name,
      rollNo: student.rollNo,
      round,
      rating,
      recommendation,
      notes:
        notes.trim() ||
        "Candidate demonstrated solid foundational knowledge during evaluation.",
    };
    setRecords((prev) => [newRecord, ...prev]);
    setNotes("");
    setSubmittedNotice(true);
  }

  return (
    <AppShell
      initialRole="RECRUITER"
      pageTitle="Candidate Feedback"
      searchPlaceholder="Search submitted evaluations..."
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Interview Feedback &amp; Evaluation
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Submit structured round evaluations and review panel recommendations.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 lg:col-span-5"
          >
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <MessageSquareText className="h-4 w-4 text-blue-600" />
              <h2 className="text-sm font-semibold text-slate-900">
                Submit New Evaluation
              </h2>
            </div>

            {submittedNotice && (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                Evaluation recorded and shared with the TPO desk.
              </div>
            )}

            <div>
              <label
                htmlFor="feedback-candidate"
                className="block text-xs font-medium text-slate-700"
              >
                Candidate
              </label>
              <select
                id="feedback-candidate"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
              >
                {DEMO_STUDENTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.rollNo} · {s.branch})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="feedback-round"
                className="block text-xs font-medium text-slate-700"
              >
                Interview Round
              </label>
              <select
                id="feedback-round"
                value={round}
                onChange={(e) => setRound(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
              >
                <option value="Technical Interview — Round 1">
                  Technical Interview — Round 1
                </option>
                <option value="System Design — Round 2">System Design — Round 2</option>
                <option value="Hiring Manager — Final Round">
                  Hiring Manager — Final Round
                </option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700">
                  Score (1–5)
                </label>
                <div className="mt-2 flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      className="rounded p-1 hover:bg-slate-100"
                      aria-label={`Rate ${value} out of 5`}
                    >
                      <Star
                        className={`h-4 w-4 ${
                          value <= rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="feedback-decision"
                  className="block text-xs font-medium text-slate-700"
                >
                  Recommendation
                </label>
                <select
                  id="feedback-decision"
                  value={recommendation}
                  onChange={(e) =>
                    setRecommendation(e.target.value as FeedbackRecord["recommendation"])
                  }
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
                >
                  <option value="Strong Hire">Strong Hire</option>
                  <option value="Hire">Hire</option>
                  <option value="Hold">Hold</option>
                  <option value="No Hire">No Hire</option>
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="feedback-notes"
                className="block text-xs font-medium text-slate-700"
              >
                Evaluation Notes
              </label>
              <textarea
                id="feedback-notes"
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Summarize problem-solving approach, code clarity, and communication..."
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              <Send className="h-4 w-4" />
              Submit Feedback
            </button>
          </form>

          <div className="space-y-4 lg:col-span-7">
            <div className="rounded-xl border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-6 py-4">
                <h2 className="text-sm font-semibold text-slate-900">
                  Submitted Evaluations ({records.length})
                </h2>
              </div>
              <div className="divide-y divide-slate-200">
                {records.map((item) => (
                  <div key={item.id} className="space-y-2 px-6 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-sm font-semibold text-slate-900">
                          {item.studentName}
                        </span>
                        <span className="ml-2 rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600">
                          {item.rollNo}
                        </span>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          item.recommendation === "Strong Hire" ||
                          item.recommendation === "Hire"
                            ? "bg-emerald-50 text-emerald-700"
                            : item.recommendation === "Hold"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {item.recommendation}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{item.round}</span>
                      <span className="inline-flex items-center gap-1 font-medium text-amber-600">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        {item.rating}/5
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">{item.notes}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

