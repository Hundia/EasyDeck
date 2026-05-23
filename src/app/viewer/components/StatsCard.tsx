"use client";

interface StatsCardProps {
  value: string;
  label: string;
  accent: "emerald" | "cyan" | "amber" | "purple";
  subLabel?: string;
}

const accentStyles: Record<StatsCardProps["accent"], string> = {
  emerald: "text-emerald-400 bg-emerald-500/10 ring-emerald-500/20",
  cyan: "text-cyan-400 bg-cyan-500/10 ring-cyan-500/20",
  amber: "text-amber-400 bg-amber-500/10 ring-amber-500/20",
  purple: "text-purple-400 bg-purple-500/10 ring-purple-500/20",
};

export function StatsCard({ value, label, accent, subLabel }: StatsCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-3xl border border-zinc-800/50 bg-zinc-900/50 p-6 backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-700/50 hover:bg-zinc-800/50 hover:shadow-lg hover:shadow-black/20">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl">{value}</p>
          <p className="mt-2 text-sm font-medium text-zinc-200">{label}</p>
          {subLabel ? <p className="mt-1 text-xs text-zinc-500">{subLabel}</p> : null}
        </div>
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${accentStyles[accent]}`}>
          {value} {label}
        </span>
      </div>
    </article>
  );
}
