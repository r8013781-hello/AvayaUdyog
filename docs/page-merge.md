# Page merge — /about, /process and /services folded into the homepage

## ⚠ Required before this ships: four redirect changes on the host

These three URLs are **live and indexed today**. After this deploy the build no
longer produces them, so without redirects they become 404s for real visitors
and for Google. The repo cannot fix this — a static export has no server (see
`docs/security-headers.md` for why) — so it must be done on Render or
Cloudflare.

| # | Path | Action | Why |
|---|---|---|---|
| 1 | `/about` | **Add** 301 → `/` | Merged into the `#about` / `#principles` sections |
| 2 | `/process` | **Add** 301 → `/` | Merged into the `#how-we-work` / `#your-part` sections |
| 3 | `/services` | **Add** 301 → `/` | Merged into the `#services` / `#which-service` sections |
| 4 | `/interior-designer-kolkata` | **CHANGE** existing 301 from `/services` to `/` | It currently points at `/services`, which is about to 404 |

**Number 4 is the one that is easy to miss.** It is an existing, working
redirect that this change silently turns into a redirect-to-404. The other
three are new; this one is a modification.

Verified live before the change:

```
/interior-designer-kolkata              301 -> https://avayaudyog.com/services
/residential-interior-designer-kolkata  301 -> https://avayaudyog.com/services/residential-interior-design
/commercial-interior-designer-kolkata   301 -> https://avayaudyog.com/services/commercial-interior-design
```

Redirects 2 and 3 in that list point at `/services/*` **pages that still
exist** and must be left exactly as they are.

### Why `/` and not `/#about`

A redirect to a fragment is unreliable — some proxies drop it, and Google
ignores the fragment when consolidating signals, so `/#about` and `/` are the
same URL to it either way. Send them to `/`; the content is on that page.

### Verifying after deploy

```sh
for u in /about /process /services /interior-designer-kolkata; do
  curl -s -o /dev/null -w "$u %{http_code} -> %{redirect_url}\n" "https://avayaudyog.com$u"
done
# All four must be 301 -> https://avayaudyog.com/

for u in /services/residential-interior-design /services/commercial-interior-design \
         /services/modular-kitchen /services/home-renovation; do
  curl -s -o /dev/null -w "$u %{http_code}\n" "https://avayaudyog.com$u"
done
# All four must stay 200
```

## What moved, and what did not

### Merged into the homepage

| Was | Now | Carried across |
|---|---|---|
| `/about` | `#about` (existing) + `#principles` (new) | The three reasoning blocks. The founder narrative was already on the homepage as `#founder`. |
| `/process` | `#how-we-work` (existing) + `#your-part` (new) | "What you decide, and when". The four stages were already on the homepage. |
| `/services` | `#services` (existing) + `#which-service` (new) | Modular Kitchens + Renovation cards, and the decision-routing list. |

Two of the five `/process` FAQs moved into `lib/faqs.js` — "how long does each
stage take" and "can I make changes once the design is agreed". The other three
were near-duplicates of homepage FAQs and were dropped rather than repeated.

### Deliberately NOT merged

- **The four `/services/*` pages stay standalone.** They are substantive
  service pages, two of them are live 301 destinations, and they are the
  site's main commercial search surface.
- **`/insights` and its six articles stay standalone.** Same reasoning applied
  one level out: these are long-form pages that earn search traffic on their
  own terms. Folding ~10,000 words of articles into the homepage would make it
  unreadable and would remove six ranking URLs — the opposite of better UX.
- **The `/services` hub's six-card grid** — it restated services already shown
  editorially on the homepage.
- **The hub's three PRINCIPLES** — a near-duplicate of the `/about` ones, which
  are the version that survived.

## Anchors the site now depends on

Every one of these is a homepage section id that navigation or a cross-page
link points at. Deleting or renaming one silently breaks a link that still
looks live — `__tests__/navigation.test.js` asserts each exists.

| id | Component |
|---|---|
| `about` | `components/About.jsx` |
| `services` | `components/Services.jsx` |
| `design-consultation` | `components/Services.jsx` (block id) |
| `turnkey-execution` | `components/Services.jsx` (block id) |
| `which-service` | `components/ServicesMore.jsx` |
| `how-we-work` | `components/HowWeWork.jsx` |
| `your-part` | `components/YourPart.jsx` |
| `gallery` | `components/Gallery.jsx` |
| `founder` | `components/AboutCompany.jsx` |
| `principles` | `components/Principles.jsx` |
| `faq` | `components/FAQ.jsx` |

## Honest assessment of the SEO cost

Worth recording, because it is a real cost accepted for a UX gain rather than a
free win:

- **Three indexed URLs become one.** `/about`, `/process` and `/services` had
  their own titles, descriptions and canonical URLs, and could rank for their
  own queries — `/services` in particular targeted "interior design services
  Kolkata". That page-level targeting is gone; the homepage now has to carry
  those queries on a single title tag.
- **Internal link equity concentrates on `/`,** which is not harmful, but the
  four `/services/*` pages now receive their internal links from homepage
  sections rather than from a dedicated hub. They are still linked from the
  homepage, the footer and each other.
- **Recovery is straightforward** if the ranking loss turns out to matter: the
  content still exists as components, so re-creating `/services` as a page is
  mostly re-adding a route file and reversing redirect 3 and 4.

Watch Search Console for impressions on "interior design services kolkata" and
related queries over the next 4–8 weeks. If `/` does not pick up what
`/services` was earning, that is the signal to reinstate the hub.
