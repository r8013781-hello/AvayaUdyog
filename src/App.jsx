import React, { Suspense, lazy, useEffect, useState } from "react";
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
import CrmLoginModal from "./components/CrmLoginModal";
import { NotificationsProvider } from "./lib/notifications";

// The employee portal (leads, quotations, PDF export, admin panel…) is a
// separate, sizeable bundle that a public website visitor never needs —
// only load it once someone actually opens /portal.
const EmployeeLogin = lazy(() => import("./components/EmployeeLogin"));

function App() {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  // "portal" rather than "crm" in the URL — a logged-out visitor shouldn't be
  // able to tell what kind of internal tool this leads to just by the path.
  const portalPath = `${import.meta.env.BASE_URL}portal`;
  const [showEmployeeLogin, setShowEmployeeLogin] = useState(() =>
    window.location.pathname.endsWith("/portal"),
  );

  const openContactModal = () => setIsContactOpen(true);
  const closeContactModal = () => setIsContactOpen(false);
  const openCrm = () => {
    window.history.pushState({}, "", `${portalPath}?view=overview`);
    setShowEmployeeLogin(true);
  };
  const closeCrm = () => {
    window.history.pushState({}, "", import.meta.env.BASE_URL);
    setShowEmployeeLogin(false);
  };

  useEffect(() => {
    const syncRoute = () => setShowEmployeeLogin(window.location.pathname.endsWith("/portal"));
    window.addEventListener("popstate", syncRoute);
    return () => window.removeEventListener("popstate", syncRoute);
  }, []);

  if (showEmployeeLogin) {
    return (
      <NotificationsProvider>
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-sage-950 text-sm font-semibold text-sage-100">Loading…</div>}>
          <EmployeeLogin onBackToSite={closeCrm} />
        </Suspense>
      </NotificationsProvider>
    );
  }

  return (
    <NotificationsProvider>
      <div className="min-h-screen bg-canvas text-ink antialiased">
        <Navbar
          openContactModal={openContactModal}
          onLoginClick={() => setIsLoginOpen(true)}
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
        {isLoginOpen && <CrmLoginModal onClose={() => setIsLoginOpen(false)} onAuthenticated={openCrm} />}
      </div>
    </NotificationsProvider>
  );
}

export default App;
