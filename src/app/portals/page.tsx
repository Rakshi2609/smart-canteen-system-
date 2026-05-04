"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ArrowRight, ShieldCheck, Package, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const bubbles = [
  { size: 250, left: "5%",  top: "20%", duration: 18, color: "rgba(59,130,246,0.2)", xPath: [0, 200, -100, 0], yPath: [0, -200, 150, 0] },
  { size: 300, left: "30%", top: "60%", duration: 22, color: "rgba(16,185,129,0.15)", xPath: [0, -150, 200, 0], yPath: [0, 150, -100, 0] },
  { size: 200, left: "70%", top: "30%", duration: 15, color: "rgba(245,158,11,0.15)", xPath: [0, 100, -200, 0], yPath: [0, -100, 200, 0] },
  { size: 280, left: "80%", top: "70%", duration: 20, color: "rgba(59,130,246,0.15)", xPath: [0, -200, 100, 0], yPath: [0, 200, -150, 0] },
  { size: 320, left: "40%", top: "10%", duration: 25, color: "rgba(236,72,153,0.15)", xPath: [0, 150, -150, 0], yPath: [0, 100, -100, 0] },
  { size: 220, left: "15%", top: "80%", duration: 19, color: "rgba(16,185,129,0.15)", xPath: [0, 100, 200, 0], yPath: [0, -150, 100, 0] },
  { size: 270, left: "60%", top: "85%", duration: 24, color: "rgba(59,130,246,0.2)", xPath: [0, -100, -200, 0], yPath: [0, 200, 100, 0] },
  { size: 180, left: "90%", top: "15%", duration: 17, color: "rgba(245,158,11,0.15)", xPath: [0, -200, 100, 0], yPath: [0, 100, -200, 0] }
];

export default function PortalsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // If user is logged in, redirect to their dashboard
  useEffect(() => {
    if (isHydrated && user) {
      const roleToPath: Record<string, string> = {
        "Admin": "/admin",
        "Donor": "/admin?role=Donor",
        "NGO": "/admin?role=NGO",
      };
      router.replace(roleToPath[user.role] || "/admin");
    }
  }, [user, router, isHydrated]);

  if (loading || !isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  // User is authenticated, show redirect message
  if (user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">Redirecting you to your dashboard...</p>
          <Loader2 className="animate-spin text-primary mx-auto" size={40} />
        </div>
      </div>
    );
  }

  // User is not authenticated, show portal selection

  return (
    <div className="min-h-[calc(100vh-80px)] bg-black relative flex flex-col font-sans selection:bg-primary/30 pt-16">
      
      {/* ── Fixed Interactive Background Bubbles ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {bubbles.map((b, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full blur-[100px]"
            style={{
              width: b.size,
              height: b.size,
              left: b.left,
              top: b.top,
              background: b.color,
            }}
            animate={{
              x: b.xPath,
              y: b.yPath,
              scale: [1, 1.2, 0.8, 1],
            }}
            transition={{
              duration: b.duration,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* ── Portals Section ── */}
      <section className="px-6 py-16 relative z-10 flex-1 flex flex-col justify-center">
        <div className="max-w-6xl mx-auto w-full">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-white mb-4">Smart Canteen System</h2>
            <p className="text-slate-400 text-xl">Choose your role and start reducing food waste today</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Admin Portal */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="w-full text-left group h-full">
                <div className="bg-[#111] border border-white/5 hover:border-primary/50 rounded-3xl p-10 transition-all duration-300 hover:bg-white/[0.04] shadow-2xl relative overflow-hidden h-full flex flex-col hover:-translate-y-2">
                  <div className="absolute top-0 right-0 w-56 h-56 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/20 transition-all duration-500 blur-2xl" />
                  <div className="w-20 h-20 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center text-primary mb-8 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all shadow-[0_0_30px_rgba(59,130,246,0.15)] relative z-10">
                    <ShieldCheck size={40} />
                  </div>
                  <h3 className="text-3xl font-black text-white mb-4 relative z-10">Admin Portal</h3>
                  <p className="text-slate-400 text-base leading-relaxed mb-8 flex-1 relative z-10">Full platform control: verify partners, monitor logistics, review analytics, and manage the entire network.</p>
                  <Link href="/register" className="flex items-center gap-2 text-primary font-bold text-lg group-hover:gap-4 transition-all relative z-10 hover:underline">
                    Get Started <ArrowRight size={20} />
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Donor Portal */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="w-full text-left group h-full">
                <div className="bg-[#111] border border-white/5 hover:border-emerald-500/50 rounded-3xl p-10 transition-all duration-300 hover:bg-white/[0.04] shadow-2xl relative overflow-hidden h-full flex flex-col hover:-translate-y-2">
                  <div className="absolute top-0 right-0 w-56 h-56 bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/20 transition-all duration-500 blur-2xl" />
                  <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-500 mb-8 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-[0_0_30px_rgba(16,185,129,0.15)] relative z-10">
                    <Package size={40} />
                  </div>
                  <h3 className="text-3xl font-black text-white mb-4 relative z-10">Donor Portal</h3>
                  <p className="text-slate-400 text-base leading-relaxed mb-8 flex-1 relative z-10">For hotels & restaurants: List surplus food in seconds, track pickups, and see your donation impact in real-time.</p>
                  <Link href="/register" className="flex items-center gap-2 text-emerald-500 font-bold text-lg group-hover:gap-4 transition-all relative z-10 hover:underline">
                    Start Donating <ArrowRight size={20} />
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* NGO Portal */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <div className="w-full text-left group h-full">
                <div className="bg-[#111] border border-white/5 hover:border-amber-500/50 rounded-3xl p-10 transition-all duration-300 hover:bg-white/[0.04] shadow-2xl relative overflow-hidden h-full flex flex-col hover:-translate-y-2">
                  <div className="absolute top-0 right-0 w-56 h-56 bg-amber-500/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-amber-500/20 transition-all duration-500 blur-2xl" />
                  <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center text-amber-500 mb-8 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all shadow-[0_0_30px_rgba(245,158,11,0.15)] relative z-10">
                    <Heart size={40} />
                  </div>
                  <h3 className="text-3xl font-black text-white mb-4 relative z-10">NGO / Volunteer</h3>
                  <p className="text-slate-400 text-base leading-relaxed mb-8 flex-1 relative z-10">Browse live food rescues, accept pickup requests, track delivery routes, and maximize your impact.</p>
                  <Link href="/register" className="flex items-center gap-2 text-amber-500 font-bold text-lg group-hover:gap-4 transition-all relative z-10 hover:underline">
                    Join Now <ArrowRight size={20} />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
          
          <div className="text-center mt-12 space-y-4">
            <p className="text-slate-400">
              Already have an account? <Link href="/login" className="text-primary hover:underline font-bold">Sign in</Link>
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
