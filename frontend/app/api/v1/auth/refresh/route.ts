import { NextResponse } from "next/server";

export async function POST() {
  const fakeToken = Buffer.from(JSON.stringify({ sub: "demo-user-001", exp: Date.now() + 86400000 })).toString("base64");
  return NextResponse.json({
    access_token: fakeToken,
    refresh_token: fakeToken + "_refresh",
    token_type: "bearer",
    user: { id: "demo-user-001", email: "demo@finflow.in", full_name: "Demo Business", is_verified: true, language: "en" },
    business_id: "demo-business-001",
  });
}
