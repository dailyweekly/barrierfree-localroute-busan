import { headers } from "next/headers";
import type { ScenarioResult, ModelMetrics } from "@/lib/types";
import Donut from "@/components/Donut";
import BarList from "@/components/BarList";

interface MetricsResp {
  datasets: {
    id: string; name: string; count: number;
    provider?: string; providerType?: string; fileDataUrl?: string;
    license?: string; refreshFreq?: string; lastUpdated?: string;
    columns?: number; role?: string; usage?: string; riskNote?: string;
    refreshed?: string;
  }[];
  guardrail?: { total: number; rejected: number; rejectionRate: number; recent: { at: string; routeKind: string; rejected: boolean; reason?: string }[] };
  eval?: {
    passability: { accuracy: number; precision: number; recall: number; f1: number; folds: number };
    altType: { macroF1: number; folds: number };
    complexity: { mae: number; rmse: number; n: number };
    ranking: { spearman: number; top1Success: number; n: number };
    evaluatedAt: string;
  };
  elevatorDist: {
    learningLabel: Record<string, number>;
    alternativeType: Record<string, number>;
    grade: Record<string, number>;
  };
  metrics: ModelMetrics;
  esg?: {
    pillars: { axis: string; body: string }[];
    kpis: { name: string; description: string; target: string; current: string }[];
  };
  notes: string[];
}

interface ScenariosResp {
  results: ScenarioResult[];
  summary: { total: number; pass: number; fail: number; passRate: number };
  generatedAt: string;
}

async function fetchAll() {
  const h = headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("host") ?? "localhost:3000";
  const [m, s] = await Promise.all([
    fetch(`${proto}://${host}/api/metrics`, { cache: "no-store" }).then((r) => r.json() as Promise<MetricsResp>),
    fetch(`${proto}://${host}/api/scenarios`, { cache: "no-store" }).then((r) => r.json() as Promise<ScenariosResp>),
  ]);
  return { m, s };
}

