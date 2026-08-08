import React, { useMemo, useState } from "react";

const ALLOWED_EMPLOYEE_IDS = [
  "AVAYA001",
  "AVAYA002",
  "AVAYA003",
  "AVAYA004",
  "AVAYA005",
];

const CRM_DATA = [
  {
    id: "AVAYA001",
    name: "Aditi Shah",
    role: "Design Lead",
    status: "On Site",
  },
  {
    id: "AVAYA002",
    name: "Rohan Mehta",
    role: "Project Manager",
    status: "In Review",
  },
  {
    id: "AVAYA003",
    name: "Nisha Verma",
    role: "Procurement",
    status: "Approved",
  },
  {
    id: "AVAYA004",
    name: "Arjun Sethi",
    role: "Site Coordinator",
    status: "Workshop",
  },
  {
    id: "AVAYA005",
    name: "Megha Rao",
    role: "Client Relations",
    status: "Available",
  },
];

export default function EmployeeLogin({ onBackToSite }) {
  const [employeeId, setEmployeeId] = useState("");
  const [error, setError] = useState("");
  const [authenticated, setAuthenticated] = useState(false);

  const employee = useMemo(
    () =>
      CRM_DATA.find((person) => person.id === employeeId.trim().toUpperCase()),
    [employeeId],
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmedId = employeeId.trim().toUpperCase();

    if (!trimmedId) {
      setError("Please enter your employee ID.");
      setAuthenticated(false);
      return;
    }

    if (!ALLOWED_EMPLOYEE_IDS.includes(trimmedId)) {
      setError("Your employee ID is not authorized for the internal CRM.");
      setAuthenticated(false);
      return;
    }

    setError("");
    setAuthenticated(true);
  };

  return (
    <div className="min-h-screen bg-sage-950 px-4 py-12 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between gap-3">
          <div>
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-sage-300">
              Internal access
            </p>
            <h1 className="mt-2 font-display text-3xl text-white md:text-4xl">
              Avaya Udyog CRM
            </h1>
          </div>

          <button
            onClick={onBackToSite}
            className="btn-ghost !px-5 !py-2.5 !text-white"
          >
            Back to site
          </button>
        </div>

        {!authenticated ? (
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_25px_80px_rgba(0,0,0,0.25)] backdrop-blur-sm">
              <p className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-gold-light">
                Employee login
              </p>
              <h2 className="mt-4 font-display text-3xl text-white">
                Company access only
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-7 text-sage-100/80">
                This portal is restricted to authorized Avaya Udyog employees.
                Use your employee ID to access the internal CRM dashboard.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div>
                  <label
                    htmlFor="employeeId"
                    className="mb-2 block text-sm font-medium text-sage-100"
                  >
                    Employee ID
                  </label>
                  <input
                    id="employeeId"
                    type="text"
                    value={employeeId}
                    onChange={(event) => setEmployeeId(event.target.value)}
                    placeholder="AVAYA001"
                    className="w-full rounded-2xl border border-white/10 bg-sage-900/80 px-4 py-3 text-base text-white placeholder:text-sage-200/45 focus:border-gold-light focus:outline-none focus:ring-4 focus:ring-gold-light/20"
                  />
                </div>

                {error ? (
                  <p className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {error}
                  </p>
                ) : null}

                <button
                  type="submit"
                  className="btn-primary w-full !bg-gold-fill !text-sage-950 hover:!bg-[#d9c076]"
                >
                  Access CRM
                </button>
              </form>
            </section>

            <aside className="rounded-[2rem] border border-white/10 bg-sage-900/70 p-8">
              <p className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-sage-300">
                Authorized IDs
              </p>
              <ul className="mt-5 space-y-3 text-sm text-sage-100/90">
                {ALLOWED_EMPLOYEE_IDS.map((id) => (
                  <li
                    key={id}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                  >
                    <span>{id}</span>
                    <span className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-green-300">
                      Active
                    </span>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        ) : (
          <div className="rounded-[2rem] border border-emerald-500/30 bg-emerald-500/10 p-6 shadow-[0_25px_80px_rgba(0,0,0,0.25)]">
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-emerald-200">
                  Welcome back
                </p>
                <h2 className="mt-2 font-display text-3xl text-white">
                  {employee?.name || "Employee Dashboard"}
                </h2>
              </div>

              <button
                onClick={onBackToSite}
                className="btn-ghost !px-5 !py-2.5 !text-white"
              >
                Exit CRM
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-sage-900/70 p-5">
                <p className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-sage-300">
                  Employee ID
                </p>
                <p className="mt-3 text-2xl font-semibold text-white">
                  {employee?.id}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-sage-900/70 p-5">
                <p className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-sage-300">
                  Role
                </p>
                <p className="mt-3 text-2xl font-semibold text-white">
                  {employee?.role}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-sage-900/70 p-5">
                <p className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-sage-300">
                  Status
                </p>
                <p className="mt-3 text-2xl font-semibold text-white">
                  {employee?.status}
                </p>
              </div>
            </div>

            <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-sage-900/80">
              <div className="border-b border-white/10 px-5 py-4 text-[0.62rem] font-bold uppercase tracking-[0.2em] text-sage-300">
                Team overview
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-white/5 text-sage-200">
                    <tr>
                      <th className="px-5 py-3 font-medium">Employee</th>
                      <th className="px-5 py-3 font-medium">Role</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CRM_DATA.map((member) => (
                      <tr
                        key={member.id}
                        className="border-t border-white/10 text-sage-100/90"
                      >
                        <td className="px-5 py-3">
                          <div className="font-medium text-white">
                            {member.name}
                          </div>
                          <div className="text-xs text-sage-300">
                            {member.id}
                          </div>
                        </td>
                        <td className="px-5 py-3">{member.role}</td>
                        <td className="px-5 py-3">
                          <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-200">
                            {member.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
