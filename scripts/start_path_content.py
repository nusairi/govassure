"""Content for the absolute-beginner "Start your security journey" path (/start/).

Sources, researched 26 Nov 2026 (Europe/London):
  * Video series: the official Google Cybersecurity Certificate playlist on YouTube
    (https://www.youtube.com/playlist?list=PL590L5WQmH8d68VyR6RjhgldHMxMJ5B5z), free to watch.
    Five of its eight videos are used, each linked at a chapter start so people can
    watch only the part that matches the step.
  * English captions for those five videos (yt-dlp --write-subs). Chapter windows were
    read in full and summarised in our own words. No transcript text is copied here
    and presenters are not named. Notes: /workspace/docs/security-start-path/.
  * Official links: NCSC, GOV.UK and National Careers Service pages, each opened and
    checked on 26 Nov 2026 (HTTP 200, no redirect to a 404 page).
Keep the bullets in our own words, do not name people, and keep every outside link on
the allowlist in scripts/check_links.py.
"""

PLAYLIST = "https://www.youtube.com/playlist?list=PL590L5WQmH8d68VyR6RjhgldHMxMJ5B5z"
NT = '<span class="visually-hidden"> (opens in a new tab)</span>'

# Whole-video facts (all public, English captions available).
VIDEOS = {
    "_DVVNOGYtmU": {"title": "Cybersecurity for Beginners", "length": "1 hour 14 minutes", "captions": "manual English captions"},
    "34BtwcL7Mkg": {"title": "How To Manage Security Risks & Threats", "length": "1 hour 27 minutes", "captions": "manual English captions"},
    "NIRXtMg-0z8": {"title": "Internet Networks & Network Security", "length": "1 hour 9 minutes", "captions": "manual English captions"},
    "Rgl7C0P6NsE": {"title": "Cybersecurity Assets, Network Threats & Vulnerabilities", "length": "2 hours 6 minutes", "captions": "manual English captions"},
    "3EgYr7jR4NI": {"title": "How To Prepare For Your Cybersecurity Career", "length": "1 hour 30 minutes", "captions": "manual English captions"},
}

STEPS = [
    {"n": 1, "id": "step-1", "slug": "1-what-is-cyber-security", "title": "What cyber security is", "meta": "2 video clips · about 11 minutes",
     "desc": "Start at the very beginning: what cyber security means, what it protects, who tries to cause harm, and the three ideas almost every security conversation comes back to."},
    {"n": 2, "id": "step-2", "slug": "2-threats-and-attackers", "title": "Threats, attackers and risk", "meta": "2 video clips · about 24 minutes",
     "desc": "Who attacks, how old tricks keep coming back in new forms, and how threat, weakness and risk fit together in plain English."},
    {"n": 3, "id": "step-3", "slug": "3-passwords-and-accounts", "title": "Passwords, 2-step checks and accounts", "meta": "1 video clip · about 12 minutes",
     "desc": "How websites check who you are, why one password is not enough, and what UK official advice says about passwords and 2-step verification."},
    {"n": 4, "id": "step-4", "slug": "4-devices-and-updates", "title": "Devices, updates and malware", "meta": "2 video clips · about 13 minutes",
     "desc": "Why software updates matter, what malware is and the main kinds, and what UK official advice says about keeping phones and computers safe."},
    {"n": 5, "id": "step-5", "slug": "5-phishing-and-scams", "title": "Phishing and social engineering", "meta": "1 video clip · about 10 minutes",
     "desc": "How scammers trick people by email, text and phone, how to spot the signs, and how to report a scam using official UK routes."},
    {"n": 6, "id": "step-6", "slug": "6-networks-and-internet", "title": "Networks and the internet", "meta": "2 video clips · about 23 minutes",
     "desc": "How information travels across the internet in packets, what addresses and ports do, and the common ways networks are attacked and protected."},
    {"n": 7, "id": "step-7", "slug": "7-data-and-privacy", "title": "Data, encryption and privacy", "meta": "2 video clips · about 16 minutes",
     "desc": "What personal data is, how encryption keeps it private, why reporting small problems early matters, and what UK official guidance says about data."},
    {"n": 8, "id": "step-8", "slug": "8-careers-and-next-steps", "title": "Careers and where to go next", "meta": "2 video clips · about 17 minutes",
     "desc": "The kinds of work people do in security, how to explore a career using UK official routes, and how this path leads into the beginner security architecture path."},
]

NSTEPS = len(STEPS)


def _svg(key, title, desc, body, vb="0 0 640 240"):
    tid = f"start-vid-{key}-title"
    did = f"start-vid-{key}-desc"
    return f'''              <svg viewBox="{vb}" role="img" aria-labelledby="{tid} {did}" focusable="false">
                <title id="{tid}">{title}</title>
                <desc id="{did}">{desc}</desc>
{body}
              </svg>'''


def T(x, y, s, cls="beg-ink", size=13, anchor="middle", weight=None, extra=""):
    w = f' font-weight="{weight}"' if weight else ""
    return f'                <text x="{x}" y="{y}" text-anchor="{anchor}" class="{cls}" font-size="{size}"{w}{extra}>{s}</text>'


def R(x, y, w, h, cls="beg-zone", rx=10, extra=""):
    return f'                <rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" class="{cls}" stroke-width="2"{extra}/>'


# --------------------------------------------------------------------------------------
# Infographics under each video clip (no xmlns; classes plus presentation attributes only)
# --------------------------------------------------------------------------------------

