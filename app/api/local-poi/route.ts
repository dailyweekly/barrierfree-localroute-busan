import { NextRequest, NextResponse } from "next/server";
import { loadVenues, venuesNearStation, getDistrict } from "@/lib/data/venue";
import { loadTaxulang, restaurantsNear } from "@/lib/data/taxulang";
import { loadGalmaegil } from "@/lib/data/galmaegil";
import { loadElevatorAltRoutes } from "@/lib/data/elevator";

// 역명을 받아 인근의 유니크베뉴/택슐랭/갈맷길 후보 반환
export async function GET(req: NextRequest) {
  const station = req.nextUrl.searchParams.get("station") ?? "";
  if (!station) return NextResponse.json({ error: "station 파라미터가 필요합니다." }, { status: 400 });

  const [venues, restaurants, galmaegil, elevatorRows] = await Promise.all([
    loadVenues(),
    loadTaxulang(),
    loadGalmaegil(),
    loadElevatorAltRoutes(),
  ]);

  // 역명 → 행정구역 추정: 엘리베이터 데이터의 역명에 직접 행정구역이 들어있지 않으므로
  // 역명 매핑 테이블을 단순 룰로 유지 (확장 가능)
  const STATION_DISTRICT: Record<string, string> = {
    "부산역": "동구", "서면역": "부산진구", "남포역": "중구", "자갈치역": "중구",
    "해운대역": "해운대구", "장산역": "해운대구", "광안역": "수영구", "수영역": "수영구",
    "센텀시티역": "해운대구", "사상역": "사상구", "연산역": "연제구", "동래역": "동래구",
    "덕천역": "북구", "안평역": "기장군", "노포역": "금정구",
  };
  const district = STATION_DISTRICT[station] ?? getDistrict(station);

  const venueList = venuesNearStation(venues, district);
  const restList = restaurantsNear(restaurants, district);
  // 갈맷길은 행정구역 매칭이 헐거우므로 키워드 매칭으로 보조
  const galmaegilFiltered = galmaegil.filter((g) => district && (g.주소 ?? "").includes(district));
  const galList = galmaegilFiltered.length > 0 ? galmaegilFiltered.slice(0, 3) : galmaegil.slice(0, 3);

  // 역 데이터 존재 여부도 함께 (확인 필요 표시용)
  const stationFound = elevatorRows.some((r) => r.역명 === station);

  return NextResponse.json({
    station,
    district: district ?? "확인 필요",
    stationFound,
    venues: venueList,
    restaurants: restList,
    galmaegil: galList,
  });
}
