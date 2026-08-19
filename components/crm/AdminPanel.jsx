"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  KeyRound,
  Pencil,
  Plus,
  Shield,
  ShieldCheck,
  Trash2,
  UserCog,
  Users,
  X,
} from "lucide-react";
import { api, RESOURCES, ACTIONS } from "../../lib/crm/api";
import { useConfirm, useToast } from "../../lib/crm/notifications";

const RESOURCE_META = {
  leads: { label: "Leads", hint: "Enquiries & pipeline" },
  customers: { label: "Customers", hint: "Client records" },
  followups: { label: "Follow-ups", hint: "Tasks & reminders" },
  quotations: { label: "Quotations", hint: "Estimates & pricing" },
  projects: { label: "Projects", hint: "Execution & payments" },
};
const ACTION_LABELS = { create: "Create", read: "View", update: "Edit", delete: "Delete" };
const AVATAR_HUES = ["bg-sage-100 text-sage-700", "bg-gold-soft text-gold-deep", "bg-blue-50 text-blue-700", "bg-violet-50 text-violet-700", "bg-amber-50 text-amber-700", "bg-teal-50 text-teal-700"];

function avatarHue(name) {
  const sum = [...(name || "?")].reduce((s, c) => s + c.charCodeAt(0), 0);
  return AVATAR_HUES[sum % AVATAR_HUES.length];
}

function emptyPermissions() {
  return Object.fromEntries(RESOURCES.map((r) => [r, []]));
}

function accessSummary(emp) {
  if (emp.isSuperAdmin) return "Full access to everything";
  const total = Object.values(emp.permissions || {}).reduce((sum, a) => sum + a.length, 0);
  if (!total) return "No access granted yet";
  const modules = Object.entries(emp.permissions || {}).filter(([, actions]) => actions.length).length;
  return `${total} right${total === 1 ? "" : "s"} across ${modules} module${modules === 1 ? "" : "s"}`;
}

