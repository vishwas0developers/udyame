"use client";

import React from "react";
import { Bot } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white border-t border-zinc-200 py-12 px-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-2">
          <Bot className="h-6 w-6 text-indigo-600" />
          <span className="text-lg font-bold text-zinc-900">udyame<span className="text-indigo-600">.ai</span></span>
        </div>
        <div className="flex items-center gap-8 text-sm text-zinc-500 font-medium">
          <a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-indigo-600 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-indigo-600 transition-colors">Contact</a>
        </div>
        <p className="text-sm text-zinc-400">
          © {new Date().getFullYear()} udyame.ai. Built for modern entrepreneurs.
        </p>
      </div>
    </footer>
  );
}
