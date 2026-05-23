export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <div className="mb-6 text-sm font-mono tracking-wider text-emerald-400 uppercase">
          Scrollytelling Presentation Engine
        </div>
        <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-white via-emerald-200 to-emerald-500 bg-clip-text text-transparent mb-6">
          EasyDeck
        </h1>
        <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mb-10">
          Three transition modes. One <code className="text-emerald-400">&lt;Stage&gt;</code> component. 
          Canvas-driven image sequences with GSAP, Lenis & full accessibility.
        </p>
        <div className="flex gap-4 flex-wrap justify-center">
          <a
            href="https://github.com/Hundia/EasyDeck"
            className="px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-emerald-100 transition-colors"
          >
            View on GitHub
          </a>
          <a
            href="#architecture"
            className="px-6 py-3 border border-white/20 rounded-lg hover:border-emerald-400 hover:text-emerald-400 transition-colors"
          >
            Explore Architecture
          </a>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <h2 className="text-3xl font-bold text-center mb-16">Core Features</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((f) => (
            <div key={f.title} className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/50 transition-colors">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Architecture */}
      <section id="architecture" className="max-w-4xl mx-auto px-6 py-24">
        <h2 className="text-3xl font-bold text-center mb-12">Architecture</h2>
        <pre className="p-6 rounded-xl bg-gray-900/80 border border-white/10 text-sm font-mono text-emerald-300 overflow-x-auto">
{`┌─────────────────────────────────────────────────┐
│  <Stage story={...} />                           │
│                                                  │
│  ┌──────────────┐ ┌───────────┐ ┌────────────┐  │
│  │ SectionStage │ │ SnapStage │ │ ScrubStage │  │
│  │  (Observer)  │ │ (ST+Snap) │ │  (ST only) │  │
│  └──────┬───────┘ └─────┬─────┘ └──────┬─────┘  │
│         └────────────────┼──────────────┘        │
│                          ▼                       │
│          ┌────────────────────────────┐          │
│          │   ImageSequenceCanvas      │          │
│          │   (GSAP ticker draw loop)  │          │
│          └────────────────────────────┘          │
│                          ▲                       │
│                playhead.current.frame             │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Lenis (app-level smooth scroll)     │
│  Section → PAUSED                    │
│  Snap/Scrub → ACTIVE + ST sync      │
└─────────────────────────────────────┘`}
        </pre>
      </section>

      {/* Modes */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <h2 className="text-3xl font-bold text-center mb-12">Transition Modes</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {modes.map((m) => (
            <div key={m.name} className="p-6 rounded-xl bg-white/5 border border-white/10">
              <div className="text-2xl mb-3">{m.icon}</div>
              <h3 className="text-lg font-bold mb-2 text-emerald-400">{m.name}</h3>
              <p className="text-gray-400 text-sm mb-3">{m.description}</p>
              <code className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">{m.code}</code>
            </div>
          ))}
        </div>
      </section>

      {/* Pipeline */}
      <section className="max-w-4xl mx-auto px-6 py-24">
        <h2 className="text-3xl font-bold text-center mb-12">Content Pipeline</h2>
        <pre className="p-6 rounded-xl bg-gray-900/80 border border-white/10 text-sm font-mono text-gray-300 overflow-x-auto">
{`ContentBrief (your input)
    │  title, slug, scenes[], mode
    ▼
┌──────────────────────┐
│  NarrativeDesigner   │  → frame ranges, overlays, rationale
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│   SceneComposer      │  → frame continuity, Zod validation
└──────────┬───────────┘
           ▼
    StorySchema (validated)
           │
           ▼
    <Stage story={story} />`}
        </pre>
      </section>

      {/* Sprint Progress */}
      <section className="max-w-4xl mx-auto px-6 py-24">
        <h2 className="text-3xl font-bold text-center mb-12">Development Progress</h2>
        <div className="space-y-3">
          {sprints.map((s) => (
            <div key={s.num} className="flex items-center gap-4 p-3 rounded-lg bg-white/5">
              <span className="text-emerald-400 font-mono text-sm w-8">S{s.num}</span>
              <div className="flex-1">
                <span className="text-sm font-medium">{s.title}</span>
              </div>
              <span className="text-xs text-gray-500 font-mono">{s.tests} tests</span>
              <span className="text-emerald-400">✓</span>
            </div>
          ))}
        </div>
        <p className="text-center text-gray-500 mt-6 text-sm">
          235 cumulative tests • TypeScript strict • Zero <code>any</code>
        </p>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 text-center text-gray-500 text-sm">
        <p>
          Built with{" "}
          <a href="https://github.com/Hundia/autospec" className="text-emerald-400 hover:underline">
            OpenSpec
          </a>{" "}
          methodology • MIT License
        </p>
      </footer>
    </div>
  );
}

const features = [
  { icon: "🎬", title: "Image Sequence Canvas", description: "GSAP ticker-driven draw loop, playhead-agnostic. Decoupled from scroll position for maximum flexibility." },
  { icon: "🧈", title: "Lenis Integration", description: "Per-mode smooth scroll. Pauses in section mode, stays active in snap/scrub with ScrollTrigger sync." },
  { icon: "♿", title: "WCAG 2.1 AA", description: "Reduced motion detection, semantic content layer, skip links, keyboard nav, adaptive touch tolerance." },
  { icon: "📐", title: "Zod Validation", description: "Runtime schema validation with frame continuity superRefine. Invalid configs caught before render." },
  { icon: "🤖", title: "Content Pipeline", description: "createPresentation(brief) → validated StorySchema. No manual JSON authoring required." },
  { icon: "🔗", title: "Deep Linking", description: "URL hash persistence (#scene-N) with replaceState. Share specific scenes directly." },
];

const modes = [
  { icon: "📖", name: "Section", description: "One gesture = one scene. Observer-driven, fullpage.js-like controlled pacing.", code: 'mode: "section"' },
  { icon: "🧲", name: "Snap", description: "Free scroll with magnetic stops at scene boundaries via labelsDirectional.", code: 'mode: "snap"' },
  { icon: "🎚️", name: "Scrub", description: "Continuous scroll-driven playback. Full user control, no magnetic stops.", code: 'mode: "scrub"' },
];

const sprints = [
  { num: 1, title: "Project Bootstrap & Zod Schemas", tests: 33 },
  { num: 2, title: "Canvas Engine & Playhead", tests: 63 },
  { num: 3, title: "Section Mode (Observer)", tests: 86 },
  { num: 4, title: "Snap Mode (ScrollTrigger)", tests: 108 },
  { num: 5, title: "Scrub Mode & Stage Switcher", tests: 124 },
  { num: 6, title: "Lenis Integration & Smoothing", tests: 141 },
  { num: 7, title: "Accessibility & UX Polish", tests: 170 },
  { num: 8, title: "Agent Pipeline", tests: 235 },
];
