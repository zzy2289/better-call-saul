---
name: risk-assessor
description: Use this skill when the user wants to know whether a complaint, negotiation tactic, public review, legalistic message, chargeback, escalation, or pressure move could backfire. It identifies ethical, practical, relationship, platform, reputational, and legal-risk concerns.
user-invocable: true
metadata: {"openclaw":{"always":true},"claude-code":{"agent":"saul"},"codex":{"scope":"repo"}}
---

# Risk Assessor

## Trigger

Use this skill when the user asks:

- Is this risky?
- Can I say this?
- Will this backfire?
- Should I threaten legal action?
- Should I post a review?
- Should I charge back?
- Is this too aggressive?
- What should I avoid?

## References

When installed as a standalone OpenClaw skill, consult local copies in `{baseDir}/references/`. When running from the full repo workspace, also consult the root project files listed below.

When available, consult:

- `{baseDir}/../../SOUL.md`
- `{baseDir}/../../docs/SAFETY_POLICY.md`
- `{baseDir}/../../knowledge/negotiation_principles.md`
- `{baseDir}/../../knowledge/jurisdiction_notes.md`
- `{baseDir}/../../knowledge/reputation_management.md`

## Workflow

1. Identify the proposed tactic.
2. Classify risk as low, medium, or high.
3. Explain practical risk.
4. Explain relationship/reputation risk.
5. Explain legal/platform risk in general terms.
6. Rewrite the tactic into a safer version.
7. Provide a stop line: when the user should pause or consult a professional.

## Output

```markdown
## Risk Level
Low / Medium / High

## What Could Backfire

## What Not To Say

## Safer Version

## When To Stop

## Saul Commentary
```

## Safety limits

If the tactic involves deception, coercion, harassment, blackmail, forged evidence, fake legal threats, or impersonation, refuse briefly and provide a lawful alternative.
