"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, Package, Heart, Zap, MapPin, Coins, LayoutDashboard, BarChart3, Bell, Route, QrCode, Star, Flame, Users, Clock, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const stats = [
  { label: "Meals Rescued", value: "2.4M+" },
  { label: "Active NGOs", value: "340+" },
  { label: "Cities Live", value: "12" },
  { label: "Donors Onboard", value: "1,200+" },
];

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

const portals = [
  {
    icon: ShieldCheck,
    title: "Admin Portal",
    color: "primary",
    colorHex: "#3b82f6",
    ringColor: "hover:border-blue-500/50",
    badgeClass: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    badge: "Platform Control",
    features: [
      { icon: LayoutDashboard, text: "Global operations overview" },
      { icon: BarChart3, text: "Real-time analytics & AI insights" },
      { icon: Bell, text: "Audit logs & notifications" },
      { icon: Users, text: "Partner verification panel" },
    ],
    desc: "Full platform command center. Oversee all donations, NGO verifications, and logistics in one unified view.",
  },
  {
    icon: Package,
    title: "Donor Portal",
    color: "emerald-500",
    colorHex: "#10b981",
    ringColor: "hover:border-emerald-500/50",
    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    badge: "Hotels & Restaurants",
    features: [
      { icon: Package, text: "List surplus food in seconds" },
      { icon: Clock, text: "Set expiry timers & cooked times" },
      { icon: CheckCircle2, text: "Track NGO pickups in real-time" },
      { icon: BarChart3, text: "View your total impact score" },
    ],
    desc: "List excess food with quantity, type, and expiry. Watch verified NGOs accept and route to your location.",
  },
  {
    icon: Heart,
    title: "NGO / Volunteer",
    color: "amber-500",
    colorHex: "#f59e0b",
    ringColor: "hover:border-amber-500/50",
    badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    badge: "NGOs & Volunteers",
    features: [
      { icon: MapPin, text: "Live feed of food near you" },
      { icon: Route, text: "OSRM-powered delivery routing" },
      { icon: Clock, text: "Expiry countdown on every listing" },
      { icon: CheckCircle2, text: "One-tap pickup acceptance" },
    ],
    desc: "Browse active food rescue requests on a live map, accept pickups, and track your real-time delivery route.",
  },
];

const mapFeatures = [
  { icon: MapPin, label: "Real Restaurants", desc: "Powered by OpenStreetMap — no API key, real data" },
  { icon: Flame, label: "Expiry Heatmap", desc: "Toggle to visualize food-waste hotspots city-wide" },
  { icon: Route, label: "Inline Routing", desc: "Delivery routes drawn on the map, no redirects" },
  { icon: Star, label: "Rate & Check In", desc: "Review places and mark your visits" },
];

