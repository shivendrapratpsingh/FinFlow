import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { email, full_name, business_name } = body;

  if (!email || !full_name) {
    return NextResponse.json({ detail: "Name and email are required" }, { status: 400 });
  }

  const user = {
    id: "demo-user-" + Date.now(),
    email,
    full_name,
    avatar_url: null,
    is_verified: true,
    language: "en",
    phone: body.phone ?? null,
  };

  const fakeToken = Buffer.from(JSON.stringify({ sub: user.id, exp: Date.now() + 86400000 })).toString("base64");

  return NextResponse.json({
    access_token: fakeToken,
    refresh_token: fakeToken + "_refresh",
    token_type: "bearer",
    user,
    business_id: "demo-business-" + Date.now(),
  }, { status: 201 });
}
