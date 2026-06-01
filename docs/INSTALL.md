# Install Better Call Saul into your agent host

Better Call Saul is a **plugin for an agent host you already run** — it does not
ship its own model or cloud service. Install it into OpenClaw or Claude Code,
then ask the host to use the Saul fixer for your dispute.

Prerequisite: Node.js >= 18.

```bash
git clone https://github.com/YOUR_NAME/better-call-saul.git
cd better-call-saul
npm install
npm run build
```

Check what's available on your machine:

```bash
node dist/cli.js detect-hosts
# or, during development: npm run saul -- detect-hosts
```

---

## Claude Code

The CLI installs the four skills into `<scope>/.claude/skills/` and a `saul`
subagent into `<scope>/.claude/agents/`.

### Project scope (this repo / a specific project)

```bash
# from the project where you want Saul available
node /path/to/better-call-saul/dist/cli.js install --host claude-code --scope project
```

### Personal scope (all your projects)

```bash
node dist/cli.js install --host claude-code --scope user
```

Preview without writing anything:

```bash
node dist/cli.js install --host claude-code --scope project --dry-run
```

### Use it

In Claude Code:

1. Start (or restart) Claude Code in the target directory.
2. The **`saul`** subagent is now available — invoke it and describe your
   dispute, or just describe the dispute and let Claude route to the
   `complaint-handler` / `negotiation-simulator` / `angle-finder` /
   `risk-assessor` skills.
3. You get the 10-section output: best angle, evidence, polite/firm/legalistic/
   Saul scripts, likely replies + counters, risk check, and Saul commentary.

### Uninstall (fully reversible)

```bash
node dist/cli.js uninstall --host claude-code --scope project
```

This removes only the paths recorded in the install manifest
(`<scope>/.claude/.saul-install.json`) — the four Saul skill folders and the
`saul` subagent file we created. Pre-existing files with the same name are never
overwritten on install and never deleted on uninstall.

---

## OpenClaw

Install and onboard OpenClaw first:

```bash
npm install -g openclaw@latest
openclaw onboard --install-daemon
openclaw gateway status
```

Install the four skills into the active OpenClaw workspace. The CLI shells out to
the `openclaw` binary for you:

```bash
node dist/cli.js install --host openclaw            # install all 4 skills
node dist/cli.js install --host openclaw --dry-run  # preview the exact commands
```

Equivalently, you can run the bundled script directly:

```bash
bash scripts/install-local-skills.sh            # install
bash scripts/install-local-skills.sh --dry-run  # preview
```

Start a **new** OpenClaw session afterward — OpenClaw snapshots skills at session
start, so a fresh session avoids stale instructions. Then describe your dispute
and the relevant skill will trigger.

To remove a skill: `openclaw skills remove <name>`.

You can also print a workspace config snippet (the CLI never edits your config):

```bash
node dist/cli.js print-openclaw-config --workspace "$PWD"
```

---

## No host? Paste-ready bundle

Even without a host, you can generate a complete prompt and paste it into any
chat model:

```bash
npm run saul -- bundle --text "the hotel downgraded me after overbooking and won't refund the difference"
```

Copy the Markdown output into your assistant of choice. See
[GALLERY.md](../GALLERY.md) for example outputs.

---

## Safety notes

- Installs are local and reversible; nothing is uploaded.
- The CLI never sends messages, automates a browser, or edits host config files
  beyond copying the skill/subagent files described above.
- The Saul persona refuses fabricated evidence, fake threats, impersonation, and
  harassment by design — see [SAFETY_POLICY.md](SAFETY_POLICY.md).
