# Security Policy

Better Call Saul is designed to run as a local-first OpenClaw workspace. Because OpenClaw agents can interact with files, tools, messaging channels, and sometimes shell commands, security matters.

## Supported versions

This starter repo does not yet have versioned releases. Treat `main` as experimental until the first tagged release.

## Reporting a vulnerability

Open an issue with the label `security` if the issue is not sensitive.

For sensitive findings, do not post secrets or exploit details publicly. Create a minimal private report for the maintainer once a private disclosure channel exists.

## Security principles

- Treat third-party skills as untrusted until reviewed.
- Keep this repo's skills instruction-only by default.
- Do not add remote install scripts that execute unreviewed code.
- Do not commit API keys, channel tokens, credentials, cookies, or user dispute records.
- Do not let generated scripts upload private examples by default.
- Prefer sandboxing for non-main sessions.
- Prefer local files and deterministic validation over network-dependent setup.

## User-data guidance

Dispute examples can contain sensitive personal, financial, medical, employment, or legal information. Keep examples synthetic unless the user explicitly chooses to store real data.

Before sharing logs or examples, remove:

- Names
- Addresses
- Phone numbers
- Email addresses
- Order numbers
- Tracking numbers
- Card or bank details
- Account IDs
- Private screenshots
- Contract signatures
- Government IDs

## Skill safety

The project skills must not:

- Exfiltrate files.
- Execute shell commands without clear user intent.
- Modify external accounts.
- Send messages autonomously.
- Install dependencies silently.
- Ask users to paste secrets into prompts.

## OpenClaw-specific notes

OpenClaw skill docs warn that third-party skills should be treated as untrusted code and reviewed before enabling. See:

- https://docs.openclaw.ai/tools/skills
- https://docs.openclaw.ai/gateway/configuration
