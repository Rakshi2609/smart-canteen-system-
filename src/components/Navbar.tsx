"use client";

import Link from 'next/link';
import { Map, LayoutDashboard, Utensils, LogOut, User as UserIcon, Package, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="fixed top-0 w-full z-50 glass border-b border-white/10 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-white">
          <Utensils className="text-primary" />
          <span>SmartCanteen</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/map" className="flex items-center gap-2 text-lg font-bold text-slate-300 hover:text-white transition-colors">
            <Map size={22} />
            <span>Live Map</span>
          </Link>
          <Link href="/support" className="flex items-center gap-2 text-lg font-bold text-pink-400 hover:text-pink-300 transition-colors bg-pink-500/10 px-4 py-2 rounded-xl">
            <span>Support ❤️</span>
          </Link>
          {user ? (
            <>
              {/* Role-based dashboard link */}
              {user.role === "Admin" ? (
                <Link href="/admin" className="flex items-center gap-2 text-lg font-bold text-slate-300 hover:text-white transition-colors">
                  <LayoutDashboard size={22} />
                  <span>Admin Dashboard</span>
                </Link>
              ) : user.role === "Donor" ? (
                <Link href="/admin?role=Donor" className="flex items-center gap-2 text-lg font-bold text-slate-300 hover:text-white transition-colors">
                  <Package size={22} />
                  <span>Donor Portal</span>
                </Link>
              ) : (
                <Link href="/admin?role=NGO" className="flex items-center gap-2 text-lg font-bold text-slate-300 hover:text-white transition-colors">
                  <Heart size={22} />
                  <span>NGO Portal</span>
                </Link>
              )}
              <div className="flex items-center gap-4 border-l border-white/20 pl-6 ml-2">
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-2 text-white">
                    <div className="relative">
                      <UserIcon size={18} className="text-primary" />
                      {user.status === "Pending Approval" && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full animate-pulse border border-black" />
                      )}
                    </div>
                    <span className="font-medium">{user.name}</span>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${user.role === 'Admin' ? 'bg-primary/20 text-primary' : user.role === 'Donor' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    {user.role}
                  </span>
                </div>
                <button 
                  onClick={() => {
                    logout();
                    window.location.href = "/";
                  }}
                  className="flex items-center gap-2 text-sm font-bold text-red-400 hover:text-red-300 transition-colors ml-2"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4 border-l border-white/20 pl-6 ml-2">
              <Link href="/login" className="text-sm font-bold text-slate-300 hover:text-white transition-colors">
                Login
              </Link>
              <Link href="/register" className="text-sm font-bold bg-primary text-white px-4 py-2 rounded-xl hover:bg-primary/90 transition-colors">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
