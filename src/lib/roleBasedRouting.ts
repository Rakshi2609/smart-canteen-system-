import { UserRole } from "@/contexts/AuthContext";

export interface RoleRouteConfig {
  [key: string]: string; // path based on role
}

/**
 * Get the dashboard path for a given user role
 */
export function getDashboardPath(role: UserRole): string {
  const routes: Record<UserRole, string> = {
    "Admin": "/admin",
    "Donor": "/admin?role=Donor",
    "NGO": "/admin?role=NGO",
  };
  
  return routes[role] || "/admin";
}

/**
 * Check if user has permission for a route
 */
export function hasRoutePermission(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole);
}

/**
 * Redirect user to their appropriate dashboard based on role
 */
export function getRedirectPath(userRole: UserRole, currentPath: string): string | null {
  const adminOnlyPaths = ["/admin"];
  const donorPaths = ["/admin?role=Donor"];
  const ngoPaths = ["/admin?role=NGO"];

  // If already on correct path, no redirect needed
  if (currentPath === getDashboardPath(userRole)) {
    return null;
  }

  // Always allow users to access their own dashboard
  return getDashboardPath(userRole);
}
