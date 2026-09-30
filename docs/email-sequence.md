# Midas Tech email outreach sequence

The lead tracker writes these four emails for each lead. It uses them in two places:
- the **Outreach** tab, which sends them from the Microsoft 365 outreach mailbox
- **Lead details → Email drafts**, which opens them in Outlook

The code is `buildEmail()` in `index.html`.

## Why they're written this way

The rules come from the 2026 cold email research (Gong, Lavender, Instantly, Belkins):
- **Short.** Each email is 50–95 words and asks one question.
- **Something true about them first.** A specific finding or a reason to act now, instead of "I'm Ali from…".
- **No pitch in email 1.** It asks "worth a look?" instead of asking for a meeting. The booking link comes in email 2.
- **Every follow-up adds something new.** Email 2 is a useful tip, email 3 is a checklist offer, and email 4 asks who the right person is.
- **Names the business and emotional stake**, not just the technical issue (the 3 levels of pain from MSP sales training).
- **Written about the reader** ("you"), for owners and executives, operations, or finance.

## What the emails use

| Input | Where it comes from |
|---|---|
| `first`, `firm` | The lead's first name (or "there") and company, without Inc., Ltd., Corp. or LLP ("Midas Tech Inc." becomes "Midas Tech") |
| Industry | Detected from industry, title and company: accounting, healthcare, warehouse, law or general |
| Role | Detected from the title: **finance** (CFO, controller, finance, bookkeeper), **operations** (COO, operations, office/practice/clinic/general manager, administrator), otherwise **owner** |
| Domain finding | `lead.domainCheck`, from the free **email-domain check** (below) |
| Trigger | **⚡ Trigger** in the lead window's Email drafts: Hiring, Hiring for IT, New location, Growing, or Other (write your own sentence), plus an optional detail |
| Current IT | **Current IT** in the same place: Don't know, In-house IT, IT provider, or No one |
| Booking link | Outreach → Settings, or Ali's Bookings page by default |

## The email-domain check

When leads are added to outreach, or when you press **🔍 Check email domain** in the lead window, the server (`POST /outreach/domaincheck`) reads the company's **public** DNS:
- **Who hosts their email:** Microsoft 365, Google Workspace, and others.
- **SPF:** which servers may send as them.
- **DMARC:** whether spoofed email is rejected, quarantined, or only monitored.

| Finding | Badge | What email 1 says |
|---|---|---|
| No DMARC | 🔓 no DMARC | "I noticed {domain} doesn't have DMARC protection set up, so anyone can send emails that look like they came from {firm}." |
| DMARC p=none | 🔓 DMARC monitor-only | "I noticed the email protection (DMARC) on {domain} is set to monitor only, so emails pretending to be from {firm} still get delivered." |
| No SPF | 🔓 no SPF | "…has no SPF record, which makes it easier for fake emails to look like they came from {firm}." |
| SPF `+all` / `?all` | 🔓 weak SPF | "I noticed the SPF record on {domain} lets any server send emails as {firm}." |
| Protected | 🔒 domain protected | No finding; email 1 uses the industry opener instead |

Personal addresses (gmail, rogers, and so on) are skipped. If a DNS lookup times out or can't be read, the result is **"couldn't check"**. It is never reported as "no SPF/DMARC", so an email never claims something that isn't true. That result isn't saved, so the next check tries again.

## The four emails

Timing is roughly **days 1, 4, 9 and 16**: 3, 4 and 5 business days apart. Out-of-office replies push the next email back.

### 1. Opener (no pitch)

Email 1 picks its opening in this order: **a trigger** if you set one, then **a domain finding**, then **the industry "why now" line**. When a trigger leads, a domain finding moves to email 2, so it's never lost.

**With a trigger.** Subject: `{firm} new hires` / `{firm} IT hire` / `{firm} new location` / `{firm} growth` (Other uses the industry subject)
```
Hi {first},

{trigger line, e.g. "I saw Maple Family Health is opening a second clinic in Aurora."} {why it matters, e.g. "A move is the easiest time to get the network, Wi-Fi and backups set up right, and the most expensive time to find out they weren't."}

I run Midas Tech, an IT and cybersecurity firm in Richmond Hill. Since 2010, we've looked after IT and security for {clinics / accounting firms / …} across the GTA.

Would it be worth a quick look at {firm}'s setup?

Ali
```

**With a domain finding.** Subject: `{firm} email security`
```
Hi {first},

{finding line} {industry "why it matters" line}

I run Midas Tech, an IT and cybersecurity firm in Richmond Hill, and we've looked after local businesses since 2010. The good news is that it's usually a 15-minute fix.

Would you like me to send over what I found?

Ali
```

