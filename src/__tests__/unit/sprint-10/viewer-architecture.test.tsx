import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ViewerArchitecturePage from "@/app/viewer/architecture/page";

describe("Viewer architecture page", () => {
  it("renders the architecture diagrams and critical framework nodes", () => {
    render(<ViewerArchitecturePage />);

    expect(screen.getByRole("heading", { name: /architecture visualization/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /component tree/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /data flow diagram/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /layer architecture/i })).toBeInTheDocument();

    expect(screen.getByText("<Stage>")).toBeInTheDocument();
    expect(screen.getByText("resolveTransitionMode()")).toBeInTheDocument();
    expect(screen.getByText("<SectionStage>")).toBeInTheDocument();
    expect(screen.getByText("<ImageSequenceCanvas>")).toBeInTheDocument();
    expect(screen.getByText("NarrativeDesigner")).toBeInTheDocument();
    expect(screen.getByText("StorySchema")).toBeInTheDocument();
  });

  it("expands and collapses layer details on demand", () => {
    render(<ViewerArchitecturePage />);

    expect(screen.queryByText("ContentBriefSchema")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /story definition/i }));

    expect(screen.getByText("ContentBriefSchema")).toBeInTheDocument();
    expect(screen.getByText("StorySchema")).toBeInTheDocument();
    expect(screen.getByText("Scene definitions")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /story definition/i }));

    expect(screen.queryByText("ContentBriefSchema")).not.toBeInTheDocument();
  });
});
