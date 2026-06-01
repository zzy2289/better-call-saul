import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { classify } from "../src/classifier.js";
import { buildPromptBundle } from "../src/prompt-bundler.js";
import { findRepoRoot } from "../src/paths.js";
import type { DisputeCase } from "../src/types.js";

interface EvalExpectation {
  primarySkill?: string;
  matchedDomains?: string[];
  riskLevel?: string;
  knowledgeFilesContain?: string[];
}

interface EvalCase {
  id: string;
  title: string;
  scenario: string;
  jurisdiction?: string;
  platform?: string;
  amountAtStake?: number | string;
  language?: string;
  expected: EvalExpectation & {
    requiredSections?: string[];
    mustMentionConcepts?: string[];
    mustNotSuggest?: string[];
    languageCheck?: string;
  };
}

/**
 * Score a single eval case across routing AND output-quality dimensions.
 * Routing (5): primarySkill, domainMatch, riskLevel, knowledgeFiles, bundleComplete
 * Quality (4): requiredSections, conceptCoverage, guardrails, languageCheck
 */
function scoreCase(
  evalCase: EvalCase,
  classification: ReturnType<typeof classify>,
  bundle: ReturnType<typeof buildPromptBundle>,
): { score: number; maxScore: number; details: Record<string, boolean> } {
  const details: Record<string, boolean> = {};
  let score = 0;
  let maxScore = 0;
  const md = bundle.markdown;
  const mdLower = md.toLowerCase();

  // --- Routing dimensions (1–5) ---

  // 1. Primary skill routing (weight: 1)
  if (evalCase.expected.primarySkill) {
    maxScore += 1;
    const pass = classification.primarySkill === evalCase.expected.primarySkill;
    details.primarySkill = pass;
    if (pass) score += 1;
  }

  // 2. Domain matching (weight: 1)
  if (evalCase.expected.matchedDomains) {
    maxScore += 1;
    const pass = evalCase.expected.matchedDomains.every((d) =>
      classification.matchedDomains.includes(d),
    );
    details.domainMatch = pass;
    if (pass) score += 1;
  }

  // 3. Risk level (weight: 1)
  if (evalCase.expected.riskLevel) {
    maxScore += 1;
    const pass = classification.riskLevel === evalCase.expected.riskLevel;
    details.riskLevel = pass;
    if (pass) score += 1;
  }

  // 4. Knowledge files inclusion (weight: 1)
  if (evalCase.expected.knowledgeFilesContain) {
    maxScore += 1;
    const pass = evalCase.expected.knowledgeFilesContain.every((kf) =>
      classification.knowledgeFiles.includes(kf),
    );
    details.knowledgeFiles = pass;
    if (pass) score += 1;
  }

  // 5. Bundle completeness (weight: 1)
  {
    maxScore += 1;
    const hasCore =
      md.includes("## Persona (SOUL.md)") &&
      md.includes("## Knowledge") &&
      md.includes("## User Case");
    const langOk =
      !evalCase.language || evalCase.language === "en" || md.includes("## Language Instruction");
    const pass = hasCore && langOk;
    details.bundleComplete = pass;
    if (pass) score += 1;
  }

  // --- Output-quality dimensions (6–9) ---

  // 6. Required sections: bundle output format template mentions each section (weight: 1)
  if (evalCase.expected.requiredSections && evalCase.expected.requiredSections.length > 0) {
    maxScore += 1;
    const pass = evalCase.expected.requiredSections.every((sec) =>
      mdLower.includes(sec.toLowerCase()),
    );
    details.requiredSections = pass;
    if (pass) score += 1;
  }

  // 7. Concept coverage: key domain concepts appear in bundle knowledge/skill content (weight: 1)
  // Most mustMentionConcepts are LLM *output* expectations, not prompt content.
  // We verify domain relevance: at least one concept appears in the bundle
  // (via knowledge files, user scenario, or skill content).
  if (evalCase.expected.mustMentionConcepts && evalCase.expected.mustMentionConcepts.length > 0) {
    maxScore += 1;
    const found = evalCase.expected.mustMentionConcepts.filter((concept) =>
      mdLower.includes(concept.toLowerCase()),
    );
    const pass = found.length >= 1;
    details.conceptCoverage = pass;
    if (pass) score += 1;
  }

  // 8. Guardrails present: safety policy or SOUL.md safety rules are in the bundle (weight: 1)
  if (evalCase.expected.mustNotSuggest && evalCase.expected.mustNotSuggest.length > 0) {
    maxScore += 1;
    // For elevated risk: Safety Policy section must be present
    // For all cases: SOUL.md persona (which contains safety red lines) must be present
    const hasSafetyRules =
      md.includes("## Safety Policy") ||
      (md.includes("## Persona (SOUL.md)") && mdLower.includes("red line"));
    details.guardrails = hasSafetyRules;
    if (hasSafetyRules) score += 1;
  }

  // 9. Language check: verify language handling matches expected (weight: 1)
  if (evalCase.expected.languageCheck) {
    maxScore += 1;
    const lc = evalCase.expected.languageCheck.toLowerCase();
    let pass = false;
    if (lc.includes("both english and chinese") || lc.includes("bilingual")) {
      pass = md.includes("## Language Instruction") && mdLower.includes("bilingual");
    } else if (lc.includes("chinese") || lc.includes("中文")) {
      pass = md.includes("## Language Instruction");
    } else {
      // Generic: language instruction present
      pass = md.includes("## Language Instruction");
    }
    details.languageCheck = pass;
    if (pass) score += 1;
  }

  return { score, maxScore, details };
}

