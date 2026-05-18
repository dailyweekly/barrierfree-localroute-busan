// 15077591 부산광역시_갈맷길 코스 정보 (REST API)
import "server-only";
import { fetchGalmaegil } from "./odcloud";
import type { GalmaegilCourse } from "@/lib/types";
import { GALMAEGIL_SAMPLE } from "@/data/sample/galmaegil";

let cache: GalmaegilCourse[] | null = null;

export async function loadGalmaegil(): Promise<GalmaegilCourse[]> {
  if (cache) return cache;
  try {
    const raw = (await fetchGalmaegil()) as Record<string, unknown>;
    // 응답 구조가 발급 시점에 따라 달라 안전한 fallback
    const items = extractItems(raw);
    if (items.length > 0) {
      cache = items;
      return cache;
    }
  } catch (e) {
    console.warn("[galmaegil] fetch failed, falling back to sample:", (e as Error).message);
  }
  cache = GALMAEGIL_SAMPLE;
  return cache;
}

function extractItems(raw: Record<string, unknown>): GalmaegilCourse[] {
  // 일반적 OpenAPI 응답 형태: response.body.items.item[]
  const r = raw as { response?: { body?: { items?: { item?: unknown[] } } } };
  const items = r.response?.body?.items?.item ?? [];
  if (!Array.isArray(items)) return [];
  return items.map((it) => {
    const o = it as Record<string, string | undefined>;
    return {
      코스명: o.coursName ?? o.courseName ?? o.title ?? "(코스명 미상)",
      난이도: o.diff ?? o.difficulty,
      거리: o.dist ?? o.distance,
      설명: o.intr ?? o.intro ?? o.description,
      주소: o.adres ?? o.address,
    };
  });
}
