#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if ! command -v openclaw >/dev/null 2>&1; then
  echo "openclaw command not found. Install and onboard OpenClaw first."
  exit 1
fi

for skill in complaint-handler negotiation-simulator angle-finder risk-assessor; do
  echo "Installing $skill from $ROOT_DIR/skills/$skill"
  openclaw skills install "$ROOT_DIR/skills/$skill" --as "$skill"
done

echo "Done. Start a new OpenClaw session so skills are snapshotted fresh."
