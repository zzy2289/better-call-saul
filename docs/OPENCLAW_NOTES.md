# OpenClaw Notes

These notes summarize the OpenClaw details this repo relies on. Check the official docs before implementing code because OpenClaw moves quickly.

## Official docs checked

- Getting started: https://docs.openclaw.ai/start/getting-started
- Skills: https://docs.openclaw.ai/tools/skills
- Configuration: https://docs.openclaw.ai/gateway/configuration
- GitHub repo: https://github.com/openclaw/openclaw

## Facts used by this repo

OpenClaw skills are AgentSkills-compatible folders. Each skill is a directory containing `SKILL.md` with YAML frontmatter and instructions.

Common skill locations include:

- Workspace skills: `<workspace>/skills`
- Project agent skills: `<workspace>/.agents/skills`
- Personal agent skills: `~/.agents/skills`
- Managed/local skills: `~/.openclaw/skills`
- Bundled skills shipped with OpenClaw
- Extra skill folders configured through `skills.load.extraDirs`

Workspace skills have the highest precedence among the listed skill roots.

`SKILL.md` frontmatter should include at least:

```yaml
---
name: example-skill
description: Describe when this skill should be used.
---
```

OpenClaw supports optional keys such as:

- `homepage`
- `user-invocable`
- `disable-model-invocation`
- `command-dispatch`
- `command-tool`
- `command-arg-mode`
- `metadata`

OpenClaw docs note that `metadata` should be a single-line JSON object.

OpenClaw config is read from `~/.openclaw/openclaw.json` by default. The config is JSON5 and strictly validated. Unknown keys or malformed values can prevent the Gateway from starting.

OpenClaw can watch skill folders and refresh skill snapshots, but skill changes may require a new session for reliable testing.

## Security notes

Third-party skills should be treated as untrusted until reviewed.

OpenClaw agents may have access to local files, tools, messaging channels, and shell execution depending on configuration. Better Call Saul should remain instruction-first and avoid unnecessary tool execution.

For public or group-channel use, prefer sandboxing and strict skill allowlists.
