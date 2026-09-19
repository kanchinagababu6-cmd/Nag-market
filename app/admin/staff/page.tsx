"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function StaffProvisioningPage() {
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("SALES_BOY");
  const [loading, setLoading] = useState(false);

  const fetchStaff = async () => {
    try {
      const res = await fetch("/api/admin/staff");
      const data = await res.json();
      if (Array.isArray(data)) setStaff(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      if (res.ok) {
        setName("");
        setEmail("");
        setPassword("");
        fetchStaff();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create staff");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStaff = async (id: string, staffName: string) => {
    if (!confirm(`Are you sure you want to revoke access for ${staffName}?`)) return;

    try {
      const res = await fetch(`/api/admin/staff?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setStaff((prev) => prev.filter((u) => u.id !== id));
      } else {
        const err = await res.json();
        alert(err.error || "Failed to delete staff");
      }
    } catch {
      alert("Network error while deleting staff member");
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-white">Staff Credential Provisioning</h1>
          <p className="text-xs text-slate-400">
            Issue authorized logins for Counter Sales Boys, Delivery Agents, and Store Managers.
          </p>
        </div>
        <Link
          href="/"
          className="text-xs px-3.5 py-1.5 bg-slate-800 text-slate-300 rounded-xl border border-slate-700"
        >
          ← Workstation
        </Link>
      </div>

      {/* Add New Staff Box */}
      <form onSubmit={handleCreate} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-slate-200">Add New Supermarket Employee</h3>

        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />

        <input
          type="email"
          placeholder="Work Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />

        <input
          type="password"
          placeholder="Assign Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white focus:outline-none focus:border-blue-500"
        >
          <option value="SALES_BOY">Sales Boy (POS & Stock)</option>
          <option value="DELIVERY_AGENT">Delivery Agent (Fleet Dispatch)</option>
          <option value="MANAGER">Store Manager</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-bold transition disabled:opacity-50"
        >
          {loading ? "Issuing..." : "Issue Credentials"}
        </button>
      </form>

      {/* Active Staff List */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
        <h4 className="text-[11px] font-mono tracking-wider uppercase text-slate-400">
          Active Supermarket Staff
        </h4>

        <div className="space-y-2">
          {staff.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 bg-slate-950/80 border border-slate-800/80 rounded-2xl"
            >
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-white">
                  {user.name}{" "}
                  <span className="font-normal font-mono text-[11px] text-slate-400">
                    {user.email}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {user.role}
                </span>

                {user.role !== "OWNER" && (
                  <button
                    onClick={() => handleDeleteStaff(user.id, user.name)}
                    className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs transition"
                  >
                    🗑️ Revoke
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
