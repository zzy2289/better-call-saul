import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { classify } from "./classifier.js";
import { findSkill } from "./skills.js";
import type { Classification, DisputeCase, PromptBundle } from "./types.js";

const LORE_FILES = [
  "lore/saul_memory_brief.md",
  "lore/saul_style_guide.md",
  "lore/character_boundaries.md",
];

function readIfExists(root: string, rel: string): string | null {
  const file = join(root, rel);
  return existsSync(file) ? readFileSync(file, "utf8") : null;
}

/**
 * Assemble a full prompt bundle (Markdown + JSON) from a dispute case.
 *
 * The bundle stitches together SOUL.md, lore, the classified knowledge packs,
 * the selected skill workflow, the output format contract, and the user's case
 * so it can be pasted directly into an OpenClaw session for testing.
 */
export function buildPromptBundle(root: string, input: DisputeCase | string): PromptBundle {
  const caseObj: DisputeCase = typeof input === "string" ? { scenario: input } : input;
  const classification: Classification = classify(caseObj);

  const soul = readIfExists(root, "SOUL.md") ?? "";

  const lore = LORE_FILES.map((rel) => ({ path: rel, content: readIfExists(root, rel) }))
    .filter((l): l is { path: string; content: string } => l.content !== null);

  const knowledge = classification.knowledgeFiles
    .map((rel) => ({ path: rel, content: readIfExists(root, rel) }))
    .filter((k): k is { path: string; content: string } => k.content !== null);

  const skillMeta = findSkill(root, classification.primarySkill);
  const skill = skillMeta
    ? { name: skillMeta.name, content: readFileSync(skillMeta.file, "utf8") }
    : null;

  const outputFormat = readIfExists(root, "prompts/output_formats.md") ?? "";

  const markdown = renderMarkdown({
    soul,
    lore,
    knowledge,
    skill,
    outputFormat,
    classification,
    caseObj,
  });

  return {
    markdown,
    json: { soul, lore, knowledge, skill, outputFormat, classification, case: caseObj },
  };
}

function renderMarkdown(args: {
  soul: string;
  lore: { path: string; content: string }[];
  knowledge: { path: string; content: string }[];
  skill: { name: string; content: string } | null;
  outputFormat: string;
  classification: Classification;
  caseObj: DisputeCase;
}): string {
  const { soul, lore, knowledge, skill, outputFormat, classification, caseObj } = args;
  const parts: string[] = [];

  parts.push("# Better Call Saul — Prompt Bundle\n");
  parts.push(
    [
      "## Routing",
      `- Primary skill: ${classification.primarySkill}`,
      `- Secondary skills: ${classification.secondarySkills.join(", ") || "none"}`,
      `- Risk level: ${classification.riskLevel}`,
      `- Matched domains: ${classification.matchedDomains.join(", ") || "none"}`,
      `- Missing facts: ${classification.missingFacts.join(", ") || "none"}`,
      "",
    ].join("\n"),
  );

  parts.push("## Persona (SOUL.md)\n");
  parts.push(soul.trim());

  if (lore.length) {
    parts.push("\n## Lore\n");
    for (const l of lore) parts.push(`<!-- ${l.path} -->\n${l.content.trim()}\n`);
  }

  if (knowledge.length) {
    parts.push("\n## Knowledge\n");
    for (const k of knowledge) parts.push(`<!-- ${k.path} -->\n${k.content.trim()}\n`);
  }

  if (skill) {
    parts.push(`\n## Skill: ${skill.name}\n`);
    parts.push(skill.content.trim());
  }

  parts.push("\n## Output Format\n");
  parts.push(outputFormat.trim());

  parts.push("\n## User Case\n");
  parts.push(renderCase(caseObj));

  return parts.join("\n");
}

function renderCase(c: DisputeCase): string {
  const lines: string[] = [`Scenario: ${c.scenario}`];
  if (c.jurisdiction) lines.push(`Jurisdiction: ${c.jurisdiction}`);
  if (c.platform) lines.push(`Platform: ${c.platform}`);
  if (c.opponent) lines.push(`Opponent: ${c.opponent}`);
  if (c.desiredOutcome) lines.push(`Desired outcome: ${c.desiredOutcome}`);
  if (c.fallbackOutcome) lines.push(`Fallback outcome: ${c.fallbackOutcome}`);
  if (c.amountAtStake !== undefined) lines.push(`Amount at stake: ${c.amountAtStake}`);
  if (c.timeline?.length) lines.push(`Timeline:\n${c.timeline.map((t) => `- ${t}`).join("\n")}`);
  if (c.evidence?.length) lines.push(`Evidence:\n${c.evidence.map((e) => `- ${e}`).join("\n")}`);
  if (c.priorReplies?.length) {
    lines.push(`Prior replies:\n${c.priorReplies.map((p) => `- ${p}`).join("\n")}`);
  }
  if (c.constraints?.length) {
    lines.push(`Constraints:\n${c.constraints.map((x) => `- ${x}`).join("\n")}`);
  }
  if (c.preferredTone) lines.push(`Preferred tone: ${c.preferredTone}`);
  if (c.urgency) lines.push(`Urgency: ${c.urgency}`);
  return lines.join("\n");
}
