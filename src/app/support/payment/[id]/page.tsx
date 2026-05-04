"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function PaymentStatusPage() {
  const params = useParams() as { id?: string };
  const id = params?.id || "";
  const router = useRouter();

  const [payment, setPayment] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPayment = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/payments/${id}`);
      if (!res.ok) throw new Error(`Payment ${id} not found`);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const markCompleted = async () => {
    if (!id) return;
    try {
      await fetch(`/api/payments/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "Completed" }) });
      await fetchPayment();
    } catch (e) {
      console.error(e);
    }
  };

  if (!id) return (
    <div className="p-8">
      <h2 className="text-xl font-bold">No payment id provided</h2>
      <p className="text-slate-400">Open this page as /support/payment/&lt;paymentId&gt;</p>
    </div>
  );

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Payment {id}</h1>
        <div className="flex gap-2">
          <button onClick={() => fetchPayment()} className="px-3 py-2 bg-white/5 rounded">Refresh</button>
          <button onClick={() => router.push('/support')} className="px-3 py-2 bg-white/5 rounded">Back</button>
        </div>
      </div>

      {loading && <div>Loading…</div>}
      {error && <div className="text-rose-400">{error}</div>}

      {payment && (
        <div className="bg-[#111] p-6 rounded-lg border border-white/5">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-xs text-slate-400">Recipient</div>
              <div className="text-white font-bold">{payment.recipient}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Amount</div>
              <div className="text-white font-bold">₹{payment.amount}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Status</div>
              <div className={`font-bold ${payment.status === 'Completed' ? 'text-emerald-400' : 'text-amber-400'}`}>{payment.status}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Method</div>
              <div className="text-white">{payment.method}</div>
            </div>
          </div>

          <div className="mb-4">
            <div className="text-xs text-slate-400">Payload</div>
            <pre className="text-sm text-slate-300 bg-black/40 p-3 rounded">{JSON.stringify(payment.payload, null, 2)}</pre>
          </div>

          <div className="flex gap-3">
            {payment.status !== 'Completed' && (
              <button onClick={markCompleted} className="px-4 py-2 bg-emerald-500 rounded font-bold">Mark Completed</button>
            )}
            <button onClick={() => navigator.clipboard?.writeText(window.location.href)} className="px-4 py-2 bg-white/5 rounded">Copy Link</button>
          </div>
        </div>
      )}
    </div>
  );
}
