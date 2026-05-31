import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { REQUIRED_ROOT_FILES, SKILL_NAMES } from "./paths.js";
import { discoverSkills } from "./skills.js";

export interface DoctorCheck {
  label: string;
  ok: boolean;
  detail: string;
  /** Optional checks are informational and do not affect the exit code. */
  optional?: boolean;
}

/** Run environment + repo health checks for `saul doctor`. */
export function runDoctor(root: string): DoctorCheck[] {
  const checks: DoctorCheck[] = [];

  // Node version (>=18).
  const major = Number(process.versions.node.split(".")[0]);
  checks.push({
    label: "Node.js >= 18",
    ok: major >= 18,
    detail: `found v${process.versions.node}`,
  });

  // OpenClaw binary presence (non-fatal).
  let openclawDetail = "not found (install with: npm i -g openclaw@latest)";
  let openclawOk = false;
  try {
    const out = execFileSync("openclaw", ["--version"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
    openclawOk = true;
    openclawDetail = out.trim() || "installed";
  } catch {
    // openclaw is optional for local CLI work; report as a warning-style check.
  }
  checks.push({ label: "OpenClaw CLI", ok: openclawOk, detail: openclawDetail, optional: true });

  // Required root files.
  const missingFiles = REQUIRED_ROOT_FILES.filter((rel) => !existsSync(join(root, rel)));
  checks.push({
    label: "Required files",
    ok: missingFiles.length === 0,
    detail: missingFiles.length === 0 ? "all present" : `missing: ${missingFiles.join(", ")}`,
  });

  // Required skills.
  let skillNames: string[] = [];
  let skillDetail = "";
  try {
    skillNames = discoverSkills(root).map((s) => s.name);
  } catch (err) {
    skillDetail = (err as Error).message;
  }
  const missingSkills = SKILL_NAMES.filter((n) => !skillNames.includes(n));
  checks.push({
    label: "Required skills",
    ok: missingSkills.length === 0 && skillDetail === "",
    detail: skillDetail || (missingSkills.length === 0 ? `${skillNames.length} found` : `missing: ${missingSkills.join(", ")}`),
  });

  return checks;
}

/**
 * Build an OpenClaw config snippet pointing at a workspace path.
 * The MVP intentionally only prints a snippet; it never edits user config.
 */
export function buildOpenClawConfigSnippet(workspacePath: string): string {
  const snippet = {
    workspaces: {
      "better-call-saul": {
        path: workspacePath,
        skills: ["complaint-handler", "negotiation-simulator", "angle-finder", "risk-assessor"],
      },
    },
  };
  return [
    "// Add this to your OpenClaw config (e.g. ~/.openclaw/openclaw.json).",
    "// This is a snippet to merge manually; the CLI does not edit your config.",
    JSON.stringify(snippet, null, 2),
  ].join("\n");
}
