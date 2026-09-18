import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "nag-supermarket-secret-key-prod-998877"
);

export type RoleType = "OWNER" | "MANAGER" | "SALES_BOY" | "DELIVERY_AGENT" | "CUSTOMER";

export type UserSession = {
  id: string;
  email: string;
  name: string;
  role: RoleType;
};

export async function createSession(user: UserSession) {
  const token = await new SignJWT(user)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(SECRET);

  const cookieStore = await cookies();
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function getSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(SECRET, token);
    return payload as unknown as UserSession;
  } catch {
    return null;
  }
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}
