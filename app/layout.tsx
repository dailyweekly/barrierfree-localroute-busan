import type { Metadata } from "next";
import "./globals.css";
import AppHeader from "@/components/AppHeader";
import Footer from "@/components/Footer";
import Steps from "@/components/Steps";

export const metadata: Metadata = {
  title: "배리어프리 로컬루트 부산",
  description:
    "부산교통공사·부산관광공사 공공데이터 기반 교통약자·관광약자 맞춤 정기 갱신형 설명가능 AI 추천 서비스",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen flex flex-col">
        <AppHeader />
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
          <Steps />
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
