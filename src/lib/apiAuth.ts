import { NextRequest, NextResponse } from "next/server";
import * as jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key_change_in_production";

export interface TokenPayload {
  id: string;
  email: string;
  role: "Admin" | "Donor" | "NGO";
  status: string;
}

/**
 * Verify JWT token and extract payload
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return payload as TokenPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Get token from request (from Authorization header or cookie)
 */
export function getTokenFromRequest(request: NextRequest): string | null {
  // Try Authorization header first
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  // Try cookie
  const cookieToken = request.cookies.get("auth_token")?.value;
  if (cookieToken) {
    return cookieToken;
  }

  return null;
}

/**
 * Middleware to check if user has required role
 * Usage in API route:
 * 
 * export async function POST(req: NextRequest) {
 *   const { user, error } = await requireAuth(req, ["Admin", "Donor"]);
 *   if (error) return error;
 *   // user is now available and has required role
 * }
 */
export async function requireAuth(
  request: NextRequest,
  requiredRoles?: ("Admin" | "Donor" | "NGO")[]
): Promise<{ user: TokenPayload | null; error: NextResponse | null }> {
  const token = getTokenFromRequest(request);

  if (!token) {
    return {
      user: null,
      error: NextResponse.json(
        { error: "Unauthorized: Missing authentication token" },
        { status: 401 }
      ),
    };
  }

  const user = verifyToken(token);

  if (!user) {
    return {
      user: null,
      error: NextResponse.json(
        { error: "Unauthorized: Invalid or expired token" },
        { status: 401 }
      ),
    };
  }

  if (requiredRoles && !requiredRoles.includes(user.role)) {
    return {
      user: null,
      error: NextResponse.json(
        { error: `Forbidden: Required role(s): ${requiredRoles.join(", ")}` },
        { status: 403 }
      ),
    };
  }

  return { user, error: null };
}
