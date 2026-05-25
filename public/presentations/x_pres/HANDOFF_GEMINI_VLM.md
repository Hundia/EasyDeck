# Gemini VLM Handoff — Text-Image Alignment + UX Enhancements

## Context

You are reviewing and enhancing a cinematic scrollytelling presentation for the **Intelligence Software Department**. The presentation has 14 scenes, each with a background image and text overlays (English + Hebrew).

**Problems to fix:**
1. Some scene texts may not accurately describe what's shown in the corresponding image
2. Missing UX controls (scroll mode toggle, language toggle)
3. Text panel positioning can be improved
4. Animations could be enhanced

## Files

- **Presentation source:** `/opt/dept_pres/src/app/presentations/x_pres/page.tsx`
- **Presentation styles:** `/opt/dept_pres/src/app/presentations/x_pres/styles.css`
- **Original brief:** `/opt/dept_pres/public/presentations/x_pres/presentation.md`
- **Design system:** `/opt/dept_pres/public/presentations/x_pres/design_system.md`
- **Images (PNG originals):** `/opt/dept_pres/public/presentations/x_pres/1.PNG` through `14.PNG`
- **Images (WebP for serving):** `/opt/dept_pres/public/presentations/x_pres/frames/frame-0001.webp` through `frame-0014.webp`

## Tech Stack
- Next.js 15 (App Router), React, TypeScript strict
- `framer-motion` for animations (already imported)
- CSS (no Tailwind in this page — custom classes with `x-pres-` prefix)
- Design tokens in CSS variables (`:root` in styles.css)

---

## TASK 1: VLM Image-Text Alignment

### Step 1: Analyze Each Image

For each image (1.PNG through 14.PNG), use your vision capabilities to describe:
1. What is actually depicted in the image
2. The mood, setting, and key visual elements
3. Any text or UI elements visible in the image

### Step 2: Compare with Scene Data

The scene data in `page.tsx` contains for each scene:
- `titleEn` / `titleHe` — the headline
- `descriptionEn` / `descriptionHe` — the explanation text
- `hudLabel` — the HUD overlay label
- `dataLine` — technical data readout

Compare what you SEE in each image versus what the text SAYS.

### Step 3: Fix Mismatches

