// 사용자 조건에 따라 3개 후보 경로 산출
// safe / low_congestion / include_local

import "server-only";
import type {
  ElevatorAltRoute,
  RidershipRow,
  RouteCandidate,
  UserQuery,
  UniqueVenue,
  TaxulangRestaurant,
} from "@/lib/types";
import { estimateCongestion } from "@/lib/congestion/estimate";
import { buildCandidate, scoreRow, combinedScore, ScoredRoute } from "./score";

export interface RecommendInput {
  query: UserQuery;
  elevatorRows: ElevatorAltRoute[];
  ridership: RidershipRow[];
  venues: UniqueVenue[];
  restaurants: TaxulangRestaurant[];
}

export interface RecommendOutput {
  candidates: RouteCandidate[];
  notes: string[];
}

export function recommend(input: RecommendInput): RecommendOutput {
  const { query, elevatorRows, ridership } = input;
  const startRows = elevatorRows.filter((r) => r.역명 === query.startStation);
  const endRows = elevatorRows.filter((r) => r.역명 === query.endStation);

  const notes: string[] = [];
  if (startRows.length === 0) notes.push(`'${query.startStation}' 역 데이터가 없어 일반 안내로 대체합니다. (확인 필요)`);
  if (endRows.length === 0) notes.push(`'${query.endStation}' 역 데이터가 없어 일반 안내로 대체합니다. (확인 필요)`);

  // 후보 행 점수화 (이동불가 행은 학습라벨/이용가능여부 기준으로 보존하되 추천에서 페널티)
  const startScored = startRows.map((r) => scoreRow(r, query.userType));
  const endScored = endRows.map((r) => scoreRow(r, query.userType));

  const congestionStart = estimateCongestion(ridership, query.startStation, query.travelHour, query.travelDow);
  const congestionEnd = estimateCongestion(ridership, query.endStation, query.travelHour, query.travelDow);

  // 안전 우선: 이동가능 + 복잡도 낮은 순
  const safeRows = pickSafe(startScored, endScored);
  // 혼잡 회피: 안전 충족 + 혼잡 점수 가산
  const lowCongRows = pickLowCongestion(startScored, endScored, congestionStart, congestionEnd, query);
  // 로컬 포함: 안전 충족 + 로컬 가산 (실제 로컬 추가는 별도 API에서)
  const localRows = pickLocal(startScored, endScored);

  const safe = buildCandidate("safe", safeRows, query.startStation, query.endStation, congestionStart, congestionEnd);
  const lowC = buildCandidate("low_congestion", lowCongRows, query.startStation, query.endStation, congestionStart, congestionEnd);
  const local = buildCandidate("include_local", localRows, query.startStation, query.endStation, congestionStart, congestionEnd);

  return { candidates: [safe, lowC, local], notes };
}

function pickSafe(s: ScoredRoute[], e: ScoredRoute[]): ScoredRoute[] {
  const pool = [...s, ...e].filter((r) => r.passable);
  pool.sort((a, b) => a.complexityScore - b.complexityScore);
  return pool.slice(0, 3);
}

function pickLowCongestion(
  s: ScoredRoute[],
  e: ScoredRoute[],
  cgS: { level: string; score: number },
  cgE: { level: string; score: number },
  query: UserQuery
): ScoredRoute[] {
  const pool = [...s, ...e].filter((r) => r.passable);
  pool.sort((a, b) => {
    const aScore = combinedScore(a, cgS as any, query.userType, ["low_congestion", ...query.preferences]);
    const bScore = combinedScore(b, cgE as any, query.userType, ["low_congestion", ...query.preferences]);
    return aScore - bScore;
  });
  return pool.slice(0, 3);
}

function pickLocal(s: ScoredRoute[], e: ScoredRoute[]): ScoredRoute[] {
  const pool = [...s, ...e].filter((r) => r.passable);
  pool.sort((a, b) => a.baseTotal - b.baseTotal);
  return pool.slice(0, 3);
}
