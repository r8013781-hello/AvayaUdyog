"use client";

import { createContext, useContext, useState } from "react";
import LoginModal from "./crm/LoginModal";

// Mirrors ContactModalProvider: the navbar's Login button is a Client
// Component with no shared client ancestor to hold this state on, so a
// small context does the job — any Client Component under it can call
// useLoginModal() to pop the sign-in dialog without prop-drilling.
const LoginModalContext = createContext(null);

export function useLoginModal() {
  const ctx = useContext(LoginModalContext);
  if (!ctx) {
    throw new Error("useLoginModal must be used within LoginModalProvider");
  }
  return ctx.open;
}

export default function LoginModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return (
    <LoginModalContext.Provider value={{ open }}>
      {children}
      <LoginModal isOpen={isOpen} onClose={close} />
    </LoginModalContext.Provider>
  );
}
