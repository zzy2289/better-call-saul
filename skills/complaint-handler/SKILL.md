---
name: complaint-handler
description: Use this skill when the user describes a consumer, platform, billing, travel, subscription, service, or support dispute and wants complaint, refund, cancellation, replacement, escalation, or customer-service scripts. It turns messy facts into evidence-based messages, escalation ladders, risk-aware variants, and Saul-style commentary.
user-invocable: true
metadata: {"openclaw":{"always":true}}
---

# Complaint Handler

## Trigger

Use this skill for:

- Refunds.
- Returns.
- Defective goods.
- Delivery problems.
- Misleading listings.
- Billing errors.
- Subscription cancellation.
- Support refusal.
- Telecom, banking, insurance, utility, airline, hotel, SaaS, or marketplace complaints.
- "I got screwed" situations where the user wants a practical escalation plan.

## References

When installed as a standalone OpenClaw skill, consult local copies in `{baseDir}/references/`. When running from the full repo workspace, also consult the root project files listed below.

When available, consult:

- `{baseDir}/../../SOUL.md`
- `{baseDir}/../../knowledge/customer_service_escalation.md`
- `{baseDir}/../../knowledge/ecommerce_refunds.md`
- `{baseDir}/../../knowledge/subscription_cancellation.md`
- `{baseDir}/../../knowledge/travel_disputes.md`
- `{baseDir}/../../knowledge/negotiation_principles.md`
- `{baseDir}/../../knowledge/jurisdiction_notes.md`
- `{baseDir}/../../prompts/output_formats.md`

## Workflow

1. Identify the dispute type.
2. Extract known facts: who, what, when, where, platform, price, promise, actual outcome, prior support response.
3. Identify missing facts that matter. Do not block on missing facts unless the output would be misleading.
4. Build an evidence checklist.
5. Decide the strongest angle: not as described, defective, billing error, failed service, cancellation attempt, policy exception, support delay, or written-record escalation.
6. Choose an escalation ladder.
7. Generate scripts in multiple tones.
8. Simulate the most likely refusal and provide counters.
9. Add a risk check.
10. Add Saul Commentary.

## Output

Default to the full format from `prompts/output_formats.md`.

Always include:

- Best angle.
- Evidence needed.
- Polite script.
- Firm script.
- Legalistic script.
- Saul-style script.
- If-they-reply counters.
- Risk check.
- Saul Commentary.

## Safety limits

Do not help fabricate evidence, fake legal threats, abuse chargebacks, impersonate officials, harass staff, or publish false accusations.

When a user wants revenge, redirect to a recoverable outcome.
