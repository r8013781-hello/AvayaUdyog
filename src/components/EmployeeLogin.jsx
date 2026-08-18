import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarClock,
  Check,
  ChevronRight,
  CircleUserRound,
  ClipboardList,
  Eye,
  EyeOff,
  FileText,
  FolderOpen,
  LayoutDashboard,
  Lightbulb,
  Inbox,
  Menu,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UsersRound,
  X,
} from "lucide-react";
import { api, getToken, onSlowRequest, onUnauthorized, setToken } from "../lib/api";
import QuotationWorkspace from "./QuotationWorkspace";
import AdminPanel from "./AdminPanel";
import ProjectsPanel from "./ProjectsPanel";
import LeadDetailsCard from "./LeadDetailsCard";
import { useConfirm, useToast } from "../lib/notifications";
import { Badge, money, Stat } from "../lib/crmUi";

const WEBSITE_REVIEWS = [
  { name: "Mr. Rakesh Tanwani", project: "Apartment interiors", text: "Thoughtful design and meticulous execution.", rating: 5 },
  { name: "Rajesh Kumar", project: "Office transformation", text: "Flawless delivery, on schedule and within scope.", rating: 5 },
  { name: "Anita Patel", project: "Design collaboration", text: "A warm, capable and delightful team.", rating: 5 },
];

