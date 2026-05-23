"use client";

import { useEffect } from "react";
import { useUIStore } from "@/store/slices/uiStore";
import { Sparkles } from "lucide-react";

/**
 * Full-page AI assistant — just opens the drawer.
 * On mobile this gives the assistant its own dedicated page.
 */
export default function AIAssistantPage() {
  const { setAIDrawerOpen } = useUIStore();

  useEffect(() => {
    setAIDrawerOpen(true);
  }, [setAIDrawerOpen]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4">
        <Sparkles className="w-8 h-8 text-white" />
      </div>
      <h1 className="text-2xl font-bold font-display text-gray-900 dark:text-white mb-2">
        FinFlow AI Assistant
      </h1>
      <p className="text-muted-foreground max-w-md">
        Ask anything about your business in plain language. No accounting knowledge needed.
      </p>
    </div>
  );
}