function PermissionGrid({ permissions, onChange, disabled }) {
  const setResource = (resource, actions) => onChange({ ...permissions, [resource]: actions });
  const toggle = (resource, action) => {
    const current = new Set(permissions[resource] || []);
    if (current.has(action)) current.delete(action);
    else current.add(action);
    setResource(resource, Array.from(current));
  };
  const applyPreset = (resource, preset) => {
    if (preset === "full") setResource(resource, [...ACTIONS]);
    else if (preset === "view") setResource(resource, ["read"]);
    else setResource(resource, []);
  };

  return (
    <div className={`overflow-hidden rounded-2xl border border-line ${disabled ? "pointer-events-none opacity-40" : ""}`}>
      <table className="min-w-full text-left text-sm">
        <thead className="bg-sage-50 text-[.62rem] uppercase tracking-label text-ink-muted">
          <tr>
            <th className="px-4 py-3 font-bold">Module</th>
            {ACTIONS.map((action) => (
              <th key={action} className="px-3 py-3 text-center font-bold">{ACTION_LABELS[action]}</th>
            ))}
            <th className="px-3 py-3 font-bold">Quick set</th>
          </tr>
        </thead>
        <tbody>
          {RESOURCES.map((resource) => {
            const active = permissions[resource] || [];
            return (
              <tr key={resource} className="border-t border-line">
                <td className="px-4 py-3">
                  <p className="font-semibold text-ink">{RESOURCE_META[resource].label}</p>
                  <p className="text-xs text-ink-muted">{RESOURCE_META[resource].hint}</p>
                </td>
                {ACTIONS.map((action) => (
                  <td key={action} className="px-3 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={active.includes(action)}
                      onChange={() => toggle(resource, action)}
                      className="h-4 w-4 rounded border-line-strong text-sage-600 focus:ring-2 focus:ring-sage-300"
                    />
                  </td>
                ))}
                <td className="px-3 py-3">
                  <div className="flex gap-1.5">
                    <button type="button" onClick={() => applyPreset(resource, "full")} className="rounded-full border border-line-strong px-2.5 py-1 text-[0.6rem] font-bold text-ink-soft transition hover:border-sage-400 hover:text-sage-700">Full</button>
                    <button type="button" onClick={() => applyPreset(resource, "view")} className="rounded-full border border-line-strong px-2.5 py-1 text-[0.6rem] font-bold text-ink-soft transition hover:border-sage-400 hover:text-sage-700">View</button>
                    <button type="button" onClick={() => applyPreset(resource, "none")} className="rounded-full border border-line-strong px-2.5 py-1 text-[0.6rem] font-bold text-ink-soft transition hover:border-red-300 hover:text-red-600">None</button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function EmployeeFormModal({ mode, initial, onClose, onSaved }) {
  const toast = useToast();
  const [employeeCode, setEmployeeCode] = useState(initial?.employeeCode || "");
  const [name, setName] = useState(initial?.name || "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(initial?.role || "CRM Team Member");
  const [isSuperAdmin, setIsSuperAdmin] = useState(initial?.isSuperAdmin || false);
  const [permissions, setPermissions] = useState(
    initial?.permissions && Object.keys(initial.permissions).length ? { ...emptyPermissions(), ...initial.permissions } : emptyPermissions(),
  );
  const [saving, setSaving] = useState(false);

  const grantedCount = Object.values(permissions).reduce((sum, a) => sum + a.length, 0);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (mode === "create") {
        const created = await api.createEmployee({ employeeCode, name, password, role, isSuperAdmin, permissions });
        onSaved(created, "created");
        toast.success({ title: "Team member added", message: `${created.name} can now sign in with ID ${created.employeeCode}.` });
      } else {
        const patch = { name, role, isSuperAdmin, permissions };
        if (password) patch.password = password;
        const updated = await api.updateEmployee(initial.id, patch);
        onSaved(updated, "updated");
        toast.success({ title: "Access updated", message: `${updated.name}'s permissions were saved.` });
      }
      onClose();
    } catch (err) {
      toast.error(err.message || "Could not save this team member.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-sage-950/45 p-4 py-8 backdrop-blur-sm sm:items-center"
    >
      <motion.form
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 340, damping: 28 }}
        onSubmit={submit}
        className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-float sm:p-7"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sage-50 text-sage-700"><UserCog size={20} /></span>
            <div>
              <p className="text-[.62rem] font-bold uppercase tracking-label text-sage-600">Rights control</p>
              <h2 className="mt-0.5 font-display text-2xl">{mode === "create" ? "Add team member" : `Edit ${initial.name}`}</h2>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-ink-muted transition hover:bg-sage-50"><X size={18} /></button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold">Employee ID
            <input value={employeeCode} onChange={(e) => setEmployeeCode(e.target.value)} disabled={mode === "edit"} required placeholder="e.g. PRIYA01" className="mt-2 w-full rounded-xl border border-line-strong px-3 py-2.5 text-sm font-normal outline-none transition focus:border-sage-500 focus:ring-4 focus:ring-sage-100 disabled:bg-sage-50 disabled:text-ink-muted" />
          </label>
          <label className="text-sm font-semibold">Full name
            <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Priya Sharma" className="mt-2 w-full rounded-xl border border-line-strong px-3 py-2.5 text-sm font-normal outline-none transition focus:border-sage-500 focus:ring-4 focus:ring-sage-100" />
          </label>
          <label className="text-sm font-semibold">{mode === "create" ? "Password" : "New password"}
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required={mode === "create"} minLength={8} placeholder={mode === "edit" ? "Leave blank to keep current" : "Minimum 8 characters"} className="mt-2 w-full rounded-xl border border-line-strong px-3 py-2.5 text-sm font-normal outline-none transition focus:border-sage-500 focus:ring-4 focus:ring-sage-100" />
          </label>
          <label className="text-sm font-semibold">Role / title
            <input value={role} onChange={(e) => setRole(e.target.value)} required placeholder="e.g. Sales Executive" className="mt-2 w-full rounded-xl border border-line-strong px-3 py-2.5 text-sm font-normal outline-none transition focus:border-sage-500 focus:ring-4 focus:ring-sage-100" />
          </label>
        </div>

        <label className={`mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border p-4 text-sm transition ${isSuperAdmin ? "border-gold/50 bg-gold-soft/70" : "border-line hover:border-line-strong"}`}>
          <input type="checkbox" checked={isSuperAdmin} onChange={(e) => setIsSuperAdmin(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-line-strong text-sage-600 focus:ring-2 focus:ring-sage-300" />
          <span>
            <span className="flex items-center gap-1.5 font-bold text-ink"><ShieldCheck size={15} className="text-gold-deep" /> Super admin — ultra rights</span>
            <span className="mt-0.5 block text-xs leading-5 text-ink-muted">Full CRUD on every module, permanent deletion rights, and access to this Team &amp; access panel. Module permissions below are ignored once this is on.</span>
          </span>
        </label>

        <div className="mt-5">
          <div className="flex items-center justify-between">
            <p className="text-[.62rem] font-bold uppercase tracking-label text-sage-600">Module permissions</p>
            {!isSuperAdmin && <span className="text-xs font-semibold text-ink-muted">{grantedCount} right{grantedCount === 1 ? "" : "s"} selected</span>}
          </div>
          <div className="mt-2"><PermissionGrid permissions={permissions} onChange={setPermissions} disabled={isSuperAdmin} /></div>
        </div>

        <button disabled={saving} className="btn-primary mt-6 w-full justify-center disabled:opacity-60">
          {saving ? "Saving…" : mode === "create" ? "Create team member" : "Save changes"}
        </button>
      </motion.form>
    </motion.div>
  );
}

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-line bg-white p-4 shadow-hair">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sage-50 text-sage-700"><Icon size={17} /></span>
      <div><p className="text-lg font-bold leading-none text-ink">{value}</p><p className="mt-1 text-xs text-ink-muted">{label}</p></div>
    </div>
  );
}

export default function AdminPanel({ currentEmployee }) {
  const toast = useToast();
  const confirm = useConfirm();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    setLoading(true);
    api.getEmployees()
      .then(setEmployees)
      .catch((err) => toast.error(err.message || "Could not load the team."))
      .finally(() => setLoading(false));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(load, []);

  const activeSuperAdmins = useMemo(
    () => employees.filter((e) => e.isSuperAdmin && e.status === "Active").map((e) => e.id),
    [employees],
  );

  const handleSaved = (record, kind) => {
    setEmployees((prev) => (kind === "created" ? [...prev, record] : prev.map((e) => (e.id === record.id ? record : e))));
  };

  const toggleStatus = async (emp) => {
    if (emp.id === currentEmployee.id) {
      toast.warning("You can't disable your own account while signed in.");
      return;
    }
    const disabling = emp.status === "Active";
    if (disabling && emp.isSuperAdmin && activeSuperAdmins.length <= 1) {
      toast.warning({ title: "At least one super admin must stay active", message: "Promote another team member to super admin first, then you can disable this one." });
      return;
    }
    const ok = await confirm({
      title: disabling ? `Disable ${emp.name}?` : `Re-activate ${emp.name}?`,
      message: disabling ? "They'll be signed out and won't be able to log back in until you re-activate them." : "They'll be able to sign in again immediately.",
      confirmText: disabling ? "Disable account" : "Re-activate",
      danger: disabling,
    });
    if (!ok) return;
    setBusyId(emp.id);
    try {
      const updated = await api.updateEmployee(emp.id, { status: disabling ? "Disabled" : "Active" });
      setEmployees((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      toast.success(disabling ? `${emp.name} has been disabled.` : `${emp.name} is active again.`);
    } catch (err) {
      toast.error(err.message || "Could not update this account.");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (emp) => {
    if (emp.id === currentEmployee.id) {
      toast.warning({ title: "You can't delete your own account", message: "Sign in as another super admin to remove this account." });
      return;
    }
    if (emp.isSuperAdmin && activeSuperAdmins.length <= 1) {
      toast.warning({ title: "At least one super admin must remain", message: "Promote another team member to super admin before deleting this one." });
      return;
    }
    const ok = await confirm({
      title: `Delete ${emp.name}?`,
      message: "This permanently removes their account and sign-in access. Records they created (leads, projects, quotations…) are kept for your history. This cannot be undone.",
      confirmText: "Delete permanently",
      danger: true,
    });
    if (!ok) return;
    setBusyId(emp.id);
    try {
      await api.deleteEmployee(emp.id);
      setEmployees((prev) => prev.filter((e) => e.id !== emp.id));
      toast.success(`${emp.name}'s account has been deleted.`);
    } catch (err) {
      toast.error(err.message || "Could not delete this team member.");
    } finally {
      setBusyId(null);
    }
  };

  const superAdminCount = employees.filter((e) => e.isSuperAdmin).length;
  const activeCount = employees.filter((e) => e.status === "Active").length;

  return (
    <>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-display text-3xl">Team &amp; access</h2>
          <p className="mt-1 text-sm text-ink-muted">Create team members and control exactly what each one can see, add, edit or delete.</p>
        </div>
        <button onClick={() => setModal({ mode: "create", initial: null })} className="btn-primary"><Plus size={16} /> Add team member</button>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <StatCard label="Team members" value={employees.length} icon={Users} />
        <StatCard label="Active accounts" value={activeCount} icon={ShieldCheck} />
        <StatCard label="Super admins" value={superAdminCount} icon={Shield} />
      </div>

      <div className="mt-6 overflow-visible rounded-2xl border border-line bg-white shadow-hair">
        {loading ? (
          <div className="space-y-3 p-5">{[0, 1, 2].map((i) => <div key={i} className="h-14 animate-pulse rounded-xl bg-sage-50" />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-sage-50 text-[.62rem] uppercase tracking-label text-ink-muted">
                <tr>{["Team member", "Role", "Access level", "Status", ""].map((x) => <th key={x} className="px-5 py-3.5 font-bold">{x}</th>)}</tr>
              </thead>
              <tbody>
                {employees.map((emp) => {
                  const isSelf = emp.id === currentEmployee.id;
                  const isLastSuperAdmin = emp.isSuperAdmin && activeSuperAdmins.length <= 1 && activeSuperAdmins.includes(emp.id);
                  const deleteBlockedReason = isSelf
                    ? "You can't delete your own account"
                    : isLastSuperAdmin
                    ? "At least one active super admin must remain — promote someone else first"
                    : null;
                  return (
                    <tr key={emp.id} className="border-t border-line transition hover:bg-sage-50/40">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display text-sm font-semibold ${avatarHue(emp.name)}`}>
                            {emp.name.slice(0, 1).toUpperCase()}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-ink">{emp.name}{isSelf && <span className="ml-1.5 rounded-full bg-sage-100 px-2 py-0.5 text-[0.6rem] font-bold text-sage-700">You</span>}</p>
                            <p className="text-xs text-ink-muted">{emp.employeeCode}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-ink-soft">{emp.role}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.65rem] font-bold ring-1 ring-inset ${emp.isSuperAdmin ? "bg-gold-soft text-gold-deep ring-gold/40" : "bg-sage-50 text-sage-700 ring-sage-200"}`}>
                          {emp.isSuperAdmin ? <ShieldCheck size={12} /> : <Shield size={12} />} {emp.isSuperAdmin ? "Super admin" : "Admin"}
                        </span>
                        <p className="mt-1.5 text-xs text-ink-muted">{accessSummary(emp)}</p>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => toggleStatus(emp)}
                          disabled={busyId === emp.id}
                          title={isSelf ? "You can't disable your own account" : ""}
                          className={`rounded-full px-2.5 py-1 text-[0.65rem] font-bold ring-1 ring-inset transition disabled:opacity-50 ${emp.status === "Active" ? "bg-emerald-50 text-emerald-700 ring-emerald-200 hover:bg-emerald-100" : "bg-red-50 text-red-700 ring-red-200 hover:bg-red-100"}`}
                        >
                          {emp.status}
                        </button>
                      </td>
                      <td className="relative px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => setModal({ mode: "edit", initial: emp })} aria-label={`Edit ${emp.name}`} title="Edit rights" className="rounded-lg p-2 text-sage-700 transition hover:bg-sage-50"><Pencil size={15} /></button>
                          <button
                            onClick={() => remove(emp)}
                            disabled={!!deleteBlockedReason || busyId === emp.id}
                            aria-label={`Delete ${emp.name}`}
                            title={deleteBlockedReason || "Delete account"}
                            className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:text-ink-faint disabled:hover:bg-transparent"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {!loading && !employees.length && <p className="p-8 text-center text-sm text-ink-muted">No team members yet — add your first one above.</p>}
      </div>

      <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-line bg-sage-50/60 p-4 text-xs leading-5 text-ink-muted">
        <KeyRound size={15} className="mt-0.5 shrink-0 text-sage-600" />
        <p>Every account needs at least one active super admin, so the system won&rsquo;t let you delete or disable the last one — and you can never remove your own account while signed in. To fully retire a super admin, first promote a colleague (edit their rights and enable &ldquo;Super admin&rdquo;), then come back and delete the old account.</p>
      </div>

      <AnimatePresence>
        {modal && (
          <EmployeeFormModal
            key={modal.initial?.id || "create"}
            mode={modal.mode}
            initial={modal.initial}
            onClose={() => setModal(null)}
            onSaved={handleSaved}
          />
        )}
      </AnimatePresence>
    </>
  );
}
