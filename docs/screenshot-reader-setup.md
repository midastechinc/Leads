# Screenshot reader setup

Three buttons send a screenshot to a Supabase Edge Function called `extract-contacts`:
- **📷 From screenshot** in the All Leads toolbar adds new leads. Each person keeps the company shown in the image, so one screenshot can hold several companies, for example LinkedIn search results.
- **📷 Add people from a screenshot** in the lead window adds people at that lead's company.
- **📷 From screenshot** in Add Lead uses the company typed there.

The function asks Claude to list the people in the image and sends them back to the app. You check the list and pick who to add. Nothing is saved until you press **Add N leads**.

The Anthropic API key stays on your Supabase server. The browser never sees it. The function only answers people who are signed in to the lead tracker: it checks their Firebase sign-in token before it calls Claude.

Until the function is deployed, the button shows: *"The screenshot reader isn't set up on the server yet."* The rest of the app still works.

You can run the reader in either of two places. Pick one:
- **Railway (easiest).** Railway builds it straight from GitHub. There's no server to log in to.
- **Your self-hosted Supabase server.** It runs next to your other Supabase services. You need SSH access.

## Option A: Railway

1. **Get an API key.** In the Claude Console (console.anthropic.com), go to **API keys** and create a key named `lead-tracker-screenshots`. Add a few dollars of credit under **Billing**.
2. **Create the service.** Sign in at railway.com with GitHub. Click **New Project**, then **Deploy from GitHub repo**, and pick `midastechinc/Leads`. If the repo isn't listed, click **Configure GitHub App** and give Railway access to it.
3. **Point it at the reader.** Open the new service and go to **Settings**:
   - Set **Root Directory** to `/supabase/functions/extract-contacts`. Railway then finds the `Dockerfile` there.
   - Set **Watch Paths** to `/supabase/functions/extract-contacts/**`, so changes to the rest of the app don't rebuild it.
4. **Add the settings.** In the **Variables** tab, add:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   FIREBASE_PROJECT_ID=midas-leads-a8b13
   ALLOWED_ORIGINS=https://midastechinc.github.io
   ```
   Railway sets `PORT` itself, so don't add it.

   For Social Studio, also add `ONEMIN_API_KEY=` followed by your 1min.ai key. The same service passes Social Studio's 1min.ai requests on to 1min.ai with this key, so the key never reaches the browser. Only signed-in lead tracker users can use it.
5. **Give it an address.** Under **Settings → Networking**, click **Generate Domain**. If it asks for a port, use `8080`. Wait for the deploy to show **Active**.
6. **Check it.** Open the address in your browser. It should show `{"ok":true,"service":"extract-contacts"}`.
7. **Connect the app.** In `index.html`, put the address in `SHOT_READER_URL`, for example `const SHOT_READER_URL = "https://extract-contacts-production.up.railway.app";`, and publish. You can also send the address to Claude and it will make the change.

Railway charges for the resources the service uses. A small service like this sits within the Hobby plan's included usage; check railway.com/pricing for current prices. Claude API costs are separate, see **Cost** below.

## Option B: self-hosted Supabase (Docker)

Skip this section if you used Railway. Leave `SHOT_READER_URL` empty in `index.html`, and the app will call the Supabase function.


These steps assume the standard `supabase/docker` setup on the server behind `supabase.midastech.support`.

1. **Get an API key.** In the Claude Console (console.anthropic.com), go to **API keys** and create a key named `lead-tracker-screenshots`. Add a few dollars of credit under **Billing**.

2. **Copy the function to the server.** Put this repo's `supabase/functions/extract-contacts/index.ts` in the functions folder next to `main`:
   ```
   supabase/docker/volumes/functions/extract-contacts/index.ts
   ```

3. **Give the functions container the settings.** In `docker-compose.yml`, find the `functions` service and add these lines under `environment:`:
   ```yaml
   ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
   FIREBASE_PROJECT_ID: midas-leads-a8b13
   ALLOWED_ORIGINS: https://midastechinc.github.io
   ```
   Then put the key in the `.env` file beside `docker-compose.yml`:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```

