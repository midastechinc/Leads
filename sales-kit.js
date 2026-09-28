// Sales Kit for the Midas Tech lead tracker: a meeting deck you can present full screen, a meeting
// guide (agenda, discovery questions, a 12-point assessment you fill in live, objection handling),
// packages with a quote builder, and Ontario MSP market research.
//
// index.html calls SalesKit.render(root, host). The host gives access to the tracker:
//   host.leads()                       leads the rep can see [{ id, name, company, title, industry, assessment }]
//   host.industryOf(lead)              "healthcare" | "accounting" | "warehouse" | "law" | "generic"
//   host.saveAssessment(leadId, data)  saves the assessment on the lead and logs an activity
//   host.loadSettings() / host.saveSettings(patch)   shared Sales Kit settings (package prices)
//   host.toast(message, type)
(function () {
  "use strict";

  const COMPANY = {
    name: "Midas Tech Inc",
    tagline: "IT Services & Cybersecurity",
    owner: "Ali Jaffar",
    web: "www.midastech.ca",
    email: "info@midastech.ca",
    phone: "905-787-2038",
    address: "30 Via Renzo Dr, Suite 200, Richmond Hill, ON L4S 0B8",
    founded: 2010,
    linkedin: "linkedin.com/company/midastech786",
    instagram: "@midastech.it",
    facebook: "facebook.com/MidasTech.ca"
  };

  // ── Packages (suggested prices from the Ontario market research; editable in the app) ──
  const DEFAULT_PACKAGES = [
    {
      id: "essentials", name: "Essentials", price: 89, tag: "Protect the basics",
      for: "Small offices that mostly need things kept safe and patched, with help when something breaks.",
      features: [
        "Remote help desk, Mon–Fri 8am–6pm",
        "24/7 monitoring, Windows and app patching",
        "Managed antivirus / EDR on every computer",
        "Microsoft 365 security baseline and MFA for everyone",
        "Email spam and phishing filtering",
        "Monthly health report"
      ],
      extra: "On-site visits billed at $125/hour"
    },
    {
      id: "business", name: "Business", price: 139, tag: "Most popular", popular: true,
      for: "Growing teams that want one flat fee for all their IT, on-site included.",
      features: [
        "Everything in Essentials",
        "Unlimited remote and on-site support in the GTA",
        "24/7 managed detection and response (MDR)",
        "Microsoft 365 and computer backup in Canadian data centres",
        "Security awareness training and phishing tests",
        "New staff set-up and leaver shut-down",
        "We deal with your vendors: internet, phones, software",
        "Quarterly IT review with Ali"
      ],
      extra: "Most clients choose this"
    },
    {
      id: "secure", name: "Secure+", price: 189, tag: "Compliance ready",
      for: "Clinics, accounting firms and anyone handling sensitive data or answering to a regulator.",
      features: [
        "Everything in Business",
        "24/7 security operations centre (SOC) with log monitoring",
        "Dark web monitoring for your staff's accounts",
        "Annual risk assessment and written security policies (PHIPA, PIPEDA, CRA EFILE)",
        "Incident response plan, tested once a year",
        "1-hour priority response",
        "Image backups with quarterly test restores",
        "IT roadmap and budget planning"
      ],
      extra: "Built for healthcare and accounting"
    }
  ];
  const DEFAULT_ADDONS = [
    { id: "server", name: "Server management", unit: "per server / month", price: 150 },
    { id: "network", name: "Firewall, Wi-Fi and network management", unit: "per site / month", price: 75 },
    { id: "m365", name: "Microsoft 365 Business Premium licence", unit: "per user / month (at cost)", price: 29.8, perUser: true },
    { id: "comanaged", name: "Co-managed IT (you have an in-house IT person)", unit: "per user / month", price: 69, perUser: true, replaces: true }
  ];
  const TERMS = [
    "Priced per user, per month, in Canadian dollars, plus HST. Minimum 5 users.",
    "Month to month with 30 days' notice, or 12 months to have the onboarding fee waived.",
    "One-time onboarding fee equal to one month of service: we document everything, set up security and meet every user.",
    "Microsoft 365 licences are billed at cost. Project work and after-hours work outside the plan: $125–150/hour, quoted first."
  ];

  // ── Market research (September 2026) ──
  const MARKET = {
    ranges: [
      ["Monitoring only (support billed hourly)", "Under $100 / user", "Hourly support at $125–175"],
      ["Fully managed IT, 20–50 staff", "$120–220 / user", "Help desk, monitoring, patching, backup, baseline security"],
      ["Toronto / GTA typical range", "$100–250 / user", "Varies with 24/7 security, on-site and compliance"],
      ["Premium SLA (response under 1 hour)", "$150+ / user", "Often with 24/7 SOC"],
      ["Healthcare with full security (PHIPA)", "$180+ / user", "24/7 SOC, M365 hardening, EMR security, breach playbook"],
      ["Onboarding fee", "1–2 months of service", "Often $2,000–5,000; some waive it"],
      ["On-site / project hourly", "$150–250 / hour", "Security hardening and complex work at the top end"]
    ],
    competitors: [
      { name: "Fusion Computing", where: "Toronto, across Ontario", price: "$180–250 / user", notes: "All-in: 24/7 SOC (Huntress MDR, SentinelOne, Fortinet), M365 management and backup. No long-term contracts. Strong industry pages for healthcare, accounting and logistics.", url: "https://fusioncomputing.ca/managed-it-services-cost-canada/" },
      { name: "TUCU Managed IT", where: "Toronto and Durham", price: "$120–160 / user", notes: "NIST-aligned security for every client, in-house team, M365 licences billed separately, server fee extra. Every deal starts with a discovery call.", url: "https://tucu.ca/pricing/" },
      { name: "Manawa Networks", where: "Richmond Hill, Vaughan, Markham, GTA", price: "Flat monthly fee (not published)", notes: "24/7/365 help desk with 15-minute average response, vCIO, on-site support, a guarantee of 50% fewer IT issues in year one. Also sells co-managed IT.", url: "https://manawa.ca/managed-it-services-richmond-hill/" },
      { name: "G4NS", where: "Toronto, York Region, Peel, Halton", price: "Flat monthly (quote after free assessment)", notes: "Leads with a free IT assessment, then a fixed quote with no surprise charges. Very similar offer to ours.", url: "https://g4ns.com/services/managed-it" },
      { name: "CG Technologies", where: "Toronto, Richmond Hill, Vaughan, Markham", price: "Guide published, not a fixed price", notes: "Since 1996, 100+ GTA small businesses, 24/7 local support. Publishes a Toronto pricing guide.", url: "https://cgtechnologies.com/managed-it-services-richmond-hill/" },
      { name: "Nucleus", where: "Toronto", price: "Per user (not published)", notes: "Sells on \"no lock-in, we answer\": month-to-month and a human on the phone.", url: "https://yournucleus.ca/toronto/" }
    ],
    standard: [
      "Help desk (remote, often unlimited) and 24/7 monitoring and patching",
      "Endpoint protection / EDR on every device, and MFA on Microsoft 365",
      "Backup of Microsoft 365 and computers, ideally in Canada",
      "Security awareness training and phishing tests",
      "A regular IT review (vCIO) and a written plan",
      "Flat monthly price, fixed quote after an assessment",
      "More and more: 24/7 SOC / MDR included, and no long-term contracts"
    ],
    edge: [
      ["Owner-led and local", "Clients deal with Ali, 15 minutes away in Richmond Hill, not a ticket queue. Bigger MSPs can't offer that."],
      ["Priced below the big names", "$89–189 against $180–250 at the larger Ontario MSPs, for the same core security."],
      ["Three niches, spoken fluently", "Healthcare (PHIPA), accounting (CRA EFILE, tax season) and warehouses (uptime, scanners, Wi-Fi). Lead with the industry, not \"IT services\"."],
      ["Easy yes", "Free 15-minute assessment, month-to-month option, and onboarding fee waived on a 12-month agreement."],
      ["Since 2010", "16 years of Ontario small-business IT."]
    ],
    industries: {
      healthcare: { title: "Healthcare clinics (medical, dental, physio)", points: ["PHIPA: role-based access, encryption at rest and in transit, access logging, a written breach response plan, prompt breach notification", "Practice software and imaging support (EMR, Dentrix, ABELDent and similar)", "Tested backups with a clear time to be seeing patients again", "Phones that work with scheduling"], url: "https://act360.ca/blog/phipa-compliance-healthcare-it-ontario/" },
      accounting: { title: "Accounting and bookkeeping firms", points: ["CRA requires MFA for EFILE and Represent a Client, and safeguards on taxpayer data; unauthorized access must be reported to the CRA", "Records kept 6 years; PIPEDA breach reporting", "CPA Ontario practice inspection expects documented technology controls", "Tax-season phishing and business email compromise are the big risks"], url: "https://fusioncomputing.ca/cra-efile-it-controls/" },
      warehouse: { title: "Warehouses and logistics", points: ["Uptime: WMS/TMS, scanners, label printers and dock Wi-Fi", "Network segmentation so a hacked camera or guest Wi-Fi can't reach the office", "Supplier payment fraud: confirm banking changes by phone", "Multi-site networking and 24/7 support around shifts"], url: "https://fusioncomputing.ca/transport-logistics/" }
    },
    stats: [
      ["CA$7.11M", "Average cost of a data breach for Canadian organizations in 2026, up from $6.98M in 2025 (IBM)", "https://www.bnnbloomberg.ca/business/technology/2026/07/29/average-canadian-data-breach-costs-and-detection-times-are-rising-ibm-report/"],
      ["205 days", "Average time to find and contain a breach in Canada (IBM 2026)", "https://www.bnnbloomberg.ca/business/technology/2026/07/29/average-canadian-data-breach-costs-and-detection-times-are-rising-ibm-report/"],
      ["$1.2B", "What Canadian businesses spent recovering from cyber incidents in 2023, double 2021 (Statistics Canada)", "https://madeinca.ca/cyber-crime-canada-statistics/"],
      ["#1", "Phishing and business email compromise: the most common way in and the costliest incident for small businesses", "https://www.cloudforces.ca/blog/ibm-cost-data-breach-2026-canadian-smbs"]
    ],
    sources: [
      ["Managed IT Services Pricing in Canada: 2026 Cost Guide (F12.net)", "https://f12.net/blog/managed-it-services-pricing-canada/"],
      ["What Managed IT Costs in Canada (Fusion Computing)", "https://fusioncomputing.ca/managed-it-services-cost-canada/"],
      ["Managed IT Cost in Toronto 2026 (BALANCED+)", "https://balanced.plus/managed-it-services-cost-toronto-pricing-guide/"],
      ["Managed IT Cost in Ontario: SMB Pricing Guide 2026 (Meteor Networks)", "https://meteortel.com/managed-it-cost-ontario/"],
      ["Small Business Managed IT Pricing Toronto (TUCU)", "https://tucu.ca/pricing/"],
      ["Richmond Hill Managed IT Services (Manawa Networks)", "https://manawa.ca/managed-it-services-richmond-hill/"],
      ["Managed IT Services (G4NS)", "https://g4ns.com/services/managed-it"],
      ["Managed IT Services Richmond Hill (CG Technologies)", "https://cgtechnologies.com/managed-it-services-richmond-hill/"],
      ["PHIPA Compliance: What Ontario Clinics Need From IT (ACT360)", "https://act360.ca/blog/phipa-compliance-healthcare-it-ontario/"],
      ["CRA EFILE IT Controls Checklist (Fusion Computing)", "https://fusioncomputing.ca/cra-efile-it-controls/"],
      ["IT Services for Transport & Logistics (Fusion Computing)", "https://fusioncomputing.ca/transport-logistics/"],
      ["Canadian data breach costs rising: IBM report (BNN Bloomberg, July 2026)", "https://www.bnnbloomberg.ca/business/technology/2026/07/29/average-canadian-data-breach-costs-and-detection-times-are-rising-ibm-report/"],
      ["Microsoft 365 Business Premium pricing (Microsoft Canada)", "https://www.microsoft.com/en-ca/microsoft-365/business/microsoft-365-business-premium"]
    ]
  };

  // ── Assessment (asked live in the meeting; "yes" is the safe answer) ──
  const ASSESSMENT = [
    ["mfa", "Is multi-factor authentication on for every email account, including shared mailboxes?", "Stolen passwords are the #1 way in. MFA blocks nearly all of them.", 3],
    ["backup", "Are backups automatic, kept off-site, and has someone restored a file in the last 3 months?", "Untested backups often fail on the day you need them.", 3],
    ["m365backup", "Is Microsoft 365 (email, OneDrive, SharePoint) backed up separately?", "Microsoft keeps deleted items for a short time only; it isn't a backup.", 2],
    ["edr", "Does every computer have managed antivirus / EDR that someone watches?", "Free antivirus stops old threats, not today's ransomware.", 3],
    ["patch", "Are Windows and apps updated automatically, and is someone checking?", "Most attacks use holes that already have a fix.", 2],
    ["training", "Has staff had phishing / security training in the last year?", "People are the last line of defence against fake invoices and logins.", 2],
    ["leavers", "When someone leaves, are their accounts switched off the same day?", "Old accounts are an easy, unnoticed way in.", 2],
    ["admin", "Do staff work without admin rights on their computers?", "Admin rights let one bad click install anything.", 1],
    ["firewall", "Is there a business firewall, and is guest Wi-Fi separate from the office network?", "Keeps visitors and smart devices away from your files.", 2],
    ["payments", "Are changes to payment or banking details always confirmed by phone?", "Business email compromise is the costliest small-business incident.", 2],
    ["plan", "Is there a written plan for what to do if you're hacked or systems go down?", "Minutes matter; a plan avoids panic and missed legal notices.", 1],
    ["support", "When something breaks, do you know exactly who to call and how fast they'll respond?", "Downtime costs more than support.", 1]
  ];
  const ANSWER_SCORE = { yes: 1, unsure: 0.3, no: 0 };

  const DISCOVERY = [
    ["Your business", ["Tell me about the business: how many people, how many locations?", "What does a normal day look like for your team? What software can't you work without?", "Are you growing, hiring, or opening anything new this year?"]],
    ["Current IT", ["Who looks after your IT today? An in-house person, a provider, or whoever is handy?", "What do you like about how it works now? What drives you crazy?", "When something breaks, how long does it usually take to fix?", "Are you on Microsoft 365 or Google Workspace? Any servers in the office?"]],
    ["Security", ["Have you or anyone you know had a scare: a hacked email, a fake invoice, ransomware?", "If a staff email account was taken over tonight, how would you know?", "Does your cyber insurance ask you about MFA, backups or training?"]],
    ["Backup and downtime", ["If your main system went down tomorrow morning, what would it cost you per hour?", "When did someone last restore something from backup?"]],
    ["Compliance", ["Do you answer to a regulator or professional body: PHIPA, CRA EFILE, CPA Ontario, the Law Society?", "Has a client, insurer or auditor asked for proof of your security?"]],
    ["Priorities and decision", ["If you could fix one IT thing this month, what would it be?", "Who else is involved in a decision like this?", "When does your current contract or arrangement renew?", "What would make this a clear yes for you?"]]
  ];
  const AGENDA = [
    ["Before the meeting (15 min)", ["Open the lead in the tracker: read research, website scan and past activity", "Pick the lead in this Sales Kit so the deck shows their name and industry", "Look up their Google reviews and LinkedIn for small talk", "Have your Bookings link and a notepad ready"]],
    ["Open (2 min)", ["Thank them, confirm the time: \"I've got 20 minutes blocked, does that still work?\"", "Set the agenda: \"I'll ask a few questions, share what we see in your industry, and if it makes sense, talk next steps. Sound good?\""]],
    ["Discover (10 min)", ["Ask, don't pitch. Aim for them talking 70% of the time", "Use the discovery questions below; when they name a problem, ask \"why is that a problem?\"", "Run the 12-point quick assessment together; it makes the risks concrete"]],
    ["Show (5 min)", ["Present only the slides that match what you heard", "Show their assessment score, then the package that fixes their top 2–3 gaps"]],
    ["Agree next steps (3 min)", ["Offer the free full assessment (a site visit or remote review)", "Promise a written proposal within 48 hours", "Book the follow-up before you hang up"]],
    ["After (same day)", ["Log the meeting in the tracker and set the status to Qualified or Proposal", "Send the thank-you email below with a summary and the proposal date", "Build the quote in Packages and send it within 48 hours"]]
  ];
  const OBJECTIONS = [
    ["\"We already have an IT guy / provider.\"", "That's great, most of our clients did too. Can I ask how they handle security after hours, and when they last tested a restore? Many businesses keep their person for day-to-day and add us for security and backup (co-managed). The free assessment gives you a second opinion either way."],
    ["\"It's too expensive.\"", "Fair. Compared to what? One day of downtime or one fake invoice usually costs more than a year of the plan. We can also start with Essentials and grow into Business. And there's no long contract: month to month with 30 days' notice."],
    ["\"We're too small to be a target.\"", "Most attacks aren't aimed at anyone. They're automated emails and password guesses sent to thousands of small businesses at once, because small businesses have less protection. That's exactly who they catch."],
    ["\"We need to think about it / talk to my partner.\"", "Of course. What would you want to be sure of before deciding? Would it help if I sent a one-page summary and joined a 15-minute call with your partner this week?"],
    ["\"We had a bad experience with an MSP.\"", "I'm sorry to hear that. What went wrong? (Listen.) That's why you'd deal with me directly, we put response times in writing, and you can leave with 30 days' notice if we don't deliver."],
    ["\"We're in a contract right now.\"", "When does it renew? Let's do the free assessment now, so you have a clear comparison well before the renewal date. I'll put a reminder in 60 days before."]
  ];
  const FOLLOWUP_EMAIL = (who, company) => `Subject: Thanks for today, ${company || "and next steps"}

Hi ${who || "there"},

Thanks for making time today. Here's a quick summary of what we talked about:

• What's working: …
• What worries you: …
• Quick assessment score: … (top gaps: …)

Next steps:
1. I'll send a written proposal by …
2. Free full assessment on … (on-site / remote)

If anything comes up before then, call me at ${COMPANY.phone}.

Thanks,

${COMPANY.owner}
${COMPANY.name} · ${COMPANY.tagline}
${COMPANY.phone} · ${COMPANY.web}`;

  // ── helpers ──
  const esc = s => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  const money = n => `$${Number(n || 0).toLocaleString("en-CA", { minimumFractionDigits: Number(n) % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;
  const INDUSTRY_LABEL = { healthcare: "Healthcare", accounting: "Accounting", warehouse: "Warehouse & logistics", law: "Law firm", generic: "Small business" };

  let host = null;
  let root = null;
  const state = { tab: "deck", leadId: "", company: "", industry: "generic", packages: null, addons: null, settingsLoaded: false,
    answers: {}, notes: "", quote: { pkg: "business", users: 10, addons: {}, waive: true }, slide: 0 };
  try { Object.assign(state, JSON.parse(localStorage.getItem("midas-saleskit-ui") || "{}"), { slide: 0 }); } catch {}
  const remember = () => { try { localStorage.setItem("midas-saleskit-ui", JSON.stringify({ tab: state.tab, leadId: state.leadId, company: state.company, industry: state.industry, quote: state.quote })); } catch {} };

  const packages = () => state.packages || DEFAULT_PACKAGES;
  const addons = () => state.addons || DEFAULT_ADDONS;
  const lead = () => (host?.leads() || []).find(l => l.id === state.leadId) || null;
  const prospect = () => { const l = lead(); return l?.company || state.company || ""; };
  function industry() { const l = lead(); return l ? host.industryOf(l) : state.industry; }

  function assessmentScore(answers) {
    let got = 0, max = 0;
    const gaps = [];
    ASSESSMENT.forEach(([id, q, why, w]) => {
      const a = answers[id];
      max += w;
      if (a) got += w * ANSWER_SCORE[a];
      if (a && a !== "yes") gaps.push({ id, q, why, w, a });
    });
    const answered = ASSESSMENT.filter(([id]) => answers[id]).length;
    const score = max ? Math.round(got / max * 100) : 0;
    gaps.sort((a, b) => b.w - a.w || (a.a === "no" ? -1 : 1));
    return { score, answered, gaps, level: score >= 80 ? "Good" : score >= 55 ? "Some gaps" : "At risk" };
  }
  function recommendedPackage() {
    // Regulated industries need the compliance extras; everyone else is best served by Business.
    return ["healthcare", "accounting", "law"].includes(industry()) ? "secure" : "business";
  }

  // ── slides ──
  function slides() {
    const co = prospect();
    const ind = industry();
    const ic = MARKET.industries[ind];
    const answers = state.answers;
    const res = assessmentScore(answers);
    const date = new Date().toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" });
    const list = [];
    list.push({ cls: "sk-s-title", html: `<img src="midas-logo.png" alt="Midas Tech" class="sk-logo" onerror="this.remove()">
      <h1>Keeping ${esc(co || "your business")} secure, productive and running</h1>
      <p class="sk-sub">${esc(COMPANY.name)} · ${esc(COMPANY.tagline)}</p>
      <p class="sk-meta">${esc(COMPANY.owner)} · ${esc(date)}</p>`,
      notes: "Thank them for their time. Confirm you have 20 minutes. Keep this slide up while you chat." });
    list.push({ html: `<h2>Today's agenda</h2><ol class="sk-big">
      <li><b>Get to know you</b><span>your team, your IT today, what's working and what isn't</span></li>
      <li><b>What we see in ${esc(INDUSTRY_LABEL[ind].toLowerCase())}</b><span>the risks that matter for businesses like yours</span></li>
      <li><b>How we help</b><span>only if it makes sense</span></li>
      <li><b>Next steps</b><span>no pressure, no long contracts</span></li></ol>`,
      notes: "\"I'll ask a few questions first. If it makes sense, I'll show how we'd help. Sound good?\" Then go to the Meeting guide and ask discovery questions." });
    list.push({ html: `<h2>About Midas Tech</h2><div class="sk-grid3">
      <div><b>Since ${COMPANY.founded}</b><span>16 years looking after Ontario small businesses</span></div>
      <div><b>Local</b><span>Richmond Hill office, on-site across the GTA</span></div>
      <div><b>You deal with Ali</b><span>owner-led: a person who knows your business, not a ticket queue</span></div>
      <div><b>Cybersecurity first</b><span>Microsoft 365, backups, 24/7 monitoring</span></div>
      <div><b>Your industry</b><span>clinics, accounting firms and warehouses</span></div>
      <div><b>Flat monthly fee</b><span>no surprise bills, month-to-month option</span></div></div>`,
      notes: "Keep it short: 60 seconds. The point is: local, owner-led, security-first." });
    list.push({ html: `<h2>The risk for Canadian businesses</h2><div class="sk-stats">
      ${MARKET.stats.map(([n, t]) => `<div><b>${esc(n)}</b><span>${esc(t)}</span></div>`).join("")}</div>
      <p class="sk-foot">Sources: IBM Cost of a Data Breach 2026 (Canada), Statistics Canada.</p>`,
      notes: "Don't scare. Say: most attacks are automated and aimed at whoever is least protected. Small businesses have the least." });
    if (ic) list.push({ html: `<h2>What we see in ${esc(ic.title.toLowerCase())}</h2><ul class="sk-list">${ic.points.map(p => `<li>${esc(p)}</li>`).join("")}</ul>`,
      notes: "Ask: \"Which of these have come up for you?\" Let them pick one and talk." });
    else list.push({ html: `<h2>What we see in small businesses</h2><ul class="sk-list">
      <li>Fake invoices and banking-change emails (business email compromise)</li><li>Email accounts without multi-factor authentication</li>
      <li>Backups that exist but have never been tested</li><li>Old accounts of people who left, still switched on</li><li>No one watching for attacks after hours</li></ul>`,
      notes: "Ask: \"Which of these have come up for you?\"" });
    list.push({ html: `<h2>Your quick assessment</h2>${res.answered ? `<div class="sk-score"><div class="sk-ring" style="--p:${res.score}"><b>${res.score}</b><span>/ 100</span></div>
      <div><p class="sk-level l-${res.level.replace(/\s/g, "")}">${esc(res.level)}</p><p>${res.answered} of ${ASSESSMENT.length} questions answered</p></div></div>
      ${res.gaps.length ? `<h3>Top gaps</h3><ul class="sk-list">${res.gaps.slice(0, 4).map(g => `<li><b>${esc(g.q.replace(/\?$/, ""))}</b> — ${esc(g.why)}</li>`).join("")}</ul>` : `<p>No gaps found. Nice work.</p>`}`
      : `<p class="sk-sub">Fill in the 12-point assessment in the Meeting guide tab and the score appears here.</p>`}`,
      notes: "Walk through the top 2–3 gaps only. Ask: \"If we fixed these, would you sleep better?\"" });
    list.push({ html: `<h2>How we work</h2><div class="sk-steps">
      <div><b>1. Assess</b><span>document everything, find the gaps</span></div>
      <div><b>2. Secure</b><span>MFA, EDR, backups, patching</span></div>
      <div><b>3. Support</b><span>help desk and on-site when you need it</span></div>
      <div><b>4. Improve</b><span>quarterly review and a yearly plan</span></div></div>`,
      notes: "This is the whole relationship in one slide." });
    const rec = recommendedPackage();
    list.push({ html: `<h2>Plans</h2><div class="sk-plans">${packages().map(p => `<div class="${p.id === rec ? "rec" : ""}">
      ${p.id === rec ? `<em>Recommended for you</em>` : p.popular ? `<em>Most popular</em>` : ""}<b>${esc(p.name)}</b><strong>${money(p.price)}<small>/user/month</small></strong>
      <ul>${p.features.slice(0, 5).map(f => `<li>${esc(f)}</li>`).join("")}</ul></div>`).join("")}</div>
      <p class="sk-foot">Plus HST. Microsoft 365 licences at cost. Month to month, or 12 months with onboarding waived.</p>`,
      notes: "Point at the recommended plan and tie it to their gaps. Don't read every line." });
    list.push({ html: `<h2>Our promise</h2><div class="sk-grid3">
      <div><b>Fast response</b><span>written response times; 1 hour on Secure+</span></div>
      <div><b>No lock-in</b><span>month to month, 30 days' notice</span></div>
      <div><b>One flat fee</b><span>no surprise invoices for support</span></div>
      <div><b>Your data in Canada</b><span>backups in Canadian data centres</span></div>
      <div><b>Plain English</b><span>monthly report you can actually read</span></div>
      <div><b>Local people</b><span>on-site in the GTA when it matters</span></div></div>`,
      notes: "These answer the usual worries before they're asked." });
    list.push({ html: `<h2>Your first 30 days</h2><div class="sk-steps">
      <div><b>Week 1</b><span>walkthrough, document systems, accounts and vendors</span></div>
      <div><b>Week 2</b><span>security baseline: MFA, EDR, backups tested</span></div>
      <div><b>Week 3</b><span>meet every user, help desk goes live</span></div>
      <div><b>Week 4</b><span>review: what we found, what we fixed, what's next</span></div></div>`,
      notes: "Shows it's organised and low-effort for them." });
    list.push({ cls: "sk-s-title", html: `<h2>Next steps</h2><ol class="sk-big">
      <li><b>Free full assessment</b><span>on-site or remote, about an hour</span></li>
      <li><b>Written proposal within 48 hours</b><span>fixed monthly price, no surprises</span></li>
      <li><b>Pick a start date</b><span>onboarding takes about 30 days</span></li></ol>
      <p class="sk-contact">${esc(COMPANY.owner)} · ${esc(COMPANY.phone)} · ${esc(COMPANY.email)} · ${esc(COMPANY.web)}<br>${esc(COMPANY.address)}<br>LinkedIn ${esc(COMPANY.linkedin)} · Instagram ${esc(COMPANY.instagram)} · Facebook ${esc(COMPANY.facebook)}</p>`,
      notes: "Ask for the assessment date now and book it before you hang up." });
    return list;
  }

  // ── rendering ──
  const TABS = [["deck", "🎞️ Meeting deck"], ["guide", "🧭 Meeting guide"], ["packages", "📦 Packages & quote"], ["market", "🔍 Market research"]];

  function render(el, h) {
    root = el; host = h;
    if (!state.settingsLoaded) {
      state.settingsLoaded = true;
      host.loadSettings().then(s => {
        if (s?.packages?.length) state.packages = DEFAULT_PACKAGES.map(p => ({ ...p, price: s.packages.find(x => x.id === p.id)?.price ?? p.price }));
        if (s?.addons?.length) state.addons = DEFAULT_ADDONS.map(a => ({ ...a, price: s.addons.find(x => x.id === a.id)?.price ?? a.price }));
        draw();
      }).catch(() => {});
    }
    const l = lead();
    if (l?.assessment && !Object.keys(state.answers).length) { state.answers = { ...(l.assessment.answers || {}) }; state.notes = l.assessment.notes || ""; }
    draw();
  }

  function draw() {
    if (!root) return;
    const leads = (host.leads() || []).slice().sort((a, b) => String(a.company || a.name).localeCompare(String(b.company || b.name)));
    root.innerHTML = `
      <div class="workspace-header">
        <div><div class="workspace-title">Sales Kit</div>
          <div class="workspace-sub">Everything for a client meeting: the deck, what to ask, packages and prices, and what other Ontario MSPs offer.</div></div>
      </div>
      <div class="sk-bar">
        <label>Meeting with
          <select data-sk="lead"><option value="">— Pick a lead —</option>${leads.map(l => `<option value="${esc(l.id)}" ${l.id === state.leadId ? "selected" : ""}>${esc(l.company || l.name)}${l.company && l.name && l.name !== l.company ? ` — ${esc(l.name)}` : ""}</option>`).join("")}</select></label>
        ${state.leadId ? "" : `<label>or type a company<input data-sk="company" value="${esc(state.company)}" placeholder="Company name"></label>
        <label>Industry<select data-sk="industry">${Object.entries(INDUSTRY_LABEL).map(([k, v]) => `<option value="${k}" ${k === state.industry ? "selected" : ""}>${esc(v)}</option>`).join("")}</select></label>`}
        ${state.leadId ? `<span class="sk-chip">${esc(INDUSTRY_LABEL[industry()])}</span>` : ""}
      </div>
      <div class="sk-tabs" role="tablist">${TABS.map(([k, n]) => `<button type="button" role="tab" data-sk="tab" data-v="${k}" aria-selected="${state.tab === k}">${n}</button>`).join("")}</div>
      <div class="sk-panel">${state.tab === "deck" ? deckHtml() : state.tab === "guide" ? guideHtml() : state.tab === "packages" ? packagesHtml() : marketHtml()}</div>`;
  }

  function deckHtml() {
    const s = slides();
    return `<div class="sk-deck-actions"><button class="btn btn-primary" type="button" data-sk="present">▶ Present full screen</button>
      <span class="or-muted">${s.length} slides · arrow keys to move · N shows your notes · Esc to exit</span></div>
      <div class="sk-thumbs">${s.map((sl, i) => `<button type="button" class="sk-thumb" data-sk="present" data-v="${i}" aria-label="Present from slide ${i + 1}">
        <div class="sk-slide-wrap"><div class="sk-slide ${sl.cls || ""}">${sl.html}</div></div><span>${i + 1}. ${esc((sl.html.match(/<h[12][^>]*>([^<]*)/) || [, ""])[1])}</span></button>`).join("")}</div>`;
  }

  function guideHtml() {
    const res = assessmentScore(state.answers);
    const l = lead();
    return `<div class="sk-cols">
      <section class="or-card"><h3>How to run the meeting</h3>${AGENDA.map(([h, items]) => `<div class="sk-agenda"><b>${esc(h)}</b><ul>${items.map(i => `<li>${esc(i)}</li>`).join("")}</ul></div>`).join("")}</section>
      <section class="or-card"><h3>Discovery questions</h3><p class="or-muted">Pick 6–8. Listen more than you talk.</p>${DISCOVERY.map(([h, qs]) => `<div class="sk-agenda"><b>${esc(h)}</b><ul>${qs.map(q => `<li>${esc(q)}</li>`).join("")}</ul></div>`).join("")}</section>
    </div>
    <section class="or-card"><div class="or-card-head"><div><h3>12-point quick assessment</h3><p class="or-muted">Ask these together in the meeting. The score and top gaps appear on the deck.</p></div>
      <div class="sk-score-mini"><b>${res.score}</b>/100 · ${esc(res.level)} · ${res.answered}/${ASSESSMENT.length} answered</div></div>
      ${ASSESSMENT.map(([id, q, why]) => `<div class="sk-q"><div><b>${esc(q)}</b><span class="or-muted">${esc(why)}</span></div>
        <div class="sk-ans">${["yes", "no", "unsure"].map(a => `<button type="button" data-sk="answer" data-id="${id}" data-v="${a}" aria-pressed="${state.answers[id] === a}" class="a-${a}">${a === "unsure" ? "Not sure" : a[0].toUpperCase() + a.slice(1)}</button>`).join("")}</div></div>`).join("")}
      <label class="sk-notes">Meeting notes<textarea data-sk="notes" placeholder="What they said, who decides, budget, timing…">${esc(state.notes)}</textarea></label>
      <div class="or-edit-actions"><button class="btn btn-primary" type="button" data-sk="save-assessment" ${l ? "" : "disabled"}>Save to ${esc(l ? (l.company || l.name) : "the lead")}</button>
        <button class="btn btn-secondary" type="button" data-sk="clear-assessment">Clear</button>
        ${l ? "" : `<span class="or-muted">Pick a lead at the top to save it.</span>`}
        ${l?.assessment?.date ? `<span class="or-muted">Last saved ${esc(new Date(l.assessment.date).toLocaleDateString("en-CA"))}</span>` : ""}</div>
    </section>
    <section class="or-card"><h3>Handling objections</h3>${OBJECTIONS.map(([o, a]) => `<details class="sk-obj"><summary>${esc(o)}</summary><p>${esc(a)}</p></details>`).join("")}</section>
    <section class="or-card"><div class="or-card-head"><div><h3>Thank-you email (send the same day)</h3></div><button class="btn btn-secondary btn-sm" type="button" data-sk="copy-followup">Copy</button></div>
      <pre class="sk-pre">${esc(FOLLOWUP_EMAIL(l ? String(l.name || "").split(" ")[0] : "", prospect()))}</pre></section>`;
  }

  function quoteTotals() {
    const q = state.quote;
    const users = Math.max(1, Math.round(Number(q.users) || 1));
    const billable = Math.max(users, 5);
    const pkg = packages().find(p => p.id === q.pkg) || packages()[1];
    const lines = [];
    const co = addons().find(a => a.id === "comanaged");
    if (q.addons.comanaged) lines.push([`${co.name}`, `${billable} users × ${money(co.price)}`, billable * co.price]);
    else lines.push([`${pkg.name} plan`, `${billable} users × ${money(pkg.price)}${billable > users ? " (5-user minimum)" : ""}`, billable * pkg.price]);
    addons().forEach(a => {
      if (a.id === "comanaged") return;
      const n = Number(q.addons[a.id] || 0);
      if (!n) return;
      const qty = a.perUser ? users : n;
      lines.push([a.name, `${qty} × ${money(a.price)}`, qty * a.price]);
    });
    const monthly = lines.reduce((s, l) => s + l[2], 0);
    const onboarding = q.addons.comanaged ? billable * co.price : billable * pkg.price;
    return { users, billable, pkg, lines, monthly, onboarding, waived: !!q.waive, hst: monthly * 0.13 };
  }

  function packagesHtml() {
    const t = quoteTotals();
    const q = state.quote;
    return `<div class="sk-plans sk-plans-page">${packages().map(p => `<div class="${p.popular ? "rec" : ""}">
        ${p.popular ? `<em>Most popular</em>` : `<em class="plain">${esc(p.tag)}</em>`}
        <b>${esc(p.name)}</b>
        <strong><span class="sk-price-edit">$<input type="number" min="0" step="1" value="${esc(p.price)}" data-sk="price" data-id="${p.id}" aria-label="${esc(p.name)} price"></span><small>/user/month</small></strong>
        <p class="or-muted">${esc(p.for)}</p>
        <ul>${p.features.map(f => `<li>${esc(f)}</li>`).join("")}</ul>
        <p class="or-muted"><i>${esc(p.extra)}</i></p></div>`).join("")}</div>
      <section class="or-card"><h3>Add-ons</h3><div class="sk-addons">${addons().map(a => `<div><span>${esc(a.name)}</span><span class="or-muted">${esc(a.unit)}</span>
        <span class="sk-price-edit">$<input type="number" min="0" step="0.01" value="${esc(a.price)}" data-sk="addon-price" data-id="${a.id}" aria-label="${esc(a.name)} price"></span></div>`).join("")}</div>
        <ul class="sk-terms">${TERMS.map(x => `<li>${esc(x)}</li>`).join("")}</ul>
        <p class="or-muted">Prices are suggestions from the Ontario market research (see Market research). Change any price and it's saved for everyone.</p></section>
      <section class="or-card"><div class="or-card-head"><div><h3>Quote builder${prospect() ? ` for ${esc(prospect())}` : ""}</h3></div>
        <div class="or-actions"><button class="btn btn-secondary btn-sm" type="button" data-sk="copy-quote">Copy as text</button><button class="btn btn-primary btn-sm" type="button" data-sk="print-quote">🖨️ Print / PDF</button></div></div>
        <div class="sk-quote-form">
          <label>Plan<select data-sk="q-pkg" ${q.addons.comanaged ? "disabled" : ""}>${packages().map(p => `<option value="${p.id}" ${p.id === q.pkg ? "selected" : ""}>${esc(p.name)} (${money(p.price)})</option>`).join("")}</select></label>
          <label>Users<input type="number" min="1" data-sk="q-users" value="${esc(q.users)}"></label>
          <label>Servers<input type="number" min="0" data-sk="q-addon" data-id="server" value="${esc(q.addons.server || 0)}"></label>
          <label>Sites (firewall / Wi-Fi)<input type="number" min="0" data-sk="q-addon" data-id="network" value="${esc(q.addons.network || 0)}"></label>
          <label class="or-check-row"><input type="checkbox" data-sk="q-check" data-id="m365" ${q.addons.m365 ? "checked" : ""}> Include M365 Business Premium licences</label>
          <label class="or-check-row"><input type="checkbox" data-sk="q-check" data-id="comanaged" ${q.addons.comanaged ? "checked" : ""}> Co-managed instead of a plan</label>
          <label class="or-check-row"><input type="checkbox" data-sk="q-waive" ${q.waive ? "checked" : ""}> 12-month agreement (onboarding waived)</label>
        </div>
        <table class="sk-quote"><tbody>${t.lines.map(([n, d, v]) => `<tr><td>${esc(n)}<br><span class="or-muted">${esc(d)}</span></td><td>${money(v)}</td></tr>`).join("")}
          <tr class="tot"><td>Monthly total (plus HST)</td><td>${money(t.monthly)}</td></tr>
          <tr><td class="or-muted">HST (13%)</td><td class="or-muted">${money(t.hst)}</td></tr>
          <tr><td>One-time onboarding</td><td>${t.waived ? `<s>${money(t.onboarding)}</s> waived` : money(t.onboarding)}</td></tr>
          <tr><td>First-year total (plus HST)</td><td>${money(t.monthly * 12 + (t.waived ? 0 : t.onboarding))}</td></tr></tbody></table>
      </section>`;
  }

  function marketHtml() {
    return `<section class="or-card"><h3>What Ontario MSPs charge (2026)</h3>
      <table class="sk-table"><thead><tr><th>Level</th><th>Price</th><th>What it usually means</th></tr></thead><tbody>
      ${MARKET.ranges.map(r => `<tr>${r.map(c => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table>
      <p class="or-muted">Midas suggested: Essentials ${money(packages()[0].price)} · Business ${money(packages()[1].price)} · Secure+ ${money(packages()[2].price)} per user per month.</p></section>
      <section class="or-card"><h3>Competitors near you</h3><div class="sk-comp">${MARKET.competitors.map(c => `<div>
        <b>${esc(c.name)}</b><span class="or-muted">${esc(c.where)}</span><strong>${esc(c.price)}</strong><p>${esc(c.notes)}</p><a href="${esc(c.url)}" target="_blank" rel="noopener">Their page ↗</a></div>`).join("")}</div>
        <p class="or-muted">From their public websites and pricing guides, September 2026. Check before quoting them to a client.</p></section>
      <div class="sk-cols">
        <section class="or-card"><h3>What's standard in every package now</h3><ul class="sk-list-sm">${MARKET.standard.map(x => `<li>${esc(x)}</li>`).join("")}</ul></section>
        <section class="or-card"><h3>How Midas wins</h3>${MARKET.edge.map(([h, t]) => `<div class="sk-agenda"><b>${esc(h)}</b><p>${esc(t)}</p></div>`).join("")}</section>
      </div>
      <section class="or-card"><h3>What your three industries need</h3><div class="sk-comp">${Object.values(MARKET.industries).map(i => `<div><b>${esc(i.title)}</b><ul class="sk-list-sm">${i.points.map(p => `<li>${esc(p)}</li>`).join("")}</ul><a href="${esc(i.url)}" target="_blank" rel="noopener">Source ↗</a></div>`).join("")}</div></section>
      <section class="or-card"><h3>Sources</h3><ul class="sk-list-sm">${MARKET.sources.map(([t, u]) => `<li><a href="${esc(u)}" target="_blank" rel="noopener">${esc(t)}</a></li>`).join("")}</ul></section>`;
  }

  // ── presenting ──
  let overlay = null;
  function present(from) {
    const s = slides();
    state.slide = Math.min(Math.max(0, from || 0), s.length - 1);
    overlay = document.createElement("div");
    overlay.className = "sk-present";
    overlay.tabIndex = -1;
    overlay.innerHTML = `<div class="sk-stage"><div class="sk-slide-wrap"><div class="sk-slide"></div></div></div>
      <div class="sk-notes-pane" hidden></div>
      <div class="sk-controls"><button type="button" data-p="prev" aria-label="Previous">‹</button><span class="sk-count"></span>
        <button type="button" data-p="next" aria-label="Next">›</button><button type="button" data-p="notes">Notes</button><button type="button" data-p="exit">Exit</button></div>`;
    document.body.appendChild(overlay);
    const show = () => {
      const all = slides();
      const sl = all[state.slide];
      const box = overlay.querySelector(".sk-slide");
      box.className = `sk-slide ${sl.cls || ""}`;
      box.innerHTML = sl.html;
      overlay.querySelector(".sk-count").textContent = `${state.slide + 1} / ${all.length}`;
      overlay.querySelector(".sk-notes-pane").textContent = sl.notes || "";
    };
    const move = d => { state.slide = Math.min(Math.max(0, state.slide + d), slides().length - 1); show(); };
    const close = () => {
      document.removeEventListener("keydown", onKey);
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      overlay?.remove(); overlay = null;
    };
    const onKey = e => {
      if (!overlay) return;
      if (["ArrowRight", "PageDown", " "].includes(e.key)) { e.preventDefault(); move(1); }
      else if (["ArrowLeft", "PageUp"].includes(e.key)) { e.preventDefault(); move(-1); }
      else if (e.key === "Escape") close();
      else if (e.key.toLowerCase() === "n") { const p = overlay.querySelector(".sk-notes-pane"); p.hidden = !p.hidden; }
    };
    overlay.addEventListener("click", e => {
      const b = e.target.closest("[data-p]");
      if (!b) { if (!e.target.closest(".sk-notes-pane")) move(1); return; }
      const a = b.dataset.p;
      if (a === "prev") move(-1); else if (a === "next") move(1); else if (a === "exit") close();
      else if (a === "notes") { const p = overlay.querySelector(".sk-notes-pane"); p.hidden = !p.hidden; }
    });
    document.addEventListener("keydown", onKey);
    document.addEventListener("fullscreenchange", function fs() { if (!document.fullscreenElement && overlay) { document.removeEventListener("fullscreenchange", fs); } });
    show();
    overlay.requestFullscreen?.().catch(() => {});
    overlay.focus();
  }

  // ── quote output ──
  function quoteText() {
    const t = quoteTotals();
    return [`Quote for ${prospect() || "(company)"} — ${COMPANY.name}`, `Date: ${new Date().toLocaleDateString("en-CA")}`, "",
      ...t.lines.map(([n, d, v]) => `${n}: ${d} = ${money(v)}/month`), "",
      `Monthly total: ${money(t.monthly)} + HST`,
      `One-time onboarding: ${t.waived ? `waived with a 12-month agreement (normally ${money(t.onboarding)})` : money(t.onboarding)}`,
      `First-year total: ${money(t.monthly * 12 + (t.waived ? 0 : t.onboarding))} + HST`, "",
      ...TERMS.map(x => `• ${x}`), "",
      `${COMPANY.owner} · ${COMPANY.phone} · ${COMPANY.email} · ${COMPANY.web}`].join("\n");
  }
  function printQuote() {
    const t = quoteTotals();
    const w = window.open("", "_blank");
    if (!w) return host.toast("Allow pop-ups to print the quote.", "error");
    const pkg = state.quote.addons.comanaged ? null : t.pkg;
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Quote — ${esc(prospect() || "Midas Tech")}</title>
<style>body{font-family:Segoe UI,Arial,sans-serif;color:#333;max-width:760px;margin:32px auto;padding:0 24px;line-height:1.5}
header{display:flex;justify-content:space-between;align-items:center;border-bottom:4px solid #00AEEF;padding-bottom:14px;margin-bottom:22px}
header img{height:54px} h1{color:#0072BC;font-size:26px;margin:0 0 4px} h2{color:#0072BC;font-size:17px;margin:24px 0 8px}
table{width:100%;border-collapse:collapse} td{padding:9px 6px;border-bottom:1px solid #e3e3e3;vertical-align:top} td:last-child{text-align:right;white-space:nowrap}
.tot td{font-weight:700;border-top:2px solid #0072BC;color:#0072BC} small{color:#808080} ul{padding-left:20px} li{margin:3px 0}
footer{margin-top:30px;padding-top:12px;border-top:1px solid #ddd;color:#4D4D4D;font-size:12.5px}</style></head><body>
<header><div><h1>IT Services Quote</h1><div>Prepared for <b>${esc(prospect() || "")}</b> · ${esc(new Date().toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" }))}</div></div><img src="${location.href.replace(/[^/]*$/, "")}midas-logo.png" alt="Midas Tech" onerror="this.remove()"></header>
<table>${t.lines.map(([n, d, v]) => `<tr><td>${esc(n)}<br><small>${esc(d)}</small></td><td>${money(v)} / month</td></tr>`).join("")}
<tr class="tot"><td>Monthly total (plus HST)</td><td>${money(t.monthly)}</td></tr>
<tr><td>One-time onboarding</td><td>${t.waived ? `<s>${money(t.onboarding)}</s> waived` : money(t.onboarding)}</td></tr>
<tr><td>First-year total (plus HST)</td><td>${money(t.monthly * 12 + (t.waived ? 0 : t.onboarding))}</td></tr></table>
${pkg ? `<h2>What's included in ${esc(pkg.name)}</h2><ul>${pkg.features.map(f => `<li>${esc(f)}</li>`).join("")}</ul>` : ""}
<h2>Terms</h2><ul>${TERMS.map(x => `<li>${esc(x)}</li>`).join("")}</ul>
<p>This quote is valid for 30 days.</p>
<footer><b>${esc(COMPANY.name)}</b> · ${esc(COMPANY.tagline)}<br>${esc(COMPANY.address)}<br>${esc(COMPANY.owner)} · ${esc(COMPANY.phone)} · ${esc(COMPANY.email)} · ${esc(COMPANY.web)}<br>
LinkedIn ${esc(COMPANY.linkedin)} · Instagram ${esc(COMPANY.instagram)} · Facebook ${esc(COMPANY.facebook)}</footer>
<script>window.onload=()=>setTimeout(()=>window.print(),300)<\/script></body></html>`);
    w.document.close();
  }
  async function copy(text, label) {
    try { await navigator.clipboard.writeText(text); host.toast(`${label} copied`, "success"); }
    catch { host.toast("Copy was blocked. Select the text instead.", "error"); }
  }

  let savePricesTimer = null;
  function savePrices() {
    clearTimeout(savePricesTimer);
    savePricesTimer = setTimeout(() => {
      host.saveSettings({ packages: packages().map(p => ({ id: p.id, price: p.price })), addons: addons().map(a => ({ id: a.id, price: a.price })) })
        .then(() => host.toast("Prices saved", "success")).catch(() => {});
    }, 900);
  }

  // ── events (delegated, so the panel can be re-drawn freely) ──
  document.addEventListener("click", e => {
    const t = e.target.closest("[data-sk]");
    if (!t || !root?.contains(t)) return;
    const a = t.dataset.sk;
    if (a === "tab") { state.tab = t.dataset.v; remember(); draw(); }
    else if (a === "present") present(Number(t.dataset.v || 0));
    else if (a === "answer") { const id = t.dataset.id; state.answers[id] = state.answers[id] === t.dataset.v ? undefined : t.dataset.v; if (!state.answers[id]) delete state.answers[id]; draw(); }
    else if (a === "clear-assessment") { if (confirm("Clear the answers and notes?")) { state.answers = {}; state.notes = ""; draw(); } }
    else if (a === "save-assessment") {
      const l = lead(); if (!l) return;
      const res = assessmentScore(state.answers);
      host.saveAssessment(l.id, { answers: { ...state.answers }, notes: state.notes, score: res.score, level: res.level, gaps: res.gaps.map(g => g.q), date: new Date().toISOString() })
        .then(() => host.toast("Assessment saved to the lead", "success")).catch(err => host.toast(err?.message || "Couldn't save", "error"));
    }
    else if (a === "copy-followup") { const l = lead(); copy(FOLLOWUP_EMAIL(l ? String(l.name || "").split(" ")[0] : "", prospect()), "Email"); }
    else if (a === "copy-quote") copy(quoteText(), "Quote");
    else if (a === "print-quote") printQuote();
  });
  document.addEventListener("change", e => {
    const t = e.target.closest("[data-sk]");
    if (!t || !root?.contains(t)) return;
    const a = t.dataset.sk;
    if (a === "lead") {
      state.leadId = t.value;
      const l = lead();
      state.answers = l?.assessment?.answers ? { ...l.assessment.answers } : {};
      state.notes = l?.assessment?.notes || "";
      remember(); draw();
    } else if (a === "industry") { state.industry = t.value; remember(); draw(); }
    else if (a === "company") draw();
    else if (a === "q-pkg") { state.quote.pkg = t.value; remember(); draw(); }
    else if (a === "q-users") { state.quote.users = Math.max(1, Number(t.value) || 1); remember(); draw(); }
    else if (a === "q-addon") { state.quote.addons[t.dataset.id] = Math.max(0, Number(t.value) || 0); remember(); draw(); }
    else if (a === "q-check") { state.quote.addons[t.dataset.id] = t.checked; remember(); draw(); }
    else if (a === "q-waive") { state.quote.waive = t.checked; remember(); draw(); }
    else if (a === "price") { state.packages = packages().map(p => p.id === t.dataset.id ? { ...p, price: Math.max(0, Number(t.value) || 0) } : p); savePrices(); draw(); }
    else if (a === "addon-price") { state.addons = addons().map(x => x.id === t.dataset.id ? { ...x, price: Math.max(0, Number(t.value) || 0) } : x); savePrices(); draw(); }
  });
  document.addEventListener("input", e => {
    const t = e.target.closest("[data-sk]");
    if (!t || !root?.contains(t)) return;
    if (t.dataset.sk === "notes") state.notes = t.value;
    if (t.dataset.sk === "company") { state.company = t.value; remember(); }
  });

  window.SalesKit = { render, _test: { assessmentScore, quoteTotals, slides, state } };
})();
