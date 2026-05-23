import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SemanticLayer } from "@/components/SemanticLayer";
import type { SceneConfig } from "@/lib/schemas/scene";

const scenes: SceneConfig[] = [
  {
    id: "scene-0",
    label: "Intro",
    startFrame: 0,
    endFrame: 30,
    imageSequence: { pattern: "/frames/intro/{idx:0000}.webp", frameCount: 30 },
    overlays: [{ id: "overlay-0", type: "text", content: "Welcome", enterAt: 0, exitAt: 1, position: "center" }],
  },
  {
    id: "scene-1",
    label: "Details",
    startFrame: 30,
    endFrame: 60,
    imageSequence: { pattern: "/frames/details/{idx:0000}.webp", frameCount: 30 },
    overlays: [{ id: "overlay-1", type: "text", content: "More detail", enterAt: 0, exitAt: 1, position: "center" }],
  },
];

describe("SemanticLayer", () => {
  it("renders with sr-only class", () => {
    const { container } = render(<SemanticLayer scenes={scenes} currentIndex={1} />);

    expect(container.firstChild).toHaveClass("sr-only");
  });

  it("shows current scene label", () => {
    render(<SemanticLayer scenes={scenes} currentIndex={1} />);

    expect(screen.getByText("Scene 2 of 2: Details")).toBeInTheDocument();
  });

  it("has aria-live='polite'", () => {
    render(<SemanticLayer scenes={scenes} currentIndex={0} />);

    expect(screen.getByText("Scene 1 of 2: Intro").parentElement).toHaveAttribute("aria-live", "polite");
  });

  it("renders overlay content text", () => {
    render(<SemanticLayer scenes={scenes} currentIndex={0} />);

    expect(screen.getByText("Welcome")).toBeInTheDocument();
  });
});
