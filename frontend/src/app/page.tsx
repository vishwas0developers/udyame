"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuthStore } from "@/store/useAuthStore";
import { MessageSquare, FileText, LayoutDashboard, CheckCircle2, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import apiClient from "@/lib/api-client";

interface Plan {
  id: string;
  name: string;
  price: number;
  credits_included: number;
  features: string[];
  is_active: boolean;
  is_recommended: boolean;
}

export default function LandingPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }

    const fetchPlans = async () => {
      try {
        const response = await apiClient.get("/plans/plans");
        setPlans(response.data);
      } catch (err) {
        console.error("Plans fetch failed:", err);
        setError("Unable to load latest plans. Please refresh.");
      } finally {
        setPlansLoading(false);
      }
    };
    fetchPlans();
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar />

      <main className="flex-grow pt-16">
        {/* Hero Section */}
        <section className="relative py-24 px-4 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          </div>
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold uppercase tracking-wider">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              Built for Modern Entrepreneurs
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-zinc-900 tracking-tight leading-[1.1]">
              Architect Your <span className="text-indigo-600 underline decoration-indigo-200 underline-offset-8">Business Destiny</span>
            </h1>
            <p className="text-xl text-zinc-600 max-w-2xl mx-auto leading-relaxed">
              Transform raw ideas into high-fidelity business plans and strategic proposals. Driven by intelligence, polished for investors.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/register">
                <Button size="lg" className="h-12 px-8 text-base bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 group">
                  Start Planning Free
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" render={(props: React.HTMLAttributes<HTMLAnchorElement>) => <a {...props} href="#features" />} className="h-12 px-8 text-base bg-white">
                Explore Capabilities
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-white border-y border-zinc-200 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl font-bold text-zinc-900 tracking-tight">Enterprise-Grade Planning Suite</h2>
              <p className="text-zinc-600 max-w-2xl mx-auto">Automate the heavy lifting of business strategy and documentation.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border-zinc-200 shadow-sm hover:shadow-lg transition-all duration-300 border-t-4 border-t-indigo-500">
                <CardHeader>
                  <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4">
                    <MessageSquare className="h-6 w-6 text-indigo-600" />
                  </div>
                  <CardTitle>Conversational Architect</CardTitle>
                  <CardDescription>
                    Iterative AI partnership that refines your business model through structured, expert-level dialogue.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="border-zinc-200 shadow-sm hover:shadow-lg transition-all duration-300 border-t-4 border-t-blue-500">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle>Strategic Proposals</CardTitle>
                  <CardDescription>
                    Export investor-ready proposals tailored with precision to your specific market and funding requirements.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="border-zinc-200 shadow-sm hover:shadow-lg transition-all duration-300 border-t-4 border-t-emerald-500">
                <CardHeader>
                  <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-4">
                    <LayoutDashboard className="h-6 w-6 text-emerald-600" />
                  </div>
                  <CardTitle>Intelligent Vault</CardTitle>
                  <CardDescription>
                    Version-controlled document management system that keeps all your AI iterations organized and secure.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 px-4 bg-zinc-50 border-b border-zinc-200">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl font-bold text-zinc-900 tracking-tight">Flexible Plans for Every Stage</h2>
              <p className="text-zinc-600">Choose the foundation that powers your next big move.</p>
            </div>
            
            {plansLoading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <p className="text-zinc-500 text-sm animate-pulse">Synchronizing architectural plans...</p>
              </div>
            ) : error ? (
              <div className="max-w-md mx-auto p-6 bg-white rounded-xl border border-zinc-200 text-center shadow-sm">
                <p className="text-red-600 font-medium mb-4">{error}</p>
                <Button onClick={() => window.location.reload()} variant="outline">Try Again</Button>
              </div>
            ) : (
              <div className={`grid grid-cols-1 gap-8 ${plans.length === 1 ? 'max-w-md mx-auto' : plans.length === 2 ? 'md:grid-cols-2 max-w-4xl mx-auto' : 'md:grid-cols-3'}`}>
                {plans.map((tier) => (
                  <Card key={tier.name} className={`relative border-zinc-200 flex flex-col transition-all duration-300 ${tier.is_recommended ? 'ring-2 ring-indigo-600 shadow-2xl scale-105 z-10' : 'shadow-sm hover:shadow-md'}`}>
                    {tier.is_recommended && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                        Recommended
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-sm font-bold uppercase tracking-widest text-zinc-500">{tier.name}</CardTitle>
                      <div className="flex items-baseline gap-1 mt-4">
                        <span className="text-4xl font-extrabold text-zinc-900">₹{tier.price}</span>
                        <span className="text-zinc-500 text-sm">/mo</span>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <ul className="space-y-3">
                        {tier.features.map((feature: string) => (
                          <li key={feature} className="flex items-start gap-3 text-sm text-zinc-600">
                            <CheckCircle2 className="h-5 w-5 text-indigo-500 flex-shrink-0" />
                            <span className="leading-tight">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <div className="p-6 pt-0">
                      <Link href="/billing">
                        <Button 
                          className={`w-full h-11 font-bold ${tier.is_recommended ? 'bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100' : 'bg-zinc-900 hover:bg-zinc-800'}`}
                        >
                          Select {tier.name}
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            )}
            
            <div className="mt-12 text-center">
              <Link href="/billing" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center justify-center gap-2">
                Detailed comparison & features <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
