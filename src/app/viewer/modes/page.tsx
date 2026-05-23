"use client";

interface ModeCard {
  name: string;
  accent: string;
  accentText: string;
  bulletDot: string;
  border: string;
  howItWorks: string;
  bestFor: string;
  traits: string[];
  flow: string[];
  snippet: "section" | "snap" | "scrub";
}

const modeCards: ModeCard[] = [
  {
    name: "Section Mode",
    accent: "from-purple-500/80 via-fuchsia-400/60 to-cyan-400/40",
    accentText: "text-purple-200",
    bulletDot: "bg-purple-300",
    border: "border-purple-400/25",
    howItWorks:
      "One gesture = one scene transition. GSAP Observer captures wheel/touch/key, triggers a tween across the frame range.",
    bestFor: "Guided, presentation-style storytelling",
    traits: ["Observer-driven (no scroll bar)", "Lenis PAUSED", "Frame continuity enforced", "Direction locking"],
    flow: ["Gesture", "Observer", "Tween", "Frames"],
    snippet: "section",
  },
  {
    name: "Snap Mode",
    accent: "from-cyan-500/80 via-sky-400/60 to-emerald-400/40",
    accentText: "text-cyan-200",
    bulletDot: "bg-cyan-300",
    border: "border-cyan-400/25",
    howItWorks:
      "Continuous scroll with magnetic snapping to scene boundaries. ScrollTrigger scrubs progress, labelsDirectional provides the snap.",
    bestFor: "Explorable stories with natural settling",
    traits: ["ScrollTrigger with snap", "Lenis ACTIVE (smooth)", "Labels at scene boundaries", "Supports scrubbing between snaps"],
    flow: ["Scroll", "Lenis", "ScrollTrigger", "Snap", "Frames"],
    snippet: "snap",
  },
  {
    name: "Scrub Mode",
    accent: "from-emerald-500/80 via-teal-400/60 to-cyan-400/40",
    accentText: "text-emerald-200",
    bulletDot: "bg-emerald-300",
    border: "border-emerald-400/25",
    howItWorks: "Direct 1:1 mapping between scroll position and frame progress. No snapping, purely continuous.",
    bestFor: "Long visual reveals, parallax, reduced-motion fallback",
    traits: ["ScrollTrigger scrub:true", "Lenis ACTIVE (smooth)", "Linear progress", "Reduced-motion default"],
    flow: ["Scroll", "Lenis", "ScrollTrigger", "Linear", "Frames"],
    snippet: "scrub",
  },
];

const comparisonRows = [
  { feature: "Scroll Bar", section: "Hidden", snap: "Visible", scrub: "Visible" },
  { feature: "Lenis", section: "Paused", snap: "Active", scrub: "Active" },
  { feature: "Gesture", section: "Observer", snap: "Native + Snap", scrub: "Native" },
  { feature: "Frame mapping", section: "Tween", snap: "Progress + Snap", scrub: "Linear" },
  { feature: "Best for", section: "Presentations", snap: "Exploration", scrub: "Reveals" },
] as const;

function CodeSnippet({ mode }: { mode: ModeCard["snippet"] }) {
  return (
    <pre className="overflow-x-auto rounded-2xl border border-zinc-800/60 bg-zinc-950/90 px-4 py-3 text-sm leading-7 text-zinc-100">
      <code>
        <span className="text-purple-300">{"<Stage"}</span>
        <span className="text-zinc-200"> story={'{'}story{'}'} mode=</span>
        <span className="text-emerald-300">&quot;{mode}&quot;</span>
        <span className="text-purple-300"> {"/>"}</span>
      </code>
    </pre>
  );
}

