// 15143578 부산광역시_택슐랭 선정 식당
import "server-only";
import { fetchODCloud, DATA_ENDPOINTS } from "./odcloud";
import type { TaxulangRestaurant } from "@/lib/types";
import { TAXULANG_SAMPLE } from "@/data/sample/taxulang";

let cache: TaxulangRestaurant[] | null = null;

export async function loadTaxulang(): Promise<TaxulangRestaurant[]> {
  if (cache) return cache;
  try {
    const res = await fetchODCloud<TaxulangRestaurant>(DATA_ENDPOINTS.taxulang, { perPage: 300 });
    if (res.data && res.data.length > 0) {
      cache = res.data;
      return cache;
    }
  } catch (e) {
    console.warn("[taxulang] odcloud fetch failed, falling back to sample:", (e as Error).message);
  }
  cache = TAXULANG_SAMPLE;
  return cache;
}

export function restaurantsNear(
  list: TaxulangRestaurant[],
  district: string | null
): TaxulangRestaurant[] {
  if (!district) return list.slice(0, 5);
  const m = list.filter((r) => r.위치.includes(district) || r.주소.includes(district));
  return m.length > 0 ? m.slice(0, 5) : list.slice(0, 5);
}
