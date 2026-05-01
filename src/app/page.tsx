"use client";

import Link from "next/link";
import { MapPin, Search, LayoutDashboard } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-6 text-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl space-y-8 glass-panel p-12 rounded-3xl relative overflow-hidden"
      >
        {/* Abstract background blobs for aesthetics */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-accent/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
            Smart Canteen <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">System</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto">
            Real-time food availability, AI-powered demand prediction, and an interactive live map to optimize your campus dining experience.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
          <Link href="/map" className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all hover:scale-105 group">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
              <MapPin size={24} />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-lg">Live Food Map</h3>
              <p className="text-sm text-slate-400 mt-1">See what's cooking right now across all canteens.</p>
            </div>
          </Link>

          <Link href="/map" className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all hover:scale-105 group">
            <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center text-warning group-hover:bg-warning group-hover:text-white transition-colors">
              <Search size={24} />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-lg">Order / Check Food</h3>
              <p className="text-sm text-slate-400 mt-1">Reserve your meal before it runs out.</p>
            </div>
          </Link>

          <Link href="/admin" className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all hover:scale-105 group">
            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-colors">
              <LayoutDashboard size={24} />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-lg">Admin Dashboard</h3>
              <p className="text-sm text-slate-400 mt-1">Control center for canteen operators.</p>
            </div>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
