// Lead Tracker data proxy for the self-hosted Supabase (supabase.midastech.support).
//
// The browser used to talk to Supabase directly with the public anon key. Now it sends
// small, structured requests here (after the Firebase sign-in check in index.ts), and this
// service runs them with the service-role key, which never leaves the server
// (SUPABASE_SERVICE_ROLE_KEY). Only the tables and actions the app needs are allowed.
//
//   POST /db                     { table, action, columns?, filters?, order?, limit?, values?, returning? }
//   POST /storage/social-post-image { path, image (data URL or base64), contentType }

const SUPABASE_URL = (Deno.env.get("SUPABASE_URL") ?? "https://supabase.midastech.support").replace(/\/+$/, "");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const SOCIAL_POST_IMAGE_BUCKET = "social-post-images";

type Action = "select" | "insert" | "update" | "delete";

// Table -> actions the Lead Tracker and Social Studio actually use.
const TABLES: Record<string, ReadonlySet<Action>> = {
  social_posts: new Set(["select", "insert", "update", "delete"]),
  content_topics: new Set(["select", "insert", "update", "delete"]),
  // Only used to delete the old 1min.ai key row that earlier versions stored there.
  settings: new Set(["delete"]),
  linkedin_received_invites: new Set(["select"]),
  linkedin_message_replies: new Set(["select"]),
  linkedin_sent_invites: new Set(["select"]),
  linkedin_accepted_invites: new Set(["select"]),
  linkedin_catch_up: new Set(["select"]),
};
const FILTER_OPS = new Set(["eq", "neq", "gt", "gte", "lt", "lte", "is"]);
const IDENT = /^[a-z_][a-z0-9_]{0,62}$/;
const MAX_LIMIT = 1000;
const MAX_BODY_CHARS = 2_000_000;
const MAX_IMAGE_BASE64_CHARS = 8_000_000; // ~6 MB image
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
// Paths Social Studio builds: <platform>/<YYYY-MM-DD>/<uuid>.jpg
const IMAGE_PATH = /^[a-z0-9_-]{1,40}\/\d{4}-\d{2}-\d{2}\/[0-9a-f-]{36}\.(jpg|jpeg|png|webp)$/;

export class DbError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export function dbConfigured(): boolean {
  return Boolean(SUPABASE_SERVICE_ROLE_KEY);
}

