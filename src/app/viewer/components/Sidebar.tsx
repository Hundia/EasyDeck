"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  className?: string;
  onNavigate?: () => void;
}

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
}

const iconClassName = "h-5 w-5 flex-none";

const navItems: NavItem[] = [
  {
    href: "/viewer",
    label: "Dashboard",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClassName}>
        <path d="M3 12.5 12 4l9 8.5" />
        <path d="M6 10.5V20h12v-9.5" />
      </svg>
    ),
  },
  {
    href: "/viewer/architecture",
    label: "Architecture",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClassName}>
        <rect x="4" y="4" width="6" height="6" rx="1.5" />
        <rect x="14" y="4" width="6" height="6" rx="1.5" />
        <rect x="9" y="14" width="6" height="6" rx="1.5" />
        <path d="M7 10v2a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2" />
      </svg>
    ),
  },
  {
    href: "/viewer/flows",
    label: "Flows",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClassName}>
        <path d="M5 6h8" />
        <path d="m10 3 3 3-3 3" />
        <path d="M19 18H11" />
        <path d="m14 15-3 3 3 3" />
        <path d="M7 6v12" />
        <path d="M17 6v12" />
      </svg>
    ),
  },
  {
    href: "/viewer/docs",
    label: "Docs",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClassName}>
        <path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H19v16H7.5A2.5 2.5 0 0 0 5 21.5z" />
        <path d="M8 7h7" />
        <path d="M8 11h7" />
      </svg>
    ),
  },
  {
    href: "/viewer/sprints",
    label: "Sprints",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClassName}>
        <rect x="3" y="5" width="18" height="16" rx="2.5" />
        <path d="M16 3v4" />
        <path d="M8 3v4" />
        <path d="M3 10h18" />
      </svg>
    ),
  },
  {
    href: "/viewer/schemas",
    label: "Schemas",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClassName}>
        <path d="m9 8-4 4 4 4" />
        <path d="m15 8 4 4-4 4" />
        <path d="M13 5 11 19" />
      </svg>
    ),
  },
  {
    href: "/viewer/modes",
    label: "Modes",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClassName}>
        <rect x="3" y="5" width="5" height="14" rx="1.5" />
        <rect x="10" y="5" width="4" height="14" rx="1.5" />
        <rect x="16" y="5" width="5" height="14" rx="1.5" />
      </svg>
    ),
  },
];

function isItemActive(pathname: string, href: string) {
  if (href === "/viewer") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({ className = "", onNavigate }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={`flex h-full flex-col rounded-[28px] border border-zinc-800/50 bg-zinc-900/50 p-4 backdrop-blur-xl ${className}`.trim()}>
      <div className="mb-6 rounded-2xl border border-zinc-800/60 bg-zinc-950/70 px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">Framework Viewer</p>
        <p className="mt-2 text-sm leading-6 text-zinc-300">Reference architecture, delivery map, and sprint progress in one polished shell.</p>
      </div>
      <nav aria-label="Viewer sections" className="flex-1 space-y-1.5">
        {navItems.map((item) => {
          const active = isItemActive(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              onClick={onNavigate}
              className={[
                "group flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm font-medium transition-all duration-200",
                active
                  ? "border-cyan-500/30 bg-gradient-to-r from-emerald-500/15 via-cyan-500/10 to-purple-500/15 text-zinc-50 shadow-lg shadow-cyan-500/5"
                  : "border-transparent text-zinc-400 hover:-translate-y-0.5 hover:border-zinc-700/40 hover:bg-zinc-800/50 hover:text-zinc-100",
              ].join(" ")}
            >
              <span className={active ? "text-cyan-300" : "text-zinc-500 transition-colors group-hover:text-cyan-300"}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-6 rounded-2xl border border-zinc-800/60 bg-gradient-to-br from-zinc-900 to-zinc-950 px-4 py-4">
        <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Runtime status</p>
        <div className="mt-3 flex items-center gap-2 text-sm text-zinc-300">
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.8)]" />
          <span>Static export ready</span>
        </div>
      </div>
    </aside>
  );
}
