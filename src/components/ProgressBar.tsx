"use client";

export interface ProgressBarProps {
  progress: number;
  sceneCount: number;
  currentIndex: number;
}

/**
 * Vertical scroll-progress indicator with scene boundary markers.
 */
export function ProgressBar({ progress, sceneCount, currentIndex }: ProgressBarProps) {
  return (
    <div
      className="fixed left-2 top-1/2 z-50 h-1/2 w-1 -translate-y-1/2 rounded-full bg-white/20"
      role="progressbar"
      aria-valuenow={Math.round(progress * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Presentation progress: scene ${currentIndex + 1} of ${sceneCount}`}
    >
      <div
        className="absolute bottom-0 left-0 w-full rounded-full bg-white transition-all duration-300"
        style={{ height: `${progress * 100}%` }}
      />
      {Array.from({ length: sceneCount }, (_, index) => (
        <div
          key={index}
          className={`absolute left-1/2 h-2 w-2 -translate-x-1/2 rounded-full border border-white/50 ${
            index <= currentIndex ? "bg-white" : "bg-white/30"
          }`}
          style={{ bottom: `${(index / Math.max(1, sceneCount - 1)) * 100}%` }}
        />
      ))}
    </div>
  );
}
