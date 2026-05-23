import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { Sidebar } from "@/app/viewer/components/Sidebar";

const usePathnameMock = vi.fn(() => "/viewer/docs");

vi.mock("next/navigation", () => ({
  usePathname: () => usePathnameMock(),
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: ReactNode; href: string } & Record<string, unknown>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("Sidebar", () => {
  beforeEach(() => {
    usePathnameMock.mockReturnValue("/viewer/docs");
  });

  it("renders the viewer navigation links", () => {
    render(<Sidebar />);

    expect(screen.getByRole("link", { name: /dashboard/i })).toHaveAttribute("href", "/viewer");
    expect(screen.getByRole("link", { name: /architecture/i })).toHaveAttribute("href", "/viewer/architecture");
    expect(screen.getByRole("link", { name: /flows/i })).toHaveAttribute("href", "/viewer/flows");
    expect(screen.getByRole("link", { name: /docs/i })).toHaveAttribute("href", "/viewer/docs");
    expect(screen.getByRole("link", { name: /sprints/i })).toHaveAttribute("href", "/viewer/sprints");
    expect(screen.getByRole("link", { name: /schemas/i })).toHaveAttribute("href", "/viewer/schemas");
    expect(screen.getByRole("link", { name: /modes/i })).toHaveAttribute("href", "/viewer/modes");
  });

  it("marks the current route as active", () => {
    render(<Sidebar />);

    expect(screen.getByRole("link", { name: /docs/i })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: /dashboard/i })).not.toHaveAttribute("aria-current", "page");
  });
});