**Without a finding.** The subject depends on the industry:
- Accounting: `{firm} before tax season`
- Healthcare: `{firm} and patient data`
- Warehouse: `{firm} supplier payments`
- Law: `{firm} wire fraud`
- General: `{firm} IT question`

```
Hi {first},

{industry "why now" line}

I run Midas Tech, an IT and cybersecurity firm in Richmond Hill. Since 2010, we've helped {accounting firms / clinics / …} put simple protections in place for exactly this.

Would it be worth a quick look at {firm}'s setup?

Ali
```

The "why now" lines:
- **Accounting:** tax-season fake CRA and invoice emails.
- **Healthcare:** Ontario's PHIPA fines.
- **Warehouse:** fake banking-change emails to businesses that pay suppliers.
- **Law:** fake wire instructions and trust accounts.
- **General:** cyber insurance renewal questions.

### 2. Useful tip, with the booking link (sent as a reply in the same thread)
```
Hi {first},

{industry tip: CRA EFILE MFA / EMR MFA and backup restore / downtime and restore time / MFA on every mailbox and phone-confirmed wires / MFA on every account}
  (or, when email 1 didn't use it: "One more thing: I noticed {domain} … It's usually a 15-minute fix.")

{role line}{ Since {firm} is on Microsoft 365/Google Workspace, most of the fixes are settings you already pay for.}

{current IT line}

If it helps, I'm happy to go through it with you on a 15-minute call. You can pick a time here: {booking link}

Ali
```

The role line:
- **Owner:** "…two or three small gaps like this, and closing them is exactly what insurers want to see."
- **Operations:** "…eats your team's time later: old accounts, slow fixes, and nobody sure who to call."
- **Finance:** "For a finance team, it's also one of the best defences against fake payment and banking-change emails." Finance people also get: "…and we usually find a few licences still being paid for people who've left."

The current IT line says we work alongside, not replace:
- **Don't know:** "If you already have someone for IT, we can work alongside them. It's a second pair of eyes, not a switch."
- **In-house IT:** "We often work alongside in-house IT, taking security monitoring and after-hours issues off their plate."
- **IT provider:** "This isn't about switching IT providers. A second opinion is often all it takes."
- **No one:** no extra line.

### 3. Insurance checklist offer
```
Hi {first},

Cyber insurers in Canada now ask 40 to 80 security questions at renewal, and a wrong answer can mean a refused claim. I put together a one-page checklist of what they look for.

Want me to send it over? No call needed.

Ali
```

When someone says yes, reply with the checklist link. Press **📋 Copy checklist link** on the reply: https://midastechinc.github.io/Leads/insurance-checklist.html

### 4. Right person, then close the loop
```
Hi {first},

I'll leave it here for now. If IT isn't on your plate, who's the best person at {firm} for me to talk to?

{With a finding: If it's just bad timing, the email spoofing setting on {domain} is still worth fixing. I'm happy to point your current IT person to it.}
{Without: If it's just bad timing, no problem. You can always reach me at 905-787-2038.}

Enjoy the rest of the {season}.

Ali
```

The outreach server adds a **plain-text signature** (name, title, phone, website, mailing address; no logo or images) and the CASL unsubscribe footer, and drops the "Ali" sign-off so the name isn't repeated. Plain emails land in the main inbox more often than designed ones. To use the full logo signature instead, set `OUTREACH_SIGNATURE=html` in Railway. Drafts opened in Outlook from the lead window get a short text signature.

## Alongside the emails

The research shows email plus LinkedIn plus one phone call gets far more replies than email alone:
- **Day 1–2:** view their LinkedIn profile and connect, with no pitch in the note. Use the lead window's LinkedIn note.
- **Day 5:** a short call. *"Hi {first}, it's Ali from Midas Tech in Richmond Hill. I sent you a note about {firm}'s email security. Did I catch you at a bad time?"*

## "Show Me You Know Me" (personalize) for high-value leads

For your best prospects, research the lead (🔎) then press **✨ Personalize (Show Me You Know Me)** in the Outreach queue. It uses the saved research to write:
- a **specific opening line** (e.g. "Congratulations on opening your second clinic in Aurora this year"), inserted right after the greeting, and
- a **research-based subject** so specific it only makes sense to them (e.g. "Aurora clinic + email").

This is Sam McKenna's SMYKM method — best kept for a smaller number of high-value leads, while the templated emails carry the volume. Always read the line before sending.
