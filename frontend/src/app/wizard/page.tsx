"use client";

import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User as UserIcon, Loader2 } from "lucide-react";
import apiClient from "@/lib/api-client";
import { toast } from "sonner";

interface Message {
  role: "assistant" | "user";
  content: string;
}

export default function WizardPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Welcome to BizArchitect AI! I'm here to help you build your business master plan. Let's start with the basics: What is your company's name?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const response = await apiClient.post("/planning/chat", { prompt: userMsg });
      setMessages((prev) => [...prev, { role: "assistant", content: response.data.response }]);
      
      // Update credits in store if returned
      if (response.data.remaining_credits !== undefined) {
        useAuthStore.getState().updateCredits(response.data.remaining_credits);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Something went wrong</strong>.");
      setMessages((prev) => [...prev, { role: "assistant", content: "I encountered an error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black text-zinc-100 overflow-hidden">
      {/* Header */}
      <header className="p-4 border-b border-zinc-900 flex justify-between items-center bg-zinc-950/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Bot className="text-indigo-500 h-6 w-6" />
          <h1 className="font-bold text-lg">BizArchitect <span className="text-zinc-500 font-normal">| Master Planner</span></h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-xs text-zinc-400">
            Credits: <span className="text-emerald-400 font-bold">{user?.credit_balance?.toFixed(2) || "0.00"}</span>
          </div>
          <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-white">Exit</Button>
        </div>
      </header>

      {/* Chat Area */}
      <ScrollArea className="flex-1 p-6" viewportRef={scrollRef}>
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-4 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${m.role === "user" ? "bg-indigo-600" : "bg-zinc-800 border border-zinc-700"}`}>
                {m.role === "user" ? <UserIcon size={16} /> : <Bot size={16} className="text-indigo-400" />}
              </div>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${m.role === "user" ? "bg-indigo-600/10 text-indigo-100 border border-indigo-500/20" : "bg-zinc-900 border border-zinc-800 text-zinc-300"}`}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-4">
              <div className="h-8 w-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center animate-pulse">
                <Bot size={16} className="text-zinc-500" />
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                <span className="text-xs text-zinc-500 italic">BizArchitect is thinking...</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-6 bg-gradient-to-t from-black via-black to-transparent">
        <div className="max-w-3xl mx-auto relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          <Card className="relative bg-zinc-900 border-zinc-800 shadow-2xl overflow-hidden">
            <div className="flex items-center px-4 py-2">
              <Input
                placeholder="Type your answer here..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="flex-1 bg-transparent border-none text-zinc-200 focus-visible:ring-0 placeholder:text-zinc-600"
              />
              <Button 
                onClick={handleSend}
                disabled={!input.trim() || loading}
                size="icon"
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all active:scale-95"
              >
                <Send size={18} />
              </Button>
            </div>
          </Card>
          <div className="mt-2 text-[10px] text-zinc-600 text-center uppercase tracking-widest font-bold">
            Guiding Indian Entrepreneurs to Success
          </div>
        </div>
      </div>
    </div>
  );
}
