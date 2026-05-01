"use client";

import { useState, useEffect } from "react";
import { Lock, Settings, BarChart3, Package, Users, Brain, Trash2, Edit2, Plus, RefreshCw, Loader2, Bell, X, Check } from "lucide-react";

type Tab = "overview" | "inventory" | "orders" | "ai";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [editingItem, setEditingItem] = useState<{ id: number; name: string; stock: number } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState<{
    demandPrediction: number;
    suggestedDish: string;
    restockAlert: string;
    wasteReduction: string;
  } | null>(null);

  const initialInventory = [
    { id: 1, name: "Masala Dosa", stock: 12, status: "Good" },
    { id: 2, name: "Filter Coffee", stock: 45, status: "Good" },
    { id: 3, name: "Paneer Butter Masala", stock: 5, status: "Low" },
    { id: 4, name: "Veg Biryani", stock: 0, status: "Empty" },
  ];

  const initialOrders = [
    { id: "#1024", item: "Masala Dosa x2", time: "Just now", status: "Preparing" },
    { id: "#1023", item: "Filter Coffee x1", time: "2 mins ago", status: "Ready" },
    { id: "#1022", item: "Veg Biryani x1", time: "5 mins ago", status: "Completed" },
  ];

  const [inventory, setInventory] = useState(initialInventory);
  const [liveOrders, setLiveOrders] = useState(initialOrders);

  // Randomize some data on load so items are different each time as requested
  useEffect(() => {
    const randomItems = [
      { id: Date.now()+1, name: "Chicken Tikka", stock: Math.floor(Math.random() * 20), status: "Good" },
      { id: Date.now()+2, name: "Samosa Chaat", stock: Math.floor(Math.random() * 5), status: "Low" },
      { id: Date.now()+3, name: "Mango Lassi", stock: Math.floor(Math.random() * 50), status: "Good" },
      { id: Date.now()+4, name: "Gulab Jamun", stock: 0, status: "Empty" }
    ];
    // Randomly pick a few from initial and few from randomItems to ensure variation
    const mixed = [...initialInventory.slice(0, 2), ...randomItems.slice(0, 2)];
    setInventory(mixed.map(item => ({...item, status: item.stock === 0 ? "Empty" : item.stock < 10 ? "Low" : "Good"})));
  }, []);

  // Simulated Live Orders
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const interval = setInterval(() => {
      const items = ["Masala Dosa", "Filter Coffee", "Veg Biryani", "Chole Bhature", "Paneer Butter Masala", "Hakka Noodles", "Cold Coffee"];
      const randomItem = items[Math.floor(Math.random() * items.length)];
      const qty = Math.floor(Math.random() * 3) + 1;
      
      const newOrder = {
        id: `#${Math.floor(1000 + Math.random() * 9000)}`,
        item: `${randomItem} x${qty}`,
        time: "Just now",
        status: "Preparing"
      };
      
      setLiveOrders(prev => [newOrder, ...prev.slice(0, 19)]);
      setToastMessage(`New Order Received: ${newOrder.item}`);
      
      setTimeout(() => {
        setToastMessage(null);
      }, 5000);
      
    }, 25000); // 25 seconds
    
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const deleteInventoryItem = (id: number) => {
    setInventory(inventory.filter(item => item.id !== id));
  };

  const editInventoryItem = (id: number) => {
    const item = inventory.find(i => i.id === id);
    if (!item) return;
    setEditingItem({ id: item.id, name: item.name, stock: item.stock });
  };

  const saveInventoryItem = () => {
    if (!editingItem) return;
    setInventory(inventory.map(i => {
      if (i.id === editingItem.id) {
        return {
          ...i,
          name: editingItem.name,
          stock: editingItem.stock,
          status: editingItem.stock === 0 ? "Empty" : editingItem.stock < 10 ? "Low" : "Good"
        };
      }
      return i;
    }));
    setEditingItem(null);
  };

  const addRandomItem = () => {
    const foodNames = ["Idli Sambar", "Chole Bhature", "Palak Paneer", "Butter Naan", "Jeera Rice", "Dal Makhani"];
    const randomFood = foodNames[Math.floor(Math.random() * foodNames.length)];
    const stock = Math.floor(Math.random() * 30);
    setInventory([{
      id: Date.now(),
      name: randomFood,
      stock,
      status: stock === 0 ? "Empty" : stock < 10 ? "Low" : "Good"
    }, ...inventory]);
  };

  const updateOrderStatus = (id: string) => {
    setLiveOrders(liveOrders.map(order => {
      if (order.id === id) {
        if (order.status === "Preparing") return { ...order, status: "Ready" };
        if (order.status === "Ready") return { ...order, status: "Completed" };
        return { ...order, status: "Preparing" };
      }
      return order;
    }));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === "og123") { 
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Incorrect passcode. Access Denied.");
    }
  };

  const fetchAiInsights = async () => {
    setAiLoading(true);
    try {
      const response = await fetch("/api/canteen/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inventory,
          activeOrders: liveOrders.length,
          timeOfDay: new Date().toLocaleTimeString(),
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setAiInsights(data.insights);
        setActiveTab("ai");
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Failed to fetch AI insights:", errorData);
        alert(`Failed to fetch AI insights: ${errorData.error || response.statusText}`);
      }
    } catch (err: any) {
      console.error("Network or Fetch Error:", err);
      alert(`Network error: Could not reach the server. Make sure your adblocker is disabled or Ollama is running. (${err.message})`);
    }
    setAiLoading(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 min-h-[calc(100vh-64px)]">
        <div className="max-w-md w-full bg-[#161616] border border-white/5 p-8 rounded-3xl relative overflow-hidden shadow-2xl">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 text-center space-y-6">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto text-primary border border-white/10">
              <Lock size={32} />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold">Admin Access</h2>
              <p className="text-slate-400 mt-2 text-sm">Enter the control center passcode to continue.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter passcode"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                />
                {error && <p className="text-red-400 text-sm mt-2 text-left">{error}</p>}
              </div>
              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-primary/20"
              >
                Access Dashboard
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-[#161616] border border-white/5 p-6 rounded-2xl border-l-2 border-l-primary shadow-xl">
                <h3 className="text-sm font-medium text-slate-400">Total Active Orders</h3>
                <p className="text-3xl font-bold mt-2">24</p>
                <p className="text-xs text-emerald-400 mt-1">↑ 12% vs last hour</p>
              </div>
              <div className="bg-[#161616] border border-white/5 p-6 rounded-2xl border-l-2 border-l-warning shadow-xl">
                <h3 className="text-sm font-medium text-slate-400">Low Stock Items</h3>
                <p className="text-3xl font-bold mt-2">3</p>
                <p className="text-xs text-amber-400 mt-1">Needs attention</p>
              </div>
              <div className="bg-[#161616] border border-white/5 p-6 rounded-2xl border-l-2 border-l-accent shadow-xl flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-medium text-slate-400">AI Demand Prediction</h3>
                  <div className="flex items-end gap-2 mt-2">
                    <p className={`text-3xl font-bold ${
                      !aiInsights ? "text-slate-500" :
                      aiInsights.demandPrediction > 70 ? "text-red-400" : 
                      aiInsights.demandPrediction > 40 ? "text-amber-400" : "text-emerald-400"
                    }`}>
                      {aiInsights ? `${aiInsights.demandPrediction}%` : "---"}
                    </p>
                    <p className="text-sm text-slate-400 mb-1">
                      {aiInsights ? `Prepare: ${aiInsights.suggestedDish}` : "Pending"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
              <div className="bg-[#161616] border border-white/5 rounded-2xl flex flex-col overflow-hidden shadow-xl">
                <div className="p-5 border-b border-white/5 flex justify-between items-center bg-black/20">
                  <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider">Quick Inventory</h3>
                  <button onClick={() => setActiveTab("inventory")} className="text-xs text-primary hover:underline">View All</button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {inventory.map((item, idx) => (
                    <div key={idx} className="bg-black/40 border border-white/5 p-4 rounded-xl flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-slate-200">{item.name}</h4>
                        <p className={`text-xs mt-1 ${item.status === 'Empty' ? 'text-red-400' : item.status === 'Low' ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {item.stock} portions remaining
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#161616] border border-white/5 rounded-2xl flex flex-col overflow-hidden shadow-xl">
                <div className="p-5 border-b border-white/5 bg-black/20 flex justify-between items-center">
                  <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider">Recent Orders</h3>
                  <button onClick={() => setActiveTab("orders")} className="text-xs text-primary hover:underline">View All</button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {liveOrders.map((order, idx) => (
                    <div key={idx} className="bg-black/40 border border-white/5 p-4 rounded-xl flex items-center justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-xs font-bold text-slate-300">
                          {order.id}
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-200">{order.item}</h4>
                          <p className="text-xs text-slate-500 mt-1">{order.time}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-md border ${
                        order.status === 'Preparing' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                        order.status === 'Ready' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                        'bg-slate-500/10 text-slate-400 border-slate-500/20'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        );

      case "inventory":
        return (
          <div className="bg-[#161616] border border-white/5 rounded-2xl flex flex-col flex-1 overflow-hidden shadow-xl">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20">
              <h3 className="font-bold text-lg text-slate-200">Inventory Management</h3>
              <button onClick={addRandomItem} className="text-sm flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors shadow-lg shadow-primary/20">
                <Plus size={16} /> Add New Item
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {inventory.map((item) => (
                <div key={item.id} className="bg-black/40 border border-white/5 p-5 rounded-xl flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                  <div>
                    <h4 className="font-medium text-lg text-slate-200">{item.name}</h4>
                    <p className={`text-sm mt-1 ${item.status === 'Empty' ? 'text-red-400' : item.status === 'Low' ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {item.stock} portions remaining
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => editInventoryItem(item.id)} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-lg text-slate-300 transition-colors border border-white/5">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => deleteInventoryItem(item.id)} className="p-2.5 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors border border-red-500/10">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "orders":
        return (
          <div className="bg-[#161616] border border-white/5 rounded-2xl flex flex-col flex-1 overflow-hidden shadow-xl">
            <div className="p-6 border-b border-white/5 bg-black/20">
              <h3 className="font-bold text-lg text-slate-200">Live Order Feed</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {liveOrders.map((order) => (
                <div key={order.id} className="bg-black/40 border border-white/5 p-5 rounded-xl flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-sm font-bold text-slate-300">
                      {order.id}
                    </div>
                    <div>
                      <h4 className="font-medium text-lg text-slate-200">{order.item}</h4>
                      <p className="text-sm text-slate-500 mt-1">{order.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-sm px-3 py-1.5 rounded-md border ${
                      order.status === 'Preparing' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                      order.status === 'Ready' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                      'bg-slate-500/10 text-slate-400 border-slate-500/20'
                    }`}>
                      {order.status}
                    </span>
                    <button onClick={() => updateOrderStatus(order.id)} className="text-sm text-primary hover:underline">
                      Update Status
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "ai":
        return (
          <div className="bg-[#161616] border border-white/5 rounded-2xl flex flex-col flex-1 overflow-hidden shadow-xl relative">
            <div className="absolute -right-20 -top-20 opacity-5 pointer-events-none">
              <Brain size={300} />
            </div>
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20 z-10">
              <h3 className="font-bold text-lg text-slate-200 flex items-center gap-2">
                <Brain className="text-primary" /> AI Insights & Predictions
              </h3>
              <button 
                onClick={fetchAiInsights}
                disabled={aiLoading}
                className="text-sm flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {aiLoading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                {aiLoading ? "Analyzing..." : "Regenerate Analysis"}
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 z-10">
              {!aiInsights ? (
                <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
                  <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center text-slate-500 mb-6">
                    <Brain size={40} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-200 mb-2">No AI Analysis Generated</h3>
                  <p className="text-slate-500 mb-8">Run an analysis to predict demand, get restocking alerts, and receive waste reduction suggestions.</p>
                  <button 
                    onClick={fetchAiInsights}
                    disabled={aiLoading}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                  >
                    {aiLoading ? <Loader2 size={18} className="animate-spin" /> : <Brain size={18} />}
                    {aiLoading ? "Generating Insights..." : "Run AI Analysis Now"}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-black/40 border border-white/5 p-6 rounded-2xl flex flex-col justify-center items-center text-center">
                    <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">Demand Prediction</h4>
                    <div className="relative inline-flex items-center justify-center">
                      <svg className="w-32 h-32 transform -rotate-90">
                        <circle className="text-white/5" strokeWidth="8" stroke="currentColor" fill="transparent" r="58" cx="64" cy="64" />
                        <circle className={`${aiInsights.demandPrediction > 70 ? "text-red-500" : aiInsights.demandPrediction > 40 ? "text-amber-500" : "text-emerald-500"}`} strokeWidth="8" strokeDasharray="364" strokeDashoffset={364 - (364 * aiInsights.demandPrediction) / 100} strokeLinecap="round" stroke="currentColor" fill="transparent" r="58" cx="64" cy="64" />
                      </svg>
                      <span className="absolute text-3xl font-bold">{aiInsights.demandPrediction}%</span>
                    </div>
                    <p className="mt-4 text-slate-300">Expected rush probability in the next 30 minutes.</p>
                  </div>

                  <div className="bg-black/40 border border-white/5 p-6 rounded-2xl flex flex-col justify-center">
                    <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">Suggested Action</h4>
                    <p className="text-xl font-medium text-slate-200 border-l-4 border-primary pl-4 py-1">
                      Begin preparing <span className="text-primary font-bold">{aiInsights.suggestedDish}</span>
                    </p>
                  </div>

                  <div className="bg-black/40 border border-white/5 p-6 rounded-2xl">
                    <h4 className="text-sm font-semibold text-amber-500/70 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span> Restock Alert
                    </h4>
                    <p className="text-slate-300 mb-4">{aiInsights.restockAlert}</p>
                    <button 
                      onClick={() => {
                        setToastMessage("Auto-restock initiated with supplier!");
                        setTimeout(() => setToastMessage(null), 3000);
                      }}
                      className="w-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 font-medium py-2 rounded-lg transition-colors text-sm border border-amber-500/30 flex items-center justify-center gap-2"
                    >
                      <Package size={16} /> 1-Click Auto Restock
                    </button>
                  </div>

                  <div className="bg-black/40 border border-white/5 p-6 rounded-2xl">
                    <h4 className="text-sm font-semibold text-emerald-500/70 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Waste Reduction
                    </h4>
                    <p className="text-slate-300">{aiInsights.wasteReduction}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  const tabs: { id: Tab; icon: any; label: string; highlight?: boolean }[] = [
    { id: "overview", icon: BarChart3, label: "Overview" },
    { id: "inventory", icon: Package, label: "Inventory" },
    { id: "orders", icon: Users, label: "Live Orders" },
    { id: "ai", icon: Brain, label: "AI Insights", highlight: true },
  ];

  return (
    <div className="flex-1 flex px-6 pb-6 gap-6 h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <div className="w-64 bg-[#161616] border border-white/5 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/5 flex items-center gap-4 bg-black/20">
          <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-primary">
            <Settings size={24} />
          </div>
          <div>
            <h2 className="font-bold text-slate-200">Control Center</h2>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <p className="text-[10px] uppercase tracking-wider text-emerald-500/80 font-bold">System Online</p>
            </div>
          </div>
        </div>

        <div className="p-4 flex-1 flex flex-col gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative ${
                  isActive 
                    ? "bg-white/10 text-white border border-white/5 shadow-inner" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
                }`}
              >
                <Icon size={18} className={isActive ? (tab.highlight ? "text-primary" : "text-white") : ""} />
                <span className="font-medium text-sm">{tab.label}</span>
                {tab.highlight && (
                  <span className={`absolute right-4 w-2 h-2 rounded-full ${isActive ? 'bg-primary' : 'bg-primary/50'}`}></span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {renderContent()}
      </div>

      {/* Advanced Inventory Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1e1e1e] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">Edit Item Details</h3>
              <button onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Item Name</label>
                <input 
                  type="text" 
                  value={editingItem.name} 
                  onChange={e => setEditingItem({...editingItem, name: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Stock Quantity</label>
                <input 
                  type="number" 
                  value={editingItem.stock} 
                  onChange={e => setEditingItem({...editingItem, stock: parseInt(e.target.value) || 0})}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-8">
              <button onClick={() => setEditingItem(null)} className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl transition-colors font-medium border border-white/5">
                Cancel
              </button>
              <button onClick={saveInventoryItem} className="flex-1 bg-primary hover:bg-primary/90 text-white py-3 rounded-xl transition-colors font-medium shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                <Check size={18} /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Order Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[100] bg-[#1e1e1e] border border-primary/30 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <div className="w-10 h-10 bg-primary/20 text-primary rounded-full flex items-center justify-center">
            <Bell size={20} />
          </div>
          <div>
            <p className="text-sm font-bold text-primary">System Notification</p>
            <p className="text-slate-200 text-sm mt-0.5">{toastMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}
