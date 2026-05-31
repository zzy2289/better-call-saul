import matter from "gray-matter";
import type { SkillMeta } from "./types.js";

export interface RawFrontmatter {
  data: Record<string, unknown>;
  content: string;
}

/** Parse YAML frontmatter from a Markdown string. */
export function parseFrontmatter(raw: string): RawFrontmatter {
  const parsed = matter(raw);
  return { data: parsed.data as Record<string, unknown>, content: parsed.content };
}

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isSlug(value: string): boolean {
  return SLUG_RE.test(value);
}

/**
 * Build a {@link SkillMeta} from a skill's raw SKILL.md content.
 *
 * Throws when required frontmatter (`name`, `description`) is missing or malformed
 * so callers (validator / loader) can surface precise errors.
 */
export function skillMetaFromRaw(raw: string, dir: string, file: string): SkillMeta {
  const { data } = parseFrontmatter(raw);

  const name = data.name;
  if (typeof name !== "string" || name.length === 0) {
    throw new Error(`Skill at ${file} is missing a string "name" in frontmatter.`);
  }
  if (!isSlug(name)) {
    throw new Error(`Skill name "${name}" in ${file} is not a lowercase slug.`);
  }

  const description = data.description;
  if (typeof description !== "string" || description.trim().length === 0) {
    throw new Error(`Skill "${name}" in ${file} is missing a non-empty "description".`);
  }

  let metadata: Record<string, unknown> | null = null;
  if (data.metadata !== undefined) {
    if (typeof data.metadata === "string") {
      // gray-matter leaves inline JSON-as-string untouched in some cases.
      metadata = JSON.parse(data.metadata) as Record<string, unknown>;
    } else if (typeof data.metadata === "object" && data.metadata !== null) {
      metadata = data.metadata as Record<string, unknown>;
    } else {
      throw new Error(`Skill "${name}" has invalid "metadata" frontmatter.`);
    }
  }

  const userInvocable = data["user-invocable"] === true;

  return { name, description, userInvocable, metadata, dir, file };
}
