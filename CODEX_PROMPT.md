# Codex Prompt

You are working in the `better-call-saul` repository.

Goal: implement the code-layer MVP without changing the core product direction.

Context:

- This repo is an OpenClaw-based workspace for a Saul-inspired dispute, complaint, and negotiation fixer agent.
- The content layer already exists: `SOUL.md`, `lore/`, `knowledge/`, `skills/`, `examples/`, `prompts/`, `schema/`, and docs.
- OpenClaw skills live under `skills/<skill-name>/SKILL.md` and must keep compatible frontmatter with `name` and `description`.
- The project should remain local-first, safe, and reviewable.

Implement:

1. Initialize a Node/TypeScript project.
2. Add a CLI binary named `saul`.
3. Implement commands:
   - `saul doctor`
   - `saul validate`
   - `saul list-skills`
   - `saul classify --file <path>`
   - `saul bundle --file <path>`
   - `saul run-example <path>`
   - `saul print-openclaw-config --workspace <absolute-path>`
4. Implement skill discovery and validation.
5. Implement a deterministic keyword-based classifier mapping dispute scenarios to skills and knowledge files.
6. Implement a prompt bundler that combines `SOUL.md`, relevant lore, relevant knowledge files, selected skill instructions, output format, and user case into a Markdown prompt bundle.
7. Add tests with Vitest.
8. Add GitHub Actions CI.
9. Keep default behavior dry-run. Do not automatically edit `~/.openclaw/openclaw.json`.
10. Do not add autonomous message sending, browser automation, shell execution from user content, or remote script execution.

Acceptance criteria:

- `npm test` passes.
- `npm run validate` passes.
- `saul list-skills` shows the four skills.
- `saul classify --file examples/amazon_refund.md` returns `complaint-handler` and e-commerce/customer-service knowledge files.
- `saul bundle --file examples/amazon_refund.md` prints a coherent Markdown prompt bundle.
- `saul print-openclaw-config --workspace <absolute-path>` prints a JSON5 snippet using that path.
- Existing Markdown content remains intact except for small corrections needed by validation.

Important constraints:

- Do not commit secrets.
- Do not include copyrighted TV dialogue or scene transcripts.
- Do not weaken `docs/SAFETY_POLICY.md`.
- Do not make legal-advice claims.
- Do not add dependencies that require network calls during tests.
- Keep code simple, typed, and easy to audit.
