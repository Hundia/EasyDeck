"use client";

import Link from "next/link";
import { useState } from "react";
import { Sidebar } from "@/app/viewer/components/Sidebar";

export default function ViewerLayout({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      <div className="pointer-events-none absolute inset-0 viewer-radial opacity-70" />
      <div className="pointer-events-none absolute inset-0 viewer-grid opacity-40" />

      <div className="relative flex min-h-screen">
        <div className="hidden w-80 shrink-0 p-4 md:block lg:p-6">
          <div className="fixed inset-y-0 left-0 w-80 p-4 lg:p-6">
            <Sidebar className="shadow-2xl shadow-black/30" />
          </div>
        </div>

        <div className="flex min-h-screen flex-1 flex-col md:pl-4">
          <header className="sticky top-0 z-40 border-b border-zinc-800/50 bg-zinc-950/75 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-10">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-zinc-800/50 bg-zinc-900/60 text-zinc-100 transition-all duration-200 hover:bg-zinc-800/50 md:hidden"
                  onClick={() => setMobileNavOpen((value) => !value)}
                  aria-label="Toggle navigation"
                  aria-expanded={mobileNavOpen}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                    <path d="M4 7h16" />
                    <path d="M4 12h16" />
                    <path d="M4 17h16" />
                  </svg>
                </button>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.28em] text-zinc-500">EasyDeck</p>
                  <p className="text-sm text-zinc-300">Framework Viewer</p>
                </div>
              </div>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-2xl border border-zinc-800/50 bg-zinc-900/60 px-4 py-2 text-sm font-medium text-zinc-200 transition-all duration-200 hover:-translate-y-0.5 hover:bg-zinc-800/50 hover:text-zinc-50"
              >
                <span>Back to main site</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                  <path d="M5 12h14" />
                  <path d="m13 6 6 6-6 6" />
                </svg>
              </Link>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</main>
        </div>
      </div>

      <div className={`fixed inset-0 z-50 md:hidden ${mobileNavOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
        <button
          type="button"
          aria-label="Close navigation"
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200 ${mobileNavOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setMobileNavOpen(false)}
        />
        <div className={`absolute inset-y-0 left-0 w-[86vw] max-w-sm p-4 transition-transform duration-200 ${mobileNavOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <Sidebar className="shadow-2xl shadow-black/40" onNavigate={() => setMobileNavOpen(false)} />
        </div>
      </div>
    </div>
  );
}
