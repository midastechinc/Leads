// Apify scrapers for the lead tracker (APIFY_TOKEN on the server):
//   findPlaces:   Google Maps search ("accounting firms" in "Richmond Hill, ON") -> businesses to add as leads.
//   scanWebsite:  crawls a company website for emails, phone numbers and LinkedIn links.
// Actors are run through the Apify API and polled until they finish; results are trimmed to what
// the app needs. Actor IDs can be overridden with APIFY_PLACES_ACTOR / APIFY_CONTACTS_ACTOR.

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
  const { items, costUsd } = await runActor(CONTACTS_ACTOR, {
    startUrls: [{ url }],
    maxDepth: 2,
    maxRequestsPerStartUrl: 25,
    sameDomain: true,
  }, 50);
  // Collect unique values with the first page each was found on.
  const collect = (key: string) => {
    const seen = new Map<string, string>();
    // deno-lint-ignore no-explicit-any
    items.forEach((page: any) => (Array.isArray(page[key]) ? page[key] : []).forEach((v: unknown) => {
      const value = str(v);
      const k = key === "emails" ? value.toLowerCase() : key === "phones" ? value.replace(/\D/g, "").slice(-10) : value.toLowerCase().replace(/\/+$/, "");
      if (value && k && !seen.has(k)) seen.set(k, `${value}\u0000${str(page.url)}`);
    }));
    return [...seen.values()].map((v) => { const [value, source] = v.split("\u0000"); return { value, source }; });
  };
  return {
    pages: items.length,
    emails: collect("emails").map((e) => ({ ...e, value: e.value.toLowerCase() })),
    phones: collect("phones"),
    linkedins: collect("linkedIns"),
    costUsd,
  };
}
