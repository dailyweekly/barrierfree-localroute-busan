// odcloud / data.go.kr 공통 클라이언트
// 서버 사이드 전용 - 클라이언트 번들에 절대 노출 금지

import "server-only";

const BASE = "https://api.odcloud.kr/api";
const TTL = Number(process.env.DATA_CACHE_TTL ?? 86400);

export interface ODCloudResponse<T> {
  page: number;
  perPage: number;
  totalCount: number;
  currentCount: number;
  matchCount: number;
  data: T[];
}

export async function fetchODCloud<T>(
  path: string,
  opts: { page?: number; perPage?: number } = {}
): Promise<ODCloudResponse<T>> {
  const key = process.env.BUSAN_API_KEY;
  if (!key) {
    // 키가 없으면 의도적으로 throw 하지 않고 빈 응답을 돌려준다.
    // 호출자는 폴백 샘플 데이터를 사용한다.
    return { page: 1, perPage: 0, totalCount: 0, currentCount: 0, matchCount: 0, data: [] };
  }
  const url = new URL(BASE + path);
  url.searchParams.set("page", String(opts.page ?? 1));
  url.searchParams.set("perPage", String(opts.perPage ?? 1000));
  url.searchParams.set("serviceKey", key);

  const res = await fetch(url.toString(), {
    // Next 14 ISR-style 캐시 (서버 사이드)
    next: { revalidate: TTL, tags: ["odcloud", path] },
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`odcloud ${path} → ${res.status} ${res.statusText}`);
  }
  const json = (await res.json()) as ODCloudResponse<T>;
  return json;
}

// 갈맷길은 별도 endpoint (XML 가능 → JSON 요청)
export async function fetchGalmaegil(): Promise<unknown> {
  const key = process.env.BUSAN_API_KEY;
  const base = process.env.GALMAEGIL_BASE_URL ?? "https://apis.data.go.kr/6260000/BusanGalmaetGilService";
  if (!key) return { items: [] };
  const url = new URL(`${base}/getCourseList`);
  url.searchParams.set("ServiceKey", key);
  url.searchParams.set("pageNo", "1");
  url.searchParams.set("numOfRows", "50");
  url.searchParams.set("resultType", "json");

  try {
    const res = await fetch(url.toString(), {
      next: { revalidate: TTL, tags: ["galmaegil"] },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return { items: [] };
    return await res.json();
  } catch {
    return { items: [] };
  }
}

export const DATA_ENDPOINTS = {
  elevatorAltRoute: "/15151579/v1/uddi:1bf91dbe-a17f-44aa-9141-a93057b8100f",
  ridership: "/3057229/v1/uddi:c03e50b4-8f95-4dfe-8b47-a46940ad0cc3",
  venue: "/15156491/v1/uddi:cf14a586-03cb-4672-a766-9e4ee46db1e0",
  taxulang: "/15143578/v1/uddi:f0c275cc-6a96-436d-8927-bf7c29f5ad8b",
} as const;
