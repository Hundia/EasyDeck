import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ViewerSchemasPage from "@/app/viewer/schemas/page";

describe("Viewer schemas page", () => {
  it("renders the story schema explorer with examples and validation rules", () => {
    render(<ViewerSchemasPage />);

    expect(screen.getByRole("heading", { name: /schema explorer/i })).toBeInTheDocument();
    expect(screen.getByText(/zod validation schemas powering story configuration/i)).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "StorySchema" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Story title")).toBeInTheDocument();
    expect(screen.getByText(/frame continuity \(section mode\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Product Launch/i)).toBeInTheDocument();
    expect(screen.getByText(/Frame continuity violation: scene 's2' starts at 150 but previous ends at 100/i)).toBeInTheDocument();
  });

  it("switches schemas and updates the live examples", () => {
    render(<ViewerSchemasPage />);

    const contentBriefTab = screen.getByRole("tab", { name: "ContentBrief" });
    fireEvent.click(contentBriefTab);

    expect(contentBriefTab).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("sceneCount")).toBeInTheDocument();
    expect(screen.getAllByText(/professional/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/audience/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/topic/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/Frame continuity violation: scene 's2' starts at 150 but previous ends at 100/i)).not.toBeInTheDocument();
  });
});
