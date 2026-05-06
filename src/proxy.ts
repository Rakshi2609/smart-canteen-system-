import { NextRequest, NextResponse } from "next/server";
import * as jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key_change_in_production";

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  const publicRoutes = ["/", "/login", "/register", "/support", "/map", "/api/auth/"];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  const protectedRoutes = ["/api/donations/"];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  let token = request.cookies.get("auth_token")?.value;

  const tokenFromQuery = searchParams.get("token");
  let response = NextResponse.next();

  if (tokenFromQuery && !token) {
    token = tokenFromQuery;
    response.cookies.set("auth_token", token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });
  }

  let decodedToken = null;
  if (token) {
    try {
      decodedToken = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string; status: string };
    } catch {
      decodedToken = null;
    }
  }

  if (isProtectedRoute && !decodedToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/portals" && decodedToken) {
    const roleToPath: Record<string, string> = {
      "Admin": "/admin",
      "Donor": "/admin?role=Donor",
      "NGO": "/admin?role=NGO",
    };
    const redirectPath = roleToPath[decodedToken.role] || "/admin";
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  if (pathname === "/login" && decodedToken) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return isPublicRoute ? NextResponse.next() : response;
}

export const config = {
  matcher: ["/((?!public|favicon.ico|_next/static|_next/image).*)"],
};