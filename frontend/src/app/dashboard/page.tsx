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

export default function DashboardPage() {
  const { user, setAuth, logout } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    
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

        // Clean up URL
        router.replace("/dashboard");
      } catch (error) {
        console.error("Failed to fetch user:", error);
        toast.error("Authentication failed. Please login again.");
        router.push("/login");
      }
    };

    if (token) {
      fetchUser(token);
    } else if (!user) {
      const savedToken = localStorage.getItem("auth_token");
      if (savedToken) {
        fetchUser(savedToken);
      } else {
        router.push("/login");
      }
    } else {
      // For existing user session, verify plan
      if (!user.plan_id || !user.subscription_plan?.is_active) {
        router.replace("/billing");
      }
    }
  }, [user, router, searchParams, setAuth]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900"></div>
          <p className="text-zinc-600 font-medium">Loading your space...</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="bg-white border-b border-zinc-200 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-indigo-600">
            <div className="bg-indigo-600 text-white p-1 rounded">
              <span className="font-bold text-lg">U</span>
            </div>
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">udyame.ai</h1>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-100 px-3 py-1">
              {user.subscription_plan?.name} • {user.credit_balance} Credits
            </Badge>
            <Button variant="ghost" className="text-zinc-600 hover:text-red-600 hover:bg-red-50" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="p-8 max-w-7xl mx-auto">
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-zinc-900 mb-2">
            Welcome back, {user.email.split('@')[0]}!
          </h2>
          <p className="text-zinc-500 text-lg">Let&apos;s build something incredible today.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="hover:shadow-lg transition-all duration-300 border-zinc-200 overflow-hidden group">
            <div className="h-2 bg-indigo-600 w-0 group-hover:w-full transition-all duration-500"></div>
            <CardHeader className="pt-6">
              <CardTitle className="flex items-center gap-2">
                Business Planning
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-zinc-600 mb-6 leading-relaxed">
                Our AI wizard helps you articulate your business vision through structured planning and market insights.
              </p>
              <Button render={(props: React.HTMLAttributes<HTMLAnchorElement>) => <Link {...props} href="/wizard" />} className="w-full bg-zinc-900 hover:bg-zinc-800">
                Launch Planning Wizard
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 border-zinc-200 opacity-75 grayscale-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-zinc-400">
                Market Analysis
                <Badge variant="outline" className="text-[10px] uppercase font-bold py-0 h-4">Beta</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-zinc-500 mb-6 leading-relaxed">
                Deep dive into your industry trends and competitor landscape with our advanced research engine.
              </p>
              <Button variant="outline" className="w-full" disabled>
                Unlocking Soon
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}