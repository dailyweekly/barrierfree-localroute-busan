"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const STEPS = [
  { num: "1", label: "조건 입력",  href: "/",       match: (p: string) => p === "/" },
  { num: "2", label: "경로 비교",  href: "/routes", match: (p: string) => p.startsWith("/routes") },
  { num: "3", label: "AI 설명",    href: "/routes", match: (p: string) => p.startsWith("/routes") },
  { num: "4", label: "반나절 코스", href: "/local",  match: (p: string) => p.startsWith("/local") },
  { num: "5", label: "대시보드",   href: "/admin",  match: (p: string) => p.startsWith("/admin") },
];

export default function Steps() {
  const pathname = usePathname() ?? "/";
  const activeIdx = STEPS.findIndex((s) => s.match(pathname));
  return (
    <nav aria-label="진행 단계" className="card p-3 sm:p-4">
      <ol className="flex items-center justify-between gap-1 sm:gap-2 overflow-x-auto">
        {STEPS.map((s, i) => {
          const isActive = i === activeIdx || (activeIdx === 1 && i === 2);
          const isPast = activeIdx > i || (activeIdx === 2 && i <= 2);
          return (
            <li key={s.num + s.label} className="flex-1 min-w-0">
              <Link href={s.href} className="flex flex-col items-center text-center group" aria-current={isActive ? "step" : undefined}>
                <span
                  aria-hidden
                  className={[
                    "w-8 h-8 sm:w-9 sm:h-9 rounded-full grid place-items-center text-xs sm:text-sm font-bold transition",
                    isActive ? "bg-brand-700 text-white shadow-card" : isPast ? "bg-brand-100 text-brand-700" : "bg-slate-100 text-slate-400",
                  ].join(" ")}
                >
                  {s.num}
                </span>
                <span className={`mt-1 text-[10px] sm:text-xs font-medium ${isActive ? "text-brand-700" : isPast ? "text-slate-600" : "text-slate-400"}`}>
                  {s.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
