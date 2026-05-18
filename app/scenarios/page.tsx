import Link from "next/link";
import { headers } from "next/headers";
import { SCENARIOS } from "../../lib/scenarios";
import type { Scenario } from "../../lib/types";

interface ScenariosResp {
  results: { id: number; title: string; pass: boolean; reason: string }[];
  summary: { total: number; pass: number; fail: number; passRate: number };
  generatedAt: string;
}

async function getResults(): Promise<ScenariosResp> {
  const h = headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("host") ?? "localhost:3000";
  const res = await fetch(`${proto}://${host}/api/scenarios`, { cache: "no-store" });
  return res.json();
}

const USER_ICON: Record<string, string> = {
  wheelchair: "♿", elderly: "🧓", pregnant: "🤰", infant: "👶", luggage: "🧳", general: "🚶",
};

function trialHref(s: Scenario): string {
  const q = new URLSearchParams({
    start: s.query.startStation,
    end: s.query.endStation,
    hour: String(s.query.travelHour),
    dow: String(s.query.travelDow),
    user: s.query.userType,
    pref: s.query.preferences.join(","),
  });
  return `/routes?${q.toString()}`;
}

export const dynamic = "force-dynamic";

export default async function ScenariosPage() {
  const r = await getResults();
  const passById = new Map<number, { pass: boolean; reason: string }>();
  r.results.forEach((x) => passById.set(x.id, { pass: x.pass, reason: x.reason }));

  return (
    <div className="space-y-6 appear">
      <section className="card p-5 sm:p-6 bg-gradient-to-br from-brand-50 to-white">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <span className="chip chip-brand">서비스 자체 테스트</span>
            <h1 className="mt-2 text-xl sm:text-2xl font-extrabold text-brand-700">시나리오 20종 시연 — 실제 동작 확인</h1>
            <p className="text-sm text-slate-600 mt-1">교통약자·관광약자의 자주 발생하는 이동 상황 20개를 미리 정의해, 본 서비스가 매번 안전한 경로를 추천하는지 자동 검증합니다.</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-extrabold text-brand-700">{Math.round(r.summary.passRate * 100)}%</div>
            <div className="text-xs text-slate-500">통과 {r.summary.pass} / {r.summary.total}</div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {SCENARIOS.map((s) => {
          const r = passById.get(s.id);
          return (
            <article key={s.id} className="card card-hov p-4">
              <header className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span className="font-mono">#{String(s.id).padStart(2, "0")}</span>
                    <span aria-hidden>{USER_ICON[s.query.userType] ?? "🚶"}</span>
                    <span>{s.checkPoint}</span>
                  </div>
                  <h2 className="font-bold text-brand-700 mt-1">{s.title}</h2>
                </div>
                {r && (r.pass
                  ? <span className="chip chip-ok shrink-0">✓ 통과</span>
                  : <span className="chip chip-warn shrink-0">⚠ 실패</span>)}
              </header>
              <div className="mt-2 text-xs text-slate-600">{s.query.startStation} → {s.query.endStation} · {String(s.query.travelHour).padStart(2, "0")}시</div>
              {r && !r.pass && <p className="text-xs text-warn mt-1">{r.reason}</p>}
              <Link href={trialHref(s)} className="btn-ghost mt-3 inline-block text-xs">이 시나리오 시연 →</Link>
            </article>
          );
        })}
      </section>
    </div>
  );
}
