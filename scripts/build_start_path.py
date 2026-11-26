#!/usr/bin/env python3
"""Generate /start/ (the absolute-beginner "Start your security journey" path).

Writes start/index.html and one page per step under start/<slug>/index.html from
start_path_content.py and start_path_steps.py, using the same look as the beginner
architecture path (architect-beginners.css) plus start-journey.css and
start-journey.js. Run from anywhere: python3 scripts/build_start_path.py

Wiring that lives elsewhere and is checked by scripts/check_start_pages.py:
sitemap.xml, staticwebapp.config.json (slashless rewrites), scripts/check_links.py
(SERVED list and the exact YouTube allowlist) and scripts/build.sh (HUB_DIRS, HUB_FILES).
"""
import hashlib
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
sys.path.insert(0, str(HERE))

from start_path_content import CLIPS, NSTEPS, NT, PLAYLIST, STEPS, VIDEOS  # noqa: E402
from start_path_steps import ANIM, CAP, S  # noqa: E402
from chrome_parts import HEADER, FOOTER  # noqa: E402


def md5_10(name):
    return hashlib.md5((ROOT / name).read_bytes()).hexdigest()[:10]


def existing(filename):
    src = (ROOT / "architect/index.html").read_text(encoding="utf-8")
    m = re.search(rf'(?:href|src)="(/{re.escape(filename)}\?v=[0-9a-f]+)"', src)
    return m.group(1) if m else f"/{filename}"


STYLES = existing("styles.css")
ARCH_CSS = existing("architect.css")
FAV_ICO = existing("favicon.ico")
_idx = (ROOT / "architect/index.html").read_text(encoding="utf-8")
FAV_SVG = re.search(r'href="(/favicon\.svg\?v=[0-9a-f]+)"', _idx).group(1)
APPLE = re.search(r'href="(/apple-touch-icon\.png\?v=[0-9a-f]+)"', _idx).group(1)
BEG_CSS = f"/architect-beginners.css?v={md5_10('architect-beginners.css')}"
START_CSS = f"/start-journey.css?v={md5_10('start-journey.css')}"
START_JS = f"/start-journey.js?v={md5_10('start-journey.js')}"

BASE = "https://www.govassured.com/start/"


def page(title, desc, canonical, body):
    return f"""<!DOCTYPE html>
<html lang="en-GB">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title} — GOV Assured</title>
  <meta name="description" content="{desc}">
  <link rel="canonical" href="{canonical}">
  <link rel="sitemap" type="application/xml" title="Sitemap" href="/sitemap.xml">
  <meta name="author" content="GOV Assured">
  <meta name="theme-color" content="#021c17">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="GOV Assured">
  <meta property="og:title" content="{title} — GOV Assured">
  <meta property="og:description" content="{desc}">
  <meta property="og:url" content="{canonical}">
  <meta property="og:image" content="https://www.govassured.com/public/og.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="GOV Assured. A gold crown above a gold serif wordmark on a dark green field.">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{title} — GOV Assured">
  <meta name="twitter:description" content="{desc}">
  <meta name="twitter:image" content="https://www.govassured.com/public/og.jpg">
  <link rel="icon" href="{FAV_ICO}" sizes="48x48">
  <link rel="icon" href="{FAV_SVG}" type="image/svg+xml">
  <link rel="apple-touch-icon" href="{APPLE}">
  <link rel="stylesheet" href="{STYLES}">
  <link rel="stylesheet" href="{ARCH_CSS}">
  <link rel="stylesheet" href="{BEG_CSS}">
  <link rel="stylesheet" href="{START_CSS}">
</head>
<body>
{HEADER}
  <main id="main" tabindex="-1">
{body}
  </main>

{FOOTER}
  <script src="{START_JS}" defer></script>
</body>
</html>
"""


def crumbs(*items, current):
    lis = "\n".join(f'          <li><a href="{href}">{label}</a></li>' for href, label in items)
    return f"""    <div class="wrap">
      <nav class="arch-crumbs" aria-label="Breadcrumb">
        <ol>
{lis}
          <li aria-current="page">{current}</li>
        </ol>
      </nav>
    </div>
"""


def out_link(href, text):
    return f'<a href="{href}" target="_blank" rel="noopener noreferrer">{text}{NT}</a>'


def yt_url(key):
    vid, secs = key.split("@")
    s = int(secs)
    return f"https://www.youtube.com/watch?v={vid}&amp;t={s}s"


