"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Check, Loader2, ArrowLeft, CreditCard } from "lucide-react";
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
  const planId = searchParams.get("token") || searchParams.get("planId");
  
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!planId) {
      router.push("/plans");
      return;
    }

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
        console.error("Failed to fetch plan:", error);
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
      await apiClient.post(`/plans/me/plan/${plan.id}`);
      toast.success(`Successfully subscribed to ${plan.name}!`);
      
      // Refresh user data
      const userRes = await apiClient.get("/auth/me");
      const token = localStorage.getItem("auth_token") || "";
      setAuth(userRes.data, token);
      
      router.push("/dashboard");
    } catch (error) {
      console.error("Purchase failed:", error);
      toast.error("Failed to complete purchase. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading || !plan) {
    return (
      <div className="flex flex-col min-h-screen bg-zinc-50">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50">
      <Navbar />
      
      <main className="flex-grow py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <Button 
            variant="ghost" 
            onClick={() => router.push("/plans")}
            className="mb-8 hover:bg-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Plans
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Order Summary */}
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-slate-900">Order Summary</h2>
              <Card className="border-slate-200 shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50 border-b border-slate-100">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    {plan.is_recommended && <Badge className="bg-indigo-600">Best Value</Badge>}
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex justify-between text-lg font-medium">
                    <span className="text-slate-500">Monthly Subscription</span>
                    <span className="text-slate-900 font-bold">₹{plan.price}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Credits Included</span>
                    <span className="text-indigo-600 font-bold">+{plan.credits_included} Units</span>
                  </div>
                  <div className="pt-4 border-t border-dashed border-slate-200">
                    <div className="flex justify-between text-2xl font-black">
                      <span>Total Due</span>
                      <span className="text-indigo-600">₹{plan.price}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 italic text-right">Taxes included where applicable</p>
                  </div>
                </CardContent>
              </Card>

              <div className="p-6 bg-white rounded-2xl border border-slate-200">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Check className="w-5 h-5 text-emerald-500" /> What&apos;s Included:
                </h3>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="text-sm text-slate-600 flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Payment & Checkout */}
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-slate-900">Checkout</h2>
              <Card className="border-indigo-100 shadow-xl shadow-indigo-100/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-indigo-600">
                    <CreditCard className="w-5 h-5" /> Payment Details
                  </CardTitle>
                  <CardDescription>Securely complete your subscription</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 border-dashed text-center">
                    <p className="text-slate-500 text-sm italic">
                      Payment gateway integration (Stripe/Razorpay) would appear here.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="terms" className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" defaultChecked />
                      <label htmlFor="terms" className="text-xs text-slate-500 leading-tight">
                        I agree to the Terms of Service and Privacy Policy. My subscription will renew automatically.
                      </label>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full py-8 text-lg font-black bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                    onClick={handleConfirmPurchase}
                    disabled={processing}
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      "Confirm & Subscribe"
                    )}
                  </Button>
                </CardFooter>
              </Card>

              <div className="flex items-center justify-center gap-6 opacity-40 grayscale">
                {/* Placeholder logos for trust */}
                <div className="text-xs font-bold tracking-widest text-slate-500 uppercase">Secure Payment</div>
                <div className="w-12 h-6 bg-slate-200 rounded" />
                <div className="w-12 h-6 bg-slate-200 rounded" />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