For any scene where the text doesn't match the image, update the scene data in `page.tsx`:
- Keep the narrative flow coherent (it's a sequential story)
- Keep Hebrew translations accurate and natural (not Google Translate quality)
- Keep the HUD labels and data lines relevant to what's actually shown
- Maintain the military/intelligence tone

### Scene Mapping (Image → Expected Content)

| Image | Expected Scene |
|-------|---------------|
| 1.PNG | Approaching threat — hostile operative in desert terrain |
| 2.PNG | Command center alert — screens, officers, tactical displays |
| 3.PNG | Intel research software — analyst workstation, research trees |
| 4.PNG | Drone dispatch — ground station + drones taking off |
| 5.PNG | Cyber attack — NSOC, red alerts, breach detected |
| 6.PNG | Cyber defense — operator activating defensive playbook |
| 7.PNG | Target acquired — VISINT feed, drone surveillance |
| 8.PNG | Command decision — general giving the order |
| 9.PNG | Capture — drones surrounding target, surrender |
| 10.PNG | AI investigation — agent-to-agent AI framework |
| 11.PNG | Investigation results — AI dashboard, findings |
| 12.PNG | Spec-driven development — philosophy infographic |
| 13.PNG | Thank you — closing slide |
| 14.PNG | Additional/transition slide |

---

## TASK 2: Scroll Mode Toggle (Top-Right)

Add a button group in the **top-right area** (below the HUD corner bracket) that lets the user choose between scroll modes:

- **Section** (default) — one gesture = one scene (current behavior)
- **Continuous** — free scroll through all scenes as a vertical page (like a long scrolling website)
- **Auto-play** — scenes advance automatically every 6 seconds with a progress ring

Design requirements:
- Small, unobtrusive pill-shaped buttons with icons (not text-heavy)
- Use the scene's current `accentColor` for the active state
- Glassmorphism style matching the content panel
- Animate in after 1s delay on first scene
- Icons suggestion: ⬤ (section), ≡ (continuous), ▶ (auto-play) — or use simple SVG icons
- On hover, show a tooltip with the mode name
- When switching modes, smoothly transition the behavior

Implementation notes:
- Section mode: current wheel/touch/keyboard handler (navigate one scene at a time)
- Continuous mode: remove `position: fixed` from container, render all scenes as full-height sections stacked vertically, use IntersectionObserver to track current scene for the progress dots
- Auto-play mode: use `setInterval` to advance scenes, show a circular progress ring around a pause/play button

---

## TASK 3: Language Toggle (Top-Right)

Add a language toggle button next to the scroll mode toggle:

- **EN** / **עב** toggle (two states)
- When English is selected: show ONLY English text (titleEn, descriptionEn), LTR layout
- When Hebrew is selected: show ONLY Hebrew text (titleHe, descriptionHe), RTL layout
  - The entire glass panel should flip to RTL (`direction: rtl`)
  - The panel should be positioned on the **right side** of the screen (mirrored)
  - The part label, HUD label, data line — all in Hebrew or transliterated
- Smooth crossfade animation when switching languages
- Persist choice in `localStorage`
- Default: show both (current bilingual layout) — so three states: `both` | `en` | `he`

Design:
- Small toggle with flag icons or text labels
- Match the glassmorphism style
- Active state uses `accentColor`

---

## TASK 4: Smart Text Panel Positioning

The text panel (`.x-pres-content`) is currently fixed at bottom-left. Improve it:

- **Analyze each image** to determine where the "visual interest" area is (using your VLM)
- For images where the action is on the left → place text panel on the **right**
- For images where the action is on the right → place text panel on the **left**
- For centered compositions → place text panel at the **bottom center**
- Add a `panelPosition` field to each scene: `"bottom-left" | "bottom-right" | "bottom-center" | "top-left" | "top-right"`
- Animate the panel position change between scenes (framer-motion `layout` or position transitions)

This prevents the text from covering the important parts of each image.

---

## TASK 5: Animation Extras (Creative Freedom)

Add cool cinematic effects. Ideas to consider (pick the best ones):

1. **Scene entrance effects** — each scene gets a unique entrance:
   - Scenes 1-3: slide from left (building tension)
   - Scene 5 (cyber attack): glitch/distortion entrance with red flash
   - Scene 9 (capture): zoom-in from above (drone perspective)
   - Scene 13 (thank you): elegant fade with scale

2. **Parallax layers** — split the overlay into layers that move at different speeds on scroll/transition

3. **Animated HUD elements**:
   - Rotating compass indicator that changes bearing per scene
   - Blinking "REC" indicator in corner during surveillance scenes (7, 9)
   - Signal strength bars that fluctuate (drop to zero on scene 5, restore on scene 6)
   - Threat level indicator (green → yellow → red → green) that follows the story arc

4. **Text effects**:
   - Titles reveal with a "decode" effect (random characters → real text, like The Matrix)
   - Hebrew text reveals right-to-left with a cursor sweep
   - Data lines have a terminal-style typing with occasional "errors" that self-correct

5. **Transition effects between scenes**:
   - Brief static/noise frame between scenes (50ms)
   - Scene 5 transition: screen "breaks" with red crack lines before resolving
   - Scene 9: spotlight effect radiating from center

6. **Ambient effects**:
   - Very subtle camera shake on alert scenes (2, 5)
   - Breathing glow on the glass panel border (subtle pulse)
   - Digital noise grain overlay (very subtle, 2-3% opacity)

Pick the ones that create the most impact without overwhelming the viewer. Less is more — but make each effect count.

---

## Design System Reference (from design_system.md)

| Element | Color | Hex |
|---------|-------|-----|
| Primary Text | High-Contrast Silver | `#F8FAFC` |
| Secondary Text | Muted Slate | `#94A3B8` |
| HUD Header | Neon Cyan | `#00D4FF` |
| Human Element | Warm Gold | `#FFB830` |
| Alert/Threat | Signal Red | `#FF2E3B` |
| Success/Link | Operations Green | `#00E676` |
| Backdrop | Glassmorphism Ink | `#0D1117CC` |

**Fonts:**
- Headings: Inter Bold/Semi-bold (uppercase for military feel)
- Technical: JetBrains Mono (data readouts, coordinates)

**Rules:**
- Text shadows always (for legibility over images)
- Glassmorphism panels: `#0D1117` at 70-80% opacity, 1px cyan border
- Safe zones: 80px from edges minimum
- HUD elements: thin 1px lines, corner brackets

---

## Important Constraints

- TypeScript strict — no `any` types
- Keep the `x-pres-` CSS class prefix convention
- Don't break existing functionality while adding new features
- All text must work in both English and Hebrew modes
- Maintain accessibility: keyboard navigation, reduced motion support
- Performance: don't add heavy effects that cause jank on 60fps
- Mobile responsive: new controls should work on touch devices

---

## Build & Deploy

After ALL tasks are complete:
```bash
cd /opt/dept_pres
npm run type-check    # must pass
npm run build         # must succeed
systemctl restart easydeck-pres
```

Verify live: https://hundia.casa/presentations/x_pres

## Commit

```bash
cd /opt/dept_pres
git add -A
git commit -m "feat: enhanced presentation — VLM alignment, scroll modes, language toggle, animations

- Fix text-image mismatches using VLM analysis
- Add scroll mode toggle (section/continuous/auto-play)
- Add language toggle (both/EN/HE with full RTL support)
- Smart text panel positioning per scene
- Cinematic animation extras (glitch, parallax, HUD indicators)

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
GIT_SSH_COMMAND="ssh -i ~/.ssh/deploy_pres -o StrictHostKeyChecking=no" git push origin master
```
