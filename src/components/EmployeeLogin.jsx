import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarClock,
  Check,
  ChevronRight,
  CircleUserRound,
  ClipboardList,
  FileText,
  FolderOpen,
  LayoutDashboard,
  Lightbulb,
  Inbox,
  Plus,
  Search,
  UsersRound,
  X,
} from "lucide-react";
import { api, getToken, setToken } from "../lib/api";
import QuotationWorkspace from "./QuotationWorkspace";

const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const stageClasses = {
  New: "bg-blue-50 text-blue-700 ring-blue-200",
  Qualified: "bg-violet-50 text-violet-700 ring-violet-200",
  Consultation: "bg-amber-50 text-amber-700 ring-amber-200",
  Proposal: "bg-orange-50 text-orange-700 ring-orange-200",
  Execution: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  "Design approval": "bg-sage-100 text-sage-700 ring-sage-200",
  Handover: "bg-teal-50 text-teal-700 ring-teal-200",
};

const WEBSITE_REVIEWS = [
  { name: "Mr. Rakesh Tanwani", project: "Apartment interiors", text: "Thoughtful design and meticulous execution.", rating: 5 },
  { name: "Rajesh Kumar", project: "Office transformation", text: "Flawless delivery, on schedule and within scope.", rating: 5 },
  { name: "Anita Patel", project: "Design collaboration", text: "A warm, capable and delightful team.", rating: 5 },
];

