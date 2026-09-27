// Apify scrapers for the lead tracker (APIFY_TOKEN on the server):
//   findPlaces:   Google Maps search ("accounting firms" in "Richmond Hill, ON") -> businesses to add as leads.
//   scanWebsite:  reads a company website for emails, phone numbers and LinkedIn links, with our own
//                 free reader (sitescan.ts) and Apify's contact scraper side by side.
// Actors are run through the Apify API and polled until they finish; results are trimmed to what
// the app needs. Actor IDs can be overridden with APIFY_PLACES_ACTOR / APIFY_CONTACTS_ACTOR.

import { type Found, type FoundEmail, scanSite } from "./sitescan.ts";

const APIFY_TOKEN = Deno.env.get("APIFY_TOKEN") ?? "";
const APIFY_BASE_URL = Deno.env.get("APIFY_BASE_URL") ?? "https://api.apify.com/v2";
const PLACES_ACTOR = Deno.env.get("APIFY_PLACES_ACTOR") ?? "compass~crawler-google-places";
const CONTACTS_ACTOR = Deno.env.get("APIFY_CONTACTS_ACTOR") ?? "vdrmota~contact-info-scraper";
const MAX_WAIT_MS = 4 * 60 * 1000;

export class ApifyError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

async function apify(path: string, init: RequestInit = {}) {
  let res: Response;
  try {
    res = await fetch(`${APIFY_BASE_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${APIFY_TOKEN}`, ...(init.headers ?? {}) },
    });
  } catch (err) {
    console.error("Apify unreachable:", err);
    throw new ApifyError("Couldn't reach Apify. Try again in a moment.", 502);
  }
  const body = await res.json().catch(() => ({}));
  if (res.status === 401 || res.status === 403) {
    throw new ApifyError("The Apify token isn't working. Check APIFY_TOKEN in Railway.", 500);
  }
  if (res.status === 402) {
    throw new ApifyError("Your Apify account is out of credit for this month.", 402);
  }
  if (!res.ok) {
    console.error("Apify error:", res.status, JSON.stringify(body).slice(0, 500));
    throw new ApifyError(body?.error?.message ? `Apify: ${body.error.message}` : "Apify had a problem. Try again.", 502);
  }
  return body;
}

// Starts an actor, waits for it to finish (Apify waits at most 60 s per call, so we poll), and
// returns its dataset items and the run's usage cost.
async function runActor(actor: string, input: unknown, maxItems: number) {
  if (!APIFY_TOKEN) throw new ApifyError("Apify isn't set up. Add APIFY_TOKEN in Railway.", 500);
  let run = (await apify(`/acts/${actor}/runs?waitForFinish=60`, { method: "POST", body: JSON.stringify(input) })).data;
  const started = Date.now();
  while (run && ["READY", "RUNNING"].includes(run.status)) {
    if (Date.now() - started > MAX_WAIT_MS) {
      await apify(`/actor-runs/${run.id}/abort`, { method: "POST" }).catch(() => {});
      throw new ApifyError("Apify took too long. Try a smaller search.", 504);
    }
    run = (await apify(`/actor-runs/${run.id}?waitForFinish=60`)).data;
  }
  if (!run || run.status !== "SUCCEEDED") {
    throw new ApifyError(`The Apify run ${String(run?.status ?? "failed").toLowerCase()}. Try again.`, 502);
  }
  const items = await apify(`/datasets/${run.defaultDatasetId}/items?clean=true&limit=${maxItems}`);
  return { items: Array.isArray(items) ? items : [], costUsd: typeof run.usageTotalUsd === "number" ? run.usageTotalUsd : null };
}

const str = (v: unknown) => (typeof v === "string" ? v.trim() : v == null ? "" : String(v).trim());

export async function findPlaces(query: string, location: string, max: number) {
  const limit = Math.min(Math.max(Math.round(max) || 20, 1), 100);
  const { items, costUsd } = await runActor(PLACES_ACTOR, {
    searchStringsArray: [query],
    locationQuery: location,
    maxCrawledPlacesPerSearch: limit,
    language: "en",
    skipClosedPlaces: true,
  }, limit);
  // deno-lint-ignore no-explicit-any
  const places = items.map((p: any) => ({
    name: str(p.title),
    category: str(p.categoryName),
    address: str(p.address),
    city: str(p.city),
    province: str(p.state),
    country: str(p.countryCode),
    phone: str(p.phone),
    website: str(p.website),
    mapsUrl: str(p.url),
    rating: typeof p.totalScore === "number" ? p.totalScore : null,
    reviews: typeof p.reviewsCount === "number" ? p.reviewsCount : null,
  })).filter((p: { name: string }) => p.name);
  return { places, costUsd };
}

