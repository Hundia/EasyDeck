"use client";

interface Sprint {
  number: number;
  title: string;
  tests: number;
  files: number;
  status: "complete" | "active";
}

const sprints: Sprint[] = [
  { number: 1, title: "Next.js Bootstrap + Schema Layer", tests: 33, files: 12, status: "complete" },
  { number: 2, title: "Canvas Engine & Playhead", tests: 63, files: 8, status: "complete" },
  { number: 3, title: "Section Mode — Observer-driven", tests: 86, files: 10, status: "complete" },
  { number: 4, title: "Snap Mode — ScrollTrigger + Snap", tests: 108, files: 7, status: "complete" },
  { number: 5, title: "Scrub Mode & Stage Switcher", tests: 124, files: 9, status: "complete" },
  { number: 6, title: "Lenis Integration & Smoothing", tests: 141, files: 8, status: "complete" },
  { number: 7, title: "Accessibility & UX Polish", tests: 170, files: 11, status: "complete" },
  { number: 8, title: "Agent Pipeline — NarrativeDesigner + SceneComposer", tests: 235, files: 9, status: "complete" },
  { number: 9, title: "Integration Testing & QA", tests: 255, files: 14, status: "complete" },
  { number: 10, title: "Framework Viewer & Documentation App", tests: 0, files: 0, status: "active" },
];

const cumulativeTests = sprints.reduce<number[]>((totals, sprint) => {
  const previous = totals[totals.length - 1] ?? 0;
  totals.push(previous + sprint.tests);
  return totals;
}, []);

const summaryStats = [
  { value: "9", label: "Sprints Complete", accent: "from-emerald-400/25 via-emerald-400/10 to-transparent" },
  { value: "255+", label: "Tests", accent: "from-cyan-400/25 via-cyan-400/10 to-transparent" },
  { value: "~100", label: "Files", accent: "from-purple-400/25 via-purple-400/10 to-transparent" },
] as const;

function SprintStatus({ status }: Pick<Sprint, "status">) {
  if (status === "active") {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-amber-200">
        <span className="h-2.5 w-2.5 rounded-full bg-amber-300 viewer-status-pulse" />
        In progress
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200">
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
        <path d="m4 10 4 4 8-8" />
      </svg>
      Complete
    </div>
  );
}

export default function ViewerSprintsPage() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 lg:gap-10">
      <section className="relative overflow-hidden rounded-[32px] border border-zinc-800/50 bg-zinc-900/50 px-6 py-10 backdrop-blur-xl sm:px-8 lg:px-10 lg:py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.14),transparent_34%)]" />
        <div className="pointer-events-none absolute inset-0 viewer-grid opacity-35" />
        <div className="relative flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-purple-300">
              Delivery arc
            </span>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-zinc-50 sm:text-5xl lg:text-6xl">Sprint Timeline</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg">
              10 delivery checkpoints from bootstrap to the framework viewer, showing how testing depth and surface area grew sprint by sprint.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[460px] xl:max-w-[480px] xl:flex-1">
            {summaryStats.map((stat) => (
              <article key={stat.label} className="relative overflow-hidden rounded-3xl border border-zinc-800/60 bg-zinc-950/70 px-5 py-5 shadow-2xl shadow-black/20">
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.accent}`} />
                <div className="relative">
                  <p className="text-3xl font-semibold text-zinc-50">{stat.value}</p>
                  <p className="mt-1 text-sm text-zinc-400">{stat.label}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-zinc-800/50 bg-zinc-900/45 p-6 backdrop-blur-xl sm:p-8">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-500">Velocity signal</p>
            <h2 className="mt-2 text-2xl font-semibold text-zinc-100">Cumulative test growth</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-zinc-400">Each bar captures the running total of shipped tests, making the expanding safety net visible at a glance.</p>
        </div>

        <div className="grid grid-cols-5 gap-3 sm:grid-cols-10">
          {cumulativeTests.map((total, index) => {
            const height = Math.max(16, Math.round((total / cumulativeTests[cumulativeTests.length - 1]) * 100));

            return (
              <div key={sprints[index]?.number} className="rounded-3xl border border-zinc-800/50 bg-zinc-950/70 p-3">
                <div className="flex h-32 items-end justify-center rounded-2xl border border-zinc-800/40 bg-zinc-900/60 p-2">
                  <div
                    className="w-full rounded-full bg-gradient-to-t from-purple-500 via-cyan-400 to-emerald-400 viewer-timeline-line"
                    style={{ height: `${height}%` }}
                    aria-hidden="true"
                  />
                </div>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Sprint {sprints[index]?.number}</p>
                <p className="mt-1 text-sm text-zinc-300">{total} total</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="relative rounded-[32px] border border-zinc-800/50 bg-zinc-900/45 p-6 backdrop-blur-xl sm:p-8 lg:p-10">
        <div className="mb-8 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-500">Execution trail</p>
          <h2 className="mt-2 text-2xl font-semibold text-zinc-100 sm:text-3xl">From schema contracts to a premium viewer shell</h2>
        </div>

        <div className="pointer-events-none absolute bottom-8 left-[30px] top-28 w-px bg-gradient-to-b from-purple-400 via-cyan-400 to-emerald-400 viewer-timeline-line md:left-1/2 md:-ml-px" />

        <div className="space-y-6 md:space-y-8">
          {sprints.map((sprint, index) => {
            const isLeft = index % 2 === 0;
            const isActive = sprint.status === "active";

            return (
              <article
                key={sprint.number}
                className="grid gap-4 md:grid-cols-[minmax(0,1fr)_80px_minmax(0,1fr)] md:items-center"
              >
                <div className={[isLeft ? "md:col-start-1" : "md:col-start-3", "md:row-start-1"].join(" ")}>
                  <div
                    className={[
                      "viewer-fade-up relative rounded-[28px] border border-zinc-800/60 bg-zinc-950/75 p-5 shadow-2xl shadow-black/20 transition-all duration-300 hover:-translate-y-1 hover:border-zinc-700/70 sm:p-6",
                      isActive ? "viewer-active-glow border-amber-400/30" : "",
                    ].join(" ")}
                    style={{ animationDelay: `${index * 120}ms` }}
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="inline-flex rounded-full border border-zinc-700/70 bg-zinc-900/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-zinc-300">
                        Sprint {sprint.number}
                      </span>
                      <SprintStatus status={sprint.status} />
                    </div>
                    <h3 className="mt-4 text-xl font-semibold text-zinc-50">{sprint.title}</h3>
                    <div className="mt-5 flex flex-wrap gap-3">
                      <span className="inline-flex items-center rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-sm font-medium text-emerald-200">
                        {sprint.tests} tests
                      </span>
                      <span className="inline-flex items-center rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-sm font-medium text-cyan-200">
                        {sprint.files} files
                      </span>
                    </div>
                  </div>
                </div>

                <div className="relative flex items-center justify-center md:col-start-2 md:row-start-1">
                  <div className={`relative z-10 flex h-14 w-14 items-center justify-center rounded-full border text-sm font-semibold ${isActive ? "border-amber-300/60 bg-amber-400/15 text-amber-100 viewer-active-glow" : "border-purple-300/50 bg-zinc-950 text-zinc-100"}`}>
                    {sprint.number}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
