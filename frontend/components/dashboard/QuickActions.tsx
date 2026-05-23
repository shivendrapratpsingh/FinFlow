"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, FileText, Package, Receipt, Scan, Sparkles } from "lucide-react";
import { useUIStore } from "@/store/slices/uiStore";

const ACTIONS = [
  {
    label: "New Invoice",
    description: "Create GST invoice",
    icon: FileText,
    href: "/billing/new-invoice",
    color: "bg-indigo-500",
  },
  {
    label: "Add Product",
    description: "Add to inventory",
    icon: Package,
    href: "/inventory/new-product",
    color: "bg-emerald-500",
  },
  {
    label: "Record Expense",
    description: "Track spending",
    icon: Receipt,
    href: "/accounting/expenses/new",
    color: "bg-amber-500",
  },
  {
    label: "Scan Bill",
    description: "OCR extract data",
    icon: Scan,
    href: "/ai/scan",
    color: "bg-purple-500",
  },
];

export function QuickActions() {
  const { setAIDrawerOpen } = useUIStore();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {ACTIONS.map((action, i) => (
        <motion.div
          key={action.label}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05 }}
        >
          <Link
            href={action.href}
            className="flex items-center gap-3 p-4 bg-white dark:bg-gray-900 border border-border rounded-xl hover:shadow-card-hover hover:border-indigo-200 dark:hover:border-indigo-800 transition-all group"
          >
            <div className={`w-9 h-9 rounded-xl ${action.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
              <action.icon className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{action.label}</p>
              <p className="text-xs text-muted-foreground truncate">{action.description}</p>
            </div>
          </Link>
        </motion.div>
      ))}

      {/* AI Action */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: ACTIONS.length * 0.05 }}
      >
        <button
          onClick={() => setAIDrawerOpen(true)}
          className="w-full flex items-center gap-3 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 border border-indigo-200 dark:border-indigo-800 rounded-xl hover:shadow-card-hover transition-all group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0 text-left">
            <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 truncate">Ask AI</p>
            <p className="text-xs text-indigo-500 dark:text-indigo-400 truncate">Any question</p>
          </div>
        </button>
      </motion.div>
    </div>
  );
}
