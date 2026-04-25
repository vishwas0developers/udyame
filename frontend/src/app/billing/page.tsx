"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  Check, 
  Loader2, 
  ArrowLeft, 
  CreditCard, 
  ShieldCheck, 
  Globe, 
  Lock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import apiClient from "@/lib/api-client";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

interface Plan {
  id: string;
  name: string;
  price: number;
  credits_included: number;
  features: string[];
  is_active: boolean;
  is_recommended: boolean;
}

export default function BillingPage() {
  const { setAuth } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get("planId");
  
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [gateway, setGateway] = useState<"razorpay" | "stripe">("stripe");

  useEffect(() => {
    if (!planId) {
      router.push("/plans");
      return;
    }

    let retried = false;

    const fetchPlanDetails = async () => {
      try {
        const response = await apiClient.get("/plans/plans");
        const selectedPlan = response.data.find((p: Plan) => p.id === planId);
        if (selectedPlan) {
          setPlan(selectedPlan);
        } else {
          toast.error("Invalid plan selected.");
          router.push("/plans");
        }
      } catch (error) {
        // Retry once after a short delay (handles backend cold-start)
        if (!retried) {
          retried = true;
          await new Promise((r) => setTimeout(r, 1500));
          return fetchPlanDetails();
        }
        console.error("Failed to fetch plan:", error);
        toast.error("Could not load plan details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlanDetails();
  }, [planId, router]);

  const handleConfirmPurchase = async () => {
    if (!plan) return;
    setProcessing(true);
    try {
      // Mocking gateway selection logic
      await apiClient.post(`/plans/me/plan/${plan.id}`);
      toast.success(`Welcome to the ${plan.name} Tier!`);
      
      const userRes = await apiClient.get("/auth/me");
      const token = localStorage.getItem("auth_token") || "";
      setAuth(userRes.data, token);
      
      router.push("/dashboard");
    } catch (error) {
      console.error("Purchase failed:", error);
      toast.error("Checkout failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading || !plan) {
    return (
      <div className="flex flex-col min-h-screen bg-[#05070a]">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-blue-500/20 border-b-blue-500 rounded-full"
          />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#05070a] text-white selection:bg-blue-500/30">
      <Navbar />
      
      <main className="flex-grow pt-32 pb-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.button 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => router.push("/plans")}
            className="group flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-12 font-bold tracking-widest text-xs uppercase"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
            Back to Tiers
          </motion.button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            {/* Order Summary (Col 7) */}
            <div className="lg:col-span-7 space-y-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="text-4xl font-black tracking-tight mb-8">CONFIRM YOUR ARCHITECTURE</h2>
                
                <Card className="bg-white/5 border-white/10 text-white rounded-[2.5rem] overflow-hidden backdrop-blur-xl">
                  <CardHeader className="p-10 pb-6 border-b border-white/5">
                    <div className="flex justify-between items-start">
                      <div>
                         <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 py-1 font-black mb-3">SELECTED TIER</Badge>
                         <CardTitle className="text-4xl font-black italic tracking-tighter">{plan.name.toUpperCase()}</CardTitle>
                      </div>
                      <div className="text-right">
                         <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] block mb-1">TOTAL DUE</span>
                         <span className="text-4xl font-black text-blue-500 tracking-tighter italic">₹{plan.price}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-10 space-y-8">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                           <h4 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-4">Core Benefits</h4>
                           <ul className="space-y-4">
                              {plan.features.slice(0, 4).map((f, i) => (
                                <li key={i} className="flex items-center gap-3 text-sm text-zinc-300">
                                   <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                   {f}
                                </li>
                              ))}
                           </ul>
                        </div>
                        <div className="bg-white/[0.03] rounded-3xl p-6 border border-white/5">
                           <Zap className="w-8 h-8 text-blue-500 mb-4" />
                           <h4 className="font-bold mb-2">Resource Allocation</h4>
                           <p className="text-sm text-zinc-500 leading-relaxed">
                              You will receive {plan.credits_included} Design Units instantly upon successful checkout. These units power our deep-discovery AI engine.
                           </p>
                        </div>
                     </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Trust Section */}
              <div className="grid grid-cols-3 gap-6 opacity-30 grayscale group-hover:opacity-100 transition-opacity">
                 <div className="flex flex-col items-center gap-2">
                    <ShieldCheck className="w-10 h-10" />
                    <span className="text-[10px] font-bold tracking-widest uppercase">SSL Secure</span>
                 </div>
                 <div className="flex flex-col items-center gap-2">
                    <Lock className="w-10 h-10" />
                    <span className="text-[10px] font-bold tracking-widest uppercase">PCI Compliant</span>
                 </div>
                 <div className="flex flex-col items-center gap-2">
                    <Globe className="w-10 h-10" />
                    <span className="text-[10px] font-bold tracking-widest uppercase">Global Access</span>
                 </div>
              </div>
            </div>

            {/* Checkout Form (Col 5) */}
            <div className="lg:col-span-5">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-white/5 border-blue-500/30 text-white rounded-[2.5rem] shadow-[0_20px_80px_rgba(37,99,235,0.1)] overflow-hidden">
                  <CardHeader className="p-10">
                    <CardTitle className="flex items-center gap-3 text-2xl font-bold">
                       <CreditCard className="w-6 h-6 text-blue-500" />
                       SECURE CHECKOUT
                    </CardTitle>
                    <CardDescription className="text-zinc-500">Select your preferred payment architecture.</CardDescription>
                  </CardHeader>
                  <CardContent className="px-10 pb-10 space-y-8">
                    {/* Gateway Selection */}
                    <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10">
                       <button 
                         onClick={() => setGateway("stripe")}
                         className={`flex-1 py-4 rounded-xl font-bold text-sm transition-all ${gateway === 'stripe' ? 'bg-white/10 text-white shadow-xl' : 'text-zinc-500 hover:text-zinc-300'}`}
                       >
                         INTERNATIONAL (Stripe)
                       </button>
                       <button 
                         onClick={() => setGateway("razorpay")}
                         className={`flex-1 py-4 rounded-xl font-bold text-sm transition-all ${gateway === 'razorpay' ? 'bg-white/10 text-white shadow-xl' : 'text-zinc-500 hover:text-zinc-300'}`}
                       >
                         INDIA (Razorpay)
                       </button>
                    </div>

                    <div className="p-8 bg-blue-500/5 rounded-3xl border border-blue-500/10 border-dashed text-center">
                       <p className="text-blue-400 text-sm font-medium">
                          You are currently using {gateway === 'stripe' ? 'Stripe Global' : 'Razorpay Secure'} Gateway. 
                          Check out safely with 256-bit encryption.
                       </p>
                    </div>

                    <div className="space-y-4">
                       <div className="flex gap-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                          <span className="text-xs text-zinc-500 leading-relaxed italic">
                             By confirming, you agree to our Terms of Strategic Partnership. Your subscription will renew automatically every month.
                          </span>
                       </div>
                    </div>

                    <Button 
                      className="w-full h-20 bg-blue-600 hover:bg-blue-700 text-xl font-black italic rounded-3xl shadow-[0_10px_30px_rgba(37,99,235,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98]"
                      onClick={handleConfirmPurchase}
                      disabled={processing}
                    >
                      {processing ? (
                        <div className="flex items-center gap-3">
                           <Loader2 className="w-6 h-6 animate-spin" />
                           PROCESSING...
                        </div>
                      ) : (
                        "CONFIRM & ACTIVATE"
                      )}
                    </Button>

                    <div className="flex items-center justify-center gap-2 text-zinc-600">
                       <Lock className="w-3 h-3" />
                       <span className="text-[10px] font-bold uppercase tracking-widest">Encrypted Checkout</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Support Note */}
                <div className="mt-8 flex items-center gap-4 p-6 bg-white/[0.02] border border-white/5 rounded-3xl">
                   <AlertCircle className="w-5 h-5 text-zinc-700" />
                   <p className="text-xs text-zinc-600">
                      Need help? Contact our architectural support at support@udyame.ai
                   </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
