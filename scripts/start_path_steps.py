"""Per-step page content for /start/: top animation, reading, official links, check question.

See start_path_content.py for the research notes. Official links were each opened on
26 Nov 2026 and returned the expected page. All copy is in our own words.
"""
from start_path_content import _svg, T, R

NCSC = "https://www.ncsc.gov.uk"
TIPS = NCSC + "/collection/top-tips-for-staying-secure-online"
PHISH = NCSC + "/collection/phishing-scams"


def anim_svg(body, vb="0 0 640 240"):
    return f'              <svg viewBox="{vb}" focusable="false">\n{body}\n              </svg>'


def _chain(y, xs, labels, size=12):
    out = [f'                <line x1="{xs[0]}" y1="{y}" x2="{xs[-1]}" y2="{y}" class="beg-stroke-line" stroke-width="2"/>']
    for x, lab in zip(xs, labels):
        out.append(f'                <circle cx="{x}" cy="{y}" r="22" class="beg-fill-raised beg-stroke-gold" stroke-width="2"/>')
        out.append(T(x, y + 4, lab, "beg-ink", size))
    return "\n".join(out)


# ---- Step animations -------------------------------------------------------------------
ANIM = {}
CAP = {}

# 1: a storm hits a house; a leak shows up and is patched.
ANIM[1] = anim_svg("\n".join([
    T(20, 28, "Prepare, spot the leak, patch it fast", "beg-ink", 16, "start", 700),
    '                <path d="M250 150 L320 92 L390 150 Z" class="beg-fill-raised beg-stroke-gold" stroke-width="2"/>',
    '                <rect x="268" y="150" width="104" height="58" class="beg-fill-raised beg-stroke-gold" stroke-width="2"/>',
    '                <rect x="304" y="170" width="32" height="38" class="beg-zone-hot"/>',
    '                <circle class="beg-token beg-fill-gold" cx="70" cy="100" r="7"/>',
    '                <path class="beg-crack beg-stroke-gold" d="M356 156 l8 10 -6 8 10 10" stroke-width="3" stroke-linecap="round" fill="none"/>',
    '                <g class="beg-shield">',
    '                  <path class="beg-fill-gold" d="M320 40 l18 7 v16 c0 11 -8 18 -18 22 c-10 -4 -18 -11 -18 -22 V47 z"/>',
    T(320, 70, "OK", "beg-fill-field", 10, weight=700),
    '                </g>',
    T(70, 130, "Threat", "beg-ink-soft", 12),
    T(560, 130, "Your home", "beg-ink-soft", 12),
    T(560, 148, "(your data)", "beg-ink-soft", 12),
    T(20, 228, "Security is preparing before the storm, noticing damage quickly, and fixing it.", "beg-ink-soft", 13, "start"),
]))
CAP[1] = "A small picture of a house in a storm. A threat approaches, a crack appears, and a shield settles over it. The idea is to prepare, notice problems quickly and fix them fast."

# 2: attacker moves through three easy gates.
ANIM[2] = anim_svg("\n".join([
    T(20, 28, "Attackers look for the easiest way in", "beg-ink", 16, "start", 700),
    '                <line x1="70" y1="120" x2="590" y2="120" class="beg-stroke-line" stroke-width="2"/>',
    '                <g font-size="12" text-anchor="middle">',
    '                  <circle cx="70" cy="120" r="22" class="beg-fill-raised beg-stroke-gold" stroke-width="2"/>', T(70, 124, "Attacker", "beg-ink", 11),
    '                  <circle cx="200" cy="120" r="22" class="beg-fill-raised beg-stroke-gold" stroke-width="2"/>', T(200, 124, "Gate 1", "beg-ink", 11),
    '                  <circle cx="330" cy="120" r="22" class="beg-fill-raised beg-stroke-gold" stroke-width="2"/>', T(330, 124, "Gate 2", "beg-ink", 11),
    '                  <circle cx="460" cy="120" r="22" class="beg-fill-raised beg-stroke-gold" stroke-width="2"/>', T(460, 124, "Gate 3", "beg-ink", 11),
    '                  <circle cx="590" cy="120" r="22" class="beg-fill-raised beg-stroke-gold" stroke-width="2"/>', T(590, 124, "Target", "beg-ink", 11),
    '                </g>',
    T(200, 168, "Reused password", "beg-ink-soft", 11), T(330, 168, "Old software", "beg-ink-soft", 11), T(460, 168, "Tempting link", "beg-ink-soft", 11),
    '                <line x1="70" y1="194" x2="590" y2="194" class="beg-stroke-line" stroke-width="2"/>',
    '                <circle class="beg-token beg-fill-gold" cx="70" cy="194" r="7"/>',
    '                <path class="beg-crack beg-stroke-gold" d="M320 96 l8 10 -6 8 10 10" stroke-width="3" stroke-linecap="round" fill="none"/>',
    '                <g class="beg-shield">',
    '                  <path class="beg-fill-gold" d="M330 52 l16 6 v14 c0 10 -7 16 -16 20 c-9 -4 -16 -10 -16 -20 V58 z"/>',
    T(330, 76, "Fixed", "beg-fill-field", 8, weight=700),
    '                </g>',
    T(20, 220, "Fix the easy gates first and most attacks have nowhere to go.", "beg-ink-soft", 13, "start"),
]))
CAP[2] = "A marker travels from an attacker towards a target past three easy gates: a reused password, old software and a tempting link. A crack appears at one gate and a shield closes it. Fixing the easy gates stops most attacks."

