"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Ban, Calendar, Download, Eye, Pencil, RotateCcw, Trash2, X } from "lucide-react";

const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });

const STATUS_TONES = {
  Active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Cancelled: "bg-red-50 text-red-700 ring-red-200",
};

function Row({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-4 border-t border-line py-2.5 text-sm first:border-t-0">
      <span className="shrink-0 font-semibold text-ink-muted">{label}</span>
      <span className="text-right text-ink">{value}</span>
    </div>
  );
}

export default function ReceiptDetailsCard({
  receipt,
  loading,
  busy,
  onClose,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
  onPreview,
  onDownload,
  onToggleStatus,
}) {
  if (!receipt) return null;
  const cancelled = receipt.status === "Cancelled";

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
          className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-float"
        >
          <div className="relative bg-sage-950 p-6 text-white">
            <button onClick={onClose} aria-label="Close" className="absolute right-4 top-4 rounded-full p-2 text-sage-200 transition hover:bg-white/10 hover:text-white"><X size={18} /></button>
            <p className="text-[0.6rem] font-bold uppercase tracking-label text-sage-300">Money receipt</p>
            <h2 className="mt-1 font-display text-2xl">{receipt.receiptNo}</h2>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className={`inline-flex rounded-full px-2.5 py-1 text-[0.65rem] font-bold ring-1 ring-inset ${STATUS_TONES[receipt.status] || STATUS_TONES.Active}`}>{receipt.status}</span>
              <span className="text-xs text-sage-300">{receipt.customerName}{receipt.projectName ? ` · ${receipt.projectName}` : ""}</span>
            </div>
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-6">
            {loading ? (
              <div className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="h-14 animate-pulse rounded-xl bg-sage-50" />)}</div>
            ) : (
              <>
                <div className="rounded-2xl bg-sage-950 p-5 text-white">
                  <p className="text-[0.6rem] font-bold uppercase tracking-label text-sage-300">Amount received</p>
                  <p className="mt-1 font-display text-3xl">{money.format(receipt.amount || 0)}</p>
                  <p className="mt-2 text-xs leading-5 text-sage-200">{receipt.amountInWords}</p>
                </div>

                <div className="mt-4">
                  <Row label="Received from" value={receipt.customerName} />
                  <Row label="Project" value={receipt.projectName} />
                  <Row label="Payment mode" value={receipt.paymentMode} />
                  <Row label="Reference no." value={receipt.referenceNo} />
                  <Row label="Towards" value={receipt.towards} />
                  <Row
                    label="Received on"
                    value={receipt.receivedOn ? (
                      <span className="inline-flex items-center gap-1.5"><Calendar size={13} className="text-sage-500" />{receipt.receivedOn.slice(0, 10)}</span>
                    ) : null}
                  />
                  <Row label="Issued by" value={receipt.createdBy} />
                </div>

                {receipt.notes && (
                  <div className="mt-4 rounded-xl border border-line bg-sage-50/50 p-4">
                    <p className="text-[0.62rem] font-bold uppercase tracking-label text-sage-600">Notes</p>
                    <p className="mt-1.5 whitespace-pre-line text-sm leading-6 text-ink-soft">{receipt.notes}</p>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-line bg-sage-50/40 p-4">
            <button onClick={() => onPreview(receipt)} disabled={busy} className="inline-flex items-center gap-1.5 rounded-full border border-line-strong px-3.5 py-2 text-xs font-bold text-ink-soft transition hover:border-sage-400 hover:bg-white disabled:opacity-50"><Eye size={14} /> Preview PDF</button>
            <button onClick={() => onDownload(receipt)} disabled={busy} className="inline-flex items-center gap-1.5 rounded-full border border-line-strong px-3.5 py-2 text-xs font-bold text-ink-soft transition hover:border-sage-400 hover:bg-white disabled:opacity-50"><Download size={14} /> Download PDF</button>
            {canEdit && !cancelled && (
              <button onClick={() => onEdit(receipt)} className="inline-flex items-center gap-1.5 rounded-full border border-sage-300 bg-sage-50 px-3.5 py-2 text-xs font-bold text-sage-700 transition hover:bg-sage-100"><Pencil size={14} /> Edit</button>
            )}
            {canEdit && (
              <button
                onClick={() => onToggleStatus(receipt)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-bold transition ${cancelled ? "border-emerald-300 text-emerald-700 hover:bg-emerald-50" : "border-amber-300 text-amber-700 hover:bg-amber-50"}`}
              >
                {cancelled ? <><RotateCcw size={14} /> Reinstate</> : <><Ban size={14} /> Cancel receipt</>}
              </button>
            )}
            {canDelete && (
              <button onClick={() => onDelete(receipt)} className="ml-auto inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50"><Trash2 size={14} /> Delete</button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
