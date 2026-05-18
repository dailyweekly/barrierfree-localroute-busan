// 신청서 §2 — 단계별 로드맵 (발전가능성 20점)
export interface RoadmapStep {
  step: string;
  period: string;
  goal: string;
}

export const ROADMAP: RoadmapStep[] = [
  { step: "1단계 MVP (공모전)", period: "2026.06–08",
    goal: "부산 1~4호선 주요역 데이터 적용, 시나리오 20종, Streamlit/Next.js 데모, 5종 데이터 모두 연동, AI 모델 K-fold 검증" },
  { step: "2단계 부산 도시철도 전체", period: "2026 하반기",
    goal: "전 역 데이터 확대, FastAPI 백엔드 전환, Supabase/PostgreSQL, 모바일 반응형 고도화" },
  { step: "3단계 관광·MICE 연계", period: "2027",
    goal: "유니크베뉴·축제·호텔·여행사 제휴, 다국어 LLM, B2G·B2B 파일럿" },
  { step: "4단계 실시간성 고도화", period: "2027 이후",
    goal: "부산교통공사·민간 지도·시설 장애신고 API 연계, 접근성 인증, 공공기관 정식 도입" },
];
