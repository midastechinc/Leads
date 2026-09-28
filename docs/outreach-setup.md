# Email outreach setup

The **✉️ Outreach** tab sends the 4-email sequence from a Microsoft 365 mailbox:
- Every weekday you read and approve the emails that are due, then press **Send approved**.
- Follow-ups go out as replies in the same thread: email 2 three business days after email 1, email 3 four business days after that, and email 4 seven business days after that.
- A reply, a bounce or an unsubscribe stops the sequence.

The emails go out through the Railway service (`supabase/functions/extract-contacts/outreach.ts`), using Microsoft Graph. The app's step-by-step checklist is at the top of the Outreach tab. This page has the technical details.

Cost: about CA$20–25 a month. That covers one extra mailbox (~$8), a second domain (~$2), and the Railway service you already pay for. The email check and the AI first lines are free.

## 1. Domain and mailbox

1. **Buy a second domain.** You bought `midastechinc.ca` (for sending) and `midastechinc.com` (kept for later). Don't send cold email from midastech.ca: if something goes wrong, it's the second domain that gets a bad reputation, not your main one.
2. **Add the domain to Microsoft 365.** Go to Microsoft 365 admin center → **Settings → Domains → Add domain**, and add the DNS records it asks for.
3. **Create the mailbox.** Add a user such as `ali@midastechinc.ca` with an **Exchange Online (Plan 1)** or **Business Basic** licence.
4. **Set up email authentication.** At your domain registrar, add:
   - SPF (TXT on `@`): `v=spf1 include:spf.protection.outlook.com -all`
   - DKIM: in the Microsoft Defender portal, go to **Email & collaboration → Policies → Email authentication settings → DKIM**. Select the domain, add the two CNAME records it shows, then turn it on.
   - DMARC (TXT on `_dmarc`): `v=DMARC1; p=none; rua=mailto:ali@midastechinc.ca`
5. **Lock the domain you're not using yet.** Until `midastechinc.com` sends email, add two TXT records to it so nobody can send email pretending to be it: `v=spf1 -all` on `@`, and `v=DMARC1; p=reject` on `_dmarc`. Point its website at midastech.ca.
6. **Warm up for about 2 weeks.** Send normal emails from the mailbox to people who will reply. After that, the app keeps the pace low on its own: 5 emails a day in week 1, 10 in week 2, 20 in week 3, then 30. The server also refuses to send more than `OUTREACH_DAILY_MAX` a day.

## 2. Let the Railway service use that one mailbox

1. **Register an app.** In the Microsoft Entra admin center, go to **App registrations → New registration** and name it `Lead tracker outreach`.
   - Copy the **Application (client) ID** and the **Directory (tenant) ID**.
   - Under **Certificates & secrets → New client secret**, create a secret and copy its **Value**. It's shown only once.
   - **Don't add any Microsoft Graph API permissions.** Access comes from step 2 instead, and it only covers the one mailbox.
2. **Give it access to that mailbox only.** Use Exchange RBAC for Applications. Open PowerShell and run these commands, using the IDs from step 1:
   ```powershell
   Connect-ExchangeOnline
   # The app's Enterprise application object ID: Entra → Enterprise applications → Lead tracker outreach → Object ID
   New-ServicePrincipal -AppId <client-id> -ObjectId <enterprise-app-object-id> -DisplayName "Lead tracker outreach"
   New-ManagementScope -Name "Outreach mailbox" -RecipientRestrictionFilter "PrimarySmtpAddress -eq 'ali@midastechinc.ca'"
   New-ManagementRoleAssignment -App <client-id> -Role "Application Mail.Send" -CustomResourceScope "Outreach mailbox"
   New-ManagementRoleAssignment -App <client-id> -Role "Application Mail.ReadWrite" -CustomResourceScope "Outreach mailbox"
   ```
   To check it, run `Test-ServicePrincipalAuthorization -Identity <client-id> -Resource ali@midastechinc.ca`. It should show the two roles as in scope.

   Mail.ReadWrite is needed to create each email as a draft before sending it, which gives follow-ups a thread to reply in. It's also how the service reads replies.
