"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { Loader2, Navigation, Clock, Star, Bookmark, BookmarkCheck, Share2, Utensils, Wifi, Coffee, MapPin, CheckCircle2 } from "lucide-react";
import { Canteen } from "@/components/LiveMap";

const LiveMap = dynamic(() => import("@/components/LiveMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center rounded-2xl glass-panel">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  ),
});

export default function MapPage() {
  const [selectedLocation, setSelectedLocation] = useState<Canteen | null>(null);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [checkedIn, setCheckedIn] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [crowdLevel, setCrowdLevel] = useState<"Low" | "Moderate" | "Busy">("Low");
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);

  useEffect(() => {
    if (selectedLocation) {
      // Simulate live crowd data
      const levels: ("Low" | "Moderate" | "Busy")[] = ["Low", "Moderate", "Busy"];
      setCrowdLevel(levels[Math.floor(Math.random() * 3)]);
      setRating(0);
    }
  }, [selectedLocation]);

  const toggleSave = (id: string) => {
    setSaved(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleCheckIn = (id: string) => {
    setCheckedIn(id);
    setToastMessage("Yes, we have informed the restaurant!");
    setTimeout(() => {
      setCheckedIn(null);
      setToastMessage(null);
    }, 4000);
  };

  const handleShare = (loc: Canteen) => {
    const url = `https://www.google.com/maps?q=${loc.lat},${loc.lng}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const crowdColor = { Low: "text-emerald-400", Moderate: "text-amber-400", Busy: "text-red-400" };
  const crowdBg = { Low: "bg-emerald-500/20 border-emerald-500/30", Moderate: "bg-amber-500/20 border-amber-500/30", Busy: "bg-red-500/20 border-red-500/30" };
  const crowdBar = { Low: 1, Moderate: 2, Busy: 3 };

  return (
    <div className="flex-1 flex px-6 pb-6 gap-6 h-[calc(100vh-64px)]">
      {toastMessage && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[1000] bg-emerald-500 text-white px-6 py-3 rounded-full shadow-2xl font-bold flex items-center gap-2 animate-in slide-in-from-top-4">
          <CheckCircle2 size={20} />
          {toastMessage}
        </div>
      )}
      {/* Map Section */}
      <div className="flex-1 relative rounded-2xl overflow-hidden glass-panel border border-white/5 shadow-2xl">
        <div className="absolute top-6 left-6 z-10 bg-black/80 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-2xl max-w-xs pointer-events-none">
          <h1 className="text-lg font-bold text-white mb-1 flex items-center gap-2">🍽️ Food Near Me</h1>
          <p className="text-xs text-slate-400">Real restaurants & cafes near you via OpenStreetMap. Click any pin to explore.</p>
        </div>
        <LiveMap onCanteenSelect={setSelectedLocation} />
      </div>

      {/* Side Panel */}
      <div className="w-96 glass-panel rounded-2xl flex flex-col overflow-hidden border border-white/5 shadow-2xl">
        {selectedLocation ? (
          <>
            {/* Header */}
            <div className="p-6 border-b border-white/10 bg-[#161616] relative">
              {/* Save + Share */}
              <div className="absolute top-5 right-5 flex gap-2">
                <button
                  onClick={() => handleShare(selectedLocation)}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                  title="Copy location link"
                >
                  {copied ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Share2 size={16} className="text-slate-400" />}
                </button>
                <button
                  onClick={() => toggleSave(selectedLocation.id)}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                  title="Save place"
                >
                  {saved.has(selectedLocation.id)
                    ? <BookmarkCheck size={16} className="text-primary" />
                    : <Bookmark size={16} className="text-slate-400" />}
                </button>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg border ${selectedLocation.openNow ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-red-500/20 text-red-400 border-red-500/20"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${selectedLocation.openNow ? "bg-emerald-400" : "bg-red-400"} inline-block`} />
                  {selectedLocation.openNow ? "Open Now" : "Closed"}
                </span>
                {selectedLocation.cuisine && (
                  <span className="flex items-center gap-1 text-xs text-slate-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5 capitalize">
                    <Utensils size={10} /> {selectedLocation.cuisine}
                  </span>
                )}
              </div>

              <h2 className="text-2xl font-bold text-white pr-14">{selectedLocation.name}</h2>
              <p className="text-sm text-slate-400 mt-1.5 flex items-center gap-1">
                <Navigation size={12} /> {selectedLocation.waitTime} away
                {selectedLocation.address && <> · {selectedLocation.address}</>}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-black/40">

              {/* ── Star Rating ── */}
              <div className="p-4 rounded-2xl bg-[#1e1e1e] border border-white/5">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Your Rating</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onMouseEnter={() => setHovered(star)}
                      onMouseLeave={() => setHovered(0)}
                      onClick={() => setRating(star)}
                      className="transition-transform hover:scale-125"
                    >
                      <Star
                        size={28}
                        className={`transition-colors ${star <= (hovered || rating) ? "fill-amber-400 text-amber-400" : "text-slate-600"}`}
                      />
                    </button>
                  ))}
                  {rating > 0 && (
                    <span className="ml-2 text-sm text-amber-400 font-bold self-center">
                      {["", "Poor", "Fair", "Good", "Great", "Excellent"][rating]}
                    </span>
                  )}
                </div>
              </div>

              {/* ── Live Crowd Meter ── */}
              <div className="p-4 rounded-2xl bg-[#1e1e1e] border border-white/5">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Live Crowd Level</p>
                <div className={`flex items-center gap-3 p-3 rounded-xl border ${crowdBg[crowdLevel]}`}>
                  <div className="flex gap-1">
                    {[1, 2, 3].map(i => (
                      <div
                        key={i}
                        className={`w-3 rounded-full transition-all ${i <= crowdBar[crowdLevel] ? crowdColor[crowdLevel].replace("text-", "bg-") : "bg-white/10"}`}
                        style={{ height: `${12 + i * 8}px` }}
                      />
                    ))}
                  </div>
                  <span className={`font-bold text-sm ${crowdColor[crowdLevel]}`}>{crowdLevel}</span>
                  <span className="text-xs text-slate-500 ml-auto">Updated just now</span>
                </div>
              </div>

              {/* ── Amenities ── */}
              <div className="p-4 rounded-2xl bg-[#1e1e1e] border border-white/5">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Amenities</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { icon: Wifi, label: "Free WiFi" },
                    { icon: Coffee, label: "Takeaway" },
                    { icon: MapPin, label: "Dine-in" },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex flex-col items-center gap-1.5 p-3 bg-black/40 rounded-xl border border-white/5 text-center">
                      <Icon size={18} className="text-primary" />
                      <span className="text-xs text-slate-400 font-medium">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Bottom Action Bar ── */}
            <div className="p-5 bg-[#161616] border-t border-white/5 space-y-3">
              {/* Check-in Button */}
              <button
                onClick={() => handleCheckIn(selectedLocation.id)}
                className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold transition-all ${checkedIn === selectedLocation.id
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                    : "bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
                  }`}
              >
                {checkedIn === selectedLocation.id ? (
                  <><CheckCircle2 size={18} /> Checked In! 🎉</>
                ) : (
                  <><MapPin size={18} /> Check In Here</>
                )}
              </button>

              {/* Get Directions Button */}
              <button
                onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedLocation.lat},${selectedLocation.lng}`, '_blank')}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold transition-all bg-white/10 hover:bg-white/20 text-white shadow-lg"
              >
                <Navigation size={18} /> Get Directions
              </button>

              <p className="text-xs text-center text-slate-500">
                {saved.has(selectedLocation.id) ? "✓ Saved to your places" : "Tap ✦ to save for later"}
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="p-6 border-b border-white/5 bg-[#161616]">
              <h2 className="text-xl font-bold text-white">Restaurant Finder</h2>
              <p className="text-sm text-slate-400 mt-1">Real food places near you — powered by OpenStreetMap.</p>
            </div>
            <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-center bg-black/40 gap-6">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center shadow-inner border border-primary/20 animate-pulse">
                <Utensils size={36} className="text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-200">Tap a Pin</h3>
                <p className="text-sm text-slate-500 mt-2 max-w-[240px] leading-relaxed">
                  Click on any map pin to see details, crowd level, amenities, and check in.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 w-full">
                {["🟢 Available", "🟠 Moderate", "🔴 Busy"].map(label => (
                  <div key={label} className="text-xs text-slate-500 bg-white/5 rounded-xl py-2 px-1 text-center border border-white/5">{label}</div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
