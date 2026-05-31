import { describe, expect, it } from "vitest";
import { classify } from "../src/classifier.js";

describe("classifier", () => {
  it("routes e-commerce refunds to complaint-handler", () => {
    const c = classify("The seller refuses a refund for a defective laptop that arrived not as described.");
    expect(c.primarySkill).toBe("complaint-handler");
    expect(c.matchedDomains).toContain("ecommerce");
    expect(c.knowledgeFiles).toContain("knowledge/ecommerce_refunds.md");
  });

  it("routes freelance late payment to negotiation-simulator", () => {
    const c = classify("A client delayed feedback and now wants to pay only 50% of the invoice for scope creep.");
    expect(c.primarySkill).toBe("negotiation-simulator");
    expect(c.matchedDomains).toContain("freelance");
  });

  it("routes travel disputes correctly", () => {
    const c = classify("The hotel overbooked my reservation and refuses a refund after I booked via an OTA.");
    expect(c.matchedDomains).toContain("travel");
    expect(c.knowledgeFiles).toContain("knowledge/travel_disputes.md");
  });

  it("detects high risk and adds risk-assessor as secondary", () => {
    const c = classify("They committed fraud and I want to threaten a lawsuit and a chargeback.");
    expect(c.riskLevel).toBe("high");
    expect(c.secondarySkills).toContain("risk-assessor");
  });

  it("defaults to complaint-handler when nothing matches", () => {
    const c = classify("I have a generic problem with no keywords.");
    expect(c.primarySkill).toBe("complaint-handler");
    expect(c.knowledgeFiles.length).toBeGreaterThan(0);
  });

  it("reports missing facts", () => {
    const c = classify("Refund please.");
    expect(c.missingFacts).toContain("jurisdiction");
    expect(c.missingFacts).toContain("key dates");
  });

  it("uses structured fields to satisfy facts", () => {
    const c = classify({
      scenario: "Refund please.",
      jurisdiction: "UK",
      platform: "Amazon",
      amountAtStake: 200,
      timeline: ["2026-01-01 ordered"],
    });
    expect(c.missingFacts).not.toContain("jurisdiction");
    expect(c.missingFacts).not.toContain("platform");
    expect(c.missingFacts).not.toContain("amount at stake");
    expect(c.missingFacts).not.toContain("key dates");
  });
});
