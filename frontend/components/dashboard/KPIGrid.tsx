"use client";

import { motion } from "framer-motion";
import {
  TrendingUp, TrendingDown, Minus,
  IndianRupee, ShoppingCart, Receipt, AlertCircle, Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface KPIData {
  label: string;
  value: number;
  formatted: string;
  change_percent: number;
  trend: "up" | "down" | "flat";
  icon: string;
  color: string;
}

const ICON_MAP = {
  revenue: IndianRupee,
  expenses: ShoppingCart,
  profit: TrendingUp,
  gst_payable: Receipt,
  outstanding: AlertCircle,
  cash_balance: Wallet,
};

const COLOR_MAP = {
  indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400",
  emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
  red: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400",
  amber: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
  violet: "bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400",
  sky: "bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400",
};

interface KPICardProps {
  label: string;
  value?: string;
  change?: number;
  trend?: string;
  icon: string;
  color: string;
  index: number;
}

function KPICard({ label, value, change, trend, icon, color, index }: KPICardProps) {
  const IconComponent = ICON_MAP[icon as keyof typeof ICON_MAP] ?? IndianRupee;
  const colorClass = COLOR_MAP[color as keyof typeof COLOR_MAP] ?? COLOR_MAP.indigo;

  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor =
    trend === "up"
      ? label === "Expenses" || label === "GST Payable"
        ? "text-red-500"
        : "text-emerald-500"
      : trend === "down"
      ? label === "Expenses" || label === "GST Payable"
        ? "text-emerald-500"
        : "text-red-500"
      : "text-muted-foreground";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className="kpi-card"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", colorClass)}>
          <IconComponent size={20} />
        </div>
        {change !== undefined && (
          <div className={cn("flex items-center gap-1 text-xs font-medium", trendColor)}>
            <TrendIcon size={13} />
            <span>{Math.abs(change).toFixed(1)}%</span>
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white font-display mb-1">
        {value ?? "—"}
      </p>
      <p className="text-sm text-muted-foreground font-medium">{label}</p>
    </motion.div>
  );
}

interface KPIGridProps {
  kpis?: Record<string, KPIData>;
}

const DEFAULT_KPIS = [
  { key: "revenue", label: "Total Revenue", icon: "revenue", color: "indigo" },
  { key: "expenses", label: "Total Expenses", icon: "expenses", color: "red" },
  { key: "profit", label: "Net Profit", icon: "profit", color: "emerald" },
  { key: "gst_payable", label: "GST Payable", icon: "gst_payable", color: "amber" },
  { key: "outstanding", label: "Outstanding", icon: "outstanding", color: "violet" },
  { key: "cash_balance", label: "Cash Balance", icon: "cash_balance", color: "sky" },
];

export function KPIGrid({ kpis }: KPIGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      {DEFAULT_KPIS.map((def, i) => {
        const data = kpis?.[def.key];
        return (
          <KPICard
            key={def.key}
            label={def.label}
            value={data?.formatted}
            change={data?.change_percent}
            trend={data?.trend}
            icon={def.icon}
            color={def.color}
            index={i}
          />
        );
      })}
    </div>
  );
}
