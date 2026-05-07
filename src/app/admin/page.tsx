"use client";

import { useState, useEffect, useRef } from "react";
import { Lock, Settings, BarChart3, Package, Users, Brain, Trash2, Edit2, Plus, RefreshCw, Loader2, Bell, X, Check, Heart, MapPin, Clock, ArrowRight, Navigation, CheckCircle2, AlertTriangle, ShieldCheck, History, ListOrdered, FileText, Utensils } from "lucide-react";
import LiveMap from "@/components/LiveMap";
import { useAuth } from "@/contexts/AuthContext";

type Role = "Admin" | "Donor" | "NGO" | null;
type AdminTab = "overview" | "network" | "operations" | "audit" | "ai";
type DonorTab = "donate" | "history" | "inbox";
type NGOTab = "live" | "pickups";

type AuditLog = { id: string; time: string; action: string; role: string; details: string; type?: "info" | "success" | "warning" | "error" };

type OrderType = "Regular" | "Donation";
type OrderStatus = "Preparing" | "Ready" | "Waiting" | "Pickup Assigned" | "Completed" | "Expired";

type LocationPoint = { lat: number, lng: number, address: string };

type UnifiedOrder = {
  id: string;
  orderType: OrderType;
  foodName: string;
  foodType: string;
  quantity: number;
  cookedTime: string;
  expiryTime: number; 
  distance: string;
  status: OrderStatus;
  volunteerName?: string;
  donorName?: string;
  ngoName?: string;
  donorId?: string;
  ngoId?: string;
  donorLocation?: LocationPoint;
  ngoLocation?: LocationPoint;
};

