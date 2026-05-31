#!/usr/bin/env bash
#
# Install the four Better Call Saul skills into your local OpenClaw workspace.
#
# Usage:
#   bash scripts/install-local-skills.sh            # install
#   bash scripts/install-local-skills.sh --dry-run  # show what would run
#
# This script only shells out to the official `openclaw` CLI. It does not edit
# your global config files directly and pulls no remote code.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DRY_RUN=0

for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=1 ;;
    -h|--help)
      grep '^#' "$0" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    *)
      echo "Unknown argument: $arg" >&2
      exit 2
      ;;
  esac
done

if ! command -v openclaw >/dev/null 2>&1; then
  if [ "$DRY_RUN" -eq 1 ]; then
    echo "[dry-run] note: openclaw CLI not found; a real install would require it."
  else
    echo "openclaw command not found. Install and onboard OpenClaw first:" >&2
    echo "  npm i -g openclaw@latest" >&2
    exit 1
  fi
fi

SKILLS=(complaint-handler negotiation-simulator angle-finder risk-assessor)

# Pre-flight: every skill directory must exist before we touch the host.
for skill in "${SKILLS[@]}"; do
  if [ ! -f "$ROOT_DIR/skills/$skill/SKILL.md" ]; then
    echo "Missing skill: $ROOT_DIR/skills/$skill/SKILL.md" >&2
    exit 1
  fi
done

for skill in "${SKILLS[@]}"; do
  src="$ROOT_DIR/skills/$skill"
  if [ "$DRY_RUN" -eq 1 ]; then
    echo "[dry-run] openclaw skills install \"$src\" --as \"$skill\""
    continue
  fi
  echo "Installing $skill from $src"
  # Re-installing the same name is idempotent on the OpenClaw side.
  openclaw skills install "$src" --as "$skill"
done

if [ "$DRY_RUN" -eq 1 ]; then
  echo "[dry-run] No changes made."
else
  echo "Done. Start a new OpenClaw session so skills are snapshotted fresh."
fi
