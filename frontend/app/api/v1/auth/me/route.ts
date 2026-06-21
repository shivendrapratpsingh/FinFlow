import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    id: "demo-user-001",
    email: "demo@finflow.in",
    full_name: "Demo Business",
    avatar_url: null,
    is_verified: true,
    language: "en",
    phone: "+91 9876543210",
  });
}

export async function PATCH(req: Request) {
  const body = await req.json().catch(() => ({}));
  return NextResponse.json({
    id: "demo-user-001",
    email: "demo@finflow.in",
    full_name: body.full_name ?? "Demo Business",
    avatar_url: null,
    is_verified: true,
    language: body.language ?? "en",
    phone: "+91 9876543210",
  });
}