# 3: login passes four gates.
ANIM[3] = anim_svg("\n".join([
    T(20, 28, "Signing in with more than a password", "beg-ink", 16, "start", 700),
    '                <line x1="50" y1="200" x2="590" y2="200" class="beg-stroke-line" stroke-width="2"/>',
    '                <g font-size="12" text-anchor="middle">',
    R(40, 88, 100, 84, "beg-zone", 8), T(90, 124, "1 Password", "beg-ink", 12, weight=700), T(90, 146, "Something you know", "beg-ink-soft", 10),
    R(190, 88, 120, 84, "beg-zone", 8), T(250, 124, "2 Second check", "beg-ink", 12, weight=700), T(250, 146, "Code on your phone", "beg-ink-soft", 10),
    R(350, 88, 120, 84, "beg-zone", 8), T(410, 124, "3 Allowed?", "beg-ink", 12, weight=700), T(410, 146, "Only what you need", "beg-ink-soft", 10),
    R(510, 88, 100, 84, "beg-zone-hot", 8), T(560, 124, "Signed in", "beg-ink", 12, weight=700), T(560, 146, "Welcome", "beg-ink-soft", 10),
    '                </g>',
    '                <circle class="beg-token-iam beg-fill-gold" cx="90" cy="200" r="8"/>',
    T(20, 228, "A password on its own is one lock. A second check adds another that a thief rarely has.", "beg-ink-soft", 13, "start"),
]))
CAP[3] = "A sign-in moves through a password, a second check such as a code on your phone, and a check on what you are allowed to do, before you are signed in. One stolen password is no longer enough."

# 4: three notes cycle: update waiting, installing, protected, with tick.
ANIM[4] = anim_svg("\n".join([
    T(20, 28, "Updates close the door that attackers know about", "beg-ink", 16, "start", 700),
    '                <g class="beg-sticky-1">', R(30, 70, 180, 90, "beg-fill-raised beg-stroke-gold", 8), T(120, 102, "Update available", "beg-ink", 13, weight=700), T(120, 126, "A fix for a known hole", "beg-ink-soft", 11), T(120, 144, "has been released", "beg-ink-soft", 11), '                </g>',
    '                <path d="M216 115 h22 m-7 -7 l7 7 -7 7" class="beg-stroke-gold" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    '                <g class="beg-sticky-2">', R(246, 70, 180, 90, "beg-fill-raised beg-stroke-gold", 8), T(336, 102, "Install it now", "beg-ink", 13, weight=700), T(336, 126, "Or switch on", "beg-ink-soft", 11), T(336, 144, "automatic updates", "beg-ink-soft", 11), '                </g>',
    '                <path d="M432 115 h22 m-7 -7 l7 7 -7 7" class="beg-stroke-gold" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    '                <g class="beg-sticky-3">', R(462, 70, 150, 90, "beg-zone-hot", 8), T(537, 102, "Protected", "beg-ink", 13, weight=700), T(537, 126, "The hole is closed", "beg-ink-soft", 11), T(537, 144, "on your device", "beg-ink-soft", 11), '                </g>',
    '                <g class="beg-tick">', '                  <circle cx="590" cy="64" r="14" class="beg-fill-gold"/>', '                  <path class="beg-stroke-field" d="M583 64 l5 5 10 -12" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>', '                </g>',
    T(20, 210, "Once a fix is public, anyone who has not installed it is easy to find.", "beg-ink-soft", 13, "start"),
]))
CAP[4] = "Three notes light up in order: an update is available, install it or switch on automatic updates, and the hole is closed. A tick appears at the end."

