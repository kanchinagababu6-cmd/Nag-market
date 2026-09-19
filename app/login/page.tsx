import { PrismaClient } from "@prisma/client";
import { createSession } from "@/lib/auth";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

// 1. Existing Users Login (Email or Phone)
async function handleLogin(formData: FormData) {
  "use server";
  const identifier = (formData.get("identifier") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!identifier || !password) return;

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: identifier }, { phone: identifier }],
    },
  });

  if (!user || user.password !== password) {
    redirect("/login?error=Invalid credentials");
  }

  await createSession({
    id: user.id,
    email: user.email || user.phone || "",
    name: user.name,
    role: user.role,
  });

  // Role-based destination routing
  if (user.role === "CUSTOMER") redirect("/shop");
  if (user.role === "DELIVERY_AGENT") redirect("/delivery");
  if (user.role === "SALES_BOY") redirect("/pos");
  redirect("/");
}

// 2. Customer Email/Password Registration
async function handleEmailSignup(formData: FormData) {
  "use server";
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!name || !email || !password) return;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    redirect("/login?error=Email already registered");
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password,
      role: "CUSTOMER", // Public sign-up is always restricted to CUSTOMER
    },
  });

  await createSession({
    id: user.id,
    email: user.email!,
    name: user.name,
    role: user.role,
  });

  redirect("/shop");
}

// 3. Customer WhatsApp / Phone OTP Simulation
async function handleOtpSubmit(formData: FormData) {
  "use server";
  const name = (formData.get("name") as string)?.trim() || "Valued Customer";
  const phone = (formData.get("phone") as string)?.trim();
  const enteredOtp = (formData.get("otp") as string)?.trim();

  if (!phone) return;

  // Demo verification code is 123456
  if (enteredOtp && enteredOtp !== "123456") {
    redirect("/login?mode=whatsapp&error=Invalid OTP code. Try 123456");
  }

  let user = await prisma.user.findUnique({ where: { phone } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        name,
        phone,
        role: "CUSTOMER",
      },
    });
  }

  await createSession({
    id: user.id,
    email: user.phone || user.email || "",
    name: user.name,
    role: user.role,
  });

  redirect("/shop");
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; mode?: string }>;
}) {
  const params = await searchParams;
  const mode = params.mode || "signin";

  return (
    <div className="w-full max-w-md mx-auto my-auto p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-2xl mb-2">
          🏪
        </div>
        <h1 className="text-xl font-black text-white tracking-tight">SIRILWOODS</h1>
        <p className="text-xs text-slate-400 mt-0.5">Unified Customer & Staff Access Portal</p>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 mb-5 text-xs font-semibold">
        <a
          href="/login?mode=signin"
          className={`flex-1 text-center py-2 rounded-lg transition ${
            mode === "signin" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white"
          }`}
        >
          Sign In
        </a>
        <a
          href="/login?mode=signup"
          className={`flex-1 text-center py-2 rounded-lg transition ${
            mode === "signup" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white"
          }`}
        >
          Email Sign Up
        </a>
        <a
          href="/login?mode=whatsapp"
          className={`flex-1 text-center py-2 rounded-lg transition ${
            mode === "whatsapp" ? "bg-emerald-600 text-white shadow" : "text-slate-400 hover:text-white"
          }`}
        >
          WhatsApp OTP
        </a>
      </div>

      {params.error && (
        <div className="mb-4 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs text-center font-medium">
          {params.error}
        </div>
      )}

      {/* 1. Standard Sign In */}
      {mode === "signin" && (
        <form action={handleLogin} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email or Phone</label>
            <input
              type="text"
              name="identifier"
              placeholder="e.g. sales@supermarket.com"
              required
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-white text-xs outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              required
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-white text-xs outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl transition shadow-md shadow-blue-600/20 mt-2"
          >
            Enter Supermarket
          </button>
        </form>
      )}

      {/* 2. Customer Email Registration */}
      {mode === "signup" && (
        <form action={handleEmailSignup} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              required
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-white text-xs outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="name@gmail.com"
              required
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-white text-xs outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Create Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              required
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-white text-xs outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl transition shadow-md shadow-blue-600/20 mt-2"
          >
            Create Customer Account
          </button>
        </form>
      )}

      {/* 3. Customer WhatsApp OTP Login */}
      {mode === "whatsapp" && (
        <form action={handleOtpSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              required
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-white text-xs outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">WhatsApp Mobile Number</label>
            <input
              type="tel"
              name="phone"
              placeholder="+91 98765 43210"
              required
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-white text-xs outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              WhatsApp Verification OTP <span className="text-[10px] text-emerald-400 font-mono">(Use 123456)</span>
            </label>
            <input
              type="text"
              name="otp"
              placeholder="123456"
              defaultValue="123456"
              required
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-white text-xs font-mono tracking-widest outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition shadow-md shadow-emerald-600/20 mt-2"
          >
            Verify & Continue to Shop
          </button>
        </form>
      )}

      {/* Footer Notice */}
      <div className="mt-5 pt-3 border-t border-slate-800 text-[10px] text-slate-500 text-center">
        Staff, Sales Counter, and Delivery log in using their admin-issued accounts above.
      </div>
    </div>
  );
}
