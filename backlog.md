# Execution Backlog — ScrollyTelling Presentation Framework

## Vision
Build a production-ready scrollytelling presentation engine that delivers Apple-quality scroll experiences with full accessibility, powered by GSAP, Lenis, and canvas-based image sequences.

---

## Sprint 0: Foundation & Scaffolding ✅ (Current)
**Goal**: Set up project infrastructure, documentation, and development tooling.

- [x] Read and analyze requirements
- [x] Install development skills (openspec, superpowers, caveman)
- [x] Create documentation hierarchy
- [x] Create CLAUDE.md project instructions
- [x] Create backlog.md (this file)
- [x] Create openspec configuration
- [x] Create `/run-sprint` skill
- [x] Define sprint plan

---

## Sprint 1: Project Bootstrap & Schema Layer ✅
**Goal**: Initialize Next.js project, install dependencies, define Zod schemas.
**Estimated complexity**: Medium | **Agent**: Sonnet 4.6

### Tasks
1. Initialize Next.js 15 project with TypeScript, Tailwind, App Router
2. Install dependencies: gsap, lenis, zod, @gsap/react
3. Configure TypeScript strict mode, path aliases
4. Implement `TransitionMode` enum schema (`scrub`, `snap`, `section`)
5. Implement `EaseId` enum schema
6. Implement `TransitionConfig` schema with defaults
7. Implement `SceneConfig` schema (id, label, frames, overlays)
8. Implement `StorySchema` with `superRefine` frame-continuity validation
9. Create sample story configuration JSON for testing
10. Unit tests for schema validation (valid configs, invalid configs, edge cases)

### Acceptance Criteria
- `npm run build` succeeds
- `npm run type-check` passes
- All schema tests pass
- Sample config validates successfully

---

## Sprint 2: Canvas Engine & Playhead ✅
**Goal**: Build the playhead-agnostic ImageSequenceCanvas component.
**Estimated complexity**: Medium | **Agent**: Sonnet 4.6

### Tasks
1. Create `Playhead` interface (`{ frame: number }`)
2. Implement `ImageSequenceCanvas` component (canvas ref, draw loop on GSAP ticker)
3. Implement frame preloading with progress callback
4. Implement adaptive resolution (canvas sizing, DPR handling)
5. Implement frame clamping (min 0, max frameCount-1)
6. Create `usePlayhead` hook for ref-based playhead management
7. Test: canvas draws correct frame when playhead changes
8. Test: preloader reports progress accurately
9. Performance test: 60fps at 120+ frames

### Acceptance Criteria
- Canvas renders frames driven by any playhead source
- No dependency on ScrollTrigger in the canvas component
- Preloading works with progress reporting
- Maintains 60fps on target devices

---

## Sprint 3: Section Mode (Default) ✅
**Goal**: Implement Observer-driven section transitions — the core UX.
**Estimated complexity**: High | **Agent**: Sonnet 4.6 (complex cross-cutting logic)

### Tasks
1. Create `SectionStage` component shell
2. Implement GSAP Observer with wheel/touch/pointer
3. Implement `gotoScene()` function with timeline tweens
4. Wire playhead driving (tween-based, not scroll-based)
5. Implement overlay cross-fade system
6. Implement `animating` lock (drop gestures during transition)
7. Implement `wrapEnabled` vs clamp behavior
8. Implement keyboard navigation (Arrow, Page, Home/End, Space)
9. Implement pagination dots (`<nav aria-label>`, `aria-current="step"`)
10. Implement direct-jump from pagination click
11. Test: one gesture = one scene advance
12. Test: keyboard navigation works correctly
13. Test: rapid gestures are dropped (not queued)
14. Integration test: SectionStage + ImageSequenceCanvas

### Acceptance Criteria
- One wheel/swipe gesture = one scene transition
- Keyboard fully functional
- Pagination dots visible and interactive
- No scroll-jacking of native scroll outside the stage
- `animating` flag prevents gesture queue buildup

---

## Sprint 4: Snap Mode
**Goal**: Implement ScrollTrigger scrub + labelsDirectional snap.
**Estimated complexity**: Medium | **Agent**: GPT Codex 5.3 (large GSAP config)