# 5: stop, check, report cards.
ANIM[5] = anim_svg("\n".join([
    T(20, 28, "Stop, check, report", "beg-ink", 16, "start", 700),
    '                <g class="beg-fade-a">', R(24, 56, 184, 124), T(116, 86, "1 Stop", "beg-fill-gold", 16, weight=700), T(116, 120, "Do not click or reply.", "beg-ink", 12), T(116, 138, "Slow down.", "beg-ink", 12), T(116, 160, "Scammers want you rushed.", "beg-ink-soft", 11), '                </g>',
    '                <g class="beg-fade-b">', R(228, 56, 184, 124), T(320, 86, "2 Check", "beg-fill-gold", 16, weight=700), T(320, 120, "Contact the organisation", "beg-ink", 12), T(320, 138, "using details you trust.", "beg-ink", 12), T(320, 160, "Not the ones in the message.", "beg-ink-soft", 11), '                </g>',
    '                <g class="beg-fade-c">', R(432, 56, 184, 124, "beg-zone-hot"), T(524, 86, "3 Report", "beg-fill-gold", 16, weight=700), T(524, 120, "Forward scam emails", "beg-ink", 12), T(524, 138, "and texts to the NCSC", "beg-ink", 12), T(524, 160, "and your phone provider.", "beg-ink-soft", 11), '                </g>',
    T(20, 220, "Even experts get fooled sometimes. Pausing is the most powerful habit.", "beg-ink-soft", 13, "start"),
]))
CAP[5] = "Three cards light up in turn: stop, check using details you trust, and report. Pausing before you act is the most powerful habit."

# 6: packet journey across five hops.
ANIM[6] = anim_svg("\n".join([
    T(20, 28, "How a web page request travels", "beg-ink", 16, "start", 700),
    _chain(120, [70, 200, 330, 460, 590], ["Phone", "Router", "Provider", "Internet", "Website"], 10),
    '                <line x1="70" y1="194" x2="590" y2="194" class="beg-stroke-line" stroke-width="2"/>',
    '                <circle class="beg-token beg-fill-gold" cx="70" cy="194" r="7"/>',
    T(200, 170, "Your router", "beg-ink-soft", 11), T(330, 170, "Shares one public", "beg-ink-soft", 11), T(330, 186, "address for the home", "beg-ink-soft", 11), T(460, 170, "Hop by hop,", "beg-ink-soft", 11), T(460, 186, "in small packets", "beg-ink-soft", 11),
    T(20, 220, "Anyone along the way could look, so use https and treat public Wi-Fi with care.", "beg-ink-soft", 13, "start"),
]))
CAP[6] = "A marker stands for a packet of data. It moves from a phone through the home router, the internet provider and the wider internet to a website. A note says that anyone along the way could look, so encryption matters."

# 7: data moves through locked zones.
ANIM[7] = anim_svg("\n".join([
    T(20, 28, "Personal data, locked on its journey", "beg-ink", 16, "start", 700),
    '                <g font-size="13" text-anchor="middle">',
    R(20, 56, 140, 130, "beg-zone", 8), T(90, 88, "You", "beg-ink", 13, weight=700), T(90, 110, "Name, card number", "beg-ink-soft", 11),
    R(180, 56, 140, 130, "beg-zone", 8), T(250, 88, "In transit", "beg-ink", 13, weight=700), T(250, 110, "Scrambled (https)", "beg-ink-soft", 11),
    R(340, 56, 140, 130, "beg-zone", 8), T(410, 88, "The service", "beg-ink", 13, weight=700), T(410, 110, "Only what it needs", "beg-ink-soft", 11),
    R(500, 56, 120, 130, "beg-zone-hot", 8), T(560, 88, "Stored", "beg-ink", 13, weight=700), T(560, 110, "Encrypted, backed up", "beg-ink-soft", 10),
    '                </g>',
    '                <rect x="152" y="86" width="16" height="70" rx="2" class="beg-fill-gold"/>',
    '                <rect x="312" y="86" width="16" height="70" rx="2" class="beg-fill-gold"/>',
    '                <rect x="472" y="86" width="16" height="70" rx="2" class="beg-fill-gold"/>',
    '                <g class="beg-token-net">', '                  <rect x="62" y="148" width="56" height="22" rx="6" class="beg-fill-gold"/>', T(90, 163, "data", "beg-fill-field", 11, weight=700), '                </g>',
    T(20, 220, "The gold bars are protections between each stage. Share only what is needed.", "beg-ink-soft", 13, "start"),
]))
CAP[7] = "A chip labelled data moves from you, through an encrypted connection, into a service and then into storage. Gold bars between each stage stand for protections. The habit is to share only what is needed."

