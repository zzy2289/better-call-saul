# Architecture

Better Call Saul is a layered OpenClaw workspace.

## Layer 1: Persona

`SOUL.md` defines the agent's identity, mission, tone, output contract, and hard safety boundaries.

This layer should be compact. Do not turn it into a knowledge dump.

## Layer 2: Lore

`lore/` contains character-style inspiration:

- `saul_memory_brief.md`: broad archetype and behavioral patterns.
- `saul_style_guide.md`: voice and commentary rules.
- `character_boundaries.md`: IP, roleplay, and legal boundaries.

Lore gives the assistant flavor. It should not be a show encyclopedia.

## Layer 3: Knowledge packs

`knowledge/` contains reusable domain guidance:

- Negotiation principles.
- Customer support escalation.
- E-commerce refunds.
- Freelance late payment.
- Contract red flags.
- Travel disputes.
- Reputation management.
- Subscription cancellation.
- Jurisdiction uncertainty.

Knowledge packs are Markdown because that is easiest to audit, improve, and keep safe.

## Layer 4: Skills

`skills/` contains OpenClaw-compatible AgentSkills.

Each skill should:

- Trigger for a specific user intent.
- Route to relevant knowledge packs.
- Apply a repeatable workflow.
- Produce a consistent output.
- Enforce safety limits.

MVP skills:

- `complaint-handler`
- `negotiation-simulator`
- `angle-finder`
- `risk-assessor`

## Layer 5: Prompts and schemas

`prompts/output_formats.md` defines the default answer structure.

`schema/` defines future machine-readable inputs/outputs for a CLI, API, or UI.

## Layer 6: Code layer

The next implementation pass should add:

- A TypeScript CLI.
- A local installer for OpenClaw workspaces.
- Skill/frontmatter validators.
- Scenario classification.
- Knowledge routing.
- Example runner.
- Tests and CI.

See `docs/DEVELOPMENT_PLAN.md` and `docs/CODEX_TASKS.md`.

## Data flow

```text
User dispute description
  -> scenario classifier
  -> relevant skill
  -> relevant knowledge packs
  -> output format contract
  -> scripts + simulation + risk check + Saul commentary
```

## Why Markdown first

Markdown keeps the MVP simple:

- Easy for contributors.
- Easy to review for safety.
- Easy for OpenClaw to use as workspace context.
- No database needed.
- Easy to upgrade later to RAG.

## Future RAG upgrade

When `knowledge/` grows large, add retrieval:

1. Split knowledge into small chunks with stable IDs.
2. Add metadata: domain, jurisdiction, platform, risk level, last reviewed date.
3. Use local embeddings or keyword search first.
4. Return top files/snippets to the agent.
5. Keep final answers citation-aware.

Do not add RAG before the MVP scripts and skills feel good.
