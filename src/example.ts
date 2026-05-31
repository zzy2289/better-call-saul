import { readFileSync } from "node:fs";
import { basename } from "node:path";
import type { ParsedExample } from "./types.js";

/**
 * Parse an example Markdown file into a structured object.
 *
 * Examples follow the convention:
 *   # Example: <title>
 *   ## User scenario
 *   <free text>
 *   ## Desired output
 *   Use `skill-a`, `skill-b`, and `skill-c`.
 */
export function parseExampleFile(path: string): ParsedExample {
  const raw = readFileSync(path, "utf8");
  return parseExample(raw, basename(path));
}

export function parseExample(raw: string, fallbackName: string): ParsedExample {
  const titleMatch = raw.match(/^#\s+(?:Example:\s*)?(.+)$/m);
  const title = titleMatch?.[1]?.trim() ?? fallbackName;

  const scenario = extractSection(raw, "User scenario") ?? "";

  const desired = extractSection(raw, "Desired output") ?? "";
  const suggestedSkills = [...desired.matchAll(/`([a-z0-9-]+)`/g)].map((m) => m[1]!);

  return {
    title,
    scenario: scenario.trim(),
    suggestedSkills: [...new Set(suggestedSkills)],
    raw,
  };
}

/** Extract the body of a `## <heading>` section up to the next `## ` heading. */
function extractSection(raw: string, heading: string): string | null {
  const re = new RegExp(`^##\\s+${escapeRe(heading)}\\s*\\n([\\s\\S]*?)(?=\\n##\\s|$(?![\\s\\S]))`, "im");
  const m = raw.match(re);
  return m?.[1] ?? null;
}

function escapeRe(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
