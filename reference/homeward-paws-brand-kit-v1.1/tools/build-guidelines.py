#!/usr/bin/env python3
"""Build BRAND_GUIDELINES.html from tokens.json + the kit's assets. Usage: python3 guidelines.py <kit-root>"""
import json, re, sys, pathlib, html

K = pathlib.Path(sys.argv[1])
T = json.loads((K / "tokens/tokens.json").read_text())
C = T["color"]
V = T["meta"]["version"]


def icon(name, cls=""):
    svg = (K / f"icons/{name}.svg").read_text()
    path = re.search(r'<path d="([^"]+)"', svg).group(1)
    return f'<svg viewBox="0 0 24 24" aria-hidden="true" class="{cls}"><path d="{path}"/></svg>'


def v(x):
    return x["$value"] if isinstance(x, dict) else x


def kebab(s):
    return re.sub(r"(?<!^)(?=[A-Z])", "-", s).lower()


def lum(h):
    h = h.lstrip("#"); r, g, b = (int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
    f = lambda c: c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)


def ink_for(h):
    return "#1F2D3D" if lum(h) > 0.35 else "#FFFFFF"


def swatch(name, val, desc):
    if not val.startswith("#"):
        bg, fg = val, "#FFFFFF"
    else:
        bg, fg = val, ink_for(val)
    border = "border:1px solid var(--hp-border);" if val.upper() in ("#FFFFFF", "#FBF7F2", "#F5EFE7") else ""
    return (f'<div class="sw"><div class="sw-chip" style="background:{bg};color:{fg};{border}"><b>{html.escape(val)}</b></div>'
            f'<div class="sw-meta"><code>{name}</code><code class="css">--hp-{kebab(name)}</code><span>{html.escape(desc)}</span></div></div>')


brand = "".join(swatch(k, v(x), x.get("$description", "")) for k, x in C["brand"].items() if not k.startswith("$"))
neutral = "".join(swatch(k, v(x), x.get("$description", "")) for k, x in C["neutral"].items() if not k.startswith("$"))
neutral += "".join(swatch(k, v(x), x.get("$description", "")) for k, x in C["feedback"].items() if not k.startswith("$"))

status_rows = ""
for s, x in C["status"].items():
    if s.startswith("$"):
        continue
    ic = x["icon"] if not x["icon"].startswith("(") else None
    chip_label = x["label"] if not x["label"].startswith("(") else "ARCHIVED"
    chip = f'<span class="hp-chip hp-chip--{s}">{icon(ic) if ic else ""}{chip_label}</span>'
    status_rows += (f'<tr><td><strong>{s.capitalize()}</strong></td><td>{chip}</td>'
                    f'<td><span class="dot" style="background:{v(x["base"])}"></span><code>{v(x["base"])}</code></td>'
                    f'<td><span class="dot" style="background:{v(x["tint"])};border:1px solid var(--hp-border)"></span><code>{v(x["tint"])}</code></td>'
                    f'<td><span class="dot" style="background:{v(x["onTint"])}"></span><code>{v(x["onTint"])}</code></td>'
                    f'<td><code>{html.escape(x["icon"])}</code></td></tr>')
status_rows += ('<tr><td><strong>Safe</strong> <span class="hp-small">(animal profile)</span></td>'
                f'<td><span class="hp-chip hp-chip--safe">{icon("home-heart")}SAFE</span></td><td colspan="3">Reunited colours</td><td><code>home-heart</code></td></tr>')

app_type = ""
for k, x in T["typography"]["app"].items():
    if k.startswith("$"):
        continue
    w = {"regular": 400, "semibold": 600, "bold": 700, "extraBold": 800}[x["weight"]]
    extra = "text-transform:uppercase;letter-spacing:.5px;" if x.get("uppercase") else ""
    sample = "MISSING" if k == "status" else ("Missing near you" if k == "sectionTitle" else ("Bring them home" if k in ("display", "screenTitle") else "Buddy, golden retriever" if k == "cardTitle" else "Last seen near Strand beach, 2 hours ago"))
    app_type += (f'<tr><td><code>{k}</code></td><td>{x["size"]} / {x["lineHeight"]}</td><td>{w}</td>'
                 f'<td style="font-size:{x["size"]}px;line-height:{x["lineHeight"]}px;font-weight:{w};{extra}">{sample}</td></tr>')

web_type = "".join(f'<tr><td><code>{k}</code></td><td>{html.escape(str(x.get("size")))}</td><td>{x.get("weight")}</td>'
                   f'<td>{html.escape(", ".join(f"{a} {b}" for a, b in x.items() if a not in ("size", "weight")))}</td></tr>'
                   for k, x in T["typography"]["web"].items() if not k.startswith("$"))