SVG_PROTECT = _svg(
    "protect",
    "Security protects four things from people who should not have access",
    "Four boxes for people, devices, networks and data sit inside a ring labelled keep it private, correct and available. Outside the ring, a threat actor may be an outsider or someone on the inside by accident.",
    "\n".join([
        R(150, 40, 340, 150, "beg-zone-hot", 14),
        T(320, 66, "Keep information private, correct and available", "beg-fill-gold", 13, weight=700),
        '                <g class="beg-fade-a">', R(168, 84, 74, 70, "beg-zone", 8), T(205, 124, "People", "beg-ink", 12, weight=700), '                </g>',
        '                <g class="beg-fade-b">', R(250, 84, 74, 70, "beg-zone", 8), T(287, 124, "Devices", "beg-ink", 12, weight=700), '                </g>',
        '                <g class="beg-fade-c">', R(332, 84, 74, 70, "beg-zone", 8), T(369, 124, "Networks", "beg-ink", 12, weight=700), '                </g>',
        '                <g class="beg-fade-a">', R(414, 84, 64, 70, "beg-zone", 8), T(446, 124, "Data", "beg-ink", 12, weight=700), '                </g>',
        T(320, 176, "Protected from unauthorised access or misuse", "beg-ink-soft", 12),
        T(20, 100, "Outside", "beg-ink", 13, "start", 700), T(20, 120, "threat", "beg-ink-soft", 12, "start"),
        T(558, 100, "Inside", "beg-ink", 13, "start", 700), T(558, 120, "often an", "beg-ink-soft", 12, "start"), T(558, 138, "accident", "beg-ink-soft", 12, "start"),
        T(20, 224, "A threat actor is anyone who puts these at risk, on purpose or by mistake.", "beg-ink-soft", 13, "start"),
    ]),
)

SVG_CIA = _svg(
    "cia",
    "Confidentiality, integrity and availability, shown with a bank",
    "Three cards. Confidentiality: only the right people see account details. Integrity: unusual spending is checked so the account holder is the one paying. Availability: you can reach your account when you need it.",
    "\n".join([
        '                <g class="beg-fade-a">', R(20, 40, 190, 150), T(115, 70, "Confidentiality", "beg-fill-gold", 15, weight=700),
        T(115, 108, "Only the right people", "beg-ink", 12), T(115, 126, "see your account.", "beg-ink", 12), T(115, 160, "Who should see this?", "beg-ink-soft", 12), '                </g>',
        '                <g class="beg-fade-b">', R(225, 40, 190, 150), T(320, 70, "Integrity", "beg-fill-gold", 15, weight=700),
        T(320, 108, "Odd spending is checked", "beg-ink", 12), T(320, 126, "so you know it is you.", "beg-ink", 12), T(320, 160, "Can we trust this?", "beg-ink-soft", 12), '                </g>',
        '                <g class="beg-fade-c">', R(430, 40, 190, 150), T(525, 70, "Availability", "beg-fill-gold", 15, weight=700),
        T(525, 108, "You can reach your", "beg-ink", 12), T(525, 126, "account when needed.", "beg-ink", 12), T(525, 160, "Is it there for us?", "beg-ink-soft", 12), '                </g>',
        T(20, 224, "When you hear about a security problem, ask which of the three it hurts.", "beg-ink-soft", 13, "start"),
    ]),
)

SVG_HISTORY = _svg(
    "history",
    "Four attacks that shaped modern security",
    "A timeline with four stops: a 1986 virus that spread on floppy disks, a 1988 worm that kept reinstalling itself, a later email worm that tricked people with a fake love letter, and a 2017 breach at a credit-reporting company where known weaknesses were left unfixed.",
    "\n".join([
        '                <line x1="40" y1="110" x2="600" y2="110" class="beg-stroke-line" stroke-width="2"/>',
        '                <g class="beg-fade-a">', '                <circle cx="90" cy="110" r="10" class="beg-fill-gold"/>', T(90, 80, "1986", "beg-fill-gold", 15, weight=700),
        T(90, 140, "A virus spreads", "beg-ink", 12), T(90, 158, "on floppy disks", "beg-ink", 12), T(90, 180, "Meant to track copies", "beg-ink-soft", 11), '                </g>',
        '                <g class="beg-fade-b">', '                <circle cx="240" cy="110" r="10" class="beg-fill-gold"/>', T(240, 80, "1988", "beg-fill-gold", 15, weight=700),
        T(240, 140, "A worm reinstalls", "beg-ink", 12), T(240, 158, "itself until PCs crash", "beg-ink", 12), T(240, 180, "Not meant to harm", "beg-ink-soft", 11), '                </g>',
        '                <g class="beg-fade-c">', '                <circle cx="390" cy="110" r="10" class="beg-fill-gold"/>', T(390, 80, "Later", "beg-fill-gold", 15, weight=700),
        T(390, 140, "A fake love letter", "beg-ink", 12), T(390, 158, "emails everyone", "beg-ink", 12), T(390, 180, "Tricks the reader", "beg-ink-soft", 11), '                </g>',
        '                <g class="beg-fade-a">', '                <circle cx="540" cy="110" r="10" class="beg-fill-gold"/>', T(540, 80, "2017", "beg-fill-gold", 15, weight=700),
        T(540, 140, "A huge data breach", "beg-ink", 12), T(540, 158, "known holes unfixed", "beg-ink", 12), T(540, 180, "Fix known problems", "beg-ink-soft", 11), '                </g>',
        T(20, 224, "Many new attacks are old ideas with a new twist.", "beg-ink-soft", 13, "start"),
    ]),
)

SVG_RISK = _svg(
    "risk",
    "A threat plus a weakness makes a risk",
    "An equation. A threat, for example a phishing email, plus a vulnerability, for example a weak password, gives a risk, for example an account taken over. Both parts must be present.",
    "\n".join([
        '                <g class="beg-fade-a">', R(20, 60, 170, 110), T(105, 92, "Threat", "beg-fill-gold", 15, weight=700), T(105, 124, "Something that could", "beg-ink", 12), T(105, 142, "cause harm", "beg-ink", 12), T(105, 160, "e.g. a phishing email", "beg-ink-soft", 11), '                </g>',
        T(215, 124, "+", "beg-ink", 30, weight=700),
        '                <g class="beg-fade-b">', R(240, 60, 170, 110), T(325, 92, "Weakness", "beg-fill-gold", 15, weight=700), T(325, 124, "A gap it can use", "beg-ink", 12), T(325, 142, "(a vulnerability)", "beg-ink", 12), T(325, 160, "e.g. a weak password", "beg-ink-soft", 11), '                </g>',
        T(435, 124, "=", "beg-ink", 30, weight=700),
        '                <g class="beg-fade-c">', R(460, 60, 160, 110, "beg-zone-hot"), T(540, 92, "Risk", "beg-fill-gold", 15, weight=700), T(540, 124, "How likely, and how", "beg-ink", 12), T(540, 142, "bad if it happens", "beg-ink", 12), T(540, 160, "low, medium or high", "beg-ink-soft", 11), '                </g>',
        T(20, 214, "Take away either part and the risk shrinks: fix the weakness, or block the threat.", "beg-ink-soft", 13, "start"),
    ]),
)

