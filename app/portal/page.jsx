"use client";

import { useRouter } from "next/navigation";
import EmployeeLogin from "../../components/crm/EmployeeLogin";
import { NotificationsProvider } from "../../lib/crm/notifications";

// This is intentionally NOT a rewrite. EmployeeLogin (and everything it
// pulls in — AdminPanel, ProjectsPanel, QuotationWorkspace, the CRM's own
// api client, the toast/confirm system, PDF export) is the exact same
// component tree that ran inside the old Vite app's App.jsx, copied
// unchanged apart from import paths and the one Vite-specific env var
// access. Its internal ?view=leads / ?view=projects / etc. navigation
// still works exactly as before — EmployeeLogin manages that itself via
// window.location.search + history.pushState, none of which this page
// needs to touch. No manual lazy()/Suspense here (unlike the old
// App.jsx) — Next already code-splits /portal's bundle away from /'s
// automatically, per-route, without needing to ask for it.
//
// NotificationsProvider (toast/confirm, uses framer-motion) is scoped to
// just this route, not the whole app — the marketing pages never needed
// it, so it never ships to them.
export default function PortalPage() {
  const router = useRouter();

  return (
    <NotificationsProvider>
      <EmployeeLogin onBackToSite={() => router.push("/")} />
    </NotificationsProvider>
  );
}
