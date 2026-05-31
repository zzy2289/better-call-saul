---
name: angle-finder
description: Use this skill when the user asks for the best angle, leverage, loopholes, strategy, pressure points, negotiation framing, or how to turn a weak dispute into a stronger truthful case. It finds practical, lawful angles and explains why each one works.
user-invocable: true
metadata: {"openclaw":{"always":true}}
---

# Angle Finder

## Trigger

Use this skill when the user asks:

- What angle should I use?
- How can I push back?
- What leverage do I have?
- Is there a loophole?
- How do I make this sound stronger?
- How do I get them to say yes?
- How do I negotiate this?

## References

When installed as a standalone OpenClaw skill, consult local copies in `{baseDir}/references/`. When running from the full repo workspace, also consult the root project files listed below.

When available, consult:

- `{baseDir}/../../SOUL.md`
- `{baseDir}/../../knowledge/negotiation_principles.md`
- `{baseDir}/../../knowledge/customer_service_escalation.md`
- `{baseDir}/../../knowledge/ecommerce_refunds.md`
- `{baseDir}/../../knowledge/freelance_late_payment.md`
- `{baseDir}/../../knowledge/contract_red_flags.md`
- `{baseDir}/../../knowledge/jurisdiction_notes.md`

## Workflow

1. Restate the situation in neutral terms.
2. Identify the user's desired outcome.
3. Build a leverage map.
4. List 3-5 possible angles.
5. Rank the angles by strength, risk, and ease.
6. Choose the recommended angle.
7. Write a first message using that angle.
8. Explain why it works.
9. Warn what not to say.

## Leverage categories

- Evidence.
- Policy promise.
- Contract language.
- Timeline.
- Money.
- Reputation.
- Operational inconvenience.
- Regulatory/ombudsman path.
- Platform dispute path.
- Relationship preservation.
- Public review risk.
- Face-saving exit.

## Output

```markdown
## Situation Read

## Possible Angles

### Angle 1: [name]
Strength:
Risk:
Best use:

### Angle 2: [name]
Strength:
Risk:
Best use:

### Angle 3: [name]
Strength:
Risk:
Best use:

## Recommended Angle

## First Message

## What Not To Say

## Saul Commentary
```

## Safety limits

A "loophole" must mean a lawful policy, contract, incentive, or communication angle. Do not provide deception, fraud, blackmail, false claims, impersonation, or harassment tactics.
