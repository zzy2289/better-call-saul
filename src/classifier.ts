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
  {
    domain: "china-consumer",
    keywords:
      /(?:\b(?:12315|12345|taobao|tmall|jd\.com|pinduoduo)\b|淘宝|天猫|京东|拼多多|抖音|闲鱼|退一赔三|三包|消费者权益|消法|工商|市场监管|仅退款|平台介入)/i,
    primarySkill: "complaint-handler",
    knowledgeFiles: [
      "knowledge/china_consumer_rights.md",
      "knowledge/ecommerce_refunds.md",
      "knowledge/customer_service_escalation.md",
      "knowledge/negotiation_principles.md",
    ],
  },
  {
    domain: "chargeback",
    keywords:
      /\b(chargeback|charge-?back|card dispute|payment dispute|credit card dispute|visa dispute|mastercard dispute|section 75|consumer credit act|payment reversal|bank dispute)\b/i,
    primarySkill: "complaint-handler",
    knowledgeFiles: [
      "knowledge/chargeback_and_payment_disputes.md",
      "knowledge/customer_service_escalation.md",
      "knowledge/negotiation_principles.md",
    ],
  },
  {
    domain: "employment",
    keywords:
      /(?:\b(?:fired|terminated|wrongful termination|unfair dismissal|unpaid wages|overtime|severance|harassment|discrimination|workplace|employer|employee|HR|human resources|retaliation|whistleblow|non-?compete|misclassification)\b|劳动仲裁|劳动合同|工资|加班费|辞退|裁员)/i,
    primarySkill: "negotiation-simulator",
    knowledgeFiles: [
      "knowledge/employment_disputes.md",
      "knowledge/negotiation_principles.md",
      "knowledge/contract_red_flags.md",
    ],
  },
  {
    domain: "landlord-tenant",
    keywords:
      /(?:\b(?:landlord|tenant|rent|lease|deposit|security deposit|eviction|habitability|mold|pest|maintenance|move-?out|subtenant)\b|房东|租客|押金|退租|房屋|租房)/i,
    primarySkill: "complaint-handler",
    knowledgeFiles: [
      "knowledge/landlord_tenant_disputes.md",
      "knowledge/customer_service_escalation.md",
      "knowledge/negotiation_principles.md",
    ],
  },
  {
    domain: "insurance",
    keywords:
      /(?:\b(?:insurance|claim denied|claim denial|adjuster|coverage|deductible|premium|policyholder|insurer|underwriter|bad faith|appraisal clause)\b|保险|理赔|拒赔)/i,
    primarySkill: "angle-finder",
    knowledgeFiles: [
      "knowledge/insurance_claims.md",
      "knowledge/negotiation_principles.md",
      "knowledge/contract_red_flags.md",
    ],
  },
  {
    domain: "debt-collection",
    keywords:
      /(?:\b(?:debt collector|collection agency|debt collection|debt validation|FDCPA|validate debt|statute of limitations|cease and desist)\b|催收|催债|欠款|讨债)/i,
    primarySkill: "angle-finder",
    knowledgeFiles: [
      "knowledge/debt_collection.md",
      "knowledge/negotiation_principles.md",
    ],
  },
  {
    domain: "warranty",
    keywords:
      /(?:\b(?:warranty|defect|lemon law|product recall|implied warranty|merchantability)\b|三包|质保|保修|产品缺陷)/i,
    primarySkill: "complaint-handler",
    knowledgeFiles: [
      "knowledge/warranty_and_defects.md",
      "knowledge/ecommerce_refunds.md",
      "knowledge/negotiation_principles.md",
    ],
  },
];

const HIGH_RISK_RE =
  /\b(sue|lawsuit|legal action|court|small claims|threat(?:en)?|chargeback|defamation|lawyer|attorney|police|fraud|fake|forg(?:e|ed|ing)|fabricat|blackmail|extort|dox(?:x?ing)?|impersonat|stalk|intimidat)\b/i;
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
  { fact: "jurisdiction", present: /(?:\b(?:country|state|jurisdiction|uk|us|eu|usa|canada|australia|china|korea|germany|france|india|brazil|singapore|hong kong)\b|中国|日本)/i },
  { fact: "platform", present: /(?:\b(?:amazon|ebay|booking|airbnb|paypal|stripe|platform|app|website|marketplace|taobao|tmall|uber|lyft|doordash|shopify)\b|淘宝|天猫|京东|拼多多|抖音|闲鱼)/i },
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