def vid_item(key):
    c = CLIPS[key]
    vid = key.split("@")[0]
    meta = VIDEOS[vid]
    n = len(c["bullets"])
    if not 3 <= n <= 6:
        raise SystemExit(f"{key}: expected 3-6 bullets, got {n}")
    bullets = "\n".join(f"                <li>{b}</li>" for b in c["bullets"])
    return f"""          <li>
            <article class="beg-video">
              <p class="beg-video-meta">YouTube · starts at {c["start"]} · {c["len"]} · part of a video that runs {meta["length"]}</p>
              <h3>{out_link(yt_url(key), c["title"])}</h3>
              <p>{c["summary"]}</p>
              <h4 class="beg-video-covers">What this video covers</h4>
              <ul class="beg-video-points">
{bullets}
              </ul>
              <figure class="beg-anim beg-video-info">
                <div class="beg-anim-stage">
{c["svg"]}
                </div>
                <div class="beg-anim-bar">
                  <button type="button" class="beg-anim-toggle" data-beg-anim-toggle aria-pressed="true" aria-label="Pause animation">Pause</button>
                  <figcaption>{c["caption"]}</figcaption>
                </div>
              </figure>
            </article>
          </li>"""


def done(n, text):
    return f"""          <div class="beg-done">
            <input type="checkbox" id="beg-done-{n}" data-beg-step="step-{n}">
            <label for="beg-done-{n}">{text}</label>
          </div>"""


def check(question, answer):
    return f"""          <div class="beg-check">
            <p><strong>Check your understanding.</strong> {question}</p>
            <details>
              <summary>Show a good answer</summary>
              <p>{answer}</p>
            </details>
          </div>"""


def gov_box(intro, items):
    lis = []
    for href, title, summary in items:
        lis.append(f"            <li>\n              <p>{out_link(href, title)}</p>\n              <p>{summary}</p>\n            </li>")
    return f"""          <aside class="beg-gov" aria-labelledby="beg-gov-title">
            <h2 id="beg-gov-title">What GOV.UK recommends</h2>
            <p>{intro}</p>
            <ul>
{chr(10).join(lis)}
            </ul>
          </aside>
"""


def try_box(items):
    lis = "\n".join(f"            <li>{i}</li>" for i in items)
    return f"""          <aside class="start-try" aria-labelledby="start-try-title">
            <h2 id="start-try-title">Try it for yourself</h2>
            <ul>
{lis}
            </ul>
          </aside>
"""


def rail(current):
    items = []
    for s in STEPS:
        label = f'Step {s["n"]} of {NSTEPS}: {s["title"]}'
        href = f'/start/{s["slug"]}/'
        if s["n"] == current:
            items.append(f'            <li><span aria-current="page" aria-label="{label}">{s["n"]}</span></li>')
        else:
            items.append(f'            <li><a href="{href}" aria-label="{label}">{s["n"]}</a></li>')
    return f"""          <nav class="beg-rail" aria-label="Steps">
            <ol>
{chr(10).join(items)}
            </ol>
            <p class="beg-step-kicker">Step {current} of {NSTEPS}</p>
          </nav>
"""


def pager(n):
    bits = ['          <nav class="tpl-pager" aria-label="Start your security journey">']
    if n > 1:
        prev = STEPS[n - 2]
        bits.append(f'            <a class="tpl-pager-prev" href="/start/{prev["slug"]}/" rel="prev"><span class="tpl-pager-label">Previous step</span> <span class="tpl-pager-title">{prev["title"]}</span></a>')
    if n < NSTEPS:
        nxt = STEPS[n]
        bits.append(f'            <a class="tpl-pager-next" href="/start/{nxt["slug"]}/" rel="next"><span class="tpl-pager-label">Next step</span> <span class="tpl-pager-title">{nxt["title"]}</span></a>')
    else:
        bits.append('            <a class="tpl-pager-next" href="/architect/beginners/"><span class="tpl-pager-label">Next path</span> <span class="tpl-pager-title">Beginner security architecture path</span></a>')
    bits.append("          </nav>")
    bits.append('          <p class="tpl-top"><a href="/start/">All steps</a></p>')
    return "\n".join(bits)


def anim(caption, svg):
    return f"""          <figure class="beg-anim beg-step-anim">
            <div class="beg-anim-stage" aria-hidden="true">
{svg}
            </div>
            <div class="beg-anim-bar">
              <button type="button" class="beg-anim-toggle" data-beg-anim-toggle aria-pressed="true" aria-label="Pause animation">Pause</button>
              <figcaption>{caption}</figcaption>
            </div>
          </figure>
"""


def next_card():
    return """          <div class="start-next">
            <h2>Ready for the next stage?</h2>
            <p>The beginner security architecture path picks up where this one stops. It is a seven-step introduction to how a whole service is designed to be secure, with videos, official guidance and a first exercise.</p>
            <p><a class="btn btn-primary" href="/architect/beginners/">Open the beginner security architecture path</a></p>
          </div>
"""


