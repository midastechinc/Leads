// Builds one JSON file per post for seeding the Content Hub database.
import fs from 'node:fs';

const md = fs.readFileSync('../ai-cybersecurity/article.md', 'utf8').split('\n');
const start = md.findIndex(l => l.startsWith('## The new reality'));
const end = md.findIndex(l => l.startsWith('**Article hashtags'));
const articleBody = md.slice(start, end)
  .map(l => l.replace(/^#{2,3} /, '').replace(/^> /, '').replace(/\*\*/g, '').replace(/^\*(.*)\*$/, '$1'))
  .filter(l => l.trim() !== '---')
  .join('\n').replace(/\n{3,}/g, '\n\n').trim();

const C = 'AI & Cybersecurity';
const posts = [
{ id:'ai-01-article', platform:'li-ali', kind:'Article', when:'2026-09-29T08:00', time:'8:00 AM',
  title:'AI Is Changing Cybersecurity Faster Than Most Businesses Realize', image:'img/ai-article-cover.png',
  notes:'LinkedIn → Write article. Upload the cover image, paste the headline, then paste the body. Set each section title as a Heading. Copy the article URL after publishing; posts below link to it.',
  body:'AI Is Changing Cybersecurity Faster Than Most Businesses Realize\n\n'+articleBody+'\n\n#Cybersecurity #AI #AccessGovernance #DataSecurity #ManagedIT' },
{ id:'ai-02-launch', platform:'li-ali', kind:'Post', when:'2026-09-29T08:30', time:'8:30 AM', title:'Article launch', image:null,
  notes:'Post 30 min after the article is live. Add the article link as the first comment.',
  firstComment:'Here\'s the full article 👉 [paste article link]\nIf you want a quick look at who (and what) can access your sensitive data, DM me or reach us at info@midastech.ca / 905-787-2038.',
  body:`AI isn't just making businesses more productive.

It's making attackers more efficient too. 🤖

What used to take a hacker weeks now takes hours: finding weak spots, writing phishing emails that sound exactly like your vendor, and mapping the fastest route to your data.

Firewalls and antivirus still matter. But the question I'm asking every client right now is different:

👉 "If an attacker gets in, how much can they reach?"

As businesses roll out Copilot, AI assistants and more cloud apps, that answer is often "way more than you'd think."

I wrote a short article on why reducing attacker reach should be a top priority for every business, and on the 4 things we're helping clinics, accounting firms and warehouses focus on right now.

Link in the comments 👇

#Cybersecurity #AI #DataSecurity #ManagedIT #SmallBusiness` },
{ id:'ai-03-company', platform:'li-midas', kind:'Post', when:'2026-09-30T10:00', time:'10:00 AM', title:'Company page announcement', image:'img/ai-post-question.png',
  notes:'Post from the Midas Tech page. Add the article link as the first comment.',
  firstComment:'Read Ali\'s full article here 👉 [paste article link]',
  body:`Attackers have an AI copilot too. 🎯

Most businesses spend all their security effort keeping attackers out. That's important, but it's only half the picture.

The other half:
❓ If someone gets in, how much can they access?

In his new article, our founder Ali Jaffar explains why access governance and data security are now core to cyber resilience, especially as teams adopt Microsoft Copilot and AI tools.

✅ Find where your sensitive data lives
✅ Cut access nobody needs
✅ Monitor for unusual activity
✅ Keep improving, month after month

Read it here 👇 (link in comments)

🌐 www.midastech.ca | 📞 905-787-2038

#Cybersecurity #AccessGovernance #MicrosoftCopilot #MSP #MidasTech` },
{ id:'ai-04-checklist', platform:'li-midas', kind:'Post', when:'2026-10-01T12:00', time:'12:00 PM', title:'5 access red flags', image:'img/ai-post-checklist.png', notes:'',
  body:`🚩 5 access red flags we find in almost every new client environment:

1️⃣ Staff can still open files they stopped needing years ago
2️⃣ Old permissions keep piling up with every new hire and project
3️⃣ Service accounts have admin rights "just in case"
4️⃣ Sensitive files are scattered across OneDrive, SharePoint, email and a few more apps
5️⃣ AI tools like Copilot can see data that was never properly locked down

Any of these sound familiar? You're not alone, and they're all fixable.

The rule is simple: reduce unnecessary access and you reduce risk.

Want to know where you stand? Book a free Access & Data Risk Review 👉 info@midastech.ca

#Cybersecurity #DataSecurity #LeastPrivilege #Microsoft365 #ManagedIT` },
{ id:'ai-05-ig-checklist', platform:'instagram', kind:'Post', when:'2026-10-02T11:00', time:'11:00 AM', title:'Red flags gut check', image:'img/ai-post-checklist.png',
  notes:'Make sure www.midastech.ca is in the Instagram bio before posting ("link in bio").',
  body:`Quick gut check for your business 👇

Here are the 5 access red flags we spot in almost every new client's setup:

1️⃣ Old file access nobody ever cleaned up
2️⃣ Permissions that pile up with every new hire
3️⃣ Service accounts with admin rights "just in case"
4️⃣ Sensitive files spread across OneDrive, SharePoint and email
5️⃣ AI tools like Copilot seeing data that was never locked down

Count how many apply to you. Two or more? Let's talk 💬

Free Access & Data Risk Review → link in bio
📞 905-787-2038

#cybersecurity #itsupport #managedit #datasecurity #microsoft365 #copilot #smallbusiness #torontobusiness #richmondhill #yorkregion #healthcareit #accountingfirm #warehousing #techtips #midastech` },
{ id:'ai-06-fb-question', platform:'facebook', kind:'Post', when:'2026-10-05T10:00', time:'10:00 AM', title:'The question we ask every owner', image:'img/ai-post-question.png',
  notes:'Facebook allows links in the post body. Replace [paste article link] before posting.',
  body:`Here's a question we're asking every business owner we meet this fall:

If a hacker got into one of your staff accounts tomorrow, how much could they see? 🤔

Most people guess "not much." When we actually check, it's usually a lot more: old folders, shared drives, and now AI tools like Microsoft Copilot that can pull up anything an account has permission to open.

Attackers are using AI too, so they find those gaps faster than ever.

Our founder Ali wrote about what that means for local clinics, accounting firms and warehouses. Give it a read 👉 [paste article link]

Want us to check for you? It's free and there's no pressure.

📞 905-787-2038 | ✉️ info@midastech.ca | 🌐 www.midastech.ca` },
{ id:'ai-07-copilot', platform:'li-ali', kind:'Post', when:'2026-10-06T08:30', time:'8:30 AM', title:'Copilot story', image:null, notes:'Text only. Text posts often reach more people on personal profiles.',
  body:`A quick one about Microsoft Copilot. 👇

Copilot doesn't create new access problems. It exposes the ones you already have.

If an employee technically has permission to a folder full of payroll files, contracts or patient records, even if they never knew it existed, Copilot can find it and summarize it for them in seconds.

That's not a Copilot bug. It's years of permission clutter finally becoming visible.

Before you roll out AI tools across your team, do three things:
🔍 Find out where your sensitive data lives
🔐 Clean up who has access to it
📊 Turn on monitoring so you know how it's being used

AI can be a huge accelerator for your business. Just make sure it's working with a clean house.

Thinking about Copilot? Happy to chat. No pressure, just a straight answer. 📞 905-787-2038

#MicrosoftCopilot #AI #Cybersecurity #DataGovernance #SmallBusiness` },
{ id:'ai-08-ig-question', platform:'instagram', kind:'Post', when:'2026-10-07T11:00', time:'11:00 AM', title:'Old question vs new question', image:'img/ai-post-question.png', notes:'',
  body:`Old question: "How do we keep hackers out?" 🔒
New question: "If they get in, how much can they reach?" 👀

AI is helping attackers move faster than ever. One stolen password can open a lot more doors than most owners expect.

The fix is simple: give people, apps and AI tools access to only what they actually need.

Less access = less damage. That's it.

Want to know what your team can reach right now? Link in bio or send us a DM 📩

#cybersecurity #ai #itsecurity #managedit #databreach #phishing #smallbusinesstips #ontariobusiness #richmondhill #gta #healthcare #accountants #logistics #itservices #midastech` },
{ id:'ai-09-industry', platform:'li-midas', kind:'Post', when:'2026-10-08T10:00', time:'10:00 AM', title:'Industry spotlight', image:'img/ai-post-industry.png', notes:'',
  body:`🏥 Healthcare. 📊 Accounting. 📦 Warehousing.

Different industries, same question:

If someone got into your systems today, what could they reach?

🏥 Clinics: patient records and billing data
📊 Accounting firms: client tax returns, bank info and SINs
📦 Warehouses: customer lists, pricing, shipping and supplier data

AI is helping attackers move faster than ever, so the gap between getting in and doing damage keeps shrinking.

The fix isn't more tools. It's less unnecessary access, better visibility and a partner who keeps watching.

That's what we do at Midas Tech, and we've been doing it for Ontario businesses since 2010. 💙

📍 Richmond Hill, ON | 🌐 www.midastech.ca | ✉️ info@midastech.ca

#Healthcare #AccountingFirms #Warehousing #Cybersecurity #ManagedIT #Ontario` },
{ id:'ai-10-fb-industry', platform:'facebook', kind:'Post', when:'2026-10-09T10:00', time:'10:00 AM', title:'Which would worry you most?', image:'img/ai-post-industry.png', notes:'Reply to every comment within a day. Facebook shows posts with active comments to more people.',
  body:`Clinics, accounting firms and warehouses across the GTA, this one's for you 💙

Every business has that one set of files that would be a nightmare to lose or leak:

🏥 For clinics, it's patient records
📊 For accountants, it's client tax returns and banking details
📦 For warehouses, it's customer, pricing and supplier data

With attackers now using AI to move faster, the smartest thing you can do is make sure only the right people can reach that data.

Quick question for you 👇
Which of these would worry you most if it got out? Tell us in the comments.

Need a hand locking things down? We've been helping Ontario businesses since 2010.
📞 905-787-2038 | 🌐 www.midastech.ca` },
];

fs.rmSync('seed', { recursive: true, force: true }); fs.mkdirSync('seed');
for (const p of posts) fs.writeFileSync(`seed/${p.id}.json`, JSON.stringify({ campaign: C, firstComment: '', ...p }, null, 1));
console.log(posts.length, 'posts');
