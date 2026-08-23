import Hero from "../../components/Hero";
import Marquee from "../../components/Marquee";
import About from "../../components/About";
import Services from "../../components/Services";
import HowWeWork from "../../components/HowWeWork";
import ServicesMore from "../../components/ServicesMore";
import YourPart from "../../components/YourPart";
import Principles from "../../components/Principles";
import Gallery from "../../components/Gallery";
import AboutCompany from "../../components/AboutCompany";
import Testimonials from "../../components/Testimonials";
import FAQ from "../../components/FAQ";
import { faqSchema } from "../../lib/schema";
import { FAQS } from "../../lib/faqs";

// This file itself has no "use client" — it's a Server Component that
// simply composes the section components in order, same stack as the Vite
// app's App.jsx (Hero, Marquee, About, Services, Gallery, AboutCompany,
// Testimonials). Navbar/Footer/WhatsappButton/ContactModalProvider live in
// layout.jsx since they wrap every route, not just this one.
export default function HomePage() {
  return (
    <>
      {/* No manual hero preload here, and none in the layout either.

          React emits one automatically for an <img loading="eager"> — that is
          where the single <link rel="preload" as="image"> in this page's <head>
          comes from, and it is why the two service pages get one for their own
          intro image without anyone writing a tag. Adding a hand-written tag on
          top produced two identical preloads for the same file.

          The generated tag is also strictly better than a hand-written one: it
          cannot drift from the image actually rendered, and it appears only on
          pages that render an eager image. The previous layout-level tag
          preloaded the hero on all sixteen marketing routes, fifteen of which
          never display it. Verified in out/ — exactly one on the homepage,
          zero elsewhere. */}

      <Hero />
      <Marquee />
      <About />
      <Services />
      {/* The rest of the range, plus routing by situation — merged here from
          the /services hub. Sits immediately after the editorial services
          blocks so the whole "what we do" answer is one continuous read. */}
      <ServicesMore />
      {/* Process sits between what we do and the work itself — capability,
          then how it's delivered, then the result. */}
      <HowWeWork />
      {/* The client's half of the process, merged here from /process. Directly
          after HowWeWork, because it only makes sense against those stages. */}
      <YourPart />
      <Gallery />
      <AboutCompany />
      {/* Merged from /about: why the studio works the way it does. After the
          founder, where it reads as substantiation rather than assertion. */}
      <Principles />
      <Testimonials />
      {/* Objections last, immediately before the footer's enquiry form —
          answer the hesitation, then offer the way to act on it. */}
      <FAQ />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(FAQS)) }}
      />
    </>
  );
}
