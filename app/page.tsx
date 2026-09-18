import Link from "next/link";

export default function HomePage() {
  const cards = [
    {
      title: "Online Storefront",
      role: "Customers",
      href: "/shop",
      badge: "Shop Online",
      badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      icon: "🛍️",
      accent: "hover:border-emerald-500/60 hover:shadow-emerald-500/10",
      description: "Browse essentials, add products to cart, and order direct cash-on-delivery groceries.",
    },
    {
      title: "POS Billing Terminal",
      role: "Sales Counter",
      href: "/pos",
      badge: "Fast Scan",
      badgeClass: "bg-blue-500/10 text-blue-400 border-blue-500/30",
      icon: "💳",
      accent: "hover:border-blue-500/60 hover:shadow-blue-500/10",
      description: "High-speed barcode scanner POS billing with automatic inventory decrement and receipts.",
    },
    {
      title: "Delivery Agent Hub",
      role: "Dispatch Fleet",
      href: "/delivery",
      badge: "Live Dispatch",
      badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      icon: "🛵",
      accent: "hover:border-amber-500/60 hover:shadow-amber-500/10",
      description: "Live package routes, 1-click status transitions, Google Maps routing, and customer dialer.",
    },
    {
      title: "Staff & Management",
      role: "Owner Admin",
      href: "/admin/staff",
      badge: "Admin Access",
      badgeClass: "bg-purple-500/10 text-purple-400 border-purple-500/30",
      icon: "👑",
      accent: "hover:border-purple-500/60 hover:shadow-purple-500/10",
      description: "Create employee logins, assign POS & Delivery credentials, and manage operations.",
    },
  ];

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 flex-1 flex flex-col justify-center">
      {/* Hero Badge */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          Supermarket Cloud OS Ready
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
          Supermarket POS & <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400">
            Express Delivery Platform
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Select your portal to launch physical counter billing, driver route tracking, or our customer online grocery storefront.
        </p>
      </div>

      {/* Grid of Portals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-12">
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className={`group bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1 shadow-xl backdrop-blur-sm flex flex-col justify-between ${card.accent}`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
                  {card.icon}
                </span>
                <span
                  className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full border ${card.badgeClass}`}
                >
                  {card.badge}
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold tracking-wider block">
                {card.role}
              </span>
              <h2 className="text-lg font-bold text-white mt-1 group-hover:text-blue-400 transition">
                {card.title}
              </h2>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                {card.description}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400 font-medium group-hover:text-slate-200">
              <span>Open Portal</span>
              <span className="text-blue-400 font-bold group-hover:translate-x-1.5 transition-transform">
                →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
