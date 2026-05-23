"use client";

import { Sparkles, X } from "lucide-react";
import { useState } from "react";

interface AIInsightsBannerProps {
  insights: string[];
}

export function AIInsightsBanner({ insights }: AIInsightsBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed || !insights?.length) return null;

  return (
    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-4 text-white flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <Sparkles className="h-5 w-5 mt-0.5 flex-shrink-0 text-indigo-200" />
        <div>
          <p className="font-semibold text-sm mb-1">AI Insight</p>
          <p className="text-sm text-indigo-100">{insights[0]}</p>
        </div>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-indigo-200 hover:text-white transition-colors flex-shrink-0"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
