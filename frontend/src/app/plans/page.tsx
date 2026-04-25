"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Check, Loader2, Star, TrendingUp, ShieldCheck, Globe, Rocket } from "lucide-react";
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

export default function PlansPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annually">("monthly");

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await apiClient.get("/plans/plans");
        setPlans(response.data);
      } catch (error) {
        console.error("Failed to fetch plans:", error);
        toast.error("Failed to load plans.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleBuyNow = (planId: string) => {
    router.push(`/billing?planId=${planId}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#05070a]">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-blue-500/20 border-b-blue-500 rounded-full mb-6"
          />
          <p className="text-zinc-500 font-mono tracking-widest text-xs uppercase">Fetching Strategic Tiers...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#05070a] text-white selection:bg-blue-500/30">
      <Navbar />
      
      <main className="flex-grow pt-32 pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-6"
            >
              <TrendingUp className="w-4 h-4" />
              Scale Your Vision
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-black tracking-tight mb-6 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent"
            >
              SELECT YOUR <br /> TRAJECTORY
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-zinc-500 text-xl max-w-2xl mx-auto"
            >
              From raw startup ideas to enterprise-scale expansion. 
              Choose the architectural foundation that fits your goals.
            </motion.p>

            {/* Billing Cycle Switcher */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-12 flex items-center justify-center gap-4"
            >
              <span className={`text-sm font-bold tracking-widest uppercase transition-colors ${billingCycle === 'monthly' ? 'text-white' : 'text-zinc-600'}`}>Monthly</span>
              <button 
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annually' : 'monthly')}
                className="w-16 h-8 bg-zinc-800 rounded-full relative p-1 transition-colors hover:bg-zinc-700"
              >
                <motion.div 
                  animate={{ x: billingCycle === 'monthly' ? 0 : 32 }}
                  className="w-6 h-6 bg-blue-500 rounded-full shadow-lg"
                />
              </button>
              <span className={`text-sm font-bold tracking-widest uppercase transition-colors ${billingCycle === 'annually' ? 'text-white' : 'text-zinc-600'}`}>Annually</span>
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 py-1 font-black">SAVE 20%</Badge>
            </motion.div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
            {plans.map((plan, i) => {
              const displayPrice = billingCycle === 'annually' ? Math.floor(plan.price * 12 * 0.8) : plan.price;
              
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                >
                  <Card className={`relative h-full bg-white/5 border-white/10 text-white flex flex-col transition-all duration-500 overflow-hidden hover:bg-white/[0.08] ${plan.is_recommended ? 'ring-2 ring-blue-500 shadow-[0_0_50px_rgba(59,130,246,0.15)] scale-105 z-10' : ''}`}>
                    {plan.is_recommended && (
                      <div className="absolute top-0 right-0 bg-blue-500 text-white px-6 py-1 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest">
                        High Value
                      </div>
                    )}
                    <CardHeader className="p-8 pb-4">
                      <CardTitle className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400 mb-6">{plan.name}</CardTitle>
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-black italic tracking-tighter">₹{displayPrice}</span>
                        <span className="text-zinc-500 text-sm font-bold uppercase tracking-widest">{billingCycle === 'monthly' ? '/mo' : '/yr'}</span>
                      </div>
                      <CardDescription className="text-zinc-500 mt-4 h-12">
                        {plan.name === 'Free' ? 'Perfect for solo founders exploring new concepts.' : plan.name === 'Pro' ? 'Ideal for growing businesses needing investor-ready docs.' : 'Comprehensive suite for scaling enterprises.'}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="px-8 pb-8 flex-grow">
                      <div className="flex items-center gap-3 mb-8 p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                         <Zap className="w-5 h-5 text-blue-400 fill-blue-400" />
                         <span className="text-sm font-black text-blue-300 italic uppercase tracking-wider">{plan.credits_included} Design Units</span>
                      </div>
                      <ul className="space-y-4">
                        {plan.features.map((feature: string) => (
                          <li key={feature} className="flex items-start gap-3 text-sm text-zinc-400">
                            <Check className="h-5 w-5 text-blue-500 flex-shrink-0" />
                            <span className="leading-tight">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>

                    <CardFooter className="p-8 pt-0 mt-auto">
                      <Button 
                        onClick={() => handleBuyNow(plan.id)}
                        disabled={user?.plan_id === plan.id}
                        className={`w-full h-14 rounded-2xl font-black text-lg transition-all ${user?.plan_id === plan.id ? 'bg-zinc-800 text-zinc-500 border-zinc-700' : plan.is_recommended ? 'bg-blue-600 hover:bg-blue-700 shadow-xl' : 'bg-white/10 hover:bg-white/20'}`}
                      >
                        {user?.plan_id === plan.id ? "CURRENT STAGE" : `ACTIVATE ${plan.name.toUpperCase()}`}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Detailed Comparison Table */}
          <div className="hidden md:block">
             <div className="text-center mb-12">
                <h2 className="text-3xl font-black tracking-tight mb-2">GRANULAR COMPARISON</h2>
                <div className="w-20 h-1 bg-blue-500 mx-auto rounded-full" />
             </div>
             
             <div className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden backdrop-blur-xl">
                <table className="w-full text-left">
                   <thead>
                      <tr className="border-b border-white/10">
                         <th className="p-8 text-sm font-black text-zinc-500 uppercase tracking-widest">Capabilities</th>
                         <th className="p-8 text-center font-bold">FREE</th>
                         <th className="p-8 text-center font-bold text-blue-500">PRO</th>
                         <th className="p-8 text-center font-bold">BUSINESS</th>
                      </tr>
                   </thead>
                   <tbody>
                      {[
                        { label: "AI Planning Depth", free: "Standard", pro: "Advanced", biz: "Custom" },
                        { label: "Document Formats", free: "Markdown", pro: "All (PDF, DOCX, XL)", biz: "All + API" },
                        { label: "Workspaces", free: "1", pro: "3", biz: "Unlimited" },
                        { label: "Self-Learning Engine", free: "Basic", pro: "Full Access", biz: "Priority Tuning" },
                        { label: "Support Tier", free: "Community", pro: "Priority", biz: "Dedicated Account" },
                      ].map((row, i) => (
                        <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                           <td className="p-8 text-zinc-400 font-medium">{row.label}</td>
                           <td className="p-8 text-center font-mono text-xs">{row.free}</td>
                           <td className="p-8 text-center font-mono text-xs text-blue-400 font-bold">{row.pro}</td>
                           <td className="p-8 text-center font-mono text-xs">{row.biz}</td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
