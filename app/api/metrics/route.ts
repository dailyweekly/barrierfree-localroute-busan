import { NextResponse } from "next/server";
import { loadElevatorAltRoutes } from "../../../lib/data/elevator";
import { loadRidership } from "../../../lib/data/ridership";
import { loadVenues } from "../../../lib/data/venue";
import { loadTaxulang } from "../../../lib/data/taxulang";
import { loadGalmaegil } from "../../../lib/data/galmaegil";
import { SCENARIOS } from "../../../lib/scenarios";
import { recommend } from "../../../lib/routing/rank";
import type { ModelMetrics } from "../../../lib/types";
import { ESG_KPIS, ESG_PILLARS } from "../../../lib/business/esg";
import { evaluateAll } from "../../../lib/eval/metrics";
import { guardrailStats } from "../../../lib/llm/log";
import { DATA_SOURCES } from "../../../lib/data/sources";

export async function GET() {
  const [elev, ride, ven, tax, gal] = await Promise.all([
    loadElevatorAltRoutes(), loadRidership(), loadVenues(), loadTaxulang(), loadGalmaegil(),
  ]);

  // 라벨 분포
  const labelDist: Record<string, number> = {};
  const typeDist: Record<string, number> = {};
  const gradeDist: Record<string, number> = {};
  for (const r of elev) {
    labelDist[r["학습라벨"]] = (labelDist[r["학습라벨"]] ?? 0) + 1;
    typeDist[r["대체경로유형"]] = (typeDist[r["대체경로유형"]] ?? 0) + 1;
    gradeDist[r["경로복잡도_등급"]] = (gradeDist[r["경로복잡도_등급"]] ?? 0) + 1;
  }

  // ESG KPI 동적 계산 (시나리오 결과 기반)
  let scenarioPassCount = 0;
  let impassableRecommended = 0;
  let localIncludedCount = 0;
  let totalSafeComplexity = 0;
  let totalLocalComplexity = 0;
  for (const sc of SCENARIOS) {
    const { candidates } = recommend({ query: sc.query, elevatorRows: elev, ridership: ride, venues: ven, restaurants: tax });
    const safe = candidates.find((c) => c.kind === "safe");
    const local = candidates.find((c) => c.kind === "include_local");
    if (safe?.passable) scenarioPassCount++;
    if (safe && !safe.passable) impassableRecommended++;
    if (local && local.alternativeType && local.alternativeType !== "확인 필요") localIncludedCount++;
    if (safe) totalSafeComplexity += safe.complexityScore;
    if (local) totalLocalComplexity += local.complexityScore;
  }
  const total = SCENARIOS.length;
  const scenarioPassRate = total > 0 ? scenarioPassCount / total : 0;
  const impassableRate = total > 0 ? impassableRecommended / total : 0;
  const localIncludeRate = total > 0 ? localIncludedCount / total : 0;
  const avgSafeComplexity = total > 0 ? totalSafeComplexity / total : 0;

  // 실제 K-fold 평가 (lib/eval/metrics.ts)
  const ev = evaluateAll(elev, 5, 42);
  // 환각 검출률 = 가드레일 reject 비율
  const gstats = guardrailStats();

  const metrics: ModelMetrics = {
    passabilityF1: ev.passability.f1,
    alternativeTypeMacroF1: ev.altType.macroF1,
    complexityMAE: ev.complexity.mae,
    complexityRMSE: ev.complexity.rmse,
    rankingSpearman: ev.ranking.spearman,
    top1Success: ev.ranking.top1Success,
    congestionMAPE: null,
    scenarioPassRate: Number(scenarioPassRate.toFixed(3)),
    hallucinationDetectionRate: gstats.total > 0 ? gstats.rejectionRate : null,
    generatedAt: new Date().toISOString(),
  };

  // ESG KPI 결과 — 신청서 §3 6종
  const esgKpiResults = ESG_KPIS.map((k) => {
    const r: { name: string; description: string; target: string; current: string } = {
      name: k.name, description: k.description, target: k.target, current: k.current,
    };
    if (k.name.includes("교통약자 경로 도달 성공률")) {
      r.current = (scenarioPassRate * 100).toFixed(1) + "% (시나리오 20종)";
    } else if (k.name.includes("이동불가 경로 추천율")) {
      r.current = (impassableRate * 100).toFixed(1) + "%";
    } else if (k.name.includes("고복잡도 경로 회피율")) {
      r.current = "안전 경로 평균 복잡도 " + avgSafeComplexity.toFixed(1) + " 점";
    } else if (k.name.includes("로컬상권 연결률")) {
      r.current = (localIncludeRate * 100).toFixed(1) + "%";
    }
    return r;
  });

  const counts: Record<string, number> = {
    "15151579": elev.length, "3057229": ride.length, "15156491": ven.length, "15077591": gal.length, "15143578": tax.length,
  };
  const datasets = DATA_SOURCES.map((s) => ({
    ...s, count: counts[s.id] ?? 0,
  }));

  return NextResponse.json({
    datasets,
    elevatorDist: { learningLabel: labelDist, alternativeType: typeDist, grade: gradeDist },
    metrics,
    eval: ev,
    guardrail: gstats,
    esg: { pillars: ESG_PILLARS, kpis: esgKpiResults },
    notes: [
      "시간대별 승하차인원은 월간 갱신 데이터로, 시간대 기반 예상혼잡 산정에만 사용 (실시간 예측 아님).",
      "성능지표는 학습라벨 기반 K-fold 교차검증으로 실측 (lib/eval/metrics.ts).",
      "환각 검출률은 LLM 호출 ring-buffer 기준 reject 비율 (lib/llm/log.ts).",
      "이동불가 경로 추천율 목표 0%, 시나리오 통과율 목표 95%.",
    ],
  });
}
