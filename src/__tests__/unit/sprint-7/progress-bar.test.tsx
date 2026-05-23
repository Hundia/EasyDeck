import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProgressBar } from "@/components/ProgressBar";

describe("ProgressBar", () => {
  it("renders with progressbar role", () => {
    render(<ProgressBar progress={0.5} sceneCount={4} currentIndex={1} />);

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("has correct aria-valuenow based on progress", () => {
    render(<ProgressBar progress={0.55} sceneCount={4} currentIndex={2} />);

    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "55");
  });

  it("renders scene markers", () => {
    const { container } = render(<ProgressBar progress={0.5} sceneCount={4} currentIndex={1} />);

    expect(container.querySelectorAll("[class*='rounded-full']")).toHaveLength(6);
  });

  it("aria-label includes scene info", () => {
    render(<ProgressBar progress={0.25} sceneCount={4} currentIndex={1} />);

    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-label", "Presentation progress: scene 2 of 4");
  });
});
