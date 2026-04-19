"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Bot, LayoutDashboard, Menu, X } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { LoginModal } from "@/components/LoginModal";

interface NavbarProps {
  showPricingLink?: boolean;
}

export function Navbar({ showPricingLink = true }: NavbarProps) {
  const { isAuthenticated, logout } = useAuthStore();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-indigo-600">
            <Bot className="h-7 w-7" />
            <span className="text-xl font-bold text-zinc-900 tracking-tight">udyame<span className="text-indigo-600">.ai</span></span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/#features" className="text-sm font-medium text-zinc-600 hover:text-indigo-600 transition-colors">Features</Link>
            {showPricingLink && (
              <Link href="/billing" className="text-sm font-medium text-zinc-600 hover:text-indigo-600 transition-colors">Pricing</Link>
            )}
            
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" className="text-sm font-medium text-zinc-600 hover:text-indigo-600 transition-colors">Dashboard</Link>
                <Button 
                  onClick={() => logout()}
                  variant="ghost"
                  className="text-sm font-medium text-zinc-600 hover:text-red-600"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-zinc-600">
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-zinc-200 p-4 space-y-4 animate-in slide-in-from-top-2">
          <Link href="/#features" className="block text-sm font-medium text-zinc-600 px-2 py-1" onClick={() => setIsMobileMenuOpen(false)}>Features</Link>
          {showPricingLink && (
            <Link href="/billing" className="block text-sm font-medium text-zinc-600 px-2 py-1" onClick={() => setIsMobileMenuOpen(false)}>Pricing</Link>
          )}
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" className="block text-sm font-medium text-zinc-600 px-2 py-1" onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link>
              <Button 
                onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                variant="ghost" 
                className="w-full justify-start text-red-600"
              >
                Logout
              </Button>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <Button 
                variant="outline"
                onClick={() => { setAuthMode("login"); setIsLoginModalOpen(true); setIsMobileMenuOpen(false); }}
              >
                Login
              </Button>
              <Button 
                onClick={() => { setAuthMode("signup"); setIsLoginModalOpen(true); setIsMobileMenuOpen(false); }}
                className="bg-indigo-600"
              >
                Get Started
              </Button>
            </div>
          )}
        </div>
      )}

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        initialMode={authMode}
      />
    </nav>
  );
}
