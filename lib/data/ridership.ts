// 3057229 부산교통공사_시간대별 승하차인원
// 30개 컬럼: 역번호·역명·년월일·요일·구분·합계·01시-02시 ~ 24시-01시

import "server-only";
import { fetchODCloud, DATA_ENDPOINTS } from "./odcloud";
import type { RidershipRow } from "@/lib/types";
import { RIDERSHIP_SAMPLE } from "@/data/sample/ridership";
export { avgHourTraffic } from "@/lib/congestion/estimate";

interface RawRidership {
  역번호: number;
  역명: string;
  년월일: string;
  요일: string;
  구분: string;
  합계: number;
  [hourBucket: string]: number | string; // "01시-02시" 등
}

function normalize(r: RawRidership): RidershipRow {
  const 시간대: Record<string, number> = {};
  for (const k of Object.keys(r)) {
    if (k.endsWith("시")) continue;
    if (/^\d{2}시-\d{2}시$/.test(k)) {
      const v = r[k];
      시간대[k] = typeof v === "number" ? v : Number(v) || 0;
    }
  }
  return {
    역번호: r.역번호,
    역명: r.역명,
    년월일: r.년월일,
    요일: r.요일,
    구분: r.구분,
    합계: r.합계,
    시간대,
  };
}

let cache: RidershipRow[] | null = null;

export async function loadRidership(): Promise<RidershipRow[]> {
  if (cache) return cache;
  try {
    const res = await fetchODCloud<RawRidership>(DATA_ENDPOINTS.ridership, { perPage: 1000 });
    if (res.data && res.data.length > 0) {
      cache = res.data.map(normalize);
      return cache;
    }
  } catch (e) {
    console.warn("[ridership] odcloud fetch failed, falling back to sample:", (e as Error).message);
  }
  cache = RIDERSHIP_SAMPLE;
  return cache;
}

// avgHourTraffic 은 lib/congestion/estimate.ts에서 재export
