# AGENTS.md

This repository defines the Better Call Saul agent workspace — a dispute, complaint, and negotiation fixer that works across multiple agent platforms.

## Agent role

The agent helps users convert messy everyday conflicts into practical scripts, escalation plans, and risk-aware strategies.

## Agent discovery

This project provides four skills that any agent tool can use. The table below shows where each tool should look:

| Agent Tool | Skill Location | Entry File |
|------------|---------------|------------|
| Claude Code | `.claude/skills/<name>/` or `skills/<name>/` | `SKILL.md` |
| Codex / OpenAI Agents | `.agents/skills/<name>/` or `skills/<name>/` | `SKILL.md` |
| OpenClaw | `skills/<name>/` (workspace) or `~/.openclaw/skills/<name>/` | `SKILL.md` |
| Other tools | Read this file + `skills/` directory | `SKILL.md` |

Available skills:

| Skill | Trigger |
|-------|---------|
| `complaint-handler` | Consumer/platform/billing/travel/subscription disputes wanting escalation scripts |
| `negotiation-simulator` | User wants to rehearse negotiation, predict replies, test tone |
| `angle-finder` | User asks "what leverage/angle/loophole/strategy do I have?" |
| `risk-assessor` | User asks "is this risky/too aggressive? Should I do/say this?" |

Codex can read skills from `.agents/skills/` or the repo `skills/` directory. For Claude Code and OpenClaw, use `saul install --host <claude-code|openclaw>` to copy skills into the expected location. Codex host support is planned (see Phase 3 in `docs/REFACTOR_PLAN.md`).

## Primary instructions

- Load `SOUL.md` as the persona and policy layer.
- Use `lore/` only for style and character-inspired reasoning patterns.
- Use `knowledge/` for domain guidance.
- Use `skills/` as AgentSkills-compatible workflows.
- Use `prompts/output_formats.md` to keep outputs consistent.
- Use `docs/SAFETY_POLICY.md` when the user's request moves toward deception, coercion, legal risk, or harassment.

## Coding-agent instructions

When editing this repository:

- Preserve AgentSkills-compatible `SKILL.md` frontmatter (`name`, `description`, optional `metadata`).
- Keep metadata keys single-line JSON.
- Do not add installer hooks that run arbitrary remote scripts.
- Do not add hardcoded API keys, tokens, provider secrets, or user data.
- Do not add copyrighted TV dialogue or scene transcripts.
- Prefer small Markdown knowledge packs over giant prompts.
- Prefer deterministic validation scripts for repo checks.
- Keep generated code minimal, testable, and local-first.
- Do not add dependencies that require network calls during tests.
- Do not weaken `docs/SAFETY_POLICY.md`.
- Do not make legal-advice claims.

## Project structure

```
SOUL.md                  — Persona, mission, tone, safety boundaries
AGENTS.md                — This file (agent discovery & instructions)
skills/                  — Four AgentSkills (SKILL.md + references/)
knowledge/               — Domain guidance packs (Markdown)
lore/                    — Character-style inspiration
prompts/output_formats.md — Output contract (EN/ZH/bilingual)
schema/                  — JSON Schema for input/output validation
examples/                — Example dispute cases
src/                     — TypeScript CLI (classify, bundle, validate, install)
templates/               — Agent subagent templates
```

## Definition of done for MVP

- Four skills exist and validate: `complaint-handler`, `negotiation-simulator`, `angle-finder`, `risk-assessor`.
- The repo can be used as an AgentSkills workspace on Claude Code, Codex, and OpenClaw.
- `saul install` copies skills into the correct location for the detected host.
- `saul validate` passes all checks.
- Example cases produce outputs following `prompts/output_formats.md`.
