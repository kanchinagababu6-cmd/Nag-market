"use server";

import { PrismaClient } from "@prisma/client";
import { createSession, clearSession } from "@/lib/auth";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

export async function loginAction(formData: FormData) {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Please provide both email and password." };
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || user.password !== password) {
    return { error: "Invalid email or password." };
  }

  await createSession({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  if (user.role === "OWNER" || user.role === "MANAGER") {
    redirect("/admin");
  } else if (user.role === "SALES_BOY") {
    redirect("/pos");
  } else if (user.role === "DELIVERY_AGENT") {
    redirect("/delivery");
  } else {
    redirect("/shop");
  }
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}
