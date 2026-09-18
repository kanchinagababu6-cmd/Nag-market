import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Nag Supermarket | Operating System",
  description: "Retail Counter POS & Online Grocery Delivery",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased flex flex-col justify-between selection:bg-blue-600 selection:text-white">
        {/* Global Navigation Bar */}
        <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-xl shadow-lg shadow-blue-500/20 group-hover:scale-105 transition">
                🛒
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                  Nag Supermarket
                  <span className="text-[10px] bg-blue-500/20 text-blue-400 font-mono px-1.5 py-0.5 rounded-md border border-blue-500/30">
                    PRO
                  </span>
                </span>
                <span className="text-[11px] text-slate-400 block -mt-0.5">Retail & Dispatches</span>
              </div>
            </Link>

            {/* Direct Portal Links */}
            <nav className="hidden md:flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-xl">
              <Link
                href="/shop"
                className="text-xs font-medium px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
              >
                Storefront
              </Link>
              <Link
                href="/pos"
                className="text-xs font-medium px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
              >
                Counter POS
              </Link>
              <Link
                href="/delivery"
                className="text-xs font-medium px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
              >
                Delivery
              </Link>
              <Link
                href="/admin/staff"
                className="text-xs font-medium px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
              >
                Staff
              </Link>
            </nav>

            {/* User Session / Auth */}
            <div className="flex items-center gap-3">
              {session ? (
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <span className="text-xs font-semibold text-white block">{session.name}</span>
                    <span className="text-[10px] text-emerald-400 font-mono block uppercase">
                      {session.role.replace(/_/g, " ")}
                    </span>
                  </div>
                  <Link
                    href="/login"
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 px-3 py-1.5 rounded-xl font-medium transition"
                  >
                    Switch
                  </Link>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl transition shadow-md shadow-blue-600/20"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* Content Page Container */}
        <div className="flex-1 flex flex-col">{children}</div>

        {/* Global Footer */}
        <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
          Nag Supermarket OS • Powered by Next.js 15 & Neon Cloud Database
        </footer>
      </body>
    </html>
  );
}
