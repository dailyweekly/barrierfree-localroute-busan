import { NextRequest, NextResponse } from "next/server";

const DEFAULT_PASSWORD = "test1234";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({} as { password?: string }));
  const provided = typeof body.password === "string" ? body.password : "";
  const expected = process.env.PREVIEW_PASSWORD || DEFAULT_PASSWORD;
  if (provided !== expected) {
    return NextResponse.json({ ok: false, error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set("preview-pass", "ok", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    // 7일
    maxAge: 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete("preview-pass");
  return res;
}
