import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, Download, Eye, MapPin, Pencil, Trash2, X } from "lucide-react";
import { groupQuotationItems } from "../lib/quotationGrouping";

const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const STATUS_TONES = {
  Draft: "bg-sage-50 text-sage-700 ring-sage-200",
  Sent: "bg-blue-50 text-blue-700 ring-blue-200",
  Approved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Rejected: "bg-red-50 text-red-700 ring-red-200",
  Expired: "bg-amber-50 text-amber-700 ring-amber-200",
};

export default function QuotationDetailsCard({ quotation, loading, onClose, canEdit, canDelete, onEdit, onDelete, onPreview, onDownload, busy }) {
  if (!quotation) return null;
  const groups = groupQuotationItems(quotation.items || []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[75] flex items-start justify-center overflow-y-auto bg-sage-950/45 p-4 py-8 backdrop-blur-sm sm:items-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 360, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-float"
        >
          <div className="relative bg-sage-950 p-6 text-white">
            <button onClick={onClose} aria-label="Close" className="absolute right-4 top-4 rounded-full p-2 text-sage-200 transition hover:bg-white/10 hover:text-white"><X size={18} /></button>
            <p className="text-[0.6rem] font-bold uppercase tracking-label text-sage-300">Quotation</p>
            <h2 className="mt-1 font-display text-2xl">{quotation.quotationNo}</h2>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className={`inline-flex rounded-full px-2.5 py-1 text-[0.65rem] font-bold ring-1 ring-inset ${STATUS_TONES[quotation.status] || STATUS_TONES.Draft}`}>{quotation.status}</span>
              <span className="text-xs text-sage-300">{quotation.customerName} · {quotation.projectName}</span>
            </div>
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-6">
            {loading ? (
              <div className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-sage-50" />)}</div>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  {quotation.projectAddress && (
                    <div className="flex items-start gap-2.5 text-sm text-ink-soft"><MapPin size={14} className="mt-0.5 shrink-0 text-sage-500" /> {quotation.projectAddress}</div>
                  )}
                  {quotation.validUntil && (
                    <div className="flex items-start gap-2.5 text-sm text-ink-soft"><Calendar size={14} className="mt-0.5 shrink-0 text-sage-500" /> Valid until {quotation.validUntil.slice(0, 10)}</div>
                  )}
                </div>

                <div className="mt-5 space-y-5">
                  {groups.map((group) => (
                    <div key={group.name} className="overflow-hidden rounded-xl border border-line">
                      <div className="bg-sage-600 px-4 py-2 text-xs font-bold uppercase tracking-label text-white">{group.name}</div>
                      {group.subgroups.map((sub, subIdx) => (
                        <div key={subIdx} className={subIdx > 0 ? "border-t border-line" : ""}>
                          {sub.name && <p className="bg-gold-soft/40 px-4 py-1.5 text-[0.68rem] font-bold uppercase tracking-wide text-gold-deep">{sub.name}</p>}
                          <table className="min-w-full text-left text-sm">
                            <tbody>
                              {sub.items.map((item) => (
                                <tr key={item.id} className="border-t border-line first:border-t-0">
                                  <td className="px-4 py-2 font-medium text-ink">{item.itemName}</td>
                                  <td className="px-2 py-2 text-right text-ink-muted">{Number(item.quantity)} {item.unit}</td>
                                  <td className="px-4 py-2 text-right font-semibold text-ink">{money.format(item.lineTotal)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                <div className="mt-5 space-y-1.5 border-t border-line pt-4 text-sm">
                  <p className="flex justify-between text-ink-muted"><span>Subtotal</span><span>{money.format(quotation.subtotal)}</span></p>
                  <p className="flex justify-between text-ink-muted"><span>Discount</span><span>− {money.format(quotation.discount)}</span></p>
                  <p className="flex justify-between text-ink-muted"><span>GST ({Number(quotation.taxRate)}%)</span><span>{money.format(quotation.taxAmount)}</span></p>
                  <p className="flex justify-between border-t border-line pt-2 text-base font-bold text-ink"><span>Total</span><span>{money.format(quotation.grandTotal)}</span></p>
                </div>

                {quotation.notes && (
                  <div className="mt-4 rounded-xl border border-line bg-sage-50/50 p-4">
                    <p className="text-[0.62rem] font-bold uppercase tracking-label text-sage-600">Materials &amp; terms</p>
                    <p className="mt-1.5 whitespace-pre-line text-sm leading-6 text-ink-soft">{quotation.notes}</p>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-line bg-sage-50/40 p-4">
            <button onClick={() => onPreview(quotation)} disabled={busy} className="inline-flex items-center gap-1.5 rounded-full border border-line-strong px-3.5 py-2 text-xs font-bold text-ink-soft transition hover:border-sage-400 hover:bg-white disabled:opacity-50"><Eye size={14} /> Preview PDF</button>
            <button onClick={() => onDownload(quotation)} disabled={busy} className="inline-flex items-center gap-1.5 rounded-full border border-line-strong px-3.5 py-2 text-xs font-bold text-ink-soft transition hover:border-sage-400 hover:bg-white disabled:opacity-50"><Download size={14} /> Download PDF</button>
            {canEdit && <button onClick={() => onEdit(quotation)} className="inline-flex items-center gap-1.5 rounded-full border border-sage-300 bg-sage-50 px-3.5 py-2 text-xs font-bold text-sage-700 transition hover:bg-sage-100"><Pencil size={14} /> Edit quotation</button>}
            {canDelete && <button onClick={() => onDelete(quotation)} className="ml-auto inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50"><Trash2 size={14} /> Delete</button>}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
