import Link from "next/link";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await getSession();

  // If unauthenticated, redirect to login
  if (!session) {
    redirect("/login");
  }

  // Pure customer: Skip overview and go directly to Storefront
  if (session.role === "CUSTOMER") {
    redirect("/shop");
  }

  // Pure delivery boy: Go directly to delivery route
  if (session.role === "DELIVERY_AGENT") {
    redirect("/delivery");
  }

  const isStaff = session.role === "SALES_BOY";
  const isAdmin = session.role === "OWNER" || session.role === "MANAGER";

  return (
    <main className="w-full max-w-5xl mx-auto space-y-8 py-6">
      {/* Role Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[11px] font-mono mb-2">
            Active Role: {session.role}
          </div>
          <h1 className="text-2xl font-black text-white">Welcome back, {session.name}</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {isAdmin ? "Supermarket Master Control & Operations" : "Sales Boy & Terminal Counter Dashboard"}
          </p>
        </div>
      </div>

      {/* Available Stations for this user */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Sales Boy & Admin: POS Terminal */}
        {(isStaff || isAdmin) && (
          <Link
            href="/pos"
            className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500 hover:bg-slate-850 transition group flex flex-col justify-between"
          >
            <div>
              <span className="text-3xl p-2.5 rounded-xl bg-slate-800 inline-block mb-3">⚡</span>
              <h2 className="text-base font-bold text-white group-hover:text-blue-400">Counter POS Terminal</h2>
              <p className="text-xs text-slate-400 mt-1">Scan barcodes, build checkout receipts, and ring up sales.</p>
            </div>
            <span className="text-xs font-semibold text-blue-400 mt-4 block">Launch POS →</span>
          </Link>
        )}

        {/* Sales Boy & Admin: Product Upload and Edit */}
        {(isStaff || isAdmin) && (
          <Link
            href="/admin/products"
            className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500 hover:bg-slate-850 transition group flex flex-col justify-between"
          >
            <div>
              <span className="text-3xl p-2.5 rounded-xl bg-slate-800 inline-block mb-3">📦</span>
              <h2 className="text-base font-bold text-white group-hover:text-emerald-400">Product Upload & Stock Edit</h2>
              <p className="text-xs text-slate-400 mt-1">Add items to catalog, register barcodes, and update prices/quantities.</p>
            </div>
            <span className="text-xs font-semibold text-emerald-400 mt-4 block">Open Inventory →</span>
          </Link>
        )}

        {/* Admin/Manager Exclusive: Delivery Fleet */}
        {isAdmin && (
          <Link
            href="/delivery"
            className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500 hover:bg-slate-850 transition group flex flex-col justify-between"
          >
            <div>
              <span className="text-3xl p-2.5 rounded-xl bg-slate-800 inline-block mb-3">🛵</span>
              <h2 className="text-base font-bold text-white group-hover:text-amber-400">Delivery Fleet Monitor</h2>
              <p className="text-xs text-slate-400 mt-1">Inspect dispatched courier routes and pending delivery statuses.</p>
            </div>
            <span className="text-xs font-semibold text-amber-400 mt-4 block">View Routes →</span>
          </Link>
        )}

        {/* Admin/Manager Exclusive: Staff Credential Provisioning */}
        {isAdmin && (
          <Link
            href="/admin/staff"
            className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500 hover:bg-slate-850 transition group flex flex-col justify-between"
          >
            <div>
              <span className="text-3xl p-2.5 rounded-xl bg-slate-800 inline-block mb-3">🛡️</span>
              <h2 className="text-base font-bold text-white group-hover:text-purple-400">Staff & Workstation Access</h2>
              <p className="text-xs text-slate-400 mt-1">Issue logins and passwords for Sales Boys, Delivery Agents, and Managers.</p>
            </div>
            <span className="text-xs font-semibold text-purple-400 mt-4 block">Manage Accounts →</span>
          </Link>
        )}
      </div>
    </main>
  );
}
