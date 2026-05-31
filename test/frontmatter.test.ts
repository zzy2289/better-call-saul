import { describe, expect, it } from "vitest";
import { isSlug, skillMetaFromRaw } from "../src/frontmatter.js";

const VALID = `---
name: complaint-handler
description: Handle complaints and refunds.
user-invocable: true
metadata: {"openclaw":{"always":true}}
---

# Complaint Handler
`;

describe("frontmatter", () => {
  it("parses a valid skill", () => {
    const meta = skillMetaFromRaw(VALID, "/x/skills/complaint-handler", "/x/skills/complaint-handler/SKILL.md");
    expect(meta.name).toBe("complaint-handler");
    expect(meta.description).toContain("complaints");
    expect(meta.userInvocable).toBe(true);
    expect(meta.metadata).toEqual({ openclaw: { always: true } });
  });

  it("rejects a missing name", () => {
    const raw = VALID.replace("name: complaint-handler\n", "");
    expect(() => skillMetaFromRaw(raw, "/x", "/x/SKILL.md")).toThrow(/name/);
  });

  it("rejects a non-slug name", () => {
    const raw = VALID.replace("complaint-handler", "Complaint Handler");
    expect(() => skillMetaFromRaw(raw, "/x", "/x/SKILL.md")).toThrow(/slug/);
  });

  it("rejects an empty description", () => {
    const raw = VALID.replace("description: Handle complaints and refunds.", "description: ");
    expect(() => skillMetaFromRaw(raw, "/x", "/x/SKILL.md")).toThrow(/description/);
  });

  it("validates slugs", () => {
    expect(isSlug("complaint-handler")).toBe(true);
    expect(isSlug("angle-finder")).toBe(true);
    expect(isSlug("Bad Name")).toBe(false);
    expect(isSlug("UPPER")).toBe(false);
    expect(isSlug("-leading")).toBe(false);
  });
});
