import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { REQUIRED_DIRS, REQUIRED_ROOT_FILES, SKILL_NAMES } from "./paths.js";
import { discoverSkills } from "./skills.js";
import { checkReferenceSync } from "./references-sync.js";
import type { SkillMeta, ValidationIssue, ValidationResult } from "./types.js";

/** Run all repo validation checks and aggregate issues. */
export function validateRepo(root: string): ValidationResult {
  const issues: ValidationIssue[] = [];

  // 1. Required root files.
  for (const rel of REQUIRED_ROOT_FILES) {
    if (!existsSync(join(root, rel))) {
      issues.push({ level: "error", message: `Missing required file: ${rel}` });
    }
  }

  // 2. Required directories.
  for (const rel of REQUIRED_DIRS) {
    const dir = join(root, rel);
    if (!existsSync(dir) || !statSync(dir).isDirectory()) {
      issues.push({ level: "error", message: `Missing required directory: ${rel}/` });
    }
  }

  // 3. Skills exist and have valid frontmatter (discoverSkills throws on bad frontmatter).
  let discovered: SkillMeta[];
  try {
    discovered = discoverSkills(root);
  } catch (err) {
    issues.push({ level: "error", message: (err as Error).message });
    discovered = [];
  }
  const discoveredNames = new Set(discovered.map((s) => s.name));
  for (const name of SKILL_NAMES) {
    if (!discoveredNames.has(name)) {
      issues.push({ level: "error", message: `Missing required skill: ${name}` });
    }
  }

  // 4. Schemas are valid JSON.
  for (const rel of ["schema/dispute_case.schema.json", "schema/saul_output.schema.json"]) {
    const file = join(root, rel);
    if (!existsSync(file)) continue; // already reported above
    try {
      JSON.parse(readFileSync(file, "utf8"));
    } catch (err) {
      issues.push({ level: "error", message: `Invalid JSON in ${rel}: ${(err as Error).message}` });
    }
  }

  // 5. Examples exist and are non-empty.
  const examplesDir = join(root, "examples");
  if (existsSync(examplesDir)) {
    const examples = readdirSync(examplesDir).filter((f) => f.endsWith(".md"));
    if (examples.length === 0) {
      issues.push({ level: "warning", message: "No example files found in examples/." });
    }
    for (const ex of examples) {
      const content = readFileSync(join(examplesDir, ex), "utf8").trim();
      if (content.length === 0) {
        issues.push({ level: "error", message: `Empty example file: examples/${ex}` });
      }
    }
  }

  // 6. References drift check (prevents skill copies from going stale).
  for (const check of checkReferenceSync(root)) {
    if (check.status === "drift") {
      issues.push({
        level: "error",
        message: `Reference out of sync: ${check.referenceFile} differs from ${check.sourceFile}`,
      });
    } else if (check.status === "missing-source") {
      issues.push({
        level: "error",
        message: `Reference source missing: ${check.referenceFile} -> ${check.sourceFile}`,
      });
    }
  }

  const hasError = issues.some((i) => i.level === "error");
  return { ok: !hasError, issues };
}
