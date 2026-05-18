// 15151579 부산교통공사_엘리베이터 고장 시 대체 이동 경로
// odcloud는 한글 키를 그대로 반환하므로 매핑 시 안전 처리

import "server-only";
import { fetchODCloud, DATA_ENDPOINTS } from "./odcloud";
import type { ElevatorAltRoute } from "@/lib/types";
import { ELEVATOR_SAMPLE } from "@/data/sample/elevator";

interface RawElev {
  호선명: number;
  역번호: number;
  역명: string;
  "종착역 여부": string;
  "환승역 여부": string;
  "승강장 유형": string;
  "역 위도": string;
  "역 경도": string;
  "엘리베이터 내부 관리번호": number;
  "엘리베이터 고유번호": string;
  출발층: string;
  "출발 구분": string;
  출발층위: number;
  도착층: string;
  "도착 구분": string;
  도착층위: number;
  이동방향: string;
  "단계별 대체 경로": string;
  "경로 이용 가능 여부": string;
  "경로복잡도 점수": number | null;
  "경로복잡도 등급": string;
  학습라벨: string;
  대체경로유형: string;
}

function normalize(r: RawElev): ElevatorAltRoute {
  return {
    호선명: r.호선명,
    역번호: r.역번호,
    역명: r.역명,
    종착역_여부: r["종착역 여부"],
    환승역_여부: r["환승역 여부"],
    승강장_유형: r["승강장 유형"],
    역_위도: r["역 위도"],
    역_경도: r["역 경도"],
    엘리베이터_내부_관리번호: r["엘리베이터 내부 관리번호"],
    엘리베이터_고유번호: r["엘리베이터 고유번호"],
    출발층: r.출발층,
    출발_구분: r["출발 구분"],
    출발층위: r.출발층위,
    도착층: r.도착층,
    도착_구분: r["도착 구분"],
    도착층위: r.도착층위,
    이동방향: r.이동방향,
    단계별_대체_경로: r["단계별 대체 경로"],
    경로_이용_가능_여부: r["경로 이용 가능 여부"],
    경로복잡도_점수: r["경로복잡도 점수"] ?? null,
    경로복잡도_등급: r["경로복잡도 등급"],
    학습라벨: r.학습라벨,
    대체경로유형: r.대체경로유형,
  };
}

let cache: ElevatorAltRoute[] | null = null;

export async function loadElevatorAltRoutes(): Promise<ElevatorAltRoute[]> {
  if (cache) return cache;
  try {
    const res = await fetchODCloud<RawElev>(DATA_ENDPOINTS.elevatorAltRoute, { perPage: 1000 });
    if (res.data && res.data.length > 0) {
      cache = res.data.map(normalize);
      return cache;
    }
  } catch (e) {
    console.warn("[elevator] odcloud fetch failed, falling back to sample:", (e as Error).message);
  }
  cache = ELEVATOR_SAMPLE;
  return cache;
}

export function listStations(rows: ElevatorAltRoute[]): string[] {
  return [...new Set(rows.map((r) => r.역명))].sort();
}

// 출발/도착 역명을 받아 후보 행 추출
export function selectRows(
  rows: ElevatorAltRoute[],
  station: string
): ElevatorAltRoute[] {
  return rows.filter((r) => r.역명 === station);
}
