"use client";

export interface SkipToContentProps {
  targetId?: string;
}

/**
 * Skip-to-content link. Visible only on keyboard focus.
 */
export function SkipToContent({ targetId = "main-stage" }: SkipToContentProps) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[9999] focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-black focus:shadow-lg focus:outline-2 focus:outline-offset-2"
    >
      Skip to presentation content
    </a>
  );
}
