"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { KPIGrid } from "@/components/dashboard/KPIGrid";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { RecentInvoices } from "@/components/dashboard/RecentInvoices";
import { AlertPanel } from "@/components/dashboard/AlertPanel";
import { AIInsightsBanner } from "@/components/dashboard/AIInsightsBanner";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { PeriodSelector } from "@/components/shared/PeriodSelector";
import { dashboardApi } from "@/lib/api/dashboard";
import { KPISkeleton } from "@/components/dashboard/KPISkeleton";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

export default function DashboardPage() {
  const [period, setPeriod] = useState("this_month");

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", period],
    queryFn: () => dashboardApi.getDashboard(period),
    staleTime: 60_000, // 1 min cache
    refetchOnWindowFocus: false,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <motion.div {...fadeUp}>
          <h1 className="text-2xl font-bold font-display text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Here&apos;s what&apos;s happening with your business today.
          </p>
        </motion.div>
        <PeriodSelector value={period} onChange={setPeriod} />
      </div>

      {/* AI Insights Banner */}
      {data?.ai_insights && data.ai_insights.length > 0 && (
        <motion.div {...fadeUp} transition={{ delay: 0.05 }}>
          <AIInsightsBanner insights={data.ai_insights} />
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div {...fadeUp} transition={{ delay: 0.1 }}>
        <QuickActions />
      </motion.div>

      {/* KPI Cards */}
      <motion.div {...fadeUp} transition={{ delay: 0.15 }}>
        {isLoading ? <KPISkeleton /> : <KPIGrid kpis={data?.kpis} />}
      </motion.div>

      {/* Charts + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          {...fadeUp}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <RevenueChart
            data={data?.revenue_chart ?? []}
            expenseData={data?.expense_chart ?? []}
            isLoading={isLoading}
          />
        </motion.div>
        <motion.div {...fadeUp} transition={{ delay: 0.25 }}>
          <AlertPanel alerts={data?.alerts ?? []} isLoading={isLoading} />
        </motion.div>
      </div>

      {/* Recent Invoices */}
      <motion.div {...fadeUp} transition={{ delay: 0.3 }}>
        <RecentInvoices
          invoices={data?.recent_invoices ?? []}
          isLoading={isLoading}
        />
      </motion.div>
    </div>
  );
}
