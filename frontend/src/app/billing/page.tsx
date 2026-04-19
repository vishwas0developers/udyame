"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Zap, Check, RotateCcw, ArrowRight, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import apiClient from "@/lib/api-client";
import { toast } from "sonner";

interface Plan {
  id: string;
  name: string;
  price: number;
  credits_included: number;
  features: string[];
  is_active: boolean;
  is_recommended: boolean;
}

interface HistoryItem {
  id: string;
  transaction_type: string;
  amount: number;
  balance_after: number;
  created_at: string;
}

export default function BillingPage() {
  const { user, setAuth } = useAuthStore();
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectingPlan, setSelectingPlan] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [plansRes, historyRes] = await Promise.all([
          apiClient.get("/plans/plans"),
          apiClient.get("/credits/history")
        ]);
        setPlans(plansRes.data);
        setHistory(historyRes.data.transactions || []);
      } catch (error) {
        console.error("Failed to fetch billing data:", error);
        toast.error("Failed to load plans. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSelectPlan = async (planId: string) => {
    setSelectingPlan(planId);
    try {
      await apiClient.post(`/plans/me/plan/${planId}`);
      toast.success("Subscribed successfully!");
      
      // Refresh user data to update plan info in store
      const userRes = await apiClient.get("/auth/me");
      const token = localStorage.getItem("auth_token") || "";
      setAuth(userRes.data, token);
      
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to select plan:", error);
      toast.error("Failed to update subscription.");
    } finally {
      setSelectingPlan(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-20 px-4 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="text-slate-500 font-medium">Brewing your options...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 space-y-12 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">Choose Your Plan</h1>
          <p className="text-slate-500 mt-2 text-lg">Select a growth trajectory that fits your business needs.</p>
        </div>
        
        <Card className="w-full md:w-auto min-w-[280px] bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none shadow-xl">
          <CardHeader className="pb-2">
            <CardDescription className="text-indigo-100 font-medium">Your Balance</CardDescription>
            <CardTitle className="text-5xl font-extrabold flex items-baseline gap-1">
              {user?.credit_balance || 0} <span className="text-xl font-normal opacity-80 underline decoration-indigo-300">Credits</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-indigo-100 text-sm">
              <Zap className="w-4 h-4 fill-amber-400 text-amber-400" /> 
              <span>Current: {user?.subscription_plan?.name || 'No Plan'}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className={`grid grid-cols-1 gap-8 ${plans.length === 1 ? 'max-w-md mx-auto' : plans.length === 2 ? 'md:grid-cols-2 max-w-3xl mx-auto' : 'md:grid-cols-3'}`}>
        {plans.map((plan) => (
          <Card key={plan.id} className={`relative flex flex-col transition-all duration-300 ${plan.is_recommended ? 'border-indigo-500 shadow-2xl scale-105 z-10' : 'border-slate-200 hover:border-indigo-200'}`}>
            {plan.is_recommended && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <Badge className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-1 text-xs font-bold uppercase tracking-wider">
                  Popular choice
                </Badge>
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-slate-900 dark:text-white">₹{plan.price}</span>
                {plan.price > 0 && <span className="text-sm text-slate-500">/mo</span>}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="flex items-center gap-2 mb-6 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
                <span className="text-sm font-semibold">{plan.credits_included} Credits Included</span>
              </div>
              <ul className="space-y-4 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span className="text-slate-600 dark:text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => handleSelectPlan(plan.id)}
                variant={user?.plan_id === plan.id ? "outline" : "default"} 
                className={`w-full ${plan.is_recommended && user?.plan_id !== plan.id ? 'bg-indigo-600 hover:bg-indigo-700' : ''}`}
                disabled={user?.plan_id === plan.id || (selectingPlan === plan.id)}
              >
                {selectingPlan === plan.id ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {user?.plan_id === plan.id ? "Your Active Plan" : (plan.price === 0 ? "Get Started" : "Upgrade Now")}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {history.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <RotateCcw className="w-6 h-6 text-indigo-500" />
            Transaction History
          </h2>
          <Card className="overflow-hidden border-slate-200">
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-slate-800">
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Change</TableHead>
                  <TableHead>Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="font-medium">
                      <Badge variant={tx.amount > 0 ? "outline" : "secondary"} className={tx.amount > 0 ? "text-emerald-600 border-emerald-200 bg-emerald-50" : ""}>
                        {tx.transaction_type.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-500">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className={tx.amount > 0 ? "text-emerald-600 font-bold" : "text-slate-900 dark:text-white font-medium"}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount}
                    </TableCell>
                    <TableCell className="font-semibold">{tx.balance_after}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}
    </div>
  );
}
