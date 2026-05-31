import { execFileSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { SKILL_NAMES } from "./paths.js";

export type HostKind = "openclaw" | "claude-code";
export type InstallScope = "project" | "user";

export interface HostDetection {
  host: HostKind;
  /** True when we can install for this host (binary or target dir reachable). */
  available: boolean;
  detail: string;
}

export interface FileOp {
  action: "copy-dir" | "write-file" | "remove";
  /** Absolute destination path. */
  target: string;
  /** Absolute source path for copy-dir ops. */
  source?: string;
}

export interface InstallPlan {
  host: HostKind;
  scope: InstallScope;
  /** Root directory the host reads from (e.g. <cwd>/.claude or ~/.claude). */
  baseDir: string;
  ops: FileOp[];
}

export interface InstallResult {
  plan: InstallPlan;
  applied: boolean;
  ops: FileOp[];
}

const SUBAGENT_REL = "templates/claude-code/agents/saul.md";

/** Resolve the Claude Code base dir for a scope (project = <cwd>/.claude). */
export function claudeBaseDir(scope: InstallScope, cwd: string, home = homedir()): string {
  return scope === "user" ? join(home, ".claude") : join(cwd, ".claude");
}

/** Detect whether a CLI binary is on PATH without throwing. */
function hasBinary(bin: string): boolean {
  try {
    execFileSync(bin, ["--version"], { stdio: ["ignore", "ignore", "ignore"] });
    return true;
  } catch {
    return false;
  }
}

/** Detect which hosts can receive an install in this environment. */
export function detectHosts(cwd: string, home = homedir()): HostDetection[] {
  const detections: HostDetection[] = [];

  const openclaw = hasBinary("openclaw");
  detections.push({
    host: "openclaw",
    available: openclaw,
    detail: openclaw ? "openclaw CLI on PATH" : "openclaw CLI not found",
  });

  const claudeBin = hasBinary("claude");
  const projectClaude = existsSync(join(cwd, ".claude"));
  const userClaude = existsSync(join(home, ".claude"));
  const claudeAvailable = claudeBin || projectClaude || userClaude;
  const reasons: string[] = [];
  if (claudeBin) reasons.push("claude CLI on PATH");
  if (projectClaude) reasons.push("./.claude exists");
  if (userClaude) reasons.push("~/.claude exists");
  detections.push({
    host: "claude-code",
    available: claudeAvailable,
    detail: claudeAvailable ? reasons.join(", ") : "no claude CLI or .claude dir",
  });

  return detections;
}

/**
 * Build the Claude Code install plan: copy each skill into `<base>/skills/<name>`
 * and write the Saul subagent into `<base>/agents/saul.md`.
 */
export function planClaudeInstall(
  repoRoot: string,
  scope: InstallScope,
  cwd: string,
  home = homedir(),
): InstallPlan {
  const baseDir = claudeBaseDir(scope, cwd, home);
  const ops: FileOp[] = [];

  for (const name of SKILL_NAMES) {
    ops.push({
      action: "copy-dir",
      source: join(repoRoot, "skills", name),
      target: join(baseDir, "skills", name),
    });
  }

  ops.push({
    action: "write-file",
    source: join(repoRoot, SUBAGENT_REL),
    target: join(baseDir, "agents", "saul.md"),
  });

  return { host: "claude-code", scope, baseDir, ops };
}

/** Build the uninstall plan: remove only what we install (skills + subagent). */
export function planClaudeUninstall(
  scope: InstallScope,
  cwd: string,
  home = homedir(),
): InstallPlan {
  const baseDir = claudeBaseDir(scope, cwd, home);
  const ops: FileOp[] = SKILL_NAMES.map((name) => ({
    action: "remove" as const,
    target: join(baseDir, "skills", name),
  }));
  ops.push({ action: "remove", target: join(baseDir, "agents", "saul.md") });
  return { host: "claude-code", scope, baseDir, ops };
}

/** Apply a plan to disk. With `dryRun`, returns the ops without touching disk. */
export function applyPlan(plan: InstallPlan, dryRun: boolean): InstallResult {
  if (dryRun) {
    return { plan, applied: false, ops: plan.ops };
  }

  for (const op of plan.ops) {
    if (op.action === "copy-dir") {
      if (!op.source || !existsSync(op.source)) {
        throw new Error(`Install source missing: ${op.source}`);
      }
      mkdirSync(join(op.target, ".."), { recursive: true });
      // Replace any prior copy so installs are idempotent.
      rmSync(op.target, { recursive: true, force: true });
      cpSync(op.source, op.target, { recursive: true });
    } else if (op.action === "write-file") {
      if (!op.source || !existsSync(op.source)) {
        throw new Error(`Subagent template missing: ${op.source}`);
      }
      mkdirSync(join(op.target, ".."), { recursive: true });
      writeFileSync(op.target, readFileSync(op.source, "utf8"));
    } else if (op.action === "remove") {
      rmSync(op.target, { recursive: true, force: true });
    }
  }

  return { plan, applied: true, ops: plan.ops };
}
