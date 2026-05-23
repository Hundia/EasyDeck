"use client";

const layers = [
  { title: "Story Definition", subtitle: "Zod schemas" },
  { title: "Agent Pipeline", subtitle: "NarrativeDesigner → SceneComposer" },
  { title: "Stage Runtime", subtitle: "section / snap / scrub routing" },
  { title: "Canvas Engine", subtitle: "playhead-driven frame render" },
  { title: "UX Shell", subtitle: "pagination, keyboard, a11y" },
] as const;

export function ArchitectureDiagram() {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-zinc-800/50 bg-zinc-950/70 p-4 sm:p-6">
      <div className="pointer-events-none absolute inset-0 viewer-grid opacity-40" />
      <svg
        viewBox="0 0 720 560"
        className="relative z-10 h-auto w-full"
        role="img"
        aria-label="EasyDeck architecture layers"
      >
        <defs>
          <linearGradient id="viewer-layer-fill" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(24,24,27,0.92)" />
            <stop offset="100%" stopColor="rgba(39,39,42,0.88)" />
          </linearGradient>
          <linearGradient id="viewer-line-gradient" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="50%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
          <filter id="viewer-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {layers.map((layer, index) => {
          const y = 28 + index * 102;
          const connectorY = y + 92;

          return (
            <g key={layer.title}>
              <rect
                className="architecture-node"
                x="80"
                y={y}
                width="560"
                height="74"
                rx="22"
                fill="url(#viewer-layer-fill)"
                stroke="rgba(82,82,91,0.55)"
              />
              <rect x="96" y={y + 16} width="8" height="42" rx="4" fill="url(#viewer-line-gradient)" />
              <text x="124" y={y + 34} fill="#fafafa" fontSize="22" fontWeight="700">
                {layer.title}
              </text>
              <text x="124" y={y + 58} fill="#a1a1aa" fontSize="14">
                {layer.subtitle}
              </text>
              {index < layers.length - 1 ? (
                <g filter="url(#viewer-glow)">
                  <path
                    className="architecture-line"
                    d={`M360 ${connectorY} L360 ${connectorY + 28} L360 ${connectorY + 28}`}
                    stroke="url(#viewer-line-gradient)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <circle className="architecture-pulse" cx="360" cy={connectorY + 14} r="6" fill="#22d3ee" />
                  <path
                    d={`M348 ${connectorY + 24} L360 ${connectorY + 38} L372 ${connectorY + 24}`}
                    stroke="url(#viewer-line-gradient)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </g>
              ) : null}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
