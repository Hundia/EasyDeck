"use client";

export interface FlowStep {
  id: string;
  label: string;
  sublabel?: string;
  icon?: string;
}

interface FlowDiagramProps {
  title: string;
  steps: FlowStep[];
  accentColor: "purple" | "cyan" | "emerald" | "amber";
}

const accent = {
  purple: {
    line: "from-purple-500/30 via-purple-400/70 to-purple-500/30",
    pulse: "bg-purple-400",
    card: "border-purple-500/20 bg-purple-950/20",
    sub: "text-purple-400",
    icon: "bg-purple-500/15 text-purple-300",
    arrow: "fill-purple-400/50",
  },
  cyan: {
    line: "from-cyan-500/30 via-cyan-400/70 to-cyan-500/30",
    pulse: "bg-cyan-400",
    card: "border-cyan-500/20 bg-cyan-950/20",
    sub: "text-cyan-400",
    icon: "bg-cyan-500/15 text-cyan-300",
    arrow: "fill-cyan-400/50",
  },
  emerald: {
    line: "from-emerald-500/30 via-emerald-400/70 to-emerald-500/30",
    pulse: "bg-emerald-400",
    card: "border-emerald-500/20 bg-emerald-950/20",
    sub: "text-emerald-400",
    icon: "bg-emerald-500/15 text-emerald-300",
    arrow: "fill-emerald-400/50",
  },
  amber: {
    line: "from-amber-500/30 via-amber-400/70 to-amber-500/30",
    pulse: "bg-amber-400",
    card: "border-amber-500/20 bg-amber-950/20",
    sub: "text-amber-400",
    icon: "bg-amber-500/15 text-amber-300",
    arrow: "fill-amber-400/50",
  },
} as const;

export function FlowDiagram({ title, steps, accentColor }: FlowDiagramProps) {
  const a = accent[accentColor];

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-zinc-200">{title}</h3>
      <div className="overflow-x-auto pb-2">
        <div className="flex min-w-max items-center">
          {steps.map((step, i) => (
            <div key={step.id} className="flex items-center">
              {/* Step card */}
              <article
                className={`rounded-2xl border ${a.card} p-3 backdrop-blur-sm`}
                style={{ minWidth: "8.5rem" }}
              >
                {step.icon && (
                  <div
                    className={`mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-xl text-base ${a.icon}`}
                    aria-hidden="true"
                  >
                    {step.icon}
                  </div>
                )}
                <div className="text-center text-xs font-semibold leading-tight text-zinc-100">
                  {step.label}
                </div>
                {step.sublabel && (
                  <div className={`mt-1 text-center text-[10px] ${a.sub}`}>
                    {step.sublabel}
                  </div>
                )}
              </article>

              {/* Animated connector */}
              {i < steps.length - 1 && (
                <div className="relative mx-1 h-px w-10 flex-shrink-0 overflow-visible">
                  <div className={`h-full bg-gradient-to-r ${a.line}`} />
                  <div className={`flow-connector-pulse h-2 w-2 rounded-full ${a.pulse} shadow-sm`} />
                  <svg
                    viewBox="0 0 6 10"
                    className="absolute -right-1 top-1/2 h-2 w-1.5 -translate-y-1/2"
                    aria-hidden="true"
                  >
                    <path d="M0 0l6 5-6 5V0z" className={a.arrow} />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
