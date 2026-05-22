export interface CanvasDimensions {
  cssWidth: number;
  cssHeight: number;
  backingWidth: number;
  backingHeight: number;
  dpr: number;
}

/**
 * Computes canvas dimensions accounting for device pixel ratio.
 */
export function computeCanvasDimensions(
  containerWidth: number,
  containerHeight: number,
  dpr?: number
): CanvasDimensions {
  const effectiveDpr = dpr ?? (typeof window !== "undefined" ? window.devicePixelRatio : 1);
  return {
    cssWidth: containerWidth,
    cssHeight: containerHeight,
    backingWidth: Math.round(containerWidth * effectiveDpr),
    backingHeight: Math.round(containerHeight * effectiveDpr),
    dpr: effectiveDpr,
  };
}

/**
 * Applies computed dimensions to a canvas element.
 */
export function applyCanvasDimensions(
  canvas: HTMLCanvasElement,
  dims: CanvasDimensions
): void {
  canvas.width = dims.backingWidth;
  canvas.height = dims.backingHeight;
  canvas.style.width = `${dims.cssWidth}px`;
  canvas.style.height = `${dims.cssHeight}px`;
}