def render_intro(parts):
    """Each intro part is a paragraph string, or a list of strings rendered as a <ul>."""
    out = []
    for part in parts:
        if isinstance(part, (list, tuple)):
            items = "\n".join(f"          <li>{item}</li>" for item in part)
            out.append(f"        <ul>\n{items}\n        </ul>")
        else:
            out.append(f"        <p>{part}</p>")
    return "\n".join(out)


def step_page(s):
    d = S[s["n"]]
    intro = render_intro(d["intro"])
    videos = "\n".join(vid_item(k) for k in d["clips"])
    inner = f"""
{anim(CAP[s["n"]], ANIM[s["n"]])}
{intro}
{try_box(d["try"])}
        <h2>Videos to watch</h2>
        <p>These are clips from longer free videos. Each link starts at the right moment, and you are welcome to watch only that part.</p>
        <ul class="beg-videos">
{videos}
        </ul>
{gov_box(d["gov_intro"], d["gov"])}
{check(*d["check"])}
{done(s["n"], f"I have marked step {s['n']} as done")}
{next_card() if d.get("next") else ""}
        <p><a href="/start/#glossary">Words you will see</a> are collected on the path overview.</p>
"""
    body = f"""{crumbs(("/", "Home"), ("/start/", "Start your security journey"), current=s["title"])}
    <section class="band arch-hero" aria-labelledby="beg-title">
      <div class="wrap">
        {rail(s["n"])}
        <p class="eyebrow">Start your security journey</p>
        <h1 id="beg-title">{s["title"]}</h1>
      </div>
    </section>

    <div class="band arch-section beg-step" id="{s["id"]}">
      <div class="wrap arch-prose">
{inner}
{pager(s["n"])}
      </div>
    </div>
"""
    return page(f'{s["title"]} (step {s["n"]} of {NSTEPS})', s["desc"], f'{BASE}{s["slug"]}/', body)


GLOSSARY = [
    ("Asset", "Anything of value to a person or organisation, such as a device, an account, photos or customer details."),
    ("Availability", "The right people can get to the information or service when they need it."),
    ("Backup", "A copy of important files kept somewhere separate, so you can recover them if the originals are lost."),
    ("Confidentiality", "Information is only seen by the people who should see it."),
    ("Encryption", "Scrambling information so that only someone with the right key can read it."),
    ("Integrity", "Being able to trust that information is correct and has not been quietly changed."),
    ("Malware", "Software designed to harm devices or networks, such as viruses, worms, trojans, ransomware and spyware."),
    ("Multi-factor authentication (MFA)", "Proving who you are in two or more ways, such as a password plus a code on your phone. Also called 2-step verification."),
    ("Packet", "A small unit of data that travels across a network, a bit like a letter with an address on the envelope."),
    ("Phishing", "A message that pretends to be from someone you trust to get you to click, open or hand over details."),
    ("Ransomware", "Malware that locks your data and demands payment to unlock it."),
    ("Risk", "How likely something bad is to happen, and how serious it would be if it did."),
    ("Social engineering", "Tricking people, rather than machines, into giving access or information."),
    ("Threat actor", "Any person or group that poses a security risk, on purpose or by accident."),
    ("Update (patch)", "A fix from the maker of software, often closing a security weakness."),
    ("Vulnerability", "A weakness that a threat could use, such as out-of-date software or a weak password."),
]


