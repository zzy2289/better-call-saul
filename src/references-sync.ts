import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { basename, join } from "node:path";
import { discoverSkills } from "./skills.js";

export interface ReferenceCheck {
  skill: string;
  referenceFile: string;
  sourceFile: string;
  status: "ok" | "drift" | "missing-source";
}

const COPIED_FROM_RE = /`([^`]+)`\s+copied from\s+`([^`]+)`/i;

/**
 * Map a reference filename back to its repo-root source path using the
 * `dir__file.md` convention (the first `__` becomes a path separator).
 *
 * Examples:
 *   SOUL.md                          -> SOUL.md
 *   knowledge__ecommerce_refunds.md  -> knowledge/ecommerce_refunds.md
 *   prompts__output_formats.md       -> prompts/output_formats.md
 *   docs__SAFETY_POLICY.md           -> docs/SAFETY_POLICY.md
 */
export function referenceToSource(referenceFileName: string): string | null {
  if (referenceFileName === "README.md") return null;
  const idx = referenceFileName.indexOf("__");
  if (idx === -1) {
    // Root-level file such as SOUL.md.
    return referenceFileName;
  }
  const dir = referenceFileName.slice(0, idx);
  const rest = referenceFileName.slice(idx + 2);
  return `${dir}/${rest}`;
}

/**
 * Parse a references/README.md into an explicit reference -> source map.
 * Falls back silently to {} when the README has no mapping lines.
 */
export function parseReferencesReadme(readmePath: string): Map<string, string> {
  const map = new Map<string, string>();
  if (!existsSync(readmePath)) return map;
  for (const line of readFileSync(readmePath, "utf8").split("\n")) {
    const m = line.match(COPIED_FROM_RE);
    if (m && m[1] && m[2]) map.set(m[1], m[2]);
  }
  return map;
}

/**
 * Check every skill's `references/` copies against their repo-root sources and
 * report any that have drifted out of sync (or whose source is missing).
 */
export function checkReferenceSync(root: string): ReferenceCheck[] {
  const results: ReferenceCheck[] = [];

  for (const skill of discoverSkills(root)) {
    const refDir = join(skill.dir, "references");
    if (!existsSync(refDir)) continue;

    const readmeMap = parseReferencesReadme(join(refDir, "README.md"));

    for (const entry of readdirSync(refDir)) {
      const refPath = join(refDir, entry);
      if (!statSync(refPath).isFile()) continue;
      if (entry === "README.md") continue;

      const sourceRel = readmeMap.get(entry) ?? referenceToSource(entry);
      if (!sourceRel) continue;

      const sourcePath = join(root, sourceRel);
      if (!existsSync(sourcePath)) {
        results.push({
          skill: skill.name,
          referenceFile: `${skill.name}/references/${basename(refPath)}`,
          sourceFile: sourceRel,
          status: "missing-source",
        });
        continue;
      }

      const refContent = readFileSync(refPath, "utf8");
      const srcContent = readFileSync(sourcePath, "utf8");
      results.push({
        skill: skill.name,
        referenceFile: `${skill.name}/references/${basename(refPath)}`,
        sourceFile: sourceRel,
        status: refContent === srcContent ? "ok" : "drift",
      });
    }
  }

  return results;
}