export default async function AdminPage() {
  const { m, s } = await fetchAll();
  return (
    <div className="space-y-6">
      <section className="bg-white rounded-2xl border border-slate-200 p-5">
        <h2 className="text-xl font-bold text-brand">⑤ 관리자/심사 대시보드</h2>
        <p className="text-sm text-slate-600 mt-1">사용 데이터, 모델 성능, 시나리오 20종 통과 결과, 라벨 분포를 한눈에 확인합니다.</p>
      </section>

      <section className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="text-base font-bold mb-3">사용 공공데이터 ({m.datasets.length}종)</h3>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="p-2">ID</th><th className="p-2">데이터명</th><th className="p-2">제공기관</th>
              <th className="p-2 text-right">행수</th><th className="p-2">갱신주기</th>
              <th className="p-2">최신</th><th className="p-2">라이선스</th><th className="p-2">활용 위치</th>
            </tr>
          </thead>
          <tbody>
            {m.datasets.map((d) => (
              <tr key={d.id} className="border-t align-top">
                <td className="p-2 text-slate-500">{d.id}</td>
                <td className="p-2"><a href={d.fileDataUrl} target="_blank" rel="noreferrer" className="text-brand underline">{d.name}</a></td>
                <td className="p-2 text-slate-600">{d.provider} <span className="text-xs text-slate-400">({d.providerType})</span></td>
                <td className="p-2 text-right">{d.count.toLocaleString()}</td>
                <td className="p-2 text-slate-500">{d.refreshFreq}</td>
                <td className="p-2 text-slate-500">{d.lastUpdated}</td>
                <td className="p-2 text-xs text-slate-500">{d.license}</td>
                <td className="p-2 text-xs">{d.usage}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {m.eval && (
        <section className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="text-base font-bold mb-3">학습라벨 기반 K-fold 평가 (lib/eval/metrics.ts)</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
            <Kpi label={`이용가능성 F1 (k=${m.eval.passability.folds})`} value={m.eval.passability.f1} />
            <Kpi label={`이용가능성 Accuracy`} value={m.eval.passability.accuracy} />
            <Kpi label={`대체경로 Macro F1`} value={m.eval.altType.macroF1} />
            <Kpi label={`복잡도 MAE`} value={m.eval.complexity.mae} />
            <Kpi label={`복잡도 RMSE`} value={m.eval.complexity.rmse} />
            <Kpi label={`랭킹 Spearman`} value={m.eval.ranking.spearman} />
            <Kpi label={`Top-1 성공률 (n=${m.eval.ranking.n})`} value={m.eval.ranking.top1Success} />
            <Kpi label={`회귀 표본 수`} value={m.eval.complexity.n} />
          </div>
          <p className="text-xs text-slate-400 mt-2">평가 시각: {m.eval.evaluatedAt}</p>
        </section>
      )}

      {m.guardrail && (
        <section className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="text-base font-bold mb-3">LLM 가드레일 로그 (lib/llm/log.ts)</h3>
          <div className="grid grid-cols-3 gap-2 text-sm mb-3">
            <Kpi label="총 호출" value={m.guardrail.total} />
            <Kpi label="reject 건수" value={m.guardrail.rejected} />
            <Kpi label="환각 검출률" value={m.guardrail.rejectionRate} />
          </div>
          {m.guardrail.recent.length > 0 && (
            <details>
              <summary className="text-xs text-brand cursor-pointer">최근 호출 20건</summary>
              <ul className="mt-2 space-y-1 text-xs">
                {m.guardrail.recent.map((r, i) => (
                  <li key={i} className={r.rejected ? "text-warn" : "text-slate-600"}>
                    [{r.at}] {r.routeKind} — {r.rejected ? `reject: ${r.reason ?? "—"}` : "ok"}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </section>
      )}

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <h4 className="font-semibold mb-3 text-sm">학습라벨 분포 (15151579)</h4>
          <BarList data={Object.entries(m.elevatorDist.learningLabel).map(([label, value]) => ({ label, value }))} />
        </div>
        <div className="card p-4">
          <h4 className="font-semibold mb-3 text-sm">대체경로유형 분포</h4>
          <BarList data={Object.entries(m.elevatorDist.alternativeType).map(([label, value]) => ({ label, value }))} />
        </div>
        <div className="card p-4">
          <h4 className="font-semibold mb-3 text-sm">복잡도 등급 분포</h4>
          <BarList data={Object.entries(m.elevatorDist.grade).map(([label, value]) => ({ label, value }))} />
        </div>
      </section>

      <section className="card p-5">
        <h3 className="text-base font-bold mb-3">시나리오 20종 통과 한눈에</h3>
        <div className="flex flex-wrap items-center gap-6">
          <Donut value={s.summary.pass} total={s.summary.total} label="통과율" color={s.summary.passRate >= 0.95 ? "#16A34A" : s.summary.passRate >= 0.7 ? "#F59E0B" : "#DC2626"} />
          <div className="flex-1 min-w-[240px]">
            <BarList
              max={s.summary.total}
              data={[
                { label: "✓ 통과",    value: s.summary.pass, color: "linear-gradient(90deg, #16A34A, #84CC16)" },
                { label: "⚠ 실패",    value: s.summary.fail, color: "linear-gradient(90deg, #DC2626, #F97316)" },
              ]}
            />
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="text-base font-bold mb-3">AI 모델 성능 (K-fold 교차검증 예정)</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
          {Object.entries({
            "이용가능성 F1": m.metrics.passabilityF1,
            "대체경로 Macro F1": m.metrics.alternativeTypeMacroF1,
            "복잡도 MAE": m.metrics.complexityMAE,
            "복잡도 RMSE": m.metrics.complexityRMSE,
            "Top-1 성공률": m.metrics.top1Success,
            "랭킹 Spearman": m.metrics.rankingSpearman,
            "혼잡 MAPE": m.metrics.congestionMAPE,
            "환각 검출률": m.metrics.hallucinationDetectionRate,
          }).map(([k, v]) => (
            <div key={k} className="border rounded-lg p-3">
              <div className="text-xs text-slate-500">{k}</div>
              <div className="font-bold">{v === null ? "검증 진행 중" : String(v)}</div>
            </div>
          ))}
        </div>
        <ul className="mt-3 text-xs text-slate-500 list-disc list-inside space-y-1">
          {m.notes.map((n, i) => <li key={i}>{n}</li>)}
        </ul>
      </section>

      <section className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="text-base font-bold mb-2">시나리오 20종 결과
          <span className="ml-3 text-sm font-normal text-slate-500">통과 {s.summary.pass} / {s.summary.total} ({Math.round(s.summary.passRate * 100)}%)</span>
        </h3>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr><th className="p-2 w-12">#</th><th className="p-2">시나리오</th><th className="p-2 w-24">결과</th><th className="p-2">사유</th></tr>
          </thead>
          <tbody>
            {s.results.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-2 text-slate-500">{r.id}</td>
                <td className="p-2">{r.title}</td>
                <td className="p-2">
                  {r.pass
                    ? <span className="text-ok font-semibold">✅ 통과</span>
                    : <span className="text-warn font-semibold">⚠ 실패</span>}
                </td>
                <td className="p-2 text-xs text-slate-500">{r.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {m.esg && (
        <section className="bg-white rounded-2xl border border-slate-200 p-5" aria-labelledby="esg-admin-h">
          <h3 id="esg-admin-h" className="text-base font-bold mb-3">ESG 정량 지표 (§3 — 5점)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mb-4">
            {m.esg.pillars.map((p) => (
              <div key={p.axis} className="border rounded-lg p-3 bg-slate-50">
                <div className="text-xs font-bold text-brand">{p.axis}</div>
                <p className="text-slate-700 mt-1">{p.body}</p>
              </div>
            ))}
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left">
              <tr><th className="p-2">지표</th><th className="p-2">측정</th><th className="p-2">목표</th><th className="p-2">현재</th></tr>
            </thead>
            <tbody>
              {m.esg.kpis.map((k) => (
                <tr key={k.name} className="border-t align-top">
                  <td className="p-2 font-semibold">{k.name}</td>
                  <td className="p-2 text-slate-600">{k.description}</td>
                  <td className="p-2 font-bold text-brand">{k.target}</td>
                  <td className="p-2 text-slate-700">{k.current}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <section className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="text-base font-bold mb-2">금지표현 가드레일</h3>
        <p className="text-xs text-slate-600 mb-2">
          LLM 출력 및 코드/문서 전체에 대해 "실시간 고장 감지", "실시간 혼잡 예측", "100% 안전" 등의 표현 사용 여부를 자동 점검합니다.
        </p>
        <code className="text-xs bg-slate-50 border rounded px-2 py-1">npm run check-forbidden</code>
      </section>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: number }) {
  return (
    <div className="border rounded-lg p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="font-bold text-brand">{value}</div>
    </div>
  );
}

function DistCard({ title, dist }: { title: string; dist: Record<string, number> }) {
  const total = Object.values(dist).reduce((a, b) => a + b, 0) || 1;
  const entries = Object.entries(dist).sort((a, b) => b[1] - a[1]);
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4">
      <h4 className="font-semibold mb-2 text-sm">{title}</h4>
      <ul className="space-y-2 text-sm">
        {entries.map(([k, v]) => (
          <li key={k}>
            <div className="flex justify-between text-xs">
              <span>{k || "(미상)"}</span><span>{v}</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-brand" style={{ width: `${(v / total) * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
