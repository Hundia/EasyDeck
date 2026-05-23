"use client";

import type { ReactNode } from "react";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-3xl border border-zinc-800/50 bg-zinc-900/50 p-6 backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-700/40 hover:bg-zinc-800/50 hover:shadow-lg hover:shadow-emerald-500/5">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
      <div className="relative space-y-4">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-700/30 bg-gradient-to-br from-zinc-900 to-zinc-800 text-cyan-400 shadow-lg shadow-black/20">
          {icon}
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-zinc-100">{title}</h3>
          <p className="text-sm leading-6 text-zinc-400">{description}</p>
        </div>
      </div>
    </article>
  );
}