# 8: five stones along the journey.
ANIM[8] = anim_svg("\n".join([
    T(20, 28, "Your journey so far, and the next stones", "beg-ink", 16, "start", 700),
    '                <line x1="60" y1="200" x2="580" y2="200" class="beg-stroke-line" stroke-width="2"/>',
    '                <g font-size="11" text-anchor="middle">',
    R(20, 88, 96, 84, "beg-phase-hi-1", 8), T(68, 116, "1 The basics", "beg-ink", 11, weight=700), T(68, 136, "This path", "beg-ink-soft", 11),
    R(138, 88, 96, 84, "beg-phase-hi-2", 8), T(186, 116, "2 Practise", "beg-ink", 11, weight=700), T(186, 136, "Safe habits", "beg-ink-soft", 11),
    R(256, 88, 96, 84, "beg-phase-hi-3", 8), T(304, 116, "3 Explore", "beg-ink", 11, weight=700), T(304, 136, "Roles and skills", "beg-ink-soft", 10),
    R(374, 88, 96, 84, "beg-phase-hi-4", 8), T(422, 112, "4 Architecture", "beg-ink", 11, weight=700), T(422, 132, "Next beginner", "beg-ink-soft", 10), T(422, 146, "path", "beg-ink-soft", 10),
    R(492, 88, 108, 84, "beg-phase-hi-5", 8), T(546, 116, "5 Keep going", "beg-ink", 11, weight=700), T(546, 136, "One step at a time", "beg-ink-soft", 10),
    '                </g>',
    '                <circle class="beg-phase-dot beg-fill-gold" cx="68" cy="200" r="8"/>',
    T(20, 228, "Nobody learns it all at once. Come back to any step whenever you like.", "beg-ink-soft", 13, "start"),
]))
CAP[8] = "Five stones along a path light up in turn: the basics, practising safe habits, exploring roles, the beginner security architecture path, and carrying on one step at a time."

# ---- Step content ----------------------------------------------------------------------
S = {}

S[1] = {
    "intro": [
        "Cyber security is the practice of protecting the devices, accounts, networks and information we all rely on, from people who should not have access to them and from honest accidents too. The UK&#39;s National Cyber Security Centre (NCSC) describes its core job as helping people and organisations reduce the risk and impact of cyber attacks.",
        "You do not need to be technical to start. Nearly everything in security comes back to four questions: what are we protecting, who might want to get at it, how could they, and what is the simplest thing that would stop them? The rest of this path builds those questions up one step at a time.",
        "Three ideas turn up everywhere. <strong>Confidentiality</strong> means only the right people can see something. <strong>Integrity</strong> means it is correct and has not been quietly changed. <strong>Availability</strong> means the right people can get to it when they need it. If you remember nothing else from this step, remember those three words.",
    ],
    "try": ["Think of one account you use every day, such as email. Who should be able to see it? How would you notice if something had been changed? What would happen if you could not get in for a week? Those are the three ideas, applied to your own life."],
    "clips": ["_DVVNOGYtmU@616", "34BtwcL7Mkg@2139"],
    "gov_intro": "These official pages explain what cyber security is and where an ordinary person should start.",
    "gov": [
        (NCSC + "/section/about-ncsc/what-is-cyber-security", "NCSC: What is cyber security?",
         "The NCSC&#39;s plain explanation of what cyber security is for, and why it matters to people, to organisations and to the services the country relies on."),
        (TIPS, "NCSC: Top tips for staying secure online",
         "Short, practical actions anyone can take: a strong and separate email password, 2-step verification, software updates, backups and password managers. This is where the old Cyber Aware web address now leads."),
        (NCSC + "/section/advice-guidance/you-your-family", "NCSC: Cyber security advice for you and your family",
         "A starting point for people at home, gathering the NCSC&#39;s advice on protecting your devices and accounts and on what to do if something goes wrong."),
    ],
    "check": ("A friend says: &quot;Nobody would bother attacking me. I have nothing worth stealing.&quot; Using what you have just learned, how could you reply?",
              "Most attacks are not aimed at one person. They are sent to huge numbers of people in the hope that some will fall for them. Your email account, photos, contacts and identity are all valuable to a criminal, and a hacked account can be used to trick the people you know. Confidentiality, integrity and availability are exactly what you would lose."),
}

