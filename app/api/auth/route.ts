import { NextRequest, NextResponse } from "next/server";

const DEFAULT_PASSWORD = "test1234";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: { password?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "잘못된 요청" }, { status: 400 });
  }
  const provided = typeof body.password === "string" ? body.password : "";
  const expected = process.env.PREVIEW_PASSWORD || DEFAULT_PASSWORD;
  if (provided !== expected) {
    return NextResponse.json({ ok: false, error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: "preview-pass",
    value: "ok",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 1일 (매일 재입력 권장)
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}

export async function GET() {
  // 디버그용 — 비밀번호 미공개, 단지 endpoint 살아있는지 확인용
  return NextResponse.json({
    ok: true,
    hint: "POST { password } to authenticate.",
    hasPasswordEnv: Boolean(process.env.PREVIEW_PASSWORD),
    authDisabled: process.env.PREVIEW_AUTH_DISABLED === "true",
  });
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete("preview-pass");
  return res;
}
