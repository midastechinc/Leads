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

5. **Check the network.** The server has to reach `api.anthropic.com` and `www.googleapis.com` over HTTPS. The second one is where Firebase publishes the keys used to check sign-in tokens. If you firewall outbound traffic, allow both.

6. **Try it.** Open a lead, press **📷 Add people from a screenshot**, paste a screenshot and press **Read screenshot**.

If it fails, run `docker compose logs -f functions` while you try again. The function logs API key and API errors there.

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
