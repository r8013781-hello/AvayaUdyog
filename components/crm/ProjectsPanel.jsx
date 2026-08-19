"use client";

import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Banknote, FolderOpen, IndianRupee, MapPin, Plus, Trash2, Wallet, X } from "lucide-react";
import { api } from "../../lib/crm/api";
import { useConfirm, useToast } from "../../lib/crm/notifications";
import { Avatar, Badge, money, Stat } from "../../lib/crm/crmUi";

function paymentStatus(project) {
  const quoted = Number(project.totalQuoted || 0);
  const paid = Number(project.totalPaid || 0);
  if (quoted <= 0) return paid > 0 ? { label: "Advance received", tone: "bg-blue-50 text-blue-700 ring-blue-200" } : { label: "Not invoiced", tone: "bg-sage-50 text-ink-muted ring-sage-200" };
  if (paid >= quoted) return { label: "Fully paid", tone: "bg-emerald-50 text-emerald-700 ring-emerald-200" };
  if (paid > 0) return { label: "Partially paid", tone: "bg-amber-50 text-amber-700 ring-amber-200" };
  return { label: "Unpaid", tone: "bg-red-50 text-red-700 ring-red-200" };
}

function ProjectFormModal({ customers, onClose, onSaved }) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
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
      onSaved(created);
      toast.success({ title: "Project created", message: `${created.projectCode} · ${created.name}` });
      onClose();
    } catch (err) {
      toast.error(err.message || "Could not create the project.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-sage-950/45 p-4 py-8 backdrop-blur-sm sm:items-center">
      <motion.form
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 340, damping: 28 }}
        onSubmit={submit}
        className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-float"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sage-50 text-sage-700"><FolderOpen size={20} /></span>
            <div>
              <p className="text-[.62rem] font-bold uppercase tracking-label text-sage-600">Project register</p>
              <h2 className="mt-0.5 font-display text-2xl">New project</h2>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-ink-muted transition hover:bg-sage-50"><X size={18} /></button>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold sm:col-span-2">Customer
            <select name="customerId" required className="mt-2 w-full rounded-xl border border-line-strong bg-white px-3 py-2.5 text-sm font-normal outline-none transition focus:border-sage-500 focus:ring-4 focus:ring-sage-100">
              <option value="">Select a customer</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <Field label="Project name" name="name" required />
          <Select label="Project type" name="projectType" options={["Residential", "Commercial", "Office", "Retail", "Other"]} />
          <Field label="Site address" name="siteAddress" required className="sm:col-span-2" />
          <Field label="City" name="city" />
          <Field label="Area (sq.ft)" name="areaSqft" type="number" />
          <Field label="Budget (₹)" name="budget" type="number" />
          <Field label="Target date" name="targetDate" type="date" />
        </div>
        <button disabled={saving} className="btn-primary mt-6 w-full justify-center disabled:opacity-60">{saving ? "Creating…" : "Create project"}</button>
      </motion.form>
    </motion.div>
  );
}

function PaymentFormModal({ project, onClose, onSaved }) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const balance = Math.max(0, Number(project.totalQuoted || 0) - Number(project.totalPaid || 0));

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    const form = new FormData(event.currentTarget);
    try {
      const updated = await api.addProjectPayment(project.id, {
        amount: Number(form.get("amount")),
        paymentDate: form.get("paymentDate"),
        paymentMode: form.get("paymentMode"),
        referenceNo: form.get("referenceNo") || "",
        notes: form.get("notes") || "",
      });
      onSaved(updated);
      toast.success("Payment logged and balance updated.");
      onClose();
    } catch (err) {
      toast.error(err.message || "Could not log payment.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] flex items-center justify-center bg-sage-950/45 p-4 backdrop-blur-sm">
      <motion.form
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 340, damping: 28 }}
        onSubmit={submit}
        className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-float"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sage-50 text-sage-700"><Banknote size={20} /></span>
            <div>
              <p className="text-[.62rem] font-bold uppercase tracking-label text-sage-600">Financials</p>
              <h2 className="mt-0.5 font-display text-2xl">Log payment</h2>
              <p className="mt-1 text-xs text-ink-muted">{project.name} · Balance due {money.format(balance)}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-ink-muted transition hover:bg-sage-50"><X size={18} /></button>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Amount (₹)" name="amount" type="number" required />
          <Field label="Date" name="paymentDate" type="date" required />
          <Select label="Mode" name="paymentMode" options={["Bank Transfer", "Cheque", "Cash", "UPI"]} />
          <Field label="Ref no. (Cheque/UTR)" name="referenceNo" />
          <label className="text-sm font-semibold sm:col-span-2">Notes
            <textarea name="notes" rows="2" className="mt-2 w-full rounded-xl border border-line-strong p-3 text-sm font-normal outline-none transition focus:border-sage-500 focus:ring-4 focus:ring-sage-100" />
          </label>
        </div>
        <button disabled={saving} className="btn-primary mt-6 w-full justify-center disabled:opacity-60">{saving ? "Saving…" : "Save payment"}</button>
      </motion.form>
    </motion.div>
  );
}