ra, rw = T["radius"]["app"], T["radius"]["web"]
radius_tiles = "".join(f'<div class="rad"><div class="rad-box" style="border-radius:{min(rw[k], 60)}px"></div><code>{k}</code><span>app {ra[k]} · web {rw[k]}</span></div>'
                       for k in ("sm", "md", "lg", "xl", "pill"))
space_tiles = "".join(f'<div class="spc"><div style="width:{px}px;height:{px}px"></div><code>{k}</code><span>{px}</span></div>' for k, px in T["space"].items())

cat_tiles = "".join(f'<figure class="ph"><img src="assets/placeholders/png/animal-{f}.png" alt=""><figcaption>{lbl}<br><code>{ic}</code></figcaption></figure>'
                    for f, lbl, ic in [("dog", "Dog", "dog"), ("cat", "Cat", "cat"), ("bird", "Bird", "bird"), ("horse", "Horse", "horse"),
                                       ("donkey", "Donkey", "horse"), ("rabbit", "Rabbit", "rabbit"), ("reptile", "Reptile", "snake"),
                                       ("small-mammal", "Small mammal", "rodent"), ("farm-animal", "Farm animal", "cow"), ("other", "Other", "paw"), ("unsure", "Unsure", "help")])
icon_grid = "".join(f'<div class="ic">{icon(p.stem)}<code>{p.stem}</code></div>' for p in sorted((K / "icons").glob("*.svg")))
markers = "".join(f'<figure class="mk"><img src="assets/markers/png/pin-{m}@2x.png" alt="" width="48"><figcaption>{m}</figcaption></figure>' for m in ("missing", "found", "sighting", "reunited", "partner"))
markers += '<figure class="mk"><img src="assets/markers/png/area-approximate@2x.png" alt="" width="64"><figcaption>approximate area</figcaption></figure>'
illos = "".join(f'<figure class="il"><img src="assets/illustrations/png/{n}.png" alt=""><figcaption><code>{n}</code> {d}</figcaption></figure>'
                for n, d in [("empty-results", "no search results"), ("no-animals", "My Animals empty"), ("offline", "no connection"), ("reunited", "confirmed reunion only")])

