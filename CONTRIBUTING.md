# Contributing

Contributions should make Better Call Saul more useful, safer, and easier to run.

## Good contributions

- New dispute playbooks in `knowledge/`.
- New OpenClaw skills in `skills/`.
- Better scripts and response formats.
- Synthetic examples in `examples/`.
- Validation tests.
- Install and setup improvements.
- Safety and risk-check improvements.

## Content rules

Do not add:

- Copyrighted TV scripts, long quotes, or scene transcripts.
- Personal data from real disputes.
- Advice that depends on pretending to be someone else.
- Instructions for threats, blackmail, harassment, forged evidence, or fraud.
- Jurisdiction-specific legal claims unless clearly sourced and framed as general information.

## Skill rules

Each skill must have:

- `SKILL.md`
- YAML frontmatter with `name` and `description`
- A clear trigger condition
- A workflow
- Output format
- Safety limits
- References to relevant `knowledge/` files when useful

Frontmatter should keep metadata values on one line.

## Pull request checklist

Before opening a PR:

- Run `bash scripts/validate-repo.sh`.
- Confirm no secrets are committed.
- Confirm examples are synthetic.
- Confirm the output style remains practical, not just funny.
- Confirm safety boundaries are preserved.
