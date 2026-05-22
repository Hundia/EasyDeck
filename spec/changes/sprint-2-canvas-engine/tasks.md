# Implementation Tasks — Sprint 2: Canvas Engine & Playhead

1. Create Playhead interface and types (`src/lib/types/playhead.ts`)
2. Create `usePlayhead` hook for ref-based playhead management (`src/lib/hooks/usePlayhead.ts`)
3. Implement frame preloader utility (`src/lib/canvas/preloader.ts`)
4. Implement DPR-aware canvas sizing utility (`src/lib/canvas/sizing.ts`)
5. Implement frame clamping utility (`src/lib/canvas/clamp.ts`)
6. Implement `ImageSequenceCanvas` component (`src/components/ImageSequenceCanvas.tsx`)
7. Unit test: Playhead interface and usePlayhead hook
8. Unit test: Frame preloader (progress callback, error handling)
9. Unit test: DPR sizing calculation
10. Unit test: Frame clamping (negative, overflow, normal)
11. Unit test: ImageSequenceCanvas renders and cleans up
12. Integration test: Playhead update → canvas draw cycle
13. Update regression test runner to include sprint-2
