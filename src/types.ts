export type RiskLevel = "low" | "medium" | "high";

export type Tone = "polite" | "firm" | "legalistic" | "saul-style" | "mixed";

export type Urgency = "low" | "medium" | "high";

export interface SkillMeta {
  /** Slug name from frontmatter, e.g. "complaint-handler". */
  name: string;
  /** One-line description from frontmatter. */
  description: string;
  /** Whether the skill is user-invocable. */
  userInvocable: boolean;
  /** Parsed metadata object when the `metadata` frontmatter key is present. */
  metadata: Record<string, unknown> | null;
  /** Absolute path to the skill directory. */
  dir: string;
  /** Absolute path to the SKILL.md file. */
  file: string;
}

export interface Classification {
  primarySkill: string;
  secondarySkills: string[];
  knowledgeFiles: string[];
  riskLevel: RiskLevel;
  missingFacts: string[];
  matchedDomains: string[];
}

export interface DisputeCase {
  scenario: string;
  jurisdiction?: string;
  platform?: string;
  opponent?: string;
  desiredOutcome?: string;
  fallbackOutcome?: string;
  amountAtStake?: number | string;
  timeline?: string[];
  evidence?: string[];
  priorReplies?: string[];
  constraints?: string[];
  preferredTone?: Tone;
  urgency?: Urgency;
}

export interface ParsedExample {
  title: string;
  scenario: string;
  /** Skills explicitly referenced in the example's "Desired output" section. */
  suggestedSkills: string[];
  /** Raw body of the example file. */
  raw: string;
}

export interface ValidationIssue {
  level: "error" | "warning";
  message: string;
}

export interface ValidationResult {
  ok: boolean;
  issues: ValidationIssue[];
}

export interface PromptBundle {
  markdown: string;
  json: {
    soul: string;
    lore: { path: string; content: string }[];
    knowledge: { path: string; content: string }[];
    skill: { name: string; content: string } | null;
    outputFormat: string;
    classification: Classification;
    case: DisputeCase;
  };
}
