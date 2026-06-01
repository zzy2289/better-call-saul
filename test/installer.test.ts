import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { findRepoRoot } from "../src/paths.js";
import {
  applyInstall,
  applyUninstall,
  claudeBaseDir,
  planClaudeInstall,
  planClaudeUninstall,
} from "../src/installer.js";

const repoRoot = findRepoRoot();
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
    const result = applyInstall(plan, true);
    expect(result.applied).toBe(false);
    expect(result.installed.length).toBeGreaterThan(0);
    expect(existsSync(join(work, ".claude"))).toBe(false);
  });

  it("installs, writes a manifest, then cleanly uninstalls", () => {
    const installed = applyInstall(planClaudeInstall(repoRoot, "project", work), false);
    expect(installed.applied).toBe(true);
    expect(installed.skipped).toEqual([]);

    const manifest = join(work, ".claude", ".saul-install.json");
    const skillFile = join(work, ".claude", "skills", "complaint-handler", "SKILL.md");
    const agentFile = join(work, ".claude", "agents", "saul.md");
    expect(existsSync(manifest)).toBe(true);
    expect(existsSync(skillFile)).toBe(true);
    expect(existsSync(agentFile)).toBe(true);
    expect(readFileSync(agentFile, "utf8")).toContain("name: saul");

    applyUninstall(planClaudeUninstall("project", work), false);
    expect(existsSync(skillFile)).toBe(false);
    expect(existsSync(join(work, ".claude", "skills", "complaint-handler"))).toBe(false);
    expect(existsSync(agentFile)).toBe(false);
    expect(existsSync(manifest)).toBe(false);
  });

  it("is idempotent across repeated installs", () => {
    applyInstall(planClaudeInstall(repoRoot, "project", work), false);
    const second = applyInstall(planClaudeInstall(repoRoot, "project", work), false);
    expect(second.skipped).toEqual([]);
    expect(existsSync(join(work, ".claude", "skills", "risk-assessor", "SKILL.md"))).toBe(true);
  });

  it("never overwrites a pre-existing foreign skill of the same name", () => {
    const foreign = join(work, ".claude", "skills", "complaint-handler");
    mkdirSync(foreign, { recursive: true });
    writeFileSync(join(foreign, "SKILL.md"), "USER'S OWN SKILL");

    const result = applyInstall(planClaudeInstall(repoRoot, "project", work), false);
    expect(result.skipped).toContain(foreign);
    // The user's file is untouched.
    expect(readFileSync(join(foreign, "SKILL.md"), "utf8")).toBe("USER'S OWN SKILL");
  });

  it("uninstall only removes manifest-owned targets, leaving foreign files", () => {
    const foreign = join(work, ".claude", "skills", "complaint-handler");
    mkdirSync(foreign, { recursive: true });
    writeFileSync(join(foreign, "SKILL.md"), "USER'S OWN SKILL");

    applyInstall(planClaudeInstall(repoRoot, "project", work), false);
    applyUninstall(planClaudeUninstall("project", work), false);

    // Foreign skill survives uninstall; ours (e.g. risk-assessor) is gone.
    expect(existsSync(join(foreign, "SKILL.md"))).toBe(true);
    expect(existsSync(join(work, ".claude", "skills", "risk-assessor"))).toBe(false);
  });

  it("uninstall with no manifest is a no-op plan", () => {
    const plan = planClaudeUninstall("project", work);
    expect(plan.ops).toEqual([]);
  });
});
