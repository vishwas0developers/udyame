"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import apiClient from "@/lib/api-client";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Rocket, FileText, BarChart3, Clock, Zap } from "lucide-react";

export default function DashboardPage() {
  const { user, setAuth, logout } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const savedToken = localStorage.getItem("auth_token");
    
    const fetchUser = async (authToken: string) => {
      try {
        const response = await apiClient.get("/auth/me", {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        const userData = response.data;
        setAuth(userData, authToken);
        
        // Redirection logic: If no plan or plan is inactive
        if (!userData.plan_id || !userData.subscription_plan?.is_active) {
          router.replace("/billing");
          return;
        }

        // Clean up URL if we had a token
        if (token) {
          router.replace("/dashboard");
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        toast.error("Authentication failed. Please login again.");
        logout();
        router.push("/?auth=login");
      }
    };

    // 1. Handle URL Token (Login redirection)
    if (token) {
      fetchUser(token);
      return;
    } 
    
    // 2. Handle existing session check
    if (!user) {
      if (savedToken) {
        fetchUser(savedToken);
      } else {
        router.push("/?auth=login");
      }
    } else {
      // 3. If already logged in, just check plan status
      if (!user.plan_id || !user.subscription_plan?.is_active) {
        router.replace("/billing");
      }
    }
  }, [router, searchParams, setAuth]); // Removed 'user' from dependencies to stop infinite loop

  if (!user || !user.subscription_plan?.is_active) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-zinc-600 font-medium">Authenticating your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 font-sans">
      <Navbar />

      <main className="flex-grow pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
            <div>
              <h2 className="text-4xl font-bold text-zinc-900 tracking-tight">
                Welcome back, {user.full_name?.split(' ')[0] || user.email.split('@')[0]}!
              </h2>
              <p className="text-zinc-500 text-lg mt-1">Let&apos;s build something incredible today.</p>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-zinc-200 shadow-sm">
              <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                <Zap className="h-6 w-6 fill-current" />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Available Credits</p>
                <p className="text-2xl font-black text-zinc-900">{user.credit_balance} <span className="text-sm font-medium text-zinc-500">Units</span></p>
              </div>
              <Link href="/billing" className="ml-4">
                <Button size="sm" variant="outline" className="border-indigo-100 text-indigo-600 hover:bg-indigo-50">Top up</Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Action Card: Planning */}
            <Card className="hover:shadow-xl transition-all duration-300 border-zinc-200 overflow-hidden group bg-white">
              <div className="h-2 bg-indigo-600 w-0 group-hover:w-full transition-all duration-500"></div>
              <CardHeader className="pt-8">
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Rocket className="h-6 w-6 text-indigo-600" />
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight">Business Architect</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-zinc-600 mb-8 leading-relaxed">
                  Our AI engine helps you articulate your business vision through structured planning and precise market data.
                </p>
                <Button render={(props: React.HTMLAttributes<HTMLAnchorElement>) => <Link {...props} href="/wizard" />} className="w-full h-12 bg-zinc-900 hover:bg-zinc-800 text-base font-bold shadow-lg shadow-zinc-200">
                  Launch Wizard
                </Button>
              </CardContent>
            </Card>

            {/* Action Card: Proposals */}
            <Card className="hover:shadow-xl transition-all duration-300 border-zinc-200 overflow-hidden group bg-white">
              <div className="h-2 bg-blue-600 w-0 group-hover:w-full transition-all duration-500"></div>
              <CardHeader className="pt-8">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight">Investor Proposals</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-zinc-600 mb-8 leading-relaxed">
                  Generate high-fidelity, professional pitch decks and funding proposals tailored to specific investor profiles.
                </p>
                <Button variant="outline" className="w-full h-12 text-base font-bold border-zinc-200 hover:bg-zinc-50">
                  View Templates
                </Button>
              </CardContent>
            </Card>

            {/* Action Card: Analytics */}
            <Card className="hover:shadow-xl transition-all duration-300 border-zinc-200 overflow-hidden group bg-zinc-50/50 grayscale-[0.5] opacity-80">
              <CardHeader className="pt-8">
                <div className="w-12 h-12 bg-zinc-200 rounded-xl flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-zinc-400" />
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight text-zinc-400">Market Intelligence</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-zinc-500 mb-8 leading-relaxed">
                  Real-time competitor tracking and industry sentiment analysis to refine your strategic edge.
                </p>
                <Button variant="ghost" className="w-full h-12 text-base font-bold text-zinc-400" disabled>
                  <Clock className="w-4 h-4 mr-2" /> Unlocking Soon
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}