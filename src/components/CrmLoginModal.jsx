import React, { useState } from "react";
import { LockKeyhole, X } from "lucide-react";
import { api, setToken } from "../lib/api";

export default function CrmLoginModal({ onClose, onAuthenticated }) {
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (event) => { event.preventDefault(); setLoading(true); setError(""); try { const { token } = await api.login(employeeId.trim(), password); setToken(token); onAuthenticated(); } catch (err) { setError(err.message || "Unable to sign in."); } finally { setLoading(false); } };
  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-sage-950/45 p-4 backdrop-blur-sm"><form onSubmit={submit} className="w-full max-w-md rounded-3xl bg-white p-7 shadow-float"><div className="flex items-start justify-between"><div><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sage-100 text-sage-700"><LockKeyhole size={20} /></span><p className="mt-5 text-[.62rem] font-bold uppercase tracking-label text-sage-600">Employee login</p><h2 className="mt-2 font-display text-3xl text-ink">Sign in</h2></div><button type="button" onClick={onClose} className="rounded-full p-2 text-ink-muted hover:bg-sage-50"><X size={18} /></button></div><label className="mt-7 block text-sm font-semibold text-ink">Employee ID<input autoFocus value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className="mt-2 w-full rounded-xl border border-line-strong px-4 py-3 outline-none focus:border-sage-500" /></label><label className="mt-4 block text-sm font-semibold text-ink">Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-line-strong px-4 py-3 outline-none focus:border-sage-500" /></label>{error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}<button disabled={loading} className="btn-primary mt-6 w-full disabled:opacity-60">{loading ? "Signing in…" : "Continue"}</button></form></div>;
}
