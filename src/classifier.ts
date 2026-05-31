import type { Classification, DisputeCase, RiskLevel } from "./types.js";

interface DomainRule {
  domain: string;
  keywords: RegExp;
  primarySkill: string;
  knowledgeFiles: string[];
}

/**
 * Keyword-driven domain rules. Order matters only for stable iteration; the
 * primary skill is chosen by the highest-scoring domain.
 */
const DOMAIN_RULES: DomainRule[] = [
  {
    domain: "ecommerce",
    keywords:
      /\b(refund|return|delivery|shipping|defective|damaged|marketplace|seller|listing|order|parcel|warehouse|not as described)\b/i,
    primarySkill: "complaint-handler",
    knowledgeFiles: [
      "knowledge/ecommerce_refunds.md",
      "knowledge/customer_service_escalation.md",
      "knowledge/negotiation_principles.md",
    ],
  },
  {
    domain: "freelance",
    keywords:
      /\b(late payment|invoice|client|scope creep|freelance|contractor|unpaid|milestone|deliverable|proposal|lowball)\b/i,
    primarySkill: "negotiation-simulator",
    knowledgeFiles: [
      "knowledge/freelance_late_payment.md",
      "knowledge/negotiation_principles.md",
      "knowledge/contract_red_flags.md",
    ],
  },
  {
    domain: "travel",
    keywords:
      /\b(hotel|flight|airline|booking|ota|overbook|reservation|check-?in|baggage|cancellation fee)\b/i,
    primarySkill: "complaint-handler",
    knowledgeFiles: [
      "knowledge/travel_disputes.md",
      "knowledge/customer_service_escalation.md",
      "knowledge/negotiation_principles.md",
    ],
  },
  {
    domain: "subscription",
    keywords:
      /\b(subscription|cancel(?:lation)?|trial|renewal|auto-?renew|recurring|membership|unsubscribe)\b/i,
    primarySkill: "complaint-handler",
    knowledgeFiles: [
      "knowledge/subscription_cancellation.md",
      "knowledge/customer_service_escalation.md",
      "knowledge/negotiation_principles.md",
    ],
  },
  {
    domain: "reputation",
    keywords: /\b(review|reputation|public reply|rating|star|yelp|google review|feedback)\b/i,
    primarySkill: "risk-assessor",
    knowledgeFiles: [
      "knowledge/reputation_management.md",
      "knowledge/negotiation_principles.md",
    ],
  },
  {
    domain: "contract",
    keywords: /\b(contract|clause|agreement|termination|terms|liability|penalty|breach)\b/i,
    primarySkill: "angle-finder",
    knowledgeFiles: [
      "knowledge/contract_red_flags.md",
      "knowledge/negotiation_principles.md",
    ],
  },
];

const HIGH_RISK_RE =
  /\b(sue|lawsuit|legal action|court|small claims|threat|chargeback|defamation|lawyer|attorney|police|fraud)\b/i;
const MEDIUM_RISK_RE =
  /\b(public review|legalistic|dispute|escalat|ombudsman|regulator|complaint|employment)\b/i;

function countMatches(text: string, re: RegExp): number {
  const global = new RegExp(re.source, re.flags.includes("g") ? re.flags : `${re.flags}g`);
  const matches = text.match(global);
  return matches ? matches.length : 0;
}

function detectRisk(text: string): RiskLevel {
  if (HIGH_RISK_RE.test(text)) return "high";
  if (MEDIUM_RISK_RE.test(text)) return "medium";
  return "low";
}

const FACT_PROBES: { fact: string; present: RegExp }[] = [
  { fact: "jurisdiction", present: /\b(country|state|jurisdiction|uk|us|eu|usa|canada|australia)\b/i },
  { fact: "platform", present: /\b(amazon|ebay|booking|airbnb|paypal|stripe|platform|app|website|marketplace)\b/i },
  { fact: "amount", present: /(\$|€|£|usd|eur|gbp|\d+\s?(dollars|euros|pounds))/i },
  { fact: "date", present: /\b(\d{4}|january|february|march|april|may|june|july|august|september|october|november|december|yesterday|weeks? ago|days? ago)\b/i },
];

/**
 * Deterministic keyword classifier. Maps a free-text dispute (and optional
 * structured fields) to a primary skill, supporting skills, knowledge files,
 * risk level, and likely missing facts. Never calls an LLM.
 */
export function classify(input: DisputeCase | string): Classification {
  const caseObj: DisputeCase = typeof input === "string" ? { scenario: input } : input;
  const text = [
    caseObj.scenario,
    caseObj.platform,
    caseObj.desiredOutcome,
    caseObj.jurisdiction,
    ...(caseObj.timeline ?? []),
    ...(caseObj.priorReplies ?? []),
  ]
    .filter(Boolean)
    .join("\n");

  const scored = DOMAIN_RULES.map((rule) => ({
    rule,
    score: countMatches(text, rule.keywords),
  }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  const matchedDomains = scored.map((s) => s.rule.domain);

  // Default to complaint-handler when nothing matches.
  const primary = scored[0]?.rule.primarySkill ?? "complaint-handler";

  // Collect knowledge files from all matched domains, de-duplicated, primary first.
  const knowledgeSet = new Set<string>();
  for (const s of scored) {
    for (const f of s.rule.knowledgeFiles) knowledgeSet.add(f);
  }
  if (knowledgeSet.size === 0) {
    knowledgeSet.add("knowledge/customer_service_escalation.md");
    knowledgeSet.add("knowledge/negotiation_principles.md");
  }

  // Secondary skills: other primary skills from matched domains, plus risk-assessor
  // when risk is elevated.
  const secondary = new Set<string>();
  for (const s of scored.slice(1)) {
    if (s.rule.primarySkill !== primary) secondary.add(s.rule.primarySkill);
  }

  const riskLevel = detectRisk(text);
  if (riskLevel !== "low" && primary !== "risk-assessor") {
    secondary.add("risk-assessor");
  }

  // Missing facts: prefer explicit structured fields, then probe the text.
  const missingFacts: string[] = [];
  if (!caseObj.jurisdiction && !FACT_PROBES[0]!.present.test(text)) missingFacts.push("jurisdiction");
  if (!caseObj.platform && !FACT_PROBES[1]!.present.test(text)) missingFacts.push("platform");
  if (caseObj.amountAtStake === undefined && !FACT_PROBES[2]!.present.test(text)) {
    missingFacts.push("amount at stake");
  }
  if ((!caseObj.timeline || caseObj.timeline.length === 0) && !FACT_PROBES[3]!.present.test(text)) {
    missingFacts.push("key dates");
  }

  return {
    primarySkill: primary,
    secondarySkills: [...secondary],
    knowledgeFiles: [...knowledgeSet],
    riskLevel,
    missingFacts,
    matchedDomains,
  };
}
