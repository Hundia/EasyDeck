import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SchemaTree } from "@/app/viewer/components/SchemaTree";

describe("SchemaTree", () => {
  it("renders nested fields with type badges, descriptions, and optional markers", () => {
    render(
      <SchemaTree
        fields={[
          {
            name: "meta",
            type: "object",
            description: "Story metadata",
            children: [
              {
                name: "author",
                type: "string",
                optional: true,
                description: "Optional author name",
              },
              {
                name: "totalFrames",
                type: "number",
                description: "Total frame count",
              },
            ],
          },
          {
            name: "scenes",
            type: "array",
            description: "Scene list",
          },
        ]}
      />,
    );

    expect(screen.getByText("meta")).toBeInTheDocument();
    expect(screen.getByText("Story metadata")).toBeInTheDocument();
    expect(screen.getByText("author")).toBeInTheDocument();
    expect(screen.getByText("?")).toBeInTheDocument();
    expect(screen.getByText("Optional author name")).toBeInTheDocument();
    expect(screen.getByText("totalFrames")).toBeInTheDocument();
    expect(screen.getByText("scenes")).toBeInTheDocument();
    expect(screen.getByText("array")).toBeInTheDocument();
    expect(screen.getByText("number")).toBeInTheDocument();
    expect(screen.getAllByText("string").length).toBeGreaterThan(0);
  });
});