4. **Restart the functions container:**
   ```bash
   docker compose up -d --force-recreate functions
   ```

5. **Check the network.** The server has to reach these hosts over HTTPS:
   - `api.anthropic.com`: Claude.
   - `www.googleapis.com`: the keys used to check Firebase sign-in tokens.
   - `registry.npmjs.org`: the function's libraries. They download once, the first time the function runs.

   If you firewall outbound traffic, allow all three.

6. **Check it from the server.** Replace `ANON_KEY` with the `ANON_KEY` value from `.env`:
   ```bash
   curl -s -X POST https://supabase.midastech.support/functions/v1/extract-contacts \
     -H "apikey: ANON_KEY" -H "Authorization: Bearer ANON_KEY" -H "Content-Type: application/json" -d '{}'
   ```
   The expected answer is `{"error":"Sign in to the lead tracker again, then retry."}`. It means the function is running and turning away callers who aren't signed in. If you get anything else, see Troubleshooting below.

7. **Try it.** Open a lead, press **📷 Add people from a screenshot**, paste a screenshot and press **Read screenshot**.

If it fails, run `docker compose logs -f functions` while you try again. The function logs API key and API errors there.

## Troubleshooting

| What you see | What to do |
|---|---|
| `Function not found` or 404 | The folder must be `volumes/functions/extract-contacts/` and hold `index.ts`. Re-run step 4. |
| `Invalid JWT` or 401 without the "Sign in" message | The `ANON_KEY` in the command is wrong. Copy it again from `.env`. |
| Logs mention `npm:` or can't download a package | The server can't reach `registry.npmjs.org`, or the edge runtime image is old. Update the `functions` image tag in `docker-compose.yml` to the one in the current Supabase `docker/docker-compose.yml`, then run `docker compose pull functions` and repeat step 4. |
| "The screenshot reader's API key isn't working" | `ANTHROPIC_API_KEY` is missing or wrong. Check it with `docker compose exec functions printenv ANTHROPIC_API_KEY`, which prints the key. Also check that the Claude Console account has credit. |
| "Sign in to the lead tracker again" when you're signed in | Sign out of the lead tracker and back in. If that doesn't help, check that `FIREBASE_PROJECT_ID` is `midas-leads-a8b13`. |
| The browser shows a CORS error | `ALLOWED_ORIGINS` must include the exact site address, `https://midastechinc.github.io`. |

## How it behaves

- **Model.** Uses Claude Opus 5 (`claude-opus-5`) at medium effort. If Claude declines a request, the API retries it on a fallback model automatically (`fallbacks: "default"`).
- **Long pages.** Long team pages are cut into up to 4 overlapping pieces before sending, so the text stays readable. The app merges people who show up in two pieces.
- **Image size.** Each piece is resized to at most 1568 px on its longest side and sent as a JPEG. Nothing is stored on the server.
- **Review before saving.** In the review list:
  - People already in the tracker (same email, or same name at the same company) start unticked.
  - The list warns when someone's email domain doesn't match the company website, for example a lawyer who shares an office but runs a different firm.
  - Claude can add its own note when something was hard to read.
- **Company.** If you type a company at the top, everyone is added to it. If you leave it blank, each person gets the company Claude read from the image, and you can edit it. A person with no company starts unticked.
- **What gets saved.** Someone at a company already in the tracker gets that company's:
  - website, industry, rep, city, country and size

  People at a new company are assigned to you. Every saved lead is marked `source: "screenshot"`.
- **Cost.** A screenshot usually costs a few cents. A long page split into 4 pieces costs about 4 times as much. You can see the actual spend under **Usage** in the Claude Console.

## Lead research (🔎 Research)

Clicking 🔎 Research (on a person, or on a company for the whole company) opens a window with three options:

