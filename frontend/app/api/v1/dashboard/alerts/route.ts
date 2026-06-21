import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    { id:"1", type:"overdue",   title:"3 invoices overdue",         message:"INV-2024-041, INV-2024-038, INV-2024-035 are past due date", severity:"high",   created_at:new Date().toISOString() },
    { id:"2", type:"gst",       title:"GSTR-3B due in 5 days",      message:"File your GSTR-3B for October by 20th November",            severity:"medium", created_at:new Date().toISOString() },
    { id:"3", type:"inventory", title:"4 products below min stock",  message:"Toner Cartridge, Wireless Mouse need restocking",           severity:"low",    created_at:new Date().toISOString() },
  ]);
}
