#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

required_files=(
  "README.md"
  "SOUL.md"
  "AGENTS.md"
  "DISCLAIMER.md"
  "SECURITY.md"
  "CONTRIBUTING.md"
  "docs/SAFETY_POLICY.md"
  "prompts/output_formats.md"
  "schema/dispute_case.schema.json"
  "schema/saul_output.schema.json"
)

for file in "${required_files[@]}"; do
  if [ ! -f "$ROOT_DIR/$file" ]; then
    echo "Missing required file: $file"
    exit 1
  fi
done

skills=(complaint-handler negotiation-simulator angle-finder risk-assessor)
for skill in "${skills[@]}"; do
  skill_file="$ROOT_DIR/skills/$skill/SKILL.md"
  if [ ! -f "$skill_file" ]; then
    echo "Missing skill file: $skill_file"
    exit 1
  fi
  if ! grep -q "^name: $skill$" "$skill_file"; then
    echo "Skill frontmatter name mismatch in $skill_file"
    exit 1
  fi
  if ! grep -q "^description: " "$skill_file"; then
    echo "Missing description in $skill_file"
    exit 1
  fi
done

python3 -m json.tool "$ROOT_DIR/schema/dispute_case.schema.json" >/dev/null
python3 -m json.tool "$ROOT_DIR/schema/saul_output.schema.json" >/dev/null

echo "Repo validation passed."
