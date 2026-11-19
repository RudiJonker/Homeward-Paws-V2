#!/usr/bin/env python3
"""Generate Homeward Paws token outputs from tokens/tokens.json.

Usage: python3 generate.py <kit-root>
Writes tokens/tokens.css, tokens/tokens.scss, tokens/tailwind.preset.js,
react-native/theme/*.js and tokens/CONTRAST.md.
"""
import json, re, sys, pathlib

root = pathlib.Path(sys.argv[1])
T = json.loads((root / "tokens/tokens.json").read_text())
C = T["color"]
HEADER = "Homeward Paws design tokens v{v} ({d}). GENERATED from tokens/tokens.json: edit that file, not this one.".format(
    v=T["meta"]["version"], d=T["meta"]["date"])


def kebab(s):
    return re.sub(r"(?<!^)(?=[A-Z])", "-", s).lower()


def val(x):
    return x["$value"] if isinstance(x, dict) else x


# ---------- flat colour list ----------
flat = []  # (kebab name, camel name, value)
for group in ("brand", "neutral", "feedback"):
    for k, v in C[group].items():
        if k.startswith("$"):
            continue
        flat.append((kebab(k), k, val(v)))
status = {k: v for k, v in C["status"].items() if not k.startswith("$")}
for s, v in status.items():
    flat.append((s, s, val(v["base"])))
    flat.append((f"{s}-tint", f"{s}Tint", val(v["tint"])))
    flat.append((f"{s}-on-tint", f"{s}OnTint", val(v["onTint"])))

sans = ", ".join(f"'{f}'" if " " in f else f for f in T["font"]["family"]["sans"]["$value"])
script = ", ".join(f"'{f}'" if " " in f else f for f in T["font"]["family"]["script"]["$value"])
rw, sp = T["radius"]["web"], T["space"]
sh = T["shadow"]["web"]
lay = T["layout"]["web"]

# ---------- tokens.css ----------
css = [f"/* {HEADER} */", "", ":root {"]
css += [f"  --hp-{n}: {v};" for n, _, v in flat]
css += ["", f"  --hp-font-sans: {sans};", f"  --hp-font-script: {script};"]
css += [f"  --hp-weight-{k}: {v};" for k, v in T["font"]["weight"].items()]
css += [""] + [f"  --hp-space-{k}: {v}px;" for k, v in sp.items()]
css += [""] + [f"  --hp-radius-{k}: {v}px;" for k, v in rw.items()] + ["  --hp-radius-circle: 50%;"]
css += ["", f"  --hp-shadow-card: {sh['card']};", f"  --hp-shadow-raised: {sh['raised']};"]
css += ["", f"  --hp-max-width: {lay['maxWidth']};", f"  --hp-gutter: {lay['gutter']};",
        f"  --hp-section-padding: {lay['sectionPadding']};", f"  --hp-button-min-height: {lay['minButtonHeight']};"]
css += ["}", "",
        "/* Aliases used by the live website stylesheet (site.css). Keep them so existing pages keep working. */",
        ":root {",
        "  --primary: var(--hp-primary); --primary-dark: var(--hp-primary-dark); --primary-light: var(--hp-primary-light); --primary-mid: var(--hp-primary-mid);",
        "  --accent: var(--hp-accent); --accent-light: var(--hp-accent-light); --highlight-light: var(--hp-highlight-light); --highlight-on: var(--hp-highlight-on-tint);",
        "  --bg: var(--hp-background); --surface: var(--hp-surface); --surface-muted: var(--hp-surface-muted);",
        "  --ink: var(--hp-text-primary); --ink-2: var(--hp-text-secondary); --on-dark: var(--hp-text-on-primary); --on-dark-2: var(--hp-text-on-dark-muted); --line: var(--hp-border);",
        "  --missing: var(--hp-missing); --missing-tint: var(--hp-missing-tint); --missing-on: var(--hp-missing-on-tint);",
        "  --found: var(--hp-found); --found-tint: var(--hp-found-tint); --found-on: var(--hp-found-on-tint);",
        "  --sighting: var(--hp-sighting); --sighting-tint: var(--hp-sighting-tint); --sighting-on: var(--hp-sighting-on-tint);",
        "  --reunited: var(--hp-reunited); --reunited-tint: var(--hp-reunited-tint); --reunited-on: var(--hp-reunited-on-tint);",
        "  --font: var(--hp-font-sans); --script: var(--hp-font-script);",
        "  --radius-sm: var(--hp-radius-sm); --radius-md: var(--hp-radius-md); --radius-lg: var(--hp-radius-lg); --radius-xl: var(--hp-radius-xl);",
        "  --shadow: var(--hp-shadow-card); --shadow-raised: var(--hp-shadow-raised);",
        "}", ""]
