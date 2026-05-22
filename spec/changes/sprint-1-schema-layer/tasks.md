# Implementation Tasks — Sprint 1: Project Bootstrap & Schema Layer

1. Initialize Next.js 15 project with TypeScript, Tailwind CSS, App Router
2. Install dependencies: gsap, @gsap/react, lenis, zod
3. Install dev dependencies: vitest, @testing-library/react, jsdom, @vitejs/plugin-react
4. Configure TypeScript strict mode, path aliases (@/ → src/)
5. Configure Vitest for unit and integration testing
6. Implement TransitionMode enum schema (scrub, snap, section)
7. Implement EaseId enum schema
8. Implement TransitionConfig schema with all defaults
9. Implement OverlayConfig schema (type, content, enterAt, exitAt, position)
10. Implement SceneConfig schema (id, label, startFrame, endFrame, imageSequence, overlays, transition)
11. Implement StorySchema with superRefine frame-continuity validation
12. Create sample story configuration JSON (valid config for testing)
13. Unit tests: TransitionMode and EaseId validation
14. Unit tests: TransitionConfig defaults and validation
15. Unit tests: SceneConfig validation (valid + invalid)
16. Unit tests: StorySchema superRefine (frame continuity pass + fail)
17. Unit tests: Sample config validates successfully
18. Create regression test runner (src/__tests__/regression.test.ts)
19. Verify: npm run build succeeds
20. Verify: npm run type-check passes