S[2] = {
    "intro": [
        "People who cause harm online are called threat actors. They range from criminals after money, to people who want to disrupt a service, to staff or suppliers who simply make a mistake. Mistakes matter as much as malice: the first video explains that many &quot;inside&quot; threats are accidents.",
        "A handy way to keep four words straight. An <strong>asset</strong> is something that matters to you. A <strong>threat</strong> is something that could harm it. A <strong>vulnerability</strong> is a weakness a threat could use. A <strong>risk</strong> is how likely, and how bad, the harm would be. You only have a risk where a threat and a weakness meet.",
        "Most attacks are not clever. The NCSC&#39;s Cyber Essentials pages describe most attacks as basic, the digital equivalent of a thief trying your front door to see whether it is unlocked. That is good news: basic protections stop most of them.",
    ],
    "try": ["Pick one thing you own online. Write down one threat, one weakness and the risk where they meet, then the cheapest fix. Example: threat, a scam email; weakness, the same password on several sites; risk, a stranger gets into your email; fix, a separate strong password for your email."],
    "clips": ["_DVVNOGYtmU@1574", "34BtwcL7Mkg@835"],
    "gov_intro": "Official UK sources show how common attacks are, how basic most of them are, and what a minimum level of protection looks like.",
    "gov": [
        (NCSC + "/cyberessentials/overview", "NCSC: Cyber Essentials",
         "The government-backed minimum standard for organisations. It explains that most attacks are basic, and lists five technical controls that stop the most common ones."),
        ("https://www.gov.uk/government/collections/cyber-security-breaches-survey", "GOV.UK: Cyber security breaches survey",
         "The government&#39;s yearly survey of UK businesses and charities about the cyber problems they meet. The latest listed was published in April 2026. Useful for seeing how common attacks really are."),
        (NCSC + "/section/advice-guidance/all-topics/cyber-attack", "NCSC: Cyber attack",
         "A topic page that gathers the NCSC&#39;s guidance on cyber attacks in one place."),
        (NCSC + "/ransomware/home", "NCSC: What you need to know about ransomware",
         "What ransomware is, how to recognise it, and how to respond if you are a victim."),
    ],
    "check": ("A shop&#39;s till system runs old software with a known flaw, and a gang is scanning the internet for exactly that flaw. Which part is the threat, which is the vulnerability, and what is the risk?",
              "The threat is the gang scanning for the flaw. The vulnerability is the old software with a known flaw. The risk is the chance, and the harm, of the gang getting into the till system and the customer details behind it. The cheapest fix is to install the update."),
}

S[3] = {
    "intro": [
        "Most of the time a website checks who you are with a password. The trouble is that passwords get guessed, reused and stolen. The answer is to use more than one kind of proof: something you know, something you have and something you are.",
        "The NCSC&#39;s advice is simple. Your email account is the key to all your others, because password resets are sent there, so give it a strong password that you use nowhere else. Make passwords long rather than complicated: joining three random words is a good method. Use a password manager so you do not have to remember them all. And turn on 2-step verification (also called two-factor or multi-factor authentication) for your important accounts.",
        "Passkeys are a newer way to sign in that replace the password with something stored on your device. The NCSC has a topic page on them in the box below.",
    ],
    "try": ["Open your email account&#39;s security settings. Check that its password is not used anywhere else, and look for 2-step verification. If it is off, switch it on. It takes about five minutes."],
    "clips": ["Rgl7C0P6NsE@2678"],
    "gov_intro": "UK official advice on passwords and accounts is short and practical. These pages are written for people at home.",
    "gov": [
        (TIPS + "/use-a-strong-and-separate-password-for-email", "NCSC: Use a strong and separate password for your email",
         "Why your email password needs special care: if criminals get into your email, they can reset the passwords on your other accounts."),
        (TIPS + "/three-random-words", "NCSC: Three random words",
         "How joining three random words gives a password that is strong enough and still easy to remember, and what to avoid, such as family names and important dates."),
        (TIPS + "/password-managers", "NCSC: Managing your passwords",
         "How a password manager can create and remember strong passwords for you."),
        (TIPS + "/activate-2-step-verification-on-your-email", "NCSC: Turn on 2-step verification (2SV)",
         "How 2-step verification keeps criminals out of your accounts even if they know your password, and why to switch it on for email, banking, social media and shopping."),
        (NCSC + "/section/advice-guidance/all-topics/passkeys", "NCSC: Passkeys",
         "A topic page about passkeys, a newer way of signing in that does not rely on a typed password."),
        (NCSC + "/section/respond-recover/hacked-accounts", "NCSC: Hacked accounts",
         "What to do if you cannot get into an account or see activity you do not recognise."),
    ],
    "check": ("Why does the NCSC ask you to give your email account a password you use nowhere else, even before your other accounts?",
              "Because password reset links are sent to your email. Anyone who controls your email can reset the passwords on your other accounts, so it is the key to all of them. A separate, strong password, plus 2-step verification, protects that key."),
}

