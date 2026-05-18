// 배리어프리 로컬루트 부산 — 도메인 타입
// 모든 공공데이터 컬럼명은 odcloud Swagger OAS(2026-05-18 검증)와 일치한다.

// ─────────────────────────────────────────────────────────────
// 사용자 입력
// ─────────────────────────────────────────────────────────────
export type UserType =
  | "wheelchair"      // 휠체어
  | "elderly"          // 고령자
  | "pregnant"         // 임산부
  | "infant"           // 유아동반
  | "luggage"          // 캐리어
  | "general";         // 일반

export type Preference =
  | "safety"           // 안전 우선
  | "low_congestion"   // 혼잡 회피
  | "min_transfer"     // 환승 최소
  | "include_local";   // 로컬 관광 포함

export interface UserQuery {
  startStation: string;        // 출발 역명
  endStation: string;          // 목적 역명
  travelHour: number;          // 출발 시간(0~23)
  travelDow: number;           // 요일(0=일~6=토)
  userType: UserType;
  preferences: Preference[];
}

// ─────────────────────────────────────────────────────────────
// 1) 부산교통공사_엘리베이터 고장 시 대체 이동 경로 (15151579)
//    23개 컬럼 — Swagger 검증 완료
// ─────────────────────────────────────────────────────────────
export interface ElevatorAltRoute {
  호선명: number;
  역번호: number;
  역명: string;
  종착역_여부: string;            // "Y" / "N"
  환승역_여부: string;             // "Y" / "N"
  승강장_유형: string;
  역_위도: string;
  역_경도: string;
  엘리베이터_내부_관리번호: number;
  엘리베이터_고유번호: string;
  출발층: string;
  출발_구분: string;
  출발층위: number;
  도착층: string;
  도착_구분: string;
  도착층위: number;
  이동방향: string;
  단계별_대체_경로: string;
  경로_이용_가능_여부: string;     // 핵심 라벨 "Y(이동가능)" / "N(이동불가)" 등
  경로복잡도_점수: number | null;  // 이동불가시 null
  경로복잡도_등급: string;          // "낮음/보통/높음" 등
  학습라벨: string;
  대체경로유형: string;             // "대체 엘리베이터" / "대체 역" / "이동 불가" 등
}

// ─────────────────────────────────────────────────────────────
// 2) 부산교통공사_시간대별 승하차인원 (3057229) — 30개 컬럼
// ─────────────────────────────────────────────────────────────
export interface RidershipRow {
  역번호: number;
  역명: string;
  년월일: string;       // "YYYY-MM-DD"
  요일: string;          // "월" ~ "일"
  구분: string;          // "승차" | "하차"
  합계: number;
  시간대: Record<string, number>; // "01시-02시" ~ "24시-01시"
}

// ─────────────────────────────────────────────────────────────
// 3) 유니크베뉴 (15156491)
// ─────────────────────────────────────────────────────────────
export interface UniqueVenue {
  연번: number;
  베뉴명: string;
  위치: string;
}

// ─────────────────────────────────────────────────────────────
// 4) 갈맷길 (15077591) — REST API 응답 (필드는 단순화)
// ─────────────────────────────────────────────────────────────
export interface GalmaegilCourse {
  코스명: string;
  난이도?: string;
  거리?: string;
  설명?: string;
  주소?: string;
}

// ─────────────────────────────────────────────────────────────
// 5) 택슐랭 식당 (15143578) — 7개 컬럼
// ─────────────────────────────────────────────────────────────
export interface TaxulangRestaurant {
  위치: string;
  식당명: string;
  분류: string;
  주소: string;
  추천메뉴: string;
  위도: string;
  경도: string;
}

// ─────────────────────────────────────────────────────────────
// 추천 결과
// ─────────────────────────────────────────────────────────────
export type RouteKind = "safe" | "low_congestion" | "include_local";

export interface RouteCandidate {
  kind: RouteKind;
  title: string;
  startStation: string;
  endStation: string;
  steps: RouteStep[];
  complexityScore: number;       // 0~100, 낮을수록 좋음
  complexityGrade: "낮음" | "보통" | "높음";
  predictedCongestion: "낮음" | "보통" | "높음";
  congestionScore: number;       // 0~100
  passable: boolean;             // 이동 가능 여부
  alternativeType: string;       // 대체경로유형
  rationale: RouteRationale;
}

export interface RouteStep {
  station: string;
  description: string;
  isTransfer: boolean;
  // 엘리베이터 대체경로 유형(존재 시)
  alternative?: {
    elevatorId?: string;
    type: string;
    learningLabel?: string;
    stepText?: string;
  };
}

export interface RouteRationale {
  // LLM에 들어가는 화이트리스트 입력 (값은 모두 데이터에서 유래)
  complexity: { score: number; grade: string; sourceIds: string[] };
  congestion: { level: string; score: number; sourceStation: string; sourceHour: number };
  passability: { passable: boolean; sourceLabel: string };
  alternativeType: { type: string; sourceIds: string[] };
}

// LLM 설명 결과
export interface LLMExplanation {
  short: string;       // 한 줄 (큰글씨 카드용)
  detail: string;      // 3~4문장 (쉬운말)
  voice: string;       // TTS 평문
  guardrailReport: GuardrailReport;
}

export interface GuardrailReport {
  inputWhitelistOk: boolean;
  templateOk: boolean;
  existenceOk: boolean;
  passableOk: boolean;
  forbiddenTermsOk: boolean;
  rejected: boolean;
  reason?: string;
}

// 시나리오
export interface Scenario {
  id: number;
  title: string;
  query: UserQuery;
  expected: {
    mustBePassable: boolean;
    forbiddenTypes?: string[]; // 예: "이동 불가" 절대 금지
  };
  checkPoint: string;
}

export interface ScenarioResult {
  id: number;
  title: string;
  pass: boolean;
  reason: string;
}

// 메트릭
export interface ModelMetrics {
  passabilityF1: number | null;
  alternativeTypeMacroF1: number | null;
  complexityMAE: number | null;
  complexityRMSE: number | null;
  rankingSpearman: number | null;
  top1Success: number | null;
  congestionMAPE: number | null;
  scenarioPassRate: number | null;
  hallucinationDetectionRate: number | null;
  generatedAt: string;
}
