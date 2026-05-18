import { NextResponse } from "next/server";
import { loadElevatorAltRoutes, listStations } from "@/lib/data/elevator";

export const revalidate = 86400; // 1일 캐시

export async function GET() {
  try {
    const rows = await loadElevatorAltRoutes();
    const stations = listStations(rows);
    return NextResponse.json({ stations, count: stations.length });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message, stations: [] }, { status: 500 });
  }
}
