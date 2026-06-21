import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    profit_loss: {
      revenue:    1842500,
      expenses:    726800,
      gross_profit:1115700,
      tax:         200826,
      net_profit:  914874,
    },
    balance_sheet: {
      assets: { cash: 842300, receivables: 342000, inventory: 185400, fixed: 620000, total: 1989700 },
      liabilities: { payables: 124500, gst_payable: 94320, loans: 250000, total: 468820 },
      equity: 1520880,
    },
    top_customers: [
      { name:"Reliance Retail Ltd", revenue:842500, invoices:8 },
      { name:"Tata Consultancy Svc", revenue:625000, invoices:5 },
      { name:"Flipkart Internet",   revenue:495000, invoices:3 },
    ],
  });
}
