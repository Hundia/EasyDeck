# Sprint 10: Framework Viewer & Documentation App

## Goal
Build a web-based viewer app that visualizes the framework architecture, flows, docs, sprint history, and schemas with top-tier visual design.

## Completed
- ✅ Viewer route group with dark theme layout and sidebar navigation
- ✅ Dashboard landing page with architecture diagram and stats
- ✅ Docs viewer with interactive TOC and content browser
- ✅ Architecture visualization with component tree and data flow
- ✅ User experience flow diagrams for all modes + agent pipeline
- ✅ Sprint timeline with visual progression and metrics
- ✅ Mode comparison view (section/snap/scrub side-by-side)
- ✅ Schema explorer with valid/invalid examples and validation rules

## Test Results
- **Unit tests**: 274 passing (19 new viewer tests)
- **Type check**: Clean (strict mode)
- **Static build**: All 7 viewer pages exported successfully

## Files Added (29 files, +3120 lines)

### Pages
- `src/app/viewer/layout.tsx` — Dark theme shell with sidebar
- `src/app/viewer/page.tsx` — Dashboard with stats, architecture diagram, features
- `src/app/viewer/architecture/page.tsx` — Component tree, data flow, layers
- `src/app/viewer/flows/page.tsx` — Animated pipeline diagrams per mode
- `src/app/viewer/docs/page.tsx` — Documentation browser with TOC
- `src/app/viewer/sprints/page.tsx` — Visual timeline with progress
- `src/app/viewer/modes/page.tsx` — Mode comparison columns + table
- `src/app/viewer/schemas/page.tsx` — Interactive schema explorer

### Components
- `Sidebar.tsx` — Glass morphism nav with active state
- `StatsCard.tsx` — Metric card with accent color
- `ArchitectureDiagram.tsx` — 5-layer SVG with animated connections
- `FeatureCard.tsx` — Hover-lift feature showcase
- `FlowDiagram.tsx` — Reusable horizontal flow with animated arrows
- `NodeGraph.tsx` — Tree-style connected node graph
- `SchemaTree.tsx` — Type-colored schema field tree
- `CodeBlock.tsx` — Styled code with valid/invalid indicators
- `DocsContent.tsx` — Static documentation content map

## Design Decisions
- **Dark theme**: zinc-950 base, glass morphism panels, gradient accents
- **CSS-only animations**: No GSAP in viewer (keeps bundle light, ~3-4KB per page)
- **Static export**: All pages prerendered, no runtime data fetching
- **Responsive**: Sidebar collapses on mobile, cards stack vertically
- **Accessibility**: Keyboard navigable, semantic HTML, reduced-motion support

## Route Sizes
| Route | Size | First Load JS |
|-------|------|---------------|
| /viewer | 3.53 kB | 105 kB |
| /viewer/architecture | 3.47 kB | 105 kB |
| /viewer/docs | 8.31 kB | 109 kB |
| /viewer/flows | 2.22 kB | 103 kB |
| /viewer/modes | 2.67 kB | 104 kB |
| /viewer/schemas | 4.39 kB | 106 kB |
| /viewer/sprints | 2.65 kB | 104 kB |

## Skills Used
- `ckm-design` — Visual design principles
- `ckm-design-system` — Token architecture for consistent styling
- `ckm-ui-styling` — Tailwind patterns, glass morphism
- `data-visualization` — Architecture diagrams, flow visualizations
- `gsap-framer-scroll-animation` — Animation pattern reference
- `nextjs` — App Router best practices, static export
