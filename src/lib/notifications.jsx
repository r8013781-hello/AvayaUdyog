import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Info, ShieldAlert, X, XCircle } from "lucide-react";

/* ---------------------------------------------------------------------- */
/* Toasts                                                                  */
/* ---------------------------------------------------------------------- */

const ToastContext = createContext(null);

const TOAST_STYLES = {
  success: { icon: CheckCircle2, ring: "ring-sage-200", bar: "bg-sage-500", iconColor: "text-sage-600", iconBg: "bg-sage-50" },
  error: { icon: XCircle, ring: "ring-red-200", bar: "bg-red-500", iconColor: "text-red-600", iconBg: "bg-red-50" },
  warning: { icon: AlertTriangle, ring: "ring-gold/40", bar: "bg-gold-deep", iconColor: "text-gold-deep", iconBg: "bg-gold-soft" },
  info: { icon: Info, ring: "ring-sage-200", bar: "bg-sage-700", iconColor: "text-sage-700", iconBg: "bg-sage-50" },
};

function ToastCard({ toast, onDismiss }) {
  const style = TOAST_STYLES[toast.type] || TOAST_STYLES.info;
  const Icon = style.icon;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.9, transition: { duration: 0.18 } }}
      transition={{ type: "spring", stiffness: 420, damping: 32 }}
      className={`pointer-events-auto relative flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-2xl bg-white/95 p-4 pr-9 shadow-float ring-1 backdrop-blur ${style.ring}`}
      role="status"
    >
      <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${style.iconBg} ${style.iconColor}`}>
        <Icon size={16} />
      </span>
      <div className="min-w-0 flex-1">
        {toast.title && <p className="text-sm font-bold text-ink">{toast.title}</p>}
        {toast.message && <p className={`text-sm leading-5 text-ink-soft ${toast.title ? "mt-0.5" : ""}`}>{toast.message}</p>}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        className="absolute right-2.5 top-2.5 rounded-full p-1 text-ink-faint transition hover:bg-sage-50 hover:text-ink-muted"
      >
        <X size={14} />
      </button>
      {toast.duration > 0 && (
        <motion.span
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: toast.duration / 1000, ease: "linear" }}
          className={`absolute bottom-0 left-0 h-[3px] w-full origin-left ${style.bar}`}
        />
      )}
    </motion.div>
  );
}

function ToastViewport({ toasts, onDismiss }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[200] flex flex-col items-end gap-2.5 p-4 sm:bottom-5 sm:right-5 sm:p-0">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
  }, []);

  const push = useCallback((type, message, opts = {}) => {
    const id = `t-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const duration = opts.duration ?? (type === "error" ? 6000 : 4200);
    const title = typeof message === "object" ? message.title : opts.title;
    const body = typeof message === "object" ? message.message : message;
    setToasts((prev) => [...prev.slice(-3), { id, type, title, message: body, duration }]);
    if (duration > 0) timers.current.set(id, setTimeout(() => dismiss(id), duration));
    return id;
  }, [dismiss]);

  const api = useMemo(
    () => ({
      success: (message, opts) => push("success", message, opts),
      error: (message, opts) => push("error", message, opts),
      warning: (message, opts) => push("warning", message, opts),
      info: (message, opts) => push("info", message, opts),
      dismiss,
    }),
    [push, dismiss],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}

/* ---------------------------------------------------------------------- */
/* Confirm dialog — promise-based replacement for window.confirm          */
/* ---------------------------------------------------------------------- */

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [request, setRequest] = useState(null);

  const confirm = useCallback(
    (opts) =>
      new Promise((resolve) => {
        setRequest({
          title: opts?.title || "Are you sure?",
          message: opts?.message || "",
          confirmText: opts?.confirmText || "Confirm",
          cancelText: opts?.cancelText || "Cancel",
          danger: opts?.danger ?? false,
          resolve,
        });
      }),
    [],
  );

  const settle = (result) => {
    request?.resolve(result);
    setRequest(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AnimatePresence>
        {request && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[210] flex items-center justify-center bg-sage-950/50 p-4 backdrop-blur-sm"
            onClick={() => settle(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-float"
            >
              <span className={`flex h-11 w-11 items-center justify-center rounded-full ${request.danger ? "bg-red-50 text-red-600" : "bg-sage-50 text-sage-700"}`}>
                {request.danger ? <ShieldAlert size={20} /> : <AlertTriangle size={20} />}
              </span>
              <h3 className="mt-4 font-display text-xl text-ink">{request.title}</h3>
              {request.message && <p className="mt-2 text-sm leading-6 text-ink-muted">{request.message}</p>}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => settle(false)}
                  className="flex-1 rounded-full border border-line-strong px-4 py-2.5 text-sm font-bold text-ink-soft transition hover:bg-sage-50"
                >
                  {request.cancelText}
                </button>
                <button
                  onClick={() => settle(true)}
                  className={`flex-1 rounded-full px-4 py-2.5 text-sm font-bold text-white transition ${request.danger ? "bg-red-600 hover:bg-red-700" : "bg-sage-fill hover:brightness-105"}`}
                >
                  {request.confirmText}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within a ConfirmProvider");
  return ctx;
}

export function NotificationsProvider({ children }) {
  return (
    <ToastProvider>
      <ConfirmProvider>{children}</ConfirmProvider>
    </ToastProvider>
  );
}
