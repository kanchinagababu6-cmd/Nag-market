import type { Metadata, Viewport } from "next";
import Link from "next/link";
import Script from "next/script";
import { getSession, clearSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Nag Supermarket | Operating System",
  description: "Retail Counter POS & Online Grocery Delivery",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

async function handleLogout() {
  "use server";
  await clearSession();
  redirect("/login");
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <html lang="en" className="dark w-full overflow-x-hidden">
      <head>
        <Script src="https://cdn.tailwindcss.com" strategy="beforeInteractive" />
        <style dangerouslySetInnerHTML={{ __html: `
          * { box-sizing: border-box; }
          html, body {
            max-width: 100vw;
            overflow-x: hidden;
            background-color: #020617 !important;
            color: #f8fafc !important;
            font-family: system-ui, -apple-system, sans-serif !important;
            margin: 0;
            padding: 0;
          }
        `}} />
      </head>
      <body className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between w-full overflow-x-hidden">
        {/* Clean Top Navbar */}
        <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md px-4 py-3">
          <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl">🏪</span>
              <span className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                Nag Market
              </span>
            </Link>

            {/* Auth Actions Only */}
            <div className="flex items-center gap-2">
              {session ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-slate-900 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-lg">
                    {session.name}
                  </span>
                  <form action={handleLogout}>
                    <button
                      type="submit"
                      className="text-xs font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30 px-3 py-1 rounded-lg hover:bg-rose-500/30 transition cursor-pointer"
                    >
                      Logout
                    </button>
                  </form>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 rounded-lg shadow transition"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 w-full max-w-7xl mx-auto flex flex-col justify-center items-center px-4 py-6">
          {children}
        </main>

        {/* Footer */}
        <footer className="w-full border-t border-slate-900 py-4 text-center text-xs text-slate-500">
          Nag Supermarket OS • Next.js 15 & Neon
        </footer>
      </body>
    </html>
  );
}
