import { NextResponse } from "next/server";

const ENTRIES = [
  { id:"je1", date:"2024-11-01", description:"Sales Invoice INV-2024-047 - Reliance Retail",   debit_account:"Accounts Receivable", credit_account:"Sales Revenue", amount:84500,  ref:"INV-2024-047" },
  { id:"je2", date:"2024-11-01", description:"GST Collected on INV-2024-047",                   debit_account:"Accounts Receivable", credit_account:"GST Payable",   amount:15210,  ref:"INV-2024-047" },
  { id:"je3", date:"2024-10-28", description:"Sales Invoice INV-2024-046 - TCS",                debit_account:"Accounts Receivable", credit_account:"Sales Revenue", amount:125000, ref:"INV-2024-046" },
  { id:"je4", date:"2024-10-25", description:"Office Rent - October 2024",                       debit_account:"Rent Expense",        credit_account:"Bank Account",  amount:45000,  ref:"EXP-2024-089" },
  { id:"je5", date:"2024-10-20", description:"Salary Payment - October 2024",                    debit_account:"Salary Expense",      credit_account:"Bank Account",  amount:380000, ref:"EXP-2024-088" },
  { id:"je6", date:"2024-10-15", description:"Purchase - HP Toner Cartridges (10 units)",        debit_account:"Purchases",           credit_account:"Bank Account",  amount:32000,  ref:"PO-2024-022" },
  { id:"je7", date:"2024-10-10", description:"Payment received - INV-2024-044 Wipro",            debit_account:"Bank Account",        credit_account:"Accounts Receivable", amount:43200, ref:"REC-2024-031" },
  { id:"je8", date:"2024-10-05", description:"Internet & Utilities - October",                   debit_account:"Utilities Expense",   credit_account:"Bank Account",  amount:8500,   ref:"EXP-2024-087" },
];

export async function GET() {
  return NextResponse.json({
    total_revenue:  1842500,
    total_expenses:  726800,
    net_profit:     1115700,
    recent_entries: ENTRIES,
  });
}
