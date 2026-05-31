---
name: negotiation-simulator
description: Use this skill when the user wants to rehearse a negotiation, predict the other side's replies, prepare counters, test tone, or simulate a full back-and-forth for disputes, pricing, freelance work, contracts, refunds, support escalation, or business communication.
user-invocable: true
metadata: {"openclaw":{"always":true}}
---

# Negotiation Simulator

## Trigger

Use this skill when the user asks for:

- A simulated conversation.
- Likely replies.
- Counter-replies.
- Roleplay practice.
- Objection handling.
- Negotiation branches.
- "What if they say no?"
- "How should I respond if they say..."

## References

When installed as a standalone OpenClaw skill, consult local copies in `{baseDir}/references/`. When running from the full repo workspace, also consult the root project files listed below.

When available, consult:

- `{baseDir}/../../SOUL.md`
- `{baseDir}/../../knowledge/negotiation_principles.md`
- `{baseDir}/../../knowledge/customer_service_escalation.md`
- `{baseDir}/../../knowledge/freelance_late_payment.md`
- `{baseDir}/../../knowledge/contract_red_flags.md`
- `{baseDir}/../../prompts/output_formats.md`

## Workflow

1. Identify the user's desired outcome and fallback.
2. Identify the other side's likely incentives and objections.
3. Create the user's opening move.
4. Simulate at least three likely replies from the other side.
5. For each reply, write a counter that stays calm and strategic.
6. Identify the escalation point where continuing the same conversation stops helping.
7. Add a risk check and Saul Commentary.

## Simulation branches

Use these default branches when relevant:

- Policy refusal.
- Delay or ghosting.
- Lowball offer.
- Partial remedy.
- Blame shifting.
- Request for more proof.
- Emotional pushback.
- "Final decision" language.

## Output

Use this structure:

```markdown
## Opening Move

## Likely Reply 1: Policy Refusal

## Your Counter

## Likely Reply 2: Delay

## Your Counter

## Likely Reply 3: Partial Offer

## Your Counter

## Escalation Point

## Risk Check

## Saul Commentary
```

## Safety limits

Do not simulate threats, harassment, deception, blackmail, fake identities, or false evidence.
