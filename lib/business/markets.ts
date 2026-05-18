// 신청서 §2 — 사업화 시장 4축 (발전가능성 20점)
export interface MarketRow {
  axis: "B2G" | "B2B" | "B2C" | "로컬상권";
  customer: string;
  value: string;
  revenue: string;
}

export const MARKETS: MarketRow[] = [
  { axis: "B2G",      customer: "부산시, 부산교통공사, 구·군, 관광 공공기관",
    value:   "교통약자 이동권 개선·혼잡분산 정책 도구",
    revenue: "SaaS 라이선스, 대시보드 도입" },
  { axis: "B2B",      customer: "MICE 주최사, 호텔, 여행사, 축제 운영사",
    value:   "이동약자 동반 방문객 안내, 대형행사 동선 분산",
    revenue: "행사별 동선 패키지, API 사용료" },
  { axis: "B2C",      customer: "고령자·휠체어 이용자·가족관광객·캐리어 관광객",
    value:   "안전·혼잡회피·로컬상생 통합 추천",
    revenue: "프리미엄 코스, 보호자 공유 기능" },
  { axis: "로컬상권", customer: "택슐랭 식당, 지역 맛집, 유니크베뉴",
    value:   "관광객 분산 유입, 비혼잡 시간대 방문 유도",
    revenue: "송객 수수료, 정액 광고" },
];

// 수익모델 5종
export const REVENUE_MODELS: { name: string; desc: string }[] = [
  { name: "공공기관 SaaS",  desc: "지자체·공사 대상 교통약자 경로 추천 SaaS·대시보드" },
  { name: "MICE 동선 패키지", desc: "행사장–숙소–도시철도–로컬 목적지 통합 동선" },
  { name: "관광 API",        desc: "여행사·숙박앱·관광플랫폼에 접근성 경로 API 제공" },
  { name: "B2C 프리미엄",    desc: "맞춤 반나절 코스, 음성안내, 보호자 공유" },
  { name: "데이터 리포트",   desc: "역별 혼잡회피·교통약자 이동수요 분석 리포트" },
];

// 리스크 6종
export const RISKS: { risk: string; mitigation: string }[] = [
  { risk: "정기 갱신 스냅샷 데이터의 최신성", mitigation: "'정기 갱신형' 명시 + 2단계에서 실시간 API 연계" },
  { risk: "교통약자 안전 책임",               mitigation: "이동불가 경로 추천 0% 목표, 시나리오 회귀 테스트 의무" },
  { risk: "개인정보",                          mitigation: "MVP는 개인식별정보 비수집, 익명 시나리오 데이터로 처리" },
  { risk: "지도 API 비용",                     mitigation: "2단계 도입, B2B 매출 발생 후 단계적 적용" },
  { risk: "공공기관 도입 지연",                mitigation: "B2C·B2B 동시 추진으로 매출 다변화" },
  { risk: "LLM 환각·허위 추천",                mitigation: "입력 화이트리스트 + 출력 템플릿 + 존재 검증 5중 가드레일" },
];
