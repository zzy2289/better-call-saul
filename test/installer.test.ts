import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { findRepoRoot } from "../src/paths.js";
import {
  applyPlan,
  claudeBaseDir,
  planClaudeInstall,
  planClaudeUninstall,
} from "../src/installer.js";

const repoRoot = findRepoRoot(process.cwd());
let work: string;

beforeEach(() => {
  work = mkdtempSync(join(tmpdir(), "saul-install-"));
});

afterEach(() => {
  rmSync(work, { recursive: true, force: true });
});

describe("claude code installer", () => {
  it("resolves project vs user base dirs", () => {
    expect(claudeBaseDir("project", "/proj")).toBe(join("/proj", ".claude"));
    expect(claudeBaseDir("user", "/proj", "/home/me")).toBe(join("/home/me", ".claude"));
  });

  it("plans copies for every skill plus the subagent", () => {
    const plan = planClaudeInstall(repoRoot, "project", work);
    const copyTargets = plan.ops.filter((o) => o.action === "copy-dir").map((o) => o.target);
    const writeTargets = plan.ops.filter((o) => o.action === "write-file").map((o) => o.target);
    expect(copyTargets).toHaveLength(4);
    expect(writeTargets).toEqual([join(work, ".claude", "agents", "saul.md")]);
  });

  it("dry-run does not touch disk", () => {
    const plan = planClaudeInstall(repoRoot, "project", work);
    const result = applyPlan(plan, true);
    expect(result.applied).toBe(false);
    expect(existsSync(join(work, ".claude"))).toBe(false);
  });

  it("installs and then cleanly uninstalls", () => {
    const installed = applyPlan(planClaudeInstall(repoRoot, "project", work), false);
    expect(installed.applied).toBe(true);

    const skillFile = join(work, ".claude", "skills", "complaint-handler", "SKILL.md");
    const agentFile = join(work, ".claude", "agents", "saul.md");
    expect(existsSync(skillFile)).toBe(true);
    expect(existsSync(agentFile)).toBe(true);
    expect(readFileSync(agentFile, "utf8")).toContain("name: saul");

    applyPlan(planClaudeUninstall("project", work), false);
    expect(existsSync(skillFile)).toBe(false);
    expect(existsSync(join(work, ".claude", "skills", "complaint-handler"))).toBe(false);
    expect(existsSync(agentFile)).toBe(false);
  });

  it("is idempotent across repeated installs", () => {
    applyPlan(planClaudeInstall(repoRoot, "project", work), false);
    applyPlan(planClaudeInstall(repoRoot, "project", work), false);
    expect(existsSync(join(work, ".claude", "skills", "risk-assessor", "SKILL.md"))).toBe(true);
  });
});