const root = findRepoRoot(process.cwd());
const casesDir = join(root, "eval", "cases");
const caseFiles = readdirSync(casesDir)
  .filter((f) => f.endsWith(".json"))
  .sort();

/** Collect scores across all cases for baseline recording. */
const allScores: { id: string; title: string; score: number; maxScore: number; pct: number; details: Record<string, boolean> }[] = [];

describe("evaluation set — routing accuracy", () => {
  it("discovers evaluation cases", () => {
    expect(caseFiles.length).toBeGreaterThanOrEqual(10);
  });

  for (const file of caseFiles) {
    const evalCase: EvalCase = JSON.parse(readFileSync(join(casesDir, file), "utf8"));

    describe(evalCase.title, () => {
      const disputeCase: DisputeCase = {
        scenario: evalCase.scenario,
        jurisdiction: evalCase.jurisdiction,
        platform: evalCase.platform,
        amountAtStake: evalCase.amountAtStake,
        language: evalCase.language,
      };

      const classification = classify(disputeCase);
      const bundle = buildPromptBundle(root, disputeCase);
      const caseScore = scoreCase(evalCase, classification, bundle);
      const casePct = Math.round((caseScore.score / caseScore.maxScore) * 100);

      // Record score for baseline
      allScores.push({
        id: evalCase.id,
        title: evalCase.title,
        score: caseScore.score,
        maxScore: caseScore.maxScore,
        pct: casePct,
        details: caseScore.details,
      });

      if (evalCase.expected.primarySkill) {
        it("routes to correct primary skill", () => {
          expect(classification.primarySkill).toBe(evalCase.expected.primarySkill);
        });
      }

      if (evalCase.expected.matchedDomains) {
        it("matches expected domains", () => {
          for (const domain of evalCase.expected.matchedDomains!) {
            expect(classification.matchedDomains).toContain(domain);
          }
        });
      }

      if (evalCase.expected.riskLevel) {
        it("detects correct risk level", () => {
          expect(classification.riskLevel).toBe(evalCase.expected.riskLevel);
        });
      }

      if (evalCase.expected.knowledgeFilesContain) {
        it("includes required knowledge files", () => {
          for (const kf of evalCase.expected.knowledgeFilesContain!) {
            expect(classification.knowledgeFiles).toContain(kf);
          }
        });
      }

      it("bundle includes all knowledge and skill content", () => {
        expect(bundle.markdown).toContain("## Persona (SOUL.md)");
        expect(bundle.markdown).toContain("## Knowledge");
        expect(bundle.markdown).toContain("## User Case");
        if (evalCase.language && evalCase.language !== "en") {
          expect(bundle.markdown).toContain("## Language Instruction");
        }
      });

      if (evalCase.expected.requiredSections) {
        it("bundle covers required output sections", () => {
          const mdLower = bundle.markdown.toLowerCase();
          for (const sec of evalCase.expected.requiredSections!) {
            expect(mdLower).toContain(sec.toLowerCase());
          }
        });
      }

      if (evalCase.expected.mustMentionConcepts) {
        it("bundle contains key domain concepts", () => {
          const mdLower = bundle.markdown.toLowerCase();
          const found = evalCase.expected.mustMentionConcepts!.filter((concept) =>
            mdLower.includes(concept.toLowerCase()),
          );
          // At least one concept should appear in the bundle (via knowledge, scenario,
          // or skill content). Remaining concepts are LLM-output expectations.
          expect(found.length).toBeGreaterThanOrEqual(1);
        });
      }

      it(`scores ${caseScore.score}/${caseScore.maxScore} (${casePct}%)`, () => {
        // Baseline: every eval case must score at least 80%.
        expect(casePct).toBeGreaterThanOrEqual(80);
      });
    });
  }

  it("aggregate baseline score ≥ 90%", () => {
    const totalScore = allScores.reduce((sum, s) => sum + s.score, 0);
    const totalMax = allScores.reduce((sum, s) => sum + s.maxScore, 0);
    const pct = Math.round((totalScore / totalMax) * 100);
    expect(pct).toBeGreaterThanOrEqual(90);
  });
});