export default function EmployeeLogin({ onBackToSite }) {
  const toast = useToast();
  const confirm = useConfirm();
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [signingIn, setSigningIn] = useState(false);
  const [employee, setEmployee] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [view, setView] = useState(() => new URLSearchParams(window.location.search).get("view") || "overview");
  const [leads, setLeads] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [followups, setFollowups] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [query, setQuery] = useState("");
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showFollowupForm, setShowFollowupForm] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [wakingServer, setWakingServer] = useState(false);

  // The backend spins down after inactivity on its current hosting plan — the
  // first request after idle can take 30-60s. Surface that honestly instead
  // of leaving the sign-in button looking frozen.
  useEffect(() => onSlowRequest(() => setWakingServer(true)), []);

  useEffect(() => {
    if (!getToken()) { setCheckingSession(false); return; }
    api.me().then(setEmployee).catch(() => setToken(null)).finally(() => setCheckingSession(false));
  }, []);

  // A token can expire (or be revoked) mid-session — without this, every
  // subsequent API call would just keep failing silently with the user
  // stuck looking "logged in" but unable to do anything. Force them back
  // to a clean sign-in instead.
  useEffect(() => {
    return onUnauthorized(() => {
      if (!getToken()) return;
      setToken(null);
      setEmployee(null);
      toast.warning({ title: "Session expired", message: "Please sign in again to continue." });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (event) => {
    event.preventDefault();
    setSigningIn(true);
    setWakingServer(false);
    setError("");
    try {
      const { token, employee: profile } = await api.login(employeeId.trim(), password);
      setToken(token);
      setEmployee(profile);
      toast.success({ title: `Welcome back, ${profile.name.split(" ")[0]}`, message: profile.isSuperAdmin ? "Signed in as super admin." : "Signed in successfully." });
    } catch (err) {
      setError(err.message || "The employee ID or password is incorrect.");
    } finally {
      setSigningIn(false);
      setWakingServer(false);
    }
  };

  const signOut = () => {
    setToken(null);
    setEmployee(null);
    setLeads([]);
    setCustomers([]);
    setFollowups([]);
    onBackToSite();
  };

  const navigate = (nextView) => {
    const url = new URL(window.location.href);
    url.searchParams.set("view", nextView);
    window.history.pushState({}, "", url);
    setView(nextView);
    setMobileNavOpen(false);
  };

  useEffect(() => {
    const onPopState = () => setView(new URLSearchParams(window.location.search).get("view") || "overview");
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const can = (resource, action) =>
    !!employee && (employee.isSuperAdmin || (employee.permissions?.[resource] || []).includes(action));

  useEffect(() => {
    if (!employee) return;
    let cancelled = false;
    setLoadingData(true);
    Promise.all([
      can("leads", "read") ? api.getLeads() : Promise.resolve([]),
      can("customers", "read") ? api.getCustomers() : Promise.resolve([]),
      can("followups", "read") ? api.getFollowups() : Promise.resolve([]),
      can("projects", "read") ? api.getProjects() : Promise.resolve([]),
    ])
      .then(([leadRows, customerRows, followupRows, projectRows]) => {
        if (cancelled) return;
        setLeads(leadRows);
        setCustomers(customerRows);
        setFollowups(followupRows);
        setProjects(projectRows);
      })
      .catch((err) => {
        // A 401 here already triggers the onUnauthorized handler above (which clears
        // the token synchronously and shows its own clear "session expired" toast) —
        // don't pile a second, more generic error toast on top of that one.
        if (!cancelled && getToken()) toast.error(err.message || "Could not load CRM data.");
      })
      .finally(() => {
        if (!cancelled) setLoadingData(false);
      });
    return () => {
      cancelled = true;
    };
  }, [employee]);

  const filteredLeads = useMemo(() => leads.filter((lead) => `${lead.name} ${lead.project ?? ""} ${lead.stage}`.toLowerCase().includes(query.toLowerCase())), [leads, query]);
  const openValue = leads.filter((l) => l.stage !== "Won" && l.stage !== "Lost").reduce((sum, l) => sum + Number(l.value || 0), 0);
  const dueTasks = followups.filter((item) => !item.done);
  const topPriorityTask = dueTasks[0];

  if (checkingSession) return <div className="flex min-h-screen items-center justify-center bg-sage-950 text-sm font-semibold text-sage-100">Restoring your session…</div>;

  if (!employee) return (
    <div className="min-h-screen bg-sage-950 px-4 py-10 text-white sm:px-6">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-[0_25px_80px_rgba(0,0,0,.28)] lg:grid-cols-[1.05fr_.95fr]">
        <section className="flex flex-col justify-between bg-[linear-gradient(145deg,#1f5137,#14271b)] p-8 md:p-12">
          <div><button onClick={onBackToSite} className="inline-flex items-center gap-2 text-sm text-sage-100/80 transition hover:text-white"><ArrowLeft size={16} /> Back to website</button><p className="mt-16 text-[0.65rem] font-bold uppercase tracking-[.24em] text-gold-light">Employee workspace</p><h1 className="mt-5 max-w-md font-display text-4xl leading-tight md:text-5xl">Every client relationship, clearly in view.</h1><p className="mt-5 max-w-md text-sm leading-7 text-sage-100/75">Manage design enquiries, active customers and every important follow-up from one focused workspace.</p></div>
          <p className="mt-12 text-xs text-sage-200/60">Avaya Udyog · Employee Portal</p>
        </section>
        <section className="flex items-center bg-white p-8 text-ink md:p-12"><div className="w-full"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sage-100 text-sage-700"><CircleUserRound size={24} /></div><p className="mt-8 text-[0.65rem] font-bold uppercase tracking-label text-sage-600">Secure sign in</p><h2 className="mt-3 font-display text-3xl">Welcome back</h2><p className="mt-2 text-sm leading-6 text-ink-muted">Sign in with your employee ID and password.</p>
          <form className="mt-8 space-y-5" onSubmit={login}><label className="block text-sm font-semibold">Employee ID<input value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} autoComplete="username" placeholder="Enter your ID" className="mt-2 w-full rounded-xl border border-line-strong px-4 py-3 text-sm outline-none transition focus:border-sage-500 focus:ring-4 focus:ring-sage-100" /></label><label className="block text-sm font-semibold">Password<span className="relative mt-2 block"><input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" placeholder="Enter your password" className="w-full rounded-xl border border-line-strong px-4 py-3 pr-11 text-sm outline-none transition focus:border-sage-500 focus:ring-4 focus:ring-sage-100" /><button type="button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-ink-faint transition hover:bg-sage-50 hover:text-ink-muted">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></span></label>{error && <p className="rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</p>}{wakingServer && <p className="rounded-xl bg-gold-soft px-3 py-2.5 text-xs leading-5 text-gold-deep">Waking up the server — this can take up to a minute on the first sign-in after a while. Hang tight.</p>}<button disabled={signingIn} className="btn-primary w-full disabled:opacity-60">{signingIn ? (wakingServer ? "Waking up…" : "Signing in…") : "Sign in"} <ChevronRight size={16} /></button></form>
          </div></section>
      </div>
    </div>
  );

  const navigation = [
    ["overview", "Overview", LayoutDashboard, true],
    ["leads", "Leads", UsersRound, can("leads", "read")],
    ["customers", "Customers", CircleUserRound, can("customers", "read")],
    ["projects", "Projects", FolderOpen, can("projects", "read")],
    ["quotations", "Quotations", FileText, can("quotations", "read")],
    ["followups", "Follow-ups", CalendarClock, can("followups", "read")],
    ["inbox", "Website inbox", Inbox, can("leads", "read")],
    ["team", "Team & access", ShieldCheck, employee.isSuperAdmin],
  ].filter(([, , , visible]) => visible);

  const addCustomer = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const created = await api.createCustomer({
        name: form.get("name"),
        phone: form.get("phone"),
        email: form.get("email") || "",
        address: form.get("address") || "",
        city: form.get("city") || "",
        companyName: form.get("companyName") || "",
        gstin: form.get("gstin") || "",
      });
      setCustomers((prev) => [created, ...prev]);
      setShowCustomerForm(false);
      toast.success({ title: "Customer added", message: `${created.name} is now on your customer list.` });
    } catch (err) {
      toast.error(err.message || "Could not create the customer.");
    }
  };

  const addLead = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const created = await api.createLead({
        name: form.get("name"),
        phone: form.get("phone"),
        project: form.get("project"),
        source: form.get("source"),
        value: Number(form.get("value")),
        nextActionDate: form.get("next") || null,
      });
      setLeads((prev) => [created, ...prev]);
      setShowLeadForm(false);
      toast.success({ title: "Lead added", message: `${created.name} is now in your pipeline.` });
    } catch (err) {
      toast.error(err.message || "Could not create the lead.");
    }
  };

  const addFollowup = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const created = await api.createFollowup({
        contact: form.get("contact"),
        type: form.get("type"),
        dueDate: form.get("due"),
        dueTime: form.get("time"),
        note: form.get("note"),
      });
      setFollowups((prev) => [...prev, created]);
      setShowFollowupForm(false);
      toast.success({ title: "Follow-up scheduled", message: `Reminder set for ${created.contact}.` });
    } catch (err) {
      toast.error(err.message || "Could not schedule the follow-up.");
    }
  };

  const complete = async (item) => {
    try {
      const updated = await api.setFollowupDone(item.id, !item.done);
      setFollowups((prev) => prev.map((f) => (f.id === item.id ? updated : f)));
      toast.success(updated.done ? "Marked as complete." : "Reopened — back on your queue.", { duration: 2400 });
    } catch (err) {
      toast.error(err.message || "Could not update the follow-up.");
    }
  };

  const DELETE_LABELS = { lead: "lead", customer: "customer", followup: "follow-up" };
  const DELETERS = {
    lead: (id) => api.deleteLead(id).then(() => setLeads((prev) => prev.filter((r) => r.id !== id))),
    customer: (id) => api.deleteCustomer(id).then(() => setCustomers((prev) => prev.filter((r) => r.id !== id))),
    followup: (id) => api.deleteFollowup(id).then(() => setFollowups((prev) => prev.filter((r) => r.id !== id))),
  };

  const removeRecord = async (kind, id, name) => {
    const label = DELETE_LABELS[kind];
    const ok = await confirm({
      title: `Delete this ${label}?`,
      message: name ? `"${name}" will be permanently removed. This cannot be undone.` : "This cannot be undone.",
      confirmText: "Delete permanently",
      danger: true,
    });
    if (!ok) return;
    try {
      await DELETERS[kind](id);
      toast.success(`${label.charAt(0).toUpperCase()}${label.slice(1)} deleted.`);
    } catch (err) {
      toast.error(err.message || `Could not delete this ${label}.`);
    }
  };

  return <div className="min-h-screen bg-canvas text-ink"><div className="flex min-h-screen">
    <aside className="hidden w-64 shrink-0 flex-col bg-sage-950 p-5 text-white lg:flex"><button onClick={() => navigate("overview")} className="text-left font-display text-xl">Avaya <span className="text-gold-light">Udyog</span><span className="mt-1 block font-sans text-[.6rem] font-bold uppercase tracking-label text-sage-300">Internal CRM</span></button><nav className="mt-12 space-y-1">{navigation.map(([id, label, Icon]) => <button key={id} onClick={() => navigate(id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${view === id ? "bg-white/12 text-white" : "text-sage-200/70 hover:bg-white/5 hover:text-white"}`}><Icon size={17} />{label}</button>)}</nav><div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4"><p className="font-semibold text-sm">{employee.name}</p><p className="mt-1 text-xs text-sage-300">{employee.role}</p><button onClick={signOut} className="mt-4 text-xs font-bold uppercase tracking-label text-gold-light">Sign out</button></div></aside>
    <main className="min-w-0 flex-1"><header className="flex items-center justify-between border-b border-line bg-white px-5 py-4 md:px-8"><div><p className="text-[.62rem] font-bold uppercase tracking-label text-sage-600">{navigation.find(([id]) => id === view)?.[1]}</p><h1 className="mt-1 font-display text-2xl">Good morning, {employee.name.split(" ")[0]}</h1></div><button onClick={() => setMobileNavOpen(true)} aria-label="Open menu" className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink-soft lg:hidden"><Menu size={19} /></button></header>
      <div className="mx-auto max-w-7xl p-5 md:p-8">
        {loadingData ? <p className="text-sm text-ink-muted">Loading CRM data…</p> : <>
        {view === "overview" && <><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Stat label="Open pipeline" value={money.format(openValue)} hint={`${leads.length} active opportunities`} icon={ClipboardList} /><Stat label="New leads" value={leads.filter((l) => l.stage === "New").length} hint="Require first contact" icon={UsersRound} /><Stat label="Today’s tasks" value={dueTasks.length} hint="Follow-ups not completed" icon={CalendarClock} /><Stat label="Active customers" value={customers.length} hint="Across design and execution" icon={CircleUserRound} /></div><div className="mt-7 grid gap-6 xl:grid-cols-[1.3fr_.7fr]"><section className="rounded-2xl border border-line bg-white p-5 shadow-hair"><div className="flex items-center justify-between"><div><p className="text-[.62rem] font-bold uppercase tracking-label text-sage-600">Pipeline</p><h2 className="mt-1 font-display text-xl">Priority opportunities</h2></div><button onClick={() => setView("leads")} className="text-xs font-bold text-sage-700">View all</button></div><div className="mt-4 divide-y divide-line">{leads.slice(0, 4).map((lead) => <div key={lead.id} className="flex items-center justify-between gap-3 py-3"><div><p className="font-semibold text-sm">{lead.name}</p><p className="mt-1 text-xs text-ink-muted">{lead.project || "—"} · Next: {lead.nextActionDate ? lead.nextActionDate.slice(0, 10) : "—"}</p></div><div className="text-right"><Badge type={lead.stage}>{lead.stage}</Badge><p className="mt-1 text-xs font-semibold">{money.format(lead.value || 0)}</p></div></div>)}{!leads.length && <p className="py-6 text-center text-sm text-ink-muted">No leads yet.</p>}</div></section><section className="rounded-2xl border border-gold/30 bg-gold-soft p-5"><div className="flex items-center gap-2 text-sage-800"><Lightbulb size={18} /><p className="text-[.62rem] font-bold uppercase tracking-label">Smart focus</p></div><h2 className="mt-3 font-display text-xl">Protect today’s momentum.</h2><p className="mt-3 text-sm leading-6 text-ink-soft">{dueTasks.length} conversations need attention.{topPriorityTask ? ` Start with ${topPriorityTask.contact}'s ${topPriorityTask.type.toLowerCase()}.` : ""}</p><button onClick={() => setView("followups")} className="mt-5 text-xs font-bold text-sage-800">Open follow-up queue <ChevronRight className="inline" size={14} /></button></section></div></>}
        {view === "leads" && <><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h2 className="font-display text-3xl">Leads</h2><p className="mt-1 text-sm text-ink-muted">Track every enquiry from first contact to conversion.</p></div>{can("leads", "create") && <button onClick={() => setShowLeadForm(true)} className="btn-primary"><Plus size={16} /> Add lead</button>}</div><div className="mt-6 rounded-2xl border border-line bg-white shadow-hair"><div className="flex items-center gap-3 border-b border-line p-4"><Search size={17} className="text-ink-muted" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by person, project or stage" className="w-full text-sm outline-none" /></div><div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-sage-50 text-[.62rem] uppercase tracking-label text-ink-muted"><tr>{["Lead", "Project", "Stage", "Value", "Next action", ""].map((x) => <th key={x} className="px-5 py-3.5 font-bold">{x}</th>)}</tr></thead><tbody>{filteredLeads.map((lead) => <tr key={lead.id} onClick={() => setSelectedLead(lead)} className="cursor-pointer border-t border-line transition hover:bg-sage-50/50"><td className="px-5 py-4"><p className="font-semibold">{lead.name}</p><p className="mt-1 text-xs text-ink-muted">{lead.source} · {lead.phone}</p></td><td className="px-5 py-4 text-ink-soft">{lead.project || "—"}</td><td className="px-5 py-4"><Badge type={lead.stage}>{lead.stage}</Badge></td><td className="px-5 py-4 font-semibold">{money.format(lead.value || 0)}</td><td className="px-5 py-4 text-ink-soft">{lead.nextActionDate ? lead.nextActionDate.slice(0, 10) : "—"}</td><td className="px-5 py-4 text-right">{can("leads", "delete") && <button onClick={(e) => { e.stopPropagation(); removeRecord("lead", lead.id, lead.name); }} aria-label="Delete lead" className="text-red-500 hover:text-red-700"><Trash2 size={15} /></button>}</td></tr>)}</tbody></table>{!filteredLeads.length && <p className="p-6 text-center text-sm text-ink-muted">No leads match.</p>}</div></div></>}
        {view === "customers" && <><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h2 className="font-display text-3xl">Customers</h2><p className="mt-1 text-sm text-ink-muted">A live view of every current Avaya Udyog customer.</p></div>{can("customers", "create") && <button onClick={() => setShowCustomerForm(true)} className="btn-primary"><Plus size={16} /> Add customer</button>}</div><div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{customers.map((customer) => <article key={customer.id} className="rounded-2xl border border-line bg-white p-5 shadow-hair"><div className="flex items-start justify-between"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-sage-100 font-display text-lg text-sage-700">{customer.name[0]}</span><div className="flex items-center gap-2"><Badge type={customer.phase}>{customer.phase}</Badge>{can("customers", "delete") && <button onClick={() => removeRecord("customer", customer.id, customer.name)} aria-label="Delete customer" className="text-red-500 hover:text-red-700"><Trash2 size={15} /></button>}</div></div><h3 className="mt-5 font-display text-xl">{customer.name}</h3><p className="mt-1 text-sm text-ink-muted">{customer.project}</p><div className="mt-5 flex justify-between border-t border-line pt-4 text-xs"><span className="text-ink-muted">{customer.owner || "Unassigned"}</span><span className="font-bold text-sage-700">{money.format(customer.value || 0)}</span></div></article>)}{!customers.length && <p className="text-sm text-ink-muted">No customers yet.</p>}</div></>}
        {view === "followups" && <><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h2 className="font-display text-3xl">Follow-ups</h2><p className="mt-1 text-sm text-ink-muted">Keep promises visible and make every client feel remembered.</p></div>{can("followups", "create") && <button onClick={() => setShowFollowupForm(true)} className="btn-primary"><Plus size={16} /> Schedule follow-up</button>}</div><div className="mt-6 space-y-3">{[...followups].sort((a, b) => a.done - b.done).map((item) => <article key={item.id} className={`flex items-start gap-4 rounded-2xl border p-5 ${item.done ? "border-line bg-sage-50/50 opacity-65" : "border-line bg-white shadow-hair"}`}><button onClick={() => complete(item)} aria-label="Mark follow-up complete" className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${item.done ? "border-sage-600 bg-sage-600 text-white" : "border-sage-300 text-transparent"}`}><Check size={14} /></button><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className={`font-semibold ${item.done ? "line-through" : ""}`}>{item.contact}</h3><Badge type="Qualified">{item.type}</Badge></div><p className="mt-2 text-sm text-ink-muted">{item.note}</p></div><div className="shrink-0 text-right text-xs"><p className="font-bold text-sage-700">{item.dueDate ? item.dueDate.slice(0, 10) : "—"}</p><p className="mt-1 text-ink-muted">{item.dueTime}</p>{can("followups", "delete") && <button onClick={() => removeRecord("followup", item.id, item.contact)} aria-label="Delete follow-up" className="mt-2 text-red-500 hover:text-red-700"><Trash2 size={14} /></button>}</div></article>)}{!followups.length && <p className="text-sm text-ink-muted">No follow-ups scheduled.</p>}</div></>}
        {view === "inbox" && <WebsiteInbox leads={leads} reviews={WEBSITE_REVIEWS} onOpenLeads={() => setView("leads")} />}
        {view === "projects" && <ProjectsPanel projects={projects} setProjects={setProjects} customers={customers} can={can} />}
        {view === "quotations" && <QuotationWorkspace customers={customers} projects={projects} canCreate={can("quotations", "create")} canEdit={can("quotations", "update")} canDelete={can("quotations", "delete")} />}
        {view === "team" && employee.isSuperAdmin && <AdminPanel currentEmployee={employee} />}
        </>}
      </div>
    </main></div>
    {mobileNavOpen && (
      <div className="fixed inset-0 z-[90] lg:hidden">
        <button aria-label="Close menu" className="absolute inset-0 bg-sage-950/50 backdrop-blur-sm" onClick={() => setMobileNavOpen(false)} />
        <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-sage-950 p-5 text-white shadow-float">
          <div className="flex items-center justify-between">
            <span className="text-left font-display text-xl">Avaya <span className="text-gold-light">Udyog</span></span>
            <button onClick={() => setMobileNavOpen(false)} aria-label="Close menu" className="rounded-full p-2 text-sage-200 hover:bg-white/10"><X size={18} /></button>
          </div>
          <nav className="mt-8 space-y-1">{navigation.map(([id, label, Icon]) => <button key={id} onClick={() => navigate(id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${view === id ? "bg-white/12 text-white" : "text-sage-200/70 hover:bg-white/5 hover:text-white"}`}><Icon size={17} />{label}</button>)}</nav>
          <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4"><p className="font-semibold text-sm">{employee.name}</p><p className="mt-1 text-xs text-sage-300">{employee.role}</p><button onClick={signOut} className="mt-4 text-xs font-bold uppercase tracking-label text-gold-light">Sign out</button></div>
        </aside>
      </div>
    )}
    {(showLeadForm || showFollowupForm) && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-sage-950/45 p-4 backdrop-blur-sm"><form onSubmit={showLeadForm ? addLead : addFollowup} className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-float"><div className="flex items-center justify-between"><div><p className="text-[.62rem] font-bold uppercase tracking-label text-sage-600">CRM record</p><h2 className="mt-1 font-display text-2xl">{showLeadForm ? "Add new lead" : "Schedule follow-up"}</h2></div><button type="button" onClick={() => { setShowLeadForm(false); setShowFollowupForm(false); }} className="rounded-full p-2 text-ink-muted hover:bg-sage-50"><X size={18} /></button></div>{showLeadForm ? <div className="mt-6 grid gap-4 sm:grid-cols-2"><Field label="Client name" name="name" required /><Field label="Phone" name="phone" required /><Field label="Project" name="project" required /><Select label="Source" name="source" options={["Website", "Instagram", "Referral", "Walk-in"]} /><Field label="Estimated value" name="value" type="number" required /><Field label="Next follow-up" name="next" type="date" required /></div> : <div className="mt-6 grid gap-4 sm:grid-cols-2"><Field label="Contact" name="contact" required /><Select label="Type" name="type" options={["Call", "Site update", "Consultation", "Proposal review"]} /><Field label="Due date" name="due" type="date" required /><Field label="Time" name="time" type="time" required /><label className="sm:col-span-2 text-sm font-semibold">Note<textarea name="note" required rows="3" className="mt-2 w-full rounded-xl border border-line-strong p-3 text-sm outline-none focus:border-sage-500" /></label></div>}<button className="btn-primary mt-6 w-full">{showLeadForm ? "Create lead" : "Add to follow-up queue"}</button></form></div>}
    {showCustomerForm && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-sage-950/45 p-4 backdrop-blur-sm"><form onSubmit={addCustomer} className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-float"><div className="flex items-center justify-between"><div><p className="text-[.62rem] font-bold uppercase tracking-label text-sage-600">CRM record</p><h2 className="mt-1 font-display text-2xl">New Customer</h2></div><button type="button" onClick={() => setShowCustomerForm(false)} className="rounded-full p-2 text-ink-muted hover:bg-sage-50"><X size={18} /></button></div><div className="mt-6 grid gap-4 sm:grid-cols-2"><Field label="Name" name="name" required /><Field label="Phone" name="phone" required /><Field label="Email" name="email" type="email" /><Field label="Company Name" name="companyName" /><Field label="Address" name="address" /><Field label="City" name="city" /><Field label="GSTIN" name="gstin" /></div><button className="btn-primary mt-6 w-full">Register Customer</button></form></div>}
    {selectedLead && <LeadDetailsCard lead={selectedLead} onClose={() => setSelectedLead(null)} canDelete={can("leads", "delete")} onDelete={(lead) => removeRecord("lead", lead.id, lead.name)} />}
  </div>;
}

function Field({ label, name, type = "text", required = false }) { return <label className="text-sm font-semibold">{label}<input name={name} type={type} required={required} className="mt-2 w-full rounded-xl border border-line-strong px-3 py-2.5 text-sm font-normal outline-none focus:border-sage-500" /></label>; }
function Select({ label, name, options }) { return <label className="text-sm font-semibold">{label}<select name={name} className="mt-2 w-full rounded-xl border border-line-strong bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-sage-500">{options.map((option) => <option key={option}>{option}</option>)}</select></label>; }

function WebsiteInbox({ leads, reviews, onOpenLeads }) {
  const websiteLeads = leads.filter((lead) => ["Website", "Website enquiry", "Consultation request"].includes(lead.source));
  return <>
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><h2 className="font-display text-3xl">Website inbox</h2><p className="mt-1 text-sm text-ink-muted">Enquiries and consultation requests submitted through the public website.</p></div><button onClick={onOpenLeads} className="rounded-full border border-line-strong px-4 py-2 text-xs font-bold text-sage-700">Open all leads</button></div>
    <section className="mt-6 overflow-hidden rounded-2xl border border-line bg-white shadow-hair"><div className="flex items-center justify-between border-b border-line p-5"><div><p className="text-[.62rem] font-bold uppercase tracking-label text-sage-600">Automatic capture</p><h3 className="mt-1 font-display text-xl">Enquiries & consultations</h3></div><span className="rounded-full bg-sage-100 px-3 py-1 text-xs font-bold text-sage-700">{websiteLeads.length} received</span></div>{websiteLeads.length ? <div className="divide-y divide-line">{websiteLeads.map((lead) => <article key={lead.id} className="flex flex-col justify-between gap-3 p-5 md:flex-row"><div><div className="flex flex-wrap items-center gap-2"><h4 className="font-semibold">{lead.name}</h4><Badge type={lead.stage}>{lead.stage}</Badge><span className="text-xs text-ink-muted">{lead.source}</span></div><p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">{lead.message || lead.project || "No project description provided."}</p><p className="mt-3 text-xs text-ink-muted">{[lead.phone, lead.email, lead.city].filter(Boolean).join(" · ")}</p></div><p className="shrink-0 text-xs font-semibold text-sage-700">{lead.createdAt ? new Date(lead.createdAt).toLocaleDateString("en-IN") : "New"}</p></article>)}</div> : <p className="p-8 text-center text-sm text-ink-muted">New form submissions will appear here automatically.</p>}</section>
    <section className="mt-7"><p className="text-[.62rem] font-bold uppercase tracking-label text-sage-600">People reviews</p><div className="mt-3 grid gap-4 md:grid-cols-3">{reviews.map((review) => <article key={review.name} className="rounded-2xl border border-line bg-white p-5 shadow-hair"><div className="flex items-center justify-between"><p className="font-semibold">{review.name}</p><span className="text-sm text-gold">{"★".repeat(review.rating)}</span></div><p className="mt-3 text-sm leading-6 text-ink-soft">{review.text}</p><p className="mt-4 border-t border-line pt-3 text-xs text-ink-muted">{review.project} · Published</p></article>)}</div></section>
  </>;
}
