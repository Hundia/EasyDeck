// Glyph atlas: pre-renders 64 monospace characters to a single canvas strip.
// Each glyph occupies glyphW × glyphH pixels.
// SSR-safe: only runs in the browser.

export interface AtlasResult {
  canvas: HTMLCanvasElement | OffscreenCanvas;
  glyphW: number;
  glyphH: number;
  count: number;
}

// Characters: hex digits 0-F, half-width Katakana subset, numbers, brackets, dots
const GLYPHS: string[] = [
  // Hex digits (16)
  "0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F",
  // Numbers continuation / variants (8)
  "a","b","c","d","e","f","x","z",
  // Half-width Katakana (ｦ-ﾝ range, 16 picked)
  "ｦ","ｧ","ｨ","ｩ","ｪ","ｱ","ｲ","ｳ","ｴ","ｵ","ｶ","ｷ","ｸ","ｹ","ｺ","ﾃ",
  // Brackets / punctuation (8)
  "[","]","{","}","<",">","|","_",
  // Dots / operators (8)
  ".","·","·",":",";","·","!","?",
  // Misc symbols (8)
  "#","@","$","%","^","&","*","+",
];

// Ensure exactly 64 entries
while (GLYPHS.length < 64) GLYPHS.push("·");
const GLYPH_SET = GLYPHS.slice(0, 64);

const GLYPH_W = 6;
const GLYPH_H = 10;
const COUNT   = 64;

let atlas: AtlasResult | null = null;

export function getGlyphAtlas(): AtlasResult | null {
  if (typeof window === "undefined") return null;
  if (atlas) return atlas;

  const totalW = GLYPH_W * COUNT;

  // Prefer OffscreenCanvas for performance, fall back to regular canvas
  let canvas: HTMLCanvasElement | OffscreenCanvas;
  let ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

  if (typeof OffscreenCanvas !== "undefined") {
    canvas = new OffscreenCanvas(totalW, GLYPH_H);
    ctx = canvas.getContext("2d") as OffscreenCanvasRenderingContext2D;
  } else {
    canvas = document.createElement("canvas");
    (canvas as HTMLCanvasElement).width  = totalW;
    (canvas as HTMLCanvasElement).height = GLYPH_H;
    ctx = (canvas as HTMLCanvasElement).getContext("2d") as CanvasRenderingContext2D;
  }

  if (!ctx) return null;

  ctx.clearRect(0, 0, totalW, GLYPH_H);
  ctx.fillStyle    = "#ffffff";
  ctx.textBaseline = "top";
  ctx.textAlign    = "left";

  // Try JetBrains Mono first, fall back to system monospace
  const fontSize = 8;
  ctx.font = `${fontSize}px "JetBrains Mono", "Fira Mono", "Consolas", monospace`;

  for (let i = 0; i < COUNT; i++) {
    ctx.fillText(GLYPH_SET[i], i * GLYPH_W + 0.5, 1);
  }

  atlas = { canvas, glyphW: GLYPH_W, glyphH: GLYPH_H, count: COUNT };
  return atlas;
}

/** Reset the cached atlas (useful for testing or font-load callbacks). */
export function resetGlyphAtlas(): void {
  atlas = null;
}
