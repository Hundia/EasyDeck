import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ViewerModesPage from "@/app/viewer/modes/page";

describe("Viewer modes page", () => {
  it("renders the transition mode cards", () => {
    render(<ViewerModesPage />);

    expect(screen.getByRole("heading", { name: /transition modes/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /section mode/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /snap mode/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /scrub mode/i })).toBeInTheDocument();
    expect(screen.getByText(/guided, presentation-style storytelling/i)).toBeInTheDocument();
    expect(screen.getByText(/explorable stories with natural settling/i)).toBeInTheDocument();
    expect(screen.getByText(/long visual reveals, parallax, reduced-motion fallback/i)).toBeInTheDocument();
  });

  it("shows flow diagrams, snippets, and the comparison table", () => {
    render(<ViewerModesPage />);

    expect(screen.getAllByText("Gesture").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Lenis").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText("ScrollTrigger").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText((_, element) => element?.tagName === "PRE" && element.textContent === '<Stage story={story} mode="section" />')).toBeInTheDocument();
    expect(screen.getByText((_, element) => element?.tagName === "PRE" && element.textContent === '<Stage story={story} mode="snap" />')).toBeInTheDocument();
    expect(screen.getByText((_, element) => element?.tagName === "PRE" && element.textContent === '<Stage story={story} mode="scrub" />')).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Hidden" })).toBeInTheDocument();
    expect(screen.getAllByRole("cell", { name: "Visible" }).length).toBeGreaterThanOrEqual(2);
    expect(screen.getByRole("cell", { name: "Observer" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: /progress \+ snap/i })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Linear" })).toBeInTheDocument();
  });
});
