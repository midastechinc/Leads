// Growth section for the Midas Tech lead tracker: one place to improve online presence and win clients.
//   - Action plan: the tracked improvements (moved here from Competitors), each cross-referenced to a
//     competitor gap, with impact/effort, status and step-by-step how-to.
//   - Website: enter your domain; the Railway server fetches the page (public, non-intrusive) and returns
//     on-page SEO + security signals, then suggests changes using what competitors do well.
//   - Social networks: a per-network playbook with competitor benchmarks and an action checklist.
//
// index.html calls Growth.render(root, host). host gives: loadSettings()/saveSettings(patch) for
// appSettings/growth, securityScan(domain) via the Railway service, and toast(msg,type).
(function () {
  "use strict";

  const IMPROVEMENTS = [
    { id: "publish-prices", area: "Offers & pricing", impact: "high", effort: "S", title: "Publish your prices on the website", detail: "Put “Plans from $89/user/month” and the three plans on midastech.ca.", why: "Fusion, TUCU, CG, ITBizTek and Nucleus publish prices; buyers shortlist the firms that do.", steps: ["Add a Pricing (or Plans) page to midastech.ca with the three plans: Essentials $89, Business $139, Secure+ $189 per user/month.", "For each plan list 4–6 things included, and mark Business “Most popular”.", "Add one line: “Plus HST. Microsoft 365 licences at cost. Month to month, or 12 months with onboarding waived.”", "Link to it from the home page and the main menu.", "Use the exact plan wording from the Sales Kit → Packages so it matches your quotes."] },
    { id: "guarantee", area: "Offers & pricing", impact: "high", effort: "S", title: "Add a 90-day happiness guarantee", detail: "“Not happy in your first 90 days? Leave with no fee and we hand everything over.” Put it on the site and in the deck.", why: "Manawa (90-day exit + money back) and G4NS (60-day money back) both advertise guarantees; you don’t.", steps: ["Decide the promise: “90-day happiness guarantee — not happy in your first 90 days, leave with no fee and we hand everything over.”", "Add it as a badge on the home page and the pricing page.", "Add one line to the meeting deck’s ‘Switching is easier than you think’ slide.", "Add it to your proposal template so every quote shows it.", "Keep a simple internal note of the promise so the team answers consistently."] },
    { id: "response-time", area: "Offers & pricing", impact: "high", effort: "S", title: "Publish a written response time", detail: "Your reviews say you answer within minutes — write it down, e.g. “15-minute response in business hours, 1 hour after hours.”", why: "G4NS and Manawa advertise 15-minute response; Haycor 30-minute. You have the speed but don’t claim it.", steps: ["Pick honest numbers you can always hit, e.g. “15-minute response in business hours, 1 hour after hours.”", "Put it on the home page and pricing page.", "Add it to proposals and to the meeting deck.", "Tell the team the target so it’s real, and glance at your ticket timestamps monthly to confirm you’re meeting it."] },
    { id: "reviews-60", area: "Reviews & proof", impact: "high", effort: "M", title: "Get to 60+ Google reviews", detail: "Ask every happy client, send the review link the same day you fix something, and reply to every review.", why: "XBASE has 73 and Manawa 51. You have 35 at 5.0 — more reviews at that rating would lead the pack.", steps: ["Get your Google review short link from your Google Business Profile (Ask for reviews → copy link).", "The same day you fix something or finish a visit, text or email the client the link with one line: “Would you mind leaving a quick Google review?”", "Reply to every review, good or bad, within a day.", "Track the count; aim for 2–3 new reviews a month to pass 60.", "Add the review link to your email signature and invoices."] },
    { id: "warehouse-page", area: "Niche", impact: "high", effort: "M", title: "Own “Warehouse & logistics IT” in Vaughan and Concord", detail: "A dedicated page: scanners, dock Wi-Fi, WMS/TMS uptime, label printers, supplier-payment fraud.", why: "Only Fusion, JIG and Echoflare have a logistics page, and none are in Vaughan or Concord where the warehouses are.", steps: ["Create a ‘Warehouse & logistics IT’ page on midastech.ca.", "Cover the things warehouses feel: scanner and label-printer uptime, dock and floor Wi-Fi, WMS/TMS reliability, and fake supplier-banking-change emails.", "Add one short local example or a line about Vaughan/Concord.", "End with the free assessment and your booking link.", "Target the words ‘warehouse IT Vaughan’ and ‘logistics IT Concord’ in the page title and headings."] },
    { id: "clinic-page", area: "Niche", impact: "high", effort: "M", title: "Add a clinic page beyond dental", detail: "Medical, physio, chiropractic and optometry, with PHIPA and a “software we support” list (Accuro, OSCAR, Jane, plus dental systems).", why: "Four firms fight over dentists; no GTA specialist covers other clinics.", steps: ["Create a ‘Healthcare & clinic IT’ page covering medical, dental, physio, chiro and optometry.", "Explain PHIPA plainly: access controls, encryption, backups, a breach plan.", "Add a ‘software we support’ list: Accuro, OSCAR, Jane, plus dental systems (Dentrix, ABELDent, ClearDent, Open Dental).", "Mention EMR support and tested backups.", "End with the free assessment and booking link; target ‘clinic IT Richmond Hill’ etc."] },
    { id: "linkedin-founder", area: "Social", impact: "high", effort: "M", title: "Post from Ali’s personal LinkedIn 3× a week", detail: "Your own voice, about clinics, accounting, warehouses and local business. Consistency beats volume.", why: "Personal profiles get 5–10× the reach of company pages, and competitors’ pages only sit at ~900–1,000 followers — easy to stand out.", src: "https://c4solutionsllc.com/linkedin-content-strategy-msp/", steps: ["Use Ali’s personal LinkedIn profile, not just the company page.", "Pick 3 themes: clinic/accounting/warehouse security, a tip of the week, and a short local story.", "Post 3 times a week. Keep each post short, in your own voice, ending with one question.", "Batch-write a week of posts in one sitting so it’s sustainable.", "Reply to every comment within a few hours."] },
    { id: "case-studies", area: "Reviews & proof", impact: "high", effort: "M", title: "Publish 2–3 client case studies", detail: "Before / what we did / result. Anonymous is fine. Put them on the site and in the Sales Kit deck.", why: "Competitors show scale; you can show real results with businesses like the prospect.", steps: ["Pick 2–3 clients with a clear before/after (a fixed backup, passed insurance, less downtime).", "Ask permission; anonymous is fine (“a 12-person dental clinic in Markham”).", "Write each as: the problem → what we did → the result, in a few sentences.", "Put them on the website and add them in Sales Kit → Meeting deck → Your proof so they show on the deck.", "Add a client quote if you can get one."] },
    { id: "town-pages", area: "Online presence", impact: "medium", effort: "L", title: "Add town pages", detail: "One page each for Richmond Hill, Markham, Vaughan, Aurora and Newmarket, each with a local client story.", why: "Fusion, CG, G4NS, Wingman and BALANCED+ rank locally with a page for every town.", steps: ["Make one page each for Richmond Hill, Markham, Vaughan, Aurora and Newmarket.", "On each, mention the area by name, your on-site coverage, and a local client story.", "Keep the core the same but change the town and the example, so they don’t read as duplicates.", "Link them from a footer ‘Areas we serve’ menu.", "Put the town in each page title, e.g. ‘Managed IT services in Markham’."] },
    { id: "pricing-guide", area: "Online presence", impact: "medium", effort: "M", title: "Write a York Region pricing guide", detail: "“What managed IT costs in York Region (2026).” Ranks in search and brings ready-to-buy visitors.", why: "Every top competitor (Fusion, CG, TUCU, BALANCED+, Meteor) has one.", steps: ["Write one article: ‘What managed IT costs in York Region (2026)’.", "Give honest ranges (e.g. $100–250/user) and explain what changes the price.", "Be transparent that your plans start at $89 and what’s included.", "End with the free assessment and booking link.", "Link it from your pricing page and share it on LinkedIn."] },
    { id: "linkedin-comment", area: "Social", impact: "medium", effort: "S", title: "Comment before you post on LinkedIn", detail: "10 thoughtful comments a day on posts by local owners, clinic managers and accountants.", why: "It’s the fastest way to grow reach on LinkedIn in 2026, and no local MSP is doing it.", src: "https://www.lilachbullock.com/linkedin-growth-b2b-founder/", steps: ["Each morning, spend 10 minutes on LinkedIn.", "Leave thoughtful comments on posts by local business owners, clinic managers and accountants — helpful, not salesy.", "Follow the people and businesses you want as clients.", "Do this before you post your own content; it lifts your reach.", "Keep it to 10 comments a day, consistently."] },
    { id: "video", area: "Social", impact: "medium", effort: "M", title: "Post short talking-head videos", detail: "30–60 seconds, one tip each. Re-use on Instagram Reels, Facebook and YouTube Shorts.", why: "LinkedIn video views are up 36% year on year, and it feels personal — your owner-led edge.", src: "https://www.kometmedia.com/blogs/linkedin-video-distribution-playbook-for-founders", steps: ["Film 30–60 second phone videos, one tip each (‘Is your clinic’s backup really working?’).", "Talk to the camera; add captions (most people watch on mute).", "Post to LinkedIn first, then reuse on Instagram Reels, Facebook and YouTube Shorts.", "Aim for one a week to start.", "Use the Social Posts tool to plan the topics."] },
    { id: "gbp-weekly", area: "Online presence", impact: "medium", effort: "S", title: "Post to Google Business weekly", detail: "Use the Google Business post pack already in Social Posts.", why: "Competitors barely post there — an easy win for local search.", steps: ["Open Social Posts → the Google Business post pack.", "Post once a week to your Google Business Profile (an offer, a tip, or a quick update).", "Add a photo where you can.", "Include your booking link.", "Reply to any questions or reviews while you’re there."] },
    { id: "tax-season", area: "Niche", impact: "medium", effort: "S", title: "Beat Haycor with accounting firms in tax season", detail: "A CRA EFILE MFA readiness check and a “tax-season priority line” from January to April.", why: "Haycor is the York Region accounting specialist and promises tax-season priority; match and out-specialise it.", steps: ["Build a one-page ‘CRA EFILE security check’ offer for accounting firms (MFA on EFILE and Represent a Client, backups, staff training).", "From November to January, email and call accounting-firm leads with it.", "Offer a ‘tax-season priority line’: faster response January–April.", "Add an accounting page to the site that says this.", "Use the accounting email template in Outreach with a trigger."] },
    { id: "exit-terms", area: "Offers & pricing", impact: "medium", effort: "S", title: "Write client-friendly exit terms", detail: "On leaving, you hand over documentation and the client keeps admin access, their Microsoft tenant and licences.", why: "Fusion advertises exactly this; it removes the fear of being locked in.", steps: ["Add a short ‘How leaving works’ section to your proposal and website.", "State: we hand over full documentation, and you keep admin access, your Microsoft tenant and your licences.", "Confirm no lock-in: month to month with 30 days’ notice.", "Say it out loud in meetings — it removes the fear of switching.", "Keep an offboarding checklist so it’s true in practice."] },
    { id: "clutch", area: "Reviews & proof", impact: "low", effort: "S", title: "Grow Clutch reviews to 15+", detail: "Ask clients to leave a Clutch review; you have 7.", why: "Many “top MSP” lists are built from Clutch, so more reviews there feed future rankings.", steps: ["Ask 8–10 happy clients to leave a Clutch review (Clutch usually interviews them briefly).", "Send the Clutch review link the same way as Google.", "Fill out your Clutch profile fully: services, industries, locations.", "Aim for 15+ reviews over a few months.", "These feed the ‘top MSP’ lists that send you leads."] },
    { id: "software-list", area: "Niche", impact: "low", effort: "S", title: "Add a “software we support” list", detail: "List the dental, medical and accounting programs you support, by name.", why: "Starcomm lists every dental program by name and it reassures clinic buyers.", steps: ["Make a ‘Software we support’ list for your website and clinic/accounting pages.", "Group it: dental (Dentrix, ABELDent, ClearDent, Open Dental), medical (Accuro, OSCAR, Jane), accounting (QuickBooks, Caseware, TaxCycle).", "Only list what you can genuinely support.", "It reassures clinic and firm buyers you know their tools.", "Update it as you take on new client software."] },
    { id: "certs", area: "Reviews & proof", impact: "low", effort: "M", title: "Show your security tools and policies", detail: "List your stack (EDR, MFA, backup) and written policies; link the insurance checklist.", why: "XBASE leads with SOC 2 Type II and Cyber Verify — you can show substance without the audit cost.", steps: ["List your security stack plainly: managed EDR, MFA everywhere, backups tested, patching, training.", "Publish your written policies (even short ones): incident response, backups, access control.", "Link the insurance checklist page from your security page.", "Note any partner status (Microsoft Partner) and the CyberSecure Canada baseline you follow.", "This shows substance without paying for a SOC 2 audit."] }
  ];
  const CHANGELOG = [
    { date: "September 2026", notes: ["First competitor research pass: 26 GTA providers profiled.", "Baseline: your 5.0 Google rating (35 reviews) trails only XBASE (73) and Manawa (51) on volume.", "Open niches found: warehouses in Vaughan/Concord, and non-dental clinics."] }
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

  // Per-network social playbook. Benchmarks are what we found for GTA MSP competitors (Sep 2026);
  // most sit around 900-1,000 LinkedIn followers, so a consistent founder stands out fast.
  const NETWORKS = [
    { id: "linkedin", name: "LinkedIn (Ali's personal profile)", icon: "in", why: "The best B2B channel for an MSP. Personal profiles get 5-10x the reach of company pages, and decision-makers (owners, clinic and office managers, accountants) are here.", good: ["3 posts a week in Ali's voice", "A clear headline: what you do + who for + where", "10 helpful comments a day on local owners' posts", "Short talking-head videos with captions"], benchmark: "Competitor company pages: Fusion ~964, Manawa ~905 followers. Almost none post as the founder.", actions: ["linkedin-founder", "linkedin-comment", "video"] },
    { id: "company", name: "LinkedIn company page", icon: "Co", why: "Where prospects check you're real. Lower reach than personal, but it needs to look active and complete.", good: ["Logo, banner, tagline, services and location filled in", "Re-share Ali's posts", "Link to the website and booking page"], benchmark: "Keep it complete and post weekly; the personal profile does the heavy lifting.", actions: [] },
    { id: "google", name: "Google Business Profile", icon: "G", why: "The single biggest driver of local leads. Reviews and weekly posts lift you in the local map pack.", good: ["Weekly Google post (offer, tip, update)", "Reply to every review", "Correct category, services, hours, service areas", "Photos of real work"], benchmark: "You: 5.0 from 35 reviews (strong). XBASE 73, Manawa 51 have more volume.", actions: ["reviews-60", "gbp-weekly"] },
    { id: "instagram", name: "Instagram (@midastech.it)", icon: "IG", why: "Secondary, but good for showing the human side and local presence. Reuse LinkedIn video here.", good: ["Reels from your LinkedIn videos", "Behind-the-scenes and community posts", "Bio with booking link"], benchmark: "Most GTA MSP competitors barely use Instagram - easy to stand out locally.", actions: ["video"] },
    { id: "facebook", name: "Facebook", icon: "f", why: "Useful for local trust and older small-business owners. Low effort: mirror your other posts.", good: ["Mirror Google/LinkedIn posts", "Keep page info accurate", "Ask happy clients for a recommendation"], benchmark: "Manawa ~993 likes. Low priority; keep it consistent, not daily.", actions: [] },
    { id: "youtube", name: "YouTube", icon: "YT", why: "A home for your video clips; helps search and gives links to share. Low priority to start.", good: ["Post the LinkedIn video clips as Shorts", "One playlist per topic (security, clinics, accounting)"], benchmark: "G4NS has a channel; Manawa runs a podcast. Start with clips, grow later.", actions: ["video"] },
    { id: "reviews", name: "Reviews & directories", icon: "star", why: "Reviews are proof. Directory listings feed the 'top MSP' articles that send leads.", good: ["Get to 60+ Google reviews", "15+ Clutch reviews", "Consistent name/address/phone everywhere"], benchmark: "Clutch: you have 7. Many 'top MSP' lists are built from Clutch and directories.", actions: ["reviews-60", "clutch"] }
  ];

  // ── helpers ──
  const esc = s => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  const IMP_STATUS = { todo: ["To do", "cp-st-todo"], doing: ["In progress", "cp-st-doing"], done: ["Done", "cp-st-done"] };
  const IMP_AREAS = ["Online presence", "Social", "Reviews & proof", "Offers & pricing", "Niche"];
  const impScore = i => ({ high: 3, medium: 2, low: 1 }[i.impact]) / ({ S: 1, M: 2, L: 3 }[i.effort]);
  const impById = id => IMPROVEMENTS.find(i => i.id === id);

  let host = null, root = null;
  const state = { tab: "plan", growArea: "", scanDomain: "", scan: null, scanning: false, scanError: "",
    settings: { improvements: {}, midas: {} }, loaded: false };
  try { Object.assign(state, JSON.parse(localStorage.getItem("midas-growth-ui") || "{}"), { scan: null, scanning: false }); } catch {}
  const remember = () => { try { localStorage.setItem("midas-growth-ui", JSON.stringify({ tab: state.tab, growArea: state.growArea, scanDomain: state.scanDomain })); } catch {} };

  function render(el, h) {
    root = el; host = h;
    if (!state.loaded) {
      state.loaded = true;
      host.loadSettings().then(s => { if (s) state.settings = { improvements: s.improvements || {}, midas: s.midas || {} }; draw(); }).catch(() => {});
    }
    draw();
  }

  const TABS = [["plan", "✅ Action plan"], ["website", "🌐 Website"], ["social", "📱 Social networks"]];
  function draw() {
    if (!root) return;
    root.innerHTML = `
      <div class="workspace-header"><div><div class="workspace-title">Growth</div>
        <div class="workspace-sub">One place to improve your online presence and win more clients: a tracked action plan, a website check, and a social-media playbook — all cross-referenced to what competitors do.</div></div></div>
      <div class="sk-tabs" role="tablist">${TABS.map(([k, n]) => `<button type="button" role="tab" data-gr="tab" data-v="${k}" aria-selected="${state.tab === k}">${n}</button>`).join("")}</div>
      <div class="sk-panel">${state.tab === "plan" ? planHtml() : state.tab === "website" ? websiteHtml() : socialHtml()}</div>`;
  }

  // ── Action plan (moved from Competitors) ──
  function planHtml() {
    const done = IMPROVEMENTS.filter(i => (state.settings.improvements[i.id]?.status) === "done").length;
    const pct = Math.round(done / IMPROVEMENTS.length * 100);
    const list = IMPROVEMENTS.filter(i => !state.growArea || i.area === state.growArea).slice().sort((a, b) => {
      const sa = state.settings.improvements[a.id]?.status === "done" ? 1 : 0;
      const sb = state.settings.improvements[b.id]?.status === "done" ? 1 : 0;
      return sa - sb || impScore(b) - impScore(a);
    });
    return `<section class="or-card cp-grow-head">
        <div class="or-card-head"><div><h3>Your action plan</h3>
          <p class="or-muted">Everything to improve online presence and win clients, cross-referenced to competitor gaps. Ordered by impact for the effort. Tick items off — saved for the team.</p></div>
          <div class="cp-progress"><b>${done}/${IMPROVEMENTS.length}</b><span>done</span></div></div>
        <div class="cp-bar"><span style="width:${pct}%"></span></div>
        <div class="cp-grow-filters"><button type="button" data-gr="area" data-v="" class="${!state.growArea ? "on" : ""}">All</button>${IMP_AREAS.map(a => `<button type="button" data-gr="area" data-v="${esc(a)}" class="${state.growArea === a ? "on" : ""}">${esc(a)}</button>`).join("")}</div>
      </section>
      ${list.map(i => {
        const st = state.settings.improvements[i.id] || {};
        const status = st.status || "todo";
        return `<article class="or-card cp-imp cp-imp-${status}">
          <div class="cp-imp-top"><div><span class="cp-tag">${esc(i.area)}</span> <span class="cp-imp-meta">Impact: ${esc(i.impact)} · Effort: ${i.effort === "S" ? "small" : i.effort === "M" ? "medium" : "large"}</span>
            <h4>${esc(i.title)}</h4></div>
            <div class="cp-imp-status">${Object.entries(IMP_STATUS).map(([k, [lbl, cls]]) => `<button type="button" data-gr="imp-status" data-id="${i.id}" data-v="${k}" class="${status === k ? "on " + cls : ""}">${lbl}</button>`).join("")}</div></div>
          <p class="cp-imp-detail">${esc(i.detail)}</p>
          <p class="cp-imp-why"><b>Why:</b> ${esc(i.why)}${i.src ? ` <a href="${esc(i.src)}" target="_blank" rel="noopener">source ↗</a>` : ""}</p>
          ${i.steps && i.steps.length ? `<details class="cp-steps"><summary>How to do it</summary><ol>${i.steps.map(s => `<li>${esc(s)}</li>`).join("")}</ol></details>` : ""}
          <label class="cp-note">Notes<textarea data-gr="imp-note" data-id="${i.id}" rows="1" placeholder="Owner, date, link…">${esc(st.note || "")}</textarea></label>
        </article>`;
      }).join("")}
      <section class="or-card"><h3>What changed each month</h3><p class="or-muted">Updated automatically every 30 days when competitors are re-researched.</p>
        ${CHANGELOG.map(c => `<div class="cp-log"><b>${esc(c.date)}</b><ul class="sk-list-sm">${c.notes.map(n => `<li>${esc(n)}</li>`).join("")}</ul></div>`).join("")}</section>`;
  }

  // ── Website check ──
  const DEFAULT_SITE = "midastech.ca";
  function websiteHtml() {
    const scan = state.scan;
    return `<section class="or-card"><h3>Website check</h3>
      <p class="or-muted">Enter your website domain. The server loads the page (public, non-intrusive — the same request a browser makes) and reports on-page SEO and security, then suggests changes based on what competitors do well.</p>
      <div class="sk-scan-bar">
        <input data-gr="site-domain" value="${esc(state.scanDomain || DEFAULT_SITE)}" placeholder="${DEFAULT_SITE}" aria-label="Website domain">
        <button class="btn btn-primary" type="button" data-gr="run-site" ${state.scanning ? "disabled" : ""}>${state.scanning ? "Checking…" : "Check website"}</button>
      </div>
      ${state.scanError ? `<p class="sk-scan-err">${esc(state.scanError)}</p>` : ""}
      ${state.scanning ? `<p class="sk-sub">Loading ${esc(state.scanDomain || DEFAULT_SITE)}…</p>` : ""}</section>
      ${scan ? websiteReport(scan) : `<section class="or-card"><p class="or-muted">Tip: run <b>midastech.ca</b> first, then use it as a checklist. If the server can't reach the site you'll see a note rather than a wrong result.</p></section>`}`;
  }
  function chk(status, label, note) { return { status, label, note }; }
  function websiteChecks(seo, scan) {
    const rows = [];
    const https = !scan.findings.some(f => f.id === "https");
    rows.push(chk(https ? "good" : "bad", "HTTPS (secure connection)", https ? "Served over HTTPS." : "The site loaded over plain HTTP."));
    if (!seo) return rows;
    rows.push(chk(seo.title && seo.titleLen >= 30 && seo.titleLen <= 65 ? "good" : seo.title ? "warn" : "bad", "Page title",
      !seo.title ? "No <title> tag found." : `"${seo.title}" (${seo.titleLen} chars).${seo.titleLen > 65 ? " Too long — Google cuts it off." : seo.titleLen < 30 ? " Short — add what you do and your city." : ""}${/^[^a-z]*$/.test(seo.title.replace(/[^A-Za-z]/g, "")) ? " It's in ALL CAPS; use normal case." : ""}${!/richmond hill|gta|ontario|toronto|vaughan|markham/i.test(seo.title) ? " No location keyword — add 'Richmond Hill' or 'GTA'." : ""}`));
    rows.push(chk(seo.metaDescription && seo.metaDescriptionLen >= 70 && seo.metaDescriptionLen <= 160 ? "good" : seo.metaDescription ? "warn" : "bad", "Meta description",
      !seo.metaDescription ? "Missing — Google writes its own, usually worse." : `${seo.metaDescriptionLen} chars.${seo.metaDescriptionLen > 160 ? " Trim to under 160." : seo.metaDescriptionLen < 70 ? " Expand to 70–160 with a reason to click." : ""}`));
    rows.push(chk(seo.h1.length === 1 ? "good" : "warn", "Main heading (H1)", seo.h1.length === 0 ? "No H1 found — add one clear headline." : seo.h1.length === 1 ? `"${seo.h1[0]}"` : `${seo.h1.length} H1s found — a page should have one.`));
    rows.push(chk(seo.hasViewport ? "good" : "bad", "Mobile ready (viewport)", seo.hasViewport ? "Has a mobile viewport tag." : "No viewport tag — the site may not adapt to phones."));
    rows.push(chk(seo.hasSchema ? "good" : "warn", "LocalBusiness schema", seo.hasSchema ? "Structured data present." : "No schema — add LocalBusiness markup so Google shows your address, hours and rating."));
    rows.push(chk(seo.hasCanonical ? "good" : "warn", "Canonical tag", seo.hasCanonical ? "Present." : "Add a canonical tag to avoid duplicate-URL issues."));
    rows.push(chk(seo.hasOgTags ? "good" : "warn", "Social share tags (Open Graph)", seo.hasOgTags ? "Present — links preview nicely when shared." : "Add Open Graph tags so shared links show a title and image."));
    const altPct = seo.images ? Math.round(seo.imagesWithAlt / seo.images * 100) : 100;
    rows.push(chk(altPct >= 80 ? "good" : altPct >= 50 ? "warn" : "bad", "Image alt text", `${seo.imagesWithAlt} of ${seo.images} images have alt text (${altPct}%). Alt text helps SEO and accessibility.`));
    rows.push(chk(seo.wordCount >= 300 ? "good" : "warn", "Content depth", `About ${seo.wordCount} words on the home page.${seo.wordCount < 300 ? " Thin — add helpful copy for buyers and Google." : ""}`));
    return rows;
  }
  // Recommendations that come from competitor strategy (always relevant to Midas), tied to plan items.
  const SITE_RECS = [
    ["Publish your prices", "Fusion, TUCU, CG, ITBizTek and Nucleus publish pricing. Add a Plans page with $89/$139/$189.", "publish-prices"],
    ["Add industry pages", "Fusion, G4NS and Haycor rank with pages for healthcare, accounting and logistics. Add a clinic page and a warehouse page.", "clinic-page"],
    ["Add town pages", "Fusion, CG, G4NS and Wingman have a page per town. Add Richmond Hill, Markham, Vaughan, Aurora, Newmarket.", "town-pages"],
    ["Publish a pricing guide", "Every top competitor has a 'what managed IT costs' guide that ranks and pulls ready-to-buy visitors.", "pricing-guide"],
    ["Show a guarantee and response time", "Manawa and G4NS advertise guarantees; G4NS, Manawa and Haycor advertise response times. Put yours on the site.", "guarantee"],
    ["Embed your reviews", "Show your 5.0 Google rating and client quotes on the home page as proof.", "case-studies"]
  ];
  function websiteReport(scan) {
    const seo = scan.seo;
    const rows = websiteChecks(seo, scan);
    const bad = rows.filter(r => r.status === "bad").length, warn = rows.filter(r => r.status === "warn").length;
    const ICON = { good: "✓", warn: "!", bad: "✗" };
    const notReached = scan.checked.website === false;
    return `<section class="or-card gr-report">
        <div class="or-card-head"><div><h3>${esc(scan.domain)}</h3>
          <p class="or-muted">${notReached ? "The server couldn't fully load the site right now — try again shortly." : `${bad} to fix, ${warn} to improve. ${seo && seo.generator ? "Built on " + esc(seo.generator) + "." : ""}`}</p></div></div>
        ${rows.map(r => `<div class="gr-check gr-${r.status}"><span class="gr-ic">${ICON[r.status]}</span><div><b>${esc(r.label)}</b><span>${esc(r.note)}</span></div></div>`).join("")}
        ${seo && seo.socialLinks.length ? `<p class="or-muted" style="margin-top:10px">Social links found on the page: ${seo.socialLinks.map(u => esc(u.replace(/^https?:\/\/(www\.)?/, "").split("/")[0])).filter((v, i, a) => a.indexOf(v) === i).join(", ")}</p>` : seo ? `<p class="or-muted" style="margin-top:10px">No social-media links found on the page — add LinkedIn, Google and Instagram links.</p>` : ""}
      </section>
      <section class="or-card"><h3>Suggested changes (from competitor strategy)</h3>
        <p class="or-muted">What the competitors who win on Google are doing that your site can adopt. Each links to the action plan.</p>
        ${SITE_RECS.map(([t, d, id]) => `<div class="gr-rec"><div><b>${esc(t)}</b><span>${esc(d)}</span></div><button class="btn btn-secondary btn-sm" type="button" data-gr="goto-plan" data-id="${esc(id)}">Add to plan ↗</button></div>`).join("")}
      </section>
      <p class="or-muted cp-foot">Public, non-intrusive: only the site's own front page and public DNS were read. Security details are in Sales Kit → Security snapshot.</p>`;
  }

  // ── Social networks ──
  function socialHtml() {
    const m = state.settings.midas || {};
    const yourNums = [["Google", m.googleRating ? `${m.googleRating} (${m.googleReviews || "?"})` : "5.0 (35)"], ["LinkedIn (company)", m.linkedinCompany || "—"], ["LinkedIn (Ali)", m.linkedinAli || "—"], ["Instagram", m.instagram || "—"], ["Facebook", m.facebook || "—"], ["Clutch", m.clutch || "7"]];
    return `<section class="or-card"><div class="or-card-head"><div><h3>Social media playbook</h3>
        <p class="or-muted">Where to be, what "good" looks like, and how you compare. Enter your follower numbers in Competitors → Social & reviews to track them.</p></div></div>
        <div class="gr-nums">${yourNums.map(([k, v]) => `<div><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join("")}</div></section>
      ${NETWORKS.map(n => `<article class="or-card gr-net">
        <div class="gr-net-head"><span class="gr-net-ic">${esc(n.icon)}</span><h4>${esc(n.name)}</h4></div>
        <p class="cp-imp-detail">${esc(n.why)}</p>
        <div class="sk-cols"><div><b>What good looks like</b><ul class="sk-list-sm">${n.good.map(g => `<li>${esc(g)}</li>`).join("")}</ul></div>
          <div><b>Competitor benchmark</b><p class="or-muted">${esc(n.benchmark)}</p></div></div>
        ${n.actions.length ? `<div class="gr-net-actions">${n.actions.map(id => { const it = impById(id); return it ? `<button class="btn btn-secondary btn-sm" type="button" data-gr="goto-plan" data-id="${esc(id)}">${esc(it.title)} ↗</button>` : ""; }).join("")}</div>` : ""}
      </article>`).join("")}
      <section class="or-card"><h3>Do these first</h3><ol class="cp-plays">${SOCIAL_ACTIONS.map(([t, d, u]) => `<li><b>${esc(t)}</b><span>${esc(d)}${u ? ` <a href="${esc(u)}" target="_blank" rel="noopener">source ↗</a>` : ""}</span></li>`).join("")}</ol></section>`;
  }

  // ── save + events ──
  let impTimer = null;
  function saveImprovements() { clearTimeout(impTimer); impTimer = setTimeout(() => host.saveSettings({ improvements: state.settings.improvements }).then(() => host.toast("Saved", "success")).catch(() => {}), 900); }
  async function runSite() {
    const domain = (state.scanDomain || DEFAULT_SITE).trim();
    if (!domain) { host.toast("Enter your website domain", "error"); return; }
    if (typeof host.securityScan !== "function") { host.toast("The Railway service is needed for this.", "error"); return; }
    state.scanning = true; state.scanError = ""; draw();
    try {
      const scan = await host.securityScan(domain);
      state.scan = scan; state.scanDomain = domain; remember();
      if (!scan) { state.scanError = "That doesn't look like a website domain."; host.toast(state.scanError, "error"); }
    } catch (e) { state.scanError = e.message || "Couldn't check the site."; host.toast(state.scanError, "error"); }
    state.scanning = false; draw();
  }
  document.addEventListener("click", e => {
    const t = e.target.closest("[data-gr]"); if (!t || !root?.contains(t)) return;
    const a = t.dataset.gr;
    if (a === "tab") { state.tab = t.dataset.v; remember(); draw(); }
    else if (a === "area") { state.growArea = t.dataset.v; remember(); draw(); }
    else if (a === "run-site") runSite();
    else if (a === "goto-plan") { state.tab = "plan"; state.growArea = ""; remember(); draw(); const el = root.querySelector(`[data-gr="imp-status"][data-id="${t.dataset.id}"]`); el?.closest(".cp-imp")?.scrollIntoView({ behavior: "smooth", block: "center" }); }
    else if (a === "imp-status") {
      const id = t.dataset.id, cur = state.settings.improvements[id] || {};
      state.settings.improvements[id] = { ...cur, status: cur.status === t.dataset.v ? "todo" : t.dataset.v };
      host.saveSettings({ improvements: state.settings.improvements }).then(() => host.toast("Saved", "success")).catch(() => {});
      draw();
    }
  });
  document.addEventListener("input", e => {
    const t = e.target.closest("[data-gr]"); if (!t || !root?.contains(t)) return;
    if (t.dataset.gr === "site-domain") state.scanDomain = t.value.trim();
    else if (t.dataset.gr === "imp-note") { state.settings.improvements[t.dataset.id] = { ...(state.settings.improvements[t.dataset.id] || {}), note: t.value.slice(0, 500) }; saveImprovements(); }
  });

  window.Growth = { render, _test: { IMPROVEMENTS, NETWORKS, websiteChecks, state } };
})();
