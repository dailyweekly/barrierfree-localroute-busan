import { NextResponse, type NextRequest } from "next/server";

// 초기 화면 비밀번호 보호
// PREVIEW_PASSWORD 미설정 시 기본값 "test1234".
// 인증 쿠키 preview-pass=ok 가 없으면 /login 으로 리다이렉트.

export function middleware(req: NextRequest) {
  if (process.env.PREVIEW_AUTH_DISABLED === "true") return NextResponse.next();
  const { pathname } = req.nextUrl;

  // /api 전체와 /login, 정적자원, _next 는 통과
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname === "/manifest.webmanifest" ||
    pathname.match(/\.(svg|png|jpg|jpeg|webp|ico|css|js|map)$/)
  ) {
    return NextResponse.next();
  }

  const ok = req.cookies.get("preview-pass")?.value === "ok";
  if (ok) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", pathname + (req.nextUrl.search || ""));
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
