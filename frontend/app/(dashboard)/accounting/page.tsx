"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BookOpen, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { apiClient } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AccountingPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["accounting-summary"],
    queryFn: async () => {
      const res = await apiClient.get("/accounting/summary");
      return res.data;
    },
  });

  const entries: any[] = data?.recent_entries ?? data?.entries ?? [];

  const stats = [
    { label: "Total Revenue", value: data?.total_revenue ?? 0, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Total Expenses", value: data?.total_expenses ?? 0, icon: TrendingDown, color: "text-red-500", bg: "bg-red-50" },
    { label: "Net Profit", value: (data?.total_revenue ?? 0) - (data?.total_expenses ?? 0), icon: DollarSign, color: "text-indigo-600", bg: "bg-indigo-50" },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold font-display text-gray-900">Accounting & Ledger</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Double-entry bookkeeping & journal entries</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-5 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${s.bg}`}>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{s.label}</p>
              {isLoading ? <Skeleton className="h-6 w-24 mt-1" /> :
                <p className={`text-xl font-bold ${s.color}`}>₹{Number(s.value).toLocaleString("en-IN")}</p>}
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="px-6 py-4 border-b border-border">
          <h3 className="font-semibold text-gray-900">Journal Entries</h3>
        </div>
        {isLoading ? (
          <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <BookOpen className="h-12 w-12 mb-3 opacity-20" />
            <p className="font-medium">No journal entries yet</p>
            <p className="text-sm mt-1">Entries are auto-created when you raise invoices</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr className="text-left text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium">Description</th>
                  <th className="px-6 py-3 font-medium">Debit</th>
                  <th className="px-6 py-3 font-medium">Credit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {entries.map((e: any, i: number) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-muted-foreground">{e.date ? new Date(e.date).toLocaleDateString("en-IN") : "—"}</td>
                    <td className="px-6 py-3">{e.description ?? e.narration ?? "—"}</td>
                    <td className="px-6 py-3 text-emerald-600 font-medium">{e.debit_amount ? `₹${Number(e.debit_amount).toLocaleString("en-IN")}` : "—"}</td>
                    <td className="px-6 py-3 text-red-500 font-medium">{e.credit_amount ? `₹${Number(e.credit_amount).toLocaleString("en-IN")}` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
