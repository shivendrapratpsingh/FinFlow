"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, FileText, Download } from "lucide-react";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const REPORT_TYPES = [
  { label: "Profit & Loss", icon: TrendingUp, desc: "Income vs expenses over time" },
  { label: "Balance Sheet", icon: BarChart3, desc: "Assets, liabilities and equity" },
  { label: "Cash Flow", icon: TrendingUp, desc: "Money in and out of business" },
  { label: "Sales Report", icon: FileText, desc: "Revenue breakdown by product/customer" },
  { label: "Expense Report", icon: FileText, desc: "Spending breakdown by category" },
  { label: "Tax Summary", icon: FileText, desc: "GST and TDS summary" },
];

export default function ReportsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["reports-overview"],
    queryFn: async () => {
      const res = await apiClient.get("/reports/overview");
      return res.data;
    },
  });

  const chartData: any[] = data?.monthly_revenue ?? [];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-gray-900">Reports</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Business insights and financial reports</p>
        </div>
        <Button variant="outline" className="gap-2"><Download size={16} /> Export</Button>
      </motion.div>

      {/* Revenue Chart */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Revenue Trend</h3>
        {isLoading ? <Skeleton className="h-48 w-full" /> : chartData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-muted-foreground">
            <p className="text-sm">No data yet — create invoices to see trends</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: any) => [`₹${Number(v).toLocaleString("en-IN")}`, "Revenue"]} />
              <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="#eef2ff" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {REPORT_TYPES.map((r) => (
          <Card key={r.label} className="p-5 hover:border-indigo-300 hover:shadow-md cursor-pointer transition-all group">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
                <r.icon className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{r.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{r.desc}</p>
              </div>
              <Download className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
