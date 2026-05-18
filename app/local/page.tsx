import Link from "next/link";
import { headers } from "next/headers";

interface LocalResp {
  station: string;
  district: string;
  stationFound: boolean;
  venues: { 연번: number; 베뉴명: string; 위치: string }[];
  restaurants: { 식당명: string; 분류: string; 주소: string; 추천메뉴: string }[];
  galmaegil: { 코스명: string; 난이도?: string; 거리?: string; 설명?: string; 주소?: string }[];
}

async function getLocal(station: string): Promise<LocalResp> {
  const h = headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("host") ?? "localhost:3000";
  const res = await fetch(`${proto}://${host}/api/local-poi?station=${encodeURIComponent(station)}`, { cache: "no-store" });
  return res.json();
}

export default async function LocalPage({ searchParams }: { searchParams: { [k: string]: string | string[] | undefined } }) {
  const start = String(searchParams.start ?? "서면역");
  const end = String(searchParams.end ?? "해운대역");
  const [near1, near2] = await Promise.all([getLocal(start), getLocal(end)]);

  return (
    <div className="space-y-6">
      <section className="card p-5">
        <h2 className="text-xl font-extrabold text-brand-700">④ 부산다운 반나절 코스</h2>
        <p className="text-sm text-slate-600 mt-1">
          목적지 도착 후 들를 만한 유니크베뉴(부산관광공사), 갈맷길 산책 구간(부산광역시), 택슐랭 식당(부산광역시)을 한 동선에 묶어 제안합니다.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StationLocalCard label="출발 인근" data={near1} />
        <StationLocalCard label="목적 인근" data={near2} />
      </div>

      <section className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="text-base font-bold mb-2">반나절 코스 (예시)</h3>
        <ol className="space-y-2 text-sm">
          <li>① 출발역 <strong>{start}</strong> → 안전 우선 경로로 이동</li>
          <li>② 목적지 도착 → 인근 유니크베뉴 <strong>{near2.venues[0]?.베뉴명 ?? "(확인 필요)"}</strong> 방문</li>
          <li>③ 점심 — 택슐랭 <strong>{near2.restaurants[0]?.식당명 ?? "(확인 필요)"}</strong> ({near2.restaurants[0]?.추천메뉴 ?? "—"})</li>
          <li>④ 갈맷길 단구간 — <strong>{near2.galmaegil[0]?.코스명 ?? "(확인 필요)"}</strong> 산책</li>
          <li>⑤ 동선 마무리 후 복귀</li>
        </ol>
        <p className="text-xs text-slate-400 mt-2">※ 좌표 보강이 필요한 경우 자동으로 같은 구(區) 매칭을 사용하며, 데이터에 없는 시설은 "확인 필요"로 표시됩니다.</p>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link href={`/routes?start=${start}&end=${end}&hour=10&dow=2&user=wheelchair&pref=safety,low_congestion`} className="bg-white border rounded-xl px-5 py-3 font-semibold">← 경로 비교로</Link>
        <Link href="/admin" className="bg-brand text-white rounded-xl px-5 py-3 font-semibold">⑤ 관리자/심사 대시보드 →</Link>
      </div>
    </div>
  );
}

function StationLocalCard({ label, data }: { label: string; data: LocalResp }) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-5">
      <h3 className="text-base font-bold">{label} — {data.station} <span className="text-xs text-slate-400">({data.district})</span></h3>
      {!data.stationFound && <p className="text-xs text-warn mt-1">⚠ 본 역의 학습 데이터가 부족합니다 — 확인 필요</p>}
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
        <Group title="🏛 유니크베뉴" items={data.venues.map((v) => `${v.베뉴명} · ${v.위치}`)} />
        <Group title="🍱 택슐랭" items={data.restaurants.map((r) => `${r.식당명} · ${r.추천메뉴}`)} />
        <Group title="🚶 갈맷길" items={data.galmaegil.map((g) => `${g.코스명}${g.거리 ? ` · ${g.거리}` : ""}`)} />
      </div>
    </section>
  );
}

function Group({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="border rounded-lg p-3 bg-slate-50">
      <div className="font-semibold text-xs mb-1">{title}</div>
      <ul className="space-y-1 text-xs">
        {items.length > 0
          ? items.slice(0, 5).map((i, k) => <li key={k}>• {i}</li>)
          : <li className="text-slate-400">데이터 없음 (확인 필요)</li>}
      </ul>
    </div>
  );
}
