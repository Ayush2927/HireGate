"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { signOutAction } from "@/server/actions/auth.actions";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  User,
  Award,
  BookOpen,
  Users,
  Building,
  BarChart3,
  ShieldAlert,
  Settings,
  CalendarCheck,
  CheckCircle,
  TrendingUp,
  Megaphone,
  ShieldCheck,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

export type UserRole = "STUDENT" | "ADMIN" | "RECRUITER" | "COORDINATOR";

export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const ROLE_NAV_CONFIG: Record<
  UserRole,
  {
    portalTitle: string;
    items: NavItem[];
    defaultUser: {
      name: string;
      roleLabel: string;
      email: string;
      avatarText: string;
    };
  }
> = {
  STUDENT: {
    portalTitle: "Student Portal",
    items: [
      { title: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
      { title: "Placement Drives", href: "/student/drives", icon: Briefcase },
      { title: "My Applications", href: "/student/applications", icon: FileText },
      { title: "Academic Passport", href: "/student/profile", icon: User },
      { title: "Placement Status", href: "/student/placement", icon: Award },
      { title: "Resources", href: "/student/resources", icon: BookOpen },
      { title: "Settings", href: "/student/settings", icon: Settings },
    ],
    defaultUser: {
      name: "Ayush Mahapatro",
      roleLabel: "B.Tech CSE • 2026",
      email: "ayush@college.edu",
      avatarText: "AM",
    },
  },
  ADMIN: {
    portalTitle: "TPO Portal",
    items: [
      { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
      { title: "Students", href: "/admin/students", icon: Users },
      { title: "Verification Desk", href: "/admin/students/verify", icon: ShieldCheck },
      { title: "Placement Drives", href: "/admin/drives", icon: Briefcase },
      { title: "Companies", href: "/admin/companies", icon: Building },
      { title: "Applications", href: "/admin/applications", icon: FileText },
      { title: "Reports", href: "/admin/reports", icon: BarChart3 },
      { title: "Audit Logs", href: "/admin/audit-logs", icon: ShieldAlert },
      { title: "Settings", href: "/admin/settings", icon: Settings },
    ],
    defaultUser: {
      name: "Dr. Priya Sharma",
      roleLabel: "Training & Placement Officer",
      email: "tpo.admin@college.edu",
      avatarText: "PS",
    },
  },
  RECRUITER: {
    portalTitle: "Recruiter Portal",
    items: [
      { title: "Dashboard", href: "/recruiter/dashboard", icon: LayoutDashboard },
      { title: "My Drives", href: "/recruiter/drives", icon: Briefcase },
      { title: "Applicants", href: "/recruiter/applicants", icon: Users },
      { title: "Shortlisted", href: "/recruiter/shortlisted", icon: CheckCircle },
      { title: "Interviews", href: "/recruiter/interviews", icon: CalendarCheck },
      { title: "Feedback", href: "/recruiter/feedback", icon: FileText },
      { title: "Company Profile", href: "/recruiter/company", icon: Building },
    ],
    defaultUser: {
      name: "Rajiv Mehta",
      roleLabel: "Talent Acquisition",
      email: "recruiter@google.com",
      avatarText: "RM",
    },
  },
  COORDINATOR: {
    portalTitle: "Coordinator Portal",
    items: [
      { title: "Dashboard", href: "/coordinator/dashboard", icon: LayoutDashboard },
      { title: "Assigned Drives", href: "/coordinator/drives", icon: Briefcase },
      { title: "Interview Rounds", href: "/coordinator/rounds", icon: CalendarCheck },
      { title: "Attendance", href: "/coordinator/attendance", icon: Users },
      { title: "Candidate Progress", href: "/coordinator/candidates", icon: TrendingUp },
      { title: "Results", href: "/coordinator/results", icon: CheckCircle },
      { title: "Announcements", href: "/coordinator/announcements", icon: Megaphone },
    ],
    defaultUser: {
      name: "Sneha Choudhary",
      roleLabel: "Placement Coordinator",
      email: "coordinator@college.edu",
      avatarText: "SC",
    },
  },
};

interface SidebarProps {
  currentRole: UserRole;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({
  currentRole,
  collapsed = false,
  onToggleCollapse,
  mobileOpen = false,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const config = ROLE_NAV_CONFIG[currentRole];
  const displayName = session?.user?.name || config.defaultUser.name;
  const displaySubtext = session?.user?.email || config.defaultUser.roleLabel;
  const avatarText = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || config.defaultUser.avatarText;

  const isNavActive = (href: string) => {
    if (pathname === href) return true;
    // Handle nested dynamic routes (e.g. /student/drives/drive-google highlights /student/drives)
    if (
      href !== "/student/dashboard" &&
      href !== "/admin/dashboard" &&
      href !== "/recruiter/dashboard" &&
      href !== "/coordinator/dashboard" &&
      href !== "/admin/students" &&
      pathname.startsWith(href + "/")
    ) {
      return true;
    }
    // Legacy alias routes
    if (pathname === "/drives" && href === "/student/dashboard") return true;
    if (pathname === "/profile" && href === "/student/profile") return true;
    if (pathname === "/applications" && href === "/student/applications") return true;
    return false;
  };

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between bg-[#101827] text-slate-300 select-none">
      {/* ── Top: Brand & Collapse Control ─────────────────────────────── */}
      <div>
        <div className="h-14 px-4 flex items-center justify-between border-b border-slate-800/80">
          <Link href="/" className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563EB] text-white shadow-sm shrink-0">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <div className="text-[16px] font-bold tracking-tight text-white leading-none">
                  HireGate
                </div>
                <div className="text-[11px] font-medium text-slate-400 mt-0.5 truncate">
                  {config.portalTitle}
                </div>
              </div>
            )}
          </Link>

          {/* Desktop collapse button */}
          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="hidden lg:flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-slate-800 hover:text-white transition"
            >
              {collapsed ? (
                <ChevronRight className="h-3.5 w-3.5" />
              ) : (
                <ChevronLeft className="h-3.5 w-3.5" />
              )}
            </button>
          )}

          {/* Mobile close button */}
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Close navigation menu"
              className="lg:hidden flex h-7 w-7 items-center justify-center rounded text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* ── Navigation Links ────────────────────────────────────────── */}
        <nav className="px-2.5 py-4 space-y-1 overflow-y-auto">
          {config.items.map((item) => {
            const Icon = item.icon;
            const active = isNavActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                title={collapsed ? item.title : undefined}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                  active
                    ? "bg-[#2563EB]/15 text-white font-semibold border border-[#2563EB]/30"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 border border-transparent"
                } ${collapsed ? "justify-center px-2" : ""}`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${
                    active ? "text-blue-400" : "text-slate-400"
                  }`}
                />
                {!collapsed && <span className="truncate">{item.title}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* ── Bottom: User Profile & Logout ─────────────────────────────── */}
      <div className="p-3 border-t border-slate-800/80 space-y-2">
        <div
          className={`flex items-center gap-2.5 p-2 rounded-lg bg-slate-900/50 border border-slate-800/70 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2563EB] text-white text-xs font-bold shrink-0">
            {avatarText}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white truncate">
                {displayName}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {displaySubtext}
              </div>
            </div>
          )}
        </div>

        <form action={signOutAction}>
          <button
            type="submit"
            title="Sign out"
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition ${
              collapsed ? "justify-center px-2" : ""
            }`}
          >
            <LogOut className="h-3.5 w-3.5 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:block shrink-0 border-r border-slate-800/80 transition-all duration-200 ${
          collapsed ? "w-[68px]" : "w-60"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <aside className="relative z-10 w-64 max-w-[80vw] h-full shadow-2xl">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
