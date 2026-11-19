# Homeward Paws brand guidelines v1.1

2026-11-17 · Digitack (Pty) Ltd · info@digitack.co.za. Plain-text companion to `BRAND_GUIDELINES.html` (open that for the visual version). Values come from `tokens/tokens.json`.

## Ten rules

1. Use the tokens (`--hp-*`, the Tailwind preset, or the app theme). Never type hex values, sizes or radii by hand.
2. Teal (`primary`) is the action colour: main buttons, links, active tab, focus ring.
3. Coral (`accent`) is warmth only: logo heart, notification dot, illustration. Never text, a button or status.
4. Status is always colour + icon + UPPERCASE label; status colours mean status only.
5. The status is MISSING, not "lost". Say *animals*, not "pets", in the product.
6. Warm cream page, white cards with a hairline border, soft navy shadows; never black.
7. Nunito for everything (400–900). Dancing Script only for short photo captions on the website.
8. Use the supplied logo files. Never redraw, recolour, stretch or add effects.
9. Animal photos are the hero on report screens; marketing photography stays on the website and onboarding.
10. Accessible by default: 4.5:1 text contrast, 48 dp touch targets, labels on icon buttons, no flashing.

## Brand

Free, Android-first community app for South Africa that helps reunite missing, found and sighted animals with their people. Personality: warm, compassionate, trustworthy, calm, community-driven, practical; friendly without being childish. Not clinical, corporate, cluttered or a constant emergency dashboard.

Tagline: **Helping lost animals find their way home.** ("Lost" is fine in this marketing line; in the product the status is MISSING.) Celebration ("Every animal deserves to come home") is reserved for confirmed reunions.

## Logo

Teal roofline with chimney and a coral heart over navy dog and cat silhouettes. Files in `assets/brand/` (SVG masters with outlined text, PNGs).

| File | Use |
|---|---|
| `logo-horizontal` | Default |
| `logo-stacked` | Splash, onboarding, print (includes tagline) |
| `logo-mark` | App icon, square spaces |
| `logo-small` | Anything under 32 px; notification icon |
| `*-reverse` | On teal, navy or dark photos |
| `logo-mark-mono-white` / `-mono-navy`, `logo-small-mono-white` | Single colour |

Clear space: at least the heart's width on every side. Keep the horizontal logo at least 120 px wide on screen; below 32 px use `logo-small`. Only full colour, reverse or single colour. Don't redraw, retype the wordmark, recolour, stretch, rotate, crop, rearrange, or add shadows, outlines or gradients. Coral only in the heart. No full-colour logo on busy photos.

## Colour

### Brand

| Token | Value | Use |
|---|---|---|
| `primary` | `#227A71` | Teal. Filled buttons, active tab, links, focus ring. |
| `primaryBright` | `#2F9488` | Icons, illustrations, Report button ring, decoration. Not for text. |
| `primaryDark` | `#185C55` | Pressed/hover state, strong headings on tint. |
| `primaryLight` | `#E3F2EF` | Selected backgrounds, tinted tiles, info callouts. |
| `primaryMid` | `#D3EAE5` | Web only: hover on light teal, decorative bands. |
| `accent` | `#E8735F` | Coral. Brand warmth only: logo heart, notification dot, illustration. Never text, never status. |
| `accentLight` | `#FCE9E4` | Coral tile background. |
| `highlight` | `#E9B949` | Mustard. Notification/alert icon tiles. Not for text. |
| `highlightLight` | `#FBF3DC` | Mustard tile and warning-callout background. |
| `highlightOnTint` | `#6B4E00` | Text on highlightLight (warning callouts). |

### Neutrals and feedback

| Token | Value | Use |
|---|---|---|
| `background` | `#FBF7F2` | Warm cream page/screen background. Also splash and adaptive-icon background. |
| `surface` | `#FFFFFF` | Cards, sheets, tab bar, inputs. |
| `surfaceMuted` | `#F5EFE7` | Secondary panels, skeletons, input fill. |
| `textPrimary` | `#1F2D3D` | Deep navy. Body and heading text; also the base colour for shadows and overlays. |
| `textSecondary` | `#5E6B78` | Supporting text, inactive tabs. |
| `textOnPrimary` | `#FFFFFF` | Text on teal or navy fills. |
| `textOnDarkMuted` | `#C9D3DC` | Secondary text on navy fills. |
| `border` | `#ECE4DA` | Hairline dividers, card and input borders. |
| `overlay` | `rgba(31, 45, 61, 0.48)` | Modal scrim (navy at 48%). |
| `error` | `#B3363C` | Destructive actions and field errors. Not a status colour. |

