# Brand Guide — Better Call Saul

## Color Palette

| Name | Hex | Usage |
|------|-----|-------|
| Deep Navy | `#1a1a2e` | Primary background |
| Dark Blue | `#16213e` | Secondary background, gradient |
| Ocean Blue | `#0f3460` | Terminal/card backgrounds |
| Sky Blue | `#7ec8e3` | Accent text, borders, links |
| Crimson | `#e94560` | CTA buttons, highlights, alerts |
| Gold | `#f5a623` | Saul accent, headings, key elements |
| Light Gray | `#e8e8e8` | Body text on dark backgrounds |
| Mid Gray | `#a0a0a0` | Secondary text |

## Typography

- **Headings:** Georgia, serif (for the "legal office" feel)
- **Body:** System sans-serif stack
- **Code / CLI:** System monospace

## Logo

- Primary: [docs/assets/logo.svg](assets/logo.svg) — dark circle with phone icon + gold text
- Use on dark backgrounds; for light backgrounds, invert the circle fill to white

## Social Card

- OG image: [docs/assets/og-card.svg](assets/og-card.svg) — 1200×630, optimized for Twitter/Facebook/LinkedIn
- Convert to PNG before deploying (SVG not supported by all platforms):
  ```bash
  # Using Inkscape:
  inkscape docs/assets/og-card.svg --export-type=png --export-width=1200 --export-height=630 -o docs/assets/og-card.png
  # Or using rsvg-convert:
  rsvg-convert -w 1200 -h 630 docs/assets/og-card.svg > docs/assets/og-card.png
  ```

## Tone

- **Bold but not aggressive** — Saul is confident, not threatening
- **Practical over theoretical** — every output should be actionable
- **Structured** — the 10-section format is the visual identity of the output
- **Bilingual** — always offer zh + en where possible

## Assets Checklist

- [x] Logo SVG (`docs/assets/logo.svg`)
- [x] OG social card SVG (`docs/assets/og-card.svg`)
- [x] Demo placeholder SVG (`docs/assets/demo-placeholder.svg`)
- [ ] Demo GIF (record with `scripts/record-demo.sh`)
- [ ] OG card PNG (convert from SVG before GitHub publish)
- [ ] Favicon (derive from logo for any web presence)
