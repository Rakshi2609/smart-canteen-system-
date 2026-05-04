"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type UserRole = "Admin" | "Donor" | "NGO";
export type UserStatus = "Pending Approval" | "Verified" | "Rejected";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  totalImpact?: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("auth_user");
    const token = localStorage.getItem("auth_token");
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse stored user", e);
        localStorage.removeItem("auth_user");
        localStorage.removeItem("auth_token");
      }
    }
    setLoading(false);
  }, []);

  // Poll for status updates when pending approval
  useEffect(() => {
    if (user && user.status === "Pending Approval") {
      const interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/users/${user.id}`);
          if (res.ok) {
            const updatedUser = await res.json();
            if (updatedUser.status !== user.status) {
              setUser(updatedUser);
              localStorage.setItem("auth_user", JSON.stringify(updatedUser));
            }
          }
        } catch (e) {
          console.error("Failed to refresh user status", e);
        }
      }, 60000); // 60s
      return () => clearInterval(interval);
    }
  }, [user]);

  const login = (newUser: User, token: string) => {
    // Validate user has required fields
    if (!newUser.role) {
      throw new Error("User role is required");
    }
    
    setUser(newUser);
    localStorage.setItem("auth_user", JSON.stringify(newUser));
    localStorage.setItem("auth_token", token);
    
    // Also set cookie for server-side middleware
    document.cookie = `auth_token=${token}; path=/; max-age=604800; SameSite=Strict`;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth_user");
    localStorage.removeItem("auth_token");
    
    // Clear cookie
    document.cookie = "auth_token=; path=/; max-age=0";
  };

  const refreshUser = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/users/${user.id}`);
      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
        localStorage.setItem("auth_user", JSON.stringify(updatedUser));
      }
    } catch (e) {
      console.error("Failed to refresh user", e);
    }
  };

  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    const rolesArray = Array.isArray(roles) ? roles : [roles];
    return rolesArray.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
