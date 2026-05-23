"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Plus, Search, FileText, Download, Send, Eye } from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import toast from "react-hot-toast";

const STATUS_COLORS: Record<string, string> = {
  paid:      "bg-emerald-100 text-emerald-700",
  sent:      "bg-blue-100 text-blue-700",
  draft:     "bg-gray-100 text-gray-600",
  overdue:   "bg-red-100 text-red-700",
  cancelled: "bg-gray-200 text-gray-400",
};

export default function InvoicesPage() {
  const [search, setSearch] = useState("");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const res = await apiClient.get("/billing/invoices?limit=50");
      return res.data;
    },
  });

  const invoices: any[] = data?.items ?? data ?? [];

  const filtered = invoices.filter((inv: any) =>
    inv.invoice_number?.toLowerCase().includes(search.toLowerCase()) ||
    inv.customer_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-gray-900">Invoices</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Manage and track all your invoices</p>
        </div>
        <Link href="/billing/new-invoice">
          <Button className="gap-2"><Plus size={16} /> New Invoice</Button>
        </Link>
      </motion.div>

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input
            placeholder="Search by invoice number or customer..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </Card>

      <Card>
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <FileText className="h-12 w-12 mb-3 opacity-20" />
            <p className="font-medium">No invoices yet</p>
            <p className="text-sm mt-1">Create your first invoice to get started</p>
            <Link href="/billing/new-invoice" className="mt-4">
              <Button size="sm" className="gap-2"><Plus size={14} /> Create Invoice</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr className="text-left text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Invoice #</th>
                  <th className="px-6 py-3 font-medium">Customer</th>
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium">Amount</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-indigo-600">{inv.invoice_number}</td>
                    <td className="px-6 py-4">{inv.customer_name ?? "—"}</td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {inv.invoice_date ? new Date(inv.invoice_date).toLocaleDateString("en-IN") : "—"}
                    </td>
                    <td className="px-6 py-4 font-semibold">
                      ₹{Number(inv.total_amount ?? 0).toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[inv.status] ?? STATUS_COLORS.draft}`}>
                        {inv.status ?? "draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="text-muted-foreground hover:text-indigo-600 transition-colors" title="View">
                          <Eye size={15} />
                        </button>
                        <button className="text-muted-foreground hover:text-indigo-600 transition-colors" title="Send">
                          <Send size={15} />
                        </button>
                        <button className="text-muted-foreground hover:text-indigo-600 transition-colors" title="Download">
                          <Download size={15} />
                        </button>
                      </div>
                    </td>
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
