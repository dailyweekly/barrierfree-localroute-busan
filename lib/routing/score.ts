// 규칙기반 점수화: 공공데이터 학습라벨/복잡도/대체경로유형을 기준으로
// 사용자 유형·선호에 따라 최종 점수를 산출
// LLM은 절대 점수에 개입하지 않는다 (CLAUDE.md §5).

import type {
  ElevatorAltRoute,
  RouteCandidate,
  RouteKind,
  RouteStep,
  UserType,
  Preference,
  RouteRationale,
} from "../types.ts";
import type { CongestionEstimate } from "../congestion/estimate.ts";

// 사용자 유형별 가중치
const USER_WEIGHTS: Record<UserType, { complexity: number; congestion: number; transfer: number }> = {
  wheelchair: { complexity: 0.6, congestion: 0.2, transfer: 0.2 },
  elderly:    { complexity: 0.45, congestion: 0.35, transfer: 0.2 },
  pregnant:   { complexity: 0.4, congestion: 0.4, transfer: 0.2 },
  infant:     { complexity: 0.45, congestion: 0.4, transfer: 0.15 },
  luggage:    { complexity: 0.35, congestion: 0.45, transfer: 0.2 },
  general:    { complexity: 0.3, congestion: 0.4, transfer: 0.3 },
};

export interface ScoredRoute {
  base: ElevatorAltRoute;     // 점수의 출처 — 환각 검증용
  passable: boolean;
  complexityScore: number;    // 0~100
  complexityGrade: "낮음" | "보통" | "높음";
  transferPenalty: number;    // 0~30
  baseTotal: number;          // 사용자 가중치 미적용
}

function gradeOf(score: number): "낮음" | "보통" | "높음" {
  if (score < 33) return "낮음";
  if (score < 66) return "보통";
  return "높음";
}

export function scoreRow(row: ElevatorAltRoute, _userType: UserType): ScoredRoute {
  const passable = row.경로_이용_가능_여부 === "Y" || row.학습라벨 === "이동가능";
  const complexityScore =
    typeof row.경로복잡도_점수 === "number"
      ? Math.min(100, Math.max(0, row.경로복잡도_점수))
      : passable
      ? 60
      : 100;
  // 공식 등급이 있으면 사용, 없으면 점수로 환산
  const officialGrade = row.경로복잡도_등급 as "낮음" | "보통" | "높음" | undefined;
  const complexityGrade = ["낮음", "보통", "높음"].includes(officialGrade ?? "")
    ? (officialGrade as "낮음" | "보통" | "높음")
    : gradeOf(complexityScore);
  const transferPenalty = row.환승역_여부 === "Y" ? 15 : 0;
  return {
    base: row,
    passable,
    complexityScore,
    complexityGrade,
    transferPenalty,
    baseTotal: complexityScore + transferPenalty,
  };
}

export function combinedScore(
  s: ScoredRoute,
  congestion: CongestionEstimate,
  userType: UserType,
  preferences: Preference[]
): number {
  const w = USER_WEIGHTS[userType];
  let total =
    w.complexity * s.complexityScore +
    w.congestion * congestion.score +
    w.transfer * s.transferPenalty;
  // 선호 부스트 (낮을수록 좋은 점수 시스템이므로 가산점 = 감점)
  if (preferences.includes("safety") && s.passable) total -= 8;
  if (preferences.includes("low_congestion") && congestion.level === "낮음") total -= 8;
  if (preferences.includes("min_transfer") && s.transferPenalty === 0) total -= 5;
  if (!s.passable) total += 999; // 이동불가는 사실상 제거
  return total;
}

export function buildCandidate(
  kind: RouteKind,
  rows: ScoredRoute[],
  startStation: string,
  endStation: string,
  congestionStart: CongestionEstimate,
  congestionEnd: CongestionEstimate
): RouteCandidate {
  if (rows.length === 0) {
    return makeEmptyCandidate(kind, startStation, endStation);
  }
  // 첫 행을 대표값으로 사용 (정렬은 호출자에서)
  const head = rows[0];
  const steps: RouteStep[] = [];
  // 출발 역 단계
  steps.push({
    station: startStation,
    description: `${startStation}에서 출발`,
    isTransfer: false,
  });
  // 중간 환승역 단계(데이터 기반)
  for (const r of rows.slice(0, 3)) {
    steps.push({
      station: r.base.역명,
      description: `${r.base.역명} 단계별 대체 경로`,
      isTransfer: r.base.환승역_여부 === "Y",
      alternative: {
        elevatorId: r.base.엘리베이터_고유번호,
        type: r.base.대체경로유형,
        learningLabel: r.base.학습라벨,
        stepText: r.base.단계별_대체_경로,
      },
    });
  }
  // 도착 역 단계
  steps.push({
    station: endStation,
    description: `${endStation}에 도착`,
    isTransfer: false,
  });

  const avgComplexity = Math.round(rows.reduce((a, r) => a + r.complexityScore, 0) / rows.length);
  const grade = gradeOf(avgComplexity);
  const predictedCongestion: "낮음" | "보통" | "높음" =
    congestionStart.level === congestionEnd.level
      ? congestionStart.level
      : (congestionStart.score + congestionEnd.score) / 2 < 50
      ? "낮음"
      : (congestionStart.score + congestionEnd.score) / 2 < 80
      ? "보통"
      : "높음";
  const congestionScore = Math.round((congestionStart.score + congestionEnd.score) / 2);
  const passable = rows.every((r) => r.passable);

  const rationale: RouteRationale = {
    complexity: {
      score: avgComplexity,
      grade,
      sourceIds: rows.map((r) => r.base.엘리베이터_고유번호),
    },
    congestion: {
      level: predictedCongestion,
      score: congestionScore,
      sourceStation: congestionStart.sourceStation,
      sourceHour: congestionStart.sourceHour,
    },
    passability: {
      passable,
      sourceLabel: rows.map((r) => r.base.학습라벨).join(", "),
    },
    alternativeType: {
      type: rows.map((r) => r.base.대체경로유형).filter((x, i, a) => a.indexOf(x) === i).join(", "),
      sourceIds: rows.map((r) => r.base.엘리베이터_고유번호),
    },
  };

  const titles: Record<RouteKind, string> = {
    safe: "안전 우선 경로",
    low_congestion: "혼잡 회피 경로",
    include_local: "로컬 포함 경로",
  };

  return {
    kind,
    title: titles[kind],
    startStation,
    endStation,
    steps,
    complexityScore: avgComplexity,
    complexityGrade: grade,
    predictedCongestion,
    congestionScore,
    passable,
    alternativeType: rationale.alternativeType.type,
    rationale,
  };
}

function makeEmptyCandidate(kind: RouteKind, s: string, e: string): RouteCandidate {
  return {
    kind,
    title: kind === "safe" ? "안전 우선 경로" : kind === "low_congestion" ? "혼잡 회피 경로" : "로컬 포함 경로",
    startStation: s,
    endStation: e,
    steps: [
      { station: s, description: `${s}에서 출발`, isTransfer: false },
      { station: e, description: `${e}에 도착`, isTransfer: false },
    ],
    complexityScore: 50,
    complexityGrade: "보통",
    predictedCongestion: "보통",
    congestionScore: 50,
    passable: true,
    alternativeType: "확인 필요",
    rationale: {
      complexity: { score: 50, grade: "보통", sourceIds: [] },
      congestion: { level: "보통", score: 50, sourceStation: s, sourceHour: 12 },
      passability: { passable: true, sourceLabel: "확인 필요" },
      alternativeType: { type: "확인 필요", sourceIds: [] },
    },
  };
}
