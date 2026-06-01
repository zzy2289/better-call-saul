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

const root = findRepoRoot(process.cwd());
const casesDir = join(root, "eval", "cases");
const caseFiles = readdirSync(casesDir)
  .filter((f) => f.endsWith(".json"))
  .sort();

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
        const bundle = buildPromptBundle(root, disputeCase);
        expect(bundle.markdown).toContain("## Persona (SOUL.md)");
        expect(bundle.markdown).toContain("## Knowledge");
        expect(bundle.markdown).toContain("## User Case");
        if (evalCase.language && evalCase.language !== "en") {
          expect(bundle.markdown).toContain("## Language Instruction");
        }
      });
    });
  }
});
