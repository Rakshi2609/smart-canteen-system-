import { NextRequest, NextResponse } from "next/server";
import * as jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key_change_in_production";

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Public routes (no auth needed)
  const publicRoutes = ["/", "/login", "/register", "/support", "/map", "/api/auth/"];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Routes requiring authentication
  const protectedRoutes = ["/admin", "/portals", "/api/donations/"];
  // Only PUT/DELETE on /api/users need auth (admin operations)
  // GET /api/users/[id] is allowed for checking user status
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route)) || 
    (pathname.startsWith("/api/users/") && (request.method === "PUT" || request.method === "DELETE"));

  let token = request.cookies.get("auth_token")?.value;
  
  // If token in query parameter (from login redirect), set it as a cookie
  const tokenFromQuery = searchParams.get("token");
  let response = NextResponse.next();
  
  if (tokenFromQuery && !token) {
    token = tokenFromQuery;
    // Set the token as a cookie (non-httpOnly for this environment)
    response.cookies.set("auth_token", token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/"
    });
  }

  // Verify token and extract role
  let decodedToken = null;
  if (token) {
    try {
      decodedToken = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string; status: string };
    } catch (error) {
      // Token is invalid or expired
    }
  }

  // If protected route and no valid token, redirect to login
  if (isProtectedRoute && !decodedToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If accessing /portals while logged in, redirect to appropriate dashboard
  if (pathname === "/portals" && decodedToken) {
    const roleToPath: Record<string, string> = {
      "Admin": "/admin",
      "Donor": "/admin?role=Donor",
      "NGO": "/admin?role=NGO",
    };
    const redirectPath = roleToPath[decodedToken.role] || "/admin";
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  // If accessing /login while already logged in, redirect to dashboard
  if (pathname === "/login" && decodedToken) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - public (public assets)
     * - favicon.ico (favicon file)
     * - next/static (static files)
     * - next/image (image optimization files)
     */
    "/((?!public|favicon.ico|_next/static|_next/image).*)",
  ],
};
