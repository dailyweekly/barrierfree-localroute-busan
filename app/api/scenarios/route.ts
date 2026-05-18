import { NextResponse } from "next/server";
import { SCENARIOS } from "@/lib/scenarios";
import { loadElevatorAltRoutes } from "@/lib/data/elevator";
import { loadRidership } from "@/lib/data/ridership";
import { loadVenues } from "@/lib/data/venue";
import { loadTaxulang } from "@/lib/data/taxulang";
import { recommend } from "@/lib/routing/rank";
import type { ScenarioResult } from "@/lib/types";

export async function GET() {
  const [elevatorRows, ridership, venues, restaurants] = await Promise.all([
    loadElevatorAltRoutes(),
    loadRidership(),
    loadVenues(),
    loadTaxulang(),
  ]);

  const results: ScenarioResult[] = SCENARIOS.map((sc) => {
    const { candidates } = recommend({ query: sc.query, elevatorRows, ridership, venues, restaurants });
    // 안전 우선 경로가 통과 가능해야 함
    const safe = candidates.find((c) => c.kind === "safe");
    let pass = !!safe?.passable;
    let reason = pass ? "안전 경로 이동가능" : "안전 경로 이동불가 → 폴백 안내";
    // 금지 유형 검증
    if (sc.expected.forbiddenTypes && safe) {
      const types = safe.alternativeType.split(/[,\/]/).map((s) => s.trim());
      const violated = sc.expected.forbiddenTypes.some((f) => types.includes(f));
      if (violated) {
        pass = false;
        reason = `금지 유형 추천: ${sc.expected.forbiddenTypes.join(",")}`;
      }
    }
    return { id: sc.id, title: sc.title, pass, reason };
  });

  const passCount = results.filter((r) => r.pass).length;
  const passRate = results.length > 0 ? passCount / results.length : 0;

  return NextResponse.json({
    results,
    summary: {
      total: results.length,
      pass: passCount,
      fail: results.length - passCount,
      passRate: Number(passRate.toFixed(3)),
    },
    generatedAt: new Date().toISOString(),
  });
}
