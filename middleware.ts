import { NextResponse, type NextRequest } from "next/server";

// 초기 화면 비밀번호 보호
// 환경변수 PREVIEW_PASSWORD 미설정 시 기본값 "test1234" 사용.
// 인증 쿠키 preview-pass=ok 가 없으면 /login 으로 리다이렉트.
// 비밀번호 보호 비활성화는 환경변수 PREVIEW_AUTH_DISABLED=true 로 가능.

const PUBLIC_PATHS = [
  "/login",
  "/api/auth",
  "/manifest.webmanifest",
  "/robots.txt",
  "/sitemap.xml",
  "/favicon.ico",
];

export function middleware(req: NextRequest) {
  if (process.env.PREVIEW_AUTH_DISABLED === "true") return NextResponse.next();
  const { pathname } = req.nextUrl;
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p))) return NextResponse.next();
  if (pathname.startsWith("/_next") || pathname.match(/\.(svg|png|jpg|jpeg|webp|ico|css|js|map)$/)) return NextResponse.next();

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
