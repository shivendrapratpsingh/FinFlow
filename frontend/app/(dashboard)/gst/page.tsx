"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Receipt, Download, AlertCircle } from "lucide-react";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const PERIODS = ["Apr 2025", "May 2025", "Jun 2025", "Jul 2025", "Aug 2025", "Sep 2025",
  "Oct 2025", "Nov 2025", "Dec 2025", "Jan 2026", "Feb 2026", "Mar 2026"];

export default function GSTPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["gst-summary"],
    queryFn: async () => {
      const res = await apiClient.get("/gst/summary");
      return res.data;
    },
  });

  const summary = data ?? {};

  const cards = [
    { label: "Output GST (Collected)", value: summary.output_gst ?? 0, sub: "GST charged to customers" },
    { label: "Input GST (Paid)", value: summary.input_gst ?? 0, sub: "GST paid to suppliers" },
    { label: "Net GST Payable", value: (summary.output_gst ?? 0) - (summary.input_gst ?? 0), sub: "Amount to deposit with govt" },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-gray-900">GST & Tax</h1>
          <p className="text-muted-foreground text-sm mt-0.5">GSTR-1, GSTR-3B summaries and filings</p>
        </div>
        <Button variant="outline" className="gap-2"><Download size={16} /> Export GSTR</Button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Card key={c.label} className="p-5">
            {isLoading ? <Skeleton className="h-16 w-full" /> : (
              <>
                <p className="text-sm text-muted-foreground">{c.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">₹{Number(c.value).toLocaleString("en-IN")}</p>
                <p className="text-xs text-muted-foreground mt-1">{c.sub}</p>
              </>
            )}
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Monthly GST Summary (FY 2025-26)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {PERIODS.map((p) => (
            <div key={p} className="border border-border rounded-lg p-3 hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer transition-colors">
              <p className="text-sm font-medium text-gray-700">{p}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Not Filed</p>
              <div className="h-1.5 w-full bg-gray-100 rounded-full mt-2">
                <div className="h-1.5 bg-indigo-400 rounded-full" style={{ width: "0%" }} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5 border-amber-200 bg-amber-50">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800">GST Filing Reminder</p>
            <p className="text-sm text-amber-700 mt-0.5">
              GSTR-1 for May 2026 is due on 11 Jun 2026. Make sure all invoices are finalized before filing.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
