"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText } from "lucide-react";

interface Invoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  total_amount: number;
  status: string;
  due_date?: string;
  created_at?: string;
}

interface RecentInvoicesProps {
  invoices: Invoice[];
  isLoading?: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  paid: "bg-emerald-100 text-emerald-700",
  sent: "bg-blue-100 text-blue-700",
  draft: "bg-gray-100 text-gray-600",
  overdue: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-400",
};

export function RecentInvoices({ invoices, isLoading }: RecentInvoicesProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">Recent Invoices</h3>
        <a href="/billing" className="text-sm text-indigo-600 hover:underline">View all</a>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          ))}
        </div>
      ) : invoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
          <FileText className="h-10 w-10 mb-3 opacity-30" />
          <p className="text-sm">No invoices yet. Create your first one!</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {invoices.map((inv) => (
            <div key={inv.id} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {inv.invoice_number}
                </p>
                <p className="text-xs text-muted-foreground">{inv.customer_name}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold">
                  ₹{Number(inv.total_amount).toLocaleString("en-IN")}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[inv.status] ?? STATUS_COLORS.draft}`}>
                  {inv.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
