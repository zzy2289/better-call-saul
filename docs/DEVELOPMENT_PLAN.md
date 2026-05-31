# Development Plan

This document describes the code-layer work needed after the content skeleton.

## Goal

Turn the Markdown workspace into a polished developer-friendly project that can be installed, validated, tested, and demoed.

## Phase 1: Repo tooling

Build a small TypeScript CLI named `saul`.

Commands:

```bash
saul doctor
saul install --workspace ~/.openclaw/workspaces/better-call-saul
saul validate
saul list-skills
saul run-example examples/amazon_refund.md
saul print-openclaw-config
```

Minimum behavior:

- `doctor` checks Node version, OpenClaw binary presence, repo layout, required files, and skill frontmatter.
- `install` copies or symlinks the repo to a chosen OpenClaw workspace path and prints exact next steps.
- `validate` checks skills, schemas, examples, and safety files.
- `list-skills` prints skill names, descriptions, and paths.
- `run-example` reads an example and prints a prompt bundle that can be pasted into OpenClaw.
- `print-openclaw-config` prints a config snippet with absolute paths.

Do not mutate the user's `~/.openclaw/openclaw.json` automatically in v0.1. Print a patch or snippet instead.

## Phase 2: Skill and content validation

Create validators for:

- `SKILL.md` exists for each skill.
- Frontmatter contains `name` and `description`.
- Skill names are lowercase slug strings.
- Metadata is valid one-line JSON when present.
- Skills reference existing knowledge files.
- Required docs exist.
- Examples are synthetic and contain no obvious secrets.
- No file contains long copyrighted TV dialogue.

Suggested implementation:

- TypeScript + Node fs/path.
- `gray-matter` or a small custom frontmatter parser.
- `zod` for schema validation.
- `vitest` for tests.

## Phase 3: Scenario classifier

Add a deterministic classifier that maps user scenarios to skills and knowledge files.

Inputs:

- User text.
- Optional structured case JSON matching `schema/dispute_case.schema.json`.

Outputs:

```json
{
  "primarySkill": "complaint-handler",
  "knowledgeFiles": [
    "knowledge/ecommerce_refunds.md",
    "knowledge/customer_service_escalation.md",
    "knowledge/negotiation_principles.md"
  ],
  "riskLevel": "medium",
  "missingFacts": ["jurisdiction", "platform", "purchase date"]
}
```

MVP classifier can be keyword-based.

Example rules:

- refund, return, delivery, defective, marketplace -> e-commerce.
- late payment, invoice, client, scope creep -> freelance.
- hotel, flight, booking, OTA -> travel.
- subscription, cancellation, trial, renewal -> subscription.
- review, reputation, public reply -> reputation.
- contract, clause, agreement, termination -> contract red flags.

## Phase 4: Prompt bundler

Build a prompt bundler that assembles:

1. `SOUL.md`
2. selected lore snippets
3. selected knowledge files
4. selected skill workflow
5. output format
6. user case

Output modes:

- Markdown prompt.
- JSON prompt bundle.
- OpenClaw-ready workspace prompt file.

This lets users test Better Call Saul even before deeper OpenClaw automation exists.

## Phase 5: Example runner

`saul run-example examples/amazon_refund.md` should:

- Parse the example.
- Classify the scenario.
- Print selected skill and knowledge files.
- Print a final prompt bundle.
- Optionally call `openclaw agent --message` only when the user passes `--execute`.

Default should be dry-run.

## Phase 6: Tests and CI

Add:

- Unit tests for frontmatter parser.
- Unit tests for classifier.
- Snapshot tests for prompt bundles.
- Validation tests for all repo files.
- GitHub Actions running `npm test` and `npm run validate`.

## Phase 7: Optional web/demo UI

Only after the CLI works:

- Add a simple web form.
- User pastes scenario.
- UI shows selected skill, knowledge files, generated prompt, and output placeholder.
- Keep it local-first.

## Phase 8: Optional RAG

Add RAG only when knowledge packs become large.

Start simple:

- Chunk Markdown by headings.
- Store chunk metadata in JSON.
- Use keyword/BM25 before embeddings.
- Later add local embeddings if needed.

## Coding constraints

- No secrets.
- No automatic outbound network calls in tests.
- No automatic mutation of OpenClaw config in MVP.
- No remote script execution.
- No copyrighted TV dialogue.
- No legal-advice claims.
- Code should run on macOS, Linux, and Windows via WSL2 where possible.
