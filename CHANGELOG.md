# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Host integration: `saul detect-hosts`, `saul install`, and `saul uninstall`
  commands. Native, reversible Claude Code install (skills into
  `.claude/skills/`, a `saul` subagent into `.claude/agents/`; project or user
  scope, `--dry-run` supported) plus a hardened OpenClaw install script.
- `saul` Claude Code subagent template and `better-call-saul` bin alias for the
  `npx better-call-saul install` workflow.
- `GALLERY.md` with six illustrative input/output dispute cases and
  `docs/INSTALL.md` covering both hosts.
- Example output snapshot regression tests covering every file in `examples/`,
  locking in the deterministic routing + prompt-bundle pipeline.
- CI, Node, license, and tests badges to the top of the README.
- Governance files: `CODE_OF_CONDUCT.md`, this `CHANGELOG.md`, and
  `.github/FUNDING.yml`.

## [0.1.0] - 2026-05-31

### Added

- TypeScript `saul` CLI with `doctor`, `validate`, `list-skills`, `check-refs`,
  `classify`, `bundle`, `run-example`, and `print-openclaw-config` commands.
- vitest test suite and GitHub Actions CI matrix (Node 18/20/22).
- OpenClaw workspace content: `SOUL.md`, four skills, nine knowledge packs, lore,
  output format contract, JSON schemas, and five example cases.
- Safety policy, disclaimer, security policy, and contribution guidelines.

[Unreleased]: https://github.com/YOUR_NAME/better-call-saul/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/YOUR_NAME/better-call-saul/releases/tag/v0.1.0
