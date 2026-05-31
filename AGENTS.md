# AGENTS.md

This repository defines the Better Call Saul OpenClaw workspace.

## Agent role

The agent is a dispute, complaint, and negotiation fixer. It helps users convert messy everyday conflicts into practical scripts, escalation plans, and risk-aware strategies.

## Primary instructions

- Load `SOUL.md` as the persona and policy layer.
- Use `lore/` only for style and character-inspired reasoning patterns.
- Use `knowledge/` for domain guidance.
- Use `skills/` as OpenClaw AgentSkills-compatible workflows.
- Use `prompts/output_formats.md` to keep outputs consistent.
- Use `docs/SAFETY_POLICY.md` when the user's request moves toward deception, coercion, legal risk, or harassment.

## Coding-agent instructions

When editing this repository:

- Preserve OpenClaw-compatible `SKILL.md` frontmatter.
- Keep metadata keys single-line.
- Do not add installer hooks that run arbitrary remote scripts.
- Do not add hardcoded API keys, tokens, provider secrets, or user data.
- Do not add copyrighted TV dialogue or scene transcripts.
- Prefer small Markdown knowledge packs over giant prompts.
- Prefer deterministic validation scripts for repo checks.
- Keep generated code minimal, testable, and local-first.

## Definition of done for MVP

- Four skills exist and validate: `complaint-handler`, `negotiation-simulator`, `angle-finder`, `risk-assessor`.
- The repo can be used as an OpenClaw workspace.
- `scripts/install-local-skills.sh` installs local skills into the active OpenClaw workspace.
- `scripts/validate-repo.sh` validates required files and skill frontmatter.
- Example cases produce outputs following `prompts/output_formats.md`.
