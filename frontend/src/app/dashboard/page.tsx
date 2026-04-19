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
        setAuth(response.data, authToken);
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
      // Check if we have a token in localStorage but no user in store
      const savedToken = localStorage.getItem("auth_token");
      if (savedToken) {
        fetchUser(savedToken);
      } else {
        router.push("/login");
      }
    }
  }, [user, router, searchParams, setAuth]);

  if (!user) {
    return <div>Loading...</div>;
  }

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="bg-white border-b border-zinc-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-zinc-900">Udyame AI Dashboard</h1>
          <div className="flex items-center gap-4">
            <Badge variant="secondary">
              Credits: {user.credit_balance}
            </Badge>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-zinc-900 mb-2">
              Welcome back, {user.email}!
            </h2>
            <p className="text-zinc-600">
              Ready to plan your next business venture?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Start Business Planning</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Begin your entrepreneurial journey with our AI-powered business planning wizard.
                </p>
                <Button render={(props: React.HTMLAttributes<HTMLAnchorElement>) => <Link {...props} href="/wizard" />} className="w-full">
                  Start Planning
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Generate Proposals</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Create professional business proposals and win more clients.
                </p>
                <Button variant="outline" className="w-full" disabled>
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}