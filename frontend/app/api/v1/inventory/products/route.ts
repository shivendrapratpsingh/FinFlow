import { NextResponse } from "next/server";

const PRODUCTS = [
  { id:"p1",  name:"Office Chair Ergonomic",   sku:"FURN-001", category:"Furniture",    unit_price:8500,  stock:24,  min_stock:10, gst_rate:18 },
  { id:"p2",  name:"Standing Desk",             sku:"FURN-002", category:"Furniture",    unit_price:15200, stock:8,   min_stock:5,  gst_rate:18 },
  { id:"p3",  name:"Laptop HP EliteBook",       sku:"TECH-001", category:"Electronics",  unit_price:82000, stock:6,   min_stock:3,  gst_rate:18 },
  { id:"p4",  name:"Dell Monitor 27\"",         sku:"TECH-002", category:"Electronics",  unit_price:28500, stock:15,  min_stock:5,  gst_rate:18 },
  { id:"p5",  name:"Wireless Mouse Logitech",   sku:"TECH-003", category:"Electronics",  unit_price:1800,  stock:3,   min_stock:10, gst_rate:18 },
  { id:"p6",  name:"A4 Paper Ream (500 sheets)",sku:"STAT-001", category:"Stationery",  unit_price:350,   stock:120, min_stock:50, gst_rate:12 },
  { id:"p7",  name:"Ballpoint Pen Box (10)",    sku:"STAT-002", category:"Stationery",  unit_price:120,   stock:45,  min_stock:20, gst_rate:12 },
  { id:"p8",  name:"Toner Cartridge HP 85A",    sku:"TECH-004", category:"Electronics",  unit_price:3200,  stock:2,   min_stock:5,  gst_rate:18 },
  { id:"p9",  name:"Conference Table 10-seat",  sku:"FURN-003", category:"Furniture",    unit_price:42000, stock:1,   min_stock:1,  gst_rate:18 },
  { id:"p10", name:"Safety Gloves (pair)",      sku:"SAFE-001", category:"Safety",       unit_price:280,   stock:200, min_stock:50, gst_rate:5  },
];

export async function GET() {
  return NextResponse.json({ items: PRODUCTS, total: PRODUCTS.length });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return NextResponse.json({ id: "p" + Date.now(), ...body }, { status: 201 });
}
