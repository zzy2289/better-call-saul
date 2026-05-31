import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { skillMetaFromRaw } from "./frontmatter.js";
import type { SkillMeta } from "./types.js";

/** Discover all skills under `<root>/skills/<name>/SKILL.md`. */
export function discoverSkills(root: string): SkillMeta[] {
  const skillsDir = join(root, "skills");
  if (!existsSync(skillsDir)) return [];

  const skills: SkillMeta[] = [];
  for (const entry of readdirSync(skillsDir)) {
    const dir = join(skillsDir, entry);
    if (!statSync(dir).isDirectory()) continue;
    const file = join(dir, "SKILL.md");
    if (!existsSync(file)) continue;
    const raw = readFileSync(file, "utf8");
    skills.push(skillMetaFromRaw(raw, dir, file));
  }

  skills.sort((a, b) => a.name.localeCompare(b.name));
  return skills;
}

/** Find a single skill by its slug name, or null. */
export function findSkill(root: string, name: string): SkillMeta | null {
  return discoverSkills(root).find((s) => s.name === name) ?? null;
}
