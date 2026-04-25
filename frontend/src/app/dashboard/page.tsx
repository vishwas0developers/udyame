"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import apiClient from "@/lib/api-client";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { 
  Rocket, 
  FileText, 
  BarChart3, 
  Clock, 
  Zap, 
  Crown, 
  ArrowRight,
  TrendingUp,
  History,
  LayoutGrid,
  BrainCircuit
} from "lucide-react";

export default function DashboardPage() {
  const { user, setAuth, logout } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const fetchAttempted = useRef(false);

  useEffect(() => {
    if (fetchAttempted.current) return;

    const token = searchParams.get("token");
    const savedToken = localStorage.getItem("auth_token");

    if (token || (!user && savedToken)) {
      fetchAttempted.current = true;
      const authToken = (token || savedToken)!;

      apiClient
        .get("/auth/me", {
          headers: { Authorization: `Bearer ${authToken}` },
        })
        .then((response) => {
          setAuth(response.data, authToken);
          if (token) {
            router.replace("/dashboard");
            toast.success("Welcome to Udyame Architect!");
          }
        })
        .catch((error) => {
          console.error("Failed to fetch user:", error);
          logout();
          router.replace("/");
        });
      return;
    }

    if (!user) {
      router.replace("/");
    } else if (!user.plan_id) {
      // Use replace to avoid back-button loop
      router.replace("/plans");
    } else if (user.subscription_plan && !user.subscription_plan.is_active) {
      // User has a plan but it's not active (e.g. expired)
      router.replace("/plans");
    }
    // If user exists with an active plan, do nothing — the dashboard renders below.
  }, [user, router, searchParams, setAuth, logout]);

  // Derive loading from the user object — robust guard
  const hasLoadedUser = !!user;
  const hasPlan = !!user?.plan_id;
  const isPlanActive = !!user?.subscription_plan?.is_active;

  if (!hasLoadedUser || !hasPlan || !isPlanActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#05070a]">
        <div className="flex flex-col items-center gap-6">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-blue-500/20 border-b-blue-500 rounded-full"
          />
          <p className="text-zinc-500 font-mono tracking-widest text-xs uppercase">Initializing System...</p>
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#05070a] text-white selection:bg-blue-500/30">
      <Navbar />

      <main className="flex-grow pt-28 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-16"
          >
            <div>
              <div className="flex items-center gap-3 mb-2">
                 <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 px-3 py-1 font-bold tracking-widest uppercase text-[10px]">
                   {user.subscription_plan?.name} Member
                 </Badge>
                 <span className="text-zinc-700">/</span>
                 <span className="text-zinc-500 text-sm font-medium">Workspace Active</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none mb-3">
                Welcome, {user.full_name?.split(' ')[0] || user.email.split('@')[0]}
              </h1>
              <p className="text-zinc-500 text-lg">Your strategic pipeline is primed and ready.</p>
            </div>
            
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-8 p-8 bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-2xl min-w-[320px]"
            >
              <div className="flex flex-col flex-grow">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Available Credits</span>
                  <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest">Active</span>
                </div>
                <div className="flex items-baseline gap-2 mb-3">
                   <span className="text-4xl font-black text-blue-500 italic tracking-tighter">{user.credit_balance}</span>
                   <span className="text-zinc-400 text-sm font-bold uppercase tracking-wider">Units</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                   <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (user.credit_balance / (user.subscription_plan?.credits_included || 100)) * 100)}%` }}
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-500" 
                   />
                </div>
                <div className="flex justify-between items-center mt-3">
                  <p className="text-[10px] text-zinc-600 font-medium">Refill: 1st of every month</p>
                  <Link href="/billing" className="text-[10px] text-blue-500 font-bold hover:underline">Top Up</Link>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Quick Stats / Overview */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12"
          >
             {[
               { icon: <History className="w-4 h-4"/>, label: "Last Session", val: "2 hours ago" },
               { icon: <FileText className="w-4 h-4"/>, label: "Drafts", val: "3 Active" },
               { icon: <TrendingUp className="w-4 h-4"/>, label: "Market Edge", val: "+14% Index" },
               { icon: <LayoutGrid className="w-4 h-4"/>, label: "Workspaces", val: "1 of 3 Used" },
             ].map((stat, i) => (
               <motion.div key={i} variants={itemVariants} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
                  <div className="p-2 bg-white/5 rounded-lg text-blue-400">{stat.icon}</div>
                  <div>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{stat.label}</p>
                    <p className="text-sm font-bold text-white">{stat.val}</p>
                  </div>
               </motion.div>
             ))}
          </motion.div>

          {/* Main Action Grid */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {/* Business Architect */}
            <motion.div variants={itemVariants}>
              <Card className="group relative bg-white/5 border-white/10 text-white overflow-hidden rounded-[2.5rem] h-full hover:border-blue-500/50 transition-all duration-500">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-100 transition-opacity">
                   <Rocket className="w-12 h-12 text-blue-500" />
                </div>
                <CardHeader className="p-10 pb-4">
                   <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 text-blue-500 group-hover:scale-110 transition-transform">
                      <BrainCircuit className="w-8 h-8" />
                   </div>
                   <CardTitle className="text-3xl font-black tracking-tight mb-2">Business Architect</CardTitle>
                   <p className="text-zinc-500 leading-relaxed">
                     Our iterative AI engine helps you articulate your business vision through structured expert dialogue.
                   </p>
                </CardHeader>
                <CardContent className="p-10 pt-0 mt-8">
                   <Link href="/wizard">
                     <Button className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-lg font-bold rounded-2xl group transition-all shadow-xl">
                        Launch System
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                     </Button>
                   </Link>
                </CardContent>
              </Card>
            </motion.div>

            {/* Strategic Proposals */}
            <motion.div variants={itemVariants}>
              <Card className="group relative bg-white/5 border-white/10 text-white overflow-hidden rounded-[2.5rem] h-full hover:border-indigo-500/50 transition-all duration-500">
                <CardHeader className="p-10 pb-4">
                   <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 text-indigo-400 group-hover:scale-110 transition-transform">
                      <FileText className="w-8 h-8" />
                   </div>
                   <CardTitle className="text-3xl font-black tracking-tight mb-2">Strategic Proposals</CardTitle>
                   <p className="text-zinc-500 leading-relaxed">
                     Generate high-fidelity, professional pitch decks and funding proposals tailored to specific market demands.
                   </p>
                </CardHeader>
                <CardContent className="p-10 pt-0 mt-8">
                   <Button variant="outline" className="w-full h-16 text-lg font-bold rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-white">
                      Browse Templates
                   </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Locked Feature: Market Intelligence */}
            <motion.div variants={itemVariants}>
              <Card className="relative bg-white/[0.02] border-white/5 text-zinc-600 overflow-hidden rounded-[2.5rem] h-full">
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#05070a]/60 backdrop-blur-[2px] z-10">
                   <div className="p-4 bg-zinc-900 rounded-full mb-4">
                      <Clock className="w-8 h-8 text-zinc-700" />
                   </div>
                   <span className="font-black tracking-[0.3em] uppercase text-xs text-zinc-700">Unlocking Soon</span>
                </div>
                <CardHeader className="p-10 pb-4">
                   <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center mb-6">
                      <BarChart3 className="w-8 h-8 text-zinc-800" />
                   </div>
                   <CardTitle className="text-3xl font-black tracking-tight mb-2">Market Intelligence</CardTitle>
                   <p className="text-zinc-800 leading-relaxed">
                     Real-time competitor tracking and industry sentiment analysis to refine your strategic edge.
                   </p>
                </CardHeader>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}