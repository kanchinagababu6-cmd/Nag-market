import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET_KEY = process.env.JWT_SECRET || "supermarket-secret-jwt-key-2026";
const KEY = new TextEncoder().encode(SECRET_KEY);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static files, api auth routes, and the login page itself
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname === "/login" ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Check for the active session cookie
  const token = request.cookies.get("session")?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  try {
    // Validate session token
    await jwtVerify(token, KEY);
    return NextResponse.next();
  } catch {
    // Token is invalid or expired; redirect to login
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files and images
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
