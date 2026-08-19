"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, MapPin, MessageCircle, Phone, Sparkles, Trash2, X } from "lucide-react";
import { Avatar, Badge, money } from "../../lib/crm/crmUi";

function Row({ icon: Icon, label, value, href }) {
  if (!value) return null;
  const content = (
    <div className="flex items-start gap-3 py-2.5">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sage-50 text-sage-600"><Icon size={14} /></span>
      <div className="min-w-0">
        <p className="text-[0.62rem] font-bold uppercase tracking-label text-ink-muted">{label}</p>
        <p className="mt-0.5 truncate text-sm font-semibold text-ink">{value}</p>
      </div>
    </div>
  );
  return href ? <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noopener noreferrer" : undefined} className="block rounded-xl transition hover:bg-sage-50/60">{content}</a> : content;
}

export default function LeadDetailsCard({ lead, onClose, canDelete, onDelete }) {
  if (!lead) return null;
  const digits = (lead.phone || "").replace(/[^\d+]/g, "");

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
            <div className="flex items-center gap-4">
              <Avatar name={lead.name} size={14} />
              <div className="min-w-0">
                <p className="text-[0.6rem] font-bold uppercase tracking-label text-sage-300">Lead</p>
                <h2 className="mt-0.5 truncate font-display text-2xl">{lead.name}</h2>
                <div className="mt-2 flex items-center gap-2">
                  <Badge type={lead.stage}>{lead.stage}</Badge>
                  <span className="text-xs text-sage-300">{lead.source}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="max-h-[65vh] overflow-y-auto p-6">
            <div className="grid gap-1 sm:grid-cols-2">
              <Row icon={Phone} label="Phone" value={lead.phone} href={digits ? `tel:${digits}` : undefined} />
              <Row icon={MessageCircle} label="WhatsApp" value={digits ? lead.phone : null} href={digits ? `https://wa.me/${digits.replace("+", "")}` : undefined} />
              <Row icon={MapPin} label="City" value={lead.city} />
              <Row icon={MapPin} label="Address" value={lead.address} />
              <Row icon={Sparkles} label="Estimated value" value={lead.value ? money.format(lead.value) : null} />
              <Row icon={Calendar} label="Next action" value={lead.nextActionDate ? lead.nextActionDate.slice(0, 10) : null} />
            </div>

            {lead.project && (
              <div className="mt-4 rounded-2xl border border-line bg-sage-50/50 p-4">
                <p className="text-[0.62rem] font-bold uppercase tracking-label text-sage-600">Project</p>
                <p className="mt-1 text-sm font-semibold text-ink">{lead.project}</p>
              </div>
            )}

            {lead.message && (
              <div className="mt-4 rounded-2xl border border-line bg-white p-4">
                <p className="text-[0.62rem] font-bold uppercase tracking-label text-sage-600">Message</p>
                <p className="mt-1.5 text-sm leading-6 text-ink-soft">{lead.message}</p>
              </div>
            )}

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 text-xs text-ink-muted">
              <span>Owner: {lead.owner || "Unassigned"}</span>
              <span>Added {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}</span>
            </div>
          </div>

          {canDelete && (
            <div className="border-t border-line bg-sage-50/40 p-4">
              <button
                onClick={() => { onDelete(lead); onClose(); }}
                className="inline-flex items-center gap-2 text-xs font-bold text-red-600 hover:underline"
              >
                <Trash2 size={14} /> Delete this lead
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
