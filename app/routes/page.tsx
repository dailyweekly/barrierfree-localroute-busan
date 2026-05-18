import Link from "next/link";
import { headers } from "next/headers";
import { RouteCard } from "../../components/RouteCard";
import type { LLMExplanation, RouteCandidate } from "../../lib/types";

interface RecommendResponse {
  query: { startStation: string; endStation: string; travelHour: number; travelDow: number; userType: string; preferences: string[] };
  candidates: RouteCandidate[];
  explanations: Record<string, LLMExplanation | null>;
  notes: string[];
  dataSources: { id: string; name: string; provider?: string; license?: string; refreshFreq?: string; lastUpdated?: string; count: number }[];
  usageTrace?: Record<string, { provider: string; role: string; usedCount: number; totalCount: number; labels: string[] }>;
}

const DOW_KOR = ["일", "월", "화", "수", "목", "금", "토"];
const USER_LABEL: Record<string, string> = { wheelchair: "♿ 휠체어", elderly: "🧓 고령자", pregnant: "🤰 임산부", infant: "👶 유아동반", luggage: "🧳 캐리어", general: "🚶 일반" };
const PREF_LABEL: Record<string, string> = { safety: "🛡️ 안전 우선", low_congestion: "🌊 혼잡 회피", min_transfer: "🔁 환승 최소", include_local: "🍜 로컬 포함" };

async function getRecommendation(sp: { [k: string]: string | string[] | undefined }) {
  const start = String(sp.start ?? "서면역");
  const end = String(sp.end ?? "남포역");
  const hour = Number(sp.hour ?? 10);
  const dow = Number(sp.dow ?? 2);
  const user = String(sp.user ?? "wheelchair");
  const prefRaw = sp.pref ? String(sp.pref) : "safety,low_congestion";
  const prefs = prefRaw.split(",").filter(Boolean);
  const h = headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("host") ?? "localhost:3000";
  const res = await fetch(`${proto}://${host}/api/recommend`, {
    method: "POST", headers: { "Content-Type": "application/json" }, cache: "no-store",
    body: JSON.stringify({ startStation: start, endStation: end, travelHour: hour, travelDow: dow, userType: user, preferences: prefs, explain: true }),
  });
  if (!res.ok) return { error: `${res.status} ${res.statusText}` } as const;
  return (await res.json()) as RecommendResponse;
}

export default async function RoutesPage({ searchParams }: { searchParams: { [k: string]: string | string[] | undefined } }) {
  const r = await getRecommendation(searchParams);
  if ("error" in r) {
    return (
      <div className="card p-6 appear">
        <p className="text-warn font-bold">추천 결과를 가져오지 못했습니다: {r.error}</p>
        <Link href="/" className="btn-ghost mt-3 inline-block">← 입력으로 돌아가기</Link>
      </div>
    );
  }
  const { query, candidates, explanations, notes, dataSources, usageTrace } = r;

  return (
    <div className="space-y-6 appear">
      {/* 요약 헤더 */}
      <section className="card p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="chip chip-brand">② 경로 후보 비교</span>
          <span className="chip chip-brand">③ AI 추천 근거 설명</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <div className="text-sm text-slate-500">선택한 조건</div>
            <div className="font-extrabold text-brand-700 text-lg">
              {query.startStation} <span className="text-slate-400 mx-1">→</span> {query.endStation}
            </div>
            <div className="flex flex-wrap gap-1 mt-2 text-xs">
              <span className="chip chip-brand">{DOW_KOR[query.travelDow]}요일 {String(query.travelHour).padStart(2, "0")}시</span>
              <span className="chip chip-brand">{USER_LABEL[query.userType] ?? query.userType}</span>
              {query.preferences.map((p) => <span key={p} className="chip">{PREF_LABEL[p] ?? p}</span>)}
            </div>
          </div>
          <Link href="/" className="btn-ghost text-sm whitespace-nowrap">← 조건 다시 입력</Link>
        </div>
        {notes.length > 0 && (
          <ul className="mt-3 text-sm bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-1">
            {notes.map((n, i) => <li key={i} className="text-amber-800">⚠ {n}</li>)}
          </ul>
        )}
      </section>

      {/* 경로 3종 */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4" aria-label="경로 후보 3종">
        {candidates.map((c) => (
          <RouteCard key={c.kind} candidate={c} explanation={explanations[c.kind] ?? null} />
        ))}
      </section>

      {/* 데이터 활용 추적 */}
      {usageTrace && (
        <section className="card p-5">
          <h3 className="text-base font-extrabold text-brand-700 mb-3">이 추천에 사용된 공공데이터</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {Object.entries(usageTrace).map(([id, u]) => (
              <div key={id} className="border border-slate-200 rounded-xl p-3 bg-bg-soft">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-brand-700">{u.provider}</span>
                  <span className="chip chip-brand">{id}</span>
                </div>
                <div className="text-xs text-slate-600 mt-1">{u.role}</div>
                <div className="text-xs text-slate-500 mt-1">행 활용: {u.usedCount} / {u.totalCount}</div>
                <div className="text-[11px] text-slate-400 mt-1 font-mono break-all">{u.labels.join(" · ")}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 데이터 메타 */}
      <section className="card p-5">
        <h3 className="text-base font-extrabold text-brand-700 mb-3">사용 공공데이터 메타 (라이선스 명시)</h3>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {dataSources.map((d) => (
            <li key={d.id} className="border rounded-xl px-3 py-2 flex flex-col">
              <div className="flex justify-between items-start gap-2">
                <span className="font-semibold text-brand-700">{d.name}</span>
                <span className="text-slate-400 font-mono text-[10px]">{d.id}</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-1 text-[10px] text-slate-500">
                <span>{d.provider}</span>
                {d.license && <span>· {d.license}</span>}
                {d.refreshFreq && <span>· {d.refreshFreq}</span>}
                {d.lastUpdated && <span>· {d.lastUpdated}</span>}
                <span>· 행 {d.count.toLocaleString()}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div className="flex flex-wrap gap-3 justify-between">
        <Link href={`/local?start=${query.startStation}&end=${query.endStation}`} className="btn-primary">④ 로컬루트 확장 보기 →</Link>
        <Link href="/admin" className="btn-ghost">⑤ 관리자/심사 대시보드 →</Link>
      </div>
    </div>
  );
}