1. **Free quick search.** Buttons open ready-made searches in new tabs: LinkedIn profile, email address, phone, the company's team page, Google Maps, news, and the Law Society directory for law firms. No AI, no cost.
2. **Research with 1min.ai.** Uses 1min.ai's web-search chat (`gpt-4o-mini`) through the same Railway service that holds `ONEMIN_API_KEY`. It uses your 1min.ai credits, with no Claude charge. The answer is less thorough than Claude's.
3. **Research with Claude (cheap).** `POST /research` on the Railway service (`research.ts`). It uses Claude Sonnet 5 at low effort:
   - up to 3 searches for a person and 5 for a company
   - pages capped at 6,000 tokens each
   - the conversation cached between turns

   It usually costs a few cents, and the review window shows the estimated cost of each run (prices are in `PRICE` in `research.ts`).

Both AI options show what they found with sources:
- **Person research** looks up only that person.
- **Company research** checks everyone you have at the company, flags people who may have left, and finds more. Its People list has **Select all / None**.
- Guessed emails start unticked, and nothing is saved until you choose.

## Apify: find new leads and scan websites

The same Railway service runs two Apify scrapers (`apify.ts`) with the `APIFY_TOKEN` variable:

- **🗺️ Find new leads** (All Leads toolbar) uses the Google Maps scraper (`compass/crawler-google-places`).
  - Pick a type of business and an area, and it lists up to 20, 40 or 100 businesses with phone, website, address, category and rating.
  - Businesses already in the tracker (same company name, website domain or phone) start unticked.
  - **Select all / None**, then **Add N leads**, saves them as "General contact" leads assigned to you, with `source: "google-maps"`.
- **🌐 Scan company website** (a research option when the lead has a website) runs two readers side by side and merges them: a free reader in the service (`sitescan.ts`), and Apify's Contact Details Scraper (`vdrmota/contact-info-scraper`).
  - The free reader opens the home page and up to 13 contact, team and about pages.
  - It decodes hidden emails: Cloudflare email protection, `mailto:` links, HTML-encoded characters and "name [at] firm [dot] com".
  - It crawls up to about 25 pages of the site for emails, phone numbers and LinkedIn links.
  - Every email and phone found is listed with a **Save to** choice: a person, a new contact, or skip. Emails matching someone's name are chosen for you.

Both use Apify credit. The free plan includes a monthly allowance, and the app shows what each run used. Set `APIFY_PLACES_ACTOR` / `APIFY_CONTACTS_ACTOR` to use different scrapers.

## Changing the settings

| Setting | Default | What it does |
|---|---|---|
| `ANTHROPIC_API_KEY` | none (required) | Claude API key |
| `APIFY_TOKEN` | none | Apify API token for Find new leads and website scans |
| `ONEMIN_API_KEY` | none | 1min.ai key used for Social Studio's requests (Railway only) |
| `LLM_GATEWAY_URL` | none | Midas AI Gateway address, `https://ai.midastech.support/v1` (Railway only) |
| `LLM_GATEWAY_KEY` | none | The gateway key for this app (`leads-app`). It must be allowed to use `midas-smart` and `midas-web` |
| `FIREBASE_PROJECT_ID` | `midas-leads-a8b13` | Which Firebase project's sign-ins are accepted |
| `ALLOWED_ORIGINS` | `https://midastechinc.github.io` | Comma-separated sites allowed to call the function from a browser |

---
Midas Tech Inc · IT Services & Cybersecurity · www.midastech.ca · info@midastech.ca · 905-787-2038

## Midas AI Gateway (Social Studio)

Social Studio's **Midas AI Gateway** model (the default) writes posts with the gateway's free
models (`midas-smart`) and searches the news with `midas-web` (1min.ai web search). It goes
through `POST /llm/chat` on the Railway service, which holds the gateway key, and only answers
signed-in lead tracker users.

To turn it on, add two variables to the Railway service and let it redeploy:

```
LLM_GATEWAY_URL=https://ai.midastech.support/v1
LLM_GATEWAY_KEY=sk-...   # the leads-app key from the gateway
```

Until they're set, or whenever the gateway fails, Social Studio uses 1min.ai directly with
GPT-4o Mini, so posts still get made. Image generation always uses 1min.ai.

The GitHub Actions post generator (`scripts/generate-posts.mjs`) uses the gateway the same way
when the repository secrets `LLM_GATEWAY_URL` and `LLM_GATEWAY_KEY` are set.