SVG_FACTORS = _svg(
    "factors",
    "Three kinds of proof of who you are",
    "Three cards. Something you know, such as a password. Something you have, such as a one-time code sent to your phone. Something you are, such as a fingerprint. Combining two or more is multi-factor authentication.",
    "\n".join([
        '                <g class="beg-fade-a">', R(20, 40, 190, 130), T(115, 70, "Something you know", "beg-fill-gold", 14, weight=700), T(115, 112, "A password or", "beg-ink", 12), T(115, 130, "a secret answer", "beg-ink", 12), '                </g>',
        '                <g class="beg-fade-b">', R(225, 40, 190, 130), T(320, 70, "Something you have", "beg-fill-gold", 14, weight=700), T(320, 112, "A one-time code", "beg-ink", 12), T(320, 130, "sent to your phone", "beg-ink", 12), '                </g>',
        '                <g class="beg-fade-c">', R(430, 40, 190, 130), T(525, 70, "Something you are", "beg-fill-gold", 14, weight=700), T(525, 112, "A fingerprint", "beg-ink", 12), T(525, 130, "or your face", "beg-ink", 12), '                </g>',
        T(320, 198, "Two or more together is multi-factor authentication (MFA).", "beg-ink", 13, weight=700),
        T(320, 222, "A thief who steals one proof still cannot get in.", "beg-ink-soft", 12),
    ]),
)

SVG_HARDEN = _svg(
    "harden",
    "Five habits that make a device harder to attack",
    "Five labelled cards: install updates as soon as they are released, keep a known good set-up to compare against, remove software you no longer use, wipe old devices before disposal, and use a strong password with a second check.",
    "\n".join([
        R(12, 52, 118, 126, "beg-phase-hi-1", 8), T(71, 82, "1 Update", "beg-ink", 12, weight=700), T(71, 108, "Install fixes", "beg-ink-soft", 11), T(71, 124, "as soon as", "beg-ink-soft", 11), T(71, 140, "they appear", "beg-ink-soft", 11),
        R(136, 52, 118, 126, "beg-phase-hi-2", 8), T(195, 82, "2 Baseline", "beg-ink", 12, weight=700), T(195, 108, "Know how it", "beg-ink-soft", 11), T(195, 124, "should look to", "beg-ink-soft", 11), T(195, 140, "spot changes", "beg-ink-soft", 11),
        R(260, 52, 118, 126, "beg-phase-hi-3", 8), T(319, 82, "3 Declutter", "beg-ink", 12, weight=700), T(319, 108, "Remove what", "beg-ink-soft", 11), T(319, 124, "you no longer", "beg-ink-soft", 11), T(319, 140, "use", "beg-ink-soft", 11),
        R(384, 52, 118, 126, "beg-phase-hi-4", 8), T(443, 82, "4 Dispose", "beg-ink", 12, weight=700), T(443, 108, "Wipe old kit", "beg-ink-soft", 11), T(443, 124, "before it", "beg-ink-soft", 11), T(443, 140, "leaves you", "beg-ink-soft", 11),
        R(508, 52, 120, 126, "beg-phase-hi-5", 8), T(568, 82, "5 Sign-in", "beg-ink", 12, weight=700), T(568, 108, "Strong password", "beg-ink-soft", 11), T(568, 124, "plus a second", "beg-ink-soft", 11), T(568, 140, "check", "beg-ink-soft", 11),
        T(20, 214, "Routine jobs and one-off settings, together, make a device tougher.", "beg-ink-soft", 13, "start"),
    ]),
)

SVG_MALWARE = _svg(
    "malware",
    "Five common kinds of malware",
    "Five labelled cards: a virus needs a person to open it, a worm spreads by itself, a trojan pretends to be something useful, ransomware locks your data for payment, and spyware secretly collects information.",
    "\n".join([
        R(12, 52, 118, 126, "beg-phase-hi-1", 8), T(71, 82, "Virus", "beg-ink", 13, weight=700), T(71, 108, "Needs a person", "beg-ink-soft", 11), T(71, 124, "to open it", "beg-ink-soft", 11), T(71, 140, "to start", "beg-ink-soft", 11),
        R(136, 52, 118, 126, "beg-phase-hi-2", 8), T(195, 82, "Worm", "beg-ink", 13, weight=700), T(195, 108, "Spreads by", "beg-ink-soft", 11), T(195, 124, "itself across", "beg-ink-soft", 11), T(195, 140, "a network", "beg-ink-soft", 11),
        R(260, 52, 118, 126, "beg-phase-hi-3", 8), T(319, 82, "Trojan", "beg-ink", 13, weight=700), T(319, 108, "Pretends to be", "beg-ink-soft", 11), T(319, 124, "a useful file", "beg-ink-soft", 11), T(319, 140, "or app", "beg-ink-soft", 11),
        R(384, 52, 118, 126, "beg-phase-hi-4", 8), T(443, 82, "Ransomware", "beg-ink", 13, weight=700), T(443, 108, "Locks your data", "beg-ink-soft", 11), T(443, 124, "and demands", "beg-ink-soft", 11), T(443, 140, "payment", "beg-ink-soft", 11),
        R(508, 52, 120, 126, "beg-phase-hi-5", 8), T(568, 82, "Spyware", "beg-ink", 13, weight=700), T(568, 108, "Secretly collects", "beg-ink-soft", 11), T(568, 124, "logins and", "beg-ink-soft", 11), T(568, 140, "other details", "beg-ink-soft", 11),
        T(20, 214, "Signs of trouble: slowness, crashes, a draining battery, or pop-ups you did not expect.", "beg-ink-soft", 13, "start"),
    ]),
)