export default function ProjectsPanel({ projects, setProjects, customers, can }) {
  const toast = useToast();
  const confirm = useConfirm();
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [paymentTarget, setPaymentTarget] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const totals = useMemo(() => projects.reduce((acc, p) => ({
    quoted: acc.quoted + Number(p.totalQuoted || 0),
    paid: acc.paid + Number(p.totalPaid || 0),
  }), { quoted: 0, paid: 0 }), [projects]);
  const outstanding = Math.max(0, totals.quoted - totals.paid);

  const removeProject = async (project) => {
    const ok = await confirm({
      title: `Delete ${project.name}?`,
      message: `"${project.projectCode}" and its payment history will be permanently removed. This cannot be undone.`,
      confirmText: "Delete permanently",
      danger: true,
    });
    if (!ok) return;
    setDeletingId(project.id);
    try {
      await api.deleteProject(project.id);
      setProjects((prev) => prev.filter((p) => p.id !== project.id));
      toast.success(`${project.name} deleted.`);
    } catch (err) {
      toast.error(err.message || "Could not delete this project.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-display text-3xl">Projects</h2>
          <p className="mt-1 text-sm text-ink-muted">Track every project&apos;s site details, stage and payment status in one place.</p>
        </div>
        {can("projects", "create") && <button onClick={() => setShowProjectForm(true)} className="btn-primary"><Plus size={16} /> Add project</button>}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Stat label="Total quoted" value={money.format(totals.quoted)} hint={`${projects.length} project${projects.length === 1 ? "" : "s"}`} icon={IndianRupee} />
        <Stat label="Collected" value={money.format(totals.paid)} hint={totals.quoted ? `${Math.round((totals.paid / totals.quoted) * 100)}% of quoted value` : "No quotes yet"} icon={Wallet} />
        <Stat label="Outstanding" value={money.format(outstanding)} hint="Balance yet to be collected" icon={Banknote} />
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-white shadow-hair">
        {projects.length ? (
          <div className="divide-y divide-line">
            {projects.map((proj) => {
              const quoted = Number(proj.totalQuoted || 0);
              const paid = Number(proj.totalPaid || 0);
              const balance = Math.max(0, quoted - paid);
              const pct = quoted > 0 ? Math.min(100, Math.round((paid / quoted) * 100)) : paid > 0 ? 100 : 0;
              const status = paymentStatus(proj);
              return (
                <article key={proj.id} className="flex flex-col gap-4 p-5 transition hover:bg-sage-50/30 sm:flex-row sm:items-center">
                  <Avatar name={proj.customerName} size={11} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-ink">{proj.name}</h3>
                      <Badge type={proj.stage || "Enquiry"}>{proj.stage || "Enquiry"}</Badge>
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[0.62rem] font-bold ring-1 ring-inset ${status.tone}`}>{status.label}</span>
                    </div>
                    <p className="mt-1 text-xs text-ink-muted">{proj.projectCode} · {proj.customerName}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-ink-faint"><MapPin size={12} /> {proj.projectType} · {proj.siteAddress}</p>
                    <div className="mt-3 max-w-sm">
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-sage-100">
                        <div className={`h-full rounded-full ${pct >= 100 ? "bg-emerald-500" : "bg-sage-500"}`} style={{ width: `${pct}%` }} />
                      </div>
                      <p className="mt-1.5 text-[0.68rem] text-ink-muted">{money.format(paid)} collected of {money.format(quoted)} quoted{quoted > 0 ? ` · ${pct}%` : ""}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-5 sm:flex-col sm:items-end sm:gap-2">
                    <p className="text-lg font-bold text-red-600">{money.format(balance)}<span className="ml-1 text-[0.6rem] font-bold uppercase tracking-label text-ink-faint">due</span></p>
                    <div className="flex items-center gap-2">
                      {can("projects", "update") && <button onClick={() => setPaymentTarget(proj)} className="rounded-full border border-line-strong px-3 py-1.5 text-xs font-bold text-sage-700 transition hover:border-sage-400 hover:bg-sage-50">Add payment</button>}
                      {can("projects", "delete") && (
                        <button
                          onClick={() => removeProject(proj)}
                          disabled={deletingId === proj.id}
                          aria-label={`Delete ${proj.name}`}
                          title="Delete project"
                          className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 disabled:opacity-40"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="p-10 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-sage-50 text-sage-600"><FolderOpen size={22} /></span>
            <p className="mt-3 text-sm font-semibold text-ink">No projects yet</p>
            <p className="mt-1 text-sm text-ink-muted">Create your first project to start tracking site details and payments.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showProjectForm && (
          <ProjectFormModal
            customers={customers}
            onClose={() => setShowProjectForm(false)}
            onSaved={(created) => setProjects((prev) => [created, ...prev])}
          />
        )}
        {paymentTarget && (
          <PaymentFormModal
            project={paymentTarget}
            onClose={() => setPaymentTarget(null)}
            onSaved={(updated) => setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function Field({ label, name, type = "text", required = false, className = "" }) {
  return (
    <label className={`text-sm font-semibold ${className}`}>
      {label}
      <input name={name} type={type} required={required} className="mt-2 w-full rounded-xl border border-line-strong px-3 py-2.5 text-sm font-normal outline-none transition focus:border-sage-500 focus:ring-4 focus:ring-sage-100" />
    </label>
  );
}
function Select({ label, name, options }) {
  return (
    <label className="text-sm font-semibold">
      {label}
      <select name={name} className="mt-2 w-full rounded-xl border border-line-strong bg-white px-3 py-2.5 text-sm font-normal outline-none transition focus:border-sage-500 focus:ring-4 focus:ring-sage-100">
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}
