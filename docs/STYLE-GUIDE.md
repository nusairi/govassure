# GOV Assured style guide

Use this guide to build or restyle any govassured.com app (BCP first) so it matches the home page, **https://www.govassured.com/**.

Every value here was read on 27 Oct 2026 from either:
- the hub source in this repo: `styles.css` and `index.html`; or
- the live home page, measured with Chromium `getComputedStyle` at 1280 px and 390 px wide. These values are marked *computed*.

The root font size is 16 px, so 1 rem = 16 px.

> The quick way is to copy [`docs/ga-theme.css`](ga-theme.css) and [`docs/assets/ga-logo.png`](assets/ga-logo.png) into the app. Then link the stylesheet and paste the logo bar markup (see section 5). The tokens, base styles, logo bar, buttons and cards then match from day one.

## 1. Palette

| Token (hub / shared) | Hex | RGB | Use |
|---|---|---|---|
| `--field` / `--ga-field` | `#021c17` | 2, 28, 23 | Page background (the dark green), text on gold, and `theme-color` |
| `--raised` / `--ga-raised` | `#102e26` | 16, 46, 38 | Cards, inputs and stat panels |
| `--ga-raised-2` | `#163a30` | 22, 58, 48 | A second raised level (app theme only; the hub doesn't use it) |
| `--ga-sunk` | `#011511` | 1, 21, 17 | Footers and dark bands (app theme only) |
| Logo bar background | `#0b2318` | 11, 35, 24 | The `.ga-brandbar` on every app |
| `--ink` / `--ga-ink` | `#f6f0e4` | 246, 240, 228 | Body text and headings |
| `--ink-soft` / `--ga-ink-soft` | `#d2c8b4` | 210, 200, 180 | Lede, intro and secondary text |
| Muted text | `#cbbfa8` | 203, 191, 168 | Card meta, footer note and placeholders |
| `--gold` / `--ga-gold` | `#f0c987` | 240, 201, 135 | Accent: links, primary buttons, eyebrow, focus ring and selection |
| Gold hover / `--ga-gold-hover` | `#f7e1b8` | 247, 225, 184 | Hover state for links and buttons |
| `--gold-deep` / `--ga-gold-deep` | `#c9a15d` | 201, 161, 93 | Small separators (the `·` between meta items) |
| `--line` / `--ga-line` | `rgba(240,201,135,0.32)` | gold at 32 % | 1 px borders and dividers (about `#4e533b` on the field) |
| `--ga-line-soft` | `rgba(240,201,135,0.18)` | gold at 18 % | Fainter dividers (app theme only) |
| Logo bar border | `rgba(240,201,135,0.35)` | gold at 35 % | The logo bar's bottom border |

**Status colours** (app theme `ga-theme.css` only, not on the hub):

| Status | Text | Background |
|---|---|---|
| ok | `#8fdcb0` | `#123d2c` |
| warn | `#f3c969` | `#3a3214` |
| bad | `#ff9d8f` | `#3d1c18` |
| info | `#9fd3e6` | `#113340` |

**Page background:** `radial-gradient(ellipse at 0% 0%, rgba(240,201,135,0.09), transparent 46%)` over `#021c17`. The hub uses this in its hero. The shared theme applies it to the whole page as `--ga-bg`.

**Colour scheme:** `color-scheme: dark`.

## 2. Typography

The hub loads **no web fonts**. It uses system font stacks only, and its CSP is `font-src 'self'`, so don't add Google Fonts.

| Role | Family | Size | Weight | Line height | Letter spacing |
|---|---|---|---|---|---|
| Body | `--sans`: `"Segoe UI", "Helvetica Neue", Helvetica, Arial, sans-serif` | 1.0625rem (17 px) | 400 | 1.55 (26.35 px) | – |
| H1 | `--serif`: `"Palatino Linotype", Palatino, "Iowan Old Style", "Times New Roman", Times, serif` | `clamp(2.35rem, 5vw, 4rem)`: 64 px at 1280, 37.6 px at 390 (*computed*) | 500 | 1.05 | -0.03em |
| H2 (`.section-title`) | serif | 1.7rem (27.2 px) | 500 | 1.55 inherited | – |
| H3 (`.service h3`) | serif | 1.35rem (21.6 px) | 500 | 1.2 | -0.02em |
| Card title (`.card h4`) | serif | 1.32rem (21.12 px) | 500 | 1.2 | -0.02em |
| Lede | sans | 1.125rem (18 px), colour ink-soft | 400 | 1.55 | – |
| Eyebrow | sans, UPPERCASE, gold | 0.78rem (12.48 px) | 700 | 1.55 | 0.14em |
| Nav links | sans | 0.95rem (15.2 px) | 400 | 1.55 | 0.04em |
| Tag / pill | sans, UPPERCASE | 0.72rem (11.52 px) | 700 | – | 0.04em |
| Code and meta | `--mono`: `ui-monospace, "SFMono-Regular", "Cascadia Mono", Menlo, Consolas, monospace` | 0.78rem for meta, 0.88em for code | 400 | – | – |

`ga-theme.css` adds `"Book Antiqua"` to the serif stack, after "Iowan Old Style". That is the only difference from the hub's serif stack.

## 3. Tokens (copy and paste)

```css
:root {
  /* hub names (styles.css) */
  --field: #021c17;  --raised: #102e26;
  --ink: #f6f0e4;    --ink-soft: #d2c8b4;
  --gold: #f0c987;   --gold-deep: #c9a15d;
  --line: rgba(240, 201, 135, 0.32);  --focus: #f0c987;
  --serif: "Palatino Linotype", Palatino, "Iowan Old Style", "Times New Roman", Times, serif;
  --sans: "Segoe UI", "Helvetica Neue", Helvetica, Arial, sans-serif;
  --mono: ui-monospace, "SFMono-Regular", "Cascadia Mono", Menlo, Consolas, monospace;
  --radius: 14px;
  color-scheme: dark;
}
```

The `--ga-*` equivalents, with hover, sunk and status tokens, are in [`ga-theme.css`](ga-theme.css). Use the `--ga-` names in new apps.

**Layout and shape values** (from `styles.css`):

- Content width: `.wrap { width: min(1120px, calc(100% - 2rem)); margin-inline: auto }`
- Section padding: `2.6rem 0 2.2rem`. Hero padding: `2.75rem 0 2.4rem`.
- Card grid: `repeat(auto-fill, minmax(300px, 1fr))` with a `1rem` gap. The service grid uses `minmax(280px, 1fr)`.
- Corner radii:
  - cards: 14 px (`--radius`)
  - stat boxes: 12 px
  - inputs: 10 px
  - buttons: 8 px
  - pills, filters and icon buttons: 999 px
- **Breakpoint:** one only, `@media (max-width: 760px)`. At that width:
  - the logo is 92 px tall;
  - the header loses its minimum height;
  - the buttons in `.actions` become `flex: 1 1 8rem`.
- **Shadows:** the hub uses none. `ga-theme.css` adds `0 10px 28px rgba(0,0,0,.35)` for card hover on the home app only.
- Respect `prefers-reduced-motion`: the hub turns off smooth scrolling.

## 4. Buttons

| | Primary `.btn.btn-primary` | Quiet / secondary `.btn.btn-quiet` |
|---|---|---|
| Background | `#f0c987` (gold) | transparent |
| Text | `#021c17` (field), 0.95rem / 15.2 px, weight 700 | `#f0c987` |
| Border | none | 1 px `rgba(240,201,135,0.32)` |
| Hover | background `#f7e1b8` | background `rgba(240,201,135,0.1)`, text `#f7e1b8` |
| Focus | `outline: 3px solid #f0c987; outline-offset: 3px` (global `:focus-visible`) | same |
| Shared | `display:inline-flex; align-items:center; justify-content:center; min-height:2.6rem (41.6 px); padding:.4rem .85rem (6.4 px 13.6 px); border-radius:8px; text-decoration:none` | |

Hover values are *computed* in Chromium.

**Filter pills** (`.filter`):
- min-height 2.75rem (44 px), padding `.4rem .9rem`, radius 999 px;
- 1 px line border, ink text;
- pressed (`aria-pressed="true"`): gold background, gold border, field text.

**Inputs:**
- min-height 3rem, padding `.65rem .9rem`, radius 10 px;
- raised background, 1 px line border;
- placeholder colour `#cbbfa8`.

In `ga-theme.css` the same buttons are available as `.ga-btn .ga-btn-primary` and `.ga-btn .ga-btn-quiet`.

## 5. Header and logo bar

**Hub header** (`.site-header`):
- background `#021c17`, with a 1 px line border at the bottom;
- inner `.wrap.header-bar` is `display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:1rem 1.5rem; min-height:7.5rem; padding:.85rem 0`;
- *computed* height: 156 px at 1280 px wide.

Header contents, in order:
1. **Logo:** `<a class="brand">` wrapping `public/wordmark.png` (782 × 694, crown above the wordmark). It's shown at `height:128px` (92 px at 760 px wide or less), which is 144 × 128 *computed*.
2. **Nav:** `.header-nav` with a gap of `.85rem 1.25rem`. Links are ink-coloured and turn gold and underlined on hover.
3. **LinkedIn icon button:** a 2.75rem (44 px) circle with a 1 px line border, a gold icon, and a hover background of `rgba(240,201,135,0.1)`.

**App logo bar.** It is mandatory on every page of every app. It is inserted directly after `<body>`, or after the skip link.

```html
<div class="ga-brandbar"><a class="ga-brandbar__home" href="https://www.govassured.com/"><img src="/ga-logo.png" width="95" height="30" alt="GOV Assured home"></a></div>
```

```css
.ga-brandbar{box-sizing:border-box;display:flex;align-items:center;width:100%;height:44px;margin:0;padding:0 16px;
  background:#0b2318;border-bottom:1px solid rgba(240,201,135,.35);position:relative;z-index:1000;font-size:0;line-height:0}
.ga-brandbar a.ga-brandbar__home{display:inline-flex;align-items:center;padding:2px;border-radius:4px;text-decoration:none}
.ga-brandbar a.ga-brandbar__home:focus-visible{outline:3px solid #f0c987;outline-offset:2px}
.ga-brandbar img{display:block;height:30px;width:auto}
```

Logo bar details:
- **Logo asset:** `docs/assets/ga-logo.png` is 381 × 120 px and is shown at 95 × 30.
- **Bar height:** 44 px. It always links to `https://www.govassured.com/`, never to the app's own `/`.
- **Measured on bcp.govassured.com:** 44 px tall, background `rgb(11,35,24)`, and the link is `https://www.govassured.com/`.

Below the logo bar, an app's own header uses:
- the field background (`#021c17`) or logo-bar green (`#0b2318`);
- the app name in serif, weight 500, ink colour;
- nav links in sans 0.95rem.

## 6. Links, cards and footer

**Links:**
- gold `#f0c987`, hover `#f7e1b8`;
- `text-underline-offset: .18em`;
- `::selection` is a gold background with field text.

**Cards** (`.card` and `.service`):
- background `#102e26`, 1 px line border, radius 14 px;
- padding `1.15rem 1.15rem 1rem`;
- body text in ink-soft;
- title in serif, weight 500.

**Tag pill:**
- background `rgba(240,201,135,.16)` with gold text;
- radius 999 px, padding `.18rem .5rem`.

**Footer** (`.site-footer`):
- 1 px line border at the top, padding `1.75rem 0 2rem`;
- `.footer-grid` is a flex row with space-between and wraps on small screens;
- left side: "**GOV Assured** — government and cyber assurance." with the note in `#cbbfa8`;
- right side: the LinkedIn and GitHub circular icon buttons, the same as the header LinkedIn button.

## 7. Accessibility (WCAG contrast, computed)

| Pair | Ratio |
|---|---|
| ink `#f6f0e4` on field `#021c17` | 15.67 : 1 |
| ink-soft `#d2c8b4` on field | 10.72 : 1 |
| gold `#f0c987` on field, and field on gold (primary button) | 11.35 : 1 |
| field on gold-hover `#f7e1b8` | 13.90 : 1 |
| ink on raised `#102e26` | 12.84 : 1 |
| ink-soft on raised | 8.79 : 1 |
| gold on raised | 9.31 : 1 |
| muted `#cbbfa8` on raised | 8.02 : 1 |
| gold on logo bar `#0b2318` | 10.58 : 1 |
| gold on tag background (blended `#344736`) | 6.38 : 1 |
| gold-deep `#c9a15d` on field | 7.40 : 1 |

All of these pass WCAG AA, and nearly all pass AAA.

The `--line` border blends to about `#4e533b`, which is only **2.22 : 1**. Use it for decoration, never as the only boundary of a control. Inputs and buttons still have a text or fill contrast above 3 : 1.

Also keep:
- a skip link (gold background, field text);
- `:focus-visible { outline: 3px solid #f0c987; outline-offset: 3px }`;
- targets at least 44 px (the icon buttons and pills are 2.75rem);
- `lang="en-GB"`.

## 8. Brand rules

1. Every page shows the **GOV Assured logo bar** linking to `https://www.govassured.com/`. Error and 404 pages too.
2. **No personal names** anywhere: UI, meta tags, footers, licences shown in the UI, or alt text. The author is always "GOV Assured".
3. The only allowed external links are:
   - `https://www.linkedin.com/company/102617034/`
   - `https://github.com/nusairi/govassure`
   - `mailto:` addresses
   - other `*.govassured.com` pages

   `scripts/check_links.py` enforces this for the hub. Reference links (NCSC, gov.uk, MITRE and so on) need sign-off.
4. The **footer** always carries the GOV Assured LinkedIn link, and the GitHub link where there is a footer icon row.
5. Name the site "GOV Assured" in titles and `og:site_name`, and set `<meta name="theme-color" content="#021c17">`.

## 9. New app checklist

- [ ] `ga-theme.css` linked on every page, and `/ga-logo.png` served from the app root
- [ ] Logo bar markup straight after `<body>`, linking to `https://www.govassured.com/`
- [ ] Background `#021c17`, body text `#f6f0e4`, sans body at 17 px / 1.55, serif headings at weight 500
- [ ] No web fonts: system stacks only, and no Inter, Roboto or Google Fonts
- [ ] Primary actions use gold `.ga-btn-primary`, secondary actions use `.ga-btn-quiet`, both 8 px radius
- [ ] Cards use `#102e26`, a 1 px line border and 14 px radius
- [ ] Focus ring is 3 px gold, a skip link is present, and targets are at least 44 px
- [ ] Footer has GOV Assured and the LinkedIn link
- [ ] Link check: no external links beyond the allowed ones, and no personal names
- [ ] Branded 404 page with the logo bar
- [ ] Checked at 1280 px and 390 px wide (the breakpoint is 760 px)

## 10. Applying to BCP (Next.js)

`bcp-generator` is a **Next.js 16 / React 19** app using **Tailwind CSS v4**. It uses `@tailwindcss/postcss`, and its tokens are an `@theme` block in `src/app/globals.css`. The root layout is `src/app/layout.tsx`.

Current state: the hub palette is already mapped into `@theme`. For example `--color-gov-blue: #0b2318`, `--color-gov-yellow: #f0c987` and `--font-serif` use the hub's serif stack. The logo bar is in `layout.tsx`, and `/ga-logo.png` is in `public/`. The remaining gap is that the body font is still **Inter**, through `next/font/google`.

To finish:

1. **Fonts.** In `src/app/layout.tsx`, remove `import { Inter } from 'next/font/google'` and the `inter.className`. In `globals.css`, add `--font-sans: "Segoe UI", "Helvetica Neue", Helvetica, Arial, sans-serif;` to `@theme` so the Tailwind `font-sans` utility matches the hub. Headings use `font-serif`, weight 500.
2. **Tokens.** Add the `--ga-*` block from `ga-theme.css` to `@layer base { :root { ... } }`. Expose the main colours to Tailwind in `@theme`:
   - `--color-ga-field: #021c17`
   - `--color-ga-raised: #102e26`
   - `--color-ga-ink: #f6f0e4`
   - `--color-ga-ink-soft: #d2c8b4`
   - `--color-ga-gold: #f0c987`
   - `--color-ga-gold-hover: #f7e1b8`

   This gives you `bg-ga-field`, `text-ga-gold` and similar utilities.
3. **Body.** Use `<html lang="en-GB">` and `<body className="h-full bg-ga-field text-ga-ink font-sans">`. Keep the `.ga-brandbar` markup as the first child of `<body>`, with its CSS from section 5 in `globals.css`.
4. **Buttons.** Primary: `inline-flex items-center justify-center min-h-[2.6rem] px-[.85rem] py-[.4rem] rounded-lg font-bold text-[.95rem] bg-ga-gold text-ga-field hover:bg-ga-gold-hover`. Quiet: `border border-[rgba(240,201,135,.32)] text-ga-gold hover:bg-[rgba(240,201,135,.1)] hover:text-ga-gold-hover`. The `rounded-lg` utility is 8 px.
5. **Header and footer.** Replace `border-b-4 border-gov-yellow bg-gov-blue` with `bg-ga-field border-b border-[rgba(240,201,135,.32)]`, and set the app name in `font-serif font-medium`. The footer gets the line border at the top and the LinkedIn link.
6. **Links.** The header links to NCSC and gov.uk are outside the allowed list (rule 8.3). Remove them or get sign-off.
7. Rebuild and check with the new app checklist. Deploy bcp through the usual ACR and Container App route.