function Badge({ children, type = "New" }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[0.65rem] font-bold ring-1 ring-inset ${stageClasses[type] || stageClasses.New}`}>{children}</span>;
}

function Stat({ label, value, hint, icon: Icon }) {
  return <div className="rounded-2xl border border-line bg-white p-5 shadow-hair"><div className="flex items-start justify-between"><div><p className="text-[0.62rem] font-bold uppercase tracking-label text-ink-muted">{label}</p><p className="mt-2 text-2xl font-semibold text-ink">{value}</p></div><span className="rounded-xl bg-sage-50 p-2.5 text-sage-600"><Icon size={18} /></span></div><p className="mt-3 text-xs text-ink-muted">{hint}</p></div>;
}

export default function EmployeeLogin({ onBackToSite }) {
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
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
  const [dataError, setDataError] = useState("");
  const [query, setQuery] = useState("");
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showFollowupForm, setShowFollowupForm] = useState(false);

  useEffect(() => {
    if (!getToken()) { setCheckingSession(false); return; }
    api.me().then(setEmployee).catch(() => setToken(null)).finally(() => setCheckingSession(false));
  }, []);

  const login = async (event) => {
    event.preventDefault();
    setSigningIn(true);
    setError("");
    try {
      const { token, employee: profile } = await api.login(employeeId.trim(), password);
      setToken(token);
      setEmployee(profile);
    } catch (err) {
      setError(err.message || "The employee ID or password is incorrect.");
    } finally {
      setSigningIn(false);
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
  };

  useEffect(() => {
    const onPopState = () => setView(new URLSearchParams(window.location.search).get("view") || "overview");
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (!employee) return;
    let cancelled = false;
    setLoadingData(true);
    setDataError("");
    Promise.all([api.getLeads(), api.getCustomers(), api.getFollowups(), api.getProjects()])
      .then(([leadRows, customerRows, followupRows, projectRows]) => {
        if (cancelled) return;
        setLeads(leadRows);
        setCustomers(customerRows);
        setFollowups(followupRows);
        setProjects(projectRows);
      })
      .catch((err) => {
        if (!cancelled) setDataError(err.message || "Could not load CRM data.");
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

  if (checkingSession) return <div className="flex min-h-screen items-center justify-center bg-sage-950 text-sm font-semibold text-sage-100">Restoring your CRM session…</div>;

  if (!employee) return (
    <div className="min-h-screen bg-sage-950 px-4 py-10 text-white sm:px-6">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-[0_25px_80px_rgba(0,0,0,.28)] lg:grid-cols-[1.05fr_.95fr]">
        <section className="flex flex-col justify-between bg-[linear-gradient(145deg,#1f5137,#14271b)] p-8 md:p-12">
          <div><button onClick={onBackToSite} className="inline-flex items-center gap-2 text-sm text-sage-100/80 transition hover:text-white"><ArrowLeft size={16} /> Back to website</button><p className="mt-16 text-[0.65rem] font-bold uppercase tracking-[.24em] text-gold-light">Employee workspace</p><h1 className="mt-5 max-w-md font-display text-4xl leading-tight md:text-5xl">Every client relationship, clearly in view.</h1><p className="mt-5 max-w-md text-sm leading-7 text-sage-100/75">Manage design enquiries, active customers and every important follow-up from one focused workspace.</p></div>
          <p className="mt-12 text-xs text-sage-200/60">Avaya Udyog · Internal CRM</p>
        </section>
        <section className="flex items-center bg-white p-8 text-ink md:p-12"><div className="w-full"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sage-100 text-sage-700"><CircleUserRound size={24} /></div><p className="mt-8 text-[0.65rem] font-bold uppercase tracking-label text-sage-600">Secure sign in</p><h2 className="mt-3 font-display text-3xl">Welcome back</h2><p className="mt-2 text-sm leading-6 text-ink-muted">Sign in with your employee ID and password.</p>
          <form className="mt-8 space-y-5" onSubmit={login}><label className="block text-sm font-semibold">Employee ID<input value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} autoComplete="username" placeholder="Enter your ID" className="mt-2 w-full rounded-xl border border-line-strong px-4 py-3 text-sm outline-none transition focus:border-sage-500 focus:ring-4 focus:ring-sage-100" /></label><label className="block text-sm font-semibold">Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" placeholder="Enter your password" className="mt-2 w-full rounded-xl border border-line-strong px-4 py-3 text-sm outline-none transition focus:border-sage-500 focus:ring-4 focus:ring-sage-100" /></label>{error && <p className="rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</p>}<button disabled={signingIn} className="btn-primary w-full disabled:opacity-60">{signingIn ? "Signing in…" : "Sign in to CRM"} <ChevronRight size={16} /></button></form>
          </div></section>
      </div>
    </div>
  );

  const navigation = [["overview", "Overview", LayoutDashboard], ["leads", "Leads", UsersRound], ["customers", "Customers", CircleUserRound], ["projects", "Projects", FolderOpen], ["quotations", "Quotations", FileText], ["followups", "Follow-ups", CalendarClock], ["inbox", "Website inbox", Inbox]];

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
    } catch (err) {
      setDataError(err.message || "Could not create the customer.");
    }
  };

  const addProject = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const created = await api.createProject({
        customerId: Number(form.get("customerId")),
        name: form.get("name"),
        projectType: form.get("projectType"),
        siteAddress: form.get("siteAddress"),
        city: form.get("city") || "",
        areaSqft: Number(form.get("areaSqft")) || null,
        budget: Number(form.get("budget")) || null,
        startDate: form.get("startDate") || null,
        targetDate: form.get("targetDate") || null,
        scope: form.get("scope") || "",
      });
      setProjects((prev) => [created, ...prev]);
      setShowProjectForm(false);
    } catch (err) {
      setDataError(err.message || "Could not create the project.");
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
    } catch (err) {
      setDataError(err.message || "Could not create the lead.");
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
    } catch (err) {
      setDataError(err.message || "Could not schedule the follow-up.");
    }
  };

  const complete = async (item) => {
    try {
      const updated = await api.setFollowupDone(item.id, !item.done);
      setFollowups((prev) => prev.map((f) => (f.id === item.id ? updated : f)));
    } catch (err) {
      setDataError(err.message || "Could not update the follow-up.");
    }
  };

  return <div className="min-h-screen bg-canvas text-ink"><div className="flex min-h-screen">
    <aside className="hidden w-64 shrink-0 flex-col bg-sage-950 p-5 text-white lg:flex"><button onClick={() => navigate("overview")} className="text-left font-display text-xl">Avaya <span className="text-gold-light">Udyog</span><span className="mt-1 block font-sans text-[.6rem] font-bold uppercase tracking-label text-sage-300">Internal CRM</span></button><nav className="mt-12 space-y-1">{navigation.map(([id, label, Icon]) => <button key={id} onClick={() => navigate(id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${view === id ? "bg-white/12 text-white" : "text-sage-200/70 hover:bg-white/5 hover:text-white"}`}><Icon size={17} />{label}</button>)}</nav><div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4"><p className="font-semibold text-sm">{employee.name}</p><p className="mt-1 text-xs text-sage-300">{employee.role}</p><button onClick={signOut} className="mt-4 text-xs font-bold uppercase tracking-label text-gold-light">Sign out</button></div></aside>
    <main className="min-w-0 flex-1"><header className="flex items-center justify-between border-b border-line bg-white px-5 py-4 md:px-8"><div><p className="text-[.62rem] font-bold uppercase tracking-label text-sage-600">{navigation.find(([id]) => id === view)?.[1]}</p><h1 className="mt-1 font-display text-2xl">Good morning, {employee.name.split(" ")[0]}</h1></div><button onClick={signOut} className="rounded-full border border-line px-4 py-2 text-xs font-bold text-ink-muted lg:hidden">Sign out</button></header>
      <div className="mx-auto max-w-7xl p-5 md:p-8">
        {dataError && <p className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{dataError}</p>}
        {loadingData ? <p className="text-sm text-ink-muted">Loading CRM data…</p> : <>
        {view === "overview" && <><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Stat label="Open pipeline" value={money.format(openValue)} hint={`${leads.length} active opportunities`} icon={ClipboardList} /><Stat label="New leads" value={leads.filter((l) => l.stage === "New").length} hint="Require first contact" icon={UsersRound} /><Stat label="Today’s tasks" value={dueTasks.length} hint="Follow-ups not completed" icon={CalendarClock} /><Stat label="Active customers" value={customers.length} hint="Across design and execution" icon={CircleUserRound} /></div><div className="mt-7 grid gap-6 xl:grid-cols-[1.3fr_.7fr]"><section className="rounded-2xl border border-line bg-white p-5 shadow-hair"><div className="flex items-center justify-between"><div><p className="text-[.62rem] font-bold uppercase tracking-label text-sage-600">Pipeline</p><h2 className="mt-1 font-display text-xl">Priority opportunities</h2></div><button onClick={() => setView("leads")} className="text-xs font-bold text-sage-700">View all</button></div><div className="mt-4 divide-y divide-line">{leads.slice(0, 4).map((lead) => <div key={lead.id} className="flex items-center justify-between gap-3 py-3"><div><p className="font-semibold text-sm">{lead.name}</p><p className="mt-1 text-xs text-ink-muted">{lead.project || "—"} · Next: {lead.nextActionDate ? lead.nextActionDate.slice(0, 10) : "—"}</p></div><div className="text-right"><Badge type={lead.stage}>{lead.stage}</Badge><p className="mt-1 text-xs font-semibold">{money.format(lead.value || 0)}</p></div></div>)}{!leads.length && <p className="py-6 text-center text-sm text-ink-muted">No leads yet.</p>}</div></section><section className="rounded-2xl border border-gold/30 bg-gold-soft p-5"><div className="flex items-center gap-2 text-sage-800"><Lightbulb size={18} /><p className="text-[.62rem] font-bold uppercase tracking-label">Smart focus</p></div><h2 className="mt-3 font-display text-xl">Protect today’s momentum.</h2><p className="mt-3 text-sm leading-6 text-ink-soft">{dueTasks.length} conversations need attention.{topPriorityTask ? ` Start with ${topPriorityTask.contact}'s ${topPriorityTask.type.toLowerCase()}.` : ""}</p><button onClick={() => setView("followups")} className="mt-5 text-xs font-bold text-sage-800">Open follow-up queue <ChevronRight className="inline" size={14} /></button></section></div></>}
        {view === "leads" && <><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h2 className="font-display text-3xl">Leads</h2><p className="mt-1 text-sm text-ink-muted">Track every enquiry from first contact to conversion.</p></div><button onClick={() => setShowLeadForm(true)} className="btn-primary"><Plus size={16} /> Add lead</button></div><div className="mt-6 rounded-2xl border border-line bg-white shadow-hair"><div className="flex items-center gap-3 border-b border-line p-4"><Search size={17} className="text-ink-muted" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by person, project or stage" className="w-full text-sm outline-none" /></div><div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-sage-50 text-[.62rem] uppercase tracking-label text-ink-muted"><tr>{["Lead", "Project", "Stage", "Value", "Next action"].map((x) => <th key={x} className="px-5 py-3.5 font-bold">{x}</th>)}</tr></thead><tbody>{filteredLeads.map((lead) => <tr key={lead.id} className="border-t border-line"><td className="px-5 py-4"><p className="font-semibold">{lead.name}</p><p className="mt-1 text-xs text-ink-muted">{lead.source} · {lead.phone}</p></td><td className="px-5 py-4 text-ink-soft">{lead.project || "—"}</td><td className="px-5 py-4"><Badge type={lead.stage}>{lead.stage}</Badge></td><td className="px-5 py-4 font-semibold">{money.format(lead.value || 0)}</td><td className="px-5 py-4 text-ink-soft">{lead.nextActionDate ? lead.nextActionDate.slice(0, 10) : "—"}</td></tr>)}</tbody></table>{!filteredLeads.length && <p className="p-6 text-center text-sm text-ink-muted">No leads match.</p>}</div></div></>}
        {view === "customers" && <><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h2 className="font-display text-3xl">Customers</h2><p className="mt-1 text-sm text-ink-muted">A live view of every current Avaya Udyog customer.</p></div><button onClick={() => setShowCustomerForm(true)} className="btn-primary"><Plus size={16} /> Add customer</button></div><div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{customers.map((customer) => <article key={customer.id} className="rounded-2xl border border-line bg-white p-5 shadow-hair"><div className="flex items-start justify-between"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-sage-100 font-display text-lg text-sage-700">{customer.name[0]}</span><Badge type={customer.phase}>{customer.phase}</Badge></div><h3 className="mt-5 font-display text-xl">{customer.name}</h3><p className="mt-1 text-sm text-ink-muted">{customer.project}</p><div className="mt-5 flex justify-between border-t border-line pt-4 text-xs"><span className="text-ink-muted">{customer.owner || "Unassigned"}</span><span className="font-bold text-sage-700">{money.format(customer.value || 0)}</span></div></article>)}{!customers.length && <p className="text-sm text-ink-muted">No customers yet.</p>}</div></>}
        {view === "followups" && <><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h2 className="font-display text-3xl">Follow-ups</h2><p className="mt-1 text-sm text-ink-muted">Keep promises visible and make every client feel remembered.</p></div><button onClick={() => setShowFollowupForm(true)} className="btn-primary"><Plus size={16} /> Schedule follow-up</button></div><div className="mt-6 space-y-3">{[...followups].sort((a, b) => a.done - b.done).map((item) => <article key={item.id} className={`flex items-start gap-4 rounded-2xl border p-5 ${item.done ? "border-line bg-sage-50/50 opacity-65" : "border-line bg-white shadow-hair"}`}><button onClick={() => complete(item)} aria-label="Mark follow-up complete" className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${item.done ? "border-sage-600 bg-sage-600 text-white" : "border-sage-300 text-transparent"}`}><Check size={14} /></button><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className={`font-semibold ${item.done ? "line-through" : ""}`}>{item.contact}</h3><Badge type="Qualified">{item.type}</Badge></div><p className="mt-2 text-sm text-ink-muted">{item.note}</p></div><div className="shrink-0 text-right text-xs"><p className="font-bold text-sage-700">{item.dueDate ? item.dueDate.slice(0, 10) : "—"}</p><p className="mt-1 text-ink-muted">{item.dueTime}</p></div></article>)}{!followups.length && <p className="text-sm text-ink-muted">No follow-ups scheduled.</p>}</div></>}
        {view === "inbox" && <WebsiteInbox leads={leads} reviews={WEBSITE_REVIEWS} onOpenLeads={() => setView("leads")} />}
        {view === "projects" && <><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h2 className="font-display text-3xl">Projects</h2><p className="mt-1 text-sm text-ink-muted">Track all ongoing and completed projects.</p></div><button onClick={() => setShowProjectForm(true)} className="btn-primary"><Plus size={16} /> Add project</button></div><div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-white shadow-hair"><table className="min-w-full text-left text-sm"><thead className="bg-sage-50 text-[.62rem] uppercase tracking-label text-ink-muted"><tr>{["Code", "Project", "Client", "Status", "Budget"].map((x) => <th key={x} className="px-5 py-3.5 font-bold">{x}</th>)}</tr></thead><tbody>{projects.map((proj) => <tr key={proj.id} className="border-t border-line"><td className="px-5 py-4 font-semibold text-sage-700">{proj.projectCode}</td><td className="px-5 py-4"><p className="font-semibold">{proj.name}</p><p className="mt-1 text-xs text-ink-muted">{proj.projectType} · {proj.siteAddress}</p></td><td className="px-5 py-4"><p className="font-semibold">{proj.customerName}</p></td><td className="px-5 py-4"><Badge type={proj.stage || "Execution"}>{proj.stage || "Execution"}</Badge></td><td className="px-5 py-4 font-semibold">{money.format(proj.budget || 0)}</td></tr>)}</tbody></table>{!projects.length && <p className="p-6 text-center text-sm text-ink-muted">No projects found.</p>}</div></>}
        {view === "quotations" && <QuotationWorkspace customers={customers} projects={projects} />}
        </>}
      </div>
    </main></div>
    {(showLeadForm || showFollowupForm) && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-sage-950/45 p-4 backdrop-blur-sm"><form onSubmit={showLeadForm ? addLead : addFollowup} className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-float"><div className="flex items-center justify-between"><div><p className="text-[.62rem] font-bold uppercase tracking-label text-sage-600">CRM record</p><h2 className="mt-1 font-display text-2xl">{showLeadForm ? "Add new lead" : "Schedule follow-up"}</h2></div><button type="button" onClick={() => { setShowLeadForm(false); setShowFollowupForm(false); }} className="rounded-full p-2 text-ink-muted hover:bg-sage-50"><X size={18} /></button></div>{showLeadForm ? <div className="mt-6 grid gap-4 sm:grid-cols-2"><Field label="Client name" name="name" required /><Field label="Phone" name="phone" required /><Field label="Project" name="project" required /><Select label="Source" name="source" options={["Website", "Instagram", "Referral", "Walk-in"]} /><Field label="Estimated value" name="value" type="number" required /><Field label="Next follow-up" name="next" type="date" required /></div> : <div className="mt-6 grid gap-4 sm:grid-cols-2"><Field label="Contact" name="contact" required /><Select label="Type" name="type" options={["Call", "Site update", "Consultation", "Proposal review"]} /><Field label="Due date" name="due" type="date" required /><Field label="Time" name="time" type="time" required /><label className="sm:col-span-2 text-sm font-semibold">Note<textarea name="note" required rows="3" className="mt-2 w-full rounded-xl border border-line-strong p-3 text-sm outline-none focus:border-sage-500" /></label></div>}<button className="btn-primary mt-6 w-full">{showLeadForm ? "Create lead" : "Add to follow-up queue"}</button></form></div>}
    {showCustomerForm && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-sage-950/45 p-4 backdrop-blur-sm"><form onSubmit={addCustomer} className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-float"><div className="flex items-center justify-between"><div><p className="text-[.62rem] font-bold uppercase tracking-label text-sage-600">CRM record</p><h2 className="mt-1 font-display text-2xl">New Customer</h2></div><button type="button" onClick={() => setShowCustomerForm(false)} className="rounded-full p-2 text-ink-muted hover:bg-sage-50"><X size={18} /></button></div><div className="mt-6 grid gap-4 sm:grid-cols-2"><Field label="Name" name="name" required /><Field label="Phone" name="phone" required /><Field label="Email" name="email" type="email" /><Field label="Company Name" name="companyName" /><Field label="Address" name="address" /><Field label="City" name="city" /><Field label="GSTIN" name="gstin" /></div><button className="btn-primary mt-6 w-full">Register Customer</button></form></div>}
    {showProjectForm && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-sage-950/45 p-4 backdrop-blur-sm"><form onSubmit={addProject} className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-float"><div className="flex items-center justify-between"><div><p className="text-[.62rem] font-bold uppercase tracking-label text-sage-600">CRM record</p><h2 className="mt-1 font-display text-2xl">New Project</h2></div><button type="button" onClick={() => setShowProjectForm(false)} className="rounded-full p-2 text-ink-muted hover:bg-sage-50"><X size={18} /></button></div><div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold">Customer<select name="customerId" required className="mt-2 w-full rounded-xl border border-line-strong bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-sage-500"><option value="">Select a customer</option>{customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label><Field label="Project Name" name="name" required /><Select label="Project Type" name="projectType" options={["Residential", "Commercial", "Office", "Retail", "Other"]} /><Field label="Site Address" name="siteAddress" required /><Field label="City" name="city" /><Field label="Area (Sq.ft)" name="areaSqft" type="number" /><Field label="Budget" name="budget" type="number" /><Field label="Target Date" name="targetDate" type="date" /></div><button className="btn-primary mt-6 w-full">Create Project</button></form></div>}
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
