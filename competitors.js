// Competitors view for the Midas Tech lead tracker: GTA managed IT competitors (services, clients,
// pricing, contracts, reviews, social media), side-by-side comparison, and how Midas wins.
//
// index.html calls Competitors.render(root, host). The host gives:
//   host.loadSettings() / host.saveSettings(patch)   shared settings (your notes, Midas's social numbers)
//   host.toast(message, type)
//
// Research from public websites, directories and search results, September 2026. Numbers change;
// check a competitor's site before quoting it to a client.
(function () {
  "use strict";

  const RESEARCHED = "September 2026";

  // threat: how directly they compete with Midas (Richmond Hill / York Region, clinics, accounting, warehouses, small business).
  // type: "msp" (general managed IT) or "specialist" (built around one industry).
  const COMPETITORS = [
    {
      id: "fusion", name: "Fusion Computing", type: "msp", threat: "high",
      where: "Toronto HQ, plus Hamilton and Metro Vancouver. Has a Richmond Hill page.", since: "2012 (LinkedIn says 2008)", size: "Clients with 10–200+ users",
      services: ["Managed and co-managed IT", "24/7 SOC (Huntress MDR, SentinelOne, Fortinet)", "Microsoft 365 management and backup", "vCIO", "CIS-aligned security package", "CRA EFILE hardening"],
      clients: "Regulated SMBs: wealth management, law, accounting, healthcare, nonprofits, construction, manufacturing, logistics",
      industries: ["accounting", "healthcare", "warehouse", "law"],
      pricing: "From $180/user/month fully managed; co-managed from $160; security package with M365 Business Premium about $230 (published)",
      contract: "No long-term contracts, no per-incident fees. Exit terms written in: notice period, documentation handover, and the client keeps its Microsoft tenant and licences.",
      sla: "1-hour critical response, 4-hour on-site across the GTA, 93% first-contact resolution",
      reviews: "Named in Canada's 50 Best Managed IT Companies (2024, 2025)",
      social: { linkedin: "≈964 followers", facebook: "Yes", instagram: "", youtube: "", content: "Very heavy: pricing guides, city pages, industry pages, \"Top MSPs in Canada\" comparisons" },
      strengths: ["Publishes prices and SLAs, so buyers trust them early", "Strong industry pages (accounting, logistics)", "Wins Google searches with lots of content"],
      gaps: ["Starts at $180/user, about double your Essentials price", "Bigger firm: clients deal with a team, not the owner"],
      win: "Match their transparency (publish \"from $89\"), then win on price and on talking to the owner. For small offices of 5–20 people, $180+/user is often more than they need.",
      sources: [["Pricing", "https://fusioncomputing.ca/managed-it-services-cost-canada/"], ["Richmond Hill page", "https://fusioncomputing.ca/managed-it-services-richmond-hill/"], ["Top MSPs Canada", "https://fusioncomputing.ca/top-msps-canada-2026/"]]
    },
    {
      id: "g4ns", name: "Group 4 Networks (G4NS)", type: "msp", threat: "high",
      where: "Toronto; pages for Markham, Vaughan, Mississauga, Brampton", since: "2008", size: "Clients with 10–250 employees; says 500+ Toronto companies",
      services: ["Managed IT", "Cybersecurity and compliance", "Microsoft 365, Azure and AWS", "Backup and disaster recovery", "Network management", "vCIO", "Dental IT (Dentrix, ABELDent, imaging)"],
      clients: "Legal, manufacturing, construction, retail, dental, accounting, nonprofits",
      industries: ["accounting", "healthcare", "law"],
      pricing: "Flat rate from $149/user/month; fixed quote after a free IT assessment (published)",
      contract: "60-day 100% money-back guarantee on flat-rate plans",
      sla: "15-minute critical response (they claim the fastest in the GTA)",
      reviews: "Clutch 10 reviews; 4.8 on Trustindex",
      social: { linkedin: "Yes", facebook: "Yes", instagram: "", youtube: "Yes (@Group_4_Networks)", content: "Heavy: several websites (g4ns.com, managedit-services.com, smallbusinessitsupport.ca), blog, city and industry pages" },
      strengths: ["Money-back guarantee takes away the risk", "Leads with the same free assessment you offer", "Covers dental software"],
      gaps: ["High volume (500+ clients), so service feels less personal", "$149 floor is above your Essentials plan"],
      win: "Offer your own guarantee so theirs isn't a reason to choose them. Stress that with you the owner answers, not a queue.",
      sources: [["Managed IT", "https://g4ns.com/services/managed-it-services"], ["Dental", "https://www.g4ns.com/dental-it-support"], ["Markham", "https://g4ns.com/managed-it-services-markham/"]]
    },
    {
      id: "manawa", name: "Manawa Networks", type: "msp", threat: "high",
      where: "Southern Ontario; pages for Richmond Hill, Markham, Vaughan, Hamilton", since: "Not published", size: "SMBs",
      services: ["24/7/365 help desk", "vCIO strategy", "Co-managed IT", "IT asset management", "Cybersecurity"],
      clients: "Small and medium businesses across the GTA and Hamilton",
      industries: [],
      pricing: "Flat monthly fee (not published)",
      contract: "Guarantees 50% fewer reactive IT issues in year one. New clients get a 90-day early termination option and a 100% money-back guarantee.",
      sla: "15-minute average response",
      reviews: "Google 4.9 (51 reviews)",
      social: { linkedin: "≈905 followers", facebook: "≈993 likes", instagram: "Yes (@manawanetworks)", youtube: "", content: "Podcast on Apple Podcasts, city pages" },
      strengths: ["The strongest guarantees in the market", "Active on Facebook, Instagram, LinkedIn and a podcast", "More Google reviews than you"],
      gaps: ["General MSP: no clinic, accounting or warehouse focus", "Price not published"],
      win: "Lead with your industries (PHIPA, CRA EFILE, warehouse uptime) and your 5.0 rating. Match the 90-day exit so their guarantee isn't a deciding factor.",
      sources: [["Richmond Hill page", "https://manawa.ca/managed-it-services-richmond-hill/"], ["vCIO", "https://manawa.ca/vcio-services"], ["Instagram", "https://www.instagram.com/manawanetworks/"]]
    },
    {
      id: "cgtech", name: "CG Technologies", type: "msp", threat: "high",
      where: "Toronto; pages for Richmond Hill, Vaughan, Markham, Thornhill, Aurora", since: "1996", size: "100+ GTA small businesses",
      services: ["Managed IT", "Cybersecurity (Huntress MDR, Bitdefender, Fortinet, Duo MFA)", "Cloud", "IT consulting", "24/7 local support"],
      clients: "Law firms, manufacturing, retail, healthcare",
      industries: ["healthcare", "law"],
      pricing: "About $100/user core; $140–170 with full security; $180–220 for compliance (published guide)",
      contract: "Free assessment first; scope and price confirmed before you commit",
      sla: "\"Fast response\" (not specified)",
      reviews: "Says 95% client retention",
      social: { linkedin: "Yes", facebook: "", instagram: "", youtube: "", content: "Pricing guides and many city pages" },
      strengths: ["30 years in business", "Publishes a Toronto pricing guide", "Local pages for every York Region town"],
      gaps: ["No clear niche", "Security stack costs extra above the core price"],
      win: "Your plans include managed antivirus and MFA from the start. Ask prospects comparing with them what their $100 plan actually includes.",
      sources: [["Pricing guide", "https://cgtechnologies.com/managed-it-services-toronto-cost-pricing-2026-guide-cg-technologies/"], ["Richmond Hill", "https://cgtechnologies.com/service-areas/managed-it-services-richmond-hill/"]]
    },
    {
      id: "wingman", name: "Wingman Solutions", type: "msp", threat: "high",
      where: "Toronto; pages for Richmond Hill, Vaughan, North York, Scarborough, Oakville, Hamilton", since: "Not published", size: "Growing SMBs",
      services: ["Co-managed IT alongside in-house teams", "Proactive monitoring and help desk", "Cybersecurity", "Cloud", "Network", "IT strategy"],
      clients: "Construction, real estate, professional services, manufacturing, finance, law, marketing agencies",
      industries: ["law"],
      pricing: "Not published",
      contract: "Not published",
      sla: "Not published",
      reviews: "",
      social: { linkedin: "Yes", facebook: "", instagram: "", youtube: "", content: "City and industry pages" },
      strengths: ["Same message as you: for businesses that outgrew break-fix but don't want a faceless national provider", "Strong co-managed offer"],
      gaps: ["No healthcare or warehouse focus", "No published price or guarantees"],
      win: "You're the local, owner-led option with 16 years and a 5.0 rating. Show reviews and industry knowledge, not just \"we're local\".",
      sources: [["Richmond Hill", "https://wingmansolutions.ca/locations/richmond-hill-managed-it-services/"], ["Professional services", "https://wingmansolutions.ca/industries/professional-services/"]]
    },
    {
      id: "kearns", name: "Kearns Technology", type: "msp", threat: "high",
      where: "Richmond Hill office; serves Canada and the U.S.", since: "2010 (same year as Midas)", size: "Team of 24+",
      services: ["Managed IT", "Infrastructure", "IT consulting", "Endpoint security", "Cloud", "AI services"],
      clients: "Small and medium businesses",
      industries: [],
      pricing: "Not published",
      contract: "Not published",
      sla: "Not published",
      reviews: "",
      social: { linkedin: "Yes", facebook: "", instagram: "", youtube: "", content: "Richmond Hill landing page" },
      strengths: ["Same town, same age, bigger team"],
      gaps: ["General message, no industry focus", "No published price, guarantee or SLA"],
      win: "Your reviews (5.0 from 35) and industry focus are the difference. In Richmond Hill, lead with a clinic or accounting story.",
      sources: [["Richmond Hill", "https://kearnstechnology.com/richmondhill/"], ["About", "https://kearnstechnology.com/about-us/"]]
    },
    {
      id: "itbiztek", name: "ITBizTek", type: "msp", threat: "high",
      where: "Richmond Hill HQ; serves Toronto and the GTA", since: "1998", size: "2–10 employees",
      services: ["Managed IT", "Cybersecurity", "24/7 monitoring", "Cloud backup", "Microsoft 365", "Help desk"],
      clients: "Small businesses; accounting and law (Clio affiliate partner)",
      industries: ["accounting", "law"],
      pricing: "From $55/employee/month flat; named engineer (published)",
      contract: "Not published",
      sla: "15-minute response (published)",
      reviews: "",
      social: { linkedin: "Yes", facebook: "", instagram: "", youtube: "", content: "Industry pages (accounting), \"why SMBs are switching\" articles" },
      strengths: ["Lowest published price in the market", "Same town, same size as you", "Published response time"],
      gaps: ["$55 rarely includes managed EDR, backup and 24/7 security", "Very small team"],
      win: "Don't race them on price. Ask \"what's included at $55?\" and show what a real security baseline costs, as TUCU also points out about sub-$80 plans.",
      sources: [["Managed IT", "https://itbiztek.com/managed-it-services/"], ["Accounting", "https://itbiztek.com/it-services-for-accounting/"]]
    },
    {
      id: "900sol", name: "900Solutions", type: "msp", threat: "high",
      where: "Markham HQ; serves Richmond Hill, Vaughan, Newmarket, North York, Scarborough, Pickering, Oshawa, Mississauga", since: "2013", size: "50+ managed clients; 3 founders",
      services: ["Managed IT and help desk", "Cloud", "Cybersecurity", "IT outsourcing", "Outsourced CIO", "Procurement"],
      clients: "Law firms, accounting firms, doctors' clinics, restaurants, retail",
      industries: ["accounting", "healthcare", "law"],
      pricing: "Not published",
      contract: "Not published",
      sla: "Not published",
      reviews: "",
      social: { linkedin: "Yes", facebook: "", instagram: "", youtube: "", content: "Richmond Hill page" },
      strengths: ["Same size and the same clients as you (clinics, accounting)", "Right next door in Markham"],
      gaps: ["Younger (2013)", "No published price or guarantee"],
      win: "Head-to-head: use your 16 years, 5.0 reviews and security-first plans. Publish prices so you look more open than them.",
      sources: [["Managed IT", "https://900solutions.ca/managed-it-services/"], ["Richmond Hill", "https://900solutions.ca/managed-it-services-richmond-hill/"]]
    },
    {
      id: "haycor", name: "Haycor Computer Solutions", type: "msp", threat: "high",
      where: "Vaughan; serves Toronto and York Region", since: "2006", size: "Small (founder-led, Jason Wachtel)",
      services: ["Managed IT", "Cybersecurity", "Cloud", "IT consulting", "Disaster recovery"],
      clients: "Accounting firms and CPAs (priority in tax season), architecture, construction, financial services, law, nonprofits",
      industries: ["accounting", "law"],
      pricing: "Not published",
      contract: "Not published",
      sla: "30-minute response, 15-minute average resolution",
      reviews: "Highly rated on review sites",
      social: { linkedin: "Yes", facebook: "Yes", instagram: "", youtube: "", content: "CPA industry page" },
      strengths: ["The accounting specialist in York Region", "Tax-season priority promise"],
      gaps: ["No healthcare or warehouse focus"],
      win: "With accounting firms, match their tax-season promise and add CRA EFILE MFA readiness and the insurance checklist. Lead with clinics and warehouses where they're weak.",
      sources: [["CPA firms", "https://www.haycorsolutions.ca/cpa-firm-it-services/"], ["Home", "https://www.haycorsolutions.ca/"]]
    },
    {
      id: "itrapid", name: "IT Rapid Support", type: "msp", threat: "high",
      where: "Vaughan (Keele St); serves Woodbridge, Concord, North York, Markham, Richmond Hill, Mississauga, Brampton", since: "Not published", size: "Local team",
      services: ["Managed IT", "Cybersecurity", "24/7 help desk", "Patch management", "Dental IT"],
      clients: "Vaughan, Woodbridge and Concord businesses; dental offices",
      industries: ["healthcare"],
      pricing: "Fixed monthly, no hidden fees (not published)",
      contract: "Not published",
      sla: "\"Rapid response\", 24/7 local",
      reviews: "",
      social: { linkedin: "", facebook: "", instagram: "", youtube: "", content: "City guides and industry pages" },
      strengths: ["Based in Vaughan and Concord, where most York Region warehouses are"],
      gaps: ["No warehouse or logistics focus in their marketing"],
      win: "Own \"warehouse IT\" in Vaughan and Concord: scanners, dock Wi-Fi, WMS uptime. Nobody local is marketing it.",
      sources: [["Vaughan", "https://itrapidsupport.com/it-support/vaughan/"], ["Dental", "https://itrapidsupport.com/industries/dental/"]]
    },
    {
      id: "f12", name: "F12.net", type: "msp", threat: "medium",
      where: "HQ Edmonton; Markham office (Markland St) serving Toronto, Markham, Vaughan, Richmond Hill, North York", since: "1992", size: "National; grew by acquisitions (Insite 2015, OnDeck, Protocol, Sitkum)",
      services: ["Managed IT", "Cybersecurity", "Data centre and cloud", "Technology strategy", "F12 Infinite: hardware, software, security and support in one subscription"],
      clients: "Healthcare, financial, professional and industrial; mid-market",
      industries: ["healthcare"],
      pricing: "Not published (subscription, including hardware)",
      contract: "All-inclusive subscription (hardware as a service)",
      sla: "24/7 support",
      reviews: "",
      social: { linkedin: "Yes", facebook: "", instagram: "", youtube: "", content: "Pricing guide, Markham page" },
      strengths: ["National scale and data centres", "Hardware bundled into the monthly fee"],
      gaps: ["National company: less personal for a 10-person office", "Bundled hardware can tie clients in"],
      win: "Small clients who want someone local and flexible. \"You'll always deal with me\" beats a national help desk.",
      sources: [["Markham", "https://f12.net/it-company-markham/"], ["History", "https://f12.net/blog/history-of-f12/"]]
    },
    {
      id: "nucleus", name: "Nucleus Networks", type: "msp", threat: "medium",
      where: "Toronto (Wellesley St W) + 4 other Canadian offices", since: "Not published", size: "90+ employees",
      services: ["Managed IT with a dedicated team (POD) and Client Success Manager", "Security with continuous monitoring (SOC 2 practices)", "Co-managed IT"],
      clients: "Mining, industrial and legal",
      industries: ["law"],
      pricing: "Flat per user per month, published",
      contract: "No lock-in: month to month",
      sla: "Same-business-day resolution",
      reviews: "4.7 (Vancouver page)",
      social: { linkedin: "Yes", facebook: "", instagram: "", youtube: "", content: "Blog with industry articles" },
      strengths: ["\"No lock-in, we answer\" is a clear promise", "Named team for each client"],
      gaps: ["Industrial and legal focus, not clinics or accounting", "Larger company"],
      win: "Match \"no lock-in\" (you already offer month to month). Say it on your website and in the deck.",
      sources: [["Toronto", "https://yournucleus.ca/toronto/"], ["About", "https://yournucleus.ca/about/"]]
    },
    {
      id: "tucu", name: "TUCU Managed IT", type: "msp", threat: "medium",
      where: "Toronto, Durham Region, Northumberland", since: "2003", size: "Small businesses (1–20 staff) and nonprofits",
      services: ["Managed IT with NIST-aligned security for every client", "Apple and PC support", "Azure Virtual Desktop", "Microsoft 365"],
      clients: "Small businesses and nonprofits",
      industries: [],
      pricing: "$100–175/user for 1–20 staff; M365 licences separate; server fee extra (published)",
      contract: "Quote after a discovery call",
      sla: "Not published",
      reviews: "",
      social: { linkedin: "Yes", facebook: "", instagram: "", youtube: "", content: "Pricing guide and benefits articles" },
      strengths: ["Apple support (many clinics use Macs)", "Honest pricing content"],
      gaps: ["East GTA, not York Region"],
      win: "Only overlaps on eastern leads. Make sure you can say yes to Mac support.",
      sources: [["Pricing", "https://tucu.ca/pricing/"], ["Managed IT", "https://tucu.ca/services/managed-it/"]]
    },
    {
      id: "balanced", name: "BALANCED+", type: "msp", threat: "medium",
      where: "Mississauga HQ; Toronto, the GTA, and Vancouver", since: "1994 (merger of Zita Associates, SecureLinks and COMMIT100)", size: "Mid-market",
      services: ["24/7 monitoring", "Help desk", "Cybersecurity", "Backup and disaster recovery", "Vendor coordination", "Microsoft 365", "vCIO"],
      clients: "Mid-market businesses across Ontario",
      industries: [],
      pricing: "$120–250/user/month (published guide)",
      contract: "One predictable monthly fee",
      sla: "Not published",
      reviews: "",
      social: { linkedin: "Yes", facebook: "", instagram: "", youtube: "", content: "Pricing guides, \"what to watch for\" articles" },
      strengths: ["Scale from three merged firms", "Pricing guide ranks in search"],
      gaps: ["Aimed at the mid-market, too big for a 10-person clinic"],
      win: "Small offices (5–30 staff) are your ground. Their prices start above yours.",
      sources: [["Pricing", "https://balanced.plus/managed-it-services-cost-toronto-pricing-guide/"], ["Managed IT", "https://balanced.plus/services/managed-it/"]]
    },
    {
      id: "xbase", name: "XBASE Technologies", type: "msp", threat: "medium",
      where: "Toronto (Prince Andrew Place, North York)", since: "1988", size: "20+ certified staff",
      services: ["Managed IT", "Managed cloud", "SharePoint and Office 365 migration", "Cybersecurity (NIST)", "Disaster recovery", "VoIP"],
      clients: "Financial services, nonprofits, manufacturing, insurance, healthcare, business services, real estate",
      industries: ["healthcare"],
      pricing: "Not published",
      contract: "Not published",
      sla: "Not published",
      reviews: "Google 4.6 (73 reviews)",
      social: { linkedin: "Yes", facebook: "", instagram: "", youtube: "", content: "\"Our stack\" page shows their tools" },
      strengths: ["SOC 2 Type II audited", "MSP Alliance Cyber Verify Level 3", "Most Google reviews in this list"],
      gaps: ["Rating (4.6) is lower than yours (5.0)"],
      win: "When a prospect asks for certifications, show your tools, your written policies, and the insurance checklist. Your 5.0 rating beats 4.6.",
      sources: [["Managed services", "https://www.xbase.com/services/managed-services/"], ["Our stack", "https://www.xbase.com/company/our-stack/"]]
    },
    {
      id: "infoware", name: "Infoware", type: "msp", threat: "medium",
      where: "Toronto and the GTA", since: "1982", size: "Established",
      services: ["Managed IT", "Cloud (85% of clients in the cloud)", "Cybersecurity", "Performance reporting"],
      clients: "Law firms, CPAs and accountants, engineers, construction, agriculture, finance, schools",
      industries: ["accounting", "law"],
      pricing: "Not published",
      contract: "Not published",
      sla: "Says 99.9% uptime, 98% customer satisfaction",
      reviews: "",
      social: { linkedin: "Yes", facebook: "", instagram: "", youtube: "", content: "Industry pages including accountants" },
      strengths: ["40+ years with law and accounting firms"],
      gaps: ["Downtown focus; less York Region presence"],
      win: "For York Region accounting firms, being local and able to come on-site is your edge.",
      sources: [["Accountants", "https://www.infoware.ca/industries/it-support-for-accountants"], ["About", "https://www.infoware.ca/about-us"]]
    },
    {
      id: "echoflare", name: "Echoflare", type: "msp", threat: "medium",
      where: "Toronto; office in Aurora", since: "2018", size: "10–49 staff; mid-size clients",
      services: ["24/7 managed IT", "Infrastructure design", "Monitoring", "Cloud hosting", "IT projects"],
      clients: "Finance, banking, pharma, mining, manufacturing and supply chain, law, accounting, healthcare",
      industries: ["accounting", "healthcare", "warehouse", "law"],
      pricing: "Not published",
      contract: "Not published",
      sla: "24/7",
      reviews: "",
      social: { linkedin: "Yes", facebook: "", instagram: "", youtube: "", content: "Industry pages (accounting, supply chain)" },
      strengths: ["York Region office (Aurora)", "Supply-chain and accounting pages"],
      gaps: ["Young firm (2018)", "Aims at mid-size, not small offices"],
      win: "Small York Region businesses: you have 16 years and reviews to show.",
      sources: [["Accounting", "https://echoflare.ca/industries/professional-services/"], ["Supply chain", "https://echoflare.ca/industries/supply-chain/"]]
    },
    {
      id: "jig", name: "JIG Technologies", type: "msp", threat: "low",
      where: "Midtown Toronto", since: "2005", size: "Established; Microsoft partner",
      services: ["Managed IT", "Proactive cybersecurity", "IT projects and consulting", "Custom software development", "Help desk", "Backup and DR"],
      clients: "Nonprofits and charities, government agencies, logistics, healthcare, media, creative agencies",
      industries: ["healthcare", "warehouse"],
      pricing: "Not published",
      contract: "IT Governance Lifecycle and 5-step client success process",
      sla: "Not published",
      reviews: "Google 4.8 (35 reviews)",
      social: { linkedin: "Yes", facebook: "", instagram: "", youtube: "", content: "Guides such as \"What is an MSP?\"" },
      strengths: ["Nonprofit and government niche", "Same review count as you"],
      gaps: ["Downtown, different niches"],
      win: "Rarely head-to-head. Watch their logistics page.",
      sources: [["Managed IT", "https://jigtechnologies.com/managed-it-services/"]]
    },
    {
      id: "synergy", name: "Synergy IT Solutions Group", type: "msp", threat: "low",
      where: "Mississauga", since: "1995", size: "About 40 staff",
      services: ["Managed IT", "Network and wireless", "Printer repair", "Cabling", "VPN", "Server management", "Backup and DR"],
      clients: "Small and medium businesses",
      industries: [],
      pricing: "Not published",
      contract: "Not published",
      sla: "24/7 support",
      reviews: "",
      social: { linkedin: "Yes", facebook: "", instagram: "", youtube: "", content: "Service pages" },
      strengths: ["Long history, big team"],
      gaps: ["Generalist, west GTA"],
      win: "Rarely head-to-head in York Region.",
      sources: [["Managed IT", "https://www.synergyit.ca/managed-it-services/"]]
    },
    {
      id: "meteor", name: "Meteor Networks", type: "msp", threat: "low",
      where: "Mississauga; west GTA (Brampton, Vaughan, Oakville, Milton, Orangeville)", since: "35+ years (telecom roots)", size: "Established",
      services: ["Managed IT", "Cybersecurity", "Microsoft 365", "VoIP phone systems", "Structured cabling", "Automation"],
      clients: "Ontario SMBs",
      industries: [],
      pricing: "Guide: $110–250/user or $30–100/device (published)",
      contract: "Not published",
      sla: "Not published",
      reviews: "",
      social: { linkedin: "Yes", facebook: "", instagram: "", youtube: "", content: "Ontario pricing guide" },
      strengths: ["Phones and cabling in-house"],
      gaps: ["Telecom-first, west GTA"],
      win: "If a prospect wants phones too, partner for VoIP. Otherwise lead with security.",
      sources: [["Pricing", "https://meteortel.com/managed-it-cost-ontario/"]]
    },
    {
      id: "pce", name: "PCe Solutions", type: "msp", threat: "low",
      where: "HQ Calgary; offices in Toronto, Edmonton, Vancouver, Tampa", since: "2010", size: "North American",
      services: ["Managed IT", "Cybersecurity", "Managed AI", "Cloud", "Unified communications"],
      clients: "Growth-focused SMBs; regulated industries (Controlled Goods clearance, PIPEDA)",
      industries: [],
      pricing: "Not published",
      contract: "Not published",
      sla: "Not published",
      reviews: "Clutch 3 reviews",
      social: { linkedin: "Yes", facebook: "", instagram: "", youtube: "", content: "Location pages" },
      strengths: ["Government-grade clearance"],
      gaps: ["Toronto is a branch office"],
      win: "\"Local owner\" beats \"branch of a Calgary firm\".",
      sources: [["Toronto", "https://pcesolutions.net/en-ca/locations/toronto/"]]
    },
    {
      id: "rimkash", name: "RimKash IT Services", type: "msp", threat: "low",
      where: "Toronto (University Ave) and Hamilton", since: "2013", size: "Small",
      services: ["Managed IT", "On-demand support", "Help desk", "Cabling", "Cloud", "Backup", "Web development", "CCTV"],
      clients: "Small and medium businesses in the GTA",
      industries: [],
      pricing: "Not published",
      contract: "Not published",
      sla: "24/7",
      reviews: "Clutch 1 review",
      social: { linkedin: "", facebook: "Yes", instagram: "", youtube: "", content: "Basic site" },
      strengths: ["Also does web and CCTV"],
      gaps: ["Generalist, few reviews"],
      win: "Rarely head-to-head.",
      sources: [["About", "https://rimkashitservices.com/about-us/"]]
    },
    {
      id: "itscorp", name: "ITS Corp", type: "specialist", threat: "high",
      where: "Toronto, Markham and Richmond Hill", since: "25+ years in dental IT", size: "Dental specialist",
      services: ["Managed IT for dental practices", "24/7 network monitoring", "Rapid remote support", "Encrypted nightly backups and DR", "Cybersecurity", "Cloud"],
      clients: "Dental clinics",
      industries: ["healthcare"],
      pricing: "Not published",
      contract: "Not published",
      sla: "Rapid response, framed as \"no cancelled appointments\"",
      reviews: "",
      social: { linkedin: "", facebook: "", instagram: "", youtube: "", content: "Dental-only website" },
      strengths: ["Talks the dentist's language: appointments, imaging, chairs"],
      gaps: ["Dental only: not medical, physio or other clinics"],
      win: "With dentists, show you support their software (list it on your site). With medical and physio clinics, you're broader than them.",
      sources: [["Home", "https://itscorp.ai/"]]
    },
    {
      id: "dentalit", name: "Dental IT Corporation", type: "specialist", threat: "high",
      where: "Richmond Hill (Vogell Rd)", since: "20+ years of experience", size: "Dental and healthcare specialist",
      services: ["Managed IT for dental and healthcare providers", "Technology support"],
      clients: "Dental practices and healthcare providers",
      industries: ["healthcare"],
      pricing: "Not published",
      contract: "Not published",
      sla: "Not published",
      reviews: "",
      social: { linkedin: "Yes", facebook: "", instagram: "", youtube: "", content: "Dental IT pages" },
      strengths: ["Same town, clinic specialist"],
      gaps: ["Narrow focus, little marketing"],
      win: "Show PHIPA knowledge and security depth (managed EDR, backups tested, insurance checklist), not just \"we fix the dental software\".",
      sources: [["Home", "https://dentalit.ca/"]]
    },
    {
      id: "starcomm", name: "Starcomm Technologies", type: "specialist", threat: "medium",
      where: "Mississauga; serves Toronto, Vaughan, Markham, Richmond Hill", since: "1999", size: "50+ dental offices",
      services: ["Managed IT for dental and healthcare", "Cybersecurity", "VoIP", "Backup", "Dental software: Dentrix, Tracker, ABELDent, ClearDent, Open Dental, Paradigm", "Imaging: Dexis, Carestream, Schick, Planmeca, Sidexis, Eaglesoft, Curve, Vatech"],
      clients: "Dental and healthcare offices",
      industries: ["healthcare"],
      pricing: "Not published",
      contract: "Not published",
      sla: "On-site and remote across the GTA",
      reviews: "",
      social: { linkedin: "", facebook: "", instagram: "", youtube: "", content: "Dental blog" },
      strengths: ["Lists every dental program and imaging system by name"],
      gaps: ["Based in the west GTA"],
      win: "Copy the idea: a \"software we support\" list on your clinic page.",
      sources: [["Dental", "https://starcomm.ca/services/dental/"]]
    },
    {
      id: "dcs", name: "Dental Computer Support", type: "specialist", threat: "medium",
      where: "Toronto; Ontario", since: "2009", size: "Dental clinics only",
      services: ["IT support for dental clinics", "Cybersecurity for dental practices"],
      clients: "Dental clinics",
      industries: ["healthcare"],
      pricing: "Not published",
      contract: "Not published",
      sla: "Not published",
      reviews: "",
      social: { linkedin: "", facebook: "Yes", instagram: "", youtube: "", content: "Dental-only website" },
      strengths: ["15+ years only in dental"],
      gaps: ["Dental only"],
      win: "Same as the other dental specialists: software list plus security depth.",
      sources: [["Home", "https://www.dentalcomputersupport.ca/"]]
    }
  ];

  const MIDAS = {
    since: "2010", where: "Richmond Hill (virtual office, on-site across the GTA)",
    pricing: "$89 / $139 / $189 per user (not yet published on the website)",
    contract: "Month to month (30 days' notice) or 12 months with onboarding waived",
    reviews: "Google 5.0 (35 reviews); Clutch 7 reviews; Yelp, DesignRush, helloDarwin and The Manifest listings",
    social: "LinkedIn company page + Ali's profile, Facebook, Instagram @midastech.it"
  };

  const INSIGHTS = [
    ["Prices", "Published GTA prices run from $55 (ITBizTek) to $180–230 (Fusion). Most full-service plans are $120–220. Your $89 / $139 / $189 sits in the middle, and Essentials is one of the lowest that includes managed antivirus."],
    ["Guarantees are becoming normal", "Manawa (90-day exit + money back + 50% fewer issues), G4NS (60-day money back), Nucleus (no lock-in), Fusion (no long-term contracts). Month to month alone no longer stands out."],
    ["They win on Google with content", "Fusion, CG, G4NS, Wingman, BALANCED+ and TUCU all have pricing guides and a page for every town (Richmond Hill, Markham, Vaughan…). That's how clients find them."],
    ["Your town is crowded", "In Richmond Hill and Markham: Kearns (also 2010), ITBizTek, Dental IT Corporation, 900Solutions, ITS Corp, plus the Toronto firms' town pages."],
    ["Dental is contested, other clinics less so", "Four dental-only firms (ITS Corp, Dental IT Corp, Starcomm, Dental Computer Support). Medical, physio and chiropractic clinics have no GTA specialist."],
    ["Warehouses are wide open", "Only Fusion, JIG and Echoflare have a logistics or supply-chain page, and none of them are in Vaughan or Concord, where York Region's warehouses are."],
    ["Your reviews are a real weapon", "5.0 from 35 on Google. Only XBASE (73, 4.6) and Manawa (51, 4.9) have more among those we could see."]
  ];

  const PLAYS = [
    ["Publish your prices", "Put \"Plans from $89/user/month\" and the three plans on midastech.ca. Fusion, TUCU, CG, ITBizTek and Nucleus publish, and buyers shortlist the firms that do."],
    ["Add a guarantee", "\"90-day happiness guarantee: if you're not happy in the first 90 days, leave with no fee and we hand everything over.\" This takes away Manawa's and G4NS's advantage."],
    ["Publish a response time", "Your reviews say you answer within minutes. Write it down (e.g. \"15-minute response, business hours; 1 hour after hours\"), as G4NS, Manawa, Haycor and ITBizTek do."],
    ["Own warehouses in Vaughan and Concord", "A \"Warehouse and logistics IT\" page: scanners, dock Wi-Fi, WMS uptime, label printers, supplier-payment fraud. Nobody local markets this."],
    ["Clinics beyond dental", "Medical, physio, chiropractic and optometry have no GTA specialist. Add a clinic page with PHIPA and a \"software we support\" list (e.g. Accuro, OSCAR, Jane, plus the dental systems)."],
    ["Accounting: beat Haycor in tax season", "A CRA EFILE MFA readiness check and a \"tax-season priority line\" from January to April."],
    ["Town pages", "One page each for Richmond Hill, Markham, Vaughan, Aurora and Newmarket, each with a local client story. It's how competitors rank."],
    ["A pricing guide", "\"What managed IT costs in York Region (2026)\". Every top competitor has one, and it brings buyers who are ready to decide."],
    ["Case studies", "Two or three real stories (anonymous is fine) on the website and in the Sales Kit deck. Competitors show scale; you show results with people like them."]
  ];

  const SOCIAL_ACTIONS = [
    ["Post from Ali's personal LinkedIn, not only the company page", "Personal profiles get 5–10× the reach of company pages for the same post. 3 posts a week, in your own voice, about clinics, accounting, warehouses and local business. Consistency beats volume.", "https://c4solutionsllc.com/linkedin-content-strategy-msp/"],
    ["Comment before you post", "10 thoughtful comments a day on posts by local business owners, clinic managers and accountants. It's the fastest way to grow reach on LinkedIn in 2026.", "https://www.lilachbullock.com/linkedin-growth-b2b-founder/"],
    ["Short talking-head videos", "30–60 seconds, one tip each (\"Is your clinic's backup really working?\"). LinkedIn video views are up 36% year on year. Re-use them on Instagram Reels, Facebook and YouTube Shorts.", "https://www.kometmedia.com/blogs/linkedin-video-distribution-playbook-for-founders"],
    ["Get to 60+ Google reviews", "Manawa has 51 and XBASE 73. Ask every happy client, send the link the same day you fix something, and reply to every review."],
    ["Weekly Google Business post", "Use the Google Business post pack in Social Posts. Competitors barely post there, so it's an easy win for local search."],
    ["Podcast or YouTube later", "Manawa has a podcast and G4NS a YouTube channel. Low priority. Start with LinkedIn video and put those clips on YouTube."],
    ["More Clutch reviews", "You have 7. Aim for 15. Clutch lists are what many \"top MSP\" articles are built from."]
  ];

  const CONTRACT_NORMS = [
    "Most MSP contracts run 1, 3 or 5 years; MSP lawyers recommend 3 years",
    "They usually auto-renew (yearly or month to month), with 30–90 days' notice to cancel",
    "Early-exit fees of about 50% of the remaining term are common",
    "Many offer a 30, 60 or 90-day period at the start when the client can leave without penalty",
    "Clients now push back on lock-ins, and the fastest-growing GTA firms advertise no long-term contracts"
  ];

  // ── Improvements: the working action plan (online presence + winning clients) ──
  // Each item is cross-referenced to the competitor gap it closes. impact/effort drive the order.
  // area: "Online presence" | "Social" | "Reviews & proof" | "Offers & pricing" | "Niche"
  // effort: "S" | "M" | "L"   impact: "high" | "medium" | "low"
  const IMPROVEMENTS = [
    { id: "publish-prices", area: "Offers & pricing", impact: "high", effort: "S", title: "Publish your prices on the website", detail: "Put “Plans from $89/user/month” and the three plans on midastech.ca.", why: "Fusion, TUCU, CG, ITBizTek and Nucleus publish prices; buyers shortlist the firms that do." },
    { id: "guarantee", area: "Offers & pricing", impact: "high", effort: "S", title: "Add a 90-day happiness guarantee", detail: "“Not happy in your first 90 days? Leave with no fee and we hand everything over.” Put it on the site and in the deck.", why: "Manawa (90-day exit + money back) and G4NS (60-day money back) both advertise guarantees; you don’t." },
    { id: "response-time", area: "Offers & pricing", impact: "high", effort: "S", title: "Publish a written response time", detail: "Your reviews say you answer within minutes — write it down, e.g. “15-minute response in business hours, 1 hour after hours.”", why: "G4NS and Manawa advertise 15-minute response; Haycor 30-minute. You have the speed but don’t claim it." },
    { id: "reviews-60", area: "Reviews & proof", impact: "high", effort: "M", title: "Get to 60+ Google reviews", detail: "Ask every happy client, send the review link the same day you fix something, and reply to every review.", why: "XBASE has 73 and Manawa 51. You have 35 at 5.0 — more reviews at that rating would lead the pack." },
    { id: "warehouse-page", area: "Niche", impact: "high", effort: "M", title: "Own “Warehouse & logistics IT” in Vaughan and Concord", detail: "A dedicated page: scanners, dock Wi-Fi, WMS/TMS uptime, label printers, supplier-payment fraud.", why: "Only Fusion, JIG and Echoflare have a logistics page, and none are in Vaughan or Concord where the warehouses are." },
    { id: "clinic-page", area: "Niche", impact: "high", effort: "M", title: "Add a clinic page beyond dental", detail: "Medical, physio, chiropractic and optometry, with PHIPA and a “software we support” list (Accuro, OSCAR, Jane, plus dental systems).", why: "Four firms fight over dentists; no GTA specialist covers other clinics." },
    { id: "linkedin-founder", area: "Social", impact: "high", effort: "M", title: "Post from Ali’s personal LinkedIn 3× a week", detail: "Your own voice, about clinics, accounting, warehouses and local business. Consistency beats volume.", why: "Personal profiles get 5–10× the reach of company pages, and competitors’ pages only sit at ~900–1,000 followers — easy to stand out.", src: "https://c4solutionsllc.com/linkedin-content-strategy-msp/" },
    { id: "case-studies", area: "Reviews & proof", impact: "high", effort: "M", title: "Publish 2–3 client case studies", detail: "Before / what we did / result. Anonymous is fine. Put them on the site and in the Sales Kit deck.", why: "Competitors show scale; you can show real results with businesses like the prospect." },
    { id: "town-pages", area: "Online presence", impact: "medium", effort: "L", title: "Add town pages", detail: "One page each for Richmond Hill, Markham, Vaughan, Aurora and Newmarket, each with a local client story.", why: "Fusion, CG, G4NS, Wingman and BALANCED+ rank locally with a page for every town." },
    { id: "pricing-guide", area: "Online presence", impact: "medium", effort: "M", title: "Write a York Region pricing guide", detail: "“What managed IT costs in York Region (2026).” Ranks in search and brings ready-to-buy visitors.", why: "Every top competitor (Fusion, CG, TUCU, BALANCED+, Meteor) has one." },
    { id: "linkedin-comment", area: "Social", impact: "medium", effort: "S", title: "Comment before you post on LinkedIn", detail: "10 thoughtful comments a day on posts by local owners, clinic managers and accountants.", why: "It’s the fastest way to grow reach on LinkedIn in 2026, and no local MSP is doing it.", src: "https://www.lilachbullock.com/linkedin-growth-b2b-founder/" },
    { id: "video", area: "Social", impact: "medium", effort: "M", title: "Post short talking-head videos", detail: "30–60 seconds, one tip each. Re-use on Instagram Reels, Facebook and YouTube Shorts.", why: "LinkedIn video views are up 36% year on year, and it feels personal — your owner-led edge.", src: "https://www.kometmedia.com/blogs/linkedin-video-distribution-playbook-for-founders" },
    { id: "gbp-weekly", area: "Online presence", impact: "medium", effort: "S", title: "Post to Google Business weekly", detail: "Use the Google Business post pack already in Social Posts.", why: "Competitors barely post there — an easy win for local search." },
    { id: "tax-season", area: "Niche", impact: "medium", effort: "S", title: "Beat Haycor with accounting firms in tax season", detail: "A CRA EFILE MFA readiness check and a “tax-season priority line” from January to April.", why: "Haycor is the York Region accounting specialist and promises tax-season priority; match and out-specialise it." },
    { id: "exit-terms", area: "Offers & pricing", impact: "medium", effort: "S", title: "Write client-friendly exit terms", detail: "On leaving, you hand over documentation and the client keeps admin access, their Microsoft tenant and licences.", why: "Fusion advertises exactly this; it removes the fear of being locked in." },
    { id: "clutch", area: "Reviews & proof", impact: "low", effort: "S", title: "Grow Clutch reviews to 15+", detail: "Ask clients to leave a Clutch review; you have 7.", why: "Many “top MSP” lists are built from Clutch, so more reviews there feed future rankings." },
    { id: "software-list", area: "Niche", impact: "low", effort: "S", title: "Add a “software we support” list", detail: "List the dental, medical and accounting programs you support, by name.", why: "Starcomm lists every dental program by name and it reassures clinic buyers." },
    { id: "certs", area: "Reviews & proof", impact: "low", effort: "M", title: "Show your security tools and policies", detail: "List your stack (EDR, MFA, backup) and written policies; link the insurance checklist.", why: "XBASE leads with SOC 2 Type II and Cyber Verify — you can show substance without the audit cost." }
  ];

  // Most recent monthly research pass. The 30-day job updates RESEARCHED, CHANGELOG and the data above.
  const CHANGELOG = [
    { date: "September 2026", notes: ["First competitor research pass: 26 GTA providers profiled.", "Baseline: your 5.0 Google rating (35 reviews) trails only XBASE (73) and Manawa (51) on volume.", "Open niches found: warehouses in Vaughan/Concord, and non-dental clinics."] }
  ];

  // ── helpers ──
  const esc = s => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  const IND = { healthcare: "Clinics", accounting: "Accounting", warehouse: "Warehouses", law: "Law" };
  const THREAT = { high: ["High", "cp-high"], medium: ["Medium", "cp-med"], low: ["Low", "cp-low"] };

  let host = null, root = null;
  const state = { tab: "overview", q: "", type: "", ind: "", threat: "", growArea: "", open: {}, settings: { notes: {}, midas: {}, improvements: {} }, loaded: false };
  try { Object.assign(state, JSON.parse(localStorage.getItem("midas-competitors-ui") || "{}")); } catch {}
  const remember = () => { try { localStorage.setItem("midas-competitors-ui", JSON.stringify({ tab: state.tab, type: state.type, ind: state.ind, threat: state.threat })); } catch {} };

  function render(el, h) {
    root = el; host = h;
    if (!state.loaded) {
      state.loaded = true;
      host.loadSettings().then(s => { if (s) state.settings = { notes: s.notes || {}, midas: s.midas || {}, improvements: s.improvements || {} }; draw(); }).catch(() => {});
    }
    draw();
  }

  function filtered() {
    const q = state.q.trim().toLowerCase();
    const order = { high: 0, medium: 1, low: 2 };
    return COMPETITORS.filter(c =>
      (!state.type || c.type === state.type) &&
      (!state.ind || c.industries.includes(state.ind)) &&
      (!state.threat || c.threat === state.threat) &&
      (!q || JSON.stringify(c).toLowerCase().includes(q))
    ).sort((a, b) => order[a.threat] - order[b.threat]);
  }

  const TABS = [["overview", "🧭 Overview"], ["grow", "📈 Grow / to-do"], ["list", "🏢 Competitors"], ["compare", "📊 Side by side"], ["social", "📱 Social & reviews"], ["contracts", "📄 Contracts & pricing"]];
  const IMP_STATUS = { todo: ["To do", "cp-st-todo"], doing: ["In progress", "cp-st-doing"], done: ["Done", "cp-st-done"] };
  const IMP_AREAS = ["Online presence", "Social", "Reviews & proof", "Offers & pricing", "Niche"];
  const impScore = i => ({ high: 3, medium: 2, low: 1 }[i.impact]) / ({ S: 1, M: 2, L: 3 }[i.effort]);

  function draw() {
    if (!root) return;
    const high = COMPETITORS.filter(c => c.threat === "high").length;
    root.innerHTML = `
      <div class="workspace-header"><div><div class="workspace-title">Competitors</div>
        <div class="workspace-sub">${COMPETITORS.length} GTA managed IT providers: what they sell, who they sell to, prices, contracts, reviews and social media, and how Midas Tech wins. ${high} compete head-to-head with you.</div></div></div>
      <div class="sk-tabs" role="tablist">${TABS.map(([k, n]) => `<button type="button" role="tab" data-cp="tab" data-v="${k}" aria-selected="${state.tab === k}">${n}</button>`).join("")}</div>
      <div class="sk-panel">${state.tab === "overview" ? overviewHtml() : state.tab === "grow" ? growHtml() : state.tab === "list" ? listHtml() : state.tab === "compare" ? compareHtml() : state.tab === "social" ? socialHtml() : contractsHtml()}</div>
      <p class="or-muted cp-foot">Researched ${RESEARCHED} from competitors' websites, directories (Clutch, CloudSecureTech, The Manifest) and search results. Blank means we couldn't find it published. Check a competitor's site before quoting them to a client.</p>`;
  }

  function growHtml() {
    const done = IMPROVEMENTS.filter(i => (state.settings.improvements[i.id]?.status) === "done").length;
    const pct = Math.round(done / IMPROVEMENTS.length * 100);
    const list = IMPROVEMENTS
      .filter(i => !state.growArea || i.area === state.growArea)
      .slice().sort((a, b) => {
        const sa = state.settings.improvements[a.id]?.status === "done" ? 1 : 0;
        const sb = state.settings.improvements[b.id]?.status === "done" ? 1 : 0;
        return sa - sb || impScore(b) - impScore(a);
      });
    const last = CHANGELOG[0];
    return `<section class="or-card cp-grow-head">
        <div class="or-card-head"><div><h3>Grow: our action plan</h3>
          <p class="or-muted">Everything we can do to improve our online presence and win more clients, cross-referenced to what competitors do that we don't. Ordered by impact for the effort. Tick items off — saved for the team.</p></div>
          <div class="cp-progress"><b>${done}/${IMPROVEMENTS.length}</b><span>done</span></div></div>
        <div class="cp-bar"><span style="width:${pct}%"></span></div>
        <div class="cp-grow-filters"><button type="button" data-cp="grow-area" data-v="" class="${!state.growArea ? "on" : ""}">All</button>${IMP_AREAS.map(a => `<button type="button" data-cp="grow-area" data-v="${esc(a)}" class="${state.growArea === a ? "on" : ""}">${esc(a)}</button>`).join("")}</div>
      </section>
      ${list.map(i => {
        const st = state.settings.improvements[i.id] || {};
        const status = st.status || "todo";
        return `<article class="or-card cp-imp cp-imp-${status}">
          <div class="cp-imp-top"><div><span class="cp-tag">${esc(i.area)}</span> <span class="cp-imp-meta">Impact: ${esc(i.impact)} · Effort: ${i.effort === "S" ? "small" : i.effort === "M" ? "medium" : "large"}</span>
            <h4>${esc(i.title)}</h4></div>
            <div class="cp-imp-status">${Object.entries(IMP_STATUS).map(([k, [lbl, cls]]) => `<button type="button" data-cp="imp-status" data-id="${i.id}" data-v="${k}" class="${status === k ? "on " + cls : ""}">${lbl}</button>`).join("")}</div></div>
          <p class="cp-imp-detail">${esc(i.detail)}</p>
          <p class="cp-imp-why"><b>Why:</b> ${esc(i.why)}${i.src ? ` <a href="${esc(i.src)}" target="_blank" rel="noopener">source ↗</a>` : ""}</p>
          <label class="cp-note">Notes<textarea data-cp="imp-note" data-id="${i.id}" rows="1" placeholder="Owner, date, link…">${esc(st.note || "")}</textarea></label>
        </article>`;
      }).join("")}
      <section class="or-card"><h3>What changed each month</h3><p class="or-muted">Updated automatically every 30 days when competitors are re-researched.</p>
        ${CHANGELOG.map(c => `<div class="cp-log"><b>${esc(c.date)}</b><ul class="sk-list-sm">${c.notes.map(n => `<li>${esc(n)}</li>`).join("")}</ul></div>`).join("")}
        <p class="or-muted">Next scheduled refresh runs ~30 days after the last. It opens a PR for review; nothing changes here until it's merged.</p></section>`;
  }

  function overviewHtml() {
    const heads = COMPETITORS.filter(c => c.threat === "high");
    return `<section class="or-card"><h3>What the market looks like</h3><div class="sk-comp">${INSIGHTS.map(([t, d]) => `<div><b>${esc(t)}</b><p>${esc(d)}</p></div>`).join("")}</div></section>
      <section class="or-card"><h3>How Midas Tech wins: 9 moves</h3><p class="or-muted">Ranked by impact. Most are website and marketing changes, not new services.</p>
        <ol class="cp-plays">${PLAYS.map(([t, d]) => `<li><b>${esc(t)}</b><span>${esc(d)}</span></li>`).join("")}</ol></section>
      <section class="or-card"><h3>Your head-to-head competitors</h3><p class="or-muted">Same area, same kind of clients. Know these ${heads.length} well.</p>
        <div class="sk-comp">${heads.map(c => `<div><b>${esc(c.name)}</b><span class="or-muted">${esc(c.where)}</span><p><b>Their edge:</b> ${esc(c.strengths[0])}</p><p><b>How to win:</b> ${esc(c.win)}</p>
          <button class="btn btn-secondary btn-sm" type="button" data-cp="goto" data-id="${c.id}">Full profile</button></div>`).join("")}</div></section>`;
  }

  function cardHtml(c) {
    const [tl, tc] = THREAT[c.threat];
    const note = state.settings.notes[c.id] || "";
    const s = c.social;
    const socialBits = [["LinkedIn", s.linkedin], ["Facebook", s.facebook], ["Instagram", s.instagram], ["YouTube", s.youtube]].filter(([, v]) => v);
    return `<article class="or-card cp-card" id="cp-${c.id}">
      <div class="cp-card-head"><div><h3>${esc(c.name)}</h3><span class="or-muted">${esc(c.where)}</span></div>
        <div class="cp-tags"><span class="cp-threat ${tc}">${tl} threat</span>${c.type === "specialist" ? `<span class="cp-tag">Specialist</span>` : ""}${c.industries.map(i => `<span class="cp-tag">${esc(IND[i])}</span>`).join("")}</div></div>
      <dl class="cp-facts">
        <div><dt>Since</dt><dd>${esc(c.since)}</dd></div>
        <div><dt>Size</dt><dd>${esc(c.size)}</dd></div>
        <div><dt>Clients</dt><dd>${esc(c.clients)}</dd></div>
        <div><dt>Price</dt><dd>${esc(c.pricing)}</dd></div>
        <div><dt>Contract</dt><dd>${esc(c.contract)}</dd></div>
        <div><dt>Response</dt><dd>${esc(c.sla)}</dd></div>
        ${c.reviews ? `<div><dt>Reviews</dt><dd>${esc(c.reviews)}</dd></div>` : ""}
        <div><dt>Social</dt><dd>${socialBits.length ? socialBits.map(([k, v]) => `${k}: ${esc(v)}`).join(" · ") : "Nothing notable found"}${s.content ? `<br><span class="or-muted">Content: ${esc(s.content)}</span>` : ""}</dd></div>
      </dl>
      <div class="cp-services">${c.services.map(x => `<span>${esc(x)}</span>`).join("")}</div>
      <div class="sk-cols cp-sw"><div><b>Strengths</b><ul class="sk-list-sm">${c.strengths.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>
        <div><b>Gaps</b><ul class="sk-list-sm">${c.gaps.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div></div>
      <p class="cp-win"><b>How Midas wins:</b> ${esc(c.win)}</p>
      <label class="cp-note">Your notes (shared with the team)<textarea data-cp="note" data-id="${c.id}" rows="2" placeholder="e.g. Lost Maple Dental to them in May: price">${esc(note)}</textarea></label>
      <p class="cp-src">${c.sources.map(([t, u]) => `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(t)} ↗</a>`).join(" ")}</p>
    </article>`;
  }

  function listHtml() {
    const list = filtered();
    return `<div class="sk-bar cp-filters">
        <label>Search<input data-cp="q" value="${esc(state.q)}" placeholder="Name, town, service…"></label>
        <label>Type<select data-cp="type"><option value="">All</option><option value="msp" ${state.type === "msp" ? "selected" : ""}>General MSPs</option><option value="specialist" ${state.type === "specialist" ? "selected" : ""}>Industry specialists</option></select></label>
        <label>Competes for<select data-cp="ind"><option value="">Any industry</option>${Object.entries(IND).map(([k, v]) => `<option value="${k}" ${state.ind === k ? "selected" : ""}>${v}</option>`).join("")}</select></label>
        <label>Threat<select data-cp="threat"><option value="">Any</option>${Object.entries(THREAT).map(([k, [v]]) => `<option value="${k}" ${state.threat === k ? "selected" : ""}>${v}</option>`).join("")}</select></label>
        <span class="or-muted">${list.length} of ${COMPETITORS.length}</span></div>
      ${list.length ? list.map(cardHtml).join("") : `<p class="or-muted">No competitors match.</p>`}`;
  }

  function compareHtml() {
    const rows = [...COMPETITORS].sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.threat] - { high: 0, medium: 1, low: 2 }[b.threat]));
    const yes = on => on ? "✓" : "";
    return `<section class="or-card"><h3>Side by side</h3><p class="or-muted">Midas Tech first. Scroll sideways on a phone.</p>
      <div class="cp-scroll"><table class="sk-table cp-table"><thead><tr><th>Company</th><th>Threat</th><th>Since</th><th>Price / user</th><th>Contract / guarantee</th><th>Response</th><th>Clinics</th><th>Accounting</th><th>Warehouses</th><th>Reviews</th></tr></thead><tbody>
      <tr class="cp-us"><td><b>Midas Tech</b><br><span class="or-muted">${esc(MIDAS.where)}</span></td><td>—</td><td>${esc(MIDAS.since)}</td><td>${esc(MIDAS.pricing)}</td><td>${esc(MIDAS.contract)}</td><td>Within minutes (from reviews; not published)</td><td>✓</td><td>✓</td><td>✓</td><td>${esc(MIDAS.reviews)}</td></tr>
      ${rows.map(c => `<tr><td><b>${esc(c.name)}</b><br><span class="or-muted">${esc(c.where.split(";")[0])}</span></td><td><span class="cp-threat ${THREAT[c.threat][1]}">${THREAT[c.threat][0]}</span></td><td>${esc(c.since)}</td><td>${esc(c.pricing)}</td><td>${esc(c.contract)}</td><td>${esc(c.sla)}</td>
        <td>${yes(c.industries.includes("healthcare"))}</td><td>${yes(c.industries.includes("accounting"))}</td><td>${yes(c.industries.includes("warehouse"))}</td><td>${esc(c.reviews)}</td></tr>`).join("")}
      </tbody></table></div></section>`;
  }

  function socialHtml() {
    const m = state.settings.midas || {};
    const field = (k, label, ph) => `<label>${label}<input data-cp="midas" data-id="${k}" value="${esc(m[k] ?? "")}" placeholder="${esc(ph)}"></label>`;
    const known = COMPETITORS.filter(c => Object.values(c.social).some(Boolean));
    return `<section class="or-card"><h3>Your numbers</h3><p class="or-muted">Fill these in (check each profile) so you can track progress against competitors. Saved for the team.</p>
        <div class="sk-quote-form">
          ${field("googleReviews", "Google reviews", "35")}${field("googleRating", "Google rating", "5.0")}
          ${field("linkedinCompany", "LinkedIn company followers", "e.g. 250")}${field("linkedinAli", "Ali's LinkedIn followers / connections", "e.g. 1,800")}
          ${field("instagram", "Instagram followers", "e.g. 300")}${field("facebook", "Facebook followers", "e.g. 400")}
          ${field("clutch", "Clutch reviews", "7")}${field("postsPerWeek", "LinkedIn posts per week (now)", "e.g. 1")}
        </div>
        <div class="or-edit-actions"><button class="btn btn-primary btn-sm" type="button" data-cp="save-midas">Save</button></div></section>
      <section class="or-card"><h3>How you compare</h3>
        <div class="cp-scroll"><table class="sk-table"><thead><tr><th></th><th>Google reviews</th><th>LinkedIn</th><th>Facebook</th><th>Instagram</th><th>YouTube / podcast</th><th>Website content</th></tr></thead><tbody>
          <tr class="cp-us"><td><b>Midas Tech</b></td><td>${esc(m.googleRating || "5.0")} (${esc(m.googleReviews || "35")})</td><td>${m.linkedinCompany ? esc(m.linkedinCompany) + " (company)" : "Company page"}${m.linkedinAli ? `, Ali ${esc(m.linkedinAli)}` : " + Ali's profile"}</td><td>${esc(m.facebook || "Yes")}</td><td>${esc(m.instagram || "@midastech.it")}</td><td>—</td><td>Service pages; no pricing guide or town pages yet</td></tr>
          ${known.map(c => `<tr><td><b>${esc(c.name)}</b></td><td>${esc((c.reviews.match(/Google [^;,)]*\)?/) || [""])[0].replace("Google ", ""))}</td><td>${esc(c.social.linkedin)}</td><td>${esc(c.social.facebook)}</td><td>${esc(c.social.instagram)}</td><td>${esc(c.social.youtube || (/podcast/i.test(c.social.content) ? "Podcast" : ""))}</td><td>${esc(c.social.content)}</td></tr>`).join("")}
        </tbody></table></div>
        <p class="or-muted">What we could find publicly. Most GTA MSPs have small social audiences (LinkedIn around 900–1,000 followers for the leaders). They win on Google search and reviews, not social media, so a consistent founder on LinkedIn stands out quickly.</p></section>
      <section class="or-card"><h3>What to improve</h3><ol class="cp-plays">${SOCIAL_ACTIONS.map(([t, d, u]) => `<li><b>${esc(t)}</b><span>${esc(d)}${u ? ` <a href="${esc(u)}" target="_blank" rel="noopener">Source ↗</a>` : ""}</span></li>`).join("")}</ol></section>`;
  }

  function contractsHtml() {
    const withTerms = COMPETITORS.filter(c => !/^Not published$/.test(c.contract));
    const priced = COMPETITORS.filter(c => /\$\d/.test(c.pricing));
    return `<div class="sk-cols">
      <section class="or-card"><h3>How MSP contracts usually work</h3><ul class="sk-list-sm">${CONTRACT_NORMS.map(x => `<li>${esc(x)}</li>`).join("")}</ul>
        <p class="or-muted"><a href="https://www.krgroup.com/managed-it-services-contract-lengths-pros-and-cons/" target="_blank" rel="noopener">Contract lengths ↗</a> <a href="https://mspalliance.com/msp-contract-negotiations-series-termination-clauses/" target="_blank" rel="noopener">Termination clauses ↗</a></p></section>
      <section class="or-card"><h3>Recommended for Midas</h3><ul class="sk-list-sm">
        <li>Keep month to month, or 12 months with onboarding waived (you have this)</li>
        <li>Add a 90-day guarantee: leave in the first 90 days with no exit fee (matches Manawa and G4NS)</li>
        <li>Write exit terms in: documentation handover, and the client keeps admin access, their Microsoft tenant and licences (as Fusion does)</li>
        <li>Put response times in writing (G4NS 15 min, Manawa 15 min, Haycor 30 min)</li>
        <li>Publish "from $89/user/month" on the website</li></ul></section></div>
      <section class="or-card"><h3>Published prices</h3><div class="cp-scroll"><table class="sk-table"><thead><tr><th>Company</th><th>Price</th></tr></thead><tbody>
        <tr class="cp-us"><td><b>Midas Tech</b></td><td>${esc(MIDAS.pricing)}</td></tr>
        ${priced.map(c => `<tr><td>${esc(c.name)}</td><td>${esc(c.pricing)}</td></tr>`).join("")}</tbody></table></div>
        <p class="or-muted">The other ${COMPETITORS.length - priced.length} don't publish prices; they quote after a call or assessment.</p></section>
      <section class="or-card"><h3>Their contracts and guarantees</h3><div class="cp-scroll"><table class="sk-table"><thead><tr><th>Company</th><th>Contract / guarantee</th><th>Response</th></tr></thead><tbody>
        <tr class="cp-us"><td><b>Midas Tech</b></td><td>${esc(MIDAS.contract)}</td><td>Not published yet</td></tr>
        ${withTerms.map(c => `<tr><td>${esc(c.name)}</td><td>${esc(c.contract)}</td><td>${esc(c.sla)}</td></tr>`).join("")}</tbody></table></div></section>`;
  }

  let noteTimer = null;
  function saveNotes() {
    clearTimeout(noteTimer);
    noteTimer = setTimeout(() => host.saveSettings({ notes: state.settings.notes }).then(() => host.toast("Note saved", "success")).catch(() => {}), 900);
  }
  let impTimer = null;
  function saveImprovements() {
    clearTimeout(impTimer);
    impTimer = setTimeout(() => host.saveSettings({ improvements: state.settings.improvements }).then(() => host.toast("Saved", "success")).catch(() => {}), 900);
  }

  document.addEventListener("click", e => {
    const t = e.target.closest("[data-cp]");
    if (!t || !root?.contains(t)) return;
    const a = t.dataset.cp;
    if (a === "tab") { state.tab = t.dataset.v; remember(); draw(); }
    else if (a === "goto") { state.tab = "list"; state.q = ""; state.type = ""; state.ind = ""; state.threat = ""; draw(); document.getElementById(`cp-${t.dataset.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }); }
    else if (a === "save-midas") host.saveSettings({ midas: state.settings.midas }).then(() => { host.toast("Saved", "success"); draw(); }).catch(() => {});
    else if (a === "grow-area") { state.growArea = t.dataset.v; draw(); }
    else if (a === "imp-status") {
      const id = t.dataset.id, cur = state.settings.improvements[id] || {};
      state.settings.improvements[id] = { ...cur, status: cur.status === t.dataset.v ? "todo" : t.dataset.v };
      host.saveSettings({ improvements: state.settings.improvements }).then(() => host.toast("Saved", "success")).catch(() => {});
      draw();
    }
  });
  document.addEventListener("change", e => {
    const t = e.target.closest("[data-cp]");
    if (!t || !root?.contains(t)) return;
    const a = t.dataset.cp;
    if (["type", "ind", "threat"].includes(a)) { state[a] = t.value; remember(); draw(); }
  });
  document.addEventListener("input", e => {
    const t = e.target.closest("[data-cp]");
    if (!t || !root?.contains(t)) return;
    const a = t.dataset.cp;
    if (a === "q") {
      state.q = t.value;
      const pos = t.selectionStart;
      draw();
      const box = root.querySelector('[data-cp="q"]'); box.focus(); try { box.setSelectionRange(pos, pos); } catch {}
    } else if (a === "note") { state.settings.notes[t.dataset.id] = t.value.slice(0, 1000); saveNotes(); }
    else if (a === "imp-note") { const id = t.dataset.id; state.settings.improvements[id] = { ...(state.settings.improvements[id] || {}), note: t.value.slice(0, 500) }; saveImprovements(); }
    else if (a === "midas") { state.settings.midas[t.dataset.id] = t.value.slice(0, 40); }
  });

  window.Competitors = { render, _test: { COMPETITORS, filtered, state } };
})();
