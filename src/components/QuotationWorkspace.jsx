import React, { useEffect, useMemo, useState } from "react";
import { Calculator, FilePlus2, Plus, Trash2, FolderPlus } from "lucide-react";
import { api } from "../lib/api";

const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const blankItem = () => ({ itemName: "", description: "", quantity: 1, unit: "Lump sum", unitPrice: 0 });
const blankSection = (name = "Room 1") => ({ sectionName: name, items: [blankItem()] });

export default function QuotationWorkspace({ customers, projects = [] }) {
  const [quotes, setQuotes] = useState([]);
  const [showEditor, setShowEditor] = useState(false);
  const [sections, setSections] = useState([blankSection("Room 1")]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ customerId: "", projectId: "", customerName: "", projectName: "", projectAddress: "", validUntil: "", discount: 0, taxRate: 18, notes: "" });

  const load = () => api.getQuotations().then(setQuotes).catch((err) => setError(err.message));
  useEffect(() => { load(); }, []);

  const subtotal = useMemo(() => sections.reduce((secSum, sec) => secSum + sec.items.reduce((itemSum, item) => itemSum + Number(item.quantity || 0) * Number(item.unitPrice || 0), 0), 0), [sections]);
  const taxable = Math.max(0, subtotal - Number(form.discount || 0));
  const tax = taxable * Number(form.taxRate || 0) / 100;
  const total = taxable + tax;

  const updateSectionName = (secIndex, value) => setSections((prev) => prev.map((s, i) => i === secIndex ? { ...s, sectionName: value } : s));
  const addSection = () => setSections((prev) => [...prev, blankSection(`Room ${prev.length + 1}`)]);
  const removeSection = (secIndex) => setSections((prev) => prev.filter((_, i) => i !== secIndex));

  const updateItem = (secIndex, itemIndex, key, value) => setSections((prev) => prev.map((s, i) => i === secIndex ? { ...s, items: s.items.map((item, j) => j === itemIndex ? { ...item, [key]: value } : item) } : s));
  const addItem = (secIndex) => setSections((prev) => prev.map((s, i) => i === secIndex ? { ...s, items: [...s.items, blankItem()] } : s));
  const removeItem = (secIndex, itemIndex) => setSections((prev) => prev.map((s, i) => i === secIndex ? { ...s, items: s.items.filter((_, j) => j !== itemIndex) } : s));

  const selectCustomer = (id) => { 
    const customer = customers.find((item) => String(item.id) === id); 
    setForm((prev) => ({ ...prev, customerId: id, customerName: customer?.name || prev.customerName, projectId: "", projectName: "", projectAddress: "" })); 
  };
  const selectProject = (id) => {
    const project = projects.find((item) => String(item.id) === id);
    setForm((prev) => ({ ...prev, projectId: id, projectName: project?.name || prev.projectName, projectAddress: project?.siteAddress || prev.projectAddress }));
  };

  const save = async (event) => { 
    event.preventDefault(); 
    setSaving(true); 
    setError(""); 
    try { 
      const flatItems = sections.flatMap((sec) => sec.items.map(item => ({ ...item, description: sec.sectionName, quantity: Number(item.quantity), unitPrice: Number(item.unitPrice) })));
      if (flatItems.length === 0) throw new Error("Please add at least one item.");
      const created = await api.createQuotation({ 
        ...form, 
        customerId: form.customerId ? Number(form.customerId) : null, 
        projectId: form.projectId ? Number(form.projectId) : null,
        discount: Number(form.discount || 0), 
        taxRate: Number(form.taxRate || 0), 
        items: flatItems 
      }); 
      setQuotes((prev) => [created, ...prev]); 
      setShowEditor(false); 
      setSections([blankSection("Room 1")]); 
      setForm({ customerId: "", projectId: "", customerName: "", projectName: "", projectAddress: "", validUntil: "", discount: 0, taxRate: 18, notes: "" }); 
    } catch (err) { 
      setError(err.message || "Could not save quotation."); 
    } finally { 
      setSaving(false); 
    } 
  };

  const customerProjects = projects.filter(p => !form.customerId || String(p.customerId) === String(form.customerId));

  return <><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><h2 className="font-display text-3xl">Quotations</h2><p className="mt-1 text-sm text-ink-muted">Build precise, itemised proposals grouped by rooms/sections.</p></div><button onClick={() => setShowEditor(true)} className="btn-primary"><FilePlus2 size={16} /> Create quotation</button></div>{error && <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}<div className="mt-6 grid gap-4 sm:grid-cols-3"><Summary label="Total quotations" value={quotes.length} /><Summary label="Draft value" value={money.format(quotes.filter((quote) => quote.status === "Draft").reduce((sum, quote) => sum + Number(quote.grandTotal || 0), 0))} /><Summary label="Approved" value={quotes.filter((quote) => quote.status === "Approved").length} /></div><div className="mt-6 overflow-hidden rounded-2xl border border-line bg-white shadow-hair"><div className="border-b border-line p-5"><p className="text-[.62rem] font-bold uppercase tracking-label text-sage-600">Commercial register</p><h3 className="mt-1 font-display text-xl">Project quotations</h3></div><div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-sage-50 text-[.62rem] uppercase tracking-label text-ink-muted"><tr>{["Reference", "Customer / project", "Status", "Valid until", "Total"].map((title) => <th key={title} className="px-5 py-3 font-bold">{title}</th>)}</tr></thead><tbody>{quotes.map((quote) => <tr key={quote.id} className="border-t border-line"><td className="px-5 py-4 font-semibold text-sage-700">{quote.quotationNo}</td><td className="px-5 py-4"><p className="font-semibold">{quote.customerName}</p><p className="mt-1 text-xs text-ink-muted">{quote.projectName}</p></td><td className="px-5 py-4"><span className="rounded-full bg-sage-100 px-2.5 py-1 text-xs font-bold text-sage-700">{quote.status}</span></td><td className="px-5 py-4 text-ink-muted">{quote.validUntil ? quote.validUntil.slice(0, 10) : "—"}</td><td className="px-5 py-4 font-semibold">{money.format(quote.grandTotal || 0)}</td></tr>)}</tbody></table>{!quotes.length && <p className="p-8 text-center text-sm text-ink-muted">No quotations created yet.</p>}</div></div>
  {showEditor && <div className="fixed inset-0 z-[70] overflow-y-auto bg-sage-950/45 p-4 backdrop-blur-sm"><form onSubmit={save} className="mx-auto my-6 max-w-5xl rounded-3xl bg-white p-6 shadow-float"><div className="flex items-start justify-between gap-4"><div><p className="text-[.62rem] font-bold uppercase tracking-label text-sage-600">Quotation builder</p><h3 className="mt-1 font-display text-2xl">New project quotation</h3></div><button type="button" onClick={() => setShowEditor(false)} className="text-sm font-bold text-ink-muted">Close</button></div><div className="mt-6 grid gap-4 md:grid-cols-3"><label className="text-sm font-semibold">Existing customer<select value={form.customerId} onChange={(e) => selectCustomer(e.target.value)} className="mt-2 w-full rounded-xl border border-line-strong bg-white p-3 font-normal"><option value="">New / unlisted customer</option>{customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}</select></label><label className="text-sm font-semibold">Existing Project<select value={form.projectId} onChange={(e) => selectProject(e.target.value)} className="mt-2 w-full rounded-xl border border-line-strong bg-white p-3 font-normal"><option value="">Select project</option>{customerProjects.map((proj) => <option key={proj.id} value={proj.id}>{proj.name} — {proj.projectType}</option>)}</select></label><Input label="Customer name" value={form.customerName} onChange={(value) => setForm({ ...form, customerName: value })} required /><Input label="Project name" value={form.projectName} onChange={(value) => setForm({ ...form, projectName: value })} required /><Input label="Project address" value={form.projectAddress} onChange={(value) => setForm({ ...form, projectAddress: value })} /><Input label="Valid until" type="date" value={form.validUntil} onChange={(value) => setForm({ ...form, validUntil: value })} /><Input label="Discount (₹)" type="number" value={form.discount} onChange={(value) => setForm({ ...form, discount: value })} /></div>
  
  <div className="mt-8 space-y-6">
    {sections.map((section, secIndex) => (
      <div key={secIndex} className="rounded-2xl border border-line bg-sage-50/30 overflow-hidden">
        <div className="flex items-center justify-between border-b border-line bg-sage-50 px-5 py-3">
          <input value={section.sectionName} onChange={(e) => updateSectionName(secIndex, e.target.value)} placeholder="Room Name (e.g., Master Bedroom)" className="bg-transparent font-display text-lg outline-none font-semibold text-sage-900 w-1/2" required />
          <button type="button" disabled={sections.length === 1} onClick={() => removeSection(secIndex)} className="text-red-500 disabled:opacity-30"><Trash2 size={16} /></button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[760px] w-full text-left text-sm">
            <thead className="bg-white/50 text-[.62rem] uppercase tracking-label text-ink-muted"><tr><th className="p-3 pl-5">Item name</th><th className="p-3">Qty</th><th className="p-3">Unit</th><th className="p-3">Unit price</th><th className="p-3">Amount</th><th /></tr></thead>
            <tbody>
              {section.items.map((item, itemIndex) => (
                <tr key={itemIndex} className="border-t border-line bg-white">
                  <td className="p-3 pl-5"><input required value={item.itemName} onChange={(e) => updateItem(secIndex, itemIndex, "itemName", e.target.value)} placeholder="e.g. Wardrobe 3x8.5 Sq.Ft. @1600" className="w-full border-0 bg-transparent font-semibold outline-none" /></td>
                  <td className="p-3"><input required min="0.01" step="any" type="number" value={item.quantity} onChange={(e) => updateItem(secIndex, itemIndex, "quantity", e.target.value)} className="w-16 rounded border border-line p-2" /></td>
                  <td className="p-3"><select value={item.unit} onChange={(e) => updateItem(secIndex, itemIndex, "unit", e.target.value)} className="rounded border border-line p-2">{["Nos", "Sq ft", "Running ft", "Sq m", "Set", "Lump sum", "Ls"].map((unit) => <option key={unit}>{unit}</option>)}</select></td>
                  <td className="p-3"><input required min="0" step="any" type="number" value={item.unitPrice} onChange={(e) => updateItem(secIndex, itemIndex, "unitPrice", e.target.value)} className="w-28 rounded border border-line p-2" /></td>
                  <td className="p-3 font-semibold">{money.format(Number(item.quantity || 0) * Number(item.unitPrice || 0))}</td>
                  <td className="p-3 text-right pr-5"><button type="button" disabled={section.items.length === 1} onClick={() => removeItem(secIndex, itemIndex)} className="text-red-500 disabled:opacity-30"><Trash2 size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-white p-3 pl-5 border-t border-line">
          <button type="button" onClick={() => addItem(secIndex)} className="inline-flex items-center gap-2 text-xs font-bold text-sage-700"><Plus size={14} /> Add item to {section.sectionName}</button>
        </div>
      </div>
    ))}
  </div>
  
  <button type="button" onClick={addSection} className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-sage-700 bg-sage-50 px-4 py-2 rounded-lg border border-sage-200"><FolderPlus size={16} /> Add new room / section</button>
  
  <div className="mt-8 grid gap-4 md:grid-cols-[1fr_18rem]"><label className="text-sm font-semibold">Materials Details / Terms<textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows="6" placeholder="e.g. 1. All Cabinet structures made Green Ecotec 710 Plywood..." className="mt-2 w-full rounded-xl border border-line-strong p-3 font-normal leading-relaxed" /></label><div className="rounded-2xl bg-sage-950 p-5 text-white"><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-label text-sage-200"><Calculator size={15} /> Calculation</p><div className="mt-4 space-y-2 text-sm text-sage-100"><p className="flex justify-between"><span>Subtotal</span><span>{money.format(subtotal)}</span></p><p className="flex justify-between"><span>Discount</span><span>− {money.format(form.discount || 0)}</span></p><label className="flex items-center justify-between"><span>GST %</span><input type="number" min="0" max="100" value={form.taxRate} onChange={(e) => setForm({ ...form, taxRate: e.target.value })} className="w-14 rounded bg-white/10 p-1 text-right" /></label><p className="flex justify-between"><span>GST</span><span>{money.format(tax)}</span></p><p className="mt-3 flex justify-between border-t border-white/20 pt-3 text-base font-bold"><span>Total Amount</span><span>{money.format(total)}</span></p></div></div></div><button disabled={saving} className="btn-primary mt-6 w-full disabled:opacity-60">{saving ? "Saving…" : "Save quotation"}</button></form></div>}</>;
}

function Input({ label, value, onChange, type = "text", required = false }) { return <label className="text-sm font-semibold">{label}<input type={type} required={required} value={value} onChange={(e) => onChange(e.target.value)} className="mt-2 w-full rounded-xl border border-line-strong p-3 font-normal" /></label>; }
function Summary({ label, value }) { return <div className="rounded-2xl border border-line bg-white p-5 shadow-hair"><p className="text-[.62rem] font-bold uppercase tracking-label text-ink-muted">{label}</p><p className="mt-2 text-2xl font-semibold text-ink">{value}</p></div>; }
