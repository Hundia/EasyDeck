export type ProgressCallback = (progress: number) => void;

/**
 * Resolves a frame pattern like "/frames/hero/{idx:0000}.webp" to a URL.
 * {idx:0000} means zero-padded to 4 digits.
 */
export function resolveFrameUrl(pattern: string, index: number): string {
  return pattern.replace(/\{idx:(\d+)\}/, (_, pad) => {
    return String(index).padStart(pad.length, "0");
  });
}

/**
 * Preloads all frames and reports progress.
 * Returns array of loaded HTMLImageElement (or null for failed frames).
 */
export function preloadFrames(
  pattern: string,
  frameCount: number,
  onProgress?: ProgressCallback
): Promise<(HTMLImageElement | null)[]> {
  return new Promise((resolve) => {
    const images: (HTMLImageElement | null)[] = new Array(frameCount).fill(null);
    let loaded = 0;

    if (frameCount === 0) {
      onProgress?.(1);
      resolve(images);
      return;
    }

    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      img.src = resolveFrameUrl(pattern, i);

      const onDone = () => {
        loaded++;
        onProgress?.(loaded / frameCount);
        if (loaded === frameCount) resolve(images);
      };

      img.onload = () => {
        images[i] = img;
        onDone();
      };
      img.onerror = () => {
        images[i] = null;
        onDone();
      };
    }
  });
}
