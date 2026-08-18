import React, { useEffect, useMemo, useState } from "react";
import { Calculator, Download, FilePlus2, FolderPlus, Layers, Pencil, Plus, Trash2 } from "lucide-react";
import { api, getToken } from "../lib/api";
import { useConfirm, useToast } from "../lib/notifications";
import { downloadBlob } from "../lib/downloadFile";
import { groupQuotationItems } from "../lib/quotationGrouping";
import QuotationDetailsCard from "./QuotationDetailsCard";

const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const blankItem = () => ({ itemName: "", quantity: 1, unit: "Lump sum", unitPrice: 0 });
const blankSubsection = (name = "") => ({ name, items: [blankItem()] });
const blankSection = (name = "Room 1") => ({ name, subsections: [blankSubsection()] });
const emptyForm = { customerId: "", projectId: "", customerName: "", projectName: "", projectAddress: "", validUntil: "", discount: 0, taxRate: 18, notes: "" };

export default function QuotationWorkspace({ customers, projects = [], canCreate = true, canEdit = false, canDelete = false }) {
  const toast = useToast();
  const confirm = useConfirm();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editorMode, setEditorMode] = useState(null); // null | "create" | "edit"
  const [editingId, setEditingId] = useState(null);
  const [sections, setSections] = useState([blankSection("Room 1")]);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [exportingId, setExportingId] = useState(null);
  const [previewingId, setPreviewingId] = useState(null);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = () => {
    setLoading(true);
    api.getQuotations().then(setQuotes).catch((err) => { if (getToken()) toast.error(err.message || "Could not load quotations."); }).finally(() => setLoading(false));
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(load, []);

  const openDetails = async (quote) => {
    setSelectedQuotation({ ...quote, items: [] });
    setDetailsLoading(true);
    try {
      const full = await api.getQuotation(quote.id);
      setSelectedQuotation(full);
    } catch (err) {
      toast.error(err.message || "Could not load this quotation.");
      setSelectedQuotation(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  const removeQuote = async (quote) => {
    const ok = await confirm({
      title: "Delete this quotation?",
      message: `"${quote.quotationNo}" for ${quote.customerName} will be permanently removed. This cannot be undone.`,
      confirmText: "Delete permanently",
      danger: true,
    });
    if (!ok) return;
    setDeletingId(quote.id);
    try {
      await api.deleteQuotation(quote.id);
      setQuotes((prev) => prev.filter((q) => q.id !== quote.id));
      setSelectedQuotation((prev) => (prev?.id === quote.id ? null : prev));
      toast.success(`Quotation ${quote.quotationNo} deleted.`);
    } catch (err) {
      toast.error(err.message || "Could not delete this quotation.");
    } finally {
      setDeletingId(null);
    }
  };

  const exportQuote = async (quote) => {
    setExportingId(quote.id);
    try {
      const [full, { generateQuotationPdf, buildQuotationFilename }] = await Promise.all([
        api.getQuotation(quote.id),
        import("../lib/generateQuotationPdf"),
      ]);
      const doc = generateQuotationPdf(full);
      const saved = await downloadBlob(doc.output("blob"), buildQuotationFilename(full));
      if (saved) toast.success({ title: "PDF ready", message: buildQuotationFilename(full) });
    } catch (err) {
      toast.error(err.message || "Could not generate the PDF.");
    } finally {
      setExportingId(null);
    }
  };

  const previewQuote = async (quote) => {
    setPreviewingId(quote.id);
    try {
      const [full, { generateQuotationPdf }] = await Promise.all([
        api.getQuotation(quote.id),
        import("../lib/generateQuotationPdf"),
      ]);
      const doc = generateQuotationPdf(full);
      window.open(doc.output("bloburl"), "_blank");
    } catch (err) {
      toast.error(err.message || "Could not preview the PDF.");
    } finally {
      setPreviewingId(null);
    }
  };

  const startEditFromRow = async (quote) => {
    try {
      const full = await api.getQuotation(quote.id);
      startEdit(full);
    } catch (err) {
      toast.error(err.message || "Could not load this quotation.");
    }
  };

  const startEdit = (quote) => {
    const groups = groupQuotationItems(quote.items || []);
    const nextSections = groups.map((group) => ({
      name: group.name,
      subsections: group.subgroups.map((sub) => ({
        name: sub.name,
        items: sub.items.map((item) => ({ itemName: item.itemName, quantity: item.quantity, unit: item.unit, unitPrice: item.unitPrice })),
      })),
    }));
    setSections(nextSections.length ? nextSections : [blankSection("Room 1")]);
    setForm({
      customerId: quote.customerId ? String(quote.customerId) : "",
      projectId: quote.projectId ? String(quote.projectId) : "",
      customerName: quote.customerName || "",
      projectName: quote.projectName || "",
      projectAddress: quote.projectAddress || "",
      validUntil: quote.validUntil ? quote.validUntil.slice(0, 10) : "",
      discount: quote.discount || 0,
      taxRate: quote.taxRate || 18,
      notes: quote.notes || "",
    });
    setEditingId(quote.id);
    setEditorMode("edit");
    setSelectedQuotation(null);
  };

  const subtotal = useMemo(
    () => sections.reduce((secSum, sec) => secSum + sec.subsections.reduce((subSum, sub) => subSum + sub.items.reduce((itemSum, item) => itemSum + Number(item.quantity || 0) * Number(item.unitPrice || 0), 0), 0), 0),
    [sections],
  );
  const taxable = Math.max(0, subtotal - Number(form.discount || 0));
  const tax = (taxable * Number(form.taxRate || 0)) / 100;
  const total = taxable + tax;

  const updateSectionName = (secIndex, value) => setSections((prev) => prev.map((s, i) => (i === secIndex ? { ...s, name: value } : s)));
  const addSection = () => setSections((prev) => [...prev, blankSection(`Room ${prev.length + 1}`)]);
  const removeSection = (secIndex) => setSections((prev) => prev.filter((_, i) => i !== secIndex));

  const updateSubsectionName = (secIndex, subIndex, value) =>
    setSections((prev) => prev.map((s, i) => (i === secIndex ? { ...s, subsections: s.subsections.map((sub, j) => (j === subIndex ? { ...sub, name: value } : sub)) } : s)));
  const addSubsection = (secIndex) => setSections((prev) => prev.map((s, i) => (i === secIndex ? { ...s, subsections: [...s.subsections, blankSubsection()] } : s)));
  const removeSubsection = (secIndex, subIndex) =>
    setSections((prev) => prev.map((s, i) => (i === secIndex ? { ...s, subsections: s.subsections.filter((_, j) => j !== subIndex) } : s)));

  const updateItem = (secIndex, subIndex, itemIndex, key, value) =>
    setSections((prev) =>
      prev.map((s, i) =>
        i === secIndex
          ? { ...s, subsections: s.subsections.map((sub, j) => (j === subIndex ? { ...sub, items: sub.items.map((item, k) => (k === itemIndex ? { ...item, [key]: value } : item)) } : sub)) }
          : s,
      ),
    );
  const addItem = (secIndex, subIndex) =>
    setSections((prev) => prev.map((s, i) => (i === secIndex ? { ...s, subsections: s.subsections.map((sub, j) => (j === subIndex ? { ...sub, items: [...sub.items, blankItem()] } : sub)) } : s)));
  const removeItem = (secIndex, subIndex, itemIndex) =>
    setSections((prev) => prev.map((s, i) => (i === secIndex ? { ...s, subsections: s.subsections.map((sub, j) => (j === subIndex ? { ...sub, items: sub.items.filter((_, k) => k !== itemIndex) } : sub)) } : s)));

  const selectCustomer = (id) => {
    const customer = customers.find((item) => String(item.id) === id);
    setForm((prev) => ({ ...prev, customerId: id, customerName: customer?.name || prev.customerName, projectId: "", projectName: "", projectAddress: "" }));
  };
  const selectProject = (id) => {
    const project = projects.find((item) => String(item.id) === id);
    setForm((prev) => ({ ...prev, projectId: id, projectName: project?.name || prev.projectName, projectAddress: project?.siteAddress || prev.projectAddress }));
  };

  const resetEditor = () => {
    setEditorMode(null);
    setEditingId(null);
    setSections([blankSection("Room 1")]);
    setForm(emptyForm);
  };

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const flatItems = sections.flatMap((sec) =>
        sec.subsections.flatMap((sub) =>
          sub.items.map((item) => ({
            itemName: item.itemName,
            groupName: sec.name.trim() || "General",
            subgroupName: sub.name.trim(),
            quantity: Number(item.quantity),
            unit: item.unit,
            unitPrice: Number(item.unitPrice),
          })),
        ),
      );
      if (!flatItems.length) throw new Error("Add at least one line item before saving.");

      const payload = {
        ...form,
        customerId: form.customerId ? Number(form.customerId) : null,
        projectId: form.projectId ? Number(form.projectId) : null,
        discount: Number(form.discount || 0),
        taxRate: Number(form.taxRate || 0),
        items: flatItems,
      };

      if (editorMode === "edit") {
        const updated = await api.updateQuotation(editingId, payload);
        setQuotes((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
        toast.success({ title: "Quotation updated", message: `${updated.quotationNo} · ${money.format(updated.grandTotal || 0)}` });
      } else {
        const created = await api.createQuotation(payload);
        setQuotes((prev) => [created, ...prev]);
        toast.success({ title: "Quotation saved", message: `${created.quotationNo} · ${money.format(created.grandTotal || 0)}` });
      }
      resetEditor();
    } catch (err) {
      toast.error(err.message || "Could not save quotation.");
    } finally {
      setSaving(false);
    }
  };

  const customerProjects = projects.filter((p) => !form.customerId || String(p.customerId) === String(form.customerId));
  const detailsBusy = detailsLoading || exportingId === selectedQuotation?.id || previewingId === selectedQuotation?.id;

  return (
    <>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="font-display text-3xl">Quotations</h2>
          <p className="mt-1 text-sm text-ink-muted">Build precise, itemised proposals grouped by room and category.</p>
        </div>
        {canCreate && <button onClick={() => setEditorMode("create")} className="btn-primary"><FilePlus2 size={16} /> Create quotation</button>}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Summary label="Total quotations" value={quotes.length} />
        <Summary label="Draft value" value={money.format(quotes.filter((quote) => quote.status === "Draft").reduce((sum, quote) => sum + Number(quote.grandTotal || 0), 0))} />
        <Summary label="Approved" value={quotes.filter((quote) => quote.status === "Approved").length} />
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-white shadow-hair">
        <div className="border-b border-line p-5">
          <p className="text-[.62rem] font-bold uppercase tracking-label text-sage-600">Commercial register</p>
          <h3 className="mt-1 font-display text-xl">Project quotations</h3>
        </div>
        {loading ? (
          <div className="space-y-3 p-5">{[0, 1, 2].map((i) => <div key={i} className="h-14 animate-pulse rounded-xl bg-sage-50" />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-sage-50 text-[.62rem] uppercase tracking-label text-ink-muted">
                <tr>{["Reference", "Customer / project", "Status", "Valid until", "Total", ""].map((title) => <th key={title} className="px-5 py-3 font-bold">{title}</th>)}</tr>
              </thead>
              <tbody>
                {quotes.map((quote) => (
                  <tr key={quote.id} onClick={() => openDetails(quote)} className="cursor-pointer border-t border-line transition hover:bg-sage-50/50">
                    <td className="px-5 py-4 font-semibold text-sage-700">{quote.quotationNo}</td>
                    <td className="px-5 py-4"><p className="font-semibold">{quote.customerName}</p><p className="mt-1 text-xs text-ink-muted">{quote.projectName}</p></td>
                    <td className="px-5 py-4"><span className="rounded-full bg-sage-100 px-2.5 py-1 text-xs font-bold text-sage-700">{quote.status}</span></td>
                    <td className="px-5 py-4 text-ink-muted">{quote.validUntil ? quote.validUntil.slice(0, 10) : "—"}</td>
                    <td className="px-5 py-4 font-semibold">{money.format(quote.grandTotal || 0)}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={(e) => { e.stopPropagation(); exportQuote(quote); }}
                          disabled={exportingId === quote.id}
                          aria-label={`Download PDF for ${quote.quotationNo}`}
                          title="Download PDF"
                          className="rounded-lg p-1.5 text-sage-700 transition hover:bg-sage-50 disabled:opacity-40"
                        >
                          <Download size={15} />
                        </button>
                        {canEdit && quote.status === "Draft" && (
                          <button onClick={(e) => { e.stopPropagation(); startEditFromRow(quote); }} aria-label={`Edit ${quote.quotationNo}`} title="Edit quotation" className="rounded-lg p-1.5 text-sage-700 transition hover:bg-sage-50">
                            <Pencil size={15} />
                          </button>
                        )}
                        {canDelete && (
                          <button onClick={(e) => { e.stopPropagation(); removeQuote(quote); }} disabled={deletingId === quote.id} aria-label={`Delete quotation ${quote.quotationNo}`} title="Delete quotation" className="rounded-lg p-1.5 text-red-500 transition hover:bg-red-50 disabled:opacity-40">
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!quotes.length && <p className="p-8 text-center text-sm text-ink-muted">No quotations created yet. Tap "Create quotation" to build your first one, or tap any row to view its full breakdown.</p>}
          </div>
        )}
      </div>

      {selectedQuotation && (
        <QuotationDetailsCard
          quotation={selectedQuotation}
          loading={detailsLoading}
          busy={detailsBusy}
          onClose={() => setSelectedQuotation(null)}
          canEdit={canEdit && selectedQuotation.status === "Draft"}
          canDelete={canDelete}
          onEdit={startEdit}
          onDelete={removeQuote}
          onPreview={previewQuote}
          onDownload={exportQuote}
        />
      )}

      {editorMode && (
        <div className="fixed inset-0 z-[70] overflow-y-auto bg-sage-950/45 p-4 backdrop-blur-sm">
          <form onSubmit={save} className="mx-auto my-6 max-w-5xl rounded-3xl bg-white p-6 shadow-float">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[.62rem] font-bold uppercase tracking-label text-sage-600">Quotation builder</p>
                <h3 className="mt-1 font-display text-2xl">{editorMode === "edit" ? "Edit quotation" : "New project quotation"}</h3>
              </div>
              <button type="button" onClick={resetEditor} className="text-sm font-bold text-ink-muted">Close</button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <label className="text-sm font-semibold">Existing customer
                <select value={form.customerId} onChange={(e) => selectCustomer(e.target.value)} className="mt-2 w-full rounded-xl border border-line-strong bg-white p-3 font-normal">
                  <option value="">New / unlisted customer</option>
                  {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}
                </select>
              </label>
              <label className="text-sm font-semibold">Existing Project
                <select value={form.projectId} onChange={(e) => selectProject(e.target.value)} className="mt-2 w-full rounded-xl border border-line-strong bg-white p-3 font-normal">
                  <option value="">Select project</option>
                  {customerProjects.map((proj) => <option key={proj.id} value={proj.id}>{proj.name} — {proj.projectType}</option>)}
                </select>
              </label>
              <Input label="Customer name" value={form.customerName} onChange={(value) => setForm({ ...form, customerName: value })} required />
              <Input label="Project name" value={form.projectName} onChange={(value) => setForm({ ...form, projectName: value })} required />
              <Input label="Project address" value={form.projectAddress} onChange={(value) => setForm({ ...form, projectAddress: value })} />
              <Input label="Valid until" type="date" value={form.validUntil} onChange={(value) => setForm({ ...form, validUntil: value })} />
              <Input label="Discount (₹)" type="number" value={form.discount} onChange={(value) => setForm({ ...form, discount: value })} />
            </div>

            <div className="mt-8 space-y-6">
              {sections.map((section, secIndex) => (
                <div key={secIndex} className="overflow-hidden rounded-2xl border border-line-strong bg-sage-50/30">
                  {/* Group (room) header — visibly editable */}
                  <div className="flex items-center gap-3 border-b border-line-strong bg-sage-100/70 px-5 py-3.5">
                    <Pencil size={14} className="shrink-0 text-sage-500" />
                    <input
                      value={section.name}
                      onChange={(e) => updateSectionName(secIndex, e.target.value)}
                      placeholder="Group name, e.g. Living Room"
                      className="min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-2 py-1 font-display text-lg font-semibold text-sage-900 outline-none transition focus:border-sage-400 focus:bg-white"
                      required
                    />
                    <button type="button" disabled={sections.length === 1} onClick={() => removeSection(secIndex)} title="Remove group" className="shrink-0 rounded-lg p-1.5 text-red-500 transition hover:bg-red-50 disabled:opacity-30">
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="divide-y divide-line-strong">
                    {section.subsections.map((sub, subIndex) => (
                      <div key={subIndex} className="p-4">
                        {/* Sub-group — optional, only shown as a labelled row on the PDF if named */}
                        <div className="flex items-center gap-2.5">
                          <Layers size={13} className="shrink-0 text-gold-deep" />
                          <input
                            value={sub.name}
                            onChange={(e) => updateSubsectionName(secIndex, subIndex, e.target.value)}
                            placeholder="Category (optional) — e.g. Carpentry, Electrical, Painting"
                            className="min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-2 py-1 text-sm font-bold uppercase tracking-wide text-gold-deep outline-none transition focus:border-gold/50 focus:bg-white"
                          />
                          <button type="button" disabled={section.subsections.length === 1} onClick={() => removeSubsection(secIndex, subIndex)} title="Remove sub-group" className="shrink-0 rounded-lg p-1.5 text-red-400 transition hover:bg-red-50 disabled:opacity-30">
                            <Trash2 size={14} />
                          </button>
                        </div>

                        <div className="mt-3 overflow-x-auto rounded-xl border border-line bg-white">
                          <table className="min-w-[720px] w-full text-left text-sm">
                            <thead className="bg-sage-50 text-[.62rem] uppercase tracking-label text-ink-muted">
                              <tr><th className="p-3 pl-4">Item name</th><th className="p-3">Qty</th><th className="p-3">Unit</th><th className="p-3">Unit price</th><th className="p-3">Amount</th><th /></tr>
                            </thead>
                            <tbody>
                              {sub.items.map((item, itemIndex) => (
                                <tr key={itemIndex} className="border-t border-line">
                                  <td className="p-2.5 pl-4"><input required value={item.itemName} onChange={(e) => updateItem(secIndex, subIndex, itemIndex, "itemName", e.target.value)} placeholder="e.g. Wardrobe 3x8.5 Sq.Ft. @1600" className="w-full rounded border-0 bg-transparent font-semibold outline-none focus:ring-2 focus:ring-sage-200" /></td>
                                  <td className="p-2.5"><input required min="0.01" step="any" type="number" value={item.quantity} onChange={(e) => updateItem(secIndex, subIndex, itemIndex, "quantity", e.target.value)} className="w-16 rounded border border-line p-2" /></td>
                                  <td className="p-2.5"><select value={item.unit} onChange={(e) => updateItem(secIndex, subIndex, itemIndex, "unit", e.target.value)} className="rounded border border-line p-2">{["Nos", "Sq ft", "Running ft", "Sq m", "Set", "Lump sum", "Ls"].map((unit) => <option key={unit}>{unit}</option>)}</select></td>
                                  <td className="p-2.5"><input required min="0" step="any" type="number" value={item.unitPrice} onChange={(e) => updateItem(secIndex, subIndex, itemIndex, "unitPrice", e.target.value)} className="w-28 rounded border border-line p-2" /></td>
                                  <td className="p-2.5 font-semibold">{money.format(Number(item.quantity || 0) * Number(item.unitPrice || 0))}</td>
                                  <td className="p-2.5 pr-4 text-right"><button type="button" disabled={sub.items.length === 1} onClick={() => removeItem(secIndex, subIndex, itemIndex)} className="text-red-500 disabled:opacity-30"><Trash2 size={15} /></button></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <button type="button" onClick={() => addItem(secIndex, subIndex)} className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-bold text-sage-700"><Plus size={13} /> Add item</button>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-line-strong bg-white p-3.5">
                    <button type="button" onClick={() => addSubsection(secIndex)} className="inline-flex items-center gap-2 rounded-lg border border-gold/40 bg-gold-soft/50 px-3 py-1.5 text-xs font-bold text-gold-deep transition hover:bg-gold-soft">
                      <Layers size={13} /> Add sub-group to {section.name || "this group"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button type="button" onClick={addSection} className="mt-6 inline-flex items-center gap-2 rounded-lg border border-sage-200 bg-sage-50 px-4 py-2 text-sm font-bold text-sage-700"><FolderPlus size={16} /> Add new group / room</button>

            <div className="mt-8 grid gap-4 md:grid-cols-[1fr_18rem]">
              <label className="text-sm font-semibold">Materials Details / Terms
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows="6" placeholder="e.g. 1. All Cabinet structures made Green Ecotec 710 Plywood..." className="mt-2 w-full rounded-xl border border-line-strong p-3 font-normal leading-relaxed" />
              </label>
              <div className="rounded-2xl bg-sage-950 p-5 text-white">
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-label text-sage-200"><Calculator size={15} /> Calculation</p>
                <div className="mt-4 space-y-2 text-sm text-sage-100">
                  <p className="flex justify-between"><span>Subtotal</span><span>{money.format(subtotal)}</span></p>
                  <p className="flex justify-between"><span>Discount</span><span>− {money.format(form.discount || 0)}</span></p>
                  <label className="flex items-center justify-between"><span>GST %</span><input type="number" min="0" max="100" value={form.taxRate} onChange={(e) => setForm({ ...form, taxRate: e.target.value })} className="w-14 rounded bg-white/10 p-1 text-right" /></label>
                  <p className="flex justify-between"><span>GST</span><span>{money.format(tax)}</span></p>
                  <p className="mt-3 flex justify-between border-t border-white/20 pt-3 text-base font-bold"><span>Total Amount</span><span>{money.format(total)}</span></p>
                </div>
              </div>
            </div>
            <button disabled={saving} className="btn-primary mt-6 w-full disabled:opacity-60">{saving ? "Saving…" : editorMode === "edit" ? "Save changes" : "Save quotation"}</button>
          </form>
        </div>
      )}
    </>
  );
}

function Input({ label, value, onChange, type = "text", required = false }) {
  return <label className="text-sm font-semibold">{label}<input type={type} required={required} value={value} onChange={(e) => onChange(e.target.value)} className="mt-2 w-full rounded-xl border border-line-strong p-3 font-normal" /></label>;
}
function Summary({ label, value }) {
  return <div className="rounded-2xl border border-line bg-white p-5 shadow-hair"><p className="text-[.62rem] font-bold uppercase tracking-label text-ink-muted">{label}</p><p className="mt-2 text-2xl font-semibold text-ink">{value}</p></div>;
}
