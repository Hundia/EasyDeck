import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ViewerDashboardPage from "@/app/viewer/page";

describe("Viewer dashboard page", () => {
  it("renders the framework hero and stat cards", () => {
    render(<ViewerDashboardPage />);

    expect(screen.getByRole("heading", { name: "EasyDeck Framework" })).toBeInTheDocument();
    expect(screen.getByText("255 Tests Passing")).toBeInTheDocument();
    expect(screen.getByText("9 Sprints Complete")).toBeInTheDocument();
    expect(screen.getByText("138KB Bundle")).toBeInTheDocument();
    expect(screen.getByText("/ 200KB budget")).toBeInTheDocument();
  });

  it("renders architecture layers and feature cards", () => {
    render(<ViewerDashboardPage />);

    expect(screen.getByText("Story Definition")).toBeInTheDocument();
    expect(screen.getAllByText("Agent Pipeline").length).toBeGreaterThan(0);
    expect(screen.getByText("Stage Runtime")).toBeInTheDocument();
    expect(screen.getAllByText("Canvas Engine").length).toBeGreaterThan(0);
    expect(screen.getByText("UX Shell")).toBeInTheDocument();

    expect(screen.getByRole("heading", { name: "Transition Modes" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Canvas Engine" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Lenis Smoothing" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Accessibility" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Agent Pipeline" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Design Tokens" })).toBeInTheDocument();
  });
});
