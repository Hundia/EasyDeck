import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CodeBlock } from "@/app/viewer/components/CodeBlock";

describe("CodeBlock", () => {
  it("renders validation status and error messaging", () => {
    render(
      <>
        <CodeBlock code={'{\n  "mode": "section"\n}'} language="json" status="valid" />
        <CodeBlock
          code={'{\n  "mode": "section",\n  "gap": true\n}'}
          language="json"
          status="invalid"
          error="Frame continuity violation"
        />
      </>,
    );

    expect(screen.getByText("Valid example")).toBeInTheDocument();
    expect(screen.getByText("Invalid example")).toBeInTheDocument();
    expect(screen.getByText("Frame continuity violation")).toBeInTheDocument();
    expect(screen.getAllByText(/"mode": "section"/i).length).toBeGreaterThan(0);
  });
});
