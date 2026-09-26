# Screenshot reader setup

Three buttons send a screenshot to a Supabase Edge Function called `extract-contacts`:
- **📷 From screenshot** in the All Leads toolbar adds new leads. Each person keeps the company shown in the image, so one screenshot can hold several companies, for example LinkedIn search results.
- **📷 Add people from a screenshot** in the lead window adds people at that lead's company.
- **📷 From screenshot** in Add Lead uses the company typed there.

The function asks Claude to list the people in the image and sends them back to the app. You check the list and pick who to add. Nothing is saved until you press **Add N leads**.

The Anthropic API key stays on your Supabase server. The browser never sees it. The function only answers people who are signed in to the lead tracker: it checks their Firebase sign-in token before it calls Claude.

Until the function is deployed, the button shows: *"The screenshot reader isn't set up on the server yet."* The rest of the app still works.

## One-time setup (self-hosted Supabase, Docker)

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

## Changing the settings

| Setting | Default | What it does |
|---|---|---|
| `ANTHROPIC_API_KEY` | none (required) | Claude API key |
| `FIREBASE_PROJECT_ID` | `midas-leads-a8b13` | Which Firebase project's sign-ins are accepted |
| `ALLOWED_ORIGINS` | `https://midastechinc.github.io` | Comma-separated sites allowed to call the function from a browser |

---
Midas Tech Inc · IT Services & Cybersecurity · www.midastech.ca · info@midastech.ca · 905-787-2038
