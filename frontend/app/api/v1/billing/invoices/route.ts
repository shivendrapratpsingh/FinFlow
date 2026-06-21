import { NextResponse } from "next/server";

const INVOICES = [
  { id:"inv1",  invoice_number:"INV-2024-047", customer_name:"Reliance Retail Ltd",     amount:84500,  gst_amount:15210, status:"paid",    created_at:"2024-11-01", due_date:"2024-11-15", gstin:"27AABCR1234A1Z5" },
  { id:"inv2",  invoice_number:"INV-2024-046", customer_name:"Tata Consultancy Svc",    amount:125000, gst_amount:22500, status:"sent",    created_at:"2024-10-28", due_date:"2024-11-28", gstin:"27AAACT2727Q1ZX" },
  { id:"inv3",  invoice_number:"INV-2024-045", customer_name:"Infosys BPM Limited",     amount:67800,  gst_amount:12204, status:"overdue", created_at:"2024-10-15", due_date:"2024-11-01", gstin:"29AABCI1234A1Z3" },
  { id:"inv4",  invoice_number:"INV-2024-044", customer_name:"Wipro Technologies",      amount:43200,  gst_amount:7776,  status:"paid",    created_at:"2024-10-12", due_date:"2024-10-26", gstin:"29AAACW0935D1ZR" },
  { id:"inv5",  invoice_number:"INV-2024-043", customer_name:"HCL Technologies Ltd",    amount:98750,  gst_amount:17775, status:"draft",   created_at:"2024-10-10", due_date:"2024-11-10", gstin:"06AAACH2902D1Z6" },
  { id:"inv6",  invoice_number:"INV-2024-042", customer_name:"Zomato Limited",          amount:32400,  gst_amount:5832,  status:"paid",    created_at:"2024-10-05", due_date:"2024-10-20", gstin:"27AABCZ0515D1ZL" },
  { id:"inv7",  invoice_number:"INV-2024-041", customer_name:"Swiggy Pvt Ltd",          amount:56700,  gst_amount:10206, status:"overdue", created_at:"2024-09-28", due_date:"2024-10-28", gstin:"29AABCS1234A1Z7" },
  { id:"inv8",  invoice_number:"INV-2024-040", customer_name:"Nykaa Fashion Ltd",       amount:21800,  gst_amount:3924,  status:"paid",    created_at:"2024-09-20", due_date:"2024-10-05", gstin:"27AABCN3214M1Z8" },
  { id:"inv9",  invoice_number:"INV-2024-039", customer_name:"Meesho Inc",              amount:74300,  gst_amount:13374, status:"cancelled",created_at:"2024-09-15",due_date:"2024-09-30", gstin:"29AABCM9876B1Z3" },
  { id:"inv10", invoice_number:"INV-2024-038", customer_name:"Flipkart Internet Pvt",   amount:165000, gst_amount:29700, status:"overdue", created_at:"2024-09-10", due_date:"2024-10-10", gstin:"29AAACF1234A1ZX" },
];

export async function GET() {
  return NextResponse.json({ items: INVOICES, total: INVOICES.length });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const newInvoice = {
    id: "inv" + Date.now(),
    invoice_number: "INV-2024-0" + (INVOICES.length + 48),
    ...body,
    status: "draft",
    created_at: new Date().toISOString().split("T")[0],
  };
  return NextResponse.json(newInvoice, { status: 201 });
}
