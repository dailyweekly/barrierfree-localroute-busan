"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV = [
  { href: "/",       label: "입력",       num: "①" },
  { href: "/routes", label: "경로",       num: "②③" },
  { href: "/local",  label: "로컬루트",   num: "④" },
  { href: "/admin",  label: "대시보드",   num: "⑤" },
  { href: "/about",  label: "소개",       num: "" },
];

export default function AppHeader() {
  const pathname = usePathname() ?? "/";
  const [big, setBig] = useState(false);
  const [contrast, setContrast] = useState(false);
  const [mobOpen, setMobOpen] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.bigtext = big ? "true" : "false";
    document.documentElement.dataset.contrast = contrast ? "high" : "normal";
  }, [big, contrast]);

  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-white/85 border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 group shrink-0" aria-label="배리어프리 로컬루트 부산 홈으로">
          <span aria-hidden className="relative inline-flex w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-700 to-ocean text-white grid place-items-center text-lg font-extrabold shadow-card">
            B
            <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-coral border-2 border-white" />
          </span>
          <div className="leading-tight">
            <div className="text-sm sm:text-base font-extrabold text-brand-700">배리어프리 로컬루트 부산</div>
            <div className="text-[10px] sm:text-xs text-slate-500">공공데이터 기반 설명가능 AI 추천</div>
          </div>
        </Link>

        <nav aria-label="주요 페이지" className="ml-2 hidden md:flex items-center gap-1 text-sm">
          {NAV.map((n) => {
            const active = pathname === n.href || (n.href !== "/" && pathname.startsWith(n.href));
            return (
              <Link key={n.href} href={n.href}
                className={[
                  "px-3 py-2 rounded-xl font-medium transition-colors",
                  active ? "bg-brand-700 text-white shadow-card" : "text-slate-700 hover:bg-brand-50",
                ].join(" ")}
                aria-current={active ? "page" : undefined}
              >
                <span className="text-[10px] text-slate-400 mr-1 align-top" aria-hidden>{n.num}</span>
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setBig((v) => !v)}
            aria-pressed={big}
            title="큰글씨 모드"
            className={`hidden sm:inline-flex items-center gap-1 px-3 py-2 rounded-xl text-sm border ${big ? "bg-brand text-white border-brand" : "bg-white border-slate-300"}`}
          >
            <span aria-hidden>🔠</span><span>큰글씨</span>
          </button>
          <button
            onClick={() => setContrast((v) => !v)}
            aria-pressed={contrast}
            title="고대비 모드"
            className={`hidden sm:inline-flex items-center gap-1 px-3 py-2 rounded-xl text-sm border ${contrast ? "bg-black text-white border-black" : "bg-white border-slate-300"}`}
          >
            <span aria-hidden>◑</span><span>고대비</span>
          </button>
          <button
            onClick={() => setMobOpen((v) => !v)}
            aria-expanded={mobOpen}
            aria-label="메뉴 열기"
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl border border-slate-300 bg-white"
          >☰</button>
        </div>
      </div>

      {/* 모바일 펼침 */}
      {mobOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white" role="menu">
          <div className="max-w-6xl mx-auto px-4 py-2 flex flex-wrap gap-1">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} onClick={() => setMobOpen(false)}
                className="px-3 py-2 rounded-xl text-sm bg-brand-50 text-brand-700 font-medium">
                {n.num} {n.label}
              </Link>
            ))}
            <button onClick={() => setBig((v) => !v)} className={`px-3 py-2 rounded-xl text-sm border ${big ? "bg-brand text-white border-brand" : "bg-white border-slate-300"}`}>큰글씨</button>
            <button onClick={() => setContrast((v) => !v)} className={`px-3 py-2 rounded-xl text-sm border ${contrast ? "bg-black text-white border-black" : "bg-white border-slate-300"}`}>고대비</button>
          </div>
        </div>
      )}
    </header>
  );
}
