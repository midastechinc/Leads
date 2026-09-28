// Email outreach for the lead tracker, sent from a Microsoft 365 mailbox through Microsoft Graph.
//   verifyEmails:  free address check (format, the domain's mail servers, shared or personal inboxes).
//   sendOutreach:  sends first emails and follow-ups (as replies in the same thread) with the CASL footer
//                  added here, so no email can leave without sender details and an unsubscribe link.
//   checkReplies:  reads the mailbox for replies, bounces and unsubscribes from the people emailed.
//   unsubscribe:   the footer link. It emails the outreach mailbox an "Unsubscribe request", which
//                  checkReplies turns into "do not contact" in the tracker, so nothing is stored here.
//
// Settings (Railway variables): MS_TENANT_ID, MS_CLIENT_ID, MS_CLIENT_SECRET, OUTREACH_MAILBOX,
// optional OUTREACH_DAILY_MAX (hard cap, default 30), OUTREACH_SENDER_NAME, OUTREACH_PUBLIC_URL.
// The Entra app gets mailbox access through Exchange RBAC for Applications, scoped to OUTREACH_MAILBOX
// only (see docs/outreach-setup.md), so it can't read or send as anyone else.

const TENANT = Deno.env.get("MS_TENANT_ID") ?? "";
const CLIENT_ID = Deno.env.get("MS_CLIENT_ID") ?? "";
const CLIENT_SECRET = Deno.env.get("MS_CLIENT_SECRET") ?? "";
const MAILBOX = (Deno.env.get("OUTREACH_MAILBOX") ?? "").trim().toLowerCase();
const DAILY_MAX = Math.max(1, Number(Deno.env.get("OUTREACH_DAILY_MAX")) || 30);
const SENDER_NAME = Deno.env.get("OUTREACH_SENDER_NAME") ?? "Ali Jaffar";
const PUBLIC_URL = (Deno.env.get("OUTREACH_PUBLIC_URL") ?? "").replace(/\/+$/, "");
const LOGO_URL = Deno.env.get("OUTREACH_LOGO_URL") ?? "https://midastechinc.github.io/Leads/email-logo.png";
const SIGNATURE_ON = (Deno.env.get("OUTREACH_SIGNATURE") ?? "on").toLowerCase() !== "off";
const UNSUB_SECRET = Deno.env.get("OUTREACH_UNSUB_SECRET") ?? CLIENT_SECRET;
const GRAPH = Deno.env.get("MS_GRAPH_URL") ?? "https://graph.microsoft.com/v1.0";
const LOGIN = Deno.env.get("MS_LOGIN_URL") ?? "https://login.microsoftonline.com";
const TIME_ZONE = "America/Toronto";
const MAX_BATCH = 50;

export class OutreachError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

export const outreachConfigured = () => !!(TENANT && CLIENT_ID && CLIENT_SECRET && MAILBOX);

// ── Microsoft Graph ─────────────────────────────────────────────────────────
let token: { value: string; expires: number } | null = null;

async function graphToken(): Promise<string> {
  if (token && token.expires > Date.now() + 60_000) return token.value;
  const res = await fetch(`${LOGIN}/${TENANT}/oauth2/v2.0/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      scope: "https://graph.microsoft.com/.default",
      grant_type: "client_credentials",
    }),
  }).catch(() => null);
  const body = await res?.json().catch(() => ({}));
  if (!res?.ok || !body?.access_token) {
    console.error("Microsoft sign-in failed:", res?.status, JSON.stringify(body ?? {}).slice(0, 300));
    throw new OutreachError("The server couldn't sign in to Microsoft 365. Check MS_TENANT_ID, MS_CLIENT_ID and MS_CLIENT_SECRET in Railway.", 500);
  }
  token = { value: body.access_token, expires: Date.now() + (Number(body.expires_in) || 3600) * 1000 };
  return token.value;
}

async function graph(path: string, init: RequestInit = {}) {
  const res = await fetch(`${GRAPH}/users/${encodeURIComponent(MAILBOX)}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${await graphToken()}`,
      "Content-Type": "application/json",
      Prefer: 'IdType="ImmutableId"', // ids survive the move from Drafts to Sent Items
      ...(init.headers ?? {}),
    },
  }).catch((err) => {
    console.error("Graph unreachable:", err);
    throw new OutreachError("Couldn't reach Microsoft 365. Try again in a moment.", 502);
  });
  if (res.status === 202 || res.status === 204) return {};
  const body = await res.json().catch(() => ({}));
  if (res.status === 401 || res.status === 403) {
    console.error("Graph access denied:", res.status, JSON.stringify(body).slice(0, 300));
    throw new OutreachError(`The app isn't allowed to use ${MAILBOX}. Check the mailbox permission step in the outreach setup.`, 500);
  }
  if (res.status === 404) throw new OutreachError(`The mailbox ${MAILBOX} wasn't found in Microsoft 365.`, 404);
  if (res.status === 429) throw new OutreachError("Microsoft 365 is limiting sends right now. Wait a few minutes.", 429);
  if (!res.ok) {
    console.error("Graph error:", res.status, JSON.stringify(body).slice(0, 500));
    throw new OutreachError(body?.error?.message ? `Microsoft 365: ${body.error.message}` : "Microsoft 365 had a problem. Try again.", 502);
  }
  return body;
}

