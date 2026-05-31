# Codex Tasks

Use this as the implementation checklist for a coding agent.

## Task 1: Initialize Node/TypeScript project

Create:

- `package.json`
- `tsconfig.json`
- `src/cli.ts`
- `src/doctor.ts`
- `src/validate.ts`
- `src/skills.ts`
- `src/classifier.ts`
- `src/prompt-bundler.ts`
- `src/types.ts`
- `test/`

Recommended dependencies:

- `commander` for CLI.
- `zod` for schema validation.
- `vitest` for tests.
- Optional: `gray-matter` for frontmatter parsing.

## Task 2: Implement CLI commands

Commands:

```bash
saul doctor
saul validate
saul list-skills
saul classify --file examples/amazon_refund.md
saul bundle --file examples/amazon_refund.md
saul run-example examples/amazon_refund.md
saul print-openclaw-config --workspace /abs/path
```

## Task 3: Implement validation

Validation rules:

- Required root files exist.
- Required directories exist.
- Each skill directory contains `SKILL.md`.
- `SKILL.md` frontmatter contains lowercase slug `name` and non-empty `description`.
- Metadata line parses as JSON if present.
- Knowledge references resolve.
- Examples exist and are not empty.
- Schemas are valid JSON.

## Task 4: Implement classifier

Return:

```ts
export type Classification = {
  primarySkill: string;
  secondarySkills: string[];
  knowledgeFiles: string[];
  riskLevel: "low" | "medium" | "high";
  missingFacts: string[];
};
```

Use keyword rules first. Do not call an LLM.

## Task 5: Implement prompt bundler

Inputs:

- User case Markdown or JSON.
- Classification.
- Project files.

Output:

- A single Markdown prompt bundle.
- A JSON prompt bundle.

The Markdown bundle should include:

- `SOUL.md`
- relevant lore files
- relevant knowledge files
- selected skill instructions
- output format
- user case

## Task 6: Add tests

Tests:

- Skill frontmatter parsing.
- Skill discovery.
- Classifier rules.
- Prompt bundling includes expected files.
- Validation catches missing required files.
- Config snippet includes absolute workspace path.

## Task 7: Add GitHub Actions

Create `.github/workflows/ci.yml` to run:

```bash
npm ci
npm run lint --if-present
npm test
npm run validate
```

## Task 8: Keep it safe

Do not implement:

- Autonomous message sending.
- Browser automation.
- Shell command execution from user dispute content.
- Remote dependency installers beyond standard package manager installation.
- Editing `~/.openclaw/openclaw.json` automatically.

Printing instructions is okay. Mutating user config is not part of MVP.