def overview():
    cards = []
    for s in STEPS:
        cards.append(f"""            <li>
              <a class="beg-step-card" href="/start/{s["slug"]}/" data-beg-card="{s["id"]}">
                <span class="beg-step-card-num">{s["n"]}</span>
                <span>
                  <span class="beg-step-card-title">{s["title"]}</span>
                  <span class="beg-step-card-meta">{s["meta"]}</span>
                </span>
                <span class="beg-step-card-status">Not started</span>
              </a>
            </li>""")
    gloss = "\n".join(f"          <dt>{t}</dt>\n          <dd>{d}</dd>" for t, d in GLOSSARY)
    playlist = out_link(PLAYLIST, "Google Cybersecurity Certificate playlist")
    body = f"""{crumbs(("/", "Home"), current="Start your security journey")}
    <section class="band arch-hero" aria-labelledby="beg-title">
      <div class="wrap">
        <p class="eyebrow">New to security?</p>
        <h1 id="beg-title">Start your security journey</h1>
        <p class="lede">A friendly first path for people with no background in cyber security. Eight short pages, a moving explainer on each, free video clips with plain-English summaries, and what official UK guidance says. When you are ready, it leads into the beginner security architecture path.</p>
        <div class="beg-progress">
          <p class="beg-progress-label" id="beg-progress-status">0 of {NSTEPS} steps marked as done</p>
          <progress id="beg-progress-bar" max="{NSTEPS}" value="0" aria-labelledby="beg-progress-status">0 of {NSTEPS} steps marked as done</progress>
        </div>
        <nav class="arch-toc beg-toc" aria-label="On this page">
          <h2 class="arch-toc-h">On this page</h2>
          <ol>
            <li><a href="#beg-learn">What you will learn</a></li>
            <li><a href="#beg-how">How to use this path</a></li>
            <li><a href="#beg-steps">The eight steps</a></li>
            <li><a href="#start-next">Where this leads</a></li>
            <li><a href="#glossary">Words you will see</a></li>
          </ol>
        </nav>
      </div>
    </section>

    <section class="band arch-section" aria-labelledby="beg-learn">
      <div class="wrap arch-prose">
        <h2 id="beg-learn" class="section-title">What you will learn</h2>
        <p>You do not need any technical background. By the end of this path you will be able to:</p>
        <ul>
          <li>explain what cyber security is, in plain English, and the three ideas almost every security conversation uses</li>
          <li>tell a threat, a weakness and a risk apart, and describe how attackers look for the easiest way in</li>
          <li>protect your own accounts and devices using the advice the UK government&#39;s National Cyber Security Centre gives to everyone</li>
          <li>spot a phishing message, and know how to report one</li>
          <li>describe how information travels across a network, and why encryption and backups matter</li>
          <li>see the kinds of work people do in security and where to explore a career</li>
        </ul>
      </div>
    </section>

    <section class="band arch-section" aria-labelledby="beg-how">
      <div class="wrap arch-prose">
        <h2 id="beg-how" class="section-title">How to use this path</h2>
        <p>Open the steps in order, or jump to the one you need. Each page has a short looping explainer, a little reading, a quick thing to try, official UK guidance, and one or two video clips to watch when you have time. Tick &ldquo;mark as done&rdquo; on a step and it will show as done here. Ticks are saved on this device only. Nothing is sent to us.</p>
        <p>The videos come from the free {playlist} on YouTube. They are long, so each link starts at the part that matches the step, and you can stop when you have the idea. They open in a new tab. We have written our own short summaries: under each video link you will find a &ldquo;What this video covers&rdquo; explainer and a simple graphic. The videos are made for a US audience, so where they mention US laws, job sites or figures, use the UK links on the page instead. The video makers have no connection with us.</p>
        <p>If an animation feels like too much, use the pause control, or skip on and come back later. You will not be behind. The aim is a confident first pass, not a qualification.</p>
      </div>
    </section>

    <section class="band arch-section" aria-labelledby="beg-steps">
      <div class="wrap">
        <h2 id="beg-steps" class="section-title">The eight steps</h2>
        <ol class="beg-step-cards">
{chr(10).join(cards)}
        </ol>
      </div>
    </section>

    <section class="band arch-section" id="start-next" aria-labelledby="start-next-title">
      <div class="wrap arch-prose">
        <h2 id="start-next-title" class="section-title">Where this leads</h2>
        <p>This path is the first stage. Once you are comfortable with the basics, the <a href="/architect/beginners/">beginner security architecture path</a> shows how security is designed into a whole service, using the same plain approach, with a first exercise at the end. The wider <a href="/architect/">Security Architect Corner</a> has templates, patterns and guidance for each stage of a public service.</p>
      </div>
    </section>

    <section class="band arch-section" id="glossary" aria-labelledby="glossary-title">
      <div class="wrap arch-prose">
        <h2 id="glossary-title" class="section-title">Words you will see</h2>
        <p>A short glossary in plain English. You do not need to memorise it. Come back when a word turns up.</p>
        <dl class="beg-glossary">
{gloss}
        </dl>
        <p class="beg-credit arch-callout">The video clips in this path come from the public {playlist} on YouTube. The summaries on these pages are ours.</p>
      </div>
    </section>
"""
    return page(
        "Start your security journey",
        "A free, plain-English starting path for people new to cyber security: eight short steps with moving explainers, video clips, official UK guidance, and a route into security architecture.",
        BASE,
        body,
    )


def main():
    dest = ROOT / "start"
    dest.mkdir(exist_ok=True)
    (dest / "index.html").write_text(overview(), encoding="utf-8")
    print("wrote", dest / "index.html")
    for s in STEPS:
        p = dest / s["slug"] / "index.html"
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(step_page(s), encoding="utf-8")
        print("wrote", p)


if __name__ == "__main__":
    main()
