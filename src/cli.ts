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
import type { DisputeCase } from "./types.js";

const program = new Command();

program
  .name("saul")
  .description("Better Call Saul — OpenClaw workspace CLI for disputes, complaints, and negotiations.")
  .version("0.1.0");

function root(): string {
  return findRepoRoot(process.cwd());
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

function loadCase(opts: { file?: string; text?: string }): DisputeCase {
  if (opts.text) return { scenario: opts.text };
  if (!opts.file) {
    throw new Error("Provide --file <path> or --text <scenario>.");
  }
  if (opts.file.endsWith(".json")) {
    return JSON.parse(readFileSync(opts.file, "utf8")) as DisputeCase;
  }
  // Treat any other file (e.g. example .md) via the example parser.
  const parsed = parseExampleFile(opts.file);
  return { scenario: parsed.scenario || parsed.raw };
}

program
  .command("classify")
  .description("Classify a dispute into skill, knowledge files, risk, and missing facts.")
  .option("--file <path>", "Path to an example .md or case .json file.")
  .option("--text <scenario>", "Inline scenario text.")
  .action((opts: { file?: string; text?: string }) => {
    const classification = classify(loadCase(opts));
    console.log(JSON.stringify(classification, null, 2));
  });

program
  .command("bundle")
  .description("Build a full prompt bundle (Markdown by default).")
  .option("--file <path>", "Path to an example .md or case .json file.")
  .option("--text <scenario>", "Inline scenario text.")
  .option("--json", "Output the JSON bundle instead of Markdown.")
  .action((opts: { file?: string; text?: string; json?: boolean }) => {
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

program.parseAsync(process.argv).catch((err: unknown) => {
  console.error((err as Error).message);
  process.exitCode = 1;
});
