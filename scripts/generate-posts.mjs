/**
 * Midas Tech — Daily Social Post Generator
 * Runs via GitHub Actions every day at 10:30 AM ET.
 * Generates 1 Instagram + 1 LinkedIn + 1 Google post, all with different angles.
 * Saves to Supabase social_posts table.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL    = process.env.SUPABASE_URL;
const SUPABASE_KEY    = process.env.SUPABASE_ANON_KEY;
const ONEMIN_API_KEY  = process.env.ONEMIN_API_KEY;
const MODEL           = 'gpt-4o';
const CURRENT_YEAR    = new Date().getFullYear();

if (!SUPABASE_URL || !SUPABASE_KEY || !ONEMIN_API_KEY) {
  console.error('❌ Missing required environment variables: SUPABASE_URL, SUPABASE_ANON_KEY, ONEMIN_API_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Topic pool — 30 unique topics, rotates to avoid repetition ──────────────
const TOPICS = [
  { label: 'Cybersecurity Ontario',       topic: 'cybersecurity Ontario Canada SMB latest',                       industry: 'general'    },
  { label: 'Canadian Data Breaches',      topic: 'data breach Canadian businesses latest',                        industry: 'general'    },
  { label: 'Healthcare Ransomware',       topic: 'ransomware healthcare hospital clinic Ontario latest',           industry: 'healthcare' },
  { label: 'AI Cyber Threats',            topic: 'AI-powered cyberattack business threat latest',                  industry: 'general'    },
  { label: 'Phishing Email Scams',        topic: 'phishing email scam business Canada latest',                    industry: 'general'    },
  { label: 'IT Downtime Cost',            topic: 'IT downtime cost small business recovery Canada latest',         industry: 'general'    },
  { label: 'Cloud & Backup Security',     topic: 'cloud security backup failure compliance SMB Canada latest',     industry: 'general'    },
  { label: 'MFA & Password Security',     topic: 'MFA password attack credential theft business Canada latest',   industry: 'general'    },
  { label: 'Law Firm Cyber Risk',         topic: 'law firm cybersecurity breach confidential data Ontario latest', industry: 'law'        },
  { label: 'Accounting Firm Threats',     topic: 'accounting CPA firm cyber threat client data Ontario latest',   industry: 'accounting' },
  { label: 'Business Email Compromise',   topic: 'business email compromise BEC wire fraud Canada latest',        industry: 'general'    },
  { label: 'Dark Web Data Leaks',         topic: 'dark web credential leak stolen data business Canada latest',   industry: 'general'    },
  { label: 'PIPEDA Compliance Risk',      topic: 'PIPEDA privacy compliance fines breach Canada latest',          industry: 'general'    },
  { label: 'Ransomware SMB Attack',       topic: 'ransomware attack small business Canada latest',                industry: 'general'    },
  { label: 'Dental Clinic Data Risk',     topic: 'dental clinic patient data cybersecurity Ontario latest',       industry: 'dental'     },
  { label: 'Warehouse Logistics Risk',    topic: 'warehouse logistics IT downtime operations risk Canada latest', industry: 'warehouses' },
  { label: 'Endpoint Security Gaps',      topic: 'unprotected endpoint device security gap business latest',      industry: 'general'    },
  { label: 'Silent Network Breaches',     topic: 'undetected silent network intrusion business Canada latest',    industry: 'general'    },
  { label: 'Cyber Insurance Canada',      topic: 'cyber insurance claim denial coverage requirements Canada latest', industry: 'general' },
  { label: 'Canada Cyber Stats',          topic: 'Canada cyberattack statistics SMB report latest',               industry: 'general'    },
  { label: 'Remote Work Security',        topic: 'remote work home office security breach risk Canada latest',    industry: 'general'    },
  { label: 'Finance Firm Threats',        topic: 'finance bookkeeping firm cybersecurity risk Ontario latest',    industry: 'finance'    },
  { label: 'Real Estate Cyber Fraud',     topic: 'real estate wire fraud cyber scam brokerage Canada latest',     industry: 'general'    },
  { label: 'Microsoft 365 Security',      topic: 'Microsoft 365 email compromise account breach business latest', industry: 'general'    },
  { label: 'Retail eCommerce Risk',       topic: 'retail ecommerce payment fraud data breach Ontario latest',     industry: 'retail'     },
  { label: 'Backup Recovery Failure',     topic: 'backup failure data recovery disaster SMB Canada latest',       industry: 'general'    },
  { label: 'Supply Chain Attacks',        topic: 'supply chain cyberattack vendor software Canada SMB latest',    industry: 'general'    },
  { label: 'Cyber Trends This Year',      topic: `cybersecurity trends ${CURRENT_YEAR} SMB Canada threat predictions`, industry: 'general' },
  { label: 'Construction IT Gaps',        topic: 'construction company IT security vulnerability Ontario latest', industry: 'general'    },
  { label: 'Security Assessment Value',   topic: 'business security assessment gaps vulnerabilities Ontario SMB', industry: 'general'    },
];

const INDUSTRY_HASHTAGS = {
  law:        '#LawFirms #LegalIndustry #DataProtection #CyberSecurity #GTA #OntarioBusiness',
  accounting: '#AccountingFirms #CPAFirms #DataProtection #CyberSecurity #GTA #OntarioBusiness',
  healthcare: '#HealthcareClinics #PatientData #CyberSecurity #DataProtection #GTA #OntarioBusiness',
  dental:     '#DentalClinics #PatientData #CyberSecurity #DataProtection #GTA #OntarioBusiness',
  warehouses: '#Warehousing #Manufacturing #BusinessContinuity #CyberSecurity #GTA #OntarioBusiness',
  finance:    '#FinanceFirms #Bookkeeping #DataProtection #CyberSecurity #GTA #OntarioBusiness',
  retail:     '#RetailBusiness #eCommerce #CyberSecurity #DataProtection #GTA #OntarioBusiness',
  general:    '#CyberSecurity #ManagedIT #OntarioBusiness #GTA #SmallBusiness #MidasTech',
};

const PREFERRED_SOURCES = [
  'BleepingComputer (bleepingcomputer.com)',
  'The Hacker News (thehackernews.com)',
  'Dark Reading (darkreading.com)',
  'Cybersecurity News (cybersecuritynews.com)',
  'Krebs on Security (krebsonsecurity.com)',
  'SC Media (scmagazine.com)',
  'CSO Online (csoonline.com)',
].join(', ');

// ── 1min.ai API call ─────────────────────────────────────────────────────────
async function call1min(prompt, webSearch = false) {
  const body = {
    type: 'UNIFY_CHAT_WITH_AI',
    model: MODEL,
    promptObject: { prompt },
  };
  if (webSearch) {
    body.promptObject.settings = {
      webSearchSettings: { webSearch: true, numOfSite: 5, maxWord: 1500 },
    };
  }

  const res = await fetch('https://api.1min.ai/api/chat-with-ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'API-KEY': ONEMIN_API_KEY },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { const e = await res.json(); msg = e?.error?.message || e?.message || msg; } catch (_) {}
    throw new Error(`1min.ai: ${msg}`);
  }

  const data = await res.json();
  const arr = data?.aiRecord?.aiRecordDetail?.resultObject;
  if (arr && arr.length) return arr.join('\n');
  throw new Error('1min.ai returned an unexpected response — check API credits.');
}

// ── JSON extraction ───────────────────────────────────────────────────────────
function extractJSON(raw) {
  const cleaned = raw.replace(/```json|```/gi, '').replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
  const match = cleaned.match(/\[[\s\S]*\]/);
  if (match) {
    try { return JSON.parse(match[0]); } catch (e) { console.warn('JSON parse error:', e.message); }
  }
  return [];
}

// ── Pick today's topic, avoiding recent repeats ───────────────────────────────
async function getTodaysTopic() {
  const since = new Date();
  since.setDate(since.getDate() - 60);

  const { data: recentPosts, error } = await supabase
    .from('social_posts')
    .select('source_topic')
    .eq('auto_generated', true)
    .gte('created_at', since.toISOString())
    .not('source_topic', 'is', null);

  if (error) console.warn('Could not fetch recent topics:', error.message);

  const usedRecently = new Set((recentPosts || []).map(p => p.source_topic).filter(Boolean));
  const available = TOPICS.filter(t => !usedRecently.has(t.label));

  if (available.length > 0) {
    // Pick randomly from unused topics
    return available[Math.floor(Math.random() * available.length)];
  }

  // All topics used recently — fall back to day-of-year rotation
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  return TOPICS[dayOfYear % TOPICS.length];
}

// ── Check if posts already generated today ────────────────────────────────────
async function alreadyGeneratedToday() {
  const today = new Date().toISOString().split('T')[0];
  const { data } = await supabase
    .from('social_posts')
    .select('id')
    .eq('auto_generated', true)
    .eq('generation_date', today)
    .limit(1);
  return data && data.length > 0;
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function run() {
  console.log(`\n🚀 Midas Tech Daily Post Generator — ${new Date().toLocaleString('en-CA', { timeZone: 'America/Toronto' })} ET`);

  if (await alreadyGeneratedToday()) {
    console.log('✅ Posts already generated today — skipping.');
    return;
  }

  const topic = await getTodaysTopic();
  console.log(`📌 Topic: ${topic.label} (${topic.industry})`);

  // Step 1: Web search for news
  console.log('🔍 Searching for latest news...');
  const newsPrompt = `Search the web RIGHT NOW for the most recent ${CURRENT_YEAR} cybersecurity/tech news relevant to Ontario/Canadian SMBs.
Topic: ${topic.topic}
Preferred sources (prioritize these): ${PREFERRED_SOURCES}

Find 2 real, recent ${CURRENT_YEAR} stories. Return ONLY raw JSON array (nothing before [ or after ]):
[{"headline":"exact headline","source":"publication name","date":"Month YYYY","summary":"2 concise sentences explaining why this matters to Ontario business owners","key_stat":"alarming number or null","stat_label":"context for the stat or null","category_tag":"RANSOMWARE ALERT or DATA BREACH or PHISHING THREAT or AI THREAT or COMPLIANCE UPDATE or CYBER ATTACK or IT DOWNTIME or SECURITY TIP"}]`;

  let sourceItems;
  try {
    const newsRaw = await call1min(newsPrompt, true);
    sourceItems = extractJSON(newsRaw);
    console.log(`   Found ${sourceItems.length} news item(s)`);
  } catch (err) {
    console.warn('   Web search failed:', err.message, '— using fallback topic');
    sourceItems = [];
  }

  if (!sourceItems.length) {
    sourceItems = [{
      headline: `${topic.label} — Active Business Risk in ${CURRENT_YEAR}`,
      source: 'Midas Tech Security Brief',
      date: new Date().toLocaleDateString('en-CA', { month: 'long', year: 'numeric' }),
      summary: `Ontario businesses continue to face growing exposure from ${topic.label.toLowerCase()}. Midas Tech helps GTA companies identify and close security gaps before they become incidents.`,
      key_stat: null,
      stat_label: null,
      category_tag: 'SECURITY TIP',
    }];
  }

  const newsContext = sourceItems.slice(0, 2).map((n, i) =>
    `${i + 1}. ${n.headline} (${n.source}, ${n.date})\n   ${n.summary}${n.key_stat && n.key_stat !== 'null' ? `\n   KEY STAT: ${n.key_stat} — ${n.stat_label}` : ''}\n   [${n.category_tag}]`
  ).join('\n\n');

  const hashtags = INDUSTRY_HASHTAGS[topic.industry] || INDUSTRY_HASHTAGS.general;
  const category = sourceItems[0]?.category_tag || 'SECURITY';

  // Step 2: Generate 3 completely different posts
  console.log('✍️  Generating 3 platform posts...');

  const postsPrompt = `You are an expert B2B social media writer for Midas Tech Inc. — an IT & cybersecurity MSP based in Richmond Hill, Ontario serving healthcare, accounting, law, warehousing, and general SMBs across the GTA.

TODAY'S NEWS MATERIAL:
${newsContext}

TOPIC FOCUS: ${topic.label}

Generate exactly 3 posts — one per platform. Each post MUST use a completely different angle, hook, opening line, narrative, and emotional approach. They must read as if written by 3 different writers for 3 different reader mindsets. Do NOT reuse the same hook, sentence, or idea across posts.

CRITICAL — THE FIRST WORD OF EVERY POST MUST NOT BE "Everything", "Imagine", "Picture", "Think", "What", "When", "How", "Are", "Is", "Do", "Can", "Your", "Most", "Many", or any vague generalization. The opening line must be CONCRETE and SPECIFIC — a named business, a real number, a specific event, or a direct statement of fact.

═══════════════════════════════════════════
INSTAGRAM POST — Emotional fear/consequence angle
═══════════════════════════════════════════
- THE FIRST SENTENCE must name a specific business type AND a specific consequence. It must be a statement of something that happened, not a setup or a warning. Use one of these exact structures:
  • "[Business type] in [Ontario city/GTA] [specific bad thing]. [Time reference]." → e.g. "A Mississauga dental clinic lost access to 6 years of patient records on a Wednesday morning."
  • "[Specific bad thing]. [Business type] in [Ontario location] [consequence]." → e.g. "One phishing email. A Markham accounting firm lost 3 weeks of billing data."
  • "[Specific number or fact]. [Direct consequence for a named business type]." → e.g. "4 days of downtime. That's what a GTA warehouse faced after a single ransomware attack last month."
- NEVER open with "Everything", "Imagine", "Picture this", or any scene-setting philosophical line
- Make the reader feel the pain: downtime, client call, lost data, panic
- Short punchy paragraphs, max 2-3 lines each
- Middle: name the exact gap most businesses have (no MFA, no tested backup, etc.)
- End: low-friction offer from a trusted advisor, NOT a salesperson
- Caption length: 150-220 words
- Tone: Human, urgent, story-driven

═══════════════════════════════════════════
LINKEDIN POST — Authority/thought leadership angle
═══════════════════════════════════════════
- THE FIRST SENTENCE must be a specific, verifiable, experience-based or data-based statement. Use one of these exact structures:
  • "We [audited/reviewed/visited] [number] Ontario [business type] this [time period]. [Specific finding]." → e.g. "We reviewed 38 Ontario SMBs this quarter. 31 had no tested disaster recovery plan."
  • "The #1 [threat/gap/entry point] for [business type] in [Ontario/GTA] right now is [specific thing]." → e.g. "The #1 entry point for ransomware in Ontario law firms right now isn't software — it's email."
  • "I keep seeing the same [number] [gaps/mistakes/patterns] across [business type] in the GTA." → e.g. "I keep seeing the same 3 security gaps in GTA healthcare clinics — and attackers know it."
- NEVER open with "Everything", "Imagine", or any philosophical/narrative scene-setter
- Middle: professional breakdown — 3-4 short paragraphs with specific insights, patterns, or data from the news
- Include the news story framed as a professional trend, not a scare story
- Position Midas Tech as the leading cybersecurity authority in GTA
- End with a direct but non-pushy professional CTA
- Caption length: 200-280 words
- Tone: Expert, confident, credible, data-aware

═══════════════════════════════════════════
GOOGLE POST — Local action/offer angle
═══════════════════════════════════════════
- Maximum 70 words total for the caption
- Hyper-local: name Ontario, GTA, or Richmond Hill specifically
- Lead with the immediate business consequence (not a story, not an insight — a direct fact)
- One sharp problem statement, one quick solution hint
- CTA must be a direct action phrase under 8 words
- Tone: Direct, practical, mobile-first

═══════════════════════════════════════════
RULES FOR ALL 3 POSTS:
- BANNED openers (never use any of these, not even partially): "Did you know", "In today's landscape", "As cyber threats grow", "It's no secret", "In an era of", "Everything looks normal", "Everything looks fine", "until it isn't", "Cybercriminals are", "Cyber threats are", "The threat is real", "You might think", "Most businesses think", "Think your business is safe"
- End every caption with: 📞 905-787-2038  |  🌐 midastech.ca  |  ✉️ info@midastech.ca
- Do not invent statistics not present in the source material
- Never mention competitor names or product names
- Each post must feel completely independent — different hook, different narrative, different reader

Return ONLY a raw JSON array (nothing before [ or after ]):
[
  {
    "platform": "instagram",
    "headline": "5-8 word punchy graphic header — ALL CAPS OK",
    "category": "${category}",
    "stat": ${sourceItems[0]?.key_stat && sourceItems[0].key_stat !== 'null' ? `"${sourceItems[0].key_stat}"` : 'null'},
    "statLabel": ${sourceItems[0]?.stat_label && sourceItems[0].stat_label !== 'null' ? `"${sourceItems[0].stat_label}"` : 'null'},
    "caption": "full Instagram caption with line breaks as \\n",
    "hashtags": "${hashtags} #Ransomware #DataBreach",
    "cta": "max 40 chars",
    "notes": "",
    "image_engine": "post",
    "image_style": ""
  },
  {
    "platform": "linkedin",
    "headline": "5-8 word punchy graphic header — different from Instagram",
    "category": "${category}",
    "stat": ${sourceItems[0]?.key_stat && sourceItems[0].key_stat !== 'null' ? `"${sourceItems[0].key_stat}"` : 'null'},
    "statLabel": ${sourceItems[0]?.stat_label && sourceItems[0].stat_label !== 'null' ? `"${sourceItems[0].stat_label}"` : 'null'},
    "caption": "full LinkedIn caption with line breaks as \\n",
    "hashtags": "${hashtags} #ITSecurity #ManagedServices",
    "cta": "max 40 chars",
    "notes": "",
    "image_engine": "post",
    "image_style": ""
  },
  {
    "platform": "google",
    "headline": "5-8 words — statement not a question",
    "category": "${category}",
    "stat": null,
    "statLabel": null,
    "caption": "max 70 words — local, direct, mobile-first",
    "hashtags": "#CyberSecurity #Ontario #GTA",
    "cta": "max 8 words",
    "notes": "",
    "image_engine": "post",
    "image_style": ""
  }
]`;

  const postsRaw = await call1min(postsPrompt, false);
  const posts = extractJSON(postsRaw);

  if (!posts.length) throw new Error('AI returned no posts — check 1min.ai credits and API key.');
  console.log(`   ✅ Generated ${posts.length} posts`);

  // Step 3: Save to Supabase
  const today = new Date().toISOString().split('T')[0];
  const rows = posts.map(post => ({
    platform:               String(post.platform || '').toLowerCase(),
    headline:               post.headline || '',
    category:               post.category || category,
    caption:                (post.caption || '').replace(/\\n/g, '\n'),
    hashtags:               post.hashtags || hashtags,
    cta:                    post.cta || '',
    notes:                  post.notes || '',
    status:                 'draft',
    image_engine:           'post',
    image_style:            post.image_style || '',
    image_url:              '',
    attachment_image_url:   '',
    attachment_image_name:  '',
    source_topic:           topic.label,
    target_audience:        'GTA Business Owners',
    brand_voice:            'premium',
    post_payload:           { ...post, newsSource: sourceItems[0] },
    auto_generated:         true,
    generation_date:        today,
  }));

  const { error: insertError } = await supabase.from('social_posts').insert(rows);
  if (insertError) throw new Error(`Supabase insert failed: ${insertError.message}`);

  console.log(`\n🎉 Done! Saved ${rows.length} posts for ${today}`);
  console.log(`   Topic: ${topic.label}`);
  rows.forEach(r => console.log(`   [${r.platform.toUpperCase()}] "${r.headline}"`));
}

run().catch(err => {
  console.error('\n❌ Generation failed:', err.message);
  process.exit(1);
});
