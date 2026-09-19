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

        {/* 2. Billing POS Terminal */}
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

        {/* 3. Product & Stock Restock */}
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

        {/* 4. Delivery Fleet Dispatch */}
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

        {/* 5. Executive Analytics */}
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

        {/* 6. Staff Accounts */}
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
}