SVG_SOCIAL = _svg(
    "social",
    "How a scam message gives itself away",
    "A message card with three warning labels that appear in turn: pressure to act now, an unexpected attachment or form, and a link that looks like a trusted brand but is not. Below, a reminder to stop, check, then report.",
    "\n".join([
        R(20, 30, 340, 150, "beg-zone", 10),
        T(36, 56, "From: your bank?", "beg-ink", 13, "start", 700),
        T(36, 80, "Your account has a problem.", "beg-ink", 12, "start"),
        T(36, 100, "Act now or it will be closed.", "beg-ink", 12, "start"),
        T(36, 128, "[ Open the attached form ]", "beg-ink-soft", 12, "start"),
        T(36, 154, "www.your-bank-secure-login.example", "beg-ink-soft", 12, "start"),
        '                <g class="beg-sticky-1">', R(380, 34, 240, 38, "beg-fill-raised beg-stroke-gold", 6), T(500, 58, "Pressure to act now", "beg-ink", 12, weight=700), '                </g>',
        '                <g class="beg-sticky-2">', R(380, 88, 240, 38, "beg-fill-raised beg-stroke-gold", 6), T(500, 112, "Unexpected form or attachment", "beg-ink", 12, weight=700), '                </g>',
        '                <g class="beg-sticky-3">', R(380, 142, 240, 38, "beg-fill-raised beg-stroke-gold", 6), T(500, 166, "Look-alike web address", "beg-ink", 12, weight=700), '                </g>',
        T(20, 214, "Stop. Check in a way you trust. Report it. The same goes for texts and phone calls.", "beg-ink-soft", 13, "start"),
    ]),
)

SVG_PACKET = _svg(
    "packet",
    "A data packet is like a letter with two addresses and a port",
    "An envelope shows a to address, a from address and a port number that says which service should receive it. Inside is the message. A short note says packets travel by agreed rules, and unusual traffic can be a sign of an attack.",
    "\n".join([
        R(60, 36, 340, 150, "beg-zone", 10),
        T(80, 66, "To: 203.0.113.7  (where it is going)", "beg-ink", 12, "start", 700),
        T(80, 90, "From: 198.51.100.4  (where it came from)", "beg-ink", 12, "start"),
        T(80, 114, "Port: 443  (which service should get it)", "beg-ink", 12, "start"),
        '                <rect x="80" y="130" width="300" height="38" rx="6" class="beg-fill-raised beg-stroke-gold" stroke-width="1.5"/>',
        T(230, 154, "The message itself", "beg-ink", 13, weight=700),
        '                <g class="beg-fade-a">', T(500, 80, "Agreed rules", "beg-fill-gold", 14, weight=700), T(500, 100, "(protocols) tell devices", "beg-ink-soft", 12), T(500, 118, "how to send and receive", "beg-ink-soft", 12), '                </g>',
        '                <g class="beg-fade-b">', T(500, 150, "Odd volume or speed", "beg-fill-gold", 13, weight=700), T(500, 170, "can signal an attack", "beg-ink-soft", 12), '                </g>',
        T(20, 224, "Example addresses are reserved for documentation, not real devices.", "beg-ink-soft", 12, "start"),
    ]),
)

SVG_NETATTACK = _svg(
    "netattack",
    "Three common network attacks: flood, eavesdrop, impersonate",
    "Three cards. Flood: many requests overwhelm a server so real users cannot get through. Eavesdrop: someone watches or alters data as it passes. Impersonate: faking where data comes from to get past checks. A VPN, secure web addresses and encryption help.",
    "\n".join([
        '                <g class="beg-fade-a">', R(20, 40, 190, 138), T(115, 68, "Flood", "beg-fill-gold", 15, weight=700), T(115, 100, "Too many requests", "beg-ink", 12), T(115, 118, "overwhelm a server", "beg-ink", 12), T(115, 150, "Real users get locked out", "beg-ink-soft", 11), '                </g>',
        '                <g class="beg-fade-b">', R(225, 40, 190, 138), T(320, 68, "Eavesdrop", "beg-fill-gold", 15, weight=700), T(320, 100, "Watching or changing", "beg-ink", 12), T(320, 118, "data as it passes", "beg-ink", 12), T(320, 150, "Like reading your post", "beg-ink-soft", 11), '                </g>',
        '                <g class="beg-fade-c">', R(430, 40, 190, 138), T(525, 68, "Impersonate", "beg-fill-gold", 15, weight=700), T(525, 100, "Faking who a message", "beg-ink", 12), T(525, 118, "is really from", "beg-ink", 12), T(525, 150, "Gets past simple checks", "beg-ink-soft", 11), '                </g>',
        T(320, 206, "Defences: encrypt traffic, look for https, use a VPN on public Wi-Fi.", "beg-ink", 13, weight=700),
        T(320, 228, "Avoid unprotected public Wi-Fi where you can.", "beg-ink-soft", 12),
    ]),
)

