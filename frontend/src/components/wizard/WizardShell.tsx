"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface WizardShellProps {
  question: string;
  onAnswer: (answer: string) => void;
  isLoading?: boolean;
  stepNumber?: number;
  totalSteps?: number;
}

const WizardShell: React.FC<WizardShellProps> = ({ 
  question, 
  onAnswer, 
  isLoading,
  stepNumber = 1,
  totalSteps = 10
}) => {
  const [input, setInput] = useState("");
  const [displayedQuestion, setDisplayedQuestion] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // Typing animation for the AI question
    setIsTyping(true);
    setDisplayedQuestion("");
    let i = 0;
    const interval = setInterval(() => {
      if (i < question.length) {
        setDisplayedQuestion((prev) => prev + question.charAt(i));
        i++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 25);
    return () => clearInterval(interval);
  }, [question]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onAnswer(input);
      setInput("");
    }
  };

  const progress = (stepNumber / totalSteps) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="w-full h-1 bg-white/5 rounded-full mb-8 overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
        />
      </div>

      <div className="relative p-8 md:p-12 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={question}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 text-sm font-bold border border-blue-500/30">
                {stepNumber}
              </span>
              <span className="text-white/40 text-sm font-medium tracking-wider uppercase">
                Step {stepNumber} of {totalSteps}
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 leading-tight min-h-[4rem]">
              {displayedQuestion}
              {isTyping && <span className="inline-block w-1 h-8 ml-1 bg-blue-500 animate-pulse align-middle" />}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative group">
                <textarea
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-lg text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all resize-none group-hover:border-white/20"
                  rows={4}
                  placeholder="Describe your vision..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading || isTyping}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />
                <div className="absolute bottom-4 right-4 text-white/20 text-xs font-medium">
                  Press Enter to submit
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <p className="text-white/40 text-sm italic">
                  Tip: Be as detailed as possible for better results.
                </p>
                
                <button
                  type="submit"
                  disabled={isLoading || isTyping || !input.trim()}
                  className="relative group overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 disabled:opacity-30 text-white px-10 py-4 rounded-2xl font-bold transition-all shadow-xl hover:shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Architecting...
                      </>
                    ) : (
                      <>
                        Continue
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </>
                    )}
                  </span>
                </button>
              </div>
            </form>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WizardShell;
