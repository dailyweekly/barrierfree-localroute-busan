import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "배리어프리 로컬루트 부산",
    short_name: "BarrierfreeBusan",
    description: "부산 공공데이터 기반 교통약자·관광약자 맞춤 정기 갱신형 설명가능 AI 추천 서비스",
    start_url: "/",
    display: "standalone",
    background_color: "#F6F8FC",
    theme_color: "#1F3864",
    icons: [],
    lang: "ko-KR",
    orientation: "portrait",
  };
}
