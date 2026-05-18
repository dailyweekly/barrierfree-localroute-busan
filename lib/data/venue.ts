// 15156491 부산관광공사_유니크베뉴 (연번, 베뉴명, 위치)
import "server-only";
import { fetchODCloud, DATA_ENDPOINTS } from "./odcloud";
import type { UniqueVenue } from "@/lib/types";
import { VENUE_SAMPLE } from "@/data/sample/venue";

let cache: UniqueVenue[] | null = null;

export async function loadVenues(): Promise<UniqueVenue[]> {
  if (cache) return cache;
  try {
    const res = await fetchODCloud<UniqueVenue>(DATA_ENDPOINTS.venue, { perPage: 200 });
    if (res.data && res.data.length > 0) {
      cache = res.data;
      return cache;
    }
  } catch (e) {
    console.warn("[venue] odcloud fetch failed, falling back to sample:", (e as Error).message);
  }
  cache = VENUE_SAMPLE;
  return cache;
}

// "위치" 텍스트에서 행정구역(구)을 추출
export function getDistrict(loc: string): string | null {
  const m = loc.match(/([가-힣]+구|[가-힣]+군)/);
  return m ? m[1] : null;
}

// 역명 인근(같은 구) 유니크베뉴
export function venuesNearStation(
  venues: UniqueVenue[],
  stationDistrict: string | null
): UniqueVenue[] {
  if (!stationDistrict) return venues.slice(0, 5);
  const matched = venues.filter((v) => getDistrict(v.위치) === stationDistrict);
  return matched.length > 0 ? matched : venues.slice(0, 5);
}