3. **Add the settings in Railway.** Open the service **Leads**, go to **Variables**, and add:
   ```
   MS_TENANT_ID=<directory (tenant) id>
   MS_CLIENT_ID=<application (client) id>
   MS_CLIENT_SECRET=<client secret value>
   OUTREACH_MAILBOX=ali@midastechinc.ca
   ```
   These are optional:
   - `OUTREACH_DAILY_MAX`: a hard limit on emails per day. The default is 30.
   - `OUTREACH_SENDER_NAME`: the name in the footer. The default is Ali Jaffar.
   - `OUTREACH_PUBLIC_URL`: the address used in unsubscribe links. By default it's the Railway address the app calls.

   Railway redeploys on its own. When it's done, the **Mailbox connected** tile in the Outreach tab shows ✓.

The client secret expires; the Entra portal shows when. Before that date, create a new secret and update `MS_CLIENT_SECRET`.

## 3. Shared settings (optional)

The Outreach settings, the checklist ticks and the Sales Kit prices are stored in the Firestore collection `appSettings`. If your Firestore rules don't allow that collection, the app keeps them in each browser instead.

To share them across devices, add a rule like this, next to your other rules, in Firebase console → **Firestore → Rules**:
```
match /appSettings/{doc} {
  allow read, write: if request.auth != null;
}
```

## How it behaves

- **The CASL footer is added on the server**, so an email can't go out without it. It holds:
  - who is sending
  - Midas Tech's mailing address and phone number
  - why the person is getting the email
  - an unsubscribe link and "reply unsubscribe"
- **Only published addresses are emailed.** The app skips emails marked as guesses, like "(unverified)" or research "pattern" guesses, and anyone marked do-not-contact. CASL's exemption for published addresses only applies to addresses the business put online itself. Emails must also relate to the person's work.
- **Every address is checked free when you add a lead:**
  - Is it a real email format?
  - Does the domain have mail servers?
  - Is it a shared inbox (info@) or a personal service (gmail)?
  
  Addresses that can't receive mail aren't added. It can't tell whether a specific person's mailbox exists; bounces catch that.
- **Unsubscribe link:** the page asks the person to confirm, so link scanners can't unsubscribe anyone. It then emails the outreach mailbox an "Unsubscribe request". The next reply check marks the lead **do not contact** and stops its emails. CASL allows up to 10 business days; the app does it the next time you open Outreach.
- **Replies** are checked when you open the Outreach tab (at most every 30 minutes), or with **↻ Check replies**:
  - A reply or "not interested" stops the sequence and appears under **Replies to answer**.
  - Out-of-office replies push the next email back 3 business days.
  - Bounces stop the sequence and mark the email as bad.
- **✨ Personal first line** writes one opening sentence from the lead's saved research. It uses the free Midas AI Gateway, or 1min.ai if the gateway isn't set up. Check each line before sending.
- **Logging:** every email sent is logged as an Email activity on the lead. A New lead becomes Contacted.

## Troubleshooting

| What you see | What to do |
|---|---|
| "Email sending isn't set up yet" | One of the four Railway variables is missing. |
| "The server couldn't sign in to Microsoft 365" | The tenant ID, client ID or secret is wrong, or the secret has expired. |
| "The app isn't allowed to use …" | The step 2 PowerShell commands haven't run, or the scope's address doesn't match `OUTREACH_MAILBOX`. Changes can take up to an hour to apply. |
| "The email service isn't deployed yet" | Redeploy the Railway service so it picks up `outreach.ts`. |
| Emails land in spam | Check SPF, DKIM and DMARC with a free checker such as mail-tester.com, and send fewer a day for a while. |

---
Midas Tech Inc · IT Services & Cybersecurity · www.midastech.ca · info@midastech.ca · 905-787-2038
