import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SkipToContent } from "@/components/SkipToContent";

describe("SkipToContent", () => {
  it("renders link with correct href", () => {
    render(<SkipToContent targetId="deck" />);

    expect(screen.getByRole("link", { name: "Skip to presentation content" })).toHaveAttribute("href", "#deck");
  });

  it("has sr-only class", () => {
    render(<SkipToContent />);

    expect(screen.getByRole("link", { name: "Skip to presentation content" })).toHaveClass("sr-only");
  });

  it("contains skip text", () => {
    render(<SkipToContent />);

    expect(screen.getByText("Skip to presentation content")).toBeInTheDocument();
  });
});
