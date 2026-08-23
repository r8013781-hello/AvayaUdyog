# Moving off the Gmail address — the complete change list

**Nothing in this document has been applied.** The public address is unchanged
and remains `info.avayaudyog@gmail.com` everywhere. This is the audit and the
change plan, written so the switch is a mechanical edit rather than a hunt.

`info@avayaudyog.com` does not exist yet. Do not put it anywhere — a mailto
pointing at an unrouted mailbox is strictly worse than a Gmail address, because
enquiries sent to it bounce or vanish silently.

## Why it is worth doing

`avayaudyog.com` is already owned and serving the site. A business that
publishes a domain and then asks to be emailed at Gmail reads as smaller and
less permanent than it is, on a page whose entire job is to be trusted with a
project worth several lakhs. It is also the address sitting in
`lib/schema.js`, which is what Google reads as the business's contact point.

## The complete list of occurrences

Nine live occurrences across seven files, plus two references that are not
user-facing.

### Public marketing surface — 6 occurrences, 4 files

| File | Line | What it is |
|---|---|---|
| [components/Footer.jsx](../components/Footer.jsx) | ~145 | `mailto:` href in the footer contact block |
| [components/Footer.jsx](../components/Footer.jsx) | ~157 | The visible address text next to it |
| [components/Footer.jsx](../components/Footer.jsx) | ~440 | `CONNECT_LINKS` — the "Email us" nav entry |
| [components/ContactPanel.jsx](../components/ContactPanel.jsx) | ~356 | `mailto:` href in the enquiry drawer's direct-channels card |
| [components/ContactPanel.jsx](../components/ContactPanel.jsx) | ~368 | The visible address text in that card |
| [app/(marketing)/privacy-policy/page.jsx](<../app/(marketing)/privacy-policy/page.jsx>) | ~149, ~152 | Data-controller contact — href and visible text |
| [app/(marketing)/terms/page.jsx](<../app/(marketing)/terms/page.jsx>) | ~147, ~150 | Legal contact — href and visible text |

Each is an href/text **pair**. Changing one and not the other produces a link
whose label and destination disagree, which is the specific failure mode to
watch for — grep for both forms after editing.

### Structured data — 1 occurrence, highest priority

| File | Line | What it is |
|---|---|---|
| [lib/schema.js](../lib/schema.js) | 20 | `email` on the `HomeAndConstructionBusiness` node |

This is the one Google reads. It also has to match whatever is on the Google
Business Profile — a mismatch between schema, GBP and the visible site is a
weak-but-real local-ranking signal, and it is free to get right.

### CRM output — 1 occurrence, customer-facing

| File | Line | What it is |
|---|---|---|
| [lib/crm/generateQuotationPdf.js](../lib/crm/generateQuotationPdf.js) | 62 | The address printed in the letterhead of **every quotation PDF** |

Easy to miss because it is inside `/portal` and never rendered as HTML. It is
nonetheless the most commercially visible instance in the whole codebase: it
goes on the document a client receives when money is being discussed.

### Not user-facing

| File | Line | What it is |
|---|---|---|
| [SRS.md](../SRS.md) | 111 | Requirement F-2 describes the contact form emailing this address. **This requirement is not implemented** — see below. |

## Backend / SendGrid dependency

This is the part that changes the shape of the job.

**No email is sent when an enquiry arrives.** Verified across the whole backend:

- `backend/package.json` lists `@sendgrid/mail@^8.1.3` as a dependency.
- `backend/.env.example` declares `SENDGRID_API_KEY=`.
- **No file in `backend/` imports `@sendgrid/mail` or reads `SENDGRID_API_KEY`.**
  `grep -rn "sendgrid\|SENDGRID" backend --include="*.js"` returns nothing
  outside `.env.example`.
- `backend/routes/leads.js` validates the payload and inserts a row. That is
  all it does. The only `email` in that file is the lead's own address, a
  column in the insert.

So the situation today is:

- An enquiry reaches the database and shows up in the CRM.
- **Nobody is notified.** A lead sits unseen until someone opens `/portal`.
- Changing the public address on the website therefore has **no backend
  consequence at all**, because no backend code sends to it.

Two conclusions follow, and they are separate pieces of work:

1. **The address swap is frontend-only.** Nine string edits, no server change,
   no deploy dependency, no SendGrid configuration needed.
2. **The missing notification is the more valuable fix.** The site's whole
   funnel ends in a row in a table that nothing announces. That is a bigger
   lead-loss risk than the address being a Gmail one, and it is the thing SRS
   F-2 already says should exist. Worth scheduling on its own merits — and if
   it is built, `info@avayaudyog.com` should be its destination, which is a
   second reason to set the mailbox up first.

## Order of operations, when the business is ready

1. **Create the mailbox** — Google Workspace, Zoho Mail, or whatever the domain
   registrar offers. Route it to somewhere a person reads daily.
2. **Verify it end to end.** Send from an outside address and reply from it.
   An unmonitored `info@` is a worse outcome than the Gmail address.
3. **Set up SPF, DKIM and DMARC** before anything sends *from* the domain. A
   new domain with no authentication lands in spam, and a lead in spam is a
   lead lost with no signal that it happened.
4. **Keep the Gmail address forwarding** into the new mailbox indefinitely. It
   is printed on past quotations and in past correspondence; it will keep
   receiving mail for years.
5. **Then** make the nine edits above, in one commit.
6. **Update the Google Business Profile** to match, so schema, GBP and the site
   all agree.
7. Update `SRS.md` F-2 to state whichever is then true.

## Verification after the swap

```sh
# Must return nothing outside docs/ and SRS.md history.
grep -rn "info.avayaudyog@gmail.com" \
  --include="*.js" --include="*.jsx" . | grep -v node_modules

# Must return 9 occurrences across the 7 files listed above.
grep -rn "info@avayaudyog.com" \
  --include="*.js" --include="*.jsx" . | grep -v node_modules
```

Then load the footer, the enquiry drawer, `/privacy-policy` and `/terms` and
confirm the visible text matches the `mailto:` in each pair, and generate one
quotation PDF from `/portal` to check the letterhead.