page = f"""<!doctype html>
<html lang="en-ZA">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Homeward Paws brand guidelines v{V}</title>
<link rel="icon" href="assets/web/favicon-48.png">
<link rel="stylesheet" href="css/homeward-paws.css">
<style>
  .guide-head {{ background: var(--hp-surface); border-bottom: 1px solid var(--hp-border); }}
  .guide-head .hp-wrap {{ display: flex; align-items: center; justify-content: space-between; gap: 16px; padding-block: 18px; flex-wrap: wrap; }}
  .guide-head img {{ height: 44px; width: auto; }}
  .intro {{ padding-block: 56px 24px; display: grid; gap: 18px; max-width: 760px; }}
  .toc {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 8px; margin-top: 8px; padding: 0; list-style: none; }}
  .toc a {{ display: block; padding: 10px 14px; background: var(--hp-surface); border: 1px solid var(--hp-border); border-radius: var(--hp-radius-md); text-decoration: none; font-weight: 800; }}
  .toc a:hover {{ background: var(--hp-primary-light); }}
  section.hp-section {{ border-top: 1px solid var(--hp-border); scroll-margin-top: 12px; }}
  .sec-head {{ display: grid; gap: 10px; max-width: 760px; margin-bottom: 28px; }}
  .grid {{ display: grid; gap: 16px; grid-template-columns: repeat(auto-fill, minmax(min(100%, 250px), 1fr)); }}
  .grid-2 {{ display: grid; gap: 20px; grid-template-columns: repeat(auto-fit, minmax(min(100%, 420px), 1fr)); }}
  .rules {{ display: grid; gap: 10px; counter-reset: r; list-style: none; padding: 0; margin: 0; }}
  .rules li {{ counter-increment: r; background: var(--hp-surface); border: 1px solid var(--hp-border); border-radius: var(--hp-radius-md); padding: 14px 16px 14px 56px; position: relative; font-weight: 600; }}
  .rules li::before {{ content: counter(r); position: absolute; left: 14px; top: 12px; width: 30px; height: 30px; border-radius: 50%; background: var(--hp-primary); color: #fff; display: grid; place-items: center; font-weight: 900; font-size: 14px; }}
  .logo-tile {{ border: 1px solid var(--hp-border); border-radius: var(--hp-radius-lg); background: var(--hp-surface); overflow: hidden; }}
  .logo-tile .stage {{ height: 180px; display: grid; place-items: center; padding: 24px; }}
  .logo-tile .stage img {{ max-height: 120px; width: auto; max-width: 100%; }}
  .logo-tile .cap {{ padding: 12px 16px; border-top: 1px solid var(--hp-border); font-size: 14px; }}
  .stage.cream {{ background: var(--hp-background); }} .stage.teal {{ background: var(--hp-primary); }} .stage.navy {{ background: var(--hp-text-primary); }}
  .stage.photo {{ background: linear-gradient(0deg, rgba(31,20,10,.55), rgba(31,20,10,.15)), #C98A4B; }}
  .sw {{ background: var(--hp-surface); border: 1px solid var(--hp-border); border-radius: var(--hp-radius-md); overflow: hidden; }}
  .sw-chip {{ height: 86px; display: flex; align-items: flex-end; padding: 10px 12px; font-size: 14px; }}
  .sw-meta {{ padding: 10px 12px; display: grid; gap: 2px; font-size: 13px; }}
  .sw-meta code {{ font-size: 13px; font-weight: 800; }} .sw-meta .css {{ font-weight: 600; color: var(--hp-text-secondary); }}
  .sw-meta span {{ color: var(--hp-text-secondary); font-weight: 600; }}
  .dot {{ display: inline-block; width: 14px; height: 14px; border-radius: 50%; vertical-align: -2px; margin-right: 6px; }}
  .scroll {{ overflow-x: auto; background: var(--hp-surface); border: 1px solid var(--hp-border); border-radius: var(--hp-radius-lg); }}
  .scroll .hp-table {{ min-width: 640px; }}
  .weights {{ display: grid; gap: 6px; }} .weights div {{ font-size: 28px; line-height: 1.2; }}
  .rad, .spc {{ display: grid; gap: 4px; justify-items: start; font-size: 13px; }}
  .rad-box {{ width: 96px; height: 64px; background: var(--hp-primary-light); border: 2px solid var(--hp-primary); }}
  .spc div {{ background: var(--hp-accent-light); border: 1px solid var(--hp-accent); }}
  .row-tiles {{ display: flex; flex-wrap: wrap; gap: 20px; align-items: flex-end; }}
  .shadow-demo {{ width: 200px; height: 110px; background: var(--hp-surface); border-radius: var(--hp-radius-lg); display: grid; place-items: center; font-weight: 800; }}
  .ph, .mk, .il {{ margin: 0; display: grid; gap: 6px; font-size: 13px; font-weight: 700; text-align: center; }}
  .ph img {{ width: 100%; border-radius: var(--hp-radius-lg); border: 1px solid var(--hp-border); }}
  .ph-grid {{ display: grid; gap: 12px; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); }}
  .il img {{ width: 100%; max-width: 240px; margin: 0 auto; }}
  .ic-grid {{ display: grid; gap: 8px; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); }}
  .ic {{ display: grid; justify-items: center; gap: 6px; padding: 14px 6px; background: var(--hp-surface); border: 1px solid var(--hp-border); border-radius: var(--hp-radius-md); }}
  .ic svg {{ width: 28px; height: 28px; fill: var(--hp-text-primary); }} .ic code {{ font-size: 12px; }}
  .do, .dont {{ border-radius: var(--hp-radius-md); padding: 16px 18px; font-weight: 600; }}
  .do {{ background: var(--hp-reunited-tint); color: var(--hp-reunited-on-tint); }} .dont {{ background: var(--hp-missing-tint); color: var(--hp-missing-on-tint); }}
  .do h3, .dont h3 {{ font-size: 16px; font-weight: 900; margin-bottom: 8px; text-transform: uppercase; letter-spacing: .06em; }}
  .do ul, .dont ul {{ margin: 0; padding-left: 20px; display: grid; gap: 4px; }}
  pre {{ background: var(--hp-text-primary); color: #E9F1F7; border-radius: var(--hp-radius-md); padding: 16px 18px; overflow-x: auto; font-size: 13.5px; line-height: 1.5; margin: 0; }}
  code {{ font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace; font-size: .92em; }}
  .demo {{ display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }}
  .foot {{ padding-block: 40px; color: var(--hp-text-secondary); font-size: 14px; font-weight: 600; border-top: 1px solid var(--hp-border); }}
  .mini-card {{ max-width: 300px; padding: 12px; }}
  .mini-card img {{ border-radius: var(--hp-radius-md); aspect-ratio: 4/3; object-fit: cover; width: 100%; background: var(--hp-surface-muted); }}
  .mini-card h4 {{ font-size: 17px; font-weight: 800; margin: 10px 0 2px; }}
</style>
</head>
<body>
<header class="guide-head"><div class="hp-wrap"><img src="assets/brand/logo-horizontal.svg" alt="Homeward Paws"><span class="hp-pill">Brand guidelines · v{V} · {T['meta']['date']}</span></div></header>
<main>
<div class="hp-wrap intro">
  <span class="hp-eyebrow">Corporate identity</span>
  <h1 class="hp-h1">Homeward Paws brand guidelines</h1>
  <p class="hp-lead">Everything a designer or developer needs to keep Homeward Paws looking and sounding like itself: logo, colour, type, spacing, components, icons, imagery and voice. The code in this kit (tokens, style sheet, app theme) is generated from <code>tokens/tokens.json</code> and matches the live app and website exactly.</p>
  <ul class="toc">
    <li><a href="#rules">Ten rules</a></li><li><a href="#brand">Brand</a></li><li><a href="#logo">Logo</a></li><li><a href="#colour">Colour</a></li>
    <li><a href="#status">Status system</a></li><li><a href="#type">Typography</a></li><li><a href="#shape">Spacing &amp; shape</a></li><li><a href="#components">Components</a></li>
    <li><a href="#icons">Icons</a></li><li><a href="#imagery">Imagery</a></li><li><a href="#voice">Voice &amp; words</a></li><li><a href="#build">Using the kit</a></li>
  </ul>
</div>

<section class="hp-section" id="rules"><div class="hp-wrap">
  <div class="sec-head"><span class="hp-eyebrow">Start here</span><h2 class="hp-h2">Ten rules that keep it on brand</h2></div>
  <ol class="rules">
    <li>Use the tokens. Never type a hex value, font size or radius by hand; use <code>--hp-*</code> variables, the Tailwind preset or the app theme.</li>
    <li>Teal (<code>primary</code>) is the action colour: main buttons, links, active tab, focus ring.</li>
    <li>Coral (<code>accent</code>) is warmth only: the logo heart, notification dot, illustration. Never text, never a button, never status.</li>
    <li>Status is always colour + icon + UPPERCASE label, and status colours mean status only.</li>
    <li>The status is MISSING, not "lost". The app covers all <em>animals</em>, not only "pets".</li>
    <li>Warm cream page (<code>background</code>), white cards with a hairline border, soft navy shadows; never harsh black shadows.</li>
    <li>Nunito for everything (400–900). Dancing Script only for short photo captions on the website.</li>
    <li>Use the supplied logo files. Never redraw, recolour, stretch or add effects.</li>
    <li>Animal photos are the hero on report screens; marketing photography stays on the website and onboarding.</li>
    <li>Accessible by default: 4.5:1 text contrast, 48 dp touch targets, labels on every icon button, no flashing.</li>
  </ol>
</div></section>

<section class="hp-section" id="brand"><div class="hp-wrap">
  <div class="sec-head"><span class="hp-eyebrow">Brand</span><h2 class="hp-h2">Warm, calm and practical</h2>
  <p class="hp-lead">Homeward Paws is a free, Android-first community app for South Africa that helps reunite missing, found and sighted animals with their people. A product of Digitack (Pty) Ltd.</p></div>
  <div class="grid-2">
    <div class="hp-card hp-stack"><h3 class="hp-h4">Personality</h3><p>Warm, compassionate, trustworthy, calm, community-driven and practical. Friendly without being childish.</p><p class="hp-muted">Not clinical, corporate, cluttered, or a constant emergency dashboard.</p></div>
    <div class="hp-card hp-stack"><h3 class="hp-h4">Tagline</h3><p class="hp-h3">Helping lost animals find their way home.</p><p class="hp-muted">"Lost" is fine in this marketing line; in the product the status word is always MISSING. Celebration ("Every animal deserves to come home") is reserved for confirmed reunions.</p></div>
  </div>
</div></section>

<section class="hp-section" id="logo"><div class="hp-wrap">
  <div class="sec-head"><span class="hp-eyebrow">Logo</span><h2 class="hp-h2">Roof, heart, dog and cat</h2>
  <p class="hp-lead">A teal roofline with chimney and a coral heart over navy dog and cat silhouettes. All text is converted to outlines, so the files never depend on installed fonts. SVG masters and PNGs are in <code>assets/brand/</code>.</p></div>
  <div class="grid">
    <div class="logo-tile"><div class="stage cream"><img src="assets/brand/logo-horizontal.svg" alt="Horizontal logo"></div><div class="cap"><strong>logo-horizontal</strong> · default</div></div>
    <div class="logo-tile"><div class="stage cream"><img src="assets/brand/logo-stacked.svg" alt="Stacked logo"></div><div class="cap"><strong>logo-stacked</strong> · splash, onboarding, print</div></div>
    <div class="logo-tile"><div class="stage cream"><img src="assets/brand/logo-mark.svg" alt="Logo mark"></div><div class="cap"><strong>logo-mark</strong> · app icon, square spaces</div></div>
    <div class="logo-tile"><div class="stage cream"><img src="assets/brand/logo-small.svg" alt="Small logo" style="max-height:64px"></div><div class="cap"><strong>logo-small</strong> · below 32 px, notifications</div></div>
    <div class="logo-tile"><div class="stage teal"><img src="assets/brand/logo-horizontal-reverse.svg" alt="Reverse logo"></div><div class="cap"><strong>…-reverse</strong> · on teal or dark photos</div></div>
    <div class="logo-tile"><div class="stage photo"><img src="assets/brand/logo-mark-mono-white.svg" alt="White mark"></div><div class="cap"><strong>logo-mark-mono-white</strong> · single colour</div></div>
    <div class="logo-tile"><div class="stage cream"><img src="assets/brand/logo-mark-mono-navy.svg" alt="Navy mark"></div><div class="cap"><strong>logo-mark-mono-navy</strong> · single colour</div></div>
    <div class="logo-tile"><div class="stage navy"><img src="assets/brand/logo-mark-reverse.svg" alt="Reverse mark"></div><div class="cap"><strong>logo-mark-reverse</strong> · on navy</div></div>
  </div>
  <div class="grid-2" style="margin-top:24px">
    <div class="do"><h3>Do</h3><ul><li>Keep clear space of at least the heart's width on every side.</li><li>Use <code>logo-small</code> anywhere under 32 px. Keep the horizontal logo at least 120 px wide on screen.</li><li>Use only full colour, reverse or single colour.</li><li>Put the reverse version on teal, navy or photos (with a darkening scrim).</li></ul></div>
    <div class="dont"><h3>Don't</h3><ul><li>Redraw the logo in code, retype the wordmark or swap the font.</li><li>Recolour, stretch, rotate, crop or rearrange parts.</li><li>Add shadows, outlines, gradients or effects.</li><li>Use coral anywhere in the logo except the heart.</li><li>Place the full-colour logo on busy photos.</li></ul></div>
  </div>
</div></section>

<section class="hp-section" id="colour"><div class="hp-wrap">
  <div class="sec-head"><span class="hp-eyebrow">Colour</span><h2 class="hp-h2">Teal for action, cream for calm, coral for warmth</h2>
  <p class="hp-lead">Token name, CSS variable and purpose. Contrast for every text pairing is in <code>tokens/CONTRAST.md</code>.</p></div>
  <h3 class="hp-h4" style="margin-bottom:12px">Brand</h3><div class="grid">{brand}</div>
  <h3 class="hp-h4" style="margin:28px 0 12px">Neutrals and feedback</h3><div class="grid">{neutral}</div>
  <div class="grid-2" style="margin-top:24px">
    <div class="do"><h3>Do</h3><ul><li>Cream page, white cards, navy text.</li><li>One filled teal button per view for the main action.</li><li>Tints (<code>primaryLight</code>, <code>accentLight</code>, <code>highlightLight</code>) for tiles and callouts.</li></ul></div>
    <div class="dont"><h3>Don't</h3><ul><li>Coral, <code>primaryBright</code> or mustard for text (they fail contrast).</li><li>Status colours for decoration, or coral anywhere it could read as MISSING.</li><li>Pure black text or shadows; new colours outside this palette.</li></ul></div>
  </div>
</div></section>

<section class="hp-section" id="status"><div class="hp-wrap">
  <div class="sec-head"><span class="hp-eyebrow">Status system</span><h2 class="hp-h2">Colour + icon + label, every time</h2>
  <p class="hp-lead"><code>base</code> for icons, map pins and banners; <code>tint</code> for chip backgrounds; <code>onTint</code> for chip text and icons. Icons are MaterialCommunityIcons names.</p></div>
  <div class="scroll"><table class="hp-table"><thead><tr><th>Status</th><th>Chip</th><th>base</th><th>tint</th><th>onTint</th><th>Icon</th></tr></thead><tbody>{status_rows}</tbody></table></div>
  <div class="hp-stack" style="margin-top:20px">
    <div class="demo"><div class="hp-status-banner hp-status-banner--missing" style="flex:1;min-width:240px">{icon('alert-circle')}Missing</div><div class="hp-status-banner hp-status-banner--found" style="flex:1;min-width:240px">{icon('shield-home')}Found</div></div>
    <div class="demo"><div class="hp-status-banner hp-status-banner--sighting" style="flex:1;min-width:240px">{icon('eye')}Sighting</div><div class="hp-status-banner hp-status-banner--reunited" style="flex:1;min-width:240px">{icon('home-heart')}Reunited</div></div>
    <p class="hp-callout">Solid status fills with white text need large bold text (banners use 19 px, weight 900). White on the base Found amber fails normal-size contrast, so Found buttons and banners use the <code>foundOnTint</code> shade as the fill.</p>
    <p class="hp-small">Animal profile status reuses the chips: safe → Reunited colours labelled SAFE; missing → Missing; in care, fostered, transferred → Found; archived, deceased → Admin slate.</p>
  </div>
</div></section>

<section class="hp-section" id="type"><div class="hp-wrap">
  <div class="sec-head"><span class="hp-eyebrow">Typography</span><h2 class="hp-h2">Nunito, rounded and friendly</h2>
  <p class="hp-lead">One typeface for app and web. App: <code>@expo-google-fonts/nunito</code> (400, 600, 700, 800). Web: self-hosted woff2 in <code>css/fonts/</code> (400–900). SIL Open Font Licence.</p></div>
  <div class="grid-2">
    <div class="hp-card weights"><div style="font-weight:400">Regular 400 · Aa</div><div style="font-weight:600">SemiBold 600 · Aa</div><div style="font-weight:700">Bold 700 · Aa</div><div style="font-weight:800">ExtraBold 800 · Aa</div><div style="font-weight:900">Black 900 · web headings</div></div>
    <div class="hp-card hp-stack"><p class="hp-script" style="font-size:34px;line-height:1.2;color:var(--hp-primary-dark)">Every animal deserves to come home</p><p class="hp-muted">Dancing Script 600: website only, for one short caption on a photo. Never in the app, never for body text or buttons.</p></div>
  </div>
  <h3 class="hp-h4" style="margin:28px 0 12px">App type scale (sp)</h3>
  <div class="scroll"><table class="hp-table"><thead><tr><th>Token</th><th>Size / line</th><th>Weight</th><th>Sample</th></tr></thead><tbody>{app_type}</tbody></table></div>
  <h3 class="hp-h4" style="margin:28px 0 12px">Website type scale</h3>
  <div class="scroll"><table class="hp-table"><thead><tr><th>Role</th><th>Size</th><th>Weight</th><th>Other</th></tr></thead><tbody>{web_type}</tbody></table></div>
  <p class="hp-small" style="margin-top:12px">Respect Android font scaling; labels wrap rather than truncate. Uppercase is only for short status labels and eyebrows.</p>
</div></section>

<section class="hp-section" id="shape"><div class="hp-wrap">
  <div class="sec-head"><span class="hp-eyebrow">Spacing &amp; shape</span><h2 class="hp-h2">Rounded, roomy, soft</h2>
  <p class="hp-lead">4-point spacing scale; 20 dp screen margin in the app; 1120 px content width on the web. The website uses a slightly larger radius scale for desktop sizes.</p></div>
  <h3 class="hp-h4" style="margin-bottom:12px">Spacing</h3><div class="row-tiles">{space_tiles}</div>
  <h3 class="hp-h4" style="margin:28px 0 12px">Radii</h3><div class="row-tiles">{radius_tiles}<div class="rad"><div class="rad-box" style="width:64px;border-radius:50%"></div><code>circle</code><span>50%</span></div></div>
  <h3 class="hp-h4" style="margin:28px 0 12px">Elevation</h3>
  <div class="row-tiles"><div class="shadow-demo" style="box-shadow:var(--hp-shadow-card)">card</div><div class="shadow-demo" style="box-shadow:var(--hp-shadow-raised)">raised</div></div>
  <p class="hp-small" style="margin-top:12px">Cards: white surface, hairline <code>border</code>, <code>card</code> shadow. Raised: Report button and sheets. Shadows are navy at low opacity, never black.</p>
</div></section>

<section class="hp-section" id="components"><div class="hp-wrap">
  <div class="sec-head"><span class="hp-eyebrow">Components</span><h2 class="hp-h2">Building blocks</h2>
  <p class="hp-lead">Live examples from <code>css/homeward-paws.css</code>. The app has matching React Native components (names from the design system in brackets).</p></div>
  <div class="hp-stack">
    <div class="hp-card hp-stack"><h3 class="hp-h4">Buttons <span class="hp-small">(PrimaryButton, SecondaryButton, TextButton)</span></h3>
      <div class="demo"><button class="hp-btn hp-btn--primary">Continue</button><button class="hp-btn hp-btn--secondary">Save for later</button><button class="hp-btn hp-btn--text">Cancel</button><button class="hp-btn hp-btn--destructive">Delete account</button><button class="hp-btn hp-btn--primary" disabled>Sending…</button></div>
      <div class="demo"><button class="hp-btn hp-btn--missing">{icon('alert-circle')}My animal is missing</button><button class="hp-btn hp-btn--found">{icon('shield-home')}I found an animal</button><button class="hp-btn hp-btn--sighting">{icon('eye')}I saw an animal</button></div>
      <p class="hp-small">One primary per view. Urgent status buttons are scarce, clearly labelled and never flashing. Disable and show progress while submitting. Minimum height 52 px (web), 48 dp (app).</p>
      <pre>&lt;button class="hp-btn hp-btn--primary"&gt;Continue&lt;/button&gt;</pre></div>
    <div class="grid-2">
      <div class="hp-card hp-stack"><h3 class="hp-h4">Report card <span class="hp-small">(ReportCard)</span></h3>
        <div class="hp-card hp-card--raised mini-card"><img src="assets/placeholders/png/animal-dog.png" alt=""><h4>Buddy</h4><span class="hp-chip hp-chip--missing">{icon('alert-circle')}Missing</span><p class="hp-small" style="margin-top:8px">Strand · 2 h ago · 1.2 km</p></div></div>
      <div class="hp-card hp-stack"><h3 class="hp-h4">Icon tiles <span class="hp-small">(IconTile)</span></h3>
        <div class="demo"><span class="hp-icon-tile">{icon('paw')}</span><span class="hp-icon-tile hp-icon-tile--accent">{icon('heart-outline')}</span><span class="hp-icon-tile hp-icon-tile--highlight">{icon('bell')}</span><span class="hp-icon-tile hp-icon-tile--missing">{icon('alert-circle')}</span><span class="hp-icon-tile hp-icon-tile--found">{icon('shield-home')}</span><span class="hp-icon-tile hp-icon-tile--sighting">{icon('eye')}</span><span class="hp-icon-tile hp-icon-tile--reunited">{icon('home-heart')}</span></div>
        <p class="hp-small">Circular tinted tiles for features, steps and empty states.</p></div>
    </div>
    <div class="hp-card hp-stack"><h3 class="hp-h4">Callouts <span class="hp-small">(InfoBanner)</span></h3>
      <p class="hp-callout"><strong>Private:</strong> your home address is never shown on public reports.</p>
      <p class="hp-callout hp-callout--warn"><strong>Approach carefully:</strong> this animal may bite when frightened.</p>
      <p class="hp-callout hp-callout--alert"><strong>Suspected theft?</strong> Report it to SAPS as well.</p>
      <p class="hp-callout hp-callout--success"><strong>Reunited.</strong> Thank you for helping bring Buddy home.</p></div>
    <div class="hp-card hp-stack"><h3 class="hp-h4">Form fields <span class="hp-small">(FormField)</span></h3>
      <div class="grid-2">
        <div class="hp-field"><label class="hp-label" for="f1">Animal's name</label><input class="hp-input" id="f1" value="Buddy"><span class="hp-help">Shown on the public report.</span></div>
        <div class="hp-field hp-field--error"><label class="hp-label" for="f2">Suburb</label><input class="hp-input" id="f2" value="12 Oak Road"><span class="hp-error">Enter a suburb, not a street address.</span></div>
      </div>
      <label class="hp-check"><input type="checkbox" checked><span>I am 18 or older and agree to the terms.</span></label>
      <p class="hp-small">Permanent labels above inputs, inline field errors, teal focus border; selected choice cards use a <code>primaryLight</code> fill and teal border.</p></div>
    <div class="hp-card hp-stack"><h3 class="hp-h4">Steps <span class="hp-small">(How it works)</span></h3>
      <ol class="hp-steps"><li><strong>Report</strong> the animal with a photo and last-seen area.</li><li><strong>Share</strong> the alert with neighbours.</li><li><strong>Reunite</strong> when someone sees them.</li></ol></div>
  </div>
</div></section>

<section class="hp-section" id="icons"><div class="hp-wrap">
  <div class="sec-head"><span class="hp-eyebrow">Icons</span><h2 class="hp-h2">MaterialCommunityIcons only</h2>
  <p class="hp-lead">App: <code>@expo/vector-icons</code> MaterialCommunityIcons. Web: the matching SVGs in <code>icons/</code> (Material Design Icons; licence included). Fill with <code>currentColor</code>; never mix in another icon set or emoji.</p></div>
  <div class="ic-grid">{icon_grid}</div>
  <p class="hp-small" style="margin-top:12px">Report button: <code>paw</code> (optionally with a small <code>plus</code> badge) in a raised teal circle with a white ring, accessibility label "Report an animal". Tabs: Home, Browse, Report, Following, Profile.</p>
</div></section>

<section class="hp-section" id="imagery"><div class="hp-wrap">
  <div class="sec-head"><span class="hp-eyebrow">Imagery</span><h2 class="hp-h2">The animal comes first</h2>
  <p class="hp-lead">On report and case screens the reported animal's photo is the hero. Emotive photography (a dog at sunset) belongs on the website, onboarding, empty states and store listing only. Text over a photo always gets a darkening scrim.</p></div>
  <h3 class="hp-h4" style="margin-bottom:12px">Animal placeholders (no photo yet)</h3><div class="ph-grid">{cat_tiles}</div>
  <h3 class="hp-h4" style="margin:28px 0 12px">Illustrations</h3><div class="grid">{illos}</div>
  <h3 class="hp-h4" style="margin:28px 0 12px">Map markers</h3><div class="row-tiles">{markers}</div>
  <p class="hp-small" style="margin-top:12px">Pins anchor bottom-centre; the approximate-area marker anchors centre and is used whenever public precision is suburb or approximate. Never show a private location as an exact pin.</p>
  <div class="grid-2" style="margin-top:24px">
    <div class="do"><h3>Do</h3><ul><li>Rounded 4:3 or square crops (<code>lg</code> radius), real animals, natural light.</li><li>Flat illustration in brand colours for empty and success states.</li><li>Lazy-load and compress photos.</li></ul></div>
    <div class="dont"><h3>Don't</h3><ul><li>Stock photos inside the app.</li><li>Essential text over busy images.</li><li>Celebration art anywhere except a confirmed reunion.</li></ul></div>
  </div>
</div></section>

<section class="hp-section" id="voice"><div class="hp-wrap">
  <div class="sec-head"><span class="hp-eyebrow">Voice &amp; words</span><h2 class="hp-h2">Calm, kind, specific</h2>
  <p class="hp-lead">Plain South African English. Short sentences. Tell people exactly what to do next. Never alarmist, never cutesy on a missing case.</p></div>
  <div class="scroll"><table class="hp-table"><thead><tr><th>Use</th><th>Avoid</th><th>Why</th></tr></thead><tbody>
    <tr><td>MISSING, missing animal</td><td>lost (as a status)</td><td>The product's status vocabulary</td></tr>
    <tr><td>animals</td><td>pets (in product copy)</td><td>Covers horses, donkeys, farm animals; "pets" is fine in casual marketing</td></tr>
    <tr><td>FOUND · SIGHTING · REUNITED · SAFE</td><td>rescued, spotted, saved</td><td>Fixed status labels</td></tr>
    <tr><td>My Animal Is Missing · I Found an Animal · I Saw an Animal</td><td>one "Report Lost or Found" button</td><td>Three separate urgent actions</td></tr>
    <tr><td>Welcome back, Andre</td><td>Pet Hero, badges, gamified titles</td><td>Greet by display name only</td></tr>
    <tr><td>Last seen near Strand beach</td><td>exact addresses, house numbers</td><td>Public locations are suburb or street/landmark level</td></tr>
    <tr><td>We couldn't upload the photo. Your report is saved.</td><td>Error 500, "Oops!"</td><td>Explain what failed and what still works</td></tr>
    <tr><td>info@digitack.co.za</td><td>personal addresses, phone numbers</td><td>The only public contact</td></tr>
  </tbody></table></div>
</div></section>

<section class="hp-section" id="build"><div class="hp-wrap">
  <div class="sec-head"><span class="hp-eyebrow">Using the kit</span><h2 class="hp-h2">For developers</h2></div>
  <div class="grid-2">
    <div class="hp-card hp-stack"><h3 class="hp-h4">Website</h3>
      <pre>&lt;link rel="stylesheet" href="css/homeward-paws.css"&gt;</pre>
      <p>Tokens: <code>tokens/tokens.css</code> (<code>--hp-*</code>, plus aliases the live site uses). Tailwind: <code>tokens/tailwind.preset.js</code>. SCSS: <code>tokens/tokens.scss</code>.</p>
      <p class="hp-small">The live site runs a strict Content Security Policy: no inline scripts (put JavaScript in .js files), self-hosted fonts and scripts, no analytics, cookies or third-party requests.</p></div>
    <div class="hp-card hp-stack"><h3 class="hp-h4">App (Expo, JavaScript only)</h3>
      <pre>import {{ colors, typography, radii, shadows, status }} from './theme';
&lt;Text style={{[typography.status, {{ color: status.missing.onTint }}]}}&gt;
  {{status.missing.label}}
&lt;/Text&gt;</pre>
      <p>Drop-in theme: <code>react-native/theme/</code> (matches <code>src/theme/</code>, adds partner/admin, label and status type, and a <code>status</code> map). Icons, splash and adaptive icons: <code>assets/app/</code>.</p></div>
    <div class="hp-card hp-stack"><h3 class="hp-h4">Email</h3><p>Cream background, one white card (20 px radius), teal button, navy text, logo <code>assets/email/email-logo.png</code> hosted on the website. Footer: Digitack (Pty) Ltd, info@digitack.co.za, privacy link. No tracking pixels.</p></div>
    <div class="hp-card hp-stack"><h3 class="hp-h4">Changing the brand</h3><p>Edit <code>tokens/tokens.json</code> only, then run <code>python3 tools/generate-tokens.py .</code> to regenerate every format. Brand changes are approved by Andre (and Rudi for anything in the app); bump the version and date.</p></div>
  </div>
</div></section>
</main>
<footer class="foot"><div class="hp-wrap">Homeward Paws brand guidelines v{V} · {T['meta']['date']} · © Digitack (Pty) Ltd · info@digitack.co.za. Nunito and Dancing Script: SIL Open Font Licence 1.1. Icons: Material Design Icons (licence in icons/). Logo, mark, markers, placeholders and illustrations: original work for Digitack (Pty) Ltd.</div></footer>
</body>
</html>
"""
(K / "BRAND_GUIDELINES.html").write_text(page)
print("ok", len(page))