(root / "tokens/tokens.css").write_text("\n".join(css))

# ---------- tokens.scss ----------
scss = [f"// {HEADER}", ""]
scss += [f"$hp-{n}: {v};" for n, _, v in flat]
scss += ["", f"$hp-font-sans: {sans};", f"$hp-font-script: {script};"]
scss += [f"$hp-weight-{k}: {v};" for k, v in T["font"]["weight"].items()]
scss += [f"$hp-space-{k}: {v}px;" for k, v in sp.items()]
scss += [f"$hp-radius-{k}: {v}px;" for k, v in rw.items()]
scss += [f"$hp-shadow-card: {sh['card']};", f"$hp-shadow-raised: {sh['raised']};", ""]
(root / "tokens/tokens.scss").write_text("\n".join(scss))

# ---------- tailwind preset ----------
tw_colors = {c: v for _, c, v in flat}
tw = f"""// {HEADER}
// Usage (tailwind.config.js): module.exports = {{ presets: [require('./tailwind.preset.js')], content: [...] }};
module.exports = {{
  theme: {{
    extend: {{
      colors: {json.dumps({'hp': tw_colors}, indent=8)[:-1]}      }},
      fontFamily: {{ sans: {json.dumps(T['font']['family']['sans']['$value'])}, script: {json.dumps(T['font']['family']['script']['$value'])} }},
      borderRadius: {{ {', '.join(f"'hp-{k}': '{v}px'" for k, v in rw.items())} }},
      boxShadow: {{ 'hp-card': '{sh['card']}', 'hp-raised': '{sh['raised']}' }},
      maxWidth: {{ 'hp': '{lay['maxWidth']}' }},
    }},
  }},
}};
"""
(root / "tokens/tailwind.preset.js").write_text(tw)

# ---------- React Native theme (JavaScript only) ----------
rn = root / "react-native/theme"
rn.mkdir(parents=True, exist_ok=True)
head = f"// {HEADER}\n// Drop-in for the app's src/theme/. JavaScript only (no TypeScript).\n\n"
lines = [f"  {c}: '{v}'," for _, c, v in flat]
(rn / "colors.js").write_text(head + "export const colors = {\n" + "\n".join(lines).rstrip(",") + "\n};\n")
f = T["font"]["reactNative"]
ty = T["typography"]["app"]
tl = []
for k, v in ty.items():
    if k.startswith("$"):
        continue
    extra = ""
    if v.get("uppercase"):
        extra += ", textTransform: 'uppercase'"
    if "letterSpacing" in v:
        extra += f", letterSpacing: {v['letterSpacing']}"
    tl.append(f"  {k}: {{ fontFamily: fonts.{v['weight']}, fontSize: {v['size']}, lineHeight: {v['lineHeight']}{extra} }},")
(rn / "typography.js").write_text(head + "export const fonts = {\n" + ",\n".join(f"  {k}: '{v}'" for k, v in f.items())
                                    + "\n};\n\nexport const typography = {\n" + "\n".join(tl).rstrip(",") + "\n};\n")
(rn / "spacing.js").write_text(head + "export const spacing = {\n" + ",\n".join(f"  {k}: {v}" for k, v in sp.items())
                                 + f"\n}};\n\nexport const layout = {{ screenMargin: {T['layout']['app']['screenMargin']}, minTouchTarget: {T['layout']['app']['minTouchTarget']} }};\n")