Coral, `primaryBright` and mustard fail text contrast: decoration and icons only. Full contrast table: `tokens/CONTRAST.md`.

## Status system

| Status | base | tint | onTint | Label | Icon |
|---|---|---|---|---|---|
| Missing | `#C8424A` | `#FBE6E7` | `#9A2A31` | MISSING | `alert-circle` |
| Found | `#D97820` | `#FCEEDD` | `#8F4A0C` | FOUND | `shield-home` |
| Sighting | `#2F6FCE` | `#E3EDFB` | `#1D4E9A` | SIGHTING | `eye` |
| Reunited | `#2E8456` | `#E2F3E9` | `#1D5E3B` | REUNITED | `home-heart` |
| Partner | `#7A5BB0` | `#EEE7F7` | `#55397F` | VERIFIED PARTNER | `check-decagram` |
| Admin | `#3E5057` | `#E6EBED` | `#2B3A40` | (per context, e.g. ARCHIVED) | `(per context)` |
| Safe (animal profile) | Reunited colours | | | SAFE | `home-heart` |

`base` for icons, map pins and banners; `tint` for chip backgrounds; `onTint` for chip text and icons. Solid status fills with white text need large bold text (banners: 19 px, weight 900). White on the base Found amber fails normal-size contrast, so Found buttons and banners use `foundOnTint` as the fill. Animal statuses: safe → Reunited colours, SAFE; missing → Missing; in care, fostered, transferred → Found; archived, deceased → Admin slate.

## Typography

Nunito everywhere (app: `@expo-google-fonts/nunito` 400/600/700/800; web: self-hosted 400–900). Dancing Script 600: website photo captions only.

### App scale (sp)

| Token | Size / line | Weight |
|---|---|---|
| `display` | 28 / 34 | extraBold |
| `screenTitle` | 22 / 28 | extraBold |
| `sectionTitle` | 17 / 22 | bold |
| `cardTitle` | 16 / 21 | bold |
| `body` | 15 / 22 | regular |
| `bodyStrong` | 15 / 22 | semibold |
| `label` | 13 / 18 | bold |
| `caption` | 12 / 16 | semibold |
| `button` | 16 / 20 | bold |
| `status` | 11 / 14 | extraBold · uppercase, +0.5 spacing |

### Website

Body 17 px (16 px at 560 px and below), line-height 1.6. Hero title clamp(40px, 5.2vw, 64px) / 900; page title clamp(34px, 5vw, 48px) / 900; section title clamp(30px, 4vw, 42px) / 900; h2 26 px / 900; h3 19–23 px / 800–900; lead 18–20 px / 600 secondary colour; eyebrow 13 px / 800, uppercase, 0.14em, teal; buttons 16 px / 800; chips 12 px / 900 uppercase 0.06em.

## Spacing, shape and elevation

Spacing: 4, 8, 12, 16, 20, 24, 32, 40, 48. App screen margin 20 dp; touch targets ≥ 48 dp. Web: 1120 px content width, 20 px gutters, 72 px section padding (52 px on phones), buttons ≥ 52 px tall.

| Radius | App (dp) | Web (px) | Use |
|---|---|---|---|
| `sm` | 8 | 10 | Inputs, small thumbnails |
| `md` | 14 | 14 | Buttons, callouts |
| `lg` | 18 | 20 | Cards, photos |
| `xl` | 24 | 28 | Hero card, sheets |
| `pill` | 999 | 999 | Chips |
| `circle` | 50% | 50% | Icon tiles, avatars, Report button |

Shadows are navy (`#1F2D3D`) at low opacity: app card 0.07 / radius 10 / y 3 / elevation 2, raised 0.18 / 12 / 5 / 7; web card `0 10px 30px rgba(31, 45, 61, 0.08)`, raised `0 24px 50px rgba(31, 45, 61, 0.18)`.

