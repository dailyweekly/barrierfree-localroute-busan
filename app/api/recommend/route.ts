import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { loadElevatorAltRoutes, listStations } from "@/lib/data/elevator";
import { loadRidership } from "@/lib/data/ridership";
import { loadVenues } from "@/lib/data/venue";
import { loadTaxulang } from "@/lib/data/taxulang";
import { recommend } from "@/lib/routing/rank";
import { explainCandidate } from "@/lib/llm/claude";
import { DATA_SOURCES } from "@/lib/data/sources";
import type { UserType, Preference, LLMExplanation } from "@/lib/types";

const QuerySchema = z.object({
  startStation: z.string().min(1),
  endStation: z.string().min(1),
  travelHour: z.number().int().min(0).max(23),
  travelDow: z.number().int().min(0).max(6),
  userType: z.enum(["wheelchair", "elderly", "pregnant", "infant", "luggage", "general"]),
  preferences: z.array(z.enum(["safety", "low_congestion", "min_transfer", "include_local"])).default([]),
  explain: z.boolean().optional().default(true),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 JSON 본문" }, { status: 400 });
  }
  const parsed = QuerySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "유효성 검증 실패", issues: parsed.error.issues }, { status: 400 });
  }
  const query = {
    startStation: parsed.data.startStation,
    endStation: parsed.data.endStation,
    travelHour: parsed.data.travelHour,
    travelDow: parsed.data.travelDow,
    userType: parsed.data.userType as UserType,
    preferences: parsed.data.preferences as Preference[],
  };

  const [elevatorRows, ridership, venues, restaurants] = await Promise.all([
    loadElevatorAltRoutes(),
    loadRidership(),
    loadVenues(),
    loadTaxulang(),
  ]);

  const { candidates, notes } = recommend({
    query, elevatorRows, ridership, venues, restaurants,
  });

  const explanations: Record<string, LLMExplanation | null> = {
    safe: null, low_congestion: null, include_local: null,
  };
  if (parsed.data.explain) {
    const knownStations = new Set(listStations(elevatorRows));
    for (const c of candidates) {
      explanations[c.kind] = await explainCandidate(c, query, knownStations);
    }
  }

  // 데이터 활용 추적 — 어느 데이터가 어디에 활용됐는지 응답에 명시
  // (서식6 후원기관 데이터 활용 증빙에 직접 인용 가능)
  const usageTrace = {
    "15151579": {
      provider: "부산교통공사",
      role: "경로 후보 산출 + 점수화 정답 라벨",
      usedCount: elevatorRows.filter((r) => r["역명"] === query.startStation || r["역명"] === query.endStation).length,
      totalCount: elevatorRows.length,
      labels: ["경로_이용_가능_여부", "대체경로유형", "경로복잡도_점수", "경로복잡도_등급", "학습라벨", "단계별_대체_경로"],
    },
    "3057229": {
      provider: "부산교통공사",
      role: "시간대별 예상혼잡 지표 산정",
      usedCount: ridership.filter((r) => r["역명"] === query.startStation || r["역명"] === query.endStation).length,
      totalCount: ridership.length,
      labels: ["역명", "요일", "구분", "01시-02시 ~ 24시-01시(24개)"],
    },
    "15156491": {
      provider: "부산관광공사",
      role: "include_local 경로 — MICE/관광 목적지 후보",
      usedCount: venues.length,
      totalCount: venues.length,
      labels: ["베뉴명", "위치"],
    },
    "15143578": {
      provider: "부산광역시",
      role: "include_local 경로 — 로컬상권 연계",
      usedCount: restaurants.length,
      totalCount: restaurants.length,
      labels: ["식당명", "분류", "주소", "위경도"],
    },
  };

  // 추천 결과의 sourceIds — 어떤 엘리베이터 고유번호가 추천 근거인지
  const sourceCells = candidates.map((c) => ({
    kind: c.kind,
    elevatorIds: c.rationale.complexity.sourceIds,
    passabilityLabels: c.rationale.passability.sourceLabel,
    congestionStation: c.rationale.congestion.sourceStation,
    congestionHour: c.rationale.congestion.sourceHour,
  }));

  return NextResponse.json({
    query,
    candidates,
    explanations,
    notes,
    dataSources: DATA_SOURCES.map((s) => ({ ...s, count: s.id === "15151579" ? elevatorRows.length : s.id === "3057229" ? ridership.length : s.id === "15156491" ? venues.length : s.id === "15143578" ? restaurants.length : 0 })),
    usageTrace,
    sourceCells,
    timestamp: new Date().toISOString(),
  });
}
