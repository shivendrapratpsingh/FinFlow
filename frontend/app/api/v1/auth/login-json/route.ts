import { NextResponse } from "next/server";

const DEMO_USER = {
  id: "demo-user-001",
  email: "demo@finflow.in",
  full_name: "Demo Business",
  avatar_url: null,
  is_verified: true,
  language: "en",
  phone: "+91 9876543210",
};

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json({ detail: "Email and password are required" }, { status: 400 });
  }

  // Accept any credentials in demo mode
  const user = { ...DEMO_USER, email };
  const fakeToken = Buffer.from(JSON.stringify({ sub: user.id, exp: Date.now() + 86400000 })).toString("base64");

  return NextResponse.json({
    access_token: fakeToken,
    refresh_token: fakeToken + "_refresh",
    token_type: "bearer",
    user,
    business_id: "demo-business-001",
  });
}
