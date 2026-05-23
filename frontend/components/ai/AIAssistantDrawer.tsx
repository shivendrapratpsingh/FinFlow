"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Send, Mic, Loader2, Bot, User, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUIStore } from "@/store/slices/uiStore";
import { apiClient } from "@/lib/api";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  actions?: { type: string; label: string }[];
}

const QUICK_PROMPTS = [
  "How much profit did I make this month?",
  "Who hasn't paid me yet?",
  "What's my GST payable?",
  "Show best selling products",
  "Any low stock alerts?",
  "Summarize this week's expenses",
];

export function AIAssistantDrawer() {
  const { aiDrawerOpen, setAIDrawerOpen } = useUIStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi! I'm your FinFlow AI assistant 👋\n\nAsk me anything about your business — profits, pending payments, GST, or just type what you want to do. I'll handle it!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await apiClient.post("/ai/chat", {
        message: text.trim(),
        conversation_id: conversationId,
      });

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: res.data.message,
        timestamp: new Date(),
        actions: res.data.actions,
      };

      setMessages((prev) => [...prev, aiMessage]);
      if (res.data.conversation_id !== "new") {
        setConversationId(res.data.conversation_id);
      }
    } catch {
      toast.error("AI assistant is temporarily unavailable");
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([{
      id: "welcome",
      role: "assistant",
      content: "Chat cleared! How can I help you? 😊",
      timestamp: new Date(),
    }]);
    setConversationId(null);
  };

  return (
    <AnimatePresence>
      {aiDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setAIDrawerOpen(false)}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col border-l border-border"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-gradient-to-r from-indigo-600 to-purple-600">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">FinFlow AI</h3>
                  <p className="text-indigo-200 text-xs">Powered by GPT-4o</p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={resetChat}
                  className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8"
                >
                  <RotateCcw size={15} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setAIDrawerOpen(false)}
                  className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8"
                >
                  <X size={18} />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex gap-3",
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <div
                    className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                      msg.role === "assistant"
                        ? "bg-gradient-to-br from-indigo-500 to-purple-600"
                        : "bg-gray-200 dark:bg-gray-700"
                    )}
                  >
                    {msg.role === "assistant" ? (
                      <Bot size={14} className="text-white" />
                    ) : (
                      <User size={14} className="text-gray-600 dark:text-gray-300" />
                    )}
                  </div>
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-3 text-sm",
                      msg.role === "assistant"
                        ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-tl-sm"
                        : "bg-indigo-600 text-white rounded-tr-sm"
                    )}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>

                    {/* Action buttons */}
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {msg.actions.map((action) => (
                          <button
                            key={action.label}
                            className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg font-medium transition-colors"
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <Bot size={14} className="text-white" />
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 rounded-full bg-indigo-400"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            <div className="px-4 py-2 border-t border-border">
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    disabled={isLoading}
                    className="flex-shrink-0 text-xs text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-full px-3 py-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors whitespace-nowrap"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="px-4 py-4 border-t border-border">
              <div className="flex gap-2 items-end">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage(input);
                    }
                  }}
                  placeholder="Ask anything... e.g. 'Invoice Rahul for 5000'"
                  className="resize-none min-h-[44px] max-h-[120px] text-sm"
                  rows={1}
                  disabled={isLoading}
                />
                <div className="flex gap-1.5 flex-shrink-0">
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-10 w-10"
                    onClick={() => toast("Voice input coming soon!")}
                  >
                    <Mic size={16} />
                  </Button>
                  <Button
                    size="icon"
                    className="h-10 w-10 bg-indigo-600 hover:bg-indigo-700"
                    onClick={() => sendMessage(input)}
                    disabled={isLoading || !input.trim()}
                  >
                    {isLoading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Send size={16} />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