SVG_ENCRYPT = _svg(
    "encrypt",
    "Encryption turns readable data into scrambled data and back again",
    "Readable text goes through a lock and becomes scrambled text. Only the right key turns it back. Below, a note that a one-way fingerprint called a hash shows whether a file has been changed.",
    "\n".join([
        R(20, 52, 160, 70, "beg-zone", 10), T(100, 80, "Readable", "beg-fill-gold", 13, weight=700), T(100, 104, "Meet at six", "beg-ink", 14),
        '                <g class="beg-fade-a">', T(230, 92, "lock", "beg-ink-soft", 12), '                <path d="M196 100 h68 m-10 -8 l10 8 -10 8" class="beg-stroke-gold" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>', '                </g>',
        R(280, 52, 160, 70, "beg-zone-hot", 10), T(360, 80, "Scrambled", "beg-fill-gold", 13, weight=700), T(360, 104, "q7#Xd2m@z!", "beg-ink", 14),
        '                <g class="beg-fade-c">', T(490, 92, "key", "beg-ink-soft", 12), '                <path d="M456 100 h68 m-10 -8 l10 8 -10 8" class="beg-stroke-gold" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>', '                </g>',
        R(536, 52, 90, 70, "beg-zone", 10), T(581, 80, "Readable", "beg-fill-gold", 12, weight=700), T(581, 104, "again", "beg-ink", 13),
        '                <g class="beg-fade-b">', T(320, 156, "A hash is a one-way fingerprint of a file.", "beg-ink", 13, weight=700), T(320, 178, "Change one character and the fingerprint changes, so you can tell it was altered.", "beg-ink-soft", 12), '                </g>',
        T(20, 224, "The key is what matters: lose it or let it be stolen and the lock stops protecting you.", "beg-ink-soft", 13, "start"),
    ]),
)

SVG_REPORT = _svg(
    "report",
    "Report small problems early",
    "A three-step flow. Something looks odd, such as an unapproved app on a work device. Tell the right person early. A small problem is dealt with before it becomes a data breach.",
    "\n".join([
        '                <g class="beg-fade-a">', R(20, 56, 170, 100), T(105, 90, "Something odd", "beg-fill-gold", 14, weight=700), T(105, 116, "An app nobody", "beg-ink", 12), T(105, 134, "approved", "beg-ink", 12), '                </g>',
        '                <path d="M196 106 h34 m-8 -8 l8 8 -8 8" class="beg-stroke-gold" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
        '                <g class="beg-fade-b">', R(235, 56, 170, 100), T(320, 90, "Tell someone", "beg-fill-gold", 14, weight=700), T(320, 116, "The right person,", "beg-ink", 12), T(320, 134, "as soon as you notice", "beg-ink", 12), '                </g>',
        '                <path d="M411 106 h34 m-8 -8 l8 8 -8 8" class="beg-stroke-gold" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
        '                <g class="beg-fade-c">', R(450, 56, 170, 100, "beg-zone-hot"), T(535, 90, "Fixed early", "beg-fill-gold", 14, weight=700), T(535, 116, "A small issue never", "beg-ink", 12), T(535, 134, "becomes a breach", "beg-ink", 12), '                </g>',
        T(20, 196, "No problem is too small to mention. Raising it costs little; staying quiet can cost a lot.", "beg-ink-soft", 13, "start"),
    ]),
)

SVG_DOMAINS = _svg(
    "domains",
    "Eight areas of security work, with security architecture highlighted",
    "Eight tiles in two rows: security and risk management, asset security, security architecture and engineering, communication and network security, identity and access management, assessment and testing, security operations, and software development security. Security architecture and engineering is highlighted because it leads to the next path.",
    "\n".join([
        R(14, 34, 148, 62, "beg-zone", 8), T(88, 60, "Security and", "beg-ink", 12, weight=700), T(88, 78, "risk management", "beg-ink", 12, weight=700),
        R(170, 34, 148, 62, "beg-zone", 8), T(244, 70, "Asset security", "beg-ink", 12, weight=700),
        R(326, 34, 148, 62, "beg-zone-hot", 8), T(400, 60, "Security architecture", "beg-fill-gold", 12, weight=700), T(400, 78, "and engineering", "beg-fill-gold", 12, weight=700),
        R(482, 34, 144, 62, "beg-zone", 8), T(554, 60, "Communication and", "beg-ink", 12, weight=700), T(554, 78, "network security", "beg-ink", 12, weight=700),
        R(14, 106, 148, 62, "beg-zone", 8), T(88, 132, "Identity and", "beg-ink", 12, weight=700), T(88, 150, "access management", "beg-ink", 12, weight=700),
        R(170, 106, 148, 62, "beg-zone", 8), T(244, 132, "Assessment", "beg-ink", 12, weight=700), T(244, 150, "and testing", "beg-ink", 12, weight=700),
        R(326, 106, 148, 62, "beg-zone", 8), T(400, 142, "Security operations", "beg-ink", 12, weight=700),
        R(482, 106, 144, 62, "beg-zone", 8), T(554, 132, "Software development", "beg-ink", 12, weight=700), T(554, 150, "security", "beg-ink", 12, weight=700),
        '                <circle class="beg-pulse-live beg-fill-gold" cx="400" cy="24" r="6"/>',
        T(20, 204, "The highlighted area is where the beginner security architecture path picks up.", "beg-ink", 13, "start", 700),
        T(20, 226, "You do not need to master every area. Notice which one interests you.", "beg-ink-soft", 12, "start"),
    ]),
)

SVG_ROLES = _svg(
    "roles",
    "Three entry-level security roles, and the skills you may already have",
    "Three cards: security analyst, who watches networks and researches trends; information security analyst, who plans and puts protections in place; and security operations centre analyst, who makes sure incidents are handled quickly using agreed procedures. A bar below lists skills many people already have.",
    "\n".join([
        '                <g class="beg-fade-a">', R(20, 36, 190, 112), T(115, 62, "Security analyst", "beg-fill-gold", 14, weight=700), T(115, 90, "Watches networks for", "beg-ink", 12), T(115, 108, "breaches and researches", "beg-ink", 12), T(115, 126, "new threats", "beg-ink", 12), '                </g>',
        '                <g class="beg-fade-b">', R(225, 36, 190, 112), T(320, 62, "Information security", "beg-fill-gold", 14, weight=700), T(320, 80, "analyst", "beg-fill-gold", 14, weight=700), T(320, 106, "Plans and puts", "beg-ink", 12), T(320, 124, "protections in place", "beg-ink", 12), '                </g>',
        '                <g class="beg-fade-c">', R(430, 36, 190, 112), T(525, 62, "Operations centre", "beg-fill-gold", 14, weight=700), T(525, 80, "analyst", "beg-fill-gold", 14, weight=700), T(525, 106, "Makes sure incidents", "beg-ink", 12), T(525, 124, "are handled quickly", "beg-ink", 12), '                </g>',
        R(20, 164, 600, 44, "beg-zone-hot", 8),
        T(320, 184, "Skills you may already have", "beg-fill-gold", 13, weight=700),
        T(320, 200, "attention to detail · working in a team · clear communication · solving problems", "beg-ink", 12),
        T(20, 232, "No security job history? That is normal. Start with what you can already do.", "beg-ink-soft", 12, "start"),
    ]),
)