## Components

Web classes in `css/homeward-paws.css`; app component names from the design system in brackets.

- **Buttons** (PrimaryButton, SecondaryButton, TextButton): `hp-btn--primary` (one per view), `--secondary` (outlined), `--text`, `--destructive`, urgent `--missing` / `--found` / `--sighting` / `--reunited`. Disable and show progress while submitting.
- **Status chips** (StatusChip): `hp-chip--missing|found|sighting|reunited|safe|partner|admin`, always with an icon.
- **Status banner** (ReportStatusBanner): `hp-status-banner--*`.
- **Cards** (ReportCard, HeroCard): `hp-card`, `--raised`, `--hero`, `--interactive`; photos `hp-photo` (4:3 or square, `lg` radius).
- **Icon tiles** (IconTile): `hp-icon-tile` with `--accent`, `--highlight` or a status modifier.
- **Callouts** (InfoBanner): `hp-callout`, `--warn`, `--alert`, `--success`.
- **Forms** (FormField): permanent label above (`hp-label`), `hp-input`, help text, inline `hp-error`; selected choice cards get a `primaryLight` fill and teal border.
- **Steps**: `hp-steps` (Report → Share → Reunite).

## Icons

MaterialCommunityIcons only (`@expo/vector-icons` in the app; SVGs in `icons/` for the web, filled with `currentColor`). Status: Missing `alert-circle`, Found `shield-home`, Sighting `eye`, Reunited/Safe `home-heart`, Partner `check-decagram`. Categories: dog `dog`, cat `cat`, bird `bird`, horse and donkey `horse`, rabbit `rabbit`, reptile `snake`, small mammal `rodent`, farm animal `cow`, other `paw`, unsure `help`. Report button: `paw` (optionally a small `plus` badge) in a raised teal circle with a white ring, label "Report an animal". Tabs: Home, Browse, Report, Following, Profile. No other icon sets, no emoji.

## Imagery

The reported animal's photo is the hero on report and case screens. Emotive photography belongs on the website, onboarding, empty states and store listing only; never stock photos inside the app. Text over photos needs a darkening scrim. Placeholders per animal category (`assets/placeholders/`), flat illustrations in brand colours for empty and success states (`assets/illustrations/`; `reunited` only for confirmed reunions). Map pins anchor bottom-centre; the approximate-area marker anchors centre and is used whenever public precision is suburb or approximate. Never show a private location as an exact pin.

## Voice and words

Plain South African English, short sentences, tell people what to do next. Never alarmist; never cutesy on a missing case.

| Use | Avoid |
|---|---|
| MISSING, missing animal | lost (as a status) |
| animals | pets (in product copy; fine in casual marketing) |
| FOUND · SIGHTING · REUNITED · SAFE | rescued, spotted, saved |
| My Animal Is Missing · I Found an Animal · I Saw an Animal | one "Report Lost or Found" button |
| Welcome back, Andre | Pet Hero, badges, gamified titles |
| Last seen near Strand beach | exact addresses, house numbers |
| We couldn't upload the photo. Your report is saved. | Error 500, "Oops!" |
| info@digitack.co.za | personal emails or phone numbers |

## Platform notes

- **Website:** link `css/homeward-paws.css`. The live site enforces a strict Content Security Policy: no inline scripts (JavaScript in `.js` files), self-hosted fonts and scripts, no analytics, cookies or third-party requests. Only contact address: info@digitack.co.za; no physical address or company registration number.
- **App:** drop `react-native/theme/` into `src/theme/`; icon, adaptive icon, splash and notification files in `assets/app/` (config excerpt in `docs/07_BRAND_AND_ASSETS.md`). JavaScript only.
- **Email:** cream background, one white card (20 px radius), teal button, navy text, `assets/email/email-logo.png` hosted on the website; footer with Digitack (Pty) Ltd, info@digitack.co.za and the privacy link. No tracking pixels.

## Changing the brand

Edit `tokens/tokens.json` only, then run `python3 tools/generate-tokens.py .` and `python3 tools/build-guidelines.py .`. Brand changes are approved by Andre, and by Rudi for anything in the app; bump the version and date.
