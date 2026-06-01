#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { Command } from "commander";
import { findRepoRoot } from "./paths.js";
import { validateRepo } from "./validate.js";
import { discoverSkills } from "./skills.js";
import { classify } from "./classifier.js";
import { buildPromptBundle } from "./prompt-bundler.js";
import { parseExampleFile } from "./example.js";
import { buildOpenClawConfigSnippet, runDoctor } from "./doctor.js";
import { checkReferenceSync } from "./references-sync.js";
import {
  applyInstall,
  applyUninstall,
  detectHosts,
  installOpenClaw,
  planClaudeInstall,
  planClaudeUninstall,
  planCodexInstall,
  planCodexUninstall,
  type InstallScope,
} from "./installer.js";
import type { DisputeCase } from "./types.js";

const program = new Command();

program
  .name("saul")
  .description("Better Call Saul — OpenClaw workspace CLI for disputes, complaints, and negotiations.")
  .version("0.1.0");

function root(): string {
  return findRepoRoot(process.cwd());
}

/**
 * Repo root resolved from this module's own location (package-relative), so
 * `install`/`uninstall` work from any cwd — including `npx better-call-saul`
 * run inside a user project that has no SOUL.md.
 */
function assetRoot(): string {
  return findRepoRoot();
}

program
  .command("doctor")
  .description("Check Node, OpenClaw, and repo health.")
  .action(() => {
    const checks = runDoctor(root());
    let allOk = true;
    for (const c of checks) {
      const mark = c.ok ? "✓" : c.optional ? "•" : "✗";
      if (!c.ok && !c.optional) allOk = false;
      const suffix = !c.ok && c.optional ? " (optional)" : "";
      console.log(`${mark} ${c.label}: ${c.detail}${suffix}`);
    }
    if (!allOk) process.exitCode = 1;
  });

program
  .command("validate")
  .description("Validate required files, skills, schemas, examples, and reference sync.")
  .action(() => {
    const result = validateRepo(root());
    for (const issue of result.issues) {
      const tag = issue.level === "error" ? "ERROR" : "WARN";
      console.log(`[${tag}] ${issue.message}`);
    }
    if (result.ok) {
      console.log("Repo validation passed.");
    } else {
      console.log("Repo validation failed.");
      process.exitCode = 1;
    }
  });

program
  .command("list-skills")
  .description("List discovered skills with descriptions and paths.")
  .option("--json", "Output as JSON.")
  .action((opts: { json?: boolean }) => {
    const skills = discoverSkills(root());
    if (opts.json) {
      console.log(JSON.stringify(skills, null, 2));
      return;
    }
    for (const s of skills) {
      console.log(`- ${s.name}\n    ${s.description}\n    ${s.file}`);
    }
  });

program
  .command("check-refs")
  .description("Report skill reference copies that have drifted from their source files.")
  .action(() => {
    const checks = checkReferenceSync(root());
    const bad = checks.filter((c) => c.status !== "ok");
    for (const c of checks) {
      if (c.status === "ok") continue;
      console.log(`[${c.status.toUpperCase()}] ${c.referenceFile} <- ${c.sourceFile}`);
    }
    if (bad.length === 0) {
      console.log(`All ${checks.length} reference copies are in sync.`);
    } else {
      console.log(`${bad.length} reference issue(s) found.`);
      process.exitCode = 1;
    }
  });

function loadCase(opts: { file?: string; text?: string; lang?: string }): DisputeCase {
  if (opts.text) return { scenario: opts.text, language: opts.lang };
  if (!opts.file) {
    throw new Error("Provide --file <path> or --text <scenario>.");
  }
  if (opts.file.endsWith(".json")) {
    const parsed = JSON.parse(readFileSync(opts.file, "utf8")) as DisputeCase;
    if (opts.lang) parsed.language = opts.lang;
    return parsed;
  }
  // Treat any other file (e.g. example .md) via the example parser.
  const parsed = parseExampleFile(opts.file);
  return { scenario: parsed.scenario || parsed.raw, language: opts.lang };
}

program
  .command("classify")
  .description("Classify a dispute into skill, knowledge files, risk, and missing facts.")
  .option("--file <path>", "Path to an example .md or case .json file.")
  .option("--text <scenario>", "Inline scenario text.")
  .option("--lang <language>", "Output language: en, zh, bilingual, or BCP-47 tag.")
  .action((opts: { file?: string; text?: string; lang?: string }) => {
    const classification = classify(loadCase(opts));
    console.log(JSON.stringify(classification, null, 2));
  });

program
  .command("bundle")
  .description("Build a full prompt bundle (Markdown by default).")
  .option("--file <path>", "Path to an example .md or case .json file.")
  .option("--text <scenario>", "Inline scenario text.")
  .option("--lang <language>", "Output language: en, zh, bilingual, or BCP-47 tag.")
  .option("--json", "Output the JSON bundle instead of Markdown.")
  .action((opts: { file?: string; text?: string; json?: boolean; lang?: string }) => {
    const bundle = buildPromptBundle(root(), loadCase(opts));
    console.log(opts.json ? JSON.stringify(bundle.json, null, 2) : bundle.markdown);
  });

program
  .command("run-example <path>")
  .description("Parse an example, classify it, and print the prompt bundle (dry-run).")
  .option("--json", "Output the JSON bundle instead of Markdown.")
  .action((path: string, opts: { json?: boolean }) => {
    const parsed = parseExampleFile(path);
    const classification = classify({ scenario: parsed.scenario });
    console.error(`# ${parsed.title}`);
    console.error(`Suggested skills (from example): ${parsed.suggestedSkills.join(", ") || "none"}`);
    console.error(`Classified primary skill: ${classification.primarySkill}`);
    console.error("---");
    const bundle = buildPromptBundle(root(), { scenario: parsed.scenario });
    console.log(opts.json ? JSON.stringify(bundle.json, null, 2) : bundle.markdown);
  });

