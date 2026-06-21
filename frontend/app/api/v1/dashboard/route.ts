import { NextResponse } from "next/server";

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") ?? "this_month";

  const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
  const revenue_chart = months.map((m) => ({
    month: m,
    revenue: rand(280000, 620000),
    expenses: rand(120000, 280000),
  }));
  const expense_chart = revenue_chart.map((d) => ({ month: d.month, amount: d.expenses }));

  return NextResponse.json({
    period,
    kpis: {
      total_revenue:   { value: 1842500, change: 12.4,  trend: "up" },
      total_expenses:  { value: 726800,  change: -3.2,   trend: "down" },
      net_profit:      { value: 1115700, change: 18.7,  trend: "up" },
      gst_payable:     { value: 94320,   change: 5.1,   trend: "up" },
      outstanding_receivables: { value: 342000, change: -8.3, trend: "down" },
      invoices_this_month: { value: 47, change: 6, trend: "up" },
    },
    revenue_chart,
    expense_chart,
    alerts: [
      { id: "1", type: "overdue",   title: "3 invoices overdue",           message: "INV-2024-041, INV-2024-038, INV-2024-035 are past due date", severity: "high",   created_at: new Date().toISOString() },
      { id: "2", type: "gst",       title: "GSTR-3B due in 5 days",        message: "File your GSTR-3B for October by 20th November",            severity: "medium", created_at: new Date().toISOString() },
      { id: "3", type: "inventory", title: "Low stock alert",               message: "4 products are below minimum stock level",                   severity: "low",    created_at: new Date().toISOString() },
    ],
    recent_invoices: [
      { id: "inv1", invoice_number: "INV-2024-047", customer_name: "Reliance Retail Ltd",    amount: 84500,  status: "paid",    created_at: "2024-11-01", due_date: "2024-11-15" },
      { id: "inv2", invoice_number: "INV-2024-046", customer_name: "Tata Consultancy Svc",   amount: 125000, status: "sent",    created_at: "2024-10-28", due_date: "2024-11-28" },
      { id: "inv3", invoice_number: "INV-2024-045", customer_name: "Infosys BPM Limited",    amount: 67800,  status: "overdue", created_at: "2024-10-15", due_date: "2024-11-01" },
      { id: "inv4", invoice_number: "INV-2024-044", customer_name: "Wipro Technologies",     amount: 43200,  status: "paid",    created_at: "2024-10-12", due_date: "2024-10-26" },
      { id: "inv5", invoice_number: "INV-2024-043", customer_name: "HCL Technologies Ltd",   amount: 98750,  status: "draft",   created_at: "2024-10-10", due_date: "2024-11-10" },
    ],
    ai_insights: [
      { id: "ai1", type: "revenue",   title: "Revenue up 12% this month",       message: "Your revenue grew by ₹2.1L vs last month. Top contributor: Reliance Retail.", action: "View report" },
      { id: "ai2", type: "gst",       title: "₹94,320 GST payable this month",  message: "Your net GST liability is ₹94,320. File GSTR-3B before 20th to avoid penalties.", action: "File now" },
      { id: "ai3", type: "cashflow",  title: "Collect ₹3.42L receivables",      message: "3 invoices are overdue by more than 30 days. Send a payment reminder now.", action: "Send reminders" },
    ],
  });
}
