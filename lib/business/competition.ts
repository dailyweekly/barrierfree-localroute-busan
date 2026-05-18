// 신청서 §1.4 — 경쟁 서비스 비교 (독창성 15점)
export interface CompetitorRow {
  service: string;
  feature: string;
  limit: string;
  differentiator: string;
}

export const COMPETITORS: CompetitorRow[] = [
  {
    service: "비짓부산 무장애여행",
    feature: "무장애 여행정보, 휠셰어·초록여행 안내",
    limit: "정보 제공 중심, 도시철도 이용불가 상황별 경로 추천 부재",
    differentiator: "도시철도 대체경로 + 관광동선 결합",
  },
  {
    service: "네이버지도 계단회피",
    feature: "엘리베이터 출입구 안내, 계단회피 경로",
    limit: "전국 범용 기능. 부산 학습라벨 기반 대체경로·로컬 결합 아님",
    differentiator: "부산 도시철도 학습라벨 + 예상혼잡 + 로컬 데이터 동시 반영",
  },
  {
    service: "카카오맵 교통약자 정보",
    feature: "지하철역 편의시설 정보",
    limit: "정적 정보 중심, 경로 의사결정 미반영",
    differentiator: "엘리베이터 이용불가 가정의 대체경로 유형 분류 반영",
  },
  {
    service: "부산 스마트시티 배리어프리 내비 (실증)",
    feature: "부산역 등 배리어프리 내비·키오스크 실증",
    limit: "특정 실증사업, 관광·로컬상권 확장성 제한",
    differentiator: "포용관광·혼잡분산·MICE 확장형 AI 서비스로 확장",
  },
  {
    service: "일반 여행코스 추천 서비스",
    feature: "명소·맛집·코스 추천",
    limit: "이동약자 조건과 도시철도 접근성 미반영",
    differentiator: "교통약자 조건을 관광동선 생성의 핵심 제약으로 사용",
  },
];

export const ORIGINALITY_PILLARS: { title: string; body: string }[] = [
  {
    title: "공공데이터 학습라벨 기반 AI 의사결정",
    body: "부산교통공사가 직접 부여한 학습라벨·경로복잡도 점수·대체경로유형 컬럼을 모델 학습의 정답으로 사용. 임의 추정이 아니라 운영기관 데이터 기반.",
  },
  {
    title: "이동약자 조건 + 예상혼잡 + 로컬 목적지 동시 추천",
    body: "안전 우선·혼잡 회피·로컬 포함을 하나의 비교 화면에 제시. 기존 서비스는 이 세 차원을 따로 다룬다.",
  },
  {
    title: "설명가능 AI + 환각 방지 LLM",
    body: "LLM은 경로를 결정하지 않고 설명만 생성. 입력 화이트리스트와 출력 템플릿 고정으로 환각·이동불가 경로 추천을 원천 차단.",
  },
];