function FlowDiagram({ flow, accentText }: Pick<ModeCard, "flow" | "accentText">) {
  return (
    <div className="rounded-3xl border border-zinc-800/60 bg-zinc-950/70 p-4">
      <div className="flex flex-wrap items-center gap-2">
        {flow.map((step, index) => (
          <div key={step} className="flex items-center gap-2">
            <div className={`viewer-flow-step rounded-2xl border border-zinc-800/60 bg-zinc-900/80 px-3 py-2 text-sm font-medium text-zinc-100 ${accentText}`} style={{ animationDelay: `${index * 120}ms` }}>
              {step}
            </div>
            {index < flow.length - 1 ? <span className="viewer-flow-arrow text-zinc-500">→</span> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ViewerModesPage() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 lg:gap-10">
      <section className="relative overflow-hidden rounded-[32px] border border-zinc-800/50 bg-zinc-900/50 px-6 py-10 backdrop-blur-xl sm:px-8 lg:px-10 lg:py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.16),transparent_34%)]" />
        <div className="pointer-events-none absolute inset-0 viewer-grid opacity-35" />
        <div className="relative max-w-3xl">
          <span className="inline-flex rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
            Runtime behavior
          </span>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-zinc-50 sm:text-5xl lg:text-6xl">Transition Modes</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg">
            Pick section when you want guided control, snap for magnetic exploration, and scrub for pure continuous progress across long frame ranges.
          </p>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-3">
        {modeCards.map((mode, modeIndex) => (
          <article key={mode.name} className={`relative overflow-hidden rounded-[32px] border ${mode.border} bg-zinc-900/50 p-6 backdrop-blur-xl shadow-2xl shadow-black/20`}>
            <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${mode.accent} viewer-timeline-line`} />
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-zinc-50">{mode.name}</h2>
                <p className="mt-4 text-sm font-semibold uppercase tracking-[0.24em] text-zinc-500">How it works</p>
                <p className="mt-2 text-sm leading-6 text-zinc-300">{mode.howItWorks}</p>
              </div>

              <div className="rounded-3xl border border-zinc-800/60 bg-zinc-950/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">Best for</p>
                <p className={`mt-2 text-sm font-medium ${mode.accentText}`}>{mode.bestFor}</p>
              </div>

              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-500">Key traits</p>
                <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                  {mode.traits.map((trait) => (
                    <li key={trait} className="flex items-start gap-3 rounded-2xl border border-zinc-800/50 bg-zinc-950/60 px-3 py-3">
                      <span className={`mt-1 h-2 w-2 rounded-full ${mode.bulletDot}`} />
                      <span>{trait}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-zinc-500">Flow</p>
                <FlowDiagram flow={mode.flow} accentText={mode.accentText} />
              </div>

              <div>
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-zinc-500">API</p>
                <CodeSnippet mode={mode.snippet} />
              </div>
            </div>
            <div className="pointer-events-none absolute -bottom-12 right-0 h-32 w-32 rounded-full bg-white/5 blur-3xl" style={{ opacity: 0.5 + modeIndex * 0.1 }} />
          </article>
        ))}
      </section>

      <section className="rounded-[32px] border border-zinc-800/50 bg-zinc-900/50 p-6 backdrop-blur-xl sm:p-8">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-500">Decision matrix</p>
            <h2 className="mt-2 text-2xl font-semibold text-zinc-100">Comparison table</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-zinc-400">The same stage API can shift feel dramatically depending on who owns progress, snapping, and gesture capture.</p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-zinc-800/60 bg-zinc-950/70">
          <table className="min-w-full border-collapse text-sm text-zinc-200">
            <thead>
              <tr className="border-b border-zinc-800/70 bg-zinc-900/70 text-left text-xs uppercase tracking-[0.24em] text-zinc-500">
                <th className="px-4 py-4 font-semibold">Feature</th>
                <th className="px-4 py-4 font-semibold text-purple-200">Section</th>
                <th className="px-4 py-4 font-semibold text-cyan-200">Snap</th>
                <th className="px-4 py-4 font-semibold text-emerald-200">Scrub</th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row) => (
                <tr key={row.feature} className="border-b border-zinc-800/60 last:border-b-0">
                  <th scope="row" className="bg-zinc-900/40 px-4 py-4 text-left font-medium text-zinc-100">{row.feature}</th>
                  <td className="bg-purple-500/6 px-4 py-4">{row.section}</td>
                  <td className="bg-cyan-500/6 px-4 py-4">{row.snap}</td>
                  <td className="bg-emerald-500/6 px-4 py-4">{row.scrub}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
