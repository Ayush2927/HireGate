"use client";

import React, { Suspense, useState } from "react";
import { Sidebar, UserRole } from "./sidebar";
import { Header } from "./header";

interface AppShellProps {
  children: React.ReactNode;
  initialRole?: UserRole;
  pageTitle?: string;
  searchPlaceholder?: string;
}

export function AppShell({
  children,
  initialRole = "STUDENT",
  pageTitle,
  searchPlaceholder,
}: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F8FAFC] text-[#0F172A] font-sans">
      {/* ── Left Navigation Rail (Desktop & Mobile Drawer) ────────────── */}
      <Suspense fallback={<div className="hidden lg:block w-60 bg-[#101827] shrink-0" />}>
        <Sidebar
          currentRole={initialRole}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((c) => !c)}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />
      </Suspense>

      {/* ── Right Content Area ────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header
          currentRole={initialRole}
          pageTitle={pageTitle}
          searchPlaceholder={searchPlaceholder}
          onOpenMobileMenu={() => setMobileOpen(true)}
        />

        {/* Dynamic Page Scroll Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
