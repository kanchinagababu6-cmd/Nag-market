"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<"AGENT" | "OWNER" | "MANAGER">("AGENT");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      if (role === "AGENT") {
        router.push("/delivery");
      } else {
        router.push("/admin/orders");
      }
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-sm">
        {/* Brand Header */}
        <div className="text-center space-y-1 mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-2xl mb-2">
            🌲
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Sirilwoods</h1>
          <p className="text-xs text-slate-400">Grocery & Daily Essentials Management Portal</p>
        </div>

        {/* Customer Direct Entry Link */}
        <div className="mb-6 p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-white">Looking to shop?</p>
            <p className="text-[11px] text-slate-400">Browse live store catalog & order online</p>
          </div>
          <Link
            href="/shop"
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow"
          >
            Go to Shop →
          </Link>
        </div>

        {/* Role Selector */}
        <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 mb-5">
          {(["AGENT", "MANAGER", "OWNER"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition ${
                role === r
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {r === "AGENT" ? "Delivery" : r === "MANAGER" ? "Manager" : "Owner"}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs text-center font-medium">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-3">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">Phone Number</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 9876543210"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow"
          >
            {loading ? "Authenticating..." : `Sign In as ${role}`}
          </button>
        </form>
      </div>

      <p className="mt-6 text-[11px] text-slate-600">
        © {new Date().getFullYear()} Sirilwoods. All rights reserved.
      </p>
    </div>
  );
}
