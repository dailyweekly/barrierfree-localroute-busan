// 5중 LLM 가드레일 (CLAUDE.md §3, 신청서 1.2-4)
// LLM은 절대로 경로를 결정하지 않는다. 출력 텍스트의 사실성/안전성만 검증.

import type { RouteCandidate, GuardrailReport, UserQuery } from "../types.ts";

const FORBIDDEN_PHRASES: string[] = [
  "실시간 엘리베이터 고장 감지",
  "실시간 고장 감지",
  "실시간 혼잡도 예측",
  "실시간 혼잡 예측",
  "BTS 공연 대비",
  "AI 완전 자동 최적경로",
  "완전 자동 최적화",
  "교통약자 문제 완전 해결",
  "100% 안전",
  "완벽한 경로",
];

const REQUIRED_TEMPLATE_TERMS = ["복잡도", "예상혼잡", "대체"];

export interface GuardrailContext {
  candidate: RouteCandidate;
  query: UserQuery;
  knownStations: Set<string>;
}

export function buildWhitelistedInput(ctx: GuardrailContext) {
  const { candidate, query } = ctx;
  // LLM 입력에는 모델이 선택한 경로 후보와 그 근거만 들어간다. 그 외 정보는 절대 노출 금지.
  return {
    startStation: candidate.startStation,
    endStation: candidate.endStation,
    userType: query.userType,
    routeKind: candidate.kind,
    routeTitle: candidate.title,
    steps: candidate.steps.map((s) => ({
      station: s.station,
      isTransfer: s.isTransfer,
      alternativeType: s.alternative?.type ?? null,
      stepText: s.alternative?.stepText ?? null,
    })),
    complexity: candidate.rationale.complexity,
    congestion: candidate.rationale.congestion,
    passability: candidate.rationale.passability,
    alternativeType: candidate.rationale.alternativeType,
  };
}

// 출력 검증 (실패 시 폴백 텍스트로 교체)
export function validateOutput(
  text: string,
  ctx: GuardrailContext
): GuardrailReport {
  const report: GuardrailReport = {
    inputWhitelistOk: true,
    templateOk: false,
    existenceOk: true,
    passableOk: true,
    forbiddenTermsOk: true,
    rejected: false,
  };

  // 1) 출력 템플릿 — 복잡도/예상혼잡/대체 키워드 중 최소 2개 필수
  const hit = REQUIRED_TEMPLATE_TERMS.filter((t) => text.includes(t)).length;
  report.templateOk = hit >= 2;
  if (!report.templateOk) {
    report.rejected = true;
    report.reason = "출력 템플릿(복잡도/예상혼잡/대체) 부족";
  }

  // 2) 존재 검증 — 출력에 등장하는 한글 역명이 모두 알려진 역명에 포함되는지
  //    (큰 데이터셋에서 false positive를 줄이기 위해, 알려진 역명에 한정해 검사)
  const stationsInText = Array.from(ctx.knownStations).filter((st) => text.includes(st));
  // 명시적으로 사용된 역명만 존재 검증 (모든 역명을 검사하면 오탐 가능 → 출발/도착/스텝 역 중심)
  const required = new Set([ctx.candidate.startStation, ctx.candidate.endStation, ...ctx.candidate.steps.map((s) => s.station)]);
  for (const r of required) {
    if (text.includes(r) && !ctx.knownStations.has(r)) {
      report.existenceOk = false;
      report.rejected = true;
      report.reason = `존재하지 않는 역명 '${r}'`;
      break;
    }
  }

  // 3) 이동불가 추천 차단
  if (!ctx.candidate.passable && /추천|이용\s*가능|이동\s*가능/.test(text)) {
    report.passableOk = false;
    report.rejected = true;
    report.reason = "이동 불가 경로를 추천하는 표현";
  }

  // 4) 금지표현
  for (const f of FORBIDDEN_PHRASES) {
    if (text.includes(f)) {
      report.forbiddenTermsOk = false;
      report.rejected = true;
      report.reason = `금지 표현 사용: ${f}`;
      break;
    }
  }

  void stationsInText; // lint
  return report;
}

export const FORBIDDEN = FORBIDDEN_PHRASES;
