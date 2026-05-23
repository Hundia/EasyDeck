import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ViewerDocsPage from "@/app/viewer/docs/page";

describe("Viewer docs page", () => {
  it("renders the docs tree and shows the architecture overview by default", () => {
    render(<ViewerDocsPage />);

    expect(screen.getByRole("heading", { name: "Framework Docs" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Architecture / Overview" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Development / Sprint Workflow" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Architecture Overview" })).toBeInTheDocument();
    expect(screen.getByText(/Story definition, agent pipeline, stage runtime, canvas engine, and UX shell stay separated/i)).toBeInTheDocument();
  });

  it("switches the displayed doc and updates the active toc item", () => {
    render(<ViewerDocsPage />);

    const lenisButton = screen.getByRole("button", { name: "Integration / Lenis" });
    fireEvent.click(lenisButton);

    expect(screen.getByRole("heading", { name: "Lenis Integration" })).toBeInTheDocument();
    expect(screen.getByText(/section mode pauses Lenis because Observer already owns gesture control/i)).toBeInTheDocument();
    expect(lenisButton).toHaveAttribute("aria-current", "true");
    expect(screen.getByRole("button", { name: "Architecture / Overview" })).not.toHaveAttribute("aria-current", "true");
  });
});
