import Link from "next/link";
import { getSession } from "@/lib/auth";

export default async function HomePage() {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏪</span>
          <span className="font-bold text-lg text-white tracking-tight">Nag Supermarket</span>
        </div>
        <div className="flex items-center gap-3">
          {session ? (
            <div className="flex items-center gap-3">
              <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1.5 rounded-full border border-slate-700">
                {session.name} ({session.role})
              </span>
              <Link
                href="/login"
                className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
              >
                Switch Account
              </Link>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-xs bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-xl transition"
            >
              Staff & Customer Login
            </Link>
          )}
        </div>
      </header>

      {/* Main Hero & Quick Access */}
      <main className="max-w-5xl mx-auto px-6 py-12 flex-1 flex flex-col justify-center text-center">
        <div className="inline-flex items-center gap-2 mx-auto mb-6 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono">
          <span>●</span> All-in-One Supermarket Operating System
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-3xl mx-auto leading-tight">
          Physical Counter POS & Online Grocery Delivery
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto">
          Shop everyday essentials online or access dedicated counter terminals for POS billing and swift order fulfillment.
        </p>

        {/* Action Gateway Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12 text-left">
          {/* Customer Online Store */}
          <Link
            href="/shop"
            className="bg-slate-800/80 border border-slate-700/80 hover:border-blue-500/50 p-6 rounded-2xl transition hover:bg-slate-800 group"
          >
            <div className="text-3xl mb-3">🛍️</div>
            <h2 className="text-lg font-bold text-white group-hover:text-blue-400 transition">
              Online Storefront
            </h2>
            <p className="text-xs text-slate-400 mt-2">
              Browse products, build baskets, and place fast delivery orders.
            </p>
          </Link>

          {/* Sales Boy POS */}
          <Link
            href="/pos"
            className="bg-slate-800/80 border border-slate-700/80 hover:border-emerald-500/50 p-6 rounded-2xl transition hover:bg-slate-800 group"
          >
            <div className="text-3xl mb-3">🛒</div>
            <h2 className="text-lg font-bold text-white group-hover:text-emerald-400 transition">
              POS Terminal
            </h2>
            <p className="text-xs text-slate-400 mt-2">
              Barcode scanning counter terminal for Sales Boys with auto stock deduction.
            </p>
          </Link>

          {/* Delivery Agent Hub */}
          <Link
            href="/delivery"
            className="bg-slate-800/80 border border-slate-700/80 hover:border-amber-500/50 p-6 rounded-2xl transition hover:bg-slate-800 group"
          >
            <div className="text-3xl mb-3">🛵</div>
            <h2 className="text-lg font-bold text-white group-hover:text-amber-400 transition">
              Delivery Portal
            </h2>
            <p className="text-xs text-slate-400 mt-2">
              Assigned routes, order status toggles, direct caller, and Google Maps.
            </p>
          </Link>

          {/* Owner & Manager Administration */}
          <Link
            href="/admin/staff"
            className="bg-slate-800/80 border border-slate-700/80 hover:border-purple-500/50 p-6 rounded-2xl transition hover:bg-slate-800 group"
          >
            <div className="text-3xl mb-3">👑</div>
            <h2 className="text-lg font-bold text-white group-hover:text-purple-400 transition">
              Staff & Admin
            </h2>
            <p className="text-xs text-slate-400 mt-2">
              Create employee logins, assign staff roles, and audit operations.
            </p>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 text-center py-6 text-xs text-slate-500">
        Nag Supermarket Platform • Built with Next.js 15 & Neon PostgreSQL
      </footer>
    </div>
  );
}
