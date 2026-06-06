# Sprint 13: Edit Mode — Slide Text Panel Customizer

## Summary

Add an **Edit** mode button to the top-right collapsible menu in the x_pres presentation. When active, Edit mode provides per-slide controls to:
1. Reposition and resize the text box (drag + handles or preset positions)
2. Toggle the panel border on/off
3. Select from 8 fonts (4 English, 4 Hebrew)

All customizations persist to localStorage so edits survive page reload.

## Motivation

The current presentation has fixed `panelPosition` per scene. Presenters want to visually tweak text placement, sizing, border, and typography on-the-fly without editing code — especially for bilingual content where different fonts/sizes work better on different slides.

## Affected Capabilities

- **Scene composition** — adds per-scene panel overrides (position, size, border, font)
- **Transition modes** — edit mode must work in all scroll modes (gsap, continuous, autoplay)

## Design

### UI Controls (Edit Mode Panel)

When Edit mode is active:
- A floating edit toolbar appears near the text panel with:
  - **Position**: drag handle + 5 preset positions (bottom-left, bottom-right, bottom-center, top-left, top-right) plus free-drag
  - **Size**: width slider (300px–700px) + height auto/manual
  - **Border**: toggle switch (on/off)
  - **Font (EN)**: 4 English font options (Inter, Space Grotesk, JetBrains Mono, Playfair Display)
  - **Font (HE)**: 4 Hebrew font options (Heebo, Rubik, Assistant, Frank Ruhl Libre)

### Data Model

```typescript
interface PanelOverride {
  x?: number;           // custom x position (px or %)
  y?: number;           // custom y position (px or %)
  width?: number;       // panel width in px
  height?: number | "auto";
  border?: boolean;     // show/hide border
  fontEn?: string;      // English font family
  fontHe?: string;      // Hebrew font family
}

// Per-scene overrides stored as: Record<number, PanelOverride>
```

### Persistence

- `localStorage.setItem("x-pres-panel-overrides", JSON.stringify(overrides))`
- Loaded on mount, applied per-scene

### Font Loading

Google Fonts loaded via `next/font/google` for:
- Inter, Space Grotesk, JetBrains Mono, Playfair Display (English)
- Heebo, Rubik, Assistant, Frank Ruhl Libre (Hebrew)

## Risks

- Drag interaction may conflict with GSAP Observer in gsap mode → solution: stop event propagation on edit panel
- Font loading adds weight → solution: only load selected fonts (dynamic subset)

## Out of Scope

- Rich text editing (bold/italic per word)
- Color/opacity customization (future sprint)
- Export/import of overrides
