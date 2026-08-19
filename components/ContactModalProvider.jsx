"use client";

import { createContext, useContext, useState } from "react";
import ContactPanel from "./ContactPanel";

// The Vite app had one root component (App.jsx) holding isContactOpen and
// prop-drilling openContactModal into Hero/About/Services/AboutCompany/
// Navbar. In the App Router, the sections that need to open the modal
// (Hero, About, Services, AboutCompany, Navbar) are themselves Client
// Components, but there's no single common client ancestor below the root
// layout to hold that state without turning the whole page into one giant
// client tree. A small context provider does the same job cleanly: any
// Client Component under it can call useContactModal() directly, and the
// static sections that don't need it stay untouched.
const ContactModalContext = createContext(null);

export function useContactModal() {
  const ctx = useContext(ContactModalContext);
  if (!ctx) {
    throw new Error("useContactModal must be used within ContactModalProvider");
  }
  return ctx.open;
}

export default function ContactModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return (
    <ContactModalContext.Provider value={{ open }}>
      {children}
      <ContactPanel isOpen={isOpen} onClose={close} />
    </ContactModalContext.Provider>
  );
}
