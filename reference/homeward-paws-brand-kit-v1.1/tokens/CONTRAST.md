# Colour contrast (WCAG 2.1)

Generated from `tokens.json`. Normal text needs 4.5:1; large text (18.66px bold or 24px regular and up; 18sp bold in the app) and icons need 3:1.

| Foreground | Background | Use | Ratio | Normal text (4.5) | Large text (3.0) |
|---|---|---|---|---|---|
| `textPrimary` #1F2D3D | `background` #FBF7F2 | Body text on page | 13.12:1 | pass | pass |
| `textPrimary` #1F2D3D | `surface` #FFFFFF | Body text on card | 13.99:1 | pass | pass |
| `textSecondary` #5E6B78 | `background` #FBF7F2 | Supporting text on page | 5.11:1 | pass | pass |
| `textSecondary` #5E6B78 | `surface` #FFFFFF | Supporting text on card | 5.45:1 | pass | pass |
| `primary` #227A71 | `background` #FBF7F2 | Links on page | 4.81:1 | pass | pass |
| `primary` #227A71 | `surface` #FFFFFF | Links on card | 5.13:1 | pass | pass |
| `textOnPrimary` #FFFFFF | `primary` #227A71 | White text on teal button | 5.13:1 | pass | pass |
| `textOnPrimary` #FFFFFF | `primaryDark` #185C55 | White text on pressed teal | 7.78:1 | pass | pass |
| `primaryDark` #185C55 | `primaryLight` #E3F2EF | Dark teal text on teal tint | 6.74:1 | pass | pass |
| `highlightOnTint` #6B4E00 | `highlightLight` #FBF3DC | Warning callout text | 6.98:1 | pass | pass |
| `textOnPrimary` #FFFFFF | `error` #B3363C | White text on destructive button | 5.98:1 | pass | pass |
| `error` #B3363C | `surface` #FFFFFF | Error text on card | 5.98:1 | pass | pass |
| `textOnPrimary` #FFFFFF | `textPrimary` #1F2D3D | White text on navy | 13.99:1 | pass | pass |
| `textOnDarkMuted` #C9D3DC | `textPrimary` #1F2D3D | Muted text on navy | 9.22:1 | pass | pass |
| `accent` #E8735F | `surface` #FFFFFF | Coral on white (decoration only) | 2.98:1 | FAIL | FAIL |
| `primaryBright` #2F9488 | `surface` #FFFFFF | Bright teal on white (icons only) | 3.68:1 | FAIL | pass |
| `missingOnTint` #9A2A31 | `missingTint` #FBE6E7 | Missing chip text on tint | 6.39:1 | pass | pass |
| `textOnPrimary` #FFFFFF | `missing` #C8424A | White text on solid missing fill | 4.85:1 | pass | pass |
| `foundOnTint` #8F4A0C | `foundTint` #FCEEDD | Found chip text on tint | 5.84:1 | pass | pass |
| `textOnPrimary` #FFFFFF | `found` #D97820 | White text on solid found fill | 3.15:1 | FAIL | pass |
| `sightingOnTint` #1D4E9A | `sightingTint` #E3EDFB | Sighting chip text on tint | 6.81:1 | pass | pass |
| `textOnPrimary` #FFFFFF | `sighting` #2F6FCE | White text on solid sighting fill | 4.90:1 | pass | pass |
| `reunitedOnTint` #1D5E3B | `reunitedTint` #E2F3E9 | Reunited chip text on tint | 6.71:1 | pass | pass |
| `textOnPrimary` #FFFFFF | `reunited` #2E8456 | White text on solid reunited fill | 4.61:1 | pass | pass |
| `partnerOnTint` #55397F | `partnerTint` #EEE7F7 | Partner chip text on tint | 7.64:1 | pass | pass |
| `textOnPrimary` #FFFFFF | `partner` #7A5BB0 | White text on solid partner fill | 5.32:1 | pass | pass |
| `adminOnTint` #2B3A40 | `adminTint` #E6EBED | Admin chip text on tint | 9.80:1 | pass | pass |
| `textOnPrimary` #FFFFFF | `admin` #3E5057 | White text on solid admin fill | 8.43:1 | pass | pass |

**Rules that follow from this table:** coral (`accent`), `primaryBright` and `highlight` never carry text. A solid status fill with white text needs large bold text, or use the `onTint` shade as the fill. Chips always use tint background + onTint text.
