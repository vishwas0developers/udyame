"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuthStore } from "@/store/useAuthStore";
import { 
  Rocket, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  FileText, 
  MessageSquare, 
  TrendingUp,
  BrainCircuit,
  CheckCircle2
} from "lucide-react";
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isAuthenticated) {
      router.push("/dashboard");
    }

    const fetchPlans = async () => {
      try {
        const response = await apiClient.get("/plans/plans");
        setPlans(response.data);
      } catch (err) {
        console.error("Plans fetch failed:", err);
      } finally {
        setPlansLoading(false);
      }
    };
    fetchPlans();
  }, [isAuthenticated, router]);

  if (!mounted || (mounted && isAuthenticated)) return null;

  return (
    <div className="flex flex-col min-h-screen bg-[#05070a] text-white selection:bg-blue-500/30 selection:text-white">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 px-6 overflow-hidden">
          {/* Animated Background Gradients */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 overflow-hidden">
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]" />
          </div>

          <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-10"
            >
              <BrainCircuit className="w-4 h-4" />
              The Future of Strategic Planning
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-5xl md:text-8xl font-black tracking-tight leading-[0.9] mb-8 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent"
            >
              ARCHITECT YOUR <br />
              <span className="text-blue-500">BUSINESS DESTINY</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg md:text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed mb-12"
            >
              Udyame AI is the world's first conversational architect for entrepreneurs. 
              Transform raw visions into investor-grade business models, strategic proposals, 
              and precise documentation in minutes, not months.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center gap-6"
            >
              <Link href="/register">
                <Button size="lg" className="h-16 px-10 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-[0_0_40px_rgba(37,99,235,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] group">
                  Build Your Plan
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button size="lg" variant="ghost" className="h-16 px-10 text-lg text-white/70 hover:text-white hover:bg-white/5 rounded-2xl font-semibold transition-all">
                  Watch Demo
                </Button>
              </Link>
            </motion.div>

            {/* Dashboard Preview Mockup */}
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="mt-20 w-full max-w-5xl relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-[32px] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-[#0a0c10] border border-white/10 rounded-[30px] overflow-hidden shadow-2xl aspect-video flex items-center justify-center">
                 <div className="text-zinc-500 flex flex-col items-center gap-4">
                    <Rocket className="w-12 h-12 animate-bounce text-blue-500" />
                    <span className="font-mono text-sm tracking-widest uppercase">System Interface Pre-v3.0</span>
                 </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-32 px-6 bg-[#0a0c10]/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-24">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
              <p className="text-zinc-500 text-lg">From ideation to execution in four strategic steps.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
              {[
                { icon: <MessageSquare />, title: "Discovery", desc: "Our AI Architect interviews you to extract your unique business vision." },
                { icon: <Zap />, title: "Intelligence", desc: "Udyame cross-references your ideas with industry data and market trends." },
                { icon: <BrainCircuit />, title: "Strategy", desc: "A comprehensive business plan and financial model is generated." },
                { icon: <FileText />, title: "Execution", desc: "Export high-fidelity documents for investors, partners, or banks." }
              ].map((step, i) => (
                <div key={i} className="relative text-center group">
                  <div className="w-20 h-20 mx-auto bg-blue-500/10 border border-blue-500/20 rounded-3xl flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform duration-300">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">{step.desc}</p>
                  {i < 3 && <div className="hidden md:block absolute top-10 left-[60%] w-[80%] border-t border-dashed border-white/10 -z-10" />}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-32 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">
                Enterprise-Grade <br /> 
                <span className="text-blue-500">Business Engineering</span>
              </h2>
              <div className="space-y-8">
                {[
                  { title: "Dynamic RAG Pipeline", desc: "Grounded responses based on millions of data points and approved question banks." },
                  { title: "Multi-Format Export", desc: "Professional PDF, DOCX, and Excel files with premium layouts and cover pages." },
                  { title: "Self-Learning Engine", desc: "Our AI evolves by identifying gaps in your business model and asking the right questions." }
                ].map((f, i) => (
                  <div key={i} className="flex gap-4">
                    <CheckCircle2 className="w-6 h-6 text-blue-500 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-xl mb-1">{f.title}</h4>
                      <p className="text-zinc-500">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-4 pt-12">
                  <div className="h-64 bg-white/5 rounded-3xl border border-white/10 p-6 flex flex-col justify-end">
                    <TrendingUp className="w-8 h-8 text-blue-500 mb-4" />
                    <span className="font-bold">Market Analysis</span>
                  </div>
                  <div className="h-48 bg-blue-600 rounded-3xl p-6 flex flex-col justify-end">
                    <ShieldCheck className="w-8 h-8 text-white mb-4" />
                    <span className="font-bold text-white">Risk Audit</span>
                  </div>
               </div>
               <div className="space-y-4">
                  <div className="h-48 bg-indigo-600 rounded-3xl p-6 flex flex-col justify-end">
                    <Zap className="w-8 h-8 text-white mb-4" />
                    <span className="font-bold text-white">Instant Gen</span>
                  </div>
                  <div className="h-64 bg-white/5 rounded-3xl border border-white/10 p-6 flex flex-col justify-end">
                    <BrainCircuit className="w-8 h-8 text-blue-500 mb-4" />
                    <span className="font-bold">AI Strategy</span>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-32 px-6 bg-[#0a0c10]/50 border-t border-white/5">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Investment for Success</h2>
              <p className="text-zinc-500">Choose the foundation that powers your next big move.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {plans.length > 0 ? plans.map((tier) => (
                  <Card key={tier.name} className={`relative bg-white/5 border-white/10 text-white flex flex-col transition-all duration-500 overflow-hidden group ${tier.is_recommended ? 'ring-2 ring-blue-500 shadow-[0_0_50px_rgba(59,130,246,0.15)] scale-105 z-10' : 'hover:bg-white/[0.08]'}`}>
                    {tier.is_recommended && (
                      <div className="absolute top-0 right-0 bg-blue-500 text-white px-6 py-1 rounded-bl-2xl text-xs font-black uppercase tracking-widest">
                        Recommended
                      </div>
                    )}
                    <CardHeader className="p-8">
                      <CardTitle className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400 mb-4">{tier.name}</CardTitle>
                      <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-black italic tracking-tighter">₹{tier.price}</span>
                        <span className="text-zinc-500 text-sm font-medium">/month</span>
                      </div>
                    </CardHeader>
                    <CardContent className="px-8 pb-8 flex-grow">
                      <ul className="space-y-4">
                        {tier.features.map((feature: string) => (
                          <li key={feature} className="flex items-start gap-3 text-sm text-zinc-400 group-hover:text-zinc-200 transition-colors">
                            <CheckCircle2 className="h-5 w-5 text-blue-500 flex-shrink-0" />
                            <span className="leading-tight">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <div className="p-8 pt-0 mt-auto">
                      <Link href="/billing">
                        <Button 
                          className={`w-full h-14 rounded-2xl font-bold text-lg transition-all ${tier.is_recommended ? 'bg-blue-600 hover:bg-blue-700 shadow-xl' : 'bg-white/10 hover:bg-white/20'}`}
                        >
                          Select {tier.name}
                        </Button>
                      </Link>
                    </div>
                  </Card>
                )) : (
                  <div className="col-span-3 flex justify-center py-20">
                     <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                  </div>
                )}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-40 px-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-blue-600/5 -z-10" />
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-black mb-10 tracking-tight leading-[0.9]">READY TO ARCHITECT <br /> THE FUTURE?</h2>
            <Link href="/register">
                <Button size="lg" className="h-20 px-12 text-2xl bg-white text-black hover:bg-blue-50 rounded-[2rem] font-black transition-all hover:scale-[1.05] shadow-[0_20px_40px_rgba(255,255,255,0.1)]">
                  GET STARTED FREE
                  <ArrowRight className="ml-3 h-8 w-8" />
                </Button>
            </Link>
            <p className="mt-10 text-zinc-500 font-medium">Join 5,000+ entrepreneurs building on Udyame.</p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
