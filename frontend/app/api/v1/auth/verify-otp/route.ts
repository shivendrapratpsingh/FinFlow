import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const user = {
    id: "demo-user-001",
    email: null,
    full_name: "Demo User",
    avatar_url: null,
    is_verified: true,
    language: "en",
    phone: body.phone,
  };
  const fakeToken = Buffer.from(JSON.stringify({ sub: user.id, exp: Date.now() + 86400000 })).toString("base64");
  return NextResponse.json({
    access_token: fakeToken,
    refresh_token: fakeToken + "_refresh",
    token_type: "bearer",
    user,
    business_id: "demo-business-001",
  });
}
