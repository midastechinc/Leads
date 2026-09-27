// Free website scan (no Apify credit): reads the home page and the pages that usually hold contact
// details (contact, team, about, people, staff, lawyers...), and pulls out emails, phone numbers and
// LinkedIn links. Handles common email hiding: mailto links, Cloudflare "email protection",
// HTML-encoded characters and "name [at] firm [dot] com".

const MAX_PAGES = 14;
const PAGE_TIMEOUT_MS = 12000;
const MAX_PAGE_BYTES = 1_500_000;
const LIKELY_PAGE = /contact|team|about|people|staff|lawyer|attorney|professional|partner|accountant|our-|who-we|meet|leadership|directory|doctor|physician|provider|location|office/i;
const JUNK_EMAIL = /\.(png|jpe?g|gif|webp|svg|css|js)$|@(example|domain|email|sentry|wixpress|sentry-next|yourdomain|company)\.|^(name|your|you|user|email|someone)@/i;

export interface Found { value: string; source: string }

function decodeEntities(s: string) {
  return s
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&(amp|commat|period);/gi, (_, n) => ({ amp: "&", commat: "@", period: "." } as Record<string, string>)[n.toLowerCase()]);
}

function cloudflareEmail(hex: string) {
  try {
    const key = parseInt(hex.slice(0, 2), 16);
    let out = "";
    for (let i = 2; i < hex.length; i += 2) out += String.fromCharCode(parseInt(hex.slice(i, i + 2), 16) ^ key);
    return out;
  } catch {
    return "";
  }
}

export function extractFromHtml(rawHtml: string) {
  const html = decodeEntities(rawHtml);
  const emails = new Set<string>();
  const add = (e: string) => {
    const v = e.trim().toLowerCase().replace(/^mailto:/, "").split("?")[0];
    if (/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,24}$/.test(v) && !JUNK_EMAIL.test(v)) emails.add(v);
  };
  for (const m of html.matchAll(/data-cfemail="([0-9a-f]+)"/gi)) add(cloudflareEmail(m[1]));
  for (const m of html.matchAll(/email-protection#([0-9a-f]+)/gi)) add(cloudflareEmail(m[1]));
  for (const m of html.matchAll(/mailto:([^"'>\s]+)/gi)) { try { add(decodeURIComponent(m[1])); } catch { add(m[1]); } }
  const text = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ");
  for (const m of text.matchAll(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,24}/gi)) add(m[0]);
  for (const m of text.matchAll(/([a-z0-9._%+-]+)\s*[\[(]\s*at\s*[\])]\s*([a-z0-9-]+(?:\s*[\[(]\s*dot\s*[\])]\s*[a-z0-9-]+)+)/gi)) {
    add(`${m[1]}@${m[2].replace(/\s*[\[(]\s*dot\s*[\])]\s*/gi, ".")}`);
  }
  const phones = new Map<string, string>();
  const addPhone = (p: string) => {
    const digits = p.replace(/\D/g, "").replace(/^1(?=\d{10})/, "");
    if (digits.length < 10 || !/^[2-9]\d{2}[2-9]/.test(digits)) return;
    const key = digits.slice(0, 10);
    if (!phones.has(key)) phones.set(key, p.replace(/\s+/g, " ").trim());
  };
  for (const m of html.matchAll(/tel:([+\d().\s-]{10,})/gi)) addPhone(m[1]);
  for (const m of text.matchAll(/(?:\+?1[\s.-]?)?\(?[2-9]\d{2}\)?[\s.-]?\d{3}[\s.-]?\d{4}(?:\s*(?:x|ext\.?|extension)\s*\d{1,5})?/gi)) addPhone(m[0]);
  const linkedins = new Set<string>();
  for (const m of html.matchAll(/https?:\/\/(?:[a-z]{2,3}\.)?linkedin\.com\/(?:in|company)\/[a-z0-9_%-]+/gi)) linkedins.add(m[0].replace(/\/+$/, ""));
  return { emails: [...emails], phones: [...phones.values()], linkedins: [...linkedins] };
}

async function fetchPage(url: string): Promise<{ html: string; finalUrl: string } | null> {
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(PAGE_TIMEOUT_MS),
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "en-CA,en;q=0.9",
      },
    });
    if (!res.ok || !/html/i.test(res.headers.get("content-type") ?? "html")) return null;
    const html = (await res.text()).slice(0, MAX_PAGE_BYTES);
    return { html, finalUrl: res.url || url };
  } catch {
    return null;
  }
}

export async function scanSite(startUrl: string) {
  const first = await fetchPage(startUrl);
  const pages: string[] = [];
  const emails = new Map<string, string>(), phones = new Map<string, string>(), linkedins = new Map<string, string>();
  const take = (html: string, url: string) => {
    pages.push(url);
    const f = extractFromHtml(html);
    f.emails.forEach((e) => { if (!emails.has(e)) emails.set(e, url); });
    f.phones.forEach((p) => { const k = p.replace(/\D/g, "").replace(/^1(?=\d{10})/, "").slice(0, 10); if (!phones.has(k)) phones.set(k, `${p}\u0000${url}`); });
    f.linkedins.forEach((l) => { if (!linkedins.has(l.toLowerCase())) linkedins.set(l.toLowerCase(), `${l}\u0000${url}`); });
  };
  if (!first) return { pages, emails: [] as Found[], phones: [] as Found[], linkedins: [] as Found[], reachable: false };
  take(first.html, first.finalUrl);

  // Same-site links that look like contact/team pages, contact first.
  const base = new URL(first.finalUrl);
  const host = base.hostname.replace(/^www\./, "");
  const links = new Map<string, number>();
  for (const m of first.html.matchAll(/<a\b[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    let u: URL;
    try { u = new URL(m[1], base); } catch { continue; }
    if (!/^https?:$/.test(u.protocol) || u.hostname.replace(/^www\./, "") !== host) continue;
    if (/\.(pdf|jpe?g|png|gif|zip|docx?)$/i.test(u.pathname)) continue;
    const label = `${u.pathname} ${m[2].replace(/<[^>]+>/g, " ")}`;
    if (!LIKELY_PAGE.test(label)) continue;
    u.hash = "";
    const key = u.toString();
    if (key === first.finalUrl || links.has(key)) continue;
    links.set(key, /contact/i.test(label) ? 0 : /team|people|staff|lawyer|professional|meet|our-/i.test(label) ? 1 : 2);
  }
  const queue = [...links.entries()].sort((a, b) => a[1] - b[1]).map(([u]) => u).slice(0, MAX_PAGES - 1);
  for (let i = 0; i < queue.length; i += 4) {
    const batch = await Promise.all(queue.slice(i, i + 4).map(fetchPage));
    batch.forEach((p, j) => { if (p) take(p.html, p.finalUrl || queue[i + j]); });
  }
  const split = (m: Map<string, string>) => [...m.values()].map((v) => { const [value, source] = v.split("\u0000"); return { value, source }; });
  return {
    pages,
    emails: [...emails.entries()].map(([value, source]) => ({ value, source })),
    phones: split(phones),
    linkedins: split(linkedins),
    reachable: true,
  };
}
