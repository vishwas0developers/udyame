"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Check, Loader2 } from "lucide-react";
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
      <div className="flex flex-col min-h-screen bg-zinc-50">
        <Navbar />
        <div className="flex-grow container mx-auto py-20 px-4 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
          <p className="text-slate-500 font-medium animate-pulse">Loading available plans...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50">
      <Navbar />
      
      <main className="flex-grow py-24 px-4">
        <div className="container mx-auto space-y-12 max-w-6xl text-center">
          <div className="max-w-2xl mx-auto space-y-4">
            <h1 className="text-5xl font-black tracking-tight text-slate-900">Choose Your Trajectory</h1>
            <p className="text-slate-500 text-xl">Select a growth plan that fits your business needs and scale instantly.</p>
          </div>

          <div className={`grid grid-cols-1 gap-8 pt-8 ${plans.length === 1 ? 'max-w-md mx-auto' : plans.length === 2 ? 'md:grid-cols-2 max-w-3xl mx-auto' : 'md:grid-cols-3'}`}>
            {plans.map((plan) => (
              <Card key={plan.id} className={`relative flex flex-col transition-all duration-300 ${plan.is_recommended ? 'border-indigo-500 shadow-2xl scale-105 z-20 overflow-visible' : 'border-slate-200 hover:border-indigo-200'}`}>
                {plan.is_recommended && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
                    <Badge className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 text-xs font-black uppercase tracking-widest shadow-xl border-2 border-white">
                      Popular choice
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-left">
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <CardDescription className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-slate-900">₹{plan.price}</span>
                    {plan.price > 0 && <span className="text-sm text-slate-500">/month</span>}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow text-left">
                  <div className="flex items-center gap-2 mb-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                    <Zap className="w-5 h-5 text-indigo-600 fill-indigo-600" />
                    <span className="text-sm font-bold text-indigo-900">{plan.credits_included} Design Units Included</span>
                  </div>
                  <ul className="space-y-4 text-sm">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                        <span className="text-slate-600 leading-tight">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={() => handleBuyNow(plan.id)}
                    variant={user?.plan_id === plan.id ? "outline" : "default"} 
                    className={`w-full py-7 text-lg font-black transition-all duration-300 ${plan.is_recommended && user?.plan_id !== plan.id ? 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200' : ''}`}
                    disabled={user?.plan_id === plan.id}
                  >
                    {user?.plan_id === plan.id ? "Active Plan" : "Buy Now"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
