import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ViewerFlowsPage from "@/app/viewer/flows/page";

describe("Viewer flows page", () => {
  it("renders the user experience flow diagrams", () => {
    render(<ViewerFlowsPage />);

    expect(screen.getByRole("heading", { name: /user experience flows/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /section mode flow/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /snap mode flow/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /scrub mode flow/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /agent pipeline flow/i })).toBeInTheDocument();
  });

  it("shows the key steps for each runtime pipeline", () => {
    render(<ViewerFlowsPage />);

    expect(screen.getByText("Wheel/Touch/Key")).toBeInTheDocument();
    expect(screen.getByText("GSAP Observer")).toBeInTheDocument();
    expect(screen.getByText("labelsDirectional snap")).toBeInTheDocument();
    expect(screen.getByText("scrub:true")).toBeInTheDocument();
    expect(screen.getByText("Zod validate")).toBeInTheDocument();
    expect(screen.getAllByText("Canvas draw").length).toBeGreaterThan(1);
  });
});
