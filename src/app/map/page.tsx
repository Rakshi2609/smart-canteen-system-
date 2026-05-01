"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { Loader2, Clock, ShoppingBag, Sparkles } from "lucide-react";
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

export default function MapPage() {
  const [selectedCanteen, setSelectedCanteen] = useState<Canteen | null>(null);
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  const [menu, setMenu] = useState<any[]>([]);

  const handleCanteenSelect = (canteen: Canteen) => {
    setSelectedCanteen(canteen);
    
    // Pool of items to generate distinct menus instantly
    const allItems = [
      { name: "Masala Dosa", price: "₹60", category: "Breakfast" },
      { name: "Paneer Butter Masala", price: "₹150", category: "Lunch" },
      { name: "Veg Biryani", price: "₹120", category: "Lunch" },
      { name: "Filter Coffee", price: "₹25", category: "Beverages" },
      { name: "Chicken Tikka", price: "₹180", category: "Snacks" },
      { name: "Cold Coffee", price: "₹80", category: "Beverages" },
      { name: "Chole Bhature", price: "₹100", category: "Breakfast" },
      { name: "Idli Sambar", price: "₹40", category: "Breakfast" },
      { name: "Hakka Noodles", price: "₹110", category: "Dinner" },
      { name: "Mango Lassi", price: "₹50", category: "Beverages" },
      { name: "Aloo Paratha", price: "₹70", category: "Breakfast" },
      { name: "Butter Naan", price: "₹30", category: "Lunch" },
      { name: "Vada Pav", price: "₹20", category: "Snacks" },
      { name: "Grilled Sandwich", price: "₹80", category: "Snacks" },
      { name: "Fresh Lime Soda", price: "₹40", category: "Beverages" },
    ];

    // Pick 4 to 5 random items for this specific location
    const shuffled = [...allItems].sort(() => 0.5 - Math.random());
    const selectedItems = shuffled.slice(0, 4 + Math.floor(Math.random() * 2));

    const newMenu = selectedItems.map((item, index) => ({
      id: index + 1,
      name: item.name,
      price: item.price,
      available: Math.floor(Math.random() * 25), // Random stock 0 to 24
      category: item.category
    }));

    setMenu(newMenu);
  };

  const handleOrder = (itemName: string) => {
    setOrderStatus(`Placing order for ${itemName}...`);
    setTimeout(() => {
      setOrderStatus(`Order placed successfully! Please collect in ${selectedCanteen?.waitTime || '10 mins'}.`);
      setTimeout(() => setOrderStatus(null), 3000);
    }, 1500);
  };

  return (
    <div className="flex-1 flex px-6 pb-6 gap-6 h-[calc(100vh-64px)]">
      {/* Map Section */}
      <div className="flex-1 relative rounded-2xl overflow-hidden glass-panel border border-white/5 shadow-2xl">
        <LiveMap onCanteenSelect={handleCanteenSelect} />
      </div>

      {/* Side Panel for Ordering / Menus */}
      <div className="w-96 glass-panel rounded-2xl flex flex-col overflow-hidden border border-white/5 shadow-2xl">
        {selectedCanteen ? (
          <>
            <div className="p-6 border-b border-white/10 bg-[#161616] relative">
              <h2 className="text-xl font-bold text-white">{selectedCanteen.name}</h2>
              <div className="flex items-center gap-3 mt-2 text-sm text-slate-300">
                <span className="flex items-center gap-1">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    selectedCanteen.status === 'available' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' :
                    selectedCanteen.status === 'low_stock' ? 'bg-amber-500 shadow-[0_0_8px_#f59e0b]' : 'bg-red-500 shadow-[0_0_8px_#ef4444]'
                  }`} />
                  <span className="capitalize">{selectedCanteen.status.replace('_', ' ')}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {selectedCanteen.waitTime} wait
                </span>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/40">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Live Menu</h3>
              </div>
              
              {menu.map((item) => (
                <div key={item.id} className="p-4 rounded-xl bg-[#1e1e1e] border border-white/5 flex flex-col gap-3 shadow-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-white">{item.name}</h4>
                      <p className="text-xs text-slate-400 mt-1">{item.category}</p>
                    </div>
                    <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md">{item.price}</span>
                  </div>
                  
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/5">
                    <span className={`text-xs px-2.5 py-1 rounded-md ${item.available > 10 ? 'bg-emerald-500/20 text-emerald-300' : item.available > 0 ? 'bg-amber-500/20 text-amber-300' : 'bg-red-500/20 text-red-300'}`}>
                      {item.available > 0 ? `${item.available} portions left` : 'Sold Out'}
                    </span>
                    
                    <button 
                      disabled={item.available === 0 || !!orderStatus}
                      onClick={() => handleOrder(item.name)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-primary/20"
                    >
                      <ShoppingBag size={14} />
                      Order
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Order Status Toast */}
            {orderStatus && (
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-emerald-600 text-white text-sm font-medium shadow-2xl animate-in slide-in-from-bottom-5 z-50">
                {orderStatus}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="p-6 border-b border-white/5 bg-[#161616]">
              <h2 className="text-xl font-bold text-white">Nearby Canteens</h2>
              <p className="text-sm text-slate-400 mt-1">Select a marker on the map to view menus and place an order.</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-center bg-black/40">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 shadow-inner border border-white/5">
                <span className="text-3xl">📍</span>
              </div>
              <h3 className="text-lg font-medium text-slate-200">No Canteen Selected</h3>
              <p className="text-sm text-slate-500 mt-2 max-w-[200px]">
                Click on any of the tear-drop pins on the map to magically generate their live inventory using AI.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
