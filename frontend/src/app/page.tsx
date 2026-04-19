"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuthStore } from "@/store/useAuthStore";
import { Bot, MessageSquare, FileText, LayoutDashboard, CheckCircle2, ArrowRight } from "lucide-react";
import { LoginModal } from "@/components/LoginModal";

export default function LandingPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }

    // Handle deep-linking to auth modals via URL query params
    const searchParams = new URLSearchParams(window.location.search);
    const authParam = searchParams.get("auth");
    if (authParam === "login") {
      setAuthMode("login");
      setIsLoginModalOpen(true);
    } else if (authParam === "signup") {
      setAuthMode("signup");
      setIsLoginModalOpen(true);
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return null; // Prevent flicker before redirect
  }

  interface PricingTier {
    name: string;
    price: string;
    description: string;
    features: string[];
    buttonText: string;
    href: string;
    variant: "default" | "outline";
    popular?: boolean;
  }

  const pricingTiers: PricingTier[] = [
    {
      name: "FREE",
      price: "₹0",
      description: "Basic access for individuals",
      features: ["Conversational Planning", "1 Business Plan/mo", "Community Support"],
      buttonText: "Get Started",
      href: "/register",
      variant: "outline" as const,
    },
    {
      name: "PRO",
      price: "₹999",
      description: "Advanced features for professionals",
      features: ["Everything in FREE", "Unlimited Planning", "Priority AI Responses", "PDF Export"],
      buttonText: "Go Pro",
      href: "/register",
      variant: "default" as const,
    },
    {
      name: "BUSINESS",
      price: "₹2999",
      description: "Comprehensive tools for growing teams",
      features: ["Everything in PRO", "Team Collaboration", "Custom Templates", "Advanced Analytics"],
      buttonText: "Scale Up",
      href: "/register",
      variant: "default" as const,
      popular: true,
    },
    {
      name: "ENTERPRISE",
      price: "Custom",
      description: "Custom solutions for large organizations",
      features: ["Everything in BUSINESS", "Dedicated Account Manager", "SSO & Security", "API Access"],
      buttonText: "Contact Us",
      href: "mailto:sales@udyame.ai",
      variant: "outline" as const,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-1.5 rounded-lg">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-zinc-900 tracking-tight">Udyame AI</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-zinc-600 hover:text-indigo-600 transition-colors">Features</a>
              <a href="#pricing" className="text-sm font-medium text-zinc-600 hover:text-indigo-600 transition-colors">Pricing</a>
              <button 
                onClick={() => {
                  setAuthMode("login");
                  setIsLoginModalOpen(true);
                }}
                className="text-sm font-medium text-zinc-600 hover:text-indigo-600 transition-colors"
              >
                Login
              </button>
              <Button 
                onClick={() => {
                  setAuthMode("signup");
                  setIsLoginModalOpen(true);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-200"
              >
                Try Now
              </Button>
            </div>
            <div className="md:hidden">
              <Button variant="ghost" size="icon" className="text-zinc-600">
                <LayoutDashboard className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

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
              Now in Public Beta
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-zinc-900 tracking-tight leading-[1.1]">
              Your AI <span className="text-indigo-600">Business Architect</span>
            </h1>
            <p className="text-xl text-zinc-600 max-w-2xl mx-auto leading-relaxed">
              Transform your business ideas into professional-grade plans and proposals with our conversational AI. Built for modern entrepreneurs.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button 
                size="lg" 
                onClick={() => {
                  setAuthMode("signup");
                  setIsLoginModalOpen(true);
                }}
                className="h-12 px-8 text-base bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 group"
              >
                <>
                  Try for Free
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              </Button>
              <Button size="lg" variant="outline" render={(props: React.HTMLAttributes<HTMLAnchorElement>) => <a {...props} href="#features" />} className="h-12 px-8 text-base bg-white">
                    Explore Features
                  </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-white border-y border-zinc-200 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl font-bold text-zinc-900">Built for Professional Success</h2>
              <p className="text-zinc-600 max-w-2xl mx-auto">Our platform automates the most complex parts of business planning, so you can focus on execution.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4">
                    <MessageSquare className="h-6 w-6 text-indigo-600" />
                  </div>
                  <CardTitle>Conversational Planning</CardTitle>
                  <CardDescription>
                    Interactive AI-driven planning process that guides you through every step of building your business model.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle>Proposal Generation</CardTitle>
                  <CardDescription>
                    Generate automated, professional proposals tailored to your specific industry and client needs in seconds.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-4">
                    <LayoutDashboard className="h-6 w-6 text-emerald-600" />
                  </div>
                  <CardTitle>Document Management</CardTitle>
                  <CardDescription>
                    A centralized vault to organize, handle, and version-control all your critical business documents and AI outputs.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 px-4 bg-zinc-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl font-bold text-zinc-900">Simple, Transparent Pricing</h2>
              <p className="text-zinc-600">Choose the plan that fits your current business stage.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {pricingTiers.map((tier) => (
                <Card key={tier.name} className={`relative border-zinc-200 flex flex-col ${tier.popular ? 'ring-2 ring-indigo-600 shadow-xl scale-105 z-10' : 'shadow-sm'}`}>
                  {tier.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                      Most Popular
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-sm font-bold uppercase tracking-widest text-zinc-500">{tier.name}</CardTitle>
                    <div className="flex items-baseline gap-1 mt-4">
                      <span className="text-4xl font-extrabold text-zinc-900">{tier.price}</span>
                      {tier.price !== "Custom" && <span className="text-zinc-500 text-sm">/mo</span>}
                    </div>
                    <CardDescription className="mt-2">{tier.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <ul className="space-y-3">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3 text-sm text-zinc-600">
                          <CheckCircle2 className="h-5 w-5 text-indigo-500 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <div className="p-6 pt-0">
                    <Button 
                      variant={tier.variant} 
                      onClick={() => {
                        setAuthMode("signup");
                        setIsLoginModalOpen(true);
                      }}
                      className={`w-full h-11 ${tier.popular ? 'bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100' : ''}`}
                    >
                      {tier.buttonText}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-zinc-200 py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-indigo-600" />
            <span className="text-lg font-bold text-zinc-900">Udyame AI</span>
          </div>
          <div className="flex items-center gap-8 text-sm text-zinc-500 font-medium">
            <a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Contact</a>
          </div>
          <p className="text-sm text-zinc-400">
            © {new Date().getFullYear()} Udyame AI. All rights reserved.
          </p>
        </div>
      </footer>

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        initialMode={authMode}
      />
    </div>
  );
}