// --- PHOTON AUTOCOMPLETE COMPONENT ---
function AddressSearch({ placeholder, onSelect }: { placeholder: string, onSelect: (loc: LocationPoint) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const ignoreSearchRef = useRef(false);

  useEffect(() => {
    if (query.length < 3) {
      setResults([]);
      return;
    }
    if (ignoreSearchRef.current) {
      ignoreSearchRef.current = false;
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5`);
        const data = await res.json();
        setResults(data.features || []);
      } catch (e) {
        console.error("Photon Error", e);
      } finally {
        setIsSearching(false);
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  return (
    <div className="relative">
      <div className="relative flex items-center">
        <MapPin className="absolute left-4 text-slate-400" size={18} />
        <input 
          type="text" 
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-black/50 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white focus:ring-1 focus:ring-primary"
        />
        {isSearching && <Loader2 className="absolute right-4 animate-spin text-primary" size={18} />}
      </div>
      
      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#1e1e1e] border border-white/10 rounded-xl overflow-hidden z-50 shadow-2xl">
          {results.map((f, idx) => {
            const name = f.properties.name || "";
            const city = f.properties.city || f.properties.state || "";
            const address = `${name}${name && city ? ', ' : ''}${city}`;
            const lat = f.geometry.coordinates[1];
            const lng = f.geometry.coordinates[0];
            return (
              <button 
                key={idx}
                onClick={() => {
                  ignoreSearchRef.current = true;
                  setQuery(address);
                  setResults([]);
                  onSelect({ lat, lng, address });
                }}
                className="w-full text-left px-4 py-3 hover:bg-white/5 border-b border-white/5 last:border-0 text-sm text-slate-200 transition-colors"
              >
                {address}
              </button>
            )
          })}
        </div>
      )}
    </div>
  );
}


export default function UnifiedPortal() {
  const { user, loading, refreshUser } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [role, setRole] = useState<Role>(null);
  const adminPasscode = process.env.NEXT_PUBLIC_ADMIN_PASSCODE ?? "og123";
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Use user role from context if available, otherwise check URL params for backward compatibility
  useEffect(() => {
    if (user && user.role) {
      setRole(user.role as Role);
    } else if (isMounted && !loading) {
      // Redirect to portals if not authenticated
      window.location.href = "/portals";
    }
  }, [user, loading, isMounted]);

  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  
  const [adminTab, setAdminTab] = useState<AdminTab>("overview");
  const [donorTab, setDonorTab] = useState<DonorTab>("donate");
  const [ngoTab, setNgoTab] = useState<NGOTab>("live");
  
  const [toastMessage, setToastMessage] = useState<{title: string, desc: string} | null>(null);

  interface UserNetworkItem {
    id: string;
    name: string;
    role: "Admin" | "Donor" | "NGO";
    status: "Pending Approval" | "Verified" | "Rejected" | "Suspended";
    totalImpact: number;
  }
  const [usersNetwork, setUsersNetwork] = useState<UserNetworkItem[]>([]);

  const fetchUsersNetwork = async () => {
    try {
      const res = await fetch("/api/users", { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data)) setUsersNetwork(data);
    } catch (e) {
      console.error(e);
    }
  };

  const updateUserStatus = async (userId: string, status: "Verified" | "Suspended") => {
    const response = await fetch(`/api/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      throw new Error(payload?.error || "Failed to update user status");
    }

    await fetchUsersNetwork();
  };

  useEffect(() => {
    fetchUsersNetwork();
    const interval = setInterval(fetchUsersNetwork, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const [orders, setOrders] = useState<UnifiedOrder[]>([]);
  
  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/donations", { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data)) setOrders(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [globalNotifications, setGlobalNotifications] = useState<{id: string, role: string, msg: string, read: boolean}[]>([]);
  const [mealsSaved, setMealsSaved] = useState<number>(0);

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch("/api/audit-logs");
      const data = await res.json();
      if (Array.isArray(data)) {
        setAuditLogs(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
    const interval = setInterval(fetchAuditLogs, 15000);
    return () => clearInterval(interval);
  }, []);

  // audit log helper: declare as function to allow use before this point
  async function addAuditLog(action: string, roleLog: string, details: string, type: "info" | "success" | "warning" | "error" = "info") {
    const entry = { id: `L-${Date.now()}`, time: new Date().toISOString(), action, role: roleLog, details, type };

    setAuditLogs(prev => [entry, ...prev]);

    try {
      await fetch("/api/audit-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      });
      fetchAuditLogs();
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    const derivedNotifications = [
      ...orders
        .filter(order => order.status === "Waiting" || order.status === "Pickup Assigned" || order.status === "Completed" || order.status === "Expired")
        .map(order => {
          const message = order.status === "Waiting"
            ? `Donation ${order.foodName} is waiting for pickup.`
            : order.status === "Pickup Assigned"
              ? `NGO accepted ${order.foodName} and is en route.`
              : order.status === "Completed"
                ? `Your donation ${order.foodName} was successfully picked up.`
                : `Donation ${order.foodName} expired without pickup.`;

          return {
            id: `notif-${order.id}-${order.status}`,
            role: "Donor",
            msg: message,
            read: false,
          };
        }),
      ...usersNetwork
        .filter(entry => entry.status === "Pending Approval")
        .map(entry => ({
          id: `user-${entry.id}`,
          role: "Admin",
          msg: `${entry.name} is waiting for admin approval.`,
          read: false,
        })),
    ];

    setGlobalNotifications(derivedNotifications);
    setMealsSaved(
      orders.reduce((total, order) => total + (order.status === "Completed" ? order.quantity : 0), 0)
    );
  }, [orders, usersNetwork]);
  const [editingOrder, setEditingOrder] = useState<UnifiedOrder | null>(null);
  
  const [donorForm, setDonorForm] = useState({ name: "", type: "Veg", quantity: 10, time: "12:00", spoilageMins: 60 });
  const [donorLocation, setDonorLocation] = useState<LocationPoint | null>(null);
  
  // NGO Acceptance Modal
  const [acceptingOrder, setAcceptingOrder] = useState<UnifiedOrder | null>(null);

  // Active Map Route for NGO
  const [activeRouteOrder, setActiveRouteOrder] = useState<UnifiedOrder | null>(null);
  const [viewingMapRoute, setViewingMapRoute] = useState<UnifiedOrder | null>(null);

  // --- AUTO-EXPIRY ENGINE ---
  const [currentTime, setCurrentTime] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setCurrentTime(now);
      
      setOrders(prev => {
        let changed = false;
        const newOrders = prev.map(order => {
          if (order.status === "Waiting" && order.expiryTime <= now) {
            changed = true;
            addAuditLog("EXPIRED", "System", `Donation ${order.id} (${order.foodName}) automatically expired.`, "warning");
            setGlobalNotifications(n => [{id: `N-${Date.now()}`, role: "Donor", msg: `Alert: Your donation ${order.foodName} has expired without pickup.`, read: false}, ...n]);
            
            // Sync with backend
            fetch(`/api/donations/${order.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: "Expired" })
            }).catch(e => console.error(e));

            return { ...order, status: "Expired" as OrderStatus };
          }
          return order;
        });
        return changed ? newOrders : prev;
      });
    }, 1000); // UI updates every second
    return () => clearInterval(timer);
  }, []);

  // Keep hook order stable by returning only after all hooks are declared.
  if (!isMounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // keep helper as function declared above; this placeholder kept for reference

  const formatLogTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return isoString;
      return date.toLocaleString('en-IN', { 
        day: '2-digit', 
        month: 'short', 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return isoString;
    }
  };

  const getLogIcon = (type?: string) => {
    switch (type) {
      case "success": return <CheckCircle2 size={14} className="text-emerald-500" />;
      case "warning": return <AlertTriangle size={14} className="text-amber-500" />;
      case "error": return <X size={14} className="text-red-500" />;
      default: return <History size={14} className="text-primary" />;
    }
  };

  const notify = (title: string, desc: string) => {
    setToastMessage({ title, desc });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Helper for priority score
  const getMinutesLeft = (expiryTime: number) => Math.max(0, Math.floor((expiryTime - currentTime) / 60000));
  const calculatePriority = (order: UnifiedOrder) => {
    const mins = getMinutesLeft(order.expiryTime);
    if (mins === 0) return 0;
    return Math.floor((order.quantity / mins) * 100); 
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === adminPasscode) { setIsAuthenticated(true); setError(""); addAuditLog("LOGIN", "Admin", "Admin dashboard accessed", "success"); }
    else { setError("Incorrect passcode."); }
  };

  // --- VIEWS ---
  
  const renderRoleSelection = () => (
    <div className="flex-1 flex items-center justify-center p-6 min-h-[calc(100vh-64px)] relative overflow-hidden">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-40px) scale(1.1); }
        }
        .animate-float { animation: float 8s ease-in-out infinite; }
        .animate-float-delayed { animation: float 10s ease-in-out infinite 3s; }
        .animate-float-slow { animation: float 12s ease-in-out infinite 1s; }
      `}</style>
      
      {/* Animated Floating Bubbles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none animate-float-delayed" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-emerald-500/5 rounded-full blur-[150px] pointer-events-none animate-float-slow" />

      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        
        {/* Admin Card */}
        <button onClick={() => setRole("Admin")} className="bg-[#161616]/80 backdrop-blur-xl border border-white/5 p-12 rounded-3xl hover:bg-white/10 hover:border-primary/50 transition-all text-left group shadow-2xl relative overflow-hidden">
          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-8 group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(59,130,246,0.2)]">
            <ShieldCheck size={40} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Admin Portal</h2>
          <p className="text-slate-400 text-base leading-relaxed">Full system analytics, global operations control, and audit monitoring.</p>
        </button>

        {/* Donor Card */}
        <button onClick={() => setRole("Donor")} className="bg-[#161616]/80 backdrop-blur-xl border border-white/5 p-12 rounded-3xl hover:bg-white/10 hover:border-emerald-500/50 transition-all text-left group shadow-2xl relative overflow-hidden">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mb-8 group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            <Package size={40} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Donor Portal</h2>
          <p className="text-slate-400 text-base leading-relaxed">List surplus food, track donations, and edit active requests globally.</p>
        </button>

        {/* NGO Card */}
        <button onClick={() => setRole("NGO")} className="bg-[#161616]/80 backdrop-blur-xl border border-white/5 p-12 rounded-3xl hover:bg-white/10 hover:border-amber-500/50 transition-all text-left group shadow-2xl relative overflow-hidden">
          <div className="w-20 h-20 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 mb-8 group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(245,158,11,0.2)]">
            <Heart size={40} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">NGO / Volunteer</h2>
          <p className="text-slate-400 text-base leading-relaxed">View urgent live requests, accept pickups, and rescue food immediately.</p>
        </button>
      </div>
    </div>
  );

  const renderAdminLogin = () => (
    <div className="flex-1 flex items-center justify-center p-6 min-h-[calc(100vh-64px)]">
      <div className="max-w-md w-full bg-[#161616] border border-white/5 p-8 rounded-3xl relative overflow-hidden shadow-2xl">
        <button onClick={() => window.location.href = '/portals'} className="absolute top-4 left-4 p-2 text-slate-400 hover:text-white"><ArrowRight className="rotate-180" size={20}/></button>
        <div className="relative z-10 text-center space-y-6 mt-4">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto text-primary border border-primary/20">
            <Lock size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Admin Access</h2>
            <p className="text-slate-400 mt-2 text-sm">Enter the control center passcode.</p>
          </div>
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <input type="password" value={passcode} onChange={(e) => setPasscode(e.target.value)} placeholder={`Passcode (${adminPasscode})`} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-primary" />
              {error && <p className="text-red-400 text-sm mt-2 text-left">{error}</p>}
            </div>
            <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 rounded-xl shadow-lg shadow-primary/20">Access Dashboard</button>
          </form>
        </div>
      </div>
    </div>
  );

  // ================= DONOR VIEW =================
  const renderDonor = () => {
    const donorOrders = orders.filter(o => o.orderType === "Donation" && o.donorId === user?.id);
    const unreadCount = globalNotifications.filter(n => n.role === "Donor" && !n.read).length;
    const myTotalImpact = user?.totalImpact || 0;
    
    return (
      <div className="flex-1 flex flex-col h-[calc(100vh-64px)]">
        {user?.status === "Pending Approval" && (
          <div className="mx-6 mt-2 bg-amber-500/20 border border-amber-500/50 p-3 rounded-xl text-center">
            <p className="text-amber-400 text-sm font-bold flex items-center justify-center gap-2">
              <AlertTriangle size={16} /> Your account is pending verification by an Admin. Some features may be restricted.
            </p>
          </div>
        )}
        <div className="flex-1 flex gap-6 px-6 pb-6 overflow-hidden mt-4">
        <div className="w-64 bg-[#161616] border border-white/5 rounded-2xl flex flex-col p-4 shadow-2xl">
          <div className="flex items-center gap-3 mb-8 px-2">
            <Package className="text-emerald-500" size={28}/>
            <h2 className="font-bold text-lg text-white">Donor Portal</h2>
          </div>
          <button onClick={() => setDonorTab("donate")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all mb-2 ${donorTab === "donate" ? "bg-white/10 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"}`}>
            <Plus size={18} /> Donate Food
          </button>
          <button onClick={() => setDonorTab("history")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all mb-2 ${donorTab === "history" ? "bg-white/10 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"}`}>
            <History size={18} /> My Donations
          </button>
          <button onClick={() => {
            setDonorTab("inbox");
            setGlobalNotifications(prev => prev.map(n => n.role === "Donor" ? {...n, read: true} : n));
          }} className={`w-full flex justify-between items-center px-4 py-3 rounded-xl transition-all mb-2 ${donorTab === "inbox" ? "bg-white/10 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"}`}>
            <div className="flex items-center gap-3"><Bell size={18} /> Inbox</div>
            {unreadCount > 0 && <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{unreadCount}</span>}
          </button>
          <button onClick={() => window.location.href = '/portals'} className="mt-auto flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all"><X size={18}/> Exit Portal</button>
        </div>

        <div className="flex-1 bg-[#161616] border border-white/5 rounded-2xl p-8 overflow-y-auto shadow-xl relative flex flex-col">
          <div className="flex justify-between items-center mb-8 shrink-0">
            <div>
              <h2 className="text-3xl font-bold text-white">Welcome, {user?.name}</h2>
              <p className="text-slate-400 mt-1">Manage your surplus food donations and track impact.</p>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 px-6 py-3 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-500">
                <Heart size={24} className="fill-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-emerald-500 font-bold uppercase tracking-wider">Your Impact</p>
                <p className="text-2xl font-bold text-white">{myTotalImpact} Meals</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
          {donorTab === "donate" && (
            <div className="max-w-lg mx-auto">
              <h2 className="text-3xl font-bold text-white mb-2">Publish Surplus Food</h2>
              <p className="text-slate-400 mb-8">Your donation will immediately alert nearby NGOs.</p>
              
              <div className="space-y-5 bg-black/40 border border-white/5 p-6 rounded-2xl">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Pick-up Address</label>
                  <AddressSearch placeholder="Type address via open-source API..." onSelect={(loc) => setDonorLocation(loc)} />
                  {donorLocation && <p className="text-xs text-emerald-400 mt-2 font-medium">Selected: {donorLocation.address}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Food Name</label>
                  <input type="text" value={donorForm.name} onChange={e=>setDonorForm({...donorForm, name: e.target.value})} placeholder="e.g. Masala Dosa" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-emerald-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Type</label>
                    <select value={donorForm.type} onChange={e=>setDonorForm({...donorForm, type: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white">
                      <option>Veg</option><option>Non-Veg</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Quantity (Persons)</label>
                    <input type="number" value={donorForm.quantity} onChange={e=>setDonorForm({...donorForm, quantity: parseInt(e.target.value)||0})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Cooked Time</label>
                    <input type="time" value={donorForm.time} onChange={e=>setDonorForm({...donorForm, time: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Spoilage Time (mins)</label>
                    <input type="number" value={donorForm.spoilageMins} onChange={e=>setDonorForm({...donorForm, spoilageMins: parseInt(e.target.value)||60})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white" />
                  </div>
                </div>

                <button onClick={() => {
                  if(!donorLocation) return notify("Error", "Please search and select a pickup address!");
                  if(!donorForm.name) return notify("Error", "Food name required!");
                  
                  const reqId = `R-${Math.floor(1000 + Math.random()*9000)}`;
                  const newOrder: UnifiedOrder = {
                    id: reqId, orderType: "Donation", foodType: donorForm.type, foodName: donorForm.name, quantity: donorForm.quantity,
                    cookedTime: donorForm.time, expiryTime: Date.now() + donorForm.spoilageMins * 60000, distance: "0.0 km", status: "Waiting",
                    donorLocation,
                    donorName: user?.name || "",
                    donorId: user?.id
                  };
                  
                  // ONE unified update
                  fetch('/api/donations', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newOrder)
                  }).then(async (response) => {
                    if (!response.ok) throw new Error("Failed to publish donation");
                    const savedDonation = await response.json();
                    setOrders(prev => [savedDonation, ...prev]);
                    addAuditLog("DONATION_CREATED", "Donor", `Created donation ${reqId} for ${donorForm.name} at ${donorLocation.address}`, "success");
                    notify("Success!", "Donation published globally with location.");
                    setDonorTab("history");
                  }).catch(e => {
                    console.error(e);
                    notify("Error", "Failed to publish donation.");
                  });
                }} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl mt-4 flex items-center justify-center gap-2">
                  <CheckCircle2 size={20}/> Publish Donation
                </button>
              </div>
            </div>
          )}
          {donorTab === "history" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">My Donations</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {donorOrders.map(req => (
                  <div key={req.id} className="bg-black/40 border border-white/5 p-5 rounded-2xl relative group">
                    {req.status === "Waiting" && (
                      <button onClick={() => setEditingOrder(req)} className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <Edit2 size={16}/>
                      </button>
                    )}
                    <div className="flex justify-between items-start mb-2">
                      <span className={`px-2 py-1 text-xs rounded-md font-bold ${req.status==='Waiting'?'bg-amber-500/20 text-amber-500':req.status==='Expired'?'bg-red-500/20 text-red-500':'bg-emerald-500/20 text-emerald-500'}`}>{req.status}</span>
                      <span className="text-xs text-slate-500">{req.id}</span>
                    </div>
                    <h3 className="text-xl font-bold text-white">{req.foodName}</h3>
                    <p className="text-sm text-slate-400 mb-2">Qty: {req.quantity} • Cooked: {req.cookedTime}</p>
                    {req.donorLocation && <p className="text-xs text-slate-500 mb-4 line-clamp-1 border-t border-white/5 pt-2 flex items-center gap-1"><MapPin size={12}/> {req.donorLocation.address}</p>}
                    
                    {req.status === 'Pickup Assigned' && (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl flex items-center gap-2 text-sm text-emerald-400">
                        <CheckCircle2 size={16}/> Assigned to: {req.volunteerName}
                      </div>
                    )}
                    {req.status === 'Waiting' && (
                      <div className="text-sm text-amber-400 font-medium flex items-center gap-1"><Clock size={14}/> Expires in {getMinutesLeft(req.expiryTime)}m</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {donorTab === "inbox" && (
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-white mb-2">Notifications Inbox</h2>
              <p className="text-slate-400 mb-8">Stay updated on your food rescues.</p>
              
              <div className="space-y-4">
                {globalNotifications.filter(n => n.role === "Donor").length === 0 ? (
                  <div className="text-center p-12 bg-black/40 border border-white/5 rounded-2xl">
                    <Bell className="mx-auto text-slate-600 mb-4" size={48}/>
                    <p className="text-slate-400">You have no new notifications.</p>
                  </div>
                ) : (
                  globalNotifications.filter(n => n.role === "Donor").map(n => (
                    <div key={n.id} className={`p-5 rounded-2xl border flex gap-4 items-start ${n.msg.includes('successfully') ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : n.msg.includes('expired') ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-white/5 border-white/10 text-slate-200'}`}>
                      <div className="shrink-0 mt-1">
                        {n.msg.includes('successfully') ? <CheckCircle2 size={24}/> : n.msg.includes('expired') ? <AlertTriangle size={24}/> : <Heart size={24} className="text-amber-500"/>}
                      </div>
                      <div>
                        <h4 className="font-bold text-lg mb-1">{n.msg.includes('successfully') ? "Delivery Completed!" : n.msg.includes('expired') ? "Donation Expired" : "Pickup Accepted!"}</h4>
                        <p className={n.msg.includes('successfully') ? 'text-emerald-500/80' : n.msg.includes('expired') ? 'text-red-400/80' : 'text-slate-400'}>{n.msg}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Donor Edit Modal */}
          {editingOrder && donorTab === "history" && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
              <div className="bg-[#1e1e1e] border border-white/10 p-6 rounded-2xl max-w-sm w-full shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-white">Edit Donation</h3>
                  <button onClick={() => setEditingOrder(null)} className="text-slate-400 hover:text-white"><X size={20}/></button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Update Quantity</label>
                    <input type="number" value={editingOrder.quantity} onChange={(e)=>setEditingOrder({...editingOrder, quantity: parseInt(e.target.value)||0})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Add Minutes to Expiry</label>
                    <button onClick={()=>setEditingOrder({...editingOrder, expiryTime: editingOrder.expiryTime + 15*60000})} className="w-full bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl px-4 py-3 text-white text-sm font-medium transition-colors">
                      + 15 Minutes
                    </button>
                  </div>
                  <button onClick={() => {
                    fetch(`/api/donations/${editingOrder.id}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(editingOrder)
                    }).then(async (response) => {
                      if (!response.ok) throw new Error("Failed to save donation changes");
                      const savedDonation = await response.json();
                      setOrders(prev => prev.map(o => o.id === editingOrder.id ? savedDonation : o));
                      addAuditLog("DONATION_EDITED", "Donor", `Edited donation ${editingOrder.id}`, "info");
                      notify("Updated", "Donation details saved.");
                      setEditingOrder(null);
                    }).catch(e => console.error(e));
                  }} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl mt-4 transition-colors">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
);
};

  // ================= NGO VIEW =================
  const renderNGO = () => {
    // ONE Orders System: Map over unified orders array filtering for Donations
    const donationOrders = orders.filter(o => o.orderType === "Donation");
    const sortedRequests = [...donationOrders].sort((a, b) => {
      if (a.status !== "Waiting" && b.status === "Waiting") return 1;
      if (a.status === "Waiting" && b.status !== "Waiting") return -1;
      return calculatePriority(b) - calculatePriority(a);
    });

    return (
      <div className="flex-1 flex flex-col h-[calc(100vh-64px)]">
        {user?.status === "Pending Approval" && (
          <div className="mx-6 mt-2 bg-amber-500/20 border border-amber-500/50 p-3 rounded-xl text-center">
            <p className="text-amber-400 text-sm font-bold flex items-center justify-center gap-2">
              <AlertTriangle size={16} /> Your account is pending verification by an Admin. Some features may be restricted.
            </p>
          </div>
        )}
        <div className="flex-1 flex gap-6 px-6 pb-6 relative mt-4">
        <div className="w-64 bg-[#161616] border border-white/5 rounded-2xl flex flex-col p-4 shadow-2xl">
          <div className="flex items-center gap-3 mb-8 px-2">
            <Heart className="text-amber-500" size={28}/>
            <h2 className="font-bold text-lg text-white">NGO Portal</h2>
          </div>
          <button onClick={() => { setNgoTab("live"); setActiveRouteOrder(null); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all mb-2 ${ngoTab === "live" ? "bg-white/10 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"}`}>
            <MapPin size={18} /> Live Map
          </button>
          <button onClick={() => setNgoTab("pickups")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${ngoTab === "pickups" ? "bg-white/10 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"}`}>
            <ListOrdered size={18} /> My Pickups
          </button>
          <button onClick={() => window.location.href = '/portals'} className="mt-auto flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all"><X size={18}/> Exit Portal</button>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden bg-[#161616] border border-white/5 rounded-2xl shadow-xl">
          <div className="p-5 border-b border-white/5 bg-gradient-to-r from-amber-500/10 to-transparent flex justify-between items-center z-10 shrink-0">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">Live Rescue Routing</h2>
              <p className="text-xs text-slate-400">Rescue available food within your radius.</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 px-4 py-2 bg-black/40 border border-white/10 rounded-xl">
                <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center text-amber-500">
                  <Utensils size={16} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Rescued</p>
                  <p className="text-sm font-bold text-white">{user?.totalImpact || 0}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-5 py-2 bg-amber-500/20 border border-amber-500/30 rounded-full">
                <Heart size={18} className="text-amber-400 fill-amber-400" />
                <span className="font-bold text-amber-400">Total Saved: {mealsSaved}</span>
              </div>
            </div>
          </div>
          <div className="flex-1 flex flex-col overflow-hidden">
            {ngoTab === "live" && (
              <>
              {/* Removed inline map to prevent congestion */}
              <div className="flex-1 overflow-y-auto p-6 z-10">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {sortedRequests.map(req => {
                    const minsLeft = getMinutesLeft(req.expiryTime);
                    const isUrgent = minsLeft < 30 && req.quantity >= 10 && req.status === "Waiting";
                    const colorClass = req.status !== "Waiting" ? "bg-slate-500/10 border-slate-500/30 text-slate-400" :
                                       isUrgent ? "bg-red-500/10 border-red-500/30 text-red-400" :
                                       minsLeft > 60 ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" :
                                       "bg-amber-500/10 border-amber-500/30 text-amber-400";
                    
                    if (req.status === "Expired") return null;

                    return (
                      <div key={req.id} className={`p-6 rounded-2xl border bg-black/40 shadow-xl transition-all ${colorClass.replace(/text-[a-z]+-400/,'')} relative`}>
                        {isUrgent && <div className="absolute -top-3 -right-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1 animate-bounce"><AlertTriangle size={12}/> URGENT</div>}
                        
                        <div className="flex justify-between items-start mb-4">
                          <div className="bg-white/10 px-3 py-1 rounded-md text-xs font-bold text-white uppercase">{req.foodType}</div>
                        </div>
                        <h4 className="text-2xl font-bold text-white mb-1">{req.foodName}</h4>
                        <p className="text-sm font-medium text-slate-300 mb-1">Quantity: {req.quantity}</p>
                        <p className="text-sm text-slate-400 mb-2">Cooked at {req.cookedTime}</p>
                        {req.donorLocation && <p className="text-xs text-slate-500 mb-6 flex items-center gap-1 line-clamp-1"><MapPin size={12}/> Donor: {req.donorLocation.address}</p>}
                        
                        {req.status === "Waiting" ? (
                          <>
                            <div className={`flex items-center justify-between mb-6 p-4 rounded-xl border ${colorClass}`}>
                              <span className="font-bold flex items-center gap-2"><Clock size={18}/> Expires in</span>
                              <span className="text-2xl font-black">{minsLeft}m</span>
                            </div>
                            <button onClick={() => setAcceptingOrder(req)} className="w-full bg-white text-black font-bold py-3.5 rounded-xl hover:bg-slate-200 transition-colors">
                              Accept Pickup
                            </button>
                          </>
                        ) : (
                           <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl text-center">
                             <CheckCircle2 size={24} className="text-emerald-500 mx-auto mb-2" />
                             <p className="text-sm font-bold text-emerald-400">Assigned</p>
                           </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
          {ngoTab === "pickups" && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-white mb-6">My Assigned Deliveries</h2>
              <div className="space-y-4">
                {donationOrders.filter(r => r.status === "Pickup Assigned" && r.ngoId === user?.id).map(req => (
                  <div key={req.id} className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-bold text-emerald-400">{req.foodName}</h3>
                      <p className="text-slate-400 text-sm mt-1">Quantity: {req.quantity}</p>
                      <p className="text-slate-500 text-xs mt-1">To: {req.ngoLocation?.address}</p>
                    </div>
                    <div className="flex gap-4">
                      <button onClick={() => {
                        setViewingMapRoute(req);
                      }} className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-xl font-bold transition-colors flex items-center gap-2">
                        <MapPin size={16}/> Track Route
                      </button>
                      <button onClick={() => {
                        fetch(`/api/donations/${req.id}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ status: "Completed" })
                        }).then(async (response) => {
                          if (!response.ok) throw new Error("Failed to complete delivery");
                          const savedDonation = await response.json();
                          setOrders(prev => prev.map(o => o.id === req.id ? savedDonation : o));
                          if(activeRouteOrder?.id === req.id) setActiveRouteOrder(null);
                          addAuditLog("PICKUP_COMPLETED", "NGO", `Delivery completed for ${req.id}`, "success");
                          refreshUser();
                          setGlobalNotifications(n => [{id: `N-${Date.now()}`, role: "Donor", msg: `Your donation ${req.foodName} was successfully picked up!`, read: false}, ...n]);
                          notify("Completed", "Food successfully delivered!");
                        }).catch(e => console.error(e));
                      }} className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold transition-colors">Complete Delivery</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NGO Location Input Modal (When Accepting) */}
          {acceptingOrder && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
              <div className="bg-[#1e1e1e] border border-white/10 p-8 rounded-2xl max-w-md w-full shadow-2xl animate-in zoom-in-95">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2"><Navigation className="text-amber-500"/> Delivery Destination</h3>
                  <button onClick={() => setAcceptingOrder(null)} className="text-slate-400 hover:text-white"><X size={20}/></button>
                </div>
                <p className="text-slate-400 mb-6 text-sm">Where are you taking this food? We need your location to calculate the driving route and update the delivery timer via OSRM.</p>
                
                <div className="mb-6">
                   <label className="block text-sm font-medium text-slate-400 mb-2">NGO / Drop-off Address</label>
                   <AddressSearch placeholder="Type your address..." onSelect={(loc) => {
                     // Proceed to accept
                     const updatedOrder = { ...acceptingOrder, status: "Pickup Assigned" as OrderStatus, volunteerName: user?.name || "", ngoName: user?.name || "", ngoLocation: loc, ngoId: user?.id };
                     
                     fetch(`/api/donations/${acceptingOrder.id}`, {
                       method: 'PUT',
                       headers: { 'Content-Type': 'application/json' },
                       body: JSON.stringify(updatedOrder)
                     }).then(async (response) => {
                       if (!response.ok) throw new Error("Failed to assign pickup");
                       const savedDonation = await response.json();
                       setOrders(prev => prev.map(o => o.id === acceptingOrder.id ? savedDonation : o));
                       addAuditLog("PICKUP_ACCEPTED", "NGO", `NGO assigned to ${acceptingOrder.id}. Routing to ${loc.address}`, "info");
                       setGlobalNotifications(n => [{id: `N-${Date.now()}`, role: "Donor", msg: `NGO accepted your pickup! En-route to ${loc.address}.`, read: false}, ...n]);
                       
                       notify("Route Calculated!", "Pickup assigned. OSRM routing active.");
                       setAcceptingOrder(null);
                       setNgoTab("pickups");
                       setViewingMapRoute(updatedOrder);
                     }).catch(e => console.error(e));
                   }} />
                </div>
              </div>
            </div>
          )}

        </div>

        {/* MAP TRACKING MODAL */}
        {viewingMapRoute && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md z-[300] flex flex-col p-6 animate-in fade-in">
            <div className="flex justify-between items-center mb-4 shrink-0">
              <div>
                <h3 className="text-2xl font-bold text-white flex items-center gap-2"><Navigation className="text-amber-500"/> Live GPS Tracking</h3>
                <p className="text-slate-400">Tracking delivery for {viewingMapRoute.foodName}</p>
              </div>
              <button onClick={() => setViewingMapRoute(null)} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors flex items-center gap-2 font-bold">
                <X size={20}/> Close Tracker
              </button>
            </div>
            <div className="flex-1 bg-[#242f3e] rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative">
               <LiveMap deliveryRoute={{
                  origin: viewingMapRoute.donorLocation!,
                  destination: viewingMapRoute.ngoLocation!
               }} />
               <div className="absolute top-6 left-6 bg-black/80 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-2xl z-10">
                 <p className="text-xs text-slate-400 font-bold mb-1 uppercase tracking-widest">Status</p>
                 <p className="text-emerald-400 font-medium flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    Live Delivery Active
                 </p>
               </div>
            </div>
          </div>
        )}

        </div>
      </div>
    </div>
);
};

  // ================= ADMIN VIEW =================
  const renderAdmin = () => {
    const adminTabs: { id: AdminTab; icon: any; label: string; highlight?: boolean }[] = [
      { id: "overview", icon: BarChart3, label: "Platform Overview" },
      { id: "operations", icon: Package, label: "Global Operations" },
      { id: "network", icon: Users, label: "Partner Network" },
      { id: "audit", icon: FileText, label: "Audit Logs", highlight: true },
      { id: "ai", icon: Brain, label: "AI Insights" },
    ];

    const activeOrdersCount = orders.filter(o => o.status !== "Completed" && o.status !== "Expired").length;

    return (
      <div className="flex-1 flex gap-6 h-[calc(100vh-64px)] px-6 pb-6">
        <div className="w-64 bg-[#161616] border border-white/5 rounded-2xl flex flex-col p-4 shadow-2xl">
          <div className="flex items-center gap-3 mb-8 px-2">
            <ShieldCheck className="text-primary" size={28}/>
            <h2 className="font-bold text-lg text-white">Admin Hub</h2>
          </div>
          <div className="flex-1 flex flex-col gap-2">
            {adminTabs.map(tab => (
              <button key={tab.id} onClick={() => setAdminTab(tab.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative ${adminTab === tab.id ? "bg-white/10 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"}`}>
                <tab.icon size={18} className={adminTab===tab.id && tab.highlight ? "text-primary":""}/>
                <span className="font-medium text-sm">{tab.label}</span>
                {tab.highlight && <span className={`absolute right-4 w-2 h-2 rounded-full ${adminTab===tab.id?'bg-primary':'bg-primary/50'}`}></span>}
              </button>
            ))}
          </div>
          <button onClick={() => { setIsAuthenticated(false); window.location.href = '/portals'; }} className="mt-auto flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all"><X size={18}/> Lock & Exit</button>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          {adminTab === "overview" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-[#161616] border border-white/5 p-6 rounded-2xl border-l-2 border-l-primary shadow-xl">
                  <h3 className="text-sm font-medium text-slate-400">Total Active Operations</h3>
                  <p className="text-3xl font-bold mt-2">{activeOrdersCount}</p>
                  <p className="text-xs text-emerald-400 mt-1">Live Map Tracked</p>
                </div>
                <div className="bg-[#161616] border border-white/5 p-6 rounded-2xl border-l-2 border-l-amber-500 shadow-xl">
                  <h3 className="text-sm font-medium text-slate-400">Total Meals Rescued</h3>
                  <p className="text-3xl font-bold mt-2 text-amber-400">{mealsSaved}</p>
                  <p className="text-xs text-slate-500 mt-1">Global Platform Impact</p>
                </div>
                <div className="bg-[#161616] border border-white/5 p-6 rounded-2xl border-l-2 border-l-emerald-500 shadow-xl">
                  <h3 className="text-sm font-medium text-slate-400">Network Size</h3>
                  <p className="text-3xl font-bold mt-2 text-emerald-400">{usersNetwork.length}</p>
                  <p className="text-xs text-slate-500 mt-1">Registered NGOs & Donors</p>
                </div>
                <div className="bg-[#161616] border border-white/5 p-6 rounded-2xl border-l-2 border-l-red-500 shadow-xl">
                  <h3 className="text-sm font-medium text-slate-400">Platform Expiry Rate</h3>
                  <p className="text-3xl font-bold mt-2 text-red-400">{orders.length > 0 ? Math.round((orders.filter(r=>r.status==='Expired').length / orders.length) * 100) : 0}%</p>
                  <p className="text-xs text-slate-500 mt-1">Inefficiency Metric</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6 flex-1 min-h-0">
                 <div className="bg-[#161616] border border-white/5 rounded-2xl flex flex-col overflow-hidden shadow-xl p-6">
                   <h3 className="font-bold text-white mb-4">Pending Verifications</h3>
                   <div className="space-y-3 overflow-y-auto">
                     {usersNetwork.filter(u => u.status === "Pending Approval").length === 0 ? (
                        <p className="text-slate-500 text-sm italic">All partners verified.</p>
                     ) : (
                       usersNetwork.filter(u => u.status === "Pending Approval").map((user, idx) => (
                         <div key={idx} className="bg-black/40 border border-white/5 p-4 rounded-xl flex justify-between items-center">
                           <div>
                             <h4 className="font-medium text-slate-200">{user.name}</h4>
                             <p className="text-xs text-slate-500">{user.role}</p>
                           </div>
                           <button onClick={() => {
                               updateUserStatus(user.id, "Verified")
                                 .then(() => {
                                   setUsersNetwork(prev => prev.map(u => u.id === user.id ? {...u, status: "Verified"} : u));
                                   notify("Verified", `${user.name} is now active.`);
                                   addAuditLog("VERIFIED_PARTNER", "Admin", `Verified partner: ${user.name}`, "success");
                                 })
                                 .catch(e => console.error(e));
                           }} className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg font-bold hover:bg-primary/80 transition-colors">Approve</button>
                         </div>
                       ))
                     )}
                   </div>
                 </div>
                 <div className="bg-[#161616] border border-white/5 rounded-2xl flex flex-col overflow-hidden shadow-xl p-6">
                   <div className="flex justify-between items-center mb-4">
                     <h3 className="font-bold text-white">Recent Audit Actions</h3>
                     <button onClick={() => setAdminTab("audit")} className="text-xs text-primary hover:underline">View All</button>
                   </div>
                   <div className="space-y-3 overflow-y-auto">
                     {auditLogs.length === 0 ? (
                       <p className="text-slate-500 text-sm italic">No recent actions.</p>
                     ) : (
                       auditLogs.slice(0, 5).map(log => (
                         <div key={log.id} className="bg-black/40 border border-white/5 p-3 rounded-xl hover:bg-white/5 transition-colors">
                           <div className="flex justify-between items-center mb-1">
                             <div className="flex items-center gap-2">
                               {getLogIcon(log.type)}
                               <span className="text-xs font-bold text-slate-300">{log.role}</span>
                             </div>
                             <span className="text-[10px] text-slate-500 font-mono">{formatLogTime(log.time)}</span>
                           </div>
                           <p className="text-xs text-slate-400 line-clamp-1">{log.details}</p>
                         </div>
                       ))
                     )}
                   </div>
                 </div>
              </div>
            </>
          )}

          {adminTab === "network" && (
             <div className="bg-[#161616] border border-white/5 rounded-2xl flex flex-col flex-1 overflow-hidden shadow-xl p-6">
                <h2 className="text-xl font-bold text-white mb-6">Partner Network Management</h2>
                <div className="space-y-4 overflow-y-auto">
                  {usersNetwork.map(user => (
                    <div key={user.id} className="bg-black/40 border border-white/5 p-4 rounded-xl flex justify-between items-center">
                       <div>
                         <h4 className="text-lg text-white font-bold flex items-center gap-2">
                           {user.name}
                           {user.status === "Verified" && <CheckCircle2 size={16} className="text-primary"/>}
                         </h4>
                         <span className={`text-xs px-2 py-0.5 rounded-full font-bold mt-2 inline-block ${user.role === 'Donor' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>{user.role}</span>
                       </div>
                       <div className="flex items-center gap-8">
                         <div className="text-right">
                           <p className="text-xs text-slate-500">Total Impact</p>
                           <p className="text-xl font-bold text-white">{user.totalImpact} meals</p>
                         </div>
                         <div className="flex flex-col gap-2 w-32">
                           {user.status === "Pending Approval" ? (
                             <button onClick={() => {
                               updateUserStatus(user.id, "Verified")
                                 .then(() => {
                                   setUsersNetwork(prev => prev.map(u => u.id === user.id ? {...u, status: "Verified"} : u));
                                   notify("Partner Verified", `${user.name} can now access the platform.`);
                                   addAuditLog("VERIFIED_PARTNER", "Admin", `Verified partner: ${user.name}`, "success");
                                 })
                                 .catch(e => console.error(e));
                             }} className="bg-primary hover:bg-primary/90 text-white text-xs py-2 rounded-lg font-bold transition-colors w-full">Verify Partner</button>
                           ) : user.status === "Verified" ? (
                             <button onClick={() => {
                               updateUserStatus(user.id, "Suspended")
                                 .then(() => {
                                   setUsersNetwork(prev => prev.map(u => u.id === user.id ? {...u, status: "Suspended"} : u));
                                   notify("Suspended", `${user.name} access revoked.`);
                                   addAuditLog("SUSPENDED_PARTNER", "Admin", `Suspended partner: ${user.name}`, "warning");
                                 })
                                 .catch(e => console.error(e));
                             }} className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs py-2 rounded-lg font-bold transition-colors w-full">Suspend Access</button>
                           ) : (
                             <button onClick={() => {
                               updateUserStatus(user.id, "Verified")
                                 .then(() => {
                                   setUsersNetwork(prev => prev.map(u => u.id === user.id ? {...u, status: "Verified"} : u));
                                   notify("Restored", `${user.name} access restored.`);
                                   addAuditLog("VERIFIED_PARTNER", "Admin", `Restored partner: ${user.name}`, "success");
                                 })
                                 .catch(e => console.error(e));
                             }} className="bg-slate-700 hover:bg-slate-600 text-white text-xs py-2 rounded-lg font-bold transition-colors w-full">Restore Access</button>
                           )}
                         </div>
                       </div>
                    </div>
                  ))}
                </div>
             </div>
          )}

          {adminTab === "operations" && (
             <div className="bg-[#161616] border border-white/5 rounded-2xl flex flex-col flex-1 overflow-hidden shadow-xl p-6">
                <h2 className="text-xl font-bold text-white mb-6">Global Operations Log</h2>
                <div className="space-y-4 overflow-y-auto">
                  {orders.length === 0 && <p className="text-slate-500 italic">No active operations.</p>}
                  {orders.map(order => (
                    <div key={order.id} className="bg-black/40 border border-white/5 p-4 rounded-xl flex justify-between items-center group">
                       <div className="flex gap-4 items-center">
                         <span className="text-sm font-mono text-slate-500">{order.id}</span>
                         <h4 className="text-lg text-white font-bold">{order.foodName} <span className="text-sm font-normal text-slate-400">x{order.quantity}</span></h4>
                         {order.donorLocation && <span className="text-xs text-slate-400 bg-white/5 px-2 py-1 rounded flex items-center gap-1"><MapPin size={12}/>{order.donorLocation.address}</span>}
                         {order.ngoLocation && order.status === "Pickup Assigned" && <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded flex items-center gap-1"><ArrowRight size={12}/>{order.ngoLocation.address}</span>}
                       </div>
                       <div className="flex items-center gap-4">
                         <span className={`text-sm px-3 py-1 rounded-md font-bold ${order.status === 'Waiting' ? 'bg-amber-500/10 text-amber-400' : order.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' : order.status === 'Expired' ? 'bg-red-500/10 text-red-400' : 'bg-primary/10 text-primary'}`}>{order.status}</span>
                         
                         {/* ADMIN OVERRIDES */}
                         <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           {order.status !== "Expired" && order.status !== "Completed" && (
                             <button onClick={() => {
                               setOrders(prev => prev.map(o => o.id === order.id ? {...o, status: "Expired"} : o));
                               addAuditLog("FORCE_EXPIRE", "Admin", `Admin manually expired operation ${order.id}`, "warning");
                               notify("Override", `Operation ${order.id} force expired.`);
                             }} className="p-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/40 rounded-md text-xs font-bold transition-colors">Force Expire</button>
                           )}
                           <button onClick={() => {
                             setOrders(prev => prev.filter(o => o.id !== order.id));
                             addAuditLog("DELETE_OPERATION", "Admin", `Admin deleted operation ${order.id}`, "error");
                             notify("System Erase", `Operation ${order.id} erased from log.`);
                           }} className="p-1.5 bg-slate-700 text-slate-300 hover:bg-red-500 hover:text-white rounded-md text-xs font-bold transition-colors"><Trash2 size={14}/></button>
                         </div>
                       </div>
                    </div>
                  ))}
                </div>
             </div>
          )}

          {adminTab === "audit" && (
            <div className="bg-[#161616] border border-white/5 rounded-2xl flex flex-col flex-1 overflow-hidden shadow-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2"><FileText className="text-primary"/> System Audit Trail</h2>
                <div className="flex gap-2">
                  <button onClick={fetchAuditLogs} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 transition-colors"><RefreshCw size={16}/></button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {auditLogs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                    <History size={48} className="mb-4 opacity-20" />
                    <p>No audit records found in the database.</p>
                  </div>
                ) : (
                  auditLogs.map(log => (
                    <div key={log.id} className="flex items-center justify-between p-4 bg-black/40 border border-white/5 rounded-xl hover:bg-white/5 transition-all group">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                          {getLogIcon(log.type)}
                        </div>
                        <div className="flex flex-col">
                           <div className="flex items-center gap-3">
                             <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${log.role==='System'?'bg-slate-700 text-slate-300':log.role==='Admin'?'bg-primary/20 text-primary':log.role==='Donor'?'bg-emerald-500/20 text-emerald-400':'bg-amber-500/20 text-amber-400'}`}>{log.role}</span>
                             <span className="text-xs bg-white/5 border border-white/10 px-2 py-0.5 rounded text-slate-400 font-mono uppercase">{log.action}</span>
                           </div>
                           <p className="text-sm text-slate-200 mt-1">{log.details}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-slate-500 font-mono">{formatLogTime(log.time)}</p>
                        <p className="text-[10px] text-slate-600 mt-1 uppercase tracking-tighter">ID: {log.id}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {adminTab === "ai" && (
             <div className="bg-[#161616] border border-white/5 rounded-2xl flex flex-col flex-1 overflow-hidden shadow-xl p-8 items-center justify-center text-center">
                <Brain size={64} className="text-primary mb-4 animate-pulse"/>
                <h2 className="text-2xl font-bold text-white mb-2">AI Platform Insights</h2>
                <p className="text-slate-400 max-w-md mb-6">The AI system analyzes global logistics data to optimize rescue workflows.</p>
                
                 <div className="grid grid-cols-2 gap-4 w-full max-w-2xl text-left">
                   <div className="bg-black/50 border border-white/5 p-4 rounded-xl border-l-2 border-l-emerald-500">
                     <h4 className="text-sm font-bold text-emerald-400 mb-2">Route Optimization</h4>
                     <p className="text-xs text-slate-400">By routing NGOs to the closest donations, platform saved estimated {Math.max(2, Math.round(mealsSaved * 0.15))} hours of travel time globally.</p>
                   </div>
                   <div className="bg-black/50 border border-white/5 p-4 rounded-xl border-l-2 border-l-red-500">
                     <h4 className="text-sm font-bold text-red-400 mb-2">Efficiency Analysis</h4>
                     <p className="text-xs text-slate-400">
                       {orders.filter(r=>r.status==='Expired').length > (orders.length * 0.2) 
                         ? `High expiry rate alert! ${orders.filter(r=>r.status==='Expired').length} items lost. Suggesting volunteer incentives.` 
                         : `Platform efficiency is at ${orders.length > 0 ? 100 - Math.round((orders.filter(r=>r.status==='Expired').length / orders.length) * 100) : 100}%. Rescue workflows are optimal.`}
                     </p>
                   </div>
                   <div className="bg-black/50 border border-white/5 p-4 rounded-xl border-l-2 border-l-primary col-span-2">
                     <h4 className="text-sm font-bold text-primary mb-2">Network Growth Projection</h4>
                     <p className="text-xs text-slate-400">
                       With {usersNetwork.length} partners, we are covering {usersNetwork.length * 2.5}km radius. {usersNetwork.filter(u=>u.status==='Pending Approval').length} new partners are awaiting your verification.
                     </p>
                   </div>
                 </div>
             </div>
          )}
        </div>
      </div>
    );
  };

  if (!isMounted) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <div className="h-screen bg-black flex flex-col overflow-hidden font-sans">
      <div className="h-16 border-b border-white/5 bg-[#161616] flex items-center justify-between px-6 shrink-0">
        <div>{/* Empty space where RescueFlow logo used to be */}</div>
        {role && (
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2">
               <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span></span>
               <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Global Sync Active</span>
             </div>
             <div className="h-8 w-px bg-white/10 mx-2"></div>
             <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
               <span className="text-xs text-slate-400">Current Role:</span>
               <span className={`text-xs font-bold ${role==='Admin'?'text-primary':role==='Donor'?'text-emerald-400':'text-amber-400'}`}>{role}</span>
             </div>
          </div>
        )}
      </div>

      <div className="flex-1 mt-6">
        {!role ? renderRoleSelection() : 
         role === "Admin" && !isAuthenticated ? renderAdminLogin() : 
         role === "Admin" ? renderAdmin() : 
         role === "Donor" ? renderDonor() : 
         renderNGO()}
      </div>

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[100] bg-[#1e1e1e] border border-primary/30 text-white p-4 rounded-xl shadow-2xl flex items-start gap-4 animate-in slide-in-from-bottom-5">
          <div className="w-10 h-10 bg-primary/20 text-primary rounded-full flex items-center justify-center shrink-0"><Bell size={20} /></div>
          <div><p className="text-sm font-bold text-primary">{toastMessage.title}</p><p className="text-slate-200 text-sm mt-0.5">{toastMessage.desc}</p></div>
        </div>
      )}
    </div>
  );
}
