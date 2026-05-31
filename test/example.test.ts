import { describe, expect, it } from "vitest";
import { parseExample } from "../src/example.js";

const SAMPLE = `# Example: E-commerce refund for used item sold as new

## User scenario

I bought a laptop sold as new but it arrived scratched. The seller refuses a refund.

## Desired output

Use \`complaint-handler\` and \`angle-finder\`.

Expected angle:

- Not as described.
`;

describe("example parser", () => {
  it("extracts title, scenario, and suggested skills", () => {
    const parsed = parseExample(SAMPLE, "amazon_refund.md");
    expect(parsed.title).toBe("E-commerce refund for used item sold as new");
    expect(parsed.scenario).toContain("sold as new");
    expect(parsed.suggestedSkills).toEqual(["complaint-handler", "angle-finder"]);
  });

  it("falls back to the file name when there is no title", () => {
    const parsed = parseExample("## User scenario\n\nSomething.", "fallback.md");
    expect(parsed.title).toBe("fallback.md");
    expect(parsed.scenario).toBe("Something.");
  });
});
