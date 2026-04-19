"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreditCard, Zap, Check, RotateCcw, ArrowRight } from "lucide-react";

const PLANS = [
  {
    name: "Free",
    price: "₹0",
    credits: "50",
    features: ["Standard AI Model", "Basic Business Plan", "Community Support"],
    current: true,
  },
  {
    name: "Pro",
    price: "₹999/mo",
    credits: "500",
    features: ["Advanced AI Models", "Full Document Suite", "Priority Generation", "Export to PDF/Docx"],
    current: false,
    recommended: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    credits: "Unlimited*",
    features: ["Custom Training", "Dedicated Support", "API Access", "Role-based Controls"],
    current: false,
  },
];

interface HistoryItem {
  id: number;
  type: string;
  amount: number;
  balance: number;
  date: string;
}

export default function BillingPage() {
  const [balance, setBalance] = useState("0");
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Mock data for now since we need to integrate real API
  useEffect(() => {
    // In a real app, we'd fetch from /api/v1/credits/balance and /api/v1/credits/history
    setBalance("42.50");
    setHistory([
      { id: 1, type: "AI_GENERATION", amount: -2.5, balance: 42.5, date: "2024-04-18" },
      { id: 2, type: "PLAN_ALLOC", amount: 50.0, balance: 50.0, date: "2024-04-01" },
    ]);
  }, []);

  return (
    <div className="container mx-auto py-10 px-4 space-y-12 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">Billing & Credits</h1>
          <p className="text-slate-500 mt-2 text-lg">Manage your subscription and monitor AI credit consumption.</p>
        </div>
        
        <Card className="w-full md:w-auto min-w-[280px] bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none shadow-xl">
          <CardHeader className="pb-2">
            <CardDescription className="text-indigo-100 font-medium">Available Balance</CardDescription>
            <CardTitle className="text-5xl font-extrabold flex items-baseline gap-1">
              {balance} <span className="text-xl font-normal opacity-80 underline decoration-indigo-300">Credits</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-indigo-100 text-sm">
              <RotateCcw className="w-4 h-4" /> 
              <span>Refills in 12 days</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="secondary" className="w-full font-bold shadow-lg hover:bg-white">
              Buy Credits <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {PLANS.map((plan) => (
          <Card key={plan.name} className={`relative flex flex-col ${plan.recommended ? 'border-indigo-500 shadow-2xl scale-105 z-10' : 'border-slate-200'}`}>
            {plan.recommended && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <Badge className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-1 text-xs font-bold uppercase tracking-wider uppercase">
                  Best Value
                </Badge>
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-slate-900 dark:text-white">{plan.price}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="flex items-center gap-2 mb-6 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
                <span className="text-sm font-semibold">{plan.credits} Credits Included</span>
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
                variant={plan.current ? "outline" : "default"} 
                className={`w-full ${plan.recommended ? 'bg-indigo-600 hover:bg-indigo-700' : ''}`}
                disabled={plan.current}
              >
                {plan.current ? "Current Plan" : "Upgrade Plan"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <RotateCcw className="w-6 h-6 text-indigo-500" />
          Usage History
        </h2>
        <Card className="overflow-hidden border-slate-200">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-800">
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Final Balance</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-medium">
                    <Badge variant={tx.amount > 0 ? "outline" : "secondary"} className={tx.amount > 0 ? "text-emerald-600 border-emerald-200 bg-emerald-50" : ""}>
                      {tx.type.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-500">{tx.date}</TableCell>
                  <TableCell className={tx.amount > 0 ? "text-emerald-600 font-bold" : "text-slate-900 dark:text-white font-medium"}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                  </TableCell>
                  <TableCell className="font-semibold">{tx.balance}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">Details</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
