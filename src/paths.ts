import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Resolve the repository root by walking up from this file until a directory
 * containing both `SOUL.md` and a `skills/` folder is found.
 *
 * This keeps the CLI working whether it runs from `src/` via tsx or from the
 * compiled `dist/` output.
 */
export function findRepoRoot(startDir?: string): string {
  const start = startDir ?? dirname(fileURLToPath(import.meta.url));
  let current = resolve(start);

  // Walk up at most a sane number of levels to avoid infinite loops.
  for (let i = 0; i < 12; i += 1) {
    if (existsSync(join(current, "SOUL.md")) && existsSync(join(current, "skills"))) {
      return current;
    }
    const parent = dirname(current);
    if (parent === current) break;
    current = parent;
  }

  throw new Error(
    "Could not locate the Better Call Saul repo root (no SOUL.md + skills/ found).",
  );
}

export const SKILL_NAMES = [
  "complaint-handler",
  "negotiation-simulator",
  "angle-finder",
  "risk-assessor",
] as const;

export const REQUIRED_ROOT_FILES = [
  "README.md",
  "SOUL.md",
  "AGENTS.md",
  "DISCLAIMER.md",
  "SECURITY.md",
  "CONTRIBUTING.md",
  "docs/SAFETY_POLICY.md",
  "prompts/output_formats.md",
  "schema/dispute_case.schema.json",
  "schema/saul_output.schema.json",
] as const;

export const REQUIRED_DIRS = [
  "knowledge",
  "lore",
  "skills",
  "prompts",
  "schema",
  "examples",
  "docs",
] as const;