### Tasks
1. Create `SnapStage` component shell
2. Implement ScrollTrigger with `scrub: 1` and `snap: "labelsDirectional"`
3. Wire scene labels to timeline positions
4. Configure snap duration (min/max), delay, ease, inertia
5. Wire playhead to ScrollTrigger progress
6. Implement overlay timelines per scene (positioned by progress)
7. Integrate Lenis Snap addon (avoid issue #389)
8. Test: continuous scrub within scenes
9. Test: settles to nearest label boundary on scroll stop
10. Test: directional snap (small nudge advances, doesn't snap back)

### Acceptance Criteria
- Scrubbing feels continuous (Apple AirPods Pro feel)
- Stops settle precisely on scene boundaries
- Lenis + snap work together without asymmetry bug
- `directional: true` enables next-label-in-direction snap

---

## Sprint 5: Scrub Mode & Stage Switcher
**Goal**: Implement pure scrub mode and the unified `<Stage>` component.
**Estimated complexity**: Medium | **Agent**: Sonnet 4.6

### Tasks
1. Create `ScrubStage` component (ScrollTrigger scrub, no snap)
2. Wire playhead to `scrollTrigger.progress * totalFrames`
3. Implement overlay positioning by progress fraction
4. Create `<Stage story={...} />` switcher component
5. Route to SectionStage/SnapStage/ScrubStage based on `story.transition.mode`
6. Per-scene mode override support
7. Test: free scrub with no magnetic stops
8. Test: switcher routes correctly based on config

### Acceptance Criteria
- Scrub mode gives full user control
- Stage switcher correctly selects mode per config
- Per-scene overrides work

---

## Sprint 6: Lenis Integration & Smoothing
**Goal**: Integrate Lenis properly per mode with pause/resume logic.
**Estimated complexity**: Medium-High | **Agent**: Sonnet 4.6

### Tasks
1. Create `lib/lenis.ts` — `initLenis()` with GSAP ticker integration
2. Create `LenisContext` provider with `stop()`/`start()` exposed
3. Implement auto-pause in section mode (`pauseLenisInSection`)
4. Implement Lenis Snap addon for snap mode
5. Keep Lenis active in scrub mode (proven combo)
6. Handle Lenis ↔ ScrollTrigger refresh lifecycle
7. Test: Lenis pauses during section stage, resumes on exit
8. Test: No issue #389 asymmetry in snap mode
9. Test: Scrub + Lenis smooth scroll feels right

### Acceptance Criteria
- Zero conflicts between Lenis and ScrollTrigger
- Section mode fully disables Lenis while active
- Snap mode uses Lenis Snap addon (not ScrollTrigger snap directly)

---

## Sprint 7: Accessibility & UX Polish
**Goal**: Full a11y compliance and UX refinements.
**Estimated complexity**: Medium | **Agent**: Sonnet 4.6

### Tasks
1. Implement `prefers-reduced-motion` detection and fallback
2. Reduced-motion: collapse durations to ~0, skip Observer preventDefault
3. Semantic content layer beneath visual stage (screen reader accessible)
4. Skip-to-content link
5. Pagination dots with proper ARIA (`aria-current="step"`)
6. Mobile touch tolerance adjustment (20 on phones, 10 on desktop)
7. `ScrollTrigger.normalizeScroll(true)` on touch devices
8. URL hash persistence (`#scene-3`) with deep-linking
9. Scroll-progress indicator (vertical bar with scene markers)
10. Test: VoiceOver reads scene content
11. Test: keyboard-only navigation complete flow
12. Test: reduced-motion delivers static fallback

### Acceptance Criteria
- WCAG 2.1 AA compliance
- All content accessible without JavaScript-dependent scrolling
- Mobile touch interactions feel natural
- Deep-linking works

---

## Sprint 8: Agent Pipeline
**Goal**: Build NarrativeDesigner and SceneComposer AI agents.
**Estimated complexity**: High | **Agent**: Opus 4.6 (architectural)

### Tasks
1. Define NarrativeDesigner agent interface (input: content brief → output: scene configs)
2. NarrativeDesigner outputs: mode, duration, overlays with normalized timing (0-1)
3. NarrativeDesigner outputs: `transitionRationale` per scene
4. Define SceneComposer agent interface (input: scene configs → output: StorySchema)
5. SceneComposer validates frame continuity
6. SceneComposer converts normalized overlay timing to seconds/progress
7. Integration: pipeline produces valid StorySchema
8. Test: end-to-end content brief → rendered presentation

### Acceptance Criteria
- Pipeline produces valid StorySchema from content brief
- Frame continuity enforced automatically
- Overlay timing correctly converted per mode

---

## Sprint 9: Integration Testing & QA
**Goal**: End-to-end testing, cross-browser, cross-device.
**Estimated complexity**: Medium | **Agent**: Sonnet 4.6

### Tasks
1. E2E test suite setup (Playwright)
2. Test matrix: Mac trackpad, Win mouse wheel, iPad swipe, iPhone Safari
3. Test: keyboard-only full navigation
4. Test: VoiceOver + JAWS screen readers
5. Performance profiling (60fps target)
6. Memory leak detection (canvas, event listeners)
7. Bundle size audit
8. Documentation review and final polish

### Acceptance Criteria
- All E2E tests pass across device matrix
- 60fps maintained on target hardware
- No memory leaks
- Bundle size within budget
- Documentation complete and accurate

---

## Sprint 10: Framework Viewer & Documentation App
**Goal**: Build a web-based viewer app that visualizes everything we developed — architecture, flows, docs, sprint history — with top-tier visual presentation.
**Estimated complexity**: Medium-High | **Agent**: Sonnet 4.6

### Tasks
1. Create `/viewer` Next.js route group with dedicated layout
2. Dashboard landing page — high-level architecture diagram (interactive SVG/canvas)
3. Docs viewer — render all `docs/*.md` files with syntax highlighting and diagrams
4. Architecture visualization — component tree, data flow arrows, mode routing (animated)
5. User experience flow diagram — gesture → Observer/ScrollTrigger → playhead → canvas pipeline
6. Sprint timeline — visual timeline showing sprint progression, test counts, files added
7. Mode comparison view — side-by-side visualization of section/snap/scrub behaviors
8. Lenis integration diagram — shows pause/resume/sync per mode
9. Schema explorer — interactive Zod schema visualization with valid/invalid examples
10. Navigation: sidebar with sections (Architecture, Flows, Docs, Sprints, Schemas)
11. Responsive design with dark theme
12. Mermaid/D2 diagram rendering for architecture flows

### Acceptance Criteria
- All docs/*.md files rendered with proper formatting
- Architecture diagrams are interactive (hover for details, click to navigate)
- User flow clearly shows: input → processing → output for each mode
- Sprint timeline shows progression from Sprint 0 to current
- Accessible (keyboard navigable, screen reader friendly)
- Visually polished — uses the framework's own scrollytelling for docs navigation

---

## Backlog (Future)
- Theme system (dark/light/custom)
- Multi-canvas support (split-screen presentations)
- Video sequence support (in addition to image sequences)
- Export to static HTML (no React runtime)
- CMS integration (Sanity/Contentful)
- Analytics hooks (scene-entered events)
- RTL language support
