import { NextResponse } from "next/server";

const CUSTOMERS = [
  { id:"c1",  name:"Reliance Retail Ltd",    gstin:"27AABCR1234A1Z5", email:"accounts@reliance.com",      phone:"+91 22 3555 5000", city:"Mumbai",    total_billed:842500, outstanding:0 },
  { id:"c2",  name:"Tata Consultancy Svc",   gstin:"27AAACT2727Q1ZX", email:"finance@tcs.com",            phone:"+91 22 6778 9595", city:"Mumbai",    total_billed:625000, outstanding:125000 },
  { id:"c3",  name:"Infosys BPM Limited",    gstin:"29AABCI1234A1Z3", email:"payments@infosys.com",       phone:"+91 80 2852 0261", city:"Bangalore", total_billed:338000, outstanding:67800 },
  { id:"c4",  name:"Wipro Technologies",     gstin:"29AAACW0935D1ZR", email:"vendor@wipro.com",           phone:"+91 80 2844 0011", city:"Bangalore", total_billed:216000, outstanding:0 },
  { id:"c5",  name:"HCL Technologies Ltd",   gstin:"06AAACH2902D1Z6", email:"payables@hcl.com",           phone:"+91 120 676 7676", city:"Noida",     total_billed:197500, outstanding:98750 },
  { id:"c6",  name:"Zomato Limited",         gstin:"27AABCZ0515D1ZL", email:"finance@zomato.com",         phone:"+91 11 4019 3000", city:"Gurgaon",   total_billed:97200,  outstanding:0 },
  { id:"c7",  name:"Flipkart Internet Pvt",  gstin:"29AAACF1234A1ZX", email:"vendor.payments@flipkart.com",phone:"+91 44 4561 8000", city:"Bangalore", total_billed:495000, outstanding:165000 },
];

export async function GET() {
  return NextResponse.json({ items: CUSTOMERS, total: CUSTOMERS.length });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return NextResponse.json({ id: "c" + Date.now(), ...body, total_billed: 0, outstanding: 0 }, { status: 201 });
}
