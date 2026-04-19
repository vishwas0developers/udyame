"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Dialog, 
  DialogContent 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/useAuthStore";
import apiClient from "@/lib/api-client";
import { toast } from "sonner";
import { Bot, Eye, EyeOff, CheckCircle2 } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "signup";
}

export function LoginModal({ isOpen, onClose, initialMode = "login" }: LoginModalProps) {
  const [mode, setMode] = useState<"login" | "signup" | "magic-link">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [isMagicLinkSent, setIsMagicLinkSent] = useState(false);
  
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  // Sync mode with initialMode when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setIsVerificationSent(false);
      setIsMagicLinkSent(false);
    }
  }, [isOpen, initialMode]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "login") {
        const formData = new FormData();
        formData.append("username", email);
        formData.append("password", password);

        const response = await apiClient.post("/auth/login", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        const { access_token } = response.data;
        // In real app, fetch profile after login
        setAuth(
          { id: "mock-id", email, subscription_tier: "USER", credit_balance: 50 },
          access_token
        );

        toast.success("Logged in successfully!");
        onClose();
        router.push("/dashboard");
      } else if (mode === "signup") {
        await apiClient.post("/auth/register", { email, password, full_name: email.split("@")[0] });
        setIsVerificationSent(true);
        toast.success("Verification email sent!");
      } else if (mode === "magic-link") {
        await apiClient.post(`/auth/magic-link?email=${encodeURIComponent(email)}`);
        setIsMagicLinkSent(true);
        toast.success("Magic login link sent!");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.detail || `${mode === "login" ? "Login" : "Registration"} failed`);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/auth/google/login");
      window.location.href = response.data.url;
    } catch (error: any) {
      toast.error("Google login failed");
      setLoading(false);
    }
  };

  if (isVerificationSent || isMagicLinkSent) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-[420px] p-0 overflow-hidden border-none bg-transparent shadow-none ring-0 focus:outline-none">
          <main className="w-full bg-[#ffffff]/80 backdrop-blur-xl rounded-[1.5rem] p-10 border border-white/40 shadow-[0_20px_40px_rgba(11,28,48,0.06)] flex flex-col items-center text-center">
            <div className="bg-emerald-50 p-4 rounded-full mb-6">
              <CheckCircle2 className="h-12 w-12 text-emerald-500" />
            </div>
            <h1 className="font-semibold text-2xl tracking-tight text-[#0b1c30] mb-2">Check your email</h1>
            <p className="text-sm text-[#434655] font-medium tracking-wide mb-8">
              We've sent a {isMagicLinkSent ? "magic login link" : "verification link"} to <span className="text-[#004ac6] font-bold">{email}</span>.
            </p>
            <Button 
              onClick={onClose}
              className="w-full rounded-xl bg-[#0b1c30] text-white h-11 hover:bg-[#213145]"
            >
              Done
            </Button>
          </main>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[420px] p-0 overflow-hidden border-none bg-transparent shadow-none ring-0 focus:outline-none">
        <main className="w-full bg-[#ffffff]/80 backdrop-blur-xl rounded-[1.5rem] p-10 border border-white/40 shadow-[0_20px_40px_rgba(11,28,48,0.06)] flex flex-col items-center">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2 mb-8">
            <Bot className="text-[#004ac6] h-8 w-8" />
            <span className="font-bold text-xl tracking-tight text-[#0b1c30]">Udyame AI</span>
          </div>

          {/* Headers */}
          <div className="text-center w-full mb-8">
            <h1 className="font-semibold text-2xl tracking-tight text-[#0b1c30] mb-2">
              {mode === "login" ? "Welcome Back" : mode === "signup" ? "Create Account" : "Magic Link Login"}
            </h1>
            <p className="text-sm text-[#434655] font-medium tracking-wide">
              {mode === "login" ? "Sign in to manage your business ventures" : mode === "signup" ? "Join Udyame to architect your business" : "Sign in securely without a password"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleAuth} className="w-full flex flex-col gap-5">
            <div className="flex flex-col gap-2 w-full">
              <label className="text-sm font-medium tracking-wide text-[#0b1c30]" htmlFor="email">Email Address</label>
              <Input 
                className="h-[44px] w-full rounded-xl bg-[#ffffff] border border-[#c3c6d7]/40 text-[#0b1c30] text-sm px-4 focus:ring-2 focus:ring-[#004ac6]/40 focus:border-[#004ac6]/40 transition-colors outline-none placeholder:text-[#737686]" 
                id="email" 
                type="email"
                placeholder="name@company.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {mode !== "magic-link" && (
              <div className="flex flex-col gap-2 w-full mb-2">
                <div className="flex justify-between items-center w-full">
                  <label className="text-sm font-medium tracking-wide text-[#0b1c30]" htmlFor="password">Password</label>
                  {mode === "login" && (
                    <button type="button" className="text-xs font-medium text-[#004ac6] hover:text-[#2563eb] transition-colors">
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative w-full">
                  <Input 
                    className="h-[44px] w-full rounded-xl bg-[#ffffff] border border-[#c3c6d7]/40 text-[#0b1c30] text-sm px-4 pr-10 focus:ring-2 focus:ring-[#004ac6]/40 focus:border-[#004ac6]/40 transition-colors outline-none placeholder:text-[#737686]" 
                    id="password" 
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737686] hover:text-[#0b1c30] transition-colors flex items-center justify-center" 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            )}

            <Button 
              className="h-[44px] w-full rounded-xl bg-gradient-to-r from-[#004ac6] to-[#2563eb] text-white text-sm font-medium tracking-wide shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center mt-2 border-none" 
              type="submit"
              disabled={loading}
            >
              {loading ? "Please wait..." : (mode === "login" ? "Sign In" : mode === "signup" ? "Sign Up" : "Send Magic Link")}
            </Button>
            
            {mode === "login" && (
              <button 
                type="button"
                onClick={() => setMode("magic-link")}
                className="text-xs font-medium text-[#737686] hover:text-[#004ac6] transition-colors mt-[-8px]"
              >
                Sign in without password
              </button>
            )}
            {mode === "magic-link" && (
              <button 
                type="button"
                onClick={() => setMode("login")}
                className="text-xs font-medium text-[#737686] hover:text-[#004ac6] transition-colors mt-[-8px]"
              >
                Back to password login
              </button>
            )}
          </form>

          <div className="w-full flex items-center gap-4 my-8">
            <div className="h-[1px] flex-1 bg-[#c3c6d7]/40"></div>
            <span className="text-xs font-medium text-[#c3c6d7] tracking-widest uppercase">OR</span>
            <div className="h-[1px] flex-1 bg-[#c3c6d7]/40"></div>
          </div>

          <Button 
            variant="outline"
            className="h-[44px] w-full rounded-xl border border-[#c3c6d7]/40 bg-[#ffffff] hover:bg-[#dce9ff] text-[#0b1c30] text-sm font-medium tracking-wide transition-colors flex items-center justify-center gap-3"
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
            </svg>
            Continue with Google
          </Button>

          <div className="mt-8 text-sm text-[#434655] text-center w-full">
            {mode === "login" || mode === "magic-link" ? "Don't have an account?" : "Already have an account?"}
            <button 
              onClick={() => setMode(mode === "login" || mode === "magic-link" ? "signup" : "login")}
              className="font-medium text-[#004ac6] hover:text-[#2563eb] transition-colors ml-1"
            >
              {mode === "login" || mode === "magic-link" ? "Sign Up" : "Sign In"}
            </button>
          </div>
        </main>
      </DialogContent>
    </Dialog>
  );
}
