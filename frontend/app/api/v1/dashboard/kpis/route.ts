import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    total_revenue:           { value: 1842500, change: 12.4,  trend: "up" },
    total_expenses:          { value: 726800,  change: -3.2,  trend: "down" },
    net_profit:              { value: 1115700, change: 18.7,  trend: "up" },
    gst_payable:             { value: 94320,   change: 5.1,   trend: "up" },
    outstanding_receivables: { value: 342000,  change: -8.3,  trend: "down" },
    invoices_this_month:     { value: 47,      change: 6,     trend: "up" },
  });
}
