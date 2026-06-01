#!/usr/bin/env bash
# scripts/record-demo.sh — Instructions and helper for recording the demo GIF.
#
# Prerequisites:
#   brew install asciinema    # terminal recording
#   pip install asciinema-agg # or: cargo install agg  (SVG/GIF renderer)
#   # Alternative: use https://github.com/charmbracelet/vhs for scripted recordings
#
# Usage:
#   bash scripts/record-demo.sh           # interactive recording
#   bash scripts/record-demo.sh --render  # render existing .cast to GIF
#
# The demo should show:
#   1. npx better-call-saul bundle --text "<a relatable dispute>" --lang zh
#   2. The structured output appearing section by section
#   3. Total time: ~20 seconds
#
# Tips for a good recording:
#   - Use a clean terminal with a dark theme
#   - Set terminal to 100 columns × 30 rows
#   - Type at a natural pace (or use VHS for scripted replay)
#   - Pause briefly after the output appears so viewers can read
#
set -euo pipefail

CAST_FILE="docs/assets/demo.cast"
GIF_FILE="docs/assets/demo.gif"

if [[ "${1:-}" == "--render" ]]; then
  if [[ ! -f "$CAST_FILE" ]]; then
    echo "No recording found at $CAST_FILE. Run without --render first."
    exit 1
  fi
  echo "Rendering $CAST_FILE → $GIF_FILE ..."
  if command -v agg &>/dev/null; then
    agg --cols 100 --rows 30 --theme monokai "$CAST_FILE" "$GIF_FILE"
  else
    echo "Install agg: pip install asciinema-agg  OR  cargo install agg"
    exit 1
  fi
  echo "Done! GIF saved to $GIF_FILE"
  echo "Update README.md and README.zh-CN.md to reference docs/assets/demo.gif"
  exit 0
fi

echo "=== Better Call Saul Demo Recording ==="
echo ""
echo "This will start an asciinema recording."
echo "Suggested demo flow:"
echo "  1. Run: npx better-call-saul bundle --text \"房东扣了我押金说要清洁费，但入住时就是脏的\" --lang zh"
echo "  2. Let the output display fully"
echo "  3. Pause 3 seconds for readability"
echo "  4. Press Ctrl+D to stop recording"
echo ""
echo "Recording to: $CAST_FILE"
echo ""

if ! command -v asciinema &>/dev/null; then
  echo "asciinema not found. Install: brew install asciinema"
  exit 1
fi

asciinema rec --cols 100 --rows 30 --overwrite "$CAST_FILE"

echo ""
echo "Recording saved to $CAST_FILE"
echo "Run 'bash scripts/record-demo.sh --render' to convert to GIF."