// Start of today in Toronto, as an ISO timestamp.
function startOfToday(): string {
  const now = new Date();
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
  }).formatToParts(now).map((p) => [p.type, p.value]));
  const sinceMidnight = (Number(parts.hour) * 3600 + Number(parts.minute) * 60 + Number(parts.second)) * 1000;
  return new Date(now.getTime() - sinceMidnight - now.getMilliseconds()).toISOString();
}

// Counts what the mailbox sent today (including anything sent by hand), for the daily cap.
async function sentToday(): Promise<number> {
  const since = startOfToday();
  const data = await graph(`/mailFolders/sentitems/messages?$select=id&$top=500&$filter=${encodeURIComponent(`sentDateTime ge ${since}`)}`);
  return Array.isArray(data?.value) ? data.value.length : 0;
}

export async function outreachStatus() {
  if (!outreachConfigured()) return { configured: false, dailyMax: DAILY_MAX };
  return { configured: true, mailbox: MAILBOX, senderName: SENDER_NAME, dailyMax: DAILY_MAX, sentToday: await sentToday() };
}

// ── Email check ─────────────────────────────────────────────────────────────
const EMAIL_RE = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i;
const SHARED = /^(info|admin|office|contact|hello|reception|frontdesk|front\.desk|mail|enquiries|inquiries|general|sales|support|help|accounts|accounting|billing|hr|careers|jobs|marketing|team|service|appointments|bookings)@/i;
const PERSONAL_DOMAINS = new Set(["gmail.com", "yahoo.com", "yahoo.ca", "hotmail.com", "hotmail.ca", "outlook.com", "live.com", "live.ca", "icloud.com", "me.com", "aol.com", "rogers.com", "bell.net", "sympatico.ca", "shaw.ca", "telus.net", "cogeco.ca", "protonmail.com", "proton.me"]);
const DISPOSABLE = new Set(["mailinator.com", "guerrillamail.com", "10minutemail.com", "tempmail.com", "yopmail.com", "trashmail.com", "sharklasers.com"]);
const mxCache = new Map<string, { ok: boolean; how: string; at: number }>();

async function domainTakesMail(domain: string) {
  const hit = mxCache.get(domain);
  if (hit && Date.now() - hit.at < 6 * 3600_000) return hit;
  let result = { ok: false, how: "no mail servers", at: Date.now() };
  try {
    const mx = await Deno.resolveDns(domain, "MX");
    if (mx.some((r) => r.exchange && r.exchange !== ".")) result = { ok: true, how: "mx", at: Date.now() };
  } catch { /* no MX records */ }
  if (!result.ok) {
    try {
      const a = await Deno.resolveDns(domain, "A");
      if (a.length) result = { ok: true, how: "a", at: Date.now() };
    } catch { /* domain doesn't resolve */ }
  }
  mxCache.set(domain, result);
  return result;
}

export async function verifyEmails(emails: unknown[]) {
  const list = [...new Set(emails.map((e) => String(e ?? "").trim().toLowerCase()).filter(Boolean))].slice(0, 100);
  return await Promise.all(list.map(async (email) => {
    if (!EMAIL_RE.test(email)) return { email, status: "invalid", reason: "Not a valid email address" };
    const domain = email.split("@")[1];
    if (DISPOSABLE.has(domain)) return { email, status: "invalid", reason: "Throwaway email service" };
    const mail = await domainTakesMail(domain);
    if (!mail.ok) return { email, status: "invalid", reason: `${domain} can't receive email` };
    if (SHARED.test(email)) return { email, status: "risky", reason: "Shared inbox (info@, office@…); fine for a first touch, but a named person replies more" };
    if (PERSONAL_DOMAINS.has(domain)) return { email, status: "risky", reason: "Personal email service; only email it if they published it for their business" };
    if (mail.how === "a") return { email, status: "risky", reason: `${domain} has no proper mail server record` };
    return { email, status: "valid", reason: `${domain} accepts email` };
  }));
}

