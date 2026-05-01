"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { Loader2, Navigation, Clock, Users, ArrowRight, ShieldCheck, Heart } from "lucide-react";
import { Canteen } from "@/components/LiveMap";

// Dynamically import the LiveMap component to disable SSR
const LiveMap = dynamic(() => import("@/components/LiveMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center rounded-2xl glass-panel">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  ),
});

interface AvailableFood {
  id: string;
  name: string;
  quantity: number;
  type: "Veg" | "Non-Veg";
  expiresIn: string;
}

export default function MapPage() {
  const [selectedLocation, setSelectedLocation] = useState<Canteen | null>(null);
  const [partnerType, setPartnerType] = useState<"NGO" | "Donor">("NGO");
  const [foodItems, setFoodItems] = useState<AvailableFood[]>([]);

  const handleLocationSelect = (location: Canteen) => {
    setSelectedLocation(location);
    
    // Randomly assign as an NGO Distribution Center or a Direct Donor
    const isNGO = Math.random() > 0.4;
    setPartnerType(isNGO ? "NGO" : "Donor");
    
    // Pool of realistic rescued food
    const allItems = [
      { name: "Mixed Veg Curry & Rice", type: "Veg" },
      { name: "Chicken Biryani (Bulk)", type: "Non-Veg" },
      { name: "Assorted Sandwiches", type: "Veg" },
      { name: "Lentil Soup (Dal)", type: "Veg" },
      { name: "Fresh Baked Breads", type: "Veg" },
      { name: "Chicken Tikka Wraps", type: "Non-Veg" },
      { name: "South Indian Thali", type: "Veg" },
    ];

    // Pick 1 to 3 random items
    const shuffled = [...allItems].sort(() => 0.5 - Math.random());
    const selectedItems = shuffled.slice(0, 1 + Math.floor(Math.random() * 3));

    const newFood = selectedItems.map((item, index) => ({
      id: `food-${index}`,
      name: item.name,
      type: item.type as "Veg" | "Non-Veg",
      quantity: 15 + Math.floor(Math.random() * 40), // 15 to 55 portions
      expiresIn: `${1 + Math.floor(Math.random() * 3)} hours`,
    }));

    setFoodItems(newFood);
  };

  const getDirections = () => {
    if (selectedLocation) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedLocation.lat},${selectedLocation.lng}`, '_blank');
    }
  };

  return (
    <div className="flex-1 flex px-6 pb-6 gap-6 h-[calc(100vh-64px)]">
      {/* Map Section */}
      <div className="flex-1 relative rounded-2xl overflow-hidden glass-panel border border-white/5 shadow-2xl">
        {/* Map Header Overlay */}
        <div className="absolute top-6 left-6 z-10 bg-black/80 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-2xl max-w-sm pointer-events-none">
           <h1 className="text-xl font-bold text-white mb-1 flex items-center gap-2">📍 Find Food Near Me</h1>
           <p className="text-sm text-slate-400">Click on any glowing pin to see available free meals being distributed by NGOs and Donors right now.</p>
        </div>
        
        <LiveMap onCanteenSelect={handleLocationSelect} />
      </div>

      {/* Side Panel for Public Locator */}
      <div className="w-96 glass-panel rounded-2xl flex flex-col overflow-hidden border border-white/5 shadow-2xl">
        {selectedLocation ? (
          <>
            <div className="p-6 border-b border-white/10 bg-[#161616] relative">
              <div className="flex items-center gap-2 mb-3">
                {partnerType === "NGO" ? (
                  <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 bg-amber-500/20 text-amber-500 rounded-md"><Heart size={12}/> Verified NGO</span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 bg-emerald-500/20 text-emerald-500 rounded-md"><ShieldCheck size={12}/> Verified Donor</span>
                )}
                <span className="flex items-center gap-1 text-xs text-slate-400 bg-white/5 px-2 py-1 rounded-md"><Clock size={12}/> Active Now</span>
              </div>
              <h2 className="text-2xl font-bold text-white">{selectedLocation.name}</h2>
              <p className="text-sm text-slate-400 mt-2 flex items-center gap-1"><Navigation size={14}/> {selectedLocation.waitTime} walk from your location</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-black/40">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Available Surplus Food</h3>
              
              {foodItems.map((item) => (
                <div key={item.id} className="p-5 rounded-xl bg-[#1e1e1e] border border-white/5 flex flex-col gap-3 shadow-lg hover:border-white/10 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-white text-lg leading-tight">{item.name}</h4>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${item.type === 'Veg' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                          {item.type}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1"><Clock size={10}/> Expires in {item.expiresIn}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-2 pt-3 border-t border-white/5 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-500 font-medium">Portions Left</span>
                      <span className="text-xl font-black text-white">{item.quantity}</span>
                    </div>
                    <Users className="text-slate-600" size={24}/>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Action Bottom Bar */}
            <div className="p-6 bg-[#161616] border-t border-white/5">
              <button 
                onClick={getDirections}
                className="w-full flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-colors shadow-lg shadow-primary/20"
              >
                <Navigation size={18} className="fill-white"/>
                Get Directions
                <ArrowRight size={16} />
              </button>
              <p className="text-xs text-center text-slate-500 mt-3">Free for anyone in need. First come, first served.</p>
            </div>
          </>
        ) : (
          <>
            <div className="p-6 border-b border-white/5 bg-[#161616]">
              <h2 className="text-xl font-bold text-white">Food Bank Locator</h2>
              <p className="text-sm text-slate-400 mt-1">Find active food rescues happening near you right now.</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-center bg-black/40">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6 shadow-inner border border-primary/20 animate-pulse">
                <MapPinIcon />
              </div>
              <h3 className="text-xl font-bold text-slate-200">Select a Location</h3>
              <p className="text-sm text-slate-500 mt-3 max-w-[250px] leading-relaxed">
                Click on any of the pins on the map to see how many free meals are currently available for collection.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function MapPinIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );
}