S[4] = {
    "intro": [
        "Software has mistakes, and some mistakes let attackers in. When the maker finds one, they release an update. The moment a fix is public, attackers know where the weakness is on every device that has not applied it. That is why the NCSC describes installing updates as one of the most important, and quickest, things you can do to stay safe online.",
        "Turn on automatic updates where you can. Check that your devices are still supported, because older devices eventually stop receiving updates. Delete apps and programs you no longer use, and wipe old devices properly before you sell or recycle them.",
        "<strong>Malware</strong> is the general name for software designed to harm. The common routes in are phishing messages, infected files and out-of-date software, so updates plus a little care about what you open and install deal with most of it. If a device starts behaving strangely, the NCSC has a short page on what to do.",
    ],
    "try": ["Open the settings on your phone or laptop, find software update, and turn on automatic updates. Then look through the apps on your phone and delete any you no longer use."],
    "clips": ["NIRXtMg-0z8@3352", "Rgl7C0P6NsE@5790"],
    "gov_intro": "UK official advice on devices is practical and short. The Cyber Essentials scheme shows how organisations are expected to do the same things.",
    "gov": [
        (TIPS + "/install-the-latest-software-and-app-updates", "NCSC: Install the latest software and app updates",
         "Why prompt updates protect you from viruses and other malware, why to turn on automatic updates, and what to do about older devices that stop getting them."),
        (NCSC + "/guidance/securing-your-devices", "NCSC: Securing your devices",
         "Points you to the manufacturers&#39; own guides for Apple, Android, Samsung and Microsoft devices, and suggests checking your settings every few months and whenever you get a new device."),
        (NCSC + "/guidance/smart-devices-in-the-home", "NCSC: Smart devices in the home",
         "How to choose, set up, update and eventually get rid of connected items such as speakers, cameras and thermostats."),
        (NCSC + "/section/respond-recover/citizen-infected-devices", "NCSC: Infected devices",
         "How to tell whether a device may have malware, and what to do next."),
        ("https://www.gov.uk/government/publications/cyber-essentials-scheme-overview", "GOV.UK: Cyber Essentials scheme overview",
         "The government-backed scheme for organisations. Its five controls cover firewalls, secure settings, security updates, who can access what, and malware protection."),
    ],
    "check": ("Your phone shows &quot;update available&quot; every day and you keep choosing &quot;later&quot;. Why does the NCSC say that is worth stopping?",
              "Updates often fix security weaknesses. Once a fix is published, attackers know exactly where the hole is on devices that have not installed it. Turning on automatic updates means you are protected without having to remember."),
}

