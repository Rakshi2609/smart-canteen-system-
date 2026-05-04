"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

type AllowedRoles = "Admin" | "Donor" | "NGO" | "All";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: AllowedRoles | AllowedRoles[];
  fallback?: React.ReactNode;
}

export function ProtectedRoute({
  children,
  allowedRoles = "All",
  fallback,
}: ProtectedRouteProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    // Check if user is authenticated
    if (!user) {
      router.push("/login");
      return;
    }

    // Check if user has allowed role
    if (allowedRoles !== "All") {
      const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
      if (!rolesArray.includes(user.role as any)) {
        router.push("/");
        return;
      }
    }

    setIsLoading(false);
  }, [user, router, allowedRoles]);

  if (isLoading) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="animate-spin text-primary mx-auto mb-4" size={40} />
            <p className="text-slate-400">Loading...</p>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}
