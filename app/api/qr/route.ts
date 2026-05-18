import { NextRequest, NextResponse } from "next/server";

// 시제품 URL용 QR 코드 SVG 응답
// 외부 라이브러리 없이 google chart api 같은 외부 서비스에 의존하지 않고,
// 간단한 인라인 SVG로 안내. 실제 PNG/EPS QR이 필요하면 클라이언트에서 qrcode 라이브러리 사용.
//
// GET /api/qr?text=https://your-vercel-url.vercel.app
//
// 응답:
//   ?format=json : { url, hint }
//   기본: SVG 자리표시자 (안내 텍스트 포함)
//
// Vercel 배포 후, 사용자가 자신의 배포 URL을 ?text 로 넣어 호출하면
// 발표 자료/캡처 자료에 인쇄 가능한 자리표시자를 받을 수 있다.

export async function GET(req: NextRequest) {
  const text = req.nextUrl.searchParams.get("text") ?? "https://barrierfree-localroute-busan.vercel.app";
  const fmt = req.nextUrl.searchParams.get("format") ?? "svg";

  if (fmt === "json") {
    return NextResponse.json({
      url: text,
      note: "이 응답을 클라이언트의 qrcode 라이브러리로 변환하거나, 발표자료 슬라이드의 QR 위젯에 입력하세요.",
      printable: `${text}`,
    });
  }

  // SVG 자리표시자 - 발표/캡처용 빠른 자료
  const safeText = text.replace(/[<>&"']/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "\"": "&quot;", "'": "&apos;" }[c] ?? c));
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 480" width="400" height="480">
  <rect width="400" height="480" fill="#FFFFFF" stroke="#1F3864" stroke-width="2" rx="20"/>
  <rect x="40" y="40" width="320" height="320" fill="#F6F8FC" stroke="#2E5797" stroke-width="2" stroke-dasharray="6 4"/>
  <text x="200" y="200" font-family="sans-serif" font-size="18" fill="#1F3864" text-anchor="middle" font-weight="bold">QR 자리표시자</text>
  <text x="200" y="230" font-family="sans-serif" font-size="13" fill="#475569" text-anchor="middle">발표 자료에서 qrcode 라이브러리로 교체</text>
  <text x="200" y="400" font-family="monospace" font-size="11" fill="#1F3864" text-anchor="middle">${safeText}</text>
  <text x="200" y="440" font-family="sans-serif" font-size="11" fill="#94A3B8" text-anchor="middle">배리어프리 로컬루트 부산 — 2026 공모전 시제품</text>
</svg>`;
  return new NextResponse(svg, {
    headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=3600" },
  });
}
