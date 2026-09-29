// Sales Kit for the Midas Tech lead tracker: a meeting deck you can present full screen, a meeting
// guide (agenda, discovery questions, a quick assessment you fill in live, objection handling),
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
      ["Owner-led and local", "Clients deal with Ali directly, based in Richmond Hill and on-site across the GTA, not a ticket queue. Bigger MSPs can't offer that."],
      ["Priced below the big names", "$89–189 against $180–250 at the larger Ontario MSPs, for the same core security."],
      ["Three niches, spoken fluently", "Healthcare (PHIPA), accounting (CRA EFILE, tax season) and warehouses (uptime, scanners, Wi-Fi). Lead with the industry, not \"IT services\"."],
      ["Easy yes", "Free 15-minute assessment, month-to-month option, and onboarding fee waived on a 12-month agreement."],
      ["Since 2010", "16 years of Ontario small-business IT."]
    ],
    industries: {
      healthcare: { title: "Healthcare clinics (medical, dental, physio)", points: ["PHIPA: role-based access, encryption at rest and in transit, access logging, a written breach response plan, prompt breach notification", "Since 2024 Ontario's privacy commissioner can fine up to $500,000 per organization under PHIPA; the first fines were issued in 2025", "Dentists: RCDSO's electronic records guidelines expect safeguards against theft, loss and unauthorized access, and staff training", "Practice software and imaging support (EMR, Dentrix, ABELDent and similar)", "Tested backups with a clear time to be seeing patients again"], url: "https://www.ipc.on.ca/en/media-centre/news-releases/administrative-monetary-penalties-under-personal-health-information-protection-act" },
      accounting: { title: "Accounting and bookkeeping firms", points: ["CRA requires MFA for EFILE and Represent a Client, and safeguards on taxpayer data; unauthorized access must be reported to the CRA", "Records kept 6 years; PIPEDA breach reporting", "CPA Ontario practice inspection expects documented technology controls", "Tax-season phishing and business email compromise are the big risks"], url: "https://fusioncomputing.ca/cra-efile-it-controls/" },
      law: { title: "Law firms", points: ["LSO Rule 3.1-2: reasonable precautions to protect confidential client information; the LSO publishes a cybersecurity checklist and model policies", "Business email compromise targets trust accounts: fake wire instructions from \"clients\" or opposing counsel", "MFA, anti-spoofing email settings and a phone call before any wire are the must-haves", "By-Law 9 trust-accounting records must stay intact and recoverable"], url: "https://lso.ca/lawyers/technology-resource-centre/practice-resources-and-supports/cybersecurity-and-fraud" },
      warehouse: { title: "Warehouses and logistics", points: ["Uptime: WMS/TMS, scanners, label printers and dock Wi-Fi", "Network segmentation so a hacked camera or guest Wi-Fi can't reach the office", "Supplier payment fraud: confirm banking changes by phone", "Multi-site networking and 24/7 support around shifts"], url: "https://fusioncomputing.ca/transport-logistics/" }
    },
    stats: [
      ["CA$7.11M", "Average cost of a data breach for Canadian organizations in 2026, up from $6.98M in 2025 (IBM)", "https://www.bnnbloomberg.ca/business/technology/2026/07/29/average-canadian-data-breach-costs-and-detection-times-are-rising-ibm-report/"],
      ["205 days", "Average time to find and contain a breach in Canada (IBM 2026)", "https://www.bnnbloomberg.ca/business/technology/2026/07/29/average-canadian-data-breach-costs-and-detection-times-are-rising-ibm-report/"],
      ["$1.2B", "What Canadian businesses spent recovering from cyber incidents in 2023, double 2021 (Statistics Canada)", "https://madeinca.ca/cyber-crime-canada-statistics/"],
      ["43%", "Canadian organizations hit by an attempted or successful cyber attack in the past year; 24% by ransomware, and 74% of those paid (CIRA 2025)", "https://www.cira.ca/en/resources/documents/cybersecurity/2025-cybersecurity-survey/"],
      ["#1", "Phishing and business email compromise: the most common way in and the costliest incident for small businesses", "https://www.cloudforces.ca/blog/ibm-cost-data-breach-2026-canadian-smbs"]
    ],
    // Reasons a business will act now rather than "someday".
    triggers: [
      ["Cyber insurance renewal", "Canadian insurers now ask 40–80 security questions and require MFA, managed EDR, tested backups, an incident plan and training, with no small-business exception. Missing MFA is the most common reason for a decline, and a wrong answer can void a claim.", "https://www.nfd.ca/company-blog/cyber-insurance-renewal-2026-canadian-checklist"],
      ["Windows 10 is out of support", "Security updates ended October 14, 2025. Extended updates cost US$61 per PC in year one and double each year. Any Windows 10 PC is an easy sale for a Windows 11 upgrade project.", "https://learn.microsoft.com/en-us/windows/whats-new/extended-security-updates"],
      ["Microsoft 365 prices went up", "From July 1, 2026 Business Basic rose about 17% and Business Standard about 12% at renewal. A licence review often pays for part of the plan.", "https://www.beadaptive.ca/latest/m365-price-increase-jul-2026/"],
      ["Privacy fines are real now", "PHIPA fines up to $500,000 per organization (first ones issued August 2025). PIPEDA: breaches must be reported and logged for 24 months, with fines up to $100,000 per violation.", "https://www.priv.gc.ca/en/privacy-topics/privacy-for-businesses/privacy-breaches-at-your-business/gd_pb_201810/"],
      ["Their MSP was bought or went quiet", "About 30% of businesses switch IT providers within 3–5 years, mostly over slow response and being reactive. Private-equity roll-ups often change the team and prices within 1–2 years.", "https://www.inky.com/en/blog/12-reasons-companies-switch-managed-service-providers-msps"],
      ["\"Made in Canada\" matters", "82% of Canadian security buyers say country of origin now matters more; 56% have reconsidered U.S. vendors. A local Richmond Hill company with Canadian data storage is a selling point.", "https://www.cira.ca/en/resources/news/cybersecurity/why-canadian-organizations-are-prioritizing-made-in-canada-cyber-solutions/"],
      ["Tax season (accounting firms)", "January–April is when phishing peaks and downtime hurts most. Pitch accounting firms in the fall.", "https://fusioncomputing.ca/cra-efile-it-controls/"]
    ],
    insurance: ["MFA on email, remote access, admin accounts and cloud apps, enforced, not optional", "Managed EDR (e.g. Microsoft Defender for Business, SentinelOne) watched 24/7", "Backups that can't be changed or deleted, stored in Canada, with a restore tested in the last 90 days", "A written incident response plan", "Security awareness training for all staff", "Patching and supported operating systems (no Windows 10)"],
    switching: ["Slow response and problems that keep coming back", "Only reactive: they fix things but never ask why they broke", "Surprise invoices on top of the monthly fee", "No security or industry expertise", "No plan or regular review", "Their provider was acquired and the service changed"],
    cybersecure: "The federal CyberSecure Canada program certifies small businesses against 13 baseline controls from the Canadian Centre for Cyber Security: incident response plan, automatic patching, secure configuration, strong authentication and MFA, staff training, backups, secure mobile, perimeter defences, malware protection, secure cloud and outsourced IT, secure websites, access control, and portable media. Secure+ covers these, so it's a natural path to certification for clients who need to prove their security to customers.",
    pricing: ["Show three plans and let them choose. Most buyers pick the middle one, so Business is the plan you want to sell; Secure+ makes it look reasonable.", "Quote a fixed monthly price after the assessment. Surprise invoices are one of the top reasons clients leave.", "Keep M365 licences at cost and separate, so your price compares fairly with competitors who list them separately.", "Waive onboarding for a 12-month agreement instead of discounting the monthly price."],

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
      ["Microsoft 365 Business Premium pricing (Microsoft Canada)", "https://www.microsoft.com/en-ca/microsoft-365/business/microsoft-365-business-premium"],
      ["2025 CIRA Cybersecurity Survey", "https://www.cira.ca/en/resources/documents/cybersecurity/2025-cybersecurity-survey/"],
      ["Cyber insurance renewal 2026: what Canadian underwriters require (NFD)", "https://www.nfd.ca/company-blog/cyber-insurance-renewal-2026-canadian-checklist"],
      ["Baseline cyber security controls for small and medium organizations (Canadian Centre for Cyber Security)", "https://www.cyber.gc.ca/en/guidance/baseline-cyber-security-controls-small-and-medium-organizations"],
      ["National Cyber Threat Assessment 2025–2026 (Canadian Centre for Cyber Security)", "https://www.cyber.gc.ca/en/guidance/national-cyber-threat-assessment-2025-2026"],
      ["PHIPA administrative monetary penalties (IPC Ontario)", "https://www.ipc.on.ca/en/media-centre/news-releases/administrative-monetary-penalties-under-personal-health-information-protection-act"],
      ["Mandatory breach reporting under PIPEDA (Office of the Privacy Commissioner)", "https://www.priv.gc.ca/en/privacy-topics/privacy-for-businesses/privacy-breaches-at-your-business/gd_pb_201810/"],
      ["Cybersecurity and fraud for lawyers (Law Society of Ontario)", "https://lso.ca/lawyers/technology-resource-centre/practice-resources-and-supports/cybersecurity-and-fraud"],
      ["Electronic records management guidelines (RCDSO)", "https://cdn.agilitycms.com/rcdso/pdf/guidelines/RCDSO_Guidelines_Electronic_Records_Management.pdf"],
      ["Windows 10 Extended Security Updates (Microsoft)", "https://learn.microsoft.com/en-us/windows/whats-new/extended-security-updates"],
      ["Microsoft 365 prices going up July 1, 2026 (Adaptive)", "https://www.beadaptive.ca/latest/m365-price-increase-jul-2026/"],
      ["12 reasons companies switch MSPs (INKY)", "https://www.inky.com/en/blog/12-reasons-companies-switch-managed-service-providers-msps"],
      ["MSP pricing guide: security-inclusive tiers (N-able)", "https://www.n-able.com/blog/msp-pricing-guide"]
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
    ["windows", "Are all computers on Windows 11 (no Windows 10 left)?", "Windows 10 stopped getting free security updates in October 2025.", 2],
    ["support", "When something breaks, do you know exactly who to call and how fast they'll respond?", "Downtime costs more than support.", 1]
  ];
  const ANSWER_SCORE = { yes: 1, unsure: 0.3, no: 0 };

  const DISCOVERY = [
    ["Your business", ["Tell me about the business: how many people, how many locations?", "What does a normal day look like for your team? What software can't you work without?", "Are you growing, hiring, or opening anything new this year?"]],
    ["Current IT", ["Who looks after your IT today? An in-house person, a provider, or whoever is handy?", "What do you like about how it works now? What drives you crazy?", "When something breaks, how long does it usually take to fix?", "Are you on Microsoft 365 or Google Workspace? Any servers in the office?"]],
    ["Security", ["Have you or anyone you know had a scare: a hacked email, a fake invoice, ransomware?", "If a staff email account was taken over tonight, how would you know?", "Do you have cyber insurance? When does it renew, and did the last application ask about MFA, EDR or backups?"]],
    ["Backup and downtime", ["If your main system went down tomorrow morning, what would it cost you per hour?", "When did someone last restore something from backup?"]],
    ["Compliance", ["Do you answer to a regulator or professional body: PHIPA, CRA EFILE, CPA Ontario, the Law Society?", "Has a client, insurer or auditor asked for proof of your security?"]],
    ["Priorities and decision", ["If you could fix one IT thing this month, what would it be?", "Who else is involved in a decision like this?", "When does your current contract or arrangement renew?", "Are any computers still on Windows 10?", "What would make this a clear yes for you?"]]
  ];
  const AGENDA = [
    ["Before the meeting (15 min)", ["Open the lead in the tracker: read research, website scan and past activity", "Pick the lead in this Sales Kit so the deck shows their name and industry", "Look up their Google reviews and LinkedIn for small talk", "Have your Bookings link and a notepad ready"]],
    ["Open (2 min)", ["Thank them, confirm the time: \"I've got 20 minutes blocked, does that still work?\"", "Set the agenda: \"I'll ask a few questions, share what we see in your industry, and if it makes sense, talk next steps. Sound good?\""]],
    ["Discover (10 min)", ["Ask, don't pitch. Aim for them talking 70% of the time", "Use the discovery questions below; when they name a problem, ask \"why is that a problem?\"", "Run the quick assessment together; it makes the risks concrete"]],
    ["Show (5–8 min)", ["Fill in \"What we heard\" and the downtime numbers as they talk, so the deck uses their words and their maths", "Present: what we heard → what it could cost → where you stand → how we'd fix it → options → next step", "Skip any slide that doesn't fit. Stop and ask a question after every two or three slides"]],
    ["Agree next steps (3 min)", ["Offer the free full assessment (a site visit or remote review)", "Promise a written proposal within 48 hours", "Book the follow-up before you hang up"]],
    ["After (same day)", ["Log the meeting in the tracker and set the status to Qualified or Proposal", "Send the thank-you email below with a summary and the proposal date", "Build the quote in Packages and send it within 48 hours"]]
  ];
  const OBJECTIONS = [
    ["\"We already have an IT guy / provider.\"", "That's great, most of our clients did too. Can I ask how they handle security after hours, and when they last tested a restore? Many businesses keep their person for day-to-day and add us for security and backup (co-managed). The free assessment gives you a second opinion either way."],
    ["\"It's too expensive.\"", "Fair. Compared to what? One day of downtime or one fake invoice usually costs more than a year of the plan. We can also start with Essentials and grow into Business. And there's no long contract: month to month with 30 days' notice."],
    ["\"We're too small to be a target.\"", "Most attacks aren't aimed at anyone. They're automated emails and password guesses sent to thousands of small businesses at once, because small businesses have less protection. That's exactly who they catch."],
    ["\"We need to think about it / talk to my partner.\"", "Of course. What would you want to be sure of before deciding? Would it help if I sent a one-page summary and joined a 15-minute call with your partner this week?"],
    ["\"We had a bad experience with an MSP.\"", "I'm sorry to hear that. What went wrong? (Listen.) That's why you'd deal with me directly, we put response times in writing, and you can leave with 30 days' notice if we don't deliver."],
    ["\"We have cyber insurance, so we're covered.\"", "Good, that's smart. Insurers now require MFA, managed EDR, tested backups and an incident plan, and if the application doesn't match reality, they can refuse the claim. Let's check your answers against what you actually have, so the policy pays when you need it."],
    ["\"Microsoft keeps our email safe / it's all in the cloud.\"", "Microsoft keeps its servers running, but securing your accounts is your job: MFA, who has access, and backups. Deleted or encrypted email is only recoverable for a short time without a separate backup."],
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
    answers: {}, notes: "", heard: {}, cost: {}, proof: null, extras: false, quote: { pkg: "business", users: 10, addons: {}, waive: true }, slide: 0,
    scanDomain: "", scan: null, scanning: false, scanError: "" };
  try { Object.assign(state, JSON.parse(localStorage.getItem("midas-saleskit-ui") || "{}"), { slide: 0 }); } catch {}
  const remember = () => { try { localStorage.setItem("midas-saleskit-ui", JSON.stringify({ tab: state.tab, leadId: state.leadId, company: state.company, industry: state.industry, quote: state.quote, extras: state.extras })); } catch {} };

  const packages = () => state.packages || DEFAULT_PACKAGES;
  const addons = () => state.addons || DEFAULT_ADDONS;
  const lead = () => (host?.leads() || []).find(l => l.id === state.leadId) || null;
  const prospect = () => { const l = lead(); return l?.company || state.company || ""; };
  function industry() { const l = lead(); return l ? host.industryOf(l) : state.industry; }

  function loadFromLead(l) {
    const a = l?.assessment || {};
    state.answers = a.answers ? { ...a.answers } : {};
    state.notes = a.notes || "";
    state.heard = a.heard ? { ...a.heard } : {};
    state.cost = a.cost ? { ...a.cost } : {};
  }
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
    return { score, answered, gaps, level: !answered ? "Not started" : score >= 80 ? "Good" : score >= 55 ? "Some gaps" : "At risk" };
  }
  function recommendedPackage() {
    // Regulated industries need the compliance extras; everyone else is best served by Business.
    return ["healthcare", "accounting", "law"].includes(industry()) ? "secure" : "business";
  }

  // ── slides ──
  // Built the way the MSP sales research says works: the prospect is the hero, not Midas. It opens by
  // mirroring what they said, puts a number on the cost of the problem (their numbers), shows where they
  // stand and what good looks like, maps each gap to a fix, then proof, options, and one clear next step.
  const GAP_FIX = {
    mfa: ["Multi-factor sign-in on every account, shared mailboxes included", "Week 1"],
    edr: ["Managed antivirus (EDR) on every computer, watched 24/7", "Week 1"],
    leavers: ["A same-day checklist for switching off leavers' accounts", "Week 1"],
    payments: ["A phone-confirmation rule for payment changes, and spoofing protection on your email", "Week 1"],
    support: ["One number to call, with response times in writing", "Day 1"],
    backup: ["Automatic off-site backups, with a test restore every quarter", "Week 2"],
    m365backup: ["A separate Microsoft 365 backup, stored in Canada", "Week 2"],
    patch: ["Automatic Windows and app updates, checked every week", "Week 2"],
    admin: ["Everyday accounts without admin rights", "Week 3"],
    training: ["Short security training and practice phishing emails", "Month 2"],
    firewall: ["A business firewall, with guest Wi-Fi kept separate", "Month 2"],
    plan: ["A one-page incident response plan, tested once a year", "Month 2"],
    windows: ["Replace or upgrade the Windows 10 computers", "Month 2"]
  };
  const DOMAIN_RISKS = ["no_dmarc", "dmarc_none", "no_spf", "weak_spf"];
  const RISK_TILE = {
    healthcare: ["Up to $500,000", "What Ontario's privacy commissioner can now fine a clinic under PHIPA. The first fines were issued in 2025."],
    law: ["Your trust account", "Fake wire instructions are aimed at trust funds. The Law Society expects reasonable precautions."],
    generic: ["A refused claim", "If your cyber insurance application doesn't match what you really have, the insurer can refuse to pay."]
  };
  const lines = t => String(t || "").split(/\n+/).map(x => x.replace(/^[-•*]\s*/, "").trim()).filter(Boolean);
  const possessive = n => /s$/i.test(n) ? `${n}'` : `${n}'s`;

  function slides() {
    const co = prospect();
    const coName = co || "your business";
    const ind = industry();
    const ic = MARKET.industries[ind];
    const l = lead();
    const res = assessmentScore(state.answers);
    const dc = l?.domainCheck && DOMAIN_RISKS.includes(l.domainCheck.finding) ? l.domainCheck : null;
    const date = new Date().toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" });
    const who = l?.name && l.name !== l.company ? l.name : "";
    const list = [];

    list.push({ cls: "sk-s-title", html: `<img src="midas-logo.png" alt="Midas Tech" class="sk-logo" onerror="this.remove()">
      <p class="sk-kicker">IT and security review</p>
      <h1>${esc(coName)}</h1>
      <p class="sk-sub">${who ? `Prepared for ${esc(who)} · ` : ""}${esc(date)}</p>
      <p class="sk-meta">${esc(COMPANY.owner)} · ${esc(COMPANY.name)}</p>`,
      notes: "Keep this up while you chat. Confirm the time you have, then: \"I'd like to start by making sure I understood what you told me.\"" });

    const heard = state.heard || {};
    const col = (title, text, hint) => {
      const items = lines(text);
      return `<div><b>${title}</b>${items.length ? `<ul>${items.slice(0, 4).map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : `<span class="sk-hint">${hint}</span>`}</div>`;
    };
    list.push({ html: `<h2>What we heard</h2><div class="sk-grid3 sk-heard">
      ${col("What you want", heard.goals, "Their goals, in their words")}
      ${col("What's getting in the way", heard.pains, "What frustrates them about IT today")}
      ${col("What's coming up", heard.coming, "Renewals, hiring, moves, audits")}</div>`,
      notes: "Read it back and ask: \"Did I get that right? Anything I missed?\" This slide earns the right to show the rest. Fill it in on the Meeting guide tab as they talk." });

    const staff = Math.max(1, Number(state.cost?.staff) || Number(state.quote?.users) || 10);
    const rate = Math.max(1, Number(state.cost?.rate) || 40);
    const dayCost = staff * rate * 8;
    const risk = RISK_TILE[ind] || RISK_TILE.generic;
    list.push({ html: `<h2>What it could cost ${esc(coName)}</h2><div class="sk-stats sk-c3">
      <div><b>${money(dayCost)}</b><span>in staff time for one day of downtime (${staff} people × ${money(rate)}/hour × 8 hours), before any lost sales</span></div>
      <div><b>The full amount</b><span>of a fake invoice or banking-change email that gets paid. Once the money has left, it's rarely recovered.</span></div>
      <div><b>${esc(risk[0])}</b><span>${esc(risk[1])}</span></div></div>
      <p class="sk-foot">Downtime estimate uses your numbers. Change them in the Meeting guide.</p>`,
      notes: "Ask for their numbers first: \"Roughly how many people would stop working, and what's an average hourly cost?\" It's their maths, not a scary statistic. Then: \"What would a day like that do to your clients?\"" });

    const standRows = [];
    if (dc) standRows.push(`<li><b>Your email domain:</b> we checked ${esc(dc.domain)}. ${esc(dc.summary)}.</li>`);
    res.gaps.slice(0, dc ? 3 : 4).forEach(g => standRows.push(`<li><b>${esc(g.q.replace(/\?$/, ""))}:</b> ${g.a === "no" ? "no" : "not sure"}. ${esc(g.why)}</li>`));
    list.push({ html: `<h2>Where you stand today</h2>${res.answered ? `<div class="sk-score"><div class="sk-ring" style="--p:${res.score}"><b>${res.score}</b><span>/ 100</span></div>
      <div><p class="sk-level l-${res.level.replace(/\s/g, "")}">${esc(res.level)}</p><p>From the ${res.answered} questions we went through together</p></div></div>` : ""}
      ${standRows.length ? `<ul class="sk-list">${standRows.join("")}</ul>` : res.answered ? `<p class="sk-sub">No gaps found. Nice work.</p>` : `<p class="sk-sub">Go through the quick assessment on the Meeting guide tab together, and the score and gaps appear here.</p>`}`,
      notes: "Talk about the top 2 or 3 only. Ask: \"Which of these worries you most?\" Let them rank it. If the email domain finding is there, it's an objective fact from public records, not an opinion." });

    list.push({ html: `<h2>What good looks like</h2><div class="sk-grid2">
      <div><b>🔒 Protected</b><span>A stolen password or a fake email doesn't turn into a breach.</span></div>
      <div><b>♻️ Recoverable</b><span>If something goes wrong, you're working again in hours, not days, and you've tested it.</span></div>
      <div><b>📞 Supported</b><span>Your team knows who to call and gets a real person fast.</span></div>
      <div><b>🗓️ Planned</b><span>A yearly plan and budget, with answers ready for your ${ind === "healthcare" ? "privacy obligations and insurer" : ind === "accounting" ? "insurer and the CRA" : ind === "law" ? "insurer and the Law Society" : "insurer"}.</span></div></div>`,
      notes: "Ask: \"If this were true for you a few months from now, what would be different?\" Let them describe it." });

    const fixes = [];
    if (dc) fixes.push(["Spoofing protection (DMARC and SPF) so no one can send email as you", "Week 1"]);
    res.gaps.forEach(g => { if (GAP_FIX[g.id]) fixes.push(GAP_FIX[g.id]); });
    const WHEN = ["Day 1", "Week 1", "Week 2", "Week 3", "Month 2"];
    fixes.sort((a, b) => WHEN.indexOf(a[1]) - WHEN.indexOf(b[1]));
    const plan = fixes.length ? fixes.slice(0, 6) : [["Walk through your setup and document everything", "Week 1"], ["Security baseline: MFA, managed antivirus, backups tested", "Week 2"], ["Meet every user; the help desk goes live", "Week 3"], ["Review: what we found, what we fixed, what's next", "Week 4"]];
    list.push({ html: `<h2>How we'd close the gaps</h2><table class="sk-tbl"><tbody>
      ${plan.map(([f, w]) => `<tr><td>${esc(f)}</td><td>${esc(w)}</td></tr>`).join("")}</tbody></table>
      <p class="sk-foot">Most of it happens in the first 30 days, out of hours where possible.</p>`,
      notes: "This is the bridge from their gaps to your plan. Point at the first two rows: \"These two alone remove most of the risk.\"" });

    const proof = state.proof || {};
    const rating = proof.rating || 5.0, reviews = proof.reviews || 35;
    list.push({ html: `<h2>Why businesses choose Midas Tech</h2><div class="sk-grid3">
      <div><b>★ ${esc(Number(rating).toFixed(1))} on Google</b><span>${esc(reviews)} reviews from local businesses</span></div>
      <div><b>Since ${COMPANY.founded}</b><span>looking after Ontario small businesses</span></div>
      <div><b>You deal with Ali</b><span>owner-led: someone who knows your business, not a ticket queue</span></div>
      <div><b>Local</b><span>based in Richmond Hill, on-site across the GTA</span></div>
      <div><b>Security first</b><span>Microsoft 365, backups in Canada, 24/7 monitoring</span></div>
      <div><b>${esc(ic ? ic.title.split(" (")[0] : "Small businesses")}</b><span>${esc(ind === "healthcare" ? "PHIPA and EMR systems" : ind === "accounting" ? "CRA EFILE and tax-season pressure" : ind === "law" ? "Law Society expectations and trust accounts" : ind === "warehouse" ? "uptime, scanners and dock Wi-Fi" : "the tools you use every day")}</span></div></div>`,
      notes: "60 seconds. The point: local, owner-led, security-first, and we know your industry." });

    const stories = (proof.stories || []).filter(x => x && (x.who || x.result));
    const story = stories.find(x => x.industry === ind) || stories[0];
    if (story) list.push({ html: `<h2>A client like you</h2><p class="sk-sub">${esc(story.who || "")}</p><div class="sk-grid3 sk-story">
      <div><b>Before</b><span>${esc(story.before || "")}</span></div><div><b>What we did</b><span>${esc(story.did || "")}</span></div><div><b>Result</b><span>${esc(story.result || "")}</span></div></div>
      ${story.quote ? `<blockquote class="sk-quote-s">“${esc(story.quote)}”${story.by ? `<cite>${esc(story.by)}</cite>` : ""}</blockquote>` : ""}`,
      notes: "Tell it as a story, in 60 seconds. A client like them, the same problem, what changed. Offer to put them in touch if the client agreed." });

    const rec = recommendedPackage();
    list.push({ html: `<h2>Your options</h2><div class="sk-plans">${packages().map(p => `<div class="${p.id === rec ? "rec" : ""}">
      ${p.id === rec ? `<em>Recommended for you</em>` : ""}<b>${esc(p.name)}</b><strong>${money(p.price)}<small>/user/month</small></strong>
      <p class="sk-for">${esc(p.for)}</p>
      <ul>${p.features.slice(0, 4).map(f => `<li>${esc(f)}</li>`).join("")}</ul></div>`).join("")}</div>
      <p class="sk-foot">Plus HST. Microsoft 365 licences at cost. Already have in-house IT? Co-managed from ${money((addons().find(a => a.id === "comanaged") || {}).price || 69)}/user. Month to month, or 12 months with onboarding waived.</p>`,
      notes: "Point at the recommended plan and tie it to their top gaps. Don't read every line. Then stop talking and let them react." });

    list.push({ html: `<h2>Switching is easier than you think</h2><div class="sk-steps">
      <div><b>Week 1</b><span>we walk through everything and handle the handover with your current provider</span></div>
      <div><b>Week 2</b><span>security basics in place: MFA, antivirus, backups tested</span></div>
      <div><b>Week 3</b><span>we meet every user and the help desk goes live</span></div>
      <div><b>Week 4</b><span>review: what we found, what we fixed, what's next</span></div></div>
      <div class="sk-grid3 sk-promise"><div><b>No downtime</b><span>changes happen after hours</span></div><div><b>No lock-in</b><span>month to month, 30 days' notice</span></div><div><b>No surprise bills</b><span>one flat monthly fee</span></div></div>`,
      notes: "Most people's real worry is the switch itself. Say: \"We do the handover with your current provider, so you don't have to have an awkward conversation.\"" });

    if (state.extras) {
      list.push({ html: `<h2>What your cyber insurer will ask</h2><ul class="sk-list">${MARKET.insurance.map(x => `<li>${esc(x)}</li>`).join("")}</ul>
        <p class="sk-foot">Canadian insurers now ask these of small businesses too. A wrong answer on the application can mean a refused claim.</p>`,
        notes: "Offer to check their last insurance application against what they really have." });
      if (ic) list.push({ html: `<h2>What ${esc(ic.title.split(" (")[0].toLowerCase())} need to have in place</h2><ul class="sk-list">${ic.points.map(p => `<li>${esc(p)}</li>`).join("")}</ul>`,
        notes: "Ask: \"Which of these has come up for you?\"" });
    }

    // External security snapshot slide, when one has been run for this company's domain.
    const scan = state.scan;
    if (scan) {
      const open = scan.findings.filter(f => f.severity !== "good").slice(0, 5);
      list.push({ html: `<h2>Your public security snapshot</h2>
        <div class="sk-snap"><div class="sk-snap-grade g-${scan.grade.toLowerCase()}">${scan.grade}</div>
          <div><p class="sk-snap-sum">${esc(scanSummaryLine(scan))} <b>${scan.score}/100</b></p>
          ${open.length ? `<ul class="sk-list">${open.map(f => `<li><b>${esc(f.title)}</b> — ${esc(f.area)}</li>`).join("")}</ul>` : `<p>The public basics look well configured.</p>`}</div></div>
        <p class="sk-foot">${esc(scan.domain)} · public records only, nothing internal accessed.</p>`,
        notes: "This is from public records only. Say: \"I ran this before we met, on public information anyone can see. It's a snapshot, not a full audit — the full assessment is where we look inside.\"" });
    }
    list.push({ cls: "sk-s-title", html: `<h2>Next step</h2><ol class="sk-big">
      <li><b>Free full assessment</b><span>on-site or remote, about an hour. Let's pick a date now.</span></li>
      <li><b>Written proposal within 48 hours</b><span>a fixed monthly price, no surprises</span></li>
      <li><b>You decide</b><span>no pressure, and no long contract</span></li></ol>
      <p class="sk-contact">${esc(COMPANY.owner)} · ${esc(COMPANY.phone)} · ${esc(COMPANY.email)} · ${esc(COMPANY.web)}<br>${esc(COMPANY.address)}<br>LinkedIn ${esc(COMPANY.linkedin)} · Instagram ${esc(COMPANY.instagram)} · Facebook ${esc(COMPANY.facebook)}</p>`,
      notes: "Ask for the date, then stay quiet: \"What does your calendar look like next week for the full assessment?\" Book it before you leave." });
    return list;
  }

  // ── rendering ──
  const TABS = [["deck", "🎞️ Meeting deck"], ["guide", "🧭 Meeting guide"], ["security", "🔒 Security snapshot"], ["packages", "📦 Packages & quote"], ["market", "🔍 Market research"]];

  function render(el, h) {
    root = el; host = h;
    if (!state.settingsLoaded) {
      state.settingsLoaded = true;
      host.loadSettings().then(s => {
        if (s?.packages?.length) state.packages = DEFAULT_PACKAGES.map(p => ({ ...p, price: s.packages.find(x => x.id === p.id)?.price ?? p.price }));
        if (s?.proof) state.proof = s.proof;
        if (s?.addons?.length) state.addons = DEFAULT_ADDONS.map(a => ({ ...a, price: s.addons.find(x => x.id === a.id)?.price ?? a.price }));
        draw();
      }).catch(() => {});
    }
    const l = lead();
    if (l?.assessment && !Object.keys(state.answers).length) loadFromLead(l);
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
      <div class="sk-panel">${state.tab === "deck" ? deckHtml() : state.tab === "guide" ? guideHtml() : state.tab === "security" ? securityHtml() : state.tab === "packages" ? packagesHtml() : marketHtml()}</div>`;
  }

  function deckHtml() {
    const s = slides();
    const proof = state.proof || {};
    const stories = [0, 1, 2].map(i => (proof.stories || [])[i] || {});
    return `<div class="sk-deck-actions"><button class="btn btn-primary" type="button" data-sk="present">▶ Present full screen</button>
      <span class="or-muted">${s.length} slides · opens in a new tab · arrow keys to move · N shows your notes · F for full screen</span>
      <label class="or-check-row"><input type="checkbox" data-sk="extras" ${state.extras ? "checked" : ""}> Add extra slides (insurance questions, industry rules)</label></div>
      <details class="or-card sk-proof-edit"><summary><b>Your proof: Google rating and client stories</b> <span class="or-muted">${(proof.stories || []).filter(x => x && (x.who || x.result)).length} stories saved</span></summary>
        <p class="or-muted">Real results only. A story shows on the deck when you meet a business in the same industry (or the first story otherwise). Ask the client's permission before using their name.</p>
        <div class="sk-quote-form">
          <label>Google rating<input type="number" step="0.1" min="1" max="5" data-sk="proof" data-id="rating" value="${esc(proof.rating ?? 5.0)}"></label>
          <label>Number of reviews<input type="number" min="0" data-sk="proof" data-id="reviews" value="${esc(proof.reviews ?? 35)}"></label>
        </div>
        ${stories.map((st, i) => `<fieldset class="sk-story-edit"><legend>Story ${i + 1}</legend>
          <label>Industry<select data-sk="story" data-i="${i}" data-id="industry">${Object.entries(INDUSTRY_LABEL).map(([k, v]) => `<option value="${k}" ${st.industry === k ? "selected" : ""}>${esc(v)}</option>`).join("")}</select></label>
          <label>Who (can be anonymous)<input data-sk="story" data-i="${i}" data-id="who" value="${esc(st.who || "")}" placeholder="e.g. A 12-person dental clinic in Markham"></label>
          <label>Before<input data-sk="story" data-i="${i}" data-id="before" value="${esc(st.before || "")}" placeholder="e.g. Backups hadn't worked for 4 months"></label>
          <label>What we did<input data-sk="story" data-i="${i}" data-id="did" value="${esc(st.did || "")}" placeholder="e.g. New backup, MFA and managed antivirus"></label>
          <label>Result<input data-sk="story" data-i="${i}" data-id="result" value="${esc(st.result || "")}" placeholder="e.g. Passed their insurance renewal first time"></label>
          <label>Quote (optional)<input data-sk="story" data-i="${i}" data-id="quote" value="${esc(st.quote || "")}"></label>
          <label>Quote by<input data-sk="story" data-i="${i}" data-id="by" value="${esc(st.by || "")}" placeholder="e.g. Dr. S., clinic owner"></label></fieldset>`).join("")}
        <div class="or-edit-actions"><button class="btn btn-primary btn-sm" type="button" data-sk="save-proof">Save proof</button></div>
      </details>
      <div class="sk-thumbs">${s.map((sl, i) => `<button type="button" class="sk-thumb" data-sk="present" data-v="${i}" aria-label="Present from slide ${i + 1}">
        <div class="sk-slide-wrap"><div class="sk-slide ${sl.cls || ""}">${sl.html}</div></div><span>${i + 1}. ${(sl.html.match(/<h[12][^>]*>([^<]*)/) || [, ""])[1] /* already escaped */}</span></button>`).join("")}</div>`;
  }

  function guideHtml() {
    const res = assessmentScore(state.answers);
    const l = lead();
    return `<div class="sk-cols">
      <section class="or-card"><h3>How to run the meeting</h3>${AGENDA.map(([h, items]) => `<div class="sk-agenda"><b>${esc(h)}</b><ul>${items.map(i => `<li>${esc(i)}</li>`).join("")}</ul></div>`).join("")}</section>
      <section class="or-card"><h3>Discovery questions</h3><p class="or-muted">Pick 6–8. Listen more than you talk.</p>${DISCOVERY.map(([h, qs]) => `<div class="sk-agenda"><b>${esc(h)}</b><ul>${qs.map(q => `<li>${esc(q)}</li>`).join("")}</ul></div>`).join("")}</section>
    </div>
    <section class="or-card"><h3>What we heard</h3><p class="or-muted">Write it down as they talk, one point per line. It becomes the "What we heard" slide, so use their words.</p>
      <div class="sk-heard-form">
        <label>What they want<textarea data-sk="heard" data-id="goals" rows="3" placeholder="e.g. Stop worrying about ransomware&#10;Pass the insurance renewal">${esc(state.heard.goals || "")}</textarea></label>
        <label>What's getting in the way<textarea data-sk="heard" data-id="pains" rows="3" placeholder="e.g. Slow fixes from the current provider&#10;Nobody knows if backups work">${esc(state.heard.pains || "")}</textarea></label>
        <label>What's coming up<textarea data-sk="heard" data-id="coming" rows="3" placeholder="e.g. Insurance renews in March&#10;Hiring 3 people">${esc(state.heard.coming || "")}</textarea></label>
      </div>
      <div class="sk-quote-form sk-cost-form">
        <label>People who'd stop working if IT went down<input type="number" min="1" data-sk="cost" data-id="staff" value="${esc(state.cost.staff || "")}" placeholder="${esc(state.quote.users || 10)}"></label>
        <label>Average cost per person per hour ($)<input type="number" min="1" data-sk="cost" data-id="rate" value="${esc(state.cost.rate || "")}" placeholder="40"></label>
      </div></section>
    <section class="or-card"><div class="or-card-head"><div><h3>${ASSESSMENT.length}-point quick assessment</h3><p class="or-muted">Ask these together in the meeting. The score and top gaps appear on the deck.</p></div>
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
    return `<section class="or-card"><h3>Why now: reasons a business acts this year</h3><p class="or-muted">Open with whichever applies. These turn "someday" into "this quarter".</p>
      <div class="sk-comp">${MARKET.triggers.map(([t, d, u]) => `<div><b>${esc(t)}</b><p>${esc(d)}</p><a href="${esc(u)}" target="_blank" rel="noopener">Source ↗</a></div>`).join("")}</div></section>
      <div class="sk-cols">
        <section class="or-card"><h3>What cyber insurers require (2026)</h3><ul class="sk-list-sm">${MARKET.insurance.map(x => `<li>${esc(x)}</li>`).join("")}</ul>
          <p class="or-muted">Business and Secure+ cover all of these. Offer to check their insurance application.</p></section>
        <section class="or-card"><h3>Why businesses leave their IT provider</h3><ul class="sk-list-sm">${MARKET.switching.map(x => `<li>${esc(x)}</li>`).join("")}</ul>
          <p class="or-muted">Ask about these in discovery; each one is a promise you can make.</p></section>
      </div>
      <div class="sk-cols">
        <section class="or-card"><h3>CyberSecure Canada</h3><p>${esc(MARKET.cybersecure)}</p><a href="https://www.cyber.gc.ca/en/guidance/baseline-cyber-security-controls-small-and-medium-organizations" target="_blank" rel="noopener">Baseline controls ↗</a></section>
        <section class="or-card"><h3>Pricing strategy</h3><ul class="sk-list-sm">${MARKET.pricing.map(x => `<li>${esc(x)}</li>`).join("")}</ul></section>
      </div>
      <section class="or-card"><h3>What Ontario MSPs charge (2026)</h3>
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
      <section class="or-card"><h3>What your industries need</h3><div class="sk-comp">${Object.values(MARKET.industries).map(i => `<div><b>${esc(i.title)}</b><ul class="sk-list-sm">${i.points.map(p => `<li>${esc(p)}</li>`).join("")}</ul><a href="${esc(i.url)}" target="_blank" rel="noopener">Source ↗</a></div>`).join("")}</div></section>
      <section class="or-card"><h3>Sources</h3><ul class="sk-list-sm">${MARKET.sources.map(([t, u]) => `<li><a href="${esc(u)}" target="_blank" rel="noopener">${esc(t)}</a></li>`).join("")}</ul></section>`;
  }

  // ── external security snapshot ──
  // Enter a prospect's domain and get a branded, non-intrusive report from public records only
  // (email auth, DNSSEC, website security headers). It never claims anything that can't be seen from
  // outside. The report can be printed to PDF and added to the meeting deck.
  const SEV = { high: ["High", "sk-sev-high"], medium: ["Medium", "sk-sev-med"], low: ["Low", "sk-sev-low"], good: ["OK", "sk-sev-good"] };
  const scanDomainFor = () => {
    const l = lead();
    const raw = l?.email ? String(l.email).split("@")[1] : "";
    const web = l?.website ? String(l.website) : "";
    return (raw || web || state.scanDomain || "").replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "").trim();
  };
  async function runScan() {
    const domain = (state.scanDomain || scanDomainFor()).trim();
    if (!domain) { host.toast("Enter a company domain first, e.g. acme.ca", "error"); return; }
    if (typeof host.securityScan !== "function") { host.toast("The Railway service is needed for this.", "error"); return; }
    state.scanning = true; state.scanError = ""; draw();
    try {
      const scan = await host.securityScan(domain);
      state.scan = scan; state.scanDomain = domain;
      if (!scan) { state.scanError = "That doesn't look like a company domain (personal email domains are skipped)."; host.toast(state.scanError, "error"); }
    } catch (e) { state.scanError = e.message || "Couldn't run the snapshot."; host.toast(state.scanError, "error"); }
    state.scanning = false; draw();
  }
  const gradeClass = g => g === "A" ? "g-a" : g === "B" ? "g-b" : g === "C" ? "g-c" : g === "D" ? "g-d" : "g-f";
  function scanSummaryLine(scan) {
    const highs = scan.findings.filter(f => f.severity === "high").length;
    const meds = scan.findings.filter(f => f.severity === "medium").length;
    if (!highs && !meds) return "No high or medium issues found on the public checks.";
    const bits = [];
    if (highs) bits.push(`${highs} high-priority item${highs > 1 ? "s" : ""}`);
    if (meds) bits.push(`${meds} medium item${meds > 1 ? "s" : ""}`);
    return `${bits.join(" and ")} worth reviewing.`;
  }
  function findingsListHtml(scan) {
    const open = scan.findings.filter(f => f.severity !== "good");
    const good = scan.findings.filter(f => f.severity === "good");
    return `${open.length ? open.map(f => {
      const [lbl, cls] = SEV[f.severity];
      return `<div class="sk-finding"><span class="sk-sev ${cls}">${lbl}</span><div><b>${esc(f.area)}: ${esc(f.title)}</b><p>${esc(f.detail)}</p>${f.fix ? `<p class="sk-fix"><b>Fix:</b> ${esc(f.fix)}</p>` : ""}</div></div>`;
    }).join("") : `<p class="sk-sub">No issues found on the public checks. Nice.</p>`}
      ${good.length ? `<div class="sk-good-row">${good.map(f => `<span class="sk-sev sk-sev-good">✓ ${esc(f.title)}</span>`).join("")}</div>` : ""}`;
  }
  const notChecked = scan => Object.entries({ Email: scan.checked.email, DNS: scan.checked.dns, Website: scan.checked.website }).filter(([, v]) => !v).map(([k]) => k);
  function securityHtml() {
    const scan = state.scan;
    const suggested = scanDomainFor();
    return `<section class="or-card"><h3>External security snapshot</h3>
      <p class="or-muted">Enter a prospect's website domain. We read only public records — email authentication (SPF, DKIM, DMARC), DNSSEC, and the security headers their own website sends. Nothing internal is accessed and no scanning is done, so it's safe to run before a first meeting.</p>
      <div class="sk-scan-bar">
        <input data-sk="scan-domain" value="${esc(state.scanDomain || suggested)}" placeholder="acme.ca" aria-label="Company domain">
        <button class="btn btn-primary" type="button" data-sk="run-scan" ${state.scanning ? "disabled" : ""}>${state.scanning ? "Checking…" : "Run snapshot"}</button>
      </div>
      ${state.scanError ? `<p class="sk-scan-err">${esc(state.scanError)}</p>` : ""}
      ${state.scanning ? `<p class="sk-sub">Reading public records for ${esc(state.scanDomain || suggested)}…</p>` : ""}</section>
      ${scan ? `<section class="or-card sk-report">
        <div class="sk-report-head">
          <div><span class="sk-grade ${gradeClass(scan.grade)}">${esc(scan.grade)}</span></div>
          <div><h3>External Security Snapshot — ${esc(scan.domain)}</h3>
            <p class="or-muted">${esc(scanSummaryLine(scan))} Score ${scan.score}/100.${scan.provider ? ` Email hosted on ${esc(scan.provider)}.` : ""}</p>
            ${notChecked(scan).length ? `<p class="or-muted">Couldn't read: ${esc(notChecked(scan).join(", "))} (may be blocked or unavailable right now).</p>` : ""}</div>
          <div class="sk-report-actions"><button class="btn btn-secondary btn-sm" type="button" data-sk="print-report">🖨️ Print / PDF</button></div>
        </div>
        ${findingsListHtml(scan)}
        <p class="sk-report-note">${esc(scan.note)}</p>
        <p class="or-muted">This snapshot is now on a slide at the end of the meeting deck.</p>
      </section>
      <section class="or-card"><h3>Turn it into outreach</h3><p class="or-muted">A specific, true opening beats "would you like a free IT assessment?". For example:</p>
        <pre class="sk-pre">${esc(outreachFromScan(scan))}</pre>
        <button class="btn btn-secondary btn-sm" type="button" data-sk="copy-scan-email">Copy</button></section>` : ""}`;
  }
  function outreachFromScan(scan) {
    const top = scan.findings.find(f => f.severity === "high") || scan.findings.find(f => f.severity === "medium");
    const co = prospect() || scan.domain;
    const line = top ? `While getting ready, I did a quick check of ${scan.domain}'s public setup and noticed one thing worth flagging: ${top.title.toLowerCase()}. ${top.detail}` :
      `I did a quick check of ${scan.domain}'s public-facing setup. The basics look well configured, which is rarer than you'd think.`;
    return `Hi {first},\n\n${line}\n\nI only looked at public records — nothing internal — but it's the kind of thing worth a second pair of eyes. Would it be worth a quick look at ${co}'s setup?\n\nAli`;
  }
  function printReport() {
    const scan = state.scan; if (!scan) return;
    const w = window.open("", "_blank"); if (!w) return host.toast("Allow pop-ups to print the report.", "error");
    const logo = typeof host.logoUrl === "function" ? host.logoUrl() : "email-logo.png";
    const open = scan.findings.filter(f => f.severity !== "good");
    const good = scan.findings.filter(f => f.severity === "good");
    const sevColor = { high: "#c2413b", medium: "#b7791f", low: "#4D4D4D", good: "#0f8a5f" };
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Security Snapshot — ${esc(scan.domain)}</title>
<style>body{font-family:Segoe UI,Arial,sans-serif;color:#333;max-width:760px;margin:28px auto;padding:0 24px;line-height:1.5}
header{display:flex;justify-content:space-between;align-items:center;border-bottom:4px solid #00AEEF;padding-bottom:14px;margin-bottom:8px}
header img{height:52px} h1{color:#0072BC;font-size:23px;margin:0 0 2px} .sub{color:#4D4D4D;font-size:13px}
.top{display:flex;gap:18px;align-items:center;margin:18px 0}
.grade{width:64px;height:64px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:34px;font-weight:800;color:#fff;background:#0072BC}
.g-a{background:#0f8a5f}.g-b{background:#3f9c4f}.g-c{background:#b7791f}.g-d{background:#c2691f}.g-f{background:#c2413b}
.f{border:1px solid #e3e3e3;border-left-width:5px;border-radius:8px;padding:10px 14px;margin:8px 0;break-inside:avoid}
.f b{color:#333} .f p{margin:4px 0 0;font-size:14px} .fix{color:#0072BC}
.sev{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.05em}
.good{color:#0f8a5f;font-size:13px;margin:3px 0} h2{color:#0072BC;font-size:15px;margin:20px 0 6px}
.note{background:#f2f9fd;border-left:4px solid #00AEEF;border-radius:6px;padding:10px 12px;font-size:12.5px;color:#4D4D4D;margin-top:16px}
footer{margin-top:22px;padding-top:12px;border-top:1px solid #ddd;color:#4D4D4D;font-size:12px}</style></head><body>
<header><div><h1>External Security Snapshot</h1><div class="sub">Prepared for <b>${esc(prospect() || scan.domain)}</b> · ${esc(new Date(scan.scannedAt).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" }))}</div></div><img src="${esc(logo)}" alt="Midas Tech" onerror="this.remove()"></header>
<div class="top"><div class="grade ${gradeClass(scan.grade)}">${esc(scan.grade)}</div>
<div><div style="font-size:16px;font-weight:700">${esc(scan.domain)} — ${scan.score}/100</div><div class="sub">${esc(scanSummaryLine(scan))}${scan.provider ? ` Email hosted on ${esc(scan.provider)}.` : ""}</div></div></div>
${open.length ? `<h2>What we found</h2>${open.map(f => `<div class="f" style="border-left-color:${sevColor[f.severity]}"><span class="sev" style="color:${sevColor[f.severity]}">${SEV[f.severity][0]} · ${esc(f.area)}</span><br><b>${esc(f.title)}</b><p>${esc(f.detail)}</p>${f.fix ? `<p class="fix"><b>Suggested fix:</b> ${esc(f.fix)}</p>` : ""}</div>`).join("")}` : `<h2>What we found</h2><p>No issues on the public checks.</p>`}
${good.length ? `<h2>Already in good shape</h2>${good.map(f => `<div class="good">✓ ${esc(f.title)} — ${esc(f.detail)}</div>`).join("")}` : ""}
<div class="note">${esc(scan.note)}</div>
<footer><b>Midas Tech Inc</b> · IT Services &amp; Cybersecurity · ${esc(COMPANY.owner)} · ${esc(COMPANY.phone)} · ${esc(COMPANY.email)} · ${esc(COMPANY.web)}<br>${esc(COMPANY.address)}</footer>
<script>window.onload=()=>setTimeout(()=>window.print(),300)<\/script></body></html>`);
    w.document.close();
  }

  // ── presenting ──
  // Opens the deck in its own tab (so the tracker stays open behind it). Falls back to presenting
  // on top of the page if the browser blocks the new tab.
  function present(from) {
    const s = slides();
    const start = Math.min(Math.max(0, from || 0), s.length - 1);
    const w = window.open("", "_blank");
    if (!w) { host.toast("Allow pop-ups to present in a new tab. Presenting here instead.", "error"); return presentHere(start); }
    const css = [...document.querySelectorAll("style")].map(x => x.textContent).filter(t => t.includes(".sk-")).join("\n");
    // Embed the logo so the new tab doesn't depend on loading it again.
    let logo = "";
    try {
      const img = [...document.querySelectorAll("img.sk-logo")].find(i => i.complete && i.naturalWidth);
      if (img) { const c = document.createElement("canvas"); c.width = img.naturalWidth; c.height = img.naturalHeight; c.getContext("2d").drawImage(img, 0, 0); logo = c.toDataURL("image/png"); }
    } catch {}
    const withLogo = h => logo ? h.replace('src="midas-logo.png"', `src="${logo}"`) : h;
    const data = JSON.stringify(s.map(x => ({ cls: x.cls || "", html: withLogo(x.html), notes: x.notes || "" }))).replace(/</g, "\\u003c");
    w.document.write(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<base href="${esc(location.href)}"><title>${esc(prospect() || "Meeting")} · Midas Tech</title>
<style>${css}
html,body{margin:0;height:100%;background:#0b1620;overflow:hidden}
.sk-present{position:fixed;inset:0;display:flex;align-items:center;justify-content:center}
.sk-present .sk-controls{opacity:.5}
.sk-fs-hint{position:fixed;top:14px;left:50%;transform:translateX(-50%);background:rgba(255,255,255,.95);color:#333;padding:8px 14px;border-radius:10px;font:600 14px Segoe UI,Arial,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.3);cursor:pointer}
</style></head><body>
<div class="sk-present" tabindex="-1"><div class="sk-stage"><div class="sk-slide-wrap"><div class="sk-slide"></div></div></div>
<div class="sk-notes-pane" hidden></div>
<div class="sk-controls"><button type="button" data-p="prev" aria-label="Previous">‹</button><span class="sk-count"></span>
<button type="button" data-p="next" aria-label="Next">›</button><button type="button" data-p="notes">Notes</button><button type="button" data-p="fs">⛶ Full screen</button><button type="button" data-p="exit">Close</button></div></div>
<div class="sk-fs-hint" data-p="fs">Click here or press F for full screen</div>
<script>
const S=${data};let i=${start};
const $=q=>document.querySelector(q);
function show(){const sl=S[i];const b=$(".sk-slide");b.className="sk-slide "+sl.cls;b.innerHTML=sl.html;$(".sk-count").textContent=(i+1)+" / "+S.length;$(".sk-notes-pane").textContent=sl.notes;}
function move(d){i=Math.min(Math.max(0,i+d),S.length-1);show();}
function fs(){const h=$(".sk-fs-hint");if(h)h.remove();if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});else document.documentElement.requestFullscreen().catch(()=>{});}
function notes(){const p=$(".sk-notes-pane");p.hidden=!p.hidden;}
document.addEventListener("keydown",e=>{
  if(["ArrowRight","PageDown"," "].includes(e.key)){e.preventDefault();move(1);}
  else if(["ArrowLeft","PageUp"].includes(e.key)){e.preventDefault();move(-1);}
  else if(e.key.toLowerCase()==="n")notes();
  else if(e.key.toLowerCase()==="f")fs();
  else if(e.key==="Home"){i=0;show();} else if(e.key==="End"){i=S.length-1;show();}
});
document.addEventListener("click",e=>{
  const b=e.target.closest("[data-p]");
  if(!b){if(!e.target.closest(".sk-notes-pane"))move(1);return;}
  const a=b.dataset.p;
  if(a==="prev")move(-1);else if(a==="next")move(1);else if(a==="notes")notes();else if(a==="fs")fs();else if(a==="exit")window.close();
});
setTimeout(()=>{const h=$(".sk-fs-hint");if(h)h.remove();},6000);
show();
<\/script></body></html>`);
    w.document.close();
    w.focus();
  }

  let overlay = null;
  function presentHere(start) {
    state.slide = start;
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

  function saveProof() {
    const pr = state.proof || {};
    const clean = {
      rating: Math.min(5, Math.max(1, Number(pr.rating) || 5)),
      reviews: Math.max(0, Math.round(Number(pr.reviews) || 0)),
      stories: (pr.stories || []).map(st => Object.fromEntries(["industry", "who", "before", "did", "result", "quote", "by"].map(k => [k, String(st?.[k] || "").trim().slice(0, 300)])))
        .filter(st => st.who || st.result)
    };
    state.proof = clean;
    host.saveSettings({ proof: clean }).then(() => { host.toast("Proof saved", "success"); draw(); }).catch(() => {});
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
    else if (a === "clear-assessment") { if (confirm("Clear the answers and notes?")) { state.answers = {}; state.notes = ""; state.heard = {}; state.cost = {}; draw(); } }
    else if (a === "save-proof") saveProof();
    else if (a === "save-assessment") {
      const l = lead(); if (!l) return;
      const res = assessmentScore(state.answers);
      host.saveAssessment(l.id, { answers: { ...state.answers }, notes: state.notes, heard: { ...state.heard }, cost: { ...state.cost }, score: res.score, level: res.level, gaps: res.gaps.map(g => g.q), date: new Date().toISOString() })
        .then(() => host.toast("Assessment saved to the lead", "success")).catch(err => host.toast(err?.message || "Couldn't save", "error"));
    }
    else if (a === "copy-followup") { const l = lead(); copy(FOLLOWUP_EMAIL(l ? String(l.name || "").split(" ")[0] : "", prospect()), "Email"); }
    else if (a === "copy-quote") copy(quoteText(), "Quote");
    else if (a === "print-quote") printQuote();
    else if (a === "run-scan") runScan();
    else if (a === "print-report") printReport();
    else if (a === "copy-scan-email" && state.scan) copy(outreachFromScan(state.scan), "Email");
  });
  document.addEventListener("change", e => {
    const t = e.target.closest("[data-sk]");
    if (!t || !root?.contains(t)) return;
    const a = t.dataset.sk;
    if (a === "lead") {
      state.leadId = t.value;
      loadFromLead(lead());
      remember(); draw();
    } else if (a === "industry") { state.industry = t.value; remember(); draw(); }
    else if (a === "company") draw();
    else if (a === "q-pkg") { state.quote.pkg = t.value; remember(); draw(); }
    else if (a === "q-users") { state.quote.users = Math.max(1, Number(t.value) || 1); remember(); draw(); }
    else if (a === "q-addon") { state.quote.addons[t.dataset.id] = Math.max(0, Number(t.value) || 0); remember(); draw(); }
    else if (a === "q-check") { state.quote.addons[t.dataset.id] = t.checked; remember(); draw(); }
    else if (a === "q-waive") { state.quote.waive = t.checked; remember(); draw(); }
    else if (a === "extras") { state.extras = t.checked; remember(); draw(); }
    else if (a === "price") { state.packages = packages().map(p => p.id === t.dataset.id ? { ...p, price: Math.max(0, Number(t.value) || 0) } : p); savePrices(); draw(); }
    else if (a === "addon-price") { state.addons = addons().map(x => x.id === t.dataset.id ? { ...x, price: Math.max(0, Number(t.value) || 0) } : x); savePrices(); draw(); }
  });
  document.addEventListener("input", e => {
    const t = e.target.closest("[data-sk]");
    if (!t || !root?.contains(t)) return;
    if (t.dataset.sk === "notes") state.notes = t.value;
    if (t.dataset.sk === "heard") state.heard[t.dataset.id] = t.value;
    if (t.dataset.sk === "proof") { state.proof = { ...(state.proof || {}), [t.dataset.id]: Number(t.value) || "" }; }
    if (t.dataset.sk === "story") {
      const pr = { ...(state.proof || {}) };
      const list = [0, 1, 2].map(i => ({ ...((pr.stories || [])[i] || {}) }));
      list[Number(t.dataset.i)][t.dataset.id] = t.value;
      pr.stories = list; state.proof = pr;
    }
    if (t.dataset.sk === "cost") state.cost[t.dataset.id] = Math.max(0, Number(t.value) || 0) || "";
    if (t.dataset.sk === "company") { state.company = t.value; remember(); }
    if (t.dataset.sk === "scan-domain") state.scanDomain = t.value.trim();
  });

  window.SalesKit = { render, _test: { assessmentScore, quoteTotals, slides, state } };
})();
