import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HireGate — Placement Drive Management System",
  description: "Enterprise campus recruitment portal with dynamic eligibility rules, transactional applications, and audit logs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className={`${geistSans.className} min-h-full flex flex-col font-sans antialiased text-slate-900 bg-[#f8fafc]`}>
        <Providers>
          <Suspense fallback={<div className="min-h-screen bg-[#f8fafc]" />}>
            {children}
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}
