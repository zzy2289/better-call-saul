import { describe, expect, it } from "vitest";
import { findRepoRoot } from "../src/paths.js";
import { validateRepo } from "../src/validate.js";
import { discoverSkills } from "../src/skills.js";
import { checkReferenceSync } from "../src/references-sync.js";
import { buildPromptBundle } from "../src/prompt-bundler.js";
import { buildOpenClawConfigSnippet } from "../src/doctor.js";

const root = findRepoRoot(process.cwd());

describe("repo integration", () => {
  it("validates the real repo without errors", () => {
    const result = validateRepo(root);
    const errors = result.issues.filter((i) => i.level === "error");
    expect(errors, JSON.stringify(errors, null, 2)).toHaveLength(0);
    expect(result.ok).toBe(true);
  });

  it("discovers the four MVP skills", () => {
    const names = discoverSkills(root).map((s) => s.name);
    expect(names).toEqual(
      expect.arrayContaining([
        "complaint-handler",
        "negotiation-simulator",
        "angle-finder",
        "risk-assessor",
      ]),
    );
  });

  it("has all reference copies in sync", () => {
    const drifted = checkReferenceSync(root).filter((c) => c.status !== "ok");
    expect(drifted, JSON.stringify(drifted, null, 2)).toHaveLength(0);
  });

  it("builds a prompt bundle that includes persona, knowledge, and skill", () => {
    const bundle = buildPromptBundle(root, "Refund for a defective laptop not as described.");
    expect(bundle.markdown).toContain("Saul Fixer");
    expect(bundle.markdown).toContain("## Knowledge");
    expect(bundle.markdown).toContain("## Skill: complaint-handler");
    expect(bundle.json.skill?.name).toBe("complaint-handler");
    expect(bundle.json.knowledge.length).toBeGreaterThan(0);
  });

  it("builds an openclaw config snippet with the workspace path", () => {
    const snippet = buildOpenClawConfigSnippet("/abs/workspace");
    expect(snippet).toContain("/abs/workspace");
    expect(snippet).toContain("better-call-saul");
  });
});
