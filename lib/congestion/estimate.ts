// 시간대 기반 예상혼잡 산정
// 시간대별 승하차인원 평균에 분위수를 적용한 정기 갱신형 지표.
// 이 파일은 server-only 모듈을 import 하지 않으므로 테스트에서 직접 호출 가능.

import type { RidershipRow } from "../types.ts";

function HOUR_KEY(h: number): string {
  const a = String(h).padStart(2, "0");
  const next = (h + 1) % 24 === 0 ? 24 : (h + 1);
  const b2 = String(next).padStart(2, "0");
  return a + "시-" + b2 + "시";
}

const DOW_KOR = ["일", "월", "화", "수", "목", "금", "토"];

export interface CongestionEstimate {
  level: "낮음" | "보통" | "높음";
  score: number;
  sourceStation: string;
  sourceHour: number;
  sampleSize: number;
  bucket: string;
}

export function avgHourTraffic(
  rows: RidershipRow[],
  station: string,
  dowKor?: string
): Record<string, number> {
  const filtered = rows.filter((r) => r["역명"] === station && (dowKor ? r["요일"] === dowKor : true));
  if (filtered.length === 0) return {};
  const buckets: Record<string, number[]> = {};
  for (const r of filtered) {
    for (const [k, v] of Object.entries(r["시간대"])) {
      if (!buckets[k]) buckets[k] = [];
      buckets[k].push(v);
    }
  }
  const avg: Record<string, number> = {};
  for (const [k, arr] of Object.entries(buckets)) {
    avg[k] = arr.reduce((a, b) => a + b, 0) / arr.length;
  }
  return avg;
}

export function estimateCongestion(
  rows: RidershipRow[],
  station: string,
  hour: number,
  dow: number
): CongestionEstimate {
  const dowKor = DOW_KOR[dow] ?? "월";
  const avg = avgHourTraffic(rows, station, dowKor);
  const bucket = HOUR_KEY(hour);
  const value = avg[bucket] ?? 0;
  const pool = Object.values(avg).filter((v) => v > 0);
  const sampleSize = pool.length;
  if (sampleSize === 0) {
    return { level: "보통", score: 50, sourceStation: station, sourceHour: hour, sampleSize: 0, bucket };
  }
  const sorted = [...pool].sort((a, b) => a - b);
  const rank = sorted.filter((v) => v <= value).length;
  const pct = (rank / sorted.length) * 100;
  let level: "낮음" | "보통" | "높음";
  if (pct < 50) level = "낮음";
  else if (pct < 90) level = "보통";
  else level = "높음";
  return { level, score: Math.round(pct), sourceStation: station, sourceHour: hour, sampleSize, bucket };
}
