"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, name?: string) => void;
  register: (email: string, name: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Load session from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("dummy_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse stored user", e);
      }
    }
  }, []);

  const login = (email: string, name: string = "Dummy User") => {
    const newUser = { id: Math.random().toString(36).substring(7), email, name };
    setUser(newUser);
    localStorage.setItem("dummy_user", JSON.stringify(newUser));
  };

  const register = (email: string, name: string) => {
    const newUser = { id: Math.random().toString(36).substring(7), email, name };
    setUser(newUser);
    localStorage.setItem("dummy_user", JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("dummy_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
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