ra = T["radius"]["app"]
(rn / "radii.js").write_text(head + "export const radii = { " + ", ".join(f"{k}: {v}" for k, v in ra.items()) + " };\n")
sa = T["shadow"]["app"]
sl = []
for k, v in sa.items():
    if k.startswith("$"):
        continue
    sl.append(f"""  {k}: {{
    shadowColor: colors.{v['color']},
    shadowOpacity: {v['opacity']},
    shadowRadius: {v['radius']},
    shadowOffset: {{ width: 0, height: {v['offsetY']} }},
    elevation: {v['elevation']}
  }}""")
(rn / "shadows.js").write_text(head + "import { colors } from './colors';\n\nexport const shadows = {\n" + ",\n".join(sl) + "\n};\n")
st = []
for s, v in status.items():
    st.append(f"  {s}: {{ base: colors.{s}, tint: colors.{s}Tint, onTint: colors.{s}OnTint, label: '{v['label']}', icon: '{v['icon']}' }}")
(rn / "status.js").write_text(head + "import { colors } from './colors';\n\n// Status = colour + icon + label, always together. Icons are MaterialCommunityIcons names.\nexport const status = {\n"
                                + ",\n".join(st) + ",\n  safe: { base: colors.reunited, tint: colors.reunitedTint, onTint: colors.reunitedOnTint, label: 'SAFE', icon: 'home-heart' }\n};\n")
(rn / "index.js").write_text(head + "export { colors } from './colors';\nexport { fonts, typography } from './typography';\nexport { spacing, layout } from './spacing';\nexport { radii } from './radii';\nexport { shadows } from './shadows';\nexport { status } from './status';\n")

# ---------- contrast report ----------
def lum(h):
    h = h.lstrip("#")
    r, g, b = (int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
    f_ = lambda c: c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    return 0.2126 * f_(r) + 0.7152 * f_(g) + 0.0722 * f_(b)


def ratio(a, b):
    la, lb = sorted((lum(a), lum(b)), reverse=True)
    return (la + 0.05) / (lb + 0.05)


cv = {c: v for _, c, v in flat}
pairs = [
    ("textPrimary", "background", "Body text on page"), ("textPrimary", "surface", "Body text on card"),
    ("textSecondary", "background", "Supporting text on page"), ("textSecondary", "surface", "Supporting text on card"),
    ("primary", "background", "Links on page"), ("primary", "surface", "Links on card"),
    ("textOnPrimary", "primary", "White text on teal button"), ("textOnPrimary", "primaryDark", "White text on pressed teal"),
    ("primaryDark", "primaryLight", "Dark teal text on teal tint"), ("highlightOnTint", "highlightLight", "Warning callout text"),
    ("textOnPrimary", "error", "White text on destructive button"), ("error", "surface", "Error text on card"),
    ("textOnPrimary", "textPrimary", "White text on navy"), ("textOnDarkMuted", "textPrimary", "Muted text on navy"),
    ("accent", "surface", "Coral on white (decoration only)"), ("primaryBright", "surface", "Bright teal on white (icons only)"),
]
for s in status:
    pairs.append((f"{s}OnTint", f"{s}Tint", f"{s.capitalize()} chip text on tint"))
    pairs.append(("textOnPrimary", s, f"White text on solid {s} fill"))
rows = ["| Foreground | Background | Use | Ratio | Normal text (4.5) | Large text (3.0) |", "|---|---|---|---|---|---|"]
for fg, bg, use in pairs:
    r = ratio(cv[fg], cv[bg])
    rows.append(f"| `{fg}` {cv[fg]} | `{bg}` {cv[bg]} | {use} | {r:.2f}:1 | {'pass' if r >= 4.5 else 'FAIL'} | {'pass' if r >= 3 else 'FAIL'} |")
(root / "tokens/CONTRAST.md").write_text(
    "# Colour contrast (WCAG 2.1)\n\nGenerated from `tokens.json`. Normal text needs 4.5:1; large text (18.66px bold or 24px regular and up; 18sp bold in the app) and icons need 3:1.\n\n"
    + "\n".join(rows) + "\n\n**Rules that follow from this table:** coral (`accent`), `primaryBright` and `highlight` never carry text. "
    "A solid status fill with white text needs large bold text, or use the `onTint` shade as the fill. Chips always use tint background + onTint text.\n")
print("generated", len(flat), "colours")
