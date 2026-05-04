"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle2, Clock, Copy, ChevronDown } from "lucide-react";

export default function PaymentStatusPage() {
  const params = useParams() as { id?: string };
  const id = params?.id || "";

  const [payment, setPayment] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const fetchPayment = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/payments/${id}`);
      if (!res.ok) throw new Error(`Payment not found`);
      const data = await res.json();
      setPayment(data);
    } catch (e: any) {
      setError(e.message || "Failed to fetch payment");
      setPayment(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayment();
    const interval = setInterval(fetchPayment, 3000); // auto-refresh every 3s
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const copyUPI = async () => {
    if (payment?.payload?.upi) {
      await navigator.clipboard.writeText(payment.payload.upi);
      alert("UPI link copied to clipboard");
    }
  };

  if (!id) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">No Payment ID</h2>
        <p className="text-slate-400">Payment link is invalid or expired</p>
      </div>
    </div>
  );

  if (loading && !payment) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );

  if (error && !payment) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-rose-400 mb-2">Payment Not Found</h2>
        <p className="text-slate-400">{error}</p>
      </div>
    </div>
  );

  const isCompleted = payment?.status === "Completed";

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        {/* Status Card */}
        <div className={`rounded-3xl p-8 text-center border ${isCompleted ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
          {/* Icon */}
          <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 ${isCompleted ? 'bg-emerald-500/20' : 'bg-amber-500/20'}`}>
            {isCompleted ? (
              <CheckCircle2 size={40} className="text-emerald-400" />
            ) : (
              <Clock size={40} className="text-amber-400" />
            )}
          </div>

          {/* Status */}
          <h1 className={`text-3xl font-black mb-2 ${isCompleted ? 'text-emerald-400' : 'text-amber-400'}`}>
            {isCompleted ? "Payment Complete ✓" : "Awaiting Payment"}
          </h1>
          
          <p className="text-slate-400 text-sm mb-6">
            {isCompleted 
              ? "Thank you for your contribution!"
              : "Open your UPI app to complete payment"
            }
          </p>

          {/* Amount */}
          <div className="bg-black/50 rounded-2xl p-6 mb-6 border border-white/5">
            <p className="text-slate-400 text-sm mb-2">Amount</p>
            <p className="text-4xl font-black text-white">₹{payment?.amount}</p>
            <p className="text-slate-500 text-sm mt-2">To: {payment?.recipient}</p>
          </div>

          {/* Actions */}
          <div className="space-y-3 mb-6">
            {!isCompleted && (
              <>
                <button
                  onClick={copyUPI}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Copy size={18} /> Copy UPI Link
                </button>
                <p className="text-xs text-slate-500">Paste in your UPI app or use your phone's camera to scan the QR on another device</p>
              </>
            )}
          </div>

          {/* Details Toggle */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <ChevronDown size={16} className={`transition-transform ${showDetails ? 'rotate-180' : ''}`} />
            {showDetails ? 'Hide' : 'Show'} Details
          </button>
        </div>

        {/* Hidden Details Section */}
        {showDetails && (
          <div className="mt-4 bg-[#111] p-6 rounded-2xl border border-white/5">
            <h3 className="text-sm font-bold text-slate-300 mb-4">Payment Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">ID</span>
                <span className="text-slate-200 font-mono">{id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status</span>
                <span className={`font-bold ${isCompleted ? 'text-emerald-400' : 'text-amber-400'}`}>{payment?.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Method</span>
                <span className="text-slate-200">{payment?.method}</span>
              </div>
              {payment?.createdAt && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Created</span>
                  <span className="text-slate-200">{new Date(payment.createdAt).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
