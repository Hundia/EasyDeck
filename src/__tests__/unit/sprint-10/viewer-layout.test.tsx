import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import ViewerLayout from "@/app/viewer/layout";

vi.mock("next/navigation", () => ({
  usePathname: () => "/viewer",
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: ReactNode; href: string } & Record<string, unknown>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("Viewer layout", () => {
  it("renders branding, site link, and page content", () => {
    render(
      <ViewerLayout>
        <div>Dashboard body</div>
      </ViewerLayout>,
    );

    expect(screen.getByText("EasyDeck")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /back to main site/i })).toHaveAttribute("href", "/");
    expect(screen.getByRole("button", { name: /toggle navigation/i })).toBeInTheDocument();
    expect(screen.getByText("Dashboard body")).toBeInTheDocument();
  });
});
