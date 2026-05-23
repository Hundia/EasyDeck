import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ViewerSprintsPage from "@/app/viewer/sprints/page";

describe("Viewer sprints page", () => {
  it("renders the sprint timeline hero and summary stats", () => {
    render(<ViewerSprintsPage />);

    expect(screen.getByRole("heading", { name: /sprint timeline/i })).toBeInTheDocument();
    expect(screen.getByText(/10 delivery checkpoints from bootstrap to the framework viewer/i)).toBeInTheDocument();
    expect(screen.getByText((_, element) => element?.tagName === "ARTICLE" && element.textContent === "9Sprints Complete")).toBeInTheDocument();
    expect(screen.getByText((_, element) => element?.tagName === "ARTICLE" && element.textContent === "255+Tests")).toBeInTheDocument();
    expect(screen.getByText((_, element) => element?.tagName === "ARTICLE" && element.textContent === "~100Files")).toBeInTheDocument();
    expect(screen.getByText("Cumulative test growth")).toBeInTheDocument();
  });

  it("renders every sprint and highlights the active one", () => {
    render(<ViewerSprintsPage />);

    expect(screen.getAllByText("Sprint 1").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Next.js Bootstrap + Schema Layer")).toBeInTheDocument();
    expect(screen.getAllByText("Sprint 10").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Framework Viewer & Documentation App")).toBeInTheDocument();
    expect(screen.getByText("255 tests")).toBeInTheDocument();
    expect(screen.getByText("14 files")).toBeInTheDocument();
    expect(screen.getByText("In progress")).toBeInTheDocument();
    expect(screen.getAllByText("Complete").length).toBeGreaterThanOrEqual(1);
  });
});
