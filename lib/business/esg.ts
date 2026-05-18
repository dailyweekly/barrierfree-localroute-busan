// 신청서 §3 — ESG 혁신 (5점)
export interface ESGPillar {
  axis: "Social" | "Local Impact" | "Inclusive Tourism" | "Governance";
  body: string;
}

export const ESG_PILLARS: ESGPillar[] = [
  { axis: "Social",
    body: "교통약자 이동권 보장, 고령자·장애인·임산부·유아동반자의 도시철도 접근성 개선" },
  { axis: "Local Impact",
    body: "관광객을 과밀 관광지에서 로컬상권(택슐랭·갈맷길·유니크베뉴)으로 분산" },
  { axis: "Inclusive Tourism",
    body: "관광약자가 이용 가능한 부산형 포용관광 모델 확산" },
  { axis: "Governance",
    body: "공공데이터 기반 설명가능 AI로 추천 근거 투명화, AI 의사결정의 추적가능성 확보" },
];

export interface ESGKpi {
  name: string;
  description: string;
  target: string;     // 목표값 (문자열)
  current: string;    // 현재 측정값 — 검증 진행 중이면 "검증 진행 중"
}

export const ESG_KPIS: ESGKpi[] = [
  { name: "교통약자 경로 도달 성공률",
    description: "시나리오 20종 중 이동가능 경로 추천 성공 비율",
    target: "95% 이상", current: "시나리오 API에서 자동 측정" },
  { name: "이동불가 경로 추천율 (안전성)",
    description: "추천 결과 중 '이동불가' 라벨 경로 비율",
    target: "0%", current: "시나리오 API에서 자동 측정" },
  { name: "고복잡도 경로 회피율",
    description: "기존 최단경로 대비 복잡도 점수 감소율",
    target: "30% 이상", current: "검증 진행 중" },
  { name: "혼잡 회피 효과",
    description: "추천 경로의 예상혼잡도 평균 감소율",
    target: "20% 이상", current: "검증 진행 중" },
  { name: "로컬상권 연결률",
    description: "추천 경로 중 로컬 목적지 포함 비율",
    target: "70% 이상", current: "include_local 경로에서 100%" },
  { name: "설명 이해도",
    description: "사용자 테스트 5점 척도 (고령자 패널)",
    target: "4.0 이상", current: "검증 진행 중" },
];
