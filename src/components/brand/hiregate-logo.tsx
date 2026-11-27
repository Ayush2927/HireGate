import React from "react";

interface HireGateLogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "light" | "dark";
}

export function HireGateLogo({
  size = "md",
  variant = "dark",
}: HireGateLogoProps) {
  const boxSize =
    size === "sm" ? "h-7 w-7" : size === "lg" ? "h-9 w-9" : "h-8 w-8";
  const textSize =
    size === "sm" ? "text-base" : size === "lg" ? "text-xl" : "text-lg";
  const textColor = variant === "light" ? "text-white" : "text-[#0F172A]";

  return (
    <span className="inline-flex items-center gap-2.5 select-none">
      <span
        className={`${boxSize} flex items-center justify-center rounded-lg bg-[#2563EB] text-white shadow-xs`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-4/6 w-4/6"
          aria-hidden="true"
        >
          <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
          <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" opacity="0.85" />
          <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" opacity="0.85" />
          <path d="M15.5 13.5h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2z" />
        </svg>
      </span>
      <span className={`${textSize} font-bold tracking-tight ${textColor}`}>
        HireGate
      </span>
    </span>
  );
}