function serviceHeaders(extra: Record<string, string> = {}): Record<string, string> {
  return { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`, ...extra };
}

function notConfigured(): DbError {
  return new DbError(503, "The database connection isn't set up on the server. Add SUPABASE_SERVICE_ROLE_KEY in Railway.");
}

function columnsParam(columns: unknown): string {
  const raw = String(columns ?? "*").trim() || "*";
  if (raw === "*") return "*";
  const cols = raw.split(",").map((c) => c.trim()).filter(Boolean);
  if (!cols.length || cols.some((c) => !IDENT.test(c))) throw new DbError(400, "Bad column list.");
  return cols.join(",");
}

function filterValue(op: string, value: unknown): string {
  if (op === "is") {
    if (value === null || value === "null") return "null";
    if (value === true || value === "true") return "true";
    if (value === false || value === "false") return "false";
    throw new DbError(400, "'is' filters only take null, true or false.");
  }
  if (value === null || typeof value === "object") throw new DbError(400, "Filter values must be text, numbers or booleans.");
  return String(value);
}

export type DbRequest = {
  table?: string;
  action?: string;
  columns?: string;
  filters?: { col?: string; op?: string; value?: unknown }[];
  order?: { col?: string; ascending?: boolean; nullsFirst?: boolean }[];
  limit?: number;
  values?: unknown;
  returning?: boolean;
};

// Turns a checked request into a PostgREST call with the service-role key.
export async function runDb(body: DbRequest): Promise<unknown> {
  if (!dbConfigured()) throw notConfigured();
  const table = String(body.table ?? "");
  const action = String(body.action ?? "") as Action;
  const allowed = TABLES[table];
  if (!allowed) throw new DbError(403, "That table isn't available to the lead tracker.");
  if (!allowed.has(action)) throw new DbError(403, `'${action}' isn't allowed on ${table}.`);

  const params = new URLSearchParams();
  const filters = Array.isArray(body.filters) ? body.filters : [];
  if (filters.length > 20) throw new DbError(400, "Too many filters.");
  for (const f of filters) {
    const col = String(f?.col ?? "");
    const op = String(f?.op ?? "");
    if (!IDENT.test(col) || !FILTER_OPS.has(op)) throw new DbError(400, "Bad filter.");
    params.append(col, `${op}.${filterValue(op, f.value)}`);
  }
  if ((action === "update" || action === "delete") && !filters.length) {
    throw new DbError(400, "Updates and deletes must target specific rows.");
  }

  const wantRows = action === "select" || body.returning === true;
  if (wantRows) params.set("select", columnsParam(body.columns));

  if (action === "select") {
    const order = Array.isArray(body.order) ? body.order : [];
    const parts = order.map((o) => {
      const col = String(o?.col ?? "");
      if (!IDENT.test(col)) throw new DbError(400, "Bad sort column.");
      let part = `${col}.${o?.ascending === false ? "desc" : "asc"}`;
      if (o?.nullsFirst === true) part += ".nullsfirst";
      if (o?.nullsFirst === false) part += ".nullslast";
      return part;
    });
    if (parts.length) params.set("order", parts.join(","));
    const limit = Math.min(Math.max(Math.floor(Number(body.limit) || MAX_LIMIT), 1), MAX_LIMIT);
    params.set("limit", String(limit));
  }

  let method = "GET";
  let payload: string | undefined;
  if (action === "insert" || action === "update") {
    const values = body.values;
    const ok = action === "insert"
      ? (Array.isArray(values)
        ? values.length > 0 && values.length <= 100 && values.every((v) => v && typeof v === "object" && !Array.isArray(v))
        : values && typeof values === "object")
      : values && typeof values === "object" && !Array.isArray(values);
    if (!ok) throw new DbError(400, `Send the ${action === "insert" ? "rows to add" : "fields to change"} as an object.`);
    for (const row of (Array.isArray(values) ? values : [values]) as Record<string, unknown>[]) {
      if (Object.keys(row).some((k) => !IDENT.test(k))) throw new DbError(400, "Bad column name.");
    }
    method = action === "insert" ? "POST" : "PATCH";
    payload = JSON.stringify(values);
  } else if (action === "delete") {
    method = "DELETE";
  }

  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}`, {
    method,
    headers: serviceHeaders({
      "Content-Type": "application/json",
      ...(action !== "select" ? { Prefer: wantRows ? "return=representation" : "return=minimal" } : {}),
    }),
    body: payload,
    signal: AbortSignal.timeout(20_000),
  });
  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }
  if (!res.ok) {
    const message = (data as { message?: string } | null)?.message ?? `Database error (HTTP ${res.status}).`;
    console.error("db proxy error:", JSON.stringify({ table, action, status: res.status, message: String(message).slice(0, 300) }));
    // Pass PostgREST's message through: the app retries inserts without columns the table lacks.
    throw new DbError(res.status >= 500 ? 502 : 400, String(message));
  }
  return wantRows ? (data ?? []) : null;
}

export type ImageUpload = { path?: string; image?: string; contentType?: string };

// Saves a Social Studio post image to the public social-post-images bucket and returns its URL.
export async function uploadSocialPostImage(body: ImageUpload): Promise<{ publicUrl: string }> {
  if (!dbConfigured()) throw notConfigured();
  const path = String(body.path ?? "");
  const contentType = String(body.contentType ?? "image/jpeg");
  if (!IMAGE_PATH.test(path)) throw new DbError(400, "Bad image path.");
  if (!IMAGE_TYPES.has(contentType)) throw new DbError(400, "Send a JPEG, PNG or WebP image.");
  const base64 = String(body.image ?? "").replace(/^data:[^,]*,/, "");
  if (!base64) throw new DbError(400, "No image was sent.");
  if (base64.length > MAX_IMAGE_BASE64_CHARS) throw new DbError(413, "That image is too large.");
  let bytes: Uint8Array<ArrayBuffer>;
  try {
    const bin = atob(base64);
    bytes = new Uint8Array(new ArrayBuffer(bin.length));
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  } catch {
    throw new DbError(400, "The image wasn't valid base64.");
  }
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${SOCIAL_POST_IMAGE_BUCKET}/${path}`, {
    method: "POST",
    headers: serviceHeaders({ "Content-Type": contentType, "Cache-Control": "max-age=31536000", "x-upsert": "true" }),
    body: bytes,
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) {
    console.error("image upload failed:", res.status, (await res.text()).slice(0, 300));
    throw new DbError(502, "Couldn't save the image.");
  }
  return { publicUrl: `${SUPABASE_URL}/storage/v1/object/public/${SOCIAL_POST_IMAGE_BUCKET}/${path}` };
}

export const MAX_DB_BODY_CHARS = MAX_BODY_CHARS;
