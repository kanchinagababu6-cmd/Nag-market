import { getSession } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const isOwnerOrManager = session.role === "OWNER" || session.role === "MANAGER";
  const isSalesStaff = session.role === "SALES_BOY" || isOwnerOrManager;
  const isDeliveryStaff = session.role === "DELIVERY_AGENT" || isOwnerOrManager;

  return (
    <div className="w-full max-w-5xl mx-auto p-4 space-y-6">
      {/* Top Header */}
      <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-5 rounded-3xl">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
            {session.role} WORKSTATION
          </span>
          <h1 className="text-xl font-bold text-white mt-1">Welcome, {session.name}</h1>
          <p className="text-xs text-slate-400">Select an operational workstation to proceed</p>
        </div>
        <Link
          href="/api/auth/logout"
          className="text-xs px-3.5 py-2 bg-rose-500/10 text-rose-300 border border-rose-500/20 hover:bg-rose-500/20 rounded-xl transition"
        >
          Logout
        </Link>
      </div>

      {/* Grid of Workstations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Online Customer Storefront */}
        <Link
          href="/shop"
          className="p-5 bg-slate-900 border border-slate-800 hover:border-blue-500 rounded-3xl flex flex-col justify-between transition group"
        >
          <div>
            <span className="text-2xl">🛍️</span>
            <h3 className="text-base font-bold text-white mt-2">Customer Online Store</h3>
            <p className="text-xs text-slate-400 mt-1">Browse groceries, add to floating cart, and place orders.</p>
          </div>
          <span className="text-xs text-blue-400 font-semibold mt-4 group-hover:translate-x-1 transition-transform inline-block">
            Open Storefront →
          </span>
        </Link>

        {/* 2. Live Store Orders */}
        {isSalesStaff && (
          <Link
            href="/admin/orders"
            className="p-5 bg-slate-900 border border-slate-800 hover:border-emerald-500 rounded-3xl flex flex-col justify-between transition group"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-2xl">📋</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <h3 className="text-base font-bold text-white mt-2">Live Store Orders</h3>
              <p className="text-xs text-slate-400 mt-1">Track incoming online orders, pack items, and update order status.</p>
            </div>
            <span className="text-xs text-emerald-400 font-semibold mt-4 group-hover:translate-x-1 transition-transform inline-block">
              View Live Orders →
            </span>
          </Link>
        )}

        {/* 3. Billing POS Terminal */}
        {isSalesStaff && (
          <Link
            href="/pos"
            className="p-5 bg-slate-900 border border-slate-800 hover:border-blue-500 rounded-3xl flex flex-col justify-between transition group"
          >
            <div>
              <span className="text-2xl">⚡</span>
              <h3 className="text-base font-bold text-white mt-2">Billing POS Terminal</h3>
              <p className="text-xs text-slate-400 mt-1">Counter barcode checkout, instant inventory sync, and receipts.</p>
            </div>
            <span className="text-xs text-blue-400 font-semibold mt-4 group-hover:translate-x-1 transition-transform inline-block">
              Launch POS Terminal →
            </span>
          </Link>
        )}

        {/* 4. Product & Stock Restock */}
        {isSalesStaff && (
          <Link
            href="/admin/products"
            className="p-5 bg-slate-900 border border-slate-800 hover:border-blue-500 rounded-3xl flex flex-col justify-between transition group"
          >
            <div>
              <span className="text-2xl">📦</span>
              <h3 className="text-base font-bold text-white mt-2">Stock & Barcodes</h3>
              <p className="text-xs text-slate-400 mt-1">Add new items, configure 8 departments, sub-categories, & images.</p>
            </div>
            <span className="text-xs text-blue-400 font-semibold mt-4 group-hover:translate-x-1 transition-transform inline-block">
              Manage Inventory →
            </span>
          </Link>
        )}

        {/* 5. Delivery Fleet Dispatch */}
        {isDeliveryStaff && (
          <Link
            href="/delivery"
            className="p-5 bg-slate-900 border border-slate-800 hover:border-blue-500 rounded-3xl flex flex-col justify-between transition group"
          >
            <div>
              <span className="text-2xl">🛵</span>
              <h3 className="text-base font-bold text-white mt-2">Delivery Dispatch Hub</h3>
              <p className="text-xs text-slate-400 mt-1">Real-time delivery orders, 1-tap Google Maps route & WhatsApp.</p>
            </div>
            <span className="text-xs text-blue-400 font-semibold mt-4 group-hover:translate-x-1 transition-transform inline-block">
              Open Delivery Hub →
            </span>
          </Link>
        )}

        {/* 6. Executive Analytics */}
        {isOwnerOrManager && (
          <Link
            href="/admin/analytics"
            className="p-5 bg-slate-900 border border-slate-800 hover:border-blue-500 rounded-3xl flex flex-col justify-between transition group"
          >
            <div>
              <span className="text-2xl">📊</span>
              <h3 className="text-base font-bold text-white mt-2">Executive Analytics</h3>
              <p className="text-xs text-slate-400 mt-1">Live revenues, stock replenishment warnings, and top-selling goods.</p>
            </div>
            <span className="text-xs text-blue-400 font-semibold mt-4 group-hover:translate-x-1 transition-transform inline-block">
              Open Dashboard →
            </span>
          </Link>
        )}

        {/* 7. Staff Accounts */}
        {isOwnerOrManager && (
          <Link
            href="/admin/staff"
            className="p-5 bg-slate-900 border border-slate-800 hover:border-blue-500 rounded-3xl flex flex-col justify-between transition group"
          >
            <div>
              <span className="text-2xl">🛡️</span>
              <h3 className="text-base font-bold text-white mt-2">Staff Credentials</h3>
              <p className="text-xs text-slate-400 mt-1">Issue logins and manage roles for Cashiers and Delivery Agents.</p>
            </div>
            <span className="text-xs text-blue-400 font-semibold mt-4 group-hover:translate-x-1 transition-transform inline-block">
              Manage Staff →
            </span>
          </Link>
        )}
      </div>
    </div>
  );
}      }
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
