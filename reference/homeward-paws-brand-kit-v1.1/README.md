# Homeward Paws brand kit v1.1

Corporate identity for Homeward Paws (Digitack (Pty) Ltd), for designers and developers. Version 1.1, 17 November 2026. Contact: info@digitack.co.za.

**Start with `BRAND_GUIDELINES.html`.** Open it in a browser straight from this folder; it works offline and uses the kit's own style sheet, so every example on it is real. `BRAND_GUIDELINES.md` is the same rules in plain text.

## What's in the box

| Path | What it is | Use it for |
|---|---|---|
| `BRAND_GUIDELINES.html` / `.md` | The rules: logo, colour, status system, type, spacing, components, icons, imagery, voice | Read first |
| `tokens/tokens.json` | **Single source of truth** for every colour, size, radius and shadow | Edit only this; regenerate the rest |
| `tokens/tokens.css` | CSS custom properties (`--hp-*`), plus the aliases the live website uses | Any web project |
| `tokens/tokens.scss` | SCSS variables | Sass projects |
| `tokens/tailwind.preset.js` | Tailwind preset (`hp-*` colours, radii, shadows, fonts) | Tailwind projects |
| `tokens/CONTRAST.md` | WCAG contrast for every text pairing | Accessibility checks |
| `css/homeward-paws.css` | Web component style sheet: buttons, status chips and banners, cards, icon tiles, callouts, forms, steps, tables | Websites, admin pages, prototypes |
| `css/fonts/` | Nunito 400–900 and Dancing Script 600 (woff2) with their SIL OFL licences | Self-hosted web fonts |
| `react-native/theme/` | Drop-in theme for the Expo app (JavaScript only): colours, typography, spacing, radii, shadows, status map | The app's `src/theme/` |
| `icons/` | The Material Design Icons the app uses, as SVG, with licence | Web icons (`fill: currentColor`) |
| `assets/brand/` | Logo SVG masters (text outlined) and PNGs: horizontal, stacked, mark, small; reverse and single-colour | Everywhere the logo appears |
| `assets/app/` | App icon, Android adaptive icon (foreground, background, monochrome), splash, notification icon, favicon | Expo `app.config.js` |
| `assets/markers/` | Status map pins and the approximate-area marker (@1x/@2x/@3x) | Maps |
| `assets/placeholders/` | Animal-category placeholders (dog, cat, bird, horse, donkey, rabbit, reptile, small mammal, farm animal, other, unsure) | Reports without a photo |
| `assets/illustrations/` | Empty results, no animals, offline, reunited | Empty and success states |
| `assets/store/` | Google Play hi-res icon and feature graphic | Play Console only |
| `assets/web/` | Favicons, touch icon, social share image (1200×630) | Websites |
| `assets/email/` | Email header logo | Email templates |
| `tools/` | `generate-tokens.py` and `build-guidelines.py` | Regenerating after a token change |

## Quick start

**Web**

```html
<link rel="stylesheet" href="css/homeward-paws.css">
<button class="hp-btn hp-btn--primary">Continue</button>
<span class="hp-chip hp-chip--missing"><svg viewBox="0 0 24 24" aria-hidden="true"><!-- icons/alert-circle.svg path --></svg>Missing</span>
```

**App (Expo SDK 57, JavaScript only)**

Copy `react-native/theme/*` over `src/theme/` (the existing values are identical; the kit adds partner and admin colours, the `label` and `status` type styles, `layout` and a `status` map). Fonts come from `@expo-google-fonts/nunito`; icons from `@expo/vector-icons` (MaterialCommunityIcons). App icon set: see `assets/app/` and section 1 of `docs/07_BRAND_AND_ASSETS.md`.

## Changing the brand

1. Edit `tokens/tokens.json` (bump `meta.version` and `meta.date`).
2. Run `python3 tools/generate-tokens.py .` then `python3 tools/build-guidelines.py .` from this folder.
3. Brand changes are approved by Andre; anything that changes the app is agreed with Rudi as well.

Never add colours, fonts or icon sets outside this kit without that approval.

## Not included

Marketing photographs from the website (licensing is kept separately; ask info@digitack.co.za). The asset generation scripts for the logo artwork are kept by Digitack.

## Licences

- Nunito and Dancing Script: SIL Open Font License 1.1 (`css/fonts/OFL-*.txt`).
- Icons: Material Design Icons by Pictogrammers (`icons/LICENSE-MaterialDesignIcons.txt`).
- Logo, mark, markers, placeholders and illustrations: original work for Digitack (Pty) Ltd. All rights reserved; for Homeward Paws use only.
