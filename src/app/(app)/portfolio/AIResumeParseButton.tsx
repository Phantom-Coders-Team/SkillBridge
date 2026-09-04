"use client";

import { useState } from "react";
import { Sparkles, CheckCircle2 } from "lucide-react";

export default function AIResumeParseButton() {
  const [isParsing, setIsParsing] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleParse = () => {
    setIsParsing(true);
    setSuccess(false);
    
    // Simulate API delay
    setTimeout(() => {
      setIsParsing(false);
      setSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    }, 2000);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleParse}
        disabled={isParsing || success}
        className="inline-flex h-10 items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50/50 px-4 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors disabled:opacity-70 dark:border-indigo-900/50 dark:bg-indigo-900/20 dark:text-indigo-400 dark:hover:bg-indigo-900/40"
      >
        {isParsing ? (
          <span className="flex items-center gap-2">
            <span className="size-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent dark:border-indigo-400" />
            Parsing...
          </span>
        ) : success ? (
          <span className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-4" /> Added
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Sparkles className="size-4" /> AI Auto-Parse Resume
          </span>
        )}
      </button>

      {/* Simulated Toast Notification */}
      {success && (
        <div className="absolute top-full mt-2 right-0 z-50 w-64 animate-in slide-in-from-top-2 fade-in duration-300">
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 shadow-lg dark:border-emerald-900/50 dark:bg-emerald-950">
            <div className="flex gap-2">
              <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Resume Parsed</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">Extracted 3 skills and 1 project.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