program
  .command("print-openclaw-config")
  .description("Print an OpenClaw config snippet for this workspace (does not edit config).")
  .option("--workspace <path>", "Absolute workspace path.", process.cwd())
  .action((opts: { workspace: string }) => {
    console.log(buildOpenClawConfigSnippet(opts.workspace));
  });

function normalizeScope(value: string): InstallScope {
  if (value !== "project" && value !== "user") {
    throw new Error(`Invalid --scope "${value}". Use "project" or "user".`);
  }
  return value;
}

program
  .command("detect-hosts")
  .description("Detect which agent hosts (Claude Code, Codex, OpenClaw) are available here.")
  .action(() => {
    for (const d of detectHosts(process.cwd())) {
      console.log(`${d.available ? "✓" : "•"} ${d.host}: ${d.detail}`);
    }
  });

program
  .command("install")
  .description("Install the Saul skills into a detected agent host (Claude Code, Codex, or OpenClaw).")
  .option("--host <host>", "Target host: claude-code, codex, or openclaw.", "auto")
  .option("--scope <scope>", "Install scope: project or user.", "project")
  .option("--dry-run", "Show what would change without writing files.")
  .action((opts: { host: string; scope: string; dryRun?: boolean }) => {
    const scope = normalizeScope(opts.scope);
    const cwd = process.cwd();
    const repoRoot = assetRoot();

    let host = opts.host;
    if (host === "auto") {
      const detected = detectHosts(cwd).filter((d) => d.available).map((d) => d.host);
      if (detected.includes("claude-code")) {
        host = "claude-code";
      } else if (detected.includes("codex")) {
        host = "codex";
      } else if (detected.includes("openclaw")) {
        host = "openclaw";
      } else {
        console.log(
          "No host detected. Install Claude Code, Codex, or OpenClaw first, or pass --host explicitly.",
        );
        process.exitCode = 1;
        return;
      }
    }

    if (host === "claude-code") {
      const plan = planClaudeInstall(repoRoot, scope, cwd);
      const result = applyInstall(plan, Boolean(opts.dryRun));
      console.log(`${result.applied ? "Installed" : "[dry-run] Would install"} into ${plan.baseDir}:`);
      for (const target of result.installed) {
        console.log(`  + ${target}`);
      }
      for (const target of result.skipped) {
        console.log(`  ! skipped (pre-existing, not ours): ${target}`);
      }
      if (result.skipped.length > 0) {
        console.log(
          "Some targets already existed and were left untouched. Remove/rename them, then re-run.",
        );
      }
      if (result.applied) {
        console.log('Done. In Claude Code, the "saul" subagent and skills are now available in this scope.');
      }
      return;
    }

    if (host === "openclaw") {
      const result = installOpenClaw(repoRoot, Boolean(opts.dryRun));
      console.log(`${result.applied ? "Installed" : "[dry-run] Would install"} into OpenClaw:`);
      for (const cmd of result.commands) {
        console.log(`  ${cmd}`);
      }
      if (result.applied) {
        console.log(`Done. ${result.skills.length} skills installed. Enable them in your OpenClaw workspace.`);
      }
      return;
    }

    if (host === "codex") {
      const plan = planCodexInstall(repoRoot, scope, cwd);
      const result = applyInstall(plan, Boolean(opts.dryRun));
      console.log(`${result.applied ? "Installed" : "[dry-run] Would install"} into ${plan.baseDir}:`);
      for (const target of result.installed) {
        console.log(`  + ${target}`);
      }
      for (const target of result.skipped) {
        console.log(`  ! skipped (pre-existing, not ours): ${target}`);
      }
      if (result.applied) {
        console.log("Done. Saul skills are now available for Codex in this scope.");
      }
      return;
    }

    throw new Error(`Unknown --host "${host}". Use claude-code, codex, openclaw, or auto.`);
  });

program
  .command("uninstall")
  .description("Remove the Saul skills + subagent that were installed into a host.")
  .option("--host <host>", "Target host: claude-code or codex.", "claude-code")
  .option("--scope <scope>", "Scope: project or user.", "project")
  .option("--dry-run", "Show what would be removed without deleting.")
  .action((opts: { host: string; scope: string; dryRun?: boolean }) => {
    if (opts.host !== "claude-code" && opts.host !== "codex") {
      console.log("Uninstall is supported for --host claude-code or codex. For OpenClaw, use: openclaw skills remove <name>.");
      process.exitCode = 1;
      return;
    }
    const scope = normalizeScope(opts.scope);
    const cwd = process.cwd();
    const plan = opts.host === "codex"
      ? planCodexUninstall(scope, cwd)
      : planClaudeUninstall(scope, cwd);
    if (plan.ops.length === 0) {
      console.log(`No Saul install manifest found in ${plan.baseDir}. Nothing to remove.`);
      return;
    }
    const result = applyUninstall(plan, Boolean(opts.dryRun));
    console.log(`${result.applied ? "Removed" : "[dry-run] Would remove"} from ${plan.baseDir}:`);
    for (const target of result.removed) {
      console.log(`  - ${target}`);
    }
    for (const target of result.missing) {
      console.log(`  (already gone) ${target}`);
    }
  });

program.parseAsync(process.argv).catch((err: unknown) => {
  console.error((err as Error).message);
  process.exitCode = 1;
});
