"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import {
  GraduationCap,
  Building2,
  Briefcase,
  Users,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  UserCheck,
  SlidersHorizontal,
  Activity,
  ClipboardCheck,
  AlertCircle,
} from "lucide-react";
import { HireGateLogo } from "@/components/brand/hiregate-logo";

type RoleType = "STUDENT" | "ADMIN" | "RECRUITER" | "COORDINATOR";

interface RoleConfig {
  id: RoleType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  email: string;
  targetRoute: string;
}

const ROLES: RoleConfig[] = [
  {
    id: "STUDENT",
    label: "Student",
    icon: GraduationCap,
    email: "ayush@college.edu",
    targetRoute: "/student/dashboard",
  },
  {
    id: "ADMIN",
    label: "Admin / TPO",
    icon: Building2,
    email: "tpo.admin@college.edu",
    targetRoute: "/admin/dashboard",
  },
  {
    id: "RECRUITER",
    label: "Recruiter",
    icon: Briefcase,
    email: "recruiter@google.com",
    targetRoute: "/recruiter/dashboard",
  },
  {
    id: "COORDINATOR",
    label: "Coordinator",
    icon: Users,
    email: "coordinator@college.edu",
    targetRoute: "/coordinator/dashboard",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<RoleType>("STUDENT");
  const [email, setEmail] = useState("ayush@college.edu");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRoleSelect = (role: RoleConfig) => {
    setSelectedRole(role.id);
    setEmail(role.email);
    setErrorMsg(null);
  };

  const ROLE_ROUTES: Record<RoleType, string> = {
    STUDENT: "/student/dashboard",
    ADMIN: "/admin/dashboard",
    RECRUITER: "/recruiter/dashboard",
    COORDINATOR: "/coordinator/dashboard",
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.includes("@") || !email.includes(".")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (!res || res.error) {
      setErrorMsg("Invalid email or password.");
      setIsLoading(false);
      return;
    }

    const session = await getSession();
    const dbRole = (session?.user as { role?: RoleType } | undefined)?.role;
    const destination = dbRole ? ROLE_ROUTES[dbRole] : "/student/dashboard";

    router.push(destination);
    router.refresh();
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white text-[#0F172A] font-sans">
      {/* ── Left Pane: Crisp Sign In Form ─────────────────────────────── */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-14 lg:px-20 py-12">
        <div className="w-full max-w-md mx-auto">
          <Link href="/" className="inline-block">
            <HireGateLogo size="lg" variant="dark" />
          </Link>

          <div className="mt-10">
            <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
              Welcome Back
            </h1>
            <p className="text-sm text-slate-500 mt-1.5">
              Sign in to access your placement portal
            </p>
          </div>

          {/* 4-Pill Demo Role Switcher matching reference UI */}
          <div className="mt-7 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {ROLES.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.id;
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => handleRoleSelect(role)}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-2.5 rounded-lg text-xs font-semibold border transition ${
                    isSelected
                      ? "bg-[#2563EB] text-white border-[#2563EB] shadow-xs"
                      : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{role.label}</span>
                </button>
              );
            })}
          </div>

          {errorMsg && (
            <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSignIn} noValidate className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Institutional Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@college.edu"
                  className="w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-blue-600/15 transition"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-lg border border-slate-200 bg-white pl-10 pr-10 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-blue-600/15 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 rounded border-slate-300 text-[#2563EB] focus:ring-blue-500"
                />
                Remember me
              </label>
              <Link
                href="/forgot-password"
                className="font-semibold text-[#2563EB] hover:text-blue-700 transition"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#2563EB] py-2.5 px-4 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 transition disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-[#2563EB] hover:underline"
            >
              Register
            </Link>
          </p>
        </div>
      </div>

      {/* ── Right Pane: Dark Navy Campus Architecture Panel ───────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#0B1120] text-white flex-col justify-center px-14 xl:px-20 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{
            backgroundImage: "url('/images/campus-bg.jpg')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#0B1120]/95 via-[#0B1120]/82 to-[#0B1120]/65" />

        <div className="relative z-10 max-w-md space-y-9">
          <h2 className="text-4xl font-extrabold tracking-tight leading-[1.14] text-white">
            One Platform.
            <br />
            Four Stakeholders.
            <br />
            A Better Placement
            <br />
            <span className="text-[#3B82F6]">Experience.</span>
          </h2>

          <div className="space-y-4">
            {[
              { icon: UserCheck, text: "Verified Student Profiles" },
              { icon: SlidersHorizontal, text: "Dynamic Eligibility Engine" },
              { icon: Activity, text: "Real-time Application Tracking" },
              { icon: ClipboardCheck, text: "Interview & Offer Management" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.text} className="flex items-center gap-3.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 border border-white/15 text-slate-200 backdrop-blur-xs shrink-0">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-slate-200">
                    {item.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