S[5] = {
    "intro": [
        "Phishing is a message that pretends to be from someone you trust, to get you to click a link, open a file or hand over details. It arrives by email, text message, phone call or social media. The NCSC says scams are getting smarter: bad spelling is no longer a reliable clue, and some even fool experts.",
        "The NCSC lists tell-tale signs. Is the message claiming to come from someone in authority? Does it create urgency, with a short deadline or a threat? Does it stir up emotion such as panic, fear, hope or curiosity? Does it offer something scarce? Does it fit something you are expecting, or does it piggy-back on current events?",
        "If you have doubts, stop and contact the organisation directly, using details from its official website or a bill or card, not the ones in the message. Then report it. You can forward scam texts for free to 7726 if your phone provider is part of the scheme, and the NCSC&#39;s pages explain how to report scam emails, calls, websites and adverts.",
    ],
    "try": ["Next time a message makes you feel rushed or worried, stop and count to ten. Look for the signs above. Then check by opening the organisation&#39;s real website or app yourself, rather than using the link."],
    "clips": ["Rgl7C0P6NsE@5163"],
    "gov_intro": "The NCSC has a short series of pages for people at home, plus a free training package that is also used in workplaces.",
    "gov": [
        (PHISH, "NCSC: Phishing scams, how to spot and report them",
         "The starting page for a short series on recognising and reporting scam emails, texts, calls, websites and adverts."),
        (PHISH + "/spot-scams", "NCSC: How to spot a scam email, text message or call",
         "The five tell-tale signs, how to check whether a message is genuine, and how to make yourself a harder target."),
        (PHISH + "/report-scam-email", "NCSC: Report a scam email",
         "How to forward a suspicious email to the NCSC, what happens next, and what to do if you have already replied."),
        (PHISH + "/report-scam-text-message", "NCSC: Report a scam text",
         "How to report a suspicious text for free by forwarding it, and what to do if you have already responded."),
        (PHISH + "/what-to-do", "NCSC: If you have shared sensitive information",
         "Steps to take if you think you have already given details to a scammer."),
        (NCSC + "/information/top-tips-for-staff", "NCSC: Top Tips for Staff",
         "A free online training package, taking under 30 minutes, written for people with little or no cyber security knowledge. It covers passwords, devices, phishing and reporting problems."),
    ],
    "check": ("A text says a parcel could not be delivered and asks you to pay a small fee through a link. Name two signs that make you doubt it, and what you would do instead.",
              "It may arrive when you are not expecting a parcel, it asks you to act quickly, and it wants you to pay through a link. Instead, do not tap the link. Check with the courier or the shop through their official app or website that you already use, and forward the text to 7726 to report it."),
}

S[6] = {
    "intro": [
        "The internet is a network of networks. When you open a web page, your device breaks the request into small packets. They travel through your router, your internet provider and the wider internet to the website, and the reply comes back the same way. Every device has an address, and a port number says which service on it should receive each packet.",
        "Two practical ideas protect most people. First, <strong>encrypt what travels</strong>: look for https in web addresses, and think twice before using public Wi-Fi for anything sensitive. Second, <strong>keep things apart</strong>: for example, put smart gadgets on a guest network so a problem there does not reach your laptop.",
        "At home, your router is the front door to your network. Change its default admin password, make sure Wi-Fi uses WPA2 or WPA3, keep its software up to date, and use a strong Wi-Fi password.",
    ],
    "try": ["Look at your home Wi-Fi settings. What is the network called? Is it using WPA2 or WPA3? Is there a guest network you could use for smart devices and visitors? Your provider&#39;s help pages explain how to find these."],
    "clips": ["NIRXtMg-0z8@499", "NIRXtMg-0z8@2242"],
    "gov_intro": "Official UK advice covers both the home network and the bigger networks organisations run.",
    "gov": [
        ("https://www.nicybersecuritycentre.gov.uk/securing-your-home-network-and-wi-fi", "NI Cyber Security Centre: Securing your home network and Wi-Fi",
         "A clear guide for people at home: secure your router, choose strong Wi-Fi encryption, keep smart devices on a separate network, and use public Wi-Fi with care. From the Northern Ireland Cyber Security Centre."),
        (NCSC + "/guidance/smart-devices-in-the-home", "NCSC: Smart devices in the home",
         "How to set up and keep connected household items safe, including changing default settings and keeping them updated."),
        (NCSC + "/guidance/network-security-fundamentals", "NCSC: Network security fundamentals",
         "An introduction, written for organisations, to designing and maintaining secure networks: know what is on the network, restrict access, protect data in transit and keep watch."),
        (NCSC + "/section/advice-guidance/all-topics/remote-working", "NCSC: Remote working",
         "A topic page that gathers guidance on working away from your usual office."),
    ],
    "check": ("You are in a café and need to check your bank balance. What is the safer choice, and why?",
              "Use your phone&#39;s mobile data rather than the café&#39;s Wi-Fi. Anyone can set up a hotspot, and on an unprotected network someone could watch your traffic. If you must use public Wi-Fi, use a reputable VPN and look for https."),
}