const supportFeatures = [
  { icon: Heart, label: "Donate to NGOs", desc: "Support Robin Hood Army, Feeding India & more" },
  { icon: Users, label: "Tip Volunteers", desc: "Reward the volunteers who do the heavy lifting" },
  { icon: QrCode, label: "UPI QR Payments", desc: "Real UPI deep-link QR code. Scan with any phone app" },
  { icon: Coins, label: "Auto Verification", desc: "Payment status verified with a simulated webhook check" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-black relative flex flex-col font-sans selection:bg-primary/30">

      {/* Fixed Background Bubbles */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {bubbles.map((b, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full blur-[100px]"
            style={{ width: b.size, height: b.size, left: b.left, top: b.top, background: b.color }}
            animate={{ x: b.xPath, y: b.yPath, scale: [1, 1.2, 0.8, 1] }}
            transition={{ duration: b.duration, repeat: Infinity, ease: "linear" }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full flex-1 flex flex-col">

        {/* ── Hero ── */}
        <section className="flex flex-col items-center justify-center px-6 pt-28 pb-20 text-center">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-sm font-bold px-4 py-2 rounded-full mb-8 backdrop-blur-md"
          >
            <Zap size={14} className="fill-primary" />
            India's First AI-Powered Food Rescue Network
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black text-white leading-tight tracking-tight mb-6"
          >
            Welcome to
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-400 to-primary">
              {" "}SmartCanteen.
            </span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-16 leading-relaxed"
          >
            Connecting restaurants and hotels with verified NGOs to rescue surplus food — in real-time, before it's too late.
          </motion.p>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-4xl mx-auto mb-16"
          >
            {stats.map((stat, i) => (
              <div key={i} className="bg-white/5 border border-white/10 hover:border-white/20 transition-all rounded-2xl p-6 text-center backdrop-blur-md shadow-xl">
                <p className="text-4xl font-black text-white mb-2">{stat.value}</p>
                <p className="text-sm text-slate-400 font-bold uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Link
              href="/portals"
              className="inline-flex items-center justify-center gap-3 bg-primary text-white font-black text-xl px-12 py-5 rounded-full hover:bg-primary/90 transition-all shadow-[0_0_40px_rgba(59,130,246,0.3)] hover:shadow-[0_0_60px_rgba(59,130,246,0.5)] hover:-translate-y-1"
            >
              Explore <ArrowRight size={24} />
            </Link>
          </motion.div>
        </section>

        {/* ── Portal Showcase ── */}
        <section className="px-6 py-24 max-w-7xl mx-auto w-full">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-xs font-black uppercase tracking-widest text-primary mb-4 block">Three Portals. One Mission.</span>
            <h2 className="text-5xl font-black text-white mb-4">Built for Every Role</h2>
            <p className="text-slate-400 text-xl max-w-2xl mx-auto">Each stakeholder gets a specialized, purpose-built dashboard to do their part in eliminating food waste.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {portals.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`bg-[#111] border border-white/5 ${p.ringColor} rounded-3xl p-8 transition-all duration-300 hover:bg-white/[0.03] shadow-2xl flex flex-col`}
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border`}
                  style={{ background: `${p.colorHex}15`, borderColor: `${p.colorHex}30`, color: p.colorHex }}>
                  <p.icon size={32} />
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border w-fit mb-4 ${p.badgeClass}`}>{p.badge}</span>
                <h3 className="text-2xl font-black text-white mb-3">{p.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">{p.desc}</p>
                <ul className="space-y-3 mt-auto">
                  {p.features.map(({ icon: Icon, text }) => (
                    <li key={text} className="flex items-center gap-3 text-sm text-slate-300">
                      <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${p.colorHex}15`, color: p.colorHex }}>
                        <Icon size={14} />
                      </span>
                      {text}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Live Map Section ── */}
        <section className="px-6 py-24 bg-white/[0.02] border-y border-white/5">
          <div className="max-w-7xl mx-auto w-full">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-4 block">Real-Time Intelligence</span>
              <h2 className="text-5xl font-black text-white mb-4">Live Map</h2>
              <p className="text-slate-400 text-xl max-w-2xl mx-auto">The city at your fingertips. Find food places, visualize waste hotspots, and track rescue routes — all on one map.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {mapFeatures.map(({ icon: Icon, label, desc }, i) => (
                <motion.div key={label}
                  initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  className="bg-[#111] border border-white/5 hover:border-emerald-500/30 rounded-2xl p-6 transition-all hover:bg-white/[0.03]"
                >
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 mb-4">
                    <Icon size={22} />
                  </div>
                  <h4 className="font-bold text-white mb-2">{label}</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
                </motion.div>
              ))}
            </div>

            {/* Decorative Map Preview Card */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="mt-12 rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative"
              style={{ height: "280px", background: "linear-gradient(135deg, #0f1923 0%, #1a2535 100%)" }}
            >
              <div className="absolute inset-0 flex items-center justify-center gap-8">
                {/* Fake map dots */}
                {[
                  { top: "30%", left: "20%", color: "#dc2626", pulse: true },
                  { top: "55%", left: "35%", color: "#d97706", pulse: false },
                  { top: "40%", left: "55%", color: "#059669", pulse: true },
                  { top: "25%", left: "70%", color: "#dc2626", pulse: false },
                  { top: "65%", left: "75%", color: "#059669", pulse: true },
                  { top: "70%", left: "50%", color: "#d97706", pulse: false },
                ].map((dot, i) => (
                  <div key={i} className="absolute" style={{ top: dot.top, left: dot.left }}>
                    {dot.pulse && <div className="absolute inset-0 rounded-full animate-ping" style={{ background: dot.color, opacity: 0.4, width: 24, height: 24, transform: "translate(-50%,-50%)" }} />}
                    <div className="w-5 h-5 rounded-full border-2 border-white shadow-lg" style={{ background: dot.color, transform: "translate(-50%,-50%)" }} />
                  </div>
                ))}
                {/* Road lines */}
                <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
                  <line x1="0" y1="50%" x2="100%" y2="50%" stroke="white" strokeWidth="1" />
                  <line x1="30%" y1="0" x2="30%" y2="100%" stroke="white" strokeWidth="1" />
                  <line x1="65%" y1="0" x2="65%" y2="100%" stroke="white" strokeWidth="1" />
                  <line x1="0" y1="30%" x2="100%" y2="70%" stroke="white" strokeWidth="1" />
                </svg>
                <div className="absolute bottom-6 left-6 bg-black/70 backdrop-blur-md border border-white/10 rounded-xl px-4 py-2 text-xs font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" /> Live — {Math.floor(Math.random() * 30 + 10)} active locations
                </div>
                <div className="absolute top-6 right-6 bg-black/70 backdrop-blur-md border border-white/10 rounded-xl px-4 py-2 text-xs font-bold text-white">
                  🗺️ OpenStreetMap Powered
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Support / Payments Section ── */}
        <section className="px-6 py-24 max-w-7xl mx-auto w-full">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-xs font-black uppercase tracking-widest text-pink-400 mb-4 block">Community Support</span>
            <h2 className="text-5xl font-black text-white mb-4">Support the Ecosystem</h2>
            <p className="text-slate-400 text-xl max-w-2xl mx-auto">Donations keep this mission alive. Anyone can contribute — to NGOs or the volunteers on the ground.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="grid grid-cols-2 gap-5">
              {supportFeatures.map(({ icon: Icon, label, desc }, i) => (
                <motion.div key={label}
                  initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  className="bg-[#111] border border-white/5 hover:border-pink-500/30 rounded-2xl p-5 transition-all"
                >
                  <div className="w-10 h-10 bg-pink-500/10 rounded-xl flex items-center justify-center text-pink-400 mb-3">
                    <Icon size={18} />
                  </div>
                  <h4 className="font-bold text-white text-sm mb-1">{label}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
                </motion.div>
              ))}
            </div>

            {/* UPI QR Preview Card */}
            <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="bg-[#111] border border-white/10 rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500" />
              <div className="w-16 h-16 bg-pink-500/10 rounded-full flex items-center justify-center text-pink-400 mb-5">
                <QrCode size={32} />
              </div>
              <h3 className="text-2xl font-black text-white mb-2">Real UPI QR Code</h3>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                The payment QR is a live UPI deep-link. Scanning it on your phone opens Google Pay, PhonePe, or any UPI app instantly.
              </p>
              <div className="bg-white p-4 rounded-2xl shadow-xl mb-6">
                {/* Fake QR Grid */}
                <div className="w-32 h-32 grid grid-cols-8 gap-0.5">
                  {Array.from({ length: 64 }).map((_, i) => (
                    <div key={i} className="rounded-sm" style={{ background: Math.random() > 0.45 ? "#000" : "#fff", aspectRatio: "1" }} />
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 bg-white/5 border border-white/10 rounded-full px-4 py-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" /> Demo only — no real money transferred
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="px-6 py-24 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-5xl font-black text-white mb-4">Ready to Make an Impact?</h2>
            <p className="text-slate-400 text-xl mb-10 max-w-xl mx-auto">Join 1,200+ donors and 340 NGOs already rescuing food across India.</p>
            <Link
              href="/portals"
              className="inline-flex items-center justify-center gap-3 bg-primary text-white font-black text-xl px-12 py-5 rounded-full hover:bg-primary/90 transition-all shadow-[0_0_40px_rgba(59,130,246,0.3)] hover:shadow-[0_0_60px_rgba(59,130,246,0.5)] hover:-translate-y-1"
            >
              Get Started <ArrowRight size={24} />
            </Link>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="py-8 border-t border-white/10 text-center text-slate-500 text-sm">
          <p>© 2026 SmartCanteen. All rights reserved. Building a hunger-free world.</p>
        </footer>
      </div>
    </div>
  );
}
