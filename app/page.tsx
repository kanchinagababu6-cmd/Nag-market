import Link from "next/link";
import { getSession } from "@/lib/auth";

export default async function HomePage() {
  const session = await getSession();

  const portals = [
    {
      title: "Online Storefront",
      role: "Customers",
      href: "/shop" as const,
      badge: "Shop Now",
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      icon: "🛍️",
      accent: "hover:border-emerald-500/50 hover:shadow-emerald-500/10",
      description: "Browse products, order essentials, and get doorstep deliveries.",
    },
    {
      title: "POS Billing Terminal",
      role: "Sales Boy",
      href: "/pos" as const,
      badge: "Quick Scan",
      badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/30",
      icon: "🛒",
      accent: "hover:border-blue-500/50 hover:shadow-blue-500/10",
      description: "Fast barcode scan gun lookup, rapid cart billing, and stock decrement.",
    },
    {
      title: "Delivery Agent Portal",
      role: "Delivery Driver",
      href: "/delivery" as const,
      badge: "Orders & Route",
      badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      icon: "🛵",
      accent: "hover:border-amber-500/50 hover:shadow-amber-500/10",
      description: "Order dispatch, click-to-call, Google Maps navigation, and delivery proofs.",
    },
    {
      title: "Staff & Management",
      role: "Owner / Manager",
      href: "/admin/staff" as const,
      badge: "Administration",
      badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/30",
      icon: "👑",
      accent: "hover:border-purple-500/50 hover:shadow-purple-500/10",
      description: "Add team members, assign POS/Delivery roles, and inspect inventory.",
    },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-xl">
              🏪
            </div>
            <div>
              <span className="font-bold text-base text-white tracking-tight block">Nag Supermarket</span>
              <span className="text-[11px] text-slate-400 font-mono">Retail OS & Delivery</span>
            </div>
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
                  Switch
                </Link>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl transition shadow-sm"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-12 flex-1 flex flex-col justify-center">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            All Terminals Active
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Integrated Supermarket Operating System
          </h1>

          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
            Select an operational portal below to start managing counter sales, live order dispatches, or shopping online.
          </p>
        </div>

        {/* Portal Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-12">
          {portals.map((p) => (
            <Link
              key={p.title}
              href={p.href as any}
              className={`group bg-slate-900/80 border border-slate-800 rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1 shadow-lg ${p.accent} flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-3xl">{p.icon}</div>
                  <span className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full border ${p.badgeColor}`}>
                    {p.badge}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-400 block mb-1">{p.role}</span>
                <h2 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
                  {p.title}
                </h2>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {p.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 group-hover:text-slate-200">
                <span className="font-medium">Launch Portal</span>
                <span className="text-blue-400 font-bold group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 text-center py-6 text-xs text-slate-500 font-mono">
        Nag Supermarket • Next.js 15 & Neon PostgreSQL
      </footer>
    </div>
  );
}