S[7] = {
    "intro": [
        "Personal data is anything that can point to a person: a name, address, email, photos, health or money details. UK data protection law controls how organisations may use it, and gives you rights over your own data. Encryption is one of the main tools for protecting it, because information that is scrambled is useless without the key.",
        "Backups protect against loss. A backup is a copy of your important files stored somewhere separate. The NCSC points out that setting this up takes little time and can often run automatically, and could save you a lot of stress.",
        "When an organisation that holds your details has a problem, criminals often use the news to send convincing scam messages. The NCSC&#39;s guidance on data breaches for individuals explains what to watch for and what to do.",
    ],
    "try": ["Check that your phone and computer back up your photos and documents automatically, and find out where the copy is kept. Then look at the privacy settings on one social media account."],
    "clips": ["Rgl7C0P6NsE@1925", "3EgYr7jR4NI@386"],
    "gov_intro": "UK official sources explain your rights, what to do after a breach, and how to keep your own copies safe.",
    "gov": [
        (NCSC + "/guidance/data-breaches", "NCSC: Data breach guidance for individuals",
         "What a data breach is, how it might affect you, what to look out for afterwards, and what to do if you have lost money."),
        (TIPS + "/always-back-up-your-most-important-data", "NCSC: Backing up your data",
         "What a backup is, why you might need one, how to back up using cloud storage or removable media, and how to restore files."),
        (NCSC + "/section/advice-guidance/all-topics/personal-data", "NCSC: Personal data",
         "A topic page that gathers the NCSC&#39;s guidance about personal data."),
        ("https://www.gov.uk/data-protection", "GOV.UK: Data protection",
         "How UK law controls the way your personal information can be used, and your right to ask for information about yourself."),
        (NCSC + "/guidance/social-media-how-to-use-it-safely", "NCSC: Social media, how to use it safely",
         "Practical advice on using social media safely, including reviewing your privacy settings."),
    ],
    "check": ("Why is a backup about more than protecting against theft?",
              "Data can be lost in many ways: a dropped or broken device, an accident, or ransomware that locks your files. A backup, kept separately from the device, lets you recover. Protection against theft is only one reason."),
}

S[8] = {
    "intro": [
        "You now have the basics. Security work is wide: the first video groups it into eight areas, from managing risk to running a security operations centre to advising software teams. People arrive from many backgrounds, and the UK has official ways to explore: the NCSC&#39;s cyber skills programme, which sits within the government&#39;s wider TechFirst programme, NCSC-certified degrees and assured training, and National Careers Service job profiles.",
        "<strong>Where next?</strong> If the idea of designing security in from the start appealed, thinking about how a whole service fits together and what could go wrong, the next stage is our beginner security architecture path. It assumes only what you have learned here, and builds to a first exercise using real templates.",
    ],
    "try": ["Pick one of the eight areas that sounds interesting. Find a National Careers Service job profile that fits it, and note one skill you would like to practise."],
    "clips": ["_DVVNOGYtmU@2200", "3EgYr7jR4NI@3323"],
    "gov_intro": "These official UK pages show ways into the profession, from school to degrees to jobs.",
    "gov": [
        (NCSC + "/cyber-skills", "NCSC: Cyber skills (CyberFirst and TechFirst)",
         "The NCSC&#39;s programme supporting young people into cyber careers, and where to find NCSC-certified degrees."),
        ("https://www.gov.uk/guidance/techfirst", "GOV.UK: TechFirst",
         "The government&#39;s tech skills programme, including routes for students and information for employers and schools."),
        (NCSC + "/section/education-skills/professional-skills-training", "NCSC: Professional skills and training",
         "Training for people new to cyber security and for experienced professionals, including NCSC Assured Training and professional titles."),
        (NCSC + "/section/education-skills/higher-education", "NCSC: Higher education",
         "NCSC-certified degrees and degree apprenticeships in cyber security."),
        ("https://nationalcareers.service.gov.uk/job-profiles/it-security-co-ordinator", "National Careers Service: IT security co-ordinator",
         "What the job involves and how to get into it, including courses, apprenticeships and entry requirements."),
        ("https://nationalcareers.service.gov.uk/job-profiles/cyber-intelligence-officer", "National Careers Service: Cyber intelligence officer",
         "What the job involves, typical pay and hours, and routes in through a degree, an apprenticeship or a graduate scheme."),
        ("https://understand-digital-data-roles-skills.service.gov.uk/role/security-architect/", "Government capability framework: Security architect",
         "The official description of the security architect role in government. It is the next path&#39;s destination."),
    ],
    "check": ("Which of the eight areas would you like to explore first, and where could you read what that kind of job involves?",
              "There is no wrong answer. Pick the one that sparks curiosity. The National Careers Service job profiles and the NCSC&#39;s skills pages are good places to read what the work involves, and the beginner security architecture path covers the architecture area in more depth."),
    "next": True,
}
