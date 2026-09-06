"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CircleUserRound, ChevronRight, Eye, EyeOff, X } from "lucide-react";
import { api, onSlowRequest, setToken } from "../../lib/crm/api";

/**
 * The employee sign-in surface, reached only from the navbar's Login button
 * (see components/Navbar.jsx) — there is no standalone /login page anymore.
 * A successful sign-in stores the token and hands off to /portal, which now
 * renders the CRM directly and nothing else (see EmployeeLogin.jsx).
 */
export default function LoginModal({ isOpen, onClose }) {
  const router = useRouter();
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [signingIn, setSigningIn] = useState(false);
  const [wakingServer, setWakingServer] = useState(false);
  const closeRef = useRef(null);

  useEffect(() => onSlowRequest(() => setWakingServer(true)), []);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  /* Fresh form every time the popup opens again — a previous failed attempt
     should not greet the next visit with a stale error or password. */
  useEffect(() => {
    if (isOpen) return;
    setEmployeeId("");
    setPassword("");
    setShowPassword(false);
    setError("");
    setSigningIn(false);
    setWakingServer(false);
  }, [isOpen]);

  const login = async (event) => {
    event.preventDefault();
    setSigningIn(true);
    setWakingServer(false);
    setError("");
    try {
      const { token } = await api.login(employeeId.trim(), password);
      setToken(token);
      onClose();
      router.push("/portal");
    } catch (err) {
      setError(err.message || "The employee ID or password is incorrect.");
      setSigningIn(false);
      setWakingServer(false);
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-[80] bg-sage-950/50 backdrop-blur-sm transition-opacity duration-300 ease-smooth ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`fixed inset-0 z-[90] flex items-center justify-center p-4 transition-opacity duration-300 ease-smooth ${
          isOpen ? "visible opacity-100" : "invisible pointer-events-none opacity-0"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Employee sign in"
        aria-hidden={!isOpen}
      >
        <div
          className={`w-full max-w-sm rounded-[1.75rem] border border-line bg-white p-7 shadow-float transition-all duration-300 ease-smooth ${
            isOpen ? "translate-y-0 scale-100" : "translate-y-2 scale-[0.98]"
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sage-100 text-sage-700">
              <CircleUserRound size={21} />
            </span>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close sign in"
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-line-strong text-sage-700 transition-colors hover:border-sage-400 hover:bg-sage-50"
            >
              <X size={16} />
            </button>
          </div>

          <p className="mt-5 text-[0.62rem] font-bold uppercase tracking-label text-sage-600">
            Internal use only
          </p>
          <h2 className="mt-1.5 font-display text-2xl text-ink">Employee sign in</h2>
          <p className="mt-1.5 text-sm leading-6 text-ink-muted">
            Sign in with your employee ID and password to open the CRM.
          </p>

          <form className="mt-6 space-y-4" onSubmit={login}>
            <label className="block text-sm font-semibold text-ink">
              Employee ID
              <input
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                autoComplete="username"
                placeholder="Enter your ID"
                required
                className="mt-2 w-full rounded-xl border border-line-strong px-4 py-3 text-sm outline-none transition focus:border-sage-500 focus:ring-4 focus:ring-sage-100"
              />
            </label>
            <label className="block text-sm font-semibold text-ink">
              Password
              <span className="relative mt-2 block">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  required
                  className="w-full rounded-xl border border-line-strong px-4 py-3 pr-11 text-sm outline-none transition focus:border-sage-500 focus:ring-4 focus:ring-sage-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-ink-faint transition hover:bg-sage-50 hover:text-ink-muted"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </span>
            </label>
            {error && (
              <p role="alert" className="rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700">
                {error}
              </p>
            )}
            {wakingServer && (
              <p className="flex items-start gap-2.5 rounded-xl border border-line-gold bg-gold-soft/70 px-3 py-2.5 text-xs leading-5 text-gold-deep">
                <span className="mt-0.5 h-2 w-2 flex-shrink-0 animate-pulse rounded-full bg-gold-deep" aria-hidden="true" />
                <span>Just a moment — connecting. This can take a little longer than usual.</span>
              </p>
            )}
            <button disabled={signingIn} className="btn-primary w-full disabled:opacity-60">
              {signingIn ? (wakingServer ? "Waking up…" : "Signing in…") : "Sign in"}
              <ChevronRight size={16} />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
