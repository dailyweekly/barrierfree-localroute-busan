// 폴백용 시간대별 승하차인원 샘플
// 실제 구조와 동일: 역×요일×구분(승차/하차)×시간대 24개
import type { RidershipRow } from "@/lib/types";

const STATIONS: Array<{ no: number; name: string }> = [
  { no: 113, name: "부산역" },
  { no: 121, name: "서면역" },
  { no: 110, name: "남포역" },
  { no: 109, name: "자갈치역" },
  { no: 134, name: "노포역" },
  { no: 203, name: "해운대역" },
  { no: 201, name: "장산역" },
  { no: 209, name: "광안역" },
  { no: 212, name: "수영역" },
  { no: 206, name: "센텀시티역" },
  { no: 227, name: "사상역" },
  { no: 309, name: "연산역" },
  { no: 308, name: "동래역" },
  { no: 311, name: "덕천역" },
  { no: 414, name: "안평역" },
];

const DOW = ["월", "화", "수", "목", "금", "토", "일"] as const;
const HOURS = Array.from({ length: 24 }, (_, i) => {
  const a = String(i + 1).padStart(2, "0");
  const b = String(((i + 1) % 24) + 1).padStart(2, "0");
  return `${a}시-${b}시`;
});

// 시간대별 가중치(혼잡 패턴 모사) — 07~09, 17~19 피크
const WEIGHTS: Record<string, number> = {};
HOURS.forEach((h, i) => {
  const hour = i + 1;
  if (hour >= 7 && hour <= 9) WEIGHTS[h] = 1.0;
  else if (hour >= 17 && hour <= 19) WEIGHTS[h] = 0.95;
  else if (hour >= 12 && hour <= 14) WEIGHTS[h] = 0.55;
  else if (hour <= 5 || hour >= 23) WEIGHTS[h] = 0.05;
  else WEIGHTS[h] = 0.3;
});

function makeRow(station: { no: number; name: string }, dow: string, kind: "승차" | "하차", base: number, seed: number): RidershipRow {
  const 시간대: Record<string, number> = {};
  let total = 0;
  HOURS.forEach((h, i) => {
    // 약간의 변동 추가
    const v = Math.max(0, Math.round(base * WEIGHTS[h] * (0.85 + 0.3 * ((seed + i) % 7) / 7)));
    시간대[h] = v;
    total += v;
  });
  return {
    역번호: station.no,
    역명: station.name,
    년월일: "2026-03-31",
    요일: dow,
    구분: kind,
    합계: total,
    시간대,
  };
}

const rows: RidershipRow[] = [];
STATIONS.forEach((st, idx) => {
  // 역마다 베이스 라이더십(주요역=높음)
  const base = ["부산역", "서면역", "해운대역", "남포역"].includes(st.name) ? 1800 : 600;
  DOW.forEach((d, i) => {
    rows.push(makeRow(st, d, "승차", base, idx + i));
    rows.push(makeRow(st, d, "하차", base, idx + i + 1));
  });
});

export const RIDERSHIP_SAMPLE: RidershipRow[] = rows;
