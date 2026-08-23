/**
 * The questions people actually ask before enquiring.
 *
 * Every answer is drawn from copy already published elsewhere on this site —
 * the four services in Services.jsx, the capability list in Marquee.jsx, the
 * founder's record in AboutCompany.jsx, and the consultation line in
 * Gallery.jsx. Nothing here asserts a price, a duration, a project count in a
 * given area, or a client name, because the repository establishes none of
 * those and an FAQ is exactly where an invented number would do the most
 * damage: it is the part of a page people read to decide whether to trust you.
 *
 * The two questions deliberately left out are "how long does it take" and a
 * specific price range. Both are among the most searched, and both are
 * unanswerable here without making something up. They are the first two to
 * add once the business supplies real figures.
 *
 * Kept in this plain module rather than in components/FAQ.jsx so the page's
 * Server Component can import it for JSON-LD without crossing the client
 * boundary — and so the rendered answers and the structured data can only
 * ever come from one source.
 */


export const FAQS = [
  {
    q: "Do you handle the building work, or only the design?",
    // Source: Services.jsx — "Turnkey Execution".
    a: "Both. Alongside design consultation we take on turnkey execution — from the first sketch to the final styling, we manage every detail so the project feels effortless from start to finish rather than becoming something you have to coordinate yourself.",
  },
  {
    q: "Do you work on offices and shops, or only homes?",
    // Source: Services.jsx — "Residential Interiors" and "Commercial Spaces".
    a: "Both. Residential work covers warm, modern homes shaped around how you actually live. Commercial work covers brand-first offices and retail environments designed to impress clients and keep teams inspired and productive.",
  },
  {
    q: "What happens in the first consultation?",
    // Source: Services.jsx "Design Consultation" + the consultation line
    // published in Gallery.jsx.
    a: "It is a conversation rather than a presentation. We talk through the space, how you use it and what you want it to become, then move into concept development, material guidance and clear design direction. Full walkthroughs, drawings and material boards are shared during consultation.",
  },
  {
    q: "Do you supply furniture and materials, or do we source them?",
    // Source: Marquee.jsx — "Bespoke Furniture", "Material Curation".
    a: "Material curation and bespoke furniture are part of what we do, so you are not left to source and match everything yourself. Finishes and furniture are chosen as part of the design rather than bolted on at the end.",
  },
  {
    q: "Who will actually be working on my project?",
    // Source: AboutCompany.jsx — founder, 35+ years.
    a: "Avaya Udyog is led by Mr. Biswanath Adhikari, who brings over 35 years of industry experience. Because the same studio handles design and execution, you deal with one team throughout — nothing is handed to a separate contractor partway through.",
  },
  {
    q: "How much does an interior project cost?",
    // Deliberately no figure. Nothing in the business's published material
    // establishes a rate, and an invented range would be the single most
    // damaging thing on this page.
    a: "There is no single rate, because cost follows scope — the size of the space, how much is being rebuilt rather than refreshed, and the materials chosen. We would rather understand the project first than quote a number that turns out to be wrong. Costing is discussed openly during consultation, once there is something real to cost.",
  },
  {
    q: "Where are you based?",
    // Source: Hero.jsx, Footer.jsx, ContactPanel.jsx — Kolkata, West Bengal.
    // No sub-locality or coverage-radius claim is made here; those are not
    // established anywhere in the business's own material.
    a: "We are an interior design studio in Kolkata, West Bengal. The quickest way to find out whether we can take on a particular space is to call or send an enquiry — we will tell you straight away.",
  },
];
