# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-06-02

### Added

- **Codex host support**: `saul install --host codex` copies skills into
  `.agents/skills/`, `saul uninstall --host codex`, and `saul detect-hosts`
  now detects codex CLI / `.agents/` directory.
- **Skill self-containment** (Phase 2): each skill's `references/` now includes
  `docs__SAFETY_POLICY.md` and `prompts__output_formats.md` so a standalone
  skill directory is fully usable without the repo root.
- **Multi-platform metadata** (Phase 4): all 4 SKILL.md frontmatter metadata
  extended to `{openclaw, claude-code, codex}` — any agent tool can read the
  key it recognizes.
- Codex mentioned throughout README, README.zh-CN, docs/INSTALL.md, and CLI
  help descriptions.

### Changed

- Unified entry point: `CODEX_PROMPT.md` merged into `AGENTS.md` with a
  multi-platform routing table (Phase 1).
- package.json description updated to be platform-neutral.
- Reference count increased from 33 to 38 (5 new cross-skill copies).
- Test count increased from 150 to 156 (6 new Codex installer tests).

### Removed

- `CODEX_PROMPT.md` (content merged into `AGENTS.md`).

## [0.1.0] - 2026-05-31

### Added

- TypeScript `saul` CLI with `doctor`, `validate`, `list-skills`, `check-refs`,
  `classify`, `bundle`, `run-example`, and `print-openclaw-config` commands.
- vitest test suite and GitHub Actions CI matrix (Node 18/20/22).
- OpenClaw workspace content: `SOUL.md`, four skills, nine knowledge packs, lore,
  output format contract, JSON schemas, and five example cases.
- Safety policy, disclaimer, security policy, and contribution guidelines.

[Unreleased]: https://github.com/zzy2289/better-call-saul/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/zzy2289/better-call-saul/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/zzy2289/better-call-saul/releases/tag/v0.1.0
