# Sprint 13: Edit Mode — Tasks

## Task 1: Add Edit Mode State & Menu Button
**Complexity**: Low

Add `editMode` boolean state to x_pres page. Add a new "Edit" button pill in the menu (pencil ✎ icon). When toggled, the page enters edit mode — the text panel becomes interactable.

**Acceptance Criteria**:
- New "Edit" pill button appears in menu after the media mode pill
- Clicking toggles `editMode` state
- Active state shows accent color highlight like other buttons
- Edit mode indicator visible (e.g., subtle "EDITING" badge or border glow on panel)

---

## Task 2: Panel Override Data Model & localStorage Persistence
**Complexity**: Low

Create `PanelOverride` interface and state: `Record<number, PanelOverride>`. Load from localStorage on mount, save on change.

**Acceptance Criteria**:
- Overrides persist across page reload
- Each scene can have independent overrides
- Missing overrides fall back to default scene config

---

## Task 3: Position Controls (Preset + Free Drag)
**Complexity**: High

When edit mode is active:
- Show position preset buttons (5 positions: bottom-left, bottom-right, bottom-center, top-left, top-right)
- Enable drag-to-position on the panel (using pointer events)
- Store custom x/y in overrides
- Must not conflict with GSAP Observer scroll navigation

**Acceptance Criteria**:
- Preset buttons snap panel to position
- Drag works smoothly without triggering slide transitions
- Custom position persists per scene

---

## Task 4: Size Controls (Width Slider)
**Complexity**: Medium

Add a width slider (range: 300–700px) in the edit toolbar. Panel resizes in real-time as slider moves.

**Acceptance Criteria**:
- Slider changes panel width live
- Width persists per scene in overrides
- Min 300px, max 700px, default 450px

---

## Task 5: Border Toggle
**Complexity**: Low

Add a toggle switch that shows/hides the panel border. When off, removes the `border` and reduces `box-shadow`.

**Acceptance Criteria**:
- Toggle removes/adds `border: 1px solid rgba(...)` 
- Smooth transition on toggle
- Persists per scene

---

## Task 6: Font Selection (4 EN + 4 HE)
**Complexity**: Medium

Add font picker with 8 options (4 English, 4 Hebrew). Load fonts via CSS `@font-face` or next/font. Apply selected font to panel title and description per language.

**English fonts**: Inter, Space Grotesk, JetBrains Mono, Playfair Display  
**Hebrew fonts**: Heebo, Rubik, Assistant, Frank Ruhl Libre

**Acceptance Criteria**:
- Font selector shows font name in its own typeface (preview)
- Selected font applies to panel text immediately
- English font applies to EN text, Hebrew font applies to HE text
- Persists per scene

---

## Task 7: Edit Toolbar UI Component
**Complexity**: Medium

Build the floating edit toolbar that appears when edit mode is active. Contains: position presets, width slider, border toggle, font pickers. Positioned near (but not overlapping) the text panel. Animated entrance/exit.

**Acceptance Criteria**:
- Toolbar appears with animation when edit mode activates
- Clean, minimal design matching existing HUD aesthetic
- Does not obscure text panel content
- Responsive (works on smaller screens)

---

## Task 8: Integration & Conflict Prevention
**Complexity**: Medium

Ensure edit mode interactions (drag, slider, toggles) don't trigger GSAP Observer gestures or Lenis scroll. Add `stopPropagation` and `pointer-events` guards.

**Acceptance Criteria**:
- Dragging panel does NOT trigger scene transition
- Clicking edit controls does NOT navigate slides
- Edit mode works in all 3 scroll modes (gsap, continuous, autoplay)
- Exiting edit mode restores normal navigation behavior
