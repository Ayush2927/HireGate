"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { signOutAction } from "@/server/actions/auth.actions";
import {
  Search,
  Bell,
  Menu,
  ChevronRight,
  LogOut,
  User,
  Settings,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { ROLE_NAV_CONFIG, UserRole } from "./sidebar";

interface HeaderProps {
  currentRole: UserRole;
  pageTitle?: string;
  searchPlaceholder?: string;
  onOpenMobileMenu?: () => void;
}

const ROLE_PLACEHOLDERS: Record<UserRole, string> = {
  STUDENT: "Search companies, roles or skills...",
  ADMIN: "Search students, drives, companies...",
  RECRUITER: "Search candidates, skills, or drives...",
  COORDINATOR: "Search rounds, students, roll no...",
};

const ROLE_ROUTES: Record<UserRole, string> = {
  STUDENT: "/student/dashboard",
  ADMIN: "/admin/dashboard",
  RECRUITER: "/recruiter/dashboard",
  COORDINATOR: "/coordinator/dashboard",
};

const DEMO_NOTIFICATIONS = [
  {
    id: "n1",
    title: "Google — Online Assessment",
    description: "Shortlist released for Round 1. Check schedule.",
    time: "12m ago",
    unread: true,
  },
  {
    id: "n2",
    title: "Academic Passport Verified",
    description: "Your CGPA (8.74) was locked by Dr. Priya Sharma.",
    time: "2h ago",
    unread: true,
  },
  {
    id: "n3",
    title: "Microsoft SDE Intern",
    description: "Application deadline closes in 2d 14h.",
    time: "1d ago",
    unread: false,
  },
];

function getBreadcrumbs(pathname: string, role: UserRole): string[] {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return [ROLE_NAV_CONFIG[role].portalTitle];
  return segments.map((seg) =>
    seg
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

export function Header({
  currentRole,
  pageTitle,
  searchPlaceholder,
  onOpenMobileMenu,
}: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const fallbackUser = ROLE_NAV_CONFIG[currentRole].defaultUser;
  const displayName = session?.user?.name || fallbackUser.name;
  const displayEmail = session?.user?.email || fallbackUser.email;
  const avatarText =
    displayName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || fallbackUser.avatarText;
  const user = {
    ...fallbackUser,
    name: displayName,
    email: displayEmail,
    avatarText,
  };
  const placeholder = searchPlaceholder ?? ROLE_PLACEHOLDERS[currentRole];
  const breadcrumbs = getBreadcrumbs(pathname, currentRole);

  const handlePortalSwitch = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextRole = e.target.value as UserRole;
    router.push(ROLE_ROUTES[nextRole]);
  };

  return (
    <header className="h-14 border-b border-[#E2E8F0] bg-white px-4 lg:px-6 flex items-center justify-between gap-4 shrink-0 relative z-30">
      {/* ── Left: Mobile Menu + Breadcrumbs + Search ───────────────────── */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label="Open navigation menu"
            className="lg:hidden flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            <Menu className="h-4 w-4" />
          </button>
        )}

        {/* Breadcrumb / Page Title */}
        <div className="hidden xl:flex items-center gap-1.5 text-xs text-slate-500 shrink-0 pr-2 border-r border-slate-200">
          {pageTitle ? (
            <span className="font-semibold text-slate-800">{pageTitle}</span>
          ) : (
            breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={`${crumb}-${idx}`}>
                {idx > 0 && <ChevronRight className="h-3 w-3 text-slate-400" />}
                <span
                  className={
                    idx === breadcrumbs.length - 1
                      ? "font-semibold text-slate-900"
                      : "text-slate-500"
                  }
                >
                  {crumb}
                </span>
              </React.Fragment>
            ))
          )}
        </div>

        {/* Search Input */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder={placeholder}
              className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] pl-8 pr-3 py-1.5 text-xs text-[#0F172A] placeholder:text-[#64748B] focus:border-[#2563EB] focus:bg-white focus:outline-none transition"
            />
          </div>
        </div>
      </div>

      {/* ── Right: Role Switcher, Notifications, Avatar Dropdown ───────── */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Demo Role Switcher */}
        <select
          aria-label="Switch active demo portal"
          value={currentRole}
          onChange={handlePortalSwitch}
          className="hidden sm:block text-xs font-medium text-slate-700 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-2.5 py-1.5 hover:border-slate-300 focus:border-[#2563EB] focus:outline-none cursor-pointer"
        >
          <option value="STUDENT">Student Portal</option>
          <option value="ADMIN">Admin / TPO Portal</option>
          <option value="RECRUITER">Recruiter Portal</option>
          <option value="COORDINATOR">Coordinator Portal</option>
        </select>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setNotifOpen((o) => !o);
              setProfileOpen(false);
            }}
            aria-label="Notifications"
            className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#F43F5E] ring-2 ring-white" />
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-[#E2E8F0] bg-white shadow-lg overflow-hidden z-50">
              <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">
                  Notifications
                </span>
                <span className="text-[10px] font-semibold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-full">
                  2 Unread
                </span>
              </div>
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {DEMO_NOTIFICATIONS.map((n) => (
                  <div
                    key={n.id}
                    className="p-3 hover:bg-slate-50 transition flex items-start gap-2.5"
                  >
                    {n.unread ? (
                      <CheckCircle2 className="h-4 w-4 text-[#2563EB] shrink-0 mt-0.5" />
                    ) : (
                      <Clock className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-slate-900">
                        {n.title}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {n.description}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 font-mono">
                        {n.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar & Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setProfileOpen((o) => !o);
              setNotifOpen(false);
            }}
            aria-label="User menu"
            className="flex items-center gap-2 rounded-lg p-1 hover:bg-slate-100 transition"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2563EB] text-white text-xs font-bold shadow-2xs">
              {user.avatarText}
            </div>
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-[#E2E8F0] bg-white shadow-lg overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-slate-100">
                <div className="text-xs font-bold text-slate-900">
                  {user.name}
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  {user.email}
                </div>
                <div className="text-[10px] font-semibold text-[#2563EB] mt-1">
                  {ROLE_NAV_CONFIG[currentRole].portalTitle}
                </div>
              </div>
              <div className="p-1.5 space-y-0.5 text-xs">
                <Link
                  href={
                    currentRole === "STUDENT"
                      ? "/student/profile"
                      : currentRole === "ADMIN"
                      ? "/admin/settings"
                      : currentRole === "RECRUITER"
                      ? "/recruiter/company"
                      : "/coordinator/dashboard"
                  }
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  <User className="h-3.5 w-3.5 text-slate-400" />
                  Profile
                </Link>
                <Link
                  href={
                    currentRole === "STUDENT"
                      ? "/student/settings"
                      : currentRole === "ADMIN"
                      ? "/admin/settings"
                      : ROLE_ROUTES[currentRole]
                  }
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  <Settings className="h-3.5 w-3.5 text-slate-400" />
                  Settings
                </Link>
                <div className="border-t border-slate-100 my-1" />
                <form action={signOutAction}>
                  <button
                    type="submit"
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 font-medium"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign Out
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
