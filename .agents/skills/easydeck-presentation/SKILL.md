---
name: easydeck-presentation
description: Step-by-step workflow and patterns for building scrollytelling presentations in EasyDeck using Antigravity and Gemini 3.6 Flash.
---

# EasyDeck Presentation Building Skill

This skill provides comprehensive instructions for creating interactive, cinematic scrollytelling presentations in this repository.

## Architecture Overview

Presentations can be built in two ways depending on complexity:

1. **Standard EasyDeck Pipeline (`<Stage story={story} />`)**
   - Ideal for image sequence scrollytelling.
   - Uses `createPresentation(brief)` or `createEnhancedPresentation(brief)` from `@/lib/pipeline`.

2. **Cinematic Custom Presentation Page (`x_pres` Architecture)**
   - Used for rich multi-media presentations with video + frame fallbacks, dual language (EN/HE), live edit mode, floating HUD, custom transitions, and interactive controls.
   - Source: `src/app/presentations/<slug>/page.tsx`
   - Assets: `public/presentations/<slug>/` (contains `frames/`, `videos/`, design notes)

---

## Workflow for Creating a New Presentation (e.g. `hativa`)

### Phase 1: Asset Inspection & Narrative Mapping
1. **Analyze Frames & Media:**
   - Scan files in `public/presentations/<slug>/frames/` and `public/presentations/<slug>/videos/`.
   - Identify visual themes, action focus, lighting, and key details in each frame.

2. **Define Scene Structures:**
   - Create a sequence of scenes matching the frames.
   - For each scene, specify:
     - `id`: Numeric index
     - `part` & `partHe`: Part/Chapter label in EN and HE (e.g., `"PART 1 — THREAT"` / `"חלק 1 — האיום"`)
     - `titleEn` & `titleHe`: Scene headline
     - `descriptionEn` & `descriptionHe`: Descriptive story paragraph
     - `image`: WebP / PNG path (e.g., `"/presentations/hativa/frames/..."`)
     - `video`: Optional MP4 path (e.g., `"/presentations/hativa/videos/..."`)
     - `accentColor`: Hex color (`#00D4FF`, `#FFB830`, `#00E676`, `#FF2E3B`, `#3D7BFF`, etc.)
     - `hudLabel`: Tactical HUD text (e.g., `"SCENE 01 // OVERVIEW"`)
     - `dataLine`: Technical metadata string (e.g., `"STATUS: ACTIVE | CONFIDENCE: 98%"`)
     - `panelPosition`: `"bottom-left"` | `"bottom-right"` | `"bottom-center"` | `"top-left"` | `"top-right"` (chosen so overlay does not obscure key visual content)

---

### Phase 2: Implementation Details (`x_pres` Pattern)

1. **Page Router Location:**
   - App directory: `src/app/presentations/<slug>/page.tsx`
   - Custom CSS (if needed): `src/app/presentations/<slug>/styles.css` (or reuse shared styles).

2. **Key Components & Utilities to Include/Reuse:**
   - **`EditToolbar`**: Enables real-time drag/drop positioning, text editing, font selection, and custom box insertion (saved to `localStorage`).
   - **`VideoBackground`**: Manages dual `<video>` element crossfading and playback optimization.
   - **Transitions**: Support GSAP Observer gestures, image slide/fade, and custom video transitions (DeadDrop, Orbital, Consensus Lock).
   - **Controls (Top-Right Pill Cluster):**
     - Scroll Mode (GSAP Section / Continuous / Autoplay)
     - Language (Bilingual / EN / HE)
     - Media Mode (Image / Video)
     - Transition Selector (A / B / C)
     - Edit Mode Toggle

---

### Phase 3: Guidelines for Gemini 3.6 Flash & Antigravity

- **Strict Validation:** Always ensure TypeScript interfaces for `Scene` match.
- **RTL & Hebrew Quality:** Provide natural, contextual Hebrew text for military/tech domains. Set `direction: rtl` on containers when Hebrew is active.
- **Asset Fallbacks:** Ensure that if `videos/` is empty or missing files, `mediaMode` defaults gracefully to `"image"` with no broken media references.
- **Design Tokens & HUD Aesthetics:**
  - Primary text: Silver (`#F8FAFC`)
  - Accent colors: Neon Cyan (`#00D4FF`), Warm Gold (`#FFB830`), Red (`#FF2E3B`), Green (`#00E676`), Blue (`#3D7BFF`)
  - Backdrop: Glassmorphism ink (`#0D1117CC`) with subtle borders.

---

## Verification & Deployment
```bash
npm run type-check   # Validate TypeScript types
npm run build        # Build production bundle
systemctl restart easydeck-pres # Restart systemd presentation service
```

---

## Production Architecture & Deployment (`hundia.casa`)

- **Domain & SSL**: `https://hundia.casa/presentations/<slug>`
- **Internal Next.js Port**: `3848` (`http://127.0.0.1:3848`)
- **Systemd Service**: `easydeck-pres.service`
  - Unit Path: `/etc/systemd/system/easydeck-pres.service`
  - Working Directory: `/opt/dept_pres`
  - ExecStart: `npx next start -p 3848 -H 127.0.0.1`
- **Nginx Proxy Configuration**: `/etc/nginx/sites-enabled/hundia.casa`
  - Routing: `location ^~ /presentations/` proxies to `http://127.0.0.1:3848`
  - Assets: `location ^~ /_next/` proxies to `http://127.0.0.1:3848`

### Deployment Checklist for New Presentations:
1. Build presentation page under `src/app/presentations/<slug>/page.tsx`.
2. Run `npm run type-check`.
3. Run `npm run build`.
4. Restart service: `systemctl restart easydeck-pres`.
5. Verify live public URL: `curl -I https://hundia.casa/presentations/<slug>`.