export async function scanWebsite(website: string) {
  let url = str(website);
  if (!url) throw new ApifyError("This company has no website to scan.", 400);
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
  try { new URL(url); } catch { throw new ApifyError("The website address doesn't look right.", 400); }

  // Our own free reader and the Apify scraper run side by side; results are merged. Either one
  // failing is fine as long as the other works.
  const [own, apifyRun] = await Promise.allSettled([
    scanSite(url),
    APIFY_TOKEN
      ? runActor(CONTACTS_ACTOR, { startUrls: [{ url }], maxDepth: 2, maxRequestsPerStartUrl: 25, sameDomain: true }, 50)
      : Promise.reject(new ApifyError("no token", 500)),
  ]);

  const emails = new Map<string, string>(), phones = new Map<string, string>(), linkedins = new Map<string, string>();
  const phoneKey = (p: string) => p.replace(/\D/g, "").replace(/^1(?=\d{10})/, "");
  const emailInfo = new Map<string, FoundEmail>();
  const addAll = (list: Found[], map: Map<string, string>, keyOf: (v: string) => string) =>
    list.forEach(({ value, source }) => { const k = keyOf(value); if (value && k && !map.has(k)) map.set(k, `${value}\u0000${source}`); });

  let pages = 0, costUsd: number | null = null, apifyPages = 0;
  if (own.status === "fulfilled") {
    pages += own.value.pages.length;
    addAll(own.value.emails, emails, (v) => v.toLowerCase());
    own.value.emails.forEach((e) => { if (e.name || e.title || e.phone) emailInfo.set(e.value.toLowerCase(), e); });
    addAll(own.value.phones, phones, phoneKey);
    addAll(own.value.linkedins, linkedins, (v) => v.toLowerCase().replace(/\/+$/, ""));
  } else {
    console.error("site scan failed:", own.reason);
  }
  if (apifyRun.status === "fulfilled") {
    const { items } = apifyRun.value;
    costUsd = apifyRun.value.costUsd;
    apifyPages = items.length;
    pages += items.length;
    // deno-lint-ignore no-explicit-any
    const list = (key: string) => items.flatMap((page: any) => (Array.isArray(page[key]) ? page[key] : []).map((v: unknown) => ({ value: str(v), source: str(page.url) })));
    addAll(list("emails").map((e: Found) => ({ ...e, value: e.value.toLowerCase() })), emails, (v) => v.toLowerCase());
    addAll([...list("phones"), ...list("phonesUncertain")], phones, phoneKey);
    addAll(list("linkedIns"), linkedins, (v) => v.toLowerCase().replace(/\/+$/, ""));
    console.log("apify contact scraper:", JSON.stringify({ items: items.length, fields: items[0] ? Object.keys(items[0]) : [] }));
  } else if (!(apifyRun.reason instanceof ApifyError && apifyRun.reason.message === "no token")) {
    console.error("apify contact scraper failed:", apifyRun.reason instanceof Error ? apifyRun.reason.message : apifyRun.reason);
  }
  if (own.status === "rejected" && apifyRun.status === "rejected") {
    throw apifyRun.reason instanceof ApifyError && apifyRun.reason.message !== "no token"
      ? apifyRun.reason
      : new ApifyError("Couldn't read that website. Check the address and try again.", 502);
  }
  const split = (m: Map<string, string>) => [...m.values()].map((v) => { const [value, source] = v.split("\u0000"); return { value, source }; });
  return {
    pages,
    apifyPages,
    reachable: own.status === "fulfilled" ? own.value.reachable : apifyPages > 0,
    emails: split(emails).map((e) => {
      const who = emailInfo.get(e.value.toLowerCase());
      return who ? { ...e, name: who.name, title: who.title, phone: who.phone } : e;
    }),
    phones: split(phones),
    linkedins: split(linkedins),
    costUsd,
  };
}
