"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, ShieldCheck, Package, Heart, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [activePortal, setActivePortal] = useState<"Admin" | "Donor" | "NGO" | null>(null);

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
            <h2 className="text-5xl font-black text-white mb-4">Choose Your Role</h2>
            <p className="text-slate-400 text-xl">Select your portal to access specialized tools for your organization.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Admin */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <button onClick={() => setActivePortal("Admin")} className="w-full text-left group h-full">
                <div className="bg-[#111] border border-white/5 hover:border-primary/50 rounded-3xl p-10 transition-all duration-300 hover:bg-white/[0.04] shadow-2xl relative overflow-hidden h-full flex flex-col hover:-translate-y-2">
                  <div className="absolute top-0 right-0 w-56 h-56 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/20 transition-all duration-500 blur-2xl" />
                  <div className="w-20 h-20 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center text-primary mb-8 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all shadow-[0_0_30px_rgba(59,130,246,0.15)] relative z-10">
                    <ShieldCheck size={40} />
                  </div>
                  <h3 className="text-3xl font-black text-white mb-4 relative z-10">Admin Portal</h3>
                  <p className="text-slate-400 text-base leading-relaxed mb-8 flex-1 relative z-10">Platform command center: manage partner verifications, monitor global logistics, and review AI insights.</p>
                  <div className="flex items-center gap-2 text-primary font-bold text-lg group-hover:gap-4 transition-all relative z-10">
                    Login as Admin <ArrowRight size={20} />
                  </div>
                </div>
              </button>
            </motion.div>

            {/* Donor */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <button onClick={() => setActivePortal("Donor")} className="w-full text-left group h-full">
                <div className="bg-[#111] border border-white/5 hover:border-emerald-500/50 rounded-3xl p-10 transition-all duration-300 hover:bg-white/[0.04] shadow-2xl relative overflow-hidden h-full flex flex-col hover:-translate-y-2">
                  <div className="absolute top-0 right-0 w-56 h-56 bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/20 transition-all duration-500 blur-2xl" />
                  <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-500 mb-8 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-[0_0_30px_rgba(16,185,129,0.15)] relative z-10">
                    <Package size={40} />
                  </div>
                  <h3 className="text-3xl font-black text-white mb-4 relative z-10">Donor Portal</h3>
                  <p className="text-slate-400 text-base leading-relaxed mb-8 flex-1 relative z-10">For hotels & restaurants. List your surplus food in seconds and track pickups directly from verified NGOs.</p>
                  <div className="flex items-center gap-2 text-emerald-500 font-bold text-lg group-hover:gap-4 transition-all relative z-10">
                    Start Donating <ArrowRight size={20} />
                  </div>
                </div>
              </button>
            </motion.div>

            {/* NGO */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <button onClick={() => setActivePortal("NGO")} className="w-full text-left group h-full">
                <div className="bg-[#111] border border-white/5 hover:border-amber-500/50 rounded-3xl p-10 transition-all duration-300 hover:bg-white/[0.04] shadow-2xl relative overflow-hidden h-full flex flex-col hover:-translate-y-2">
                  <div className="absolute top-0 right-0 w-56 h-56 bg-amber-500/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-amber-500/20 transition-all duration-500 blur-2xl" />
                  <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center text-amber-500 mb-8 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all shadow-[0_0_30px_rgba(245,158,11,0.15)] relative z-10">
                    <Heart size={40} />
                  </div>
                  <h3 className="text-3xl font-black text-white mb-4 relative z-10">NGO / Volunteer</h3>
                  <p className="text-slate-400 text-base leading-relaxed mb-8 flex-1 relative z-10">Browse live food rescues across the city, accept pickups, and track your delivery route in real-time.</p>
                  <div className="flex items-center gap-2 text-amber-500 font-bold text-lg group-hover:gap-4 transition-all relative z-10">
                    Rescue Food <ArrowRight size={20} />
                  </div>
                </div>
              </button>
            </motion.div>
          </div>
          
          <div className="text-center mt-12">
            <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
              &larr; Back to Home
            </Link>
          </div>
        </div>
      </section>

      {/* ── Interactive Inline Portal Modal ── */}
      <AnimatePresence>
        {activePortal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/60 backdrop-blur-xl"
              onClick={() => setActivePortal(null)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className={`relative w-full max-w-3xl bg-[#111] border border-white/10 rounded-[2.5rem] p-16 shadow-2xl overflow-hidden`}
            >
              {/* Animated Bubbles Inside Modal */}
              <div className="absolute inset-0 pointer-events-none z-0 opacity-40">
                {bubbles.map((b, i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full blur-[80px]"
                    style={{
                      width: b.size * 0.8,
                      height: b.size * 0.8,
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

              {/* Dynamic Theme Glow based on Portal */}
              <div className={`absolute top-0 left-0 w-full h-3 z-10 ${
                activePortal === "Admin" ? "bg-primary" : 
                activePortal === "Donor" ? "bg-emerald-500" : "bg-amber-500"
              }`} />
              
              <button 
                onClick={() => setActivePortal(null)}
                className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors bg-white/5 p-4 rounded-full hover:bg-white/10 z-20"
              >
                <X size={28} />
              </button>

              <div className={`relative z-10 w-24 h-24 rounded-[2rem] flex items-center justify-center mb-10 shadow-2xl ${
                activePortal === "Admin" ? "bg-primary/20 text-primary border border-primary/30" : 
                activePortal === "Donor" ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30" : 
                "bg-amber-500/20 text-amber-500 border border-amber-500/30"
              }`}>
                {activePortal === "Admin" && <ShieldCheck size={48} />}
                {activePortal === "Donor" && <Package size={48} />}
                {activePortal === "NGO" && <Heart size={48} />}
              </div>

              <h2 className="relative z-10 text-5xl font-black text-white mb-4 tracking-tight">{activePortal} Portal</h2>
              <p className="relative z-10 text-xl text-slate-400 mb-10 leading-relaxed max-w-2xl">
                {activePortal === "Admin" && "Enter your secure passcode to access the logistics dashboard."}
                {activePortal === "Donor" && "Sign in to list surplus food and track your donation history."}
                {activePortal === "NGO" && "Login to view active food rescues in your immediate area."}
              </p>

              <div className="relative z-10 space-y-6">
                {activePortal === "Admin" ? (
                  <div className="relative">
                    <input 
                      type="password" 
                      defaultValue="og123"
                      placeholder="Enter Admin Passcode" 
                      className="w-full bg-black/60 border border-white/10 focus:border-primary focus:ring-2 focus:ring-primary rounded-2xl py-6 px-8 text-2xl text-white font-medium outline-none transition-all placeholder:text-slate-600"
                    />
                  </div>
                ) : (
                  <div className="space-y-6">
                    <input 
                      type="email" 
                      defaultValue={activePortal === "Donor" ? "manager@tajhotels.com" : "volunteer@robinhoodarmy.com"}
                      placeholder="Email Address" 
                      className={`w-full bg-black/60 border border-white/10 rounded-2xl py-6 px-8 text-2xl text-white font-medium outline-none transition-all placeholder:text-slate-600 focus:ring-2 ${
                        activePortal === "Donor" ? "focus:border-emerald-500 focus:ring-emerald-500" : "focus:border-amber-500 focus:ring-amber-500"
                      }`}
                    />
                    <input 
                      type="password" 
                      defaultValue="password123"
                      placeholder="Password" 
                      className={`w-full bg-black/60 border border-white/10 rounded-2xl py-6 px-8 text-2xl text-white font-medium outline-none transition-all placeholder:text-slate-600 focus:ring-2 ${
                        activePortal === "Donor" ? "focus:border-emerald-500 focus:ring-emerald-500" : "focus:border-amber-500 focus:ring-amber-500"
                      }`}
                    />
                  </div>
                )}
                
                <div className="pt-8">
                  <Link 
                    href={`/admin?role=${activePortal}`} 
                    onClick={() => setActivePortal(null)}
                    className={`flex w-full py-6 text-white font-black text-2xl rounded-2xl transition-all shadow-xl items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] ${
                      activePortal === "Admin" ? "bg-primary hover:bg-primary/90 shadow-[0_0_40px_rgba(59,130,246,0.3)]" : 
                      activePortal === "Donor" ? "bg-emerald-500 hover:bg-emerald-600 shadow-[0_0_40px_rgba(16,185,129,0.3)]" : 
                      "bg-amber-500 hover:bg-amber-600 shadow-[0_0_40px_rgba(245,158,11,0.3)]"
                    }`}
                  >
                    Access Dashboard <ArrowRight size={28} />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
