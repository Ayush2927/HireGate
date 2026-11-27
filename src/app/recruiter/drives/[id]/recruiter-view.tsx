"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import {
  ArrowLeft,
  Clock,
  Search,
  Download,
  MoreVertical,
} from "lucide-react";

interface Candidate {
  id: string;
  name: string;
  rollNo: string;
  branch: string;
  cgpa: number;
  status: "Shortlisted" | "Applied" | "Interview";
}

const CANDIDATES: Candidate[] = [
  {
    id: "c-1",
    name: "Aarav Sharma",
    rollNo: "2022CS045",
    branch: "CSE",
    cgpa: 8.7,
    status: "Shortlisted",
  },
  {
    id: "c-2",
    name: "Ishita Verma",
    rollNo: "2022EC032",
    branch: "ECE",
    cgpa: 8.5,
    status: "Applied",
  },
  {
    id: "c-3",
    name: "Rohan Patel",
    rollNo: "2022CS118",
    branch: "CSE",
    cgpa: 8.9,
    status: "Shortlisted",
  },
  {
    id: "c-4",
    name: "Sneha Iyer",
    rollNo: "2022IT076",
    branch: "IT",
    cgpa: 8.4,
    status: "Shortlisted",
  },
  {
    id: "c-5",
    name: "Karan Mehta",
    rollNo: "2022CS201",
    branch: "CSE",
    cgpa: 8.6,
    status: "Applied",
  },
];

export function RecruiterDriveView() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "applicants" | "shortlisted" | "interviews" | "feedback"
  >("applicants");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("All");
  const [candidates, setCandidates] = useState<Candidate[]>(CANDIDATES);

  const toggleShortlist = (id: string) => {
    setCandidates((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: c.status === "Shortlisted" ? "Applied" : "Shortlisted",
            }
          : c
      )
    );
  };

  const filtered = candidates.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.rollNo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBranch =
      selectedBranch === "All" || c.branch === selectedBranch;
    return matchesSearch && matchesBranch;
  });

  return (
    <AppShell initialRole="RECRUITER">
      <div className="space-y-6">
        {/* Back Link */}
        <div>
          <Link
            href="/recruiter/drives/1"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Drives
          </Link>
        </div>

        {/* ── Drive Context Banner ───────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white border border-slate-200 shadow-xs text-xl font-bold text-red-500 shrink-0">
              G
            </div>
            <div className="space-y-1">
              <h1 className="text-xl font-extrabold text-slate-900">
                Software Engineer
              </h1>
              <p className="text-xs text-slate-500">Google • On Campus 2026</p>
              <div className="flex items-center gap-2 pt-1">
                <span className="rounded bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 text-xs border border-blue-200">
                  Tier 1
                </span>
                <span className="rounded bg-blue-50 text-blue-700 font-bold px-2 py-0.5 text-xs border border-blue-200 font-mono">
                  ₹ 45 LPA
                </span>
                <span className="rounded bg-slate-100 text-slate-600 font-medium px-2 py-0.5 text-xs border border-slate-200">
                  Full Time
                </span>
              </div>
            </div>
          </div>

          <div className="text-left md:text-right pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
            <div className="text-xs text-slate-500">Application Deadline</div>
            <div className="text-xs font-semibold text-slate-800">
              25 Aug 2025, 11:59 PM
            </div>
            <div className="text-xs font-bold text-rose-600 flex items-center md:justify-end gap-1 font-mono mt-1">
              <Clock className="h-3.5 w-3.5" />
              2d 14h 32m
            </div>
          </div>
        </div>

        {/* ── Tabs Navigation ────────────────────────────────────────── */}
        <div className="border-b border-slate-200 flex gap-6 text-xs font-semibold">
          {[
            { id: "overview", label: "Overview" },
            { id: "applicants", label: "Applicants (142)" },
            { id: "shortlisted", label: "Shortlisted (48)" },
            { id: "interviews", label: "Interviews" },
            { id: "feedback", label: "Feedback" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`pb-3 transition relative ${
                activeTab === tab.id
                  ? "text-blue-600 border-b-2 border-blue-600 font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Filter Toolbar ─────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
          <div className="relative w-full sm:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, roll no or branch..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <select
              aria-label="Filter candidates by branch"
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none"
            >
              <option value="All">All Branches</option>
              <option value="CSE">CSE</option>
              <option value="ECE">ECE</option>
              <option value="IT">IT</option>
            </select>

            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs"
            >
              <Download className="h-3.5 w-3.5" />
              Download
            </button>
          </div>
        </div>

        {/* ── Applicants Table ───────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      aria-label="Select all candidates"
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Roll No</th>
                  <th className="py-3 px-4">Branch</th>
                  <th className="py-3 px-4">CGPA</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        aria-label={`Select candidate ${c.name}`}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {c.name}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {c.rollNo}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{c.branch}</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                      {c.cgpa.toFixed(1)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          c.status === "Shortlisted"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => toggleShortlist(c.id)}
                          className="px-2.5 py-1 rounded text-xs font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          aria-label={`More options for ${c.name}`}
                          className="p-1 text-slate-400 hover:text-slate-600 rounded"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

