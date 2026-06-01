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
  /** Absolute source path for copy-dir / write-file ops. */
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
  /** Targets we created or refreshed. */
  installed: string[];
  /** Pre-existing foreign targets we refused to overwrite. */
  skipped: string[];
}

export interface UninstallResult {
  plan: InstallPlan;
  applied: boolean;
  /** Targets we removed (only ones our manifest owns). */
  removed: string[];
  /** Manifest-listed targets that no longer existed on disk. */
  missing: string[];
}

const SUBAGENT_REL = "templates/claude-code/agents/saul.md";
const MANIFEST_NAME = ".saul-install.json";

interface InstallManifest {
  tool: "better-call-saul";
  host: HostKind;
  scope: InstallScope;
  installedAt: string;
  /** Absolute paths we created and therefore own. */
  entries: string[];
}

/** Resolve the Claude Code base dir for a scope (project = <cwd>/.claude). */
export function claudeBaseDir(scope: InstallScope, cwd: string, home = homedir()): string {
  return scope === "user" ? join(home, ".claude") : join(cwd, ".claude");
}

function manifestPath(baseDir: string): string {
  return join(baseDir, MANIFEST_NAME);
}

function readManifest(baseDir: string): InstallManifest | undefined {
  const path = manifestPath(baseDir);
  if (!existsSync(path)) return undefined;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as InstallManifest;
    if (parsed && parsed.tool === "better-call-saul" && Array.isArray(parsed.entries)) {
      return parsed;
    }
  } catch {
    // Corrupt manifest: treat as absent so we never act on bad data.
  }
  return undefined;
}

function writeManifestTo(baseDir: string, manifest: InstallManifest): void {
  mkdirSync(baseDir, { recursive: true });
  writeFileSync(manifestPath(baseDir), `${JSON.stringify(manifest, null, 2)}\n`);
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

/**
 * Build the uninstall plan from the on-disk manifest. We only ever remove paths
 * we recorded as installed, so pre-existing user files are never touched.
 */
export function planClaudeUninstall(
  scope: InstallScope,
  cwd: string,
  home = homedir(),
): InstallPlan {
  const baseDir = claudeBaseDir(scope, cwd, home);
  const manifest = readManifest(baseDir);
  const owned = manifest?.entries ?? [];
  const ops: FileOp[] = owned.map((target) => ({ action: "remove" as const, target }));
  return { host: "claude-code", scope, baseDir, ops };
}

/**
 * Apply a Claude Code install plan. Pre-existing foreign targets are skipped (we
 * never clobber files we did not create); ones we own are refreshed. Records a
 * manifest so uninstall is precise and reversible.
 */
export function applyInstall(plan: InstallPlan, dryRun: boolean, force = false): InstallResult {
  const prior = readManifest(plan.baseDir);
  const owned = new Set(prior?.entries ?? []);
  const installed: string[] = [];
  const skipped: string[] = [];

  for (const op of plan.ops) {
    const exists = existsSync(op.target);
    const isOurs = owned.has(op.target);
    if (exists && !isOurs && !force) {
      skipped.push(op.target);
      continue;
    }
    if (dryRun) {
      installed.push(op.target);
      continue;
    }
    if (op.action === "copy-dir") {
      if (!op.source || !existsSync(op.source)) {
        throw new Error(`Install source missing: ${op.source}`);
      }
      mkdirSync(join(op.target, ".."), { recursive: true });
      rmSync(op.target, { recursive: true, force: true });
      cpSync(op.source, op.target, { recursive: true });
    } else if (op.action === "write-file") {
      if (!op.source || !existsSync(op.source)) {
        throw new Error(`Subagent template missing: ${op.source}`);
      }
      mkdirSync(join(op.target, ".."), { recursive: true });
      writeFileSync(op.target, readFileSync(op.source, "utf8"));
    }
    installed.push(op.target);
  }

  if (!dryRun && installed.length > 0) {
    const merged = new Set<string>([...(prior?.entries ?? []), ...installed]);
    writeManifestTo(plan.baseDir, {
      tool: "better-call-saul",
      host: plan.host,
      scope: plan.scope,
      installedAt: new Date().toISOString(),
      entries: [...merged],
    });
  }

  return { plan, applied: !dryRun, installed, skipped };
}

/**
 * Apply a Claude Code uninstall plan. Removes only manifest-owned targets, then
 * drops the manifest. Empty `skills/` and `agents/` dirs are left in place so we
 * never delete a directory the host or the user may also be using.
 */
export function applyUninstall(plan: InstallPlan, dryRun: boolean): UninstallResult {
  const removed: string[] = [];
  const missing: string[] = [];

  for (const op of plan.ops) {
    if (!existsSync(op.target)) {
      missing.push(op.target);
      continue;
    }
    if (!dryRun) {
      rmSync(op.target, { recursive: true, force: true });
    }
    removed.push(op.target);
  }

  if (!dryRun) {
    rmSync(manifestPath(plan.baseDir), { force: true });
  }

  return { plan, applied: !dryRun, removed, missing };
}

export interface OpenClawResult {
  applied: boolean;
  /** Skill names we installed (or would install in dry-run). */
  skills: string[];
  /** Human-readable commands we ran (or would run). */
  commands: string[];
}

/**
 * Install the four skills into OpenClaw by shelling out to its CLI:
 *   openclaw skills install <repoRoot>/skills/<name> --as <name>
 * Idempotent because OpenClaw upserts skills by name.
 */
export function installOpenClaw(repoRoot: string, dryRun: boolean): OpenClawResult {
  const commands: string[] = [];
  const skills: string[] = [];

  for (const name of SKILL_NAMES) {
    const skillPath = join(repoRoot, "skills", name);
    if (!existsSync(skillPath)) {
      throw new Error(`Skill source missing: ${skillPath}`);
    }
    commands.push(`openclaw skills install ${skillPath} --as ${name}`);
    if (!dryRun) {
      execFileSync("openclaw", ["skills", "install", skillPath, "--as", name], {
        stdio: ["ignore", "inherit", "inherit"],
      });
    }
    skills.push(name);
  }

  return { applied: !dryRun, skills, commands };
}
