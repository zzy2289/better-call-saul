# Better Call Saul

An OpenClaw-based AI fixer for everyday disputes, complaints, and negotiations.

Better Call Saul turns messy conflict descriptions into practical strategies, copy-ready scripts, simulated replies, risk checks, and short "Saul commentary" that explains why a certain angle works.

> Fan-inspired open-source project. This repo is not affiliated with, endorsed by, or sponsored by AMC, Sony Pictures Television, Netflix, Vince Gilligan, Peter Gould, Better Call Saul, Breaking Bad, Saul Goodman, or Jimmy McGill. The project uses an original "Saul-inspired fixer" persona and does not reproduce copyrighted dialogue or scenes.

## What this is

This is a focused agent workspace built on OpenClaw. It is not a fork of OpenClaw and not an upstream contribution. The goal is to package a specialized OpenClaw workspace with:

- A strong fixer persona in `SOUL.md`.
- Lightweight character-style memory in `lore/`.
- Dispute, complaint, negotiation, and risk knowledge in `knowledge/`.
- OpenClaw-compatible skills in `skills/`.
- Example cases in `examples/`.
- A code-development plan for turning this into a polished local CLI, installer, and demo runner.

## MVP scope

The MVP should handle these scenarios well:

1. E-commerce refunds, returns, shipping delays, defective goods, and misleading listings.
2. Customer service escalation for telecom, banking, insurance, utilities, airlines, SaaS subscriptions, and booking platforms.
3. Freelance and small-business disputes, especially late payment, scope creep, lowball offers, and proposal negotiation.
4. General negotiation support for rent, cars, renovations, service agreements, and high-value purchases.
5. Public review and reputation responses.

## Core output

Every answer should convert a messy situation into this structure:

1. Situation read
2. What the user actually wants
3. Evidence and leverage map
4. Best strategy
5. Multi-version scripts
6. Likely replies from the other side
7. Counter-replies
8. Risk check
9. Saul commentary
10. Next action checklist

See `prompts/output_formats.md` for the standard output contract.

## Repository layout

```text
better-call-saul/
  README.md
  SOUL.md
  AGENTS.md
  MEMORY.seed.md
  DISCLAIMER.md
  SECURITY.md
  CONTRIBUTING.md
  LICENSE
  config/
    openclaw.example.json5
  docs/
    ARCHITECTURE.md
    DEVELOPMENT_PLAN.md
    CODEX_TASKS.md
    OPENCLAW_NOTES.md
    ROADMAP.md
    SAFETY_POLICY.md
  lore/
    saul_memory_brief.md
    saul_style_guide.md
    character_boundaries.md
  knowledge/
    negotiation_principles.md
    customer_service_escalation.md
    ecommerce_refunds.md
    freelance_late_payment.md
    contract_red_flags.md
    travel_disputes.md
    reputation_management.md
    subscription_cancellation.md
    jurisdiction_notes.md
  prompts/
    output_formats.md
  schema/
    dispute_case.schema.json
    saul_output.schema.json
  skills/
    complaint-handler/
      SKILL.md
    negotiation-simulator/
      SKILL.md
    angle-finder/
      SKILL.md
    risk-assessor/
      SKILL.md
  examples/
    amazon_refund.md
    freelance_late_payment.md
    hotel_cancellation.md
    subscription_cancellation.md
    bad_review_response.md
  scripts/
    install-local-skills.sh
    validate-repo.sh
```

## OpenClaw integration approach

OpenClaw skills are AgentSkills-compatible folders containing `SKILL.md` frontmatter plus instructions. This repo keeps project skills under `skills/<skill-name>/SKILL.md` and keeps shared knowledge packs outside the skills to avoid turning every skill into a giant prompt.

The intended runtime pattern is:

- Use the repo root as the OpenClaw workspace, or copy the whole repo into the active OpenClaw workspace.
- Let OpenClaw load `skills/` as workspace skills.
- Keep `SOUL.md`, `lore/`, and `knowledge/` in the same workspace so skills can reference them by relative paths.
- Each skill also includes a small `references/` copy of relevant files so local skill installs remain usable.
- Start with Markdown knowledge packs. Add RAG only after the knowledge directory becomes too large for manual routing.

Relevant OpenClaw docs:

- https://docs.openclaw.ai/start/getting-started
- https://docs.openclaw.ai/tools/skills
- https://docs.openclaw.ai/gateway/configuration

## Quick start

Install and onboard OpenClaw first:

```bash
npm install -g openclaw@latest
openclaw onboard --install-daemon
openclaw gateway status
```

Clone this repo and use it as an OpenClaw workspace:

```bash
git clone https://github.com/YOUR_NAME/better-call-saul.git
cd better-call-saul
```

Then either copy this repo into the workspace you configured during onboarding, or point OpenClaw at this repo as a workspace in your local config. See `config/openclaw.example.json5`.

Install local skills into the active workspace:

```bash
bash scripts/install-local-skills.sh
```

Start a new OpenClaw session after changing skills. OpenClaw snapshots eligible skills at session start, so a fresh session avoids stale skill instructions.

## Example prompts

```text
I bought a laptop online. The listing said new, but it arrived with scratches and a battery cycle count over 300. The seller refuses a refund and says it is normal warehouse wear. I want a refund without sounding crazy.
```

```text
A freelance client accepted my proposal, added two extra pages, delayed feedback for 3 weeks, and now says they only want to pay 50 percent because the launch date passed. Help me respond.
```

```text
The hotel refuses to refund me after canceling my booking because they overbooked and moved me to a worse property. I booked through an OTA. I want escalation scripts.
```

## Safety posture

This project is aggressive about strategy, but conservative about harm.

It can help with:

- Clear complaints.
- Persuasive negotiation.
- Evidence-based escalation.
- Policy-aware refund requests.
- Firm but lawful scripts.
- Risk-aware public review replies.

It must not help with:

- Threats, blackmail, extortion, or harassment.
- Forged evidence, fake identities, fake legal letters, or impersonation.
- Lying about facts, invented injuries, fake regulatory complaints, or fake chargeback claims.
- Evading lawful obligations or avoiding legitimate payment.
- Personalized legal advice presented as a lawyer-client conclusion.

See `docs/SAFETY_POLICY.md`.

## Development status

This repo is a starter skeleton. The content layer is ready for iteration. The code layer should be built next:

1. TypeScript CLI for local setup and validation.
2. OpenClaw workspace installer.
3. Skill/frontmatter validator.
4. Scenario classifier and knowledge-file router.
5. Example runner.
6. Test fixtures and CI.
7. Optional RAG/search layer.

See `docs/DEVELOPMENT_PLAN.md` and `docs/CODEX_TASKS.md`.

## License

MIT for original project code and project-authored docs. The project name/persona is fan-inspired; see `DISCLAIMER.md` for non-affiliation and IP boundaries.
