import Hero from "../../components/Hero";
import Marquee from "../../components/Marquee";
import About from "../../components/About";
import Services from "../../components/Services";
import HowWeWork from "../../components/HowWeWork";
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
      <Hero />
      <Marquee />
      <About />
      <Services />
      {/* Process sits between what we do and the work itself — capability,
          then how it's delivered, then the result. */}
      <HowWeWork />
      <Gallery />
      <AboutCompany />
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