# --------------------------------------------------------------------------------------
# Clip explainers: bullets in our own words (3-6), keyed by "<video id>@<start seconds>"
# --------------------------------------------------------------------------------------

CLIPS = {
    "_DVVNOGYtmU@616": {
        "title": "Cybersecurity for Beginners: What is cybersecurity?",
        "start": "10:16", "len": "about 7 minutes",
        "summary": "A plain definition of security, what a security team does for an organisation, and what an entry-level analyst does day to day. It is made for a US audience, so the job-market figures near the end are American; use the UK links below for your own plans.",
        "bullets": [
            "Security means protecting networks, devices, people and data from being accessed or misused by people who should not have access, so that information stays private, correct and available.",
            "A threat actor is any person or group that poses a risk. Threats can come from outside an organisation, or from inside, and inside threats are often accidents, such as someone clicking a bad link.",
            "A security team helps an organisation have fewer breaches, follow laws and standards, keep working after an incident, and keep the trust of the people it serves.",
            "An entry-level analyst watches the network and is usually first to respond when something is spotted, looks for weak points in the organisation&#39;s own systems, helps stop problems before they start, and checks records in security reviews.",
            "These jobs exist in small businesses, charities, large companies and government alike.",
        ],
        "svg": SVG_PROTECT,
        "caption": "Four things security protects: people, devices, networks and data. The ring around them stands for keeping information private, correct and available.",
    },
    "34BtwcL7Mkg@2139": {
        "title": "How To Manage Security Risks & Threats: The CIA triad",
        "start": "35:39", "len": "about 4 minutes",
        "summary": "A short, clear tour of the three ideas people use to think about any system, using a bank as the example.",
        "bullets": [
            "Confidentiality means only authorised people can see particular information, on a need-to-know basis.",
            "Integrity means the information is correct, genuine and can be relied on.",
            "Availability means the right people can reach the information when they need it. Locked-away data is no use to anyone.",
            "A bank shows all three at once: it keeps account details private, it spots unusual spending to check the real owner is behind it, and it keeps online banking reachable.",
            "Takeaway: when you hear about any security problem, ask which of the three it hurts.",
        ],
        "svg": SVG_CIA,
        "caption": "Three cards for confidentiality, integrity and availability, each shown through a bank account, with a plain question to ask under each.",
    },
    "_DVVNOGYtmU@1574": {
        "title": "Cybersecurity for Beginners: History of security",
        "start": "26:14", "len": "about 10 minutes",
        "summary": "A tour of early viruses, worms and scams, and why they still matter. It helps you see that today&#39;s attacks are usually variations of old ones.",
        "bullets": [
            "Many of today&#39;s attacks are variations of old ones. Looking back at the 1980s and 1990s explains why there are so many security jobs now.",
            "A virus attaches itself to programs or documents and spreads; a worm spreads on its own. Today the general word for both is malware: software designed to harm devices or networks.",
            "Two early cases: a 1986 virus meant to track copied software, which spread round the world on shared disks, and a 1988 worm released while measuring the size of the internet, which kept reinstalling itself until computers crashed. Neither was meant to do that much harm.",
            "A later email worm called LoveLetter looked like a message from a friend, mailed itself to everyone in the address book and infected tens of millions of computers. It is described as the first example of social engineering: tricking people rather than breaking machines.",
            "A 2017 breach at a US credit-reporting company exposed the records of well over a hundred million people, partly because known weaknesses had not been fixed. The large settlement showed businesses that prevention is cheaper than the clean-up.",
        ],
        "svg": SVG_HISTORY,
        "caption": "A timeline of four attacks: a 1986 virus, a 1988 worm, a later email trick and a 2017 data breach. The point is that many new attacks are old ideas with a twist.",
    },
    "34BtwcL7Mkg@835": {
        "title": "How To Manage Security Risks & Threats: Navigate threats, risks and vulnerabilities",
        "start": "13:55", "len": "about 14 minutes",
        "summary": "Defines four words you will hear constantly, then shows what an attack costs an organisation and ends with a risk-management cycle used by professionals.",
        "bullets": [
            "An asset is anything of value, from buildings and laptops to customer details. A threat is anything that could harm an asset, such as a phishing email. A vulnerability is a weakness a threat can use, such as out-of-date software or a weak password. A risk is how likely and how bad the harm could be.",
            "Both a threat and a weakness have to be present for there to be a risk. People can be a weakness too, which is why teaching people to spot a phishing email is a good start.",
            "Risk is often rated low, medium or high, depending on the value of the asset. Public website content is low; information protected by law or containing personal details is high.",
            "Ransomware locks an organisation&#39;s data until it pays for the key. The clip also explains the surface, deep and dark layers of the web, and the three costs of an attack: money, identity theft and damage to reputation.",
            "It ends with a seven-step risk cycle from a US standards body: prepare, categorise, select, implement, assess, authorise and monitor. Treat it as a glimpse of how professionals work, not something to memorise.",
        ],
        "svg": SVG_RISK,
        "caption": "A threat plus a weakness gives a risk. The picture reminds you that fixing the weakness, or blocking the threat, makes the risk smaller.",
    },
    "Rgl7C0P6NsE@2678": {
        "title": "Cybersecurity Assets, Network Threats & Vulnerabilities: Authentication, authorisation and accounting",
        "start": "44:38", "len": "about 12 minutes",
        "summary": "How systems decide who you are and what you may do. Some of the later material (sign-in standards and tokens) is technical, so it is fine to stop once the three kinds of proof make sense.",
        "bullets": [
            "Access control answers three questions: who are you (authentication), what are you allowed to do (authorisation), and what did you do (accounting, covered in the next video).",
            "There are three kinds of proof: something you know, such as a password; something you have, such as a one-time code sent to your phone; and something you are, such as a fingerprint or face.",
            "Single sign-on lets one login open many services. It is convenient, but risky if it relies on one proof only. Adding a second kind of proof, called multi-factor authentication, makes it far safer.",
            "Authorisation should give people only the access their role needs, and only for as long as it is needed. Splitting jobs between people stops one person from both doing and approving the same thing.",
            "Sign-in methods that send passwords openly are weak; modern sites use secure web connections, and &quot;sign in with&quot; buttons share limited access rather than your password. Keep extra checks switched on for those accounts.",
        ],
        "svg": SVG_FACTORS,
        "caption": "Three cards for something you know, something you have and something you are. Two or more together is multi-factor authentication, which is much harder to defeat.",
    },
    "NIRXtMg-0z8@3352": {
        "title": "Internet Networks & Network Security: OS hardening",
        "start": "55:52", "len": "about 4 minutes",
        "summary": "A short, practical clip on making a computer&#39;s operating system harder to attack. The same habits apply to your own laptop or phone.",
        "bullets": [
            "Hardening means making a device or system tougher to attack, through routine jobs and one-off settings.",
            "Install security updates (patches) as soon as they are released. Once a fix is public, attackers know exactly where the hole is on every device that has not been updated yet.",
            "Keep a record of how a system should be set up, so that unexpected changes stand out.",
            "Remove software you no longer use, and wipe old equipment properly before it is thrown away or passed on.",
            "Use rules for passwords, such as a minimum length and a lock-out after repeated wrong tries, and add a second check wherever possible.",
        ],
        "svg": SVG_HARDEN,
        "caption": "Five habits that make a device harder to attack: update, know the normal set-up, remove what you do not use, wipe old kit, and use a strong sign-in with a second check.",
    },
    "Rgl7C0P6NsE@5790": {
        "title": "Cybersecurity Assets, Network Threats & Vulnerabilities: Malware",
        "start": "1:36:30", "len": "about 8 minutes",
        "summary": "What malware is, the five kinds you will hear about most, and the warning signs of one newer kind that quietly uses your computer&#39;s power.",
        "bullets": [
            "Malware is software designed to harm devices or networks. It can spread through infected USB drives, phishing emails or the internet, and can let attackers take control without you knowing.",
            "Five common kinds: a virus needs a person to open the infected file; a worm spreads across a network by itself; a trojan pretends to be a useful file or app; ransomware locks your data and demands payment; spyware secretly collects things like logins and PINs.",
            "A newer kind, cryptojacking, secretly uses your computer&#39;s power to make cryptocurrency. Warning signs include slowness, heavy processor use, sudden crashes and a battery that drains fast.",
            "Defences include clicking links only from sources you trust, using protective software and blockers, and staying informed. Detection tools help, but brand-new malware can slip past them.",
        ],
        "svg": SVG_MALWARE,
        "caption": "Five cards in turn: virus, worm, trojan, ransomware and spyware, each with one plain sentence, and the usual warning signs underneath.",
    },
    "Rgl7C0P6NsE@5163": {
        "title": "Cybersecurity Assets, Network Threats & Vulnerabilities: Social engineering and phishing",
        "start": "1:26:03", "len": "about 10 minutes",
        "summary": "How attackers use manipulation instead of clever code, and the most common form, phishing. The final section on mail filters is aimed at organisations; the rest is useful for everyone.",
        "bullets": [
            "Social engineering is manipulation that gets people to break normal security rules on an attacker&#39;s behalf. It can happen online, in person or by phone, and can take seconds or months.",
            "Typical stages: prepare by researching the target, build trust by pretending to be someone else, persuade the person to hand over information, then disappear.",
            "Phishing is the most common form. A phishing kit can include infected attachments, fake forms that ask for sensitive details, and links to look-alike websites.",
            "Smishing is the same trick by text message, and vishing is by phone, for example a caller claiming there is a problem with your account.",
            "Defences include clear rules, training, mail filters, and above all sharing what you learn so that other people recognise the signs. Attackers rely on curiosity and a wish to help.",
        ],
        "svg": SVG_SOCIAL,
        "caption": "A scam message with three warning labels that appear in turn: pressure to act now, an unexpected form or attachment, and a look-alike web address.",
    },
    "NIRXtMg-0z8@499": {
        "title": "Internet Networks & Network Security: Network communication",
        "start": "8:19", "len": "about 9 minutes",
        "summary": "How information moves between devices, using letters and street addresses as the comparison. Some of the layer names are technical, so feel free to skim those.",
        "bullets": [
            "Information travels in small units called packets. Like a letter, each one has a destination address, a return address and the message itself.",
            "Devices follow agreed sets of rules, called protocols. The main set splits the job into four layers, from the physical connection up to everyday services such as email and file transfer.",
            "Ports work like flat numbers in a building: they tell the receiving device which service should get the data, for example email or secure web browsing.",
            "An IP address says where a device is on the internet. A public address is assigned by your provider and shared by every device in one home or office; private addresses are only visible inside the local network. A device&#39;s MAC address identifies the hardware itself and helps a switch deliver packets.",
            "Security staff watch how fast and how much data flows, because odd patterns can be a sign of an attack.",
        ],
        "svg": SVG_PACKET,
        "caption": "A packet drawn as a letter: where it is going, where it came from, a port number for the right service, and the message inside.",
    },
    "NIRXtMg-0z8@2242": {
        "title": "Internet Networks & Network Security: Network attack tactics",
        "start": "37:22", "len": "about 14 minutes",
        "summary": "Why networks are attacked and the three main families of attack. The technical names (SYN, ICMP) are fine to skip: the ideas are flooding, eavesdropping and impersonating.",
        "bullets": [
            "Attacks can leak information, disrupt services, damage reputation and cost time and money. A 2014 breach at a US retail chain exposed card details of tens of millions of customers.",
            "A denial-of-service attack floods a network or server so real users cannot get through. A distributed version uses many devices at once, and variants overwhelm a server with half-open connections, status requests or one oversized request.",
            "Packet sniffing is watching data as it passes, like someone reading your post. An active version also changes the data, such as swapping a bank account number.",
            "Protections against sniffing include a VPN, checking that sites start with https, and avoiding unprotected public Wi-Fi such as in cafés and airports.",
            "Spoofing means faking where data comes from to get past checks. It includes sitting in the middle of a connection, replaying a captured message later, and floods that use a stolen address. Encryption is the main defence.",
        ],
        "svg": SVG_NETATTACK,
        "caption": "Three cards in turn: flood, eavesdrop and impersonate, with the main defences underneath: encrypt traffic, look for https and use a VPN on public Wi-Fi.",
    },
    "Rgl7C0P6NsE@1925": {
        "title": "Cybersecurity Assets, Network Threats & Vulnerabilities: Encryption methods",
        "start": "32:05", "len": "about 13 minutes",
        "summary": "What personal data is and the main tool for keeping it private. The later parts are technical; the first few minutes and the lock-and-key comparisons are the best place to stop if it gets heavy.",
        "bullets": [
            "Personally identifiable information (PII) is anything that can point to a person, such as a name, medical or financial details, photos, emails or fingerprints. Keeping it private online is hard and takes the right controls.",
            "Encryption scrambles readable information into unreadable text and decryption turns it back using a key. An ancient letter-shifting trick shows the idea, and also why one easily guessed or stolen key is a weakness.",
            "Modern systems use two kinds. With asymmetric encryption there is a public key anyone can use to lock something and a private key only the owner has to unlock it, like a letter box with a slot. Symmetric encryption uses one shared secret key and is faster. Chat apps often use the first to start a conversation and the second to carry on.",
            "Digital certificates, issued by trusted organisations, act like online ID badges that show a website is who it says it is.",
            "Hashing makes a one-way fingerprint of a file. Any change gives a different fingerprint, which is how people check a file has not been altered.",
        ],
        "svg": SVG_ENCRYPT,
        "caption": "Readable text goes through a lock and becomes scrambled, and only the right key turns it back. A hash is a one-way fingerprint that shows whether a file has changed.",
    },
    "3EgYr7jR4NI@386": {
        "title": "How To Prepare For Your Cybersecurity Career: Your impact on data protection",
        "start": "6:26", "len": "about 3 minutes",
        "summary": "A short reminder that protecting data is a team effort and that speaking up early is part of the job. Useful for anyone who handles other people&#39;s information at work.",
        "bullets": [
            "Protecting data is a team effort: some people focus on financial data, some on usernames and passwords, some on supplier security and some on staff personal details.",
            "Customers trust organisations to protect card numbers, emails, usernames and passwords, so understanding how important the data is is part of having a security mindset.",
            "An event that leads to a data breach is an incident; one that is resolved before any breach is not. Either way it is better to be careful and report than to assume it is fine.",
            "Small things matter too: someone installing an unapproved app on a work device should be raised, because some apps contain weaknesses. No issue is too small to mention.",
        ],
        "svg": SVG_REPORT,
        "caption": "Three steps: notice something odd, tell the right person early, and a small problem is fixed before it becomes a breach.",
    },
    "_DVVNOGYtmU@2200": {
        "title": "Cybersecurity for Beginners: Eight security domains",
        "start": "36:40", "len": "about 8 minutes",
        "summary": "A map of the kinds of work in security, grouped into eight areas defined by a professional certification body. Handy for spotting which area you might enjoy.",
        "bullets": [
            "Professionals group their work into eight areas: security and risk management, asset security, security architecture and engineering, communication and network security, identity and access management, assessment and testing, security operations, and software development security.",
            "Each comes with an everyday example: updating policies when a law changes, safely disposing of old equipment, setting up a firewall, writing a network policy, issuing keycards, auditing who can see payroll, responding when an unknown device appears, and advising app teams on password rules.",
            "The areas are linked, and a gap in one can harm the whole organisation.",
            "You do not need to master them all. Noticing which one appeals to you can help steer what you learn next. Security architecture and engineering is the area our beginner architecture path picks up.",
        ],
        "svg": SVG_DOMAINS,
        "caption": "Eight tiles for the areas of security work. The highlighted tile, security architecture and engineering, is where the next beginner path starts.",
    },
    "3EgYr7jR4NI@3323": {
        "title": "How To Prepare For Your Cybersecurity Career: Find and prepare for a job in cybersecurity",
        "start": "55:23", "len": "about 10 minutes",
        "summary": "Three entry-level roles and how to start looking. It is written for the US job market, so the job sites and statistics it names are American; the UK links below are the ones to use.",
        "bullets": [
            "A security analyst usually monitors networks for breaches, helps plan how to secure an organisation and keeps up with new threats.",
            "An information security analyst focuses on creating plans and putting protections in place. A security operations centre analyst makes sure incidents are handled quickly and consistently, following agreed procedures.",
            "Research the organisation and the role before you apply, and use job sites to see which skills employers ask for.",
            "No security experience is fine. List what you have learned, and the skills you already have that carry over, such as attention to detail, teamwork and clear communication.",
        ],
        "svg": SVG_ROLES,
        "caption": "Three entry-level roles in turn, with a reminder underneath that skills from other jobs carry over.",
    },
}
