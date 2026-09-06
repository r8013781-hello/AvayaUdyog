"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Ban, Download, Eye, Pencil, ReceiptText, RotateCcw, Trash2 } from "lucide-react";
import { api, getToken } from "../../lib/crm/api";
import { useConfirm, useToast } from "../../lib/crm/notifications";
import { downloadBlob } from "../../lib/crm/downloadFile";
import { amountToWords } from "../../lib/crm/amountToWords";
import ReceiptDetailsCard from "./ReceiptDetailsCard";

const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const money2 = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });
const PAYMENT_MODES = ["Cash", "UPI", "Bank Transfer", "Cheque", "Card", "Other"];

const today = () => new Date().toISOString().slice(0, 10);
const emptyForm = {
  customerId: "", projectId: "", customerName: "", projectName: "",
  amount: "", paymentMode: "UPI", referenceNo: "", receivedOn: today(), towards: "", notes: "",
};

export default function ReceiptWorkspace({ customers = [], projects = [], canCreate = true, canEdit = false, canDelete = false }) {
  const toast = useToast();
  const confirm = useConfirm();
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editorMode, setEditorMode] = useState(null); // null | "create" | "edit"
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [exportingId, setExportingId] = useState(null);
  const [previewingId, setPreviewingId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const load = () => {
    setLoading(true);
    api.getReceipts()
      .then(setReceipts)
      .catch((err) => { if (getToken()) toast.error(err.message || "Could not load receipts."); })
      .finally(() => setLoading(false));
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(load, []);

  const totalReceived = useMemo(
    () => receipts.filter((r) => r.status === "Active").reduce((sum, r) => sum + Number(r.amount || 0), 0),
    [receipts],
  );

  const openDetails = async (receipt) => {
    setSelected(receipt);
    setDetailsLoading(true);
    try {
      setSelected(await api.getReceipt(receipt.id));
    } catch (err) {
      toast.error(err.message || "Could not load this receipt.");
      setSelected(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  const withPdf = async (receipt, action) => {
    const full = receipt.amountInWords ? receipt : await api.getReceipt(receipt.id);
    const { generateReceiptPdf, buildReceiptFilename } = await import("../../lib/crm/generateReceiptPdf");
    return action(generateReceiptPdf(full), buildReceiptFilename(full), full);
  };

  const previewReceipt = async (receipt) => {
    setPreviewingId(receipt.id);
    try {
      await withPdf(receipt, (doc) => window.open(doc.output("bloburl"), "_blank"));
    } catch (err) {
      toast.error(err.message || "Could not preview the PDF.");
    } finally {
      setPreviewingId(null);
    }
  };

  const downloadReceipt = async (receipt) => {
    setExportingId(receipt.id);
    try {
      await withPdf(receipt, async (doc, filename) => {
        const saved = await downloadBlob(doc.output("blob"), filename);
        if (saved) toast.success({ title: "PDF ready", message: filename });
      });
    } catch (err) {
      toast.error(err.message || "Could not generate the PDF.");
    } finally {
      setExportingId(null);
    }
  };

  const startEdit = async (receipt) => {
    const full = receipt.amountInWords ? receipt : await api.getReceipt(receipt.id).catch(() => receipt);
    setForm({
      customerId: full.customerId ? String(full.customerId) : "",
      projectId: full.projectId ? String(full.projectId) : "",
      customerName: full.customerName || "",
      projectName: full.projectName || "",
      amount: full.amount != null ? String(full.amount) : "",
      paymentMode: full.paymentMode || "UPI",
      referenceNo: full.referenceNo || "",
      receivedOn: full.receivedOn ? full.receivedOn.slice(0, 10) : today(),
      towards: full.towards || "",
      notes: full.notes || "",
    });
    setEditingId(full.id);
    setEditorMode("edit");
    setSelected(null);
  };

  const resetEditor = () => {
    setEditorMode(null);
    setEditingId(null);
    setForm(emptyForm);
  };

  const selectCustomer = (id) => {
    const customer = customers.find((c) => String(c.id) === id);
    setForm((prev) => ({ ...prev, customerId: id, customerName: customer?.name || prev.customerName, projectId: "", projectName: "" }));
  };
  const selectProject = (id) => {
    const project = projects.find((p) => String(p.id) === id);
    setForm((prev) => ({ ...prev, projectId: id, projectName: project?.name || prev.projectName }));
  };

  const save = async (event) => {
    event.preventDefault();
    const amountNumber = Number(form.amount);
    if (!(amountNumber > 0)) {
      toast.error("Enter an amount greater than zero.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        customerId: form.customerId ? Number(form.customerId) : null,
        projectId: form.projectId ? Number(form.projectId) : null,
        customerName: form.customerName.trim(),
        projectName: form.projectName.trim() || null,
        amount: amountNumber,
        paymentMode: form.paymentMode,
        referenceNo: form.referenceNo.trim() || null,
        receivedOn: form.receivedOn,
        towards: form.towards.trim() || null,
        notes: form.notes.trim() || null,
      };
      if (editorMode === "edit") {
        const updated = await api.updateReceipt(editingId, payload);
        setReceipts((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
        toast.success({ title: "Receipt updated", message: `${updated.receiptNo} · ${money2.format(updated.amount || 0)}` });
      } else {
        const created = await api.createReceipt(payload);
        setReceipts((prev) => [created, ...prev]);
        toast.success({ title: "Receipt created", message: `${created.receiptNo} · ${money2.format(created.amount || 0)}` });
      }
      resetEditor();
    } catch (err) {
      toast.error(err.message || "Could not save the receipt.");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (receipt) => {
    const next = receipt.status === "Cancelled" ? "Active" : "Cancelled";
    if (next === "Cancelled") {
      const ok = await confirm({
        title: "Cancel this receipt?",
        message: `"${receipt.receiptNo}" will be marked Cancelled. It stays on record and can be reinstated later.`,
        confirmText: "Cancel receipt",
        danger: true,
      });
      if (!ok) return;
    }
    try {
      const updated = await api.setReceiptStatus(receipt.id, next);
      setReceipts((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setSelected((prev) => (prev?.id === updated.id ? updated : prev));
      toast.success(next === "Cancelled" ? "Receipt cancelled." : "Receipt reinstated.");
    } catch (err) {
      toast.error(err.message || "Could not update the receipt.");
    }
  };

  const removeReceipt = async (receipt) => {
    const ok = await confirm({
      title: "Delete this receipt?",
      message: `"${receipt.receiptNo}" for ${receipt.customerName} will be permanently removed. Prefer "Cancel" if you need to keep the record.`,
      confirmText: "Delete permanently",
      danger: true,
    });
    if (!ok) return;
    setDeletingId(receipt.id);
    try {
      await api.deleteReceipt(receipt.id);
      setReceipts((prev) => prev.filter((r) => r.id !== receipt.id));
      setSelected((prev) => (prev?.id === receipt.id ? null : prev));
      toast.success(`Receipt ${receipt.receiptNo} deleted.`);
    } catch (err) {
      toast.error(err.message || "Could not delete the receipt.");
    } finally {
      setDeletingId(null);
    }
  };

  const customerProjects = projects.filter((p) => !form.customerId || String(p.customerId) === String(form.customerId));
  const detailsBusy = detailsLoading || exportingId === selected?.id || previewingId === selected?.id;

  return (
    <>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="font-display text-3xl">Money receipts</h2>
          <p className="mt-1 text-sm text-ink-muted">Acknowledge payments received — preview and download a signed PDF.</p>
        </div>
        {canCreate && <button onClick={() => { setForm({ ...emptyForm, receivedOn: today() }); setEditorMode("create"); }} className="btn-primary"><ReceiptText size={16} /> New receipt</button>}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Summary label="Total receipts" value={receipts.length} />
        <Summary label="Received (active)" value={money.format(totalReceived)} />
        <Summary label="Cancelled" value={receipts.filter((r) => r.status === "Cancelled").length} />
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-white shadow-hair">
        <div className="border-b border-line p-5">
          <p className="text-[.62rem] font-bold uppercase tracking-label text-sage-600">Payments register</p>
          <h3 className="mt-1 font-display text-xl">Issued receipts</h3>
        </div>
        {loading ? (
          <div className="space-y-3 p-5">{[0, 1, 2].map((i) => <div key={i} className="h-14 animate-pulse rounded-xl bg-sage-50" />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-sage-50 text-[.62rem] uppercase tracking-label text-ink-muted">
                <tr>{["Receipt no.", "Received from", "Mode", "Date", "Amount", "Status", ""].map((title) => <th key={title} className="px-5 py-3 font-bold">{title}</th>)}</tr>
              </thead>
              <tbody>
                {receipts.map((receipt) => (
                  <tr key={receipt.id} onClick={() => openDetails(receipt)} className="cursor-pointer border-t border-line transition hover:bg-sage-50/50">
                    <td className="px-5 py-4 font-semibold text-sage-700">{receipt.receiptNo}</td>
                    <td className="px-5 py-4"><p className="font-semibold">{receipt.customerName}</p>{receipt.projectName && <p className="mt-1 text-xs text-ink-muted">{receipt.projectName}</p>}</td>
                    <td className="px-5 py-4 text-ink-muted">{receipt.paymentMode}</td>
                    <td className="px-5 py-4 text-ink-muted">{receipt.receivedOn ? receipt.receivedOn.slice(0, 10) : "—"}</td>
                    <td className={`px-5 py-4 font-semibold ${receipt.status === "Cancelled" ? "text-ink-faint line-through" : ""}`}>{money2.format(receipt.amount || 0)}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${receipt.status === "Cancelled" ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"}`}>{receipt.status}</span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={(e) => { e.stopPropagation(); previewReceipt(receipt); }} disabled={previewingId === receipt.id} aria-label={`Preview ${receipt.receiptNo}`} title="Preview PDF" className="rounded-lg p-1.5 text-sage-700 transition hover:bg-sage-50 disabled:opacity-40"><Eye size={15} /></button>
                        <button onClick={(e) => { e.stopPropagation(); downloadReceipt(receipt); }} disabled={exportingId === receipt.id} aria-label={`Download ${receipt.receiptNo}`} title="Download PDF" className="rounded-lg p-1.5 text-sage-700 transition hover:bg-sage-50 disabled:opacity-40"><Download size={15} /></button>
                        {canEdit && receipt.status !== "Cancelled" && (
                          <button onClick={(e) => { e.stopPropagation(); startEdit(receipt); }} aria-label={`Edit ${receipt.receiptNo}`} title="Edit receipt" className="rounded-lg p-1.5 text-sage-700 transition hover:bg-sage-50"><Pencil size={15} /></button>
                        )}
                        {canEdit && (
                          <button onClick={(e) => { e.stopPropagation(); toggleStatus(receipt); }} aria-label={receipt.status === "Cancelled" ? `Reinstate ${receipt.receiptNo}` : `Cancel ${receipt.receiptNo}`} title={receipt.status === "Cancelled" ? "Reinstate" : "Cancel receipt"} className="rounded-lg p-1.5 text-amber-600 transition hover:bg-amber-50">
                            {receipt.status === "Cancelled" ? <RotateCcw size={15} /> : <Ban size={15} />}
                          </button>
                        )}
                        {canDelete && (
                          <button onClick={(e) => { e.stopPropagation(); removeReceipt(receipt); }} disabled={deletingId === receipt.id} aria-label={`Delete ${receipt.receiptNo}`} title="Delete receipt" className="rounded-lg p-1.5 text-red-500 transition hover:bg-red-50 disabled:opacity-40"><Trash2 size={15} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!receipts.length && <p className="p-8 text-center text-sm text-ink-muted">No receipts yet. Tap &quot;New receipt&quot; to issue one, or tap any row to view it.</p>}
          </div>
        )}
      </div>

      {selected && (
        <ReceiptDetailsCard
          receipt={selected}
          loading={detailsLoading}
          busy={detailsBusy}
          onClose={() => setSelected(null)}
          canEdit={canEdit}
          canDelete={canDelete}
          onEdit={startEdit}
          onDelete={removeReceipt}
          onPreview={previewReceipt}
          onDownload={downloadReceipt}
          onToggleStatus={toggleStatus}
        />
      )}

      {editorMode && (
        <div className="fixed inset-0 z-[70] overflow-y-auto bg-sage-950/45 p-4 backdrop-blur-sm">
          <form onSubmit={save} className="mx-auto my-6 max-w-2xl rounded-3xl bg-white p-6 shadow-float">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[.62rem] font-bold uppercase tracking-label text-sage-600">Money receipt</p>
                <h3 className="mt-1 font-display text-2xl">{editorMode === "edit" ? "Edit receipt" : "New money receipt"}</h3>
              </div>
              <button type="button" onClick={resetEditor} className="text-sm font-bold text-ink-muted">Close</button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="text-sm font-semibold">Existing customer
                <select value={form.customerId} onChange={(e) => selectCustomer(e.target.value)} className="mt-2 w-full rounded-xl border border-line-strong bg-white p-3 font-normal">
                  <option value="">New / unlisted customer</option>
                  {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </label>
              <label className="text-sm font-semibold">Linked project <span className="font-normal text-ink-muted">(optional)</span>
                <select value={form.projectId} onChange={(e) => selectProject(e.target.value)} className="mt-2 w-full rounded-xl border border-line-strong bg-white p-3 font-normal">
                  <option value="">No project</option>
                  {customerProjects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </label>
              <Input label="Received from" value={form.customerName} onChange={(v) => setForm({ ...form, customerName: v })} required />
              <Input label="Project name" value={form.projectName} onChange={(v) => setForm({ ...form, projectName: v })} placeholder="Optional" />
              <Input label="Amount (₹)" type="number" min="0.01" step="0.01" value={form.amount} onChange={(v) => setForm({ ...form, amount: v })} required />
              <label className="text-sm font-semibold">Payment mode
                <select value={form.paymentMode} onChange={(e) => setForm({ ...form, paymentMode: e.target.value })} className="mt-2 w-full rounded-xl border border-line-strong bg-white p-3 font-normal">
                  {PAYMENT_MODES.map((m) => <option key={m}>{m}</option>)}
                </select>
              </label>
              <Input label="Reference no." value={form.referenceNo} onChange={(v) => setForm({ ...form, referenceNo: v })} placeholder="UPI ref / cheque no." />
              <Input label="Received on" type="date" value={form.receivedOn} onChange={(v) => setForm({ ...form, receivedOn: v })} required />
              <Input label="Towards" value={form.towards} onChange={(v) => setForm({ ...form, towards: v })} placeholder="e.g. Advance for modular kitchen" className="md:col-span-2" />
              <label className="text-sm font-semibold md:col-span-2">Notes
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows="3" className="mt-2 w-full rounded-xl border border-line-strong p-3 font-normal leading-relaxed" />
              </label>
            </div>

            <div className="mt-5 rounded-2xl bg-sage-950 p-5 text-white">
              <p className="text-[0.6rem] font-bold uppercase tracking-label text-sage-300">Amount in words</p>
              <p className="mt-1.5 text-sm leading-6">{Number(form.amount) > 0 ? amountToWords(form.amount) : "—"}</p>
            </div>

            <button disabled={saving} className="btn-primary mt-6 w-full disabled:opacity-60">{saving ? "Saving…" : editorMode === "edit" ? "Save changes" : "Create receipt"}</button>
          </form>
        </div>
      )}
    </>
  );
}

function Input({ label, value, onChange, type = "text", required = false, placeholder, className = "", min, step }) {
  return (
    <label className={`text-sm font-semibold ${className}`}>
      {label}
      <input type={type} required={required} value={value} placeholder={placeholder} min={min} step={step} onChange={(e) => onChange(e.target.value)} className="mt-2 w-full rounded-xl border border-line-strong p-3 font-normal" />
    </label>
  );
}
function Summary({ label, value }) {
  return <div className="rounded-2xl border border-line bg-white p-5 shadow-hair"><p className="text-[.62rem] font-bold uppercase tracking-label text-ink-muted">{label}</p><p className="mt-2 text-2xl font-semibold text-ink">{value}</p></div>;
}
