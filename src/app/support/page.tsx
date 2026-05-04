"use client";

import { useState, useEffect, useRef } from "react";
import QRCode from "react-qr-code";
import { Heart, Coins, CheckCircle2, AlertCircle, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Tab = "NGO" | "Volunteer";

const ngos = [
  { id: 1, name: "Robin Hood Army", desc: "Zero-funds volunteer organization routing surplus food.", meals: "12.5M+" },
  { id: 2, name: "Feeding India", desc: "Eradicating hunger by distributing nutritious meals.", meals: "150M+" },
  { id: 3, name: "Bangalore Food Bank", desc: "Rescuing food to feed the hungry and marginalized.", meals: "3.2M+" },
  { id: 4, name: "No Food Waste", desc: "Recovering excess food to feed the needy.", meals: "5.8M+" },
];

const tipPresets = [20, 50, 100];

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState<Tab>("NGO");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentStep, setPaymentStep] = useState<"amount" | "qr" | "success">("amount");
  const [selectedEntity, setSelectedEntity] = useState<string>("");
  
  // Payment State
  const [amount, setAmount] = useState<number | "custom" | "">("");
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const qrRef = useRef<HTMLDivElement | null>(null);

  const handleOpenModal = (entityName: string) => {
    setSelectedEntity(entityName);
    setPaymentStep("amount");
    setAmount("");
    setCustomAmount("");
    setIsModalOpen(true);
  };

  const handleGenerateQR = () => {
    const finalAmount = amount === "custom" ? parseInt(customAmount) : amount;
    if (!finalAmount || isNaN(finalAmount as number) || finalAmount <= 0) return;
    setAmount(finalAmount as number);
    // create a short unique payment id
    const id = typeof crypto !== "undefined" && (crypto as any).randomUUID ? (crypto as any).randomUUID() : `p_${Date.now()}_${Math.floor(Math.random()*9000)+1000}`;
    setPaymentId(id);

    // persist payment record as Pending
    try {
      fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: id,
          amount: finalAmount,
          recipient: selectedEntity || 'Unknown',
          status: 'Pending',
          method: 'UPI',
          payload: { upi: `upi://pay?pa=rescueflow@ybl&pn=${encodeURIComponent(selectedEntity)}&am=${finalAmount}&cu=INR&tn=${id}` }
        })
      }).catch(err => console.error('Create payment failed', err));
    } catch (e) {
      console.error('Create payment exception', e);
    }

    setPaymentStep("qr");
  };

  const handleScanSuccess = () => {
    setIsVerifying(true);
    setTimeout(async () => {
      // mark payment as completed in DB
      try {
        if (paymentId) {
          await fetch(`/api/payments/${paymentId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'Completed' }),
          });
        }
      } catch (e) {
        console.error('Update payment status failed', e);
      }

      setIsVerifying(false);
      setPaymentStep("success");
      setTimeout(() => {
        setIsModalOpen(false);
      }, 3000);
    }, 1500); // Simulate API check
  };

  return (
    <div className="flex-1 flex flex-col px-6 pb-6 min-h-[calc(100vh-64px)] overflow-y-auto">
      
      {/* Disclaimer Banner */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-8 flex items-center justify-center gap-2 text-amber-500 font-medium">
        <AlertCircle size={18} />
        ⚠️ This is a demo payment system. No real money is being transferred.
      </div>

      <div className="max-w-5xl mx-auto w-full">
        {/* Header & Tabs */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-white mb-4">Support the Ecosystem ❤️</h1>
          <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
            Your contributions keep the global food rescue operation running. Donate to our verified NGO partners or tip the volunteers doing the heavy lifting.
          </p>

          <div className="inline-flex bg-[#161616] p-1.5 rounded-2xl border border-white/5 shadow-xl">
            <button
              onClick={() => setActiveTab("NGO")}
              className={`px-8 py-3 rounded-xl font-bold transition-all ${
                activeTab === "NGO" ? "bg-pink-500 text-white shadow-[0_0_20px_rgba(236,72,153,0.3)]" : "text-slate-400 hover:text-white"
              }`}
            >
              Donate to NGOs
            </button>
            <button
              onClick={() => setActiveTab("Volunteer")}
              className={`px-8 py-3 rounded-xl font-bold transition-all ${
                activeTab === "Volunteer" ? "bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]" : "text-slate-400 hover:text-white"
              }`}
            >
              Tip Volunteers
            </button>
          </div>
        </div>

        {/* Content Sections */}
        <AnimatePresence mode="wait">
          {activeTab === "NGO" ? (
            <motion.div
              key="ngo"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {ngos.map((ngo) => (
                <div key={ngo.id} className="glass-panel p-8 rounded-3xl border border-white/5 hover:border-pink-500/30 transition-all flex flex-col justify-between group shadow-xl">
                  <div>
                    <div className="w-12 h-12 bg-pink-500/10 rounded-2xl flex items-center justify-center text-pink-500 mb-6">
                      <Heart size={24} className="fill-pink-500/20" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{ngo.name}</h3>
                    <p className="text-slate-400 mb-6 line-clamp-2">{ngo.desc}</p>
                  </div>
                  <div className="flex items-center justify-between mt-auto">
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Impact</p>
                      <p className="text-emerald-400 font-bold">{ngo.meals} Meals Served</p>
                    </div>
                    <button 
                      onClick={() => handleOpenModal(ngo.name)}
                      className="px-6 py-3 bg-white/5 hover:bg-pink-500 text-white font-bold rounded-xl transition-colors shadow-lg"
                    >
                      Donate
                    </button>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="volunteer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex justify-center"
            >
              <div className="max-w-md w-full glass-panel p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500" />
                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mb-6 mx-auto">
                  <CheckCircle2 size={32} />
                </div>
                <h2 className="text-2xl font-bold text-white text-center mb-2">Delivery Successful 🎉</h2>
                <p className="text-slate-400 text-center mb-8">
                  Your rescued food was successfully delivered to Robin Hood Army by volunteer <strong>Rahul K.</strong>
                </p>

                <h3 className="text-sm font-bold text-slate-300 mb-4 text-center">Leave a tip to say thanks</h3>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {tipPresets.map(preset => (
                    <button
                      key={preset}
                      onClick={() => {
                        setAmount(preset);
                        setSelectedEntity("Rahul K. (Volunteer)");
                        setPaymentStep("qr");
                        setIsModalOpen(true);
                      }}
                      className="py-3 bg-white/5 hover:bg-emerald-500 hover:text-white rounded-xl text-lg font-bold text-slate-300 transition-colors border border-white/5"
                    >
                      ₹{preset}
                    </button>
                  ))}
                </div>
                <button
                   onClick={() => handleOpenModal("Rahul K. (Volunteer)")}
                   className="w-full py-3 bg-transparent border border-white/10 hover:border-white/30 text-slate-300 rounded-xl font-bold transition-colors"
                >
                  Custom Amount
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-[#1a1a1a] border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              {paymentStep === "amount" && (
                <>
                  <div className="w-12 h-12 bg-pink-500/10 rounded-full flex items-center justify-center text-pink-500 mb-6">
                    <Coins size={24} />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Support {selectedEntity}</h2>
                  <p className="text-sm text-slate-400 mb-6">Select an amount to contribute.</p>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[100, 500, 1000].map(val => (
                      <button
                        key={val}
                        onClick={() => setAmount(val)}
                        className={`py-3 rounded-xl text-lg font-bold transition-colors border ${
                          amount === val ? "bg-pink-500 border-pink-500 text-white" : "bg-white/5 border-white/5 text-slate-300 hover:bg-white/10"
                        }`}
                      >
                        ₹{val}
                      </button>
                    ))}
                  </div>

                  <div className="relative mb-8">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                    <input 
                      type="number"
                      placeholder="Custom Amount"
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value);
                        setAmount("custom");
                      }}
                      className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-8 pr-4 text-white font-bold placeholder:text-slate-600 focus:outline-none focus:border-pink-500"
                    />
                  </div>

                  <button 
                    onClick={handleGenerateQR}
                    disabled={!amount}
                    className="w-full py-4 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-pink-500/25"
                  >
                    Proceed to Pay
                  </button>
                </>
              )}

              {paymentStep === "qr" && (
                <div className="flex flex-col items-center text-center">
                  <h2 className="text-2xl font-bold text-white mb-2">Scan to Pay</h2>
                  <p className="text-sm text-slate-400 mb-8">Open any UPI App on your phone and scan</p>
                  
                  <div className="bg-white p-4 rounded-2xl shadow-xl mb-4" ref={qrRef}>
                    {/* Embed payment id into the payload so the QR is shareable */}
                    <QRCode value={
                      // we include both a UPI payload and a fallback shareable URL containing the payment id
                      `upi://pay?pa=rescueflow@ybl&pn=${encodeURIComponent(selectedEntity)}&am=${amount}&cu=INR&tn=${paymentId}`
                    } size={200} />
                  </div>

                  <div className="mb-6 text-sm text-slate-400">
                    <div>Payment ID: <span className="text-white font-mono">{paymentId}</span></div>
                  </div>

                  <div className="flex gap-3 mb-6 w-full">
                    <button
                      onClick={async () => {
                        const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/support/payment/${paymentId}`;
                        if (navigator.share) {
                          try {
                            await navigator.share({ title: 'Payment', text: `Pay ₹${amount} to ${selectedEntity}`, url: shareUrl });
                          } catch (e) {
                            // ignore
                          }
                        } else {
                          await navigator.clipboard.writeText(shareUrl);
                          alert('Link copied to clipboard');
                        }
                      }}
                      className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold"
                    >
                      Share Payment
                    </button>

                    <button
                      onClick={async () => {
                        const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/support/payment/${paymentId}`;
                        await navigator.clipboard.writeText(shareUrl);
                        alert('Link copied to clipboard');
                      }}
                      className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-slate-200 rounded-xl font-bold border border-white/5"
                    >
                      Copy Link
                    </button>
                  </div>

                  <div className="w-full flex gap-3 mb-8">
                    <button
                      onClick={() => {
                        // Download the QR as PNG by serializing SVG and drawing to canvas
                        try {
                          const svg = qrRef.current?.querySelector('svg');
                          if (!svg) return;
                          const serializer = new XMLSerializer();
                          const svgString = serializer.serializeToString(svg);
                          const canvas = document.createElement('canvas');
                          const size = 400;
                          canvas.width = size;
                          canvas.height = size;
                          const ctx = canvas.getContext('2d');
                          const img = new Image();
                          const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
                          const url = URL.createObjectURL(svgBlob);
                          img.onload = () => {
                            ctx?.fillRect(0,0,size,size);
                            ctx?.drawImage(img, 0, 0, size, size);
                            URL.revokeObjectURL(url);
                            const pngUrl = canvas.toDataURL('image/png');
                            const a = document.createElement('a');
                            a.href = pngUrl;
                            a.download = `payment-${paymentId}.png`;
                            a.click();
                          };
                          img.src = url;
                        } catch (e) {
                          console.error(e);
                        }
                      }}
                      className="w-full py-3 bg-white/5 hover:bg-white/10 text-slate-200 rounded-xl font-bold border border-white/5"
                    >
                      Download QR
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between w-full p-4 bg-black/40 rounded-xl border border-white/5 mb-8">
                    <span className="text-slate-400 font-medium">Paying to {selectedEntity}</span>
                    <span className="text-white font-bold text-xl">₹{amount}</span>
                  </div>

                  <button 
                    onClick={handleScanSuccess}
                    disabled={isVerifying}
                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-colors disabled:opacity-70 disabled:cursor-wait shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
                  >
                    {isVerifying ? (
                      <><Loader2 className="animate-spin" size={20} /> Verifying Payment...</>
                    ) : (
                      "I've Paid, Verify Status"
                    )}
                  </button>
                  
                  <button 
                    onClick={() => setPaymentStep("amount")}
                    disabled={isVerifying}
                    className="mt-4 text-sm text-slate-500 hover:text-white transition-colors underline disabled:opacity-50"
                  >
                    Cancel Payment
                  </button>
                </div>
              )}

              {paymentStep === "success" && (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center text-center py-8"
                >
                  <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500 mb-6">
                    <CheckCircle2 size={40} />
                  </div>
                  <h2 className="text-3xl font-black text-white mb-3">Thank You!</h2>
                  <p className="text-slate-400 mb-8">
                    Payment of <strong className="text-white">₹{amount}</strong> simulated successfully. Your support means everything!
                  </p>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
