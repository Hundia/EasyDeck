/**
 * Injects per-slide panel layout geometry into the hativa deck.
 *
 * Geometry was derived by inspecting each diorama frame and mapping the
 * regions the artwork actually occupies. Two archetypes:
 *
 *   "band"  — wide, horizontal dioramas (the subject spans the full frame but
 *             leaves empty sky above and a featureless plinth below).
 *             Header bar sits in the sky, bullets band sits over the plinth.
 *
 *   "sides" — tall, centre-weighted dioramas (the subject is a narrow column,
 *             leaving both flanks empty). English card left, Hebrew card right,
 *             the artwork breathing between them.
 *
 * All values are viewport fractions (x/w -> vw, top/bottom/maxH -> vh).
 */
import fs from "node:fs";
import path from "node:path";

const LAYOUTS = {
  // 1 — wide cutaway box: artwork y 0.24–0.87, empty sky above, plinth below.
  "slide-01": {
    kind: "band",
    header: { top: 0.03, x: 0.05, w: 0.9 },
    body: { bottom: 0.05, x: 0.05, w: 0.9, maxH: 0.22 },
  },
  // 2 — tall stacked city box: artwork x 0.31–0.69, both flanks empty.
  "slide-02": {
    kind: "sides",
    en: { x: 0.025, w: 0.245 },
    he: { x: 0.73, w: 0.245 },
  },
  // 3 — two side-by-side boxes: lids start at y 0.145, shared plinth below.
  "slide-03": {
    kind: "band",
    header: { top: 0.022, x: 0.05, w: 0.9 },
    body: { bottom: 0.045, x: 0.05, w: 0.9, maxH: 0.23 },
  },
  // 4a — surveillance tray: tray top y 0.22, plinth arc below y 0.75.
  "slide-04a": {
    kind: "band",
    header: { top: 0.03, x: 0.05, w: 0.9 },
    body: { bottom: 0.035, x: 0.05, w: 0.9, maxH: 0.22 },
  },
  // 4b — node cube: artwork x 0.245–0.755, antennas reach y 0.06.
  "slide-04b": {
    kind: "sides",
    en: { x: 0.02, w: 0.212 },
    he: { x: 0.768, w: 0.212 },
  },
  // 5 — production line: nearly full-bleed; only the sky and the floor below
  //     the pallet/plinth are free, so the band hugs the very bottom.
  "slide-05": {
    kind: "band",
    header: { top: 0.022, x: 0.04, w: 0.92 },
    body: { bottom: 0.025, x: 0.04, w: 0.92, maxH: 0.21 },
  },
  // 6 — control room: artwork x 0.24–0.76.
  "slide-06": {
    kind: "sides",
    en: { x: 0.02, w: 0.218 },
    he: { x: 0.762, w: 0.218 },
  },
  // 7 — command room: plinth pushes out to x 0.78 on the right.
  "slide-07": {
    kind: "sides",
    en: { x: 0.02, w: 0.218 },
    he: { x: 0.772, w: 0.205 },
  },
};

const TARGETS = [
  "src/app/presentations/hativa/slides.json",
  "public/presentations/hativa/slides.json",
];

const root = path.resolve(import.meta.dirname, "..");

for (const rel of TARGETS) {
  const file = path.join(root, rel);
  const deck = JSON.parse(fs.readFileSync(file, "utf8"));

  for (const slide of deck.slides) {
    const layout = LAYOUTS[slide.id];
    if (!layout) throw new Error(`No layout defined for ${slide.id}`);
    slide.layout = layout;
    // The bespoke layout supersedes the old single bottom-centre zone.
    if (slide.textBox) slide.textBox.zone = layout.kind;
  }

  fs.writeFileSync(file, JSON.stringify(deck, null, 2) + "\n");
  console.log(`updated ${rel}`);
}
