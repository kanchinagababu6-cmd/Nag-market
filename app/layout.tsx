import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
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
      <head>
        {/* Force-load Tailwind CSS runtime so styles render immediately */}
        <Script
          src="https://cdn.tailwindcss.com"
          strategy="beforeInteractive"
        />
        <style dangerouslySetInnerHTML={{ __html: `
          body {
            background-color: #020617 !important;
            color: #f8fafc !important;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
            margin: 0;
            padding: 0;
          }
          a {
            text-decoration: none !important;
          }
        `}} />
      </head>
      <body className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
        {/* Global Navigation Bar */}
        <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-xl shadow-lg shadow-blue-500/10">
                🏪
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                  Nag Supermarket
                  <span className="text-[10px] bg-blue-500/20 text-blue-400 font-mono px-1.5 py-0.5 rounded-md border border-blue-500/30">
                    PRO
                  </span>
                </span>
                <span className="text-[11px] text-slate-400 block">Retail OS & Delivery</span>
              </div>
            </Link>

            {/* Direct Portal Links */}
            <nav className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl">
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

            {/* User Session */}
            <div className="flex items-center gap-3">
              {session ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1.5 rounded-full border border-slate-700">
                    {session.name}
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
                  className="text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl transition shadow-md shadow-blue-600/20"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* Content Page */}
        <div className="flex-1 flex flex-col">{children}</div>

        {/* Global Footer */}
        <footer className="border-t border-slate-800 bg-slate-950 py-6 text-center text-xs text-slate-500">
          Nag Supermarket OS • Next.js 15 & Neon Cloud Database
        </footer>
      </body>
    </html>
  );
}
