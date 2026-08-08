import React, { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Marquee from "./components/Marquee";
import About from "./components/About";
import Services from "./components/Services";
import Gallery from "./components/Gallery";
import AboutCompany from "./components/AboutCompany";
import Testimonials from "./components/Testimonials";
import Footer from "./components/Footer";
import ContactPanel from "./components/ContactPanel";
import WhatsappButton from "./components/WhatsappButton";
import EmployeeLogin from "./components/EmployeeLogin";

function App() {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const crmPath = `${import.meta.env.BASE_URL}crm`;
  const [showEmployeeLogin, setShowEmployeeLogin] = useState(() =>
    window.location.pathname.endsWith("/crm"),
  );

  const openContactModal = () => setIsContactOpen(true);
  const closeContactModal = () => setIsContactOpen(false);
  const openCrm = () => {
    window.history.pushState({}, "", crmPath);
    setShowEmployeeLogin(true);
  };
  const closeCrm = () => {
    window.history.pushState({}, "", import.meta.env.BASE_URL);
    setShowEmployeeLogin(false);
  };

  useEffect(() => {
    const syncRoute = () => setShowEmployeeLogin(window.location.pathname.endsWith("/crm"));
    window.addEventListener("popstate", syncRoute);
    return () => window.removeEventListener("popstate", syncRoute);
  }, []);

  if (showEmployeeLogin) {
    return <EmployeeLogin onBackToSite={closeCrm} />;
  }

  return (
    <div className="min-h-screen bg-canvas text-ink antialiased">
      <Navbar
        openContactModal={openContactModal}
        onLoginClick={openCrm}
      />
      <main>
        <Hero openContactModal={openContactModal} />
        <Marquee />
        <About openContactModal={openContactModal} />
        <Services openContactModal={openContactModal} />
        <Gallery />
        <AboutCompany openContactModal={openContactModal} />
        <Testimonials />
      </main>
      <Footer />
      <ContactPanel isOpen={isContactOpen} onClose={closeContactModal} />
      <WhatsappButton />
    </div>
  );
}

export default App;
