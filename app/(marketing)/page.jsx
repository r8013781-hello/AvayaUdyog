import Hero from "../../components/Hero";
import Marquee from "../../components/Marquee";
import About from "../../components/About";
import Services from "../../components/Services";
import Gallery from "../../components/Gallery";
import AboutCompany from "../../components/AboutCompany";
import Testimonials from "../../components/Testimonials";

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
      <Gallery />
      <AboutCompany />
      <Testimonials />
    </>
  );
}
