import { readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { findRepoRoot } from "../src/paths.js";
import { parseExampleFile } from "../src/example.js";
import { classify } from "../src/classifier.js";
import { buildPromptBundle } from "../src/prompt-bundler.js";

/**
 * Regression snapshots for every example.
 *
 * The prompt bundle is fully deterministic (no LLM), so snapshotting it locks
 * in the "standard complete output" of the routing + assembly pipeline. Any
 * accidental drift in SOUL.md, lore, knowledge packs, skills, the output
 * format, or the classifier will surface here as a failed snapshot.
 */
const root = findRepoRoot(process.cwd());
const examplesDir = join(root, "examples");
const exampleFiles = readdirSync(examplesDir)
  .filter((name) => name.endsWith(".md"))
  .sort();

describe("example output snapshots", () => {
  it("discovers all example files", () => {
    expect(exampleFiles.length).toBeGreaterThanOrEqual(5);
  });

  for (const file of exampleFiles) {
    it(`produces a stable classification + bundle for ${file}`, () => {
      const parsed = parseExampleFile(join(examplesDir, file));
      const classification = classify({ scenario: parsed.scenario });
      const bundle = buildPromptBundle(root, { scenario: parsed.scenario });

      expect({
        title: parsed.title,
        suggestedSkills: parsed.suggestedSkills,
        classification,
      }).toMatchSnapshot("routing");

      expect(bundle.markdown).toMatchSnapshot("bundle-markdown");
    });
  }
});