// ── Sending ─────────────────────────────────────────────────────────────────
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

async function hmac(text: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(UNSUB_SECRET || "unsub"), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(text.toLowerCase())));
  return btoa(String.fromCharCode(...sig.slice(0, 16))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function unsubscribeLink(baseUrl: string, email: string) {
  return `${PUBLIC_URL || baseUrl}/u?e=${encodeURIComponent(email)}&t=${await hmac(email)}`;
}

// The CASL footer: why they're getting it and an unsubscribe. Who is sending and the mailing address
// are in the signature; without a signature (OUTREACH_SIGNATURE=off) the footer carries them.
function footerHtml(unsub: string) {
  return `<div style="margin-top:24px;padding-top:12px;border-top:1px solid #ddd;color:#777;font-size:12px;line-height:1.5;font-family:Segoe UI,Arial,sans-serif">
${SIGNATURE_ON ? "" : `${esc(SENDER_NAME)} · Midas Tech Inc · IT Services &amp; Cybersecurity<br>
30 Via Renzo Dr, Suite 200, Richmond Hill, ON L4S 0B8 · 905-787-2038 · <a href="https://www.midastech.ca" style="color:#0072BC">www.midastech.ca</a><br>`}
You're getting this because your business email address is published online and this is about your business's IT.
Don't want these emails? <a href="${esc(unsub)}" style="color:#0072BC">Unsubscribe</a> or reply "unsubscribe".
</div>`;
}

// Ali's email signature. A table layout, because Outlook ignores most modern CSS.
function signatureHtml() {
  const a = "color:#0072BC;text-decoration:none";
  return `<table cellpadding="0" cellspacing="0" border="0" style="margin-top:14px;font-family:Segoe UI,Arial,sans-serif;font-size:13px;line-height:1.45;color:#333333">
<tr><td style="padding-right:16px;border-right:2px solid #0072BC;vertical-align:top;text-align:center">
<a href="https://www.midastech.ca"><img src="${esc(LOGO_URL)}" width="140" alt="Midas Tech" style="display:block;border:0;width:140px;height:auto"></a>
<div style="margin-top:8px;font-size:11px;color:#4D4D4D">Microsoft Partner<br>Certified</div></td>
<td style="padding-left:16px;vertical-align:top">
<div style="font-size:17px;font-weight:700;color:#333333">${esc(SENDER_NAME)}</div>
<div style="color:#4D4D4D">Founder &amp; Chief Technology Officer (CTO)</div>
<div style="margin-top:6px"><b>Midas Tech</b> — IT Support &amp; Networking Solutions</div>
<div style="font-size:12px;color:#4D4D4D">Managed IT Services | Networking | Cybersecurity | Infrastructure</div>
<div style="margin-top:6px">Direct: <a href="tel:+16477863361" style="${a}">+1 (647) 786-3361</a> | Office: <a href="tel:+19057872038" style="${a}">+1 (905) 787-2038</a></div>
<div><a href="mailto:ali@midastech.ca" style="${a}">ali@midastech.ca</a> | <a href="https://www.midastech.ca" style="${a}">www.midastech.ca</a></div>
<div>30 Via Renzo Dr, Suite 200, Richmond Hill, ON L4S 0B8</div>
</td></tr></table>`;
}

function bodyHtml(text: string, unsub: string) {
  const paragraphs = text.trim().split(/\n{2,}/).map((p) => `<p style="margin:0 0 12px">${esc(p).replace(/\n/g, "<br>")}</p>`).join("");
  return `<div style="font-family:Segoe UI,Arial,sans-serif;font-size:14px;color:#333;line-height:1.55">${paragraphs}</div>${SIGNATURE_ON ? signatureHtml() : ""}${footerHtml(unsub)}`;
}

export interface OutgoingEmail {
  leadId?: string;
  to?: string;
  toName?: string;
  subject?: string;
  body?: string;
  replyToId?: string; // Graph id of the first email; follow-ups go out as replies in the same thread
}

export async function sendOutreach(messages: OutgoingEmail[], baseUrl: string) {
  if (!outreachConfigured()) throw new OutreachError("Email sending isn't set up yet. Add the Microsoft 365 settings in Railway (see the setup checklist).", 503);
  const batch = messages.slice(0, MAX_BATCH);
  let sent = await sentToday();
  const results = [];
  for (const m of batch) {
    const to = String(m.to ?? "").trim().toLowerCase();
    const subject = String(m.subject ?? "").trim().slice(0, 200);
    const text = String(m.body ?? "").trim().slice(0, 8000);
    const base = { leadId: m.leadId ?? "", to };
    if (!EMAIL_RE.test(to)) { results.push({ ...base, ok: false, error: "Not a valid email address" }); continue; }
    if (!text || (!subject && !m.replyToId)) { results.push({ ...base, ok: false, error: "The email needs a subject and a message" }); continue; }
    if (sent >= DAILY_MAX) { results.push({ ...base, ok: false, error: `Today's limit of ${DAILY_MAX} emails is reached. The rest can go tomorrow.`, capped: true }); continue; }
    const html = bodyHtml(text, await unsubscribeLink(baseUrl, to));
    const recipient = { emailAddress: { address: to, ...(m.toName ? { name: String(m.toName).slice(0, 120) } : {}) } };
    try {
      if (m.replyToId) {
        try {
          // Reply to our own first email, addressed to the lead, so it stays in one thread.
          await graph(`/messages/${encodeURIComponent(m.replyToId)}/reply`, {
            method: "POST",
            body: JSON.stringify({ message: { toRecipients: [recipient] }, comment: html }),
          });
          sent++;
          results.push({ ...base, ok: true, id: m.replyToId, threaded: true });
          continue;
        } catch (err) {
          if (!(err instanceof OutreachError) || err.status !== 404) throw err;
          // The first email was deleted from Sent Items: send the follow-up on its own instead.
        }
      }
      const draft = await graph("/messages", {
        method: "POST",
        body: JSON.stringify({
          subject: subject || "Following up",
          body: { contentType: "HTML", content: html },
          toRecipients: [recipient],
        }),
      });
      await graph(`/messages/${encodeURIComponent(draft.id)}/send`, { method: "POST" });
      sent++;
      results.push({ ...base, ok: true, id: draft.id, conversationId: draft.conversationId ?? "" });
    } catch (err) {
      if (err instanceof OutreachError && err.status >= 500 && err.status !== 502) throw err; // setup problem: stop the batch
      results.push({ ...base, ok: false, error: err instanceof Error ? err.message : "Couldn't send" });
    }
  }
  return { results, sentToday: sent, dailyMax: DAILY_MAX };
}

// ── Replies ─────────────────────────────────────────────────────────────────
const UNSUB_WORDS = /\b(unsubscribe|remove me|take me off|stop emailing|do not (contact|email)|don'?t (contact|email) me|opt[ -]?out)\b/i;
const NOT_INTERESTED = /\b(not interested|no thank(s| you)|we('re| are) (all )?(set|good|covered|happy with)|already have (an? )?(it|msp|provider|someone))\b/i;
const AUTO_REPLY = /^(automatic reply|auto(matic)?[- ]?reply|out of (the )?office|ooo\b)/i;
const BOUNCE_FROM = /^(postmaster|mailer-daemon|microsoftexchange)/i;
const BOUNCE_SUBJECT = /^(undeliverable|delivery (status notification|has failed)|mail delivery (failed|subsystem)|returned mail)/i;

export async function checkReplies(sinceIso: string, addresses: unknown[]) {
  if (!outreachConfigured()) throw new OutreachError("Email sending isn't set up yet.", 503);
  const watch = new Set(addresses.map((a) => String(a ?? "").trim().toLowerCase()).filter(Boolean));
  const since = new Date(sinceIso);
  const from = isNaN(since.getTime()) ? new Date(Date.now() - 14 * 86400_000) : since;
  const filter = encodeURIComponent(`receivedDateTime ge ${from.toISOString()}`);
  const data = await graph(`/mailFolders/inbox/messages?$top=200&$orderby=receivedDateTime desc&$filter=${filter}&$select=id,from,subject,bodyPreview,receivedDateTime,conversationId`);
  const found = [];
  for (const msg of Array.isArray(data?.value) ? data.value : []) {
    const sender = String(msg.from?.emailAddress?.address ?? "").toLowerCase();
    const subject = String(msg.subject ?? "");
    const preview = String(msg.bodyPreview ?? "").slice(0, 600);
    const base = { id: msg.id, subject, preview, receivedAt: msg.receivedDateTime, conversationId: msg.conversationId ?? "" };
    if (sender === MAILBOX && /^Unsubscribe request: /i.test(subject)) {
      found.push({ ...base, from: subject.replace(/^Unsubscribe request: /i, "").trim().toLowerCase(), kind: "unsubscribe" });
    } else if (BOUNCE_FROM.test(sender) || BOUNCE_SUBJECT.test(subject)) {
      const who = [...watch].find((a) => preview.toLowerCase().includes(a));
      if (who) found.push({ ...base, from: who, kind: "bounce" });
    } else if (watch.has(sender)) {
      const kind = AUTO_REPLY.test(subject) ? "auto_reply"
        : UNSUB_WORDS.test(`${subject} ${preview}`) ? "unsubscribe"
        : NOT_INTERESTED.test(preview) ? "not_interested"
        : "reply";
      found.push({ ...base, from: sender, kind });
    }
  }
  return { replies: found, checkedAt: new Date().toISOString() };
}

// ── Unsubscribe link ────────────────────────────────────────────────────────
const page = (title: string, text: string) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title></head>
<body style="margin:0;font-family:Segoe UI,Arial,sans-serif;background:#f4f7fa;color:#333;display:grid;place-items:center;min-height:100vh;padding:16px">
<div style="max-width:440px;background:#fff;border-radius:14px;padding:28px;box-shadow:0 8px 24px rgba(0,0,0,.08);border-top:5px solid #00AEEF">
<h1 style="font-size:20px;margin:0 0 10px;color:#0072BC">${esc(title)}</h1><p style="margin:0 0 16px;line-height:1.5">${text}</p>
<p style="margin:0;font-size:12px;color:#808080">Midas Tech Inc · 30 Via Renzo Dr, Suite 200, Richmond Hill, ON · 905-787-2038 · info@midastech.ca</p></div></body></html>`;

export async function unsubscribe(url: URL): Promise<Response> {
  const email = String(url.searchParams.get("e") ?? "").trim().toLowerCase();
  const sig = String(url.searchParams.get("t") ?? "");
  const html = (status: number, title: string, text: string) =>
    new Response(page(title, text), { status, headers: { "Content-Type": "text/html; charset=utf-8" } });
  if (!EMAIL_RE.test(email) || sig !== await hmac(email)) {
    return html(400, "Link not recognised", 'This unsubscribe link is incomplete. Reply "unsubscribe" to the email instead, or write to info@midastech.ca, and we\'ll remove you.');
  }
  // A GET only shows the button, so link scanners that open links can't unsubscribe anyone.
  return html(200, "Unsubscribe", `Stop emails from Midas Tech to <b>${esc(email)}</b>?<br><br>
<form method="post" action="${esc(url.pathname + url.search)}"><button style="background:#0072BC;color:#fff;border:0;border-radius:8px;padding:10px 18px;font-size:15px;cursor:pointer">Unsubscribe</button></form>`);
}

export async function confirmUnsubscribe(url: URL): Promise<Response> {
  const email = String(url.searchParams.get("e") ?? "").trim().toLowerCase();
  const sig = String(url.searchParams.get("t") ?? "");
  const html = (status: number, title: string, text: string) =>
    new Response(page(title, text), { status, headers: { "Content-Type": "text/html; charset=utf-8" } });
  if (!EMAIL_RE.test(email) || sig !== await hmac(email)) return html(400, "Link not recognised", "Reply \"unsubscribe\" to the email instead and we'll remove you.");
  try {
    await graph("/sendMail", {
      method: "POST",
      body: JSON.stringify({
        message: {
          subject: `Unsubscribe request: ${email}`,
          body: { contentType: "Text", content: `${email} unsubscribed with the link in an outreach email on ${new Date().toISOString()}.` },
          toRecipients: [{ emailAddress: { address: MAILBOX } }],
        },
        saveToSentItems: false,
      }),
    });
  } catch (err) {
    console.error("unsubscribe notice failed:", err);
    return html(500, "Something went wrong", 'Please reply "unsubscribe" to the email, or write to info@midastech.ca, and we\'ll remove you.');
  }
  console.log("unsubscribed:", email.replace(/^(.).*@/, "$1***@"));
  return html(200, "You're unsubscribed", "You won't get any more emails from Midas Tech. Sorry for the bother.");
}
