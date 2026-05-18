// 신청서 §1.1 — 공공데이터 활용성 (30점) 코드 메타데이터
// 모든 데이터 출처는 공공데이터포털 공식 페이지에 명시된 정보를 그대로 옮긴 것임.
// 검증 일자 2026-05-18, odcloud Swagger 스키마 직접 조회.

export interface DataSourceMeta {
  id: string;                 // 공공데이터포털 데이터 ID
  name: string;               // 정식 명칭
  provider: string;           // 제공기관
  providerType: "후원기관" | "부산광역시" | "기타";
  fileDataUrl: string;        // 공공데이터포털 상세 페이지
  apiPath?: string;           // odcloud REST endpoint (있는 경우)
  apiBase?: string;           // odcloud 외 endpoint
  license: string;            // 라이선스 (공공데이터포털 표기 기준)
  refreshFreq: string;        // 갱신 주기
  lastUpdated: string;        // 데이터 최신 일자
  columns: number;            // 컬럼 수 (검증 결과)
  role: "핵심" | "보조 핵심" | "보조";
  usage: string;              // 본 서비스 내 사용 위치
  riskNote?: string;          // 데이터 한계·리스크
}

export const DATA_SOURCES: DataSourceMeta[] = [
  {
    id: "15151579",
    name: "부산교통공사_엘리베이터 고장 시 대체 이동 경로",
    provider: "부산교통공사",
    providerType: "후원기관",
    fileDataUrl: "https://www.data.go.kr/data/15151579/fileData.do",
    apiPath: "/15151579/v1/uddi:1bf91dbe-a17f-44aa-9141-a93057b8100f",
    license: "공공데이터 — 이용허락범위 제한 없음",
    refreshFreq: "정기 (원문파일 등록)",
    lastUpdated: "2025-11-06",
    columns: 23,
    role: "핵심",
    usage: "경로 이용가능성 분류·대체경로 유형 분류·복잡도 랭킹 모델의 정답 라벨",
  },
  {
    id: "3057229",
    name: "부산교통공사_시간대별 승하차인원",
    provider: "부산교통공사",
    providerType: "후원기관",
    fileDataUrl: "https://www.data.go.kr/data/3057229/fileData.do",
    apiPath: "/3057229/v1/uddi:c03e50b4-8f95-4dfe-8b47-a46940ad0cc3",
    license: "공공데이터 — 이용허락범위 제한 없음",
    refreshFreq: "월간",
    lastUpdated: "2026-03-31",
    columns: 30,
    role: "핵심",
    usage: "역·요일·시간대 기반 예상혼잡 지표 산정",
    riskNote: "월간 갱신 스냅샷 — 실시간 예측이 아님",
  },
  {
    id: "15156491",
    name: "부산관광공사_유니크베뉴",
    provider: "부산관광공사",
    providerType: "후원기관",
    fileDataUrl: "https://www.data.go.kr/data/15156491/fileData.do",
    apiPath: "/15156491/v1/uddi:cf14a586-03cb-4672-a766-9e4ee46db1e0",
    license: "공공데이터 — 이용허락범위 제한 없음",
    refreshFreq: "정기 (연 1~2회)",
    lastUpdated: "2025-12-12",
    columns: 3,
    role: "핵심",
    usage: "MICE·관광 목적지 후보 (로컬 포함 경로 확장)",
    riskNote: "위치는 텍스트만 제공 — 좌표 보강 필요 (확인 필요)",
  },
  {
    id: "15077591",
    name: "부산광역시_갈맷길 코스 정보",
    provider: "부산광역시",
    providerType: "부산광역시",
    fileDataUrl: "https://www.data.go.kr/data/15077591/openapi.do",
    apiBase: "https://apis.data.go.kr/6260000/BusanGalmaetGilService",
    license: "공공데이터 — CC BY",
    refreshFreq: "수시 (REST API)",
    lastUpdated: "REST API",
    columns: 0,
    role: "보조 핵심",
    usage: "저강도 도보·관광 동선 확장",
  },
  {
    id: "15143578",
    name: "부산광역시_택슐랭 선정 식당",
    provider: "부산광역시",
    providerType: "부산광역시",
    fileDataUrl: "https://www.data.go.kr/data/15143578/fileData.do",
    apiPath: "/15143578/v1/uddi:f0c275cc-6a96-436d-8927-bf7c29f5ad8b",
    license: "공공데이터 — 이용허락범위 제한 없음",
    refreshFreq: "정기",
    lastUpdated: "2025-05-28",
    columns: 7,
    role: "보조",
    usage: "로컬상권 연계 추천 (반나절 코스 동선)",
  },
];
